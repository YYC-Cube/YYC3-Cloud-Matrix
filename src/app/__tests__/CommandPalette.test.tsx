/**
 * @file: CommandPalette.test.tsx
 * @description: CommandPalette.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import * as React from "react";
import { CommandPalette } from "../modules/shared/CommandPalette";

import { useI18n } from "../hooks/useI18n";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const mockNavigate = vi.fn();
const mockTriggerShortcut = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

vi.mock("../hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: vi.fn(() => ({
    shortcutKeys: "Ctrl+K",
    triggerShortcut: mockTriggerShortcut,
    SHORTCUT_LIST: [
      { id: "search", keys: "Ctrl+K", description: "快速搜索", category: "全局" },
      { id: "alerts", keys: "Ctrl+Shift+A", description: "告警 / 一键跟进", category: "全局" },
    ],
  })),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render command palette when open", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByPlaceholderText("palette.placeholder")).toBeInTheDocument();
  });

  it("should render search input via test id", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByTestId("palette-input")).toBeInTheDocument();
  });

  it("should render search placeholder", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByPlaceholderText("palette.placeholder")).toBeInTheDocument();
  });

  it("should render navigation items", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByText("nav.dataMonitor")).toBeInTheDocument();
  });

  it("should render shortcut help button", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByTestId("shortcuts-toggle")).toBeInTheDocument();
  });

  it("should render operation center", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByText("nav.operations")).toBeInTheDocument();
  });

  it("should render patrol item", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByText("nav.patrol")).toBeInTheDocument();
  });

  it("should filter items by query", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    const searchInput = screen.getByPlaceholderText("palette.placeholder");
    // Use a specific term that only matches one item
    fireEvent.change(searchInput, { target: { value: "nav.fileManager" } });
    expect(screen.getByText("nav.fileManager")).toBeInTheDocument();
    expect(screen.queryByText("nav.operations")).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(React.createElement(CommandPalette, { isOpen: true, onClose }));
    const closeButtons = screen.getAllByRole("button");
    // The close button is the last button (not a palette navigation item)
    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });

  it("should call navigate when item is clicked", () => {
    render(React.createElement(CommandPalette, { isOpen: true, onClose: vi.fn() }));
    const item = screen.getByText("nav.dataMonitor");
    fireEvent.click(item);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should not render when closed", () => {
    render(React.createElement(CommandPalette, { isOpen: false, onClose: vi.fn() }));
    expect(screen.queryByTestId("command-palette")).not.toBeInTheDocument();
  });
});
