import * as admin from "firebase-admin";
import { onCallGen2, HttpsError } from "./config/gen2";
import { db } from "./config/db";
import { USER_ROLES } from "./roles";
import { logAuditSafe } from "./auditLogger";

export const submitResponse = onCallGen2(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Authentication required.",
    );
  }

  const { requestId, recordId, activityId, formData, submittedAt } = data || {};
  if (
    typeof requestId !== "string" ||
    typeof recordId !== "string" ||
    !formData ||
    typeof formData !== "object" ||
    Array.isArray(formData)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid response payload.",
    );
  }

  const recordRef = db.collection("records").doc(recordId);
  const record = await recordRef.get();

  let recData: FirebaseFirestore.DocumentData;
  const isNewRecord = !record.exists;

  if (isNewRecord) {
    const requestDoc = await db.collection("requests").doc(requestId).get();
    if (!requestDoc.exists) {
      throw new HttpsError("not-found", "Request not found.");
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
      targetId: formData.targetId || formData.storeNo || recordId,
      targetName:
        formData.targetName ||
        formData.storeName ||
        formData.clientName ||
        "عميل ميداني",
      branchId:
        userData?.branchId ||
        context.auth.token.branchId ||
        reqData.targetBranches?.[0] ||
        "",
      branchName: userData?.branchNameAr || "",
      regionNo: userData?.regionNo || context.auth.token.regionNo || "",
      userNo: userData?.userNo || userData?.username || "",
      userName:
        userData?.userNameAr ||
        userData?.userNameEn ||
        context.auth.token.name ||
        "",
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
      if (
        recData.assignedUserId &&
        recData.assignedUserId !== context.auth.uid
      ) {
        throw new HttpsError(
          "permission-denied",
          "Record is not assigned to this user.",
        );
      }
    }
  }

  const responseRef = db.collection("responses").doc(recordId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    // --- STEP 1: ALL READS MUST OCCUR BEFORE ANY WRITES ---
    const recordDoc = await transaction.get(recordRef);
    const isDocNew = !recordDoc.exists;
    const currentRecData = isDocNew ? recData : recordDoc.data()!;

    let asgDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    let asgRef: FirebaseFirestore.DocumentReference | null = null;
    const assignmentId = currentRecData.assignmentId;
    if (assignmentId && assignmentId !== "UNASSIGNED") {
      asgRef = db.collection("assignments").doc(assignmentId);
      asgDoc = await transaction.get(asgRef);
    }

    // --- STEP 2: ALL WRITES AFTER ALL READS ---
    // 1. Save response data
    transaction.set(
      responseRef,
      {
        responseId: responseRef.id,
        requestId,
        activityId: activityId || currentRecData.activityId || requestId,
        recordId,
        submittedBy: context.auth!.uid,
        data: formData,
        submittedAt: submittedAt || now,
        updatedAt: now,
      },
      { merge: true },
    );

    // 2. Update or create record
    if (isDocNew) {
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
    if (asgRef && asgDoc && asgDoc.exists) {
      const asgData = asgDoc.data()!;
      const total = asgData.totalRecords || 1;
      // Concurrency protection: Only increment if record wasn't already Submitted/Completed
      if (
        currentRecData.recordStatus !== "Submitted" &&
        currentRecData.recordStatus !== "Completed"
      ) {
        const newCompleted = (asgData.completedRecords || 0) + 1;
        const newPending = Math.max(0, total - newCompleted);
        const progressPercent = Math.min(
          100,
          Math.round((newCompleted / total) * 100),
        );
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

export const saveDraftResponse = onCallGen2(
  async (data, context) => {
    if (!context.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Authentication required.",
      );
    }

    const { requestId, recordId, activityId, formData } = data || {};
    if (!recordId || !formData || typeof formData !== "object") {
      throw new HttpsError(
        "invalid-argument",
        "Invalid draft payload.",
      );
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
        assignedRegionNo:
          userData?.regionNo || context.auth.token.regionNo || "",
        targetId: formData.targetId || formData.storeNo || recordId,
        targetName:
          formData.targetName ||
          formData.storeName ||
          formData.clientName ||
          "مسودة عميل",
        branchId: userData?.branchId || context.auth.token.branchId || "",
        branchName: userData?.branchNameAr || "",
        regionNo: userData?.regionNo || context.auth.token.regionNo || "",
        userNo: userData?.userNo || userData?.username || "",
        userName:
          userData?.userNameAr ||
          userData?.userNameEn ||
          context.auth.token.name ||
          "",
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
      // 1. ALL READS FIRST
      const recordDoc = await transaction.get(recordRef);
      const isExisting = recordDoc.exists;

      // 2. ALL WRITES AFTER READS
      transaction.set(
        responseRef,
        {
          responseId: responseRef.id,
          requestId: requestId || recordDoc.data()?.requestId || "",
          activityId: activityId || recordDoc.data()?.activityId || "",
          recordId,
          savedBy: context.auth!.uid,
          data: formData,
          updatedAt: now,
        },
        { merge: true },
      );

      if (!isExisting && recData) {
        transaction.set(recordRef, {
          ...recData,
          draftSavedAt: now,
          lastSavedAt: now,
          lastSavedBy: context.auth!.uid,
          updatedAt: now,
        });
      } else if (isExisting) {
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
  },
);
