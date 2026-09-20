import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { db } from "./config/db";
import { USER_ROLES } from "./roles";
import { logAuditSafe } from "./auditLogger";

export const submitResponse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const { requestId, recordId, activityId, formData, submittedAt } = data || {};
  if (
    typeof requestId !== "string" ||
    typeof recordId !== "string" ||
    !formData ||
    typeof formData !== "object" ||
    Array.isArray(formData)
  ) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid response payload.");
  }

  const recordRef = db.collection("records").doc(recordId);
  const record = await recordRef.get();

  let recData: FirebaseFirestore.DocumentData;
  const isNewRecord = !record.exists;

  if (isNewRecord) {
    const requestDoc = await db.collection("requests").doc(requestId).get();
    if (!requestDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Request not found.");
    }
    const reqData = requestDoc.data()!;
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    recData = {
      recordId,
      requestId,
      assignmentId: "UNASSIGNED",
      assignedUserId: context.auth.uid,
      assignedRegionNo: userData?.regionNo || context.auth.token.regionNo || "",
      customerNo: formData.customerNo || formData.storeNo || recordId,
      customerName: formData.customerName || formData.storeName || formData.clientName || "عميل ميداني",
      branchId: userData?.branchId || context.auth.token.branchId || reqData.targetBranches?.[0] || "",
      branchName: userData?.branchNameAr || "",
      regionNo: userData?.regionNo || context.auth.token.regionNo || "",
      repNo: userData?.repNo || userData?.username || "",
      repName: userData?.repNameAr || userData?.repNameEn || context.auth.token.name || "",
      rawData: formData,
      recordStatus: "Submitted",
      completionPercent: 100,
      startedAt: submittedAt || new Date().toISOString(),
      submittedAt: submittedAt || new Date().toISOString(),
      completedAt: submittedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    recData = record.data()!;
    const userRole = context.auth.token.role;

    // Allow Rep assigned to record, or Supervisor/Admin
    if (userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.SUPERVISOR) {
      if (recData.assignedUserId && recData.assignedUserId !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "Record is not assigned to this user.");
      }
    }
  }

  const responseRef = db.collection("responses").doc(recordId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    // 1. Save response data
    transaction.set(
      responseRef,
      {
        responseId: responseRef.id,
        requestId,
        activityId: activityId || recData.activityId || requestId,
        recordId,
        submittedBy: context.auth!.uid,
        data: formData,
        submittedAt: submittedAt || now,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Update or create record
    if (isNewRecord) {
      transaction.set(recordRef, {
        ...recData,
        lastSavedAt: now,
        lastSavedBy: context.auth!.uid,
        updatedAt: now,
      });
    } else {
      transaction.update(recordRef, {
        recordStatus: "Submitted",
        completionPercent: 100,
        submittedAt: submittedAt || now,
        completedAt: submittedAt || now,
        lastSavedAt: now,
        lastSavedBy: context.auth!.uid,
        updatedAt: now,
      });
    }

    // 3. Atomically update assignment progress if assigned
    const assignmentId = recData.assignmentId;
    if (assignmentId && assignmentId !== 'UNASSIGNED') {
      const asgRef = db.collection("assignments").doc(assignmentId);
      const asgDoc = await transaction.get(asgRef);
      if (asgDoc.exists) {
        const asgData = asgDoc.data()!;
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

  await logAuditSafe({
    userId: context.auth.uid,
    userRole: context.auth.token.role || "REP",
    action: "RECORD_SUBMITTED",
    entityType: "RECORD",
    entityId: recordId,
    details: { requestId, activityId, isNewRecord },
  });

  return { success: true, responseId: responseRef.id };
});

export const saveDraftResponse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const { requestId, recordId, activityId, formData } = data || {};
  if (!recordId || !formData || typeof formData !== "object") {
    throw new functions.https.HttpsError("invalid-argument", "Invalid draft payload.");
  }

  const recordRef = db.collection("records").doc(recordId);
  const record = await recordRef.get();

  let isNewRecord = !record.exists;
  let recData: FirebaseFirestore.DocumentData | null = null;

  if (isNewRecord && requestId) {
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    recData = {
      recordId,
      requestId,
      assignmentId: "UNASSIGNED",
      assignedUserId: context.auth.uid,
      assignedRegionNo: userData?.regionNo || context.auth.token.regionNo || "",
      customerNo: formData.customerNo || formData.storeNo || recordId,
      customerName: formData.customerName || formData.storeName || formData.clientName || "مسودة عميل",
      branchId: userData?.branchId || context.auth.token.branchId || "",
      branchName: userData?.branchNameAr || "",
      regionNo: userData?.regionNo || context.auth.token.regionNo || "",
      repNo: userData?.repNo || userData?.username || "",
      repName: userData?.repNameAr || userData?.repNameEn || context.auth.token.name || "",
      rawData: formData,
      recordStatus: "DraftSaved",
      completionPercent: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const responseRef = db.collection("responses").doc(recordId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    transaction.set(
      responseRef,
      {
        responseId: responseRef.id,
        requestId: requestId || record.data()?.requestId || '',
        activityId: activityId || record.data()?.activityId || '',
        recordId,
        savedBy: context.auth!.uid,
        data: formData,
        updatedAt: now,
      },
      { merge: true }
    );

    if (isNewRecord && recData) {
      transaction.set(recordRef, {
        ...recData,
        draftSavedAt: now,
        lastSavedAt: now,
        lastSavedBy: context.auth!.uid,
        updatedAt: now,
      });
    } else if (record.exists) {
      transaction.update(recordRef, {
        recordStatus: "DraftSaved",
        completionPercent: 50,
        draftSavedAt: now,
        lastSavedAt: now,
        lastSavedBy: context.auth!.uid,
        updatedAt: now,
      });
    }
  });

  return { success: true };
});
