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
exports.reassignRecords = void 0;
const db_1 = require("./config/db");
const admin = __importStar(require("firebase-admin"));
const gen2_1 = require("./config/gen2");
const notificationService_1 = require("./notificationService");
const roles_1 = require("./roles");
const checkAdminOrSupervisor = (context) => {
    if (!context.auth) {
        throw new gen2_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const role = context.auth.token.role;
    if (role !== roles_1.USER_ROLES.ADMIN && role !== roles_1.USER_ROLES.SUPERVISOR) {
        throw new gen2_1.HttpsError("permission-denied", "Only admins or supervisors can perform this action.");
    }
};
exports.reassignRecords = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { recordIds, newUserId } = data || {};
    if (!recordIds || !Array.isArray(recordIds) || !newUserId) {
        throw new gen2_1.HttpsError("invalid-argument", "recordIds array and newUserId are required.");
    }
    // Check if new user exists and is a representative
    const userRef = db_1.db.collection("users").doc(newUserId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new gen2_1.HttpsError("not-found", "Target user not found.");
    }
    if (userDoc.data()?.role !== roles_1.USER_ROLES.REP) {
        throw new gen2_1.HttpsError("invalid-argument", "Target user must be a representative.");
    }
    const batch = db_1.db.batch();
    // Load records and verify they can be reassigned
    for (const recordId of recordIds) {
        const recordRef = db_1.db.collection("records").doc(recordId);
        const recordDoc = await recordRef.get();
        if (recordDoc.exists) {
            batch.update(recordRef, {
                assignedUserId: newUserId,
                assignedRegionNo: userDoc.data()?.regionNo || userDoc.data()?.username || "",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    }
    await batch.commit();
    // Send notification to the new assigned user
    try {
        const titleAr = "تحديث المهام: تعيين سجلات جديدة";
        const titleEn = "Assignment Update: New Records Assigned";
        const bodyAr = `تم تعيين ${recordIds.length} سجل جديد لك.`;
        const bodyEn = `You have been assigned ${recordIds.length} new records.`;
        await (0, notificationService_1.sendNotificationInternal)(newUserId, titleAr, titleEn, bodyAr, bodyEn, { count: recordIds.length.toString(), type: "RECORDS_REASSIGNED" });
    }
    catch (error) {
        console.error(`Failed to send notification to user ${newUserId} after reassigning records.`, error);
    }
    return { success: true, count: recordIds.length };
});
//# sourceMappingURL=assignmentManagement.js.map