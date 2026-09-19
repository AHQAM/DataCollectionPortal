import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export interface DeviceActionResponse {
  success: boolean;
  messageAr?: string;
  messageEn?: string;
}

export const deviceApi = {
  releaseDevice: async (targetUserId: string, reason?: string): Promise<DeviceActionResponse> => {
    const fn = httpsCallable(functions, 'releaseDevice');
    const res = await fn({ targetUserId, reason });
    return res.data as DeviceActionResponse;
  },

  replaceDevice: async (targetUserId: string, reason?: string): Promise<DeviceActionResponse> => {
    const fn = httpsCallable(functions, 'replaceDevice');
    const res = await fn({ targetUserId, reason });
    return res.data as DeviceActionResponse;
  },

  rejectDeviceReplacement: async (bindingId: string, reason?: string): Promise<DeviceActionResponse> => {
    const fn = httpsCallable(functions, 'rejectDeviceReplacement');
    const res = await fn({ bindingId, reason });
    return res.data as DeviceActionResponse;
  },

  forceLogoutUser: async (targetUserId: string, reason?: string): Promise<DeviceActionResponse> => {
    const fn = httpsCallable(functions, 'forceLogoutUser');
    const res = await fn({ targetUserId, reason });
    return res.data as DeviceActionResponse;
  },
};
