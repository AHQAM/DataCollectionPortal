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

export const reassignRecords = functions.https.onCall(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { recordIds, newUserId } = data;

  if (!recordIds || !Array.isArray(recordIds) || !newUserId) {
    throw new functions.https.HttpsError("invalid-argument", "recordIds array and newUserId are required.");
  }

  // Check if new user exists and is a representative
  const userRef = db.collection("users").doc(newUserId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Target user not found.");
  }

  if (userDoc.data()?.role !== "representative") {
    throw new functions.https.HttpsError("invalid-argument", "Target user must be a representative.");
  }

  const batch = db.batch();

  // Load records and verify they can be reassigned
  for (const recordId of recordIds) {
    const recordRef = db.collection("assignments").doc(recordId); // assuming we assign records via 'assignments' collection
    const recordDoc = await recordRef.get();

    if (recordDoc.exists) {
      batch.update(recordRef, {
        assignedTo: newUserId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();

  return { success: true, count: recordIds.length };
});
