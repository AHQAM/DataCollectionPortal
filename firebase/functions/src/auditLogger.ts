import { db } from "./config/db";
import * as admin from "firebase-admin";

/**
 * Centralized audit logging utility.
 * Creates immutable audit records with server-generated timestamps.
 *
 * SECURITY: Never log passwords, password hashes, tokens, or sensitive secrets.
 */
export interface AuditLogEntry {
  userId: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  requestId?: string;
  recordId?: string;
  details?: Record<string, any>;
  sessionIdentifier?: string;
  deviceBindingId?: string;
}

/**
 * Creates an immutable audit log entry with server timestamp.
 * This function is fire-and-forget — errors are logged but don't propagate.
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<string> {
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
export async function logAuditSafe(entry: AuditLogEntry): Promise<void> {
  try {
    await createAuditLog(entry);
  } catch (error) {
    console.error("Audit log failed (non-blocking):", error);
  }
}

/**
 * Strips sensitive fields from audit log details.
 */
function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  const SENSITIVE_KEYS = [
    "password", "passwordHash", "newPassword", "oldPassword",
    "token", "customToken", "refreshToken", "fcmToken",
    "secret", "apiKey", "installationDeviceId",
  ];

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(details)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeDetails(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
