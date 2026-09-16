/**
 * @file: DatabaseConnectionPanel.test.tsx
 * @description: DatabaseConnectionPanel 全面测试 — CRUD / 连接池 / SQL 测试
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-19
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { DatabaseConnectionPanel } from "../modules/ops/DatabaseConnectionPanel";
import { useDbConnSlice } from "../store/slices/db-conn-slice";
import { toast } from "sonner";

vi.mock("../lib/env-config", () => ({
  env: vi.fn((key: string) => {
    if (key === "SQL_TEST_SIMULATE_DELAY") return 50;
    if (key === "SYSTEM_NAME") return "YYC3";
    return "";
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// 注意：组件实际从 src/app/components/CodeEditor 导入 SQLEditor，
// vi.mock 路径必须与组件的导入解析路径一致，否则 mock 静默失效
vi.mock("../components/CodeEditor", () => ({
  SQLEditor: ({ value, onChange, onExecute }: any) => (
    <div>
      <textarea
        aria-label="SQL Editor"
        data-testid="sql-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" data-testid="sql-execute-btn" onClick={onExecute}>Run</button>
    </div>
  ),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

const MOCK_CONN = {
  name: "Test DB",
  type: "postgresql" as const,
  host: "localhost",
  port: 5432,
  database: "testdb",
  username: "admin",
  password: "secret",
  status: "disconnected" as const,
  options: "",
};

function renderPanel() {
  return render(React.createElement(DatabaseConnectionPanel));
}

describe("DatabaseConnectionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useDbConnSlice.setState({
      connections: [],
      poolConfig: {
        minConnections: 2,
        maxConnections: 10,
        idleTimeoutMs: 30000,
        acquireTimeoutMs: 5000,
        maxRetries: 3,
        healthCheckIntervalMs: 60000,
        enableAutoScale: true,
        enableHealthCheck: true,
      },
      sqlHistory: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ═══ 基础渲染 ═══
  describe("基础渲染", () => {
    it("renders panel title", () => {
      renderPanel();
      expect(screen.getByText("数据库连接管理")).toBeInTheDocument();
    });

    it("renders new connection button", () => {
      renderPanel();
      expect(screen.getByTestId("db-new-connection-btn")).toBeInTheDocument();
    });

    it("renders export button", () => {
      renderPanel();
      expect(screen.getByTestId("db-export-btn")).toBeInTheDocument();
    });

    it("renders import button", () => {
      renderPanel();
      expect(screen.getByTestId("db-import-btn")).toBeInTheDocument();
    });

    it("renders reset button", () => {
      renderPanel();
      expect(screen.getByTestId("db-reset-btn")).toBeInTheDocument();
    });

    it("shows empty state when no connections", () => {
      useDbConnSlice.setState({ connections: [] });
      renderPanel();
      expect(screen.getByText("暂无数据库连接")).toBeInTheDocument();
    });
  });

  // ═══ 新建连接 ═══
  describe("新建连接", () => {
    it("opens add form on button click", () => {
      renderPanel();
      fireEvent.click(screen.getByTestId("db-new-connection-btn"));
      expect(screen.getByText("新建数据库连接")).toBeInTheDocument();
    });

    it("creates a new connection", () => {
      renderPanel();
      fireEvent.click(screen.getByTestId("db-new-connection-btn"));

      const nameInput = screen.getByPlaceholderText("主数据库");
      fireEvent.change(nameInput, { target: { value: "My Test DB" } });

      fireEvent.click(screen.getByText("创建连接"));
      expect(useDbConnSlice.getState().connections).toHaveLength(1);
      expect(useDbConnSlice.getState().connections[0].name).toBe("My Test DB");
    });

    it("does not create connection without name", () => {
      renderPanel();
      fireEvent.click(screen.getByTestId("db-new-connection-btn"));

      const createBtn = screen.getByText("创建连接");
      expect(createBtn).toBeDisabled();
    });

    it("closes add form on cancel", () => {
      renderPanel();
      fireEvent.click(screen.getByTestId("db-new-connection-btn"));
      expect(screen.getByText("新建数据库连接")).toBeInTheDocument();

      const cancelBtn = screen.getByText("取消");
      fireEvent.click(cancelBtn);
      expect(screen.queryByText("新建数据库连接")).not.toBeInTheDocument();
    });
  });

  // ═══ 编辑连接 ═══
  describe("编辑连接", () => {
    it("enters edit mode", () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
      });
      renderPanel();

      const editBtns = screen.getAllByText("编辑");
      fireEvent.click(editBtns[0]);
      expect(screen.getByText("保存")).toBeInTheDocument();
    });

    it("saves edited connection", () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
      });
      renderPanel();

      fireEvent.click(screen.getAllByText("编辑")[0]);

      const nameInput = screen.getByPlaceholderText("名称");
      fireEvent.change(nameInput, { target: { value: "Updated DB" } });

      fireEvent.click(screen.getByText("保存"));
      expect(useDbConnSlice.getState().connections[0].name).toBe("Updated DB");
    });
  });

  // ═══ 删除连接 ═══
  describe("删除连接", () => {
    it("deletes a connection", () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
      });
      renderPanel();

      expect(useDbConnSlice.getState().connections).toHaveLength(1);
      fireEvent.click(screen.getAllByText("删除")[0]);
      expect(useDbConnSlice.getState().connections).toHaveLength(0);
    });
  });

  // ═══ 连接池配置 ═══
  describe("连接池配置", () => {
    it("renders connection pool section", () => {
      renderPanel();
      expect(screen.getByText("连接池配置")).toBeInTheDocument();
    });

    it("expands pool config on click", () => {
      renderPanel();
      const header = screen.getByText("连接池配置");
      fireEvent.click(header);
      expect(screen.getByText("自动伸缩")).toBeInTheDocument();
      expect(screen.getByText("健康检查")).toBeInTheDocument();
    });

    it("displays pool range in header", () => {
      renderPanel();
      expect(screen.getByText("2~10 连接")).toBeInTheDocument();
    });

    it("resets pool config", () => {
      useDbConnSlice.setState({
        poolConfig: {
          ...useDbConnSlice.getState().poolConfig,
          maxConnections: 50,
        },
      });
      renderPanel();

      fireEvent.click(screen.getByText("连接池配置"));
      fireEvent.click(screen.getByText("重置默认"));

      expect(useDbConnSlice.getState().poolConfig.maxConnections).toBe(10);
    });
  });

  // ═══ SQL 快速测试 ═══
  describe("SQL 快速测试", () => {
    it("renders SQL quick test section", () => {
      renderPanel();
      expect(screen.getByText("SQL 快速测试")).toBeInTheDocument();
    });

    it("executes SELECT query", async () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
      });
      renderPanel();

      fireEvent.click(screen.getByText("SQL 快速测试"));

      const editor = screen.getByTestId("sql-editor");
      fireEvent.change(editor, { target: { value: "SELECT * FROM nodes;" } });

      await act(async () => {
        fireEvent.click(screen.getByTestId("sql-execute-btn"));
      });

      await waitFor(() => {
        expect(useDbConnSlice.getState().sqlHistory).toHaveLength(1);
      });
    });

    it("blocks dangerous SQL", async () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
      });
      renderPanel();

      fireEvent.click(screen.getByText("SQL 快速测试"));

      const editor = screen.getByTestId("sql-editor");
      fireEvent.change(editor, { target: { value: "DROP TABLE nodes;" } });

      await act(async () => {
        fireEvent.click(screen.getByTestId("sql-execute-btn"));
      });

      await waitFor(() => {
        expect(screen.getByText(/安全拦截/)).toBeInTheDocument();
      });
    });

    it("clears SQL history", () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
        sqlHistory: ["SELECT 1", "SELECT 2"],
      });
      renderPanel();

      fireEvent.click(screen.getByText("SQL 快速测试"));

      expect(screen.getByText(/历史查询/)).toBeInTheDocument();
      fireEvent.click(screen.getByText("清除"));
      expect(useDbConnSlice.getState().sqlHistory).toHaveLength(0);
    });
  });

  // ═══ 导出/导入/重置 ═══
  describe("导出/导入/重置", () => {
    it("export triggers download", () => {
      useDbConnSlice.setState({
        connections: [{ ...MOCK_CONN, id: "db-test-1" }],
      });
      renderPanel();

      const createObjectURLSpy = vi.fn(() => "blob:test");
      const revokeObjectURLSpy = vi.fn();
      vi.stubGlobal("URL", {
        createObjectURL: createObjectURLSpy,
        revokeObjectURL: revokeObjectURLSpy,
      });

      fireEvent.click(screen.getByTestId("db-export-btn"));
      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it("reset shows info toast", () => {
      renderPanel();
      fireEvent.click(screen.getByTestId("db-reset-btn"));
      expect(toast.info).toHaveBeenCalledWith(
        "重置功能已迁移至统一Store",
        expect.any(Object)
      );
    });
  });
});
