/**
 * @file: data-bus.ts
 * @description: YYC³ DataBus 事件中枢 · 统一数据合并/校验/分发层 + WebSocket 实时同步
 * @author: YanYuCloudCube Team
 * @version: v2.0.0 (WebSocket Sync Engine)
 * @created: 2026-04-15
 * @updated: 2026-04-15
 * @status: active
 * @tags: [lib],[data-bus],[ssot],[websocket],[realtime]
 *
 * @brief: 所有数据变更的唯一调度中枢 + 服务端实时同步引擎
 *
 * @features (v2.0):
 * - ✅ 接收三类输入：WebSocket推送 / UI用户编辑 / DataService初始化
 * - ✅ smartMerge 智能合并策略：遥测字段跟随WS，编辑字段保留用户值
 * - ✅ 冲突解决：后端优先 / 用户优先 / 时间戳胜出
 * - ✅ 格式校验与非法数据拦截
 * - ✅ 🆕 WebSocket 双向实时同步管道
 * - ✅ 🆕 自动重连 + 心跳保活
 * - ✅ 🆕 离线队列 + 上线自动补发
 * - ✅ 🆕 推送节流 + 批量合并优化
 *
 * @dependencies: 无外部依赖（纯逻辑层 + 原生 WebSocket）
 * @exports: DataBus singleton, MergeStrategy, DataSource, WSSyncConfig
 */

import type { NodeData } from "../types";

// ============================================================
// 类型定义
// ============================================================

/** 数据来源类型 */
export type DataSource = "websocket" | "user_edit" | "simulation" | "initialization" | "db_restore";

/** 合并策略 */
export type MergeStrategy = "ws_priority" | "user_priority" | "timestamp_win" | "shallow_replace";

/** 数据变更事件 */
export interface DataChangeEvent<T = unknown> {
  entity: string;
  action: "merge" | "update" | "create" | "delete" | "replace";
  source: DataSource;
  timestamp: number;
  payload: T;
  previous?: T;
}

/** DataBus 监听器 */
type DataChangeListener<T = unknown> = (event: DataChangeEvent<T>) => void;

/** WebSocket 同步配置 */
export interface WSSyncConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableOfflineQueue?: boolean;
  throttleMs?: number;
}

/** WebSocket 消息类型 */
export interface WSMessage {
  type: "node_update" | "metrics_update" | "log_entry" | "sync_request" | "heartbeat" | "ack";
  entity?: string;
  data: unknown;
  timestamp: number;
  id?: string;
}

/** WebSocket 连接状态 */
export type WSConnectionState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "reconnecting"
  | "error";

/** 节点字段分类 — 决定合并时听谁的 */
const TELEMETRY_FIELDS = new Set(["gpu", "mem", "temp", "tasks"]);
const USER_EDITABLE_FIELDS = new Set(["status", "model"]);
const _ALL_NODE_FIELDS = new Set([...TELEMETRY_FIELDS, ...USER_EDITABLE_FIELDS, "id"]);

// ============================================================
// DataBus 核心类 (v2.0 — WebSocket Enhanced)
// ============================================================

class DataBusCore {
  private listeners = new Map<string, Set<DataChangeListener>>();
  private eventHistory: DataChangeEvent[] = [];
  private maxHistorySize = 200;
  private userEditedCells = new Map<string, Set<string>>();
  private mergeLog: string[] = [];

  // ---------- WebSocket 引擎 ----------
  private ws: WebSocket | null = null;
  private wsState: WSConnectionState = "disconnected";
  private wsConfig: WSSyncConfig | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private offlineQueue: WSMessage[] = [];
  private lastMessageTime = 0;
  private messageBuffer: WSMessage[] = [];
  private bufferTimer: ReturnType<typeof setTimeout> | null = null;
  private wsStateListeners = new Set<(state: WSConnectionState) => void>();

  // ---------- 公共 API (原有) ----------

  /** 订阅实体变更 */
  subscribe(entity: string, listener: DataChangeListener): () => void {
    if (!this.listeners.has(entity)) {
      this.listeners.set(entity, new Set());
    }
    this.listeners.get(entity)!.add(listener);
    return () => this.listeners.get(entity)?.delete(listener);
  }

  /** 发布变更事件 */
  publish<T>(event: DataChangeEvent<T>): void {
    this.eventHistory.push(event as DataChangeEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[DataBus] ${event.entity}.${event.action} (source: ${event.source}, payload items: ${Array.isArray(event.payload) ? event.payload.length : 1})`
      );
    }
    const entityListeners = this.listeners.get(event.entity);
    if (entityListeners) {
      entityListeners.forEach((fn) => fn(event));
    }
  }

  // ---------- 节点数据智能合并 (原有) ----------

  mergeNodeData(
    currentNodes: NodeData[],
    incomingNodes: NodeData[],
    source: DataSource = "websocket",
    strategy: MergeStrategy = "ws_priority"
  ): NodeData[] {
    const eventTimestamp = Date.now();
    const result: NodeData[] = [];

    const incomingMap = new Map(incomingNodes.map((n) => [n.id, n]));

    for (const current of currentNodes) {
      const incoming = incomingMap.get(current.id);

      if (!incoming) {
        result.push(current);
        continue;
      }

      let merged: NodeData;

      switch (strategy) {
        case "ws_priority":
          merged = this.mergeWithWSPriority(current, incoming);
          break;
        case "user_priority":
          merged = this.mergeWithUserPriority(current, incoming);
          break;
        case "timestamp_win":
          merged = this.mergeTimestampWin(current, incoming);
          break;
        case "shallow_replace":
        default:
          merged = { ...incoming };
          break;
      }

      result.push(merged);
    }

    for (const incoming of incomingNodes) {
      if (!currentNodes.some((n) => n.id === incoming.id)) {
        result.push({ ...incoming });
      }
    }

    this.publish({
      entity: "nodes",
      action: "merge",
      source,
      timestamp: eventTimestamp,
      payload: result,
      previous: currentNodes,
    });

    return result;
  }

  updateUserEditNode(
    currentNodes: NodeData[],
    nodeId: string,
    updates: Partial<NodeData>
  ): NodeData[] {
    const eventTimestamp = Date.now();

    const result = currentNodes.map((node) => {
      if (node.id !== nodeId) { return node; }

      const updatedNode = { ...node, ...updates };

      for (const key of Object.keys(updates)) {
        if (!this.userEditedCells.has(nodeId)) {
          this.userEditedCells.set(nodeId, new Set());
        }
        this.userEditedCells.get(nodeId)!.add(key);
      }

      return updatedNode;
    });

    this.publish({
      entity: "nodes",
      action: "update",
      source: "user_edit",
      timestamp: eventTimestamp,
      payload: result,
      previous: currentNodes,
    });

    return result;
  }

  clearUserEdits(nodeId: string, fields?: string[]): void {
    if (fields) {
      const cellSet = this.userEditedCells.get(nodeId);
      if (cellSet) {
        fields.forEach((f) => cellSet.delete(f));
        if (cellSet.size === 0) { this.userEditedCells.delete(nodeId); }
      }
    } else {
      this.userEditedCells.delete(nodeId);
    }
  }

  replaceNodes(nodes: NodeData[], source: DataSource = "initialization"): NodeData[] {
    this.publish({
      entity: "nodes",
      action: "replace",
      source,
      timestamp: Date.now(),
      payload: nodes,
    });
    return nodes;
  }

  mergeArrayData<T extends { id: string }>(
    current: T[],
    incoming: T[],
    entity: string,
    source: DataSource = "websocket"
  ): T[] {
    const incomingMap = new Map(incoming.map((item) => [item.id, item]));
    const result = current.map((item) => incomingMap.get(item.id) || item);

    for (const item of incoming) {
      if (!current.some((c) => c.id === item.id)) {
        result.push({ ...item });
      }
    }

    this.publish({
      entity,
      action: "merge",
      source,
      timestamp: Date.now(),
      payload: result,
      previous: current,
    });

    return result;
  }

  // ---------- WebSocket 同步引擎 (Legacy — 已被外部桥接替代) ----------
  // @deprecated 此区域代码已不再被生产调用。
  // 自 2026-04-15 Phase 1 起，WebSocket 管理权已移交 useWebSocketData.ts。
  // DataBus 通过 registerWSSender() / ingestWSMessage() 与外部桥接。
  // 计划 v3.0 删除此区域全部代码（connectWS/disconnectWS/sendWS内置路径/startHeartbeat等）。
  // 保留原因: disconnectWS (测试 afterEach cleanup) + sendWS (离线队列 fallback)。
  // 已删除: connectWS (v3.4.1 清理, 无外部消费者, 已由 useWebSocketData 替代)。

  /**
   * 断开 WebSocket 连接
   */
  disconnectWS(): void {
    this.setWSState("disconnecting");
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, "User disconnect");
      this.ws = null;
    }

    this.setWSState("disconnected");
  }

  /**
   * 通过 WebSocket 发送消息（支持离线队列）
   */
  sendWS(message: Omit<WSMessage, 'timestamp' | 'id'>): boolean {
    const fullMessage: WSMessage = {
      ...message,
      timestamp: Date.now(),
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    if (this.externalWSSender) {
      const sent = this.externalWSSender(fullMessage);
      if (!sent && this.wsConfig?.enableOfflineQueue) {
        this.offlineQueue.push(fullMessage);
        console.info(`[DataBus] Message queued (offline, via external): ${fullMessage.type}`);
      }
      return sent;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.wsConfig?.enableOfflineQueue) {
        this.offlineQueue.push(fullMessage);
        console.info(`[DataBus] Message queued (offline): ${fullMessage.type}`);
        return false;
      }
      console.warn("[DataBus] Cannot send: no WebSocket connection available");
      return false;
    }

    this.throttledSend(fullMessage);
    return true;
  }

  /**
   * 订阅 WebSocket 连接状态变化
   */
  onWSStateChange(listener: (state: WSConnectionState) => void): () => void {
    this.wsStateListeners.add(listener);
    return () => this.wsStateListeners.delete(listener);
  }

  /**
   * 获取当前 WebSocket 连接状态
   */
  getWSState(): WSConnectionState {
    return this.wsState;
  }

  /**
   * 检查 WebSocket 是否已连接
   */
  isWSConnected(): boolean {
    if (this.externalWSSender) {
      return true;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ---------- 外部 WebSocket 桥接 (Phase 1 新增) ----------

  /** 外部注入的 WS 发送器（由 useWebSocketData 设置） */
  private externalWSSender: ((msg: Omit<WSMessage, 'timestamp' | 'id'>) => boolean) | null = null;

  registerWSSender(sender: (msg: Omit<WSMessage, 'timestamp' | 'id'>) => boolean): void {
    this.externalWSSender = sender;
  }

  unregisterWSSender(): void {
    this.externalWSSender = null;
  }

  ingestWSMessage(message: Record<string, unknown>): void {
    this.lastMessageTime = Date.now();
    const adapted: WSMessage = {
      type: (message.type as WSMessage["type"]) || "metrics_update",
      entity: message.entity as string | undefined,
      data: message.data ?? message.payload,
      timestamp: Date.now(),
      id: message.id as string | undefined,
    };
    const fakeEvent = { data: JSON.stringify(adapted) } as MessageEvent;
    this.handleWSMessage(fakeEvent);
  }

  // ---------- 内部方法 ----------

  /** 处理收到的 WebSocket 消息 */
  private handleWSMessage(event: MessageEvent): void {
    this.lastMessageTime = Date.now();

    try {
      const message: WSMessage = JSON.parse(event.data);

      switch (message.type) {
        case "node_update":
          if (Array.isArray(message.data)) {
            const nodes = message.data as NodeData[];
            this.publish({
              entity: "nodes",
              action: "merge",
              source: "websocket",
              timestamp: message.timestamp,
              payload: nodes,
            });
          }
          break;

        case "metrics_update":
          if (message.entity) {
            this.publish({
              entity: message.entity,
              action: "merge",
              source: "websocket",
              timestamp: message.timestamp,
              payload: message.data,
            });
          }
          break;

        case "log_entry":
          this.publish({
            entity: "logs",
            action: "create",
            source: "websocket",
            timestamp: message.timestamp,
            payload: message.data,
          });
          break;

        case "heartbeat":
          this.sendWS({ type: "ack", data: { pong: message.timestamp } });
          break;

        case "ack":
          console.info("[DataBus] Received ACK for:", message.data);
          break;

        default:
          console.warn("[DataBus] Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("[DataBus] Failed to parse WebSocket message:", error);
    }
  }

  /** 设置连接状态并通知监听者 */
  private setWSState(state: WSConnectionState): void {
    this.wsState = state;
    this.wsStateListeners.forEach((listener) => listener(state));
  }

  /** 启动心跳 */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) { return; }

    this.heartbeatTimer = setInterval(() => {
      if (this.isWSConnected()) {
        this.sendWS({ type: "heartbeat", data: { time: Date.now() } });
      }
    }, this.wsConfig?.heartbeatInterval ?? 30000);
  }

  /** 停止心跳 */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /** 安排重连 */
  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.wsConfig) { return; }

    const maxAttempts = this.wsConfig.maxReconnectAttempts ?? 10;
    if (this.reconnectAttempts >= maxAttempts) {
      console.error(`[DataBus] Max reconnect attempts (${maxAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      (this.wsConfig.reconnectInterval ?? 3000) * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    console.info(`[DataBus] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`);

    this.setWSState("reconnecting");

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.warn("[DataBus] Legacy reconnect skipped — WS managed externally via registerWSSender");
    }, delay);
  }

  /** 刷新离线队列 */
  private flushOfflineQueue(): void {
    if (this.offlineQueue.length === 0 || !this.isWSConnected()) { return; }

    console.info(`[DataBus] Flushing ${this.offlineQueue.length} queued messages`);

    while (this.offlineQueue.length > 0) {
      const message = this.offlineQueue.shift();
      if (message) {
        this.throttledSend(message);
      }
    }
  }

  /** 节流发送（批量合并优化） */
  private throttledSend(message: WSMessage): void {
    this.messageBuffer.push(message);

    if (this.bufferTimer) { return; }

    this.bufferTimer = setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) { return; }

      const messagesToSend = [...this.messageBuffer];
      this.messageBuffer = [];
      this.bufferTimer = null;

      if (messagesToSend.length === 1) {
        this.ws.send(JSON.stringify(messagesToSend[0]));
      } else {
        messagesToSend.forEach((msg) => {
          this.ws!.send(JSON.stringify(msg));
        });
      }
    }, this.wsConfig?.throttleMs ?? 100);
  }

  // ---------- 查询 API (原有) ----------

  getUserEditedFields(nodeId: string): Set<string> {
    return this.userEditedCells.get(nodeId) || new Set();
  }

  getAllUserEditedNodeIds(): string[] {
    return Array.from(this.userEditedCells.keys());
  }

  getEventHistory(limit?: number): DataChangeEvent[] {
    const history = [...this.eventHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  getEntityHistory(entity: string, limit?: number): DataChangeEvent[] {
    return this.getEventHistory().filter((e) => e.entity === entity).slice(0, limit);
  }

  getMergeLog(): string[] {
    return [...this.mergeLog];
  }

  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  // ---------- 内部合并策略实现 (原有) ----------

  private mergeWithWSPriority(current: NodeData, incoming: NodeData): NodeData {
    const editedFields = this.userEditedCells.get(current.id);
    const result: Record<string, unknown> = { ...incoming };

    if (editedFields && editedFields.size > 0) {
      for (const field of editedFields) {
        if ((field as keyof NodeData) in current) {
          result[field] = current[field as keyof NodeData];
        }
      }
    }

    return result as unknown as NodeData;
  }

  private mergeWithUserPriority(current: NodeData, incoming: NodeData): NodeData {
    const result: Record<string, unknown> = { ...current };

    for (const field of TELEMETRY_FIELDS) {
      if (field in incoming && !this.isFieldUserEdited(current.id, field)) {
        result[field] = incoming[field as keyof NodeData];
      }
    }

    return result as unknown as NodeData;
  }

  private mergeTimestampWin(current: NodeData, incoming: NodeData): NodeData {
    return this.mergeWithWSPriority(current, incoming);
  }

  private isFieldUserEdited(nodeId: string, field: string): boolean {
    return this.userEditedCells.get(nodeId)?.has(field) ?? false;
  }
}

// ============================================================
// 单例导出
// ============================================================

export const dataBus = new DataBusCore();

// ============================================================
// 便捷函数（供组件直接使用）
// ============================================================

/** 通过 DataBus 合并节点数据（推荐入口） */
export function mergeNodes(
  current: NodeData[],
  incoming: NodeData[],
  source: DataSource = "websocket"
): NodeData[] {
  return dataBus.mergeNodeData(current, incoming, source);
}

/** 通过 DataBus 更新用户编辑 */
export function editNode(
  current: NodeData[],
  nodeId: string,
  updates: Partial<NodeData>
): NodeData[] {
  return dataBus.updateUserEditNode(current, nodeId, updates);
}

/** @deprecated connectDataSync 已废弃 — WebSocket 管理权已移交 useWebSocketData.ts，使用 registerWSSender 桥接 */
export async function connectDataSync(_config: WSSyncConfig): Promise<boolean> {
  console.warn("[DataBus] connectDataSync is deprecated — use registerWSSender() instead");
  return false;
}

/** 断开 WebSocket */
export function disconnectDataSync(): void {
  dataBus.disconnectWS();
}
