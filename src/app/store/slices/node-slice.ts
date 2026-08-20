/**
 * @file: node-slice.ts
 * @description: YYC³ 节点 Slice · 统一管理所有节点相关状态
 * @author: YanYuCloudCube Team
 * @version: v2.0.0 (enhanced with devtools + immer)
 * @created: 2026-04-15
 * @updated: 2026-04-16
 * @status: active
 * @tags: [store],[slice],[node],[devtools],[immer]
 *
 * @brief: 合并原 nodeStore + useNodeCacheStore + db-queries nodes 为单一 Slice
 *
 * @features:
 * - ✅ 持久化：自动保存到 localStorage (persist middleware)
 * - ✅ 时间旅行调试：Redux DevTools 支持 (devtools middleware)
 * - ✅ 不可变更新：Immer 简化状态操作 (immer middleware)
 * - ✅ 智能合并：通过 DataBus 处理遥测 vs 编辑字段的冲突
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { NodeData } from '../../types';
import { dataBus, type DataSource } from '../../lib/data-bus';

const DEFAULT_NODES: NodeData[] = [
  { id: "GPU-A100-01", status: "active",   gpu: 87, mem: 72, temp: 68, model: "LLaMA-70B",    tasks: 128 },
  { id: "GPU-A100-02", status: "active",   gpu: 92, mem: 85, temp: 74, model: "Qwen-72B",     tasks: 156 },
  { id: "GPU-A100-03", status: "warning",  gpu: 98, mem: 94, temp: 82, model: "DeepSeek-V3",  tasks: 89 },
  { id: "GPU-A100-04", status: "active",   gpu: 45, mem: 38, temp: 52, model: "Mistral-7B",   tasks: 34 },
  { id: "GPU-A100-05", status: "active",   gpu: 73, mem: 61, temp: 63, model: "Claude-3.5",   tasks: 97 },
  { id: "GPU-A100-06", status: "active",   gpu: 56, mem: 48, temp: 58, model: "GPT-4o",       tasks: 112 },
  { id: "GPU-A100-07", status: "active",   gpu: 81, mem: 76, temp: 71, model: "Qwen-72B",     tasks: 143 },
  { id: "GPU-A100-08", status: "inactive", gpu: 0,  mem: 5,  temp: 32, model: "",              tasks: 0 },
  { id: "GPU-H100-01", status: "active",   gpu: 65, mem: 58, temp: 62, model: "GLM-4",        tasks: 78 },
];

interface NodeSlice {
  nodes: NodeData[];
  lastSource: DataSource | null;
  lastUpdateAt: string | null;

  setNodes: (nodes: NodeData[], source?: DataSource) => void;
  mergeFromWS: (incoming: NodeData[]) => void;
  updateNode: (id: string, updates: Partial<NodeData>) => void;
  addNode: (node: NodeData) => void;
  removeNode: (id: string) => void;
  resetNodes: () => void;
  clearUserEdits: (nodeId: string) => void;

  readonly derived: {
    activeNodes: NodeData[];
    inactiveNodes: NodeData[];
    activeCount: number;
    totalCount: number;
    activeRatio: string;
    avgGpu: number;
    avgMem: number;
    avgTemp: number;
    totalTasks: number;
  };
}

function computeDerived(nodes: NodeData[]) {
  const activeNodes = nodes.filter((n) => n.status !== "inactive");
  const inactiveNodes = nodes.filter((n) => n.status === "inactive");
  const activeCount = activeNodes.length;
  const totalCount = nodes.length;

  const avgGpu = activeCount > 0
    ? Math.round(activeNodes.reduce((s, n) => s + n.gpu, 0) / activeCount * 10) / 10
    : 0;
  const avgMem = activeCount > 0
    ? Math.round(activeNodes.reduce((s, n) => s + n.mem, 0) / activeCount * 10) / 10
    : 0;
  const avgTemp = activeCount > 0
    ? Math.round(activeNodes.reduce((s, n) => s + n.temp, 0) / activeCount * 10) / 10
    : 0;
  const totalTasks = activeNodes.reduce((s, n) => s + n.tasks, 0);

  return {
    activeNodes,
    inactiveNodes,
    activeCount,
    totalCount,
    activeRatio: `${activeCount}/${totalCount}`,
    avgGpu,
    avgMem,
    avgTemp,
    totalTasks,
  };
}

export const useNodeSlice = create<NodeSlice>()(
  devtools(
    persist(
      immer(
        (set, _get) => ({
          nodes: DEFAULT_NODES,
          lastSource: null,
          lastUpdateAt: null,

          derived: computeDerived(DEFAULT_NODES),

          setNodes: (nodes, source = "initialization") => {
            set((state) => {
              state.nodes = nodes;
              state.lastSource = source;
              state.lastUpdateAt = new Date().toISOString();
              state.derived = computeDerived(nodes);
            });
          },

          mergeFromWS: (incoming) => {
            set((state) => {
              const merged = dataBus.mergeNodeData(state.nodes, incoming, "websocket");
              state.nodes = merged;
              state.lastSource = "websocket";
              state.lastUpdateAt = new Date().toISOString();
              state.derived = computeDerived(merged);
            });
          },

          updateNode: (id, updates) => {
            set((state) => {
              const updated = dataBus.updateUserEditNode(state.nodes, id, updates);
              state.nodes = updated;
              state.lastSource = "user_edit";
              state.lastUpdateAt = new Date().toISOString();
              state.derived = computeDerived(updated);
              const targetNode = updated.find((n) => n.id === id);
              if (targetNode) {
                const sent = dataBus.sendWS({
                  type: "node_update",
                  entity: "nodes",
                  data: [targetNode],
                });
                if (!sent) {
                  console.info(`[NodeSlice] Edit queued for ${id} (offline or no WS)`);
                }
              }
            });
          },

          addNode: (node) => {
            set((state) => {
              state.nodes.push(node);
              state.lastSource = "user_edit";
              state.lastUpdateAt = new Date().toISOString();
              state.derived = computeDerived(state.nodes);
              dataBus.sendWS({ type: "node_update", entity: "nodes", data: [node] });
            });
          },

          removeNode: (id) => {
            set((state) => {
              const removed = state.nodes.find((n) => n.id === id);
              state.nodes = state.nodes.filter((n) => n.id !== id);
              state.lastSource = "user_edit";
              state.lastUpdateAt = new Date().toISOString();
              state.derived = computeDerived(state.nodes);
              if (removed) {
                dataBus.sendWS({ type: "node_update", entity: "nodes", data: [{ ...removed, status: "inactive" as const }] });
              }
            });
          },

          resetNodes: () => {
            set((state) => {
              state.nodes = DEFAULT_NODES;
              state.lastSource = "initialization";
              state.lastUpdateAt = null;
              state.derived = computeDerived(DEFAULT_NODES);
            });
          },

          clearUserEdits: (nodeId) => {
            dataBus.clearUserEdits(nodeId);
          },
        })
      ),
      {
        name: 'yyc3-node-slice',
        partialize: (state) => ({ nodes: state.nodes }),
      }
    ),
    {
      name: 'YYC³ Node Slice',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
