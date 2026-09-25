import { db } from "./config/db";
import { onCallGen2, HttpsError } from "./config/gen2";

/**
 * externalIntegrationAdapter
 *
 * This module serves as the foundational extension point for integrating
 * the Sales Collection Hub with external systems such as SAP, ERP, SQL Server,
 * or Power BI.
 *
 * NOTE: As per the initial project requirements, active integrations are NOT
 * implemented yet. This file provides the structural hook (adapter pattern)
 * so that future developers can inject specific business logic here without
 * affecting the core application.
 */

// Example Callable Function: Export specific Request data to an external API
export const exportDataToExternalSystem = onCallGen2(async (data, context) => {
  // 1. Verify Authentication & Authorization
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  const claims = context.auth.token;
  if (claims.role !== "Admin") {
    throw new HttpsError(
      "permission-denied",
      "Only Admins can export data to external systems.",
    );
  }

  const { requestId, targetSystem } = data || {};
  if (!requestId || !targetSystem) {
    throw new HttpsError(
      "invalid-argument",
      "requestId and targetSystem are required.",
    );
  }

  // 2. Fetch the Data to be exported
  const requestDoc = await db.collection("requests").doc(requestId).get();

  if (!requestDoc.exists) {
    throw new HttpsError("not-found", "Request not found.");
  }

  // const requestData = requestDoc.data();
  // const responsesSnapshot = await db.collection("responses").where("requestId", "==", requestId).get();
  // const responses = responsesSnapshot.docs.map(doc => doc.data());

  // 3. TODO: Format data according to the targetSystem (e.g., XML for SAP, JSON for PowerBI webhook)
  // ...

  // 4. TODO: Transmit the data using HTTP/Axios or a specialized client
  // ...

  // Return a success message or job ID
  return {
    success: true,
    message: `Stub: Export process initiated for request ${requestId} to ${targetSystem}.`,
    timestamp: new Date().toISOString(),
  };
});
