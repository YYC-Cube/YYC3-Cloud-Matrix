/**
 * @file: family-milestones-slice.ts
 * @description: YYC³ AI Family 里程碑 Slice — CRUD + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[milestones]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Milestone {
  id: string;
  date: string;
  title: string;
  desc: string;
  color: string;
  iconName: string;
  createdAt: number;
}

const SEED_MILESTONES: Milestone[] = [
  { id: "ms-1", date: "2026-03-09", title: "AI Family 家园落成", desc: "完成5大家园空间的原型构建", color: "#00d4ff", iconName: "Star", createdAt: Date.now() - 86400000 * 47 },
  { id: "ms-2", date: "2026-03-01", title: "1935 测试用例全部通过", desc: "测试覆盖率达标，0失败", color: "#00FF88", iconName: "CheckCircle2", createdAt: Date.now() - 86400000 * 55 },
  { id: "ms-3", date: "2026-02-25", title: "八位家人协同框架完成", desc: "8位AI成员交互系统上线", color: "#FFD700", iconName: "Users", createdAt: Date.now() - 86400000 * 59 },
  { id: "ms-4", date: "2026-02-20", title: "赛博朋克设计系统建立", desc: "统一GlassCard、色彩、排版规范", color: "#BF00FF", iconName: "Award", createdAt: Date.now() - 86400000 * 64 },
  { id: "ms-5", date: "2026-02-15", title: "九层架构设计完成", desc: "从基础设施到扩展演进的完整架构", color: "#FF7043", iconName: "Target", createdAt: Date.now() - 86400000 * 69 },
  { id: "ms-6", date: "2026-02-01", title: "项目正式启动", desc: "YYC3 Cloud Intelli-Matrix 创建", color: "#FF69B4", iconName: "Flame", createdAt: Date.now() - 86400000 * 83 },
];

interface FamilyMilestonesSlice {
  milestones: Milestone[];
  addMilestone: (milestone: Omit<Milestone, "id" | "createdAt">) => void;
  updateMilestone: (id: string, updates: Partial<Omit<Milestone, "id" | "createdAt">>) => void;
  deleteMilestone: (id: string) => void;
}

export const useFamilyMilestonesSlice = create<FamilyMilestonesSlice>()(
  persist(
    (set) => ({
      milestones: SEED_MILESTONES,

      addMilestone: (milestone) =>
        set((s) => ({
          milestones: [
            { ...milestone, id: `ms-${Date.now()}`, createdAt: Date.now() },
            ...s.milestones,
          ],
        })),

      updateMilestone: (id, updates) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),

      deleteMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.filter((m) => m.id !== id),
        })),
    }),
    { name: "yyc3-family-milestones" },
  ),
);
