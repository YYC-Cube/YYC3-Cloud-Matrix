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

const DEFAULT_FOLLOWUPS: FollowUpRecord[] = [
  { id: "fu-001", taskId: "TASK-042", taskName: "GPU-A100-03 温度告警处理", assignee: "ops_li", assigneeName: "李运维", priority: "high", status: "in_progress", dueDate: Date.now() + 86400000, notes: "需要检查散热系统", createdAt: Date.now() - 3600000, updatedAt: Date.now(), category: "maintenance" },
  { id: "fu-002", taskId: "TASK-043", taskName: "LLaMA-70B 模型版本升级", assignee: "dev_wang", assigneeName: "王开发", priority: "medium", status: "pending", dueDate: Date.now() + 172800000, createdAt: Date.now() - 7200000, updatedAt: Date.now(), category: "optimization" },
];

export interface FollowUpSlice {
  followUps: FollowUpRecord[];
  addFollowUp: (fu: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUpRecord>) => void;
  removeFollowUp: (id: string) => void;
  completeFollowUp: (id: string) => void;
}

export const useFollowUpSlice = create<FollowUpSlice>()(
  persist(
    (set) => ({
      followUps: DEFAULT_FOLLOWUPS,
      addFollowUp: (fu) => set((s) => ({
        followUps: [...s.followUps, { ...fu, id: `fu-${Date.now()}`, createdAt: Date.now(), updatedAt: Date.now() }],
      })),
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
