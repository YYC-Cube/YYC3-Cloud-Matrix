/**
 * @file: DesignSystemPage.test.tsx
 * @description: DesignSystemPage.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * DesignSystemPage.test.tsx
 * ===============
 * DesignSystemPage 主页面测试
 *
 * 覆盖范围:
 * - 页面标题
 * - 3 个区域导航 (Design Tokens / 组件库 / 阶段审核)
 * - 区域切换
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DesignSystemPage } from "../modules/dev/design-system/DesignSystemPage";
import { ViewContext } from "../lib/view-context";
import { I18nContext } from "../hooks/useI18n";

function renderPage() {
  const viewValue = {
    breakpoint: "lg" as const,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1280,
    isTouch: false,
  };

  const translations: Record<string, string> = {
    "designSystem.title": "YYC³ Design System",
    "designSystem.subtitle": "设计交付物 · 组件库 · 规范文档 · 阶段审核",
    "designSystem.tokens": "Design Tokens",
    "designSystem.tokensDesc": "色彩 · 字体 · 间距 · 阴影 · 动效",
    "designSystem.components": "组件库",
    "designSystem.componentsDesc": "Atoms · Molecules · Organisms · Templates",
    "designSystem.review": "阶段审核总结",
    "designSystem.reviewDesc": "10 章实施进度 · 验收清单 · 统计概览",
  };

  const i18nValue = {
    locale: "zh-CN" as const,
    setLocale: vi.fn(),
    t: (key: string) => translations[key] || key,
    locales: [],
  };

  return render(
    <ViewContext.Provider value={viewValue}>
      <I18nContext.Provider value={i18nValue}>
        <DesignSystemPage />
      </I18nContext.Provider>
    </ViewContext.Provider>
  );
}

describe("DesignSystemPage", () => {
  afterEach(() => {
    cleanup();
  });
  it("应渲染页面标题", () => {
    renderPage();
    expect(screen.getAllByText("YYC³ Design System")[0]).toBeInTheDocument();
  });

  it("应有主容器", () => {
    renderPage();
    expect(screen.getAllByTestId("design-system-page")[0]).toBeInTheDocument();
  });

  it("应有 3 个区域导航", () => {
    renderPage();
    expect(screen.getAllByTestId("section-tokens")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("section-components")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("section-review")[0]).toBeInTheDocument();
  });

  it("默认应显示 Design Tokens", () => {
    renderPage();
    expect(screen.getAllByTestId("design-tokens")[0]).toBeInTheDocument();
  });

  it("点击组件库应切换到 ComponentShowcase", () => {
    renderPage();
    fireEvent.click(screen.getAllByTestId("section-components")[0]);
    expect(screen.getAllByTestId("component-showcase")[0]).toBeInTheDocument();
  });

  it("点击阶段审核应切换到 StageReview", () => {
    renderPage();
    fireEvent.click(screen.getAllByTestId("section-review")[0]);
    expect(screen.getAllByTestId("stage-review")[0]).toBeInTheDocument();
  });
});
