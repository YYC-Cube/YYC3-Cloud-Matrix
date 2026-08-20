/**
 * @file: useInstallPrompt.test.ts
 * @description: useInstallPrompt Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup, waitFor } from "@testing-library/react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

describe("useInstallPrompt", () => {
  const mockMatchMedia = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstalled).toBe(false);
    expect(result.current.canInstall).toBe(false);
    expect(typeof result.current.promptInstall).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("should detect standalone mode on mount", () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstalled).toBe(true);
  });

  it("should detect dismissed state from localStorage", () => {
    localStorage.setItem("pwa_install_dismissed", "true");

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.canInstall).toBe(false);
  });

  it("should handle beforeinstallprompt event", async () => {
    const { result } = renderHook(() => useInstallPrompt());

    const mockPrompt = {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "prompt", { value: mockPrompt.prompt });
      Object.defineProperty(event, "userChoice", {
        value: mockPrompt.userChoice,
      });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });
  });

  it("should call promptInstall and return true when accepted", async () => {
    const mockPrompt = vi.fn();
    const mockUserChoice = Promise.resolve({ outcome: "accepted" });

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn() });
      Object.defineProperty(event, "prompt", { value: mockPrompt });
      Object.defineProperty(event, "userChoice", { value: mockUserChoice });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });

    let installResult: boolean;
    await act(async () => {
      installResult = await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(installResult!).toBe(true);
  });

  it("should call promptInstall and return false when dismissed", async () => {
    const mockPrompt = vi.fn();
    const mockUserChoice = Promise.resolve({ outcome: "dismissed" });

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn() });
      Object.defineProperty(event, "prompt", { value: mockPrompt });
      Object.defineProperty(event, "userChoice", { value: mockUserChoice });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });

    let installResult: boolean;
    await act(async () => {
      installResult = await result.current.promptInstall();
    });

    expect(installResult!).toBe(false);
  });

  it("should return false when promptInstall called without deferredPrompt", async () => {
    const { result } = renderHook(() => useInstallPrompt());

    let installResult: boolean;
    await act(async () => {
      installResult = await result.current.promptInstall();
    });

    expect(installResult!).toBe(false);
  });

  it("should set dismissed state and save to localStorage", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      result.current.dismiss();
    });

    expect(localStorage.getItem("pwa_install_dismissed")).toBe("true");
    expect(result.current.canInstall).toBe(false);
  });

  it("should update isInstalled on media query change", async () => {
    const changeListeners: Array<(e: MediaQueryListEvent) => void> = [];

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
        changeListeners.push(handler);
      },
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstalled).toBe(false);

    act(() => {
      changeListeners.forEach((handler) => {
        handler({ matches: true } as MediaQueryListEvent);
      });
    });

    expect(result.current.isInstalled).toBe(true);
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useInstallPrompt());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });
});
