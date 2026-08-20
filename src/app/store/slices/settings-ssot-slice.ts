/**
 * @file: settings-ssot-slice.ts
 * @description: Settings SSOT (Single Source of Truth) — 统一4套设置存储为单一数据源
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [store],[slice],[settings],[ssot]
 *
 * @brief: 合并 useSettingsStore + global-store config + api-config + variable-center 为统一 Slice
 *
 * @details:
 * - 统一管理: 系统设置 / API端点 / 运行时配置 / 变量中心
 * - 向后兼容: 自动从旧 localStorage 键迁移数据
 * - 单一持久化: yyc3-settings-ssot
 * - BroadcastChannel 多标签页同步
 * - Zod 校验集成
 *
 * @dependencies: zustand, immer, api-config, config-validator
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  VARIABLE_DEFINITIONS,
  loadVariableValues,
  saveVariableValues,
  validateVariable,
  type VariableValue,
} from '../../config/variable-center';
import {
  DEFAULT_WS_ENDPOINT,
  getAPIConfig,
  onAPIConfigChange,
  resetAPIConfig as resetAPIEndpoints, setAPIConfig,
  type APIEndpoints
} from '../../lib/api-config';
import { onEnvConfigChange } from '../../lib/env-config';
import { captureError } from '../../lib/error-handler';

let _apiConfigUnsubscribe: (() => void) | null = null;
let _envConfigUnsubscribe: (() => void) | null = null;

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

export interface RuntimeConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  compactMode: boolean;
}

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
  systemName: "YYC³ Cloud Intelli-Matrix v3.4",
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

const DEFAULT_RUNTIME: RuntimeConfig = {
  autoRefresh: true,
  refreshInterval: 5000,
  enableNotifications: true,
  enableSounds: false,
  compactMode: false,
};

interface SettingsSSOTState {
  _version: number;
  _migrated: boolean;
  toggles: SettingsToggles;
  values: SettingsValues;
  runtime: RuntimeConfig;
  apiEndpoints: APIEndpoints;
  variableValues: Record<string, VariableValue>;
}

interface SettingsSSOTActions {
  toggleSetting: (key: keyof SettingsToggles) => void;
  setToggle: (key: keyof SettingsToggles, value: boolean) => void;
  updateValue: (key: keyof SettingsValues, val: string) => void;
  updateValues: (updates: Partial<SettingsValues>) => void;
  updateRuntime: (updates: Partial<RuntimeConfig>) => void;
  updateAPIEndpoint: (updates: Partial<APIEndpoints>) => void;
  setVariableValue: (key: string, value: unknown, source?: VariableValue["source"]) => void;
  resetVariableValue: (key: string) => void;
  resetAllVariables: () => void;
  resetSettings: () => void;
  resetAPIEndpoints: () => void;
  exportAll: () => string;
  importAll: (json: string) => boolean;
  getVariableValue: (key: string) => VariableValue;
}

function migrateFromLegacyStores(): Partial<SettingsSSOTState> {
  const migrated: Partial<SettingsSSOTState> = {
    _version: 1,
    _migrated: false,
    toggles: { ...DEFAULT_TOGGLES },
    values: { ...DEFAULT_VALUES },
    runtime: { ...DEFAULT_RUNTIME },
    variableValues: loadVariableValues(),
  };

  try {
    const sysRaw = localStorage.getItem("yyc3_system_settings");
    if (sysRaw) {
      const saved = JSON.parse(sysRaw);
      if (saved.toggles) { migrated.toggles = { ...DEFAULT_TOGGLES, ...saved.toggles }; }
      if (saved.values) { migrated.values = { ...DEFAULT_VALUES, ...saved.values }; }
    }
  } catch { /* ignore */ }

  try {
    const globalRaw = localStorage.getItem("yyc3-global-store");
    if (globalRaw) {
      const saved = JSON.parse(globalRaw);
      const state = saved?.state;
      if (state) {
        migrated.runtime = {
          autoRefresh: state.autoRefresh ?? DEFAULT_RUNTIME.autoRefresh,
          refreshInterval: state.refreshInterval ?? DEFAULT_RUNTIME.refreshInterval,
          enableNotifications: state.enableNotifications ?? DEFAULT_RUNTIME.enableNotifications,
          enableSounds: state.enableSounds ?? DEFAULT_RUNTIME.enableSounds,
          compactMode: state.compactMode ?? DEFAULT_RUNTIME.compactMode,
        };
      }
    }
  } catch { /* ignore */ }

  migrated.apiEndpoints = getAPIConfig();
  migrated._migrated = true;

  return migrated;
}

export type SettingsSSOTSlice = SettingsSSOTState & SettingsSSOTActions;

export const useSettingsSSOT = create<SettingsSSOTSlice>()(
  devtools(
    persist(
      immer((set, get) => ({
        _version: 1,
        _migrated: false,
        toggles: { ...DEFAULT_TOGGLES },
        values: { ...DEFAULT_VALUES },
        runtime: { ...DEFAULT_RUNTIME },
        apiEndpoints: getAPIConfig(),
        variableValues: loadVariableValues(),

        toggleSetting: (key) => {
          set((state) => {
            state.toggles[key] = !state.toggles[key];
          });
        },

        setToggle: (key, value) => {
          set((state) => {
            state.toggles[key] = value;
          });
        },

        updateValue: (key, val) => {
          set((state) => {
            state.values[key] = val;
          });
          if (key === 'wsEndpoint') {
            setAPIConfig({ wsEndpoint: val });
          }
          if (key === 'aiBaseUrl') {
            setAPIConfig({ aiBase: val });
          }
        },

        updateValues: (updates) => {
          set((state) => {
            Object.assign(state.values, updates);
          });
        },

        updateRuntime: (updates) => {
          set((state) => {
            Object.assign(state.runtime, updates);
          });
        },

        updateAPIEndpoint: (updates) => {
          const newConfig = setAPIConfig(updates);
          set((state) => {
            state.apiEndpoints = newConfig;
          });
        },

        setVariableValue: (key, value, source = 'user') => {
          const def = VARIABLE_DEFINITIONS.find((v) => v.key === key);
          if (def) {
            const result = validateVariable(key, value);
            if (!result.valid) {
              captureError(new Error(`Variable validation failed: ${result.errors.join(', ')}`), {
                category: 'VALIDATION',
                severity: 'warning',
                source: 'settings-ssot.setVariableValue',
              });
              return;
            }
          }
          set((state) => {
            state.variableValues[key] = {
              key,
              value,
              source,
              updatedAt: Date.now(),
            };
          });
          saveVariableValues(get().variableValues);
        },

        resetVariableValue: (key) => {
          set((state) => {
            delete state.variableValues[key];
          });
          saveVariableValues(get().variableValues);
        },

        resetAllVariables: () => {
          set((state) => {
            state.variableValues = {};
          });
          saveVariableValues({});
        },

        resetSettings: () => {
          set((state) => {
            state.toggles = { ...DEFAULT_TOGGLES };
            state.values = { ...DEFAULT_VALUES };
            state.runtime = { ...DEFAULT_RUNTIME };
          });
        },

        resetAPIEndpoints: () => {
          const defaults = resetAPIEndpoints();
          set((state) => {
            state.apiEndpoints = defaults;
          });
        },

        exportAll: () => {
          const s = get();
          return JSON.stringify({
            _exportedAt: new Date().toISOString(),
            _source: 'settings-ssot',
            toggles: s.toggles,
            values: s.values,
            runtime: s.runtime,
            apiEndpoints: s.apiEndpoints,
            variableValues: s.variableValues,
          }, null, 2);
        },

        importAll: (json) => {
          try {
            const data = JSON.parse(json);
            set((state) => {
              if (data.toggles) { state.toggles = { ...DEFAULT_TOGGLES, ...data.toggles }; }
              if (data.values) { state.values = { ...DEFAULT_VALUES, ...data.values }; }
              if (data.runtime) { state.runtime = { ...DEFAULT_RUNTIME, ...data.runtime }; }
              if (data.apiEndpoints) {
                state.apiEndpoints = setAPIConfig(data.apiEndpoints);
              }
              if (data.variableValues) { state.variableValues = data.variableValues; }
            });
            saveVariableValues(get().variableValues);
            return true;
          } catch {
            return false;
          }
        },

        getVariableValue: (key) => {
          const stored = get().variableValues[key];
          if (stored) { return stored; }
          const def = VARIABLE_DEFINITIONS.find((v) => v.key === key);
          return {
            key,
            value: def?.defaultValue,
            source: 'default' as const,
            updatedAt: Date.now(),
          };
        },
      })),
      {
        name: 'yyc3-settings-ssot',
        version: 1,
        migrate: (persisted, version) => {
          if (version < 1) {
            const legacy = migrateFromLegacyStores();
            return Object.assign({}, persisted as Record<string, unknown>, legacy) as SettingsSSOTState;
          }
          return persisted as SettingsSSOTState;
        },
        onRehydrateStorage: () => {
          return (state) => {
            if (state && !state._migrated) {
              const legacy = migrateFromLegacyStores();
              Object.assign(state, legacy);
              state._migrated = true;
            }

            if (_apiConfigUnsubscribe) { _apiConfigUnsubscribe(); }
            _apiConfigUnsubscribe = onAPIConfigChange((config) => {
              if (state) {
                state.apiEndpoints = config;
              }
            });

            if (_envConfigUnsubscribe) { _envConfigUnsubscribe(); }
            _envConfigUnsubscribe = onEnvConfigChange((config) => {
              if (state) {
                state.values.wsEndpoint = config.WS_ENDPOINT;
                state.values.aiBaseUrl = config.DEFAULT_AI_BASE_URL;
                state.values.aiModel = config.DEFAULT_AI_MODEL;
                state.values.aiTemperature = String(config.DEFAULT_AI_TEMPERATURE);
                state.values.aiMaxTokens = String(config.DEFAULT_AI_MAX_TOKENS);
                state.values.aiTimeout = String(config.DEFAULT_AI_TIMEOUT);
                state.values.sessionTimeout = String(config.SESSION_TIMEOUT_MIN);
                state.values.clusterId = config.CLUSTER_ID;
                state.values.systemName = config.SYSTEM_NAME;
              }
            });
          };
        },
      }
    ),
    { name: 'YYC3-Settings-SSOT' }
  )
);
