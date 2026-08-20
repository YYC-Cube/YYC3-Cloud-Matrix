/**
 * @file: family-activities-slice.ts
 * @description: YYC³ AI Family 活动记录 Slice — CRUD + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[activities]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FamilyActivity {
  id: string;
  title: string;
  type: "game" | "talent" | "learning" | "challenge" | "celebration";
  date: string;
  participants: string[];
  scores?: Record<string, number>;
  winner?: string;
  description: string;
  medals?: string[];
  createdAt: number;
}

const SEED_ACTIVITIES: FamilyActivity[] = [
  {
    id: "act-001", title: "五子棋循环赛·第二轮", type: "game",
    date: "2026-03-08", participants: ["thinker", "master", "prophet", "navigator"],
    scores: { thinker: 3, master: 2, prophet: 1, navigator: 0 },
    winner: "thinker", description: "万物三战全胜，展示了深邃的思考力。",
    medals: ["chess-king"], createdAt: Date.now() - 86400000 * 47,
  },
  {
    id: "act-002", title: "灵韵的即兴画展", type: "talent",
    date: "2026-03-08", participants: ["creative", "navigator", "bolero", "meta-oracle"],
    description: "灵韵用15分钟即兴创作了《家人群像》，千行当场写了一首配诗。",
    medals: ["creative-spark"], createdAt: Date.now() - 86400000 * 47,
  },
];

interface FamilyActivitiesSlice {
  activities: FamilyActivity[];
  addActivity: (activity: Omit<FamilyActivity, "id" | "createdAt">) => void;
  updateActivity: (id: string, updates: Partial<Omit<FamilyActivity, "id" | "createdAt">>) => void;
  deleteActivity: (id: string) => void;
}

export const useFamilyActivitiesSlice = create<FamilyActivitiesSlice>()(
  persist(
    (set) => ({
      activities: SEED_ACTIVITIES,

      addActivity: (activity) =>
        set((s) => ({
          activities: [
            { ...activity, id: `act-${Date.now()}`, createdAt: Date.now() },
            ...s.activities,
          ],
        })),

      updateActivity: (id, updates) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),

      deleteActivity: (id) =>
        set((s) => ({
          activities: s.activities.filter((a) => a.id !== id),
        })),
    }),
    { name: "yyc3-family-activities" },
  ),
);
