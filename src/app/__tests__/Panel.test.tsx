/**
 * @file: Panel.test.tsx
 * @description: Panel.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Panel } from "../modules/dev/ide/Panel";
import type { Panel as PanelType } from "../modules/dev/ide/ide-layout-types";

// Mock LayoutContext since PanelContent and TabBar use it
vi.mock("../modules/dev/ide/LayoutContext", () => ({
  useLayoutContext: () => ({
    switchTab: vi.fn(),
    removeTab: vi.fn(),
    activePanelId: "panel-1",
  }),
}));

const createPanel = (overrides: Partial<PanelType> = {}): PanelType => ({
  id: "panel-1",
  title: "Test Panel",
  type: "code-editor",
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
  ...overrides,
});

describe("Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render panel with correct structure", () => {
    const panel = createPanel();
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText("Test Panel")).toBeInTheDocument();
  });

  it("should not render tab bar when panel has no tabs", () => {
    const panel = createPanel({ tabs: [] });
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    // When there are no tabs, TabBar is not rendered
    // Check that no tab titles are present
    const tabBar = screen.queryByText("Tab 1");
    expect(tabBar).not.toBeInTheDocument();
  });

  it("should apply maximized class when panel is maximized", () => {
    const panel = createPanel({ isMaximized: true });
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    // The outer div has class "panel maximized"
    const panelTitle = screen.getByText("Test Panel");
    const panelEl = panelTitle.closest(".panel");
    expect(panelEl?.className).toContain("maximized");
  });

  it("should not apply maximized class when panel is not maximized", () => {
    const panel = createPanel({ isMaximized: false });
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    const panelTitle = screen.getByText("Test Panel");
    const panelEl = panelTitle.closest(".panel");
    expect(panelEl?.className).not.toContain("maximized");
  });

  it("should call onMouseDown when mouse down event occurs on header", () => {
    const onMouseDown = vi.fn();
    const panel = createPanel();
    render(<Panel panel={panel} isActive={true} onMouseDown={onMouseDown} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    // The header is the div with class "panel-header"
    const panelTitle = screen.getByText("Test Panel");
    const header = panelTitle.closest(".panel-header") as HTMLElement;
    expect(header).toBeTruthy();
    fireEvent.mouseDown(header!);

    expect(onMouseDown).toHaveBeenCalled();
  });

  it("should call onMinimize when minimize button is clicked", () => {
    const onMinimize = vi.fn();
    const panel = createPanel();
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={onMinimize} onMaximize={vi.fn()} onClose={vi.fn()} />);

    // The minimize button has title="Minimize"
    const minimizeBtn = screen.getByTitle("Minimize");
    fireEvent.click(minimizeBtn);

    expect(onMinimize).toHaveBeenCalled();
  });

  it("should call onMaximize when maximize button is clicked", () => {
    const onMaximize = vi.fn();
    const panel = createPanel();
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={onMaximize} onClose={vi.fn()} />);

    const maximizeBtn = screen.getByTitle("Maximize");
    fireEvent.click(maximizeBtn);

    expect(onMaximize).toHaveBeenCalled();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const panel = createPanel({ isClosable: true });
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={onClose} />);

    const closeBtn = screen.getByTitle("Close");
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("should render tabs correctly", () => {
    const panel = createPanel({
      tabs: [
        { id: "tab-1", panelId: "panel-1", title: "Tab 1", icon: "📄", isActive: true, isModified: false, isUnsaved: false, isPinned: false, hasError: false },
        { id: "tab-2", panelId: "panel-1", title: "Tab 2", icon: undefined, isActive: false, isModified: true, isUnsaved: false, isPinned: false, hasError: false },
      ],
    });
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
  });

  it("should render panel content", () => {
    const panel = createPanel({ type: "code-editor" });
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    // PanelContent renders "Code Editor" for type "code-editor"
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
  });

  it("should handle missing callbacks gracefully", () => {
    const panel = createPanel();
    // Panel component's handlers check for undefined callbacks
    const { container } = render(<Panel panel={panel} isActive={true} />);

    expect(container).toBeInTheDocument();
  });

  it("should apply correct styles for active panel", () => {
    const panel = createPanel();
    render(<Panel panel={panel} isActive={true} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    // The outer div has border: isActive ? '2px solid #6366f1' : '1px solid #334155'
    // jsdom converts hex #6366f1 to rgb(99, 102, 241)
    const panelTitle = screen.getByText("Test Panel");
    const panelEl = panelTitle.closest(".panel") as HTMLElement;
    expect(panelEl?.style.border).toContain("99, 102, 241");
  });

  it("should apply correct styles for inactive panel", () => {
    const panel = createPanel();
    render(<Panel panel={panel} isActive={false} onMouseDown={vi.fn()} onMinimize={vi.fn()} onMaximize={vi.fn()} onClose={vi.fn()} />);

    const panelTitle = screen.getByText("Test Panel");
    const panelEl = panelTitle.closest(".panel") as HTMLElement;
    // jsdom converts hex #334155 to rgb(51, 65, 85)
    expect(panelEl?.style.border).toContain("51, 65, 85");
  });
});
