import { db } from "./config/db";
import * as admin from "firebase-admin";
import { onCallGen2, HttpsError, CallableContextCompat } from "./config/gen2";
import { sendNotificationInternal } from "./notificationService";
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

export const reassignRecords = onCallGen2(async (data, context) => {
  checkAdminOrSupervisor(context);

  const { recordIds, newUserId } = data || {};

  if (!recordIds || !Array.isArray(recordIds) || !newUserId) {
    throw new HttpsError(
      "invalid-argument",
      "recordIds array and newUserId are required.",
    );
  }

  // Check if new user exists and is a representative
  const userRef = db.collection("users").doc(newUserId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new HttpsError("not-found", "Target user not found.");
  }

  if (userDoc.data()?.role !== USER_ROLES.REP) {
    throw new HttpsError(
      "invalid-argument",
      "Target user must be a representative.",
    );
  }

  const batch = db.batch();

  // Load records and verify they can be reassigned
  for (const recordId of recordIds) {
    const recordRef = db.collection("records").doc(recordId);
    const recordDoc = await recordRef.get();

    if (recordDoc.exists) {
      batch.update(recordRef, {
        assignedUserId: newUserId,
        assignedRegionNo:
          userDoc.data()?.regionNo || userDoc.data()?.username || "",
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
      { count: recordIds.length.toString(), type: "RECORDS_REASSIGNED" },
    );
  } catch (error) {
    console.error(
      `Failed to send notification to user ${newUserId} after reassigning records.`,
      error,
    );
  }

  return { success: true, count: recordIds.length };
});
