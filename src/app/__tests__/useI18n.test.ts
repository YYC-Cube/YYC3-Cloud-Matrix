/**
 * @file: useI18n.test.ts
 * @description: useI18n Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import {
  useI18nProvider,
  useI18n,
  I18nContext,
  SUPPORTED_LOCALES,
} from "../hooks/useI18n";

describe("SUPPORTED_LOCALES", () => {
  it("should have zh-CN locale", () => {
    const zhCN = SUPPORTED_LOCALES.find((l) => l.code === "zh-CN");
    expect(zhCN).toBeDefined();
    expect(zhCN?.label).toBe("简体中文");
  });

  it("should have en-US locale", () => {
    const enUS = SUPPORTED_LOCALES.find((l) => l.code === "en-US");
    expect(enUS).toBeDefined();
    expect(enUS?.label).toBe("English");
  });
});

describe("useI18nProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return default locale zh-CN", () => {
    const { result } = renderHook(() => useI18nProvider());

    expect(result.current.locale).toBe("zh-CN");
  });

  it("should load saved locale from localStorage", () => {
    localStorage.setItem("yyc3_locale", "en-US");

    const { result } = renderHook(() => useI18nProvider());

    expect(result.current.locale).toBe("en-US");
  });

  it("should change locale", () => {
    const { result } = renderHook(() => useI18nProvider());

    act(() => {
      result.current.setLocale("en-US");
    });

    expect(result.current.locale).toBe("en-US");
    expect(localStorage.getItem("yyc3_locale")).toBe("en-US");
  });

  it("should return t function", () => {
    const { result } = renderHook(() => useI18nProvider());

    expect(typeof result.current.t).toBe("function");
  });

  it("should translate simple key", () => {
    const { result } = renderHook(() => useI18nProvider());

    const translation = result.current.t("nav.dataMonitor");

    expect(typeof translation).toBe("string");
    expect(translation.length).toBeGreaterThan(0);
  });

  it("should return key when translation not found", () => {
    const { result } = renderHook(() => useI18nProvider());

    const translation = result.current.t("nonexistent.key.path");

    expect(translation).toBe("nonexistent.key.path");
  });

  it("should interpolate variables", () => {
    const { result } = renderHook(() => useI18nProvider());

    const translation = result.current.t("common.minutesAgo", { n: 5 });

    expect(translation).toContain("5");
    expect(translation).toContain("分钟前");
  });

  it("should return locales list", () => {
    const { result } = renderHook(() => useI18nProvider());

    expect(result.current.locales).toBeDefined();
    expect(result.current.locales.length).toBe(2);
  });

  it("should handle nested translation keys", () => {
    const { result } = renderHook(() => useI18nProvider());

    const translation = result.current.t("nav.dataMonitor");

    expect(typeof translation).toBe("string");
  });
});

describe("useI18n", () => {
  it("should return context value", () => {
    const mockValue = {
      locale: "zh-CN" as const,
      setLocale: vi.fn(),
      t: vi.fn((key: string) => key),
      locales: SUPPORTED_LOCALES,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nContext.Provider, { value: mockValue }, children);

    const { result } = renderHook(() => useI18n(), { wrapper });

    expect(result.current.locale).toBe("zh-CN");
    expect(result.current.setLocale).toBeDefined();
    expect(result.current.t).toBeDefined();
    expect(result.current.locales).toBeDefined();
  });
});
