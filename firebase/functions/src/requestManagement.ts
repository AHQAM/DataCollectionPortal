import { getFirestore } from 'firebase-admin/firestore';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { sendNotificationInternal } from "./notificationService";
import { USER_ROLES } from "./roles";

const db = getFirestore('datacollectionportal');

const checkAdminOrSupervisor = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  const role = context.auth.token.role;
  if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.SUPERVISOR) {
    throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can perform this action.");
  }
};

export const createRequest = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { titleAr, titleEn, descriptionAr, descriptionEn, dueDate, targetBranches, requestCode, requestType, priority, category, tags, allowEditAfterSubmit, allowEditAfterDueDate, requireSupervisorApproval } = data;

  if (!titleAr) {
    throw new functions.https.HttpsError("invalid-argument", "Title (Ar) is required.");
  }

  const requestId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const finalRequestCode = requestCode || 'REQ-' + Math.floor(100 + Math.random() * 900);
  
  const requestRef = db.collection("requests").doc(requestId);

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: context.auth!.uid,
  });

  return { success: true, requestId: requestId, activityId: requestId };
});

export const updateDraftRequest = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId, updates } = data;
  if (!requestId || !updates) {
    throw new functions.https.HttpsError("invalid-argument", "requestId and updates are required.");
  }

  const requestRef = db.collection("requests").doc(requestId);
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

export const publishRequest = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId } = data;
  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
  }

  const requestRef = db.collection("requests").doc(requestId);
  const requestDoc = await requestRef.get();

  if (!requestDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Request not found.");
  }

  const requestData = requestDoc.data()!;
  
  const updates: any = {
    status: "Published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedBy: context.auth!.uid,
  };

  if (!requestData.schemaSnapshot) {
    const fieldsSnapshot = await db.collection("request_fields")
      .where("requestId", "==", requestId)
      .orderBy("orderIndex", "asc")
      .get();
      
    const fieldsArray = fieldsSnapshot.docs.map(doc => doc.data());
    updates.schemaSnapshot = fieldsArray;
    updates.formSchemaVersion = (requestData.formSchemaVersion || 0) + 1;
  }

  await requestRef.update(updates);

  // Send notifications to all assigned users
  try {
    const assignmentsSnap = await db.collection("assignments")
      .where("requestId", "==", requestId)
      .where("assignmentStatus", "==", "Active")
      .get();

    const titleAr = `تم نشر الطلب: ${requestData.titleAr}`;
    const titleEn = `Request Published: ${requestData.titleEn}`;
    const bodyAr = `الطلب متاح الآن لجمع البيانات.`;
    const bodyEn = `The request is now available for data collection.`;

    const notificationPromises = assignmentsSnap.docs.map(doc => {
      const assignmentData = doc.data();
      if (assignmentData.userId) {
        return sendNotificationInternal(
          assignmentData.userId,
          titleAr,
          titleEn,
          bodyAr,
          bodyEn,
          { requestId, type: "REQUEST_PUBLISHED" }
        );
      }
      return Promise.resolve();
    });

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error(`Failed to send notifications for requestId ${requestId}`, error);
  }

  return { success: true };
});

export const closeRequest = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId } = data;
  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
  }

  await db.collection("requests").doc(requestId).update({
    status: "Closed",
    closedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
});

export const archiveRequest = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId } = data;
  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
  }

  await db.collection("requests").doc(requestId).update({
    status: "Archived",
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
});

export const reopenRequest = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId } = data;
  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "requestId is required.");
  }

  await db.collection("requests").doc(requestId).update({
    status: "Published",
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
});
