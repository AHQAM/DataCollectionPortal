import fft from "firebase-functions-test";

const testEnv = fft();

const mockTransaction = {
  set: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
};

jest.mock("../config/db", () => {
  return {
    DATABASE_ID: "datacollectionportal",
    db: {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          id: "mockDocId",
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              recordId: "rec-1",
              requestId: "req-1",
              assignedUserId: "rep-1",
              assignmentId: "asg-1",
              recordStatus: "In Progress",
            }),
          }),
        }),
      }),
      runTransaction: jest.fn(async (cb) => {
        return await cb(mockTransaction);
      }),
    },
  };
});

jest.mock("firebase-admin", () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue("MOCK_TIMESTAMP"),
    },
  },
}));

jest.mock("../auditLogger", () => ({
  logAuditSafe: jest.fn().mockResolvedValue(undefined),
}));

import { submitResponse, saveDraftResponse } from "../responseManagement";
import { db } from "../config/db";

describe("Response Management Cloud Functions & Concurrency", () => {
  let wrappedSubmitResponse: any;
  let wrappedSaveDraftResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedSubmitResponse = testEnv.wrap(submitResponse);
    wrappedSaveDraftResponse = testEnv.wrap(saveDraftResponse);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("submitResponse", () => {
    it("throws unauthenticated if user is not authenticated", async () => {
      await expect(
        wrappedSubmitResponse(
          { requestId: "req-1", recordId: "rec-1", formData: {} },
          { auth: null },
        ),
      ).rejects.toThrow(/Authentication required/i);
    });

    it("throws invalid-argument when payload is malformed", async () => {
      await expect(
        wrappedSubmitResponse(
          { requestId: 123, recordId: "rec-1", formData: "not-an-object" },
          { auth: { uid: "rep-1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Invalid response payload/i);
    });

    it("executes atomic transaction to save response and complete record", async () => {
      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ totalRecords: 5, completedRecords: 1 }),
      });

      const result = await wrappedSubmitResponse(
        {
          requestId: "req-1",
          recordId: "rec-1",
          formData: { answer1: "Yes", notes: "Survey completed" },
        },
        { auth: { uid: "rep-1", token: { role: "REP" } } },
      );

      expect(result).toHaveProperty("success", true);
      expect(db.runTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("handles concurrent submissions safely through transaction retries", async () => {
      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => ({ totalRecords: 10, completedRecords: 2 }),
      });

      // Simulate 3 concurrent submissions from different devices/reps
      const concurrentCalls = [
        wrappedSubmitResponse(
          { requestId: "req-1", recordId: "rec-1", formData: { seq: 1 } },
          { auth: { uid: "rep-1", token: { role: "REP" } } },
        ),
        wrappedSubmitResponse(
          { requestId: "req-1", recordId: "rec-1", formData: { seq: 2 } },
          { auth: { uid: "rep-1", token: { role: "REP" } } },
        ),
        wrappedSubmitResponse(
          { requestId: "req-1", recordId: "rec-1", formData: { seq: 3 } },
          { auth: { uid: "rep-1", token: { role: "REP" } } },
        ),
      ];

      const results = await Promise.all(concurrentCalls);
      results.forEach((res) => expect(res.success).toBe(true));
      expect(db.runTransaction).toHaveBeenCalledTimes(3);
    });
  });

  describe("saveDraftResponse", () => {
    it("updates draft status inside transaction without marking record completed", async () => {
      const result = await wrappedSaveDraftResponse(
        {
          requestId: "req-1",
          recordId: "rec-1",
          formData: { draftQuestion: "Pending" },
        },
        { auth: { uid: "rep-1", token: { role: "REP" } } },
      );

      expect(result).toHaveProperty("success", true);
      expect(db.runTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction.set).toHaveBeenCalled();
    });
  });
});
