/**
 * @file: ServiceLoopPanel.test.tsx
 * @description: ServiceLoopPanel.test.tsx description
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
import { ServiceLoopPanel } from "../modules/ops/ServiceLoopPanel";

vi.mock("../hooks/useServiceLoop", () => ({
  useServiceLoop: vi.fn(() => ({
    currentRun: null,
    history: [],
    isRunning: false,
    autoMode: false,
    setAutoMode: vi.fn(),
    currentStageIndex: 0,
    stats: {
      totalRuns: 0,
      successRuns: 0,
      errorRuns: 0,
      avgDuration: 0,
    },
    startLoop: vi.fn(),
    abortLoop: vi.fn(),
    clearHistory: vi.fn(),
    stageMeta: [
      { key: "monitor", labelKey: "loop.stages.monitor", icon: "Eye" },
      { key: "analyze", labelKey: "loop.stages.analyze", icon: "Brain" },
      { key: "decide", labelKey: "loop.stages.decide", icon: "Zap" },
      { key: "execute", labelKey: "loop.stages.execute", icon: "Play" },
      { key: "verify", labelKey: "loop.stages.verify", icon: "CheckCircle" },
      { key: "optimize", labelKey: "loop.stages.optimize", icon: "TrendingUp" },
    ],
    dataFlowNodes: [],
    dataFlowEdges: [],
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

vi.mock("../modules/ops/LoopStageCard", () => ({
  LoopStageCard: ({ meta }: any) => React.createElement("div", { "data-testid": `stage-${meta.key}` }, meta.labelKey),
}));

vi.mock("../modules/dev/DataFlowDiagram", () => ({
  DataFlowDiagram: () => React.createElement("div", { "data-testid": "data-flow-diagram" }),
}));

describe("ServiceLoopPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render service loop panel page", () => {
    render(React.createElement(ServiceLoopPanel));
    expect(screen.getByText("loop.title")).toBeInTheDocument();
  });

  it("should render start button", () => {
    render(React.createElement(ServiceLoopPanel));
    const startButtons = screen.getAllByText("loop.startLoop");
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it("should render auto loop toggle", () => {
    render(React.createElement(ServiceLoopPanel));
    const autoLoopButtons = screen.getAllByText("loop.autoLoop");
    expect(autoLoopButtons.length).toBeGreaterThan(0);
  });

  it("should render stats section", () => {
    render(React.createElement(ServiceLoopPanel));
    expect(screen.getAllByText("loop.totalRuns").length).toBeGreaterThan(0);
    expect(screen.getAllByText("loop.successRuns").length).toBeGreaterThan(0);
    expect(screen.getAllByText("loop.errorRuns").length).toBeGreaterThan(0);
    expect(screen.getAllByText("loop.avgDuration").length).toBeGreaterThan(0);
  });

  it("should render pipeline section", () => {
    render(React.createElement(ServiceLoopPanel));
    expect(screen.getAllByText("loop.pipeline").length).toBeGreaterThan(0);
  });

  it("should render data flow section", () => {
    render(React.createElement(ServiceLoopPanel));
    expect(screen.getAllByText("loop.dataFlow").length).toBeGreaterThan(0);
  });
});
