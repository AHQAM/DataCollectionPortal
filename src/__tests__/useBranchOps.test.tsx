import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBranchOps } from "../hooks/useBranchOps";
import { branchRegionApi } from "../services";
import { logAudit } from "../utils/audit";

vi.mock("../services", () => ({
  branchRegionApi: {
    createBranch: vi.fn(),
    updateBranch: vi.fn(),
    deleteBranch: vi.fn(),
    createRegion: vi.fn(),
    updateRegion: vi.fn(),
    deleteRegion: vi.fn(),
    importBranchesAndRegions: vi.fn(),
  },
}));

vi.mock("../utils/audit", () => ({
  logAudit: vi.fn(),
}));

describe("useBranchOps Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Branch Operations", () => {
    it("creates branch and logs audit on success", async () => {
      vi.mocked(branchRegionApi.createBranch).mockResolvedValueOnce(
        undefined as any,
      );

      const hook = useBranchOps();
      const res = await hook.createBranch({
        branchId: "b1",
        branchNameAr: "فرع 1",
        branchNameEn: "Branch 1",
      });

      expect(res.success).toBe(true);
      expect(branchRegionApi.createBranch).toHaveBeenCalled();
      expect(logAudit).toHaveBeenCalledWith(
        "BRANCH_CREATED",
        "Branch",
        "b1",
        expect.any(Object),
      );
    });

    it("returns error and no audit log on create branch failure", async () => {
      vi.mocked(branchRegionApi.createBranch).mockRejectedValueOnce(
        new Error("API Error"),
      );

      const hook = useBranchOps();
      const res = await hook.createBranch({
        branchId: "b1",
        branchNameAr: "فرع 1",
        branchNameEn: "Branch 1",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeInstanceOf(Error);
      expect(logAudit).not.toHaveBeenCalled();
    });

    it("updates branch and logs audit", async () => {
      vi.mocked(branchRegionApi.updateBranch).mockResolvedValueOnce(
        undefined as any,
      );

      const hook = useBranchOps();
      const res = await hook.updateBranch("b1", { isActive: false });

      expect(res.success).toBe(true);
      expect(logAudit).toHaveBeenCalledWith("BRANCH_UPDATED", "Branch", "b1", {
        isActive: false,
      });
    });

    it("deletes branch successfully", async () => {
      vi.mocked(branchRegionApi.deleteBranch).mockResolvedValueOnce({
        success: true,
      } as any);

      const hook = useBranchOps();
      const res = await hook.deleteBranch("b1");

      expect(res.success).toBe(true);
      expect(logAudit).toHaveBeenCalledWith(
        "BRANCH_DELETED",
        "Branch",
        "b1",
        expect.any(Object),
      );
    });

    it("handles delete branch rejection from API", async () => {
      vi.mocked(branchRegionApi.deleteBranch).mockResolvedValueOnce({
        success: false,
        message: "Has active regions",
      } as any);

      const hook = useBranchOps();
      const res = await hook.deleteBranch("b1");

      expect(res.success).toBe(false);
      expect(res.message).toBe("Has active regions");
      expect(logAudit).not.toHaveBeenCalled();
    });
  });

  describe("Region Operations", () => {
    it("creates region and logs audit", async () => {
      vi.mocked(branchRegionApi.createRegion).mockResolvedValueOnce(
        undefined as any,
      );

      const hook = useBranchOps();
      const res = await hook.createRegion({
        regionNo: "R1",
        regionNameAr: "منطقة 1",
        branchId: "b1",
      });

      expect(res.success).toBe(true);
      expect(logAudit).toHaveBeenCalledWith(
        "REGION_CREATED",
        "Region",
        "R1",
        expect.any(Object),
      );
    });

    it("deletes region successfully", async () => {
      vi.mocked(branchRegionApi.deleteRegion).mockResolvedValueOnce({
        success: true,
      } as any);

      const hook = useBranchOps();
      const res = await hook.deleteRegion("R1");

      expect(res.success).toBe(true);
      expect(logAudit).toHaveBeenCalledWith(
        "REGION_DELETED",
        "Region",
        "R1",
        expect.any(Object),
      );
    });
  });
});
