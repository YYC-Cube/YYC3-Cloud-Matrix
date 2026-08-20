/**
 * @file: ThemeCustomizer.test.tsx
 * @description: ThemeCustomizer.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { ThemeCustomizer } from "../modules/dev/ThemeCustomizer";

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

describe("ThemeCustomizer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render theme customizer page", () => {
    render(React.createElement(ThemeCustomizer));
    expect(screen.getByText("主题自定义")).toBeInTheDocument();
  });

  it("should render colors section", () => {
    render(React.createElement(ThemeCustomizer));
    const elems = screen.getAllByText("1. 颜色 · 语义化变量");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render typography section", () => {
    render(React.createElement(ThemeCustomizer));
    const elems = screen.getAllByText("3. 字体排版 · 字体家族");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render shadow section", () => {
    render(React.createElement(ThemeCustomizer));
    const elems = screen.getAllByText("4. 阴影 / 圆角 · 透明度");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render branding section", () => {
    render(React.createElement(ThemeCustomizer));
    const elems = screen.getAllByText("品牌设置 · Logo / 系统信息 / 标语 / 背景");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render presets section", () => {
    render(React.createElement(ThemeCustomizer));
    const elems = screen.getAllByText("预设主题");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render save button", () => {
    render(React.createElement(ThemeCustomizer));
    const saveButtons = screen.getAllByText("保存主题");
    expect(saveButtons.length).toBeGreaterThan(0);
  });

  it("should render reset button", () => {
    render(React.createElement(ThemeCustomizer));
    const resetButtons = screen.getAllByText("重置");
    expect(resetButtons.length).toBeGreaterThan(0);
  });
});
