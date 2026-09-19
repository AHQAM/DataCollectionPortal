import { getFirestore } from 'firebase-admin/firestore';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAuditSafe } from "./auditLogger";
import { USER_ROLES } from "./roles";

/**
 * Cloud Function: releaseDevice
 *
 * Admin-only: Releases a bound device from a user account.
 * Revokes Firebase refresh tokens and disables old FCM token.
 * Next successful login will bind the new device.
 */
export const releaseDevice = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Only administrators can release devices."
      );
    }

    const { targetUserId, reason } = data;

    if (!targetUserId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "معرف المستخدم مطلوب. | Missing targetUserId."
      );
    }

    const db = getFirestore('datacollectionportal');

    try {
      const userRef = db.collection("users").doc(targetUserId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "المستخدم غير موجود. | User not found."
        );
      }

      const userData = userDoc.data()!;

      if (userData.deviceBindingStatus !== "BOUND") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "الحساب غير مرتبط بجهاز حالياً. | User account does not have an active bound device."
        );
      }

      // Release device on user record
      await userRef.update({
        deviceBindingStatus: "UNBOUND",
        boundDeviceIdHash: null,
        boundDevicePlatform: null,
        boundDeviceLabel: null,
        fcmToken: null,
        fcmTokenUpdatedAt: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update deviceBindings log
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
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // Revoke Firebase refresh tokens — forces re-login
      try {
        await admin.auth().revokeRefreshTokens(targetUserId);
      } catch (e) {
        console.warn("Could not revoke tokens:", e);
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "DEVICE_RELEASED",
        entityType: "DEVICE_BINDING",
        entityId: targetUserId,
        details: {
          reason: reason || "Admin requested release",
          targetUserRegionNo: userData.regionNo,
        },
      });

      return {
        success: true,
        messageAr: "تم فك ارتباط الجهاز بنجاح. سيتم ربط الجهاز الجديد عند تسجيل الدخول التالي.",
        messageEn: "Device released successfully. A new device will be bound on next login.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Release device error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Cloud Function: replaceDevice
 *
 * Admin-only: Marks current device for replacement.
 * The next login from any device will be accepted and bound.
 */
export const replaceDevice = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const { targetUserId, reason } = data;

    if (!targetUserId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "معرف المستخدم مطلوب. | User ID is required."
      );
    }

    const db = getFirestore('datacollectionportal');

    try {
      const userRef = db.collection("users").doc(targetUserId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "المستخدم غير موجود. | User not found."
        );
      }

      // Set status to UNBOUND — next login binds new device
      await userRef.update({
        deviceBindingStatus: "UNBOUND",
        boundDeviceIdHash: null,
        boundDevicePlatform: null,
        boundDeviceLabel: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark existing bindings as replaced
      const snapshot = await db
        .collection("deviceBindings")
        .where("userId", "==", targetUserId)
        .where("status", "==", "ACTIVE")
        .get();

      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, {
            status: "REPLACED",
            releasedAt: admin.firestore.FieldValue.serverTimestamp(),
            releasedBy: context.auth!.uid,
            releaseReason: reason || "Device replacement",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // Revoke tokens to force re-login
      try {
        await admin.auth().revokeRefreshTokens(targetUserId);
      } catch (e) {
        console.warn("Could not revoke tokens:", e);
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "DEVICE_REPLACEMENT_APPROVED",
        entityType: "DEVICE_BINDING",
        entityId: targetUserId,
        details: { reason: reason || "Device replacement" },
      });

      return {
        success: true,
        messageAr: "تمت الموافقة على استبدال الجهاز. سيتم ربط الجهاز الجديد عند تسجيل الدخول التالي.",
        messageEn: "Device replacement approved. New device will bind on next login.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Replace device error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Cloud Function: forceLogoutUser
 *
 * Admin-only: Revokes a user's Firebase refresh tokens,
 * forcing them to re-authenticate on next app launch.
 */
export const forceLogoutUser = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const { targetUserId, reason } = data;

    if (!targetUserId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "معرف المستخدم مطلوب. | User ID is required."
      );
    }

    try {
      // Revoke all refresh tokens
      await admin.auth().revokeRefreshTokens(targetUserId);

      // Increment session version so old tokens become invalid at custom claim level too
      const db = getFirestore('datacollectionportal');
      const userRef = db.collection("users").doc(targetUserId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data()!;
        const newSessionVersion = (userData.sessionVersion || 0) + 1;
        await userRef.update({
          sessionVersion: newSessionVersion,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        try {
          await admin.auth().setCustomUserClaims(targetUserId, {
            role: userData.role,
            branchId: userData.branchId || null,
            allowedRegionNos: userData.allowedRegionNos || [userData.regionNo],
            sessionVersion: newSessionVersion,
            mustChangePassword: userData.mustChangePassword || false,
          });
        } catch (e) {
          console.warn("Could not update claims:", e);
        }
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "FORCE_LOGOUT",
        entityType: "USER",
        entityId: targetUserId,
        details: { reason: reason || "Admin forced logout" },
      });

      return {
        success: true,
        messageAr: "تم تسجيل خروج المستخدم بنجاح.",
        messageEn: "User logged out successfully.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Force logout error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Cloud Function: rejectDeviceReplacement
 *
 * Admin-only: Rejects a pending device replacement request.
 */
export const rejectDeviceReplacement = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const { bindingId, targetUserId, reason } = data || {};

    if (!bindingId && !targetUserId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "معرف الربط أو معرف المستخدم مطلوب. | bindingId or targetUserId required."
      );
    }

    const db = getFirestore('datacollectionportal');

    try {
      let targetDoc: admin.firestore.DocumentSnapshot | null = null;
      if (bindingId) {
        const docRef = db.collection("deviceBindings").doc(bindingId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          targetDoc = docSnap;
        }
      }

      if (!targetDoc && targetUserId) {
        const snap = await db.collection("deviceBindings")
          .where("userId", "==", targetUserId)
          .where("status", "in", ["PENDING", "PENDING_APPROVAL", "ACTIVE"])
          .limit(1)
          .get();
        if (!snap.empty) {
          targetDoc = snap.docs[0];
        }
      }

      if (targetDoc) {
        await targetDoc.ref.update({
          status: "REJECTED",
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          rejectedBy: context.auth.uid,
          rejectionReason: reason || "Admin rejected replacement",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "DEVICE_REPLACEMENT_REJECTED",
        entityType: "DEVICE_BINDING",
        entityId: bindingId || targetUserId || 'UNKNOWN',
        details: { reason: reason || "Admin rejected replacement" },
      });

      return {
        success: true,
        messageAr: "تم رفض طلب استبدال الجهاز.",
        messageEn: "Device replacement request rejected.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error("Reject device replacement error:", error);
      throw new functions.https.HttpsError("internal", "Internal server error.");
    }
  }
);

