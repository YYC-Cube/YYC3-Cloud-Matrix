/**
 * @file: performance-benchmark.test.ts
 * @description: performance-benchmark.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  PerformanceBenchmark,
  createPerformanceBenchmark,
  type BenchmarkThresholds,
} from "../../lib/performance-benchmark";

describe("PerformanceBenchmark", () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = createPerformanceBenchmark();
  });

  describe("constructor", () => {
    it("should initialize with default thresholds", () => {
      const bm = createPerformanceBenchmark();
      expect(bm).toBeInstanceOf(PerformanceBenchmark);
    });

    it("should accept custom thresholds", () => {
      const customThresholds: Partial<BenchmarkThresholds> = {
        cpu: {
          maxUsage: 90,
          maxLoadAverage: 8,
        },
      };
      const bm = createPerformanceBenchmark(customThresholds);
      expect(bm).toBeInstanceOf(PerformanceBenchmark);
    });
  });

  describe("runCPUBenchmark", () => {
    it("should run CPU benchmark and return suite", async () => {
      const suite = await benchmark.runCPUBenchmark();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("CPU Benchmark");
      expect(suite.category).toBe("cpu");
      expect(suite.metrics.length).toBeGreaterThan(0);
      expect(suite.duration).toBeGreaterThanOrEqual(0);
      expect(suite.executedAt).toBeDefined();
    });

    it("should include CPU usage metric", async () => {
      const suite = await benchmark.runCPUBenchmark();
      const cpuUsage = suite.metrics.find((m) => m.name === "CPU Usage");

      expect(cpuUsage).toBeDefined();
      expect(cpuUsage?.category).toBe("cpu");
      expect(cpuUsage?.unit).toBe("%");
      expect(cpuUsage?.value).toBeGreaterThanOrEqual(0);
      expect(cpuUsage?.threshold).toBeDefined();
    });

    it("should include load average metric", async () => {
      const suite = await benchmark.runCPUBenchmark();
      const loadAvg = suite.metrics.find((m) => m.name === "Load Average");

      expect(loadAvg).toBeDefined();
      expect(loadAvg?.category).toBe("cpu");
    });

    it("should include compute score metric", async () => {
      const suite = await benchmark.runCPUBenchmark();
      const computeScore = suite.metrics.find((m) => m.name === "Compute Score");

      expect(computeScore).toBeDefined();
      expect(computeScore?.unit).toBe("ops/s");
    });
  });

  describe("runMemoryBenchmark", () => {
    it("should run memory benchmark and return suite", async () => {
      const suite = await benchmark.runMemoryBenchmark();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Memory Benchmark");
      expect(suite.category).toBe("memory");
      expect(suite.metrics.length).toBeGreaterThan(0);
    });

    it("should include memory usage metric", async () => {
      const suite = await benchmark.runMemoryBenchmark();
      const memUsage = suite.metrics.find((m) => m.name === "Memory Usage");

      expect(memUsage).toBeDefined();
      expect(memUsage?.category).toBe("memory");
      expect(memUsage?.unit).toBe("bytes");
      expect(memUsage?.metadata).toBeDefined();
    });

    it("should include heap stats metric", async () => {
      const suite = await benchmark.runMemoryBenchmark();
      const heapUsed = suite.metrics.find((m) => m.name === "Heap Used");

      expect(heapUsed).toBeDefined();
      expect(heapUsed?.category).toBe("memory");
    });

    it("should include GC pause metric", async () => {
      const suite = await benchmark.runMemoryBenchmark();
      const gcPause = suite.metrics.find((m) => m.name === "GC Pause Time");

      expect(gcPause).toBeDefined();
      expect(gcPause?.unit).toBe("ms");
    });
  });

  describe("runIOBenchmark", () => {
    it("should run IO benchmark and return suite", async () => {
      const suite = await benchmark.runIOBenchmark();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("IO Benchmark");
      expect(suite.category).toBe("io");
      expect(suite.metrics.length).toBeGreaterThan(0);
    });

    it("should include read latency metric", async () => {
      const suite = await benchmark.runIOBenchmark();
      const readLatency = suite.metrics.find((m) => m.name === "Read Latency");

      expect(readLatency).toBeDefined();
      expect(readLatency?.unit).toBe("ms");
    });

    it("should include write latency metric", async () => {
      const suite = await benchmark.runIOBenchmark();
      const writeLatency = suite.metrics.find((m) => m.name === "Write Latency");

      expect(writeLatency).toBeDefined();
      expect(writeLatency?.unit).toBe("ms");
    });

    it("should include throughput metric", async () => {
      const suite = await benchmark.runIOBenchmark();
      const throughput = suite.metrics.find((m) => m.name === "IO Throughput");

      expect(throughput).toBeDefined();
      expect(throughput?.unit).toBe("bytes/s");
    });
  });

  describe("runNetworkBenchmark", () => {
    it("should run network benchmark and return suite", async () => {
      const suite = await benchmark.runNetworkBenchmark();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Network Benchmark");
      expect(suite.category).toBe("network");
      expect(suite.metrics.length).toBeGreaterThan(0);
    });

    it("should include network latency metric", async () => {
      const suite = await benchmark.runNetworkBenchmark();
      const latency = suite.metrics.find((m) => m.name === "Network Latency");

      expect(latency).toBeDefined();
      expect(latency?.unit).toBe("ms");
    });

    it("should include bandwidth metric", async () => {
      const suite = await benchmark.runNetworkBenchmark();
      const bandwidth = suite.metrics.find((m) => m.name === "Bandwidth");

      expect(bandwidth).toBeDefined();
      expect(bandwidth?.unit).toBe("bytes/s");
    });
  });

  describe("runRenderBenchmark", () => {
    it("should run render benchmark and return suite", async () => {
      const suite = await benchmark.runRenderBenchmark();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Render Benchmark");
      expect(suite.category).toBe("render");
      expect(suite.metrics.length).toBeGreaterThan(0);
    });

    it("should include FCP metric", async () => {
      const suite = await benchmark.runRenderBenchmark();
      const fcp = suite.metrics.find((m) => m.name === "First Contentful Paint");

      expect(fcp).toBeDefined();
      expect(fcp?.unit).toBe("ms");
    });

    it("should include LCP metric", async () => {
      const suite = await benchmark.runRenderBenchmark();
      const lcp = suite.metrics.find((m) => m.name === "Largest Contentful Paint");

      expect(lcp).toBeDefined();
      expect(lcp?.unit).toBe("ms");
    });

    it("should include FID metric", async () => {
      const suite = await benchmark.runRenderBenchmark();
      const fid = suite.metrics.find((m) => m.name === "First Input Delay");

      expect(fid).toBeDefined();
      expect(fid?.unit).toBe("ms");
    });

    it("should include CLS metric", async () => {
      const suite = await benchmark.runRenderBenchmark();
      const cls = suite.metrics.find((m) => m.name === "Cumulative Layout Shift");

      expect(cls).toBeDefined();
    });
  });

  describe("runAPIBenchmark", () => {
    it("should run API benchmark and return suite", async () => {
      const suite = await benchmark.runAPIBenchmark();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("API Benchmark");
      expect(suite.category).toBe("api");
      expect(suite.metrics.length).toBeGreaterThan(0);
    });

    it("should include response time metric", async () => {
      const suite = await benchmark.runAPIBenchmark();
      const responseTime = suite.metrics.find((m) => m.name === "API Response Time");

      expect(responseTime).toBeDefined();
      expect(responseTime?.unit).toBe("ms");
      expect(responseTime?.metadata).toBeDefined();
    });

    it("should include throughput metric", async () => {
      const suite = await benchmark.runAPIBenchmark();
      const throughput = suite.metrics.find((m) => m.name === "API Throughput");

      expect(throughput).toBeDefined();
      expect(throughput?.unit).toBe("req/s");
    });

    it("should include error rate metric", async () => {
      const suite = await benchmark.runAPIBenchmark();
      const errorRate = suite.metrics.find((m) => m.name === "API Error Rate");

      expect(errorRate).toBeDefined();
      expect(errorRate?.unit).toBe("%");
    });
  });

  describe("runAllBenchmarks", () => {
    it("should run all benchmarks and return report", async () => {
      const report = await benchmark.runAllBenchmarks();

      expect(report.suites.length).toBe(6);
      expect(report.summary.total).toBeGreaterThan(0);
      expect(report.generatedAt).toBeDefined();
    });

    it("should calculate correct summary", async () => {
      const report = await benchmark.runAllBenchmarks();

      expect(report.summary.total).toBe(report.summary.passed + report.summary.failed);
      expect(report.summary.passRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.passRate).toBeLessThanOrEqual(100);
    });

    it("should include category breakdown", async () => {
      const report = await benchmark.runAllBenchmarks();

      expect(report.summary.categories.cpu).toBeDefined();
      expect(report.summary.categories.memory).toBeDefined();
      expect(report.summary.categories.io).toBeDefined();
      expect(report.summary.categories.network).toBeDefined();
      expect(report.summary.categories.render).toBeDefined();
      expect(report.summary.categories.api).toBeDefined();
    });

    it("should generate recommendations", async () => {
      const report = await benchmark.runAllBenchmarks();

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe("generateReport", () => {
    it("should generate report from existing suites", async () => {
      await benchmark.runCPUBenchmark();
      await benchmark.runMemoryBenchmark();

      const report = benchmark.generateReport();

      expect(report.suites.length).toBe(2);
      expect(report.summary.total).toBeGreaterThan(0);
    });
  });

  describe("getSuites", () => {
    it("should return all suites", async () => {
      await benchmark.runCPUBenchmark();
      const suites = benchmark.getSuites();

      expect(suites.length).toBe(1);
    });
  });

  describe("clearSuites", () => {
    it("should clear all suites", async () => {
      await benchmark.runCPUBenchmark();
      benchmark.clearSuites();
      const suites = benchmark.getSuites();

      expect(suites.length).toBe(0);
    });
  });
});

describe("createPerformanceBenchmark", () => {
  it("should create new benchmark instance", () => {
    const benchmark = createPerformanceBenchmark();
    expect(benchmark).toBeInstanceOf(PerformanceBenchmark);
  });

  it("should create benchmark with custom thresholds", () => {
    const benchmark = createPerformanceBenchmark({
      cpu: { maxUsage: 90, maxLoadAverage: 8 },
    });
    expect(benchmark).toBeInstanceOf(PerformanceBenchmark);
  });
});
