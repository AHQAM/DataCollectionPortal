import { recordApi } from "../services";
import { logAudit } from "./audit";

export interface QueuedRecord {
  id: string;
  recordId: string;
  requestId: string;
  activityId?: string;
  values: Record<string, any>;
  isDraft: boolean;
  createdAt: number;
  retryCount: number;
}

const DB_NAME = "DataCollectionOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "queued_records";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Enqueues a record operation when offline or when an API call fails due to network error.
 */
export async function enqueueOfflineRecord(
  item: Omit<QueuedRecord, "id" | "createdAt" | "retryCount">,
): Promise<string> {
  const db = await openDB();
  const id = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const queuedItem: QueuedRecord = {
    ...item,
    id,
    createdAt: Date.now(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(queuedItem);

    req.onsuccess = () => {
      logAudit("RECORD_QUEUED_OFFLINE", "Record", item.recordId, {
        isDraft: item.isDraft,
        queueId: id,
      });
      resolve(id);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all pending records from IndexedDB.
 */
export async function getQueuedRecords(): Promise<QueuedRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Removes a specific record from the offline queue after successful sync.
 */
export async function removeQueuedRecord(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Returns the count of pending offline records.
 */
export async function getQueuedRecordsCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();

      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Flushes the offline queue by submitting all queued items to the server.
 */
export async function flushOfflineQueue(): Promise<{
  total: number;
  synced: number;
  failed: number;
}> {
  const items = await getQueuedRecords();
  if (items.length === 0) {
    return { total: 0, synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      let res;
      if (item.isDraft) {
        res = await recordApi.saveDraftRecord(
          item.requestId,
          item.recordId,
          item.values,
          item.activityId,
        );
      } else {
        res = await recordApi.submitRecord(
          item.requestId,
          item.recordId,
          item.values,
          item.activityId,
        );
      }

      if (res && res.success) {
        await removeQueuedRecord(item.id);
        synced++;
        logAudit(
          item.isDraft ? "RECORD_DRAFT_SYNCED" : "RECORD_COMPLETED_SYNCED",
          "Record",
          item.recordId,
          { queueId: item.id },
        );
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { total: items.length, synced, failed };
}
