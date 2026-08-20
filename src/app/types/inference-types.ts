/**
 * @file: inference-types.ts
 * @description: 推理引擎类型 — 后端 + WebGPU + 配置
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[inference]
 */

/** 推理后端类型 */
export type InferenceBackendType = "ollama" | "webgpu";

/** 模型加载进度 */
export interface ModelLoadProgress {
  stage: "downloading" | "loading" | "ready" | "error";
  /** 0 ~ 1 */
  progress: number;
  message: string;
  /** 已下载字节数 */
  loadedBytes?: number;
  /** 总字节数 */
  totalBytes?: number;
}

/** 推理配置 */
export interface InferenceConfig {
  backend: InferenceBackendType;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  /** 流式输出回调 */
  onChunk?: (text: string) => void;
  /** 加载进度回调 */
  onProgress?: (progress: ModelLoadProgress) => void;
  /** 中止信号 */
  signal?: AbortSignal;
}

/** 推理后端状态 */
export type InferenceBackendStatus = "idle" | "loading" | "ready" | "inferencing" | "error";

/** GPU 显存信息 */
export interface GPUDeviceInfo {
  available: boolean;
  vendor: string;
  renderer: string;
  memoryMB: number;
  webgpuSupported: boolean;
}

/** 预置 WebGPU 模型配置 */
export interface WebGPUPreset {
  id: string;
  modelId: string;
  name: string;
  size: string;
  /** 所需显存 (MB) */
  minMemoryMB: number;
  description: string;
  bilingual: boolean;
}
