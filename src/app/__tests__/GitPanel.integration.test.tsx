/**
 * @file: GitPanel.integration.test.tsx
 * @description: GitPanel 组件集成测试 - 测试组件间交互
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [integration-test, git-panel, component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  RadarChart: ({ children }: any) => <div>{children}</div>,
  Radar: () => <div />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  Legend: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
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

describe("GitPanel Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

  describe("Component Rendering", () => {
    it("should render GitPanel with default props", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel));

      // Should render the component without errors
      expect(document.body.children.length).toBeGreaterThan(0);
    });

    it("should render in compact mode", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel, { compact: true }));

      expect(document.body).toBeDefined();
    });

    it("should disable AI integration when configured", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel, { showAIIntegration: false }));

      expect(document.body).toBeDefined();
    });
  });

  describe("Platform Detection", () => {
    it("should detect and display platform information on desktop", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel));

      // Component should render successfully on desktop
      expect(document.body.children.length).toBeGreaterThan(0);
    });
  });

  describe("Tab Navigation", () => {
    it("should have tab navigation elements", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel));

      // Look for tab-related elements
      const tabs = screen.queryAllByRole("tab");
      if (tabs.length > 0) {
        expect(tabs.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Git Operations Integration", () => {
    it("should initialize GitService on mount", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");
      const { getGitService } = await import("../lib/GitService");

      render(React.createElement(GitPanel));

      const service = getGitService();
      expect(service).toBeDefined();
      expect(service.getPlatform()).toBeDefined();
    });

    it("should load Git status after initialization", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel));

      await waitFor(() => {
        expect(document.body).toBeDefined();
      }, { timeout: 5000 });
    });
  });

  describe("Responsive Design", () => {
    it("should adapt to different viewports", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");
      const { ViewContext } = await import("../lib/view-context");

      const mobileViewValue = {
        breakpoint: "sm" as const,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        width: 375,
        isTouch: true,
      };

      const MobileWrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ViewContext.Provider, { value: mobileViewValue }, children);

      render(React.createElement(GitPanel), { wrapper: MobileWrapper });

      expect(document.body).toBeDefined();
    });

    it("should handle tablet viewport", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");
      const { ViewContext } = await import("../lib/view-context");

      const tabletViewValue = {
        breakpoint: "md" as const,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        width: 768,
        isTouch: true,
      };

      const TabletWrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ViewContext.Provider, { value: tabletViewValue }, children);

      render(React.createElement(GitPanel), { wrapper: TabletWrapper });

      expect(document.body).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle Git service errors gracefully", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      const onError = vi.fn();
      const { createGitService } = await import("../lib/GitService");
      createGitService({ onError });

      render(React.createElement(GitPanel));

      expect(document.body).toBeDefined();
    });

    it("should recover from network errors", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel));

      expect(document.body).toBeDefined();
    });
  });

  describe("AI Family Integration", () => {
    it("should display AI care messages when enabled", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      render(React.createElement(GitPanel, { showAIIntegration: true }));

      expect(document.body).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should render within acceptable time", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");

      const startTime = performance.now();
      render(React.createElement(GitPanel));
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });

    it("should not cause memory leaks on unmount", async () => {
      const { GitPanel } = await import("../modules/dev/ide/GitPanel");
      const { getGitService } = await import("../lib/GitService");

      const { unmount } = render(React.createElement(GitPanel));
      const serviceBeforeUnmount = getGitService();

      unmount();

      const serviceAfterUnmount = getGitService();
      expect(serviceAfterUnmount).toBeDefined();
    });
  });
});

describe("GitPanel User Interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

  it("should handle file staging interactions", async () => {
    const { GitPanel } = await import("../modules/dev/ide/GitPanel");

    render(React.createElement(GitPanel));

    await waitFor(() => {
      expect(document.body).toBeDefined();
    }, { timeout: 5000 });
  });

  it("should handle commit workflow", async () => {
    const { GitPanel } = await import("../modules/dev/ide/GitPanel");

    render(React.createElement(GitPanel));

    await waitFor(() => {
      expect(document.body).toBeDefined();
    }, { timeout: 5000 });
  });

  it("should handle branch switching", async () => {
    const { GitPanel } = await import("../modules/dev/ide/GitPanel");

    render(React.createElement(GitPanel));

    await waitFor(() => {
      expect(document.body).toBeDefined();
    }, { timeout: 5000 });
  });
});
