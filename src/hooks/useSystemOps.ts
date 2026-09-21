import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { RequestTemplate } from '../types';
import { deviceApi, userApi, templateApi, systemApi } from '../services';
import { logAudit } from './useUserOps';

export const useSystemOps = () => {
  return {
    // ==================== Device Operations ====================
    approveDeviceReplacement: async (userId: string, reason?: string) => {
      try {
        await deviceApi.replaceDevice(userId, reason);
        logAudit('DEVICE_REPLACEMENT_APPROVED', 'DeviceBinding', userId, { reason });
        return { success: true };
      } catch (err: any) {
        console.error('Error approving device replacement:', err);
        return { success: false, error: err };
      }
    },

    releaseDeviceBinding: async (userId: string, reason?: string) => {
      try {
        await deviceApi.releaseDevice(userId, reason);
        logAudit('DEVICE_RELEASED', 'DeviceBinding', userId, { reason });
        return { success: true };
      } catch (err: any) {
        console.error('Error releasing device binding:', err);
        return { success: false, error: err };
      }
    },

    rejectDeviceReplacement: async (bindingId: string, reason?: string) => {
      try {
        await deviceApi.rejectDeviceReplacement(bindingId, reason);
        logAudit('DEVICE_REPLACEMENT_REJECTED', 'DeviceBinding', bindingId, { reason });
        return { success: true };
      } catch (err: any) {
        console.error('Error rejecting device replacement:', err);
        return { success: false, error: err };
      }
    },

    // ==================== Password & Auth Operations ====================
    requestPasswordReset: async (regionNo: string) => {
      try {
        const res = await userApi.requestPasswordReset(regionNo);
        logAudit('PASSWORD_RESET_REQUESTED', 'User', regionNo, {});
        return { success: true, data: res };
      } catch (err: any) {
        console.error('Error requesting password reset:', err);
        return { success: false, error: err };
      }
    },

    adminResetPassword: async (userId: string, newPassword?: string) => {
      try {
        const res = await userApi.adminResetPassword(userId, newPassword);
        logAudit('PASSWORD_RESET_ADMIN', 'User', userId, {});
        return { success: true, data: res };
      } catch (err: any) {
        console.error('Error admin reset password:', err);
        return { success: false, error: err };
      }
    },

    adminUnlockAccount: async (userId: string) => {
      try {
        const res = await userApi.adminUnlockAccount(userId);
        logAudit('ACCOUNT_UNLOCKED_ADMIN', 'User', userId, {});
        return { success: true, data: res };
      } catch (err: any) {
        console.error('Error admin unlock account:', err);
        return { success: false, error: err };
      }
    },

    // ==================== Template Operations ====================
    saveAsTemplate: async (requestId: string, nameAr: string, nameEn: string, category: string) => {
      const { requests, fields } = useDataStore.getState();
      const req = requests.find((r) => r.requestId === requestId);
      const reqFields = fields.filter((f) => f.requestId === requestId);
      if (!req) return { success: false, error: 'Request not found' };

      const newTemplate: RequestTemplate = {
        templateId: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        templateNameAr: nameAr,
        templateNameEn: nameEn,
        category: category || 'General',
        tags: req.tags || [],
        requestSchemaSnapshot: {
          request: req,
          fields: reqFields,
        },
        createdBy: useAuthStore.getState().currentUser?.userId || 'SYSTEM',
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      try {
        await templateApi.saveTemplate(newTemplate);
        logAudit('TEMPLATE_CREATED', 'RequestTemplate', newTemplate.templateId, { nameAr });
        return { success: true };
      } catch (err: any) {
        console.error('Error saving template:', err);
        return { success: false, error: err };
      }
    },

    // ==================== System Maintenance ====================
    wipeDemoDataForProduction: async (options?: { wipeBranchesAndRegions?: boolean }) => {
      try {
        const res = await systemApi.wipeDemoData('CONFIRM_WIPE_DEMO_DATA', options?.wipeBranchesAndRegions);
        logAudit('SYSTEM_WIPE_INITIATED', 'System', 'PROD_WIPE', options || {});
        return { success: true, data: res };
      } catch (err: any) {
        console.error('Error wiping demo data via systemApi:', err);
        return { success: false, error: err };
      }
    },

    resetAllData: async () => {
      try {
        await systemApi.wipeDemoData('CONFIRM_WIPE_DEMO_DATA');
        return { success: true };
      } catch (err: any) {
        console.error('Error resetting all data:', err);
        return { success: false, error: err };
      }
    },
  };
};
