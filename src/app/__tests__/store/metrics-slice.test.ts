/**
 * @file: metrics-slice.test.ts
 * @description: YYC³ Metrics Slice 单元测试 · 模型性能/分布/雷达图（v2 零种子版）
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-16
 * @updated: 2026-11-11
 * @status: active
 * @tags: [store],[test],[no-hardcode]
 *
 * @brief: 2026-11-11 禁止硬编码政策后重写——初始为空、resetAll 清空、
 * 历史假种子（mp-/md-/rd- 前缀 ID）在 persist 迁移时按 ID 一次性清除。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMetricsSlice } from '../../store/slices/metrics-slice';
import type { ModelPerfEntry, ModelDistEntry, RadarEntry } from '../../store/slices/metrics-slice';

const PERF: ModelPerfEntry[] = [
  { id: 'u-1', model: 'Model-A', accuracy: 90, speed: 80, memory: 70, cost: 60 },
  { id: 'u-2', model: 'Model-B', accuracy: 95, speed: 85, memory: 75, cost: 65 },
];
const DIST: ModelDistEntry[] = [
  { id: 'u-1', name: 'Model-A', value: 60 },
  { id: 'u-2', name: 'Model-B', value: 40 },
];
const RADAR: RadarEntry[] = [
  { id: 'u-1', metric: 'speed', A: 80, B: 75 },
  { id: 'u-2', metric: 'accuracy', A: 90, B: 85 },
];

describe('useMetricsSlice（零种子）', () => {
  beforeEach(() => {
    useMetricsSlice.getState().resetAll();
  });

  afterEach(() => {
    useMetricsSlice.getState().resetAll();
  });

  describe('初始状态', () => {
    it('modelPerf 初始为空（无内置假条目）', () => {
      expect(useMetricsSlice.getState().modelPerf).toEqual([]);
    });

    it('modelDist 初始为空', () => {
      expect(useMetricsSlice.getState().modelDist).toEqual([]);
    });

    it('radarData 初始为空', () => {
      expect(useMetricsSlice.getState().radarData).toEqual([]);
    });
  });

  describe('setModelPerf', () => {
    it('替换整个数组', () => {
      useMetricsSlice.getState().setModelPerf(PERF);
      expect(useMetricsSlice.getState().modelPerf).toHaveLength(2);
      expect(useMetricsSlice.getState().modelPerf[0].model).toBe('Model-A');
    });

    it('接受空数组', () => {
      useMetricsSlice.getState().setModelPerf(PERF);
      useMetricsSlice.getState().setModelPerf([]);
      expect(useMetricsSlice.getState().modelPerf).toHaveLength(0);
    });
  });

  describe('updateModelPerf', () => {
    it('更新指定 ID 且未提供字段保持不变', () => {
      useMetricsSlice.getState().setModelPerf(PERF);
      useMetricsSlice.getState().updateModelPerf('u-1', { accuracy: 99 });

      const updated = useMetricsSlice.getState().modelPerf.find((m) => m.id === 'u-1');
      expect(updated?.accuracy).toBe(99);
      expect(updated?.speed).toBe(80);
    });

    it('更新不存在的 ID 不影响其他条目', () => {
      useMetricsSlice.getState().setModelPerf(PERF);
      useMetricsSlice.getState().updateModelPerf('non-existent', { accuracy: 1 });
      expect(useMetricsSlice.getState().modelPerf).toHaveLength(2);
    });

    it('支持更新 model 名称', () => {
      useMetricsSlice.getState().setModelPerf(PERF);
      useMetricsSlice.getState().updateModelPerf('u-2', { model: 'Model-B2' });
      expect(useMetricsSlice.getState().modelPerf.find((m) => m.id === 'u-2')?.model).toBe('Model-B2');
    });
  });

  describe('setModelDist', () => {
    it('替换整个数组', () => {
      useMetricsSlice.getState().setModelDist(DIST);
      const total = useMetricsSlice.getState().modelDist.reduce((s, m) => s + m.value, 0);
      expect(total).toBe(100);
    });

    it('接受空分布数据', () => {
      useMetricsSlice.getState().setModelDist(DIST);
      useMetricsSlice.getState().setModelDist([]);
      expect(useMetricsSlice.getState().modelDist).toHaveLength(0);
    });
  });

  describe('setRadarData / updateRadarData', () => {
    it('替换整个数组', () => {
      useMetricsSlice.getState().setRadarData(RADAR);
      expect(useMetricsSlice.getState().radarData).toHaveLength(2);
    });

    it('更新指定 ID 的雷达指标', () => {
      useMetricsSlice.getState().setRadarData(RADAR);
      useMetricsSlice.getState().updateRadarData('u-1', { A: 99, B: 98 });
      const updated = useMetricsSlice.getState().radarData.find((r) => r.id === 'u-1');
      expect(updated?.A).toBe(99);
      expect(updated?.B).toBe(98);
    });

    it('更新不存在的 ID 不抛出错误且不影响现有条目', () => {
      useMetricsSlice.getState().setRadarData(RADAR);
      expect(() => {
        useMetricsSlice.getState().updateRadarData('non-existent', { A: 1 });
      }).not.toThrow();
      expect(useMetricsSlice.getState().radarData).toHaveLength(2);
    });

    it('支持更新 metric 名称', () => {
      useMetricsSlice.getState().setRadarData(RADAR);
      useMetricsSlice.getState().updateRadarData('u-2', { metric: 'efficiency' });
      expect(useMetricsSlice.getState().radarData.find((r) => r.id === 'u-2')?.metric).toBe('efficiency');
    });
  });

  describe('resetAll', () => {
    it('重置后三组数据均为空（不恢复任何内置假条目）', () => {
      useMetricsSlice.getState().setModelPerf(PERF);
      useMetricsSlice.getState().setModelDist(DIST);
      useMetricsSlice.getState().setRadarData(RADAR);

      useMetricsSlice.getState().resetAll();

      const { modelPerf, modelDist, radarData } = useMetricsSlice.getState();
      expect(modelPerf).toEqual([]);
      expect(modelDist).toEqual([]);
      expect(radarData).toEqual([]);
    });
  });

  describe('persist 迁移', () => {
    it('v0→v1 清除历史假种子 ID，保留用户自建条目', async () => {
      localStorage.setItem('yyc3-metrics-slice', JSON.stringify({
        state: {
          modelPerf: [
            { id: 'mp-1', model: 'LLaMA-70B', accuracy: 94.2, speed: 85, memory: 78, cost: 62 },
            { id: 'u-mine', model: 'MyModel', accuracy: 88, speed: 77, memory: 66, cost: 55 },
          ],
          modelDist: [
            { id: 'md-1', name: 'LLaMA-70B', value: 35 },
            { id: 'u-mine', name: 'MyModel', value: 100 },
          ],
          radarData: [
            { id: 'rd-1', metric: 'inferenceSpeed', A: 92, B: 85 },
            { id: 'u-mine', metric: 'custom', A: 50, B: 50 },
          ],
        },
        version: 0,
      }));

      await useMetricsSlice.persist.rehydrate();

      const { modelPerf, modelDist, radarData } = useMetricsSlice.getState();
      expect(modelPerf.map((m) => m.id)).toEqual(['u-mine']);
      expect(modelDist.map((m) => m.id)).toEqual(['u-mine']);
      expect(radarData.map((r) => r.id)).toEqual(['u-mine']);
    });
  });
});
