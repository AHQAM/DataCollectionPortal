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
exports.createAdminSupervisorUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const auditLogger_1 = require("./auditLogger");
const auth_1 = require("./auth");
const roles_1 = require("./roles");
/**
 * Cloud Function: createAdminSupervisorUser
 *
 * Allows an existing ADMIN to create a new SUPERVISOR or ADMIN.
 * Creates the Firebase Auth account with a one-time temporary password and custom claims,
 * and creates the Firestore user document.
 */
exports.createAdminSupervisorUser = functions.https.onCall(async (data, context) => {
    // 1. Verify Caller Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "يجب تسجيل الدخول لإجراء هذه العملية. | Must be logged in.");
    }
    // 2. Verify Caller Authorization (Must be an ADMIN)
    if (context.auth.token.role !== roles_1.USER_ROLES.ADMIN) {
        throw new functions.https.HttpsError("permission-denied", "ليس لديك الصلاحيات الكافية. | Insufficient permissions.");
    }
    const { email, role, branchId, repNameAr, repNameEn, mobileNo, allowedRegionNos } = data;
    // 3. Validate Inputs
    if (!email || !role || !repNameAr) {
        throw new functions.https.HttpsError("invalid-argument", "بيانات المستخدم غير مكتملة. | Missing required fields.");
    }
    if (role !== roles_1.USER_ROLES.SUPERVISOR && role !== roles_1.USER_ROLES.ADMIN) {
        throw new functions.https.HttpsError("invalid-argument", "يمكن إنشاء حسابات مشرفين ومدراء فقط عبر هذه الدالة. | Can only create Supervisor/Admin.");
    }
    const db = admin.firestore();
    try {
        // 4. Create Native Firebase Auth User
        const temporaryPassword = (0, crypto_1.randomBytes)(9).toString("base64url");
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
        const passwordHash = await (0, auth_1.hashPassword)(temporaryPassword);
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
            throw new functions.https.HttpsError("already-exists", "البريد الإلكتروني مسجل مسبقاً. | Email already exists.");
        }
        throw new functions.https.HttpsError("internal", "حدث خطأ أثناء إنشاء المستخدم. | Internal server error.");
    }
});
//# sourceMappingURL=adminAuth.js.map