"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditPrivilegedUsers = exports.createAdminSupervisorUser = void 0;
const admin = __importStar(require("firebase-admin"));
const gen2_1 = require("./config/gen2");
const db_1 = require("./config/db");
const crypto_1 = require("crypto");
const auditLogger_1 = require("./auditLogger");
const auth_1 = require("./auth");
const roles_1 = require("./roles");
const appCheck_1 = require("./config/appCheck");
/**
 * Cloud Function: createAdminSupervisorUser
 *
 * Allows an existing ADMIN to create a new SUPERVISOR or ADMIN.
 * Creates the Firebase Auth account with a one-time temporary password and custom claims,
 * and creates the Firestore user document.
 */
exports.createAdminSupervisorUser = (0, gen2_1.onCallGen2)(async (data, context) => {
    // 0. Verify App Check (if enabled)
    (0, appCheck_1.verifyAppCheck)(context);
    // 1. Verify Caller Authentication
    if (!context.auth) {
        throw new gen2_1.HttpsError("unauthenticated", "يجب تسجيل الدخول لإجراء هذه العملية. | Must be logged in.");
    }
    // 2. Verify Caller Authorization (Must be an ADMIN)
    if (context.auth.token.role !== roles_1.USER_ROLES.ADMIN) {
        throw new gen2_1.HttpsError("permission-denied", "ليس لديك الصلاحيات الكافية. | Insufficient permissions.");
    }
    const { email, role, branchId, userNameAr, userNameEn, mobileNo, allowedRegionNos, } = data;
    // 3. Validate Inputs
    if (!email || !role || !userNameAr) {
        throw new gen2_1.HttpsError("invalid-argument", "بيانات المستخدم غير مكتملة. | Missing required fields.");
    }
    if (role !== roles_1.USER_ROLES.SUPERVISOR && role !== roles_1.USER_ROLES.ADMIN) {
        throw new gen2_1.HttpsError("invalid-argument", "يمكن إنشاء حسابات مشرفين ومدراء فقط عبر هذه الدالة. | Can only create Supervisor/Admin.");
    }
    try {
        // 4. Create Native Firebase Auth User
        const temporaryPassword = (0, crypto_1.randomBytes)(9).toString("base64url");
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
        const passwordHash = await (0, auth_1.hashPassword)(temporaryPassword);
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
        await db_1.db.collection("users").doc(userId).set(newUser);
        // 8. Audit Log
        await (0, auditLogger_1.logAuditSafe)({
            userId: context.auth.uid,
            userRole: context.auth.token.role,
            action: "CREATE_ADMIN_SUPERVISOR",
            entityType: "USER",
            entityId: userId,
            details: { createdEmail: email, createdRole: role },
        });
        return { success: true, userId: userId, temporaryPassword };
    }
    catch (error) {
        console.error("Error creating user:", error);
        if (error.code === "auth/email-already-exists") {
            throw new gen2_1.HttpsError("already-exists", "البريد الإلكتروني مسجل مسبقاً. | Email already exists.");
        }
        throw new gen2_1.HttpsError("internal", "حدث خطأ أثناء إنشاء المستخدم. | Internal server error.");
    }
});
/**
 * Cloud Function: auditPrivilegedUsers
 *
 * Scans all users with elevated privileges (ADMIN, SUPERVISOR)
 * to verify alignment between Auth Custom Claims and Firestore user documents,
 * detecting any privilege creep or unauthorized role accumulation.
 */
exports.auditPrivilegedUsers = (0, gen2_1.onCallGen2)(async (data, context) => {
    (0, appCheck_1.verifyAppCheck)(context);
    if (!context.auth || context.auth.token.role !== roles_1.USER_ROLES.ADMIN) {
        throw new gen2_1.HttpsError("permission-denied", "صلاحية المسؤول مطلوبة لإجراء تدقيق الصلاحيات. | Admin permission required.");
    }
    const privilegedSnapshot = await db_1.db
        .collection("users")
        .where("role", "in", [roles_1.USER_ROLES.ADMIN, roles_1.USER_ROLES.SUPERVISOR])
        .get();
    const auditResults = [];
    for (const doc of privilegedSnapshot.docs) {
        const userData = doc.data();
        let authUser = null;
        let hasClaimMismatch = false;
        try {
            authUser = await admin.auth().getUser(doc.id);
            const tokenRole = authUser.customClaims?.role;
            hasClaimMismatch = tokenRole !== userData.role;
        }
        catch {
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
    await (0, auditLogger_1.logAuditSafe)({
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
});
//# sourceMappingURL=adminAuth.js.map