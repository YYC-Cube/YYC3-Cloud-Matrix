/**
 * @file: DataEditorPanel.test.tsx
 * @description: DataEditorPanel.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataEditorPanel } from "../modules/admin/DataEditorPanel";

vi.mock("../lib/db-queries", () => ({
  getActiveModels: vi.fn(() => ({ data: [] })),
  getNodesStatus: vi.fn(() => ({ data: [] })),
  getAllAgents: vi.fn(() => ({ data: [] })),
  addDbModel: vi.fn(),
  updateDbModel: vi.fn(),
  deleteDbModel: vi.fn(),
  addDbNode: vi.fn(),
  updateDbNode: vi.fn(),
  deleteDbNode: vi.fn(),
  addDbAgent: vi.fn(),
  updateDbAgent: vi.fn(),
  deleteDbAgent: vi.fn(),
  resetDbModels: vi.fn(),
  resetDbAgents: vi.fn(),
  resetDbNodes: vi.fn(),
}));

vi.mock("../hooks/useValidation", () => ({
  useValidation: vi.fn(() => ({
    errors: {},
    validate: vi.fn(),
    clearErrors: vi.fn(),
  })),
  validateRange: vi.fn(() => null),
  validateModelName: vi.fn(() => null),
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

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

describe("DataEditorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => { cleanup(); });
    vi.restoreAllMocks();
  });

  afterAll(() => {
    act(() => { cleanup(); });
  });

  it("should render data editor panel page", () => {
    render(React.createElement(DataEditorPanel));
    // Component renders "数据管理" as the header title
    expect(screen.getByText("数据管理")).toBeInTheDocument();
  });

  it("should render models tab", () => {
    render(React.createElement(DataEditorPanel));
    // Tab label "模型管理" appears in the tab bar
    const tabs = screen.getAllByText("模型管理");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should render nodes tab", () => {
    render(React.createElement(DataEditorPanel));
    const tabs = screen.getAllByText("节点管理");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should render agents tab", () => {
    render(React.createElement(DataEditorPanel));
    const tabs = screen.getAllByText("Agent 管理");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should render export tab", () => {
    render(React.createElement(DataEditorPanel));
    const tabs = screen.getAllByText("配置中心");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should render add button", () => {
    render(React.createElement(DataEditorPanel));
    // Component uses "新增" for the add button
    const addButtons = screen.getAllByText("新增");
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("should render refresh button", () => {
    render(React.createElement(DataEditorPanel));
    // Refresh button renders "刷新" - use getAllByText since StrictMode may double-render
    const refreshButtons = screen.getAllByText("刷新");
    expect(refreshButtons.length).toBeGreaterThan(0);
  });

  it("should render reset button", () => {
    render(React.createElement(DataEditorPanel));
    const resetButtons = screen.getAllByText("重置");
    expect(resetButtons.length).toBeGreaterThan(0);
  });
});
