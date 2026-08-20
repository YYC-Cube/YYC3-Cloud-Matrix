/**
 * @file: PanelToolbar.test.tsx
 * @description: PanelToolbar 组件测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-01
 * @updated: 2026-04-05
 * @status: active
 * @tags: [component],[test]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { PanelToolbar } from "../modules/dev/ide/PanelToolbar";

const mockAddPanel = vi.fn();
const mockUpdateLayoutConfig = vi.fn();
const mockSaveLayout = vi.fn();
const mockResetLayout = vi.fn();

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../modules/dev/ide/LayoutContext", () => ({
  useLayoutContext: () => ({
    layoutConfig: {
      panels: [],
      layout: "custom",
      theme: "dark",
      showGridLines: false,
      snapToGrid: false,
      gridSize: 20,
    },
    updateLayoutConfig: mockUpdateLayoutConfig,
    addPanel: mockAddPanel,
    saveLayout: mockSaveLayout,
    resetLayout: mockResetLayout,
    panels: [],
  }),
}));

describe("PanelToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render toolbar container", () => {
    render(React.createElement(PanelToolbar));
    expect(document.querySelector(".panel-toolbar")).toBeInTheDocument();
  });

  it("should render add panel button", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText("ide.addPanel")).toBeInTheDocument();
  });

  it("should toggle panel menu on add button click", () => {
    render(React.createElement(PanelToolbar));
    const addBtn = screen.getByText("ide.addPanel");
    fireEvent.click(addBtn);
    expect(screen.getByText("ide.panels.code")).toBeInTheDocument();
  });

  it("should close panel menu on second click", () => {
    render(React.createElement(PanelToolbar));
    const addBtn = screen.getByText("ide.addPanel");
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.queryByText("ide.panels.code")).not.toBeInTheDocument();
  });

  it("should call addPanel when panel type selected", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    fireEvent.click(screen.getByText("ide.panels.code"));
    expect(mockAddPanel).toHaveBeenCalled();
  });

  it("should call addPanel for preview panel", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    fireEvent.click(screen.getByText("ide.panels.preview"));
    expect(mockAddPanel).toHaveBeenCalled();
  });

  it("should call addPanel for terminal panel", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    fireEvent.click(screen.getByText("ide.panels.terminal"));
    expect(mockAddPanel).toHaveBeenCalled();
  });

  it("should call addPanel for file-browser panel", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    fireEvent.click(screen.getByText("ide.panels.explorer"));
    expect(mockAddPanel).toHaveBeenCalled();
  });

  it("should call addPanel for ai-chat panel", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    fireEvent.click(screen.getByText("ide.panels.aiChat"));
    expect(mockAddPanel).toHaveBeenCalled();
  });

  it("should close menu after selecting panel", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    fireEvent.click(screen.getByText("ide.panels.code"));
    expect(screen.queryByText("ide.panels.code")).not.toBeInTheDocument();
  });

  it("should close menu when clicking outside", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    expect(screen.getByText("ide.panels.code")).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("ide.panels.code")).not.toBeInTheDocument();
  });

  it("should not close menu when clicking inside menu", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    const menu = document.querySelector('[class*="absolute"]');
    if (menu) {
      fireEvent.mouseDown(menu);
      expect(screen.getByText("ide.panels.code")).toBeInTheDocument();
    }
  });

  it("should render grid lines toggle button", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText("ide.gridLines")).toBeInTheDocument();
  });

  it("should call updateLayoutConfig when grid lines toggled", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.gridLines"));
    expect(mockUpdateLayoutConfig).toHaveBeenCalledWith({ showGridLines: true });
  });

  it("should render snap to grid toggle button", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText("ide.snapToGrid")).toBeInTheDocument();
  });

  it("should call updateLayoutConfig when snap to grid toggled", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.snapToGrid"));
    expect(mockUpdateLayoutConfig).toHaveBeenCalledWith({ snapToGrid: true });
  });

  it("should render save button", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText("common.save")).toBeInTheDocument();
  });

  it("should call saveLayout when save button clicked", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("common.save"));
    expect(mockSaveLayout).toHaveBeenCalled();
  });

  it("should render reset button", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText("ide.reset")).toBeInTheDocument();
  });

  it("should call resetLayout when confirmed", () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.reset"));
    expect(confirmSpy).toHaveBeenCalledWith("ide.confirmReset");
    expect(mockResetLayout).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("should not call resetLayout when cancelled", () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.reset"));
    expect(confirmSpy).toHaveBeenCalledWith("ide.confirmReset");
    expect(mockResetLayout).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("should render settings button", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText("common.settings")).toBeInTheDocument();
  });

  it("should render panel count", () => {
    render(React.createElement(PanelToolbar));
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it("should render all panel type options", () => {
    render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    expect(screen.getByText("ide.panels.code")).toBeInTheDocument();
    expect(screen.getByText("ide.panels.preview")).toBeInTheDocument();
    expect(screen.getByText("ide.panels.terminal")).toBeInTheDocument();
    expect(screen.getByText("ide.panels.explorer")).toBeInTheDocument();
    expect(screen.getByText("ide.panels.aiChat")).toBeInTheDocument();
  });

  it("should cleanup event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(React.createElement(PanelToolbar));
    fireEvent.click(screen.getByText("ide.addPanel"));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });
});
