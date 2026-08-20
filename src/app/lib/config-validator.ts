/**
 * @file: config-validator.ts
 * @description: config-validator.ts
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { z } from "zod";

const urlSchema = z.string().url({ message: "URL 格式无效" }).refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:", "ws:", "wss:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
  { message: "URL 协议必须是 http、https、ws 或 wss" }
);

const urlOrPathSchema = (fieldName: string) =>
  z.string().refine(
    (val) => {
      if (val.startsWith("/") || val === "") { return true; }
      try {
        const parsed = new URL(val);
        return ["http:", "https:", "ws:", "wss:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: `${fieldName} 必须是有效的 URL 或以 / 开头的相对路径` }
  );

const apiEndpointsSchema = z.object({
  fsBase: urlOrPathSchema("fsBase"),
  dbBase: urlOrPathSchema("dbBase"),
  wsEndpoint: z.string().refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["ws:", "wss:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "wsEndpoint 必须是有效的 WebSocket URL (ws:// 或 wss://)" }
  ),
  aiBase: urlSchema.refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "aiBase 必须是有效的 HTTP/HTTPS URL" }
  ),
  clusterBase: urlOrPathSchema("clusterBase"),
  enableBackend: z.boolean({ message: "enableBackend 必须是布尔值" }),
  timeout: z.number()
    .int("超时时间必须是整数")
    .min(1000, "超时时间不能小于 1000ms")
    .max(300000, "超时时间不能超过 300000ms (5分钟)"),
  maxRetries: z.number()
    .int("重试次数必须是整数")
    .min(0, "重试次数不能为负数")
    .max(10, "重试次数不能超过 10 次"),
});

export type APIEndpointsInput = z.input<typeof apiEndpointsSchema>;
export type APIEndpointsOutput = z.output<typeof apiEndpointsSchema>;

export interface ConfigValidationResult {
  success: boolean;
  data?: APIEndpointsOutput;
  errors: ConfigValidationError[];
}

export interface ConfigValidationError {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

const ERROR_CODE_MAP: Record<string, string> = {
  invalid_type: "TYPE_ERROR",
  too_small: "VALUE_TOO_SMALL",
  too_big: "VALUE_TOO_BIG",
  invalid_string: "FORMAT_ERROR",
  invalid_format: "FORMAT_ERROR",
  invalid_union: "UNION_TYPE_ERROR",
  custom: "CUSTOM_ERROR",
};

const FRIENDLY_MESSAGE_MAP: Record<string, string> = {
  fsBase: "fsBase 必须是有效的 URL 或以 / 开头的相对路径",
  dbBase: "dbBase 必须是有效的 URL 或以 / 开头的相对路径",
  clusterBase: "clusterBase 必须是有效的 URL 或以 / 开头的相对路径",
  wsEndpoint: "wsEndpoint 必须是有效的 WebSocket URL (ws:// 或 wss://)",
  aiBase: "aiBase 必须是有效的 HTTP/HTTPS URL",
};

const SUGGESTION_MAP: Record<string, string> = {
  fsBase: "示例: /api/fs 或 http://localhost:3000/api/fs",
  dbBase: "示例: /api/db 或 http://localhost:3000/api/db",
  wsEndpoint: "示例: ws://localhost:3113/ws 或 wss://your-server.com/ws",
  aiBase: "示例: https://api.openai.com/v1 或 http://localhost:11434/v1",
  clusterBase: "示例: /api/cluster 或 http://localhost:3000/api/cluster",
  timeout: "建议范围: 5000-60000ms，默认值: 15000ms",
  maxRetries: "建议范围: 0-5 次，默认值: 2 次",
  enableBackend: "true: 启用真实后端, false: 使用前端 Mock 数据",
};

export function validateAPIConfig(input: unknown): ConfigValidationResult {
  const result = apiEndpointsSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  const errors: ConfigValidationError[] = result.error.issues.map((issue) => {
    const field = issue.path.join(".") || "unknown";
    let message = issue.message;
    if ((issue.code === "invalid_union" || issue.code === "invalid_type") && FRIENDLY_MESSAGE_MAP[field]) {
      message = FRIENDLY_MESSAGE_MAP[field];
    }
    return {
      field,
      message,
      code: ERROR_CODE_MAP[issue.code] || "UNKNOWN_ERROR",
      suggestion: SUGGESTION_MAP[field],
    };
  });

  return {
    success: false,
    errors,
  };
}

export function validatePartialAPIConfig(
  input: Partial<unknown>
): ConfigValidationResult {
  const partialSchema = apiEndpointsSchema.partial();
  const result = partialSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data as APIEndpointsOutput,
      errors: [],
    };
  }

  const errors: ConfigValidationError[] = result.error.issues.map((issue) => {
    const field = issue.path.join(".") || "unknown";
    let message = issue.message;
    if ((issue.code === "invalid_union" || issue.code === "invalid_type") && FRIENDLY_MESSAGE_MAP[field]) {
      message = FRIENDLY_MESSAGE_MAP[field];
    }
    return {
      field,
      message,
      code: ERROR_CODE_MAP[issue.code] || "UNKNOWN_ERROR",
      suggestion: SUGGESTION_MAP[field],
    };
  });

  return {
    success: false,
    errors,
  };
}

export function formatValidationErrors(errors: ConfigValidationError[]): string {
  if (errors.length === 0) { return "配置验证通过"; }

  const lines = errors.map((err) => {
    let line = `❌ [${err.field}] ${err.message}`;
    if (err.suggestion) {
      line += `\n   💡 建议: ${err.suggestion}`;
    }
    return line;
  });

  return `配置验证失败:\n${lines.join("\n")}`;
}

export function getDefaultValue<K extends keyof APIEndpointsOutput>(
  key: K
): APIEndpointsOutput[K] | undefined {
  const defaults: APIEndpointsOutput = {
    fsBase: "/api/fs",
    dbBase: "/api/db",
    wsEndpoint: "ws://localhost:3113/ws",
    aiBase: "https://api.openai.com/v1",
    clusterBase: "/api/cluster",
    enableBackend: false,
    timeout: 15000,
    maxRetries: 2,
  };
  return defaults[key];
}

export function sanitizeAPIConfig(input: Record<string, unknown>): Partial<APIEndpointsOutput> {
  const allowedKeys: (keyof APIEndpointsOutput)[] = [
    "fsBase",
    "dbBase",
    "wsEndpoint",
    "aiBase",
    "clusterBase",
    "enableBackend",
    "timeout",
    "maxRetries",
  ];

  const sanitized: Partial<APIEndpointsOutput> = {};

  for (const key of allowedKeys) {
    if (key in input) {
      const value = input[key];
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        (sanitized as Record<string, string | number | boolean>)[key] = value;
      }
    }
  }

  return sanitized;
}

export { apiEndpointsSchema };
