/**
 * @file: sdk-types.ts
 * @description: BigModel SDK 集成类型 — 聊天会话 + 能力 + 统计
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[sdk]
 */

import type { ModelProviderId } from "./model-provider-types";
import type { ChatMessage } from "./ui-types";

/** SDK 连接状态 */
export type SDKConnectionStatus = "idle" | "connecting" | "connected" | "error";

/** 聊天消息角色 */
export type ChatRole = "system" | "user" | "assistant";

/** 聊天会话 */
export interface ChatSession {
  id: string;
  title: string;
  modelId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** SDK 能力枚举 */
export type SDKCapability =
  | "chat"
  | "chat-stream"
  | "file-upload"
  | "knowledge-base"
  | "image-gen"
  | "tts"
  | "stt"
  | "video-gen"
  | "code-gen";

/** SDK 使用统计 */
export interface SDKUsageStats {
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  avgLatencyMs: number;
  lastRequestAt: number | null;
  errorCount: number;
}

/** SDK 提供商能力映射 */
export interface SDKProviderCapabilities {
  providerId: ModelProviderId;
  capabilities: SDKCapability[];
}

/** SDK Chat Completion 请求 */
export interface SDKChatRequest {
  model: string;
  messages: { role: ChatRole; content: string }[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/** SDK Chat Completion 响应 */
export interface SDKChatResponse {
  id: string;
  model: string;
  content: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}
