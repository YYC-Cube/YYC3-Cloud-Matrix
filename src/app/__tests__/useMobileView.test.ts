/**
 * @file: useMobileView.test.ts
 * @description: useMobileView Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useMobileView } from "../hooks/useMobileView";

describe("useMobileView", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    });
  });

  it("should return view state with all properties", () => {
    const { result } = renderHook(() => useMobileView());

    expect(result.current.breakpoint).toBeDefined();
    expect(result.current.isMobile).toBeDefined();
    expect(result.current.isTablet).toBeDefined();
    expect(result.current.isDesktop).toBeDefined();
    expect(result.current.width).toBeDefined();
    expect(result.current.isTouch).toBeDefined();
  });

  it("should detect mobile (sm breakpoint) when width < 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 500,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("sm");
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it("should detect tablet (md breakpoint) when width >= 768 and < 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 800,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("md");
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("should detect desktop (lg breakpoint) when width >= 1024 and < 1280", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1100,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("lg");
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("should detect large desktop (xl breakpoint) when width >= 1280 and < 1536", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1400,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("xl");
    expect(result.current.isDesktop).toBe(true);
  });

  it("should detect extra large (2xl breakpoint) when width >= 1536", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1600,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("2xl");
    expect(result.current.isDesktop).toBe(true);
  });

  it("should update width on resize", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 800,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.width).toBe(800);
  });

  it("should handle boundary at 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 767,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("sm");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 768,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("md");
  });

  it("should handle boundary at 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1023,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("md");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("lg");
  });

  it("should handle boundary at 1280", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1279,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("lg");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1280,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("xl");
  });

  it("should handle boundary at 1536", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1535,
    });

    const { result } = renderHook(() => useMobileView());

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("xl");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1536,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.runAllTimers();
    });

    expect(result.current.breakpoint).toBe("2xl");
  });

  it("should detect touch capability", () => {
    const { result } = renderHook(() => useMobileView());

    expect(typeof result.current.isTouch).toBe("boolean");
  });

  it("should cleanup resize listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useMobileView());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });
});
