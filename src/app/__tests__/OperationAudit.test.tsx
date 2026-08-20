/**
 * @file: OperationAudit.test.tsx
 * @description: OperationAudit.test.tsx description
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
import { OperationAudit } from "../modules/admin/OperationAudit";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("OperationAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render operation audit page", () => {
    render(React.createElement(OperationAudit));
    // The component renders using t() keys; the heading uses t("audit.opsTrend") and t("audit.auditLog")
    expect(screen.getByText("audit.opsTrend")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(React.createElement(OperationAudit));
    expect(screen.getAllByPlaceholderText("audit.searchLog").length).toBeGreaterThan(0);
  });

  it("should render filter buttons", () => {
    render(React.createElement(OperationAudit));
    expect(screen.getAllByText("audit.filterAll").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.filterSuccess").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.filterAbnormal").length).toBeGreaterThan(0);
  });

  it("should render audit logs table", () => {
    render(React.createElement(OperationAudit));
    expect(screen.getAllByText("audit.colTime").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.colUser").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.colAction").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.colTarget").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.colStatus").length).toBeGreaterThan(0);
  });

  it("should render export button", () => {
    render(React.createElement(OperationAudit));
    expect(screen.getAllByText("audit.export").length).toBeGreaterThan(0);
  });

  it("should render summary cards", () => {
    render(React.createElement(OperationAudit));
    expect(screen.getAllByText("audit.todayOps").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.abnormalEvents").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.securityEvents").length).toBeGreaterThan(0);
    expect(screen.getAllByText("audit.activeUsers").length).toBeGreaterThan(0);
  });
});
