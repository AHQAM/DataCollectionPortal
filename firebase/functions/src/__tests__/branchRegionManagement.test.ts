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

import { createBranch, deleteBranch } from "../branchRegionManagement";

describe("Branch & Region Management Cloud Functions", () => {
  let wrappedCreateBranch: any;
  let wrappedDeleteBranch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedCreateBranch = testEnv.wrap(createBranch);
    wrappedDeleteBranch = testEnv.wrap(deleteBranch);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("createBranch", () => {
    it("throws permission-denied if caller is not ADMIN", async () => {
      await expect(
        wrappedCreateBranch(
          { branchId: "B1", branchNameAr: "فرع 1" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Admin permission required/i);
    });

    it("throws invalid-argument if branchId or branchNameAr is missing", async () => {
      await expect(
        wrappedCreateBranch(
          { branchId: "" },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Missing required branch fields/i);
    });
  });

  describe("deleteBranch", () => {
    it("throws permission-denied if caller is not ADMIN", async () => {
      await expect(
        wrappedDeleteBranch(
          { branchId: "B1" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow();
    });
  });
});
