import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enqueueOfflineRecord,
  getQueuedRecords,
  getQueuedRecordsCount,
  removeQueuedRecord,
  flushOfflineQueue,
  QueuedRecord,
} from "../utils/offlineQueue";
import { recordApi } from "../services";

vi.mock("../services", () => ({
  recordApi: {
    saveDraftRecord: vi.fn(),
    submitRecord: vi.fn(),
  },
}));

vi.mock("../utils/audit", () => ({
  logAudit: vi.fn(),
}));

// In-memory IndexedDB mock for Node/JSDOM testing
class MockIndexedDB {
  private data: Map<string, QueuedRecord> = new Map();

  open() {
    const self = this;
    const req: any = {
      result: {
        objectStoreNames: { contains: () => true },
        createObjectStore: vi.fn(),
        transaction: () => ({
          objectStore: () => ({
            add: (item: QueuedRecord) => {
              self.data.set(item.id, item);
              const addReq: any = {};
              setTimeout(() => addReq.onsuccess?.(), 0);
              return addReq;
            },
            getAll: () => {
              const getReq: any = {};
              setTimeout(() => {
                getReq.result = Array.from(self.data.values());
                getReq.onsuccess?.();
              }, 0);
              return getReq;
            },
            delete: (id: string) => {
              self.data.delete(id);
              const delReq: any = {};
              setTimeout(() => delReq.onsuccess?.(), 0);
              return delReq;
            },
            count: () => {
              const countReq: any = {};
              setTimeout(() => {
                countReq.result = self.data.size;
                countReq.onsuccess?.();
              }, 0);
              return countReq;
            },
          }),
        }),
      },
    };
    setTimeout(() => req.onsuccess?.(), 0);
    return req;
  }

  clear() {
    this.data.clear();
  }
}

const mockIDB = new MockIndexedDB();
// @ts-ignore
globalThis.indexedDB = mockIDB;

describe("IndexedDB Offline Queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIDB.clear();
  });

  it("enqueues an offline draft and retrieves it", async () => {
    const queueId = await enqueueOfflineRecord({
      recordId: "rec-101",
      requestId: "req-1",
      activityId: "act-1",
      values: { field1: "value1" },
      isDraft: true,
    });

    expect(queueId).toBeDefined();
    expect(queueId).toContain("queue_");

    const count = await getQueuedRecordsCount();
    expect(count).toBe(1);

    const records = await getQueuedRecords();
    expect(records).toHaveLength(1);
    expect(records[0].recordId).toBe("rec-101");
    expect(records[0].isDraft).toBe(true);
    expect(records[0].values).toEqual({ field1: "value1" });
  });

  it("flushes queued items successfully when API returns success", async () => {
    vi.mocked(recordApi.saveDraftRecord).mockResolvedValue({ success: true });
    vi.mocked(recordApi.submitRecord).mockResolvedValue({ success: true });

    await enqueueOfflineRecord({
      recordId: "rec-draft",
      requestId: "req-1",
      values: { note: "draft note" },
      isDraft: true,
    });

    await enqueueOfflineRecord({
      recordId: "rec-submit",
      requestId: "req-1",
      values: { note: "submitted note" },
      isDraft: false,
    });

    expect(await getQueuedRecordsCount()).toBe(2);

    const result = await flushOfflineQueue();
    expect(result.total).toBe(2);
    expect(result.synced).toBe(2);
    expect(result.failed).toBe(0);

    expect(recordApi.saveDraftRecord).toHaveBeenCalledWith(
      "req-1",
      "rec-draft",
      { note: "draft note" },
      undefined,
    );
    expect(recordApi.submitRecord).toHaveBeenCalledWith(
      "req-1",
      "rec-submit",
      { note: "submitted note" },
      undefined,
    );

    // Queue should now be empty
    expect(await getQueuedRecordsCount()).toBe(0);
  });

  it("keeps failed items in the queue when API returns failure", async () => {
    vi.mocked(recordApi.saveDraftRecord).mockResolvedValue({
      success: false,
      message: "Server busy",
    });

    await enqueueOfflineRecord({
      recordId: "rec-fail",
      requestId: "req-1",
      values: {},
      isDraft: true,
    });

    const result = await flushOfflineQueue();
    expect(result.total).toBe(1);
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);

    // Item should remain in queue
    expect(await getQueuedRecordsCount()).toBe(1);
  });
});
