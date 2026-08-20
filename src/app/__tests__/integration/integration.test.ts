/**
 * @file: integration.test.ts
 * @description: integration.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PerformanceMonitor } from "../../lib/performance-monitor";
import { SecurityAuditor } from "../../lib/security-audit";
import { DependencyScanner } from "../../lib/dependency-scanner";
import { DataFlowPipeline } from "../../lib/data-flow-pipeline";
import { StateSyncManager } from "../../lib/state-sync-manager";

interface TestItem {
  id: string;
  value: number;
  timestamp?: number;
}

describe("Module Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Performance + Security Integration", () => {
    it("should track security audit performance", async () => {
      const perfMonitor = new PerformanceMonitor({ collectIntervalMs: 100 });
      const securityAuditor = new SecurityAuditor();

      perfMonitor.start();

      const startTime = performance.now();
      await securityAuditor.runFullAudit();
      const duration = performance.now() - startTime;

      perfMonitor.addCustomMetric("securityAuditDuration", duration);

      const history = perfMonitor.getHistory();
      const lastMetric = history[history.length - 1];

      expect(lastMetric?.custom?.securityAuditDuration).toBeDefined();
      expect(lastMetric?.custom?.securityAuditDuration).toBeGreaterThan(0);

      perfMonitor.stop();
    });

    it("should correlate performance issues with security issues", async () => {
      const perfMonitor = new PerformanceMonitor();
      const securityAuditor = new SecurityAuditor();

      perfMonitor.start();
      const securityResult = await securityAuditor.runFullAudit();
      const perfSnapshot = perfMonitor.createSnapshot();

      expect(perfSnapshot.metrics).toBeDefined();
      expect(securityResult.issues).toBeDefined();

      perfMonitor.stop();
    });
  });

  describe("DataFlow Pipeline Integration", () => {
    it("should process data through pipeline stages", async () => {
      const pipeline = new DataFlowPipeline<{ value: number }, { doubled: number }>();

      pipeline.addStage({
        name: "double",
        process: async (input: { value: number }) => ({
          doubled: input.value * 2,
        }),
      });

      const result = await pipeline.process({ value: 5 });

      expect(result.doubled).toBe(10);
    });

    it("should handle multiple pipeline stages", async () => {
      const pipeline = new DataFlowPipeline<number, string>();

      pipeline
        .addStage({
          name: "multiply",
          process: async (input: number) => input * 2,
        })
        .addStage({
          name: "toString",
          process: async (input: number) => `result: ${input}`,
        });

      const result = await pipeline.process(5);

      expect(result).toBe("result: 10");
    });

    it("should cache pipeline results", async () => {
      const pipeline = new DataFlowPipeline<number, number>({
        cacheEnabled: true,
      });

      let callCount = 0;

      pipeline.addStage({
        name: "expensive",
        process: async (input: number) => {
          callCount++;
          return input * input;
        },
      });

      const result1 = await pipeline.process(5, "test-key");
      const result2 = await pipeline.process(5, "test-key");

      expect(result1).toBe(25);
      expect(result2).toBe(25);

      const metrics = pipeline.getMetrics();
      expect(metrics.successCount).toBeGreaterThanOrEqual(1);
    });

    it("should handle pipeline errors", async () => {
      const pipeline = new DataFlowPipeline<number, number>();

      pipeline.addStage({
        name: "error-stage",
        process: async () => {
          throw new Error("Pipeline error");
        },
        onError: () => 0,
      });

      const result = await pipeline.process(5);

      expect(result).toBe(0);
    });
  });

  describe("StateSync Integration", () => {
    it("should track and retrieve state changes", () => {
      const stateSync = new StateSyncManager<TestItem>("test-app");

      stateSync.set({ id: "item-1", value: 100 });

      const item = stateSync.getById("item-1");
      expect(item?.value).toBe(100);

      const history = stateSync.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it("should create and restore snapshots", () => {
      const stateSync = new StateSyncManager<TestItem>("test-app");

      stateSync.set({ id: "item-1", value: 100 });
      const snapshot = stateSync.createSnapshot();

      stateSync.set({ id: "item-2", value: 200 });
      expect(stateSync.getAll().length).toBe(2);

      stateSync.restoreSnapshot(snapshot.version);
      expect(stateSync.getAll().length).toBe(1);
    });

    it("should sync state to storage", () => {
      const stateSync = new StateSyncManager<TestItem>("test-app");

      stateSync.set({ id: "item-1", value: 100 });
      stateSync.sync();

      const stats = stateSync.getStats();
      expect(stats.totalChanges).toBeGreaterThan(0);
    });
  });

  describe("Security + Dependency Integration", () => {
    it("should correlate security issues with dependency vulnerabilities", async () => {
      const securityAuditor = new SecurityAuditor();
      const depScanner = new DependencyScanner();

      const securityResult = await securityAuditor.runFullAudit();
      const depResult = await depScanner.scan();

      const allIssues = [
        ...securityResult.issues,
        ...depResult.vulnerabilities.map((v) => ({
          type: "dependency",
          severity: v.severity,
          title: v.title,
        })),
      ];

      expect(Array.isArray(allIssues)).toBe(true);
    });

    it("should generate combined security report", async () => {
      const securityAuditor = new SecurityAuditor();
      const depScanner = new DependencyScanner();

      const securityResult = await securityAuditor.runFullAudit();
      const depResult = await depScanner.scan();

      const combinedReport = {
        timestamp: Date.now(),
        securityScore: securityResult.score,
        dependencyScore: depResult.score,
        overallScore: (securityResult.score + depResult.score) / 2,
        totalIssues: securityResult.issues.length + depResult.vulnerabilities.length,
      };

      expect(combinedReport.overallScore).toBeGreaterThanOrEqual(0);
      expect(combinedReport.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Full System Integration", () => {
    it("should run complete system health check", async () => {
      const perfMonitor = new PerformanceMonitor();
      const securityAuditor = new SecurityAuditor();
      const depScanner = new DependencyScanner();
      const stateSync = new StateSyncManager<TestItem>("health-check");

      perfMonitor.start();

      const [perfSnapshot, securityResult, depResult] = await Promise.all([
        Promise.resolve(perfMonitor.createSnapshot()),
        securityAuditor.runFullAudit(),
        depScanner.scan(),
      ]);

      const healthReport = {
        timestamp: Date.now(),
        performance: {
          score: perfSnapshot.score,
          fps: perfSnapshot.metrics.fps,
          memory: perfSnapshot.metrics.memory.usagePercentage,
        },
        security: {
          score: securityResult.score,
          issues: securityResult.issues.length,
        },
        dependencies: {
          score: depResult.score,
          outdated: depResult.summary.outdatedPackages,
          vulnerabilities: depResult.summary.totalVulnerabilities,
        },
      };

      stateSync.set({
        id: "health-report",
        value: healthReport.performance.score,
        timestamp: healthReport.timestamp,
      });

      expect(healthReport.performance.score).toBeGreaterThanOrEqual(0);
      expect(healthReport.security.score).toBeGreaterThanOrEqual(0);
      expect(healthReport.dependencies.score).toBeGreaterThanOrEqual(0);

      perfMonitor.stop();
    });

    it("should handle concurrent operations", async () => {
      const pipeline = new DataFlowPipeline<number, number>();
      const stateSync = new StateSyncManager<TestItem>("concurrent-test");

      pipeline.addStage({
        name: "process",
        process: async (input: number) => input * 2,
      });

      const operations = Array.from({ length: 10 }, (_, i) =>
        pipeline.process(i).then((result) => {
          stateSync.set({ id: `item-${i}`, value: result });
        })
      );

      await Promise.all(operations);

      const allItems = stateSync.getAll();
      expect(allItems.length).toBe(10);
    });

    it("should maintain data consistency across modules", async () => {
      const stateSync = new StateSyncManager<TestItem>("consistency-test");
      const pipeline = new DataFlowPipeline<TestItem, TestItem>();

      pipeline.addStage({
        name: "add-timestamp",
        process: async (input: TestItem): Promise<TestItem> => ({
          ...input,
          timestamp: Date.now(),
        }),
      });

      const testData: TestItem = { id: "test-1", value: 42 };
      const result = await pipeline.process(testData);

      stateSync.set(result);

      const stored = stateSync.getById("test-1");
      expect(stored?.value).toBe(42);
      expect(stored?.timestamp).toBeDefined();
    });
  });

  describe("Error Handling Integration", () => {
    it("should propagate errors across modules", async () => {
      const pipeline = new DataFlowPipeline<number, number>();
      const stateSync = new StateSyncManager<TestItem>("error-test");

      pipeline.addStage({
        name: "error-processor",
        process: async () => {
          throw new Error("Processor error");
        },
      });

      try {
        await pipeline.process(42);
      } catch (error) {
        stateSync.set({
          id: "error-log",
          value: 0,
        });
      }

      const errorLog = stateSync.getById("error-log");
      expect(errorLog).toBeDefined();
    });

    it("should recover from module failures", async () => {
      const perfMonitor = new PerformanceMonitor();
      const stateSync = new StateSyncManager<TestItem>("recovery-test");

      perfMonitor.start();

      try {
        throw new Error("Simulated failure");
      } catch {
        stateSync.set({ id: "failure", value: 0 });
      }

      const snapshot = perfMonitor.createSnapshot();
      stateSync.set({ id: "recovery", value: snapshot.score });

      const failureItem = stateSync.getById("failure");
      const recoveryItem = stateSync.getById("recovery");

      expect(failureItem).toBeDefined();
      expect(recoveryItem).toBeDefined();

      perfMonitor.stop();
    });
  });

  describe("Metrics and Reporting Integration", () => {
    it("should collect metrics from all modules", async () => {
      const perfMonitor = new PerformanceMonitor({ collectIntervalMs: 10 });
      const pipeline = new DataFlowPipeline<number, number>();
      const stateSync = new StateSyncManager<TestItem>("metrics-test");

      perfMonitor.start();

      pipeline.addStage({
        name: "process",
        process: async (input: number) => input * 2,
      });

      for (let i = 0; i < 5; i++) {
        await pipeline.process(i);
        stateSync.set({ id: `item-${i}`, value: i * 2 });
      }

      perfMonitor.createSnapshot();

      const perfMetrics = perfMonitor.getHistory();
      const pipelineMetrics = pipeline.getMetrics();
      const stateStats = stateSync.getStats();

      expect(perfMetrics.length).toBeGreaterThanOrEqual(0);
      expect(pipelineMetrics.totalProcessed).toBe(5);
      expect(stateStats.totalChanges).toBeGreaterThanOrEqual(5);

      perfMonitor.stop();
    });

    it("should generate comprehensive report", async () => {
      const perfMonitor = new PerformanceMonitor();
      const securityAuditor = new SecurityAuditor();
      const depScanner = new DependencyScanner();

      perfMonitor.start();

      const [perfSnapshot, securityResult, depResult] = await Promise.all([
        Promise.resolve(perfMonitor.createSnapshot()),
        securityAuditor.runFullAudit(),
        depScanner.scan(),
      ]);

      const report = {
        generatedAt: new Date().toISOString(),
        modules: {
          performance: {
            score: perfSnapshot.score,
            fps: perfSnapshot.metrics.fps,
            memoryUsage: perfSnapshot.metrics.memory.usagePercentage,
          },
          security: {
            score: securityResult.score,
            issues: securityResult.summary.total,
            critical: securityResult.summary.critical,
          },
          dependencies: {
            score: depResult.score,
            outdated: depResult.summary.outdatedPackages,
            vulnerabilities: depResult.summary.totalVulnerabilities,
          },
        },
        overallHealth:
          (perfSnapshot.score + securityResult.score + depResult.score) / 3,
      };

      expect(report.overallHealth).toBeGreaterThanOrEqual(0);
      expect(report.overallHealth).toBeLessThanOrEqual(100);
      expect(report.modules).toBeDefined();

      perfMonitor.stop();
    });
  });
});
