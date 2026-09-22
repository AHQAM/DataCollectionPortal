import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
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
export const createAdminSupervisorUser = functions.https.onCall(
  async (data, context) => {
    // 0. Verify App Check (if enabled)
    verifyAppCheck(context);

    // 1. Verify Caller Authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "يجب تسجيل الدخول لإجراء هذه العملية. | Must be logged in.",
      );
    }

    // 2. Verify Caller Authorization (Must be an ADMIN)
    if (context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ليس لديك الصلاحيات الكافية. | Insufficient permissions.",
      );
    }

    const {
      email,
      role,
      branchId,
      repNameAr,
      repNameEn,
      mobileNo,
      allowedRegionNos,
    } = data;

    // 3. Validate Inputs
    if (!email || !role || !repNameAr) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "بيانات المستخدم غير مكتملة. | Missing required fields.",
      );
    }

    if (role !== USER_ROLES.SUPERVISOR && role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
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
        displayName: repNameAr,
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
        repNameAr: repNameAr,
        repNameEn: repNameEn || "",
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
        throw new functions.https.HttpsError(
          "already-exists",
          "البريد الإلكتروني مسجل مسبقاً. | Email already exists.",
        );
      }
      throw new functions.https.HttpsError(
        "internal",
        "حدث خطأ أثناء إنشاء المستخدم. | Internal server error.",
      );
    }
  },
);
