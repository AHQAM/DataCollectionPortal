import fft from "firebase-functions-test";

const testEnv = fft();

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("firebase-admin", () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: jest.fn(),
}));

jest.mock("../auditLogger", () => ({
  logAuditSafe: jest.fn().mockResolvedValue(undefined),
}));

import { changePassword, adminResetPassword } from "../passwordManagement";

describe("Password Management Cloud Functions", () => {
  let wrappedChangePassword: any;
  let wrappedAdminResetPassword: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedChangePassword = testEnv.wrap(changePassword);
    wrappedAdminResetPassword = testEnv.wrap(adminResetPassword);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("changePassword", () => {
    it("throws unauthenticated if context.auth is missing", async () => {
      await expect(
        wrappedChangePassword(
          { currentPassword: "old", newPassword: "newPassword123" },
          { auth: null },
        ),
      ).rejects.toThrow(/Authentication required/i);
    });

    it("throws invalid-argument if current or new password is missing", async () => {
      await expect(
        wrappedChangePassword(
          { currentPassword: "", newPassword: "newPassword123" },
          { auth: { uid: "u1" } },
        ),
      ).rejects.toThrow(/required/i);
    });

    it("throws invalid-argument if new password is too short", async () => {
      await expect(
        wrappedChangePassword(
          { currentPassword: "oldPassword", newPassword: "123" },
          { auth: { uid: "u1" } },
        ),
      ).rejects.toThrow(/at least 6 characters/i);
    });
  });

  describe("adminResetPassword", () => {
    it("throws unauthenticated if not logged in", async () => {
      await expect(
        wrappedAdminResetPassword({ targetUserId: "u2" }, { auth: null }),
      ).rejects.toThrow();
    });

    it("throws permission-denied if user is not ADMIN or SUPERVISOR", async () => {
      await expect(
        wrappedAdminResetPassword(
          { targetUserId: "u2" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow();
    });
  });
});
