/**
 * @file: canvas-perf-registry.test.ts
 * @description: canvas-perf-registry.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getCanvasPerf, setCanvasPerf } from "../../lib/canvasPerfRegistry";

describe("canvasPerfRegistry", () => {
  const REGISTRY_KEY = "__yyc3_canvas_perf__";

  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>)[REGISTRY_KEY];
  });

  it("should return defaults when no data set", () => {
    const data = getCanvasPerf();
    expect(data.rippleCount).toBe(0);
    expect(data.particleCount).toBe(0);
    expect(data.canvasFps).toBe(0);
    expect(data.isClimax).toBe(false);
  });

  it("should set partial data and merge with defaults", () => {
    setCanvasPerf({ rippleCount: 5 });
    const data = getCanvasPerf();
    expect(data.rippleCount).toBe(5);
    expect(data.particleCount).toBe(0);
    expect(data.lastUpdate).toBeGreaterThan(0);
  });

  it("should accumulate updates", () => {
    setCanvasPerf({ rippleCount: 3 });
    setCanvasPerf({ particleCount: 100 });
    const data = getCanvasPerf();
    expect(data.rippleCount).toBe(3);
    expect(data.particleCount).toBe(100);
  });

  it("should override existing values", () => {
    setCanvasPerf({ canvasFps: 60 });
    setCanvasPerf({ canvasFps: 30 });
    expect(getCanvasPerf().canvasFps).toBe(30);
  });
});
