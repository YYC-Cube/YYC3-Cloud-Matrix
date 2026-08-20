/**
 * @file: metrics-slice.test.ts
 * @description: YYC³ Metrics Slice 单元测试 · 模型性能/分布/雷达图
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMetricsSlice } from '../../store/slices/metrics-slice';
import type { ModelPerfEntry, ModelDistEntry, RadarEntry } from '../../store/slices/metrics-slice';

describe('useMetricsSlice', () => {
  beforeEach(() => {
    useMetricsSlice.getState().resetAll();
  });

  afterEach(() => {
    useMetricsSlice.getState().resetAll();
  });

  describe('初始状态', () => {
    it('应该包含5个默认模型性能条目', () => {
      const { modelPerf } = useMetricsSlice.getState();
      expect(modelPerf).toHaveLength(5);
    });

    it('modelPerf 默认值应该包含 LLaMA-70B', () => {
      const { modelPerf } = useMetricsSlice.getState();
      const llama = modelPerf.find(m => m.model === 'LLaMA-70B');
      expect(llama).toBeDefined();
      expect(llama?.accuracy).toBe(94.2);
      expect(llama?.speed).toBe(85);
    });

    it('应该包含5个默认模型分布条目', () => {
      const { modelDist } = useMetricsSlice.getState();
      expect(modelDist).toHaveLength(5);
    });

    it('modelDist 总和应该等于100', () => {
      const { modelDist } = useMetricsSlice.getState();
      const total = modelDist.reduce((sum, m) => sum + m.value, 0);
      expect(total).toBe(100);
    });

    it('应该包含6个雷达图指标', () => {
      const { radarData } = useMetricsSlice.getState();
      expect(radarData).toHaveLength(6);
    });

    it('radarData 应该包含 inferenceSpeed 指标', () => {
      const { radarData } = useMetricsSlice.getState();
      const inferenceSpeed = radarData.find(r => r.metric === 'inferenceSpeed');
      expect(inferenceSpeed).toBeDefined();
      expect(inferenceSpeed?.A).toBe(92);
      expect(inferenceSpeed?.B).toBe(85);
    });
  });

  describe('setModelPerf', () => {
    it('应该替换整个 modelPerf 数组', () => {
      const newModelPerf: ModelPerfEntry[] = [
        { id: 'new-1', model: 'GPT-4', accuracy: 98, speed: 90, memory: 80, cost: 70 },
      ];

      useMetricsSlice.getState().setModelPerf(newModelPerf);

      const { modelPerf } = useMetricsSlice.getState();
      expect(modelPerf).toHaveLength(1);
      expect(modelPerf[0].model).toBe('GPT-4');
    });

    it('应该接受空数组', () => {
      useMetricsSlice.getState().setModelPerf([]);

      const { modelPerf } = useMetricsSlice.getState();
      expect(modelPerf).toHaveLength(0);
    });

    it('应该支持多条目设置', () => {
      const multiEntries: ModelPerfEntry[] = [
        { id: 'm1', model: 'Model A', accuracy: 90, speed: 80, memory: 70, cost: 60 },
        { id: 'm2', model: 'Model B', accuracy: 95, speed: 85, memory: 75, cost: 65 },
        { id: 'm3', model: 'Model C', accuracy: 88, speed: 90, memory: 68, cost: 72 },
      ];

      useMetricsSlice.getState().setModelPerf(multiEntries);

      const { modelPerf } = useMetricsSlice.getState();
      expect(modelPerf).toHaveLength(3);
    });
  });

  describe('updateModelPerf', () => {
    it('应该更新指定 ID 的模型性能', () => {
      useMetricsSlice.getState().updateModelPerf('mp-1', {
        accuracy: 99,
        speed: 95,
      });

      const { modelPerf } = useMetricsSlice.getState();
      const updated = modelPerf.find(m => m.id === 'mp-1');

      expect(updated?.accuracy).toBe(99);
      expect(updated?.speed).toBe(95);
      expect(updated?.memory).toBe(78); // 未更新的字段保持不变
    });

    it('更新不存在的 ID 不应影响其他条目', () => {
      const originalLength = useMetricsSlice.getState().modelPerf.length;

      useMetricsSlice.getState().updateModelPerf('non-existent', {
        accuracy: 99,
      });

      const { modelPerf } = useMetricsSlice.getState();
      expect(modelPerf).toHaveLength(originalLength);
    });

    it('应该只更新提供的字段（部分更新）', () => {
      useMetricsSlice.getState().updateModelPerf('mp-2', { cost: 99 });

      const { modelPerf } = useMetricsSlice.getState();
      const updated = modelPerf.find(m => m.id === 'mp-2');

      expect(updated?.cost).toBe(99);
      expect(updated?.accuracy).toBe(92.8); // 其他字段不变
      expect(updated?.speed).toBe(88);
    });

    it('应该支持更新 model 名称', () => {
      useMetricsSlice.getState().updateModelPerf('mp-3', {
        model: 'DeepSeek-V4',
      });

      const { modelPerf } = useMetricsSlice.getState();
      const updated = modelPerf.find(m => m.id === 'mp-3');

      expect(updated?.model).toBe('DeepSeek-V4');
    });
  });

  describe('setModelDist', () => {
    it('应该替换整个 modelDist 数组', () => {
      const newDist: ModelDistEntry[] = [
        { id: 'd1', name: 'GPT-4', value: 50 },
        { id: 'd2', name: 'Claude', value: 30 },
        { id: 'd3', name: 'Gemini', value: 20 },
      ];

      useMetricsSlice.getState().setModelDist(newDist);

      const { modelDist } = useMetricsSlice.getState();
      expect(modelDist).toHaveLength(3);
      expect(modelDist[0].name).toBe('GPT-4');
    });

    it('应该接受空分布数据', () => {
      useMetricsSlice.getState().setModelDist([]);

      const { modelDist } = useMetricsSlice.getState();
      expect(modelDist).toHaveLength(0);
    });

    it('应该正确设置单条目分布', () => {
      const singleDist: ModelDistEntry[] = [
        { id: 'single', name: 'Only Model', value: 100 },
      ];

      useMetricsSlice.getState().setModelDist(singleDist);

      const { modelDist } = useMetricsSlice.getState();
      expect(modelDist).toHaveLength(1);
      expect(modelDist[0].value).toBe(100);
    });
  });

  describe('setRadarData', () => {
    it('应该替换整个 radarData 数组', () => {
      const newRadar: RadarEntry[] = [
        { id: 'r1', metric: 'customMetric1', A: 80, B: 75 },
        { id: 'r2', metric: 'customMetric2', A: 90, B: 85 },
      ];

      useMetricsSlice.getState().setRadarData(newRadar);

      const { radarData } = useMetricsSlice.getState();
      expect(radarData).toHaveLength(2);
      expect(radarData[0].metric).toBe('customMetric1');
    });

    it('应该接受空雷达数据', () => {
      useMetricsSlice.getState().setRadarData([]);

      const { radarData } = useMetricsSlice.getState();
      expect(radarData).toHaveLength(0);
    });

    it('应该支持自定义指标数量', () => {
      const customRadar: RadarEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `r${i + 1}`,
        metric: `metric${i + 1}`,
        A: Math.floor(Math.random() * 100),
        B: Math.floor(Math.random() * 100),
      }));

      useMetricsSlice.getState().setRadarData(customRadar);

      const { radarData } = useMetricsSlice.getState();
      expect(radarData).toHaveLength(10);
    });
  });

  describe('updateRadarData', () => {
    it('应该更新指定 ID 的雷达指标', () => {
      useMetricsSlice.getState().updateRadarData('rd-1', {
        A: 99,
        B: 98,
      });

      const { radarData } = useMetricsSlice.getState();
      const updated = radarData.find(r => r.id === 'rd-1');

      expect(updated?.A).toBe(99);
      expect(updated?.B).toBe(98);
    });

    it('更新不存在的 ID 不应抛出错误', () => {
      expect(() => {
        useMetricsSlice.getState().updateRadarData('non-existent', {
          A: 99,
        });
      }).not.toThrow();

      const { radarData } = useMetricsSlice.getState();
      expect(radarData).toHaveLength(6); // 原始数量不变
    });

    it('应该支持部分字段更新', () => {
      useMetricsSlice.getState().updateRadarData('rd-2', { A: 100 });

      const { radarData } = useMetricsSlice.getState();
      const updated = radarData.find(r => r.id === 'rd-2');

      expect(updated?.A).toBe(100);
      expect(updated?.B).toBe(94); // B 字段不变
    });

    it('应该支持更新 metric 名称', () => {
      useMetricsSlice.getState().updateRadarData('rd-3', {
        metric: 'customMemoryEfficiency',
      });

      const { radarData } = useMetricsSlice.getState();
      const updated = radarData.find(r => r.id === 'rd-3');

      expect(updated?.metric).toBe('customMemoryEfficiency');
    });
  });

  describe('resetAll', () => {
    it('应该将所有状态重置为默认值', () => {
      // 先修改所有状态
      useMetricsSlice.getState().setModelPerf([]);
      useMetricsSlice.getState().setModelDist([]);
      useMetricsSlice.getState().setRadarData([]);

      // 执行重置
      useMetricsSlice.getState().resetAll();

      // 验证恢复到默认值
      const { modelPerf, modelDist, radarData } = useMetricsSlice.getState();

      expect(modelPerf).toHaveLength(5);
      expect(modelDist).toHaveLength(5);
      expect(radarData).toHaveLength(6);
    });

    it('重置后 modelPerf 应该包含原始默认值', () => {
      // 修改数据
      useMetricsSlice.getState().setModelPerf([
        { id: 'temp', model: 'Temp', accuracy: 50, speed: 50, memory: 50, cost: 50 },
      ]);

      // 重置
      useMetricsSlice.getState().resetAll();

      // 验证
      const { modelPerf } = useMetricsSlice.getState();
      const llama = modelPerf.find(m => m.model === 'LLaMA-70B');

      expect(llama).toBeDefined();
      expect(llama?.accuracy).toBe(94.2);
    });

    it('重置后 modelDist 总和应该为100', () => {
      // 修改为无效分布
      useMetricsSlice.getState().setModelDist([
        { id: 'x', name: 'Invalid', value: 999 },
      ]);

      // 重置
      useMetricsSlice.getState().resetAll();

      // 验证
      const { modelDist } = useMetricsSlice.getState();
      const total = modelDist.reduce((sum, m) => sum + m.value, 0);

      expect(total).toBe(100);
    });

    it('重置后 radarData 应该包含 inferenceSpeed', () => {
      // 清空雷达数据
      useMetricsSlice.getState().setRadarData([]);

      // 重置
      useMetricsSlice.getState().resetAll();

      // 验证
      const { radarData } = useMetricsSlice.getState();
      const inferenceSpeed = radarData.find(r => r.metric === 'inferenceSpeed');

      expect(inferenceSpeed).toBeDefined();
      expect(inferenceSpeed?.A).toBe(92);
      expect(inferenceSpeed?.B).toBe(85);
    });
  });

  describe('边界情况和数据完整性', () => {
    it('modelPerf accuracy 应该在 0-100 范围内（业务规则验证）', () => {
      const { modelPerf } = useMetricsSlice.getState();

      modelPerf.forEach(entry => {
        expect(entry.accuracy).toBeGreaterThanOrEqual(0);
        expect(entry.accuracy).toBeLessThanOrEqual(100);
      });
    });

    it('modelDist value 应该是正数', () => {
      const { modelDist } = useMetricsSlice.getState();

      modelDist.forEach(entry => {
        expect(entry.value).toBeGreaterThan(0);
      });
    });

    it('radarData A/B 值应该在 0-100 范围内', () => {
      const { radarData } = useMetricsSlice.getState();

      radarData.forEach(entry => {
        expect(entry.A).toBeGreaterThanOrEqual(0);
        expect(entry.A).toBeLessThanOrEqual(100);
        expect(entry.B).toBeGreaterThanOrEqual(0);
        expect(entry.B).toBeLessThanOrEqual(100);
      });
    });

    it('所有条目应该有唯一 ID', () => {
      const { modelPerf, modelDist, radarData } = useMetricsSlice.getState();

      const perfIds = modelPerf.map(m => m.id);
      const distIds = modelDist.map(m => m.id);
      const radarIds = radarData.map(r => r.id);

      expect(new Set(perfIds).size).toBe(perfIds.length);
      expect(new Set(distIds).size).toBe(distIds.length);
      expect(new Set(radarIds).size).toBe(radarIds.length);
    });
  });
});
