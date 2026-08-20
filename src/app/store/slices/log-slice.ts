/**
 * @file: log-slice.ts
 * @description: log-slice.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-15
 * @status: active
 * @tags: [type]
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoredLogEntry, LogLevel } from '../../types';

const DEFAULT_LOGS: StoredLogEntry[] = [
  { id: "log-001", timestamp: Date.now() - 120000, level: "info", source: "GPU-A100-01", message: "推理任务完成 #12847, 延迟 820ms" },
  { id: "log-002", timestamp: Date.now() - 240000, level: "info", source: "GPU-A100-03", message: "模型缓存命中 LLaMA-70B, 跳过加载" },
  { id: "log-003", timestamp: Date.now() - 360000, level: "warn", source: "GPU-A100-03", message: "GPU 温度接近阈值 78°C > 75°C" },
  { id: "log-004", timestamp: Date.now() - 480000, level: "error", source: "GPU-H100-01", message: "推理超时 task #12853, 超过 5000ms" },
  { id: "log-005", timestamp: Date.now() - 600000, level: "info", source: "system", message: "批次处理完成 batch_size=32, tokens=4096" },
  { id: "log-006", timestamp: Date.now() - 720000, level: "warn", source: "GPU-A100-03", message: "内存使用率 89%, 建议清理缓存" },
  { id: "log-007", timestamp: Date.now() - 840000, level: "debug", source: "scheduler", message: "WebSocket 心跳 ack, 延迟 12ms" },
  { id: "log-008", timestamp: Date.now() - 960000, level: "info", source: "system", message: "自动巡查完成, 健康度 96%" },
];

export interface LogSlice {
  logs: StoredLogEntry[];
  addLog: (entry: Omit<StoredLogEntry, 'id'>) => void;
  updateLog: (id: string, updates: Partial<StoredLogEntry>) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  getLogsByLevel: (level: LogLevel) => StoredLogEntry[];
}

export const useLogSlice = create<LogSlice>()(
  persist(
    (set, get) => ({
      logs: DEFAULT_LOGS,
      addLog: (entry) => set((s) => ({ logs: [...s.logs, { ...entry, id: `log-${Date.now()}` }] })),
      updateLog: (id, updates) => set((s) => ({ logs: s.logs.map((l) => l.id === id ? { ...l, ...updates } : l) })),
      removeLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
      clearLogs: () => set({ logs: [] }),
      getLogsByLevel: (level) => get().logs.filter((l) => l.level === level),
    }),
    {
      name: 'yyc3-log-slice',
      partialize: (state) => ({
        logs: state.logs.slice(-200),
      }),
    }
  )
);
