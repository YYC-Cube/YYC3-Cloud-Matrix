/**
 * @file: family-skills-slice.ts
 * @description: YYC³ AI Family 技能树/课程/成就 Slice — 全 CRUD + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[skills]
 */

import type React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SkillItem {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  status: "completed" | "active" | "locked";
}

export interface SkillCategory {
  id: string;
  category: string;
  icon: React.ElementType;
  color: string;
  skills: SkillItem[];
}

export interface Course {
  id: string;
  title: string;
  mentor: string;
  progress: number;
  total: number;
  done: number;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  earned: boolean;
  icon: React.ElementType;
  color: string;
}

const SEED_COURSES: Course[] = [
  { id: "course-1", title: "LLM Prompt Engineering 实战", mentor: "言启·千行", progress: 72, total: 12, done: 9, color: "#FFD700" },
  { id: "course-2", title: "数据驱动的商业洞察方法论", mentor: "语枢·万物", progress: 45, total: 8, done: 4, color: "#FF69B4" },
  { id: "course-3", title: "时序预测与异常检测", mentor: "预见·先知", progress: 30, total: 10, done: 3, color: "#00BFFF" },
  { id: "course-4", title: "TypeScript 类型体操进阶", mentor: "格物·宗师", progress: 88, total: 15, done: 13, color: "#C0C0C0" },
  { id: "course-5", title: "赛博朋克 UI/UX 设计", mentor: "创想·灵韵", progress: 55, total: 8, done: 4, color: "#FF7043" },
];

export interface AchievementData {
  id: string;
  name: string;
  desc: string;
  earned: boolean;
  iconName: string;
  color: string;
}

const SEED_ACHIEVEMENTS: AchievementData[] = [
  { id: "ach-1", name: "初入家门", desc: "完成首次登录并了解8位家人", earned: true, iconName: "Award", color: "#FFD700" },
  { id: "ach-2", name: "知识探索者", desc: "阅读10篇家人分享的知识文档", earned: true, iconName: "BookOpen", color: "#00d4ff" },
  { id: "ach-3", name: "对话达人", desc: "与每位家人至少对话一次", earned: true, iconName: "Brain", color: "#FF69B4" },
  { id: "ach-4", name: "技能大师", desc: "任意技能达到满级", earned: true, iconName: "Award", color: "#00FF88" },
  { id: "ach-5", name: "安全卫士", desc: "完成安全合规课程全部章节", earned: false, iconName: "Shield", color: "#BF00FF" },
  { id: "ach-6", name: "架构先锋", desc: "完成系统架构课程并通过考核", earned: false, iconName: "Database", color: "#FF6B6B" },
];

interface FamilySkillsSlice {
  courses: Course[];
  achievements: AchievementData[];
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, updates: Partial<Omit<Course, "id">>) => void;
  deleteCourse: (id: string) => void;
  addAchievement: (achievement: Omit<AchievementData, "id">) => void;
  updateAchievement: (id: string, updates: Partial<Omit<AchievementData, "id">>) => void;
  deleteAchievement: (id: string) => void;
  toggleAchievement: (id: string) => void;
}

export const useFamilySkillsSlice = create<FamilySkillsSlice>()(
  persist(
    (set) => ({
      courses: SEED_COURSES,
      achievements: SEED_ACHIEVEMENTS,

      addCourse: (course) =>
        set((s) => ({
          courses: [...s.courses, { ...course, id: `course-${Date.now()}` }],
        })),

      updateCourse: (id, updates) =>
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      deleteCourse: (id) =>
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== id),
        })),

      addAchievement: (achievement) =>
        set((s) => ({
          achievements: [...s.achievements, { ...achievement, id: `ach-${Date.now()}` }],
        })),

      updateAchievement: (id, updates) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),

      deleteAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.filter((a) => a.id !== id),
        })),

      toggleAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id ? { ...a, earned: !a.earned } : a,
          ),
        })),
    }),
    { name: "yyc3-family-skills" },
  ),
);
