/**
 * @file: model-provider-types.ts
 * @description: AI 模型提供商类型 — 服务商定义 + 配置实例 + Ollama
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[model-provider]
 */

/** 服务商标识 — 改为 string 以支持自定义服务商 */
export type ModelProviderId = string;

/** 服务商定义 */
export interface ModelProviderDef {
  id: ModelProviderId;
  label: string;
  baseUrl: string;
  authType: "bearer" | "api-key" | "none";
  models: string[];
  requiresApiKey: boolean;
  isLocal: boolean;
  isBuiltin?: boolean;
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** 已配置的模型实例 */
export interface ConfiguredModel {
  id: string;
  providerId: ModelProviderId;
  providerLabel: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  proxyUrl?: string;
  createdAt: number;
  lastUsed: number | null;
  status: "active" | "error" | "unchecked";
  lastTestResult?: {
    steps: Array<{ label: string; status: string; detail: string; latencyMs?: number }>;
    suggestion?: string;
    totalLatencyMs: number;
    testedAt: number;
  };
}

/** Ollama 本地模型标签 (来自 /api/tags) */
export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

/** Ollama /api/tags 响应 */
export interface OllamaTagsResponse {
  models: OllamaModel[];
}
