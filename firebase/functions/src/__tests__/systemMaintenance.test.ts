import fft from "firebase-functions-test";

const testEnv = fft();

const mockBatchCommit = jest.fn().mockResolvedValue([]);
const mockBatchDelete = jest.fn();
const mockBatchUpdate = jest.fn();

const mockBatch = jest.fn().mockReturnValue({
  delete: mockBatchDelete,
  update: mockBatchUpdate,
  commit: mockBatchCommit,
});

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ ref: { id: "d1" }, data: () => ({ totalRecords: 5 }) }],
      }),
    }),
    batch: mockBatch,
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

import { wipeDemoData } from "../systemMaintenance";

describe("System Maintenance Cloud Functions (Gen 2)", () => {
  let wrappedWipeDemoData: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedWipeDemoData = testEnv.wrap(wipeDemoData);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it("throws permission-denied if context.auth is missing or not ADMIN", async () => {
    await expect(
      wrappedWipeDemoData(
        { confirmationToken: "CONFIRM_WIPE_DEMO_DATA" },
        { auth: null },
      ),
    ).rejects.toThrow(/Admin permission required/i);

    await expect(
      wrappedWipeDemoData(
        { confirmationToken: "CONFIRM_WIPE_DEMO_DATA" },
        { auth: { uid: "u1", token: { role: "SUPERVISOR" } } },
      ),
    ).rejects.toThrow(/Admin permission required/i);
  });

  it("throws invalid-argument if confirmationToken is incorrect", async () => {
    await expect(
      wrappedWipeDemoData(
        { confirmationToken: "WRONG_TOKEN" },
        { auth: { uid: "admin1", token: { role: "ADMIN" } } },
      ),
    ).rejects.toThrow(/Invalid confirmation token/i);
  });

  it("successfully executes wipe and returns confirmation when token is valid", async () => {
    const res = await wrappedWipeDemoData(
      {
        confirmationToken: "CONFIRM_WIPE_DEMO_DATA",
        wipeBranchesAndRegions: true,
      },
      { auth: { uid: "admin1", token: { role: "ADMIN" } } },
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(mockBatchCommit).toHaveBeenCalled();
  });
});
