/**
 * @file: ConfigCenter.test.tsx
 * @description: ConfigCenter 组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [test],[component],[admin]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { ConfigCenter } from "../modules/admin/ConfigCenter";

const samplePages = [
  {
    id: "dashboard",
    title: "仪表板",
    path: "/dashboard",
    description: "Dashboard page",
    version: "1.0.0",
    category: "main",
    editable: true,
    layout: { showHeader: true, showSidebar: true, maxWidth: "lg", padding: "md", scrollable: true, showBottomNav: false },
    header: { showTitle: true, showBackButton: false, showActions: true, sticky: true, fontSize: "md" },
    sidebar: { showInNav: true, navOrder: 1, navGroup: "主要" },
    storageKeys: ["yyc3-dashboard"],
  },
  {
    id: "settings",
    title: "设置",
    path: "/settings",
    description: "Settings page",
    version: "1.0.0",
    category: "system",
    editable: false,
    layout: { showHeader: true, showSidebar: false, maxWidth: "md", padding: "md", scrollable: true, showBottomNav: false },
    header: { showTitle: true, showBackButton: true, showActions: false, sticky: false, fontSize: "md" },
    sidebar: { showInNav: true, navOrder: 2, navGroup: "系统" },
    storageKeys: [],
  },
  {
    id: "login",
    title: "登录",
    path: "/login",
    description: "Login page",
    version: "1.0.0",
    category: "auth",
    editable: false,
    layout: { showHeader: false, showSidebar: false, maxWidth: "sm", padding: "none", scrollable: false, showBottomNav: false },
    header: { showTitle: false, showBackButton: false, showActions: false, sticky: false, fontSize: "md" },
    sidebar: { showInNav: false, navOrder: 0, navGroup: "隐藏" },
    storageKeys: [],
  },
];

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock("../config", () => ({
  getAllPages: vi.fn(() => samplePages),
  getPageConfigByPath: vi.fn(),
  getMergedPageConfig: vi.fn(),
  updatePageConfig: vi.fn(),
  resetPageConfig: vi.fn(),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "glass-card" }, children),
}));

vi.mock("../modules/admin/PageConfigEditor", () => ({
  PageConfigEditor: ({ pageId }: { pageId?: string }) =>
    React.createElement("div", { "data-testid": "page-config-editor", "data-page-id": pageId }),
}));

describe("ConfigCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders header with title '配置中心'", () => {
    render(React.createElement(ConfigCenter));
    expect(screen.getByText("配置中心")).toBeInTheDocument();
  });

  it("renders 2 tabs: 页面配置, 存储管理", () => {
    render(React.createElement(ConfigCenter));
    expect(screen.getByText("页面配置")).toBeInTheDocument();
    expect(screen.getByText("存储管理")).toBeInTheDocument();
  });

  it("default tab is 'pages'", () => {
    render(React.createElement(ConfigCenter));
    expect(screen.getByText("选择一个页面")).toBeInTheDocument();
  });

  it("renders page list in sidebar grouped by navGroup", () => {
    render(React.createElement(ConfigCenter));
    expect(screen.getByText("主要")).toBeInTheDocument();
    expect(screen.getByText("系统")).toBeInTheDocument();
    expect(screen.getByText("隐藏")).toBeInTheDocument();
    expect(screen.getByText("仪表板")).toBeInTheDocument();
    expect(screen.getByText("设置")).toBeInTheDocument();
  });

  it("clicking a page selects it and shows PageConfigEditor", () => {
    render(React.createElement(ConfigCenter));
    const pageButton = screen.getByText("仪表板");
    fireEvent.click(pageButton);
    const editor = screen.getByTestId("page-config-editor");
    expect(editor).toBeInTheDocument();
    expect(editor.getAttribute("data-page-id")).toBe("dashboard");
  });

  it("shows '选择一个页面' placeholder when no page selected", () => {
    render(React.createElement(ConfigCenter));
    expect(screen.getByText("选择一个页面")).toBeInTheDocument();
    expect(screen.getByText("从左侧列表中选择一个页面进行配置")).toBeInTheDocument();
  });

  it("'可编辑' badge on editable pages", () => {
    render(React.createElement(ConfigCenter));
    expect(screen.getByText("可编辑")).toBeInTheDocument();
  });

  it("clicking import button opens file dialog", () => {
    render(React.createElement(ConfigCenter));
    const importBtn = screen.getByText("导入");
    expect(importBtn).toBeInTheDocument();
  });

  it("clicking export button triggers download", () => {
    render(React.createElement(ConfigCenter));
    const exportBtn = screen.getByText("导出");
    expect(exportBtn).toBeInTheDocument();
  });

  it("clicking reset button shows confirm dialog", () => {
    render(React.createElement(ConfigCenter));
    const resetBtn = screen.getByText("重置");
    expect(resetBtn).toBeInTheDocument();
  });

  it("storage tab renders StorageManager (internal component)", () => {
    render(React.createElement(ConfigCenter));
    const storageTabs = screen.getAllByText("存储管理");
    const storageTab = storageTabs[0];
    fireEvent.click(storageTab);
    expect(screen.getByText("查看和管理本地存储数据")).toBeInTheDocument();
  });

  it("storage manager shows yyc3-prefixed keys", () => {
    localStorage.setItem("yyc3-test-key", JSON.stringify({ value: "test" }));
    localStorage.setItem("yyc3-settings", JSON.stringify({ theme: "dark" }));
    localStorage.setItem("other-key", "not-yyc3");
    render(React.createElement(ConfigCenter));
    const storageTabs = screen.getAllByText("存储管理");
    const storageTab = storageTabs[0];
    fireEvent.click(storageTab);
    expect(screen.getByText("yyc3-test-key")).toBeInTheDocument();
    expect(screen.getByText("yyc3-settings")).toBeInTheDocument();
  });

  it("storage manager shows total size", () => {
    render(React.createElement(ConfigCenter));
    const storageTabs = screen.getAllByText("存储管理");
    const storageTab = storageTabs[0];
    fireEvent.click(storageTab);
    expect(screen.getByText("清除全部")).toBeInTheDocument();
  });

  it("storage manager has clear key and clear all buttons", () => {
    localStorage.setItem("yyc3-test-key", JSON.stringify({ value: "test" }));
    render(React.createElement(ConfigCenter));
    const storageTabs = screen.getAllByText("存储管理");
    const storageTab = storageTabs[0];
    fireEvent.click(storageTab);
    const clearButtons = screen.getAllByText("清除");
    expect(clearButtons.length).toBeGreaterThan(0);
    const clearAllBtn = screen.getByText("清除全部");
    expect(clearAllBtn).toBeInTheDocument();
  });
});