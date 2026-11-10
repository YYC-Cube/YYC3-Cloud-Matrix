/**
 * @file: follow-up-slice.ts
 * @description: follow-up-slice.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-15
 * @status: active
 * @tags: [type]
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FollowUpRecord } from '../../types';
import type { AlertData } from '../../types/websocket-types';

/** 告警级别 → 工单优先级映射 */
const ALERT_LEVEL_TO_PRIORITY: Record<AlertData["level"], FollowUpRecord["priority"]> = {
  critical: "critical",
  error: "high",
  warning: "medium",
  info: "low",
};

export interface FollowUpSlice {
  followUps: FollowUpRecord[];
  addFollowUp: (fu: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void;
  /**
   * 摄入 WS 真实告警（幂等）：同一 source+alertId 只生成一张工单。
   * 真实告警事件流入口 — agent 推送的 alert 消息经此持久化，
   * 替代历史 DEFAULT_FOLLOWUPS 假种子（已按「禁止硬编码」原则清除）。
   * @returns true=新建工单，false=重复告警被去重
   */
  ingestWSAlert: (alert: AlertData) => boolean;
  updateFollowUp: (id: string, updates: Partial<FollowUpRecord>) => void;
  removeFollowUp: (id: string) => void;
  completeFollowUp: (id: string) => void;
}

export const useFollowUpSlice = create<FollowUpSlice>()(
  persist(
    (set) => ({
      followUps: [],
      addFollowUp: (fu) => set((s) => ({
        followUps: [...s.followUps, {
          ...fu,
          // 同毫秒连发时 Date.now() 会撞 ID（曾致 completeFollowUp 误伤同 ID 工单），追加随机段防碰撞
          id: `fu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }],
      })),
      ingestWSAlert: (alert) => {
        let created = false;
        set((s) => {
          const taskId = `ALERT-${alert.source}-${alert.id}`;
          if (s.followUps.some((f) => f.taskId === taskId)) {
            return s; // 幂等去重：同一告警不重复建单
          }
          created = true;
          const now = Date.now();
          const record: FollowUpRecord = {
            id: `fu-${now}-${Math.random().toString(36).slice(2, 8)}`,
            taskId,
            taskName: alert.message,
            assignee: "system",
            assigneeName: alert.source,
            priority: ALERT_LEVEL_TO_PRIORITY[alert.level] ?? "medium",
            status: "pending",
            dueDate: now + 86400000,
            notes: `WS 实时告警 · 来源 ${alert.source} · ${new Date(alert.timestamp || now).toLocaleString("zh-CN", { hour12: false })}`,
            createdAt: alert.timestamp || now,
            updatedAt: now,
            category: "maintenance",
          };
          return { ...s, followUps: [record, ...s.followUps].slice(0, 200) };
        });
        return created;
      },
      updateFollowUp: (id, updates) => set((s) => ({
        followUps: s.followUps.map((f) => f.id === id ? { ...f, ...updates } : f),
      })),
      removeFollowUp: (id) => set((s) => ({
        followUps: s.followUps.filter((f) => f.id !== id),
      })),
      completeFollowUp: (id) => set((s) => ({
        followUps: s.followUps.map((f) => f.id === id ? { ...f, status: "completed" as const, completedAt: Date.now() } : f),
      })),
    }),
    {
      name: 'yyc3-follow-up-slice',
      partialize: (state) => ({ followUps: state.followUps }),
    }
  )
);
