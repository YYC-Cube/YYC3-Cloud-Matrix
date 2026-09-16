/**
 * @file: ConnectionMonitorPanel.test.tsx
 * @description: ConnectionMonitorPanel 组件测试 — 连接状态监控、健康检查、连接池统计
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

// ─── Mocks ─────────────────────────────────────────────────

vi.mock("../../database/ConnectionManager", () => ({
  connectionManager: {
    getConnection: vi.fn(),
    healthCheck: vi.fn(),
    getPoolStats: vi.fn(),
  },
}));

vi.mock("../../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="glass-card" className={className}>{children}</div>
  ),
}));

import { ConnectionMonitorPanel } from "../modules/ops/ConnectionMonitorPanel";
import { useDbConnSlice } from "../store/slices/db-conn-slice";
import { connectionManager } from "../../database/ConnectionManager";

// ─── Helpers ───────────────────────────────────────────────

const MOCK_HEALTH = {
  isHealthy: true,
  latency: 12,
  checkedAt: Date.now(),
  error: null,
};

const MOCK_POOL = {
  totalConnections: 10,
  activeConnections: 4,
  idleConnections: 5,
  waitingRequests: 1,
};

const MOCK_CONNECTION: Record<string, unknown> = {
  id: "conn-1",
  name: "Production DB",
  config: { type: "postgresql", host: "localhost", port: "5432" },
  status: "connected",
  connectedAt: Date.now() - 60000,
  lastError: null,
};

function setupMocks(connection = MOCK_CONNECTION, health = MOCK_HEALTH, pool = MOCK_POOL) {
  vi.mocked(connectionManager.getConnection).mockReturnValue(connection as any);
  vi.mocked(connectionManager.healthCheck).mockResolvedValue(health as any);
  vi.mocked(connectionManager.getPoolStats).mockReturnValue(pool as any);
}

const TEST_CONNECTIONS = [
  { id: "conn-1", name: "Production DB", type: "postgresql", host: "db.example.com", port: 5432, status: "connected" },
  { id: "conn-2", name: "Analytics DB", type: "mysql", host: "analytics.example.com", port: 3306, status: "error" },
  { id: "conn-3", name: "Cache DB", type: "redis", host: "cache.example.com", port: 6379, status: "connecting" },
];

// ─── Tests ─────────────────────────────────────────────────

describe("ConnectionMonitorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
    useDbConnSlice.setState({
      connections: TEST_CONNECTIONS as any,
    });
  });

  afterEach(() => {
    cleanup();
    useDbConnSlice.setState({ connections: [] });
  });

  // ── 连接列表视图 ──

  describe("连接列表视图", () => {
    it("when no connectionId and showList, renders connection list from useDbConnSlice", () => {
      render(<ConnectionMonitorPanel />);
      expect(screen.getByText("连接监控")).toBeInTheDocument();
      expect(screen.getByText("Production DB")).toBeInTheDocument();
      expect(screen.getByText("Analytics DB")).toBeInTheDocument();
      expect(screen.getByText("Cache DB")).toBeInTheDocument();
    });

    it("renders type and host:port for each connection", () => {
      render(<ConnectionMonitorPanel />);
      expect(screen.getByText(/POSTGRESQL/)).toBeInTheDocument();
      expect(screen.getByText(/MYSQL/)).toBeInTheDocument();
      expect(screen.getByText(/REDIS/)).toBeInTheDocument();
    });

    it("renders connection status labels", () => {
      render(<ConnectionMonitorPanel />);
      expect(screen.getByText("CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ERROR")).toBeInTheDocument();
      expect(screen.getByText("CONNECTING")).toBeInTheDocument();
    });

    it("clicking a connection in list selects it", () => {
      render(<ConnectionMonitorPanel />);
      fireEvent.click(screen.getByText("Production DB"));
      expect(screen.queryByText("连接监控")).not.toBeInTheDocument();
      expect(screen.getByText("Production DB")).toBeInTheDocument();
    });

    it("when no connections, renders empty state with '暂无连接'", () => {
      useDbConnSlice.setState({ connections: [] });
      cleanup();
      render(<ConnectionMonitorPanel />);
      expect(screen.getByText("暂无连接")).toBeInTheDocument();
    });
  });

  // ── 连接详情视图 ──

  describe("连接详情视图", () => {
    it("renders connection details when a connection is selected", () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText("Production DB")).toBeInTheDocument();
      expect(screen.getByText(/POSTGRESQL/)).toBeInTheDocument();
    });

    it("renders connection status (connected)", () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText("CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("连接状态")).toBeInTheDocument();
    });

    it("renders connection status (connecting/reconnecting)", () => {
      setupMocks({ ...MOCK_CONNECTION, status: "connecting" });
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText("CONNECTING")).toBeInTheDocument();
    });

    it("renders connection status (error)", () => {
      setupMocks({ ...MOCK_CONNECTION, status: "error" });
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText("ERROR")).toBeInTheDocument();
    });

    it("renders connection duration", () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText("连接时长")).toBeInTheDocument();
      expect(screen.getByText("1m")).toBeInTheDocument();
    });

    it("renders '-' when no connectedAt", () => {
      setupMocks({ ...MOCK_CONNECTION, connectedAt: undefined as unknown as number });
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  // ── 健康检查 ──

  describe("健康检查", () => {
    it("renders health check card with latency, status, check time", async () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      // healthCheck 为异步加载，卡片在 await 完成后渲染
      expect(await screen.findByText("健康检查")).toBeInTheDocument();
      expect(screen.getByText("12ms")).toBeInTheDocument();
      expect(screen.getByText("健康")).toBeInTheDocument();
      expect(screen.getByText("延迟")).toBeInTheDocument();
      expect(screen.getByText("检查时间")).toBeInTheDocument();
    });

    it("renders unhealthy status", async () => {
      setupMocks(MOCK_CONNECTION, { ...MOCK_HEALTH, isHealthy: false, latency: 520 });
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(await screen.findByText("异常")).toBeInTheDocument();
      expect(screen.getByText("520ms")).toBeInTheDocument();
    });
  });

  // ── 连接池统计 ──

  describe("连接池统计", () => {
    it("renders pool stats card (total, active, idle, waiting)", async () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      // poolStats 在异步 healthCheck 之后设置，等待卡片出现
      expect(await screen.findByText("连接池统计")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("总连接")).toBeInTheDocument();
      expect(screen.getByText("活跃")).toBeInTheDocument();
      expect(screen.getByText("空闲")).toBeInTheDocument();
      expect(screen.getByText("等待")).toBeInTheDocument();
    });
  });

  // ── 错误卡片 ──

  describe("错误卡片", () => {
    it("renders error card when connection has lastError", () => {
      setupMocks({ ...MOCK_CONNECTION, lastError: "Connection timeout after 30s" });
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.getByText(/最后错误: Connection timeout after 30s/)).toBeInTheDocument();
    });

    it("does not render error card when no lastError", () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      expect(screen.queryByText(/最后错误/)).not.toBeInTheDocument();
    });
  });

  // ── 刷新按钮 ──

  describe("刷新按钮", () => {
    it("clicking refresh button updates health check", async () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      vi.mocked(connectionManager.healthCheck).mockClear();
      vi.mocked(connectionManager.getPoolStats).mockClear();

      const allButtons = screen.getAllByRole("button");
      const enabledButtons = allButtons.filter((btn) => !btn.hasAttribute("disabled"));
      fireEvent.click(enabledButtons[enabledButtons.length - 1]);

      await vi.waitFor(() => {
        expect(connectionManager.healthCheck).toHaveBeenCalled();
      });
    });

    it("clicking back button returns to list", () => {
      render(<ConnectionMonitorPanel connectionId="conn-1" />);
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      expect(screen.getByText("连接监控")).toBeInTheDocument();
    });
  });

  // ── 连接不存在 ──

  describe("连接不存在", () => {
    it("handles connection not found gracefully", () => {
      vi.mocked(connectionManager.getConnection).mockReturnValue(null as any);
      vi.mocked(connectionManager.healthCheck).mockResolvedValue(null as any);
      vi.mocked(connectionManager.getPoolStats).mockReturnValue(null as any);
      render(<ConnectionMonitorPanel connectionId="nonexistent" />);
      expect(screen.getByText("连接不存在")).toBeInTheDocument();
    });
  });
});