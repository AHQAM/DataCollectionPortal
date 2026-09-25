import { create } from "zustand";
import { AppSettings, NotificationItem } from "../types";
import { DEFAULT_APP_SETTINGS } from "../data/seedData";
import i18n from "../i18n";
import {
  sendBrowserNotification,
  requestBrowserNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from "../utils/webNotification";

const STORAGE_PREFIX = "sales_collection_hub_v1_";

interface UIStore {
  lang: "ar" | "en";
  setLang: (lang: "ar" | "en") => void;
  dir: "rtl" | "ltr";
  t: (key: string, defaultAr?: string, defaultEn?: string) => string;

  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;

  notifications: NotificationItem[];
  setNotifications: (notifications: NotificationItem[]) => void;
  markNotificationAsRead: (notificationId: string) => Promise<void>;

  isPushSupported: boolean;
  pushPermission: NotificationPermission | "unsupported";
  enablePushNotifications: () => Promise<boolean>;

  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => {
  const savedLang =
    (localStorage.getItem(`${STORAGE_PREFIX}lang`) as "ar" | "en") || "ar";
  const savedSettings = localStorage.getItem(`${STORAGE_PREFIX}settings`);
  const initialSettings = savedSettings
    ? JSON.parse(savedSettings)
    : DEFAULT_APP_SETTINGS;

  return {
    lang: savedLang,
    dir: savedLang === "ar" ? "rtl" : "ltr",
    setLang: (newLang) => {
      localStorage.setItem(`${STORAGE_PREFIX}lang`, newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      if (i18n && typeof i18n.changeLanguage === "function") {
        i18n.changeLanguage(newLang);
      }
      set({ lang: newLang, dir: newLang === "ar" ? "rtl" : "ltr" });
    },
    t: (key, defaultAr, defaultEn) => {
      const { lang } = get();
      if (i18n && typeof i18n.t === "function") {
        const translated = i18n.t(key, { lng: lang });
        if (translated && translated !== key) return translated;
      }
      if (lang === "en") return defaultEn || key;
      return defaultAr || key;
    },

    appSettings: initialSettings,
    updateAppSettings: (settings) => {
      set((state) => {
        const newSettings = { ...state.appSettings, ...settings };
        localStorage.setItem(
          `${STORAGE_PREFIX}settings`,
          JSON.stringify(newSettings),
        );
        return { appSettings: newSettings };
      });
    },

    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    markNotificationAsRead: async (notificationId) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.notificationId === notificationId
            ? { ...n, status: "READ", readAt: new Date().toISOString() }
            : n,
        ),
      }));
    },

    isPushSupported: isNotificationSupported(),
    pushPermission: getNotificationPermissionStatus(),
    enablePushNotifications: async () => {
      const res = await requestBrowserNotificationPermission();
      set({ pushPermission: res });
      if (res === "granted") {
        const { lang } = get();
        sendBrowserNotification(i18n.t("auto.pushNotificationsEnabled"), {
          body: i18n.t("auto.youWillNowReceive"),
        });
        return true;
      }
      return false;
    },

    isOnline: navigator.onLine,
    setIsOnline: (online) => set({ isOnline: online }),
  };
});
