import { db } from "./config/db";
import { USER_ROLES } from "./roles";
import { onCallGen2, HttpsError } from "./config/gen2";
import * as admin from "firebase-admin";

// Internal helper for pushing FCM notifications and saving to Firestore
export const sendNotificationInternal = async (
  userId: string,
  titleAr: string,
  titleEn: string,
  bodyAr: string,
  bodyEn: string,
  data?: Record<string, any>,
) => {
  // Sanitize data values to strings (FCM data payload requirement)
  const sanitizedData: Record<string, string> = {};
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        sanitizedData[key] = String(value);
      }
    }
  }

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
    data: Object.keys(sanitizedData).length > 0 ? sanitizedData : null,
    status: "SENT",
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await notificationRef.set(notificationData);

  // 2. Push FCM if tokens exist
  const userDoc = await db.collection("users").doc(userId).get();
  if (userDoc.exists) {
    const userData = userDoc.data();

    // Multi-token support: aggregate fcmToken (string) and fcmTokens (array)
    const rawTokens: string[] = [];
    if (Array.isArray(userData?.fcmTokens)) {
      rawTokens.push(...userData.fcmTokens);
    }
    if (
      typeof userData?.fcmToken === "string" &&
      !rawTokens.includes(userData.fcmToken)
    ) {
      rawTokens.push(userData.fcmToken);
    }

    const tokens = rawTokens.filter(
      (t) => typeof t === "string" && t.trim().length > 0,
    );

    if (tokens.length > 0) {
      // Localize push notification based on user's preferredLanguage
      const userLang = userData?.preferredLanguage === "en" ? "en" : "ar";
      const pushTitle =
        userLang === "en" ? titleEn || titleAr : titleAr || titleEn;
      const pushBody = userLang === "en" ? bodyEn || bodyAr : bodyAr || bodyEn;

      const messages = tokens.map((token: string) => ({
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
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errorCode = resp.error.code;
            if (
              errorCode === "messaging/registration-token-not-registered" ||
              errorCode === "messaging/invalid-registration-token"
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          const userUpdate: Record<string, any> = {};
          if (invalidTokens.includes(userData?.fcmToken)) {
            userUpdate.fcmToken = admin.firestore.FieldValue.delete();
          }
          if (Array.isArray(userData?.fcmTokens)) {
            userUpdate.fcmTokens = admin.firestore.FieldValue.arrayRemove(
              ...invalidTokens,
            );
          }
          await db.collection("users").doc(userId).update(userUpdate);
          console.log(
            `Pruned ${invalidTokens.length} invalid FCM tokens for user ${userId}`,
          );
        }
      } catch (err) {
        console.error(`Failed to send FCM to user ${userId}`, err);
      }
    }
  }
};

// Callable for Admin to send manual broadcast
export const sendBroadcastNotification = onCallGen2(
  async (data, context) => {
    if (
      !context.auth ||
      (context.auth.token.role !== USER_ROLES.ADMIN &&
        context.auth.token.role !== USER_ROLES.SUPERVISOR)
    ) {
      throw new HttpsError(
        "permission-denied",
        "Only admins or supervisors can send broadcasts.",
      );
    }

    const { targetAudience, titleAr, titleEn, bodyAr, bodyEn, payload } =
      data || {};

    if (!titleAr || !titleEn || !bodyAr || !bodyEn) {
      throw new HttpsError(
        "invalid-argument",
        "Missing title or body.",
      );
    }

    let usersQuery: admin.firestore.Query = db
      .collection("users")
      .where("isActive", "==", true);

    if (targetAudience === "REPRESENTATIVES") {
      usersQuery = usersQuery.where("role", "==", USER_ROLES.REP);
    } else if (targetAudience === "SUPERVISORS") {
      usersQuery = usersQuery.where("role", "==", USER_ROLES.SUPERVISOR);
    }

    const usersSnap = await usersQuery.get();
    const promises: Promise<void>[] = [];

    usersSnap.docs.forEach((doc) => {
      promises.push(
        sendNotificationInternal(
          doc.id,
          titleAr,
          titleEn,
          bodyAr,
          bodyEn,
          payload,
        ),
      );
    });

    await Promise.allSettled(promises);

    return { success: true, count: usersSnap.size };
  },
);
