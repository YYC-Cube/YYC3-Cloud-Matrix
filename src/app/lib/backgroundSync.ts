/**
 * @file: backgroundSync.ts
 * @description: backgroundSync.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import type { SyncItem, SyncQueueStats, SyncProcessResult } from "../types";

// RF-011: Re-export 已移除

const SYNC_QUEUE_KEY = "yyc3_sync_queue";

/** 注册后台同步（需 Service Worker 支持） */
export async function registerBackgroundSync(tag = "sync-data") {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("SyncManager" in window)
  ) {
    console.info("[BackgroundSync] 浏览器不支持后台同步，将使用在线时主动同步");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
    return true;
  } catch {
    console.info("[BackgroundSync] 注册失败");
    return false;
  }
}

/** 添加同步项到队列 */
export function addToSyncQueue(item: Omit<SyncItem, "id" | "timestamp" | "retries">) {
  const queue = getSyncQueue();
  const syncItem: SyncItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  queue.push(syncItem);
  saveSyncQueue(queue);

  // 尝试注册后台同步
  registerBackgroundSync();
  return syncItem;
}

/** 获取同步队列 */
export function getSyncQueue(): SyncItem[] {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** 保存同步队列 */
function saveSyncQueue(queue: SyncItem[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/** 处理同步队列（恢复在线时调用） */
export async function processSyncQueue(): Promise<SyncProcessResult> {
  const queue = getSyncQueue();
  if (queue.length === 0) {return { success: 0, failed: 0 };}

  let success = 0;
  let failed = 0;
  const remaining: SyncItem[] = [];

  for (const item of queue) {
    try {
      // 在真实环境中，这里会 POST 到对应 API
      // Mock: 模拟同步
      await new Promise((r) => setTimeout(r, 100));
      success++;
    } catch {
      item.retries++;
      if (item.retries < 3) {
        remaining.push(item);
      }
      failed++;
    }
  }

  saveSyncQueue(remaining);
  return { success, failed };
}

/** 清空同步队列 */
export function clearSyncQueue() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

/** 获取队列状态统计 */
export function getSyncQueueStats(): SyncQueueStats {
  const queue = getSyncQueue();
  return {
    total: queue.length,
    pending: queue.filter((i) => i.retries === 0).length,
    retrying: queue.filter((i) => i.retries > 0).length,
    oldestTimestamp: queue.length > 0 ? queue[0].timestamp : null,
  };
}