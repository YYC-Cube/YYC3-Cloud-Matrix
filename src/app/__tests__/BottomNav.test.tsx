/**
 * @file: BottomNav.test.tsx
 * @description: BottomNav.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * BottomNav.test.tsx
 * ===========
 * BottomNav 组件 - 渲染测试
 *
 * 覆盖范围:
 * - 6 个导航项渲染
 * - 当前路由高亮
 * - 导航点击跳转
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const mockNavigate = vi.fn() as any;
let mockPathname = "/";

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    "bottomNav.monitor": "监控",
    "bottomNav.followUp": "跟进",
    "bottomNav.operations": "操作",
    "bottomNav.patrol": "巡查",
  };
  return translations[key] || key;
};

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({ t: mockT }),
}));

import { BottomNav } from "../modules/shared/BottomNav";

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染 4 个导航项", () => {
      render(<BottomNav />);
      expect(screen.getByText("监控")).toBeInTheDocument();
      expect(screen.getByText("跟进")).toBeInTheDocument();
      expect(screen.getByText("巡查")).toBeInTheDocument();
      expect(screen.getByText("操作")).toBeInTheDocument();
    });

    it("应渲染 5 个按钮（4 个导航 + 1 个更多）", () => {
      render(<BottomNav />);
      expect(screen.getAllByRole("button").length).toBe(5);
    });
  });

  describe("导航点击", () => {
    it("点击跟进应导航到 /follow-up", () => {
      render(<BottomNav />);
      fireEvent.click(screen.getByText("跟进"));
      expect(mockNavigate).toHaveBeenCalledWith("/follow-up");
    });

    it("点击巡查应导航到 /patrol", () => {
      render(<BottomNav />);
      fireEvent.click(screen.getByText("巡查"));
      expect(mockNavigate).toHaveBeenCalledWith("/patrol");
    });

    it("点击操作应导航到 /operations", () => {
      render(<BottomNav />);
      fireEvent.click(screen.getByText("操作"));
      expect(mockNavigate).toHaveBeenCalledWith("/operations");
    });

    it("点击监控应导航到 /", () => {
      mockPathname = "/settings";
      render(<BottomNav />);
      fireEvent.click(screen.getByText("监控"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("路由高亮", () => {
    it("首页时监控按钮应有激活样式", () => {
      mockPathname = "/";
      render(<BottomNav />);
      const btn = screen.getByText("监控").closest("button")!;
      expect(btn.innerHTML).toContain("text-[#00d4ff]");
    });

    it("跟进页时跟进按钮应有激活样式", () => {
      mockPathname = "/follow-up";
      render(<BottomNav />);
      const btn = screen.getByText("跟进").closest("button")!;
      expect(btn.innerHTML).toContain("text-[#00d4ff]");
    });

    it("非活跃按钮应有降低透明度样式", () => {
      mockPathname = "/";
      render(<BottomNav />);
      const btn = screen.getByText("巡查").closest("button")!;
      expect(btn.innerHTML).toContain("text-[rgba(0,212,255,0.25)]");
    });
  });
});
