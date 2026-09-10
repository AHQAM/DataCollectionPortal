import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { logAuditSafe } from "./auditLogger";
import { hashPassword } from "./auth";

const DEFAULT_PASSWORD = "1234";

/**
 * Cloud Function: createUser
 *
 * Admin-only function to create a new user (REP or SUPERVISOR).
 * Hashes the default password and sets mustChangePassword = true.
 */
export const createUser = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== "ADMIN") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const {
      username,
      regionNo,
      allowedRegionNos,
      repNo,
      repNameAr,
      repNameEn,
      email,
      mobile,
      branchId,
      role,
    } = data;

    // Validation
    if (!username || !regionNo || !repNameAr || !branchId || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "الحقول المطلوبة: اسم المستخدم، رقم المنطقة، اسم المندوب، الفرع، الدور. | Required: username, regionNo, repNameAr, branchId, role."
      );
    }

    if (!["REP", "SUPERVISOR"].includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "الدور يجب أن يكون REP أو SUPERVISOR. | Role must be REP or SUPERVISOR."
      );
    }

    const db = admin.firestore();

    try {
      // Check for duplicate username
      const existing = await db
        .collection("users")
        .where("username", "==", String(username).trim())
        .limit(1)
        .get();

      if (!existing.empty) {
        throw new functions.https.HttpsError(
          "already-exists",
          `اسم المستخدم ${username} مستخدم بالفعل. | Username ${username} already exists.`
        );
      }

      // Hash default password
      const passwordHash = await hashPassword(DEFAULT_PASSWORD);
      const userId = `USER-${uuidv4().substring(0, 8).toUpperCase()}`;

      const newUser = {
        userId,
        username: String(username).trim(),
        regionNo: String(regionNo).trim(),
        allowedRegionNos: allowedRegionNos || [String(regionNo).trim()],
        repNo: repNo || String(regionNo).trim(),
        repNameAr: repNameAr.trim(),
        repNameEn: repNameEn?.trim() || null,
        email: email?.trim() || null,
        mobile: mobile?.trim() || null,
        branchId,
        role,
        passwordHash,
        mustChangePassword: true,
        isActive: true,
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: null,
        passwordChangedAt: null,
        sessionVersion: 1,
        deviceBindingStatus: "UNBOUND",
        boundDeviceIdHash: null,
        boundDevicePlatform: null,
        boundDeviceLabel: null,
        maxAllowedDevices: 1,
        fcmToken: null,
        fcmTokenUpdatedAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedAt: null,
        deletedBy: null,
      };

      await db.collection("users").doc(userId).set(newUser);

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "USER_CREATED",
        entityType: "USER",
        entityId: userId,
        details: {
          username,
          regionNo,
          role,
          branchId,
          repNameAr,
        },
      });

      return {
        success: true,
        userId,
        messageAr: `تم إنشاء المستخدم ${repNameAr} بنجاح.`,
        messageEn: `User ${repNameAr} created successfully.`,
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Create user error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Cloud Function: updateUser
 *
 * Admin-only function to update user profile fields.
 * Cannot update password through this function — use changePassword or adminResetPassword.
 */
export const updateUser = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== "ADMIN") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const { targetUserId, updates } = data;

    if (!targetUserId || !updates) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "معرف المستخدم والتحديثات مطلوبة. | User ID and updates are required."
      );
    }

    // Whitelist allowed update fields
    const ALLOWED_FIELDS = [
      "repNameAr", "repNameEn", "email", "mobile",
      "branchId", "regionNo", "allowedRegionNos",
      "repNo", "role", "isActive", "maxAllowedDevices",
    ];

    const db = admin.firestore();

    try {
      const userRef = db.collection("users").doc(targetUserId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "المستخدم غير موجود. | User not found."
        );
      }

      const safeUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (ALLOWED_FIELDS.includes(key)) {
          safeUpdates[key] = value;
        }
      }

      if (Object.keys(safeUpdates).length === 0) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "لا توجد حقول صالحة للتحديث. | No valid fields to update."
        );
      }

      safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await userRef.update(safeUpdates);

      // Update custom claims if role or regions changed
      if (safeUpdates.role || safeUpdates.allowedRegionNos || safeUpdates.branchId) {
        const updatedDoc = await userRef.get();
        const updatedData = updatedDoc.data()!;
        try {
          await admin.auth().setCustomUserClaims(targetUserId, {
            role: updatedData.role,
            branchId: updatedData.branchId || null,
            allowedRegionNos: updatedData.allowedRegionNos || [updatedData.regionNo],
            sessionVersion: updatedData.sessionVersion || 1,
            mustChangePassword: updatedData.mustChangePassword || false,
          });
        } catch (e) {
          console.warn("Could not update claims:", e);
        }
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "USER_UPDATED",
        entityType: "USER",
        entityId: targetUserId,
        details: { updatedFields: Object.keys(safeUpdates) },
      });

      return {
        success: true,
        messageAr: "تم تحديث المستخدم بنجاح.",
        messageEn: "User updated successfully.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Update user error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Cloud Function: deactivateUser
 *
 * Admin-only soft-delete: deactivates a user, revokes sessions.
 */
export const deactivateUser = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== "ADMIN") {
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

    // Prevent self-deactivation
    if (targetUserId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "لا يمكنك تعطيل حسابك الخاص. | Cannot deactivate your own account."
      );
    }

    const db = admin.firestore();

    try {
      const userRef = db.collection("users").doc(targetUserId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "المستخدم غير موجود. | User not found."
        );
      }

      await userRef.update({
        isActive: false,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: context.auth.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Revoke auth tokens
      try {
        await admin.auth().revokeRefreshTokens(targetUserId);
      } catch (e) {
        console.warn("Could not revoke tokens:", e);
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "USER_DEACTIVATED",
        entityType: "USER",
        entityId: targetUserId,
        details: { reason: reason || "Admin deactivation" },
      });

      return {
        success: true,
        messageAr: "تم تعطيل الحساب بنجاح.",
        messageEn: "Account deactivated successfully.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Deactivate user error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);

/**
 * Cloud Function: importUsersBatch
 *
 * Admin-only batch user creation from import.
 * Each user gets default password 1234, mustChangePassword = true.
 */
export const importUsersBatch = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== "ADMIN") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const { users } = data;

    if (!Array.isArray(users) || users.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "قائمة المستخدمين مطلوبة. | Users list is required."
      );
    }

    if (users.length > 100) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "الحد الأقصى 100 مستخدم في الدفعة الواحدة. | Maximum 100 users per batch."
      );
    }

    const db = admin.firestore();

    try {
      // Check for duplicate usernames
      const existingUsers = await db.collection("users").get();
      const existingUsernames = new Set(
        existingUsers.docs.map((d) => d.data().username)
      );

      const defaultHash = await hashPassword(DEFAULT_PASSWORD);
      const results = { created: 0, skipped: 0, errors: [] as string[] };

      const batch = db.batch();

      for (const user of users) {
        const username = String(user.username || user.regionNo).trim();

        if (!username || !user.repNameAr || !user.branchId) {
          results.errors.push(
            `Skipped: Missing required fields for ${username}`
          );
          results.skipped++;
          continue;
        }

        if (existingUsernames.has(username)) {
          results.errors.push(`Skipped: Username ${username} already exists`);
          results.skipped++;
          continue;
        }

        const userId = `USER-${uuidv4().substring(0, 8).toUpperCase()}`;
        const userRef = db.collection("users").doc(userId);

        batch.set(userRef, {
          userId,
          username,
          regionNo: String(user.regionNo || username).trim(),
          allowedRegionNos: user.allowedRegionNos || [
            String(user.regionNo || username).trim(),
          ],
          repNo: user.repNo || username,
          repNameAr: user.repNameAr.trim(),
          repNameEn: user.repNameEn?.trim() || null,
          email: user.email?.trim() || null,
          mobile: user.mobile?.trim() || null,
          branchId: user.branchId,
          role: user.role || "REP",
          passwordHash: defaultHash,
          mustChangePassword: true,
          isActive: true,
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: null,
          passwordChangedAt: null,
          sessionVersion: 1,
          deviceBindingStatus: "UNBOUND",
          boundDeviceIdHash: null,
          boundDevicePlatform: null,
          boundDeviceLabel: null,
          maxAllowedDevices: 1,
          fcmToken: null,
          fcmTokenUpdatedAt: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          deletedAt: null,
          deletedBy: null,
        });

        existingUsernames.add(username);
        results.created++;
      }

      await batch.commit();

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "USERS_BATCH_IMPORTED",
        entityType: "USER",
        entityId: "BATCH",
        details: {
          totalInput: users.length,
          created: results.created,
          skipped: results.skipped,
        },
      });

      return {
        success: true,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors,
        messageAr: `تم إنشاء ${results.created} مستخدم بنجاح.`,
        messageEn: `${results.created} users created successfully.`,
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Import users batch error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ في الخادم. | Internal server error."
      );
    }
  }
);
