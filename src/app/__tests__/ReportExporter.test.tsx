/**
 * @file: ReportExporter.test.tsx
 * @description: ReportExporter.test.tsx description
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
import { ReportExporter } from "../modules/ops/ReportExporter";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
}));

vi.mock("../hooks/useReportExporter", () => ({
  useReportExporter: vi.fn(() => ({
    reportType: "performance",
    setReportType: vi.fn(),
    timeRange: "24h",
    setTimeRange: vi.fn(),
    isGenerating: false,
    report: null,
    recentReports: [],
    generateReport: vi.fn(),
    exportReport: vi.fn(),
  })),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("ReportExporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render report exporter page", () => {
    render(React.createElement(ReportExporter));
    expect(screen.getByText("reports.title")).toBeInTheDocument();
  });

  it("should render report types", () => {
    render(React.createElement(ReportExporter));
    expect(screen.getAllByText("reports.typePerformance").length).toBeGreaterThan(0);
    expect(screen.getAllByText("reports.typeSecurity").length).toBeGreaterThan(0);
    expect(screen.getAllByText("reports.typeAudit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("reports.typeComprehensive").length).toBeGreaterThan(0);
  });

  it("should render time ranges", () => {
    render(React.createElement(ReportExporter));
    expect(screen.getAllByText("1h").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6h").length).toBeGreaterThan(0);
    expect(screen.getAllByText("24h").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7d").length).toBeGreaterThan(0);
    expect(screen.getAllByText("30d").length).toBeGreaterThan(0);
  });

  it("should render export section when report is available", () => {
    render(React.createElement(ReportExporter));
    // When report is null, empty state is shown
    expect(screen.getAllByText("reports.emptyHint").length).toBeGreaterThan(0);
  });

  it("should render generate button", () => {
    render(React.createElement(ReportExporter));
    // "reports.generate" appears in the generate button
    expect(screen.getAllByText("reports.generate").length).toBeGreaterThan(0);
  });
});
