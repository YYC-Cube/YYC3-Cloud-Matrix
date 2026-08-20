/**
 * @file: Dashboard.test.tsx
 * @description: Dashboard.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-03-31
 * @updated: 2026-04-09
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
}));

vi.mock("react-swipeable", () => ({
  useSwipeable: vi.fn(() => ({
    ref: { current: null },
    onMouseDown: vi.fn(),
    onTouchStart: vi.fn(),
  })),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock("../lib/view-context", () => ({
  WebSocketContext: React.createContext({
    state: "connected",
    data: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    liveQPS: 3842,
    qpsTrend: "+12.3%",
    liveLatency: 48,
    latencyTrend: "-5.2%",
    activeNodes: "7/8",
    gpuUtil: "82.4%",
    tokenThroughput: "138K/s",
    storageUsed: "12.8TB",
    nodes: [],
    throughputHistory: [],
  }),
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
  useView: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

vi.mock("../stores/global-store", () => {
  const actual = vi.importActual("../stores/global-store");
  return {
    ...actual,
    useAlerts: vi.fn(() => ({
      followUps: [],
    })),
  };
});

vi.mock("../modules/monitor/AlertBanner", () => ({
  AlertBanner: () => null,
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: any) => (
    <div data-testid="glass-card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("../modules/monitor/NodeDetailModal", () => ({
  NodeDetailModal: () => null,
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage to prevent Zustand persist issues
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should render dashboard page", async () => {
    // Dynamic import to avoid circular dependencies
    const { Dashboard } = await import("../modules/monitor/Dashboard");

    render(React.createElement(Dashboard));
    
    // The component renders stat cards and sections using t() keys
    expect(screen.getByText("monitor.throughputChart")).toBeInTheDocument();
  });

  it("should render chart tabs on mobile", async () => {
    const { Dashboard } = await import("../modules/monitor/Dashboard");
    const { ViewContext } = await import("../lib/view-context");

    // Wrap Dashboard with mobile ViewContext provider
    const mobileViewValue = {
      breakpoint: "sm" as const,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 375,
      isTouch: true
    };

    const MobileWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ViewContext.Provider, { value: mobileViewValue }, children);

    render(React.createElement(Dashboard), { wrapper: MobileWrapper });
    
    // ChartTabBar renders t() keys for tabs
    expect(screen.getByText("monitor.radarTab")).toBeInTheDocument();
    expect(screen.getByText("monitor.performanceTab")).toBeInTheDocument();
    expect(screen.getByText("monitor.predictionTab")).toBeInTheDocument();
  });

  it("should render refresh button", async () => {
    const { Dashboard } = await import("../modules/monitor/Dashboard");

    render(React.createElement(Dashboard));
    
    // The refresh button renders t("monitor.refresh") text (but only on non-mobile)
    const refreshButtons = screen.getAllByText("monitor.refresh");
    expect(refreshButtons.length).toBeGreaterThan(0);
  });

  it("should render panorama button", async () => {
    const { Dashboard } = await import("../modules/monitor/Dashboard");

    render(React.createElement(Dashboard));
    
    // The panorama/view-all button renders t("monitor.panorama") text (non-mobile)
    const panoramaButtons = screen.getAllByText("monitor.panorama");
    expect(panoramaButtons.length).toBeGreaterThan(0);
  });
});
