/**
 * @file: PatrolDashboard.test.tsx
 * @description: PatrolDashboard.test.tsx description
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
import { PatrolDashboard } from "../modules/monitor/PatrolDashboard";

vi.mock("../hooks/usePatrol", () => ({
  usePatrol: vi.fn(() => ({
    patrolStatus: "idle",
    currentResult: null,
    history: [],
    schedule: {
      enabled: false,
      interval: 3600,
      lastRun: null,
      nextRun: null,
    },
    progress: 0,
    selectedReport: null,
    runPatrol: vi.fn(),
    toggleAutoPatrol: vi.fn(),
    updateInterval: vi.fn(),
    viewReport: vi.fn(),
    closeReport: vi.fn(),
  })),
}));

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

describe("PatrolDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render patrol dashboard page", () => {
    render(React.createElement(PatrolDashboard));
    expect(screen.getByText("patrol.title")).toBeInTheDocument();
  });

  it("should render patrol plan button", () => {
    render(React.createElement(PatrolDashboard));
    const patrolPlanButtons = screen.getAllByText("patrol.patrolPlan");
    expect(patrolPlanButtons.length).toBeGreaterThan(0);
  });

  it("should render manual patrol button", () => {
    render(React.createElement(PatrolDashboard));
    const manualPatrolButtons = screen.getAllByText("patrol.manualPatrol");
    expect(manualPatrolButtons.length).toBeGreaterThan(0);
  });

  it("should render history section", () => {
    render(React.createElement(PatrolDashboard));
    const historyElements = screen.getAllByText("巡查历史");
    expect(historyElements.length).toBeGreaterThan(0);
  });

  it("should render no-history message when history is empty", () => {
    render(React.createElement(PatrolDashboard));
    const emptyMessages = screen.getAllByText("当前范围内没有巡查记录");
    expect(emptyMessages.length).toBeGreaterThan(0);
  });
});
