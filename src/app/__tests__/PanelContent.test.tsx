/**
 * @file: PanelContent.test.tsx
 * @description: PanelContent.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PanelContent } from "../modules/dev/ide/PanelContent";
import type { Panel } from "../modules/dev/ide/ide-layout-types";

vi.mock("../modules/dev/ide/LayoutContext", () => ({
  useLayoutContext: () => ({
    activePanelId: "panel-1",
    layout: { panels: [], layout: "grid", theme: "dark", showGridLines: false, snapToGrid: false, gridSize: 8 },
    selectedPanelId: null,
    dragging: { panelId: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0 },
    resizing: { panelId: null, direction: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 },
  }),
}));

function makePanel(type: Panel["type"] = "code-editor"): Panel {
  return {
    id: "panel-1",
    type,
    title: "Test Panel",
    position: { x: 0, y: 0, w: 400, h: 300 },
    size: { width: 400, height: 300 },
    isLocked: false,
    isMinimized: false,
    isMaximized: false,
    isClosable: true,
    isResizable: true,
    zIndex: 1,
    tabs: [],
    activeTabId: "",
  };
}

describe("PanelContent", () => {
  it("should render code editor panel", () => {
    render(<PanelContent panel={makePanel("code-editor")} />);
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
  });

  it("should render preview panel", () => {
    render(<PanelContent panel={makePanel("preview")} />);
    expect(screen.getByText("Preview Panel")).toBeInTheDocument();
  });

  it("should render terminal panel", () => {
    render(<PanelContent panel={makePanel("terminal")} />);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
  });

  it("should render file browser panel", () => {
    render(<PanelContent panel={makePanel("file-browser")} />);
    expect(screen.getByText("File Explorer")).toBeInTheDocument();
  });

  it("should render ai-chat panel", () => {
    render(<PanelContent panel={makePanel("ai-chat")} />);
    expect(screen.getByText("AI Chat")).toBeInTheDocument();
  });

  it("should render database panel", () => {
    render(<PanelContent panel={makePanel("database")} />);
    expect(screen.getByText("Database")).toBeInTheDocument();
  });

  it("should render version control panel", () => {
    render(<PanelContent panel={makePanel("version-control")} />);
    expect(screen.getByText("Version Control")).toBeInTheDocument();
  });

  it("should render unknown panel type", () => {
    render(<PanelContent panel={makePanel("debug")} />);
    expect(screen.getByText("Unknown Panel Type")).toBeInTheDocument();
  });
});
