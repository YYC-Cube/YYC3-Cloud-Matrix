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

// 2026-11-11 禁止硬编码政策：DEFAULT_RECENT_OPS 假操作流种子已清除。
// recentOps 初始为空，真实写入来源：WS 系统告警事件（useWebSocketData）、
// 操作中心用户实际操作；会话级实时流（app-slice 纯内存不持久化，
// 历史告警见 follow-up-slice 持久化工单域）。

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
  recentOps: [],

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
