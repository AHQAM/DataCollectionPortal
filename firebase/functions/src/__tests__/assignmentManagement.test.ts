import fft from "firebase-functions-test";

const testEnv = fft();

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn(),
    batch: jest.fn().mockReturnValue({
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue([]),
    }),
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

import { reassignRecords } from "../assignmentManagement";

describe("Assignment Management Cloud Functions", () => {
  let wrappedReassignRecords: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedReassignRecords = testEnv.wrap(reassignRecords);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("reassignRecords", () => {
    it("throws unauthenticated if user is not logged in", async () => {
      await expect(
        wrappedReassignRecords(
          { recordIds: ["r1"], newUserId: "u2" },
          { auth: null },
        ),
      ).rejects.toThrow(/User must be authenticated/i);
    });

    it("throws permission-denied if user is not ADMIN or SUPERVISOR", async () => {
      await expect(
        wrappedReassignRecords(
          { recordIds: ["r1"], newUserId: "u2" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Only admins or supervisors/i);
    });

    it("throws invalid-argument if recordIds or newUserId is missing", async () => {
      await expect(
        wrappedReassignRecords(
          { recordIds: [] },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/recordIds array and newUserId are required/i);
    });
  });
});
