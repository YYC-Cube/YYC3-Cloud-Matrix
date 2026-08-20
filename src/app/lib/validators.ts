/**
 * @file: validators.ts
 * @description: YYC³ 数据校验工具集 - 提供严格的数据格式验证
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [validator],[utility],[typescript]
 *
 * @brief: 统一的数据格式验证，支持 URL、邮箱、ID 格式等
 */

// ============================================================
// 类型定义
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  field: string;
  value: T;
  validator: (value: T) => boolean;
  message: string;
}

// ============================================================
// URL 验证
// ============================================================

/**
 * 验证 URL 格式是否合法
 * 支持 http/https 协议，可选端口号和路径
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {return false;}

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 验证 URL 并返回详细错误信息
 */
export function validateUrl(url: string, fieldName = "URL"): ValidationResult {
  const errors: string[] = [];

  if (!url || typeof url !== "string") {
    errors.push(`${fieldName} 不能为空`);
    return { valid: false, errors };
  }

  if (!isValidUrl(url)) {
    errors.push(`${fieldName} 格式无效，必须以 http:// 或 https:// 开头`);
  }

  try {
    const parsed = new URL(url);

    // 检查协议
    if (!["http:", "https:"].includes(parsed.protocol)) {
      errors.push(`${fieldName} 必须使用 HTTP 或 HTTPS 协议`);
    }

    // 检查主机名
    if (!parsed.hostname) {
      errors.push(`${fieldName} 缺少主机名`);
    }

    // 检查端口范围（如果指定）
    if (parsed.port) {
      const portNum = parseInt(parsed.port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        errors.push(`${fieldName} 端口号必须在 1-65535 范围内`);
      }
    }

    // 检查长度限制
    if (url.length > 2048) {
      errors.push(`${fieldName} 长度不能超过 2048 个字符`);
    }
  } catch (e) {
    errors.push(`${fieldName} 解析失败: ${e instanceof Error ? e.message : "未知错误"}`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// 邮箱验证
// ============================================================

/**
 * 验证邮箱格式（RFC 5322 简化版）
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {return false;}
  return EMAIL_REGEX.test(email.trim());
}

/**
 * 验证邮箱并返回详细错误信息
 */
export function validateEmail(email: string, fieldName = "邮箱"): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== "string") {
    errors.push(`${fieldName} 不能为空`);
    return { valid: false, errors };
  }

  const trimmed = email.trim();

  if (trimmed.length < 3 || trimmed.length > 254) {
    errors.push(`${fieldName} 长度必须在 3-254 个字符之间`);
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    errors.push(`${fieldName} 格式无效，例如: user@example.com`);
  }

  // 检查不允许的字符
  if (trimmed.includes(" ") || trimmed.includes("..")) {
    errors.push(`${fieldName} 包含非法字符`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// ID 格式验证
// ============================================================

/**
 * 验证 ID 格式（字母、数字、连字符、下划线）
 */
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") {return false;}
  return ID_REGEX.test(id) && id.length >= 1 && id.length <= 128;
}

/**
 * 验证 ID 并返回详细错误信息
 */
export function validateId(id: string, fieldName = "ID"): ValidationResult {
  const errors: string[] = [];

  if (!id || typeof id !== "string") {
    errors.push(`${fieldName} 不能为空`);
    return { valid: false, errors };
  }

  if (id.length < 1) {
    errors.push(`${fieldName} 长度至少为 1 个字符`);
  }

  if (id.length > 128) {
    errors.push(`${fieldName} 长度不能超过 128 个字符`);
  }

  if (!ID_REGEX.test(id)) {
    errors.push(`${fieldName} 只能包含字母、数字、连字符(-)和下划线(_)`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// 字符串验证
// ============================================================

/**
 * 验证非空字符串
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  options: { min?: number; max?: number; fieldName?: string }
): ValidationResult {
  const { min = 0, max = Infinity, fieldName = "字段" } = options;
  const errors: string[] = [];

  if (typeof value !== "string") {
    errors.push(`${fieldName} 必须是字符串类型`);
    return { valid: false, errors };
  }

  if (value.length < min) {
    errors.push(`${fieldName} 长度至少为 ${min} 个字符`);
  }

  if (value.length > max) {
    errors.push(`${fieldName} 长度不能超过 ${max} 个字符`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// 数值验证
// ============================================================

/**
 * 验证数值范围
 */
export function validateNumberRange(
  value: number,
  options: { min?: number; max?: number; fieldName?: string; integer?: boolean }
): ValidationResult {
  const { min = -Infinity, max = Infinity, fieldName = "数值", integer = false } = options;
  const errors: string[] = [];

  if (typeof value !== "number" || isNaN(value)) {
    errors.push(`${fieldName} 必须是有效数字`);
    return { valid: false, errors };
  }

  if (integer && !Number.isInteger(value)) {
    errors.push(`${fieldName} 必须是整数`);
  }

  if (value < min) {
    errors.push(`${fieldName} 不能小于 ${min}`);
  }

  if (value > max) {
    errors.push(`${fieldName} 不能大于 ${max}`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// 百分比验证 (0-100)
// ============================================================

/**
 * 验证百分比数值
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === "number" && !isNaN(value) && value >= 0 && value <= 100;
}

/**
 * 验证百分比并返回详细错误信息
 */
export function validatePercentage(value: number, fieldName = "百分比"): ValidationResult {
  return validateNumberRange(value, { min: 0, max: 100, fieldName });
}

// ============================================================
// API Key 验证
// ============================================================

/**
 * 验证 API Key 格式（基本检查）
 */
export function isValidApiKey(key: string): boolean {
  if (!key || typeof key !== "string") {return false;}
  // 常见 API Key 前缀模式
  const apiKeyPatterns = [
    /^sk-/,           // OpenAI
    /^api-/,          // 通用
    /^[a-f0-9]{32,}/, // 十六进制长串
    /^[A-Za-z0-9_-]{20,}/, // 通用长字符串
  ];
  return key.length >= 20 && apiKeyPatterns.some(pattern => pattern.test(key));
}

/**
 * 验证 API Key 并返回详细错误信息
 */
export function validateApiKey(key: string, fieldName = "API Key"): ValidationResult {
  const errors: string[] = [];

  if (!key || typeof key !== "string") {
    errors.push(`${fieldName} 不能为空`);
    return { valid: false, errors };
  }

  if (key.length < 20) {
    errors.push(`${fieldName} 长度至少为 20 个字符`);
  }

  if (key.length > 2048) {
    errors.push(`${fieldName} 长度不能超过 2048 个字符`);
  }

  // 基本格式检查
  if (!/^[A-Za-z0-9._-]+$/.test(key)) {
    errors.push(`${fieldName} 包含非法字符，只允许字母、数字、点(.)、连字符(-)和下划线(_)`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// 批量验证
// ============================================================

/**
 * 执行多个验证规则并汇总结果
 */
export function validateAll(rules: ValidationRule<unknown>[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validator(rule.value)) {
      errors.push(rule.message);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证对象的所有字段
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  rules: Record<keyof T, (value: T[keyof T]) => ValidationResult>
): ValidationResult {
  const allErrors: string[] = [];

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(obj[field as keyof T]);
    if (!result.valid) {
      allErrors.push(...result.errors.map(err => `[${field}] ${err}`));
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

// ============================================================
// Model Provider 特定验证
// ============================================================

/**
 * 验证 ModelProviderDef 数据完整性
 */
import type { ModelProviderDef, ConfiguredModel } from "../types";

export function validateModelProvider(provider: Partial<ModelProviderDef>): ValidationResult {
  const errors: string[] = [];

  // 必填字段
  if (!provider.label?.trim()) {
    errors.push("[label] 供应商名称不能为空");
  }

  if (!provider.baseUrl) {
    const urlResult = validateUrl(provider.baseUrl || "", "baseUrl");
    errors.push(...urlResult.errors);
  } else {
    const urlResult = validateUrl(provider.baseUrl, "baseUrl");
    if (!urlResult.valid) {
      errors.push(...urlResult.errors);
    }
  }

  // authType 枚举值
  const validAuthTypes = ["bearer", "api-key", "none"];
  if (provider.authType && !validAuthTypes.includes(provider.authType)) {
    errors.push(`[authType] 认证类型必须是: ${validAuthTypes.join(", ")}`);
  }

  // models 数组
  if (provider.models && !Array.isArray(provider.models)) {
    errors.push("[models] 必须是数组");
  }

  // requiresApiKey 布尔值
  if (provider.requiresApiKey !== undefined && typeof provider.requiresApiKey !== "boolean") {
    errors.push("[requiresApiKey] 必须是布尔值");
  }

  // isLocal 布尔值
  if (provider.isLocal !== undefined && typeof provider.isLocal !== "boolean") {
    errors.push("[isLocal] 必须是布尔值");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证 ConfiguredModel 数据完整性
 */
export function validateConfiguredModel(model: Partial<ConfiguredModel>): ValidationResult {
  const errors: string[] = [];

  // 必填字段
  if (!model.providerId?.trim()) {
    errors.push("[providerId] 供应商 ID 不能为空");
  }

  if (!model.model?.trim()) {
    errors.push("[model] 模型名称不能为空");
  }

  // baseUrl 验证
  if (model.baseUrl) {
    const urlResult = validateUrl(model.baseUrl, "baseUrl");
    if (!urlResult.valid) {
      errors.push(...urlResult.errors);
    }
  }

  // apiKey 可选但需要时必须符合格式
  if (model.apiKey && model.apiKey.length > 0) {
    const keyResult = validateApiKey(model.apiKey, "apiKey");
    if (!keyResult.valid) {
      errors.push(...keyResult.errors);
    }
  }

  // status 枚举值
  const validStatuses = ["active", "error", "unchecked"];
  if (model.status && !validStatuses.includes(model.status)) {
    errors.push(`[status] 状态必须是: ${validStatuses.join(", ")}`);
  }

  // createdAt 时间戳
  if (model.createdAt !== undefined && (typeof model.createdAt !== "number" || model.createdAt < 0)) {
    errors.push("[createdAt] 必须是有效的时间戳");
  }

  return { valid: errors.length === 0, errors };
}
