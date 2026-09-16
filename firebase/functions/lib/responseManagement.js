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
exports.submitResponse = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const roles_1 = require("./roles");
exports.submitResponse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    if (context.auth.token.role !== roles_1.USER_ROLES.REP) {
        throw new functions.https.HttpsError("permission-denied", "Only representatives can submit responses.");
    }
    const { requestId, recordId, activityId, formData, submittedAt } = data;
    if (typeof requestId !== "string" ||
        typeof recordId !== "string" ||
        typeof activityId !== "string" ||
        !formData ||
        typeof formData !== "object" ||
        Array.isArray(formData)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid response payload.");
    }
    const db = (0, firestore_1.getFirestore)("datacollectionportal");
    const record = await db.collection("records").doc(recordId).get();
    if (!record.exists || record.data()?.assignedUserId !== context.auth.uid) {
        throw new functions.https.HttpsError("not-found", "No assigned record was found.");
    }
    if (record.data()?.requestId !== requestId) {
        throw new functions.https.HttpsError("invalid-argument", "Record does not belong to request.");
    }
    const responseRef = db.collection("responses").doc(recordId);
    const now = admin.firestore.FieldValue.serverTimestamp();
    await db.runTransaction(async (transaction) => {
        transaction.set(responseRef, {
            responseId: responseRef.id,
            requestId,
            activityId,
            recordId: record.id,
            submittedBy: context.auth.uid,
            data: formData,
            submittedAt: submittedAt || now,
            updatedAt: now,
        }, { merge: true });
        transaction.update(record.ref, {
            recordStatus: "Submitted",
            submittedAt: submittedAt || now,
            updatedAt: now,
            lastSavedBy: context.auth.uid,
        });
    });
    return { success: true, responseId: responseRef.id };
});
//# sourceMappingURL=responseManagement.js.map