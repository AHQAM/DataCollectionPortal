import * as admin from "firebase-admin";
import { onCallGen2, HttpsError } from "./config/gen2";
import { db } from "./config/db";
import { randomBytes } from "crypto";
import { logAuditSafe } from "./auditLogger";
import { hashPassword } from "./auth";
import { USER_ROLES } from "./roles";
import { verifyAppCheck } from "./config/appCheck";

/**
 * Cloud Function: createAdminSupervisorUser
 *
 * Allows an existing ADMIN to create a new SUPERVISOR or ADMIN.
 * Creates the Firebase Auth account with a one-time temporary password and custom claims,
 * and creates the Firestore user document.
 */
export const createAdminSupervisorUser = onCallGen2(
  async (data, context) => {
    // 0. Verify App Check (if enabled)
    verifyAppCheck(context);

    // 1. Verify Caller Authentication
    if (!context.auth) {
      throw new HttpsError(
        "unauthenticated",
        "يجب تسجيل الدخول لإجراء هذه العملية. | Must be logged in.",
      );
    }

    // 2. Verify Caller Authorization (Must be an ADMIN)
    if (context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك الصلاحيات الكافية. | Insufficient permissions.",
      );
    }

    const {
      email,
      role,
      branchId,
      userNameAr,
      userNameEn,
      mobileNo,
      allowedRegionNos,
    } = data;

    // 3. Validate Inputs
    if (!email || !role || !userNameAr) {
      throw new HttpsError(
        "invalid-argument",
        "بيانات المستخدم غير مكتملة. | Missing required fields.",
      );
    }

    if (role !== USER_ROLES.SUPERVISOR && role !== USER_ROLES.ADMIN) {
      throw new HttpsError(
        "invalid-argument",
        "يمكن إنشاء حسابات مشرفين ومدراء فقط عبر هذه الدالة. | Can only create Supervisor/Admin.",
      );
    }

    try {
      // 4. Create Native Firebase Auth User
      const temporaryPassword = randomBytes(9).toString("base64url");
      const userRecord = await admin.auth().createUser({
        email: email,
        password: temporaryPassword,
        displayName: userNameAr,
      });

      const userId = userRecord.uid;

      // 5. Set Custom Claims
      const customClaims = {
        role: role,
        branchId: branchId || null,
        allowedRegionNos: allowedRegionNos || [email],
        mustChangePassword: true, // Force password change on first login
      };

      await admin.auth().setCustomUserClaims(userId, customClaims);

      // 6. Hash Default Password for Firestore record (Consistency with reps)
      const passwordHash = await hashPassword(temporaryPassword);

      // 7. Create Firestore Document
      const newUser = {
        userId: userId,
        regionNo: email, // Use email as regionNo for structural compatibility
        username: email,
        role: role,
        branchId: branchId || null,
        allowedRegionNos: allowedRegionNos || [email],
        userNameAr: userNameAr,
        userNameEn: userNameEn || "",
        mobileNo: mobileNo || "",
        passwordHash: passwordHash,
        mustChangePassword: true,
        deviceBindingStatus: "UNBOUND",
        failedLoginCount: 0,
        lockedUntil: null,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("users").doc(userId).set(newUser);

      // 8. Audit Log
      await logAuditSafe({
        userId: context.auth.uid,
        userRole: context.auth.token.role,
        action: "CREATE_ADMIN_SUPERVISOR",
        entityType: "USER",
        entityId: userId,
        details: { createdEmail: email, createdRole: role },
      });

      return { success: true, userId: userId, temporaryPassword };
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "البريد الإلكتروني مسجل مسبقاً. | Email already exists.",
        );
      }
      throw new HttpsError(
        "internal",
        "حدث خطأ أثناء إنشاء المستخدم. | Internal server error.",
      );
    }
  },
);

/**
 * Cloud Function: auditPrivilegedUsers
 *
 * Scans all users with elevated privileges (ADMIN, SUPERVISOR)
 * to verify alignment between Auth Custom Claims and Firestore user documents,
 * detecting any privilege creep or unauthorized role accumulation.
 */
export const auditPrivilegedUsers = onCallGen2(
  async (data, context) => {
    verifyAppCheck(context);

    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة لإجراء تدقيق الصلاحيات. | Admin permission required.",
      );
    }

    const privilegedSnapshot = await db
      .collection("users")
      .where("role", "in", [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR])
      .get();

    const auditResults: any[] = [];

    for (const doc of privilegedSnapshot.docs) {
      const userData = doc.data();
      let authUser: admin.auth.UserRecord | null = null;
      let hasClaimMismatch = false;

      try {
        authUser = await admin.auth().getUser(doc.id);
        const tokenRole = authUser.customClaims?.role;
        hasClaimMismatch = tokenRole !== userData.role;
      } catch {
        // User exists in Firestore but not in Auth, or vice versa
      }

      auditResults.push({
        userId: doc.id,
        userNameAr: userData.userNameAr,
        email: userData.username || userData.email,
        role: userData.role,
        branchId: userData.branchId,
        customClaimRole: authUser?.customClaims?.role || null,
        hasClaimMismatch,
        isActive: userData.isActive,
        lastSignInTime: authUser?.metadata.lastSignInTime || null,
        creationTime: authUser?.metadata.creationTime || null,
      });
    }

    await logAuditSafe({
      userId: context.auth.uid,
      userRole: context.auth.token.role,
      action: "IAM_PRIVILEGE_AUDIT_EXECUTED",
      entityType: "IAM",
      entityId: "SECURITY_AUDIT",
      details: { auditedCount: auditResults.length },
    });

    return {
      success: true,
      auditedAt: new Date().toISOString(),
      privilegedUsers: auditResults,
    };
  },
);
