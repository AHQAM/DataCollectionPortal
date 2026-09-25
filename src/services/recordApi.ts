import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export const recordApi = {
  submitRecord: async (
    requestId: string,
    recordId: string,
    formData: Record<string, any>,
    activityId?: string,
    clientUpdatedAt?: string,
  ): Promise<{
    success: boolean;
    responseId?: string;
    message?: string;
    conflict?: boolean;
    reason?: string;
  }> => {
    try {
      const fn = httpsCallable(functions, "submitResponse");
      const res = await fn({
        requestId,
        recordId,
        activityId: activityId || requestId,
        formData,
        submittedAt: clientUpdatedAt || new Date().toISOString(),
        clientUpdatedAt: clientUpdatedAt || new Date().toISOString(),
      });
      const data = res.data as {
        success: boolean;
        responseId?: string;
        conflict?: boolean;
        reason?: string;
      };
      return {
        success: data.success,
        responseId: data.responseId,
        conflict: data.conflict,
        reason: data.reason,
      };
    } catch (err: any) {
      console.error("Error submitting record via Cloud Function:", err);
      return {
        success: false,
        message: err.message || "Error submitting record",
      };
    }
  },

  saveDraftRecord: async (
    requestId: string,
    recordId: string,
    formData: Record<string, any>,
    activityId?: string,
    clientUpdatedAt?: string,
  ): Promise<{
    success: boolean;
    message?: string;
    conflict?: boolean;
    reason?: string;
  }> => {
    try {
      const fn = httpsCallable(functions, "saveDraftResponse");
      const res = await fn({
        requestId,
        recordId,
        activityId: activityId || requestId,
        formData,
        clientUpdatedAt: clientUpdatedAt || new Date().toISOString(),
      });
      const data = res.data as {
        success: boolean;
        conflict?: boolean;
        reason?: string;
      };
      return {
        success: data.success,
        conflict: data.conflict,
        reason: data.reason,
      };
    } catch (err: any) {
      console.error("Error saving draft via Cloud Function:", err);
      return { success: false, message: err.message || "Error saving draft" };
    }
  },

  reassignRecord: async (
    recordId: string,
    newUserId: string,
  ): Promise<{ success: boolean }> => {
    const fn = httpsCallable(functions, "reassignRecords");
    const res = await fn({ recordIds: [recordId], newUserId });
    return res.data as { success: boolean };
  },

  commitImport: async (
    requestId: string,
    importedRows: any[],
    mapping: any,
    fileName?: string,
    lang: string = "ar",
  ): Promise<{ total: number; created: number }> => {
    const fn = httpsCallable(functions, "commitImport");
    const res = await fn({
      requestId,
      importedRows,
      mapping,
      fileName,
      lang,
    });
    const resultData = res.data as { created?: number };
    return {
      total: importedRows.length,
      created: resultData?.created || importedRows.length,
    };
  },
};
