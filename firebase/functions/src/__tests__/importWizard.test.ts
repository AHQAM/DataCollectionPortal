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

jest.mock("../notificationService", () => ({
  sendNotificationInternal: jest.fn().mockResolvedValue(undefined),
}));

import { commitImport, importDataPreview } from "../importWizard";

describe("Import Wizard Cloud Functions", () => {
  let wrappedCommitImport: any;
  let wrappedImportDataPreview: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedCommitImport = testEnv.wrap(commitImport);
    wrappedImportDataPreview = testEnv.wrap(importDataPreview);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("importDataPreview", () => {
    it("throws unauthenticated if user is not logged in", async () => {
      await expect(
        wrappedImportDataPreview({}, { auth: null }),
      ).rejects.toThrow(/User must be authenticated/i);
    });

    it("throws permission-denied if user is not ADMIN or SUPERVISOR", async () => {
      await expect(
        wrappedImportDataPreview(
          {},
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Only admins or supervisors/i);
    });

    it("returns success preview for admin", async () => {
      const res = await wrappedImportDataPreview(
        {},
        { auth: { uid: "admin1", token: { role: "ADMIN" } } },
      );
      expect(res.success).toBe(true);
    });
  });

  describe("commitImport", () => {
    it("throws invalid-argument if required fields are missing", async () => {
      await expect(
        wrappedCommitImport(
          { requestId: "req1", importedRows: [] },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Missing required fields/i);
    });
  });
});
