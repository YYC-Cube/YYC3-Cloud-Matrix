/**
 * @file: error-handler.ts
 * @description: 全局错误处理工具 · 统一错误分类、日志记录、异常监听
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [lib],[error-handling],[logging]
 *
 * @brief: 全局错误处理系统
 *
 * @details:
 * - 统一错误分类（网络/解析/认证/运行时/验证/存储/未知）
 * - 错误日志记录（localStorage 快速读 + IndexedDB 持久化双写）
 * - 全局未捕获异常监听
 * - 错误上报队列（本地离线可追溯）
 * - 错误恢复建议机制
 * - 用户友好错误展示
 *
 * @dependencies: yyc3-storage, figma-error-filter
 * @exports: installGlobalErrorListeners, reportError, getErrorStats
 * @notes: 在 App.tsx 中调用 installGlobalErrorListeners() 初始化
 */

import type { ErrorCategory, ErrorSeverity, AppError, ErrorStats } from "../types";
import { idbPut, idbGetAll, idbClear } from "./yyc3-storage";
import { isFigmaPlatformError } from "./figma-error-filter";

const ERROR_LOG_KEY = "yyc3_error_log";
const MAX_ERROR_ENTRIES = 200;

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface EnhancedAppError extends AppError {
  validationDetails?: ValidationErrorDetail[];
  recoverySuggestion?: string;
  context?: Record<string, unknown>;
  relatedErrors?: string[];
}

export type ErrorCode =
  | "NETWORK_TIMEOUT"
  | "NETWORK_OFFLINE"
  | "NETWORK_CORS"
  | "AUTH_EXPIRED"
  | "AUTH_INVALID"
  | "AUTH_FORBIDDEN"
  | "VALIDATION_INVALID_URL"
  | "VALIDATION_INVALID_NUMBER"
  | "VALIDATION_REQUIRED_FIELD"
  | "VALIDATION_OUT_OF_RANGE"
  | "PARSE_JSON_ERROR"
  | "PARSE_XML_ERROR"
  | "STORAGE_QUOTA_EXCEEDED"
  | "STORAGE_NOT_AVAILABLE"
  | "RUNTIME_TYPE_ERROR"
  | "RUNTIME_REFERENCE_ERROR"
  | "UNKNOWN";

export const ERROR_RECOVERY_SUGGESTIONS: Record<ErrorCode, string> = {
  NETWORK_TIMEOUT: "请检查网络连接，或联系管理员确认服务器状态",
  NETWORK_OFFLINE: "请检查您的网络连接，系统将在网络恢复后自动重试",
  NETWORK_CORS: "请检查服务器 CORS 配置，或联系管理员解决跨域问题",
  AUTH_EXPIRED: "登录状态已过期，请重新登录",
  AUTH_INVALID: "用户名或密码错误，请检查后重试",
  AUTH_FORBIDDEN: "您没有权限执行此操作，请联系管理员",
  VALIDATION_INVALID_URL: "请输入有效的 URL 地址（http://, https://, ws://, wss://）",
  VALIDATION_INVALID_NUMBER: "请输入有效的数字",
  VALIDATION_REQUIRED_FIELD: "此字段为必填项，请填写",
  VALIDATION_OUT_OF_RANGE: "输入值超出允许范围，请检查",
  PARSE_JSON_ERROR: "数据格式解析失败，请检查数据格式是否正确",
  PARSE_XML_ERROR: "XML 解析失败，请检查 XML 格式",
  STORAGE_QUOTA_EXCEEDED: "浏览器存储空间已满，请清理缓存后重试",
  STORAGE_NOT_AVAILABLE: "浏览器存储不可用，请检查浏览器设置",
  RUNTIME_TYPE_ERROR: "类型错误，请检查数据类型",
  RUNTIME_REFERENCE_ERROR: "引用错误，请检查变量是否已定义",
  UNKNOWN: "发生未知错误，请刷新页面或联系管理员",
};

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getErrorLog(): AppError[] {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveErrorToLog(error: AppError): void {
  try {
    const log = getErrorLog();
    log.unshift(error);
    const trimmed = log.slice(0, MAX_ERROR_ENTRIES);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    try {
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify([error]));
    } catch {
      /* ignore */
    }
  }
  idbPut("errorLog", error).catch(() => {/* ignore */});
}

export function clearErrorLog(): void {
  localStorage.removeItem(ERROR_LOG_KEY);
  idbClear("errorLog").catch(() => {/* ignore */});
}

export async function getFullErrorLog(): Promise<AppError[]> {
  try {
    const entries = await idbGetAll<AppError>("errorLog");
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return getErrorLog();
  }
}

export function getErrorStats(): ErrorStats {
  const log = getErrorLog();
  const byCategory: Record<ErrorCategory, number> = {
    NETWORK: 0, PARSE: 0, AUTH: 0, RUNTIME: 0,
    VALIDATION: 0, STORAGE: 0, UNKNOWN: 0,
  };
  const bySeverity: Record<ErrorSeverity, number> = {
    info: 0, warning: 0, error: 0, critical: 0,
  };
  let unresolvedCount = 0;

  for (const err of log) {
    byCategory[err.category] = (byCategory[err.category] || 0) + 1;
    bySeverity[err.severity] = (bySeverity[err.severity] || 0) + 1;
    if (!err.resolved) {unresolvedCount++;}
  }

  return {
    total: log.length,
    byCategory,
    bySeverity,
    unresolvedCount,
    lastErrorTime: log.length > 0 ? log[0].timestamp : null,
  };
}

function categorizeError(error: unknown): { category: ErrorCategory; severity: ErrorSeverity } {
  if (error instanceof TypeError) {
    return { category: "RUNTIME", severity: "error" };
  }
  if (error instanceof SyntaxError) {
    return { category: "PARSE", severity: "error" };
  }
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError") {
      return { category: "STORAGE", severity: "warning" };
    }
    if (error.name === "SecurityError") {
      return { category: "AUTH", severity: "error" };
    }
  }
  if (error instanceof Event && error.type === "error") {
    return { category: "NETWORK", severity: "error" };
  }
  return { category: "UNKNOWN", severity: "error" };
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) {return error.message;}
  if (typeof error === "string") {return error;}
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "未知错误";
}

function extractStack(error: unknown): string | undefined {
  if (error instanceof Error) {return error.stack;}
  return undefined;
}

export function detectErrorCode(error: unknown, category?: ErrorCategory): ErrorCode {
  const message = extractMessage(error).toLowerCase();
  const categoryStr = category || categorizeError(error).category;

  if (categoryStr === "NETWORK") {
    if (message.includes("timeout") || message.includes("超时")) {
      return "NETWORK_TIMEOUT";
    }
    if (message.includes("offline") || message.includes("网络") || message.includes("fetch")) {
      return "NETWORK_OFFLINE";
    }
    if (message.includes("cors") || message.includes("跨域")) {
      return "NETWORK_CORS";
    }
  }

  if (categoryStr === "AUTH") {
    if (message.includes("expired") || message.includes("过期")) {
      return "AUTH_EXPIRED";
    }
    if (message.includes("invalid") || message.includes("无效") || message.includes("invalid")) {
      return "AUTH_INVALID";
    }
    if (message.includes("forbidden") || message.includes("禁止") || message.includes("403")) {
      return "AUTH_FORBIDDEN";
    }
  }

  if (categoryStr === "VALIDATION") {
    if (message.includes("url") || message.includes("地址")) {
      return "VALIDATION_INVALID_URL";
    }
    if (message.includes("number") || message.includes("数字")) {
      return "VALIDATION_INVALID_NUMBER";
    }
    if (message.includes("required") || message.includes("必填")) {
      return "VALIDATION_REQUIRED_FIELD";
    }
    if (message.includes("range") || message.includes("范围")) {
      return "VALIDATION_OUT_OF_RANGE";
    }
  }

  if (categoryStr === "PARSE") {
    if (message.includes("json")) {
      return "PARSE_JSON_ERROR";
    }
    if (message.includes("xml")) {
      return "PARSE_XML_ERROR";
    }
  }

  if (categoryStr === "STORAGE") {
    if (message.includes("quota") || message.includes("存储空间")) {
      return "STORAGE_QUOTA_EXCEEDED";
    }
    if (message.includes("storage") || message.includes("存储")) {
      return "STORAGE_NOT_AVAILABLE";
    }
  }

  if (categoryStr === "RUNTIME") {
    if (message.includes("type") || message.includes("类型")) {
      return "RUNTIME_TYPE_ERROR";
    }
    if (message.includes("reference") || message.includes("引用")) {
      return "RUNTIME_REFERENCE_ERROR";
    }
  }

  return "UNKNOWN";
}

export interface CaptureErrorOptions {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  source?: string;
  userAction?: string;
  silent?: boolean;
  validationDetails?: ValidationErrorDetail[];
  context?: Record<string, unknown>;
  detail?: string;
}

export function captureError(
  error: unknown,
  options: CaptureErrorOptions = {}
): AppError {
  const auto = categorizeError(error);
  const category = options.category || auto.category;
  const errorCode = detectErrorCode(error, category);

  const recoverySuggestion = options.userAction || ERROR_RECOVERY_SUGGESTIONS[errorCode];

  const appError: AppError = {
    id: generateErrorId(),
    category,
    severity: options.severity || auto.severity,
    message: extractMessage(error),
    stack: extractStack(error),
    source: options.source,
    userAction: recoverySuggestion,
    timestamp: Date.now(),
    resolved: false,
  };

  if (options.detail) {
    appError.detail = options.detail;
  }

  saveErrorToLog(appError);

  if (!options.silent) {
    const prefix = `[YYC³ ${appError.category}]`;
    switch (appError.severity) {
      case "critical":
      case "error":
        console.error(prefix, appError.message, appError.stack || "");
        break;
      case "warning":
        console.warn(prefix, appError.message);
        break;
      default:
        console.info(prefix, appError.message);
    }
  }

  return appError;
}

export function captureValidationError(
  validationErrors: ValidationErrorDetail[],
  source?: string
): AppError {
  const message = validationErrors
    .map((e) => `[${e.field}] ${e.message}`)
    .join("; ");

  return captureError(new Error(message), {
    category: "VALIDATION",
    severity: "warning",
    source,
    userAction: "请检查表单填写是否正确",
  });
}

export function captureNetworkError(
  error: unknown,
  endpoint: string
): AppError {
  const errorCode = detectErrorCode(error, "NETWORK");
  return captureError(error, {
    category: "NETWORK",
    severity: "warning",
    source: endpoint,
    userAction: ERROR_RECOVERY_SUGGESTIONS[errorCode],
  });
}

export function captureWSError(
  error: unknown,
  _detail?: string
): AppError {
  return captureError(error, {
    category: "NETWORK",
    severity: "warning",
    source: "WebSocket",
    userAction: "系统将自动尝试重连，或点击手动重连按钮",
  });
}

export function captureAuthError(error: unknown): AppError {
  const errorCode = detectErrorCode(error, "AUTH");
  return captureError(error, {
    category: "AUTH",
    severity: "error",
    source: "AuthContext",
    userAction: ERROR_RECOVERY_SUGGESTIONS[errorCode],
  });
}

export function captureParseError(
  error: unknown,
  context: string
): AppError {
  return captureError(error, {
    category: "PARSE",
    severity: "warning",
    source: context,
    userAction: "数据格式异常，请检查数据源",
  });
}

export async function trySafe<T>(
  fn: () => Promise<T>,
  source?: string
): Promise<[T, null] | [null, AppError]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (err) {
    const appError = captureError(err, { source });
    return [null, appError];
  }
}

export function trySafeSync<T>(
  fn: () => T,
  source?: string
): [T, null] | [null, AppError] {
  try {
    const result = fn();
    return [result, null];
  } catch (err) {
    const appError = captureError(err, { source });
    return [null, appError];
  }
}

export function formatErrorForUser(error: AppError): string {
  let formatted = `⚠️ ${error.message}`;

  if (error.userAction) {
    formatted += `\n💡 建议: ${error.userAction}`;
  }

  if (error.source) {
    formatted += `\n📍 位置: ${error.source}`;
  }

  return formatted;
}

export function getErrorIcon(severity: ErrorSeverity): string {
  switch (severity) {
    case "critical": return "🚨";
    case "error": return "❌";
    case "warning": return "⚠️";
    case "info": return "ℹ️";
    default: return "❓";
  }
}

export function getCategoryLabel(category: ErrorCategory): string {
  const labels: Record<ErrorCategory, string> = {
    NETWORK: "网络错误",
    PARSE: "解析错误",
    AUTH: "认证错误",
    RUNTIME: "运行时错误",
    VALIDATION: "验证错误",
    STORAGE: "存储错误",
    UNKNOWN: "未知错误",
  };
  return labels[category] || category;
}

let globalListenerInstalled = false;

export function installGlobalErrorListeners(): void {
  if (globalListenerInstalled) {return;}
  globalListenerInstalled = true;

  window.addEventListener("error", (event) => {
    const errName = event.error?.name || event.error?.constructor?.name || "";
    const errStack = event.error?.stack || "";
    if (isFigmaPlatformError(errName, String(event.message || ""), event.filename || "", errStack)) {
      return;
    }
    captureError(event.error || event.message, {
      category: "RUNTIME",
      severity: "critical",
      source: `${event.filename}:${event.lineno}:${event.colno}`,
      silent: false,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const name = reason?.name || reason?.constructor?.name || "";
    const msg = String(reason?.message || reason || "");
    const stack = reason?.stack || "";
    if (isFigmaPlatformError(name, msg, undefined, stack)) {
      event.preventDefault();
      return;
    }
    captureError(event.reason, {
      category: "RUNTIME",
      severity: "error",
      source: "UnhandledPromiseRejection",
      silent: false,
    });
  });

  console.info("[YYC³] 全局错误监听器已安装");
}

export { ERROR_RECOVERY_SUGGESTIONS as errorSuggestions };
