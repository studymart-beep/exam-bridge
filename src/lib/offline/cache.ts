"use client";

const DB_NAME = "exam-bridge-cache";
const STORE = "files";
const VERSION = 1;

export type CacheMeta = {
  materialId: string;
  type: "video" | "pdf";
  title: string;
  size: number;
  downloadedAt: number;
  subscriptionExpiresAt: number | null;
};

type CacheRecord = { key: string; blob: Blob; meta: CacheMeta };

let activeKey: string | null = null;

export function setActiveCacheKey(key: string | null) {
  activeKey = key;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putFile(
  key: string,
  blob: Blob,
  meta: CacheMeta
): Promise<void> {
  await ensureSpace(blob.size);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ key, blob, meta } satisfies CacheRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFile(
  key: string
): Promise<{ blob: Blob; meta: CacheMeta } | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => {
      const row = req.result as CacheRecord | undefined;
      resolve(row ? { blob: row.blob, meta: row.meta } : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFile(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listFiles(): Promise<Array<{ key: string; meta: CacheMeta }>> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as CacheRecord[]) || [];
      resolve(rows.map((r) => ({ key: r.key, meta: r.meta })));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
}> {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    const e = await navigator.storage.estimate();
    return { usage: e.usage || 0, quota: e.quota || 0 };
  }
  return { usage: 0, quota: 0 };
}

export async function ensureSpace(bytesNeeded: number): Promise<void> {
  const MIN_FREE = 200 * 1024 * 1024;
  const { usage, quota } = await getStorageEstimate();
  if (!quota) return;
  let free = quota - usage;
  if (free >= bytesNeeded + MIN_FREE) return;

  const files = await listFiles();
  files.sort((a, b) => a.meta.downloadedAt - b.meta.downloadedAt);
  for (const f of files) {
    if (f.key === activeKey) continue;
    await deleteFile(f.key);
    free += f.meta.size;
    if (free >= bytesNeeded + MIN_FREE) break;
  }
}

export async function purgeExpiredCache(): Promise<void> {
  const now = Date.now();
  const files = await listFiles();
  for (const f of files) {
    if (
      f.meta.subscriptionExpiresAt !== null &&
      f.meta.subscriptionExpiresAt < now
    ) {
      await deleteFile(f.key);
    }
  }
}

export async function purgeAllCache(): Promise<void> {
  const files = await listFiles();
  for (const f of files) {
    await deleteFile(f.key);
  }
}
