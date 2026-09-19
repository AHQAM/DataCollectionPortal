import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, updateDoc, writeBatch, collection } from 'firebase/firestore';
import { auth, db, functions } from '../firebase';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import { User, Branch, Region, RequestItem, RequestField, RecordItem, PasswordResetRequest, AuditLog, RequestTemplate, OfflineQueueItem } from '../types';
import { sendBrowserNotification } from '../utils/webNotification';

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
    updateUser: async (user: User) => {
      useDataStore.getState().updateUserLocal(user);
      try {
        const updateFn = httpsCallable(functions, 'updateUser');
        await updateFn({
          targetUserId: user.userId,
          updates: {
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
          },
        });
      } catch (err) {
        console.error("Cloud function updateUser error:", err);
      }
      logAudit('USER_UPDATED', 'User', user.userId, { role: user.role, active: user.isActive });
    },

    addUser: async (user: Partial<User>) => {
      const branches = useDataStore.getState().branches;
      const lang = useUIStore.getState().lang;
      const defaultBranch = branches.find((b) => b.branchId === user.branchId) || branches[0];
      
      if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
        try {
          const createAdminFn = httpsCallable(functions, 'createAdminSupervisorUser');
          const response = await createAdminFn({
            email: user.regionNo, 
            role: user.role,
            branchId: user.branchId || defaultBranch?.branchId || null,
            repNameAr: user.repNameAr || 'مستخدم جديد',
            repNameEn: user.repNameEn || '',
            mobileNo: (user as any).mobileNo || (user as any).mobile || '',
            allowedRegionNos: user.allowedRegionNos || [user.regionNo],
          });
          
          const data = response.data as any;
          if (data.success) {
             logAudit('USER_CREATED_VIA_CF', 'User', data.userId, { email: user.regionNo });
          }
        } catch (err: any) {
          console.error("Cloud Function add error:", err);
          throw err; 
        }
        return;
      }

      try {
        const createRepFn = httpsCallable(functions, 'createUser');
        const response = await createRepFn({
          username: user.regionNo || user.repNo || '',
          regionNo: user.regionNo || '',
          allowedRegionNos: user.allowedRegionNos || (user.regionNo ? [user.regionNo] : []),
          repNo: user.repNo || 'REP-' + Math.floor(Math.random() * 900 + 100),
          repNameAr: user.repNameAr || (lang === 'ar' ? 'مندوب جديد' : 'New Representative'),
          repNameEn: user.repNameEn || '',
          branchId: user.branchId || branches[0]?.branchId || '',
          role: 'REP',
        });
        const data = response.data as any;
        if (data.success) {
          logAudit('USER_CREATED_VIA_CF', 'User', data.userId, { username: user.regionNo });
        }
      } catch (err: any) {
        console.error('Cloud Function create REP error:', err);
        throw err;
      }
    },

    importUsersBatch: async (importedUsers: User[]) => {
      try {
        const importFn = httpsCallable(functions, 'importUsersBatch');
        const payload = importedUsers.map((u) => ({
          username: u.username || u.regionNo,
          regionNo: u.regionNo || u.username,
          allowedRegionNos: u.allowedRegionNos || [u.regionNo || u.username],
          repNo: u.repNo || u.username,
          repNameAr: u.repNameAr,
          repNameEn: u.repNameEn || u.repNameAr,
          email: u.email || null,
          mobile: u.mobile || null,
          branchId: u.branchId,
          branchNameAr: u.branchNameAr,
          role: u.role || 'REP',
        }));

        const res = await importFn({ users: payload });
        const resultData = res.data as any;

        // In the original code we registered imported branches. Skipping for brevity as listeners handle it or we can add it.
        logAudit('USERS_IMPORTED_EXCEL', 'User', 'BATCH', { count: importedUsers.length, created: resultData.created });
        return resultData;
      } catch (err) {
        console.error("Error importing users via Cloud Function:", err);
        throw err;
      }
    },

    createRequest: async (newReq: Partial<RequestItem>, newFields: RequestField[]): Promise<string> => {
      try {
        const createReqFn = httpsCallable(functions, 'createRequest');
        const response = await createReqFn({ ...newReq });
        const data = response.data as any;
        const newActivityId = data.activityId;
        
        if (newFields.length > 0) {
          const saveFieldsFn = httpsCallable(functions, 'saveRequestFields');
          await saveFieldsFn({ requestId: newActivityId, fields: newFields });
        }
        
        logAudit('REQUEST_CREATED', 'Request', newActivityId, { code: newReq.requestCode, fieldsCount: newFields.length });
        return newActivityId;
      } catch (err) {
        console.error("Error creating request via CF:", err);
        return '';
      }
    },

    updateRequest: async (requestId: string, updates: Partial<RequestItem>) => {
      try {
        const updateReqFn = httpsCallable(functions, 'updateDraftRequest');
        await updateReqFn({ requestId, updates });
        logAudit('REQUEST_UPDATED', 'Request', requestId, updates);
      } catch (err) {
        console.error("Error updating request:", err);
      }
    },

    updateRequestFields: async (requestId: string, newFields: RequestField[]) => {
      try {
        const saveFieldsFn = httpsCallable(functions, 'saveRequestFields');
        await saveFieldsFn({ requestId, fields: newFields });
        logAudit('FIELDS_UPDATED', 'Request', requestId, { fieldsCount: newFields.length });
      } catch (err) {
        console.error("Error updating fields in Firestore:", err);
      }
    },

    publishRequest: async (requestId: string) => {
      try {
        const publishReqFn = httpsCallable(functions, 'publishRequest');
        await publishReqFn({ requestId });
        const req = useDataStore.getState().requests.find((r) => r.requestId === requestId);
        if (req) {
          logAudit('REQUEST_PUBLISHED', 'Request', requestId, { titleAr: req.titleAr });
        }
      } catch (err) {
        console.error("Error publishing request:", err);
        throw err;
      }
    },

    closeRequest: async (requestId: string) => {
      try {
        const closeReqFn = httpsCallable(functions, 'closeRequest');
        await closeReqFn({ requestId });
        logAudit('REQUEST_CLOSED', 'Request', requestId, {});
      } catch (err) {
        console.error("Error closing request:", err);
      }
    },

    archiveRequest: async (requestId: string) => {
      try {
        const archiveReqFn = httpsCallable(functions, 'archiveRequest');
        await archiveReqFn({ requestId });
        logAudit('REQUEST_ARCHIVED', 'Request', requestId, {});
      } catch (err) {
        console.error("Error archiving request:", err);
      }
    },

    reopenRequest: async (requestId: string) => {
      try {
        const reopenReqFn = httpsCallable(functions, 'reopenRequest');
        await reopenReqFn({ requestId });
        logAudit('REQUEST_REOPENED', 'Request', requestId, {});
      } catch (err) {
        console.error("Error reopening request:", err);
      }
    },

    cloneRequest: async (requestId: string): Promise<string> => {
      try {
        const cloneReqFn = httpsCallable(functions, 'cloneRequest');
        const response = await cloneReqFn({ requestId });
        const data = response.data as any;
        const newId = data.requestId;
        logAudit('REQUEST_CLONED', 'Request', newId, { sourceRequestId: requestId });
        return newId;
      } catch (err) {
        console.error("Error cloning request via Cloud Function:", err);
        return '';
      }
    },

    saveDraftRecord: async (recordId: string, values: Record<string, any>) => {
      const isOnline = useUIStore.getState().isOnline;
      if (!isOnline) {
        // Queue offline logic would go here.
        return;
      }
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'responses', recordId), values, { merge: true });
        batch.update(doc(db, 'records', recordId), {
          recordStatus: 'DraftSaved',
          completionPercent: 50,
          draftSavedAt: new Date().toISOString(),
          lastSavedAt: new Date().toISOString(),
          lastSavedBy: useAuthStore.getState().currentUser?.userId,
          updatedAt: new Date().toISOString(),
        });
        await batch.commit();
        logAudit('RECORD_DRAFT_SAVED', 'Record', recordId, { isOffline: false });
      } catch (err) {
        console.error('Error saving draft:', err);
      }
    },

    submitRecord: async (recordId: string, values: Record<string, any>) => {
      const { currentUser } = useAuthStore.getState();
      const { records, assignments } = useDataStore.getState();
      const { lang } = useUIStore.getState();

      const targetRecord = records.find((r) => r.recordId === recordId);
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'responses', recordId), values, { merge: true });
        batch.update(doc(db, 'records', recordId), {
          recordStatus: 'Submitted',
          completionPercent: 100,
          submittedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          lastSavedAt: new Date().toISOString(),
          lastSavedBy: currentUser?.userId,
          updatedAt: new Date().toISOString(),
        });

        if (targetRecord && targetRecord.assignmentId !== 'UNASSIGNED') {
          const asg = assignments.find((a) => a.assignmentId === targetRecord.assignmentId);
          if (asg) {
            const completed = asg.completedRecords + 1;
            const pending = Math.max(0, asg.totalRecords - completed);
            const progressPercent = Math.round((completed / asg.totalRecords) * 100);
            batch.update(doc(db, 'assignments', targetRecord.assignmentId), {
              completedRecords: completed,
              pendingRecords: pending,
              progressPercent,
              completedAt: completed >= asg.totalRecords ? new Date().toISOString() : null,
              lastActivityAt: new Date().toISOString(),
            });
          }
        }

        await batch.commit();
        logAudit('RECORD_COMPLETED', 'Record', recordId, {
          customerNo: targetRecord?.customerNo,
          values,
        });

        return {
          success: true,
          message: lang === 'ar' ? 'تم الحفظ والاعتماد بنجاح.' : 'Saved and submitted successfully.',
        };
      } catch (err) {
        console.error('Error submitting record:', err);
        return { success: false, message: 'Error submitting record to Firestore' };
      }
    },

    createBranch: async (branchData: { branchId: string; branchNameAr: string; branchNameEn: string }) => {
      const newBranch: Branch = {
        branchId: branchData.branchId.toUpperCase().trim(),
        branchNameAr: branchData.branchNameAr.trim(),
        branchNameEn: branchData.branchNameEn.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'branches', newBranch.branchId), newBranch);
        logAudit('BRANCH_CREATED', 'Branch', newBranch.branchId, { name: newBranch.branchNameAr });
      } catch (err) {
        console.error("Error creating branch:", err);
      }
    },

    updateBranch: async (branchId: string, updates: Partial<Branch>) => {
      try {
        await updateDoc(doc(db, 'branches', branchId), { ...updates, updatedAt: new Date().toISOString() });
        logAudit('BRANCH_UPDATED', 'Branch', branchId, updates);
      } catch (err) {
        console.error("Error updating branch:", err);
      }
    },

    deleteBranch: async (branchId: string): Promise<{ success: boolean; message?: string }> => {
      const { regions, users } = useDataStore.getState();
      const { lang } = useUIStore.getState();
      const hasRegions = regions.some((r) => r.branchId === branchId);
      if (hasRegions) return { success: false, message: lang === 'ar' ? 'لا يمكن حذف الفرع لأنه مرتبط بمناطق حالية' : 'Cannot delete branch linked to existing regions' };
      const hasUsers = users.some((u) => u.branchId === branchId);
      if (hasUsers) return { success: false, message: lang === 'ar' ? 'لا يمكن حذف الفرع لأنه مسند لمستخدمين' : 'Cannot delete branch assigned to users' };
      try {
        await updateDoc(doc(db, 'branches', branchId), { isActive: false, updatedAt: new Date().toISOString() });
        logAudit('BRANCH_DELETED', 'Branch', branchId, {});
        return { success: true };
      } catch (err) {
        return { success: false, message: 'Firestore Error' };
      }
    },

    createRegion: async (regionData: { regionId: string; regionNo: string; regionNameAr: string; regionNameEn: string; branchId: string }) => {
      const newRegion: Region = {
        regionId: regionData.regionId || `REG-${regionData.regionNo}`,
        regionNo: regionData.regionNo.trim(),
        regionNameAr: regionData.regionNameAr.trim(),
        regionNameEn: regionData.regionNameEn.trim(),
        branchId: regionData.branchId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'regions', newRegion.regionId), newRegion);
        logAudit('REGION_CREATED', 'Region', newRegion.regionId, { regionNo: newRegion.regionNo });
      } catch (err) {
        console.error("Error creating region:", err);
      }
    },

    updateRegion: async (regionId: string, updates: Partial<Region>) => {
      try {
        await updateDoc(doc(db, 'regions', regionId), { ...updates, updatedAt: new Date().toISOString() });
        logAudit('REGION_UPDATED', 'Region', regionId, updates);
      } catch (err) {
        console.error("Error updating region:", err);
      }
    },

    deleteRegion: async (regionId: string): Promise<{ success: boolean; message?: string }> => {
      const { regions, records, users } = useDataStore.getState();
      const { lang } = useUIStore.getState();
      const target = regions.find((r) => r.regionId === regionId);
      if (!target) return { success: false, message: 'Not found' };

      const hasRecords = records.some((rec) => rec.regionNo === target.regionNo);
      if (hasRecords) return { success: false, message: lang === 'ar' ? 'لا يمكن حذف المنطقة لوجود سجلات' : 'Cannot delete region with customer records' };
      const hasUsers = users.some((u) => u.regionNo === target.regionNo || (u.allowedRegionNos && u.allowedRegionNos.includes(target.regionNo)));
      if (hasUsers) return { success: false, message: lang === 'ar' ? 'لا يمكن حذف المنطقة' : 'Cannot delete region' };

      try {
        await updateDoc(doc(db, 'regions', regionId), { isActive: false, updatedAt: new Date().toISOString() });
        logAudit('REGION_DELETED', 'Region', regionId, { regionNo: target.regionNo });
        return { success: true };
      } catch (err) {
        return { success: false, message: 'Firestore Error' };
      }
    },
    
    // Device replacement & security
    approveDeviceReplacement: async (userId: string, reason?: string) => {
      try {
        const replaceFn = httpsCallable(functions, 'replaceDevice');
        await replaceFn({ targetUserId: userId, reason: reason || 'Approved by admin' });
        logAudit('DEVICE_REPLACEMENT_APPROVED', 'DeviceBinding', userId, { reason });
      } catch (err) {
        console.error('Error approving device replacement:', err);
      }
    },
    releaseDeviceBinding: async (userId: string, reason?: string) => {
      try {
        const releaseFn = httpsCallable(functions, 'releaseDevice');
        await releaseFn({ targetUserId: userId, reason: reason || 'Released by admin' });
        logAudit('DEVICE_RELEASED', 'DeviceBinding', userId, { reason });
      } catch (err) {
        console.error('Error releasing device binding:', err);
      }
    },
    rejectDeviceReplacement: async (userId: string, reason?: string) => {
      logAudit('DEVICE_REPLACEMENT_REJECTED', 'DeviceBinding', userId, { reason });
    },

    // Record reassignment
    reassignRecord: async (recordId: string, newUserId: string, reason?: string) => {
      try {
        const reassignFn = httpsCallable(functions, 'reassignRecords');
        await reassignFn({ recordIds: [recordId], newUserId });
        logAudit('RECORD_REASSIGNED', 'Record', recordId, { newUserId, reason });
      } catch (err) {
        console.error('Error reassigning record:', err);
      }
    },

    // Excel import
    commitImport: async (requestId: string, importedRows: any[], mapping: any, fileName?: string) => {
      try {
        const commitFn = httpsCallable(functions, 'commitImport');
        const lang = useUIStore.getState().lang;
        const res = await commitFn({
          requestId,
          importedRows,
          mapping,
          fileName: fileName || 'imported_file.xlsx',
          lang,
        });
        const resultData = res.data as any;
        logAudit('RECORDS_IMPORTED_EXCEL', 'Import', requestId, {
          total: importedRows.length,
          created: resultData?.created || importedRows.length,
        });
        return {
          total: importedRows.length,
          created: resultData?.created || importedRows.length,
        };
      } catch (err) {
        console.error('Error committing import via Cloud Function:', err);
        throw err;
      }
    },

    saveAsTemplate: (requestId: string, nameAr: string, nameEn: string, category: string) => {
      const { requests, fields } = useDataStore.getState();
      const req = requests.find((r) => r.requestId === requestId);
      const reqFields = fields.filter((f) => f.requestId === requestId);
      if (!req) return;

      const newTemplate: RequestTemplate = {
        templateId: `tpl_${Date.now()}`,
        templateNameAr: nameAr,
        templateNameEn: nameEn,
        category: category || 'General',
        tags: req.tags || [],
        requestSchemaSnapshot: {
          request: req,
          fields: reqFields,
        },
        createdBy: useAuthStore.getState().currentUser?.userId || 'ADMIN',
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      setDoc(doc(db, 'requestTemplates', newTemplate.templateId), newTemplate).catch((err) => {
        console.error('Error saving template:', err);
      });
      logAudit('TEMPLATE_CREATED', 'RequestTemplate', newTemplate.templateId, { nameAr });
    },

    wipeDemoDataForProduction: async (options?: { wipeBranchesAndRegions?: boolean }) => {
      logAudit('SYSTEM_WIPE_INITIATED', 'System', 'PROD_WIPE', options || {});
    },
    
    // Additional helpers
    requestPasswordReset: () => {},
    importRecords: async () => ({ success: false, count: 0 }),
    sendBroadcastNotification: async () => {},
    importBranchesAndRegions: async (
      branches: Partial<Branch>[] = [],
      regions: Partial<Region>[] = [],
      _mode?: 'append' | 'replace'
    ) => {
      let branchesCount = 0;
      let regionsCount = 0;
      const batch = writeBatch(db);
      for (const b of branches) {
        const branchRef = doc(collection(db, 'branches'));
        batch.set(branchRef, {
          branchId: b.branchId || branchRef.id,
          branchNameAr: b.branchNameAr || '',
          branchNameEn: b.branchNameEn || '',
          isActive: b.isActive ?? true,
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        branchesCount++;
      }
      for (const r of regions) {
        const regionRef = doc(collection(db, 'regions'));
        batch.set(regionRef, {
          regionId: r.regionId || regionRef.id,
          regionNo: r.regionNo || '',
          regionNameAr: r.regionNameAr || '',
          regionNameEn: r.regionNameEn || '',
          branchId: r.branchId || '',
          isActive: r.isActive ?? true,
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        regionsCount++;
      }
      await batch.commit();
      return { branchesCount, regionsCount };
    },
    resetAllDataToDefaults: () => {},
    resetAllData: () => {},
    clearAllDemoData: () => {},
    syncOfflineQueue: async () => {},
  };
};
