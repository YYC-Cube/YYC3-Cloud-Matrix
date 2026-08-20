/**
 * @file: useAISuggestion.ts
 * @description: AI 辅助决策 Hook · Zustand slice 的计算层 wrapper
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-18
 * @status: active
 * @tags: [hook],[ai],[suggestion]
 *
 * @brief: AI 辅助决策系统 — Zustand slice 的 React 计算层
 *
 * @details:
 * - v2: 从 createLocalStore 迁移到 useAISuggestionSlice
 * - 提供 useMemo 计算值: overallHealth, sortedPatterns, stats
 * - Hook API 不变，AISuggestionPanel.tsx 零改动
 *
 * @dependencies: useAISuggestionSlice (Zustand)
 * @exports: useAISuggestion
 */

import { useMemo, useCallback } from 'react';
import { useAISuggestionSlice } from '../store/slices/ai-suggestion-slice';
import type { PatternSeverity } from '../types';

export function useAISuggestion() {
  const patterns = useAISuggestionSlice((s) => s.patterns);
  const recommendations = useAISuggestionSlice((s) => s.recommendations);
  const isAnalyzing = useAISuggestionSlice((s) => s.isAnalyzing);
  const lastAnalyzedAt = useAISuggestionSlice((s) => s.lastAnalyzedAt);
  const enabledAutoSuggestion = useAISuggestionSlice((s) => s.enabledAutoSuggestion);

  const overallHealth = useMemo(() => {
    if (patterns.length === 0) { return 100; }
    const severityWeight: Record<PatternSeverity, number> = {
      low: 2, medium: 5, high: 10, critical: 20,
    };
    const totalPenalty = patterns.reduce(
      (acc, p) => acc + severityWeight[p.severity], 0
    );
    return Math.max(0, Math.min(100, 100 - totalPenalty));
  }, [patterns]);

  const sortedPatterns = useMemo(() => {
    const order: Record<PatternSeverity, number> = {
      critical: 0, high: 1, medium: 2, low: 3,
    };
    return [...patterns].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [patterns]);

  const stats = useMemo(() => ({
    totalPatterns: patterns.length,
    criticalCount: patterns.filter((p) => p.severity === 'critical').length,
    highCount: patterns.filter((p) => p.severity === 'high').length,
    mediumCount: patterns.filter((p) => p.severity === 'medium').length,
    lowCount: patterns.filter((p) => p.severity === 'low').length,
    totalRecommendations: recommendations.filter((r) => !r.applied).length,
    appliedCount: recommendations.filter((r) => r.applied).length,
  }), [patterns, recommendations]);

  const getRecommendationsForPattern = useCallback(
    (patternId: string) => recommendations.filter((r) => r.patternId === patternId),
    [recommendations]
  );

  return {
    patterns: sortedPatterns,
    recommendations,
    overallHealth,
    isAnalyzing,
    lastAnalyzedAt,
    enabledAutoSuggestion,
    setEnabledAutoSuggestion: useAISuggestionSlice.getState().setEnabledAutoSuggestion,
    stats,
    runAnalysis: useAISuggestionSlice.getState().runAnalysis,
    applyRecommendation: useAISuggestionSlice.getState().applyRecommendation,
    dismissRecommendation: useAISuggestionSlice.getState().dismissRecommendation,
    dismissPattern: useAISuggestionSlice.getState().dismissPattern,
    getRecommendationsForPattern,
  };
}
