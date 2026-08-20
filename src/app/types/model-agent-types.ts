/**
 * @file: model-agent-types.ts
 * @description: 模型配置 + Agent 定义 + 推理日志
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[model],[agent]
 */

/** 模型层级 */
export type ModelTier = "primary" | "secondary" | "standby";

/** 模型配置（DB Schema: core.models） */
export interface Model {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  avg_latency_ms: number;
  throughput: number;
  created_at: string;
}

/** Agent 配置（DB Schema: core.agents） */
export interface Agent {
  id: string;
  name: string;
  name_cn: string;
  role: string;
  description: string;
  is_active: boolean;
}

/** 推理日志状态 */
export type InferenceStatus = "success" | "error" | "timeout";

/** 推理日志（DB Schema: telemetry.inference_logs） */
export interface InferenceLog {
  id: string;
  model_id: string;
  agent_id: string;
  latency_ms: number;
  tokens_in: number;
  tokens_out: number;
  status: InferenceStatus;
  created_at: string;
}

/** 模型性能统计（聚合查询结果） */
export interface ModelStats {
  avgLatency: number;
  totalRequests: number;
  totalTokens: number;
  successRate: number;
}
