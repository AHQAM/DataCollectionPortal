import { db as firestoreDb } from "./config/db";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAuditSafe } from "./auditLogger";
import { USER_ROLES } from "./roles";

const db = () => firestoreDb;

const checkAdmin = (context: functions.https.CallableContext) => {
  if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "صلاحية المسؤول مطلوبة. | Admin permission required."
    );
  }
};

/**
 * createBranch
 */
export const createBranch = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { branchId, branchNameAr, branchNameEn } = data || {};

  if (!branchId || !branchNameAr) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required branch fields.");
  }

  const cleanId = String(branchId).toUpperCase().trim();
  const branchRef = db().collection("branches").doc(cleanId);
  const existing = await branchRef.get();

  if (existing.exists) {
    throw new functions.https.HttpsError("already-exists", "Branch ID already exists.");
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

  await logAuditSafe({
    userId: context.auth!.uid,
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
export const updateBranch = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { branchId, updates } = data || {};

  if (!branchId || !updates || typeof updates !== "object") {
    throw new functions.https.HttpsError("invalid-argument", "Missing required branch update fields.");
  }

  const branchRef = db().collection("branches").doc(branchId);
  const existing = await branchRef.get();
  if (!existing.exists) {
    throw new functions.https.HttpsError("not-found", "Branch not found.");
  }

  const payload: Record<string, any> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (updates.branchNameAr !== undefined) payload.branchNameAr = String(updates.branchNameAr).trim();
  if (updates.branchNameEn !== undefined) payload.branchNameEn = String(updates.branchNameEn).trim();
  if (updates.isActive !== undefined) payload.isActive = Boolean(updates.isActive);

  await branchRef.update(payload);

  await logAuditSafe({
    userId: context.auth!.uid,
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
export const deleteBranch = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { branchId } = data || {};

  if (!branchId) {
    throw new functions.https.HttpsError("invalid-argument", "Branch ID required.");
  }

  // 1. Check for associated regions
  const regionsSnap = await db().collection("regions").where("branchId", "==", branchId).limit(1).get();
  if (!regionsSnap.empty) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "لا يمكن حذف الفرع لأنه مرتبط بمناطق حالية. | Cannot delete branch linked to existing regions."
    );
  }

  // 2. Check for associated users
  const usersSnap = await db().collection("users").where("branchId", "==", branchId).limit(1).get();
  if (!usersSnap.empty) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "لا يمكن حذف الفرع لأنه مسند لمستخدمين. | Cannot delete branch assigned to users."
    );
  }

  // Soft delete (deactivate) or delete
  await db().collection("branches").doc(branchId).update({
    isActive: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logAuditSafe({
    userId: context.auth!.uid,
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
export const createRegion = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { regionNo, regionNameAr, regionNameEn, branchId } = data || {};

  if (!regionNo || !regionNameAr || !branchId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required region fields.");
  }

  const cleanNo = String(regionNo).trim();
  const regionRef = db().collection("regions").doc(cleanNo);
  const existing = await regionRef.get();

  if (existing.exists) {
    throw new functions.https.HttpsError("already-exists", "Region number already exists.");
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

  await logAuditSafe({
    userId: context.auth!.uid,
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
export const updateRegion = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { regionNo, updates } = data || {};

  if (!regionNo || !updates || typeof updates !== "object") {
    throw new functions.https.HttpsError("invalid-argument", "Missing required region update fields.");
  }

  const regionRef = db().collection("regions").doc(regionNo);
  const existing = await regionRef.get();
  if (!existing.exists) {
    throw new functions.https.HttpsError("not-found", "Region not found.");
  }

  const payload: Record<string, any> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (updates.regionNameAr !== undefined) payload.regionNameAr = String(updates.regionNameAr).trim();
  if (updates.regionNameEn !== undefined) payload.regionNameEn = String(updates.regionNameEn).trim();
  if (updates.branchId !== undefined) payload.branchId = String(updates.branchId).trim();
  if (updates.isActive !== undefined) payload.isActive = Boolean(updates.isActive);

  await regionRef.update(payload);

  await logAuditSafe({
    userId: context.auth!.uid,
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
export const deleteRegion = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { regionNo } = data || {};

  if (!regionNo) {
    throw new functions.https.HttpsError("invalid-argument", "Region number required.");
  }

  // Check users assigned to this region
  const usersSnap = await db().collection("users").where("regionNo", "==", regionNo).limit(1).get();
  if (!usersSnap.empty) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "لا يمكن حذف المنطقة لأنها مسندة لمندوبين. | Cannot delete region assigned to reps."
    );
  }

  // Check assignments
  const asgSnap = await db().collection("assignments").where("regionNo", "==", regionNo).limit(1).get();
  if (!asgSnap.empty) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "لا يمكن حذف المنطقة لوجود إسنادات نشطة عليها. | Cannot delete region with active assignments."
    );
  }

  await db().collection("regions").doc(regionNo).update({
    isActive: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logAuditSafe({
    userId: context.auth!.uid,
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
export const importBranchesAndRegions = functions.https.onCall(async (data, context) => {
  checkAdmin(context);
  const { branches = [], regions = [] } = data || {};

  if (!Array.isArray(branches) || !Array.isArray(regions)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid payload arrays.");
  }

  const batch = db().batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const b of branches) {
    if (!b.branchId) continue;
    const ref = db().collection("branches").doc(String(b.branchId).toUpperCase().trim());
    batch.set(
      ref,
      {
        branchId: String(b.branchId).toUpperCase().trim(),
        branchNameAr: String(b.branchNameAr || '').trim(),
        branchNameEn: String(b.branchNameEn || b.branchNameAr || '').trim(),
        isActive: b.isActive !== false,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  for (const r of regions) {
    if (!r.regionNo) continue;
    const ref = db().collection("regions").doc(String(r.regionNo).trim());
    batch.set(
      ref,
      {
        regionId: String(r.regionNo).trim(),
        regionNo: String(r.regionNo).trim(),
        regionNameAr: String(r.regionNameAr || '').trim(),
        regionNameEn: String(r.regionNameEn || r.regionNameAr || '').trim(),
        branchId: String(r.branchId || '').trim(),
        isActive: r.isActive !== false,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();

  await logAuditSafe({
    userId: context.auth!.uid,
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
