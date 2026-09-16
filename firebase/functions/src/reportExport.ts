import { getFirestore } from 'firebase-admin/firestore';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = getFirestore('datacollectionportal');

export const exportReport = functions.https.onCall(async (data, context) => {
  if (!context.auth || (context.auth.token.role !== "admin" && context.auth.token.role !== "supervisor")) {
    throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can export reports.");
  }

  const { requestId, branchId, status } = data;

  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing requestId.");
  }

  let recordsQuery: admin.firestore.Query = db.collection("records").where("requestId", "==", requestId);
  if (branchId && branchId !== "ALL") {
    recordsQuery = recordsQuery.where("branchId", "==", branchId);
  }
  if (status && status !== "ALL") {
    recordsQuery = recordsQuery.where("recordStatus", "==", status);
  }

  const recordsSnap = await recordsQuery.get();
  const records = recordsSnap.docs.map(d => d.data());

  // Fetch responses
  const responsesSnap = await db.collection("responses").get();
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
      Object.keys(resp).forEach(k => dynamicKeys.add(k));
    }
  });
  
  const dynamicHeaders = Array.from(dynamicKeys);
  const allHeaders = [...baseHeaders, ...dynamicHeaders];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((rec) => {
    const resp = responsesMap[rec.recordId] || {};
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
  await db.collection("audit_logs").add({
    logId: 'AUDIT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    action: 'REPORT_EXPORTED',
    module: 'Reports',
    targetId: requestId,
    timestamp: new Date().toISOString(),
    userId: context.auth.uid,
    details: {
      exportedRecordsCount: records.length,
      branchFilter: branchId,
      statusFilter: status
    }
  });

  return { success: true, count: records.length, csvString };
});
