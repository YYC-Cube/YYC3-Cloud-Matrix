/**
 * @file: Workspace.test.tsx
 * @description: Workspace 组件测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-01
 * @updated: 2026-04-01
 * @status: active
 * @tags: [component],[test]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { Workspace } from "../modules/dev/ide/Workspace";

vi.mock("../modules/dev/ide/LayoutContext", () => ({
  useLayoutContext: () => ({
    panels: [
      {
        id: "panel-1",
        type: "code-editor" as const,
        title: "Editor",
        position: { x: 0, y: 0, w: 5, h: 5 },
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
      },
    ],
    activePanelId: "panel-1",
    layoutConfig: {
      panels: [],
      layout: "custom" as const,
      theme: "dark" as const,
      showGridLines: true,
      snapToGrid: false,
      gridSize: 20,
    },
  }),
}));

vi.mock("../modules/dev/ide/PanelContainer", () => ({
  PanelContainer: ({ panel, isActive }: any) => (
    <div data-testid={`panel-${panel.id}`} data-active={isActive}>
      {panel.title}
    </div>
  ),
}));

vi.mock("../modules/dev/ide/PanelToolbar", () => ({
  PanelToolbar: () => <div data-testid="panel-toolbar">Toolbar</div>,
}));

describe("Workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render workspace container", () => {
    render(React.createElement(Workspace));
    expect(document.querySelector(".workspace")).toBeInTheDocument();
  });

  it("should render workspace content area", () => {
    render(React.createElement(Workspace));
    expect(document.querySelector(".workspace-content")).toBeInTheDocument();
  });

  it("should render PanelToolbar", () => {
    render(React.createElement(Workspace));
    expect(screen.getByTestId("panel-toolbar")).toBeInTheDocument();
  });

  it("should render panels", () => {
    render(React.createElement(Workspace));
    expect(screen.getByTestId("panel-panel-1")).toBeInTheDocument();
  });

  it("should pass isActive to PanelContainer", () => {
    render(React.createElement(Workspace));
    const panel = screen.getByTestId("panel-panel-1");
    expect(panel.getAttribute("data-active")).toBe("true");
  });
});
