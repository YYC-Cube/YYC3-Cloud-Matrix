/**
 * @file: dashboard-stores.ts
 * @description: YYC³ Dashboard Stores (Legacy) · createLocalStore 实例
 * @author: YanYuCloudCube Team
 * @version: v2.1.0
 * @created: 2026-04-08
 * @updated: 2026-04-17
 * @status: active
 * @tags: [module],[legacy],[test-infra]
 *
 * @brief: 测试基础设施 — 生产代码已全部迁移至 Zustand slices
 *
 * @migration-note:
 * - 所有 interface 定义已迁移至 src/app/types/index.ts (Section 38)
 * - 生产代码零引用 (grep -r "dashboard-stores" src/app/ --exclude-dir=__tests__ = 0)
 * - 2 个测试文件仍引用此文件 (core-components-integration, followUpStore)
 * - 完整迁移需重写测试用例，成本高收益低，保留为测试基础设施
 * - useAISuggestion.ts 已于 Phase U 迁移至 ai-suggestion-slice.ts (createLocalStore 生产消费者归零)
 */

import { createLocalStore } from "../lib/create-local-store";
import type { NodeData } from "../types";

// 从统一类型文件 re-export，保持向后兼容
export type {
  ModelPerfEntry,
  ModelDistEntry,
  RecentOpEntry,
  RadarEntry,
  StoredLogEntry,
  DBConnection,
  DeployedModel,
  WifiNetwork,
  UserRecord,
  WifiAutoReconnectSettings,
  FollowUpRecord,
} from "../types";

// ============================================================
// 1. 节点存储
// ============================================================

const DEFAULT_NODES: (NodeData & { id: string })[] = [
  { id: "GPU-A100-01", status: "active",   gpu: 87, mem: 72, temp: 68, model: "LLaMA-70B",    tasks: 128 },
  { id: "GPU-A100-02", status: "active",   gpu: 92, mem: 85, temp: 74, model: "Qwen-72B",     tasks: 156 },
  { id: "GPU-A100-03", status: "warning",  gpu: 98, mem: 94, temp: 82, model: "DeepSeek-V3",  tasks: 89 },
  { id: "GPU-A100-04", status: "active",   gpu: 45, mem: 38, temp: 52, model: "Mistral-7B",   tasks: 34 },
  { id: "GPU-A100-05", status: "active",   gpu: 73, mem: 61, temp: 63, model: "Claude-3.5",   tasks: 97 },
  { id: "GPU-A100-06", status: "active",   gpu: 56, mem: 48, temp: 58, model: "GPT-4o",       tasks: 112 },
  { id: "GPU-A100-07", status: "active",   gpu: 81, mem: 76, temp: 71, model: "Qwen-72B",     tasks: 143 },
  { id: "GPU-A100-08", status: "inactive", gpu: 0,  mem: 5,  temp: 32, model: "",              tasks: 0 },
  { id: "GPU-H100-01", status: "active",   gpu: 65, mem: 58, temp: 62, model: "GLM-4",        tasks: 78 },
];

/**
 * @deprecated 此 Store 已被 useNodeSlice (Zustand) 完全替代。
 * 节点数据的唯一权威源现在是 src/app/store/slices/node-slice.ts。
 * 当前仅被测试文件引用（global-data-interoperability.test.ts）。
 * 计划于 Phase 4 Step 4.3 完成测试迁移后删除。
 * 最后更新: 2026-04-15
 * @see useNodeSlice - 替代方案
 */
export const nodeStore = createLocalStore<NodeData & { id: string }>("yyc3_nodes", DEFAULT_NODES, "node");

// ============================================================
// 2. 模型性能存储
// ============================================================

import type { ModelPerfEntry } from "../types";
const DEFAULT_MODEL_PERF: ModelPerfEntry[] = [
  { id: "mp-1", model: "LLaMA-70B",    accuracy: 94.2, speed: 85, memory: 78, cost: 62 },
  { id: "mp-2", model: "Qwen-72B",     accuracy: 92.8, speed: 88, memory: 72, cost: 68 },
  { id: "mp-3", model: "DeepSeek-V3",  accuracy: 96.1, speed: 76, memory: 85, cost: 55 },
  { id: "mp-4", model: "GLM-4",        accuracy: 91.5, speed: 92, memory: 65, cost: 75 },
  { id: "mp-5", model: "Mixtral-8x7B", accuracy: 89.3, speed: 95, memory: 60, cost: 82 },
];

export const modelPerfStore = createLocalStore<ModelPerfEntry>("yyc3_model_perf", DEFAULT_MODEL_PERF, "mp");

// ============================================================
// 3. 模型分布存储
// ============================================================

import type { ModelDistEntry } from "../types";
const DEFAULT_MODEL_DIST: ModelDistEntry[] = [
  { id: "md-1", name: "LLaMA-70B",   value: 35 },
  { id: "md-2", name: "Qwen-72B",    value: 25 },
  { id: "md-3", name: "DeepSeek-V3", value: 20 },
  { id: "md-4", name: "GLM-4",       value: 12 },
  { id: "md-5", name: "other",       value: 8 },
];

export const modelDistStore = createLocalStore<ModelDistEntry>("yyc3_model_dist", DEFAULT_MODEL_DIST, "md");

// ============================================================
// 4. 最近操作存储
// ============================================================

import type { RecentOpEntry } from "../types";
const DEFAULT_RECENT_OPS: RecentOpEntry[] = [
  { id: "OP-001", action: "模型部署", target: "DeepSeek-V3 → GPU-A100-03", user: "admin",   time: "14:28:32", status: "success" },
  { id: "OP-002", action: "推理任务", target: "Batch#2847 → LLaMA-70B",    user: "api_svc", time: "14:25:10", status: "running" },
  { id: "OP-003", action: "节点扩容", target: "GPU-H100-03 加入集群",      user: "ops_bot", time: "14:20:55", status: "pending" },
  { id: "OP-004", action: "数据同步", target: "向量库 → 分片迁移",         user: "admin",   time: "14:15:22", status: "success" },
  { id: "OP-005", action: "告警处理", target: "GPU-A100-03 温度预警",      user: "system",  time: "14:10:08", status: "warning" },
];

export const recentOpsStore = createLocalStore<RecentOpEntry>("yyc3_recent_ops", DEFAULT_RECENT_OPS, "OP");

// ============================================================
// 5. 雷达数据存储
// ============================================================

import type { RadarEntry } from "../types";
const DEFAULT_RADAR: RadarEntry[] = [
  { id: "rd-1", metric: "inferenceSpeed",    A: 92, B: 85 },
  { id: "rd-2", metric: "modelAccuracy",     A: 88, B: 94 },
  { id: "rd-3", metric: "memoryEfficiency",  A: 95, B: 78 },
  { id: "rd-4", metric: "throughput",        A: 90, B: 82 },
  { id: "rd-5", metric: "reliability",       A: 96, B: 91 },
  { id: "rd-6", metric: "latency",           A: 85, B: 88 },
];

export const radarStore = createLocalStore<RadarEntry>("yyc3_radar_data", DEFAULT_RADAR, "rd");

// ============================================================
// 6. 日志存储
// ============================================================

import type { StoredLogEntry } from "../types";
const now = Date.now();
const DEFAULT_LOGS: StoredLogEntry[] = [
  { id: "log-001", timestamp: now - 120000,  level: "info",  source: "GPU-A100-01", message: "推理任务完成 #12847, 延迟 820ms" },
  { id: "log-002", timestamp: now - 240000,  level: "info",  source: "GPU-A100-03", message: "模型缓存命中 LLaMA-70B, 跳过加载" },
  { id: "log-003", timestamp: now - 360000,  level: "warn",  source: "GPU-A100-03", message: "GPU 温度接近阈值 78°C > 75°C" },
  { id: "log-004", timestamp: now - 480000,  level: "error", source: "GPU-H100-01", message: "推理超时 task #12853, 超过 5000ms" },
  { id: "log-005", timestamp: now - 600000,  level: "info",  source: "system",      message: "批次处理完成 batch_size=32, tokens=4096" },
  { id: "log-006", timestamp: now - 720000,  level: "warn",  source: "GPU-A100-03", message: "内存使用率 89%, 建议清理缓存" },
  { id: "log-007", timestamp: now - 840000,  level: "debug", source: "scheduler",   message: "WebSocket 心跳 ack, 延迟 12ms" },
  { id: "log-008", timestamp: now - 960000,  level: "info",  source: "system",      message: "自动巡查完成, 健康度 96%" },
  { id: "log-009", timestamp: now - 1080000, level: "error", source: "db-sync",     message: "数据库连接超时, 重试 1/3" },
  { id: "log-010", timestamp: now - 1200000, level: "fatal", source: "GPU-A100-03", message: "GPU 驱动崩溃, 节点进入降级模式" },
  { id: "log-011", timestamp: now - 1320000, level: "info",  source: "system",      message: "配置热更新完成 patrol.interval=15" },
  { id: "log-012", timestamp: now - 1440000, level: "warn",  source: "system",      message: "存储空间 85.8%, 接近告警阈值" },
  { id: "log-013", timestamp: now - 1560000, level: "info",  source: "GPU-A100-01", message: "NAS 备份已完成 12.8GB → 本地存储" },
  { id: "log-014", timestamp: now - 1680000, level: "debug", source: "scheduler",   message: "推理队列长度 3, 平均等待 45ms" },
  { id: "log-015", timestamp: now - 1800000, level: "info",  source: "system",      message: "Token 吞吐率 138K/s, 近 1h 稳定" },
];

export const logStore = createLocalStore<StoredLogEntry>("yyc3_logs", DEFAULT_LOGS, "log");

// ============================================================
// 7. 数据库连接存储
// ============================================================

import type { DBConnection as DBConnectionType } from "../types";
const DEFAULT_DB_CONNECTIONS: DBConnectionType[] = [
  {
    id: "db-pg-main",
    name: "主数据库 (PostgreSQL)",
    type: "postgresql",
    host: "localhost",
    port: 5433,
    database: "yyc3_matrix",
    username: "admin",
    password: "",
    status: "disconnected",
    options: "sslmode=disable",
  },
  {
    id: "db-redis",
    name: "缓存 (Redis)",
    type: "redis",
    host: "localhost",
    port: 6379,
    database: "0",
    username: "",
    password: "",
    status: "disconnected",
  },
];

export const dbConnectionStore = createLocalStore<DBConnectionType>("yyc3_db_connections", DEFAULT_DB_CONNECTIONS, "db");

// ============================================================
// 8. 模型管理存储 (SystemSettings 模型管理)
// ============================================================

import type { DeployedModel } from "../types";
const DEFAULT_DEPLOYED_MODELS: DeployedModel[] = [
  { id: "dm-1", name: "LLaMA-70B",    version: "v2.1", size: "140GB", status: "deployed",  gpu: "GPU-A100-01" },
  { id: "dm-2", name: "Qwen-72B",     version: "v1.5", size: "145GB", status: "deployed",  gpu: "GPU-A100-02" },
  { id: "dm-3", name: "DeepSeek-V3",  version: "v3.0", size: "180GB", status: "deploying", gpu: "GPU-A100-03" },
  { id: "dm-4", name: "GLM-4",        version: "v4.0", size: "92GB",  status: "deployed",  gpu: "GPU-H100-01" },
  { id: "dm-5", name: "Mixtral-8x7B", version: "v0.1", size: "95GB",  status: "standby",   gpu: "-" },
];

export const deployedModelStore = createLocalStore<DeployedModel>("yyc3_deployed_models", DEFAULT_DEPLOYED_MODELS, "dm");

// ============================================================
// 9. WiFi 网络存储
// ============================================================

import type { WifiNetwork } from "../types";
const DEFAULT_WIFI_NETWORKS: WifiNetwork[] = [];

export const wifiNetworkStore = createLocalStore<WifiNetwork>("yyc3_wifi_networks", DEFAULT_WIFI_NETWORKS, "wifi");

// ============================================================
// 10. 用户管理存储
// ============================================================

import type { UserRecord } from "../types";
const DEFAULT_USERS: UserRecord[] = [
  { id: "usr-1", name: "张管理", username: "admin", email: "admin@cloudpivot.ai", role: "超级管理员", status: "online", lastLogin: "2026-02-22 14:30", sessions: 3, apiCalls: 1284, locked: false },
  { id: "usr-2", name: "李运维", username: "ops_li", email: "ops_li@cloudpivot.ai", role: "运维工程师", status: "online", lastLogin: "2026-02-22 14:25", sessions: 1, apiCalls: 856, locked: false },
  { id: "usr-3", name: "王开发", username: "dev_wang", email: "dev_wang@cloudpivot.ai", role: "开发者", status: "online", lastLogin: "2026-02-22 14:18", sessions: 2, apiCalls: 2105, locked: false },
  { id: "usr-4", name: "赵分析", username: "analyst_zhao", email: "zhao@cloudpivot.ai", role: "数据分析师", status: "online", lastLogin: "2026-02-22 13:55", sessions: 1, apiCalls: 432, locked: false },
  { id: "usr-5", name: "刘测试", username: "qa_liu", email: "qa_liu@cloudpivot.ai", role: "测试工程师", status: "offline", lastLogin: "2026-02-21 18:30", sessions: 0, apiCalls: 321, locked: false },
  { id: "usr-6", name: "陈研究", username: "dev_chen", email: "chen@cloudpivot.ai", role: "AI 研究员", status: "offline", lastLogin: "2026-02-21 17:45", sessions: 0, apiCalls: 1567, locked: false },
  { id: "usr-7", name: "API Service", username: "api_svc", email: "svc@cloudpivot.ai", role: "系统服务", status: "online", lastLogin: "2026-02-22 14:32", sessions: 12, apiCalls: 48920, locked: false },
  { id: "usr-8", name: "OPS Bot", username: "ops_bot", email: "bot@cloudpivot.ai", role: "自动化运维", status: "online", lastLogin: "2026-02-22 14:32", sessions: 1, apiCalls: 15240, locked: false },
];

export const userStore = createLocalStore<UserRecord>("yyc3_users", DEFAULT_USERS, "usr");

// ============================================================
// 11. WiFi 自动重连设置存储
// ============================================================

import type { WifiAutoReconnectSettings } from "../types";
const DEFAULT_WIFI_AUTO_RECONNECT: WifiAutoReconnectSettings[] = [
  {
    id: "wifi-ar-config",
    enabled: true,
    preferStrongestSignal: true,
    intervalSeconds: 5,
    maxRetries: 10,
    preferredSsid: "",
    lastUpdatedAt: Date.now(),
  },
];

export const wifiAutoReconnectStore = createLocalStore<WifiAutoReconnectSettings>(
  "yyc3_wifi_auto_reconnect",
  DEFAULT_WIFI_AUTO_RECONNECT,
  "wifi-ar"
);

/**
 * 便捷工具：获取当前自动重连配置（单例）
 */
export function getWifiAutoReconnectConfig(): WifiAutoReconnectSettings {
  const all = wifiAutoReconnectStore.getAll();
  return all[0] || DEFAULT_WIFI_AUTO_RECONNECT[0];
}

/**
 * 便捷工具：更新自动重连配置
 */
export function updateWifiAutoReconnectConfig(
  updates: Partial<Omit<WifiAutoReconnectSettings, "id">>
): WifiAutoReconnectSettings | null {
  const config = getWifiAutoReconnectConfig();
  return wifiAutoReconnectStore.update(config.id, {
    ...updates,
    lastUpdatedAt: Date.now(),
  });
}

// ============================================================
// 12. 后续跟进任务存储
// ============================================================

import type { FollowUpRecord } from "../types";
const DEFAULT_FOLLOW_UPS: FollowUpRecord[] = [
  {
    id: "fu-001",
    taskId: "TASK-001",
    taskName: "GPU-A100-03 温度优化",
    assignee: "usr-2",
    assigneeName: "李运维",
    priority: "high",
    status: "in_progress",
    dueDate: Date.now() + 86400000 * 2,
    notes: "GPU 温度持续偏高，需要检查散热系统",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    category: "maintenance",
  },
  {
    id: "fu-002",
    taskId: "TASK-002",
    taskName: "数据库连接池优化",
    assignee: "usr-3",
    assigneeName: "王开发",
    priority: "medium",
    status: "pending",
    dueDate: Date.now() + 86400000 * 5,
    notes: "当前连接池配置需要根据实际负载调整",
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    category: "optimization",
  },
  {
    id: "fu-003",
    taskId: "TASK-003",
    taskName: "安全补丁更新",
    assignee: "usr-1",
    assigneeName: "张管理",
    priority: "critical",
    status: "pending",
    dueDate: Date.now() + 86400000,
    notes: "系统安全补丁 v2.1.5 需要紧急部署",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    category: "security",
  },
];

export const followUpStore = createLocalStore<FollowUpRecord>("yyc3_follow_ups", DEFAULT_FOLLOW_UPS, "fu");

/**
 * 便捷工具：获取所有待处理的跟进任务
 */
export function getPendingFollowUps(): FollowUpRecord[] {
  return followUpStore.getAll().filter(fu => fu.status === "pending" || fu.status === "in_progress");
}

/**
 * 便捷工具：获取已过期的跟进任务
 */
export function getOverdueFollowUps(): FollowUpRecord[] {
  const now = Date.now();
  return followUpStore.getAll().filter(fu => 
    (fu.status === "pending" || fu.status === "in_progress") && fu.dueDate < now
  );
}

/**
 * 便捷工具：根据优先级获取跟进任务
 */
export function getFollowUpsByPriority(priority: FollowUpRecord["priority"]): FollowUpRecord[] {
  return followUpStore.getAll().filter(fu => fu.priority === priority);
}

/**
 * 便捷工具：根据负责人获取跟进任务
 */
export function getFollowUpsByAssignee(assigneeId: string): FollowUpRecord[] {
  return followUpStore.getAll().filter(fu => fu.assignee === assigneeId);
}