/**
 * @file: PanelContainer.test.tsx
 * @description: PanelContainer 组件测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-01
 * @updated: 2026-04-01
 * @status: active
 * @tags: [component],[test]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { PanelContainer } from "../modules/dev/ide/PanelContainer";
import type { Panel } from "../modules/dev/ide/ide-layout-types";

const mockSelectPanel = vi.fn();
const mockStartDrag = vi.fn();
const mockOnDrag = vi.fn();
const mockEndDrag = vi.fn();
const mockStartResize = vi.fn();
const mockOnResize = vi.fn();
const mockEndResize = vi.fn();
const mockUpdatePanel = vi.fn();
const mockRemovePanel = vi.fn();

vi.mock("../modules/dev/ide/LayoutContext", () => ({
  useLayoutContext: () => ({
    selectPanel: mockSelectPanel,
    startDrag: mockStartDrag,
    onDrag: mockOnDrag,
    endDrag: mockEndDrag,
    startResize: mockStartResize,
    onResize: mockOnResize,
    endResize: mockEndResize,
    updatePanel: mockUpdatePanel,
    removePanel: mockRemovePanel,
  }),
}));

vi.mock("../modules/dev/ide/PanelContent", () => ({
  PanelContent: ({ panel }: any) => <div data-testid="panel-content">{panel.title}</div>,
}));

vi.mock("../modules/dev/ide/PanelHeader", () => ({
  PanelHeader: ({ panel, isActive, onMouseDown, onMinimize, onMaximize, onClose }: any) => (
    <div data-testid="panel-header" data-active={isActive}>
      <span>{panel.title}</span>
      <button data-testid="header-minimize" onClick={onMinimize}>min</button>
      <button data-testid="header-maximize" onClick={onMaximize}>max</button>
      <button data-testid="header-close" onClick={onClose}>close</button>
      <div data-testid="header-drag" onMouseDown={onMouseDown}>drag</div>
    </div>
  ),
}));

vi.mock("../modules/dev/ide/PanelResizeHandle", () => ({
  PanelResizeHandle: ({ direction, onMouseDown }: any) => (
    <div data-testid={`resize-${direction}`} onMouseDown={onMouseDown} />
  ),
}));

function createMockPanel(overrides: Partial<Panel> = {}): Panel {
  return {
    id: "panel-1",
    type: "code-editor",
    title: "Test Panel",
    position: { x: 10, y: 10, w: 5, h: 5 },
    size: { width: 400, height: 300 },
    minSize: { width: 200, height: 150 },
    maxSize: { width: 800, height: 600 },
    isLocked: false,
    isMinimized: false,
    isMaximized: false,
    isClosable: true,
    isResizable: true,
    zIndex: 1,
    tabs: [],
    activeTabId: "",
    ...overrides,
  };
}

describe("PanelContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render panel container", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(document.querySelector(".panel-container")).toBeInTheDocument();
  });

  it("should render PanelHeader", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(screen.getByTestId("panel-header")).toBeInTheDocument();
  });

  it("should render PanelContent", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(screen.getByTestId("panel-content")).toBeInTheDocument();
  });

  it("should not render when minimized", () => {
    const panel = createMockPanel({ isMinimized: true });
    const { container } = render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(container.querySelector(".panel-container")).not.toBeInTheDocument();
  });

  it("should render resize handles when resizable and not maximized", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(screen.getByTestId("resize-e")).toBeInTheDocument();
    expect(screen.getByTestId("resize-s")).toBeInTheDocument();
    expect(screen.getByTestId("resize-se")).toBeInTheDocument();
  });

  it("should not render resize handles when maximized", () => {
    const panel = createMockPanel({ isMaximized: true });
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(screen.queryByTestId("resize-e")).not.toBeInTheDocument();
  });

  it("should not render resize handles when not resizable", () => {
    const panel = createMockPanel({ isResizable: false });
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    expect(screen.queryByTestId("resize-e")).not.toBeInTheDocument();
  });

  it("should call selectPanel and startDrag on header mouse down", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    fireEvent.mouseDown(screen.getByTestId("header-drag"));
    expect(mockSelectPanel).toHaveBeenCalledWith("panel-1");
    expect(mockStartDrag).toHaveBeenCalled();
  });

  it("should call updatePanel on minimize", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    fireEvent.click(screen.getByTestId("header-minimize"));
    expect(mockUpdatePanel).toHaveBeenCalledWith("panel-1", { isMinimized: true });
  });

  it("should call updatePanel on maximize", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    fireEvent.click(screen.getByTestId("header-maximize"));
    expect(mockUpdatePanel).toHaveBeenCalledWith("panel-1", { isMaximized: true });
  });

  it("should call removePanel on close when closable", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    fireEvent.click(screen.getByTestId("header-close"));
    expect(mockRemovePanel).toHaveBeenCalledWith("panel-1");
  });

  it("should not call removePanel on close when not closable", () => {
    const panel = createMockPanel({ isClosable: false });
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    fireEvent.click(screen.getByTestId("header-close"));
    expect(mockRemovePanel).not.toHaveBeenCalled();
  });

  it("should call startResize on resize handle mouse down", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    fireEvent.mouseDown(screen.getByTestId("resize-e"));
    expect(mockStartResize).toHaveBeenCalled();
  });

  it("should apply active border style", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: true }));
    const container = document.querySelector(".panel-container") as HTMLElement;
    expect(container.style.borderColor).toContain("0.3");
  });

  it("should apply inactive border style", () => {
    const panel = createMockPanel();
    render(React.createElement(PanelContainer, { panel, isActive: false }));
    const container = document.querySelector(".panel-container") as HTMLElement;
    expect(container.style.borderColor).toContain("0.15");
  });
});
