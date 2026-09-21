import { requestApi } from '../services';
import { RequestItem, RequestField } from '../types';
import { logAudit } from './useUserOps'; // Re-use the same logAudit from userOps, or move it to a shared util later.

// Shared logAudit function
// We should probably move this to a shared file, but we can import it from useUserOps for now
// to avoid breaking changes to the current plan.

export const useRequestOps = () => {
  return {
    createRequest: async (newReq: Partial<RequestItem>, newFields: RequestField[]) => {
      try {
        const newId = await requestApi.createRequest(newReq, newFields);
        logAudit('REQUEST_CREATED_VIA_CF', 'Request', newId, {
          titleAr: newReq.titleAr,
          code: newReq.requestCode,
          fieldsCount: newFields.length,
        });
        return { success: true, data: newId };
      } catch (err: any) {
        console.error("requestApi createRequest error:", err);
        return { success: false, error: err };
      }
    },

    updateRequest: async (requestId: string, updates: Partial<RequestItem>) => {
      try {
        await requestApi.updateDraftRequest(requestId, updates);
        logAudit('REQUEST_UPDATED', 'Request', requestId, updates);
        return { success: true };
      } catch (err: any) {
        console.error("requestApi updateDraftRequest error:", err);
        return { success: false, error: err };
      }
    },

    publishRequest: async (requestId: string) => {
      try {
        await requestApi.publishRequest(requestId);
        logAudit('REQUEST_PUBLISHED', 'Request', requestId, {});
        return { success: true };
      } catch (err: any) {
        console.error("requestApi publishRequest error:", err);
        return { success: false, error: err };
      }
    },

    closeRequest: async (requestId: string) => {
      try {
        await requestApi.closeRequest(requestId);
        logAudit('REQUEST_CLOSED', 'Request', requestId, {});
        return { success: true };
      } catch (err: any) {
        console.error("requestApi closeRequest error:", err);
        return { success: false, error: err };
      }
    },

    archiveRequest: async (requestId: string) => {
      try {
        await requestApi.archiveRequest(requestId);
        logAudit('REQUEST_ARCHIVED', 'Request', requestId, {});
        return { success: true };
      } catch (err: any) {
        console.error("requestApi archiveRequest error:", err);
        return { success: false, error: err };
      }
    },

    reopenRequest: async (requestId: string) => {
      try {
        await requestApi.reopenRequest(requestId);
        logAudit('REQUEST_REOPENED', 'Request', requestId, {});
        return { success: true };
      } catch (err: any) {
        console.error("requestApi reopenRequest error:", err);
        return { success: false, error: err };
      }
    },

    cloneRequest: async (requestId: string) => {
      try {
        const newId = await requestApi.cloneRequest(requestId);
        logAudit('REQUEST_CLONED', 'Request', newId, { sourceRequestId: requestId });
        return { success: true, data: newId };
      } catch (err: any) {
        console.error("requestApi cloneRequest error:", err);
        return { success: false, error: err };
      }
    },

    deleteRequest: async (requestId: string) => {
      try {
        await requestApi.deleteRequest(requestId);
        logAudit('REQUEST_DELETED', 'Request', requestId, {});
        return { success: true };
      } catch (err: any) {
        console.error("requestApi deleteRequest error:", err);
        return { success: false, error: err };
      }
    },

    updateRequestFields: async (requestId: string, fields: RequestField[]) => {
      try {
        await requestApi.saveRequestFields(requestId, fields);
        logAudit('REQUEST_FIELDS_UPDATED', 'Request', requestId, { fieldsCount: fields.length });
        return { success: true };
      } catch (err: any) {
        console.error("requestApi saveRequestFields error:", err);
        return { success: false, error: err };
      }
    },
  };
};
