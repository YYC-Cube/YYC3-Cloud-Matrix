/**
 * @file: performance-optimizer.test.ts
 * @description: performance-optimizer.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PerformanceOptimizer,
  performanceOptimizer,
  type PerformanceMetrics,
  type QueryOptimization,
  type SyncOptimization,
  type IPCOptimization,
} from "../lib/performance-optimizer";

describe("性能优化工具测试", () => {
  beforeEach(() => {
    performanceOptimizer.clearCache();
    vi.clearAllMocks();
  });

  describe("单例模式", () => {
    it("应该返回同一个实例", () => {
      const instance1 = PerformanceOptimizer.getInstance();
      const instance2 = PerformanceOptimizer.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("应该使用全局导出的实例", () => {
      const instance = PerformanceOptimizer.getInstance();
      expect(performanceOptimizer).toBe(instance);
    });
  });

  describe("查询优化", () => {
    it("应该能够优化查询并缓存结果", async () => {
      const queryFn = vi.fn().mockResolvedValue({ id: 1, name: "Test" });

      const result1 = await performanceOptimizer.optimizeQuery(
        "test-query",
        queryFn,
        { cacheResult: true }
      );

      expect(result1).toEqual({ id: 1, name: "Test" });
      expect(queryFn).toHaveBeenCalledTimes(1);

      const result2 = await performanceOptimizer.optimizeQuery(
        "test-query",
        queryFn,
        { cacheResult: true }
      );

      expect(result2).toEqual({ id: 1, name: "Test" });
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it("应该能够处理查询超时", async () => {
      const queryFn = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 2000))
      );

      await expect(
        performanceOptimizer.optimizeQuery("timeout-query", queryFn, {
          timeout: 100,
          cacheResult: false,
        })
      ).rejects.toThrow("Query timeout after 100ms");
    });

    it("应该能够批量查询", async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      const queryFn = vi.fn().mockImplementation((item) => Promise.resolve(item.id * 2));

      const results = await performanceOptimizer.batchQuery(items, queryFn, {
        batchSize: 3,
      });

      expect(results).toHaveLength(10);
      expect(results).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
    });
  });

  describe("同步优化", () => {
    it("应该能够优化增量同步", async () => {
      const localData = [
        { id: 1, name: "Local 1" },
        { id: 2, name: "Local 2" },
      ];
      const remoteData = [
        { id: 2, name: "Local 2" },
        { id: 3, name: "Remote 3" },
      ];

      const result = await performanceOptimizer.optimizeSync(
        "test-sync",
        localData,
        remoteData,
        (local, remote) => JSON.stringify(local) === JSON.stringify(remote),
        { incrementalSync: true }
      );

      expect(result.toUpload).toHaveLength(1);
      expect(result.toUpload[0]).toEqual({ id: 1, name: "Local 1" });
      expect(result.toDownload).toHaveLength(1);
      expect(result.toDownload[0]).toEqual({ id: 3, name: "Remote 3" });
    });

    it("应该能够处理全量同步", async () => {
      const localData = [{ id: 1, name: "Local 1" }];
      const remoteData = [{ id: 2, name: "Remote 2" }];

      const result = await performanceOptimizer.optimizeSync(
        "full-sync",
        localData,
        remoteData,
        () => false,
        { incrementalSync: false }
      );

      expect(result.toUpload).toHaveLength(1);
      expect(result.toDownload).toHaveLength(1);
    });
  });

  describe("IPC 优化", () => {
    it("应该能够优化 IPC 调用并缓存结果", async () => {
      const ipcFn = vi.fn().mockResolvedValue({ success: true });

      const result1 = await performanceOptimizer.optimizeIPC(
        "test-channel",
        { data: "test" },
        ipcFn,
        { cacheEnabled: true }
      );

      expect(result1).toEqual({ success: true });
      expect(ipcFn).toHaveBeenCalledTimes(1);

      const result2 = await performanceOptimizer.optimizeIPC(
        "test-channel",
        { data: "test" },
        ipcFn,
        { cacheEnabled: true }
      );

      expect(result2).toEqual({ success: true });
      expect(ipcFn).toHaveBeenCalledTimes(1);
    });

    it("应该能够批量 IPC 调用", async () => {
      const calls = Array.from({ length: 10 }, (_, i) => ({
        channel: `channel-${i}`,
        data: { id: i },
        fn: vi.fn().mockResolvedValue(i),
      }));

      const results = await performanceOptimizer.batchIPC(calls, {
        batchingEnabled: true,
        maxConcurrent: 3,
      });

      expect(results).toHaveLength(10);
      expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe("性能指标", () => {
    it("应该能够获取性能指标", () => {
      const metrics = performanceOptimizer.getMetrics();

      expect(metrics).toHaveProperty("queryTime");
      expect(metrics).toHaveProperty("syncTime");
      expect(metrics).toHaveProperty("ipcTime");
      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("cacheHitRate");
    });

    it("应该能够更新性能指标", async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: "test" });

      await performanceOptimizer.optimizeQuery("metrics-test", queryFn, {
        cacheResult: false,
      });

      const metrics = performanceOptimizer.getMetrics();
      expect(metrics.queryTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("缓存管理", () => {
    it("应该能够清除缓存", async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: "test" });

      await performanceOptimizer.optimizeQuery("cache-test", queryFn, {
        cacheResult: true,
      });

      performanceOptimizer.clearCache();

      await performanceOptimizer.optimizeQuery("cache-test", queryFn, {
        cacheResult: true,
      });

      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("配置管理", () => {
    it("应该能够设置查询优化配置", () => {
      performanceOptimizer.setQueryOptimization({
        batchSize: 50,
        timeout: 3000,
      });

      const config = performanceOptimizer.getOptimizationConfig();
      expect(config.query.batchSize).toBe(50);
      expect(config.query.timeout).toBe(3000);
    });

    it("应该能够设置同步优化配置", () => {
      performanceOptimizer.setSyncOptimization({
        incrementalSync: false,
        maxRetries: 5,
      });

      const config = performanceOptimizer.getOptimizationConfig();
      expect(config.sync.incrementalSync).toBe(false);
      expect(config.sync.maxRetries).toBe(5);
    });

    it("应该能够设置 IPC 优化配置", () => {
      performanceOptimizer.setIPCOptimization({
        maxConcurrent: 20,
        timeout: 5000,
      });

      const config = performanceOptimizer.getOptimizationConfig();
      expect(config.ipc.maxConcurrent).toBe(20);
      expect(config.ipc.timeout).toBe(5000);
    });

    it("应该能够获取所有优化配置", () => {
      const config = performanceOptimizer.getOptimizationConfig();

      expect(config).toHaveProperty("query");
      expect(config).toHaveProperty("sync");
      expect(config).toHaveProperty("ipc");
    });
  });

  describe("性能分析", () => {
    it("应该能够分析性能并提供建议", () => {
      const analysis = performanceOptimizer.analyzePerformance();

      expect(analysis).toHaveProperty("metrics");
      expect(analysis).toHaveProperty("recommendations");
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it("应该在查询时间过长时提供建议", async () => {
      const slowQueryFn = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: "slow" }), 1100))
      );

      await performanceOptimizer.optimizeQuery("slow-query", slowQueryFn, {
        cacheResult: false,
        timeout: 5000,
      });

      const analysis = performanceOptimizer.analyzePerformance();
      expect(analysis.metrics.queryTime).toBeGreaterThan(1000);
    });
  });
});
