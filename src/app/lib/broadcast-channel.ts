/**
 * @file: broadcast-channel.ts
 * @description: YYC³ 统一 BroadcastChannel 管理 + 跨存储层同步中枢
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[sync],[ssot]
 *
 * @brief: 统一所有存储层的跨标签页同步通道
 *
 * @details:
 * - v1: 独立频道 (yyc3-store-sync, yyc3_settings_sync, etc.)
 * - v2: 统一频道 + 域路由, 一次广播所有层都感知
 */

/** 全局单例缓存 */
const channelMap = new Map<string, BroadcastChannel>();

/** 统一同步频道名称 */
export const UNIFIED_SYNC_CHANNEL = "yyc3-unified-sync";

/** 同步消息的域标识 */
export type SyncDomain =
  | "global-store"
  | "settings"
  | "model-providers"
  | "api-config"
  | "indexeddb"
  | "node-slice"
  | "db-conn-slice"
  | "follow-up-slice"
  | "user-mgmt-slice"
  | "network-slice"
  | "agent-state"
  | "mcp-event"
  | "inference";

/** 统一同步消息格式 */
export interface UnifiedSyncMessage {
  domain: SyncDomain;
  action: "update" | "create" | "delete" | "reset";
  timestamp: number;
  source?: string; // 来源 tab 标识
}

/**
 * 获取指定名称的单例 BroadcastChannel
 * - 浏览器不支持 BroadcastChannel 时返回 null
 * - 同一 name 多次调用返回同一实例
 */
export function getSharedChannel(name: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") {return null;}

  let ch = channelMap.get(name);
  if (!ch) {
    ch = new BroadcastChannel(name);
    channelMap.set(name, ch);
  }
  return ch;
}

/**
 * 通过统一频道广播存储变更
 * - 所有监听统一频道的存储层都会收到通知
 * - 各存储层根据 domain 字段决定是否 rehydrate
 */
export function broadcastSyncMessage(msg: Omit<UnifiedSyncMessage, "timestamp">): void {
  const full: UnifiedSyncMessage = { ...msg, timestamp: Date.now() };
  postToChannel(UNIFIED_SYNC_CHANNEL, full);
  // 向后兼容: 同时发到旧通道
  if (msg.domain === "global-store") {
    postToChannel("yyc3-store-sync", { type: "store-update" });
  }
  if (msg.domain === "settings") {
    postToChannel("yyc3_settings_sync", { type: "settings_update" });
  }
  if (msg.domain === "api-config") {
    postToChannel("yyc3_api_config", { type: "api-config-update" });
  }
  if (msg.domain === "indexeddb") {
    postToChannel("yyc3_storage_sync", { type: "idb-change" });
  }
}

/**
 * 监听统一频道的变更通知
 * - 返回清理函数
 */
export function onUnifiedSync(
  handler: (msg: UnifiedSyncMessage) => void
): () => void {
  const ch = getSharedChannel(UNIFIED_SYNC_CHANNEL);
  if (!ch) { return () => {}; }

  const listener = (e: MessageEvent) => {
    if (e.data?.domain) {
      handler(e.data as UnifiedSyncMessage);
    }
  };
  ch.addEventListener("message", listener);
  return () => ch.removeEventListener("message", listener);
}

/**
 * 安全发送消息到指定频道
 * - 频道不存在或发送失败时静默降级
 */
export function postToChannel(name: string, data: unknown): void {
  try {
    const ch = getSharedChannel(name);
    ch?.postMessage(data);
  } catch {
    // BroadcastChannel 异常 — 静默降级
  }
}

/**
 * 关闭并移除指定频道（仅在必要时调用，如模块卸载）
 */
export function closeChannel(name: string): void {
  const ch = channelMap.get(name);
  if (ch) {
    try { ch.close(); } catch { /* ignore */ }
    channelMap.delete(name);
  }
}

/**
 * 关闭所有频道（用于测试清理 / 应用销毁）
 */
export function closeAllChannels(): void {
  Array.from(channelMap.values()).forEach(ch => {
    try { ch.close(); } catch { /* ignore */ }
  });
  channelMap.clear();
}

// ============================================================
// Agent 状态同步 (Phase 2D)
// ============================================================

/** Agent 状态同步消息 */
export interface AgentStateSyncMessage {
  domain: "agent-state";
  agentId: string;
  state: string;
  currentTaskId: string | null;
  timestamp: number;
  source: string;
}

/** 广播 Agent 状态变更 */
export function broadcastAgentState(
  agentId: string,
  state: string,
  currentTaskId: string | null = null,
): void {
  const msg: AgentStateSyncMessage = {
    domain: "agent-state",
    agentId,
    state,
    currentTaskId,
    timestamp: Date.now(),
    source: `tab-${typeof window !== "undefined" ? Date.now() % 10000 : "ssr"}`,
  };
  postToChannel(UNIFIED_SYNC_CHANNEL, msg);
}

/** 监听远端 Agent 状态变更 */
export function onAgentStateChange(
  handler: (msg: AgentStateSyncMessage) => void,
): () => void {
  return onUnifiedSync((msg) => {
    if (msg.domain === "agent-state") {
      handler(msg as unknown as AgentStateSyncMessage);
    }
  });
}

/** 广播推理状态 */
export function broadcastInferenceState(
  backend: string,
  model: string,
  status: string,
): void {
  postToChannel(UNIFIED_SYNC_CHANNEL, {
    domain: "inference",
    backend,
    model,
    status,
    timestamp: Date.now(),
  });
}
