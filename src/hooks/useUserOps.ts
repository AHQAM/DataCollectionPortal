import i18n from "../i18n";
import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import { useUIStore } from "../stores/uiStore";
import { User, AuditLog } from "../types";
import { userApi } from "../services";

import { logAudit } from "../utils/audit";

export const useUserOps = () => {
  return {
    updateUser: async (user: User) => {
      const dataStore = useDataStore.getState();
      const prevUser = dataStore.users.find((u) => u.userId === user.userId);
      dataStore.updateUserLocal(user);
      try {
        const res = await userApi.updateUser(user.userId, {
          userNameAr: user.userNameAr,
          userNameEn: user.userNameEn,
          email: user.email,
          mobile: user.mobile,
          branchId: user.branchId,
          regionNo: user.regionNo,
          allowedRegionNos: user.allowedRegionNos,
          userNo: user.userNo,
          role: user.role,
          isActive: user.isActive,
          maxAllowedDevices: user.maxAllowedDevices,
        });

        if (res?.success === false) {
          throw new Error("Failed to update user on server");
        }

        logAudit("USER_UPDATED", "User", user.userId, {
          role: user.role,
          active: user.isActive,
        });
        return { success: true };
      } catch (err: any) {
        console.error("userApi updateUser error:", err);
        if (prevUser) {
          dataStore.updateUserLocal(prevUser);
        }
        return { success: false, error: err };
      }
    },

    addUser: async (user: Partial<User>) => {
      const branches = useDataStore.getState().branches;
      const lang = useUIStore.getState().lang;
      const defaultBranch =
        branches.find((b) => b.branchId === user.branchId) || branches[0];

      if (user.role === "ADMIN" || user.role === "SUPERVISOR") {
        try {
          const res = await userApi.createAdminSupervisorUser({
            email: user.regionNo,
            role: user.role,
            branchId: user.branchId || defaultBranch?.branchId || null,
            userNameAr: user.userNameAr || "مستخدم جديد",
            userNameEn: user.userNameEn || "",
            mobileNo: user.mobileNo || user.mobile || "",
            allowedRegionNos: user.allowedRegionNos || [user.regionNo],
          });

          if (res.success) {
            logAudit("USER_CREATED_VIA_CF", "User", res.userId, {
              email: user.regionNo,
            });
          }
          return { success: res.success, data: res };
        } catch (err: any) {
          console.error("userApi add admin error:", err);
          return { success: false, error: err };
        }
      }

      try {
        const res = await userApi.createUser({
          username: user.regionNo || user.userNo || "",
          regionNo: user.regionNo || "",
          allowedRegionNos:
            user.allowedRegionNos || (user.regionNo ? [user.regionNo] : []),
          userNo: user.userNo || `REP-${Date.now().toString().slice(-4)}`,
          userNameAr: user.userNameAr || i18n.t("auto.newRepresentative"),
          userNameEn: user.userNameEn || "",
          branchId: user.branchId || defaultBranch?.branchId || "",
          role: "REP",
          mobileNo: user.mobileNo || user.mobile || "",
          isActive: true,
          mustChangePassword: true,
        });

        if (res.success) {
          logAudit("USER_CREATED_VIA_CF", "User", res.userId, {
            userNo: user.userNo,
          });
        }
        return { success: res.success, data: res };
      } catch (err: any) {
        console.error("userApi add rep error:", err);
        return { success: false, error: err };
      }
    },

    deactivateUser: async (userId: string) => {
      try {
        const res = await userApi.deactivateUser(userId);
        if (res?.success === false) {
          throw new Error("Failed to deactivate user");
        }
        logAudit("USER_DEACTIVATED_CF", "User", userId, {});
        return { success: true };
      } catch (err: any) {
        console.error("userApi deactivate error:", err);
        return { success: false, error: err };
      }
    },

    importUsers: async (users: any[]) => {
      const lang = useUIStore.getState().lang;
      try {
        const res = await userApi.importUsersBatch(users, lang);
        logAudit("USERS_IMPORTED_EXCEL", "User", "BATCH", {
          count: users.length,
          created: res.createdCount,
          updated: res.updatedCount,
        });
        return {
          success: true,
          data: {
            total: users.length,
            created: res.createdCount,
            updated: res.updatedCount,
          },
        };
      } catch (err: any) {
        console.error("userApi import users error:", err);
        return { success: false, error: err };
      }
    },

    importUsersBatch: async (users: any[]) => {
      const lang = useUIStore.getState().lang;
      try {
        const res = await userApi.importUsersBatch(users, lang);
        return { success: true, data: res };
      } catch (err: any) {
        return { success: false, error: err };
      }
    },
  };
};
