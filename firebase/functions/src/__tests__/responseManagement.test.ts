import fft from "firebase-functions-test";

const testEnv = fft();

let hasWritten = false;

const mockTransaction = {
  set: jest.fn(() => {
    hasWritten = true;
  }),
  update: jest.fn(() => {
    hasWritten = true;
  }),
  get: jest.fn((ref) => {
    if (hasWritten) {
      throw new Error(
        "Firestore transactions require all reads to be executed before all writes.",
      );
    }
    return Promise.resolve({
      exists: true,
      data: () => ({
        recordId: "rec-1",
        requestId: "req-1",
        assignedUserId: "rep-1",
        assignmentId: "asg-1",
        recordStatus: "In Progress",
      }),
    });
  }),
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
    hasWritten = false;
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
      hasWritten = false;
      mockTransaction.get.mockImplementation(async () => {
        if (hasWritten) {
          throw new Error(
            "Firestore transactions require all reads to be executed before all writes.",
          );
        }
        return {
          exists: true,
          data: () => ({
            recordId: "rec-1",
            requestId: "req-1",
            assignedUserId: "rep-1",
            assignmentId: "asg-1",
            recordStatus: "In Progress",
            totalRecords: 5,
            completedRecords: 1,
          }),
        };
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

    it("strictly enforces read-before-write ordering and avoids double-increment on race conditions", async () => {
      hasWritten = false;
      let isAlreadySubmitted = false;

      mockTransaction.get.mockImplementation(async () => {
        if (hasWritten) {
          throw new Error(
            "Firestore transactions require all reads to be executed before all writes.",
          );
        }
        return {
          exists: true,
          data: () => ({
            recordId: "rec-1",
            requestId: "req-1",
            assignedUserId: "rep-1",
            assignmentId: "asg-1",
            recordStatus: isAlreadySubmitted ? "Submitted" : "In Progress",
            totalRecords: 10,
            completedRecords: 2,
          }),
        };
      });

      // Rep 1 submits first
      const res1 = await wrappedSubmitResponse(
        { requestId: "req-1", recordId: "rec-1", formData: { seq: 1 } },
        { auth: { uid: "rep-1", token: { role: "REP" } } },
      );
      expect(res1.success).toBe(true);
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ completedRecords: 3 }),
      );

      // Rep 2 submits concurrently for the same record (now detected as already Submitted)
      hasWritten = false;
      isAlreadySubmitted = true;
      mockTransaction.update.mockClear();

      const res2 = await wrappedSubmitResponse(
        { requestId: "req-1", recordId: "rec-1", formData: { seq: 2 } },
        { auth: { uid: "rep-1", token: { role: "REP" } } },
      );
      expect(res2.success).toBe(true);
      // Assignment update should not have been called to avoid double increment
      const assignmentUpdates = mockTransaction.update.mock.calls.filter(
        (call: any[]) => call[1] && "completedRecords" in call[1],
      );
      expect(assignmentUpdates.length).toBe(0);
    });

    it("handles concurrent submissions safely through transaction retries", async () => {
      hasWritten = false;
      mockTransaction.get.mockImplementation(async () => {
        return {
          exists: true,
          data: () => ({
            recordId: "rec-1",
            requestId: "req-1",
            assignedUserId: "rep-1",
            assignmentId: "asg-1",
            recordStatus: "In Progress",
            totalRecords: 10,
            completedRecords: 2,
          }),
        };
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

    it("detects conflict and refuses to overwrite when record is already submitted or server is newer", async () => {
      hasWritten = false;
      mockTransaction.get.mockImplementation(async () => {
        return {
          exists: true,
          data: () => ({
            recordId: "rec-1",
            requestId: "req-1",
            assignedUserId: "rep-1",
            assignmentId: "asg-1",
            recordStatus: "Submitted",
            updatedAt: "2026-09-24T20:00:00.000Z",
          }),
        };
      });

      const result = await wrappedSaveDraftResponse(
        {
          requestId: "req-1",
          recordId: "rec-1",
          formData: { draftQuestion: "Stale draft from offline" },
          clientUpdatedAt: "2026-09-24T19:00:00.000Z", // Older than server
        },
        { auth: { uid: "rep-1", token: { role: "REP" } } },
      );

      expect(result.success).toBe(true);
      expect(result.conflict).toBe(true);
      expect(result.reason).toBe("RECORD_LOCKED");
    });

    it("detects conflict and refuses to overwrite in-progress record when server updatedAt is newer", async () => {
      hasWritten = false;
      mockTransaction.get.mockImplementation(async () => {
        return {
          exists: true,
          data: () => ({
            recordId: "rec-1",
            requestId: "req-1",
            assignedUserId: "rep-1",
            assignmentId: "asg-1",
            recordStatus: "In Progress",
            updatedAt: "2026-09-24T20:00:00.000Z",
          }),
        };
      });

      const result = await wrappedSaveDraftResponse(
        {
          requestId: "req-1",
          recordId: "rec-1",
          formData: { draftQuestion: "Stale draft from offline" },
          clientUpdatedAt: "2026-09-24T19:00:00.000Z", // Older than server
        },
        { auth: { uid: "rep-1", token: { role: "REP" } } },
      );

      expect(result.success).toBe(true);
      expect(result.conflict).toBe(true);
      expect(result.reason).toBe("SERVER_NEWER");
    });
  });
});
