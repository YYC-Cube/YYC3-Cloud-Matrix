/**
 * @file: vitest-shim.ts
 * @description: vitest-shim.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

// @ts-nocheck — Bun test infrastructure, not checked by tsc
/**
 * @file: vitest-shim.ts
 * @description: Re-exports bun:test as vitest API with compatibility extensions
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-18
 * @status: active
 *
 * This file is the target of bunfig.toml alias: "vitest" → this file.
 * All `import { describe, it, expect, vi } from "vitest"` resolve here.
 */

import {
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from "bun:test";

// ============================================================
// vi.* API extensions — vitest features not in bun:test
// ============================================================

const originalVi = vi;

// vi.resetModules — clear module registry (bun doesn't support module isolation)
const resetModules = () => { /* no-op: bun:test uses fresh imports per file */ };

// vi.mocked — type-safe mock accessor, just returns the value as-is
function mocked<T>(value: T): T {
  return value;
}

// vi.setSystemTime — mock system time
let _dateNowOverride: number | null = null;
const _originalDateNow = Date.now;

const setSystemTime = (date?: Date | number) => {
  if (date === undefined) {
    _dateNowOverride = null;
    Date.now = _originalDateNow;
  } else {
    _dateNowOverride = typeof date === "number" ? date : date.getTime();
    Date.now = () => _dateNowOverride!;
  }
};

// vi.unstubAllGlobals — restore all stubbed globals
const unstubAllGlobals = () => { /* no-op: bun:test handles this differently */ };

// Build enhanced vi object — spread originalVi first, then add vitest extras
// (do NOT override useFakeTimers/useRealTimers — bun:test has native support)
const enhancedVi = {
  ...originalVi,
  resetModules,
  mocked,
  setSystemTime,
  unstubAllGlobals,
};

// ============================================================
// Exports
// ============================================================

export {
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
};

export { enhancedVi as vi };

export const onTestFinished = (_fn: () => void) => { /* no-op */ };

// Re-export Mock type
export type { Mock } from "bun:test";
