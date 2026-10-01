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

import { createUser, importUsersBatch } from "../userManagement";
import { db } from "../config/db";

describe("User Management Cloud Functions", () => {
  let wrappedCreateUser: any;
  let wrappedImportUsersBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedCreateUser = testEnv.wrap(createUser);
    wrappedImportUsersBatch = testEnv.wrap(importUsersBatch);
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

    it("rejects malformed batch entries", async () => {
      await expect(
        wrappedImportUsersBatch(
          { users: ["invalid"] },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/valid object under 32 KB/i);
    });

    it("creates valid users and returns temporary passwords", async () => {
      const batch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      const userCollection = {
        get: jest.fn().mockResolvedValue({ docs: [] }),
        doc: jest.fn().mockReturnValue({}),
      };
      (db.collection as jest.Mock).mockImplementation((name: string) =>
        name === "users" ? userCollection : {},
      );
      (db as any).batch = jest.fn().mockReturnValue(batch);

      const result = await wrappedImportUsersBatch(
        {
          users: [
            {
              username: "rep-1",
              regionNo: "101",
              userNameAr: "مندوب 1",
              branchId: "B1",
              role: "REP",
            },
          ],
        },
        { auth: { uid: "admin1", token: { role: "ADMIN" } } },
      );

      expect(result).toMatchObject({ success: true, created: 1, skipped: 0 });
      expect(result.temporaryPasswords).toHaveLength(1);
      expect(batch.set).toHaveBeenCalled();
      expect(batch.commit).toHaveBeenCalled();
    });

    it("reports rows missing required fields without writing them", async () => {
      const batch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (db.collection as jest.Mock).mockImplementation((name: string) =>
        name === "users"
          ? { get: jest.fn().mockResolvedValue({ docs: [] }) }
          : {},
      );
      (db as any).batch = jest.fn().mockReturnValue(batch);

      const result = await wrappedImportUsersBatch(
        { users: [{ username: "missing-branch", userNameAr: "User" }] },
        { auth: { uid: "admin1", token: { role: "ADMIN" } } },
      );

      expect(result).toMatchObject({ success: true, created: 0, skipped: 1 });
      expect(result.errors).toHaveLength(1);
      expect(batch.set).not.toHaveBeenCalled();
    });
  });
});
