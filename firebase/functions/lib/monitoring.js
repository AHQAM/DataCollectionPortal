"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = void 0;
const db_1 = require("./config/db");
const gen2_1 = require("./config/gen2");
const roles_1 = require("./roles");
exports.getSystemHealth = (0, gen2_1.onCallGen2)(async (data, context) => {
    if (!context.auth ||
        (context.auth.token.role !== roles_1.USER_ROLES.ADMIN &&
            context.auth.token.role !== roles_1.USER_ROLES.SUPERVISOR)) {
        throw new gen2_1.HttpsError("permission-denied", "Only admins or supervisors can check system health.");
    }
    try {
        const usersSnap = await db_1.db.collection("users").count().get();
        const requestsSnap = await db_1.db.collection("requests").count().get();
        const assignmentsSnap = await db_1.db.collection("assignments").count().get();
        const recordsSnap = await db_1.db.collection("records").count().get();
        const responsesSnap = await db_1.db.collection("responses").count().get();
        // Check pending operations
        const offlineQueueSnap = await db_1.db
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
    }
    catch (error) {
        console.error("Health check failed", error);
        return {
            status: "DEGRADED",
            error: error.message || "Unknown error",
            timestamp: new Date().toISOString(),
        };
    }
});
//# sourceMappingURL=monitoring.js.map