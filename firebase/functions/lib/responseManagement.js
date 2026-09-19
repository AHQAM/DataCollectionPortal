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
exports.saveDraftResponse = exports.submitResponse = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const roles_1 = require("./roles");
const auditLogger_1 = require("./auditLogger");
exports.submitResponse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const { requestId, recordId, activityId, formData, submittedAt } = data || {};
    if (typeof requestId !== "string" ||
        typeof recordId !== "string" ||
        !formData ||
        typeof formData !== "object" ||
        Array.isArray(formData)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid response payload.");
    }
    const db = (0, firestore_1.getFirestore)("datacollectionportal");
    const recordRef = db.collection("records").doc(recordId);
    const record = await recordRef.get();
    if (!record.exists) {
        throw new functions.https.HttpsError("not-found", "No record was found.");
    }
    const recData = record.data();
    const userRole = context.auth.token.role;
    // Allow Rep assigned to record, or Supervisor/Admin
    if (userRole !== roles_1.USER_ROLES.ADMIN && userRole !== roles_1.USER_ROLES.SUPERVISOR) {
        if (recData.assignedUserId && recData.assignedUserId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "Record is not assigned to this user.");
        }
    }
    const responseRef = db.collection("responses").doc(recordId);
    const now = admin.firestore.FieldValue.serverTimestamp();
    await db.runTransaction(async (transaction) => {
        // 1. Save response data
        transaction.set(responseRef, {
            responseId: responseRef.id,
            requestId,
            activityId: activityId || recData.activityId || requestId,
            recordId: record.id,
            submittedBy: context.auth.uid,
            data: formData,
            submittedAt: submittedAt || now,
            updatedAt: now,
        }, { merge: true });
        // 2. Update record status and completion percent
        transaction.update(recordRef, {
            recordStatus: "Submitted",
            completionPercent: 100,
            submittedAt: submittedAt || now,
            completedAt: submittedAt || now,
            lastSavedAt: now,
            lastSavedBy: context.auth.uid,
            updatedAt: now,
        });
        // 3. Atomically update assignment progress if assigned
        const assignmentId = recData.assignmentId;
        if (assignmentId && assignmentId !== 'UNASSIGNED') {
            const asgRef = db.collection("assignments").doc(assignmentId);
            const asgDoc = await transaction.get(asgRef);
            if (asgDoc.exists) {
                const asgData = asgDoc.data();
                const total = asgData.totalRecords || 1;
                // Only increment if record wasn't already Submitted/Completed
                if (recData.recordStatus !== 'Submitted' && recData.recordStatus !== 'Completed') {
                    const newCompleted = (asgData.completedRecords || 0) + 1;
                    const newPending = Math.max(0, total - newCompleted);
                    const progressPercent = Math.min(100, Math.round((newCompleted / total) * 100));
                    transaction.update(asgRef, {
                        completedRecords: newCompleted,
                        pendingRecords: newPending,
                        progressPercent,
                        completedAt: newCompleted >= total ? now : null,
                        lastActivityAt: now,
                        updatedAt: now,
                    });
                }
            }
        }
    });
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: userRole || "REP",
        action: "RECORD_SUBMITTED",
        entityType: "RECORD",
        entityId: recordId,
        details: { customerNo: recData.customerNo },
    });
    return { success: true, responseId: responseRef.id };
});
exports.saveDraftResponse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const { requestId, recordId, activityId, formData } = data || {};
    if (!recordId || !formData || typeof formData !== "object") {
        throw new functions.https.HttpsError("invalid-argument", "Invalid draft payload.");
    }
    const db = (0, firestore_1.getFirestore)("datacollectionportal");
    const recordRef = db.collection("records").doc(recordId);
    const record = await recordRef.get();
    if (!record.exists) {
        throw new functions.https.HttpsError("not-found", "Record not found.");
    }
    const responseRef = db.collection("responses").doc(recordId);
    const now = admin.firestore.FieldValue.serverTimestamp();
    await db.runTransaction(async (transaction) => {
        transaction.set(responseRef, {
            responseId: responseRef.id,
            requestId: requestId || record.data()?.requestId || '',
            activityId: activityId || record.data()?.activityId || '',
            recordId,
            savedBy: context.auth.uid,
            data: formData,
            updatedAt: now,
        }, { merge: true });
        transaction.update(recordRef, {
            recordStatus: "DraftSaved",
            completionPercent: 50,
            draftSavedAt: now,
            lastSavedAt: now,
            lastSavedBy: context.auth.uid,
            updatedAt: now,
        });
    });
    return { success: true };
});
//# sourceMappingURL=responseManagement.js.map