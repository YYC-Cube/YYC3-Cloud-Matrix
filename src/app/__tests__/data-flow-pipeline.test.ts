/**
 * @file: data-flow-pipeline.test.ts
 * @description: data-flow-pipeline.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  DataValidator,
  DataTransformer,
  DataAggregator,
  DataCache,
  DataFlowPipeline,
} from "../lib/data-flow-pipeline";
import type { NodeData, ThroughputPoint, AlertData } from "../types";

describe("DataValidator", () => {
  describe("validateNodeData", () => {
    it("should validate valid node data", () => {
      const validNode: NodeData = {
        id: "node-1",
        gpu: 75,
        mem: 60,
        temp: 65,
        model: "gpt-4",
        tasks: 10,
        status: "active",
      };

      expect(DataValidator.validateNodeData(validNode)).toBe(true);
    });

    it("should reject invalid node data", () => {
      expect(DataValidator.validateNodeData(null)).toBe(false);
      expect(DataValidator.validateNodeData({})).toBe(false);
      expect(DataValidator.validateNodeData({ id: 123 })).toBe(false);
    });
  });

  describe("validateThroughputPoint", () => {
    it("should validate valid throughput point", () => {
      const validPoint: ThroughputPoint = {
        time: "12:00:00",
        qps: 3800,
        latency: 45,
        tokens: 138000,
      };

      expect(DataValidator.validateThroughputPoint(validPoint)).toBe(true);
    });

    it("should reject invalid throughput point", () => {
      expect(DataValidator.validateThroughputPoint(null)).toBe(false);
      expect(DataValidator.validateThroughputPoint({ time: "12:00" })).toBe(false);
    });
  });

  describe("validateAlertData", () => {
    it("should validate valid alert data", () => {
      const validAlert: AlertData = {
        id: "alert-1",
        level: "warning",
        message: "High GPU usage",
        source: "node-1",
        timestamp: Date.now(),
      };

      expect(DataValidator.validateAlertData(validAlert)).toBe(true);
    });

    it("should reject invalid alert data", () => {
      expect(DataValidator.validateAlertData(null)).toBe(false);
      expect(DataValidator.validateAlertData({ id: "alert" })).toBe(false);
    });
  });

  describe("sanitizeNodeData", () => {
    it("should sanitize partial node data", () => {
      const partial = { id: "node-1", gpu: 150 };
      const sanitized = DataValidator.sanitizeNodeData(partial);

      expect(sanitized.id).toBe("node-1");
      expect(sanitized.gpu).toBe(100); // Clamped to max
      expect(sanitized.mem).toBe(0); // Default
      expect(sanitized.status).toBe("inactive"); // Default
    });

    it("should generate id if missing", () => {
      const partial = { gpu: 50 };
      const sanitized = DataValidator.sanitizeNodeData(partial);

      expect(sanitized.id).toMatch(/^node-/);
    });
  });
});

describe("DataTransformer", () => {
  describe("transformNodeToMetric", () => {
    it("should transform node data to metric", () => {
      const node: NodeData = {
        id: "node-1",
        gpu: 75,
        mem: 60,
        temp: 65,
        model: "gpt-4",
        tasks: 10,
        status: "active",
      };

      const metric = DataTransformer.transformNodeToMetric(node);

      expect(metric.nodeId).toBe("node-1");
      expect(metric.gpuUtilization).toBe(75);
      expect(metric.memoryUtilization).toBe(60);
      expect(metric.temperature).toBe(65);
      expect(metric.activeTasks).toBe(10);
      expect(metric.healthScore).toBeGreaterThan(0);
    });
  });

  describe("calculateHealthScore", () => {
    it("should return 100 for healthy node", () => {
      const healthyNode: NodeData = {
        id: "node-1",
        gpu: 50,
        mem: 50,
        temp: 60,
        model: "gpt-4",
        tasks: 5,
        status: "active",
      };

      expect(DataTransformer.calculateHealthScore(healthyNode)).toBe(100);
    });

    it("should penalize high GPU usage", () => {
      const highGpuNode: NodeData = {
        id: "node-1",
        gpu: 95,
        mem: 50,
        temp: 60,
        model: "gpt-4",
        tasks: 5,
        status: "active",
      };

      expect(DataTransformer.calculateHealthScore(highGpuNode)).toBeLessThan(100);
    });

    it("should penalize high temperature", () => {
      const hotNode: NodeData = {
        id: "node-1",
        gpu: 50,
        mem: 50,
        temp: 90,
        model: "gpt-4",
        tasks: 5,
        status: "active",
      };

      expect(DataTransformer.calculateHealthScore(hotNode)).toBeLessThan(100);
    });

    it("should penalize inactive status", () => {
      const inactiveNode: NodeData = {
        id: "node-1",
        gpu: 50,
        mem: 50,
        temp: 60,
        model: "gpt-4",
        tasks: 0,
        status: "inactive",
      };

      expect(DataTransformer.calculateHealthScore(inactiveNode)).toBeLessThan(100);
    });
  });

  describe("aggregateThroughputPoints", () => {
    it("should aggregate throughput points", () => {
      const points: ThroughputPoint[] = [
        { time: "12:00:00", qps: 3800, latency: 45, tokens: 138000 },
        { time: "12:00:01", qps: 3900, latency: 42, tokens: 140000 },
        { time: "12:00:02", qps: 3700, latency: 48, tokens: 136000 },
      ];

      const aggregated = DataTransformer.aggregateThroughputPoints(points, 2000);

      expect(aggregated.length).toBeGreaterThan(0);
      expect(aggregated[0].qps).toBeGreaterThan(0);
    });

    it("should return empty array for empty input", () => {
      const aggregated = DataTransformer.aggregateThroughputPoints([], 2000);
      expect(aggregated).toEqual([]);
    });
  });
});

describe("DataAggregator", () => {
  describe("aggregateNodeMetrics", () => {
    it("should aggregate node metrics", () => {
      const nodes: NodeData[] = [
        { id: "node-1", gpu: 80, mem: 70, temp: 65, model: "gpt-4", tasks: 10, status: "active" },
        { id: "node-2", gpu: 60, mem: 50, temp: 55, model: "gpt-4", tasks: 5, status: "active" },
        { id: "node-3", gpu: 0, mem: 0, temp: 0, model: "", tasks: 0, status: "inactive" },
      ];

      const stats = DataAggregator.aggregateNodeMetrics(nodes);

      expect(stats.totalNodes).toBe(3);
      expect(stats.activeCount).toBe(2);
      expect(stats.inactiveCount).toBe(1);
      expect(stats.avgGpuUtilization).toBe(70); // (80 + 60) / 2
    });

    it("should handle empty nodes array", () => {
      const stats = DataAggregator.aggregateNodeMetrics([]);

      expect(stats.totalNodes).toBe(0);
      expect(stats.activeCount).toBe(0);
      expect(stats.avgGpuUtilization).toBe(0);
    });
  });

  describe("aggregateAlerts", () => {
    it("should aggregate alerts by level and source", () => {
      const alerts: AlertData[] = [
        { id: "1", level: "critical", message: "Alert 1", source: "node-1", timestamp: Date.now() },
        { id: "2", level: "warning", message: "Alert 2", source: "node-1", timestamp: Date.now() },
        { id: "3", level: "warning", message: "Alert 3", source: "node-2", timestamp: Date.now() },
      ];

      const stats = DataAggregator.aggregateAlerts(alerts, 60000);

      expect(stats.totalAlerts).toBe(3);
      expect(stats.criticalCount).toBe(1);
      expect(stats.warningCount).toBe(2);
      expect(stats.bySource["node-1"]).toBe(2);
      expect(stats.bySource["node-2"]).toBe(1);
    });

    it("should filter alerts by time window", () => {
      const now = Date.now();
      const alerts: AlertData[] = [
        { id: "1", level: "critical", message: "Recent", source: "node-1", timestamp: now - 1000 },
        { id: "2", level: "warning", message: "Old", source: "node-2", timestamp: now - 120000 },
      ];

      const stats = DataAggregator.aggregateAlerts(alerts, 60000);

      expect(stats.totalAlerts).toBe(1);
      expect(stats.criticalCount).toBe(1);
    });
  });

  describe("calculateThroughputTrend", () => {
    it("should detect upward trend", () => {
      const history: ThroughputPoint[] = [];
      for (let i = 0; i < 20; i++) {
        history.push({
          time: `12:00:${i}`,
          qps: 3500 + i * 50,
          latency: 45,
          tokens: 138000,
        });
      }

      const trend = DataAggregator.calculateThroughputTrend(history, 5);

      expect(trend.direction).toBe("up");
      expect(trend.percentage).toBeGreaterThan(0);
    });

    it("should detect downward trend", () => {
      const history: ThroughputPoint[] = [];
      for (let i = 0; i < 20; i++) {
        history.push({
          time: `12:00:${i}`,
          qps: 4000 - i * 50,
          latency: 45,
          tokens: 138000,
        });
      }

      const trend = DataAggregator.calculateThroughputTrend(history, 5);

      expect(trend.direction).toBe("down");
      expect(trend.percentage).toBeLessThan(0);
    });

    it("should return stable for insufficient data", () => {
      const history: ThroughputPoint[] = [
        { time: "12:00:00", qps: 3800, latency: 45, tokens: 138000 },
      ];

      const trend = DataAggregator.calculateThroughputTrend(history);

      expect(trend.direction).toBe("stable");
    });
  });
});

describe("DataCache", () => {
  let cache: DataCache<string>;

  beforeEach(() => {
    cache = new DataCache<string>(1000);
  });

  it("should set and get values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return null for missing keys", () => {
    expect(cache.get("missing")).toBeNull();
  });

  it("should expire entries after TTL", async () => {
    cache.set("key1", "value1", 100);
    expect(cache.get("key1")).toBe("value1");

    await new Promise((r) => setTimeout(r, 150));
    expect(cache.get("key1")).toBeNull();
  });

  it("should track hits", () => {
    cache.set("key1", "value1");
    cache.get("key1");
    cache.get("key1");

    const stats = cache.getStats();
    expect(stats.entries).toBe(1);
    expect(stats.totalHits).toBe(2);
  });

  it("should cleanup expired entries", async () => {
    cache.set("key1", "value1", 100);
    cache.set("key2", "value2", 10000);

    await new Promise((r) => setTimeout(r, 150));
    const cleaned = cache.cleanup();

    expect(cleaned).toBe(1);
    expect(cache.has("key1")).toBe(false);
    expect(cache.has("key2")).toBe(true);
  });
});

describe("DataFlowPipeline", () => {
  it("should process data through stages", async () => {
    const pipeline = new DataFlowPipeline<number, number>()
      .addStage({
        name: "double",
        process: (input) => input * 2,
      })
      .addStage({
        name: "addTen",
        process: (input) => input + 10,
      });

    const result = await pipeline.process(5);
    expect(result).toBe(20);
  });

  it("should handle errors with fallback", async () => {
    const pipeline = new DataFlowPipeline<number, number>()
      .addStage({
        name: "mayFail",
        process: () => {
          throw new Error("Failed");
        },
        onError: () => 0,
      });

    const result = await pipeline.process(5);
    expect(result).toBe(0);
  });

  it("should cache results", async () => {
    const pipeline = new DataFlowPipeline<number, number>({ cacheEnabled: true })
      .addStage({
        name: "expensive",
        process: (input) => input * 2,
      });

    const result1 = await pipeline.process(5, "cache-key");
    const result2 = await pipeline.process(5, "cache-key");

    expect(result1).toBe(10);
    expect(result2).toBe(10);

    const metrics = pipeline.getMetrics();
    expect(metrics.totalProcessed).toBe(1); // Only processed once due to cache
  });

  it("should track metrics", async () => {
    const pipeline = new DataFlowPipeline<number, number>()
      .addStage({
        name: "process",
        process: (input) => input * 2,
      });

    await pipeline.process(5);
    await pipeline.process(10);

    const metrics = pipeline.getMetrics();
    expect(metrics.totalProcessed).toBe(2);
    expect(metrics.successCount).toBe(2);
    expect(metrics.errorCount).toBe(0);
  });
});
