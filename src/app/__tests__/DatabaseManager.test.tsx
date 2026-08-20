/**
 * @file: DatabaseManager.test.tsx
 * @description: DatabaseManager.test.tsx description
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
import { DatabaseManager } from "../modules/ops/DatabaseManager";

vi.mock("../hooks/useLocalDatabase", () => ({
  useLocalDatabase: vi.fn(() => ({
    connections: [],
    tables: [],
    activeConnectionId: null,
    activeConnection: null,
    queryHistory: [],
    backups: [],
    queryResults: [],
    sqlInput: "",
    sqlTemplates: [],
    stats: {
      totalConnections: 0,
      connectedCount: 0,
      totalTables: 0,
      totalTableRows: 0,
      totalTableSize: 0,
      queryCount: 0,
    },
    detecting: false,
    testing: null,
    querying: false,
    tableDataLoading: false,
    tableData: [],
    selectedTable: null,
    addConnection: vi.fn(),
    removeConnection: vi.fn(),
    connectDB: vi.fn(),
    disconnectDB: vi.fn(),
    testConnection: vi.fn(),
    detectDatabases: vi.fn(),
    loadTables: vi.fn(),
    loadTableData: vi.fn(),
    executeQuery: vi.fn(),
    createBackup: vi.fn(),
    restoreBackup: vi.fn(),
    deleteBackup: vi.fn(),
    clearQueryHistory: vi.fn(),
    executeTemplate: vi.fn(),
    replayQuery: vi.fn(),
    setSqlInput: vi.fn(),
    setSelectedTable: vi.fn(),
  })),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../modules/dev/CodeEditor", () => ({
  SQLEditor: ({ value, onChange }: any) => (
    <textarea value={value} onChange={(e: any) => onChange(e.target.value)} />
  ),
}));

vi.mock("../modules/admin/InlineEditableTable", () => ({
  InlineEditableTable: () => <div data-testid="inline-editable-table" />,
}));

vi.mock("../lib/api-config", () => ({
  getAPIConfig: vi.fn(() => ({ enableBackend: false })),
}));

describe("DatabaseManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render database manager page", () => {
    render(React.createElement(DatabaseManager));
    expect(screen.getByText("本地数据库管理")).toBeInTheDocument();
  });

  it("should render tabs", () => {
    render(React.createElement(DatabaseManager));
    expect(screen.getAllByText("连接管理").length).toBeGreaterThan(0);
    expect(screen.getAllByText("表浏览").length).toBeGreaterThan(0);
    expect(screen.getAllByText("查询控制台").length).toBeGreaterThan(0);
    expect(screen.getAllByText("查询历史").length).toBeGreaterThan(0);
    expect(screen.getAllByText("备份恢复").length).toBeGreaterThan(0);
  });

  it("should render new connection button", () => {
    render(React.createElement(DatabaseManager));
    const buttons = screen.getAllByText("新建连接");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should render stats bar", () => {
    render(React.createElement(DatabaseManager));
    expect(screen.getAllByText("连接数").length).toBeGreaterThan(0);
    expect(screen.getAllByText("已连接").length).toBeGreaterThan(0);
    expect(screen.getAllByText("表数量").length).toBeGreaterThan(0);
    expect(screen.getAllByText("总行数").length).toBeGreaterThan(0);
  });
});
