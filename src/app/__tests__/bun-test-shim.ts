/**
 * @file: bun-test-shim.ts
 * @description: bun-test-shim.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

// @ts-nocheck — Bun test infrastructure, not checked by tsc
/**
 * @file: bun-test-shim.ts
 * @description: Vitest → bun:test compatibility shim + jsdom DOM environment
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-18
 * @status: active
 *
 * Preloaded by bunfig.toml before all tests.
 * 1. Creates jsdom environment so document/window are available
 * 2. Maps vitest API to bun:test globals
 * 3. Provides browser API polyfills (localStorage, rAF, observers, etc.)
 */

// ============================================================
// 0. jsdom DOM environment (must be first)
// ============================================================

// Only create jsdom if document doesn't already exist
if (typeof globalThis.document === "undefined") {
  try {
    const { JSDOM } = require("jsdom") as typeof import("jsdom");
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "http://localhost",
      pretendToBeVisual: true,
    });

    const win = dom.window as any;

    // Expose JSDOM globals — use direct property assignment for window functions
    Object.defineProperty(globalThis, "window", { value: win, writable: true, configurable: true });
    Object.defineProperty(globalThis, "document", { value: win.document, writable: true });
    Object.defineProperty(globalThis, "navigator", { value: win.navigator, writable: true });

    // DOM constructors
    const domConstructors = [
      "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLSelectElement",
      "HTMLTextAreaElement", "HTMLAnchorElement", "HTMLDivElement", "HTMLSpanElement",
      "HTMLCanvasElement", "Element", "DocumentFragment", "Text", "Comment",
      "Node", "NodeList", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent",
      "FocusEvent", "InputEvent", "MutationObserver", "DOMParser", "XMLSerializer",
      "Range", "Selection", "ShadowRoot", "HTMLUListElement", "HTMLLIElement",
      "HTMLParagraphElement", "HTMLHeadingElement", "HTMLImageElement",
      "HTMLTableElement", "HTMLTableRowElement", "HTMLTableCellElement",
      "SVGElement", "SVGSVGElement", "SVGPathElement",
    ];
    for (const name of domConstructors) {
      if (win[name] && !globalThis[name as keyof typeof globalThis]) {
        Object.defineProperty(globalThis, name, { value: win[name], writable: true });
      }
    }

    // Window methods — directly on globalThis so @testing-library can access them
    const windowMethods = [
      "addEventListener", "removeEventListener", "dispatchEvent",
      "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame",
      "setTimeout", "clearTimeout", "setInterval", "clearInterval",
      "getSelection", "scrollTo", "scrollBy", "alert", "confirm", "prompt",
    ];
    for (const name of windowMethods) {
      if (typeof win[name] === "function" && !globalThis[name as keyof typeof globalThis]) {
        Object.defineProperty(globalThis, name, { value: win[name].bind(win), writable: true, configurable: true });
      }
    }

    // CustomElementRegistry
    if (win.customElements && !globalThis.customElements) {
      Object.defineProperty(globalThis, "customElements", { value: win.customElements, writable: true });
    }

    // Storage from jsdom (make configurable so tests can override)
    if (dom.window.localStorage) {
      Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage, writable: true, configurable: true });
      // Make window.localStorage configurable too (tests often re-define it)
      try {
        Object.defineProperty(dom.window, "localStorage", { value: dom.window.localStorage, writable: true, configurable: true });
      } catch { /* some jsdom versions don't allow this */ }
    }
    if (dom.window.sessionStorage) {
      Object.defineProperty(globalThis, "sessionStorage", { value: dom.window.sessionStorage, writable: true, configurable: true });
      try {
        Object.defineProperty(dom.window, "sessionStorage", { value: dom.window.sessionStorage, writable: true, configurable: true });
      } catch { /* skip */ }
    }

    // matchMedia mock (jsdom doesn't provide this)
    if (!(dom.window as any).matchMedia) {
      Object.defineProperty(dom.window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }

    // scrollTo/scrollIntoView
    if (!dom.window.scrollTo) {dom.window.scrollTo = () => {};}
    if (!dom.window.scrollBy) {dom.window.scrollBy = () => {};}
  } catch (e) {
    // jsdom not available — provide minimal fallbacks
    console.warn("[bun-test-shim] jsdom not available, DOM tests will fail");
  }
}

// ============================================================
// 1. Vitest API → bun:test globals + vitest module monkey-patch
// ============================================================

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

// Build enhanced vi with vitest-compat methods
const vitestCompatMethods = {
  resetModules: () => { /* no-op: bun:test uses fresh imports per file */ },
  mocked: <T>(v: T): T => v,
  setSystemTime: (_d?: Date | number) => { /* no-op stub */ },
  unstubAllGlobals: () => { /* no-op */ },
  advanceTimersByTimeAsync: async (_ms: number) => { /* no-op */ },
  stubGlobal: (name: string, value: any) => { globalThis[name as keyof typeof globalThis] = value; },
};

const enhancedVi = { ...vi, ...vitestCompatMethods };
Object.assign(globalThis, { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi: enhancedVi });

// Monkey-patch the vitest module so `import { vi } from "vitest"` gets enhanced vi
try {
  const vitestModule = require("vitest") as any;
  if (vitestModule && typeof vitestModule === "object") {
    // The vitest module may export vi as a getter — override it
    for (const key of Object.keys(vitestCompatMethods)) {
      if (!(key in vitestModule.vi)) {
        vitestModule.vi[key] = (vitestCompatMethods as any)[key];
      }
    }
  }
} catch { /* vitest module not resolvable, skip */ }

// ============================================================
// 2. Additional browser API polyfills
// ============================================================

if (typeof globalThis.requestAnimationFrame === "undefined") {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

if (typeof globalThis.ResizeObserver === "undefined") {
  // @ts-ignore
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  // @ts-ignore
  globalThis.IntersectionObserver = class IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

if (typeof globalThis.indexedDB === "undefined") {
  try {
    const { IDBFactory } = require("fake-indexeddb");
    globalThis.indexedDB = new IDBFactory();
  } catch { /* skip */ }
}

// Storage fallback if jsdom didn't provide it
if (typeof globalThis.localStorage === "undefined") {
  class StorageMock {
    private store = new Map<string, string>();
    getItem(key: string) { return this.store.get(key) ?? null; }
    setItem(key: string, value: string) { this.store.set(key, String(value)); }
    removeItem(key: string) { this.store.delete(key); }
    clear() { this.store.clear(); }
    get length() { return this.store.size; }
    key(index: number) { return [...this.store.keys()][index] ?? null; }
  }
  Object.defineProperty(globalThis, "localStorage", { value: new StorageMock(), writable: true });
  Object.defineProperty(globalThis, "sessionStorage", { value: new StorageMock(), writable: true });
}

export {};
