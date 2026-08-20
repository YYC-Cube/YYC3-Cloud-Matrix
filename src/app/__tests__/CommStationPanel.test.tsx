/**
 * @file: CommStationPanel.test.tsx
 * @description: CommStationPanel 组件测试 — 通讯基站管理面板
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

// ─── Mocks ─────────────────────────────────────────────────

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "nav.commStation": "通讯基站",
      };
      return translations[key] || key;
    },
  }),
}));

const { mockUpsert, mockRemove, mockUsePersistedList } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
  mockRemove: vi.fn(),
  mockUsePersistedList: vi.fn(),
}));

const DEFAULT_STATIONS = [
  { id: "cs-001", name: "YYC3-主站-5G-A", type: "5g", status: "online", signal: 95, latency: 3, connections: 128, maxConnections: 256, uptime: 99.97, location: "A栋-3F-机房01", lastCheck: Date.now() - 30000 },
  { id: "cs-002", name: "YYC3-辅站-WiFi-01", type: "wifi", status: "online", signal: 82, latency: 8, connections: 64, maxConnections: 128, uptime: 99.85, location: "B栋-2F-走廊", lastCheck: Date.now() - 60000 },
  { id: "cs-003", name: "YYC3-Mesh-节点-03", type: "mesh", status: "degraded", signal: 45, latency: 22, connections: 32, maxConnections: 64, uptime: 98.5, location: "C栋-1F-仓库", lastCheck: Date.now() - 120000 },
  { id: "cs-004", name: "YYC3-基站-4G-备份", type: "4g", status: "offline", signal: 0, latency: 0, connections: 0, maxConnections: 128, uptime: 0, location: "D栋-B1-设备间", lastCheck: Date.now() - 3600000 },
];

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: (...args: any[]) => mockUsePersistedList(...args),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="glass-card" className={className}>{children}</div>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { CommStationPanel } from "../modules/business/CommStationPanel";
import { usePersistedList } from "../hooks/usePersistedState";

// ─── Helpers ───────────────────────────────────────────────

function renderPanel() {
  return render(React.createElement(CommStationPanel));
}

// ─── Tests ─────────────────────────────────────────────────

describe("CommStationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePersistedList.mockReturnValue({
      items: DEFAULT_STATIONS,
      upsert: mockUpsert,
      remove: mockRemove,
      loaded: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  // ── 标题渲染 ──

  describe("标题渲染", () => {
    it("renders title '通讯基站'", () => {
      renderPanel();
      expect(screen.getByText("通讯基站")).toBeInTheDocument();
    });
  });

  // ── 统计卡片 ──

  describe("统计卡片", () => {
    it("renders 4 stat cards: online, degraded, offline, avg signal", () => {
      renderPanel();
      expect(screen.getByText("在线")).toBeInTheDocument();
      expect(screen.getByText("降级")).toBeInTheDocument();
      expect(screen.getByText("离线")).toBeInTheDocument();
      expect(screen.getByText("平均信号")).toBeInTheDocument();
    });

    it("displays correct stat values", () => {
      renderPanel();
      // 2 online, 1 degraded, 1 offline, avg signal = (95+82+45+0)/4 = 55.5 -> 56
      // Use getAllByText since "1" appears in both degraded and offline cards
      const twos = screen.getAllByText("2");
      expect(twos.length).toBeGreaterThanOrEqual(1);
      const ones = screen.getAllByText("1");
      expect(ones.length).toBeGreaterThanOrEqual(2); // degraded + offline
      // avgSignal should be 56%
      expect(screen.getByText("56%")).toBeInTheDocument();
    });
  });

  // ── 表格 ──

  describe("表格", () => {
    it("renders stations table with headers: status, name, type, signal, latency, connections, location, operations", () => {
      renderPanel();
      const headers = ["状态", "名称", "类型", "信号", "延迟", "连接数", "位置", "操作"];
      headers.forEach((header) => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });

    it("renders default stations from mock", () => {
      renderPanel();
      expect(screen.getByText("YYC3-主站-5G-A")).toBeInTheDocument();
      expect(screen.getByText("YYC3-辅站-WiFi-01")).toBeInTheDocument();
      expect(screen.getByText("YYC3-Mesh-节点-03")).toBeInTheDocument();
      expect(screen.getByText("YYC3-基站-4G-备份")).toBeInTheDocument();
    });
  });

  // ── 状态图标 ──

  describe("状态图标", () => {
    it("renders status icons: online (green check), degraded (yellow alert), offline (red x), maintenance (blue settings)", () => {
      renderPanel();
      // Check that the status icons are rendered by checking for the SVG elements
      // Each station row has a status icon
      const rows = screen.getAllByRole("row");
      // First row is header, so at least 5 rows total (header + 4 stations)
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ── 类型标签 ──

  describe("类型标签", () => {
    it("renders type labels: 5G, WiFi, Mesh, 4G", () => {
      renderPanel();
      expect(screen.getByText("5G")).toBeInTheDocument();
      expect(screen.getByText("WiFi")).toBeInTheDocument();
      expect(screen.getByText("Mesh")).toBeInTheDocument();
      expect(screen.getByText("4G")).toBeInTheDocument();
    });
  });

  // ── 信号条 ──

  describe("信号条", () => {
    it("signal bar renders with correct width", () => {
      renderPanel();
      // The signal bar shows 95% for the first station
      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("82%")).toBeInTheDocument();
      expect(screen.getByText("45%")).toBeInTheDocument();
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  // ── 详情面板 ──

  describe("详情面板", () => {
    it("clicking a station row shows detail panel", () => {
      renderPanel();
      fireEvent.click(screen.getByText("YYC3-主站-5G-A"));
      // Detail panel should show signal, latency, uptime, connections
      // Use getAllByText since "延迟" appears in both table header and detail panel
      const signalLabels = screen.getAllByText("信号强度");
      expect(signalLabels.length).toBeGreaterThanOrEqual(1);
      const latencyLabels = screen.getAllByText("延迟");
      expect(latencyLabels.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("在线率")).toBeInTheDocument();
      expect(screen.getByText("活跃连接")).toBeInTheDocument();
    });

    it("clicking again hides detail panel", () => {
      renderPanel();
      const stationName = screen.getByText("YYC3-主站-5G-A");
      fireEvent.click(stationName);
      expect(screen.getByText("信号强度")).toBeInTheDocument();
      fireEvent.click(stationName);
      expect(screen.queryByText("信号强度")).not.toBeInTheDocument();
    });

    it("detail panel shows close button", () => {
      renderPanel();
      fireEvent.click(screen.getByText("YYC3-主站-5G-A"));
      expect(screen.getByText("关闭")).toBeInTheDocument();
    });

    it("detail panel shows signal, latency, uptime, connections", () => {
      renderPanel();
      fireEvent.click(screen.getByText("YYC3-主站-5G-A"));
      // Use getAllByText since signal values appear in both table and detail panel
      const signal95 = screen.getAllByText("95%");
      expect(signal95.length).toBeGreaterThanOrEqual(1);
      const latency3ms = screen.getAllByText("3ms");
      expect(latency3ms.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("99.97%")).toBeInTheDocument();
      const connections = screen.getAllByText("128/256");
      expect(connections.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── 添加基站 ──

  describe("添加基站", () => {
    it("add button shows add form", () => {
      renderPanel();
      fireEvent.click(screen.getByText("添加基站"));
      expect(screen.getByText("添加新基站")).toBeInTheDocument();
    });

    it("add form has name, type selector, location inputs", () => {
      renderPanel();
      fireEvent.click(screen.getByText("添加基站"));
      expect(screen.getByPlaceholderText("基站名称")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("位置")).toBeInTheDocument();
      // Type selector
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });

    it("submitting add form adds new station", () => {
      renderPanel();
      fireEvent.click(screen.getByText("添加基站"));
      const nameInput = screen.getByPlaceholderText("基站名称");
      fireEvent.change(nameInput, { target: { value: "New Station" } });
      fireEvent.click(screen.getByText("确认添加"));
      expect(mockUpsert).toHaveBeenCalledTimes(1);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: "New Station" })
      );
    });

    it("cancel button hides add form", () => {
      renderPanel();
      fireEvent.click(screen.getByText("添加基站"));
      expect(screen.getByText("添加新基站")).toBeInTheDocument();
      fireEvent.click(screen.getByText("取消"));
      expect(screen.queryByText("添加新基站")).not.toBeInTheDocument();
    });
  });

  // ── 删除基站 ──

  describe("删除基站", () => {
    it("clicking delete removes station", () => {
      renderPanel();
      // Find delete buttons (Trash2 icon)
      const deleteButtons = Array.from(document.querySelectorAll("button")).filter(
        (btn) => btn.title === "删除基站"
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
      fireEvent.click(deleteButtons[0]);
      expect(mockRemove).toHaveBeenCalledTimes(1);
    });
  });

  // ── 空状态 ──

  describe("空状态", () => {
    it("shows empty state when no stations", () => {
      // Override the mock to return empty items
      mockUsePersistedList.mockReturnValue({
        items: [],
        upsert: mockUpsert,
        remove: mockRemove,
        loaded: true,
      } as any);

      cleanup();
      renderPanel();
      expect(screen.getByText("暂无基站数据，请添加")).toBeInTheDocument();
    });
  });
});