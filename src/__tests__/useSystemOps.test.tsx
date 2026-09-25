import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSystemOps } from "../hooks/useSystemOps";
import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import { deviceApi, userApi, templateApi, systemApi } from "../services";
import { logAudit } from "../utils/audit";

vi.mock("../services", () => ({
  deviceApi: {
    replaceDevice: vi.fn(),
    releaseDevice: vi.fn(),
    rejectDeviceReplacement: vi.fn(),
  },
  userApi: {
    requestPasswordReset: vi.fn(),
    adminResetPassword: vi.fn(),
    adminUnlockAccount: vi.fn(),
  },
  templateApi: {
    saveTemplate: vi.fn(),
  },
  systemApi: {
    wipeDemoData: vi.fn(),
  },
}));

vi.mock("../utils/audit", () => ({
  logAudit: vi.fn(),
}));

describe("useSystemOps Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Device Operations", () => {
    it("approveDeviceReplacement succeeds and logs audit", async () => {
      vi.mocked(deviceApi.replaceDevice).mockResolvedValueOnce(undefined as any);
      const hook = useSystemOps();
      const res = await hook.approveDeviceReplacement("u1", "lost");

      expect(res.success).toBe(true);
      expect(deviceApi.replaceDevice).toHaveBeenCalledWith("u1", "lost");
      expect(logAudit).toHaveBeenCalledWith(
        "DEVICE_REPLACEMENT_APPROVED",
        "DeviceBinding",
        "u1",
        { reason: "lost" },
      );
    });

    it("releaseDeviceBinding succeeds and logs audit", async () => {
      vi.mocked(deviceApi.releaseDevice).mockResolvedValueOnce(undefined as any);
      const hook = useSystemOps();
      const res = await hook.releaseDeviceBinding("u1");

      expect(res.success).toBe(true);
      expect(deviceApi.releaseDevice).toHaveBeenCalledWith("u1", undefined);
      expect(logAudit).toHaveBeenCalledWith(
        "DEVICE_RELEASED",
        "DeviceBinding",
        "u1",
        { reason: undefined },
      );
    });

    it("rejectDeviceReplacement succeeds and logs audit", async () => {
      vi.mocked(deviceApi.rejectDeviceReplacement).mockResolvedValueOnce(
        undefined as any,
      );
      const hook = useSystemOps();
      const res = await hook.rejectDeviceReplacement("b1", "denied");

      expect(res.success).toBe(true);
      expect(deviceApi.rejectDeviceReplacement).toHaveBeenCalledWith(
        "b1",
        "denied",
      );
    });
  });

  describe("Password & Auth Operations", () => {
    it("requestPasswordReset succeeds", async () => {
      vi.mocked(userApi.requestPasswordReset).mockResolvedValueOnce({
        success: true,
      } as any);
      const hook = useSystemOps();
      const res = await hook.requestPasswordReset("reg1");
      expect(res.success).toBe(true);
    });

    it("adminResetPassword succeeds", async () => {
      vi.mocked(userApi.adminResetPassword).mockResolvedValueOnce({
        success: true,
      } as any);
      const hook = useSystemOps();
      const res = await hook.adminResetPassword("u1", "pass123");
      expect(res.success).toBe(true);
    });

    it("adminUnlockAccount succeeds", async () => {
      vi.mocked(userApi.adminUnlockAccount).mockResolvedValueOnce({
        success: true,
      } as any);
      const hook = useSystemOps();
      const res = await hook.adminUnlockAccount("u1");
      expect(res.success).toBe(true);
    });
  });

  describe("Template Operations", () => {
    it("saveAsTemplate fails if request not found", async () => {
      useDataStore.setState({ requests: [] });
      const hook = useSystemOps();
      const res = await hook.saveAsTemplate("req1", "ar", "en", "cat");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Request not found");
    });

    it("saveAsTemplate succeeds when request exists", async () => {
      useDataStore.setState({
        requests: [{ requestId: "req1", tags: ["t1"] } as any],
        fields: [{ requestId: "req1", fieldId: "f1" } as any],
      });
      useAuthStore.setState({ currentUser: { userId: "admin1" } as any });
      vi.mocked(templateApi.saveTemplate).mockResolvedValueOnce(undefined as any);

      const hook = useSystemOps();
      const res = await hook.saveAsTemplate("req1", "ar", "en", "cat");
      expect(res.success).toBe(true);
      expect(templateApi.saveTemplate).toHaveBeenCalled();
    });
  });

  describe("System Maintenance", () => {
    it("wipeDemoDataForProduction calls systemApi", async () => {
      vi.mocked(systemApi.wipeDemoData).mockResolvedValueOnce({ wiped: true } as any);
      const hook = useSystemOps();
      const res = await hook.wipeDemoDataForProduction();
      expect(res.success).toBe(true);
      expect(systemApi.wipeDemoData).toHaveBeenCalledWith(
        "CONFIRM_WIPE_DEMO_DATA",
        undefined,
      );
    });
  });
});
