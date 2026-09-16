import { getFirestore } from 'firebase-admin/firestore';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
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

  if (userDoc.data()?.role !== USER_ROLES.REP) {
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

  // Send notification to the new assigned user
  try {
    const titleAr = "تحديث المهام: تعيين سجلات جديدة";
    const titleEn = "Assignment Update: New Records Assigned";
    const bodyAr = `تم تعيين ${recordIds.length} سجل جديد لك.`;
    const bodyEn = `You have been assigned ${recordIds.length} new records.`;

    await sendNotificationInternal(
      newUserId,
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      { count: recordIds.length.toString(), type: "RECORDS_REASSIGNED" }
    );
  } catch (error) {
    console.error(`Failed to send notification to user ${newUserId} after reassigning records.`, error);
  }

  return { success: true, count: recordIds.length };
});
