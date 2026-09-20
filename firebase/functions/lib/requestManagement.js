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
exports.deleteRequest = exports.cloneRequest = exports.reopenRequest = exports.archiveRequest = exports.closeRequest = exports.publishRequest = exports.updateDraftRequest = exports.createRequest = void 0;
const db_1 = require("./config/db");
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const notificationService_1 = require("./notificationService");
const roles_1 = require("./roles");
const auditLogger_1 = require("./auditLogger");
const checkAdminOrSupervisor = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const role = context.auth.token.role;
    if (role !== roles_1.USER_ROLES.ADMIN && role !== roles_1.USER_ROLES.SUPERVISOR) {
        throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can perform this action.");
    }
};
exports.createRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { titleAr, titleEn, descriptionAr, descriptionEn, dueDate, targetBranches, requestCode, requestType, priority, category, tags, allowEditAfterSubmit, allowEditAfterDueDate, requireSupervisorApproval } = data;
    if (!titleAr) {
        throw new functions.https.HttpsError("invalid-argument", "Title (Ar) is required.");
    }
    const requestId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalRequestCode = requestCode || 'REQ-' + Math.floor(100 + Math.random() * 900);
    const requestRef = db_1.db.collection("requests").doc(requestId);
    await requestRef.set({
        requestId: requestId,
        activityId: requestId,
        requestCode: finalRequestCode,
        titleAr,
        titleEn: titleEn || titleAr,
        descriptionAr: descriptionAr || "",
        descriptionEn: descriptionEn || "",
        requestType: requestType || 'per_record',
        status: "Draft",
        priority: priority || 'Normal',
        category: category || 'General Field Survey',
        tags: tags || ['ميداني'],
        startAt: new Date().toISOString(),
        dueAt: dueDate ? admin.firestore.Timestamp.fromDate(new Date(dueDate)).toDate().toISOString() : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        allowEditAfterSubmit: allowEditAfterSubmit ?? true,
        allowEditAfterDueDate: allowEditAfterDueDate ?? false,
        requireSupervisorApproval: requireSupervisorApproval ?? false,
        completionRule: 'all_required_fields',
        formSchemaVersion: 1,
        totalRecords: 0,
        totalAssignments: 0,
        targetBranches: targetBranches || [],
        targetRegions: data.targetRegions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: context.auth.uid,
    });
    return { success: true, requestId: requestId, activityId: requestId };
});
exports.updateDraftRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId, updates } = data;
    if (!requestId || !updates) {
        throw new functions.https.HttpsError("invalid-argument", "requestId and updates are required.");
    }
    const requestRef = db_1.db.collection("requests").doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Request not found.");
    }
    if (requestDoc.data()?.status !== "Draft" && requestDoc.data()?.status !== "draft") {
        throw new functions.https.HttpsError("failed-precondition", "Can only update draft requests.");
    }
    await requestRef.update({
        ...updates,
        updatedAt: new Date().toISOString()
    });
    return { success: true };
});
exports.publishRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId } = data;
    if (!requestId) {
        throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
    }
    const requestRef = db_1.db.collection("requests").doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Request not found.");
    }
    const requestData = requestDoc.data();
    const updates = {
        status: "Published",
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedBy: context.auth.uid,
    };
    if (!requestData.schemaSnapshot) {
        const fieldsSnapshot = await db_1.db.collection("request_fields")
            .where("requestId", "==", requestId)
            .get();
        const fieldsArray = fieldsSnapshot.docs
            .map(doc => doc.data())
            .sort((left, right) => (left.orderIndex ?? 0) - (right.orderIndex ?? 0));
        updates.schemaSnapshot = fieldsArray;
        updates.formSchemaVersion = (requestData.formSchemaVersion || 0) + 1;
    }
    await requestRef.update(updates);
    // Send notifications to all assigned users or matching target users
    try {
        const userIdsToNotify = new Set();
        const assignmentsSnap = await db_1.db.collection("assignments")
            .where("requestId", "==", requestId)
            .where("assignmentStatus", "==", "Active")
            .get();
        assignmentsSnap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.userId)
                userIdsToNotify.add(data.userId);
        });
        // If no direct assignments, notify active reps in target branches / regions
        if (userIdsToNotify.size === 0) {
            const targetBranches = requestData.targetBranches || [];
            const targetRegions = requestData.targetRegions || [];
            let usersQuery = db_1.db.collection("users").where("isActive", "==", true).where("role", "==", "REP");
            if (targetBranches.length > 0 && targetBranches.length <= 30) {
                usersQuery = usersQuery.where("branchId", "in", targetBranches);
            }
            const usersSnap = await usersQuery.get();
            usersSnap.docs.forEach((uDoc) => {
                const uData = uDoc.data();
                if (targetRegions.length > 0) {
                    if (uData.regionNo && targetRegions.includes(uData.regionNo)) {
                        userIdsToNotify.add(uDoc.id);
                    }
                }
                else {
                    userIdsToNotify.add(uDoc.id);
                }
            });
        }
        const titleAr = `تم نشر الطلب: ${requestData.titleAr}`;
        const titleEn = `Request Published: ${requestData.titleEn}`;
        const bodyAr = `الطلب متاح الآن لجمع البيانات.`;
        const bodyEn = `The request is now available for data collection.`;
        const notificationPromises = Array.from(userIdsToNotify).map((uid) => (0, notificationService_1.sendNotificationInternal)(uid, titleAr, titleEn, bodyAr, bodyEn, { requestId, type: "REQUEST_PUBLISHED" }));
        await Promise.allSettled(notificationPromises);
    }
    catch (error) {
        console.error(`Failed to send notifications for requestId ${requestId}`, error);
    }
    return { success: true };
});
exports.closeRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId } = data;
    if (!requestId) {
        throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
    }
    await db_1.db.collection("requests").doc(requestId).update({
        status: "Closed",
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    return { success: true };
});
exports.archiveRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId } = data;
    if (!requestId) {
        throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
    }
    await db_1.db.collection("requests").doc(requestId).update({
        status: "Archived",
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    return { success: true };
});
exports.reopenRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId } = data;
    if (!requestId) {
        throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
    }
    await db_1.db.collection("requests").doc(requestId).update({
        status: "Published",
        updatedAt: new Date().toISOString(),
    });
    return { success: true };
});
exports.cloneRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId } = data;
    if (!requestId) {
        throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
    }
    const srcRef = db_1.db.collection("requests").doc(requestId);
    const srcDoc = await srcRef.get();
    if (!srcDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Source request not found.");
    }
    const srcData = srcDoc.data();
    const newRequestId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalRequestCode = (srcData.requestCode || 'REQ') + '-COPY';
    const newRequestRef = db_1.db.collection("requests").doc(newRequestId);
    const newRequestData = {
        ...srcData,
        requestId: newRequestId,
        activityId: newRequestId,
        requestCode: finalRequestCode,
        titleAr: `${srcData.titleAr || ''} (نسخة)`.trim(),
        titleEn: `${srcData.titleEn || ''} (Copy)`.trim(),
        status: "Draft",
        totalRecords: 0,
        totalAssignments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: context.auth.uid,
        publishedAt: null,
        closedAt: null,
        archivedAt: null,
    };
    const batch = db_1.db.batch();
    batch.set(newRequestRef, newRequestData);
    // Copy request fields
    const fieldsSnapshot = await db_1.db.collection("request_fields")
        .where("requestId", "==", requestId)
        .get();
    fieldsSnapshot.docs.forEach((doc) => {
        const fData = doc.data();
        const newFieldRef = db_1.db.collection("request_fields").doc();
        batch.set(newFieldRef, {
            ...fData,
            fieldId: newFieldRef.id,
            requestId: newRequestId,
            activityId: newRequestId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    await batch.commit();
    return {
        success: true,
        requestId: newRequestId,
        activityId: newRequestId,
        messageAr: "تم نسخ الطلب بنجاح كمسودة جديدة.",
        messageEn: "Request cloned successfully as a new draft.",
    };
});
exports.deleteRequest = functions.https.onCall(async (data, context) => {
    checkAdminOrSupervisor(context);
    const { requestId } = data || {};
    if (!requestId || typeof requestId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
    }
    const requestRef = db_1.db.collection("requests").doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Request not found.");
    }
    // Batch delete fields, assignments, records, and the request itself
    const batch = db_1.db.batch();
    // 1. Delete request fields
    const fieldsSnap = await db_1.db.collection("request_fields").where("requestId", "==", requestId).get();
    fieldsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    // 2. Delete assignments
    const asgSnap = await db_1.db.collection("assignments").where("requestId", "==", requestId).get();
    asgSnap.docs.forEach((doc) => batch.delete(doc.ref));
    // 3. Delete records
    const recSnap = await db_1.db.collection("records").where("requestId", "==", requestId).get();
    recSnap.docs.forEach((doc) => batch.delete(doc.ref));
    // 4. Delete the request document
    batch.delete(requestRef);
    await batch.commit();
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: context.auth.token.role || "ADMIN",
        action: "REQUEST_DELETED",
        entityType: "REQUEST",
        entityId: requestId,
    });
    return { success: true };
});
//# sourceMappingURL=requestManagement.js.map