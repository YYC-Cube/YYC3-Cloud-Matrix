/**
 * @file: useI18n.ts
 * @description: 国际化 Hook · 支持中文/English 动态切换
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [hook],[i18n],[locale]
 *
 * @copyright: YanYuCloudCube Team
 * @license: MIT
 *
 * @brief: 提供国际化功能，支持中英文动态切换
 *
 * @details:
 * - localStorage 持久化语言偏好
 * - React Context 全局共享
 * - 动态切换无需刷新
 * - t() 函数支持嵌套 key 和模板变量
 *
 * @dependencies: React, Context API
 * @exports: useI18n, I18nProvider, I18nContext, SUPPORTED_LOCALES
 * @notes: 需要在 App 根组件包裹 I18nProvider
 */

import { useState, useCallback, useMemo, useEffect, useRef, createContext, useContext } from "react";
import { zhCN, enUS } from "../i18n";
import type { TranslationKeys } from "../i18n";
import type { Locale, LocaleInfo, I18nContextValue } from "../types";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";

// RF-011: Re-export 已移除

/** 合法语言值守卫（SSOT values.language 为 string，需收窄到 Locale） */
function toLocale(value: unknown): Locale | null {
  return value === "en-US" || value === "zh-CN" ? value : null;
}

// ============================================================
// 语言包映射
// ============================================================

const localeMap: Record<Locale, TranslationKeys> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: "zh-CN", label: "简体中文", nativeLabel: "简体中文" },
  { code: "en-US", label: "English",  nativeLabel: "English" },
];

const STORAGE_KEY = "yyc3_locale";

// ============================================================
// 工具函数: 深度取值
// ============================================================

/**
 * 通过点分 key 获取嵌套翻译值
 * e.g. t("nav.dataMonitor") → zhCN.nav.dataMonitor
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;
  for (const k of keys) {
    if (result === null || typeof result !== "object") {return path;}
    result = (result as Record<string, unknown>)[k];
  }
  return typeof result === "string" ? result : path;
}

/**
 * 替换模板变量 e.g. "{n} 分钟前" + { n: 5 } → "5 分钟前"
 */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) {return template;}
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== null ? String(vars[key]) : `{${key}}`
  );
}

// ============================================================
// Context
// ============================================================

export const I18nContext = createContext<I18nContextValue>({
  locale: "zh-CN",
  setLocale: () => {},
  t: (key, vars) => {
    const raw = getNestedValue(zhCN as Record<string, unknown>, key);
    return vars ? interpolate(raw, vars) : raw;
  },
  locales: SUPPORTED_LOCALES,
});

// ============================================================
// Hook
// ============================================================

export function useI18nProvider() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {return "zh-CN";}
    // 优先取独立语言键，其次回落设置 SSOT 的 language 值（设置核心统一驱动）
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en-US" || saved === "zh-CN") {return saved;}
    const ssotLang = toLocale(useSettingsSSOT.getState().values.language);
    return ssotLang ?? "zh-CN"; // 默认中文
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // storage unavailable
    }
    // 写穿到设置 SSOT，保持单一数据源一致（同值时 zustand 不触发额外渲染）
    const ssot = useSettingsSSOT.getState();
    if (ssot.values.language !== newLocale) {
      ssot.updateValue("language", newLocale);
    }
  }, []);

  // 挂载时对齐：若 localStorage 恢复的语言与 SSOT 不一致，回写 SSOT 完成单一数据源归并
  const didInitRef = useRef(false);
  useEffect(() => {
    didInitRef.current = true;
    const ssot = useSettingsSSOT.getState();
    if (toLocale(ssot.values.language) !== locale) {
      ssot.updateValue("language", locale);
    }
    // 仅在首次挂载执行归并，locale 初值已由 useState 惰性初始化确定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSOT → i18n 单向同步：统一设置面板修改语言，界面即时切换（编辑即生效）
  // ★ 跳过首次挂载：初始语言由 localStorage 优先恢复，避免同步 effect 覆盖用户偏好
  const ssotLanguage = useSettingsSSOT((s) => s.values.language);
  const prevSsotLanguageRef = useRef(ssotLanguage);
  useEffect(() => {
    if (prevSsotLanguageRef.current === ssotLanguage) { return; }
    prevSsotLanguageRef.current = ssotLanguage;
    const next = toLocale(ssotLanguage);
    if (next && next !== locale) {
      setLocaleState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage unavailable
      }
    }
  }, [ssotLanguage, locale]);

  const translations = useMemo(() => localeMap[locale], [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw = getNestedValue(translations as Record<string, unknown>, key);
      return interpolate(raw, vars);
    },
    [translations]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, locales: SUPPORTED_LOCALES }),
    [locale, setLocale, t]
  );

  return value;
}

/**
 * 消费 i18n 上下文的快捷 Hook
 */
export function useI18n() {
  return useContext(I18nContext);
}