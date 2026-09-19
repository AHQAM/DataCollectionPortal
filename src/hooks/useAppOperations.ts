import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import { User, Branch, Region, RequestItem, RequestField, AuditLog, RequestTemplate } from '../types';
import {
  userApi,
  requestApi,
  recordApi,
  branchRegionApi,
  deviceApi,
  systemApi,
  templateApi,
} from '../services';

// Helper to add audit logs
export const logAudit = (
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, any>,
  user?: User | null
) => {
  const { currentUser, simulatedDeviceId } = useAuthStore.getState();
  const actor = user || currentUser;
  const newLog: AuditLog = {
    logId: 'LOG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId: actor?.userId || 'SYSTEM',
    userRole: actor?.role || 'ADMIN',
    userName: actor?.repNameAr || 'نظام',
    action,
    entityType,
    entityId,
    detailsJson: JSON.stringify(details),
    createdAt: new Date().toISOString(),
    deviceBindingId: simulatedDeviceId,
  };
  useDataStore.getState().addAuditLogLocal(newLog);
};

export const useAppOperations = () => {
  return {
    // ==================== User Operations ====================
    updateUser: async (user: User) => {
      useDataStore.getState().updateUserLocal(user);
      try {
        await userApi.updateUser(user.userId, {
          repNameAr: user.repNameAr,
          repNameEn: user.repNameEn,
          email: user.email,
          mobile: user.mobile,
          branchId: user.branchId,
          regionNo: user.regionNo,
          allowedRegionNos: user.allowedRegionNos,
          repNo: user.repNo,
          role: user.role,
          isActive: user.isActive,
          maxAllowedDevices: user.maxAllowedDevices,
        });
      } catch (err) {
        console.error("userApi updateUser error:", err);
      }
      logAudit('USER_UPDATED', 'User', user.userId, { role: user.role, active: user.isActive });
    },

    addUser: async (user: Partial<User>) => {
      const branches = useDataStore.getState().branches;
      const lang = useUIStore.getState().lang;
      const defaultBranch = branches.find((b) => b.branchId === user.branchId) || branches[0];

      if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
        try {
          const res = await userApi.createAdminSupervisorUser({
            email: user.regionNo,
            role: user.role,
            branchId: user.branchId || defaultBranch?.branchId || null,
            repNameAr: user.repNameAr || 'مستخدم جديد',
            repNameEn: user.repNameEn || '',
            mobileNo: (user as any).mobileNo || (user as any).mobile || '',
            allowedRegionNos: user.allowedRegionNos || [user.regionNo],
          });

          if (res.success) {
            logAudit('USER_CREATED_VIA_CF', 'User', res.userId, { email: user.regionNo });
          }
        } catch (err: any) {
          console.error("userApi add admin error:", err);
          throw err;
        }
        return;
      }

      try {
        const res = await userApi.createUser({
          username: user.regionNo || user.repNo || '',
          regionNo: user.regionNo || '',
          allowedRegionNos: user.allowedRegionNos || (user.regionNo ? [user.regionNo] : []),
          repNo: user.repNo || `REP-${Date.now().toString().slice(-4)}`,
          repNameAr: user.repNameAr || (lang === 'ar' ? 'مندوب جديد' : 'New Representative'),
          repNameEn: user.repNameEn || '',
          branchId: user.branchId || defaultBranch?.branchId || '',
          role: 'REP',
          mobileNo: (user as any).mobileNo || (user as any).mobile || '',
          isActive: true,
          mustChangePassword: true,
        });

        if (res.success) {
          logAudit('USER_CREATED_VIA_CF', 'User', res.userId, { repNo: user.repNo });
        }
      } catch (err: any) {
        console.error("userApi add rep error:", err);
        throw err;
      }
    },

    deactivateUser: async (userId: string) => {
      try {
        await userApi.deactivateUser(userId);
        logAudit('USER_DEACTIVATED_CF', 'User', userId, {});
      } catch (err) {
        console.error("userApi deactivate error:", err);
      }
    },

    importUsers: async (users: any[]) => {
      const lang = useUIStore.getState().lang;
      try {
        const res = await userApi.importUsersBatch(users, lang);
        logAudit('USERS_IMPORTED_EXCEL', 'User', 'BATCH', {
          count: users.length,
          created: res.createdCount,
          updated: res.updatedCount,
        });
        return {
          total: users.length,
          created: res.createdCount,
          updated: res.updatedCount,
        };
      } catch (err) {
        console.error("userApi import users error:", err);
        throw err;
      }
    },

    importUsersBatch: async (users: any[]) => {
      const lang = useUIStore.getState().lang;
      return await userApi.importUsersBatch(users, lang);
    },

    // ==================== Request Operations ====================
    createRequest: async (newReq: Partial<RequestItem>, newFields: RequestField[]): Promise<string> => {
      try {
        const newId = await requestApi.createRequest(newReq, newFields);
        logAudit('REQUEST_CREATED_VIA_CF', 'Request', newId, {
          titleAr: newReq.titleAr,
          code: newReq.requestCode,
          fieldsCount: newFields.length,
        });
        return newId;
      } catch (err) {
        console.error("requestApi createRequest error:", err);
        throw err;
      }
    },

    updateRequest: async (requestId: string, updates: Partial<RequestItem>) => {
      try {
        await requestApi.updateDraftRequest(requestId, updates);
        logAudit('REQUEST_UPDATED', 'Request', requestId, updates);
      } catch (err) {
        console.error("requestApi updateDraftRequest error:", err);
      }
    },

    publishRequest: async (requestId: string) => {
      try {
        await requestApi.publishRequest(requestId);
        logAudit('REQUEST_PUBLISHED', 'Request', requestId, {});
      } catch (err) {
        console.error("requestApi publishRequest error:", err);
      }
    },

    closeRequest: async (requestId: string) => {
      try {
        await requestApi.closeRequest(requestId);
        logAudit('REQUEST_CLOSED', 'Request', requestId, {});
      } catch (err) {
        console.error("requestApi closeRequest error:", err);
      }
    },

    archiveRequest: async (requestId: string) => {
      try {
        await requestApi.archiveRequest(requestId);
        logAudit('REQUEST_ARCHIVED', 'Request', requestId, {});
      } catch (err) {
        console.error("requestApi archiveRequest error:", err);
      }
    },

    reopenRequest: async (requestId: string) => {
      try {
        await requestApi.reopenRequest(requestId);
        logAudit('REQUEST_REOPENED', 'Request', requestId, {});
      } catch (err) {
        console.error("requestApi reopenRequest error:", err);
      }
    },

    cloneRequest: async (requestId: string): Promise<string> => {
      try {
        const newId = await requestApi.cloneRequest(requestId);
        logAudit('REQUEST_CLONED', 'Request', newId, { sourceRequestId: requestId });
        return newId;
      } catch (err) {
        console.error("requestApi cloneRequest error:", err);
        return '';
      }
    },

    updateRequestFields: async (requestId: string, fields: RequestField[]) => {
      try {
        await requestApi.saveRequestFields(requestId, fields);
        logAudit('REQUEST_FIELDS_UPDATED', 'Request', requestId, { fieldsCount: fields.length });
      } catch (err) {
        console.error("requestApi saveRequestFields error:", err);
      }
    },

    // ==================== Record Operations ====================
    saveDraftRecord: async (recordId: string, values: Record<string, any>) => {
      const isOnline = useUIStore.getState().isOnline;
      if (!isOnline) {
        return;
      }
      try {
        const { records } = useDataStore.getState();
        const rec = records.find((r) => r.recordId === recordId);
        const reqId = rec?.requestId || '';
        await recordApi.saveDraftRecord(reqId, recordId, values, (rec as any)?.activityId || reqId);
        logAudit('RECORD_DRAFT_SAVED', 'Record', recordId, { isOffline: false });
      } catch (err) {
        console.error('Error saving draft via recordApi:', err);
      }
    },

    submitRecord: async (recordId: string, values: Record<string, any>) => {
      const { records } = useDataStore.getState();
      const { lang } = useUIStore.getState();
      const targetRecord = records.find((r) => r.recordId === recordId);
      const reqId = targetRecord?.requestId || '';

      try {
        const res = await recordApi.submitRecord(reqId, recordId, values, (targetRecord as any)?.activityId || reqId);
        if (res.success) {
          logAudit('RECORD_COMPLETED', 'Record', recordId, {
            customerNo: targetRecord?.customerNo,
            values,
          });
          return {
            success: true,
            message: lang === 'ar' ? 'تم الحفظ والاعتماد بنجاح.' : 'Saved and submitted successfully.',
          };
        }
        return { success: false, message: res.message || 'Error submitting record' };
      } catch (err) {
        console.error('Error submitting record via recordApi:', err);
        return { success: false, message: 'Error submitting record' };
      }
    },

    reassignRecord: async (recordId: string, newUserId: string, reason?: string) => {
      try {
        await recordApi.reassignRecord(recordId, newUserId);
        logAudit('RECORD_REASSIGNED', 'Record', recordId, { newUserId, reason });
      } catch (err) {
        console.error('Error reassigning record:', err);
      }
    },

    commitImport: async (requestId: string, importedRows: any[], mapping: any, fileName?: string) => {
      try {
        const lang = useUIStore.getState().lang;
        const res = await recordApi.commitImport(requestId, importedRows, mapping, fileName, lang);
        logAudit('RECORDS_IMPORTED_EXCEL', 'Import', requestId, {
          total: res.total,
          created: res.created,
        });
        return res;
      } catch (err) {
        console.error('Error committing import via recordApi:', err);
        throw err;
      }
    },

    // ==================== Branch & Region Operations ====================
    createBranch: async (branchData: { branchId: string; branchNameAr: string; branchNameEn: string }) => {
      try {
        await branchRegionApi.createBranch(branchData);
        logAudit('BRANCH_CREATED', 'Branch', branchData.branchId, { name: branchData.branchNameAr });
      } catch (err) {
        console.error("branchRegionApi createBranch error:", err);
      }
    },

    updateBranch: async (branchId: string, updates: Partial<Branch>) => {
      try {
        await branchRegionApi.updateBranch(branchId, updates);
        logAudit('BRANCH_UPDATED', 'Branch', branchId, updates);
      } catch (err) {
        console.error("branchRegionApi updateBranch error:", err);
      }
    },

    deleteBranch: async (branchId: string): Promise<{ success: boolean; message?: string }> => {
      const { lang } = useUIStore.getState();
      try {
        const res = await branchRegionApi.deleteBranch(branchId);
        if (!res.success) {
          return { success: false, message: res.message || (lang === 'ar' ? 'تعذر حذف الفرع' : 'Cannot delete branch') };
        }
        logAudit('BRANCH_DELETED', 'Branch', branchId, {});
        return { success: true };
      } catch (err: any) {
        console.error("branchRegionApi deleteBranch error:", err);
        return { success: false, message: err.message };
      }
    },

    createRegion: async (regionData: { regionId?: string; regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }) => {
      try {
        await branchRegionApi.createRegion(regionData);
        logAudit('REGION_CREATED', 'Region', regionData.regionNo, { name: regionData.regionNameAr });
      } catch (err) {
        console.error("branchRegionApi createRegion error:", err);
      }
    },

    updateRegion: async (regionNo: string, updates: Partial<Region>) => {
      try {
        await branchRegionApi.updateRegion(regionNo, updates);
        logAudit('REGION_UPDATED', 'Region', regionNo, updates);
      } catch (err) {
        console.error("branchRegionApi updateRegion error:", err);
      }
    },

    deleteRegion: async (regionNo: string): Promise<{ success: boolean; message?: string }> => {
      const { lang } = useUIStore.getState();
      try {
        const res = await branchRegionApi.deleteRegion(regionNo);
        if (!res.success) {
          return { success: false, message: res.message || (lang === 'ar' ? 'تعذر حذف المنطقة' : 'Cannot delete region') };
        }
        logAudit('REGION_DELETED', 'Region', regionNo, {});
        return { success: true };
      } catch (err: any) {
        console.error("branchRegionApi deleteRegion error:", err);
        return { success: false, message: err.message };
      }
    },

    importBranchesAndRegions: async (
      branches: Partial<Branch>[] = [],
      regions: Partial<Region>[] = [],
      _mode?: 'append' | 'replace'
    ) => {
      try {
        const res = await branchRegionApi.importBranchesAndRegions(branches, regions);
        logAudit('BRANCHES_REGIONS_IMPORTED', 'BranchRegion', 'BATCH', res);
        return res;
      } catch (err) {
        console.error("branchRegionApi importBranchesAndRegions error:", err);
        throw err;
      }
    },

    // ==================== Device Operations ====================
    approveDeviceReplacement: async (userId: string, reason?: string) => {
      try {
        await deviceApi.replaceDevice(userId, reason);
        logAudit('DEVICE_REPLACEMENT_APPROVED', 'DeviceBinding', userId, { reason });
      } catch (err) {
        console.error('Error approving device replacement:', err);
      }
    },

    releaseDeviceBinding: async (userId: string, reason?: string) => {
      try {
        await deviceApi.releaseDevice(userId, reason);
        logAudit('DEVICE_RELEASED', 'DeviceBinding', userId, { reason });
      } catch (err) {
        console.error('Error releasing device binding:', err);
      }
    },

    rejectDeviceReplacement: async (bindingId: string, reason?: string) => {
      try {
        await deviceApi.rejectDeviceReplacement(bindingId, reason);
        logAudit('DEVICE_REPLACEMENT_REJECTED', 'DeviceBinding', bindingId, { reason });
      } catch (err) {
        console.error('Error rejecting device replacement:', err);
      }
    },

    // ==================== Password & Auth Operations ====================
    requestPasswordReset: async (regionNo: string) => {
      try {
        const res = await userApi.requestPasswordReset(regionNo);
        logAudit('PASSWORD_RESET_REQUESTED', 'User', regionNo, {});
        return res;
      } catch (err) {
        console.error('Error requesting password reset:', err);
        throw err;
      }
    },

    adminResetPassword: async (userId: string, newPassword?: string) => {
      try {
        const res = await userApi.adminResetPassword(userId, newPassword);
        logAudit('PASSWORD_RESET_ADMIN', 'User', userId, {});
        return res;
      } catch (err) {
        console.error('Error admin reset password:', err);
        throw err;
      }
    },

    adminUnlockAccount: async (userId: string) => {
      try {
        const res = await userApi.adminUnlockAccount(userId);
        logAudit('ACCOUNT_UNLOCKED_ADMIN', 'User', userId, {});
        return res;
      } catch (err) {
        console.error('Error admin unlock account:', err);
        throw err;
      }
    },

    // ==================== Template Operations ====================
    saveAsTemplate: (requestId: string, nameAr: string, nameEn: string, category: string) => {
      const { requests, fields } = useDataStore.getState();
      const req = requests.find((r) => r.requestId === requestId);
      const reqFields = fields.filter((f) => f.requestId === requestId);
      if (!req) return;

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

      templateApi.saveTemplate(newTemplate).catch((err) => {
        console.error('Error saving template:', err);
      });
      logAudit('TEMPLATE_CREATED', 'RequestTemplate', newTemplate.templateId, { nameAr });
    },

    // ==================== System Maintenance ====================
    wipeDemoDataForProduction: async (options?: { wipeBranchesAndRegions?: boolean }) => {
      try {
        const res = await systemApi.wipeDemoData('CONFIRM_WIPE_DEMO_DATA', options?.wipeBranchesAndRegions);
        logAudit('SYSTEM_WIPE_INITIATED', 'System', 'PROD_WIPE', options || {});
        return res;
      } catch (err) {
        console.error('Error wiping demo data via systemApi:', err);
        throw err;
      }
    },

    resetAllData: async () => {
      try {
        await systemApi.wipeDemoData('CONFIRM_WIPE_DEMO_DATA');
      } catch (err) {
        console.error('Error resetting all data:', err);
      }
    },
  };
};
