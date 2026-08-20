/**
 * @file: node-slice.test.ts
 * @description: YYC³ Node Slice 单元测试 · 覆盖 CRUD、派生状态、合并策略 (Immer 兼容版)
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useNodeSlice } from '../../store/slices/node-slice';
import type { NodeData } from '../../types';

const TEST_NODES: NodeData[] = [
  { id: "GPU-A100-01", status: "active", gpu: 87, mem: 72, temp: 68, model: "LLaMA-70B", tasks: 128 },
  { id: "GPU-A100-02", status: "active", gpu: 92, mem: 85, temp: 74, model: "Qwen-72B", tasks: 156 },
  { id: "GPU-A100-03", status: "inactive", gpu: 0, mem: 5, temp: 32, model: "", tasks: 0 },
];

beforeEach(() => {
  useNodeSlice.getState().setNodes(TEST_NODES, 'initialization');
});

describe('useNodeSlice', () => {
  // ---------- 初始化测试 ----------
  describe('初始化', () => {
    it('应该有默认节点数据', () => {
      const { nodes } = useNodeSlice.getState();
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0]).toHaveProperty('id');
      expect(nodes[0]).toHaveProperty('gpu');
    });

    it('初始来源应该是 initialization', () => {
      const { lastSource } = useNodeSlice.getState();
      expect(lastSource).toBe('initialization');
    });
  });

  // ---------- CRUD 操作 ----------
  describe('CRUD 操作', () => {
    it('setNodes 应该替换所有节点', () => {
      const newNode: NodeData = { id: "NEW-GPU", status: "active", gpu: 50, mem: 50, temp: 50, model: "Test", tasks: 10 };

      useNodeSlice.getState().setNodes([newNode], 'user_edit');

      const { nodes, lastSource } = useNodeSlice.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe("NEW-GPU");
      expect(lastSource).toBe('user_edit');
    });

    it('updateNode 应该更新指定节点的属性', () => {
      useNodeSlice.getState().updateNode("GPU-A100-01", { gpu: 99, model: "NewModel" });

      const { nodes } = useNodeSlice.getState();
      const updated = nodes.find((n) => n.id === "GPU-A100-01");
      expect(updated?.gpu).toBe(99);
      expect(updated?.model).toBe("NewModel");
    });

    it('addNode 应该添加新节点到列表末尾', () => {
      const newNode: NodeData = { id: "GPU-A100-09", status: "active", gpu: 75, mem: 60, temp: 55, model: "Test", tasks: 20 };

      useNodeSlice.getState().addNode(newNode);

      const { nodes } = useNodeSlice.getState();
      expect(nodes).toHaveLength(4);
      expect(nodes[nodes.length - 1].id).toBe("GPU-A100-09");
    });

    it('removeNode 应该删除指定节点', () => {
      useNodeSlice.getState().removeNode("GPU-A100-03");

      const { nodes } = useNodeSlice.getState();
      expect(nodes).toHaveLength(2);
      expect(nodes.find((n) => n.id === "GPU-A100-03")).toBeUndefined();
    });

    it('resetNodes 应该恢复默认值', () => {
      useNodeSlice.getState().setNodes([]);
      useNodeSlice.getState().resetNodes();

      const { nodes, lastSource } = useNodeSlice.getState();
      expect(nodes.length).toBeGreaterThan(0);
      expect(lastSource).toBe('initialization');
    });
  });

  // ---------- 派生状态计算 (Immer 兼容) ----------
  describe('派生状态 (derived)', () => {
    it('activeCount 应该只计算非 inactive 节点', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.activeCount).toBe(2); // 3 个节点，1 个 inactive
    });

    it('totalCount 应该返回所有节点数量', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.totalCount).toBe(3);
    });

    it('avgGpu 应该计算活跃节点的平均 GPU 使用率', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.avgGpu).toBeCloseTo(89.5, 1); // (87 + 92) / 2
    });

    it('avgMem 应该计算活跃节点的平均内存使用率', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.avgMem).toBeCloseTo(78.5, 1); // (72 + 85) / 2
    });

    it('totalTasks 应该累加所有活跃节点的任务数', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.totalTasks).toBe(284); // 128 + 156
    });

    it('activeRatio 格式应该是 "active/total"', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.activeRatio).toBe('2/3');
    });

    it('activeNodes 只包含非 inactive 节点', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.activeNodes).toHaveLength(2);
      expect(derived.activeNodes.every((n: NodeData) => n.status !== 'inactive')).toBe(true);
    });

    it('inactiveNodes 只包含 inactive 节点', () => {
      const { derived } = useNodeSlice.getState();
      expect(derived.inactiveNodes).toHaveLength(1);
      if (derived.inactiveNodes.length > 0) {
        expect(derived.inactiveNodes[0].status).toBe('inactive');
      }
    });

    it('派生状态应该在节点更新后自动重新计算', () => {
      useNodeSlice.getState().updateNode("GPU-A100-01", { gpu: 100 });

      const { derived } = useNodeSlice.getState();
      expect(derived.avgGpu).toBeCloseTo(96, 0); // (100 + 92) / 2 = 96
    });
  });

  // ---------- WebSocket 合并 ----------
  describe('mergeFromWS', () => {
    it('应该处理 WebSocket 数据更新并设置来源', () => {
      const incoming: NodeData[] = [
        { id: "GPU-A100-01", status: "active", gpu: 95, mem: 88, temp: 72, model: "LLaMA-70B", tasks: 200 },
      ];

      useNodeSlice.getState().mergeFromWS(incoming);

      const { lastSource, lastUpdateAt } = useNodeSlice.getState();
      expect(lastSource).toBe('websocket');
      expect(lastUpdateAt).not.toBeNull();
    });

    it('新节点应该被添加到列表中', () => {
      const incoming: NodeData[] = [
        { id: "GPU-H100-02", status: "active", gpu: 80, mem: 70, temp: 60, model: "GLM-4", tasks: 50 },
      ];

      useNodeSlice.getState().mergeFromWS(incoming);

      const { nodes } = useNodeSlice.getState();
      expect(nodes.some((n) => n.id === "GPU-H100-02")).toBe(true);
    });

    it('lastUpdateAt 应该是当前时间戳', () => {
      const before = Date.now();

      useNodeSlice.getState().mergeFromWS([
        { id: "GPU-A100-01", status: "active", gpu: 90, mem: 80, temp: 70, model: "LLaMA-70B", tasks: 150 },
      ]);

      const { lastUpdateAt } = useNodeSlice.getState();
      expect(lastUpdateAt).not.toBeNull();
      expect(new Date(lastUpdateAt!).getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  // ---------- 边界条件 ----------
  describe('边界条件', () => {
    it('updateNode 不存在的 ID 不应该报错', () => {
      expect(() => {
        useNodeSlice.getState().updateNode("NON-EXISTENT", { gpu: 99 });
      }).not.toThrow();
    });

    it('removeNode 不存在的 ID 不应该报错', () => {
      expect(() => {
        useNodeSlice.getState().removeNode("NON-EXISTENT");
      }).not.toThrow();
    });

    it('空数组操作应该正常工作', () => {
      useNodeSlice.getState().setNodes([]);

      const { derived, nodes } = useNodeSlice.getState();
      expect(derived.activeCount).toBe(0);
      expect(derived.totalCount).toBe(0);
      expect(derived.avgGpu).toBe(0);
      expect(derived.totalTasks).toBe(0);
      expect(nodes).toHaveLength(0);
    });

    it('所有节点都是 inactive 时，平均值应该是 0', () => {
      useNodeSlice.getState().setNodes([
        { id: "OFF-01", status: "inactive", gpu: 0, mem: 0, temp: 0, model: "", tasks: 0 },
        { id: "OFF-02", status: "inactive", gpu: 0, mem: 0, temp: 0, model: "", tasks: 0 },
      ]);

      const { derived } = useNodeSlice.getState();
      expect(derived.avgGpu).toBe(0);
      expect(derived.avgMem).toBe(0);
      expect(derived.totalTasks).toBe(0);
      expect(derived.activeCount).toBe(0);
    });

    it('单节点操作应该正确计算派生状态', () => {
      useNodeSlice.getState().setNodes([
        { id: "ONLY-ONE", status: "active", gpu: 75, mem: 60, temp: 55, model: "Solo", tasks: 42 },
      ]);

      const { derived } = useNodeSlice.getState();
      expect(derived.totalCount).toBe(1);
      expect(derived.activeCount).toBe(1);
      expect(derived.avgGpu).toBe(75);
      expect(derived.totalTasks).toBe(42);
    });
  });
});
