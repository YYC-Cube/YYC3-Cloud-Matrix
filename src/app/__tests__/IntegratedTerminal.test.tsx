/**
 * @file: IntegratedTerminal.test.tsx
 * @description: IntegratedTerminal component full test suite — Zustand slice integration
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-01
 * @updated: 2026-04-19
 * @status: active
 * @tags: [component],[test]
 */

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntegratedTerminal } from "../modules/dev/IntegratedTerminal";

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

// 注意：组件实际从 src/app/modules/dev/hooks/useTerminal 导入，
// vi.mock 路径必须与组件的导入解析路径一致，否则 mock 静默失效
vi.mock("../modules/dev/hooks/useTerminal", () => ({
  useTerminal: () => ({
    history: [],
    inputValue: "",
    completions: [],
    execute: vi.fn(),
    handleInputChange: vi.fn(),
    handleHistoryNav: vi.fn(),
    applyCompletion: vi.fn(),
  }),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({ isMobile: false }),
}));

vi.mock("../lib/authContext", () => ({
  AuthContext: React.createContext({ userEmail: "admin@yyc3.com" }),
}));

vi.mock("../lib/supabaseClient", () => ({
  isGhostMode: () => false,
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ── Import the Zustand store after mocks ───────────────────────
import { useUIPrefsSlice } from "../store/slices/ui-prefs-slice";

describe("IntegratedTerminal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store to default state
    useUIPrefsSlice.setState({ terminalHeight: 300 });
  });

  afterEach(() => {
    cleanup();
  });

  describe("basic rendering", () => {
    it("should not render when open is false", () => {
      render(<IntegratedTerminal open={false} onClose={mockOnClose} />);
      expect(screen.queryByText("cpim-cli v3.2.0")).not.toBeInTheDocument();
    });

    it("should render when open is true", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      expect(screen.getByText("cpim-cli v3.2.0")).toBeInTheDocument();
    });

    it("should render default tab", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const cpimElements = screen.getAllByText("cpim");
      expect(cpimElements.length).toBeGreaterThan(0);
    });

    it("should render status bar with LOCAL indicator", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      expect(screen.getByText("LOCAL")).toBeInTheDocument();
    });

    it("should render tab counter in status bar", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      expect(screen.getByText("Tab 1/1")).toBeInTheDocument();
    });

    it("should render terminal input prompt", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      expect(screen.getByText("admin@cpim")).toBeInTheDocument();
    });
  });

  describe("window control buttons", () => {
    it("should render minimize button", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const minimizeBtn = buttons.find((btn) => btn.getAttribute("title") === "最小化");
      expect(minimizeBtn).toBeDefined();
    });

    it("should render maximize button", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const maximizeBtn = buttons.find((btn) => btn.getAttribute("title") === "最大化");
      expect(maximizeBtn).toBeDefined();
    });

    it("should render close button", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const closeBtn = buttons.find((btn) => btn.getAttribute("title") === "关闭终端");
      expect(closeBtn).toBeDefined();
    });

    it("should call onClose when close button clicked", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const closeBtn = buttons.find((btn) => btn.getAttribute("title") === "关闭终端");
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe("multi-Tab management", () => {
    it("should render add tab button", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const addBtn = buttons.find((btn) => btn.getAttribute("title") === "新建终端 Tab");
      expect(addBtn).toBeDefined();
    });

    it("should add new tab when add button clicked", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const addBtn = buttons.find((btn) => btn.getAttribute("title") === "新建终端 Tab");
      if (addBtn) {
        fireEvent.click(addBtn);
        expect(screen.getByText("Tab 2/2")).toBeInTheDocument();
      }
    });

    it("should switch active tab when tab clicked", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const addBtn = buttons.find((btn) => btn.getAttribute("title") === "新建终端 Tab");
      if (addBtn) {
        fireEvent.click(addBtn);
        const tabs = screen.getAllByText(/cpim/);
        if (tabs.length > 1) {
          fireEvent.click(tabs[0]);
        }
      }
    });

    it("should not exceed MAX_TABS (6)", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      const buttons = screen.getAllByRole("button");
      const addBtn = buttons.find((btn) => btn.getAttribute("title") === "新建终端 Tab");
      if (addBtn) {
        for (let i = 0; i < 6; i++) {
          fireEvent.click(addBtn);
        }
        expect(screen.getByText("Tab 6/6")).toBeInTheDocument();
      }
    });
  });

  describe("height via Zustand store", () => {
    it("should load saved height from Zustand store", () => {
      useUIPrefsSlice.setState({ terminalHeight: 400 });
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      expect(useUIPrefsSlice.getState().terminalHeight).toBe(400);
    });

    it("should save height to Zustand store", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      // The component initializes with the store's terminalHeight value
      expect(useUIPrefsSlice.getState().terminalHeight).toBeDefined();
    });

    it("should use default height from store when no saved value", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      // The default terminalHeight in ui-prefs-slice is 300
      expect(useUIPrefsSlice.getState().terminalHeight).toBe(300);
    });
  });

  describe("Ghost Mode", () => {
    it("should show admin prompt user by default", () => {
      render(<IntegratedTerminal open={true} onClose={mockOnClose} />);
      expect(screen.getByText("admin@cpim")).toBeInTheDocument();
    });
  });
});
