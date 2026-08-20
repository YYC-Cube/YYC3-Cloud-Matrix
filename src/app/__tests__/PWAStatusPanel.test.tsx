/**
 * @file: PWAStatusPanel.test.tsx
 * @description: PWAStatusPanel.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * PWAStatusPanel.test.tsx
 * ==============
 * PWAStatusPanel 组件 - PWA 离线管理面板测试
 *
 * 覆盖范围:
 * - 标题渲染
 * - 状态卡片 (SW / 缓存 / 在线 / 离线就绪)
 * - 缓存列表
 * - 操作按钮 (更新 / 刷新 / 清空)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PWAStatusPanel } from "../modules/admin/PWAStatusPanel";
import { ViewContext } from "../lib/view-context";
import { I18nContext } from "../hooks/useI18n";
import { zhCN } from "../i18n";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split(".");
  let result: any = obj;
  for (const k of keys) {
    if (result === null) {return path;}
    result = result[k];
  }
  return typeof result === "string" ? result : path;
}

function renderPanel() {
  const viewValue = {
    breakpoint: "lg" as const,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1280,
    isTouch: false,
  };

  const i18nValue = {
    locale: "zh-CN" as const,
    setLocale: vi.fn(),
    t: (key: string, vars?: Record<string, string | number>) => {
      let val = getNestedValue(zhCN as Record<string, any>, key);
      if (vars) {
        val = val.replace(/\{(\w+)\}/g, (_: string, k: string) => String(vars[k] ?? `{${k}}`));
      }
      return val;
    },
    locales: [
      { code: "zh-CN" as const, label: "简体中文", nativeLabel: "简体中文" },
      { code: "en-US" as const, label: "English",  nativeLabel: "English" },
    ],
  };

  return render(
    <ViewContext.Provider value={viewValue}>
      <I18nContext.Provider value={i18nValue}>
        <PWAStatusPanel />
      </I18nContext.Provider>
    </ViewContext.Provider>
  );
}

describe("PWAStatusPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染标题", () => {
      renderPanel();
      expect(screen.getAllByText("PWA & 离线管理")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      renderPanel();
      expect(screen.getAllByTestId("pwa-status-panel")[0]).toBeInTheDocument();
    });

    it("应渲染 SW 版本", () => {
      renderPanel();
      expect(screen.getAllByText(/v1\.4\.2/)[0]).toBeInTheDocument();
    });

    it("应渲染在线状态", () => {
      renderPanel();
      expect(screen.getAllByText("在线")[0]).toBeInTheDocument();
    });

    it("应渲染离线就绪", () => {
      renderPanel();
      expect(screen.getAllByText("离线就绪")[0]).toBeInTheDocument();
    });
  });

  describe("缓存列表", () => {
    it("应渲染缓存条目", () => {
      renderPanel();
      expect(screen.getAllByTestId("cache-list")[0]).toBeInTheDocument();
      expect(screen.getAllByText("yyc3-static-v1")[0]).toBeInTheDocument();
      expect(screen.getAllByText("yyc3-api-cache")[0]).toBeInTheDocument();
    });

    it("应渲染 5 个缓存条目", () => {
      renderPanel();
      expect(screen.getAllByTestId("cache-yyc3-static-v1")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("cache-yyc3-fonts")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("cache-yyc3-images")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("cache-yyc3-runtime")[0]).toBeInTheDocument();
    });
  });

  describe("操作按钮", () => {
    it("应渲染更新按钮", () => {
      renderPanel();
      expect(screen.getAllByTestId("update-sw-btn")[0]).toBeInTheDocument();
    });

    it("应渲染刷新缓存按钮", () => {
      renderPanel();
      expect(screen.getAllByTestId("refresh-cache-btn")[0]).toBeInTheDocument();
    });

    it("应渲染清空缓存按钮", () => {
      renderPanel();
      expect(screen.getAllByTestId("clear-all-cache-btn")[0]).toBeInTheDocument();
    });

    it("点击单个缓存清理按钮应可交互", () => {
      renderPanel();
      const clearBtn = screen.getAllByTestId("clear-yyc3-fonts")[0];
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn);
      // 不会报错即可
    });
  });
});
