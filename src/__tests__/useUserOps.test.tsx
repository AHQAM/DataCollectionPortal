import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUserOps } from "../hooks/useUserOps";
import { useDataStore } from "../stores/dataStore";
import { userApi } from "../services";
import { logAudit } from "../utils/audit";

vi.mock("../services", () => ({
  userApi: {
    updateUser: vi.fn(),
    createAdminSupervisorUser: vi.fn(),
    createUser: vi.fn(),
    deactivateUser: vi.fn(),
    reactivateUser: vi.fn(),
    updateUserDevices: vi.fn(),
  },
}));

vi.mock("../utils/audit", () => ({
  logAudit: vi.fn(),
}));

describe("useUserOps Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDataStore.setState({
      users: [
        {
          userId: "u1",
          userNameAr: "علي",
          userNameEn: "Ali",
          role: "REP",
          branchId: "b1",
          isActive: true,
          allowedRegionNos: [],
        } as any,
      ],
      branches: [
        {
          branchId: "b1",
          nameAr: "فرع ١",
          nameEn: "Branch 1",
          isActive: true,
        } as any,
      ],
    });
  });

  describe("updateUser", () => {
    it("returns success and logs audit when update succeeds", async () => {
      vi.mocked(userApi.updateUser).mockResolvedValueOnce({
        success: true,
      } as any);

      const hook = useUserOps();
      const userObj = {
        userId: "u1",
        userNameAr: "محمد",
        role: "REP",
        isActive: true,
      } as any;
      const res = await hook.updateUser(userObj);

      expect(res.success).toBe(true);
      expect(userApi.updateUser).toHaveBeenCalledWith("u1", expect.any(Object));
      expect(logAudit).toHaveBeenCalledWith(
        "USER_UPDATED",
        "User",
        "u1",
        expect.any(Object),
      );

      // Optimistic update
      const users = useDataStore.getState().users;
      expect(users.find((u) => u.userId === "u1")?.userNameAr).toBe("محمد");
    });

    it("returns failure, does not log audit, and rolls back local state when update fails", async () => {
      vi.mocked(userApi.updateUser).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      const hook = useUserOps();
      const userObj = {
        userId: "u1",
        userNameAr: "محمد",
        role: "REP",
        isActive: true,
      } as any;
      const res = await hook.updateUser(userObj);

      expect(res.success).toBe(false);
      expect(res.error).toBeInstanceOf(Error);
      expect(logAudit).not.toHaveBeenCalled();

      // Rollback expected
      const users = useDataStore.getState().users;
      expect(users.find((u) => u.userId === "u1")?.userNameAr).toBe("علي");
    });
  });

  describe("addUser", () => {
    it("creates admin user and logs audit", async () => {
      vi.mocked(userApi.createAdminSupervisorUser).mockResolvedValueOnce({
        success: true,
        userId: "new_u2",
      } as any);

      const hook = useUserOps();
      const res = await hook.addUser({
        role: "ADMIN",
        regionNo: "admin@test.com",
        userNameAr: "المدير",
      });

      expect(res.success).toBe(true);
      expect(userApi.createAdminSupervisorUser).toHaveBeenCalled();
      expect(logAudit).toHaveBeenCalledWith(
        "USER_CREATED_VIA_CF",
        "User",
        "new_u2",
        expect.any(Object),
      );
    });

    it("creates rep user and logs audit", async () => {
      vi.mocked(userApi.createUser).mockResolvedValueOnce({
        success: true,
        userId: "new_u3",
      } as any);

      const hook = useUserOps();
      const res = await hook.addUser({
        role: "REP",
        userNo: "R123",
        userNameAr: "مندوب جديد",
      });

      expect(res.success).toBe(true);
      expect(userApi.createUser).toHaveBeenCalled();
      expect(logAudit).toHaveBeenCalledWith(
        "USER_CREATED_VIA_CF",
        "User",
        "new_u3",
        expect.any(Object),
      );
    });
  });

  describe("deactivateUser", () => {
    it("deactivates and logs", async () => {
      vi.mocked(userApi.deactivateUser).mockResolvedValueOnce({
        success: true,
      } as any);

      const hook = useUserOps();
      const res = await hook.deactivateUser("u1");

      expect(res.success).toBe(true);
      expect(logAudit).toHaveBeenCalledWith(
        "USER_DEACTIVATED_CF",
        "User",
        "u1",
        expect.any(Object),
      );
    });
  });
});
