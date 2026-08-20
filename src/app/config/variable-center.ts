/**
 * @file: variable-center.ts
 * @description: variable-center.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { DEFAULT_WS_ENDPOINT } from "../lib/api-config";

// ═══════════════════════════════════════════════════════════════
//  变量类型定义
// ═══════════════════════════════════════════════════════════════

export type VariableCategory = "device" | "user" | "secret" | "model" | "system" | "env";

export interface VariableDefinition {
  key: string;
  label: string;
  labelCn: string;
  description: string;
  type: "string" | "number" | "boolean" | "url" | "json" | "password" | "select" | "multiselect";
  category: VariableCategory;
  group: string;
  defaultValue: unknown;
  required: boolean;
  sensitive: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  placeholder?: string;
  editable: boolean;
  version: string;
}

export interface VariableValue {
  key: string;
  value: unknown;
  source: "default" | "env" | "localStorage" | "database" | "user";
  updatedAt: number;
  updatedBy?: string;
}

export interface VariableGroup {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  category: VariableCategory;
  icon: string;
  order: number;
}

// ═══════════════════════════════════════════════════════════════
//  变量定义注册表
// ═══════════════════════════════════════════════════════════════

export const VARIABLE_GROUPS: VariableGroup[] = [
  // ── 设备变量 ──
  { id: "node-config", name: "Node Config", nameCn: "节点配置", description: "节点基础配置", category: "device", icon: "Server", order: 1 },
  { id: "gpu-config", name: "GPU Config", nameCn: "GPU配置", description: "GPU相关配置", category: "device", icon: "Cpu", order: 2 },
  { id: "network-config", name: "Network Config", nameCn: "网络配置", description: "网络端点配置", category: "device", icon: "Network", order: 3 },

  // ── 人员变量 ──
  { id: "user-settings", name: "User Settings", nameCn: "用户设置", description: "用户个人设置", category: "user", icon: "User", order: 10 },
  { id: "auth-settings", name: "Auth Settings", nameCn: "认证设置", description: "认证和权限设置", category: "user", icon: "Shield", order: 11 },

  // ── 密钥变量 ──
  { id: "api-keys", name: "API Keys", nameCn: "API密钥", description: "各提供商API密钥", category: "secret", icon: "Key", order: 20 },
  { id: "auth-tokens", name: "Auth Tokens", nameCn: "认证令牌", description: "认证令牌管理", category: "secret", icon: "Lock", order: 21 },

  // ── 模型配置 ──
  { id: "model-providers", name: "Model Providers", nameCn: "模型提供商", description: "AI模型提供商配置", category: "model", icon: "Box", order: 30 },
  { id: "model-params", name: "Model Parameters", nameCn: "模型参数", description: "模型推理参数", category: "model", icon: "Sliders", order: 31 },

  // ── 系统配置 ──
  { id: "system-general", name: "System General", nameCn: "系统通用", description: "系统通用设置", category: "system", icon: "Settings", order: 40 },
  { id: "system-ai", name: "System AI", nameCn: "AI设置", description: "AI相关系统设置", category: "system", icon: "Sparkles", order: 41 },
  { id: "system-database", name: "System Database", nameCn: "数据库设置", description: "数据库配置", category: "system", icon: "Database", order: 42 },

  // ── 环境变量 ──
  { id: "env-endpoints", name: "Env Endpoints", nameCn: "端点配置", description: "API端点配置", category: "env", icon: "Globe", order: 50 },
  { id: "env-storage", name: "Env Storage", nameCn: "存储配置", description: "存储键和ID配置", category: "env", icon: "HardDrive", order: 51 },
];

export const VARIABLE_DEFINITIONS: VariableDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  //  设备变量
  // ═══════════════════════════════════════════════════════════════
  {
    key: "node.defaultHostname",
    label: "Default Hostname",
    labelCn: "默认主机名",
    description: "新节点的默认主机名前缀",
    type: "string",
    category: "device",
    group: "node-config",
    defaultValue: "yyc3-node",
    required: false,
    sensitive: false,
    placeholder: "yyc3-node",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "node.defaultPort",
    label: "Default Port",
    labelCn: "默认端口",
    description: "节点通信默认端口",
    type: "number",
    category: "device",
    group: "node-config",
    defaultValue: 3218,
    required: false,
    sensitive: false,
    validation: { min: 1024, max: 65535 },
    placeholder: "3218",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "gpu.warningThreshold",
    label: "GPU Warning Threshold",
    labelCn: "GPU警告阈值",
    description: "GPU使用率警告阈值 (%)",
    type: "number",
    category: "device",
    group: "gpu-config",
    defaultValue: 80,
    required: false,
    sensitive: false,
    validation: { min: 0, max: 100 },
    placeholder: "80",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "gpu.criticalThreshold",
    label: "GPU Critical Threshold",
    labelCn: "GPU严重阈值",
    description: "GPU使用率严重阈值 (%)",
    type: "number",
    category: "device",
    group: "gpu-config",
    defaultValue: 95,
    required: false,
    sensitive: false,
    validation: { min: 0, max: 100 },
    placeholder: "95",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "gpu.tempWarning",
    label: "Temperature Warning",
    labelCn: "温度警告",
    description: "GPU温度警告阈值 (°C)",
    type: "number",
    category: "device",
    group: "gpu-config",
    defaultValue: 85,
    required: false,
    sensitive: false,
    validation: { min: 0, max: 120 },
    placeholder: "85",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "network.apiBase",
    label: "API Base URL",
    labelCn: "API基础地址",
    description: "后端API基础地址",
    type: "url",
    category: "device",
    group: "network-config",
    defaultValue: "/api",
    required: false,
    sensitive: false,
    placeholder: "/api",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "network.wsEndpoint",
    label: "WebSocket Endpoint",
    labelCn: "WebSocket端点",
    description: "WebSocket连接地址",
    type: "url",
    category: "device",
    group: "network-config",
    defaultValue: DEFAULT_WS_ENDPOINT,
    required: false,
    sensitive: false,
    placeholder: DEFAULT_WS_ENDPOINT,
    editable: true,
    version: "1.0.0",
  },

  // ═══════════════════════════════════════════════════════════════
  //  人员变量
  // ═══════════════════════════════════════════════════════════════
  {
    key: "user.defaultRole",
    label: "Default Role",
    labelCn: "默认角色",
    description: "新用户的默认角色",
    type: "select",
    category: "user",
    group: "user-settings",
    defaultValue: "developer",
    required: false,
    sensitive: false,
    options: [
      { value: "admin", label: "管理员" },
      { value: "developer", label: "开发者" },
      { value: "guest", label: "访客" },
    ],
    editable: true,
    version: "1.0.0",
  },
  {
    key: "user.sessionTimeout",
    label: "Session Timeout",
    labelCn: "会话超时",
    description: "会话超时时间 (分钟)",
    type: "number",
    category: "user",
    group: "auth-settings",
    defaultValue: 60,
    required: false,
    sensitive: false,
    validation: { min: 5, max: 1440 },
    placeholder: "60",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "user.maxLoginAttempts",
    label: "Max Login Attempts",
    labelCn: "最大登录尝试",
    description: "最大登录尝试次数",
    type: "number",
    category: "user",
    group: "auth-settings",
    defaultValue: 5,
    required: false,
    sensitive: false,
    validation: { min: 1, max: 10 },
    placeholder: "5",
    editable: true,
    version: "1.0.0",
  },

  // ═══════════════════════════════════════════════════════════════
  //  密钥变量
  // ═══════════════════════════════════════════════════════════════
  {
    key: "secret.openaiKey",
    label: "OpenAI API Key",
    labelCn: "OpenAI密钥",
    description: "OpenAI API密钥",
    type: "password",
    category: "secret",
    group: "api-keys",
    defaultValue: "",
    required: false,
    sensitive: true,
    placeholder: "sk-...",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "secret.zhipuKey",
    label: "Zhipu AI API Key",
    labelCn: "智谱AI密钥",
    description: "智谱AI API密钥",
    type: "password",
    category: "secret",
    group: "api-keys",
    defaultValue: "",
    required: false,
    sensitive: true,
    placeholder: "...",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "secret.deepseekKey",
    label: "DeepSeek API Key",
    labelCn: "DeepSeek密钥",
    description: "DeepSeek API密钥",
    type: "password",
    category: "secret",
    group: "api-keys",
    defaultValue: "",
    required: false,
    sensitive: true,
    placeholder: "sk-...",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "secret.kimiKey",
    label: "Kimi API Key",
    labelCn: "Kimi密钥",
    description: "Moonshot Kimi API密钥",
    type: "password",
    category: "secret",
    group: "api-keys",
    defaultValue: "",
    required: false,
    sensitive: true,
    placeholder: "sk-...",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "secret.anthropicKey",
    label: "Anthropic API Key",
    labelCn: "Anthropic密钥",
    description: "Anthropic Claude API密钥",
    type: "password",
    category: "secret",
    group: "api-keys",
    defaultValue: "",
    required: false,
    sensitive: true,
    placeholder: "sk-ant-...",
    editable: true,
    version: "1.0.0",
  },

  // ═══════════════════════════════════════════════════════════════
  //  模型配置
  // ═══════════════════════════════════════════════════════════════
  {
    key: "model.defaultProvider",
    label: "Default Provider",
    labelCn: "默认提供商",
    description: "默认AI模型提供商",
    type: "select",
    category: "model",
    group: "model-providers",
    defaultValue: "deepseek",
    required: false,
    sensitive: false,
    options: [
      { value: "zhipu", label: "智谱AI" },
      { value: "deepseek", label: "DeepSeek" },
      { value: "ollama", label: "Ollama (本地)" },
    ],
    editable: true,
    version: "1.0.0",
  },
  {
    key: "model.defaultModel",
    label: "Default Model",
    labelCn: "默认模型",
    description: "默认使用的AI模型",
    type: "string",
    category: "model",
    group: "model-providers",
    defaultValue: "gpt-4o-mini",
    required: false,
    sensitive: false,
    placeholder: "gpt-4o-mini",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "model.temperature",
    label: "Temperature",
    labelCn: "温度",
    description: "模型生成温度 (0-2)",
    type: "number",
    category: "model",
    group: "model-params",
    defaultValue: 0.7,
    required: false,
    sensitive: false,
    validation: { min: 0, max: 2 },
    placeholder: "0.7",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "model.maxTokens",
    label: "Max Tokens",
    labelCn: "最大令牌",
    description: "最大生成令牌数",
    type: "number",
    category: "model",
    group: "model-params",
    defaultValue: 2048,
    required: false,
    sensitive: false,
    validation: { min: 1, max: 128000 },
    placeholder: "2048",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "model.topP",
    label: "Top P",
    labelCn: "Top P",
    description: "核采样参数 (0-1)",
    type: "number",
    category: "model",
    group: "model-params",
    defaultValue: 0.9,
    required: false,
    sensitive: false,
    validation: { min: 0, max: 1 },
    placeholder: "0.9",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "model.timeout",
    label: "Request Timeout",
    labelCn: "请求超时",
    description: "API请求超时时间 (毫秒)",
    type: "number",
    category: "model",
    group: "model-params",
    defaultValue: 30000,
    required: false,
    sensitive: false,
    validation: { min: 1000, max: 300000 },
    placeholder: "30000",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "model.ollamaBaseUrl",
    label: "Ollama Base URL",
    labelCn: "Ollama地址",
    description: "Ollama本地服务地址",
    type: "url",
    category: "model",
    group: "model-providers",
    defaultValue: "http://localhost:11434",
    required: false,
    sensitive: false,
    placeholder: "http://localhost:11434",
    editable: true,
    version: "1.0.0",
  },

  // ═══════════════════════════════════════════════════════════════
  //  系统配置
  // ═══════════════════════════════════════════════════════════════
  {
    key: "system.name",
    label: "System Name",
    labelCn: "系统名称",
    description: "系统显示名称",
    type: "string",
    category: "system",
    group: "system-general",
    defaultValue: "YYC³ Cloud Intelli-Matrix",
    required: false,
    sensitive: false,
    placeholder: "YYC³ Cloud Intelli-Matrix",
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.language",
    label: "System Language",
    labelCn: "系统语言",
    description: "界面显示语言",
    type: "select",
    category: "system",
    group: "system-general",
    defaultValue: "zh-CN",
    required: false,
    sensitive: false,
    options: [
      { value: "zh-CN", label: "简体中文" },
      { value: "en-US", label: "English" },
    ],
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.theme",
    label: "System Theme",
    labelCn: "系统主题",
    description: "界面主题",
    type: "select",
    category: "system",
    group: "system-general",
    defaultValue: "dark",
    required: false,
    sensitive: false,
    options: [
      { value: "dark", label: "深色" },
      { value: "light", label: "浅色" },
      { value: "cyberpunk", label: "赛博朋克" },
    ],
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.timezone",
    label: "System Timezone",
    labelCn: "系统时区",
    description: "系统时区设置",
    type: "select",
    category: "system",
    group: "system-general",
    defaultValue: "Asia/Shanghai",
    required: false,
    sensitive: false,
    options: [
      { value: "Asia/Shanghai", label: "中国标准时间 (UTC+8)" },
      { value: "UTC", label: "协调世界时 (UTC)" },
      { value: "America/New_York", label: "美国东部时间" },
      { value: "Europe/London", label: "伦敦时间" },
    ],
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.dateFormat",
    label: "Date Format",
    labelCn: "日期格式",
    description: "日期显示格式",
    type: "select",
    category: "system",
    group: "system-general",
    defaultValue: "YYYY-MM-DD",
    required: false,
    sensitive: false,
    options: [
      { value: "YYYY-MM-DD", label: "2024-01-15" },
      { value: "DD/MM/YYYY", label: "15/01/2024" },
      { value: "MM/DD/YYYY", label: "01/15/2024" },
    ],
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.animation",
    label: "Animation Enabled",
    labelCn: "动画效果",
    description: "是否启用界面动画",
    type: "boolean",
    category: "system",
    group: "system-general",
    defaultValue: true,
    required: false,
    sensitive: false,
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.sound",
    label: "Sound Enabled",
    labelCn: "声音效果",
    description: "是否启用声音效果",
    type: "boolean",
    category: "system",
    group: "system-general",
    defaultValue: true,
    required: false,
    sensitive: false,
    editable: true,
    version: "1.0.0",
  },
  {
    key: "system.notification",
    label: "Notification Enabled",
    labelCn: "通知提醒",
    description: "是否启用系统通知",
    type: "boolean",
    category: "system",
    group: "system-general",
    defaultValue: true,
    required: false,
    sensitive: false,
    editable: true,
    version: "1.0.0",
  },

  // ═══════════════════════════════════════════════════════════════
  //  环境变量
  // ═══════════════════════════════════════════════════════════════
  {
    key: "env.storagePrefix",
    label: "Storage Prefix",
    labelCn: "存储前缀",
    description: "localStorage 键前缀",
    type: "string",
    category: "env",
    group: "env-storage",
    defaultValue: "yyc3_",
    required: true,
    sensitive: false,
    placeholder: "yyc3_",
    editable: false,
    version: "1.0.0",
  },
  {
    key: "env.idbName",
    label: "IndexedDB Name",
    labelCn: "IndexedDB名称",
    description: "IndexedDB 数据库名称",
    type: "string",
    category: "env",
    group: "env-storage",
    defaultValue: "yyc3_matrix",
    required: true,
    sensitive: false,
    placeholder: "yyc3_matrix",
    editable: false,
    version: "1.0.0",
  },
  {
    key: "env.idbVersion",
    label: "IndexedDB Version",
    labelCn: "IndexedDB版本",
    description: "IndexedDB 数据库版本",
    type: "number",
    category: "env",
    group: "env-storage",
    defaultValue: 1,
    required: true,
    sensitive: false,
    validation: { min: 1 },
    placeholder: "1",
    editable: false,
    version: "1.0.0",
  },
  {
    key: "env.clusterId",
    label: "Cluster ID",
    labelCn: "集群ID",
    description: "集群唯一标识",
    type: "string",
    category: "env",
    group: "env-storage",
    defaultValue: "yyc3-cluster-001",
    required: false,
    sensitive: false,
    placeholder: "yyc3-cluster-001",
    editable: true,
    version: "1.0.0",
  },
];

// ═══════════════════════════════════════════════════════════════
//  变量管理工具函数
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "yyc3-variable-values";

export function getVariableDefinition(key: string): VariableDefinition | undefined {
  return VARIABLE_DEFINITIONS.find((v) => v.key === key);
}

export function getVariablesByCategory(category: VariableCategory): VariableDefinition[] {
  return VARIABLE_DEFINITIONS.filter((v) => v.category === category);
}

export function getVariablesByGroup(groupId: string): VariableDefinition[] {
  return VARIABLE_DEFINITIONS.filter((v) => v.group === groupId);
}

export function getGroup(groupId: string): VariableGroup | undefined {
  return VARIABLE_GROUPS.find((g) => g.id === groupId);
}

export function getGroupsByCategory(category: VariableCategory): VariableGroup[] {
  return VARIABLE_GROUPS.filter((g) => g.category === category).sort((a, b) => a.order - b.order);
}

export function getAllCategories(): VariableCategory[] {
  return ["device", "user", "secret", "model", "system", "env"];
}

// ═══════════════════════════════════════════════════════════════
//  变量值管理
// ═══════════════════════════════════════════════════════════════

export function loadVariableValues(): Record<string, VariableValue> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveVariableValues(values: Record<string, VariableValue>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // ignore
  }
}

export function getVariableValue(key: string): VariableValue {
  const values = loadVariableValues();
  const definition = getVariableDefinition(key);

  if (values[key]) {
    return values[key];
  }

  return {
    key,
    value: definition?.defaultValue,
    source: "default",
    updatedAt: Date.now(),
  };
}

export function setVariableValue(key: string, value: unknown, source: VariableValue["source"] = "user"): void {
  const values = loadVariableValues();
  values[key] = {
    key,
    value,
    source,
    updatedAt: Date.now(),
  };
  saveVariableValues(values);
}

export function resetVariableValue(key: string): void {
  const values = loadVariableValues();
  delete values[key];
  saveVariableValues(values);
}

export function resetAllVariableValues(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMergedVariableValue(key: string): unknown {
  const definition = getVariableDefinition(key);
  const stored = getVariableValue(key);

  if (stored.source !== "default") {
    return stored.value;
  }

  return definition?.defaultValue;
}

// ═══════════════════════════════════════════════════════════════
//  变量验证
// ═══════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateVariable(key: string, value: unknown): ValidationResult {
  const definition = getVariableDefinition(key);
  if (!definition) {
    return { valid: false, errors: [`Unknown variable: ${key}`] };
  }

  const errors: string[] = [];

  if (definition.required && (value === undefined || value === null || value === "")) {
    errors.push(`${definition.labelCn} 是必填项`);
  }

  if (definition.validation) {
    const { min, max, pattern, message } = definition.validation;

    if (typeof value === "number") {
      if (min !== undefined && value < min) {
        errors.push(message || `${definition.labelCn} 不能小于 ${min}`);
      }
      if (max !== undefined && value > max) {
        errors.push(message || `${definition.labelCn} 不能大于 ${max}`);
      }
    }

    if (typeof value === "string" && pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        errors.push(message || `${definition.labelCn} 格式不正确`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════
//  导入导出
// ═══════════════════════════════════════════════════════════════

export interface VariableExport {
  version: string;
  exportedAt: string;
  variables: Record<string, unknown>;
  sensitive: boolean;
}

export function exportVariables(includeSensitive: boolean = false): VariableExport {
  const values = loadVariableValues();
  const variables: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(values)) {
    const definition = getVariableDefinition(key);
    if (!definition) { continue; }

    if (definition.sensitive && !includeSensitive) {
      continue;
    }

    variables[key] = val.value;
  }

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    variables,
    sensitive: includeSensitive,
  };
}

export function importVariables(data: VariableExport, overwrite: boolean = false): { imported: number; skipped: number } {
  const currentValues = loadVariableValues();
  let imported = 0;
  let skipped = 0;

  for (const [key, value] of Object.entries(data.variables)) {
    const definition = getVariableDefinition(key);
    if (!definition) {
      skipped++;
      continue;
    }

    if (!overwrite && currentValues[key] && currentValues[key].source !== "default") {
      skipped++;
      continue;
    }

    const validation = validateVariable(key, value);
    if (!validation.valid) {
      skipped++;
      continue;
    }

    setVariableValue(key, value, "user");
    imported++;
  }

  return { imported, skipped };
}
