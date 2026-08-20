/**
 * @file: api-config.ts
 * @description: 统一后端 API 端点配置 · 集中管理所有接口 URL
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [lib],[api],[config]
 *
 * @brief: 统一后端 API 端点配置
 *
 * @details:
 * - 所有后端接口 URL 集中管理
 * - 支持用户通过设置页面编辑
 * - localStorage 持久化
 * - BroadcastChannel 实时同步到其他标签页
 * - 集成 Zod 配置验证
 *
 * @dependencies: broadcast-channel, config-validator, error-handler
 * @exports: getAPIConfig, setAPIConfig, validateAPIConfig
 * @notes: 接入真实后端时仅需修改此处配置
 */

import { getSharedChannel } from "./broadcast-channel";
import {
  validateAPIConfig,
  validatePartialAPIConfig,
  sanitizeAPIConfig,
  formatValidationErrors,
  type ConfigValidationResult,
  type ConfigValidationError,
} from "./config-validator";
import { captureError } from "./error-handler";

const STORAGE_KEY = "yyc3_api_endpoints";
const CONFIG_CHANNEL_NAME = "yyc3_api_config";

import type { APIEndpoints } from "../types";
export type { APIEndpoints };
export type { ConfigValidationResult, ConfigValidationError };

const DEFAULT_WS_ENDPOINT = "ws://localhost:3113/ws";
export { DEFAULT_WS_ENDPOINT };

const DEFAULTS: APIEndpoints = {
  fsBase: "/api/fs",
  dbBase: "/api/db",
  wsEndpoint: DEFAULT_WS_ENDPOINT,
  aiBase: "https://api.openai.com/v1",
  clusterBase: "/api/cluster",
  enableBackend: false,
  timeout: 15000,
  maxRetries: 2,
};

const REQUIRED_STRING_KEYS: (keyof APIEndpoints)[] = [
  "fsBase",
  "dbBase",
  "wsEndpoint",
  "aiBase",
  "clusterBase",
];

function cleanSavedConfig(saved: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === "string" && value.trim() === "") {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}

function loadConfig(): APIEndpoints {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const cleaned = cleanSavedConfig(saved);
      const merged = { ...DEFAULTS, ...cleaned };

      for (const key of REQUIRED_STRING_KEYS) {
        if (merged[key] === undefined || merged[key] === null) {
          (merged as Record<string, unknown>)[key] = DEFAULTS[key];
        }
      }
      if (merged.timeout === undefined || merged.timeout === null) {
        merged.timeout = DEFAULTS.timeout;
      }
      if (merged.maxRetries === undefined || merged.maxRetries === null) {
        merged.maxRetries = DEFAULTS.maxRetries;
      }
      if (merged.enableBackend === undefined || merged.enableBackend === null) {
        merged.enableBackend = DEFAULTS.enableBackend;
      }

      const validation = validateAPIConfig(merged);
      if (!validation.success) {
        console.warn(
          "[api-config] 存储的配置验证失败，使用默认配置:",
          formatValidationErrors(validation.errors)
        );
        localStorage.removeItem(STORAGE_KEY);
        return { ...DEFAULTS };
      }
      return merged;
    }
  } catch (err) {
    console.warn("[api-config] 加载配置失败:", err);
    localStorage.removeItem(STORAGE_KEY);
  }
  return { ...DEFAULTS };
}

let _config: APIEndpoints = loadConfig();

export function getAPIConfig(): APIEndpoints {
  return _config;
}

export interface SetAPIConfigOptions {
  skipValidation?: boolean;
  silent?: boolean;
}

export interface SetAPIConfigResult {
  config: APIEndpoints;
  validation: ConfigValidationResult;
}

export function setAPIConfig(
  updates: Partial<APIEndpoints>,
  options: SetAPIConfigOptions = {}
): APIEndpoints {
  const { skipValidation = false, silent = false } = options;

  const sanitized = sanitizeAPIConfig(updates as Record<string, unknown>);

  if (!skipValidation && Object.keys(sanitized).length > 0) {
    const mergedCandidate = { ..._config, ...sanitized };
    const validation = validateAPIConfig(mergedCandidate);

    if (!validation.success) {
      if (!silent) {
        console.warn(
          "[api-config] 配置验证失败:",
          formatValidationErrors(validation.errors)
        );
        captureError(new Error(formatValidationErrors(validation.errors)), {
          category: "VALIDATION",
          severity: "warning",
          source: "api-config.setAPIConfig",
        });
      }
      return _config;
    }
  }

  _config = { ..._config, ...sanitized };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
  } catch {
    /* ignore */
  }

  try {
    const ch = getSharedChannel(CONFIG_CHANNEL_NAME);
    ch?.postMessage({ type: "config_update", config: _config });
  } catch {
    /* ignore */
  }

  for (const fn of _listeners) {
    try {
      fn(_config);
    } catch {
      /* ignore */
    }
  }

  return _config;
}

export function setAPIConfigWithValidation(
  updates: Partial<APIEndpoints>
): SetAPIConfigResult {
  const sanitized = sanitizeAPIConfig(updates as Record<string, unknown>);
  const mergedCandidate = { ..._config, ...sanitized };
  const validation = validateAPIConfig(mergedCandidate);

  if (validation.success && validation.data) {
    _config = validation.data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
    } catch {
      /* ignore */
    }

    try {
      const ch = getSharedChannel(CONFIG_CHANNEL_NAME);
      ch?.postMessage({ type: "config_update", config: _config });
    } catch {
      /* ignore */
    }

    for (const fn of _listeners) {
      try {
        fn(_config);
      } catch {
        /* ignore */
      }
    }
  }

  return {
    config: _config,
    validation,
  };
}

export function validateConfigUpdates(
  updates: Partial<APIEndpoints>
): ConfigValidationResult {
  const sanitized = sanitizeAPIConfig(updates as Record<string, unknown>);
  const mergedCandidate = { ..._config, ...sanitized };
  return validateAPIConfig(mergedCandidate);
}

export function resetAPIConfig(): APIEndpoints {
  _config = { ...DEFAULTS };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  for (const fn of _listeners) {
    try {
      fn(_config);
    } catch {
      /* ignore */
    }
  }
  return _config;
}

type ConfigListener = (config: APIEndpoints) => void;
const _listeners: ConfigListener[] = [];

export function onAPIConfigChange(fn: ConfigListener): () => void {
  _listeners.push(fn);

  const ch = getSharedChannel(CONFIG_CHANNEL_NAME);
  if (ch) {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "config_update") {
        const validation = validateAPIConfig(event.data.config);
        if (validation.success && validation.data) {
          _config = validation.data;
          fn(_config);
        } else {
          console.warn(
            "[api-config] 收到无效配置广播，已忽略:",
            formatValidationErrors(validation.errors)
          );
        }
      }
    };
    ch.addEventListener("message", handler);
    return () => {
      const idx = _listeners.indexOf(fn);
      if (idx >= 0) {
        _listeners.splice(idx, 1);
      }
      ch.removeEventListener("message", handler);
    };
  }

  return () => {
    const idx = _listeners.indexOf(fn);
    if (idx >= 0) {
      _listeners.splice(idx, 1);
    }
  };
}

export const ENDPOINT_META: Array<{
  key: keyof APIEndpoints;
  label: string;
  labelCn: string;
  description: string;
  type: "url" | "boolean" | "number";
  placeholder: string;
  group: string;
}> = [
  {
    key: "enableBackend",
    label: "Enable Backend API",
    labelCn: "启用后端 API",
    description: "关闭时使用前端 Mock 数据",
    type: "boolean",
    placeholder: "",
    group: "通用",
  },
  {
    key: "timeout",
    label: "Request Timeout",
    labelCn: "请求超时 (ms)",
    description: "API 请求超时时间 (1000-300000ms)",
    type: "number",
    placeholder: "15000",
    group: "通用",
  },
  {
    key: "maxRetries",
    label: "Max Retries",
    labelCn: "最大重试次数",
    description: "请求失败后指数退避重试次数 (0-10次)",
    type: "number",
    placeholder: "2",
    group: "通用",
  },
  {
    key: "fsBase",
    label: "File System API",
    labelCn: "文件系统 API",
    description: "POST /api/fs/{list|read|write|delete|rename|upload|search}",
    type: "url",
    placeholder: "/api/fs",
    group: "文件系统",
  },
  {
    key: "dbBase",
    label: "Database API",
    labelCn: "数据库管理 API",
    description: "POST /api/db/{detect|connect|query|tables|backup|restore|test}",
    type: "url",
    placeholder: "/api/db",
    group: "数据库",
  },
  {
    key: "wsEndpoint",
    label: "WebSocket",
    labelCn: "WebSocket 地址",
    description: "实时数据推送 (ws:// 或 wss://)",
    type: "url",
    placeholder: "ws://localhost:3113/ws",
    group: "实时通信",
  },
  {
    key: "aiBase",
    label: "AI Inference API",
    labelCn: "AI 推理 API",
    description: "OpenAI 兼容接口 (http:// 或 https://)",
    type: "url",
    placeholder: "https://api.openai.com/v1",
    group: "AI 推理",
  },
  {
    key: "clusterBase",
    label: "Cluster API",
    labelCn: "集群管理 API",
    description: "节点管理、模型部署",
    type: "url",
    placeholder: "/api/cluster",
    group: "集群",
  },
];

export { validateAPIConfig, validatePartialAPIConfig, formatValidationErrors };
