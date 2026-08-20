/**
 * @file: yyc3-storage.ts
 * @description: 统一本地存储层 · 双层缓存策略（localStorage + IndexedDB）
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [lib],[storage],[indexeddb]
 *
 * @brief: 统一本地存储层
 *
 * @details:
 * - localStorage → 轻量配置 (认证/语言/网络/主题, < 5KB 单项)
 * - IndexedDB → 大数据持久化 (告警规则/巡查历史/闭环历史/操作模板/诊断记录/报表/错误日志)
 * - BroadcastChannel → 多标签页实时同步
 * - 支持 CLI 终端数据导入导出
 *
 * @dependencies: broadcast-channel
 * @exports: idbPut, idbGet, idbGetAll, idbDelete, idbClear, localStorage helpers
 * @notes: 遵循 Guidelines 10.1 双层缓存策略
 */

// ============================================================
//  1. IndexedDB Wrapper
// ============================================================

const DB_NAME = "yyc3_matrix";
const DB_VERSION = 5;

/** IndexedDB store 名称 — centralized in types/index.ts */
import type { StorageChangeEvent, StoreName } from "../types";
// RF-011: Re-export 已移除 — StoreName/StorageChangeEvent 统一从 types/index.ts 导入

// RF-009: 统一 BroadcastChannel 工厂
import { getSharedChannel } from "./broadcast-channel";

/**
 * RF-004: 全局唯一 store 名称数组
 * 新增 store 时只需在此处和 types/index.ts 的 StoreName 联合类型中同步添加
 */
export const ALL_STORES: StoreName[] = [
  "alertRules",
  "alertEvents",
  "patrolHistory",
  "loopHistory",
  "operationTemplates",
  "operationLogs",
  "diagnosisHistory",
  "reports",
  "errorLog",
  "dashboardSnapshots",
  "fileVersions",
  "dbConnections",
  "queryHistory",
  "committedChanges",
  "agent_memories",
  "agent_tasks",
  "mcp_contexts",
  "inference_cache",
  "family_messages",
  "family_activities",
  "family_memories",
  "family_broadcasts",
  "music_library",
  "comm_stations",
] as const as unknown as StoreName[];

/** 打开数据库，自动创建 object stores */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // v4 自定义 keyPath store
      const customStores: Record<string, string> = {
        mcp_contexts: "agentId",
        inference_cache: "hash",
      };

      // v1-v3: 标准 store (keyPath: "id")，跳过自定义 keyPath 的 store
      for (const name of ALL_STORES) {
        if (customStores[name]) { continue; }
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      }

      // v4: 自定义 keyPath store + 索引
      if (event.oldVersion < 4) {
        // agent_memories: keyPath=id + indexes
        if (!db.objectStoreNames.contains("agent_memories")) {
          const store = db.createObjectStore("agent_memories", { keyPath: "id" });
          store.createIndex("by_agent", "agentId");
          store.createIndex("by_category", "category");
          store.createIndex("by_timestamp", "timestamp");
        }

        // agent_tasks: keyPath=id + indexes
        if (!db.objectStoreNames.contains("agent_tasks")) {
          const store = db.createObjectStore("agent_tasks", { keyPath: "id" });
          store.createIndex("by_assignee", "assigneeId");
          store.createIndex("by_status", "status");
          store.createIndex("by_created", "createdAt");
        }

        // mcp_contexts: keyPath=agentId
        if (!db.objectStoreNames.contains("mcp_contexts")) {
          db.createObjectStore("mcp_contexts", { keyPath: "agentId" });
        }

        // inference_cache: keyPath=hash + indexes
        if (!db.objectStoreNames.contains("inference_cache")) {
          const store = db.createObjectStore("inference_cache", { keyPath: "hash" });
          store.createIndex("by_model", "modelId");
          store.createIndex("by_timestamp", "timestamp");
        }
      }
    };

    // RF-010: onblocked — 另一个标签页阻止了版本升级
    request.onblocked = () => {
      console.warn(
        "[YYC³ IndexedDB] 数据库版本升级被阻塞，请关闭其他标签页后刷新"
      );
    };

    request.onsuccess = () => {
      const db = request.result;

      // RF-010: versionchange — 另一个标签页升级了 DB_VERSION
      // 主动关闭 stale 连接，重置缓存，下次操作会自动重连
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
        console.info(
          "[YYC³ IndexedDB] 检测到数据库版本变更，已关闭旧连接，下次操作将自动重连"
        );
      };

      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });
}

/** 缓存数据库连接 */
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * 获取数据库连接
 * RF-010: 检测连接是否已关闭（objectStoreNames 不可访问 / 空），
 *         若已关闭则重置 dbPromise 并重新打开
 */
function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDB().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  // RF-010: 连接可能被 onversionchange 关闭，需要验证
  return dbPromise.then((db) => {
    try {
      // 如果连接已关闭，访问 objectStoreNames 会抛出 InvalidStateError

      db.objectStoreNames;
      return db;
    } catch {
      // 连接已失效，重新打开
      dbPromise = null;
      return getDB();
    }
  });
}

// ============================================================
//  2. 通用 CRUD 操作
// ============================================================

/** 写入单条记录 */
export async function idbPut<T extends { id: string }>(
  store: StoreName,
  item: T
): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(item);
      tx.oncomplete = () => {
        broadcastChange(store, "put", item.id);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB 不可用时静默降级
  }
}

/** 批量写入 */
export async function idbPutMany<T extends { id: string }>(
  store: StoreName,
  items: T[]
): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const os = tx.objectStore(store);
      for (const item of items) {
        os.put(item);
      }
      tx.oncomplete = () => {
        broadcastChange(store, "putMany", items.length.toString());
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback silent
  }
}

/** 读取单条 */
export async function idbGet<T>(store: StoreName, id: string): Promise<T | undefined> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(id);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

/** 读取全部 */
export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/** 删除单条 */
export async function idbDelete(store: StoreName, id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(id);
      tx.oncomplete = () => {
        broadcastChange(store, "delete", id);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback silent
  }
}

/** 清空 store */
export async function idbClear(store: StoreName): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).clear();
      tx.oncomplete = () => {
        broadcastChange(store, "clear", store);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback silent
  }
}

/** 获取 store 记录数 */
export async function idbCount(store: StoreName): Promise<number> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}

// ============================================================
//  3. BroadcastChannel — 多标签页同步
//  RF-009: 使用 broadcast-channel.ts 统一工厂，消除单独的单例管理
// ============================================================

const STORAGE_CHANNEL_NAME = "yyc3_storage_sync";

type ChangeListener = (event: StorageChangeEvent) => void;
const listeners: ChangeListener[] = [];
let channelInitialized = false;

/** 确保 storage channel 已初始化（注册 onmessage 监听） */
function ensureChannelListener(): void {
  if (channelInitialized) { return; }
  const ch = getSharedChannel(STORAGE_CHANNEL_NAME);
  if (!ch) { return; }
  ch.onmessage = (event: MessageEvent<StorageChangeEvent>) => {
    for (const fn of listeners) {
      try {
        fn(event.data);
      } catch {
        // listener error - ignore
      }
    }
  };
  channelInitialized = true;
}

/** 广播变更通知到其他标签页 */
function broadcastChange(store: StoreName, action: string, key: string) {
  const ch = getSharedChannel(STORAGE_CHANNEL_NAME);
  if (ch) {
    const event: StorageChangeEvent = {
      store,
      action,
      key,
      timestamp: Date.now(),
    };
    try {
      ch.postMessage(event);
    } catch {
      // BroadcastChannel 异常 - ignore
    }
  }
}

/** 注册跨标签页变更监听器 */
export function onStorageChange(listener: ChangeListener): () => void {
  ensureChannelListener(); // 确保 channel 已初始化
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) { listeners.splice(idx, 1); }
  };
}

// ============================================================
//  4. 数据导入导出 (CLI / 设置页面使用)
// ============================================================

/** 导出所有 IndexedDB 数据为 JSON */
export async function exportAllData(): Promise<Record<StoreName, unknown[]>> {
  const result: Record<string, unknown[]> = {};
  for (const store of ALL_STORES) {
    result[store] = await idbGetAll(store);
  }
  return result as Record<StoreName, unknown[]>;
}

/** 导入 JSON 数据到 IndexedDB */
export async function importAllData(
  data: Partial<Record<StoreName, { id: string }[]>>
): Promise<{ imported: number; stores: string[] }> {
  let total = 0;
  const storeNames: string[] = [];

  for (const [store, items] of Object.entries(data)) {
    if (Array.isArray(items) && items.length > 0) {
      await idbPutMany(store as StoreName, items);
      total += items.length;
      storeNames.push(store);
    }
  }

  return { imported: total, stores: storeNames };
}

/** 获取所有 store 的存储统计 */
export async function getStorageStats(): Promise<{
  stores: { name: StoreName; count: number }[];
  totalRecords: number;
}> {
  const stores: { name: StoreName; count: number }[] = [];
  let totalRecords = 0;

  for (const name of ALL_STORES) {
    const count = await idbCount(name);
    stores.push({ name, count });
    totalRecords += count;
  }

  return { stores, totalRecords };
}

// ============================================================
//  5. localStorage Key 注册表 (统一管理)
// ============================================================

/**
 * YYC³ localStorage 全部 Key 清单
 * 用于安全检测扫描 / 数据清理 / 隐私合规
 */
export const LOCALSTORAGE_KEYS = {
  // ── 认证与会话 ──
  session: "yyc3_session",           // 认证会话
  ghost: "yyc3_ghost",             // 幽灵模式标记
  locale: "yyc3_locale",            // 语言偏好

  // ── AI 模型 ──
  configuredModels: "yyc3_configured_models", // AI 模型配置
  modelProviders: "yyc3_model_providers",   // 模型服务商

  // ── SDK ──
  sdkSessions: "yyc3_sdk_sessions",      // 聊天会话
  sdkStats: "yyc3_sdk_stats",         // SDK 使用统计

  // ── 同步与队列 ──
  syncQueue: "yyc3_sync_queue",        // 后台同步队列
  errorLog: "yyc3_error_log",         // 错误日志

  // ── 网络 ──
  networkConfig: "network_config",         // 网络配置
  corsProxy: "yyc3_cors_proxy",        // CORS 代理设置
  apiEndpoints: "yyc3_api_endpoints",     // API 端点配置

  // ── 离线与 PWA ──
  offlineSnapshot: "offline_snapshot",       // 离线快照
  offlineTime: "offline_snapshot_time",  // 离线快照时间
  pwaInstallDismiss: "pwa_install_dismissed",  // PWA 安装提示

  // ── 仪表盘 ──
  dashboardState: "dashboard_state",        // 仪表盘状态 (用于离线快照)

  // ── 系统设置 ──
  systemSettings: "yyc3_system_settings",   // 系统设置
  envConfig: "env_config",             // 环境变量配置

  // ── IDE ──
  ideLayoutMode: "yyc3-ide-layout-mode",   // IDE 布局模式
  terminalHeight: "yyc3_terminal_height",   // 终端高度

  // ── 主题 ──
  customTheme: "yyc3_custom_theme",      // 自定义主题

  // ── 音乐 ──
  musicWorks: "d-music-works",          // 音乐作品

  // ── AI Family ──
  familyCommMessages: "yyc3-family-comm-messages",     // 家人通讯消息
  familyProviderKeys: "yyc3-family-provider-keys",     // 家人 Provider 密钥
  familyModelAssignments: "yyc3-family-model-assignments", // 家人模型分配
  familyVoiceProfiles: "yyc3-family-voice-profiles",    // 家人语音配置
  familyDiagnostics: "yyc3-family-diagnostics",       // 家人诊断数据

  // ── 性能与监控 ──
  perfHistory: "yyc3_perf_history",            // 性能历史
  performanceMonitor: "yyc3_performance_monitor",      // 性能监控

  // ── 安全 ──
  securityAudit: "yyc3_security_audit",          // 安全审计
  dependencyScan: "yyc3_dependency_scan",          // 依赖扫描

  // ── AI 分析 ──
  aiPatterns: "yyc3_ai_patterns",             // AI 使用模式
  aiRecommendations: "yyc3_ai_recommendations",       // AI 建议

  // ── Zustand persist (Slice) ──
  nodeSlice: "yyc3-node-slice",
  dbConnSlice: "yyc3-db-conn-slice",
  followUpSlice: "yyc3-follow-up-slice",
  metricsSlice: "yyc3-metrics-slice",
  logSlice: "yyc3-log-slice",
  modelSlice: "yyc3-model-slice",
  networkSlice: "yyc3-network-slice",
  userMgmtSlice: "yyc3-user-mgmt-slice",
  familyMemberSlice: "yyc3-family-members",
  familyMessageSlice: "yyc3-family-messages",
  globalStore: "yyc3-global-store",

  // ── createLocalStore (legacy dashboard-stores) ──
  nodesStore: "yyc3_nodes",
  modelPerfStore: "yyc3_model_perf",
  modelDistStore: "yyc3_model_dist",
  recentOpsStore: "yyc3_recent_ops",
  radarStore: "yyc3_radar_data",
  logStore: "yyc3_logs",
  dbConnectionStore: "yyc3_db_connections",
  deployedModelStore: "yyc3_deployed_models",
  wifiNetworkStore: "yyc3_wifi_networks",
  userStore: "yyc3_users",
  wifiAutoReconnectStore: "yyc3_wifi_auto_reconnect",
  followUpStore: "yyc3_follow_ups",
  alertItemsStore: "yyc3_alert_items",      // useFollowUp.ts (FollowUpItem)
} as const;

/** 清除所有 YYC³ localStorage 数据（含动态前缀键） */
export function clearAllLocalStorage(): void {
  // 清除注册键
  for (const key of Object.values(LOCALSTORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("yyc3") || key.startsWith("d-music") || key.startsWith("network_config") || key.startsWith("offline_snapshot") || key.startsWith("env_config") || key.startsWith("pwa_"))) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}

/** 清除所有 YYC³ 存储数据 (localStorage + IndexedDB) */
export async function clearAllStorage(): Promise<void> {
  clearAllLocalStorage();
  for (const store of ALL_STORES) {
    await idbClear(store);
  }
}
