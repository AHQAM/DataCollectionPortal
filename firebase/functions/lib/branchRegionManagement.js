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
exports.importBranchesAndRegions = exports.deleteRegion = exports.updateRegion = exports.createRegion = exports.deleteBranch = exports.updateBranch = exports.createBranch = void 0;
const db_1 = require("./config/db");
const admin = __importStar(require("firebase-admin"));
const gen2_1 = require("./config/gen2");
const auditLogger_1 = require("./auditLogger");
const roles_1 = require("./roles");
const db = () => db_1.db;
const checkAdmin = (context) => {
    if (!context.auth || context.auth.token.role !== roles_1.USER_ROLES.ADMIN) {
        throw new gen2_1.HttpsError("permission-denied", "صلاحية المسؤول مطلوبة. | Admin permission required.");
    }
};
/**
 * createBranch
 */
exports.createBranch = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { branchId, branchNameAr, branchNameEn } = data || {};
    if (!branchId || !branchNameAr) {
        throw new gen2_1.HttpsError("invalid-argument", "Missing required branch fields.");
    }
    const cleanId = String(branchId).toUpperCase().trim();
    const branchRef = db().collection("branches").doc(cleanId);
    const existing = await branchRef.get();
    if (existing.exists) {
        throw new gen2_1.HttpsError("already-exists", "Branch ID already exists.");
    }
    const now = admin.firestore.FieldValue.serverTimestamp();
    await branchRef.set({
        branchId: cleanId,
        branchNameAr: String(branchNameAr).trim(),
        branchNameEn: String(branchNameEn || branchNameAr).trim(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
    });
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "BRANCH_CREATED",
        entityType: "BRANCH",
        entityId: cleanId,
        details: { name: branchNameAr },
    });
    return { success: true, branchId: cleanId };
});
/**
 * updateBranch
 */
exports.updateBranch = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { branchId, updates } = data || {};
    if (!branchId || !updates || typeof updates !== "object") {
        throw new gen2_1.HttpsError("invalid-argument", "Missing required branch update fields.");
    }
    const branchRef = db().collection("branches").doc(branchId);
    const existing = await branchRef.get();
    if (!existing.exists) {
        throw new gen2_1.HttpsError("not-found", "Branch not found.");
    }
    const payload = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (updates.branchNameAr !== undefined)
        payload.branchNameAr = String(updates.branchNameAr).trim();
    if (updates.branchNameEn !== undefined)
        payload.branchNameEn = String(updates.branchNameEn).trim();
    if (updates.isActive !== undefined)
        payload.isActive = Boolean(updates.isActive);
    await branchRef.update(payload);
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "BRANCH_UPDATED",
        entityType: "BRANCH",
        entityId: branchId,
        details: updates,
    });
    return { success: true };
});
/**
 * deleteBranch - Enforces relational integrity
 */
exports.deleteBranch = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { branchId } = data || {};
    if (!branchId) {
        throw new gen2_1.HttpsError("invalid-argument", "Branch ID required.");
    }
    // 1. Check for associated regions
    const regionsSnap = await db()
        .collection("regions")
        .where("branchId", "==", branchId)
        .limit(1)
        .get();
    if (!regionsSnap.empty) {
        throw new gen2_1.HttpsError("failed-precondition", "لا يمكن حذف الفرع لأنه مرتبط بمناطق حالية. | Cannot delete branch linked to existing regions.");
    }
    // 2. Check for associated users
    const usersSnap = await db()
        .collection("users")
        .where("branchId", "==", branchId)
        .limit(1)
        .get();
    if (!usersSnap.empty) {
        throw new gen2_1.HttpsError("failed-precondition", "لا يمكن حذف الفرع لأنه مسند لمستخدمين. | Cannot delete branch assigned to users.");
    }
    // Soft delete (deactivate) or delete
    await db().collection("branches").doc(branchId).update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "BRANCH_DELETED",
        entityType: "BRANCH",
        entityId: branchId,
        details: {},
    });
    return { success: true };
});
/**
 * createRegion
 */
exports.createRegion = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { regionNo, regionNameAr, regionNameEn, branchId } = data || {};
    if (!regionNo || !regionNameAr || !branchId) {
        throw new gen2_1.HttpsError("invalid-argument", "Missing required region fields.");
    }
    const cleanNo = String(regionNo).trim();
    const regionRef = db().collection("regions").doc(cleanNo);
    const existing = await regionRef.get();
    if (existing.exists) {
        throw new gen2_1.HttpsError("already-exists", "Region number already exists.");
    }
    const now = admin.firestore.FieldValue.serverTimestamp();
    await regionRef.set({
        regionId: cleanNo,
        regionNo: cleanNo,
        regionNameAr: String(regionNameAr).trim(),
        regionNameEn: String(regionNameEn || regionNameAr).trim(),
        branchId: String(branchId).trim(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
    });
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "REGION_CREATED",
        entityType: "REGION",
        entityId: cleanNo,
        details: { name: regionNameAr, branchId },
    });
    return { success: true, regionNo: cleanNo };
});
/**
 * updateRegion
 */
exports.updateRegion = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { regionNo, updates } = data || {};
    if (!regionNo || !updates || typeof updates !== "object") {
        throw new gen2_1.HttpsError("invalid-argument", "Missing required region update fields.");
    }
    const regionRef = db().collection("regions").doc(regionNo);
    const existing = await regionRef.get();
    if (!existing.exists) {
        throw new gen2_1.HttpsError("not-found", "Region not found.");
    }
    const payload = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (updates.regionNameAr !== undefined)
        payload.regionNameAr = String(updates.regionNameAr).trim();
    if (updates.regionNameEn !== undefined)
        payload.regionNameEn = String(updates.regionNameEn).trim();
    if (updates.branchId !== undefined)
        payload.branchId = String(updates.branchId).trim();
    if (updates.isActive !== undefined)
        payload.isActive = Boolean(updates.isActive);
    await regionRef.update(payload);
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "REGION_UPDATED",
        entityType: "REGION",
        entityId: regionNo,
        details: updates,
    });
    return { success: true };
});
/**
 * deleteRegion - Enforces relational integrity
 */
exports.deleteRegion = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { regionNo } = data || {};
    if (!regionNo) {
        throw new gen2_1.HttpsError("invalid-argument", "Region number required.");
    }
    // Check users assigned to this region
    const usersSnap = await db()
        .collection("users")
        .where("regionNo", "==", regionNo)
        .limit(1)
        .get();
    if (!usersSnap.empty) {
        throw new gen2_1.HttpsError("failed-precondition", "لا يمكن حذف المنطقة لأنها مسندة لمندوبين. | Cannot delete region assigned to reps.");
    }
    // Check assignments
    const asgSnap = await db()
        .collection("assignments")
        .where("regionNo", "==", regionNo)
        .limit(1)
        .get();
    if (!asgSnap.empty) {
        throw new gen2_1.HttpsError("failed-precondition", "لا يمكن حذف المنطقة لوجود إسنادات نشطة عليها. | Cannot delete region with active assignments.");
    }
    await db().collection("regions").doc(regionNo).update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "REGION_DELETED",
        entityType: "REGION",
        entityId: regionNo,
        details: {},
    });
    return { success: true };
});
/**
 * importBranchesAndRegions
 */
exports.importBranchesAndRegions = (0, gen2_1.onCallGen2)(async (data, context) => {
    checkAdmin(context);
    const { branches = [], regions = [] } = data || {};
    if (!Array.isArray(branches) || !Array.isArray(regions)) {
        throw new gen2_1.HttpsError("invalid-argument", "Invalid payload arrays.");
    }
    const batch = db().batch();
    const now = admin.firestore.FieldValue.serverTimestamp();
    for (const b of branches) {
        if (!b.branchId)
            continue;
        const ref = db()
            .collection("branches")
            .doc(String(b.branchId).toUpperCase().trim());
        batch.set(ref, {
            branchId: String(b.branchId).toUpperCase().trim(),
            branchNameAr: String(b.branchNameAr || "").trim(),
            branchNameEn: String(b.branchNameEn || b.branchNameAr || "").trim(),
            isActive: b.isActive !== false,
            createdAt: now,
            updatedAt: now,
        }, { merge: true });
    }
    for (const r of regions) {
        if (!r.regionNo)
            continue;
        const ref = db().collection("regions").doc(String(r.regionNo).trim());
        batch.set(ref, {
            regionId: String(r.regionNo).trim(),
            regionNo: String(r.regionNo).trim(),
            regionNameAr: String(r.regionNameAr || "").trim(),
            regionNameEn: String(r.regionNameEn || r.regionNameAr || "").trim(),
            branchId: String(r.branchId || "").trim(),
            isActive: r.isActive !== false,
            createdAt: now,
            updatedAt: now,
        }, { merge: true });
    }
    await batch.commit();
    await (0, auditLogger_1.logAuditSafe)({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "BRANCHES_REGIONS_IMPORTED",
        entityType: "SYSTEM",
        entityId: "IMPORT",
        details: { branchesCount: branches.length, regionsCount: regions.length },
    });
    return {
        success: true,
        branchesCount: branches.length,
        regionsCount: regions.length,
    };
});
//# sourceMappingURL=branchRegionManagement.js.map