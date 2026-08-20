/**
 * @file: setup.ts
 * @description: setup.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// 检测环境类型
const isJsdom = typeof window !== "undefined" && typeof document !== "undefined";

// Ensure NODE_ENV=test is set for test-sensitive code paths
if (typeof process !== "undefined" && !process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

// jest-dom matchers（仅 jsdom 环境生效）
if (isJsdom) {
  await import("@testing-library/jest-dom/vitest");
  // IndexedDB polyfill for jsdom
  if (typeof indexedDB === "undefined") {
    const { IDBFactory } = await import("fake-indexeddb");
    globalThis.indexedDB = new IDBFactory();
  }
}

// fake-indexeddb polyfill for jsdom (IndexedDB mock)
import "fake-indexeddb/auto";

// Mock Observer classes for jsdom
class MockResizeObserver implements ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Document | Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor() { }
  observe() { }
  unobserve() { }
  disconnect() { }
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

//以下仅在 jsdom 环境执行
if (isJsdom) {
  // Mock matchMedia (jsdom 不支持)
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
      }),
    });
  }

  // Mock ResizeObserver
  if (!(window as Window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver) {
    (window as Window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  }

  // Mock IntersectionObserver
  if (!(window as Window & { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver) {
    (window as Window & { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  }

  // Mock scrollTo
  if (!window.scrollTo) {
    window.scrollTo = () => { };
  }

  // Mock scrollIntoView
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => { };
  }

  // Mock navigator.clipboard
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => { },
        readText: async () => "",
      },
      writable: true,
    });
  }

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      },
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      },
    };
  })();

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });

  class MockBroadcastChannel {
    name: string;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    onmessageerror: ((ev: MessageEvent) => void) | null = null;
    constructor(name: string) { this.name = name; }
    postMessage() { }
    close() { }
    addEventListener() { }
    removeEventListener() { }
    dispatchEvent() { return false; }
  }

  if (!(window as unknown as Record<string, unknown>).BroadcastChannel || (window as unknown as Record<string, unknown>).BroadcastChannel?.toString().includes("native")) {
    (window as unknown as Record<string, unknown>).BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
  }
}

if (isJsdom) {
  const { cleanup } = await import("@testing-library/react");
  const { afterEach: vitestAfterEach, afterAll: vitestAfterAll } = await import("vitest");

  vitestAfterEach(async () => {
    cleanup();
  });

  vitestAfterAll(async () => {
    cleanup();
  });
}

export { };
