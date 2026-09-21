import { create } from "zustand";
import { User } from "../types";
import { auth, functions, db } from "../firebase";
import { useDataStore } from "./dataStore";
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";

const STORAGE_PREFIX = "sales_collection_hub_v1_";

interface LoginResult {
  success: boolean;
  messageAr?: string;
  messageEn?: string;
  mustChangePassword?: boolean;
}

interface AuthStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  authReady: boolean;
  setAuthReady: (ready: boolean) => void;

  simulatedDeviceId: string;
  simulateNewDevice: () => void;

  login: (regionNo: string, passwordInput: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  quickSwitchUser: (userId: string, users?: User[]) => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    minLength: number,
  ) => Promise<{ success: boolean; message: string }>;
  adminResetPassword: (
    userId: string,
  ) => Promise<{
    success: boolean;
    temporaryPassword?: string;
    message: string;
  }>;
  adminUnlockAccount: (userId: string) => Promise<void>;
  releaseDeviceBinding: (userId: string, reason?: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const getInitialSimulatedDeviceId = () => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}device_id`);
    if (stored) return stored;
    const initial = "web-" + crypto.randomUUID();
    localStorage.setItem(`${STORAGE_PREFIX}device_id`, initial);
    return initial;
  };

  const getInitialCurrentUser = (): User | null => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    currentUser: getInitialCurrentUser(),
    setCurrentUser: (user) => {
      set({ currentUser: user });
      if (user) {
        localStorage.setItem(
          `${STORAGE_PREFIX}current_user`,
          JSON.stringify(user),
        );
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
      }
    },
    authReady: false,
    setAuthReady: (ready) => set({ authReady: ready }),

    simulatedDeviceId: getInitialSimulatedDeviceId(),
    simulateNewDevice: () => {
      const newId =
        "device-uuid-" +
        Math.random().toString(36).substring(2, 11) +
        "-simulated";
      localStorage.setItem(`${STORAGE_PREFIX}device_id`, newId);
      set({ simulatedDeviceId: newId });
    },

    login: async (
      regionNoOrEmail: string,
      passwordInput: string,
    ): Promise<LoginResult> => {
      const trimmedInput = regionNoOrEmail.trim();
      if (!trimmedInput || !passwordInput) {
        return {
          success: false,
          messageAr: "اسم المستخدم وكلمة المرور مطلوبة.",
          messageEn: "Username and password are required.",
        };
      }

      try {
        if (trimmedInput.includes("@")) {
          await signInWithEmailAndPassword(auth, trimmedInput, passwordInput);
          return { success: true, mustChangePassword: false };
        } else {
          const authFunction = httpsCallable(
            functions,
            "authenticateWithRegionPassword",
          );
          const response = await authFunction({
            regionNo: trimmedInput,
            password: passwordInput,
            installationDeviceId: get().simulatedDeviceId,
            platform: "Web",
            appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
          });

          const data = response.data as any;
          if (data.success && data.token) {
            await signInWithCustomToken(auth, data.token);
            const loggedInUser: User = {
              userId: data.userId || data.uid || trimmedInput,
              username: trimmedInput,
              regionNo: data.regionNo,
              allowedRegionNos: data.allowedRegionNos || [data.regionNo],
              repNo: data.repNo || data.regionNo,
              repNameAr: data.repNameAr || trimmedInput,
              repNameEn: data.repNameEn || undefined,
              branchId: data.branchId,
              role: data.role,
              mustChangePassword: Boolean(data.mustChangePassword),
              isActive: true,
              failedLoginCount: 0,
              sessionVersion: Number(data.sessionVersion || 0),
              deviceBindingStatus: "UNBOUND",
              maxAllowedDevices: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            get().setCurrentUser(loggedInUser);
            return {
              success: true,
              mustChangePassword: loggedInUser.mustChangePassword,
            };
          } else {
            return {
              success: false,
              messageAr: "بيانات تسجيل الدخول غير صحيحة.",
              messageEn: "Invalid login credentials.",
            };
          }
        }
      } catch (err: any) {
        console.error("Login Error:", err);
        let errorAr = "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.";
        let errorEn = "Login failed. Please try again.";

        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          errorAr = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
          errorEn = "Invalid email or password.";
        }
        if (err.message) {
          if (
            err.message.includes("User not found") ||
            err.message.includes("Invalid credentials")
          ) {
            errorAr = "البيانات غير صحيحة.";
            errorEn = "Invalid credentials.";
          } else if (err.message.includes("Account is locked")) {
            errorAr = "تم قفل الحساب مؤقتاً. يرجى مراجعة الإدارة.";
            errorEn = "Account is locked. Please contact Admin.";
          } else if (err.message.includes("bound to another device")) {
            errorAr = "هذا الحساب مرتبط بجهاز آخر.";
            errorEn = "This account is linked to another device.";
          } else if (err.message.includes("Account is disabled")) {
            errorAr = "هذا الحساب معطل حالياً.";
            errorEn = "This account is disabled.";
          }
        }

        return { success: false, messageAr: errorAr, messageEn: errorEn };
      }
    },

    logout: async () => {
      await signOut(auth);
      get().setCurrentUser(null);
    },

    quickSwitchUser: (userId: string, users?: User[]) => {
      if (!import.meta.env.DEV) return;
      const userList = users || useDataStore.getState().users;
      const found = userList.find((u) => u.userId === userId);
      if (found) {
        if (found.boundDeviceId) {
          localStorage.setItem(
            `${STORAGE_PREFIX}device_id`,
            found.boundDeviceId,
          );
          set({ simulatedDeviceId: found.boundDeviceId });
        }
        get().setCurrentUser(found);
      }
    },

    changePassword: async (
      currentPassword: string,
      newPassword: string,
      minLength: number,
    ) => {
      const currentUser = get().currentUser;
      if (!currentUser) return { success: false, message: "Not logged in" };
      if (newPassword.length < minLength) {
        return {
          success: false,
          message: `Password must be at least ${minLength} characters`,
        };
      }
      try {
        const changePasswordFn = httpsCallable(functions, "changePassword");
        await changePasswordFn({ currentPassword, newPassword });
        const updated = {
          ...currentUser,
          mustChangePassword: false,
          passwordChangedAt: new Date().toISOString(),
        };
        get().setCurrentUser(updated);
        return { success: true, message: "Password changed successfully." };
      } catch (e) {
        return { success: false, message: "Failed to change password" };
      }
    },

    adminResetPassword: async (userId: string) => {
      const temporaryPassword = `${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}Aa1!`;
      try {
        const resetPasswordFn = httpsCallable(functions, "adminResetPassword");
        await resetPasswordFn({ targetUserId: userId, temporaryPassword });
        return {
          success: true,
          temporaryPassword,
          message: "Temporary password created.",
        };
      } catch (error) {
        return { success: false, message: "Password reset failed." };
      }
    },

    adminUnlockAccount: async (userId: string) => {
      try {
        const unlockFn = httpsCallable(functions, "adminUnlockAccount");
        await unlockFn({ targetUserId: userId });
      } catch (err) {
        console.error("Error unlocking account:", err);
      }
    },

    releaseDeviceBinding: async (userId: string, reason?: string) => {
      try {
        const releaseFn = httpsCallable(functions, "releaseDevice");
        await releaseFn({ targetUserId: userId, reason });
      } catch (err) {
        console.error("Error releasing device:", err);
      }
    },
  };
});

// Initialize Firebase Auth listener and safety timeout
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        await firebaseUser.getIdTokenResult(true);
      } catch (err) {
        console.error("Error refreshing Firebase Auth token:", err);
      }

      const store = useAuthStore.getState();
      if (store.currentUser && store.currentUser.userId === firebaseUser.uid) {
        store.setAuthReady(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          store.setCurrentUser(userDoc.data() as User);
        } else {
          const stored = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as User;
              if (
                parsed &&
                (parsed.userId === firebaseUser.uid ||
                  parsed.username === firebaseUser.email)
              ) {
                store.setCurrentUser(parsed);
              } else {
                store.setCurrentUser(null);
              }
            } catch {
              store.setCurrentUser(null);
            }
          } else {
            store.setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error("Error fetching user from Firestore:", err);
        const stored = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
        if (stored) {
          try {
            store.setCurrentUser(JSON.parse(stored) as User);
          } catch {
            store.setCurrentUser(null);
          }
        }
      }
    } else {
      useAuthStore.getState().setCurrentUser(null);
    }
    useAuthStore.getState().setAuthReady(true);
  });

  // Safety fallback: ensure authReady is set to true within 2.5s even if Firebase is unreachable
  setTimeout(() => {
    if (!useAuthStore.getState().authReady) {
      console.warn("Auth check fallback triggered: setting authReady to true");
      useAuthStore.getState().setAuthReady(true);
    }
  }, 2500);
}
