/**
 * @file: data-flow-pipeline.ts
 * @description: data-flow-pipeline.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import type { NodeData, ThroughputPoint, AlertData } from "../types";

// ============================================================
// Types
// ============================================================

export type DataFlowStatus = "idle" | "processing" | "error";

export interface DataFlowMetrics {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  avgProcessingTimeMs: number;
  lastProcessedAt: number | null;
}

export interface DataFlowConfig {
  cacheEnabled: boolean;
  cacheTTLMs: number;
  validateEnabled: boolean;
  transformEnabled: boolean;
  aggregateEnabled: boolean;
}

export interface PipelineStage<TInput, TOutput> {
  name: string;
  process: (input: TInput) => TOutput | Promise<TOutput>;
  onError?: (error: Error, input: TInput) => TOutput;
}

export interface DataCacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

// ============================================================
// Data Validator
// ============================================================

export class DataValidator {
  static validateNodeData(data: unknown): data is NodeData {
    if (!data || typeof data !== "object") {return false;}
    const node = data as Partial<NodeData>;
    return (
      typeof node.id === "string" &&
      typeof node.gpu === "number" &&
      typeof node.mem === "number" &&
      typeof node.temp === "number"
    );
  }

  static validateThroughputPoint(data: unknown): data is ThroughputPoint {
    if (!data || typeof data !== "object") {return false;}
    const point = data as Partial<ThroughputPoint>;
    return (
      typeof point.time === "string" &&
      typeof point.qps === "number" &&
      typeof point.latency === "number"
    );
  }

  static validateAlertData(data: unknown): data is AlertData {
    if (!data || typeof data !== "object") {return false;}
    const alert = data as Partial<AlertData>;
    return (
      typeof alert.id === "string" &&
      typeof alert.level === "string" &&
      typeof alert.message === "string"
    );
  }

  static sanitizeNodeData(data: Partial<NodeData>): NodeData {
    return {
      id: data.id || `node-${Date.now()}`,
      gpu: Math.max(0, Math.min(100, data.gpu || 0)),
      mem: Math.max(0, Math.min(100, data.mem || 0)),
      temp: Math.max(0, Math.min(150, data.temp || 0)),
      tasks: Math.max(0, data.tasks || 0),
      model: data.model || "",
      status: data.status || "inactive",
    };
  }
}

// ============================================================
// Data Transformer
// ============================================================

export class DataTransformer {
  static transformNodeToMetric(node: NodeData): NodeMetric {
    return {
      nodeId: node.id,
      gpuUtilization: node.gpu,
      memoryUtilization: node.mem,
      temperature: node.temp,
      activeTasks: node.tasks,
      status: node.status,
      healthScore: this.calculateHealthScore(node),
      timestamp: Date.now(),
    };
  }

  static calculateHealthScore(node: NodeData): number {
    let score = 100;

    // GPU 利用率惩罚
    if (node.gpu > 90) {score -= 20;}
    else if (node.gpu > 80) {score -= 10;}

    // 内存利用率惩罚
    if (node.mem > 90) {score -= 15;}
    else if (node.mem > 80) {score -= 8;}

    // 温度惩罚
    if (node.temp > 85) {score -= 25;}
    else if (node.temp > 75) {score -= 12;}

    // 状态惩罚
    if (node.status === "inactive") {score -= 50;}
    else if (node.status === "warning") {score -= 30;}

    return Math.max(0, score);
  }

  static aggregateThroughputPoints(
    points: ThroughputPoint[],
    intervalMs: number
  ): ThroughputPoint[] {
    if (points.length === 0) {return [];}

    const aggregated: ThroughputPoint[] = [];
    const interval = intervalMs / 1000;

    for (let i = 0; i < points.length; i += interval) {
      const batch = points.slice(i, i + interval);
      if (batch.length === 0) {continue;}

      const avgQps = Math.round(
        batch.reduce((sum, p) => sum + p.qps, 0) / batch.length
      );
      const avgLatency = Math.round(
        batch.reduce((sum, p) => sum + p.latency, 0) / batch.length
      );
      const avgTokens = Math.round(
        batch.reduce((sum, p) => sum + (p.tokens || 0), 0) / batch.length
      );

      aggregated.push({
        time: batch[0].time,
        qps: avgQps,
        latency: avgLatency,
        tokens: avgTokens,
      });
    }

    return aggregated;
  }
}

// ============================================================
// Data Aggregator
// ============================================================

export class DataAggregator {
  static aggregateNodeMetrics(nodes: NodeData[]): AggregatedNodeStats {
    const activeNodes = nodes.filter((n) => n.status !== "inactive");
    const totalNodes = nodes.length;
    const activeCount = activeNodes.length;

    const avgGpu = activeCount > 0
      ? activeNodes.reduce((sum, n) => sum + n.gpu, 0) / activeCount
      : 0;

    const avgMem = activeCount > 0
      ? activeNodes.reduce((sum, n) => sum + n.mem, 0) / activeCount
      : 0;

    const avgTemp = activeCount > 0
      ? activeNodes.reduce((sum, n) => sum + n.temp, 0) / activeCount
      : 0;

    const totalTasks = activeNodes.reduce((sum, n) => sum + n.tasks, 0);

    const healthyCount = activeNodes.filter((n) => {
      const score = DataTransformer.calculateHealthScore(n);
      return score >= 70;
    }).length;

    return {
      totalNodes,
      activeCount,
      inactiveCount: totalNodes - activeCount,
      healthyCount,
      unhealthyCount: activeCount - healthyCount,
      avgGpuUtilization: Math.round(avgGpu * 10) / 10,
      avgMemoryUtilization: Math.round(avgMem * 10) / 10,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      totalActiveTasks: totalTasks,
      healthPercentage: totalNodes > 0 ? Math.round((healthyCount / totalNodes) * 100) : 0,
      timestamp: Date.now(),
    };
  }

  static aggregateAlerts(alerts: AlertData[], windowMs: number): AggregatedAlertStats {
    const now = Date.now();
    const windowStart = now - windowMs;
    const recentAlerts = alerts.filter((a) => (a.timestamp || 0) >= windowStart);

    const byLevel: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const alert of recentAlerts) {
      byLevel[alert.level] = (byLevel[alert.level] || 0) + 1;
      if (alert.source) {
        bySource[alert.source] = (bySource[alert.source] || 0) + 1;
      }
    }

    return {
      totalAlerts: recentAlerts.length,
      criticalCount: byLevel["critical"] || 0,
      warningCount: byLevel["warning"] || 0,
      infoCount: byLevel["info"] || 0,
      byLevel,
      bySource,
      windowMs,
      timestamp: now,
    };
  }

  static calculateThroughputTrend(
    history: ThroughputPoint[],
    windowSize: number = 10
  ): ThroughputTrend {
    if (history.length < 2) {
      return {
        direction: "stable",
        percentage: 0,
        qpsChange: 0,
        latencyChange: 0,
      };
    }

    const recent = history.slice(-windowSize);
    const previous = history.slice(-windowSize * 2, -windowSize);

    if (previous.length === 0) {
      return {
        direction: "stable",
        percentage: 0,
        qpsChange: 0,
        latencyChange: 0,
      };
    }

    const avgRecentQps = recent.reduce((sum, p) => sum + p.qps, 0) / recent.length;
    const avgPreviousQps = previous.reduce((sum, p) => sum + p.qps, 0) / previous.length;
    const qpsChange = avgRecentQps - avgPreviousQps;
    const qpsPercentage = (qpsChange / avgPreviousQps) * 100;

    const avgRecentLatency = recent.reduce((sum, p) => sum + p.latency, 0) / recent.length;
    const avgPreviousLatency = previous.reduce((sum, p) => sum + p.latency, 0) / previous.length;
    const latencyChange = avgRecentLatency - avgPreviousLatency;

    let direction: "up" | "down" | "stable" = "stable";
    if (Math.abs(qpsPercentage) > 5) {
      direction = qpsPercentage > 0 ? "up" : "down";
    }

    return {
      direction,
      percentage: Math.round(qpsPercentage * 10) / 10,
      qpsChange: Math.round(qpsChange),
      latencyChange: Math.round(latencyChange * 10) / 10,
    };
  }
}

// ============================================================
// Data Cache
// ============================================================

export class DataCache<T> {
  private cache: Map<string, DataCacheEntry<T>> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number = 60000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const now = Date.now();
    const entry: DataCacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt: now + (ttlMs || this.ttlMs),
      hits: 0,
    };
    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {return false;}
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }

  getStats(): CacheStats {
    let totalHits = 0;
    let totalEntries = 0;

    for (const entry of this.cache.values()) {
      totalEntries++;
      totalHits += entry.hits;
    }

    return {
      entries: totalEntries,
      totalHits,
      avgHits: totalEntries > 0 ? totalHits / totalEntries : 0,
    };
  }
}

// ============================================================
// Data Flow Pipeline
// ============================================================

export class DataFlowPipeline<TInput, TOutput> {
  private stages: PipelineStage<unknown, unknown>[] = [];
  private config: DataFlowConfig;
  private cache: DataCache<TOutput>;
  private metrics: DataFlowMetrics = {
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    avgProcessingTimeMs: 0,
    lastProcessedAt: null,
  };
  private processingTimes: number[] = [];

  constructor(config: Partial<DataFlowConfig> = {}) {
    this.config = {
      cacheEnabled: config.cacheEnabled ?? true,
      cacheTTLMs: config.cacheTTLMs ?? 60000,
      validateEnabled: config.validateEnabled ?? true,
      transformEnabled: config.transformEnabled ?? true,
      aggregateEnabled: config.aggregateEnabled ?? true,
    };
    this.cache = new DataCache<TOutput>(this.config.cacheTTLMs);
  }

  addStage<TIntermediate>(
    stage: PipelineStage<TInput, TIntermediate>
  ): DataFlowPipeline<TIntermediate, TOutput> {
    this.stages.push(stage as PipelineStage<unknown, unknown>);
    return this as unknown as DataFlowPipeline<TIntermediate, TOutput>;
  }

  async process(input: TInput, cacheKey?: string): Promise<TOutput> {
    const startTime = Date.now();

    // Check cache
    if (this.config.cacheEnabled && cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    let current: unknown = input;

    try {
      for (const stage of this.stages) {
        try {
          current = await stage.process(current);
        } catch (error) {
          if (stage.onError) {
            current = stage.onError(error instanceof Error ? error : new Error(String(error)), current);
          } else {
            throw error;
          }
        }
      }

      const output = current as TOutput;

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, true);

      // Cache result
      if (this.config.cacheEnabled && cacheKey) {
        this.cache.set(cacheKey, output);
      }

      return output;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, false);
      throw error;
    }
  }

  private updateMetrics(processingTime: number, success: boolean): void {
    this.metrics.totalProcessed++;
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    this.processingTimes.push(processingTime);
    if (this.processingTimes.length > 100) {
      this.processingTimes = this.processingTimes.slice(-100);
    }

    this.metrics.avgProcessingTimeMs =
      this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    this.metrics.lastProcessedAt = Date.now();
  }

  getMetrics(): DataFlowMetrics {
    return { ...this.metrics };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================
// Additional Types
// ============================================================

export interface NodeMetric {
  nodeId: string;
  gpuUtilization: number;
  memoryUtilization: number;
  temperature: number;
  activeTasks: number;
  status: string;
  healthScore: number;
  timestamp: number;
}

export interface AggregatedNodeStats {
  totalNodes: number;
  activeCount: number;
  inactiveCount: number;
  healthyCount: number;
  unhealthyCount: number;
  avgGpuUtilization: number;
  avgMemoryUtilization: number;
  avgTemperature: number;
  totalActiveTasks: number;
  healthPercentage: number;
  timestamp: number;
}

export interface AggregatedAlertStats {
  totalAlerts: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  windowMs: number;
  timestamp: number;
}

export interface ThroughputTrend {
  direction: "up" | "down" | "stable";
  percentage: number;
  qpsChange: number;
  latencyChange: number;
}

export interface CacheStats {
  entries: number;
  totalHits: number;
  avgHits: number;
}
