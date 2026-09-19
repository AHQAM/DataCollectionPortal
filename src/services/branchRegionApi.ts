import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { Branch, Region } from '../types';

export const branchRegionApi = {
  createBranch: async (branchData: { branchId: string; branchNameAr: string; branchNameEn?: string }) => {
    const fn = httpsCallable(functions, 'createBranch');
    const res = await fn(branchData);
    return res.data as { success: boolean; branchId: string };
  },

  updateBranch: async (branchId: string, updates: Partial<Branch>) => {
    const fn = httpsCallable(functions, 'updateBranch');
    const res = await fn({ branchId, updates });
    return res.data as { success: boolean };
  },

  deleteBranch: async (branchId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const fn = httpsCallable(functions, 'deleteBranch');
      const res = await fn({ branchId });
      return res.data as { success: boolean };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error deleting branch' };
    }
  },

  createRegion: async (regionData: { regionId?: string; regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }) => {
    const fn = httpsCallable(functions, 'createRegion');
    const res = await fn(regionData);
    return res.data as { success: boolean; regionNo: string };
  },

  updateRegion: async (regionNo: string, updates: Partial<Region>) => {
    const fn = httpsCallable(functions, 'updateRegion');
    const res = await fn({ regionNo, updates });
    return res.data as { success: boolean };
  },

  deleteRegion: async (regionNo: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const fn = httpsCallable(functions, 'deleteRegion');
      const res = await fn({ regionNo });
      return res.data as { success: boolean };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error deleting region' };
    }
  },

  importBranchesAndRegions: async (branches: Partial<Branch>[], regions: Partial<Region>[]) => {
    const fn = httpsCallable(functions, 'importBranchesAndRegions');
    const res = await fn({ branches, regions });
    return res.data as { success: boolean; branchesCount: number; regionsCount: number };
  },
};
