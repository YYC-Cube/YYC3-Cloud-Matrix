/**
 * @file: i18n-types.ts
 * @description: 国际化类型 — 语言枚举 + 上下文
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[i18n]
 */

/** 支持的语言 */
export type Locale = "zh-CN" | "en-US";

/** 语言元信息 */
export interface LocaleInfo {
  code: Locale;
  label: string;
  nativeLabel: string;
}

/** 国际化上下文值 */
export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locales: LocaleInfo[];
}
