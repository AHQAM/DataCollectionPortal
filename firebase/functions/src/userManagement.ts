import * as admin from "firebase-admin";
import { onCallGen2, HttpsError } from "./config/gen2";
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
export const createUser = onCallGen2(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new HttpsError(
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
    throw new HttpsError(
      "invalid-argument",
      "الحقول المطلوبة: اسم المستخدم، رقم المنطقة، اسم المندوب، الفرع، الدور. | Required: username, regionNo, userNameAr, branchId, role.",
    );
  }

  if (![USER_ROLES.REP, USER_ROLES.SUPERVISOR].includes(role)) {
    throw new HttpsError(
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
      throw new HttpsError(
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
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Create user error:", error);
    throw new HttpsError(
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
export const updateUser = onCallGen2(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required.",
    );
  }

  const { targetUserId, updates } = data;

  if (!targetUserId || !updates) {
    throw new HttpsError(
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
      throw new HttpsError(
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
      throw new HttpsError(
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
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Update user error:", error);
    throw new HttpsError(
      "internal",
      "حدث خطأ في الخادم. | Internal server error.",
    );
  }
});

/**
/**
 * Cloud Function: deleteUser
 *
 * Admin-only delete: deletes a user from Firestore and Auth.
 */
export const deleteUser = onCallGen2(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required.",
    );
  }

  const { targetUserId, reason } = data;

  if (!targetUserId) {
    throw new HttpsError(
      "invalid-argument",
      "معرف المستخدم مطلوب. | User ID is required.",
    );
  }

  // Prevent self-deletion
  if (targetUserId === context.auth.uid) {
    throw new HttpsError(
      "failed-precondition",
      "لا يمكنك حذف حسابك الخاص. | Cannot delete your own account.",
    );
  }

  try {
    const userRef = db.collection("users").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new HttpsError(
        "not-found",
        "المستخدم غير موجود. | User not found.",
      );
    }

    // Hard delete from Auth
    try {
      await admin.auth().deleteUser(targetUserId);
    } catch (e) {
      console.warn("Could not delete from auth:", e);
    }

    // Hard delete from Firestore
    await userRef.delete();

    await logAuditSafe({
      userId: context.auth.uid,
      userRole: "ADMIN",
      action: "USER_DELETED",
      entityType: "USER",
      entityId: targetUserId,
      details: { reason: reason || "Admin deletion" },
    });

    return {
      success: true,
      messageAr: "تم حذف الحساب بنجاح.",
      messageEn: "Account deleted successfully.",
    };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Deactivate user error:", error);
    throw new HttpsError(
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
export const importUsersBatch = onCallGen2(async (data, context) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required.",
    );
  }

  const { users } = data;

  if (!Array.isArray(users) || users.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "قائمة المستخدمين مطلوبة. | Users list is required.",
    );
  }

  if (users.length > 100) {
    throw new HttpsError(
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
        results.errors.push(`Skipped: Missing required fields for ${username}`);
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

      if (user.role === "SUPERVISOR" || user.role === "ADMIN") {
        try {
          const createPayload: any = {
            uid: userId,
            password: temporaryPassword,
            displayName: user.userNameAr.trim(),
          };
          if (user.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            createPayload.email = user.email;
          }
          await admin.auth().createUser(createPayload);
          await admin.auth().setCustomUserClaims(userId, {
            role: user.role,
            branchId: user.branchId || null,
            allowedRegionNos: allowedRegions,
            mustChangePassword: true,
          });
        } catch (e: any) {
          console.warn(`Could not create auth user for ${username}:`, e);
        }
      }

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
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Import users batch error:", error);
    throw new HttpsError(
      "internal",
      "حدث خطأ في الخادم. | Internal server error.",
    );
  }
});

/**
 * Cloud Function: updateUserProfile
 *
 * Allows ANY authenticated user (Admin, Supervisor, Rep) to update
 * their own username and/or password.
 */
export const updateUserProfile = onCallGen2(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "يجب تسجيل الدخول أولاً. | Authentication required.",
    );
  }

  const userId = context.auth.uid;
  const { newUsername, newPassword, userNameAr, userNameEn } = data || {};

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new HttpsError(
        "not-found",
        "المستخدم غير موجود. | User not found.",
      );
    }

    const userData = userDoc.data()!;
    const updates: Record<string, any> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // If updating username:
    if (newUsername && typeof newUsername === "string" && newUsername.trim()) {
      const cleanUsername = newUsername.trim();
      if (cleanUsername !== userData.username) {
        // Check uniqueness across users
        const existing = await db
          .collection("users")
          .where("username", "==", cleanUsername)
          .limit(1)
          .get();

        if (!existing.empty && existing.docs[0].id !== userId) {
          throw new HttpsError(
            "already-exists",
            "اسم المستخدم مستخدم بالفعل. | Username already taken.",
          );
        }

        updates.username = cleanUsername;
      }
    }

    if (userNameAr && typeof userNameAr === "string" && userNameAr.trim()) {
      updates.userNameAr = userNameAr.trim();
    }

    if (userNameEn !== undefined && typeof userNameEn === "string") {
      updates.userNameEn = userNameEn.trim();
    }

    // If updating password:
    if (newPassword && typeof newPassword === "string" && newPassword.trim()) {
      if (newPassword.length < 6) {
        throw new HttpsError(
          "invalid-argument",
          "كلمة المرور يجب أن تكون 6 أحرف على الأقل. | Password must be at least 6 characters.",
        );
      }
      const newHash = await hashPassword(newPassword);
      updates.passwordHash = newHash;
      updates.mustChangePassword = false;
      updates.passwordChangedAt = admin.firestore.FieldValue.serverTimestamp();
      updates.sessionVersion = (userData.sessionVersion || 0) + 1;

      // Update Native Firebase Auth password if exists
      try {
        await admin.auth().updateUser(userId, { password: newPassword });
      } catch (authErr: any) {
        if (authErr.code !== "auth/user-not-found") {
          console.warn(`Failed to update native auth password for ${userId}:`, authErr);
        }
      }
    }

    await userRef.update(updates);

    // Update display name in native auth if userNameAr was updated
    if (updates.userNameAr || updates.username) {
      try {
        await admin.auth().updateUser(userId, {
          displayName: updates.userNameAr || updates.username,
        });
      } catch (_) {}
    }

    await logAuditSafe({
      userId,
      userRole: userData.role,
      action: "PROFILE_UPDATED",
      entityType: "USER",
      entityId: userId,
      details: {
        usernameChanged: !!updates.username,
        passwordChanged: !!updates.passwordHash,
      },
    });

    return {
      success: true,
      messageAr: "تم تحديث الملف الشخصي بنجاح.",
      messageEn: "Profile updated successfully.",
      user: {
        username: updates.username || userData.username,
        userNameAr: updates.userNameAr || userData.userNameAr,
        userNameEn: updates.userNameEn || userData.userNameEn,
      },
    };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Update profile error:", error);
    throw new HttpsError(
      "internal",
      "حدث خطأ في الخادم. | Internal server error.",
    );
  }
});
