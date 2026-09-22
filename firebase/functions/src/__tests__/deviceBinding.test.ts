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
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue("TIMESTAMP"),
    },
  },
  auth: () => ({
    revokeRefreshTokens: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("../auditLogger", () => ({
  logAuditSafe: jest.fn().mockResolvedValue(undefined),
}));

import { releaseDevice, forceLogoutUser } from "../deviceBinding";

describe("Device Binding Cloud Functions", () => {
  let wrappedReleaseDevice: any;
  let wrappedForceLogoutUser: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedReleaseDevice = testEnv.wrap(releaseDevice);
    wrappedForceLogoutUser = testEnv.wrap(forceLogoutUser);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("releaseDevice", () => {
    it("throws permission-denied if user is not ADMIN", async () => {
      await expect(
        wrappedReleaseDevice(
          { targetUserId: "u1" },
          { auth: { uid: "u2", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Only administrators can release devices/i);
    });

    it("throws invalid-argument if targetUserId is missing", async () => {
      await expect(
        wrappedReleaseDevice(
          {},
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Missing targetUserId/i);
    });
  });

  describe("forceLogoutUser", () => {
    it("throws permission-denied if caller is not ADMIN", async () => {
      await expect(
        wrappedForceLogoutUser(
          { targetUserId: "u1" },
          { auth: { uid: "u2", token: { role: "REP" } } },
        ),
      ).rejects.toThrow();
    });
  });
});
