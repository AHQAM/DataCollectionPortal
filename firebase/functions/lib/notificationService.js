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
exports.sendBroadcastNotification = exports.sendNotificationInternal = void 0;
const db_1 = require("./config/db");
const roles_1 = require("./roles");
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Internal helper for pushing FCM notifications and saving to Firestore
const sendNotificationInternal = async (userId, titleAr, titleEn, bodyAr, bodyEn, data) => {
    // Sanitize data values to strings (FCM data payload requirement)
    const sanitizedData = {};
    if (data) {
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                sanitizedData[key] = String(value);
            }
        }
    }
    // 1. Save to Firestore
    const notificationRef = db_1.db.collection("notifications").doc();
    const notificationId = notificationRef.id;
    const notificationData = {
        notificationId,
        userId,
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        data: Object.keys(sanitizedData).length > 0 ? sanitizedData : null,
        status: "SENT",
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };
    await notificationRef.set(notificationData);
    // 2. Push FCM if tokens exist
    const userDoc = await db_1.db.collection("users").doc(userId).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        // Multi-token support: aggregate fcmToken (string) and fcmTokens (array)
        const rawTokens = [];
        if (Array.isArray(userData?.fcmTokens)) {
            rawTokens.push(...userData.fcmTokens);
        }
        if (typeof userData?.fcmToken === "string" && !rawTokens.includes(userData.fcmToken)) {
            rawTokens.push(userData.fcmToken);
        }
        const tokens = rawTokens.filter((t) => typeof t === "string" && t.trim().length > 0);
        if (tokens.length > 0) {
            // Localize push notification based on user's preferredLanguage
            const userLang = userData?.preferredLanguage === "en" ? "en" : "ar";
            const pushTitle = userLang === "en" ? (titleEn || titleAr) : (titleAr || titleEn);
            const pushBody = userLang === "en" ? (bodyEn || bodyAr) : (bodyAr || bodyEn);
            const messages = tokens.map((token) => ({
                notification: {
                    title: pushTitle,
                    body: pushBody,
                },
                data: sanitizedData,
                token: token,
            }));
            try {
                const response = await admin.messaging().sendEach(messages);
                // Check for expired/unregistered tokens and prune them
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && resp.error) {
                        const errorCode = resp.error.code;
                        if (errorCode === "messaging/registration-token-not-registered" ||
                            errorCode === "messaging/invalid-registration-token") {
                            invalidTokens.push(tokens[idx]);
                        }
                    }
                });
                if (invalidTokens.length > 0) {
                    const userUpdate = {};
                    if (invalidTokens.includes(userData?.fcmToken)) {
                        userUpdate.fcmToken = admin.firestore.FieldValue.delete();
                    }
                    if (Array.isArray(userData?.fcmTokens)) {
                        userUpdate.fcmTokens = admin.firestore.FieldValue.arrayRemove(...invalidTokens);
                    }
                    await db_1.db.collection("users").doc(userId).update(userUpdate);
                    console.log(`Pruned ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
                }
            }
            catch (err) {
                console.error(`Failed to send FCM to user ${userId}`, err);
            }
        }
    }
};
exports.sendNotificationInternal = sendNotificationInternal;
// Callable for Admin to send manual broadcast
exports.sendBroadcastNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth || (context.auth.token.role !== roles_1.USER_ROLES.ADMIN && context.auth.token.role !== roles_1.USER_ROLES.SUPERVISOR)) {
        throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can send broadcasts.");
    }
    const { targetAudience, titleAr, titleEn, bodyAr, bodyEn, payload } = data;
    if (!titleAr || !titleEn || !bodyAr || !bodyEn) {
        throw new functions.https.HttpsError("invalid-argument", "Missing title or body.");
    }
    let usersQuery = db_1.db.collection("users").where("isActive", "==", true);
    if (targetAudience === "REPRESENTATIVES") {
        usersQuery = usersQuery.where("role", "==", roles_1.USER_ROLES.REP);
    }
    else if (targetAudience === "SUPERVISORS") {
        usersQuery = usersQuery.where("role", "==", roles_1.USER_ROLES.SUPERVISOR);
    }
    const usersSnap = await usersQuery.get();
    const promises = [];
    usersSnap.docs.forEach((doc) => {
        promises.push((0, exports.sendNotificationInternal)(doc.id, titleAr, titleEn, bodyAr, bodyEn, payload));
    });
    await Promise.allSettled(promises);
    return { success: true, count: usersSnap.size };
});
//# sourceMappingURL=notificationService.js.map