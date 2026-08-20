/**
 * @file: StageReview.test.tsx
 * @description: StageReview.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * StageReview.test.tsx
 * ============
 * StageReview 阶段审核总结测试
 *
 * 覆盖范围:
 * - 章节进度 / 统计概览 / 验收清单 标签
 * - CHAPTER_REVIEWS 完整性
 * - PROJECT_STATS 完整性
 * - ACCEPTANCE_CHECKLIST 完整性
 * - 进度计算
 */

import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  StageReview,
  CHAPTER_REVIEWS,
  PROJECT_STATS,
  ACCEPTANCE_CHECKLIST,
} from "../modules/dev/design-system/StageReview";

describe("StageReview", () => {

afterEach(() => {
  cleanup();
});
  describe("数据完整性", () => {

afterEach(() => {
  cleanup();
});
    it("应有 10 章", () => {
      expect(CHAPTER_REVIEWS.length).toBe(10);
    });

    it("每章应有 chapter/title/status/progress/deliverables", () => {
      for (const ch of CHAPTER_REVIEWS) {
        expect(ch.chapter).toBeGreaterThan(0);
        expect(ch.title).toBeTruthy();
        expect(["completed", "partial", "pending", "deferred"]).toContain(ch.status);
        expect(ch.progress).toBeGreaterThanOrEqual(0);
        expect(ch.deliverables.length).toBeGreaterThan(0);
      }
    });

    it("第 1~9 章应为 completed", () => {
      for (let i = 0; i < 9; i++) {
        expect(CHAPTER_REVIEWS[i].status).toBe("completed");
      }
    });

    it("第 10 章应为 completed", () => {
      expect(CHAPTER_REVIEWS[9].status).toBe("completed");
    });

    it("应有 8 个统计项", () => {
      expect(PROJECT_STATS.length).toBe(8);
    });

    it("应有 4 个验收分类", () => {
      expect(ACCEPTANCE_CHECKLIST.length).toBe(4);
    });

    it("验收项应全部通过", () => {
      for (const cat of ACCEPTANCE_CHECKLIST) {
        for (const item of cat.items) {
          expect(item.passed).toBe(true);
        }
      }
    });
  });

  describe("渲染", () => {

afterEach(() => {
  cleanup();
});
    it("应渲染主容器", () => {
      render(<StageReview />);
      expect(screen.getAllByTestId("stage-review")[0]).toBeInTheDocument();
    });

    it("默认应显示章节进度", () => {
      render(<StageReview />);
      expect(screen.getAllByTestId("review-chapters")[0]).toBeInTheDocument();
    });

    it("应渲染 10 个章节卡片", () => {
      render(<StageReview />);
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByTestId(`chapter-${i}`)).toBeInTheDocument();
      }
    });

    it("切换到统计概览", () => {
      render(<StageReview />);
      fireEvent.click(screen.getAllByTestId("review-tab-stats")[0]);
      expect(screen.getAllByTestId("review-stats")[0]).toBeInTheDocument();
    });

    it("切换到验收清单", () => {
      render(<StageReview />);
      fireEvent.click(screen.getAllByTestId("review-tab-acceptance")[0]);
      expect(screen.getAllByTestId("review-acceptance")[0]).toBeInTheDocument();
    });

    it("应显示完成进度百分比", () => {
      render(<StageReview />);
      const completed = CHAPTER_REVIEWS.filter((c) => c.status === "completed").length;
      const pct = Math.round((completed / CHAPTER_REVIEWS.length) * 100);
      expect(screen.getAllByText(`${pct}%`)[0]).toBeInTheDocument();
    });

    it("应显示 x/10 章完成", () => {
      render(<StageReview />);
      const completed = CHAPTER_REVIEWS.filter((c) => c.status === "completed").length;
      expect(screen.getByText(`${completed}/${CHAPTER_REVIEWS.length} 章完成`)).toBeInTheDocument();
    });
  });
});
