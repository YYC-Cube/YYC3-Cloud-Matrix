/**
 * @file: inference-engine.ts
 * @description: YYC³ 推理引擎 · Ollama + WebGPU 双后端统一抽象
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[inference],[webgpu],[ollama]
 *
 * @brief: 统一推理引擎，抽象 Ollama HTTP 和 WebGPU 浏览器端推理
 *
 * @details:
 * - InferenceBackend 接口: 统一 load/generate/abort 生命周期
 * - OllamaBackend: HTTP POST /api/chat (复用 ollama-url.ts)
 * - WebGPUBackend: @mlc-ai/web-llm MLCEngine 封装
 * - InferenceEngine: 后端选择、模型热切换、GPU 检测
 * - 单例模式: getInferenceEngine() / resetInferenceEngine()
 */

import type {
  InferenceBackendType,
  InferenceConfig,
  InferenceBackendStatus,
  ModelLoadProgress,
  GPUDeviceInfo,
  WebGPUPreset,
  ChatRole,
  SDKChatResponse,
} from "../types";
import { getOllamaChatUrl } from "./ollama-url";
import { getEnvConfig } from "./env-config";

// ============================================================
// 预置 WebGPU 模型
// ============================================================

export const WEBGPU_PRESETS: WebGPUPreset[] = [
  {
    id: "smollm2-135m",
    modelId: "SmolLM2-135M-Instruct-q4f16_1-MLC",
    name: "SmolLM2 135M",
    size: "~100MB",
    minMemoryMB: 512,
    description: "超轻量模型，最快加载，适合测试",
    bilingual: false,
  },
  {
    id: "phi-3.5-mini",
    modelId: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 Mini",
    size: "~2.2GB",
    minMemoryMB: 4096,
    description: "微软小模型，推理能力强",
    bilingual: true,
  },
  {
    id: "qwen2-0.5b",
    modelId: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2 0.5B",
    size: "~400MB",
    minMemoryMB: 1024,
    description: "通义千问小模型，中文支持好",
    bilingual: true,
  },
  {
    id: "llama-3.2-1b",
    modelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 1B",
    size: "~800MB",
    minMemoryMB: 2048,
    description: "Meta Llama 3.2 小模型，通用推理",
    bilingual: false,
  },
  {
    id: "gemma-2-2b",
    modelId: "gemma-2-2b-it-q4f16_1-MLC",
    name: "Gemma 2 2B",
    size: "~1.5GB",
    minMemoryMB: 3072,
    description: "Google Gemma 2，平衡速度与质量",
    bilingual: true,
  },
];

// ============================================================
// GPU 检测
// ============================================================

let _cachedGPUInfo: GPUDeviceInfo | null = null;

export async function detectGPU(): Promise<GPUDeviceInfo> {
  if (_cachedGPUInfo) {return _cachedGPUInfo;}

  const info: GPUDeviceInfo = {
    available: false,
    vendor: "unknown",
    renderer: "unknown",
    memoryMB: 0,
    webgpuSupported: false,
  };

  // 检测 WebGPU 支持
  if (typeof navigator !== "undefined" && "gpu" in navigator) {
    try {
      const adapter = await (navigator as unknown as { gpu: { requestAdapter?: () => Promise<{ info?: { vendor: string; architecture: string; deviceDescription: string }; limits?: { maxBufferSize: number } }> } }).gpu.requestAdapter?.();
      if (adapter) {
        info.available = true;
        info.webgpuSupported = true;
        const adapterInfo = adapter.info;
        if (adapterInfo) {
          info.vendor = adapterInfo.vendor || "unknown";
          info.renderer = adapterInfo.architecture || adapterInfo.deviceDescription || "unknown";
        }
        // 估算显存: maxBufferSize 作为上限参考
        const limits = adapter.limits;
        if (limits) {
          info.memoryMB = Math.round(limits.maxBufferSize / (1024 * 1024));
        }
      }
    } catch {
      // WebGPU 不可用
    }
  }

  _cachedGPUInfo = info;
  return info;
}

// ============================================================
// Ollama 后端
// ============================================================

export class OllamaBackend {
  readonly type = "ollama" as const;
  private _status: InferenceBackendStatus = "idle";
  private _abortController: AbortController | null = null;

  get status(): InferenceBackendStatus {return this._status;}
  get isReady(): boolean {return this._status === "ready" || this._status === "idle";}

  async load(_modelId: string, _onProgress?: (p: ModelLoadProgress) => void): Promise<void> {
    this._status = "ready";
    // Ollama 模型在首次推理时自动加载
  }

  async generate(
    messages: Array<{ role: ChatRole; content: string }>,
    config: InferenceConfig,
  ): Promise<SDKChatResponse> {
    this._status = "inferencing";
    const startTime = Date.now();
    this._abortController = new AbortController();
    const signal = config.signal || this._abortController.signal;

    try {
      const url = getOllamaChatUrl();
      const body: Record<string, unknown> = {
        model: config.modelId,
        messages,
        stream: !!config.onChunk,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama ${response.status}: ${response.statusText}`);
      }

      if (config.onChunk && response.body) {
        // 流式读取
        let fullContent = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {break;}
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.trim()) {continue;}
              try {
                const data = JSON.parse(line);
                const text = data?.message?.content || "";
                if (text) {
                  fullContent += text;
                  config.onChunk!(text);
                }
              } catch {
                // 跳过不完整的 JSON
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        this._status = "ready";
        return {
          id: `ollama-${Date.now()}`,
          model: config.modelId,
          content: fullContent,
          finishReason: "stop",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: Date.now() - startTime,
        };
      } else {
        // 非流式
        const data = await response.json() as Record<string, unknown>;
        this._status = "ready";
        return {
          id: `ollama-${Date.now()}`,
          model: String(data.model || config.modelId),
          content: String((data as { message?: { content?: string } }).message?.content || ""),
          finishReason: "stop",
          usage: {
            promptTokens: Number(data.prompt_eval_count || 0),
            completionTokens: Number(data.eval_count || 0),
            totalTokens: Number(data.prompt_eval_count || 0) + Number(data.eval_count || 0),
          },
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err: unknown) {
      this._status = "error";
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
      throw new Error(`[OllamaBackend] ${(err as Error).message}`);
    }
  }

  abort(): void {
    this._abortController?.abort();
    this._abortController = null;
    if (this._status === "inferencing") {this._status = "ready";}
  }

  async unload(): Promise<void> {
    this.abort();
    this._status = "idle";
  }
}

// ============================================================
// WebGPU 后端
// ============================================================

export class WebGPUBackend {
  readonly type = "webgpu" as const;
  private _status: InferenceBackendStatus = "idle";
  private _engine: unknown = null; // MLCEngine, lazy loaded
  private _currentModelId: string | null = null;

  get status(): InferenceBackendStatus {return this._status;}
  get isReady(): boolean {return this._status === "ready";}
  get loadedModel(): string | null {return this._currentModelId;}

  async load(modelId: string, onProgress?: (p: ModelLoadProgress) => void): Promise<void> {
    if (this._currentModelId === modelId && this._status === "ready") {
      return; // 已加载同一模型
    }

    this._status = "loading";
    onProgress?.({ stage: "loading", progress: 0, message: `加载模型 ${modelId}...` });

    try {
      // 动态导入 @mlc-ai/web-llm (避免非 WebGPU 环境报错)
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

      this._engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (progress: { progress: number; text: string; timeElapsed?: number }) => {
          const stage = progress.progress < 1 ? "downloading" : "loading";
          onProgress?.({
            stage,
            progress: progress.progress,
            message: progress.text,
          });
        },
      });

      this._currentModelId = modelId;
      this._status = "ready";
      onProgress?.({ stage: "ready", progress: 1, message: `${modelId} 加载完成` });
    } catch (err: unknown) {
      this._status = "error";
      this._engine = null;
      this._currentModelId = null;
      throw new Error(`[WebGPUBackend] 模型加载失败: ${(err as Error).message}`);
    }
  }

  async generate(
    messages: Array<{ role: ChatRole; content: string }>,
    config: InferenceConfig,
  ): Promise<SDKChatResponse> {
    if (!this._engine) {
      throw new Error("[WebGPUBackend] 引擎未初始化，请先调用 load()");
    }
    this._status = "inferencing";
    const startTime = Date.now();

    try {
      const engine = this._engine as {
        chat: {
          completions: {
            create: (params: Record<string, unknown>) => AsyncIterable<Record<string, unknown>>;
          };
        };
      };

      const params: Record<string, unknown> = {
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        stream: !!config.onChunk,
      };

      if (config.onChunk) {
        // 流式
        const chunks = engine.chat.completions.create(params);
        let fullContent = "";

        for await (const chunk of chunks) {
          const delta = (chunk as { choices?: Array<{ delta?: { content?: string } }> }).choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            config.onChunk(delta);
          }
        }

        this._status = "ready";
        return {
          id: `webgpu-${Date.now()}`,
          model: this._currentModelId || config.modelId,
          content: fullContent,
          finishReason: "stop",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: Date.now() - startTime,
        };
      } else {
        // 非流式
        const chunks = engine.chat.completions.create({ ...params, stream: false });
        let result: Record<string, unknown> | null = null;
        for await (const chunk of chunks) {
          result = chunk;
          break; // 非流式只取第一个
        }

        const content = String(
          (result as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content || ""
        );

        this._status = "ready";
        return {
          id: `webgpu-${Date.now()}`,
          model: this._currentModelId || config.modelId,
          content,
          finishReason: "stop",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err: unknown) {
      this._status = "error";
      throw new Error(`[WebGPUBackend] 推理失败: ${(err as Error).message}`);
    }
  }

  abort(): void {
    // WebLLM 没有原生 abort，标记状态
    if (this._status === "inferencing") {this._status = "ready";}
  }

  async unload(): Promise<void> {
    if (this._engine) {
      try {
        const engine = this._engine as { unload?: () => Promise<void> };
        await engine.unload?.();
      } catch {
        // 忽略卸载错误
      }
      this._engine = null;
    }
    this._currentModelId = null;
    this._status = "idle";
  }
}

// ============================================================
// 统一推理引擎
// ============================================================

export class InferenceEngine {
  private ollama: OllamaBackend;
  private webgpu: WebGPUBackend;
  private _activeBackend: InferenceBackendType = "ollama";

  constructor() {
    this.ollama = new OllamaBackend();
    this.webgpu = new WebGPUBackend();
  }

  /** 获取当前活跃后端 */
  get activeBackend(): InferenceBackendType {return this._activeBackend;}

  /** 获取后端状态 */
  getBackendStatus(type: InferenceBackendType): InferenceBackendStatus {
    return type === "ollama" ? this.ollama.status : this.webgpu.status;
  }

  /** 获取 WebGPU 后端已加载的模型 */
  get webgpuModel(): string | null {return this.webgpu.loadedModel;}

  /** 切换后端 */
  async switchBackend(type: InferenceBackendType): Promise<void> {
    this._activeBackend = type;
  }

  /** 加载模型 (仅 WebGPU 需要显式加载) */
  async loadModel(modelId: string, onProgress?: (p: ModelLoadProgress) => void): Promise<void> {
    if (this._activeBackend === "webgpu") {
      await this.webgpu.load(modelId, onProgress);
    }
    // Ollama 后端无需预加载
  }

  /**
   * 统一推理接口
   * 根据 activeBackend 自动路由到 Ollama 或 WebGPU
   */
  async generate(
    messages: Array<{ role: ChatRole; content: string }>,
    config: Partial<InferenceConfig> = {},
  ): Promise<SDKChatResponse> {
    const fullConfig: InferenceConfig = {
      backend: this._activeBackend,
      modelId: config.modelId || getEnvConfig().DEFAULT_AI_MODEL,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
      onChunk: config.onChunk,
      onProgress: config.onProgress,
      signal: config.signal,
    };

    const backend = this._activeBackend === "ollama" ? this.ollama : this.webgpu;

    if (!backend.isReady && backend.type !== "ollama") {
      throw new Error(`[InferenceEngine] ${this._activeBackend} 后端未就绪，请先 loadModel()`);
    }

    return backend.generate(messages, fullConfig);
  }

  /** 中止当前推理 */
  abort(): void {
    this.ollama.abort();
    this.webgpu.abort();
  }

  /** 卸载所有模型 */
  async unloadAll(): Promise<void> {
    await this.ollama.unload();
    await this.webgpu.unload();
  }

  /** 获取推荐的 WebGPU 模型 (基于 GPU 显存) */
  async getRecommendedModel(): Promise<WebGPUPreset | null> {
    const gpu = await detectGPU();
    if (!gpu.available) {return null;}

    // 按显存从小到大排序，选择能运行的最大模型
    const sorted = [...WEBGPU_PRESETS].sort((a, b) => a.minMemoryMB - b.minMemoryMB);
    let best: WebGPUPreset | null = null;
    for (const preset of sorted) {
      if (gpu.memoryMB >= preset.minMemoryMB || gpu.memoryMB === 0) {
        best = preset; // memoryMB=0 时无法精确判断，选最后一个
      }
    }
    return best;
  }

  /** 获取所有状态信息 (用于 UI 展示) */
  getStatus(): {
    activeBackend: InferenceBackendType;
    ollama: InferenceBackendStatus;
    webgpu: InferenceBackendStatus;
    webgpuModel: string | null;
  } {
    return {
      activeBackend: this._activeBackend,
      ollama: this.ollama.status,
      webgpu: this.webgpu.status,
      webgpuModel: this.webgpu.loadedModel,
    };
  }
}

// ============================================================
// 单例
// ============================================================

let _instance: InferenceEngine | null = null;

export function getInferenceEngine(): InferenceEngine {
  if (!_instance) {
    _instance = new InferenceEngine();
  }
  return _instance;
}

export function resetInferenceEngine(): void {
  if (_instance) {
    _instance.unloadAll();
    _instance = null;
  }
}
