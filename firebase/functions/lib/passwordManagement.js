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
exports.adminUnlockAccount = exports.adminResetPassword = exports.requestPasswordReset = exports.changePassword = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const auditLogger_1 = require("./auditLogger");
const auth_1 = require("./auth");
/**
 * Cloud Function: changePassword
 *
 * Allows an authenticated user to change their password.
 * Validates current password, enforces minimum length,
 * prevents reuse of immediately previous password, and
 * sets mustChangePassword to false.
 */
exports.changePassword = functions.https.onCall(async (data, context) => {
    // Must be authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً. | Authentication required.");
    }
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
        throw new functions.https.HttpsError("invalid-argument", "كلمة المرور الحالية والجديدة مطلوبة. | Current and new password are required.");
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
        throw new functions.https.HttpsError("invalid-argument", "كلمة المرور يجب أن تكون 6 أحرف على الأقل. | Password must be at least 6 characters.");
    }
    if (newPassword.length > 128) {
        throw new functions.https.HttpsError("invalid-argument", "كلمة المرور طويلة جداً. | Password is too long.");
    }
    const db = admin.firestore();
    const userId = context.auth.uid;
    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "المستخدم غير موجود. | User not found.");
        }
        const userData = userDoc.data();
        // Verify current password
        const isCurrentValid = await (0, auth_1.verifyPassword)(currentPassword, userData.passwordHash);
        if (!isCurrentValid) {
            await (0, auditLogger_1.logAuditSafe)({
                userId,
                userRole: userData.role,
                action: "PASSWORD_CHANGE_FAILED_WRONG_CURRENT",
                entityType: "AUTH",
                entityId: userId,
            });
            throw new functions.https.HttpsError("unauthenticated", "كلمة المرور الحالية غير صحيحة. | Current password is incorrect.");
        }
        // Prevent reuse of current password
        const isSameAsCurrent = await (0, auth_1.verifyPassword)(newPassword, userData.passwordHash);
        if (isSameAsCurrent) {
            throw new functions.https.HttpsError("invalid-argument", "لا يمكن استخدام نفس كلمة المرور الحالية. | Cannot reuse current password.");
        }
        // Hash new password
        const newHash = await (0, auth_1.hashPassword)(newPassword);
        // Increment session version to invalidate old sessions
        const newSessionVersion = (userData.sessionVersion || 0) + 1;
        await userRef.update({
            passwordHash: newHash,
            mustChangePassword: false,
            passwordChangedAt: admin.firestore.FieldValue.serverTimestamp(),
            sessionVersion: newSessionVersion,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update custom claims with new session version
        const customClaims = {
            role: userData.role,
            branchId: userData.branchId || null,
            allowedRegionNos: userData.allowedRegionNos || [userData.regionNo],
            sessionVersion: newSessionVersion,
            mustChangePassword: false,
        };
        await admin.auth().setCustomUserClaims(userId, customClaims);
        await (0, auditLogger_1.logAuditSafe)({
            userId,
            userRole: userData.role,
            action: "PASSWORD_CHANGED",
            entityType: "AUTH",
            entityId: userId,
        });
        return {
            success: true,
            messageAr: "تم تغيير كلمة المرور بنجاح.",
            messageEn: "Password changed successfully.",
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("Change password error:", error);
        throw new functions.https.HttpsError("internal", "حدث خطأ في الخادم. | Internal server error.");
    }
});
/**
 * Cloud Function: requestPasswordReset
 *
 * Allows a representative to submit a password reset request
 * from the login screen. Admin will review and action it.
 */
exports.requestPasswordReset = functions.https.onCall(async (data, _context) => {
    const { regionNo, notes, mobile } = data;
    if (!regionNo) {
        throw new functions.https.HttpsError("invalid-argument", "رقم المنطقة مطلوب. | Region number is required.");
    }
    const db = admin.firestore();
    try {
        // Find the user (don't reveal if user exists via error message)
        const usersRef = db.collection("users");
        const snapshot = await usersRef
            .where("username", "==", String(regionNo).trim())
            .limit(1)
            .get();
        // Always create a request — even if user not found
        // This prevents username enumeration
        const userId = snapshot.empty ? null : snapshot.docs[0].id;
        const resetRef = db.collection("passwordResetRequests").doc();
        await resetRef.set({
            resetRequestId: resetRef.id,
            userId: userId || null,
            regionNo: String(regionNo).trim(),
            requestNotes: notes || null,
            mobile: mobile || null,
            status: "PENDING",
            requestedAt: admin.firestore.FieldValue.serverTimestamp(),
            reviewedBy: null,
            reviewedAt: null,
            resetAt: null,
            resetMethod: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        if (userId) {
            await (0, auditLogger_1.logAuditSafe)({
                userId,
                userRole: "REP",
                action: "PASSWORD_RESET_REQUESTED",
                entityType: "PASSWORD_RESET",
                entityId: resetRef.id,
                details: { regionNo },
            });
        }
        return {
            success: true,
            messageAr: "تم إرسال طلب استعادة كلمة المرور. سيقوم المسؤول بمراجعة الطلب.",
            messageEn: "Password reset request submitted. Admin will review your request.",
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("Password reset request error:", error);
        throw new functions.https.HttpsError("internal", "حدث خطأ في الخادم. | Internal server error.");
    }
});
/**
 * Cloud Function: adminResetPassword
 *
 * Admin-only function to reset a user's password.
 * Resets to default PIN (1234) and sets mustChangePassword = true.
 * Revokes existing refresh tokens.
 */
exports.adminResetPassword = functions.https.onCall(async (data, context) => {
    // Admin-only check
    if (!context.auth || context.auth.token.role !== "ADMIN") {
        throw new functions.https.HttpsError("permission-denied", "صلاحية المسؤول مطلوبة. | Admin permission required.");
    }
    const { targetUserId, resetRequestId, temporaryPassword } = data;
    if (!targetUserId) {
        throw new functions.https.HttpsError("invalid-argument", "معرف المستخدم مطلوب. | User ID is required.");
    }
    const db = admin.firestore();
    const adminId = context.auth.uid;
    try {
        const userRef = db.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "المستخدم غير موجود. | User not found.");
        }
        const userData = userDoc.data();
        // Use temporary password or default 1234
        const newPlainPassword = temporaryPassword || "1234";
        const newHash = await (0, auth_1.hashPassword)(newPlainPassword);
        const newSessionVersion = (userData.sessionVersion || 0) + 1;
        await userRef.update({
            passwordHash: newHash,
            mustChangePassword: true,
            passwordChangedAt: admin.firestore.FieldValue.serverTimestamp(),
            sessionVersion: newSessionVersion,
            failedLoginCount: 0,
            lockedUntil: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Revoke existing Firebase Auth refresh tokens
        try {
            await admin.auth().revokeRefreshTokens(targetUserId);
        }
        catch (e) {
            console.warn("Could not revoke tokens (user may not exist in Auth):", e);
        }
        // Update custom claims
        try {
            await admin.auth().setCustomUserClaims(targetUserId, {
                role: userData.role,
                branchId: userData.branchId || null,
                allowedRegionNos: userData.allowedRegionNos || [userData.regionNo],
                sessionVersion: newSessionVersion,
                mustChangePassword: true,
            });
        }
        catch (e) {
            console.warn("Could not update claims:", e);
        }
        // If there's a corresponding reset request, mark it as actioned
        if (resetRequestId) {
            const resetRef = db
                .collection("passwordResetRequests")
                .doc(resetRequestId);
            await resetRef.update({
                status: "APPROVED",
                reviewedBy: adminId,
                reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
                resetAt: admin.firestore.FieldValue.serverTimestamp(),
                resetMethod: temporaryPassword
                    ? "TEMPORARY_PASSWORD"
                    : "DEFAULT_PIN_1234",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        await (0, auditLogger_1.logAuditSafe)({
            userId: adminId,
            userRole: "ADMIN",
            action: "ADMIN_RESET_PASSWORD",
            entityType: "USER",
            entityId: targetUserId,
            details: {
                resetMethod: temporaryPassword
                    ? "TEMPORARY_PASSWORD"
                    : "DEFAULT_PIN_1234",
                resetRequestId: resetRequestId || null,
                targetUserRegionNo: userData.regionNo,
            },
        });
        return {
            success: true,
            messageAr: "تم إعادة تعيين كلمة المرور بنجاح.",
            messageEn: "Password reset successfully.",
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("Admin reset password error:", error);
        throw new functions.https.HttpsError("internal", "حدث خطأ في الخادم. | Internal server error.");
    }
});
/**
 * Cloud Function: adminUnlockAccount
 *
 * Admin-only function to unlock a locked user account.
 * Resets failed login count and clears lockout timer.
 */
exports.adminUnlockAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== "ADMIN") {
        throw new functions.https.HttpsError("permission-denied", "صلاحية المسؤول مطلوبة. | Admin permission required.");
    }
    const { targetUserId } = data;
    if (!targetUserId) {
        throw new functions.https.HttpsError("invalid-argument", "معرف المستخدم مطلوب. | User ID is required.");
    }
    const db = admin.firestore();
    try {
        const userRef = db.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "المستخدم غير موجود. | User not found.");
        }
        await userRef.update({
            failedLoginCount: 0,
            lockedUntil: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await (0, auditLogger_1.logAuditSafe)({
            userId: context.auth.uid,
            userRole: "ADMIN",
            action: "ADMIN_UNLOCK_ACCOUNT",
            entityType: "USER",
            entityId: targetUserId,
        });
        return {
            success: true,
            messageAr: "تم فتح قفل الحساب بنجاح.",
            messageEn: "Account unlocked successfully.",
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("Unlock account error:", error);
        throw new functions.https.HttpsError("internal", "حدث خطأ في الخادم. | Internal server error.");
    }
});
//# sourceMappingURL=passwordManagement.js.map