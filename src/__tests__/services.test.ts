import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFn = vi.fn();

vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(() => mockFn),
}));

vi.mock("../firebase", () => ({
  functions: {},
}));

import { userApi } from "../services/userApi";
import { requestApi } from "../services/requestApi";
import { recordApi } from "../services/recordApi";
import { branchRegionApi } from "../services/branchRegionApi";
import { deviceApi } from "../services/deviceApi";
import { systemApi } from "../services/systemApi";

describe("Frontend API Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("userApi", () => {
    it("createUser invokes Cloud Function and returns response data", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, userId: "u-123" },
      });
      const res = await userApi.createUser({ username: "rep1" });
      expect(res).toEqual({ success: true, userId: "u-123" });
    });

    it("createAdminSupervisorUser invokes Cloud Function", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, userId: "admin-1" },
      });
      const res = await userApi.createAdminSupervisorUser({
        email: "admin@test.com",
      });
      expect(res.userId).toBe("admin-1");
    });

    it("updateUser sends target user ID and updates payload", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await userApi.updateUser("u-123", { userNameAr: "محدث" });
      expect(res.success).toBe(true);
    });

    it("deactivateUser invokes deactivate endpoint", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await userApi.deactivateUser("u-123");
      expect(res.success).toBe(true);
    });

    it("requestPasswordReset handles reset requests", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, messageAr: "تم الإرسال" },
      });
      const res = await userApi.requestPasswordReset("REG-10");
      expect(res.success).toBe(true);
    });

    it("adminResetPassword returns temporary password", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, temporaryPassword: "TempPassword123!" },
      });
      const res = await userApi.adminResetPassword("u-123");
      expect(res.temporaryPassword).toBe("TempPassword123!");
    });

    it("adminUnlockAccount unlocks targeted user account", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await userApi.adminUnlockAccount("u-123");
      expect(res.success).toBe(true);
    });

    it("importUsersBatch submits batch of users", async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          success: true,
          created: 5,
          updated: 2,
          createdCount: 5,
          updatedCount: 2,
          temporaryPasswords: [],
        },
      });
      const res = await userApi.importUsersBatch([{ username: "u1" }]);
      expect(res.created).toBe(5);
    });
  });

  describe("requestApi", () => {
    it("createRequest creates request and saves fields if provided", async () => {
      mockFn.mockResolvedValueOnce({ data: { requestId: "req-999" } });
      mockFn.mockResolvedValueOnce({ data: { success: true } });

      const newId = await requestApi.createRequest({ titleAr: "طلب تجريبي" }, [
        {
          fieldId: "f-1",
          fieldKey: "f_1",
          fieldType: "text",
          fieldLabelAr: "حقل",
          fieldLabelEn: "Field",
          isRequired: true,
        } as unknown as any,
      ]);
      expect(newId).toBe("req-999");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("updateDraftRequest updates request draft", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await requestApi.updateDraftRequest("req-1", {
        titleAr: "تعديل",
      });
      expect(res).toEqual({ success: true });
    });

    it("publishRequest publishes request", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await requestApi.publishRequest("req-1");
      expect(res).toEqual({ success: true });
    });

    it("closeRequest, archiveRequest, and reopenRequest operate properly", async () => {
      mockFn.mockResolvedValue({ data: { success: true } });
      await expect(requestApi.closeRequest("req-1")).resolves.toBeDefined();
      await expect(requestApi.archiveRequest("req-1")).resolves.toBeDefined();
      await expect(requestApi.reopenRequest("req-1")).resolves.toBeDefined();
    });

    it("cloneRequest returns new cloned request ID", async () => {
      mockFn.mockResolvedValueOnce({ data: { requestId: "req-cloned" } });
      const clonedId = await requestApi.cloneRequest("req-1");
      expect(clonedId).toBe("req-cloned");
    });

    it("deleteRequest calls delete endpoint", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      await expect(requestApi.deleteRequest("req-1")).resolves.toBeUndefined();
    });

    it("saveRequestFields saves fields directly", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await requestApi.saveRequestFields("req-1", []);
      expect(res).toEqual({ success: true });
    });
  });

  describe("recordApi", () => {
    it("submitRecord calls Cloud Function and returns success", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, responseId: "resp-123" },
      });
      const res = await recordApi.submitRecord("req-1", "rec-1", { q1: "Ans" });
      expect(res.success).toBe(true);
      expect(res.responseId).toBe("resp-123");
    });

    it("submitRecord handles API error gracefully", async () => {
      mockFn.mockRejectedValueOnce(new Error("Network Failure"));
      const res = await recordApi.submitRecord("req-1", "rec-1", {});
      expect(res.success).toBe(false);
      expect(res.message).toBe("Network Failure");
    });

    it("saveDraftRecord handles both success and failure", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await recordApi.saveDraftRecord("req-1", "rec-1", {
        q1: "Draft",
      });
      expect(res.success).toBe(true);

      mockFn.mockRejectedValueOnce(new Error("Storage full"));
      const errRes = await recordApi.saveDraftRecord("req-1", "rec-1", {});
      expect(errRes.success).toBe(false);
      expect(errRes.message).toBe("Storage full");
    });

    it("reassignRecord delegates to reassignRecords", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const res = await recordApi.reassignRecord("rec-1", "user-2");
      expect(res.success).toBe(true);
    });

    it("commitImport returns processed counts", async () => {
      mockFn.mockResolvedValueOnce({ data: { created: 10 } });
      const res = await recordApi.commitImport(
        "req-1",
        new Array(10).fill({}),
        {},
      );
      expect(res.total).toBe(10);
      expect(res.created).toBe(10);
    });
  });

  describe("branchRegionApi", () => {
    it("createBranch and updateBranch call respective endpoints", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, branchId: "b-1" },
      });
      const createRes = await branchRegionApi.createBranch({
        branchId: "b-1",
        branchNameAr: "فرع الرياض",
      });
      expect(createRes.branchId).toBe("b-1");

      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const updateRes = await branchRegionApi.updateBranch("b-1", {
        branchNameAr: "محدث",
      });
      expect(updateRes.success).toBe(true);
    });

    it("deleteBranch catches and reports errors gracefully", async () => {
      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const okRes = await branchRegionApi.deleteBranch("b-1");
      expect(okRes.success).toBe(true);

      mockFn.mockRejectedValueOnce(
        new Error("Cannot delete branch with active reps"),
      );
      const failRes = await branchRegionApi.deleteBranch("b-1");
      expect(failRes.success).toBe(false);
      expect(failRes.message).toBe("Cannot delete branch with active reps");
    });

    it("createRegion, updateRegion, and deleteRegion operate properly", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, regionNo: "R-1" },
      });
      const createRes = await branchRegionApi.createRegion({
        regionNo: "R-1",
        regionNameAr: "المنطقة الأولى",
        branchId: "b-1",
      });
      expect(createRes.regionNo).toBe("R-1");

      mockFn.mockResolvedValueOnce({ data: { success: true } });
      const updateRes = await branchRegionApi.updateRegion("R-1", {
        regionNameAr: "محدثة",
      });
      expect(updateRes.success).toBe(true);

      mockFn.mockRejectedValueOnce(new Error("Cannot delete region"));
      const failRes = await branchRegionApi.deleteRegion("R-1");
      expect(failRes.success).toBe(false);
    });

    it("importBranchesAndRegions sends bulk import data", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, branchesCount: 2, regionsCount: 4 },
      });
      const res = await branchRegionApi.importBranchesAndRegions([], []);
      expect(res.branchesCount).toBe(2);
      expect(res.regionsCount).toBe(4);
    });
  });

  describe("deviceApi", () => {
    it("releaseDevice, replaceDevice, rejectDeviceReplacement, and forceLogoutUser operate properly", async () => {
      mockFn.mockResolvedValue({ data: { success: true } });

      const r1 = await deviceApi.releaseDevice("u-1");
      const r2 = await deviceApi.replaceDevice("u-1");
      const r3 = await deviceApi.rejectDeviceReplacement("binding-1");
      const r4 = await deviceApi.forceLogoutUser("u-1");

      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r3.success).toBe(true);
      expect(r4.success).toBe(true);
    });
  });

  describe("systemApi", () => {
    it("wipeDemoData triggers maintenance wipe", async () => {
      mockFn.mockResolvedValueOnce({
        data: { success: true, messageAr: "تم المسح" },
      });
      const res = await systemApi.wipeDemoData("WIPE_CONFIRM_TOKEN", true);
      expect(res.success).toBe(true);
    });
  });
});
