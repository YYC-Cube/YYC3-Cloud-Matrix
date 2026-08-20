/**
 * @file: family-moments-slice.ts
 * @description: YYC³ AI Family 家庭动态 Slice — CRUD + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[moments]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FamilyMoment {
  id: string;
  member: string;
  text: string;
  time: string;
  color: string;
  createdAt: number;
}

const SEED_MOMENTS: FamilyMoment[] = [
  { id: "fm-1", member: "元启·天枢", text: "今日系统巡检完成，全节点健康度 98%，继续守护大家的安全！", time: "10 分钟前", color: "#00FF88", createdAt: Date.now() - 600000 },
  { id: "fm-2", member: "语枢·万物", text: "分析完成了最新的性能报告，发现了3个优化点，已生成建议文档。", time: "25 分钟前", color: "#FF69B4", createdAt: Date.now() - 1500000 },
  { id: "fm-3", member: "预见·先知", text: "基于近7天数据趋势，预测本周四可能有流量高峰，建议提前准备。", time: "1 小时前", color: "#00BFFF", createdAt: Date.now() - 3600000 },
  { id: "fm-4", member: "创想·灵韵", text: "为团队设计了新的数据看板配色方案，温暖而不失专业感。", time: "2 小时前", color: "#FF7043", createdAt: Date.now() - 7200000 },
  { id: "fm-5", member: "智云·守护", text: "安全扫描已完成，未发现异常入侵行为。家人们可以放心工作！", time: "3 小时前", color: "#BF00FF", createdAt: Date.now() - 10800000 },
];

interface FamilyMomentsSlice {
  moments: FamilyMoment[];
  addMoment: (moment: Omit<FamilyMoment, "id" | "createdAt">) => void;
  updateMoment: (id: string, updates: Partial<Omit<FamilyMoment, "id" | "createdAt">>) => void;
  deleteMoment: (id: string) => void;
}

export const useFamilyMomentsSlice = create<FamilyMomentsSlice>()(
  persist(
    (set) => ({
      moments: SEED_MOMENTS,

      addMoment: (moment) =>
        set((s) => ({
          moments: [
            { ...moment, id: `fm-${Date.now()}`, createdAt: Date.now() },
            ...s.moments,
          ],
        })),

      updateMoment: (id, updates) =>
        set((s) => ({
          moments: s.moments.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),

      deleteMoment: (id) =>
        set((s) => ({
          moments: s.moments.filter((m) => m.id !== id),
        })),
    }),
    { name: "yyc3-family-moments" },
  ),
);
