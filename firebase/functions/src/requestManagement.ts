import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();

const checkAdminOrSupervisor = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  const role = context.auth.token.role;
  if (role !== "admin" && role !== "supervisor") {
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

  await requestRef.update({
    status: "Published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedBy: context.auth!.uid,
  });

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
