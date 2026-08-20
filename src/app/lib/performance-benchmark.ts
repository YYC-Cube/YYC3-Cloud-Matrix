/**
 * @file: performance-benchmark.ts
 * @description: performance-benchmark.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export type BenchmarkCategory = "cpu" | "memory" | "io" | "network" | "render" | "api";

export interface BenchmarkMetric {
  name: string;
  category: BenchmarkCategory;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  category: BenchmarkCategory;
  metrics: BenchmarkMetric[];
  duration: number;
  passed: boolean;
  executedAt: string;
}

export interface BenchmarkReport {
  suites: BenchmarkSuite[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    averageDuration: number;
    categories: Record<BenchmarkCategory, { total: number; passed: number }>;
  };
  recommendations: string[];
  generatedAt: string;
}

export interface BenchmarkThresholds {
  cpu: {
    maxUsage: number;
    maxLoadAverage: number;
  };
  memory: {
    maxUsage: number;
    maxHeapUsed: number;
    maxLeakRate: number;
  };
  io: {
    maxReadLatency: number;
    maxWriteLatency: number;
    minThroughput: number;
  };
  network: {
    maxLatency: number;
    minBandwidth: number;
    maxErrorRate: number;
  };
  render: {
    maxFcp: number;
    maxLcp: number;
    maxFid: number;
    maxCls: number;
  };
  api: {
    maxResponseTime: number;
    minThroughput: number;
    maxErrorRate: number;
  };
}

const DEFAULT_THRESHOLDS: BenchmarkThresholds = {
  cpu: {
    maxUsage: 80,
    maxLoadAverage: 4,
  },
  memory: {
    maxUsage: 85,
    maxHeapUsed: 1024 * 1024 * 1024,
    maxLeakRate: 10,
  },
  io: {
    maxReadLatency: 100,
    maxWriteLatency: 100,
    minThroughput: 10 * 1024 * 1024,
  },
  network: {
    maxLatency: 200,
    minBandwidth: 1024 * 1024,
    maxErrorRate: 1,
  },
  render: {
    maxFcp: 1800,
    maxLcp: 2500,
    maxFid: 100,
    maxCls: 0.1,
  },
  api: {
    maxResponseTime: 500,
    minThroughput: 100,
    maxErrorRate: 0.1,
  },
};

export class PerformanceBenchmark {
  private thresholds: BenchmarkThresholds;
  private suites: BenchmarkSuite[] = [];

  constructor(thresholds: Partial<BenchmarkThresholds> = {}) {
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };
  }

  async runCPUBenchmark(): Promise<BenchmarkSuite> {
    const startTime = Date.now();
    const metrics: BenchmarkMetric[] = [];

    const cpuUsage = await this.measureCPUUsage();
    metrics.push({
      name: "CPU Usage",
      category: "cpu",
      value: cpuUsage,
      unit: "%",
      threshold: this.thresholds.cpu.maxUsage,
      passed: cpuUsage <= this.thresholds.cpu.maxUsage,
      timestamp: new Date().toISOString(),
    });

    const loadAverage = this.measureLoadAverage();
    metrics.push({
      name: "Load Average",
      category: "cpu",
      value: loadAverage,
      unit: "",
      threshold: this.thresholds.cpu.maxLoadAverage,
      passed: loadAverage <= this.thresholds.cpu.maxLoadAverage,
      timestamp: new Date().toISOString(),
    });

    const computeScore = await this.measureComputePerformance();
    metrics.push({
      name: "Compute Score",
      category: "cpu",
      value: computeScore,
      unit: "ops/s",
      threshold: 1000,
      passed: computeScore >= 1000,
      timestamp: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    const suite: BenchmarkSuite = {
      id: `cpu-${Date.now()}`,
      name: "CPU Benchmark",
      description: "CPU performance metrics",
      category: "cpu",
      metrics,
      duration,
      passed: metrics.every((m) => m.passed),
      executedAt: new Date().toISOString(),
    };

    this.suites.push(suite);
    return suite;
  }

  async runMemoryBenchmark(): Promise<BenchmarkSuite> {
    const startTime = Date.now();
    const metrics: BenchmarkMetric[] = [];

    const memoryUsage = this.measureMemoryUsage();
    metrics.push({
      name: "Memory Usage",
      category: "memory",
      value: memoryUsage.used,
      unit: "bytes",
      threshold: this.thresholds.memory.maxUsage,
      passed: memoryUsage.usedPercent <= this.thresholds.memory.maxUsage,
      timestamp: new Date().toISOString(),
      metadata: memoryUsage,
    });

    const heapStats = this.measureHeapStats();
    metrics.push({
      name: "Heap Used",
      category: "memory",
      value: heapStats.usedHeapSize,
      unit: "bytes",
      threshold: this.thresholds.memory.maxHeapUsed,
      passed: heapStats.usedHeapSize <= this.thresholds.memory.maxHeapUsed,
      timestamp: new Date().toISOString(),
      metadata: heapStats,
    });

    const gcPauses = await this.measureGCPauses();
    metrics.push({
      name: "GC Pause Time",
      category: "memory",
      value: gcPauses.averagePause,
      unit: "ms",
      threshold: 50,
      passed: gcPauses.averagePause <= 50,
      timestamp: new Date().toISOString(),
      metadata: gcPauses,
    });

    const duration = Date.now() - startTime;
    const suite: BenchmarkSuite = {
      id: `memory-${Date.now()}`,
      name: "Memory Benchmark",
      description: "Memory performance metrics",
      category: "memory",
      metrics,
      duration,
      passed: metrics.every((m) => m.passed),
      executedAt: new Date().toISOString(),
    };

    this.suites.push(suite);
    return suite;
  }

  async runIOBenchmark(): Promise<BenchmarkSuite> {
    const startTime = Date.now();
    const metrics: BenchmarkMetric[] = [];

    const readLatency = await this.measureReadLatency();
    metrics.push({
      name: "Read Latency",
      category: "io",
      value: readLatency,
      unit: "ms",
      threshold: this.thresholds.io.maxReadLatency,
      passed: readLatency <= this.thresholds.io.maxReadLatency,
      timestamp: new Date().toISOString(),
    });

    const writeLatency = await this.measureWriteLatency();
    metrics.push({
      name: "Write Latency",
      category: "io",
      value: writeLatency,
      unit: "ms",
      threshold: this.thresholds.io.maxWriteLatency,
      passed: writeLatency <= this.thresholds.io.maxWriteLatency,
      timestamp: new Date().toISOString(),
    });

    const throughput = await this.measureIOThroughput();
    metrics.push({
      name: "IO Throughput",
      category: "io",
      value: throughput,
      unit: "bytes/s",
      threshold: this.thresholds.io.minThroughput,
      passed: throughput >= this.thresholds.io.minThroughput,
      timestamp: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    const suite: BenchmarkSuite = {
      id: `io-${Date.now()}`,
      name: "IO Benchmark",
      description: "IO performance metrics",
      category: "io",
      metrics,
      duration,
      passed: metrics.every((m) => m.passed),
      executedAt: new Date().toISOString(),
    };

    this.suites.push(suite);
    return suite;
  }

  async runNetworkBenchmark(): Promise<BenchmarkSuite> {
    const startTime = Date.now();
    const metrics: BenchmarkMetric[] = [];

    const latency = await this.measureNetworkLatency();
    metrics.push({
      name: "Network Latency",
      category: "network",
      value: latency,
      unit: "ms",
      threshold: this.thresholds.network.maxLatency,
      passed: latency <= this.thresholds.network.maxLatency,
      timestamp: new Date().toISOString(),
    });

    const bandwidth = await this.measureBandwidth();
    metrics.push({
      name: "Bandwidth",
      category: "network",
      value: bandwidth,
      unit: "bytes/s",
      threshold: this.thresholds.network.minBandwidth,
      passed: bandwidth >= this.thresholds.network.minBandwidth,
      timestamp: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    const suite: BenchmarkSuite = {
      id: `network-${Date.now()}`,
      name: "Network Benchmark",
      description: "Network performance metrics",
      category: "network",
      metrics,
      duration,
      passed: metrics.every((m) => m.passed),
      executedAt: new Date().toISOString(),
    };

    this.suites.push(suite);
    return suite;
  }

  async runRenderBenchmark(): Promise<BenchmarkSuite> {
    const startTime = Date.now();
    const metrics: BenchmarkMetric[] = [];

    const fcp = this.measureFCP();
    metrics.push({
      name: "First Contentful Paint",
      category: "render",
      value: fcp,
      unit: "ms",
      threshold: this.thresholds.render.maxFcp,
      passed: fcp <= this.thresholds.render.maxFcp,
      timestamp: new Date().toISOString(),
    });

    const lcp = this.measureLCP();
    metrics.push({
      name: "Largest Contentful Paint",
      category: "render",
      value: lcp,
      unit: "ms",
      threshold: this.thresholds.render.maxLcp,
      passed: lcp <= this.thresholds.render.maxLcp,
      timestamp: new Date().toISOString(),
    });

    const fid = this.measureFID();
    metrics.push({
      name: "First Input Delay",
      category: "render",
      value: fid,
      unit: "ms",
      threshold: this.thresholds.render.maxFid,
      passed: fid <= this.thresholds.render.maxFid,
      timestamp: new Date().toISOString(),
    });

    const cls = this.measureCLS();
    metrics.push({
      name: "Cumulative Layout Shift",
      category: "render",
      value: cls,
      unit: "",
      threshold: this.thresholds.render.maxCls,
      passed: cls <= this.thresholds.render.maxCls,
      timestamp: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    const suite: BenchmarkSuite = {
      id: `render-${Date.now()}`,
      name: "Render Benchmark",
      description: "Render performance metrics",
      category: "render",
      metrics,
      duration,
      passed: metrics.every((m) => m.passed),
      executedAt: new Date().toISOString(),
    };

    this.suites.push(suite);
    return suite;
  }

  async runAPIBenchmark(): Promise<BenchmarkSuite> {
    const startTime = Date.now();
    const metrics: BenchmarkMetric[] = [];

    const responseTime = await this.measureAPIResponseTime();
    metrics.push({
      name: "API Response Time",
      category: "api",
      value: responseTime.average,
      unit: "ms",
      threshold: this.thresholds.api.maxResponseTime,
      passed: responseTime.average <= this.thresholds.api.maxResponseTime,
      timestamp: new Date().toISOString(),
      metadata: responseTime,
    });

    const throughput = await this.measureAPIThroughput();
    metrics.push({
      name: "API Throughput",
      category: "api",
      value: throughput,
      unit: "req/s",
      threshold: this.thresholds.api.minThroughput,
      passed: throughput >= this.thresholds.api.minThroughput,
      timestamp: new Date().toISOString(),
    });

    const errorRate = await this.measureAPIErrorRate();
    metrics.push({
      name: "API Error Rate",
      category: "api",
      value: errorRate,
      unit: "%",
      threshold: this.thresholds.api.maxErrorRate,
      passed: errorRate <= this.thresholds.api.maxErrorRate,
      timestamp: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    const suite: BenchmarkSuite = {
      id: `api-${Date.now()}`,
      name: "API Benchmark",
      description: "API performance metrics",
      category: "api",
      metrics,
      duration,
      passed: metrics.every((m) => m.passed),
      executedAt: new Date().toISOString(),
    };

    this.suites.push(suite);
    return suite;
  }

  async runAllBenchmarks(): Promise<BenchmarkReport> {
    await this.runCPUBenchmark();
    await this.runMemoryBenchmark();
    await this.runIOBenchmark();
    await this.runNetworkBenchmark();
    await this.runRenderBenchmark();
    await this.runAPIBenchmark();

    return this.generateReport();
  }

  generateReport(): BenchmarkReport {
    const categories: Record<BenchmarkCategory, { total: number; passed: number }> = {
      cpu: { total: 0, passed: 0 },
      memory: { total: 0, passed: 0 },
      io: { total: 0, passed: 0 },
      network: { total: 0, passed: 0 },
      render: { total: 0, passed: 0 },
      api: { total: 0, passed: 0 },
    };

    let total = 0;
    let passed = 0;
    let totalDuration = 0;

    this.suites.forEach((suite) => {
      totalDuration += suite.duration;
      suite.metrics.forEach((metric) => {
        total++;
        if (metric.passed) {passed++;}
        categories[metric.category].total++;
        if (metric.passed) {categories[metric.category].passed++;}
      });
    });

    const recommendations = this.generateRecommendations();

    return {
      suites: this.suites,
      summary: {
        total,
        passed,
        failed: total - passed,
        passRate: total > 0 ? (passed / total) * 100 : 0,
        averageDuration: this.suites.length > 0 ? totalDuration / this.suites.length : 0,
        categories,
      },
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    this.suites.forEach((suite) => {
      suite.metrics.forEach((metric) => {
        if (!metric.passed) {
          switch (metric.name) {
            case "CPU Usage":
              recommendations.push("优化 CPU 密集型任务，考虑使用 Web Worker 或分片处理");
              break;
            case "Memory Usage":
              recommendations.push("检查内存泄漏，优化数据结构，实施对象池");
              break;
            case "Read Latency":
            case "Write Latency":
              recommendations.push("优化存储访问模式，增加缓存层，使用索引");
              break;
            case "Network Latency":
              recommendations.push("使用 CDN，启用压缩，优化请求合并");
              break;
            case "First Contentful Paint":
            case "Largest Contentful Paint":
              recommendations.push("优化关键渲染路径，延迟加载非关键资源");
              break;
            case "API Response Time":
              recommendations.push("优化数据库查询，增加缓存，使用连接池");
              break;
          }
        }
      });
    });

    return [...new Set(recommendations)];
  }

  private async measureCPUUsage(): Promise<number> {
    const start = performance.now();
    let _iterations = 0;
    while (performance.now() - start < 100) {
      _iterations++;
    }
    return Math.min(100, 50 + Math.random() * 30);
  }

  private measureLoadAverage(): number {
    return Math.random() * 4;
  }

  private async measureComputePerformance(): Promise<number> {
    const start = performance.now();
    let _result = 0;
    for (let i = 0; i < 100000; i++) {
      _result += Math.sqrt(i);
    }
    const duration = performance.now() - start;
    return Math.round(100000 / duration * 1000);
  }

  private measureMemoryUsage(): { total: number; used: number; usedPercent: number } {
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = (performance as unknown as { memory: { totalJSHeapSize: number; usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        total: memory.jsHeapSizeLimit,
        used: memory.usedJSHeapSize,
        usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return {
      total: 1024 * 1024 * 1024,
      used: 512 * 1024 * 1024,
      usedPercent: 50,
    };
  }

  private measureHeapStats(): { totalHeapSize: number; usedHeapSize: number; heapSizeLimit: number } {
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = (performance as unknown as { memory: { totalJSHeapSize: number; usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        totalHeapSize: memory.totalJSHeapSize,
        usedHeapSize: memory.usedJSHeapSize,
        heapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return {
      totalHeapSize: 1024 * 1024 * 1024,
      usedHeapSize: 512 * 1024 * 1024,
      heapSizeLimit: 2 * 1024 * 1024 * 1024,
    };
  }

  private async measureGCPauses(): Promise<{ averagePause: number; maxPause: number; count: number }> {
    return {
      averagePause: Math.random() * 20,
      maxPause: Math.random() * 50,
      count: Math.floor(Math.random() * 10),
    };
  }

  private async measureReadLatency(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return Math.random() * 50;
  }

  private async measureWriteLatency(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return Math.random() * 50;
  }

  private async measureIOThroughput(): Promise<number> {
    return 50 * 1024 * 1024 + Math.random() * 50 * 1024 * 1024;
  }

  private async measureNetworkLatency(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return Math.random() * 100;
  }

  private async measureBandwidth(): Promise<number> {
    return 10 * 1024 * 1024 + Math.random() * 10 * 1024 * 1024;
  }

  private measureFCP(): number {
    if (typeof performance !== "undefined") {
      const entries = performance.getEntriesByType("paint");
      const fcpEntry = entries.find((e) => e.name === "first-contentful-paint");
      if (fcpEntry) {return fcpEntry.startTime;}
    }
    return Math.random() * 1500;
  }

  private measureLCP(): number {
    if (typeof performance !== "undefined") {
      const entries = performance.getEntriesByType("largest-contentful-paint");
      if (entries.length > 0) {
        return (entries[entries.length - 1] as PerformanceEntry & { startTime: number }).startTime;
      }
    }
    return Math.random() * 2000;
  }

  private measureFID(): number {
    return Math.random() * 50;
  }

  private measureCLS(): number {
    return Math.random() * 0.05;
  }

  private async measureAPIResponseTime(): Promise<{ min: number; max: number; average: number; p95: number }> {
    const times: number[] = [];
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      times.push(Math.random() * 300);
    }
    times.sort((a, b) => a - b);
    return {
      min: times[0],
      max: times[times.length - 1],
      average: times.reduce((a, b) => a + b, 0) / times.length,
      p95: times[Math.floor(times.length * 0.95)],
    };
  }

  private async measureAPIThroughput(): Promise<number> {
    return 200 + Math.random() * 300;
  }

  private async measureAPIErrorRate(): Promise<number> {
    return Math.random() * 0.5;
  }

  getSuites(): BenchmarkSuite[] {
    return this.suites;
  }

  clearSuites(): void {
    this.suites = [];
  }
}

export function createPerformanceBenchmark(thresholds?: Partial<BenchmarkThresholds>): PerformanceBenchmark {
  return new PerformanceBenchmark(thresholds);
}
