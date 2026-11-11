/**
 * @file: metrics-slice.ts
 * @description: YYC³ 指标数据 Slice · 统一图表展示数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-16
 * @status: active
 * @tags: [store],[slice],[metrics]
 *
 * @brief: 合并原 modelPerfStore + modelDistStore + radarStore 为单一 Slice
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModelPerfEntry, ModelDistEntry, RadarEntry } from '../../types';

// Re-export for backward compatibility
export type { ModelPerfEntry, ModelDistEntry, RadarEntry };

interface MetricsSlice {
  modelPerf: ModelPerfEntry[];
  modelDist: ModelDistEntry[];
  radarData: RadarEntry[];

  setModelPerf: (data: ModelPerfEntry[]) => void;
  updateModelPerf: (id: string, updates: Partial<ModelPerfEntry>) => void;
  setModelDist: (data: ModelDistEntry[]) => void;
  setRadarData: (data: RadarEntry[]) => void;
  updateRadarData: (id: string, updates: Partial<RadarEntry>) => void;
  resetAll: () => void;
}

/**
 * 2026-11-11 禁止硬编码政策：DEFAULT_* 假图表种子已清除。
 * 真实来源：Dashboard 真连态由 WS 节点聚合（liveModelDist）；
 * 未连接态展示用户在「系统管理 → 数据总控」中自行维护的条目（初始为空）。
 */
const DEFAULT_MODEL_PERF: ModelPerfEntry[] = [];
const DEFAULT_MODEL_DIST: ModelDistEntry[] = [];
const DEFAULT_RADAR: RadarEntry[] = [];

/** 历史假条目 ID — persist 迁移时一次性清除 */
const LEGACY_FAKE_METRIC_IDS = new Set([
  "mp-1", "mp-2", "mp-3", "mp-4", "mp-5",
  "md-1", "md-2", "md-3", "md-4", "md-5",
  "rd-1", "rd-2", "rd-3", "rd-4", "rd-5", "rd-6",
]);

export const useMetricsSlice = create<MetricsSlice>()(
  persist(
    (set) => ({
      modelPerf: DEFAULT_MODEL_PERF,
      modelDist: DEFAULT_MODEL_DIST,
      radarData: DEFAULT_RADAR,

      setModelPerf: (data) => set({ modelPerf: data }),
      updateModelPerf: (id, updates) => set((s) => ({
        modelPerf: s.modelPerf.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
      setModelDist: (data) => set({ modelDist: data }),
      setRadarData: (data) => set({ radarData: data }),
      updateRadarData: (id, updates) => set((s) => ({
        radarData: s.radarData.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),
      resetAll: () => set({
        modelPerf: DEFAULT_MODEL_PERF,
        modelDist: DEFAULT_MODEL_DIST,
        radarData: DEFAULT_RADAR,
      }),
    }),
    {
      name: 'yyc3-metrics-slice',
      partialize: (state) => ({
        modelPerf: state.modelPerf,
        modelDist: state.modelDist,
        radarData: state.radarData,
      }),
      version: 1,
      migrate: (persisted, version) => {
        // v0→v1：清除历史假图表种子（按 ID 精确识别，保留用户自建条目）
        const state = persisted as {
          modelPerf?: ModelPerfEntry[];
          modelDist?: ModelDistEntry[];
          radarData?: RadarEntry[];
        };
        if (version < 1) {
          for (const key of ["modelPerf", "modelDist", "radarData"] as const) {
            if (Array.isArray(state[key])) {
              state[key] = (state[key] as Array<{ id: string }>).filter(
                (e) => !LEGACY_FAKE_METRIC_IDS.has(e.id)
              ) as never;
            }
          }
        }
        return state;
      },
    }
  )
);
