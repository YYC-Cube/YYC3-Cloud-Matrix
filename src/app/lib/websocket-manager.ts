/**
 * @file: websocket-manager.ts
 * @description: websocket-manager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

// ============================================================
// Types
// ============================================================

export type WSConnectionState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface WSMessage {
  type: string;
  payload: unknown;
  timestamp?: number;
}

export interface WSConfig {
  endpoints: string[];
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
  reconnectBaseDelayMs: number;
  reconnectMaxDelayMs: number;
  maxReconnectAttempts: number;
  messageQueueSize: number;
  connectionTimeoutMs: number;
}

export interface WSStats {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalMessages: number;
  messagesReceived: number;
  messagesSent: number;
  avgLatencyMs: number;
  currentEndpoint: string | null;
  reconnectCount: number;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
}

export interface QueuedMessage {
  id: string;
  message: WSMessage;
  timestamp: number;
  attempts: number;
}

type WSListener = (message: WSMessage) => void;
type StateListener = (state: WSConnectionState) => void;

// ============================================================
// Constants
// ============================================================

const DEFAULT_CONFIG: WSConfig = {
  endpoints: [],
  heartbeatIntervalMs: 30000,
  heartbeatTimeoutMs: 5000,
  reconnectBaseDelayMs: 1000,
  reconnectMaxDelayMs: 30000,
  maxReconnectAttempts: 10,
  messageQueueSize: 100,
  connectionTimeoutMs: 10000,
};

// ============================================================
// WebSocket Manager Class
// ============================================================

export class WebSocketManager {
  private config: WSConfig;
  private ws: WebSocket | null = null;
  private state: WSConnectionState = "disconnected";
  private currentEndpointIndex: number = 0;
  private reconnectAttempts: number = 0;
  private messageQueue: QueuedMessage[] = [];
  private listeners: Set<WSListener> = new Set();
  private stateListeners: Set<StateListener> = new Set();
  private stats: WSStats;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private latencies: number[] = [];

  constructor(config: Partial<WSConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = this.initStats();
  }

  // ========== Public API ==========

  /**
   * 连接 WebSocket
   */
  connect(): void {
    if (this.state === "connecting" || this.state === "connected") {
      return;
    }

    if (this.config.endpoints.length === 0) {
      this.setState("error");
      return;
    }

    this.setState("connecting");
    this.clearTimers();

    const endpoint = this.config.endpoints[this.currentEndpointIndex];
    this.stats.currentEndpoint = endpoint;

    try {
      this.ws = new WebSocket(endpoint);
      this.setupEventHandlers();
      this.startConnectionTimeout();
    } catch (error) {
      this.handleConnectionError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.state === "disconnected" || this.state === "disconnecting") {
      return;
    }

    this.setState("disconnecting");
    this.clearTimers();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.setState("disconnected");
    this.stats.lastDisconnectedAt = Date.now();
  }

  /**
   * 发送消息
   */
  send(message: WSMessage): boolean {
    if (this.state !== "connected" || !this.ws) {
      this.queueMessage(message);
      return false;
    }

    try {
      const payload = JSON.stringify({
        ...message,
        timestamp: Date.now(),
      });
      this.ws.send(payload);
      this.stats.messagesSent++;
      this.stats.totalMessages++;
      return true;
    } catch {
      this.queueMessage(message);
      return false;
    }
  }

  /**
   * 添加消息监听器
   */
  addListener(listener: WSListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 添加状态监听器
   */
  addStateListener(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * 获取当前状态
   */
  getState(): WSConnectionState {
    return this.state;
  }

  /**
   * 获取统计信息
   */
  getStats(): WSStats {
    return { ...this.stats };
  }

  /**
   * 手动重连
   */
  reconnect(): void {
    this.reconnectAttempts = 0;
    this.disconnect();
    setTimeout(() => this.connect(), 100);
  }

  /**
   * 切换端点
   */
  switchEndpoint(index: number): void {
    if (index >= 0 && index < this.config.endpoints.length) {
      this.currentEndpointIndex = index;
      this.reconnect();
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<WSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 清除消息队列
   */
  clearQueue(): void {
    this.messageQueue = [];
  }

  // ========== Private Methods ==========

  private initStats(): WSStats {
    return {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMessages: 0,
      messagesReceived: 0,
      messagesSent: 0,
      avgLatencyMs: 0,
      currentEndpoint: null,
      reconnectCount: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
    };
  }

  private setState(newState: WSConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((listener) => listener(newState));
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) {return;}

    this.ws.onopen = () => {
      this.clearConnectionTimer();
      this.setState("connected");
      this.stats.totalConnections++;
      this.stats.successfulConnections++;
      this.stats.lastConnectedAt = Date.now();
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushQueue();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onclose = (event) => {
      this.handleClose(event.code, event.reason);
    };

    this.ws.onerror = (_error) => {
      this.handleConnectionError(new Error("WebSocket error"));
    };
  }

  private handleMessage(data: string): void {
    // Reset heartbeat timeout
    this.resetHeartbeatTimeout();

    try {
      const message: WSMessage = JSON.parse(data);

      // Handle heartbeat response
      if (message.type === "heartbeat_ack" || message.type === "pong") {
        this.recordLatency(message.timestamp);
        return;
      }

      this.stats.messagesReceived++;
      this.stats.totalMessages++;

      // Notify listeners
      this.listeners.forEach((listener) => {
        try {
          listener(message);
        } catch { /* ignore listener errors */ }
      });
    } catch { /* ignore parse errors */ }
  }

  private handleClose(code: number, _reason: string): void {
    this.clearTimers();
    this.ws = null;
    this.stats.lastDisconnectedAt = Date.now();

    if (code === 1000) {
      this.setState("disconnected");
    } else {
      this.setState("disconnected");
      this.scheduleReconnect();
    }
  }

  private handleConnectionError(_error: unknown): void {
    this.clearTimers();
    this.stats.failedConnections++;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Try next endpoint
    if (this.currentEndpointIndex < this.config.endpoints.length - 1) {
      this.currentEndpointIndex++;
      this.connect();
    } else {
      this.currentEndpointIndex = 0;
      this.setState("error");
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setState("error");
      return;
    }

    this.setState("reconnecting");
    const delay = this.calculateReconnectDelay();

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.stats.reconnectCount++;
      this.connect();
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const delay = Math.min(
      this.config.reconnectBaseDelayMs * Math.pow(2, this.reconnectAttempts),
      this.config.reconnectMaxDelayMs
    );
    // Add jitter (±20%)
    return delay * (0.8 + Math.random() * 0.4);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.state === "connected" && this.ws) {
        this.ws.send(JSON.stringify({
          type: "heartbeat",
          timestamp: Date.now(),
        }));

        this.heartbeatTimeoutTimer = setTimeout(() => {
          console.warn("[WebSocket] Heartbeat timeout, reconnecting...");
          this.ws?.close();
        }, this.config.heartbeatTimeoutMs);
      }
    }, this.config.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.resetHeartbeatTimeout();
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private startConnectionTimeout(): void {
    this.connectionTimer = setTimeout(() => {
      if (this.state === "connecting") {
        this.handleConnectionError(new Error("Connection timeout"));
      }
    }, this.config.connectionTimeoutMs);
  }

  private clearConnectionTimer(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    this.clearConnectionTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private queueMessage(message: WSMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift();
    }

    this.messageQueue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      timestamp: Date.now(),
      attempts: 0,
    });
  }

  private flushQueue(): void {
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const item of queue) {
      item.attempts++;
      if (item.attempts <= 3) {
        this.send(item.message);
      }
    }
  }

  private recordLatency(timestamp?: number): void {
    if (timestamp) {
      const latency = Date.now() - timestamp;
      this.latencies.push(latency);
      if (this.latencies.length > 100) {
        this.latencies = this.latencies.slice(-100);
      }
      this.stats.avgLatencyMs = Math.round(
        this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      );
    }
  }
}

// ============================================================
// Factory Function
// ============================================================

export function createWebSocketManager(config: Partial<WSConfig>): WebSocketManager {
  return new WebSocketManager(config);
}
