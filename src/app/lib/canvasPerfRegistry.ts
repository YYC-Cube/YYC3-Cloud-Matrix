/**
 * @file: canvasPerfRegistry.ts
 * @description: Canvas 性能监控注册表，用于共享性能数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export interface CanvasPerfData {
  rippleCount: number;
  particleCount: number;
  drawTimeMs: number;
  canvasFps: number;
  isClimax: boolean;
  lastUpdate: number;
}

const DEFAULT_DATA: CanvasPerfData = {
  rippleCount: 0,
  particleCount: 0,
  drawTimeMs: 0,
  canvasFps: 0,
  isClimax: false,
  lastUpdate: 0,
};

const REGISTRY_KEY = "__yyc3_canvas_perf__";

export function getCanvasPerf(): CanvasPerfData {
  return (window as unknown as Record<string, CanvasPerfData>)[REGISTRY_KEY] || DEFAULT_DATA;
}

export function setCanvasPerf(data: Partial<CanvasPerfData>): void {
  const current =
    (window as unknown as Record<string, CanvasPerfData>)[REGISTRY_KEY] ||
    { ...DEFAULT_DATA };
  (window as unknown as Record<string, CanvasPerfData>)[REGISTRY_KEY] = {
    ...current,
    ...data,
    lastUpdate: Date.now(),
  };
}
