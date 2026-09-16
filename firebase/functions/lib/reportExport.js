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
exports.exportReport = void 0;
const firestore_1 = require("firebase-admin/firestore");
const functions = __importStar(require("firebase-functions"));
const roles_1 = require("./roles");
const auditLogger_1 = require("./auditLogger");
const db = (0, firestore_1.getFirestore)('datacollectionportal');
exports.exportReport = functions.https.onCall(async (data, context) => {
    if (!context.auth || (context.auth.token.role !== roles_1.USER_ROLES.ADMIN && context.auth.token.role !== roles_1.USER_ROLES.SUPERVISOR)) {
        throw new functions.https.HttpsError("permission-denied", "Only admins or supervisors can export reports.");
    }
    const callerRole = context.auth.token.role;
    const callerBranchId = context.auth.token.branchId;
    const { requestId, branchId, status } = data;
    if (callerRole === roles_1.USER_ROLES.SUPERVISOR &&
        branchId &&
        branchId !== "ALL" &&
        branchId !== callerBranchId) {
        throw new functions.https.HttpsError("permission-denied", "Branch is outside your scope.");
    }
    if (!requestId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing requestId.");
    }
    let recordsQuery = db.collection("records").where("requestId", "==", requestId);
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
    const records = recordsSnap.docs.map(d => d.data());
    // Fetch responses
    const responsesSnap = await db
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
    const baseHeaders = ["Record ID", "Status", "Customer No", "Customer Name", "Region No", "Branch", "Rep No", "Rep Name"];
    // Find all dynamic keys from responses
    const dynamicKeys = new Set();
    records.forEach((rec) => {
        const resp = responsesMap[rec.recordId];
        if (resp) {
            Object.keys(resp.data || resp).forEach(k => dynamicKeys.add(k));
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
    await (0, auditLogger_1.logAuditSafe)({
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
//# sourceMappingURL=reportExport.js.map