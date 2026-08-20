/**
 * @file: app-slice.ts
 * @description: YYC³ 应用基础 Slice · recentOps + 运行时状态
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-17
 * @status: active
 * @tags: [store],[slice],[app]
 *
 * @brief: 应用级运行时状态（纯内存，不持久化）
 *
 * @details:
 * - recentOps: 最近操作记录（Dashboard/DataEditorPanel 消费）
 * - commandPaletteOpen/alerts/fps/memoryUsage: 运行时 UI 状态
 * - theme/locale/sidebarCollapsed 已在 Phase Q 移除（僵尸数据，0 渲染消费者）
 *   实际规范源: theme=Layout.tsx 硬编码, locale=useI18n/yyc3_locale, sidebar=Layout.tsx useState
 */

import { create } from 'zustand';
import type { AlertData } from '../../types';

export interface RecentOpEntry {
  id: string;
  action: string;
  target: string;
  user: string;
  time: string;
  status: "success" | "running" | "pending" | "warning" | "error";
}

const DEFAULT_RECENT_OPS: RecentOpEntry[] = [
  { id: "OP-001", action: "模型部署", target: "DeepSeek-V3 → GPU-A100-03", user: "admin",   time: "14:28:32", status: "success" },
  { id: "OP-002", action: "推理任务", target: "Batch#2847 → LLaMA-70B",    user: "api_svc", time: "14:25:10", status: "running" },
  { id: "OP-003", action: "节点扩容", target: "GPU-H100-03 加入集群",      user: "ops_bot", time: "14:20:55", status: "pending" },
  { id: "OP-004", action: "数据同步", target: "向量库 → 分片迁移",         user: "admin",   time: "14:15:22", status: "success" },
  { id: "OP-005", action: "告警处理", target: "GPU-A100-03 温度预警",      user: "system",  time: "14:10:08", status: "warning" },
];

interface AppSlice {
  commandPaletteOpen: boolean;
  alerts: AlertData[];
  maxAlerts: number;
  fps: number;
  memoryUsage: number;
  recentOps: RecentOpEntry[];

  setCommandPaletteOpen: (open: boolean) => void;
  addAlert: (alert: AlertData) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  setFps: (fps: number) => void;
  setMemoryUsage: (usage: number) => void;
  addRecentOp: (op: RecentOpEntry) => void;
  clearRecentOps: () => void;
}

export const useAppSlice = create<AppSlice>()((set) => ({
  commandPaletteOpen: false,
  alerts: [],
  maxAlerts: 100,
  fps: 60,
  memoryUsage: 0,
  recentOps: DEFAULT_RECENT_OPS,

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  addAlert: (alert) =>
    set((s) => ({ alerts: [alert, ...s.alerts].slice(0, s.maxAlerts) })),
  removeAlert: (id) =>
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
  clearAlerts: () => set({ alerts: [] }),
  setFps: (fps) => set({ fps }),
  setMemoryUsage: (usage) => set({ memoryUsage: usage }),
  addRecentOp: (op) =>
    set((s) => ({ recentOps: [op, ...s.recentOps].slice(0, 50) })),
  clearRecentOps: () => set({ recentOps: [] }),
}));
