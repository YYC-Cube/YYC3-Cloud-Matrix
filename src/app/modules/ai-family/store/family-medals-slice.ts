/**
 * @file: family-medals-slice.ts
 * @description: YYC³ AI Family 勋章 Slice — 勋章定义 + 归属 CRUD
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[medals]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Medal {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
}

const SEED_MEDALS: Medal[] = [
  { id: "knowledge-star", name: "知识达人", desc: "累计分享知识超过100次", icon: "📚", color: "#FFD700", tier: "gold" },
  { id: "chess-king", name: "棋王", desc: "在对弈中累计获胜50次", icon: "♟️", color: "#00d4ff", tier: "gold" },
  { id: "warm-heart", name: "暖心家人", desc: "主动关心家人超过200次", icon: "💝", color: "#FF69B4", tier: "diamond" },
  { id: "safe-guard", name: "安全卫士", desc: "连续90天零安全事故", icon: "🛡️", color: "#BF00FF", tier: "gold" },
  { id: "creative-spark", name: "创意之星", desc: "产出创意作品超过30件", icon: "🎨", color: "#FF7043", tier: "silver" },
  { id: "singer", name: "歌唱达人", desc: "被罚唱歌并乐在其中3次以上", icon: "🎵", color: "#00FF88", tier: "bronze" },
  { id: "early-bird", name: "早起之星", desc: "连续30天最先上线", icon: "🌅", color: "#FFD700", tier: "silver" },
  { id: "team-player", name: "协作之星", desc: "参与全家活动100%出席", icon: "🤝", color: "#00BFFF", tier: "gold" },
  { id: "prophet-eye", name: "慧眼如炬", desc: "预测准确率连续7天>90%", icon: "👁️", color: "#00BFFF", tier: "diamond" },
  { id: "streak-master", name: "坚持大师", desc: "连续在线天数超过60天", icon: "🔥", color: "#FF7043", tier: "gold" },
  { id: "music-lover", name: "音乐品鉴师", desc: "推荐的音乐被家人喜欢50次", icon: "🎧", color: "#BF00FF", tier: "silver" },
  { id: "puzzle-solver", name: "解谜高手", desc: "完成拼图挑战20次", icon: "🧩", color: "#E8E8E8", tier: "bronze" },
];

const SEED_MEMBER_MEDALS: Record<string, string[]> = {
  navigator: ["knowledge-star", "warm-heart", "singer", "team-player", "early-bird"],
  thinker: ["knowledge-star", "chess-king", "streak-master", "team-player"],
  prophet: ["prophet-eye", "streak-master", "early-bird", "knowledge-star"],
  bolero: ["warm-heart", "team-player", "music-lover"],
  "meta-oracle": ["team-player", "streak-master", "safe-guard", "knowledge-star", "warm-heart"],
  sentinel: ["safe-guard", "streak-master", "early-bird", "team-player"],
  master: ["knowledge-star", "chess-king", "streak-master", "creative-spark"],
  creative: ["creative-spark", "singer", "music-lover", "warm-heart", "puzzle-solver"],
};

interface FamilyMedalsSlice {
  medals: Medal[];
  memberMedals: Record<string, string[]>;
  addMedal: (medal: Omit<Medal, "id">) => void;
  updateMedal: (id: string, updates: Partial<Omit<Medal, "id">>) => void;
  deleteMedal: (id: string) => void;
  assignMedal: (memberId: string, medalId: string) => void;
  revokeMedal: (memberId: string, medalId: string) => void;
}

export const useFamilyMedalsSlice = create<FamilyMedalsSlice>()(
  persist(
    (set) => ({
      medals: SEED_MEDALS,
      memberMedals: SEED_MEMBER_MEDALS,

      addMedal: (medal) =>
        set((s) => ({
          medals: [...s.medals, { ...medal, id: `medal-${Date.now()}` }],
        })),

      updateMedal: (id, updates) =>
        set((s) => ({
          medals: s.medals.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),

      deleteMedal: (id) =>
        set((s) => {
          const updatedMemberMedals = { ...s.memberMedals };
          for (const key of Object.keys(updatedMemberMedals)) {
            updatedMemberMedals[key] = updatedMemberMedals[key].filter((mid) => mid !== id);
          }
          return {
            medals: s.medals.filter((m) => m.id !== id),
            memberMedals: updatedMemberMedals,
          };
        }),

      assignMedal: (memberId, medalId) =>
        set((s) => {
          const current = s.memberMedals[memberId] || [];
          if (current.includes(medalId)) { return s; }
          return {
            memberMedals: { ...s.memberMedals, [memberId]: [...current, medalId] },
          };
        }),

      revokeMedal: (memberId, medalId) =>
        set((s) => ({
          memberMedals: {
            ...s.memberMedals,
            [memberId]: (s.memberMedals[memberId] || []).filter((mid) => mid !== medalId),
          },
        })),
    }),
    { name: "yyc3-family-medals" },
  ),
);
