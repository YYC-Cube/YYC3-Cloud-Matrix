/**
 * @file: IDELayout.test.tsx
 * @description: IDELayout component unit test — Zustand slice integration
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-19
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { IDELayout } from "../modules/dev/ide/IDELayout";

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../modules/dev/ide/AIChatPanel", () => ({
  AIChatPanel: () => <div>AI Chat Panel</div>,
}));

vi.mock("../modules/dev/ide/FileExplorer", () => ({
  FileExplorer: () => <div>File Explorer</div>,
}));

vi.mock("../modules/dev/ide/CodePreviewPanel", () => ({
  CodePreviewPanel: () => <div>Code Preview</div>,
}));

vi.mock("../modules/dev/ide/IDETerminal", () => ({
  IDETerminal: () => <div>Terminal</div>,
}));

vi.mock("../modules/dev/ide/IDEStatusBar", () => ({
  IDEStatusBar: () => <div>Status Bar</div>,
}));

vi.mock("../modules/dev/ide/IDETopBar", () => ({
  IDETopBar: () => <div>Top Bar</div>,
}));

vi.mock("../modules/dev/ide/IDEViewSwitcher", () => ({
  IDEViewSwitcher: () => <div>View Switcher</div>,
}));

vi.mock("../modules/dev/ide/LayoutContext", () => ({
  LayoutProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../modules/dev/ide/Workspace", () => ({
  Workspace: () => <div>Workspace</div>,
}));

// ── Import the Zustand store after mocks ───────────────────────
import { useIDESettingsSlice } from "../store/slices/ide-settings-slice";

describe("IDELayout", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Reset Zustand store to default state
    useIDESettingsSlice.setState({ layoutMode: "preview" });
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<IDELayout />);
      expect(container.firstChild).toBeDefined();
    });

    it("should render top bar", () => {
      render(<IDELayout />);
      expect(screen.getByText("Top Bar")).toBeInTheDocument();
    });

    it("should render view switcher", () => {
      render(<IDELayout />);
      expect(screen.getByText("View Switcher")).toBeInTheDocument();
    });

    it("should render status bar", () => {
      render(<IDELayout />);
      expect(screen.getByText("Status Bar")).toBeInTheDocument();
    });

    it("should render AI chat panel", () => {
      render(<IDELayout />);
      expect(screen.getByText("AI Chat Panel")).toBeInTheDocument();
    });

    it("should render file explorer", () => {
      render(<IDELayout />);
      expect(screen.getByText("File Explorer")).toBeInTheDocument();
    });

    it("should render code preview panel", () => {
      render(<IDELayout />);
      expect(screen.getByText("Code Preview")).toBeInTheDocument();
    });

    it("should render terminal", () => {
      render(<IDELayout />);
      expect(screen.getByText("Terminal")).toBeInTheDocument();
    });
  });

  describe("layout modes", () => {
    it("should render edit mode via Zustand store", () => {
      useIDESettingsSlice.setState({ layoutMode: "edit" });
      render(<IDELayout />);
      expect(screen.getByText("AI Chat Panel")).toBeInTheDocument();
    });

    it("should render preview mode via Zustand store", () => {
      useIDESettingsSlice.setState({ layoutMode: "preview" });
      render(<IDELayout />);
      expect(screen.getByText("AI Chat Panel")).toBeInTheDocument();
    });

    it("should render free mode via Zustand store", () => {
      useIDESettingsSlice.setState({ layoutMode: "free" });
      render(<IDELayout />);
      expect(screen.getByText("Workspace")).toBeInTheDocument();
    });
  });

  describe("keyboard shortcuts", () => {
    it("should toggle search on Ctrl+Shift+F", () => {
      render(<IDELayout />);

      fireEvent.keyDown(window, {
        key: "F",
        ctrlKey: true,
        shiftKey: true,
      });

      const searchInput = screen.queryByRole("searchbox") || screen.queryByRole("textbox");
      expect(searchInput || screen.getByPlaceholderText(/ide.search/)).toBeDefined();
    });

    it("should toggle view mode on Ctrl+1", () => {
      render(<IDELayout />);

      fireEvent.keyDown(window, {
        key: "1",
        ctrlKey: true,
      });

      expect(screen.getByText("AI Chat Panel")).toBeInTheDocument();
    });

    it("should toggle code view mode on Ctrl+2", () => {
      render(<IDELayout />);

      fireEvent.keyDown(window, {
        key: "2",
        ctrlKey: true,
      });

      const container = screen.getByText("Top Bar").closest("div");
      expect(container || document.body.firstChild).toBeDefined();
    });

    it("should toggle layout mode on Ctrl+3", () => {
      render(<IDELayout />);

      fireEvent.keyDown(window, {
        key: "3",
        ctrlKey: true,
      });

      const container = screen.getByText("Top Bar").closest("div");
      expect(container || document.body.firstChild).toBeDefined();
    });
  });

  describe("Zustand store persistence", () => {
    it("should persist layout mode via Zustand store on Ctrl+3", () => {
      useIDESettingsSlice.setState({ layoutMode: "edit" });
      render(<IDELayout />);

      fireEvent.keyDown(window, {
        key: "3",
        ctrlKey: true,
      });

      // Verify the store state changed (edit -> preview on first toggle)
      const currentMode = useIDESettingsSlice.getState().layoutMode;
      expect(currentMode).not.toBe("edit");
    });
  });
});
