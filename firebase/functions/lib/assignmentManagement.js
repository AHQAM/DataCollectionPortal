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
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const checkAdminOrSupervisor = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const role = context.auth.token.role;
    if (role !== "admin" && role !== "supervisor") {
        throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can perform this action.");
    }
};
exports.reassignRecords = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { recordIds, newUserId } = data;
    if (!recordIds || !Array.isArray(recordIds) || !newUserId) {
        throw new functions.https.HttpsError("invalid-argument", "recordIds array and newUserId are required.");
    }
    // Check if new user exists and is a representative
    const userRef = db.collection("users").doc(newUserId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Target user not found.");
    }
    if (userDoc.data()?.role !== "representative") {
        throw new functions.https.HttpsError("invalid-argument", "Target user must be a representative.");
    }
    const batch = db.batch();
    // Load records and verify they can be reassigned
    for (const recordId of recordIds) {
        const recordRef = db.collection("assignments").doc(recordId); // assuming we assign records via 'assignments' collection
        const recordDoc = await recordRef.get();
        if (recordDoc.exists) {
            batch.update(recordRef, {
                assignedTo: newUserId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    }
    await batch.commit();
    return { success: true, count: recordIds.length };
});
//# sourceMappingURL=assignmentManagement.js.map