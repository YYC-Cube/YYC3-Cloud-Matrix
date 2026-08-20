/**
 * @file: test-utils.ts
 * @description: test-utils.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { vi } from "vitest";
import type { NodeData, AlertData, Model, ConfiguredModel } from "../../types";

// ============================================================
// Mock Factories
// ============================================================

export function createMockNode(overrides: Partial<NodeData> = {}): NodeData {
  return {
    id: `node-${Date.now()}`,
    status: "active",
    gpu: Math.floor(Math.random() * 100),
    mem: Math.floor(Math.random() * 100),
    temp: Math.floor(Math.random() * 50) + 40,
    model: "test-model",
    tasks: Math.floor(Math.random() * 50),
    ...overrides,
  };
}

export function createMockNodes(count: number): NodeData[] {
  return Array.from({ length: count }, (_, i) =>
    createMockNode({
      id: `node-${i + 1}`,
      status: i % 5 === 0 ? "warning" : "active",
    })
  );
}

export function createMockAlert(overrides: Partial<AlertData> = {}): AlertData {
  return {
    id: `alert-${Date.now()}`,
    level: "warning",
    message: "Test alert message",
    source: "test-source",
    timestamp: Date.now(),
    ...overrides,
  };
}

export function createMockAlerts(count: number): AlertData[] {
  const levels: AlertData["level"][] = ["info", "warning", "error", "critical"];
  return Array.from({ length: count }, (_, i) =>
    createMockAlert({
      id: `alert-${i + 1}`,
      level: levels[i % levels.length],
    })
  );
}

export function createMockModel(overrides: Partial<Model> = {}): Model {
  return {
    id: `model-${Date.now()}`,
    name: "Test Model",
    provider: "openai",
    tier: "primary" as const,
    avg_latency_ms: 100,
    throughput: 1000,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockConfiguredModel(
  overrides: Partial<ConfiguredModel> = {}
): ConfiguredModel {
  return {
    id: `config-model-${Date.now()}`,
    providerId: "openai",
    providerLabel: "OpenAI",
    model: "gpt-4",
    apiKey: "test-api-key",
    baseUrl: "https://api.openai.com/v1",
    createdAt: Date.now(),
    lastUsed: Date.now(),
    status: "active",
    ...overrides,
  };
}

// ============================================================
// Storage Mocks
// ============================================================

export function createMockLocalStorage(): Storage {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  } as Storage;
}

export function createMockSessionStorage(): Storage {
  return createMockLocalStorage();
}

// ============================================================
// WebSocket Mocks
// ============================================================

export type MockWebSocketEvents = {
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
};

export function createMockWebSocket(): {
  ws: WebSocket;
  events: MockWebSocketEvents;
  simulateOpen: () => void;
  simulateMessage: (data: unknown) => void;
  simulateClose: (code?: number, reason?: string) => void;
  simulateError: () => void;
} {
  const events: MockWebSocketEvents = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
  };

  const ws = {
    readyState: 0,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn((type: string, handler: EventListener) => {
      const eventMap: Record<string, keyof MockWebSocketEvents> = {
        open: "onopen",
        message: "onmessage",
        close: "onclose",
        error: "onerror",
      };
      if (eventMap[type]) {
        events[eventMap[type]] = handler as never;
      }
    }),
    removeEventListener: vi.fn(),
  } as unknown as WebSocket;

  return {
    ws,
    events,
    simulateOpen: () => {
      events.onopen?.(new Event("open"));
    },
    simulateMessage: (data: unknown) => {
      events.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
    },
    simulateClose: (code = 1000, reason = "") => {
      events.onclose?.(new CloseEvent("close", { code, reason }));
    },
    simulateError: () => {
      events.onerror?.(new Event("error"));
    },
  };
}

// ============================================================
// Fetch Mock
// ============================================================

export function createMockFetch(responses: unknown[] = []) {
  const responseQueue = [...responses];

  return vi.fn(async () => {
    const response = responseQueue.shift();
    if (response) {
      return response;
    }
    return {
      ok: true,
      json: async () => ({}),
      text: async () => "",
      status: 200,
      statusText: "OK",
    };
  });
}

export function createMockResponse(
  data: unknown,
  options: { ok?: boolean; status?: number; statusText?: string } = {}
): Response {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? "OK",
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
  } as unknown as Response;
}

// ============================================================
// Assertion Helpers
// ============================================================

export function assertType<T>(value: unknown, typeName: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`Expected ${typeName}, got ${value}`);
  }
}

export function expectToBeDefined<T>(value: T | undefined | null): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`Expected value to be defined, got ${value}`);
  }
}

export function waitFor(
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
        } else {
          setTimeout(check, interval);
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };

    check();
  });
}

// ============================================================
// Test Data Generators
// ============================================================

export function generateRandomString(length: number = 10): string {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateRandomNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomBoolean(): boolean {
  return Math.random() > 0.5;
}

export function generateRandomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ============================================================
// Performance Test Helpers
// ============================================================

export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  console.info(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

  return { result, duration };
}

export function createPerformanceBenchmark(
  name: string,
  iterations: number = 100
): {
  run: (fn: () => void) => { avg: number; min: number; max: number; total: number };
} {
  return {
    run: (fn: () => void) => {
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        times.push(performance.now() - start);
      }

      const total = times.reduce((a, b) => a + b, 0);
      const avg = total / iterations;
      const min = Math.min(...times);
      const max = Math.max(...times);

      console.info(`[Benchmark] ${name} (${iterations} iterations):`);
      console.info(`  Total: ${total.toFixed(2)}ms`);
      console.info(`  Average: ${avg.toFixed(2)}ms`);
      console.info(`  Min: ${min.toFixed(2)}ms`);
      console.info(`  Max: ${max.toFixed(2)}ms`);

      return { avg, min, max, total };
    },
  };
}

// ============================================================
// Snapshot Testing Helpers
// ============================================================

export function createSnapshotSerializer<T>(name: string): {
  serialize: (data: T) => string;
  deserialize: (serialized: string) => T;
} {
  return {
    serialize: (data: T) => JSON.stringify({ name, data, timestamp: Date.now() }),
    deserialize: (serialized: string) => {
      const parsed = JSON.parse(serialized);
      return parsed.data;
    },
  };
}

// ============================================================
// Async Test Helpers
// ============================================================

export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// Mock Environment Setup
// ============================================================

export function setupTestEnvironment(): void {
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();

  // Mock performance.memory
  Object.defineProperty(performance, "memory", {
    value: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 20000000,
      jsHeapSizeLimit: 50000000,
    },
    writable: true,
  });
}

export function cleanupTestEnvironment(): void {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
}
