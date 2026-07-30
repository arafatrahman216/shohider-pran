"use client";

// Offline-first registration queue (Section 1). When a submission is made
// with no connectivity, it's stored in IndexedDB (shared storage the
// service worker can also read) instead of just failing. It's flushed to
// POST /api/registrants as soon as connectivity returns — either via the
// page's own 'online' listener, or (best-effort, where supported) via the
// service worker's Background Sync when the tab isn't even open.

const DB_NAME = "sp-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "registrations";
export const SYNC_TAG = "sp-flush-registrations";

export type QueuedRegistration = {
  id: string;
  payload: Record<string, unknown>;
  queuedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueRegistration(payload: Record<string, unknown>): Promise<QueuedRegistration> {
  const db = await openDb();
  const entry: QueuedRegistration = {
    id: crypto.randomUUID(),
    payload,
    queuedAt: new Date().toISOString(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-expect-error -- SyncManager isn't in the default TS DOM lib yet
      await registration.sync.register(SYNC_TAG);
    } catch {
      // Background Sync isn't available (e.g. Safari) — the page's own
      // 'online' listener (see registerOnlineFlush) is the fallback.
    }
  }

  return entry;
}

export async function getQueuedCount(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function flushQueue(): Promise<{ flushed: number; remaining: number }> {
  const db = await openDb();
  const entries: QueuedRegistration[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as QueuedRegistration[]);
    request.onerror = () => reject(request.error);
  });

  let flushed = 0;
  for (const entry of entries) {
    try {
      const res = await fetch("/api/registrants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.payload),
      });
      if (!res.ok) continue;
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(entry.id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      flushed += 1;
    } catch {
      // still offline or the request failed — leave it queued, try again
      // next time flushQueue runs.
    }
  }

  const remaining = await getQueuedCount();
  return { flushed, remaining };
}

export function registerOnlineFlush(): () => void {
  const handler = () => {
    flushQueue();
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
