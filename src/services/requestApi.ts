import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { RequestItem, RequestField } from '../types';

export const requestApi = {
  createRequest: async (
    newReq: Partial<RequestItem>,
    newFields: RequestField[]
  ): Promise<string> => {
    const createReqFn = httpsCallable(functions, 'createRequest');
    const response = await createReqFn(newReq);
    const data = response.data as any;
    const newId = data.requestId;

    if (newFields && newFields.length > 0) {
      const saveFieldsFn = httpsCallable(functions, 'saveRequestFields');
      await saveFieldsFn({ requestId: newId, fields: newFields });
    }

    return newId;
  },

  updateDraftRequest: async (requestId: string, updates: Partial<RequestItem>) => {
    const fn = httpsCallable(functions, 'updateDraftRequest');
    const res = await fn({ requestId, updates });
    return res.data;
  },

  publishRequest: async (requestId: string) => {
    const fn = httpsCallable(functions, 'publishRequest');
    const res = await fn({ requestId });
    return res.data;
  },

  closeRequest: async (requestId: string) => {
    const fn = httpsCallable(functions, 'closeRequest');
    const res = await fn({ requestId });
    return res.data;
  },

  archiveRequest: async (requestId: string) => {
    const fn = httpsCallable(functions, 'archiveRequest');
    const res = await fn({ requestId });
    return res.data;
  },

  reopenRequest: async (requestId: string) => {
    const fn = httpsCallable(functions, 'reopenRequest');
    const res = await fn({ requestId });
    return res.data;
  },

  cloneRequest: async (requestId: string): Promise<string> => {
    const fn = httpsCallable(functions, 'cloneRequest');
    const res = await fn({ requestId });
    const data = res.data as any;
    return data.requestId;
  },

  saveRequestFields: async (requestId: string, fields: RequestField[]) => {
    const fn = httpsCallable(functions, 'saveRequestFields');
    const res = await fn({ requestId, fields });
    return res.data;
  },
};
