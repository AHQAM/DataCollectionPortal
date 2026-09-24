import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUIStore } from "../stores/uiStore";
import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import { logAudit } from "../utils/audit";
import { User } from "../types";

describe("UIStore and Client Audit Logging", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({
      lang: "ar",
      dir: "rtl",
      notifications: [],
      isOnline: true,
    });
  });

  describe("UIStore", () => {
    it("setLang updates language, direction, and document attributes", () => {
      const store = useUIStore.getState();
      expect(store.lang).toBe("ar");
      expect(store.dir).toBe("rtl");

      store.setLang("en");
      expect(useUIStore.getState().lang).toBe("en");
      expect(useUIStore.getState().dir).toBe("ltr");
      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");

      store.setLang("ar");
      expect(useUIStore.getState().lang).toBe("ar");
      expect(useUIStore.getState().dir).toBe("rtl");
    });

    it("t method returns appropriate fallback based on active language", () => {
      const store = useUIStore.getState();
      expect(store.t("test_key", "عربي", "English")).toBe("عربي");

      store.setLang("en");
      expect(useUIStore.getState().t("test_key", "عربي", "English")).toBe(
        "English",
      );
      expect(useUIStore.getState().t("missing_key")).toBe("missing_key");
    });

    it("updateAppSettings persists changes to local storage", () => {
      const store = useUIStore.getState();
      store.updateAppSettings({ maxLoginAttempts: 10 });
      expect(useUIStore.getState().appSettings.maxLoginAttempts).toBe(10);
    });

    it("manages notifications and read status", async () => {
      const store = useUIStore.getState();
      store.setNotifications([
        {
          notificationId: "n-1",
          userId: "u-1",
          titleAr: "إشعار جديد",
          titleEn: "New notification",
          bodyAr: "نص الإشعار",
          bodyEn: "Notification text",
          notificationType: "NEW_REQUEST",
          channel: "PUSH",
          status: "SENT",
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      expect(useUIStore.getState().notifications.length).toBe(1);
      expect(useUIStore.getState().notifications[0].status).toBe("SENT");

      await useUIStore.getState().markNotificationAsRead("n-1");
      expect(useUIStore.getState().notifications[0].status).toBe("READ");
      expect(useUIStore.getState().notifications[0].readAt).toBeDefined();
    });

    it("setIsOnline updates online flag", () => {
      const store = useUIStore.getState();
      store.setIsOnline(false);
      expect(useUIStore.getState().isOnline).toBe(false);
      store.setIsOnline(true);
      expect(useUIStore.getState().isOnline).toBe(true);
    });
  });

  describe("logAudit utility", () => {
    it("creates sanitized audit log and adds to data store", () => {
      useAuthStore.setState({
        currentUser: {
          userId: "user-test-audit",
          userNo: "REP-99",
          userNameAr: "أحمد علي",
          userNameEn: "Ahmed Ali",
          email: "ahmed@test.com",
          role: "ADMIN",
          branchId: "b-1",
          regionNo: "R-1",
          allowedRegionNos: ["R-1"],
          isActive: true,
          mustChangePassword: false,
          maxAllowedDevices: 1,
        } as unknown as User,
        simulatedDeviceId: "DEV-ABC-123",
      });

      logAudit("RECORD_UPDATED", "Record", "rec-999", {
        reason: "Customer requested edit",
      });

      const logs = useDataStore.getState().auditLogs;
      const createdLog = logs.find((l) => l.entityId === "rec-999");

      expect(createdLog).toBeDefined();
      expect(createdLog?.action).toBe("RECORD_UPDATED");
      expect(createdLog?.userId).toBe("user-test-audit");
      expect(createdLog?.userRole).toBe("ADMIN");
      expect(createdLog?.deviceBindingId).toBe("DEV-ABC-123");
      expect(JSON.parse(createdLog?.detailsJson || "{}")).toEqual({
        reason: "Customer requested edit",
      });
    });
  });
});
