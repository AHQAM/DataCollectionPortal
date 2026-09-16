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
exports.saveRequestFields = void 0;
const firestore_1 = require("firebase-admin/firestore");
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const roles_1 = require("./roles");
const db = (0, firestore_1.getFirestore)('datacollectionportal');
const checkAdminOrSupervisor = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const role = context.auth.token.role;
    if (role !== roles_1.USER_ROLES.ADMIN && role !== roles_1.USER_ROLES.SUPERVISOR) {
        throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can perform this action.");
    }
};
exports.saveRequestFields = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId, fields } = data;
    if (!requestId || !fields || !Array.isArray(fields)) {
        throw new functions.https.HttpsError("invalid-argument", "requestId and a fields array are required.");
    }
    // Validate the request exists and is in draft state
    const requestRef = db.collection("requests").doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Request not found.");
    }
    if (requestDoc.data()?.status !== "draft" && requestDoc.data()?.status !== "Draft") {
        throw new functions.https.HttpsError("failed-precondition", "Can only edit fields for draft requests.");
    }
    const batch = db.batch();
    // Delete existing fields first to avoid orphans
    const existingFields = await db.collection("request_fields").where("requestId", "==", requestId).get();
    existingFields.forEach(doc => {
        batch.delete(doc.ref);
    });
    // Add new fields
    fields.forEach((field, index) => {
        const fieldRef = db.collection("request_fields").doc();
        batch.set(fieldRef, {
            ...field,
            requestId,
            orderIndex: index,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    await batch.commit();
    return { success: true };
});
//# sourceMappingURL=formManagement.js.map