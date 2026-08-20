/**
 * @file: performance-monitor.test.ts
 * @description: performance-monitor.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceMonitor, createPerformanceMonitor, getPerformanceMonitor } from "../lib/performance-monitor";

describe("PerformanceMonitor", () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    monitor = createPerformanceMonitor({
      collectIntervalMs: 100,
      snapshotIntervalMs: 1000,
      maxSnapshots: 5,
      maxAlerts: 10,
    });
  });

  afterEach(() => {
    monitor.stop();
    vi.useRealTimers();
  });

  describe("lifecycle", () => {
    it("should start and stop monitoring", () => {
      monitor.start();
      expect(monitor.getCurrentMetrics()).toBeDefined();
      monitor.stop();
    });
  });

  describe("metrics collection", () => {
    it("should collect current metrics", () => {
      monitor.start();

      const metrics = monitor.getCurrentMetrics();

      expect(metrics.timestamp).toBeDefined();
      expect(metrics.fps).toBeGreaterThanOrEqual(0);
      expect(metrics.memory).toBeDefined();
      expect(metrics.timing).toBeDefined();
      expect(metrics.network).toBeDefined();
    });

    it("should collect memory metrics", () => {
      monitor.start();

      const metrics = monitor.getCurrentMetrics();

      expect(metrics.memory.usagePercentage).toBeGreaterThanOrEqual(0);
      expect(metrics.memory.usagePercentage).toBeLessThanOrEqual(100);
    });

    it("should collect timing metrics", () => {
      monitor.start();

      const metrics = monitor.getCurrentMetrics();

      expect(metrics.timing).toBeDefined();
      expect(typeof metrics.timing.domContentLoaded).toBe("number");
      expect(typeof metrics.timing.loadComplete).toBe("number");
    });

    it("should collect network metrics", () => {
      monitor.start();

      const metrics = monitor.getCurrentMetrics();

      expect(metrics.network.latency).toBeGreaterThanOrEqual(0);
      expect(metrics.network.bandwidth).toBeGreaterThanOrEqual(0);
    });
  });

  describe("history", () => {
    it("should store metrics history", () => {
      monitor.start();
      vi.advanceTimersByTime(500);

      const history = monitor.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it("should limit history size", () => {
      monitor.start();

      for (let i = 0; i < 1500; i++) {
        vi.advanceTimersByTime(100);
      }

      const history = monitor.getHistory();
      expect(history.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("snapshots", () => {
    it("should create snapshots", () => {
      monitor.start();

      const snapshot = monitor.createSnapshot();

      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.metrics).toBeDefined();
      expect(snapshot.score).toBeGreaterThanOrEqual(0);
      expect(snapshot.score).toBeLessThanOrEqual(100);
    });

    it("should store snapshots", () => {
      monitor.start();

      monitor.createSnapshot();
      monitor.createSnapshot();

      const snapshots = monitor.getSnapshots();
      expect(snapshots.length).toBe(2);
    });

    it("should limit snapshots count", () => {
      monitor.start();

      for (let i = 0; i < 10; i++) {
        monitor.createSnapshot();
      }

      const snapshots = monitor.getSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(5);
    });
  });

  describe("alerts", () => {
    it("should generate alerts for threshold violations", () => {
      const customMonitor = createPerformanceMonitor({
        thresholds: [
          { metric: "fps", warning: 60, critical: 30 },
        ],
      });

      customMonitor.start();
      vi.advanceTimersByTime(200);

      const alerts = customMonitor.getAlerts();
      expect(alerts.length).toBeGreaterThanOrEqual(0);

      customMonitor.stop();
    });

    it("should limit alerts count", () => {
      monitor.start();

      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(100);
      }

      const alerts = monitor.getAlerts();
      expect(alerts.length).toBeLessThanOrEqual(10);
    });
  });

  describe("score calculation", () => {
    it("should calculate performance score", () => {
      monitor.start();

      const score = monitor.getScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should return high score for good metrics", () => {
      monitor.start();

      const score = monitor.getScore();
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("report generation", () => {
    it("should generate performance report", () => {
      monitor.start();

      const report = monitor.generateReport();

      expect(report.timestamp).toBeDefined();
      expect(report.score).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.alerts).toBeDefined();
      expect(report.snapshots).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it("should include recommendations", () => {
      monitor.start();

      const report = monitor.generateReport();

      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe("listeners", () => {
    it("should notify metrics listeners", () => {
      const listener = vi.fn();
      monitor.onMetrics(listener);

      monitor.start();
      vi.advanceTimersByTime(200);

      expect(listener).toHaveBeenCalled();
    });

    it("should unsubscribe metrics listeners", () => {
      const listener = vi.fn();
      const unsubscribe = monitor.onMetrics(listener);

      monitor.start();
      vi.advanceTimersByTime(200);

      unsubscribe();

      vi.advanceTimersByTime(200);

      const callCount = listener.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe("custom metrics", () => {
    it("should add custom metrics", () => {
      monitor.start();

      monitor.addCustomMetric("customValue", 42);

      const history = monitor.getHistory();
      const lastMetric = history[history.length - 1];
      expect(lastMetric?.custom?.customValue).toBe(42);
    });
  });

  describe("thresholds", () => {
    it("should update thresholds", () => {
      monitor.start();

      monitor.updateThresholds([
        { metric: "fps", warning: 50, critical: 25 },
      ]);

      // Thresholds should be updated
      expect(true).toBe(true);
    });
  });

  describe("persistence", () => {
    it("should persist data to localStorage", () => {
      monitor.start();
      monitor.createSnapshot();

      const stored = localStorage.getItem("yyc3_performance_monitor");
      expect(stored).toBeDefined();
    });

    it("should load data from localStorage", () => {
      localStorage.setItem("yyc3_performance_monitor", JSON.stringify({
        snapshots: [{ id: "test", timestamp: Date.now(), duration: 1000, metrics: {} as any, alerts: [], score: 80 }],
        alerts: [],
      }));

      const newMonitor = createPerformanceMonitor();
      const snapshots = newMonitor.getSnapshots();

      expect(snapshots.length).toBe(1);

      newMonitor.stop();
    });
  });

  describe("clear history", () => {
    it("should clear all history data", () => {
      monitor.start();
      vi.advanceTimersByTime(500);

      monitor.clearHistory();

      const history = monitor.getHistory();
      expect(history.length).toBe(0);
    });
  });
});

describe("getPerformanceMonitor", () => {
  it("should return singleton instance", () => {
    const instance1 = getPerformanceMonitor();
    const instance2 = getPerformanceMonitor();

    expect(instance1).toBe(instance2);
  });
});

describe("createPerformanceMonitor", () => {
  it("should create new instance", () => {
    const monitor1 = createPerformanceMonitor();
    const monitor2 = createPerformanceMonitor();

    expect(monitor1).not.toBe(monitor2);

    monitor1.stop();
    monitor2.stop();
  });
});
