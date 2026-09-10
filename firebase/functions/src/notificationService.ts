import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Internal helper for pushing FCM notifications and saving to Firestore
export const sendNotificationInternal = async (
  userId: string,
  titleAr: string,
  titleEn: string,
  bodyAr: string,
  bodyEn: string,
  data?: Record<string, string>
) => {
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
    if (userData && userData.fcmTokens && Array.isArray(userData.fcmTokens) && userData.fcmTokens.length > 0) {
      const messages = userData.fcmTokens.map((token: string) => ({
        notification: {
          title: titleAr, // Defaulting to Arabic for push, but could be localized per user preference
          body: bodyAr,
        },
        data: data || {},
        token: token,
      }));

      try {
        await admin.messaging().sendEach(messages);
      } catch (err) {
        console.error(`Failed to send FCM to user ${userId}`, err);
      }
    }
  }
};

// Callable for Admin to send manual broadcast
export const sendBroadcastNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth || (context.auth.token.role !== "admin" && context.auth.token.role !== "supervisor")) {
    throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can send broadcasts.");
  }

  const { targetAudience, titleAr, titleEn, bodyAr, bodyEn, payload } = data;
  
  if (!titleAr || !titleEn || !bodyAr || !bodyEn) {
    throw new functions.https.HttpsError("invalid-argument", "Missing title or body.");
  }

  let usersQuery: admin.firestore.Query = db.collection("users").where("isActive", "==", true);
  
  if (targetAudience === "REPRESENTATIVES") {
    usersQuery = usersQuery.where("role", "==", "representative");
  } else if (targetAudience === "SUPERVISORS") {
    usersQuery = usersQuery.where("role", "==", "supervisor");
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
        payload
      )
    );
  });

  await Promise.all(promises);

  return { success: true, count: usersSnap.size };
});
