/**
 * file: render-utils.tsx
 * description: 公用测试渲染工具 · 封装 React 组件测试渲染，支持 i18n、路由、Store
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-07-25
 * updated: 2026-07-25
 * status: active
 * tags: [test],[helper],[render],[i18n]
 *
 * brief: 模块测试通用渲染工具
 *
 * dependencies: @testing-library/react, react-router, vitest
 * exports: renderWithProviders, renderWithI18n, createTestWrapper, screen, waitFor, act, fireEvent
 * notes: 所有模块测试应使用此文件中的渲染函数
 */

import React, { type ReactElement } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { I18nContext } from "../../hooks/useI18n";
import type { Locale, LocaleInfo } from "../../types/i18n-types";

// Re-export commonly used testing utilities
export { screen, waitFor, act, fireEvent, within } from "@testing-library/react";
export { vi } from "vitest";

// ============================================================
// Default i18n context for tests
// ============================================================

const DEFAULT_LOCALE: Locale = "zh-CN";

const DEFAULT_LOCALES: LocaleInfo[] = [
  { code: "zh-CN", label: "简体中文", nativeLabel: "简体中文" },
  { code: "en-US", label: "English", nativeLabel: "English" },
];

const DEFAULT_I18N_VALUE = {
  locale: DEFAULT_LOCALE,
  t: (key: string) => key,
  setLocale: () => {},
  locales: DEFAULT_LOCALES,
};

// ============================================================
// Provider Wrappers
// ============================================================

interface TestWrapperOptions {
  locale?: Locale;
  initialEntries?: string[];
}

/**
 * 创建包含 i18n + Router 的测试包裹器
 */
function AllTheProviders({
  children,
  locale = DEFAULT_LOCALE,
  initialEntries = ["/"],
}: TestWrapperOptions & { children: React.ReactNode }) {
  const i18nValue = { ...DEFAULT_I18N_VALUE, locale };
  return (
    <I18nContext.Provider value={i18nValue}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </I18nContext.Provider>
  );
}

/**
 * 仅包含 i18n 的测试包裹器（无 Router）
 */
function I18nOnlyProvider({
  children,
  locale = DEFAULT_LOCALE,
}: { children: React.ReactNode; locale?: Locale }) {
  const i18nValue = { ...DEFAULT_I18N_VALUE, locale };
  return (
    <I18nContext.Provider value={i18nValue}>
      {children}
    </I18nContext.Provider>
  );
}

// ============================================================
// Render Functions
// ============================================================

/**
 * 渲染组件并包裹 i18n + Router
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & TestWrapperOptions
): RenderResult {
  const { locale, initialEntries, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders locale={locale} initialEntries={initialEntries}>
        {props.children as React.ReactNode}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * 渲染组件并仅包裹 i18n
 */
export function renderWithI18n(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { locale?: Locale }
): RenderResult {
  const { locale, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: (props) => (
      <I18nOnlyProvider locale={locale}>
        {props.children as React.ReactNode}
      </I18nOnlyProvider>
    ),
    ...renderOptions,
  });
}

/**
 * 创建自定义 Provider 包裹器
 */
export function createTestWrapper(
  providers: React.ComponentType<{ children: React.ReactNode }>[],
  options?: { locale?: Locale; initialEntries?: string[] }
) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    const { locale = DEFAULT_LOCALE, initialEntries = ["/"] } = options ?? {};
    const i18nValue = { ...DEFAULT_I18N_VALUE, locale };

    return (
      <I18nContext.Provider value={i18nValue}>
        <MemoryRouter initialEntries={initialEntries}>
          {providers.reduceRight<React.ReactNode>(
            (acc, Provider) => <Provider>{acc}</Provider>,
            children
          )}
        </MemoryRouter>
      </I18nContext.Provider>
    );
  };
}

// ============================================================
// Snapshot Helpers
// ============================================================

export function getTextSnapshot(container: HTMLElement): string {
  return container.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

export function getHtmlSnapshot(container: HTMLElement): string {
  return container.innerHTML.replace(/>\s+</g, "><").trim();
}

// ============================================================
// Accessibility Helpers
// ============================================================

export function isFocusable(element: HTMLElement): boolean {
  return element.tabIndex >= 0 || element.getAttribute("tabindex") !== null;
}

export function hasAccessibleLabel(element: HTMLElement): boolean {
  return (
    element.getAttribute("aria-label") !== null ||
    element.getAttribute("aria-labelledby") !== null ||
    (element.textContent?.trim().length ?? 0) > 0
  );
}