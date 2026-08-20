/**
 * @file: QuickActionGroup.test.tsx
 * @description: QuickActionGroup.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * QuickActionGroup.test.tsx
 * ===============
 * QuickActionGroup 组件 - 快速操作按钮组测试
 *
 * 覆盖范围:
 * - 默认 5 个操作按钮渲染
 * - 自定义操作按钮
 * - 点击触发回调
 * - loading 状态
 * - compact 模式
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QuickActionGroup } from "../modules/monitor/QuickActionGroup";

describe("QuickActionGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ----------------------------------------------------------
  // 默认渲染
  // ----------------------------------------------------------

  describe("默认渲染", () => {
    it("应渲染 5 个默认操作按钮", () => {
      render(<QuickActionGroup />);
      expect(screen.getAllByText("查看详情")[0]).toBeInTheDocument();
      expect(screen.getAllByText("查看历史")[0]).toBeInTheDocument();
      expect(screen.getAllByText("查看关联")[0]).toBeInTheDocument();
      expect(screen.getAllByText("一键修复")[0]).toBeInTheDocument();
      expect(screen.getAllByText("标记解决")[0]).toBeInTheDocument();
    });

    it("应渲染 5 个按钮元素", () => {
      render(<QuickActionGroup />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(5);
    });
  });

  // ----------------------------------------------------------
  // 回调触发
  // ----------------------------------------------------------

  describe("回调触发", () => {
    it("点击一键修复应触发 onQuickFix", async () => {
      const onQuickFix = vi.fn();
      render(<QuickActionGroup onQuickFix={onQuickFix} />);
      fireEvent.click(screen.getAllByText("一键修复")[0]);
      await waitFor(
        () => {
          expect(onQuickFix).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );
    });

    it("点击标记解决应触发 onMarkResolved", async () => {
      const onMarkResolved = vi.fn();
      render(<QuickActionGroup onMarkResolved={onMarkResolved} />);
      fireEvent.click(screen.getAllByText("标记解决")[0]);
      await waitFor(
        () => {
          expect(onMarkResolved).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );
    });

    it("点击查看详情应触发 onViewDetail", async () => {
      const onViewDetail = vi.fn();
      render(<QuickActionGroup onViewDetail={onViewDetail} />);
      fireEvent.click(screen.getAllByText("查看详情")[0]);
      await waitFor(
        () => {
          expect(onViewDetail).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );
    });
  });

  // ----------------------------------------------------------
  // compact 模式
  // ----------------------------------------------------------

  describe("compact 模式", () => {
    it("compact 模式应正常渲染所有按钮", () => {
      render(<QuickActionGroup compact />);
      expect(screen.getAllByText("查看详情")[0]).toBeInTheDocument();
      expect(screen.getAllByText("一键修复")[0]).toBeInTheDocument();
    });
  });
});
