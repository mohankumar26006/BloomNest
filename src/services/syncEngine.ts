import { get, set } from "idb-keyval";

export type SyncStatus = "synced" | "syncing" | "offline" | "pending_sync";

export interface PendingMutation {
  clientMutationId: string;
  userId: string;
  entityName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: any;
  createdAt: string;
}

const QUEUE_STORAGE_KEY = "bloomnest_offline_queue";
const SYNC_STATUS_LISTENERS: Array<(status: SyncStatus, pendingCount: number) => void> = [];

let currentSyncStatus: SyncStatus = typeof navigator !== "undefined" && navigator.onLine ? "synced" : "offline";
let isFlushing = false;

export function subscribeSyncStatus(listener: (status: SyncStatus, pendingCount: number) => void) {
  SYNC_STATUS_LISTENERS.push(listener);
  getPendingQueueCount().then((count) => listener(currentSyncStatus, count));
  return () => {
    const idx = SYNC_STATUS_LISTENERS.indexOf(listener);
    if (idx !== -1) SYNC_STATUS_LISTENERS.splice(idx, 1);
  };
}

function updateSyncStatus(status: SyncStatus, pendingCount: number) {
  currentSyncStatus = status;
  SYNC_STATUS_LISTENERS.forEach((fn) => fn(status, pendingCount));
}

export async function getPendingQueue(): Promise<PendingMutation[]> {
  try {
    const raw = await get(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("Error reading offline queue:", err);
    return [];
  }
}

export async function savePendingQueue(queue: PendingMutation[]): Promise<void> {
  try {
    await set(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    updateSyncStatus(queue.length === 0 ? (isOnline ? "synced" : "offline") : "pending_sync", queue.length);
  } catch (err) {
    console.error("Error saving offline queue:", err);
  }
}

export async function getPendingQueueCount(): Promise<number> {
  const queue = await getPendingQueue();
  return queue.length;
}

/**
 * Enqueue a mutation locally and attempt background flush
 */
export async function enqueueMutation(
  userId: string,
  entityName: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  payload: any
): Promise<string> {
  const clientMutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const mutation: PendingMutation = {
    clientMutationId,
    userId,
    entityName,
    action,
    payload,
    createdAt: new Date().toISOString(),
  };

  const queue = await getPendingQueue();
  queue.push(mutation);
  await savePendingQueue(queue);

  // Attempt background sync if online
  if (typeof navigator !== "undefined" && navigator.onLine) {
    flushOfflineQueue().catch(() => {});
  }

  return clientMutationId;
}

/**
 * Flush pending offline mutations to the backend server
 */
export async function flushOfflineQueue(): Promise<{ success: boolean; syncedCount: number }> {
  if (isFlushing) return { success: false, syncedCount: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const count = await getPendingQueueCount();
    updateSyncStatus("offline", count);
    return { success: false, syncedCount: 0 };
  }

  const queue = await getPendingQueue();
  if (queue.length === 0) {
    updateSyncStatus("synced", 0);
    return { success: true, syncedCount: 0 };
  }

  isFlushing = true;
  updateSyncStatus("syncing", queue.length);

  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mutations: queue }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed with HTTP status ${response.status}`);
    }

    const data = await response.json();
    const acknowledgedIds: string[] = data.acknowledgedIds || [];

    // Filter out acknowledged mutations
    const remainingQueue = queue.filter((m) => !acknowledgedIds.includes(m.clientMutationId));
    await savePendingQueue(remainingQueue);

    isFlushing = false;
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    updateSyncStatus(remainingQueue.length === 0 ? (isOnline ? "synced" : "offline") : "pending_sync", remainingQueue.length);

    return { success: true, syncedCount: acknowledgedIds.length };
  } catch (err) {
    console.warn("Background sync warning (re-queuing for next retry):", err);
    isFlushing = false;
    updateSyncStatus("pending_sync", queue.length);
    return { success: false, syncedCount: 0 };
  }
}

/**
 * Hydrate local state from server PostgreSQL database if online
 */
export async function fetchCanonicalHydration(userId: string): Promise<any | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  try {
    const res = await fetch(`/api/sync/hydrate/${userId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.canonicalState || null;
  } catch {
    return null;
  }
}

// Auto-register network online event listener
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    getPendingQueueCount().then((count) => updateSyncStatus("syncing", count));
    flushOfflineQueue().catch(() => {});
  });
  window.addEventListener("offline", () => {
    getPendingQueueCount().then((count) => updateSyncStatus("offline", count));
  });
}
