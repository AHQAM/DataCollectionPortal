import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { db } from "./config/db";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { logAuditSafe } from "./auditLogger";
import { hashPassword } from "./auth";
import { USER_ROLES } from "./roles";

/**
 * Cloud Function: createUser
 *
 * Admin-only function to create a new user (REP or SUPERVISOR).
 * Hashes the default password and sets mustChangePassword = true.
 */
export const createUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required.",
    );
  }

  const {
    username,
    regionNo,
    allowedRegionNos,
    userNo,
    userNameAr,
    userNameEn,
    email,
    mobile,
    branchId,
    role,
  } = data;

  // Validation
  if (!username || !regionNo || !userNameAr || !branchId || !role) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "الحقول المطلوبة: اسم المستخدم، رقم المنطقة، اسم المندوب، الفرع، الدور. | Required: username, regionNo, userNameAr, branchId, role.",
    );
  }

  if (![USER_ROLES.REP, USER_ROLES.SUPERVISOR].includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "الدور يجب أن يكون REP أو SUPERVISOR. | Role must be REP or SUPERVISOR.",
    );
  }

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
        `اسم المستخدم ${username} مستخدم بالفعل. | Username ${username} already exists.`,
      );
    }

    const temporaryPassword = randomBytes(9).toString("base64url");
    const passwordHash = await hashPassword(temporaryPassword);
    const userId = `USER-${uuidv4().substring(0, 8).toUpperCase()}`;

    const newUser = {
      userId,
      username: String(username).trim(),
      regionNo: String(regionNo).trim(),
      allowedRegionNos: allowedRegionNos || [String(regionNo).trim()],
      userNo: userNo || String(regionNo).trim(),
      userNameAr: userNameAr.trim(),
      userNameEn: userNameEn?.trim() || null,
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
        userNameAr,
      },
    });

    return {
      success: true,
      userId,
      temporaryPassword,
      messageAr: `تم إنشاء المستخدم ${userNameAr} بنجاح.`,
      messageEn: `User ${userNameAr} created successfully.`,
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error("Create user error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "حدث خطأ في الخادم. | Internal server error.",
    );
  }
});

/**
 * Cloud Function: updateUser
 *
 * Admin-only function to update user profile fields.
 * Cannot update password through this function — use changePassword or adminResetPassword.
 */
export const updateUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required.",
    );
  }

  const { targetUserId, updates } = data;

  if (!targetUserId || !updates) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "معرف المستخدم والتحديثات مطلوبة. | User ID and updates are required.",
    );
  }

  // Whitelist allowed update fields
  const ALLOWED_FIELDS = [
    "userNameAr",
    "userNameEn",
    "email",
    "mobile",
    "branchId",
    "regionNo",
    "allowedRegionNos",
    "userNo",
    "role",
    "isActive",
    "maxAllowedDevices",
  ];

  try {
    const userRef = db.collection("users").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "المستخدم غير موجود. | User not found.",
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
        "لا توجد حقول صالحة للتحديث. | No valid fields to update.",
      );
    }

    safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await userRef.update(safeUpdates);

    // Update custom claims if role or regions changed
    if (
      safeUpdates.role ||
      safeUpdates.allowedRegionNos ||
      safeUpdates.branchId
    ) {
      const updatedDoc = await userRef.get();
      const updatedData = updatedDoc.data()!;
      try {
        await admin.auth().setCustomUserClaims(targetUserId, {
          role: updatedData.role,
          branchId: updatedData.branchId || null,
          allowedRegionNos: updatedData.allowedRegionNos || [
            updatedData.regionNo,
          ],
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
      "حدث خطأ في الخادم. | Internal server error.",
    );
  }
});

/**
 * Cloud Function: deactivateUser
 *
 * Admin-only soft-delete: deactivates a user, revokes sessions.
 */
export const deactivateUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required.",
    );
  }

  const { targetUserId, reason } = data;

  if (!targetUserId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "معرف المستخدم مطلوب. | User ID is required.",
    );
  }

  // Prevent self-deactivation
  if (targetUserId === context.auth.uid) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "لا يمكنك تعطيل حسابك الخاص. | Cannot deactivate your own account.",
    );
  }

  try {
    const userRef = db.collection("users").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "المستخدم غير موجود. | User not found.",
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
      "حدث خطأ في الخادم. | Internal server error.",
    );
  }
});

/**
 * Cloud Function: importUsersBatch
 *
 * Admin-only batch user creation from import.
 * Each user gets a unique temporary password and mustChangePassword = true.
 */
export const importUsersBatch = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required.",
      );
    }

    const { users } = data;

    if (!Array.isArray(users) || users.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "قائمة المستخدمين مطلوبة. | Users list is required.",
      );
    }

    if (users.length > 100) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "الحد الأقصى 100 مستخدم في الدفعة الواحدة. | Maximum 100 users per batch.",
      );
    }

    try {
      // Check for duplicate usernames
      const existingUsers = await db.collection("users").get();
      const existingUsernames = new Set(
        existingUsers.docs.map((d) => d.data().username),
      );

      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
        temporaryPasswords: [] as Array<{
          username: string;
          userNameAr: string;
          branchName?: string;
          allowedRegionNos: string[];
          password: string;
        }>,
      };

      const batch = db.batch();

      for (const user of users) {
        const username = String(user.username || user.regionNo).trim();

        if (!username || !user.userNameAr || !user.branchId) {
          results.errors.push(
            `Skipped: Missing required fields for ${username}`,
          );
          results.skipped++;
          continue;
        }

        if (existingUsernames.has(username)) {
          const existingDoc = existingUsers.docs.find(
            (d) =>
              d.data().username === username || d.data().regionNo === username,
          );
          if (existingDoc) {
            const existingData = existingDoc.data();
            const currentAllowed = existingData.allowedRegionNos || [
              existingData.regionNo,
            ];
            const newAllowed = user.allowedRegionNos || [
              user.regionNo || username,
            ];
            const merged = Array.from(
              new Set([...currentAllowed, ...newAllowed]),
            );
            batch.update(existingDoc.ref, {
              allowedRegionNos: merged,
              branchId: user.branchId || existingData.branchId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            results.updated++;
          }
          continue;
        }

        const userId = `USER-${uuidv4().substring(0, 8).toUpperCase()}`;
        const userRef = db.collection("users").doc(userId);
        const temporaryPassword = randomBytes(9).toString("base64url");
        const passwordHash = await hashPassword(temporaryPassword);

        const allowedRegions = user.allowedRegionNos || [
          String(user.regionNo || username).trim(),
        ];

        batch.set(userRef, {
          userId,
          username,
          regionNo: String(user.regionNo || username).trim(),
          allowedRegionNos: allowedRegions,
          userNo: user.userNo || username,
          userNameAr: user.userNameAr.trim(),
          userNameEn: user.userNameEn?.trim() || null,
          email: user.email?.trim() || null,
          mobile: user.mobile?.trim() || null,
          branchId: user.branchId,
          role: user.role || "REP",
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
        });

        existingUsernames.add(username);
        results.temporaryPasswords.push({
          username,
          userNameAr: user.userNameAr.trim(),
          branchName: user.branchNameAr || user.branchId,
          allowedRegionNos: allowedRegions,
          password: temporaryPassword,
        });
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
        temporaryPasswords: results.temporaryPasswords,
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
        "حدث خطأ في الخادم. | Internal server error.",
      );
    }
  },
);
