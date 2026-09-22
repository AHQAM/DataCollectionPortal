import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRecordOps } from "../hooks/useRecordOps";
import { useDataStore } from "../stores/dataStore";
import { useUIStore } from "../stores/uiStore";
import { recordApi } from "../services";
import { logAudit } from "../utils/audit";

vi.mock("../services", () => ({
  recordApi: {
    saveDraftRecord: vi.fn(),
    submitRecord: vi.fn(),
    reassignRecord: vi.fn(),
    commitImport: vi.fn(),
  },
}));

vi.mock("../utils/audit", () => ({
  logAudit: vi.fn(),
}));

vi.mock("../utils/offlineQueue", () => ({
  enqueueOfflineRecord: vi.fn().mockResolvedValue("queue_123"),
  flushOfflineQueue: vi.fn(),
}));

import { enqueueOfflineRecord } from "../utils/offlineQueue";

describe("useRecordOps Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDataStore.setState({
      records: [
        {
          recordId: "r1",
          requestId: "req1",
          targetId: "CUST-001",
          activityId: "act1",
        } as any,
      ],
    });
    useUIStore.setState({
      isOnline: true,
      lang: "en",
    } as any);
  });

  describe("saveDraftRecord", () => {
    it("enqueues offline if not online", async () => {
      useUIStore.setState({ isOnline: false } as any);
      const hook = useRecordOps();
      const res = await hook.saveDraftRecord("r1", { fieldA: 1 });
      expect(res.success).toBe(true);
      expect(res.isOffline).toBe(true);
      expect(enqueueOfflineRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          recordId: "r1",
          values: { fieldA: 1 },
          isDraft: true,
        }),
      );
      expect(recordApi.saveDraftRecord).not.toHaveBeenCalled();
    });

    it("saves draft and logs audit when online", async () => {
      (recordApi.saveDraftRecord as any).mockResolvedValueOnce({
        success: true,
      });
      const hook = useRecordOps();
      const res = await hook.saveDraftRecord("r1", { fieldA: 1 });

      expect(res.success).toBe(true);
      expect(recordApi.saveDraftRecord).toHaveBeenCalledWith(
        "req1",
        "r1",
        { fieldA: 1 },
        "act1",
      );
      expect(logAudit).toHaveBeenCalledWith(
        "RECORD_DRAFT_SAVED",
        "Record",
        "r1",
        { isOffline: false },
      );
    });

    it("returns failure when api fails logically", async () => {
      (recordApi.saveDraftRecord as any).mockResolvedValueOnce({
        success: false,
        message: "Server rejected draft",
      });
      const hook = useRecordOps();
      const res = await hook.saveDraftRecord("r1", { fieldA: 1 });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Server rejected draft");
      expect(logAudit).not.toHaveBeenCalled();
    });

    it("returns failure when api fails with exception", async () => {
      (recordApi.saveDraftRecord as any).mockRejectedValueOnce(
        new Error("API Error"),
      );
      const hook = useRecordOps();
      const res = await hook.saveDraftRecord("r1", { fieldA: 1 });

      expect(res.success).toBe(false);
      expect(res.error).toBeInstanceOf(Error);
      expect(logAudit).not.toHaveBeenCalled();
    });
  });

  describe("submitRecord", () => {
    it("submits record and logs audit", async () => {
      (recordApi.submitRecord as any).mockResolvedValueOnce({ success: true });
      const hook = useRecordOps();
      const res = await hook.submitRecord("r1", { fieldB: 2 });

      expect(res.success).toBe(true);
      expect(recordApi.submitRecord).toHaveBeenCalledWith(
        "req1",
        "r1",
        { fieldB: 2 },
        "act1",
      );
      expect(logAudit).toHaveBeenCalledWith(
        "RECORD_COMPLETED",
        "Record",
        "r1",
        expect.any(Object),
      );
    });

    it("returns failure when api fails logically", async () => {
      (recordApi.submitRecord as any).mockResolvedValueOnce({
        success: false,
        message: "Invalid field",
      });
      const hook = useRecordOps();
      const res = await hook.submitRecord("r1", { fieldB: 2 });

      expect(res.success).toBe(false);
      expect(res.message).toBe("Invalid field");
      expect(logAudit).not.toHaveBeenCalled();
    });

    it("returns failure on exception", async () => {
      (recordApi.submitRecord as any).mockRejectedValueOnce(
        new Error("Network error"),
      );
      const hook = useRecordOps();
      const res = await hook.submitRecord("r1", { fieldB: 2 });

      expect(res.success).toBe(false);
      expect(res.error).toBeInstanceOf(Error);
    });
  });

  describe("reassignRecord", () => {
    it("reassigns and logs audit", async () => {
      (recordApi.reassignRecord as any).mockResolvedValueOnce(undefined);
      const hook = useRecordOps();
      const res = await hook.reassignRecord("r1", "user2", "holiday");

      expect(res.success).toBe(true);
      expect(recordApi.reassignRecord).toHaveBeenCalledWith("r1", "user2");
      expect(logAudit).toHaveBeenCalledWith(
        "RECORD_REASSIGNED",
        "Record",
        "r1",
        { newUserId: "user2", reason: "holiday" },
      );
    });

    it("returns error on exception", async () => {
      (recordApi.reassignRecord as any).mockRejectedValueOnce(
        new Error("Error"),
      );
      const hook = useRecordOps();
      const res = await hook.reassignRecord("r1", "user2");

      expect(res.success).toBe(false);
    });
  });

  describe("commitImport", () => {
    it("commits import and logs audit", async () => {
      (recordApi.commitImport as any).mockResolvedValueOnce({
        total: 10,
        created: 5,
      });
      const hook = useRecordOps();
      const res = await hook.commitImport("req1", [], {}, "test.csv");

      expect(res.success).toBe(true);
      expect(recordApi.commitImport).toHaveBeenCalledWith(
        "req1",
        [],
        {},
        "test.csv",
        "en",
      );
      expect(logAudit).toHaveBeenCalledWith(
        "RECORDS_IMPORTED_EXCEL",
        "Import",
        "req1",
        { total: 10, created: 5 },
      );
    });

    it("returns error on exception", async () => {
      (recordApi.commitImport as any).mockRejectedValueOnce(new Error("Error"));
      const hook = useRecordOps();
      const res = await hook.commitImport("req1", [], {}, "test.csv");

      expect(res.success).toBe(false);
    });
  });
});
