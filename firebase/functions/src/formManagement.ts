import { db } from "./config/db";
import * as admin from "firebase-admin";
import { onCallGen2, HttpsError, CallableContextCompat } from "./config/gen2";
import { USER_ROLES } from "./roles";

const checkAdminOrSupervisor = (context: CallableContextCompat) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  const role = context.auth.token.role;
  if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.SUPERVISOR) {
    throw new HttpsError(
      "permission-denied",
      "Only admins or supervisors can perform this action.",
    );
  }
};

export const saveRequestFields = onCallGen2(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { requestId, fields } = data || {};

  if (!requestId || !fields || !Array.isArray(fields)) {
    throw new HttpsError(
      "invalid-argument",
      "requestId and a fields array are required.",
    );
  }

  // Validate the request exists and is in draft state
  const requestRef = db.collection("requests").doc(requestId);
  const requestDoc = await requestRef.get();

  if (!requestDoc.exists) {
    throw new HttpsError("not-found", "Request not found.");
  }

  if (
    requestDoc.data()?.status !== "draft" &&
    requestDoc.data()?.status !== "Draft"
  ) {
    throw new HttpsError(
      "failed-precondition",
      "Can only edit fields for draft requests.",
    );
  }

  const batch = db.batch();

  // Delete existing fields first to avoid orphans
  const existingFields = await db
    .collection("request_fields")
    .where("requestId", "==", requestId)
    .get();
  existingFields.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new fields
  fields.forEach((field, index) => {
    const fieldRef = db.collection("request_fields").doc();
    batch.set(fieldRef, {
      ...field,
      requestId,
      activityId: requestId,
      orderIndex: index,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();

  return { success: true };
});
