/**
 * @file: useKeyboardShortcuts.test.ts
 * @description: useKeyboardShortcuts Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts, SHORTCUT_LIST } from "../hooks/useKeyboardShortcuts";

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
  },
}));

describe("useKeyboardShortcuts", () => {
  const originalPlatform = navigator.platform;

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "platform", {
      value: originalPlatform,
      writable: true,
    });
  });

  describe("SHORTCUT_LIST", () => {
    it("should export shortcut list", () => {
      expect(SHORTCUT_LIST).toBeDefined();
      expect(SHORTCUT_LIST.length).toBeGreaterThan(0);
    });

    it("should include search shortcut", () => {
      const searchShortcut = SHORTCUT_LIST.find((s) => s.id === "search");
      expect(searchShortcut).toBeDefined();
      expect(searchShortcut?.description).toBe("快速搜索");
    });
  });

  describe("initialization", () => {
    it("should return shortcuts list", () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      expect(result.current.shortcuts).toBe(SHORTCUT_LIST);
    });

    it("should add event listener on mount", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      renderHook(() => useKeyboardShortcuts({ enabled: true }));
      expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("should not add event listener when disabled", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      renderHook(() => useKeyboardShortcuts({ enabled: false }));
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      const { unmount } = renderHook(() => useKeyboardShortcuts({ enabled: true }));
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });
  });

  describe("keyboard shortcuts", () => {
    it("should call onSearch when Ctrl+K is pressed", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }));

      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onSearch).toHaveBeenCalled();
    });

    it("should call onToggleTerminal when Ctrl+` is pressed", () => {
      const onToggleTerminal = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onToggleTerminal }));

      const event = new KeyboardEvent("keydown", {
        key: "`",
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onToggleTerminal).toHaveBeenCalled();
    });

    it("should call onEscape when Escape is pressed", () => {
      const onEscape = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onEscape }));

      const event = new KeyboardEvent("keydown", {
        key: "Escape",
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onEscape).toHaveBeenCalled();
    });

    it("should navigate to /follow-up when Ctrl+Shift+A is pressed", () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent("keydown", {
        key: "A",
        ctrlKey: true,
        shiftKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/follow-up");
    });

    it("should navigate to /patrol when Ctrl+Shift+P is pressed", () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent("keydown", {
        key: "P",
        ctrlKey: true,
        shiftKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/patrol");
    });

    it("should navigate to /operations when Ctrl+Shift+O is pressed", () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent("keydown", {
        key: "O",
        ctrlKey: true,
        shiftKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/operations");
    });

    it("should navigate to /terminal when Ctrl+Shift+L is pressed", () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent("keydown", {
        key: "L",
        ctrlKey: true,
        shiftKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/terminal");
    });

    it("should navigate to /files when Ctrl+Shift+F is pressed", () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent("keydown", {
        key: "F",
        ctrlKey: true,
        shiftKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/files");
    });
  });

  describe("input field handling", () => {
    it("should ignore shortcuts when focused on input", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }));

      const input = document.createElement("input");
      document.body.appendChild(input);

      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      });

      Object.defineProperty(event, "target", { value: input });

      act(() => {
        input.dispatchEvent(event);
      });

      expect(onSearch).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("should call onEscape when Escape is pressed in input", () => {
      const onEscape = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onEscape }));

      const input = document.createElement("input");
      document.body.appendChild(input);

      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      });

      Object.defineProperty(event, "target", { value: input });

      act(() => {
        input.dispatchEvent(event);
      });

      expect(onEscape).toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("should ignore shortcuts when focused on textarea", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }));

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      });

      Object.defineProperty(event, "target", { value: textarea });

      act(() => {
        textarea.dispatchEvent(event);
      });

      expect(onSearch).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it("should ignore shortcuts when focused on select", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }));

      const select = document.createElement("select");
      document.body.appendChild(select);

      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      });

      Object.defineProperty(event, "target", { value: select });

      act(() => {
        select.dispatchEvent(event);
      });

      expect(onSearch).not.toHaveBeenCalled();

      document.body.removeChild(select);
    });
  });

  describe("disabled state", () => {
    it("should not handle shortcuts when disabled", () => {
      const onSearch = vi.fn();
      const onEscape = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: false,
          onSearch,
          onEscape,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onSearch).not.toHaveBeenCalled();
    });
  });

});
