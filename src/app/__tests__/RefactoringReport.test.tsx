/**
 * @file: RefactoringReport.test.tsx
 * @description: RefactoringReport.test.tsx description
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
import { RefactoringReport } from "../modules/dev/RefactoringReport";

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("RefactoringReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render refactoring report page", () => {
    render(React.createElement(RefactoringReport));
    expect(screen.getByText("YYC3 深度代码分析 & 重构方案")).toBeInTheDocument();
  });

  it("should render severity filters", () => {
    render(React.createElement(RefactoringReport));
    // Severity labels used in filter buttons: "严重 (N)", "高 (N)", etc.
    const criticalLabels = screen.getAllByText(/严重/);
    expect(criticalLabels.length).toBeGreaterThan(0);
    const highLabels = screen.getAllByText("高");
    expect(highLabels.length).toBeGreaterThan(0);
    const mediumLabels = screen.getAllByText("中");
    expect(mediumLabels.length).toBeGreaterThan(0);
    const lowLabels = screen.getAllByText("低");
    expect(lowLabels.length).toBeGreaterThan(0);
  });

  it("should render category labels in severity distribution", () => {
    render(React.createElement(RefactoringReport));
    // Severity distribution section header
    const severitySections = screen.getAllByText(/严重级别分布/);
    expect(severitySections.length).toBeGreaterThan(0);
  });

  it("should render issue cards", () => {
    render(React.createElement(RefactoringReport));
    const wsIssues = screen.getAllByText("WebSocket URL 三源冲突");
    expect(wsIssues.length).toBeGreaterThan(0);
    const errorLogIssues = screen.getAllByText("错误日志双路径存储分裂");
    expect(errorLogIssues.length).toBeGreaterThan(0);
  });

  it("should render effort indicators", () => {
    render(React.createElement(RefactoringReport));
    // Effort badges show S, M, L, XL
    const effortBadges = screen.getAllByText("M");
    expect(effortBadges.length).toBeGreaterThan(0);
  });

  it("should render stats overview", () => {
    render(React.createElement(RefactoringReport));
    const foundLabels = screen.getAllByText("发现问题");
    expect(foundLabels.length).toBeGreaterThan(0);
    const fileLabels = screen.getAllByText("影响文件");
    expect(fileLabels.length).toBeGreaterThan(0);
    const phaseLabels = screen.getAllByText("重构阶段");
    expect(phaseLabels.length).toBeGreaterThan(0);
  });
});
