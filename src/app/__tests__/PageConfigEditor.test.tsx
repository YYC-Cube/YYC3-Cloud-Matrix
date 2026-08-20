/**
 * @file: PageConfigEditor.test.tsx
 * @description: PageConfigEditor 组件单元测试
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
import { PageConfigEditor } from "../modules/admin/PageConfigEditor";
import { usePageConfigById } from "../hooks/usePageConfig";

const mockUpdateConfig = vi.fn();
const mockResetConfig = vi.fn();

const defaultConfig = {
  id: "test-page",
  title: "测试页面",
  description: "测试页面描述",
  version: "1.0.0",
  category: "main",
  path: "/test",
  editable: true,
  layout: {
    showHeader: true,
    showSidebar: true,
    maxWidth: "lg" as const,
    padding: "md" as const,
    scrollable: true,
    showBottomNav: false,
  },
  header: {
    showTitle: true,
    showBackButton: false,
    showActions: true,
    sticky: true,
    fontSize: "md" as const,
  },
  sidebar: {
    showInNav: true,
    navOrder: 1,
    navGroup: "主要",
  },
  storageKeys: ["yyc3-test-page", "yyc3-test-cache"],
};

const mockUsePageConfigResult = {
  config: defaultConfig,
  isLoading: false,
  updateConfig: mockUpdateConfig,
  resetConfig: mockResetConfig,
  isEditable: true,
  storageKeys: ["yyc3-test-page", "yyc3-test-cache"],
};

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock("../hooks/usePageConfig", () => ({
  usePageConfig: vi.fn(() => mockUsePageConfigResult),
  usePageConfigById: vi.fn(() => mockUsePageConfigResult),
}));

vi.mock("../config", () => ({
  PageConfig: {} as any,
}));

vi.mock("../components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
  }) => React.createElement("button", { onClick, disabled, "data-testid": "button", "data-variant": variant }, children),
}));

vi.mock("../components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card" }, children),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card-content" }, children),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("p", { className, "data-testid": "card-description" }, children),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card-header" }, children),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("h3", { className, "data-testid": "card-title" }, children),
}));

vi.mock("../components/ui/label", () => ({
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("label", { className }, children),
}));

vi.mock("../components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, disabled }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }) => React.createElement("button", {
    "data-testid": "switch",
    "data-checked": checked,
    disabled,
    onClick: () => onCheckedChange?.(!checked),
  }),
}));

vi.mock("../components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => React.createElement("div", { "data-testid": "select", "data-value": value }, children),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-content" }, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("div", { "data-testid": "select-item", "data-value": value }, children),
  SelectTrigger: ({ className }: { className?: string }) =>
    React.createElement("button", { className, "data-testid": "select-trigger" }),
  SelectValue: () => React.createElement("span", { "data-testid": "select-value" }),
}));

vi.mock("../components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, disabled, type, className }: {
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    className?: string;
  }) => React.createElement("input", { value, placeholder, disabled, type, className, onChange, "data-testid": "input" }),
}));

vi.mock("../components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) =>
    React.createElement("div", { "data-testid": "tabs", "data-default": defaultValue }, children),
  TabsContent: ({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) =>
    React.createElement("div", { "data-testid": "tabs-content", "data-value": value, className }, children),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "tabs-list" }, children),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("button", { "data-testid": "tabs-trigger", "data-value": value }, children),
}));

vi.mock("../components/ui/badge", () => ({
  Badge: ({ children, variant, className }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => React.createElement("span", { "data-testid": "badge", "data-variant": variant, className }, children),
}));

describe("PageConfigEditor", () => {
  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateConfig.mockClear();
    mockResetConfig.mockClear();
    mockOnSave.mockClear();
    mockOnReset.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderEditor(props = {}) {
    return render(
      React.createElement(PageConfigEditor, {
        pageId: "test-page",
        onSave: mockOnSave,
        onReset: mockOnReset,
        ...props,
      })
    );
  }

  it("renders '请选择一个页面进行配置' when no config", () => {
    (usePageConfigById as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      ...mockUsePageConfigResult,
      config: null,
    });
    render(React.createElement(PageConfigEditor, { pageId: "nonexistent" }));
    expect(screen.getByText("请选择一个页面进行配置")).toBeInTheDocument();
  });

  it("renders page title and description when config exists", () => {
    renderEditor();
    expect(screen.getByText("测试页面")).toBeInTheDocument();
    expect(screen.getByText("测试页面描述")).toBeInTheDocument();
  });

  it("renders 4 tabs: layout, header, sidebar, storage", () => {
    renderEditor();
    expect(screen.getByText("布局")).toBeInTheDocument();
    expect(screen.getByText("头部")).toBeInTheDocument();
    expect(screen.getByText("导航")).toBeInTheDocument();
    expect(screen.getByText("存储")).toBeInTheDocument();
  });

  it("layout tab: showHeader toggle", () => {
    renderEditor();
    const switches = screen.getAllByTestId("switch");
    expect(switches.length).toBeGreaterThan(0);
  });

  it("layout tab: showSidebar toggle", () => {
    renderEditor();
    expect(screen.getByText("显示侧边栏")).toBeInTheDocument();
  });

  it("layout tab: maxWidth select", () => {
    renderEditor();
    expect(screen.getByText("最大宽度")).toBeInTheDocument();
  });

  it("layout tab: padding select", () => {
    renderEditor();
    expect(screen.getByText("内边距")).toBeInTheDocument();
  });

  it("layout tab: scrollable toggle", () => {
    renderEditor();
    expect(screen.getByText("可滚动")).toBeInTheDocument();
  });

  it("layout tab: showBottomNav toggle", () => {
    renderEditor();
    expect(screen.getByText("显示底部导航")).toBeInTheDocument();
  });

  it("header tab: showTitle, showBackButton, showActions, sticky, fontSize", () => {
    renderEditor();
    const headerTab = screen.getByText("头部");
    fireEvent.click(headerTab);
    expect(screen.getByText("显示标题")).toBeInTheDocument();
    expect(screen.getByText("显示返回按钮")).toBeInTheDocument();
    expect(screen.getByText("显示操作按钮")).toBeInTheDocument();
    expect(screen.getByText("粘性头部")).toBeInTheDocument();
    expect(screen.getByText("标题字号")).toBeInTheDocument();
  });

  it("sidebar tab: showInNav, navOrder, navGroup, badge", () => {
    renderEditor();
    const sidebarTab = screen.getByText("导航");
    fireEvent.click(sidebarTab);
    expect(screen.getByText("显示在导航")).toBeInTheDocument();
    expect(screen.getByText("导航顺序")).toBeInTheDocument();
    expect(screen.getByText("导航分组")).toBeInTheDocument();
    expect(screen.getByText("徽章文本")).toBeInTheDocument();
  });

  it("storage tab: shows storage keys list", () => {
    renderEditor();
    const storageTab = screen.getByText("存储");
    fireEvent.click(storageTab);
    expect(screen.getByText("yyc3-test-page")).toBeInTheDocument();
    expect(screen.getByText("yyc3-test-cache")).toBeInTheDocument();
  });

  it("save button disabled when no changes", () => {
    renderEditor();
    const saveBtn = screen.getByText("保存更改");
    expect(saveBtn).toBeDisabled();
  });

  it("making changes enables save button", () => {
    renderEditor();
    const switches = screen.getAllByTestId("switch");
    const firstSwitch = switches[0];
    fireEvent.click(firstSwitch);
    const saveBtn = screen.getByText("保存更改");
    expect(saveBtn).not.toBeDisabled();
  });

  it("clicking save calls updateConfig and onSave", () => {
    renderEditor();
    const switches = screen.getAllByTestId("switch");
    fireEvent.click(switches[0]);
    const saveBtn = screen.getByText("保存更改");
    fireEvent.click(saveBtn);
    expect(mockUpdateConfig).toHaveBeenCalled();
    expect(mockOnSave).toHaveBeenCalled();
  });

  it("clicking reset calls resetConfig and onReset", () => {
    renderEditor();
    const resetBtn = screen.getByText("重置");
    fireEvent.click(resetBtn);
    expect(mockResetConfig).toHaveBeenCalled();
    expect(mockOnReset).toHaveBeenCalled();
  });

  it("clicking export downloads config JSON", () => {
    renderEditor();
    const exportBtn = screen.getByText("导出");
    expect(exportBtn).toBeInTheDocument();
  });

  it("version badge shows config version", () => {
    renderEditor();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
  });

  it("category badge shows config category", () => {
    renderEditor();
    expect(screen.getByText("main")).toBeInTheDocument();
  });
});