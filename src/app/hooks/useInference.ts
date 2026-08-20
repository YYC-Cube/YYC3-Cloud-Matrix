/**
 * @file: useInference.ts
 * @description: YYC³ 推理引擎 React Hook · 统一 Ollama + WebGPU 推理接口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hook],[inference]
 *
 * @brief: 提供推理引擎的 React 状态管理
 *
 * @details:
 * - 后端切换 (Ollama / WebGPU)
 * - 模型加载进度
 * - 流式推理输出
 * - GPU 检测
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  getInferenceEngine,
  detectGPU,
  WEBGPU_PRESETS,
} from "../lib/inference-engine";
import type {
  InferenceBackendType,
  InferenceBackendStatus,
  ModelLoadProgress,
  GPUDeviceInfo,
  WebGPUPreset,
  ChatRole,
  SDKChatResponse,
} from "../types";

export interface UseInferenceReturn {
  /** 当前活跃后端 */
  backend: InferenceBackendType;
  /** 各后端状态 */
  ollamaStatus: InferenceBackendStatus;
  webgpuStatus: InferenceBackendStatus;
  /** WebGPU 已加载模型 */
  webgpuModel: string | null;
  /** GPU 信息 */
  gpuInfo: GPUDeviceInfo | null;
  /** 可用 WebGPU 预置模型 */
  webgpuPresets: WebGPUPreset[];
  /** 加载进度 */
  loadProgress: ModelLoadProgress | null;
  /** 是否正在推理 */
  inferencing: boolean;
  /** 错误信息 */
  error: string | null;
  /** 流式输出文本 */
  streamText: string;
  /** 切换后端 */
  switchBackend: (type: InferenceBackendType) => void;
  /** 加载 WebGPU 模型 */
  loadModel: (modelId: string) => Promise<void>;
  /** 推理 */
  generate: (
    messages: Array<{ role: ChatRole; content: string }>,
    options?: {
      modelId?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    },
  ) => Promise<SDKChatResponse>;
  /** 中止推理 */
  abort: () => void;
  /** 刷新 GPU 信息 */
  refreshGPU: () => Promise<void>;
}

export function useInference(): UseInferenceReturn {
  const engine = useRef(getInferenceEngine());

  const [backend, setBackend] = useState<InferenceBackendType>("ollama");
  const [ollamaStatus, setOllamaStatus] = useState<InferenceBackendStatus>("idle");
  const [webgpuStatus, setWebgpuStatus] = useState<InferenceBackendStatus>("idle");
  const [webgpuModel, setWebgpuModel] = useState<string | null>(null);
  const [gpuInfo, setGpuInfo] = useState<GPUDeviceInfo | null>(null);
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgress | null>(null);
  const [inferencing, setInferencing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");

  // 初始化时检测 GPU
  useEffect(() => {
    detectGPU().then(setGpuInfo);
    return () => {
      // 不在 unmount 时 reset，保持引擎存活
    };
  }, []);

  const syncStatus = useCallback(() => {
    const status = engine.current.getStatus();
    setOllamaStatus(status.ollama);
    setWebgpuStatus(status.webgpu);
    setWebgpuModel(status.webgpuModel);
  }, []);

  const switchBackend = useCallback((type: InferenceBackendType) => {
    engine.current.switchBackend(type);
    setBackend(type);
    syncStatus();
  }, [syncStatus]);

  const loadModel = useCallback(async (modelId: string) => {
    setError(null);
    setLoadProgress({ stage: "loading", progress: 0, message: "开始加载..." });

    try {
      await engine.current.loadModel(modelId, (p) => {
        setLoadProgress(p);
      });
      setLoadProgress(null);
      syncStatus();
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setError(msg);
      setLoadProgress({ stage: "error", progress: 0, message: msg });
    }
  }, [syncStatus]);

  const generate = useCallback(
    async (
      messages: Array<{ role: ChatRole; content: string }>,
      options?: {
        modelId?: string;
        temperature?: number;
        maxTokens?: number;
        stream?: boolean;
      },
    ): Promise<SDKChatResponse> => {
      setError(null);
      setInferencing(true);
      setStreamText("");

      try {
        const result = await engine.current.generate(messages, {
          modelId: options?.modelId,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
          onChunk: options?.stream !== false
            ? (text: string) => {
                setStreamText((prev) => prev + text);
              }
            : undefined,
        });
        return result;
      } catch (err: unknown) {
        const msg = (err as Error).message;
        setError(msg);
        throw err;
      } finally {
        setInferencing(false);
        syncStatus();
      }
    },
    [syncStatus],
  );

  const abort = useCallback(() => {
    engine.current.abort();
    setInferencing(false);
    syncStatus();
  }, [syncStatus]);

  const refreshGPU = useCallback(async () => {
    const info = await detectGPU();
    setGpuInfo(info);
  }, []);

  return {
    backend,
    ollamaStatus,
    webgpuStatus,
    webgpuModel,
    gpuInfo,
    webgpuPresets: WEBGPU_PRESETS,
    loadProgress,
    inferencing,
    error,
    streamText,
    switchBackend,
    loadModel,
    generate,
    abort,
    refreshGPU,
  };
}
