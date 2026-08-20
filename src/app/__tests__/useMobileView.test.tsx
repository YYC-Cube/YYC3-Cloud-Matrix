/**
 * @file: useMobileView.test.tsx
 * @description: useMobileView.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMobileView } from "../hooks/useMobileView";

describe("useMobileView", () => {
  it("should detect mobile view for small screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 320,
    });

    const { result } = renderHook(() => useMobileView());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe("sm");
  });

  it("should detect tablet view for medium screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useMobileView());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe("md");
  });

  it("should detect desktop view for large screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1100,
    });

    const { result } = renderHook(() => useMobileView());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.breakpoint).toBe("lg");
  });

  it("should detect extra large screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1400,
    });

    const { result } = renderHook(() => useMobileView());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.breakpoint).toBe("xl");
  });

  it("should detect 2xl screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    });

    const { result } = renderHook(() => useMobileView());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.breakpoint).toBe("2xl");
  });

  it("should provide screen dimensions", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useMobileView());

    expect(result.current.width).toBeDefined();
    expect(typeof result.current.width).toBe("number");
  });

  it("should detect touch capability", () => {
    const { result } = renderHook(() => useMobileView());

    expect(typeof result.current.isTouch).toBe("boolean");
  });

  it("should provide device type information", () => {
    const { result } = renderHook(() => useMobileView());

    expect(result.current.isMobile).toBeDefined();
    expect(result.current.isTablet).toBeDefined();
    expect(result.current.isDesktop).toBeDefined();
  });
});
