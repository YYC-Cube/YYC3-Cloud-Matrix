/**
 * @file: useSettingsStore.ts
 * @description: 系统设置统一持久化 Hook · 集中管理所有配置项
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [hook],[settings],[storage]
 * @see: src/app/store/slices/settings-ssot-slice.ts — SSOT 统一设置目标
 *
 * @migration-note: 本 Store 仍被 AIAssistant / SystemSettings / ConfigExportCenter 使用。
 *   新代码应优先使用 useSettingsSSOT (settings-ssot-slice.ts)。
 *   待上述三个组件迁移完成后可废弃本文件。
 *
 * @brief: 系统设置统一持久化管理
 *
 * @details:
 * - 所有 SystemSettings 配置项集中管理
 * - localStorage 持久化 (key: yyc3_system_settings)
 * - 开关类 和文本类 分开管理
 * - 导出/导入/重置功能
 * - BroadcastChannel 多标签页同步
 *
 * @dependencies: React, localStorage, BroadcastChannel
 * @exports: useSettingsStore
 * @notes: 设置变更会自动同步到所有标签页
 */

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_WS_ENDPOINT } from "../lib/api-config";
import { getSharedChannel } from "../lib/broadcast-channel";

// ============================================================
// 类型定义
// ============================================================

export interface SettingsToggles {
  autoScale: boolean;
  healthCheck: boolean;
  alertEmail: boolean;
  alertSlack: boolean;
  darkMode: boolean;
  autoBackup: boolean;
  mfa: boolean;
  auditLog: boolean;
  rateLimiting: boolean;
  cacheEnabled: boolean;
  wsAutoReconnect: boolean;
  wsHeartbeat: boolean;
  aiStreamMode: boolean;
  aiContextMemory: boolean;
  debugMode: boolean;
  performanceLog: boolean;
  autoUpdate: boolean;
  dataCompression: boolean;
  corsEnabled: boolean;
}

export interface SettingsValues {
  systemName: string;
  clusterId: string;
  brandName: string;
  brandSlogan1: string;
  brandSlogan2: string;
  brandSlogan3: string;
  refreshInterval: string;
  language: string;
  timezone: string;
  maxNodes: string;
  loadBalanceStrategy: string;
  healthCheckInterval: string;
  scaleUpThreshold: string;
  scaleDownThreshold: string;
  wsEndpoint: string;
  wsReconnectInterval: string;
  wsMaxReconnect: string;
  wsHeartbeatInterval: string;
  wsThrottleMs: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  aiTemperature: string;
  aiTopP: string;
  aiMaxTokens: string;
  aiTimeout: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbPoolSize: string;
  sessionTimeout: string;
  ipWhitelist: string;
  alertGpuThreshold: string;
  alertTempThreshold: string;
  alertEmailAddr: string;
  webhookUrl: string;
  backupSchedule: string;
  logLevel: string;
  logRetention: string;
  maxConcurrency: string;
  cacheSize: string;
  cacheTTL: string;
}

export interface SettingsState {
  toggles: SettingsToggles;
  values: SettingsValues;
}

// ============================================================
// 默认值
// ============================================================

const DEFAULT_TOGGLES: SettingsToggles = {
  autoScale: true,
  healthCheck: true,
  alertEmail: true,
  alertSlack: false,
  darkMode: true,
  autoBackup: true,
  mfa: true,
  auditLog: true,
  rateLimiting: true,
  cacheEnabled: true,
  wsAutoReconnect: true,
  wsHeartbeat: true,
  aiStreamMode: true,
  aiContextMemory: true,
  debugMode: false,
  performanceLog: true,
  autoUpdate: false,
  dataCompression: true,
  corsEnabled: true,
};

const DEFAULT_VALUES: SettingsValues = {
  systemName: "YYC³ Cloud Intelli-Matrix v3.2",
  clusterId: "CN-EAST-PROD-01",
  brandName: "YanYuCloudCube",
  brandSlogan1: "言启象限 | 语枢未来",
  brandSlogan2: "言启千行代码 | 语枢万物智能",
  brandSlogan3: "万象归元于云枢 | 深栈智启新纪元",
  refreshInterval: "5",
  language: "zh-CN",
  timezone: "Asia/Shanghai",
  maxNodes: "16",
  loadBalanceStrategy: "轮询 (Round Robin)",
  healthCheckInterval: "30",
  scaleUpThreshold: "85",
  scaleDownThreshold: "30",
  wsEndpoint: DEFAULT_WS_ENDPOINT,
  wsReconnectInterval: "5000",
  wsMaxReconnect: "10",
  wsHeartbeatInterval: "30000",
  wsThrottleMs: "100",
  aiApiKey: "",
  aiBaseUrl: "https://api.openai.com/v1",
  aiModel: "",
  aiTemperature: "0.7",
  aiTopP: "0.9",
  aiMaxTokens: "2048",
  aiTimeout: "30000",
  dbHost: "localhost",
  dbPort: "5433",
  dbName: "cpim_matrix",
  dbUser: "yyc_admin",
  dbPassword: "",
  dbPoolSize: "20",
  sessionTimeout: "30",
  ipWhitelist: "192.168.1.0/24\n10.0.0.0/16\n172.16.0.0/12",
  alertGpuThreshold: "90",
  alertTempThreshold: "80",
  alertEmailAddr: "admin@cloudpivot.ai",
  webhookUrl: "",
  backupSchedule: "0 2 * * *",
  logLevel: "info",
  logRetention: "30",
  maxConcurrency: "100",
  cacheSize: "512",
  cacheTTL: "3600",
};

// ============================================================
// Storage
// ============================================================

const STORAGE_KEY = "yyc3_system_settings";
const CHANNEL_NAME = "yyc3_settings_sync";

function loadState(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return {
        toggles: { ...DEFAULT_TOGGLES, ...(saved.toggles || {}) },
        values: { ...DEFAULT_VALUES, ...(saved.values || {}) },
      };
    }
  } catch { /* ignore */ }
  return { toggles: { ...DEFAULT_TOGGLES }, values: { ...DEFAULT_VALUES } };
}

function saveState(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ============================================================
// Hook
// ============================================================

export function useSettingsStore() {
  const [state, setState] = useState<SettingsState>(loadState);

  // 持久化
  useEffect(() => {
    saveState(state);
  }, [state]);

  // BroadcastChannel 多标签页同步
  useEffect(() => {
    try {
      const channel = getSharedChannel(CHANNEL_NAME);
      if (!channel) { return; }
      const handler = (e: MessageEvent) => {
        if (e.data?.type === "settings_update") {
          setState(e.data.state);
        }
      };
      channel.addEventListener("message", handler);
      return () => channel.removeEventListener("message", handler);
    } catch { /* BroadcastChannel not available */ }
  }, []);

  const broadcast = useCallback((newState: SettingsState) => {
    try {
      const channel = getSharedChannel(CHANNEL_NAME);
      channel?.postMessage({ type: "settings_update", state: newState });
    } catch { /* ignore */ }
  }, []);

  // Toggle 操作
  const toggleSetting = useCallback((key: keyof SettingsToggles) => {
    setState((prev) => {
      const next = {
        ...prev,
        toggles: { ...prev.toggles, [key]: !prev.toggles[key] },
      };
      broadcast(next);
      return next;
    });
  }, [broadcast]);

  // Value 更新
  const updateValue = useCallback((key: keyof SettingsValues, val: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        values: { ...prev.values, [key]: val },
      };
      broadcast(next);
      return next;
    });
  }, [broadcast]);

  // 批量更新
  const updateValues = useCallback((updates: Partial<SettingsValues>) => {
    setState((prev) => {
      const next = {
        ...prev,
        values: { ...prev.values, ...updates },
      };
      broadcast(next);
      return next;
    });
  }, [broadcast]);

  // 重置
  const resetSettings = useCallback(() => {
    const defaultState: SettingsState = {
      toggles: { ...DEFAULT_TOGGLES },
      values: { ...DEFAULT_VALUES },
    };
    setState(defaultState);
    saveState(defaultState);
    broadcast(defaultState);
  }, [broadcast]);

  // 导出
  const exportSettings = useCallback(() => {
    return JSON.stringify({
      version: 1,
      exportedAt: Date.now(),
      ...state,
    }, null, 2);
  }, [state]);

  // 导入
  const importSettings = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      const imported: SettingsState = {
        toggles: { ...DEFAULT_TOGGLES, ...(data.toggles || {}) },
        values: { ...DEFAULT_VALUES, ...(data.values || {}) },
      };
      setState(imported);
      saveState(imported);
      broadcast(imported);
      return true;
    } catch {
      return false;
    }
  }, [broadcast]);

  return {
    settings: state.toggles,
    values: state.values,
    toggleSetting,
    updateValue,
    updateValues,
    resetSettings,
    exportSettings,
    importSettings,
  };
}
