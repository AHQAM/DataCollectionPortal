import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { User } from "../types";

export const userApi = {
  createUser: async (userData: any) => {
    const fn = httpsCallable(functions, "createUser");
    const res = await fn(userData);
    return res.data as { success: boolean; userId: string };
  },

  createAdminSupervisorUser: async (userData: any) => {
    const fn = httpsCallable(functions, "createAdminSupervisorUser");
    const res = await fn(userData);
    return res.data as { success: boolean; userId: string };
  },

  updateUser: async (targetUserId: string, updates: Partial<User>) => {
    const fn = httpsCallable(functions, "updateUser");
    const res = await fn({ targetUserId, updates });
    return res.data as { success: boolean };
  },

  deactivateUser: async (targetUserId: string) => {
    const fn = httpsCallable(functions, "deactivateUser");
    const res = await fn({ targetUserId });
    return res.data as { success: boolean };
  },

  requestPasswordReset: async (regionNo: string) => {
    const fn = httpsCallable(functions, "requestPasswordReset");
    const res = await fn({ regionNo });
    return res.data as {
      success: boolean;
      messageAr?: string;
      messageEn?: string;
    };
  },

  adminResetPassword: async (targetUserId: string, newPassword?: string) => {
    const fn = httpsCallable(functions, "adminResetPassword");
    const res = await fn({ targetUserId, newPassword });
    return res.data as { success: boolean; temporaryPassword?: string };
  },

  adminUnlockAccount: async (targetUserId: string) => {
    const fn = httpsCallable(functions, "adminUnlockAccount");
    const res = await fn({ targetUserId });
    return res.data as { success: boolean };
  },

  importUsersBatch: async (users: any[], lang: string = "ar") => {
    const fn = httpsCallable(functions, "importUsersBatch");
    const res = await fn({ users, lang });
    return res.data as {
      success: boolean;
      created: number;
      updated: number;
      createdCount: number;
      updatedCount: number;
      temporaryPasswords: Array<{
        username: string;
        userNameAr: string;
        branchName: string;
        allowedRegionNos: string[];
        password: string;
      }>;
    };
  },
};
