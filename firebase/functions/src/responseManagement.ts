import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { USER_ROLES } from "./roles";

export const submitResponse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  if (context.auth.token.role !== USER_ROLES.REP) {
    throw new functions.https.HttpsError("permission-denied", "Only representatives can submit responses.");
  }

  const { requestId, recordId, activityId, formData, submittedAt } = data;
  if (
    typeof requestId !== "string" ||
    typeof recordId !== "string" ||
    typeof activityId !== "string" ||
    !formData ||
    typeof formData !== "object" ||
    Array.isArray(formData)
  ) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid response payload.");
  }

  const db = getFirestore("datacollectionportal");
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
    transaction.set(
      responseRef,
      {
        responseId: responseRef.id,
        requestId,
        activityId,
        recordId: record.id,
        submittedBy: context.auth!.uid,
        data: formData,
        submittedAt: submittedAt || now,
        updatedAt: now,
      },
      { merge: true }
    );
    transaction.update(record.ref, {
      recordStatus: "Submitted",
      submittedAt: submittedAt || now,
      updatedAt: now,
      lastSavedBy: context.auth!.uid,
    });
  });

  return { success: true, responseId: responseRef.id };
});
