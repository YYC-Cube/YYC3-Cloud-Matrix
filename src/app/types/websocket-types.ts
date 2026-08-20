/**
 * @file: websocket-types.ts
 * @description: WebSocket 通信类型 — 连接状态 + 消息协议 + 数据状态
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[websocket]
 */

import type { BaseSeverity } from "./common-types";
import type { NodeData } from "./node-types";

/** WebSocket 连接状态 */
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "simulated";

/** 告警严重级别 — RF-005: BaseSeverity 别名 */
export type AlertLevel = BaseSeverity;

/** 告警通知数据 */
export interface AlertData {
  id: string;
  level: AlertLevel;
  message: string;
  source: string;
  timestamp: number;
}

/** 吞吐量历史数据点 */
export interface ThroughputPoint {
  time: string;
  qps: number;
  latency: number;
  tokens: number;
}

/** 系统总览指标 */
export interface SystemStats {
  activeNodes: string;
  gpuUtil: string;
  tokenThroughput: string;
  storageUsed: string;
}

/** WebSocket 消息类型联合 */
export type WSMessage =
  | { type: "qps_update"; payload: { qps: number; trend: string } }
  | { type: "latency_update"; payload: { latency: number; trend: string } }
  | { type: "node_status"; payload: NodeData[] }
  | { type: "alert"; payload: AlertData }
  | { type: "throughput_history"; payload: ThroughputPoint[] }
  | { type: "system_stats"; payload: SystemStats }
  | { type: "heartbeat_ack" };

/** useWebSocketData Hook 返回的完整数据状态 */
export interface WebSocketDataState {
  connectionState: ConnectionState;
  isSimulated: boolean;
  reconnectCount: number;
  lastSyncTime: string;
  liveQPS: number;
  qpsTrend: string;
  liveLatency: number;
  latencyTrend: string;
  activeNodes: string;
  gpuUtil: string;
  tokenThroughput: string;
  storageUsed: string;
  nodes: NodeData[];
  throughputHistory: ThroughputPoint[];
  alerts: AlertData[];
  manualReconnect: () => void;
  clearAlerts: () => void;
}
