import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * Cloud Function for Admins to release a bound device from a user account.
 */
export const releaseDevice = functions.https.onCall(async (data, context) => {
  // 1. Verify caller is an Admin
  if (!context.auth || context.auth.token.role !== "ADMIN") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only administrators can release devices."
    );
  }

  const { targetUserId, reason } = data;

  if (!targetUserId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing targetUserId."
    );
  }

  const db = admin.firestore();

  try {
    const userRef = db.collection("users").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found.");
    }

    const userData = userDoc.data();

    if (userData?.deviceBindingStatus !== "BOUND") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "User account does not have an active bound device."
      );
    }

    const oldDeviceId = userData.boundDeviceId;

    // 2. Release device on user record
    await userRef.update({
      deviceBindingStatus: "UNBOUND",
      boundDeviceId: admin.firestore.FieldValue.delete(),
      boundDevicePlatform: admin.firestore.FieldValue.delete(),
    });

    // 3. Update deviceBindings log
    const bindingsRef = db.collection("deviceBindings");
    const snapshot = await bindingsRef
      .where("userId", "==", targetUserId)
      .where("status", "==", "ACTIVE")
      .get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "RELEASED",
          releasedAt: admin.firestore.FieldValue.serverTimestamp(),
          releasedBy: context.auth!.uid,
          releaseReason: reason || "Admin requested release",
        });
      });
      await batch.commit();
    }

    // 4. Force logout (revoke refresh tokens)
    await admin.auth().revokeRefreshTokens(targetUserId);

    // 5. Audit Log
    await db.collection("auditLogs").add({
      userId: context.auth.uid,
      userRole: "ADMIN",
      action: "RELEASE_DEVICE",
      entityType: "USER",
      entityId: targetUserId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        releasedDeviceId: oldDeviceId,
        reason: reason || "Admin requested release",
      }
    });

    return { success: true, message: "Device released successfully." };
  } catch (error: any) {
    console.error("Release Device Error:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Internal server error.");
  }
});
