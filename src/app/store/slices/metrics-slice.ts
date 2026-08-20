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

const DEFAULT_MODEL_PERF: ModelPerfEntry[] = [
  { id: "mp-1", model: "LLaMA-70B",    accuracy: 94.2, speed: 85, memory: 78, cost: 62 },
  { id: "mp-2", model: "Qwen-72B",     accuracy: 92.8, speed: 88, memory: 72, cost: 68 },
  { id: "mp-3", model: "DeepSeek-V3",  accuracy: 96.1, speed: 76, memory: 85, cost: 55 },
  { id: "mp-4", model: "GLM-4",        accuracy: 91.5, speed: 92, memory: 65, cost: 75 },
  { id: "mp-5", model: "Mixtral-8x7B", accuracy: 89.3, speed: 95, memory: 60, cost: 82 },
];

const DEFAULT_MODEL_DIST: ModelDistEntry[] = [
  { id: "md-1", name: "LLaMA-70B",   value: 35 },
  { id: "md-2", name: "Qwen-72B",    value: 25 },
  { id: "md-3", name: "DeepSeek-V3", value: 20 },
  { id: "md-4", name: "GLM-4",       value: 12 },
  { id: "md-5", name: "other",       value: 8 },
];

const DEFAULT_RADAR: RadarEntry[] = [
  { id: "rd-1", metric: "inferenceSpeed",    A: 92, B: 85 },
  { id: "rd-2", metric: "modelAccuracy",     A: 88, B: 94 },
  { id: "rd-3", metric: "memoryEfficiency",  A: 95, B: 78 },
  { id: "rd-4", metric: "throughput",        A: 90, B: 82 },
  { id: "rd-5", metric: "reliability",       A: 96, B: 91 },
  { id: "rd-6", metric: "latency",           A: 85, B: 88 },
];

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
    }
  )
);
