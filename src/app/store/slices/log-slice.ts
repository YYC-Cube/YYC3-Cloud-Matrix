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
import { newId } from '../../lib/id';
import type { LogLevel, StoredLogEntry } from '../../types';

export interface LogSlice {
  logs: StoredLogEntry[];
  addLog: (entry: Omit<StoredLogEntry, 'id'>) => void;
  updateLog: (id: string, updates: Partial<StoredLogEntry>) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  getLogsByLevel: (level: LogLevel) => StoredLogEntry[];
}

/**
 * 日志域 SSOT — 初始为空（禁止硬编码假日志政策，2026-11-11）。
 * 真实写入来源：WS 告警事件（useWebSocketData）、用户操作审计、
 * agent 系统事件；persist 保留最近 200 条。
 */
export const useLogSlice = create<LogSlice>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (entry) => set((s) => ({ logs: [...s.logs, { ...entry, id: newId('log') }] })),
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
