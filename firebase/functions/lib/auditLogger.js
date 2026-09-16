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
exports.createAuditLog = createAuditLog;
exports.logAuditSafe = logAuditSafe;
const firestore_1 = require("firebase-admin/firestore");
const admin = __importStar(require("firebase-admin"));
/**
 * Creates an immutable audit log entry with server timestamp.
 * This function is fire-and-forget — errors are logged but don't propagate.
 */
async function createAuditLog(entry) {
    const db = (0, firestore_1.getFirestore)('datacollectionportal');
    // Sanitize details — strip any sensitive fields that may have leaked
    const sanitizedDetails = entry.details ? sanitizeDetails(entry.details) : undefined;
    const logRef = db.collection("auditLogs").doc();
    await logRef.set({
        logId: logRef.id,
        userId: entry.userId,
        userRole: entry.userRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        requestId: entry.requestId || null,
        recordId: entry.recordId || null,
        detailsJson: sanitizedDetails ? JSON.stringify(sanitizedDetails) : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        sessionIdentifier: entry.sessionIdentifier || null,
        deviceBindingId: entry.deviceBindingId || null,
    });
    return logRef.id;
}
/**
 * Fire-and-forget audit log — won't throw on error.
 */
async function logAuditSafe(entry) {
    try {
        await createAuditLog(entry);
    }
    catch (error) {
        console.error("Audit log failed (non-blocking):", error);
    }
}
/**
 * Strips sensitive fields from audit log details.
 */
function sanitizeDetails(details) {
    const SENSITIVE_KEYS = [
        "password", "passwordHash", "newPassword", "oldPassword",
        "token", "customToken", "refreshToken", "fcmToken",
        "secret", "apiKey", "installationDeviceId",
    ];
    const sanitized = {};
    for (const [key, value] of Object.entries(details)) {
        if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
            sanitized[key] = "[REDACTED]";
        }
        else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeDetails(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
//# sourceMappingURL=auditLogger.js.map