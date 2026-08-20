/**
 * @file: useMobileView.ts
 * @description: 响应式布局断点检测 Hook · 检测设备类型和屏幕尺寸
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [hook],[responsive],[viewport]
 *
 * @brief: 响应式布局断点检测
 *
 * @details:
 * - 断点定义：sm (<768px), md (768-1023), lg (1024-1279), xl (1280-1535), 2xl (≥1536)
 * - 自动检测设备类型：移动端、平板、桌面
 * - 响应窗口大小变化
 * - 提供便捷的布尔值判断
 *
 * @dependencies: React
 * @exports: useMobileView
 * @notes: 断点定义与 Tailwind CSS 一致
 */

import { useState, useEffect } from "react";
import type { Breakpoint, ViewState } from "../types";

// RF-011: Re-export 已移除 — 所有类型统一从 types/index.ts 导入

function getBreakpoint(width: number): Breakpoint {
  if (width < 768) {return "sm";}
  if (width < 1024) {return "md";}
  if (width < 1280) {return "lg";}
  if (width < 1536) {return "xl";}
  return "2xl";
}

function getViewState(width: number): ViewState {
  const bp = getBreakpoint(width);
  return {
    breakpoint: bp,
    isMobile: bp === "sm",
    isTablet: bp === "md",
    isDesktop: bp === "lg" || bp === "xl" || bp === "2xl",
    width,
    isTouch: typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  };
}

export function useMobileView(): ViewState {
  const [state, setState] = useState<ViewState>(() =>
    getViewState(typeof window !== "undefined" ? window.innerWidth : 1280)
  );

  useEffect(() => {
    let rafId: number;

    const handleResize = () => {
      // 使用 rAF 节流 resize 事件
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setState(getViewState(window.innerWidth));
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    // 初始化时也执行一次
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return state;
}