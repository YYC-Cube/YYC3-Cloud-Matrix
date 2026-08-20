/**
 * @file: useAISuggestion.test.ts
 * @description: useAISuggestion Hook unit test — Zustand slice integration
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-19
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ── Import the Zustand slice and hook after mocks ──────────────
import { useAISuggestionSlice } from "../store/slices/ai-suggestion-slice";
import { useAISuggestion } from "../hooks/useAISuggestion";

describe("useAISuggestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store to empty state for each test
    useAISuggestionSlice.setState({
      patterns: [],
      recommendations: [],
      isAnalyzing: false,
      lastAnalyzedAt: 0,
      enabledAutoSuggestion: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with empty patterns", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.patterns).toEqual([]);
    });

    it("should initialize with empty recommendations", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.recommendations).toEqual([]);
    });

    it("should initialize with isAnalyzing false", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.isAnalyzing).toBe(false);
    });

    it("should initialize with enabledAutoSuggestion true", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.enabledAutoSuggestion).toBe(true);
    });

    it("should initialize with overallHealth 100 when no patterns", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.overallHealth).toBe(100);
    });
  });

  describe("stats", () => {
    it("should return correct stats for empty state", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.stats).toEqual({
        totalPatterns: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        totalRecommendations: 0,
        appliedCount: 0,
      });
    });
  });

  describe("setEnabledAutoSuggestion", () => {
    it("should toggle auto suggestion", () => {
      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.enabledAutoSuggestion).toBe(true);

      act(() => {
        result.current.setEnabledAutoSuggestion(false);
      });

      expect(result.current.enabledAutoSuggestion).toBe(false);
    });
  });

  describe("runAnalysis", () => {
    it("should set isAnalyzing to true during analysis", () => {
      const { result } = renderHook(() => useAISuggestion());

      // Start analysis (don't await — just check it begins)
      act(() => {
        result.current.runAnalysis();
      });

      expect(result.current.isAnalyzing).toBe(true);
    });

    it("should complete analysis and set isAnalyzing back to false", async () => {
      const { result } = renderHook(() => useAISuggestion());

      await act(async () => {
        await result.current.runAnalysis();
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe("getRecommendationsForPattern", () => {
    it("should return empty array for unknown pattern", () => {
      const { result } = renderHook(() => useAISuggestion());

      const recs = result.current.getRecommendationsForPattern("unknown");

      expect(recs).toEqual([]);
    });
  });

  describe("dismissRecommendation", () => {
    it("should dismiss recommendation", () => {
      // Seed a recommendation into the store
      useAISuggestionSlice.setState({
        recommendations: [
          {
            id: "rec-1",
            patternId: "pat-1",
            action: "Test action",
            description: "Test desc",
            impact: "high",
            confidence: 90,
            autoExecutable: true,
          },
        ],
      });

      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.recommendations.length).toBe(1);

      act(() => {
        result.current.dismissRecommendation("rec-1");
      });

      expect(result.current.recommendations).toEqual([]);
    });
  });

  describe("dismissPattern", () => {
    it("should dismiss pattern", () => {
      // Seed a pattern into the store
      useAISuggestionSlice.setState({
        patterns: [
          {
            id: "pat-1",
            type: "latency_spike",
            severity: "high",
            title: "Test pattern",
            description: "Test desc",
            source: "GPU-01",
            metric: "test",
            detectedAt: Date.now(),
            occurrences: 1,
            trend: "rising",
          },
        ],
      });

      const { result } = renderHook(() => useAISuggestion());

      expect(result.current.patterns.length).toBe(1);

      act(() => {
        result.current.dismissPattern("pat-1");
      });

      expect(result.current.patterns).toEqual([]);
    });
  });

  describe("applyRecommendation", () => {
    it("should handle apply for non-existent recommendation", async () => {
      const { result } = renderHook(() => useAISuggestion());

      await act(async () => {
        await result.current.applyRecommendation("non-existent");
      });

      expect(result.current.recommendations).toEqual([]);
    });
  });
});
