/**
 * @file: SecurityMonitor.test.tsx
 * @description: SecurityMonitor.test.tsx description
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
import { SecurityMonitor } from "../modules/admin/SecurityMonitor";

vi.mock("../hooks/useSecurityMonitor", () => ({
  useSecurityMonitor: vi.fn(() => ({
    activeTab: "security",
    setActiveTab: vi.fn(),
    scanStatus: "idle",
    startScan: vi.fn(),
    lastScanTime: null,
    overallScore: 0,
    overallRisk: "safe" as const,
    csp: null,
    cookie: null,
    sensitive: null,
    performance: null,
    memory: null,
    vitals: [],
    device: null,
    network: null,
    browser: null,
    dataManagement: null,
    cleanupData: vi.fn(),
    exportData: vi.fn(),
  })),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("SecurityMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render security monitor page", () => {
    render(React.createElement(SecurityMonitor));
    expect(screen.getByText("security.title")).toBeInTheDocument();
  });

  it("should render security tab", () => {
    render(React.createElement(SecurityMonitor));
    expect(screen.getAllByText("security.tabs.security").length).toBeGreaterThan(0);
  });

  it("should render performance tab", () => {
    render(React.createElement(SecurityMonitor));
    expect(screen.getAllByText("security.tabs.performance").length).toBeGreaterThan(0);
  });

  it("should render diagnostics tab", () => {
    render(React.createElement(SecurityMonitor));
    expect(screen.getAllByText("security.tabs.diagnostics").length).toBeGreaterThan(0);
  });

  it("should render data management tab", () => {
    render(React.createElement(SecurityMonitor));
    expect(screen.getAllByText("security.tabs.dataManagement").length).toBeGreaterThan(0);
  });

  it("should render scan button", () => {
    render(React.createElement(SecurityMonitor));
    const scanButtons = screen.getAllByText("security.startScan");
    expect(scanButtons.length).toBeGreaterThan(0);
  });
});
