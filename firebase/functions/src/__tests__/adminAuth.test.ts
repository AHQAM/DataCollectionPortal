import fft from "firebase-functions-test";

const testEnv = fft();

const mockCreateUser = jest.fn().mockResolvedValue({
  uid: "new-admin-uid",
  email: "admin@test.com",
});

const mockSetCustomUserClaims = jest.fn().mockResolvedValue(undefined);

const mockListUsers = jest.fn().mockResolvedValue({
  users: [
    {
      uid: "u1",
      email: "u1@test.com",
      displayName: "User One",
      customClaims: { role: "ADMIN" },
      disabled: false,
      metadata: { lastSignInTime: "2026-09-24T00:00:00Z" },
    },
  ],
});

jest.mock("firebase-admin", () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  auth: () => ({
    createUser: mockCreateUser,
    setCustomUserClaims: mockSetCustomUserClaims,
    listUsers: mockListUsers,
  }),
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue("TIMESTAMP"),
    },
  },
}));

jest.mock("../config/db", () => {
  const mockDoc = {
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ role: "ADMIN", isActive: true }),
    }),
  };
  const mockWhere = {
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: "u1",
          data: () => ({ role: "ADMIN", email: "u1@test.com", username: "u1" }),
        },
      ],
    }),
  };
  return {
    DATABASE_ID: "datacollectionportal",
    db: {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDoc),
        where: jest.fn().mockReturnValue(mockWhere),
      }),
    },
  };
});

jest.mock("../auditLogger", () => ({
  logAuditSafe: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../auth", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed_password"),
}));

import { createAdminSupervisorUser, auditPrivilegedUsers } from "../adminAuth";

describe("Admin Auth Cloud Functions (Gen 2)", () => {
  let wrappedCreateAdminSupervisorUser: any;
  let wrappedAuditPrivilegedUsers: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedCreateAdminSupervisorUser = testEnv.wrap(createAdminSupervisorUser);
    wrappedAuditPrivilegedUsers = testEnv.wrap(auditPrivilegedUsers);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("createAdminSupervisorUser", () => {
    it("throws unauthenticated if context.auth is missing", async () => {
      await expect(
        wrappedCreateAdminSupervisorUser({}, { auth: null }),
      ).rejects.toThrow(/Must be logged in/i);
    });

    it("throws permission-denied if user is not ADMIN", async () => {
      await expect(
        wrappedCreateAdminSupervisorUser(
          {},
          { auth: { uid: "u1", token: { role: "SUPERVISOR" } } },
        ),
      ).rejects.toThrow(/Insufficient permissions/i);
    });

    it("throws invalid-argument if fields are missing", async () => {
      await expect(
        wrappedCreateAdminSupervisorUser(
          { email: "test@test.com" },
          { auth: { uid: "a1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Missing required fields/i);
    });
  });

  describe("auditPrivilegedUsers", () => {
    it("throws permission-denied if user is not ADMIN", async () => {
      await expect(
        wrappedAuditPrivilegedUsers(
          {},
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Admin permission required/i);
    });

    it("audits users successfully when invoked by ADMIN", async () => {
      const res = await wrappedAuditPrivilegedUsers(
        {},
        { auth: { uid: "a1", token: { role: "ADMIN" } } },
      );

      expect(res).toBeDefined();
      expect(res.success).toBe(true);
      expect(res.privilegedUsers.length).toBe(1);
    });
  });
});
