import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

export const saveRequestFields = functions.https.onCall(async (data, context) => {
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
