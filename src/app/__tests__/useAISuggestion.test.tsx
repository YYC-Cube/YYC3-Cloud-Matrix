/**
 * @file: useAISuggestion.test.tsx
 * @description: useAISuggestion.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-19
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * useAISuggestion.test.tsx
 * =============
 * useAISuggestion Hook - AI assisted decision state management test
 *
 * Coverage:
 * - Initial state (patterns / recommendations / health)
 * - Pattern sorting (by severity)
 * - applyRecommendation
 * - dismissRecommendation
 * - dismissPattern
 * - getRecommendationsForPattern
 * - runAnalysis
 * - stats
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// ── Import the Zustand slice and hook after mocks ──────────────
import { useAISuggestionSlice } from "../store/slices/ai-suggestion-slice";
import { useAISuggestion } from "../hooks/useAISuggestion";

describe("useAISuggestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store to default seed data (matching DEFAULT_PATTERNS/DEFAULT_RECOMMENDATIONS)
    useAISuggestionSlice.setState({
      patterns: [
        {
          id: 'pat-1',
          type: 'latency_spike',
          severity: 'high',
          title: 'GPU-A100-03 推理延迟持续异常',
          description: '过去 1 小时内连续 3 次延迟 > 2000ms',
          source: 'GPU-A100-03',
          metric: '2,450ms > 2,000ms 阈值',
          detectedAt: Date.now() - 15 * 60000,
          occurrences: 3,
          trend: 'rising',
        },
        {
          id: 'pat-2',
          type: 'memory_pressure',
          severity: 'medium',
          title: 'GPU-A100-03 显存压力过大',
          description: '显存使用率持续 89%+',
          source: 'GPU-A100-03',
          metric: '89% > 85% 阈值',
          detectedAt: Date.now() - 30 * 60000,
          occurrences: 5,
          trend: 'stable',
        },
        {
          id: 'pat-3',
          type: 'storage_near_full',
          severity: 'medium',
          title: 'NAS 存储空间接近阈值',
          description: 'NAS-Storage-01 已使用 85.8%',
          source: 'NAS-Storage-01',
          metric: '85.8%',
          detectedAt: Date.now() - 2 * 3600000,
          occurrences: 1,
          trend: 'rising',
        },
        {
          id: 'pat-4',
          type: 'gpu_overheat',
          severity: 'critical',
          title: 'GPU-H100-02 温度过高',
          description: 'GPU 核心温度 85°C',
          source: 'GPU-H100-02',
          metric: '85°C > 80°C',
          detectedAt: Date.now() - 5 * 60000,
          occurrences: 2,
          trend: 'rising',
        },
        {
          id: 'pat-5',
          type: 'throughput_drop',
          severity: 'low',
          title: '推理吞吐量波动',
          description: 'Token 吞吐量下降 12.3%',
          source: '集群整体',
          metric: '↓12.3%',
          detectedAt: Date.now() - 20 * 60000,
          occurrences: 1,
          trend: 'declining',
        },
      ],
      recommendations: [
        {
          id: 'rec-1',
          patternId: 'pat-1',
          action: '迁移模型到 GPU-A100-07',
          description: '迁移后预计延迟降至 800ms',
          impact: 'high',
          confidence: 92,
          autoExecutable: true,
        },
        {
          id: 'rec-2',
          patternId: 'pat-1',
          action: '重启 GPU-A100-03 推理服务',
          description: '清理内存碎片',
          impact: 'medium',
          confidence: 78,
          autoExecutable: true,
        },
        {
          id: 'rec-3',
          patternId: 'pat-2',
          action: '启用动态显存分配',
          description: '降低显存占用约 30%',
          impact: 'medium',
          confidence: 85,
          autoExecutable: true,
        },
        {
          id: 'rec-4',
          patternId: 'pat-3',
          action: '清理历史日志归档',
          description: '预计释放 8.2GB 空间',
          impact: 'low',
          confidence: 95,
          autoExecutable: true,
        },
        {
          id: 'rec-5',
          patternId: 'pat-3',
          action: '扩容 NAS 存储卷',
          description: '需要手动操作 RAID 配置',
          impact: 'high',
          confidence: 88,
          autoExecutable: false,
        },
        {
          id: 'rec-6',
          patternId: 'pat-4',
          action: '降低 GPU-H100-02 工作频率',
          description: '温度预计下降 10°C',
          impact: 'high',
          confidence: 90,
          autoExecutable: true,
        },
        {
          id: 'rec-7',
          patternId: 'pat-4',
          action: '将任务从 GPU-H100-02 迁出',
          description: '让 GPU 冷却',
          impact: 'high',
          confidence: 95,
          autoExecutable: true,
        },
        {
          id: 'rec-8',
          patternId: 'pat-5',
          action: '启用动态负载均衡',
          description: '自动将任务分配到空闲节点',
          impact: 'medium',
          confidence: 72,
          autoExecutable: true,
        },
      ],
      isAnalyzing: false,
      lastAnalyzedAt: Date.now() - 5 * 60000,
      enabledAutoSuggestion: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  // ----------------------------------------------------------
  // Initial state
  // ----------------------------------------------------------

  describe("initial state", () => {
    it("should have 5 anomaly patterns", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.patterns.length).toBe(5);
    });

    it("should have 8 recommendations", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.recommendations.length).toBe(8);
    });

    it("overallHealth should be a reasonable value (0-100)", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.overallHealth).toBeGreaterThanOrEqual(0);
      expect(result.current.overallHealth).toBeLessThanOrEqual(100);
    });

    it("isAnalyzing initially false", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.isAnalyzing).toBe(false);
    });

    it("enabledAutoSuggestion initially true", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.enabledAutoSuggestion).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // Pattern sorting
  // ----------------------------------------------------------

  describe("pattern sorting", () => {
    it("critical should be first", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.patterns[0].severity).toBe("critical");
    });

    it("low should be last", () => {
      const { result } = renderHook(() => useAISuggestion());
      const last = result.current.patterns[result.current.patterns.length - 1];
      expect(last.severity).toBe("low");
    });
  });

  // ----------------------------------------------------------
  // Stats
  // ----------------------------------------------------------

  describe("stats", () => {
    it("should have correct pattern stats", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.stats.totalPatterns).toBe(5);
      expect(result.current.stats.criticalCount).toBe(1);
      expect(result.current.stats.highCount).toBe(1);
    });

    it("totalRecommendations should be unapplied count", () => {
      const { result } = renderHook(() => useAISuggestion());
      expect(result.current.stats.totalRecommendations).toBe(8);
      expect(result.current.stats.appliedCount).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // Related queries
  // ----------------------------------------------------------

  describe("getRecommendationsForPattern", () => {
    it("should return related recommendations", () => {
      const { result } = renderHook(() => useAISuggestion());
      const recs = result.current.getRecommendationsForPattern("pat-1");
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.every((r) => r.patternId === "pat-1")).toBe(true);
    });

    it("non-existent pattern should return empty", () => {
      const { result } = renderHook(() => useAISuggestion());
      const recs = result.current.getRecommendationsForPattern("nonexistent");
      expect(recs.length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  describe("applyRecommendation", () => {
    it("applied should be true after apply", async () => {
      const { result } = renderHook(() => useAISuggestion());
      const recId = result.current.recommendations[0].id;

      await act(async () => {
        await result.current.applyRecommendation(recId);
      });

      const updated = result.current.recommendations.find((r) => r.id === recId);
      expect(updated?.applied).toBe(true);
    });

    it("appliedCount should increase after apply", async () => {
      const { result } = renderHook(() => useAISuggestion());
      const before = result.current.stats.appliedCount;

      await act(async () => {
        await result.current.applyRecommendation(result.current.recommendations[0].id);
      });

      expect(result.current.stats.appliedCount).toBe(before + 1);
    });
  });

  describe("dismissRecommendation", () => {
    it("recommendation should be removed after dismiss", () => {
      const { result } = renderHook(() => useAISuggestion());
      const recId = result.current.recommendations[0].id;
      const before = result.current.recommendations.length;

      act(() => {
        result.current.dismissRecommendation(recId);
      });

      expect(result.current.recommendations.length).toBe(before - 1);
      expect(result.current.recommendations.find((r) => r.id === recId)).toBeUndefined();
    });
  });

  describe("dismissPattern", () => {
    it("pattern and related recommendations should be removed after dismiss", () => {
      const { result } = renderHook(() => useAISuggestion());
      const patId = "pat-1";

      act(() => {
        result.current.dismissPattern(patId);
      });

      expect(result.current.patterns.find((p) => p.id === patId)).toBeUndefined();
      expect(result.current.recommendations.filter((r) => r.patternId === patId).length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // runAnalysis
  // ----------------------------------------------------------

  describe("runAnalysis", () => {
    it("lastAnalyzedAt should update after execution", async () => {
      const { result } = renderHook(() => useAISuggestion());
      const before = result.current.lastAnalyzedAt;

      await act(async () => {
        await result.current.runAnalysis();
      });

      expect(result.current.lastAnalyzedAt).toBeGreaterThan(before);
      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // Toggle
  // ----------------------------------------------------------

  describe("enabledAutoSuggestion", () => {
    it("toggle auto suggestion switch", () => {
      const { result } = renderHook(() => useAISuggestion());
      act(() => {
        result.current.setEnabledAutoSuggestion(false);
      });
      expect(result.current.enabledAutoSuggestion).toBe(false);
    });
  });
});
