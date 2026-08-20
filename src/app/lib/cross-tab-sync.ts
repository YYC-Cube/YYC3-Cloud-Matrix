/**
 * @file: cross-tab-sync.ts
 * @description: YYC³ 跨标签页数据同步 — 基于 BroadcastChannel
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-16
 * @status: active
 * @tags: [sync],[broadcast]
 *
 * @brief: 多浏览器标签页间状态同步
 *
 * @details:
 * - 使用 BroadcastChannel API 实现同源标签间通信
 * - 仅同步用户编辑操作（非 WebSocket 推送）
 * - 支持节点/指标/操作记录等核心数据的跨标签同步
 */

const CHANNEL_NAME = 'yyc3-unified-store-sync';

type SyncMessage =
  | { type: 'NODE_UPDATE'; payload: { id: string; updates: Record<string, unknown> } }
  | { type: 'NODE_ADD'; payload: Record<string, unknown> }
  | { type: 'NODE_REMOVE'; payload: { id: string } }
  | { type: 'METRICS_UPDATE'; payload: { slice: string; data: unknown } }
  | { type: 'APP_OP_ADD'; payload: unknown }
  | { type: 'PING' }
  | { type: 'PONG'; tabId: string };

let channel: BroadcastChannel | null = null;
const listeners = new Map<string, Set<Function>>();
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function initCrossTabSync(): void {
  if (typeof BroadcastChannel === 'undefined') { return; }

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = handleIncoming;
    channel.postMessage({ type: 'PING' } as SyncMessage);

    console.info(`[CrossTabSync] Initialized tab ${TAB_ID}`);
  } catch {
    console.warn('[CrossTabSync] BroadcastChannel not available');
  }
}

function handleIncoming(event: MessageEvent<SyncMessage>): void {
  const msg = event.data;

  if (msg.type === 'PONG') { return; }
  if (msg.type === 'PING') {
    channel?.postMessage({ type: 'PONG', tabId: TAB_ID } as SyncMessage);
    return;
  }

  const typeListeners = listeners.get(msg.type);
  if (typeListeners) {
    typeListeners.forEach((fn) => fn(msg.payload));
  }
}

export function onCrossTabMessage(type: SyncMessage['type'], handler: Function): () => void {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  listeners.get(type)!.add(handler);

  return () => {
    listeners.get(type)?.delete(handler);
  };
}

export function broadcastNodeUpdate(id: string, updates: Record<string, unknown>): void {
  channel?.postMessage({ type: 'NODE_UPDATE', payload: { id, updates } });
}

export function broadcastNodeAdd(data: Record<string, unknown>): void {
  channel?.postMessage({ type: 'NODE_ADD', payload: data });
}

export function broadcastNodeRemove(id: string): void {
  channel?.postMessage({ type: 'NODE_REMOVE', payload: { id } });
}

export function getTabId(): string {
  return TAB_ID;
}

export function destroyCrossTabSync(): void {
  channel?.close();
  channel = null;
  listeners.clear();
}
