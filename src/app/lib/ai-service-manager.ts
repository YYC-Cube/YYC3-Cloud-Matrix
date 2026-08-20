/**
 * @file: ai-service-manager.ts
 * @description: ai-service-manager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import type { ConfiguredModel, SDKChatResponse, ChatRole } from "../types";

// ============================================================
// Types
// ============================================================

export interface AIRequest {
  id: string;
  model: ConfiguredModel;
  messages: Array<{ role: ChatRole; content: string }>;
  priority: "high" | "normal" | "low";
  temperature: number;
  maxTokens?: number;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
  createdAt: number;
}

export interface AIRequestResult {
  requestId: string;
  response: SDKChatResponse;
  cached: boolean;
  retries: number;
}

export interface AIServiceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cachedResponses: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  currentQueueSize: number;
  activeRequests: number;
}

export interface AIServiceConfig {
  maxConcurrent: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  cacheEnabled: boolean;
  cacheTTLMs: number;
  timeoutMs: number;
}

export interface CacheEntry {
  key: string;
  response: SDKChatResponse;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

type RequestStatus = "pending" | "running" | "completed" | "failed";

interface QueuedRequest extends AIRequest {
  status: RequestStatus;
  resolve: (result: AIRequestResult) => void;
  reject: (error: Error) => void;
  retries: number;
  startTime?: number;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_CONFIG: AIServiceConfig = {
  maxConcurrent: 3,
  maxRetries: 3,
  retryBaseDelayMs: 1000,
  retryMaxDelayMs: 30000,
  cacheEnabled: true,
  cacheTTLMs: 5 * 60 * 1000,
  timeoutMs: 60000,
};

const STATS_KEY = "yyc3_ai_service_stats";
const CACHE_KEY = "yyc3_ai_response_cache";

// ============================================================
// Utility Functions
// ============================================================

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateCacheKey(model: ConfiguredModel, messages: Array<{ role: ChatRole; content: string }>): string {
  const content = messages.map((m) => `${m.role}:${m.content}`).join("|");
  const hash = btoa(content).slice(0, 32);
  return `${model.providerId}:${model.model}:${hash}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

// ============================================================
// AI Service Manager Class
// ============================================================

export class AIServiceManager {
  private config: AIServiceConfig;
  private queue: QueuedRequest[] = [];
  private activeRequests: Map<string, QueuedRequest> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private latencies: number[] = [];
  private stats: AIServiceStats;
  private processing: boolean = false;

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = this.loadStats();
    this.loadCache();
    this.startCacheCleanup();
  }

  // ========== Public API ==========

  /**
   * 发送 AI 请求
   */
  async sendRequest(request: Omit<AIRequest, "id" | "createdAt">): Promise<AIRequestResult> {
    const fullRequest: AIRequest = {
      ...request,
      id: genId(),
      createdAt: Date.now(),
    };

    // Check cache first
    if (this.config.cacheEnabled && !request.onChunk) {
      const cacheKey = generateCacheKey(request.model, request.messages);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.stats.cachedResponses++;
        this.saveStats();
        return {
          requestId: fullRequest.id,
          response: cached,
          cached: true,
          retries: 0,
        };
      }
    }

    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        ...fullRequest,
        status: "pending",
        resolve,
        reject,
        retries: 0,
      };

      // Insert by priority
      this.insertByPriority(queuedRequest);
      this.stats.totalRequests++;
      this.stats.currentQueueSize = this.queue.length;
      this.saveStats();
      this.processQueue();
    });
  }

  /**
   * 获取服务统计
   */
  getStats(): AIServiceStats {
    return {
      ...this.stats,
      currentQueueSize: this.queue.length,
      activeRequests: this.activeRequests.size,
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.saveCache();
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 取消请求
   */
  cancelRequest(requestId: string): boolean {
    const index = this.queue.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      const request = this.queue.splice(index, 1)[0];
      request.status = "failed";
      request.reject(new Error("Request cancelled"));
      this.stats.currentQueueSize = this.queue.length;
      this.saveStats();
      return true;
    }
    return false;
  }

  // ========== Private Methods ==========

  private insertByPriority(request: QueuedRequest): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const requestPriority = priorityOrder[request.priority];

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder[this.queue[i].priority];
      if (requestPriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, request);
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {return;}
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests.size < this.config.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) {break;}

      if (request.signal?.aborted) {
        request.reject(new Error("Request aborted"));
        continue;
      }

      this.activeRequests.set(request.id, request);
      request.status = "running";
      request.startTime = Date.now();

      this.executeRequest(request).finally(() => {
        this.activeRequests.delete(request.id);
        this.stats.currentQueueSize = this.queue.length;
        this.saveStats();
        this.processQueue();
      });
    }

    this.processing = false;
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.callAPI(request, attempt);

        // Cache successful response
        if (this.config.cacheEnabled && !request.onChunk) {
          const cacheKey = generateCacheKey(request.model, request.messages);
          this.addToCache(cacheKey, response);
        }

        // Update stats
        this.stats.successfulRequests++;
        this.recordLatency(Date.now() - (request.startTime || Date.now()));

        request.status = "completed";
        request.resolve({
          requestId: request.id,
          response,
          cached: false,
          retries: attempt,
        });
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries && this.shouldRetry(lastError)) {
          const delay = calculateBackoff(attempt, this.config.retryBaseDelayMs, this.config.retryMaxDelayMs);
          await sleep(delay);
          request.retries++;
        }
      }
    }

    // All retries failed
    this.stats.failedRequests++;
    request.status = "failed";
    request.reject(lastError || new Error("Request failed after retries"));
  }

  private async callAPI(request: QueuedRequest, _attempt: number): Promise<SDKChatResponse> {
    const { model, messages, temperature, maxTokens, onChunk, signal } = request;

    const url = this.buildChatUrl(model);
    const headers = this.buildHeaders(model);
    const body = this.buildRequestBody(model, messages, !!onChunk, temperature, maxTokens);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const combinedSignal = signal
      ? this.combineSignals([controller.signal, signal])
      : controller.signal;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${res.statusText}`);
      }

      if (onChunk && res.body) {
        return await this.handleStreamResponse(res, model, onChunk);
      }

      return await this.handleNormalResponse(res, model);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener("abort", () => controller.abort());
    }

    return controller.signal;
  }

  private async handleNormalResponse(res: Response, model: ConfiguredModel): Promise<SDKChatResponse> {
    const data = await res.json();
    const startTime = Date.now();

    const content = model.providerId === "ollama"
      ? data.message?.content ?? ""
      : data.choices?.[0]?.message?.content ?? "";

    const usage = model.providerId === "ollama"
      ? {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        }
      : {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        };

    return {
      id: data.id ?? genId(),
      model: model.model,
      content,
      finishReason: data.choices?.[0]?.finish_reason ?? "stop",
      usage,
      latencyMs: Date.now() - startTime,
    };
  }

  private async handleStreamResponse(
    res: Response,
    model: ConfiguredModel,
    onChunk: (chunk: string) => void,
  ): Promise<SDKChatResponse> {
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {break;}

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {continue;}
          try {
            const chunk = JSON.parse(data);
            const delta = model.providerId === "ollama"
              ? chunk.message?.content ?? ""
              : chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              fullContent += delta;
              onChunk(delta);
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    }

    return {
      id: genId(),
      model: model.model,
      content: fullContent,
      finishReason: "stop",
      usage: {
        promptTokens: 0,
        completionTokens: fullContent.length,
        totalTokens: fullContent.length,
      },
      latencyMs: Date.now() - startTime,
    };
  }

  private buildHeaders(model: ConfiguredModel): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (model.providerId !== "ollama") {
      headers["Authorization"] = `Bearer ${model.apiKey}`;
    }

    return headers;
  }

  private buildChatUrl(model: ConfiguredModel): string {
    if (model.providerId === "ollama") {
      return model.baseUrl.replace(/\/$/, "") + "/api/chat";
    }

    const base = model.baseUrl.replace(/\/$/, "");
    const endpoint = `${base}/chat/completions`;

    if (model.proxyUrl) {
      const proxy = model.proxyUrl.replace(/\/$/, "");
      return `${proxy}/${endpoint}`;
    }

    return endpoint;
  }

  private buildRequestBody(
    model: ConfiguredModel,
    messages: Array<{ role: ChatRole; content: string }>,
    stream: boolean,
    temperature: number,
    maxTokens?: number,
  ): Record<string, unknown> {
    if (model.providerId === "ollama") {
      return {
        model: model.model,
        messages,
        stream,
      };
    }

    return {
      model: model.model,
      messages,
      temperature,
      stream,
      ...(maxTokens && { max_tokens: maxTokens }),
    };
  }

  private shouldRetry(error: Error): boolean {
    const retryableMessages = [
      "rate limit",
      "timeout",
      "network",
      "ECONNRESET",
      "ENOTFOUND",
      "502",
      "503",
      "504",
    ];

    const message = error.message.toLowerCase();
    return retryableMessages.some((msg) => message.includes(msg.toLowerCase()));
  }

  // ========== Cache Management ==========

  private getFromCache(key: string): SDKChatResponse | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    this.saveCache();
    return entry.response;
  }

  private addToCache(key: string, response: SDKChatResponse): void {
    const now = Date.now();
    const entry: CacheEntry = {
      key,
      response,
      createdAt: now,
      expiresAt: now + this.config.cacheTTLMs,
      hits: 0,
    };

    this.cache.set(key, entry);
    this.saveCache();
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
      this.saveCache();
    }, 60000);
  }

  // ========== Stats Management ==========

  private recordLatency(latencyMs: number): void {
    this.latencies.push(latencyMs);
    if (this.latencies.length > 1000) {
      this.latencies = this.latencies.slice(-1000);
    }

    this.stats.avgLatencyMs = this.calculateAverage(this.latencies);
    this.stats.p95LatencyMs = this.calculatePercentile(this.latencies, 95);
    this.stats.p99LatencyMs = this.calculatePercentile(this.latencies, 99);

    this.saveStats();
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) {return 0;}
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) {return 0;}
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private loadStats(): AIServiceStats {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch { /* ignore */ }

    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedResponses: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      currentQueueSize: 0,
      activeRequests: 0,
    };
  }

  private saveStats(): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch { /* ignore */ }
  }

  private loadCache(): void {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const entries = JSON.parse(raw) as CacheEntry[];
        const now = Date.now();
        for (const entry of entries) {
          if (now <= entry.expiresAt) {
            this.cache.set(entry.key, entry);
          }
        }
      }
    } catch { /* ignore */ }
  }

  private saveCache(): void {
    try {
      const entries = Array.from(this.cache.values());
      localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    } catch { /* ignore */ }
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: AIServiceManager | null = null;

export function getAIServiceManager(config?: Partial<AIServiceConfig>): AIServiceManager {
  if (!instance) {
    instance = new AIServiceManager(config);
  }
  return instance;
}

export function resetAIServiceManager(): void {
  instance = null;
}
