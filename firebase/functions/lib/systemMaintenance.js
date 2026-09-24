"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.wipeDemoData = void 0;
const db_1 = require("./config/db");
const admin = __importStar(require("firebase-admin"));
const gen2_1 = require("./config/gen2");
const auditLogger_1 = require("./auditLogger");
const roles_1 = require("./roles");
/**
 * Cloud Function: wipeDemoData
 *
 * Super-Admin only: Wipes demo/test responses and resets records/assignments.
 * Requires strict confirmation token: 'CONFIRM_WIPE_DEMO_DATA'
 */
exports.wipeDemoData = (0, gen2_1.onCallGen2)(async (data, context) => {
    if (!context.auth || context.auth.token.role !== roles_1.USER_ROLES.ADMIN) {
        throw new gen2_1.HttpsError("permission-denied", "صلاحية المسؤول مطلوبة. | Admin permission required.");
    }
    const { confirmationToken, wipeBranchesAndRegions } = data || {};
    if (confirmationToken !== "CONFIRM_WIPE_DEMO_DATA") {
        throw new gen2_1.HttpsError("invalid-argument", "رمز التأكيد غير صحيح. | Invalid confirmation token.");
    }
    try {
        // 1. Delete all responses
        const responsesSnap = await db_1.db.collection("responses").get();
        if (!responsesSnap.empty) {
            const batch1 = db_1.db.batch();
            responsesSnap.docs.forEach((doc) => batch1.delete(doc.ref));
            await batch1.commit();
        }
        // 2. Reset records to Pending
        const recordsSnap = await db_1.db.collection("records").get();
        if (!recordsSnap.empty) {
            const batch2 = db_1.db.batch();
            recordsSnap.docs.forEach((doc) => {
                batch2.update(doc.ref, {
                    recordStatus: "Pending",
                    completionPercent: 0,
                    submittedAt: null,
                    completedAt: null,
                    draftSavedAt: null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            await batch2.commit();
        }
        // 3. Reset assignments progress
        const assignmentsSnap = await db_1.db.collection("assignments").get();
        if (!assignmentsSnap.empty) {
            const batch3 = db_1.db.batch();
            assignmentsSnap.docs.forEach((doc) => {
                const total = doc.data().totalRecords || 0;
                batch3.update(doc.ref, {
                    completedRecords: 0,
                    pendingRecords: total,
                    progressPercent: 0,
                    completedAt: null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            await batch3.commit();
        }
        // 4. Optionally wipe branches and regions if explicitly asked
        if (wipeBranchesAndRegions) {
            const branchesSnap = await db_1.db.collection("branches").get();
            if (!branchesSnap.empty) {
                const bBatch = db_1.db.batch();
                branchesSnap.docs.forEach((doc) => bBatch.delete(doc.ref));
                await bBatch.commit();
            }
            const regionsSnap = await db_1.db.collection("regions").get();
            if (!regionsSnap.empty) {
                const rBatch = db_1.db.batch();
                regionsSnap.docs.forEach((doc) => rBatch.delete(doc.ref));
                await rBatch.commit();
            }
        }
        await (0, auditLogger_1.logAuditSafe)({
            userId: context.auth.uid,
            userRole: "ADMIN",
            action: "SYSTEM_WIPE_COMPLETED",
            entityType: "SYSTEM",
            entityId: "DEMO_WIPE",
            details: { wipeBranchesAndRegions: !!wipeBranchesAndRegions },
        });
        return {
            success: true,
            messageAr: "تم تفريغ البيانات التجريبية وإعادة تهيئة السجلات بنجاح.",
            messageEn: "Demo data wiped and records reset successfully.",
        };
    }
    catch (error) {
        if (error instanceof gen2_1.HttpsError)
            throw error;
        console.error("Wipe demo data error:", error);
        throw new gen2_1.HttpsError("internal", "Internal server error.");
    }
});
//# sourceMappingURL=systemMaintenance.js.map