/**
 * @file: model-slice.test.ts
 * @description: YYC³ Model Slice 单元测试 · 部署模型管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useModelSlice } from '../../store/slices/model-slice';
import type { DeployedModel } from '../../types';

const DEFAULT_MODELS: DeployedModel[] = [
  { id: "dm-1", name: "LLaMA-70B",    version: "v2.1", size: "140GB", status: "deployed" as any,  gpu: "GPU-A100-01" },
  { id: "dm-2", name: "Qwen-72B",     version: "v1.5", size: "145GB", status: "deployed" as any,  gpu: "GPU-A100-02" },
  { id: "dm-3", name: "DeepSeek-V3",  version: "v3.0", size: "180GB", status: "deploying" as any, gpu: "GPU-A100-03" },
  { id: "dm-4", name: "GLM-4",        version: "v4.0", size: "92GB",  status: "deployed" as any,  gpu: "GPU-H100-01" },
  { id: "dm-5", name: "Mixtral-8x7B", version: "v0.1", size: "95GB",  status: "standby" as any,   gpu: "-" },
];

describe('useModelSlice', () => {
  beforeEach(() => {
    // 强制重置到默认模型列表（避免 Date.now() ID 冲突和状态污染）
    useModelSlice.setState({ models: [...DEFAULT_MODELS] });
  });

  describe('初始状态', () => {
    it('应该包含5个默认模型', () => {
      const { models } = useModelSlice.getState();
      expect(models).toHaveLength(5);
    });

    it('应该包含 LLaMA-70B 模型', () => {
      const { models } = useModelSlice.getState();
      const llama = models.find(m => m.name === 'LLaMA-70B');
      expect(llama).toBeDefined();
      expect(llama?.version).toBe('v2.1');
      expect(llama?.status).toBe('deployed');
      expect(llama?.gpu).toBe('GPU-A100-01');
    });

    it('应该包含 Qwen-72B 模型', () => {
      const { models } = useModelSlice.getState();
      const qwen = models.find(m => m.name === 'Qwen-72B');
      expect(qwen).toBeDefined();
      expect(qwen?.version).toBe('v1.5');
      expect(qwen?.size).toBe('145GB');
    });

    it('应该包含正在部署的模型', () => {
      const { models } = useModelSlice.getState();
      const deploying = models.find(m => m.status === 'deploying');
      expect(deploying).toBeDefined();
      expect(deploying?.name).toBe('DeepSeek-V3');
    });

    it('应该包含待命状态的模型', () => {
      const { models } = useModelSlice.getState();
      const standby = models.find(m => m.status === 'standby');
      expect(standby).toBeDefined();
      expect(standby?.name).toBe('Mixtral-8x7B');
      expect(standby?.gpu).toBe('-');
    });

    it('所有模型都应该有有效的版本号', () => {
      const { models } = useModelSlice.getState();

      models.forEach(model => {
        expect(model.version).toMatch(/^v\d+\.\d+$/); // 版本号格式：vX.Y
      });
    });

    it('所有模型都应该有有效的大小格式', () => {
      const { models } = useModelSlice.getState();

      models.forEach(model => {
        expect(model.size).toMatch(/^\d+(GB|TB|MB)$/); // 大小格式：数字 + 单位
      });
    });
  });

  describe('addModel', () => {
    it('应该添加新模型并自动生成 ID', () => {
      const newModel: Omit<DeployedModel, 'id'> = {
        name: 'Test-Model',
        version: 'v1.0',
        size: '10GB',
        status: 'standby' as any,
        gpu: '-',
      };

      useModelSlice.getState().addModel(newModel);

      const { models } = useModelSlice.getState();
      const added = models.find(m => m.name === 'Test-Model');

      expect(added).toBeDefined();
      expect(added?.version).toBe('v1.0');
      expect(added?.id).toMatch(/^dm-\d+$/);
    });

    it('应该增加模型总数', () => {
      const beforeCount = useModelSlice.getState().models.length;

      useModelSlice.getState().addModel({
        name: 'Count-Test',
        version: 'v0.1',
        size: '5GB',
        status: 'standby' as any,
        gpu: '-',
      });

      expect(useModelSlice.getState().models.length).toBe(beforeCount + 1);
    });

    it('应该支持不同的状态类型', () => {
      const validStatuses = ['deployed', 'deploying', 'standby', 'error'] as const;

      validStatuses.forEach(status => {
        useModelSlice.getState().addModel({
          name: `Status-${status}`,
          version: 'v1.0',
          size: '10GB',
          status: status as any,
          gpu: '-',
        });
      });

      const { models } = useModelSlice.getState();
      validStatuses.forEach(status => {
        const model = models.find(m => m.name === `Status-${status}`);
        expect(model?.status).toBe(status);
      });
    });
  });

  describe('updateModel', () => {
    it('应该更新指定 ID 的模型信息', () => {
      const modelId = useModelSlice.getState().models[0].id;

      useModelSlice.getState().updateModel(modelId, {
        version: 'v3.0',
        size: '200GB',
      });

      const updated = useModelSlice.getState().models.find(m => m.id === modelId);

      expect(updated?.version).toBe('v3.0');
      expect(updated?.size).toBe('200GB');
      expect(updated?.name).toBe('LLaMA-70B'); // 未更新字段保持不变
    });

    it('更新不存在的 ID 不应影响其他模型', () => {
      const beforeCount = useModelSlice.getState().models.length;

      useModelSlice.getState().updateModel('non-existent', {
        version: 'v99.9',
      });

      expect(useModelSlice.getState().models.length).toBe(beforeCount);
    });

    it('应该支持更新 GPU 分配', () => {
      const modelId = useModelSlice.getState().models.find(m => m.name === 'Mixtral-8x7B')?.id;

      if (modelId) {
        useModelSlice.getState().updateModel(modelId, {
          gpu: 'GPU-H100-02',
          status: 'deployed' as any,
        });

        const updated = useModelSlice.getState().models.find(m => m.id === modelId);

        expect(updated?.gpu).toBe('GPU-H100-02');
        expect(updated?.status).toBe('deployed');
      }
    });

    it('应该支持部分字段更新', () => {
      const modelId = useModelSlice.getState().models[1].id;

      useModelSlice.getState().updateModel(modelId, {
        status: 'error' as any,
      });

      const updated = useModelSlice.getState().models.find(m => m.id === modelId);

      expect(updated?.status).toBe('error');
      expect(updated?.size).toBe('145GB'); // 其他字段不变
    });
  });

  describe('removeModel', () => {
    it('应该删除指定 ID 的模型', () => {
      // 先添加一个临时模型
      useModelSlice.getState().addModel({
        name: 'To-Delete',
        version: 'v0.1',
        size: '1GB',
        status: 'standby' as any,
        gpu: '-',
      });

      const tempModel = useModelSlice.getState().models.find(m => m.name === 'To-Delete');

      if (tempModel) {
        const beforeCount = useModelSlice.getState().models.length;

        useModelSlice.getState().removeModel(tempModel.id);

        expect(useModelSlice.getState().models.length).toBe(beforeCount - 1);
        expect(useModelSlice.getState().models.find(m => m.name === 'To-Delete')).toBeUndefined();
      }
    });

    it('删除不存在的 ID 不应报错', () => {
      expect(() => {
        useModelSlice.getState().removeModel('non-existent');
      }).not.toThrow();
    });

    it('删除后其他模型不受影响', () => {
      // 添加一个待删除的模型
      useModelSlice.getState().addModel({
        name: 'Remove-Me',
        version: 'v0.1',
        size: '1GB',
        status: 'standby' as any,
        gpu: '-',
      });

      const toDelete = useModelSlice.getState().models.find(m => m.name === 'Remove-Me');

      if (toDelete) {
        // 记录当前所有模型（除要删除的）
        const otherModelsBefore = useModelSlice.getState().models.filter(m => m.id !== toDelete.id);

        useModelSlice.getState().removeModel(toDelete.id);

        // 验证其他模型仍然存在且未被修改
        otherModelsBefore.forEach(original => {
          const stillExists = useModelSlice.getState().models.find(m => m.id === original.id);
          expect(stillExists).toBeDefined();
          expect(stillExists?.name).toBe(original.name);
          expect(stillExists?.version).toBe(original.version);
        });
      }
    });
  });

  describe('getModelById', () => {
    it('应该返回指定 ID 的模型', () => {
      const targetModel = useModelSlice.getState().models[0];
      const found = useModelSlice.getState().getModelById(targetModel.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(targetModel.id);
      expect(found?.name).toBe(targetModel.name);
    });

    it('对于不存在的 ID 应该返回 undefined', () => {
      const result = useModelSlice.getState().getModelById('non-existent');
      expect(result).toBeUndefined();
    });

    it('应该返回模型的完整副本', () => {
      const original = useModelSlice.getState().models[0];
      const found = useModelSlice.getState().getModelById(original.id);

      if (found) {
        expect(found).toEqual(original);
      }
    });
  });

  describe('边界情况和数据完整性', () => {
    it('所有模型名称应该是唯一的', () => {
      const { models } = useModelSlice.getState();
      const names = models.map(m => m.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it('默认模型 ID 应该是唯一的', () => {
      const { models } = useModelSlice.getState();
      // beforeEach 已保证只有5个默认模型，直接检查
      const ids = models.map(m => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('状态应该是有效的值', () => {
      const validStatuses = ['deployed', 'deploying', 'standby', 'error'];
      const { models } = useModelSlice.getState();

      models.forEach(model => {
        expect(validStatuses).toContain(model.status);
      });
    });

    it('默认模型的 GPU 分配应该是有效的格式或占位符', () => {
      const { models } = useModelSlice.getState();

      models.forEach(model => {
        // GPU 应该是 "GPU-XXX-YY" 格式（XXX可含字母数字）或 "-" 占位符
        const isValidGpu = model.gpu === '-' || /^GPU-[A-Z0-9]+-\d+$/.test(model.gpu);
        expect(isValidGpu).toBe(true);
      });
    });
  });

  describe('集成场景', () => {
    it('完整的模型生命周期：添加 → 更新 → 删除', () => {
      // 1. 添加新模型
      useModelSlice.getState().addModel({
        name: 'Lifecycle-Model',
        version: 'v1.0',
        size: '50GB',
        status: 'standby' as any,
        gpu: '-',
      });

      const newModel = useModelSlice.getState().models.find(m => m.name === 'Lifecycle-Model');
      expect(newModel).toBeDefined();

      if (newModel) {
        // 2. 更新模型信息
        useModelSlice.getState().updateModel(newModel.id, {
          version: 'v2.0',
          size: '100GB',
          gpu: 'GPU-A100-04',
          status: 'deployed' as any,
        });

        let updated = useModelSlice.getState().models.find(m => m.id === newModel.id);
        expect(updated?.version).toBe('v2.0');
        expect(updated?.size).toBe('100GB');
        expect(updated?.gpu).toBe('GPU-A100-04');
        expect(updated?.status).toBe('deployed');

        // 3. 验证可以通过 ID 找到
        let found = useModelSlice.getState().getModelById(newModel.id);
        expect(found?.name).toBe('Lifecycle-Model');
        expect(found?.version).toBe('v2.0');

        // 4. 删除模型
        useModelSlice.getState().removeModel(newModel.id);
        expect(useModelSlice.getState().models.find(m => m.name === 'Lifecycle-Model')).toBeUndefined();

        // 5. 删除后通过 ID 查找应该返回 undefined
        let afterDelete = useModelSlice.getState().getModelById(newModel.id);
        expect(afterDelete).toBeUndefined();
      }
    });

    it('批量管理多个模型', () => {
      const initialCount = useModelSlice.getState().models.length;

      // 批量添加3个模型
      for (let i = 1; i <= 3; i++) {
        useModelSlice.getState().addModel({
          name: `Batch-Model-${i}`,
          version: `v${i}.0`,
          size: `${i * 10}GB`,
          status: 'deploying' as any,
          gpu: `GPU-H100-0${i}`,
        });
      }

      expect(useModelSlice.getState().models.length).toBe(initialCount + 3);

      // 批量更新所有新增模型的状态为 deployed
      const batchModels = useModelSlice.getState().models.filter(
        m => m.name.startsWith('Batch-Model-')
      );

      batchModels.forEach(model => {
        useModelSlice.getState().updateModel(model.id, {
          status: 'deployed' as any,
        });
      });

      // 验证所有批量模型都已部署
      batchModels.forEach(model => {
        const updated = useModelSlice.getState().models.find(m => m.id === model.id);
        expect(updated?.status).toBe('deployed');
      });

      // 批量删除所有新增模型
      batchModels.forEach(model => {
        useModelSlice.getState().removeModel(model.id);
      });

      // 验证所有批量模型都已删除
      batchModels.forEach(model => {
        expect(useModelSlice.getState().models.find(m => m.id === model.id)).toBeUndefined();
      });

      expect(useModelSlice.getState().models.length).toBe(initialCount);
    });

    it('模拟模型部署流程', () => {
      // 1. 添加新模型（初始状态：standby）
      useModelSlice.getState().addModel({
        name: 'New-Deployment',
        version: 'v1.0.0',
        size: '120GB',
        status: 'standby' as any,
        gpu: '-',
      });

      const newModel = useModelSlice.getState().models.find(m => m.name === 'New-Deployment');
      expect(newModel).toBeDefined();

      if (newModel) {
        // 2. 开始部署（分配 GPU，状态改为 deploying）
        useModelSlice.getState().updateModel(newModel.id, {
          gpu: 'GPU-A100-05',
          status: 'deploying' as any,
        });

        let deploying = useModelSlice.getState().models.find(m => m.id === newModel.id);
        expect(deploying?.status).toBe('deploying');
        expect(deploying?.gpu).toBe('GPU-A100-05');

        // 3. 部署完成（状态改为 deployed）
        useModelSlice.getState().updateModel(newModel.id, {
          status: 'deployed' as any,
        });

        let deployed = useModelSlice.getState().models.find(m => m.id === newModel.id);
        expect(deployed?.status).toBe('deployed');

        // 4. 升级版本
        useModelSlice.getState().updateModel(newModel.id, {
          version: 'v2.0.0',
          size: '130GB',
        });

        let upgraded = useModelSlice.getState().models.find(m => m.id === newModel.id);
        expect(upgraded?.version).toBe('v2.0.0');
        expect(upgraded?.size).toBe('130GB');
      }
    });
  });
});
