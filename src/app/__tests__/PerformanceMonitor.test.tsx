/**
 * @file: PerformanceMonitor.test.tsx
 * @description: PerformanceMonitor.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { PerformanceMonitor } from "../modules/admin/PerformanceMonitor";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  ReferenceLine: () => <div />,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../lib/env-config", () => ({
  env: {},
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render performance monitor page", () => {
    render(React.createElement(PerformanceMonitor));
    expect(screen.getByText("性能监控")).toBeInTheDocument();
  });

  it("should render web vitals section", () => {
    render(React.createElement(PerformanceMonitor));
    // Web Vitals metrics are rendered as individual cards with names like FCP, LCP, etc.
    const fcpLabels = screen.getAllByText("FCP");
    expect(fcpLabels.length).toBeGreaterThan(0);
  });

  it("should render memory section", () => {
    render(React.createElement(PerformanceMonitor));
    // Memory stat card has label "JS Heap"
    const jsHeapLabels = screen.getAllByText("JS Heap");
    expect(jsHeapLabels.length).toBeGreaterThan(0);
  });

  it("should render fps section", () => {
    render(React.createElement(PerformanceMonitor));
    // FPS stat card has label "FPS"
    const fpsLabels = screen.getAllByText("FPS");
    expect(fpsLabels.length).toBeGreaterThan(0);
  });

  it("should render resources section", () => {
    render(React.createElement(PerformanceMonitor));
    // Resource stat card has label "资源数"
    const resourceLabels = screen.getAllByText("资源数");
    expect(resourceLabels.length).toBeGreaterThan(0);
  });

  it("should render storage section", () => {
    render(React.createElement(PerformanceMonitor));
    // Storage stat card has label "localStorage"
    const storageLabels = screen.getAllByText("localStorage");
    expect(storageLabels.length).toBeGreaterThan(0);
  });

  it("should render alerts section", () => {
    render(React.createElement(PerformanceMonitor));
    // Alert button contains "告警" text
    const alertButtons = screen.getAllByText(/告警/);
    expect(alertButtons.length).toBeGreaterThan(0);
  });

  it("should render refresh button", () => {
    render(React.createElement(PerformanceMonitor));
    // Auto-refresh button shows "自动" when enabled
    const autoButtons = screen.getAllByText("自动");
    expect(autoButtons.length).toBeGreaterThan(0);
  });

  it("should render export button", () => {
    render(React.createElement(PerformanceMonitor));
    // Export button text is "导出快照"
    const exportButtons = screen.getAllByText("导出快照");
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it("should render alert toggle", () => {
    render(React.createElement(PerformanceMonitor));
    const alertButtons = screen.getAllByText(/告警/);
    expect(alertButtons.length).toBeGreaterThan(0);
  });
});
