import { useUIStore } from "../stores/uiStore";
import { useDataStore } from "../stores/dataStore";
import { recordApi } from "../services";
import { logAudit } from "../utils/audit";
import { enqueueOfflineRecord, flushOfflineQueue } from "../utils/offlineQueue";

export const useRecordOps = () => {
  return {
    saveDraftRecord: async (recordId: string, values: Record<string, any>) => {
      const isOnline = useUIStore.getState().isOnline;
      const { lang } = useUIStore.getState();
      const { records } = useDataStore.getState();
      const rec = records.find((r) => r.recordId === recordId);
      const reqId = rec?.requestId || "";

      if (!isOnline) {
        try {
          await enqueueOfflineRecord({
            recordId,
            requestId: reqId,
            activityId: rec?.activityId || reqId,
            values,
            isDraft: true,
          });
          return {
            success: true,
            isOffline: true,
            message:
              lang === "ar"
                ? "تم حفظ المسودة محلياً. ستتم المزامنة تلقائياً عند عودة الاتصال."
                : "Draft saved offline. Will sync automatically when online.",
          };
        } catch (queueErr) {
          return { success: false, error: queueErr };
        }
      }

      try {
        const clientUpdatedAt = new Date().toISOString();
        const res = await recordApi.saveDraftRecord(
          reqId,
          recordId,
          values,
          rec?.activityId || reqId,
          clientUpdatedAt,
        );
        if (!res.success) {
          return {
            success: false,
            error: res.message || "Failed to save draft",
          };
        }
        if (res.conflict) {
          logAudit("RECORD_DRAFT_CONFLICT_RESOLVED", "Record", recordId, {
            reason: res.reason,
            isOffline: false,
          });
          return {
            success: true,
            conflict: true,
            message:
              lang === "ar"
                ? "تنبيه: يوجد إصدار أحدث على الخادم، تم فض التعارض بنجاح."
                : "Notice: A newer version exists on the server, conflict resolved.",
          };
        }
        logAudit("RECORD_DRAFT_SAVED", "Record", recordId, {
          isOffline: false,
        });
        return { success: true };
      } catch (err: any) {
        console.error("Error saving draft via recordApi:", err);
        return { success: false, error: err };
      }
    },

    submitRecord: async (recordId: string, values: Record<string, any>) => {
      const isOnline = useUIStore.getState().isOnline;
      const { records } = useDataStore.getState();
      const { lang } = useUIStore.getState();
      const targetRecord = records.find((r) => r.recordId === recordId);
      const reqId = targetRecord?.requestId || "";

      if (!isOnline) {
        try {
          await enqueueOfflineRecord({
            recordId,
            requestId: reqId,
            activityId: targetRecord?.activityId || reqId,
            values,
            isDraft: false,
          });
          return {
            success: true,
            isOffline: true,
            message:
              lang === "ar"
                ? "تم اعتماد السجل محلياً بدون اتصال. ستتم المزامنة تلقائياً فور توفر الإنترنت."
                : "Submitted offline. Will sync automatically when online.",
          };
        } catch (queueErr) {
          return {
            success: false,
            message: "Error queueing offline submission",
            error: queueErr,
          };
        }
      }

      try {
        const clientUpdatedAt = new Date().toISOString();
        const res = await recordApi.submitRecord(
          reqId,
          recordId,
          values,
          targetRecord?.activityId || reqId,
          clientUpdatedAt,
        );
        if (res.success) {
          if (res.conflict) {
            logAudit("RECORD_SUBMISSION_CONFLICT_RESOLVED", "Record", recordId, {
              reason: res.reason,
              targetId: targetRecord?.targetId,
            });
            return {
              success: true,
              conflict: true,
              message:
                lang === "ar"
                  ? "تم حفظ الاستجابة مع رصد تعارض زمني وحله بنجاح."
                  : "Response saved with timestamp conflict resolved.",
            };
          }
          logAudit("RECORD_COMPLETED", "Record", recordId, {
            targetId: targetRecord?.targetId,
            values,
          });
          return {
            success: true,
            message:
              lang === "ar"
                ? "تم الحفظ والاعتماد بنجاح."
                : "Saved and submitted successfully.",
          };
        }
        return {
          success: false,
          message: res.message || "Error submitting record",
        };
      } catch (err: any) {
        console.error("Error submitting record via recordApi:", err);
        return {
          success: false,
          message: "Error submitting record",
          error: err,
        };
      }
    },

    syncOfflineQueue: async () => {
      return flushOfflineQueue();
    },

    reassignRecord: async (
      recordId: string,
      newUserId: string,
      reason?: string,
    ) => {
      try {
        await recordApi.reassignRecord(recordId, newUserId);
        logAudit("RECORD_REASSIGNED", "Record", recordId, {
          newUserId,
          reason,
        });
        return { success: true };
      } catch (err: any) {
        console.error("Error reassigning record:", err);
        return { success: false, error: err };
      }
    },

    commitImport: async (
      requestId: string,
      importedRows: any[],
      mapping: any,
      fileName?: string,
    ) => {
      try {
        const lang = useUIStore.getState().lang;
        const res = await recordApi.commitImport(
          requestId,
          importedRows,
          mapping,
          fileName,
          lang,
        );
        logAudit("RECORDS_IMPORTED_EXCEL", "Import", requestId, {
          total: res.total,
          created: res.created,
        });
        return { success: true, data: res };
      } catch (err: any) {
        console.error("Error committing import via recordApi:", err);
        return { success: false, error: err };
      }
    },
  };
};
