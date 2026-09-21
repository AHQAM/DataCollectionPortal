import { useUIStore } from '../stores/uiStore';
import { Branch, Region } from '../types';
import { branchRegionApi } from '../services';
import { logAudit } from './useUserOps';

export const useBranchOps = () => {
  return {
    createBranch: async (branchData: { branchId: string; branchNameAr: string; branchNameEn: string }) => {
      try {
        await branchRegionApi.createBranch(branchData);
        logAudit('BRANCH_CREATED', 'Branch', branchData.branchId, { name: branchData.branchNameAr });
        return { success: true };
      } catch (err: any) {
        console.error("branchRegionApi createBranch error:", err);
        return { success: false, error: err };
      }
    },

    updateBranch: async (branchId: string, updates: Partial<Branch>) => {
      try {
        await branchRegionApi.updateBranch(branchId, updates);
        logAudit('BRANCH_UPDATED', 'Branch', branchId, updates);
        return { success: true };
      } catch (err: any) {
        console.error("branchRegionApi updateBranch error:", err);
        return { success: false, error: err };
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
        return { success: true };
      } catch (err: any) {
        console.error("branchRegionApi createRegion error:", err);
        return { success: false, error: err };
      }
    },

    updateRegion: async (regionNo: string, updates: Partial<Region>) => {
      try {
        await branchRegionApi.updateRegion(regionNo, updates);
        logAudit('REGION_UPDATED', 'Region', regionNo, updates);
        return { success: true };
      } catch (err: any) {
        console.error("branchRegionApi updateRegion error:", err);
        return { success: false, error: err };
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
        return { success: true, data: res };
      } catch (err: any) {
        console.error("branchRegionApi importBranchesAndRegions error:", err);
        return { success: false, error: err };
      }
    },
  };
};
