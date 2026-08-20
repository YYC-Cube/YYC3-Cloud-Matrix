/**
 * @file: layout-types.ts
 * @description: 响应式布局 + ErrorBoundary 级别类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[layout]
 */

/** 响应式断点 */
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

/** 视口状态 */
export interface ViewState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  isTouch: boolean;
}

/** ErrorBoundary 级别 */
export type ErrorBoundaryLevel = "page" | "module" | "widget";
