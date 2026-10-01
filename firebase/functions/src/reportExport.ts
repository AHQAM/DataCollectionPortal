import { db } from "./config/db";
import * as admin from "firebase-admin";
import { onCallGen2, HttpsError } from "./config/gen2";
import { USER_ROLES } from "./roles";
import { logAuditSafe } from "./auditLogger";

const MAX_EXPORT_RECORDS = 5000;
const MAX_EXPORT_CSV_BYTES = 5 * 1024 * 1024;

export const exportReport = onCallGen2(async (data, context) => {
  if (
    !context.auth ||
    (context.auth.token.role !== USER_ROLES.ADMIN &&
      context.auth.token.role !== USER_ROLES.SUPERVISOR)
  ) {
    throw new HttpsError(
      "permission-denied",
      "Only admins or supervisors can export reports.",
    );
  }

  const callerRole = context.auth.token.role;
  const callerBranchId = context.auth.token.branchId;
  const { requestId, branchId, status } = data || {};
  if (
    typeof requestId !== "string" ||
    requestId.trim().length === 0 ||
    requestId.length > 128
  ) {
    throw new HttpsError("invalid-argument", "Invalid requestId.");
  }
  if (
    branchId !== undefined &&
    (typeof branchId !== "string" || branchId.length > 128)
  ) {
    throw new HttpsError("invalid-argument", "Invalid branchId.");
  }
  if (
    status !== undefined &&
    (typeof status !== "string" || status.length > 64)
  ) {
    throw new HttpsError("invalid-argument", "Invalid status.");
  }
  if (
    callerRole === USER_ROLES.SUPERVISOR &&
    branchId &&
    branchId !== "ALL" &&
    branchId !== callerBranchId
  ) {
    throw new HttpsError("permission-denied", "Branch is outside your scope.");
  }

  let recordsQuery: admin.firestore.Query = db
    .collection("records")
    .where("requestId", "==", requestId);
  if (branchId && branchId !== "ALL") {
    recordsQuery = recordsQuery.where("branchId", "==", branchId);
  } else if (callerRole === USER_ROLES.SUPERVISOR) {
    recordsQuery = recordsQuery.where("branchId", "==", callerBranchId);
  }
  if (status && status !== "ALL") {
    recordsQuery = recordsQuery.where("recordStatus", "==", status);
  }

  const recordsSnap = await recordsQuery.limit(MAX_EXPORT_RECORDS).get();
  const records = recordsSnap.docs.map((d) => d.data());

  // Fetch responses
  const responsesSnap = await db
    .collection("responses")
    .where("requestId", "==", requestId)
    .limit(MAX_EXPORT_RECORDS)
    .get();
  const responsesMap: Record<string, any> = {};
  responsesSnap.docs.forEach((doc) => {
    responsesMap[doc.id] = doc.data();
  });

  // Construct CSV
  if (records.length === 0) {
    return { success: true, csvString: "" };
  }

  const baseHeaders = [
    "Record ID",
    "Status",
    "Customer No",
    "Customer Name",
    "Region No",
    "Branch",
    "Rep No",
    "Rep Name",
  ];

  // Find all dynamic keys from responses
  const dynamicKeys = new Set<string>();
  records.forEach((rec) => {
    const resp = responsesMap[rec.recordId];
    if (resp) {
      Object.keys(resp.data || resp).forEach((k) => dynamicKeys.add(k));
    }
  });

  const dynamicHeaders = Array.from(dynamicKeys);
  const allHeaders = [...baseHeaders, ...dynamicHeaders];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const raw = String(val);
    const str = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = records.map((rec) => {
    const storedResponse = responsesMap[rec.recordId] || {};
    const resp = storedResponse.data || storedResponse;
    const baseCols = [
      rec.recordId,
      rec.recordStatus,
      rec.targetId,
      rec.targetName,
      rec.regionNo,
      rec.branchName,
      rec.userNo,
      rec.userName,
    ];

    const dynamicCols = dynamicHeaders.map((k) =>
      resp[k] !== undefined ? resp[k] : "",
    );
    return [...baseCols, ...dynamicCols].map(escapeCsv).join(",");
  });

  const csvString = [allHeaders.map(escapeCsv).join(","), ...rows].join("\n");
  if (Buffer.byteLength(csvString, "utf8") > MAX_EXPORT_CSV_BYTES) {
    throw new HttpsError(
      "resource-exhausted",
      "Report exceeds the maximum export size.",
    );
  }

  // Audit
  await logAuditSafe({
    userId: context.auth.uid,
    userRole: callerRole,
    action: "REPORT_EXPORTED",
    entityType: "REPORT",
    entityId: requestId,
    details: {
      exportedRecordsCount: records.length,
      branchFilter: branchId,
      statusFilter: status,
    },
  });

  return { success: true, count: records.length, csvString };
});
