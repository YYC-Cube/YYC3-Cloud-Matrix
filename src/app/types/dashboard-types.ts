/**
 * @file: dashboard-types.ts
 * @description: Dashboard 数据类型 — 从 dashboard-stores.ts 统一迁移 (2026-04-16)
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[dashboard]
 */

import type { LogLevel } from "./filesystem-types";

/** 模型性能评估条目 */
export interface ModelPerfEntry {
  id: string;
  model: string;
  accuracy: number;
  speed: number;
  memory: number;
  cost: number;
}

/** 模型分布条目 */
export interface ModelDistEntry {
  id: string;
  name: string;
  value: number;
}

/** 最近操作条目 */
export interface RecentOpEntry {
  id: string;
  action: string;
  target: string;
  user: string;
  time: string;
  status: "success" | "running" | "pending" | "warning" | "error";
}

/** 雷达图数据条目 */
export interface RadarEntry {
  id: string;
  metric: string;
  A: number;
  B: number;
}

/** 持久化日志条目 */
export interface StoredLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
}

/** 已部署模型条目 */
export interface DeployedModel {
  id: string;
  name: string;
  version: string;
  size: string;
  status: "deployed" | "deploying" | "standby" | "error";
  gpu: string;
}

/** WiFi 网络条目 */
export interface WifiNetwork {
  id: string;
  ssid: string;
  signal: number;
  security: string;
  connected: boolean;
  password?: string;
  lastConnectedAt?: number;
}

/** 用户管理记录 */
export interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: "online" | "offline";
  lastLogin: string;
  sessions: number;
  apiCalls: number;
  locked: boolean;
}

/** WiFi 自动重连设置 */
export interface WifiAutoReconnectSettings {
  id: string;
  enabled: boolean;
  preferStrongestSignal: boolean;
  intervalSeconds: number;
  maxRetries: number;
  preferredSsid: string;
  lastUpdatedAt: number;
}

/** 跟进任务记录 */
export interface FollowUpRecord {
  id: string;
  taskId: string;
  taskName: string;
  assignee: string;
  assigneeName: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: number;
  completedAt?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  category: "maintenance" | "optimization" | "security" | "feature" | "bugfix";
}
