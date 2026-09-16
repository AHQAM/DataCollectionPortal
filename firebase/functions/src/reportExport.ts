import { getFirestore } from 'firebase-admin/firestore';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { USER_ROLES } from "./roles";
import { logAuditSafe } from "./auditLogger";

const db = getFirestore('datacollectionportal');

export const exportReport = functions.https.onCall(async (data, context) => {
  if (!context.auth || (context.auth.token.role !== USER_ROLES.ADMIN && context.auth.token.role !== USER_ROLES.SUPERVISOR)) {
    throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can export reports.");
  }

  const callerRole = context.auth.token.role;
  const callerBranchId = context.auth.token.branchId;
  const { requestId, branchId, status } = data;
  if (
    callerRole === USER_ROLES.SUPERVISOR &&
    branchId &&
    branchId !== "ALL" &&
    branchId !== callerBranchId
  ) {
    throw new functions.https.HttpsError("permission-denied", "Branch is outside your scope.");
  }

  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing requestId.");
  }

  let recordsQuery: admin.firestore.Query = db.collection("records").where("requestId", "==", requestId);
  if (branchId && branchId !== "ALL") {
    recordsQuery = recordsQuery.where("branchId", "==", branchId);
  } else if (callerRole === USER_ROLES.SUPERVISOR) {
    recordsQuery = recordsQuery.where("branchId", "==", callerBranchId);
  }
  if (status && status !== "ALL") {
    recordsQuery = recordsQuery.where("recordStatus", "==", status);
  }

  const recordsSnap = await recordsQuery.limit(5000).get();
  const records = recordsSnap.docs.map(d => d.data());

  // Fetch responses
  const responsesSnap = await db
    .collection("responses")
    .where("requestId", "==", requestId)
    .limit(5000)
    .get();
  const responsesMap: Record<string, any> = {};
  responsesSnap.docs.forEach((doc) => {
    responsesMap[doc.id] = doc.data();
  });

  // Construct CSV
  if (records.length === 0) {
    return { success: true, csvString: "" };
  }

  const baseHeaders = ["Record ID", "Status", "Customer No", "Customer Name", "Region No", "Branch", "Rep No", "Rep Name"];
  
  // Find all dynamic keys from responses
  const dynamicKeys = new Set<string>();
  records.forEach((rec) => {
    const resp = responsesMap[rec.recordId];
    if (resp) {
      Object.keys(resp.data || resp).forEach(k => dynamicKeys.add(k));
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
      rec.customerNo,
      rec.customerName,
      rec.regionNo,
      rec.branchName,
      rec.repNo,
      rec.repName
    ];
    
    const dynamicCols = dynamicHeaders.map(k => resp[k] !== undefined ? resp[k] : "");
    return [...baseCols, ...dynamicCols].map(escapeCsv).join(",");
  });

  const csvString = [allHeaders.map(escapeCsv).join(","), ...rows].join("\n");

  // Audit
  await logAuditSafe({
    userId: context.auth.uid,
    userRole: callerRole,
    action: 'REPORT_EXPORTED',
    entityType: 'REPORT',
    entityId: requestId,
    details: {
      exportedRecordsCount: records.length,
      branchFilter: branchId,
      statusFilter: status
    }
  });

  return { success: true, count: records.length, csvString };
});
