import { db } from "./config/db";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAuditSafe } from "./auditLogger";
import { USER_ROLES } from "./roles";

/**
 * Cloud Function: wipeDemoData
 *
 * Super-Admin only: Wipes demo/test responses and resets records/assignments.
 * Requires strict confirmation token: 'CONFIRM_WIPE_DEMO_DATA'
 */
export const wipeDemoData = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || context.auth.token.role !== USER_ROLES.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "صلاحية المسؤول مطلوبة. | Admin permission required."
      );
    }

    const { confirmationToken, wipeBranchesAndRegions } = data || {};

    if (confirmationToken !== 'CONFIRM_WIPE_DEMO_DATA') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "رمز التأكيد غير صحيح. | Invalid confirmation token."
      );
    }

    try {
      // 1. Delete all responses
      const responsesSnap = await db.collection("responses").get();
      if (!responsesSnap.empty) {
        const batch1 = db.batch();
        responsesSnap.docs.forEach((doc) => batch1.delete(doc.ref));
        await batch1.commit();
      }

      // 2. Reset records to Pending
      const recordsSnap = await db.collection("records").get();
      if (!recordsSnap.empty) {
        const batch2 = db.batch();
        recordsSnap.docs.forEach((doc) => {
          batch2.update(doc.ref, {
            recordStatus: "Pending",
            completionPercent: 0,
            submittedAt: null,
            completedAt: null,
            draftSavedAt: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch2.commit();
      }

      // 3. Reset assignments progress
      const assignmentsSnap = await db.collection("assignments").get();
      if (!assignmentsSnap.empty) {
        const batch3 = db.batch();
        assignmentsSnap.docs.forEach((doc) => {
          const total = doc.data().totalRecords || 0;
          batch3.update(doc.ref, {
            completedRecords: 0,
            pendingRecords: total,
            progressPercent: 0,
            completedAt: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch3.commit();
      }

      // 4. Optionally wipe branches and regions if explicitly asked
      if (wipeBranchesAndRegions) {
        const branchesSnap = await db.collection("branches").get();
        if (!branchesSnap.empty) {
          const bBatch = db.batch();
          branchesSnap.docs.forEach((doc) => bBatch.delete(doc.ref));
          await bBatch.commit();
        }

        const regionsSnap = await db.collection("regions").get();
        if (!regionsSnap.empty) {
          const rBatch = db.batch();
          regionsSnap.docs.forEach((doc) => rBatch.delete(doc.ref));
          await rBatch.commit();
        }
      }

      await logAuditSafe({
        userId: context.auth.uid,
        userRole: "ADMIN",
        action: "SYSTEM_WIPE_COMPLETED",
        entityType: "SYSTEM",
        entityId: "DEMO_WIPE",
        details: { wipeBranchesAndRegions: !!wipeBranchesAndRegions },
      });

      return {
        success: true,
        messageAr: "تم تفريغ البيانات التجريبية وإعادة تهيئة السجلات بنجاح.",
        messageEn: "Demo data wiped and records reset successfully.",
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error("Wipe demo data error:", error);
      throw new functions.https.HttpsError("internal", "Internal server error.");
    }
  }
);
