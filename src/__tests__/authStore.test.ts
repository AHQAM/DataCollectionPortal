import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFn = vi.fn();

vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(() => mockFn),
}));

vi.mock("firebase/auth", () => ({
  signInWithCustomToken: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    // Call with null to finish loading
    cb(null);
    return () => {};
  }),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock("../firebase", () => ({
  auth: {},
  functions: {},
  db: {},
}));

import { useAuthStore } from "../stores/authStore";
import { User } from "../types";

const mockUser: User = {
  userId: "user-auth-1",
  userNo: "REP-101",
  userNameAr: "سالم المنصور",
  userNameEn: "Salem Al-Mansoor",
  email: "salem@example.com",
  role: "REP",
  branchId: "b-1",
  regionNo: "R-10",
  allowedRegionNos: ["R-10"],
  isActive: true,
  mustChangePassword: false,
  maxAllowedDevices: 1,
} as unknown as User;

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      currentUser: null,
      authReady: true,
    });
  });

  it("setCurrentUser sets user in store and persists in localStorage", () => {
    useAuthStore.getState().setCurrentUser(mockUser);
    expect(useAuthStore.getState().currentUser).toEqual(mockUser);
    expect(
      localStorage.getItem("sales_collection_hub_v1_current_user"),
    ).toContain("user-auth-1");

    useAuthStore.getState().setCurrentUser(null);
    expect(useAuthStore.getState().currentUser).toBeNull();
    expect(
      localStorage.getItem("sales_collection_hub_v1_current_user"),
    ).toBeNull();
  });

  it("simulateNewDevice updates device ID and persists in localStorage", () => {
    const initialId = useAuthStore.getState().simulatedDeviceId;
    useAuthStore.getState().simulateNewDevice();
    const newId = useAuthStore.getState().simulatedDeviceId;

    expect(newId).toMatch(/^device-uuid-/);
    expect(newId).not.toBe(initialId);
    expect(localStorage.getItem("sales_collection_hub_v1_device_id")).toBe(
      newId,
    );
  });

  it("quickSwitchUser changes active user from list", () => {
    const user2: User = { ...mockUser, userId: "user-auth-2", role: "ADMIN" };
    useAuthStore.getState().quickSwitchUser("user-auth-2", [mockUser, user2]);
    expect(useAuthStore.getState().currentUser?.userId).toBe("user-auth-2");
    expect(useAuthStore.getState().currentUser?.role).toBe("ADMIN");
  });

  it("logout clears active user and calls signOut", async () => {
    useAuthStore.getState().setCurrentUser(mockUser);
    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().currentUser).toBeNull();
    expect(
      localStorage.getItem("sales_collection_hub_v1_current_user"),
    ).toBeNull();
  });

  it("changePassword rejects passwords shorter than minLength", async () => {
    useAuthStore.getState().setCurrentUser(mockUser);
    const res = await useAuthStore
      .getState()
      .changePassword("oldPass", "123", 8);

    expect(res.success).toBe(false);
    expect(res.message).toContain("at least 8 characters");
  });

  it("changePassword succeeds and clears mustChangePassword flag", async () => {
    useAuthStore.getState().setCurrentUser({
      ...mockUser,
      mustChangePassword: true,
    });

    mockFn.mockResolvedValueOnce({ data: { success: true } });
    const res = await useAuthStore
      .getState()
      .changePassword("OldPassword123!", "NewPassword123!", 8);

    expect(res.success).toBe(true);
    expect(useAuthStore.getState().currentUser?.mustChangePassword).toBe(false);
  });

  it("adminResetPassword generates temporary password and calls Cloud Function", async () => {
    mockFn.mockResolvedValueOnce({ data: { success: true } });
    const res = await useAuthStore.getState().adminResetPassword("user-target");

    expect(res.success).toBe(true);
    expect(res.temporaryPassword).toBeDefined();
    expect(res.temporaryPassword?.length).toBeGreaterThan(8);
  });

  it("adminUnlockAccount and releaseDeviceBinding call respective Cloud Functions", async () => {
    mockFn.mockResolvedValue({ data: { success: true } });

    await useAuthStore.getState().adminUnlockAccount("user-target");
    expect(mockFn).toHaveBeenCalledWith({ targetUserId: "user-target" });

    await useAuthStore
      .getState()
      .releaseDeviceBinding("user-target", "Replaced phone");
    expect(mockFn).toHaveBeenCalledWith({
      targetUserId: "user-target",
      reason: "Replaced phone",
    });
  });
});
