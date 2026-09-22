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
}));

jest.mock("../auditLogger", () => ({
  logAuditSafe: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../auth", () => ({
  hashPassword: jest.fn().mockResolvedValue("mockHashedPassword"),
}));

import { createUser, deactivateUser } from "../userManagement";

describe("User Management Cloud Functions", () => {
  let wrappedCreateUser: any;
  let wrappedDeactivateUser: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedCreateUser = testEnv.wrap(createUser);
    wrappedDeactivateUser = testEnv.wrap(deactivateUser);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("createUser", () => {
    it("throws permission-denied if caller is not ADMIN", async () => {
      await expect(
        wrappedCreateUser(
          { username: "rep1", role: "REP" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Admin permission required/i);
    });

    it("throws invalid-argument if required fields are missing", async () => {
      await expect(
        wrappedCreateUser(
          { username: "rep1" },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Required: username/i);
    });

    it("throws invalid-argument if role is not REP or SUPERVISOR", async () => {
      await expect(
        wrappedCreateUser(
          {
            username: "user1",
            regionNo: "101",
            userNameAr: "مندوب",
            branchId: "B1",
            role: "UNKNOWN_ROLE",
          },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Role must be REP or SUPERVISOR/i);
    });
  });

  describe("deactivateUser", () => {
    it("throws permission-denied if caller is not ADMIN", async () => {
      await expect(
        wrappedDeactivateUser(
          { targetUserId: "u2" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow();
    });
  });
});
