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
const firestore_1 = require("firebase-admin/firestore");
const roles_1 = require("./roles");
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = (0, firestore_1.getFirestore)('datacollectionportal');
// Internal helper for pushing FCM notifications and saving to Firestore
const sendNotificationInternal = async (userId, titleAr, titleEn, bodyAr, bodyEn, data) => {
    // 1. Save to Firestore
    const notificationRef = db.collection("notifications").doc();
    const notificationId = notificationRef.id;
    const notificationData = {
        notificationId,
        userId,
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        data: data || null,
        status: "SENT",
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };
    await notificationRef.set(notificationData);
    // 2. Push FCM if tokens exist
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        const tokens = userData?.fcmToken
            ? [userData.fcmToken]
            : [];
        if (tokens.length > 0) {
            const messages = tokens.map((token) => ({
                notification: {
                    title: titleAr, // Defaulting to Arabic for push, but could be localized per user preference
                    body: bodyAr,
                },
                data: data || {},
                token: token,
            }));
            try {
                await admin.messaging().sendEach(messages);
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
    let usersQuery = db.collection("users").where("isActive", "==", true);
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
    await Promise.all(promises);
    return { success: true, count: usersSnap.size };
});
//# sourceMappingURL=notificationService.js.map