import { db } from "./config/db";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { USER_ROLES } from "./roles";

export const getSystemHealth = functions.https.onCall(async (data, context) => {
  if (
    !context.auth ||
    (context.auth.token.role !== USER_ROLES.ADMIN &&
      context.auth.token.role !== USER_ROLES.SUPERVISOR)
  ) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins or supervisors can check system health.",
    );
  }

  try {
    const usersSnap = await db.collection("users").count().get();
    const requestsSnap = await db.collection("requests").count().get();
    const assignmentsSnap = await db.collection("assignments").count().get();
    const recordsSnap = await db.collection("records").count().get();
    const responsesSnap = await db.collection("responses").count().get();

    // Check pending operations
    const offlineQueueSnap = await db
      .collection("offline_sync_queue")
      .where("status", "==", "PENDING")
      .count()
      .get();

    return {
      status: "HEALTHY",
      metrics: {
        usersCount: usersSnap.data().count,
        requestsCount: requestsSnap.data().count,
        assignmentsCount: assignmentsSnap.data().count,
        recordsCount: recordsSnap.data().count,
        responsesCount: responsesSnap.data().count,
        pendingSyncItems: offlineQueueSnap.data().count,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Health check failed", error);
    return {
      status: "DEGRADED",
      error: error.message || "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});
