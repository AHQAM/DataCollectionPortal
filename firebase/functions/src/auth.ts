import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as bcrypt from "bcrypt";
import { logAuditSafe } from "./auditLogger";

const BCRYPT_SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Cloud Function: authenticateWithRegionPassword
 *
 * Authenticates a Sales Representative using Region Number and Password.
 * Returns a Firebase Custom Auth Token on success.
 *
 * SECURITY:
 * - Password is verified via bcrypt against stored hash
 * - Device binding is enforced
 * - Account lockout after MAX_FAILED_ATTEMPTS consecutive failures
 * - Custom claims include role, allowedRegionNos, branchId, sessionVersion
 * - All login attempts are audit logged
 */
export const authenticateWithRegionPassword = functions.https.onCall(
  async (data, context) => {
    const { regionNo, password, installationDeviceId, platform, appVersion, fcmToken } = data;

    // Input validation
    if (!regionNo || !password || !installationDeviceId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields."
      );
    }

    if (typeof regionNo !== "string" || typeof password !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid input types."
      );
    }

    // Basic rate limiting: reject very rapid requests
    // In production, use Firebase App Check + Cloud Armor / API Gateway
    if (password.length > 128) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Password exceeds maximum length."
      );
    }

    const db = admin.firestore();

    try {
      // 1. Find user by regionNo (username field)
      const usersRef = db.collection("users");
      const snapshot = await usersRef
        .where("username", "==", String(regionNo).trim())
        .where("role", "in", ["REP", "SUPERVISOR", "ADMIN"])
        .limit(1)
        .get();

      if (snapshot.empty) {
        // Don't reveal whether user exists — generic message
        await logAuditSafe({
          userId: "UNKNOWN",
          userRole: "UNKNOWN",
          action: "LOGIN_FAILED_USER_NOT_FOUND",
          entityType: "AUTH",
          entityId: String(regionNo),
          details: { regionNo, platform },
        });

        throw new functions.https.HttpsError(
          "unauthenticated",
          "بيانات الاعتماد غير صحيحة. | Invalid credentials."
        );
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      // 2. Check if account is active
      if (userData.isActive === false) {
        await logAuditSafe({
          userId,
          userRole: userData.role,
          action: "LOGIN_FAILED_ACCOUNT_INACTIVE",
          entityType: "AUTH",
          entityId: userId,
        });

        throw new functions.https.HttpsError(
          "permission-denied",
          "الحساب غير مفعل. يرجى التواصل مع الإدارة. | Account is deactivated. Please contact administration."
        );
      }

      // 3. Check lockout status
      if (userData.lockedUntil) {
        const lockDate = userData.lockedUntil.toDate
          ? userData.lockedUntil.toDate()
          : new Date(userData.lockedUntil);

        if (lockDate > new Date()) {
          const remainingMinutes = Math.ceil(
            (lockDate.getTime() - Date.now()) / 60000
          );

          await logAuditSafe({
            userId,
            userRole: userData.role,
            action: "LOGIN_FAILED_ACCOUNT_LOCKED",
            entityType: "AUTH",
            entityId: userId,
            details: { remainingMinutes },
          });

          throw new functions.https.HttpsError(
            "permission-denied",
            `الحساب مقفل مؤقتاً. حاول بعد ${remainingMinutes} دقيقة. | Account is temporarily locked. Try again in ${remainingMinutes} minutes.`
          );
        }
      }

      // 4. Verify password with bcrypt
      const passwordHash = userData.passwordHash;
      if (!passwordHash) {
        // No password hash stored — this shouldn't happen in production
        console.error(`User ${userId} has no passwordHash set`);
        throw new functions.https.HttpsError(
          "internal",
          "حدث خطأ في إعدادات الحساب. | Account configuration error."
        );
      }

      const isPasswordValid = await bcrypt.compare(password, passwordHash);

      if (!isPasswordValid) {
        // Increment failed login count
        const failedCount = (userData.failedLoginCount || 0) + 1;
        const updates: Record<string, any> = {
          failedLoginCount: failedCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (failedCount >= MAX_FAILED_ATTEMPTS) {
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + LOCKOUT_MINUTES);
          updates.lockedUntil = admin.firestore.Timestamp.fromDate(lockTime);

          await logAuditSafe({
            userId,
            userRole: userData.role,
            action: "ACCOUNT_LOCKED",
            entityType: "AUTH",
            entityId: userId,
            details: { failedCount, lockoutMinutes: LOCKOUT_MINUTES },
          });
        }

        await userDoc.ref.update(updates);

        await logAuditSafe({
          userId,
          userRole: userData.role,
          action: "LOGIN_FAILED_WRONG_PASSWORD",
          entityType: "AUTH",
          entityId: userId,
          details: {
            failedCount,
            platform,
            appVersion,
          },
        });

        throw new functions.https.HttpsError(
          "unauthenticated",
          "بيانات الاعتماد غير صحيحة. | Invalid credentials."
        );
      }

      // 5. Validate Device Binding
      if (userData.deviceBindingStatus === "BOUND") {
        // Compare against stored device hash
        const storedDeviceHash = userData.boundDeviceIdHash;
        if (storedDeviceHash) {
          const deviceMatches = await bcrypt.compare(
            installationDeviceId,
            storedDeviceHash
          );

          if (!deviceMatches) {
            await logAuditSafe({
              userId,
              userRole: userData.role,
              action: "LOGIN_FAILED_DEVICE_MISMATCH",
              entityType: "AUTH",
              entityId: userId,
              details: { platform, appVersion },
            });

            throw new functions.https.HttpsError(
              "permission-denied",
              "هذا الحساب مرتبط بجهاز آخر. يرجى التواصل مع الإدارة لفك ارتباط الجهاز. | This account is linked to another device. Please contact the administrator to release the device."
            );
          }
        }
      } else if (userData.deviceBindingStatus === "UNBOUND") {
        // First login — bind device
        const deviceIdHash = await bcrypt.hash(installationDeviceId, BCRYPT_SALT_ROUNDS);

        await userDoc.ref.update({
          deviceBindingStatus: "BOUND",
          boundDeviceIdHash: deviceIdHash,
          boundDevicePlatform: platform || "Unknown",
          boundDeviceLabel: `${platform || "Unknown"} - ${appVersion || "Unknown"}`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create device binding record
        const bindingRef = db.collection("deviceBindings").doc();
        await bindingRef.set({
          bindingId: bindingRef.id,
          userId,
          deviceIdHash,
          devicePlatform: platform || "Unknown",
          deviceLabel: `${platform || "Unknown"} - ${appVersion || "Unknown"}`,
          appVersion: appVersion || "Unknown",
          status: "ACTIVE",
          boundAt: admin.firestore.FieldValue.serverTimestamp(),
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
          fcmTokenHash: fcmToken ? "[SET]" : null,
          fcmTokenUpdatedAt: fcmToken
            ? admin.firestore.FieldValue.serverTimestamp()
            : null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await logAuditSafe({
          userId,
          userRole: userData.role,
          action: "DEVICE_BOUND",
          entityType: "DEVICE_BINDING",
          entityId: bindingRef.id,
          details: { platform, appVersion },
          deviceBindingId: bindingRef.id,
        });
      }

      // 6. Success — reset failed count, update last login
      const loginUpdates: Record<string, any> = {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store FCM token for push notifications
      if (fcmToken) {
        loginUpdates.fcmToken = fcmToken;
        loginUpdates.fcmTokenUpdatedAt =
          admin.firestore.FieldValue.serverTimestamp();
      }

      await userDoc.ref.update(loginUpdates);

      // 7. Update device binding last active
      const activeBindings = await db
        .collection("deviceBindings")
        .where("userId", "==", userId)
        .where("status", "==", "ACTIVE")
        .limit(1)
        .get();

      if (!activeBindings.empty) {
        await activeBindings.docs[0].ref.update({
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
          appVersion: appVersion || "Unknown",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 8. Build custom claims
      const customClaims = {
        role: userData.role,
        branchId: userData.branchId || null,
        regionNo: userData.regionNo || null,
        allowedRegionNos: userData.allowedRegionNos || [userData.regionNo],
        sessionVersion: (userData.sessionVersion || 0) + 0, // Keep current version
        mustChangePassword: userData.mustChangePassword || false,
      };

      // 9. Ensure Firebase Auth user exists with correct claims
      try {
        await admin.auth().getUser(userId);
        // Update claims on every login to keep them fresh
        await admin.auth().setCustomUserClaims(userId, customClaims);
      } catch (e: any) {
        if (e.code === "auth/user-not-found") {
          await admin.auth().createUser({
            uid: userId,
            displayName: userData.repNameAr || userData.username,
          });
          await admin.auth().setCustomUserClaims(userId, customClaims);
        } else {
          throw e;
        }
      }

      // 10. Create custom token
      const token = await admin.auth().createCustomToken(userId, customClaims);

      // 11. Audit log — successful login
      await logAuditSafe({
        userId,
        userRole: userData.role,
        action: "LOGIN_SUCCESS",
        entityType: "AUTH",
        entityId: userId,
        details: {
          platform,
          appVersion,
          mustChangePassword: userData.mustChangePassword,
          regionNo: userData.regionNo,
        },
      });

      return {
        userId,
        token,
        mustChangePassword: userData.mustChangePassword || false,
        repNameAr: userData.repNameAr,
        repNameEn: userData.repNameEn || null,
        repNo: userData.repNo || userData.regionNo,
        role: userData.role,
        allowedRegionNos: userData.allowedRegionNos || [userData.regionNo],
        branchId: userData.branchId,
        regionNo: userData.regionNo,
        sessionVersion: userData.sessionVersion || 0,
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Authentication error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Utility: Hash a password with bcrypt.
 * Used by other functions for consistent hashing.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Utility: Verify a password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
