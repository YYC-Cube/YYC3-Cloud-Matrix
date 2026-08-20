/**
 * @file: family-news-slice.ts
 * @description: YYC³ AI Family 新闻资讯 Slice — CRUD + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[news]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  color: string;
  url?: string;
  createdAt: number;
}

const SEED_NEWS: NewsItem[] = [
  { id: "n1", title: "OpenAI 发布 GPT-5 技术报告，推理能力大幅跃升", source: "AI前沿", time: "30分钟前", category: "AI", color: "#00d4ff", createdAt: Date.now() - 1800000 },
  { id: "n2", title: "DeepSeek V3 开源模型性能超越 Claude 3.5", source: "开源社区", time: "1小时前", category: "开源", color: "#00FF88", createdAt: Date.now() - 3600000 },
  { id: "n3", title: "英伟达发布 Blackwell Ultra 芯片，推理性能翻倍", source: "硬件资讯", time: "2小时前", category: "硬件", color: "#FFD700", createdAt: Date.now() - 7200000 },
  { id: "n4", title: "React 20 正式发布：Server Components 全面稳定", source: "前端周刊", time: "3小时前", category: "前端", color: "#00BFFF", createdAt: Date.now() - 10800000 },
  { id: "n5", title: "智谱 AI 推出 GLM-5 系列模型，支持超长上下文", source: "国内AI", time: "4小时前", category: "AI", color: "#BF00FF", createdAt: Date.now() - 14400000 },
];

interface FamilyNewsSlice {
  news: NewsItem[];
  addNews: (item: Omit<NewsItem, "id" | "createdAt">) => void;
  updateNews: (id: string, updates: Partial<Omit<NewsItem, "id" | "createdAt">>) => void;
  deleteNews: (id: string) => void;
}

export const useFamilyNewsSlice = create<FamilyNewsSlice>()(
  persist(
    (set) => ({
      news: SEED_NEWS,

      addNews: (item) =>
        set((s) => ({
          news: [
            { ...item, id: `n-${Date.now()}`, createdAt: Date.now() },
            ...s.news,
          ],
        })),

      updateNews: (id, updates) =>
        set((s) => ({
          news: s.news.map((n) =>
            n.id === id ? { ...n, ...updates } : n,
          ),
        })),

      deleteNews: (id) =>
        set((s) => ({
          news: s.news.filter((n) => n.id !== id),
        })),
    }),
    { name: "yyc3-family-news" },
  ),
);
