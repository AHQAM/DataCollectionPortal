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
exports.exportDataToExternalSystem = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
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
exports.exportDataToExternalSystem = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication & Authorization
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const claims = context.auth.token;
    if (claims.role !== "Admin") {
        throw new functions.https.HttpsError("permission-denied", "Only Admins can export data to external systems.");
    }
    const { requestId, targetSystem } = data;
    if (!requestId || !targetSystem) {
        throw new functions.https.HttpsError("invalid-argument", "requestId and targetSystem are required.");
    }
    // 2. Fetch the Data to be exported
    const db = (0, firestore_1.getFirestore)("datacollectionportal");
    const requestDoc = await db.collection("requests").doc(requestId).get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Request not found.");
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
        timestamp: new Date().toISOString()
    };
});
//# sourceMappingURL=externalIntegrationAdapter.js.map