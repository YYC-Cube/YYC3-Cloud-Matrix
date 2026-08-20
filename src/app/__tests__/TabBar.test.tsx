/**
 * @file: TabBar.test.tsx
 * @description: TabBar组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TabBar } from "../modules/dev/ide/TabBar";
import type { Panel, Tab } from "../modules/dev/ide/ide-layout-types";

const mockSwitchTab = vi.fn();
const mockRemoveTab = vi.fn();

vi.mock("../modules/dev/ide/LayoutContext", () => ({
  useLayoutContext: () => ({
    switchTab: mockSwitchTab,
    removeTab: mockRemoveTab,
  }),
}));

function createMockTab(overrides: Partial<Tab> = {}): Tab {
  return {
    id: "tab-default",
    panelId: "panel-1",
    title: "Default Tab",
    isPinned: false,
    isModified: false,
    isUnsaved: false,
    hasError: false,
    isActive: false,
    ...overrides,
  };
}

describe("TabBar", () => {
  const mockPanel: Panel = {
    id: "panel-1",
    type: "code-editor",
    tabs: [
      createMockTab({ id: "tab-1", title: "File 1", isActive: true }),
      createMockTab({ id: "tab-2", title: "File 2", isModified: true }),
      createMockTab({ id: "tab-3", title: "File 3", isUnsaved: true }),
    ],
    activeTabId: "tab-1",
    title: "Test Panel",
    position: { x: 0, y: 0, w: 300, h: 400 },
    size: { width: 300, height: 400 },
    isLocked: false,
    isMinimized: false,
    isMaximized: false,
    isClosable: true,
    isResizable: true,
    zIndex: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      render(<TabBar panel={mockPanel} />);
      expect(screen.getByText("File 1")).toBeInTheDocument();
    });

    it("should render all tabs", () => {
      render(<TabBar panel={mockPanel} />);
      expect(screen.getByText("File 1")).toBeInTheDocument();
      expect(screen.getByText("File 2")).toBeInTheDocument();
      expect(screen.getByText("File 3")).toBeInTheDocument();
    });

    it("should render tab icons when provided", () => {
      const panelWithIcons: Panel = {
        ...mockPanel,
        tabs: [
          createMockTab({ id: "tab-1", title: "File 1", isActive: true, icon: "📄" }),
        ],
      };

      render(<TabBar panel={panelWithIcons} />);
      expect(screen.getByText("📄")).toBeInTheDocument();
    });
  });

  describe("active tab highlighting", () => {
    it("should highlight active tab", () => {
      render(<TabBar panel={mockPanel} />);
      const activeTab = screen.getByText("File 1").closest(".tab");
      expect(activeTab).toHaveClass("active");
    });
  });

  describe("modified indicator", () => {
    it("should show modified indicator", () => {
      render(<TabBar panel={mockPanel} />);
      const modifiedTab = screen.getByText("File 2").parentElement;
      expect(modifiedTab?.textContent).toContain("●");
    });
  });

  describe("unsaved indicator", () => {
    it("should show unsaved indicator", () => {
      render(<TabBar panel={mockPanel} />);
      const unsavedTab = screen.getByText("File 3").parentElement;
      expect(unsavedTab?.textContent).toContain("●");
    });
  });

  describe("tab switching", () => {
    it("should call switchTab when clicking inactive tab", () => {
      render(<TabBar panel={mockPanel} />);

      const inactiveTab = screen.getByText("File 2").closest(".tab");
      fireEvent.click(inactiveTab!);

      expect(mockSwitchTab).toHaveBeenCalledWith("panel-1", "tab-2");
    });

    it("should not call switchTab when clicking active tab", () => {
      render(<TabBar panel={mockPanel} />);

      const activeTab = screen.getByText("File 1").closest(".tab");
      fireEvent.click(activeTab!);

      expect(mockSwitchTab).not.toHaveBeenCalled();
    });
  });

  describe("tab closing", () => {
    it("should call removeTab when clicking close button", () => {
      render(<TabBar panel={mockPanel} />);

      const closeButtons = screen.getAllByRole("button");
      fireEvent.click(closeButtons[0]);

      expect(mockRemoveTab).toHaveBeenCalledWith("panel-1", "tab-1");
    });

    it("should stop propagation when clicking close button", () => {
      render(<TabBar panel={mockPanel} />);

      const closeButtons = screen.getAllByRole("button");
      fireEvent.click(closeButtons[0]);

      expect(mockSwitchTab).not.toHaveBeenCalled();
    });
  });
});
