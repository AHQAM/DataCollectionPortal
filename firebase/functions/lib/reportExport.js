"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = void 0;
const db_1 = require("./config/db");
const gen2_1 = require("./config/gen2");
const roles_1 = require("./roles");
const auditLogger_1 = require("./auditLogger");
exports.exportReport = (0, gen2_1.onCallGen2)(async (data, context) => {
    if (!context.auth ||
        (context.auth.token.role !== roles_1.USER_ROLES.ADMIN &&
            context.auth.token.role !== roles_1.USER_ROLES.SUPERVISOR)) {
        throw new gen2_1.HttpsError("permission-denied", "Only admins or supervisors can export reports.");
    }
    const callerRole = context.auth.token.role;
    const callerBranchId = context.auth.token.branchId;
    const { requestId, branchId, status } = data || {};
    if (callerRole === roles_1.USER_ROLES.SUPERVISOR &&
        branchId &&
        branchId !== "ALL" &&
        branchId !== callerBranchId) {
        throw new gen2_1.HttpsError("permission-denied", "Branch is outside your scope.");
    }
    if (!requestId) {
        throw new gen2_1.HttpsError("invalid-argument", "Missing requestId.");
    }
    let recordsQuery = db_1.db
        .collection("records")
        .where("requestId", "==", requestId);
    if (branchId && branchId !== "ALL") {
        recordsQuery = recordsQuery.where("branchId", "==", branchId);
    }
    else if (callerRole === roles_1.USER_ROLES.SUPERVISOR) {
        recordsQuery = recordsQuery.where("branchId", "==", callerBranchId);
    }
    if (status && status !== "ALL") {
        recordsQuery = recordsQuery.where("recordStatus", "==", status);
    }
    const recordsSnap = await recordsQuery.limit(5000).get();
    const records = recordsSnap.docs.map((d) => d.data());
    // Fetch responses
    const responsesSnap = await db_1.db
        .collection("responses")
        .where("requestId", "==", requestId)
        .limit(5000)
        .get();
    const responsesMap = {};
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
    const dynamicKeys = new Set();
    records.forEach((rec) => {
        const resp = responsesMap[rec.recordId];
        if (resp) {
            Object.keys(resp.data || resp).forEach((k) => dynamicKeys.add(k));
        }
    });
    const dynamicHeaders = Array.from(dynamicKeys);
    const allHeaders = [...baseHeaders, ...dynamicHeaders];
    const escapeCsv = (val) => {
        if (val === null || val === undefined)
            return '""';
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
        const dynamicCols = dynamicHeaders.map((k) => resp[k] !== undefined ? resp[k] : "");
        return [...baseCols, ...dynamicCols].map(escapeCsv).join(",");
    });
    const csvString = [allHeaders.map(escapeCsv).join(","), ...rows].join("\n");
    // Audit
    await (0, auditLogger_1.logAuditSafe)({
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
//# sourceMappingURL=reportExport.js.map