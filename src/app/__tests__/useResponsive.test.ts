/**
 * @file: useResponsive.test.ts
 * @description: useResponsive Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResponsive } from "../hooks/useResponsive";

describe("useResponsive", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("should return desktop state for width >= 1024", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.windowWidth).toBe(1024);
      expect(result.current.albumSize).toBe(200);
    });

    it("should return tablet state for width 768-1023", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 800,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.windowWidth).toBe(800);
      expect(result.current.albumSize).toBe(185);
    });

    it("should return mobile state for width < 768", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.windowWidth).toBe(500);
      expect(result.current.albumSize).toBe(170);
    });
  });

  describe("resize handling", () => {
    it("should add resize event listener on mount", () => {
      renderHook(() => useResponsive());
      expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should remove resize event listener on unmount", () => {
      const { unmount } = renderHook(() => useResponsive());
      unmount();
      expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should update state on resize to mobile", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(true);

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 500,
          writable: true,
        });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.windowWidth).toBe(500);
      expect(result.current.albumSize).toBe(170);
    });

    it("should update state on resize to tablet", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 800,
          writable: true,
        });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.windowWidth).toBe(800);
      expect(result.current.albumSize).toBe(185);
    });

    it("should update state on resize to desktop", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 1200,
          writable: true,
        });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.windowWidth).toBe(1200);
      expect(result.current.albumSize).toBe(200);
    });
  });

  describe("boundary values", () => {
    it("should return mobile for width 767", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 767,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
    });

    it("should return tablet for width 768", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 768,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });

    it("should return tablet for width 1023", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 1023,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("should return desktop for width 1024", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        writable: true,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isTablet).toBe(false);
    });
  });
});
