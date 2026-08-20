/**
 * @file: performance-monitor.ts
 * @description: performance-monitor.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

// ============================================================
// Types
// ============================================================

export interface PerformanceMetrics {
  timestamp: number;
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercentage: number;
  };
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
  };
  resources: ResourceMetric[];
  network: {
    latency: number;
    bandwidth: number;
    requestsPending: number;
  };
  custom: Record<string, number>;
}

export interface ResourceMetric {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  level: "warning" | "critical";
  timestamp: number;
  message: string;
}

export interface PerformanceSnapshot {
  id: string;
  timestamp: number;
  duration: number;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  score: number;
}

export interface PerformanceConfig {
  collectIntervalMs: number;
  snapshotIntervalMs: number;
  maxSnapshots: number;
  maxAlerts: number;
  thresholds: PerformanceThreshold[];
  persistenceEnabled: boolean;
}

type AlertListener = (alert: PerformanceAlert) => void;
type MetricsListener = (metrics: PerformanceMetrics) => void;

// ============================================================
// Constants
// ============================================================

const DEFAULT_THRESHOLDS: PerformanceThreshold[] = [
  { metric: "fps", warning: 30, critical: 15 },
  { metric: "memory.usagePercentage", warning: 80, critical: 95 },
  { metric: "timing.timeToInteractive", warning: 3000, critical: 5000 },
  { metric: "network.latency", warning: 200, critical: 500 },
];

const DEFAULT_CONFIG: PerformanceConfig = {
  collectIntervalMs: 1000,
  snapshotIntervalMs: 60000,
  maxSnapshots: 60,
  maxAlerts: 100,
  thresholds: DEFAULT_THRESHOLDS,
  persistenceEnabled: true,
};

const STORAGE_KEY = "yyc3_performance_monitor";

// ============================================================
// Performance Monitor Class
// ============================================================

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private snapshots: PerformanceSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private alertListeners: Set<AlertListener> = new Set();
  private metricsListeners: Set<MetricsListener> = new Set();
  private collectTimer: ReturnType<typeof setInterval> | null = null;
  private snapshotTimer: ReturnType<typeof setInterval> | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 60;
  private isRunning: boolean = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  // ========== Public API ==========

  /**
   * 启动监控
   */
  start(): void {
    if (this.isRunning) {return;}

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.startFPSMonitor();
    this.startCollectTimer();
    this.startSnapshotTimer();
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isRunning = false;
    this.stopTimers();
  }

  /**
   * 获取当前指标
   */
  getCurrentMetrics(): PerformanceMetrics {
    return this.collectMetrics();
  }

  /**
   * 获取历史指标
   */
  getHistory(limit?: number): PerformanceMetrics[] {
    const history = [...this.metrics];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * 获取快照
   */
  getSnapshots(limit?: number): PerformanceSnapshot[] {
    const snapshots = [...this.snapshots];
    return limit ? snapshots.slice(-limit) : snapshots;
  }

  /**
   * 获取告警
   */
  getAlerts(limit?: number): PerformanceAlert[] {
    const alerts = [...this.alerts];
    return limit ? alerts.slice(-limit) : alerts;
  }

  /**
   * 创建快照
   */
  createSnapshot(): PerformanceSnapshot {
    const metrics = this.collectMetrics();
    const alerts = this.checkThresholds(metrics);
    const score = this.calculateScore(metrics);

    const snapshot: PerformanceSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      duration: this.config.snapshotIntervalMs,
      metrics,
      alerts,
      score,
    };

    this.snapshots.push(snapshot);

    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.config.maxSnapshots);
    }

    this.saveToStorage();
    return snapshot;
  }

  /**
   * 添加自定义指标
   */
  addCustomMetric(name: string, value: number): void {
    const metrics = this.collectMetrics();
    metrics.custom[name] = value;
    this.metrics.push(metrics);
  }

  /**
   * 订阅告警
   */
  onAlert(listener: AlertListener): () => void {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }

  /**
   * 订阅指标
   */
  onMetrics(listener: MetricsListener): () => void {
    this.metricsListeners.add(listener);
    return () => this.metricsListeners.delete(listener);
  }

  /**
   * 获取性能评分
   */
  getScore(): number {
    const metrics = this.collectMetrics();
    return this.calculateScore(metrics);
  }

  /**
   * 生成报告
   */
  generateReport(): PerformanceReport {
    const metrics = this.collectMetrics();
    const score = this.calculateScore(metrics);
    const alerts = this.getAlerts(10);
    const snapshots = this.getSnapshots(10);

    return {
      timestamp: Date.now(),
      score,
      metrics,
      alerts,
      snapshots,
      recommendations: this.generateRecommendations(metrics, alerts),
    };
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.metrics = [];
    this.alerts = [];
    this.saveToStorage();
  }

  /**
   * 更新阈值
   */
  updateThresholds(thresholds: PerformanceThreshold[]): void {
    this.config.thresholds = thresholds;
  }

  // ========== Private Methods ==========

  private startFPSMonitor(): void {
    const measureFPS = () => {
      if (!this.isRunning) {return;}

      this.frameCount++;
      const now = performance.now();
      const delta = now - this.lastFrameTime;

      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFrameTime = now;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private startCollectTimer(): void {
    this.collectTimer = setInterval(() => {
      const metrics = this.collectMetrics();
      this.metrics.push(metrics);

      // Keep last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Check thresholds
      const alerts = this.checkThresholds(metrics);
      for (const alert of alerts) {
        this.addAlert(alert);
      }

      // Notify listeners
      this.metricsListeners.forEach((listener) => {
        try {
          listener(metrics);
        } catch { /* ignore */ }
      });
    }, this.config.collectIntervalMs);
  }

  private startSnapshotTimer(): void {
    this.snapshotTimer = setInterval(() => {
      this.createSnapshot();
    }, this.config.snapshotIntervalMs);
  }

  private stopTimers(): void {
    if (this.collectTimer) {
      clearInterval(this.collectTimer);
      this.collectTimer = null;
    }
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = null;
    }
  }

  private collectMetrics(): PerformanceMetrics {
    const memory = this.getMemoryMetrics();
    const timing = this.getTimingMetrics();
    const resources = this.getResourceMetrics();
    const network = this.getNetworkMetrics();

    return {
      timestamp: Date.now(),
      fps: this.fps,
      memory,
      timing,
      resources,
      network,
      custom: {},
    };
  }

  private getMemoryMetrics(): PerformanceMetrics["memory"] {
    const performance_ = performance as unknown as {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (performance_.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance_.memory;
      return {
        usedJSHeapSize,
        totalJSHeapSize,
        jsHeapSizeLimit,
        usagePercentage: Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100),
      };
    }

    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      usagePercentage: 0,
    };
  }

  private getTimingMetrics(): PerformanceMetrics["timing"] {
    const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navEntry = entries[0];

    if (navEntry) {
      return {
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
        loadComplete: navEntry.loadEventEnd - navEntry.startTime,
        firstPaint: this.getPaintTime("first-paint"),
        firstContentfulPaint: this.getPaintTime("first-contentful-paint"),
        timeToInteractive: navEntry.domInteractive - navEntry.startTime,
      };
    }

    return {
      domContentLoaded: 0,
      loadComplete: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
    };
  }

  private getPaintTime(name: string): number {
    const entries = performance.getEntriesByName(name);
    const entry = entries[0] as PerformanceEntry;
    return entry ? entry.startTime : 0;
  }

  private getResourceMetrics(): ResourceMetric[] {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return entries.slice(-20).map((entry) => ({
      name: entry.name,
      type: entry.initiatorType,
      size: entry.transferSize || 0,
      duration: entry.duration,
      startTime: entry.startTime,
    }));
  }

  private getNetworkMetrics(): PerformanceMetrics["network"] {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const recentEntries = entries.slice(-10);

    let totalDuration = 0;
    let totalSize = 0;

    for (const entry of recentEntries) {
      totalDuration += entry.duration;
      totalSize += entry.transferSize || 0;
    }

    const avgLatency = recentEntries.length > 0 ? totalDuration / recentEntries.length : 0;
    const bandwidth = totalDuration > 0 ? (totalSize * 1000) / totalDuration : 0;

    return {
      latency: Math.round(avgLatency),
      bandwidth: Math.round(bandwidth),
      requestsPending: 0,
    };
  }

  private checkThresholds(metrics: PerformanceMetrics): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    for (const threshold of this.config.thresholds) {
      const value = this.getMetricValue(metrics, threshold.metric);

      if (value === null) {continue;}

      if (value >= threshold.critical) {
        alerts.push(this.createAlert(threshold.metric, value, threshold.critical, "critical"));
      } else if (value >= threshold.warning) {
        alerts.push(this.createAlert(threshold.metric, value, threshold.warning, "warning"));
      }
    }

    return alerts;
  }

  private getMetricValue(metrics: PerformanceMetrics, path: string): number | null {
    const parts = path.split(".");
    let value: unknown = metrics;

    for (const part of parts) {
      if (typeof value !== "object" || value === null) {
        return null;
      }
      value = (value as Record<string, unknown>)[part];
    }

    return typeof value === "number" ? value : null;
  }

  private createAlert(
    metric: string,
    value: number,
    threshold: number,
    level: "warning" | "critical"
  ): PerformanceAlert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      metric,
      value,
      threshold,
      level,
      timestamp: Date.now(),
      message: `${metric} is ${level}: ${value} (threshold: ${threshold})`,
    };
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(-this.config.maxAlerts);
    }

    this.alertListeners.forEach((listener) => {
      try {
        listener(alert);
      } catch { /* ignore */ }
    });
  }

  private calculateScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // FPS score (0-30 points)
    if (metrics.fps < 15) {
      score -= 30;
    } else if (metrics.fps < 30) {
      score -= 15;
    } else if (metrics.fps < 45) {
      score -= 5;
    }

    // Memory score (0-25 points)
    if (metrics.memory.usagePercentage > 95) {
      score -= 25;
    } else if (metrics.memory.usagePercentage > 80) {
      score -= 15;
    } else if (metrics.memory.usagePercentage > 60) {
      score -= 5;
    }

    // Timing score (0-25 points)
    if (metrics.timing.timeToInteractive > 5000) {
      score -= 25;
    } else if (metrics.timing.timeToInteractive > 3000) {
      score -= 15;
    } else if (metrics.timing.timeToInteractive > 1500) {
      score -= 5;
    }

    // Network score (0-20 points)
    if (metrics.network.latency > 500) {
      score -= 20;
    } else if (metrics.network.latency > 200) {
      score -= 10;
    } else if (metrics.network.latency > 100) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  private generateRecommendations(
    metrics: PerformanceMetrics,
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.fps < 30) {
      recommendations.push("考虑减少动画复杂度或使用 CSS transform 优化渲染");
    }

    if (metrics.memory.usagePercentage > 80) {
      recommendations.push("内存使用率过高，建议检查内存泄漏或优化数据缓存策略");
    }

    if (metrics.timing.timeToInteractive > 3000) {
      recommendations.push("页面交互时间过长，建议代码分割和懒加载优化");
    }

    if (metrics.network.latency > 200) {
      recommendations.push("网络延迟较高，建议启用数据压缩或使用 CDN 加速");
    }

    for (const alert of alerts) {
      if (alert.level === "critical") {
        recommendations.push(`[紧急] ${alert.metric} 需要立即处理`);
      }
    }

    return recommendations;
  }

  private loadFromStorage(): void {
    if (!this.config.persistenceEnabled) {return;}

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.snapshots) {
          this.snapshots = data.snapshots;
        }
        if (data.alerts) {
          this.alerts = data.alerts;
        }
      }
    } catch { /* ignore */ }
  }

  private saveToStorage(): void {
    if (!this.config.persistenceEnabled) {return;}

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        snapshots: this.snapshots.slice(-this.config.maxSnapshots),
        alerts: this.alerts.slice(-this.config.maxAlerts),
        lastSaved: Date.now(),
      }));
    } catch { /* ignore */ }
  }
}

// ============================================================
// Performance Report Interface
// ============================================================

export interface PerformanceReport {
  timestamp: number;
  score: number;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  snapshots: PerformanceSnapshot[];
  recommendations: string[];
}

// ============================================================
// Factory Function
// ============================================================

let instance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  if (!instance) {
    instance = new PerformanceMonitor(config);
  }
  return instance;
}

export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config);
}
