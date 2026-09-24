import fft from "firebase-functions-test";

const testEnv = fft();

const mockGet = jest.fn().mockResolvedValue({
  docs: [
    {
      data: () => ({
        recordId: "rec-1",
        recordStatus: "Completed",
        targetId: "t-1",
        targetName: "Target One",
        regionNo: "R01",
        branchName: "Branch A",
        userNo: "U1",
        userName: "Rep User",
      }),
    },
  ],
});

const mockQuery = {
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnValue({ get: mockGet }),
  get: mockGet,
};

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn().mockReturnValue(mockQuery),
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

import { exportReport } from "../reportExport";

describe("Report Export Cloud Functions (Gen 2)", () => {
  let wrappedExportReport: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedExportReport = testEnv.wrap(exportReport);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it("throws permission-denied if context.auth is missing", async () => {
    await expect(
      wrappedExportReport({ requestId: "req-1" }, { auth: null }),
    ).rejects.toThrow(/Only admins or supervisors can export reports/i);
  });

  it("throws invalid-argument if requestId is missing", async () => {
    await expect(
      wrappedExportReport(
        {},
        { auth: { uid: "admin1", token: { role: "ADMIN" } } },
      ),
    ).rejects.toThrow(/Missing requestId/i);
  });

  it("exports CSV string successfully for valid request", async () => {
    const res = await wrappedExportReport(
      { requestId: "req-1" },
      { auth: { uid: "admin1", token: { role: "ADMIN" } } },
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.csvString).toContain("Record ID");
    expect(res.csvString).toContain("rec-1");
  });
});
