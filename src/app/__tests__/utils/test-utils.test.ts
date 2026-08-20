/**
 * @file: test-utils.test.ts
 * @description: test-utils.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createMockNode,
  createMockNodes,
  createMockAlert,
  createMockAlerts,
  createMockModel,
  createMockConfiguredModel,
  createMockLocalStorage,
  createMockWebSocket,
  createMockResponse,
  waitFor,
  generateRandomString,
  generateRandomNumber,
  generateRandomBoolean,
  generateRandomDate,
  measurePerformance,
  createPerformanceBenchmark,
  flushPromises,
  delay,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from "./test-utils";

describe("Mock Factories", () => {
  describe("createMockNode", () => {
    it("should create a node with default values", () => {
      const node = createMockNode();

      expect(node.id).toBeDefined();
      expect(node.status).toBe("active");
      expect(node.gpu).toBeGreaterThanOrEqual(0);
      expect(node.gpu).toBeLessThanOrEqual(100);
      expect(node.mem).toBeGreaterThanOrEqual(0);
      expect(node.mem).toBeLessThanOrEqual(100);
    });

    it("should override default values", () => {
      const node = createMockNode({
        id: "custom-node",
        status: "warning",
        gpu: 75,
      });

      expect(node.id).toBe("custom-node");
      expect(node.status).toBe("warning");
      expect(node.gpu).toBe(75);
    });
  });

  describe("createMockNodes", () => {
    it("should create multiple nodes", () => {
      const nodes = createMockNodes(5);

      expect(nodes).toHaveLength(5);
      expect(nodes[0].id).toBe("node-1");
      expect(nodes[4].id).toBe("node-5");
    });

    it("should create nodes with varying status", () => {
      const nodes = createMockNodes(10);
      const warningNodes = nodes.filter((n) => n.status === "warning");

      expect(warningNodes.length).toBeGreaterThan(0);
    });
  });

  describe("createMockAlert", () => {
    it("should create an alert with default values", () => {
      const alert = createMockAlert();

      expect(alert.id).toBeDefined();
      expect(alert.level).toBe("warning");
      expect(alert.message).toBe("Test alert message");
      expect(alert.source).toBe("test-source");
    });

    it("should override default values", () => {
      const alert = createMockAlert({
        id: "custom-alert",
        level: "error",
        message: "Custom message",
      });

      expect(alert.id).toBe("custom-alert");
      expect(alert.level).toBe("error");
      expect(alert.message).toBe("Custom message");
    });
  });

  describe("createMockAlerts", () => {
    it("should create multiple alerts with varying levels", () => {
      const alerts = createMockAlerts(10);

      expect(alerts).toHaveLength(10);
      expect(alerts[0].id).toBe("alert-1");

      const levels = new Set(alerts.map((a) => a.level));
      expect(levels.size).toBeGreaterThan(1);
    });
  });

  describe("createMockModel", () => {
    it("should create a model with default values", () => {
      const model = createMockModel();

      expect(model.id).toBeDefined();
      expect(model.name).toBe("Test Model");
      expect(model.provider).toBe("openai");
      expect(model.tier).toBe("primary");
    });

    it("should override default values", () => {
      const model = createMockModel({
        id: "custom-model",
        name: "GPT-4",
        tier: "secondary",
      });

      expect(model.id).toBe("custom-model");
      expect(model.name).toBe("GPT-4");
      expect(model.tier).toBe("secondary");
    });
  });

  describe("createMockConfiguredModel", () => {
    it("should create a configured model with default values", () => {
      const model = createMockConfiguredModel();

      expect(model.id).toBeDefined();
      expect(model.providerId).toBe("openai");
      expect(model.model).toBe("gpt-4");
      expect(model.status).toBe("active");
    });

    it("should override default values", () => {
      const model = createMockConfiguredModel({
        providerId: "anthropic",
        model: "claude-3",
        status: "error",
      });

      expect(model.providerId).toBe("anthropic");
      expect(model.model).toBe("claude-3");
      expect(model.status).toBe("error");
    });
  });
});

describe("Storage Mocks", () => {
  describe("createMockLocalStorage", () => {
    let storage: Storage;

    beforeEach(() => {
      storage = createMockLocalStorage();
    });

    it("should set and get items", () => {
      storage.setItem("key", "value");
      expect(storage.getItem("key")).toBe("value");
    });

    it("should return null for non-existent keys", () => {
      expect(storage.getItem("nonexistent")).toBeNull();
    });

    it("should remove items", () => {
      storage.setItem("key", "value");
      storage.removeItem("key");
      expect(storage.getItem("key")).toBeNull();
    });

    it("should clear all items", () => {
      storage.setItem("key1", "value1");
      storage.setItem("key2", "value2");
      storage.clear();
      expect(storage.length).toBe(0);
    });

    it("should track length", () => {
      expect(storage.length).toBe(0);
      storage.setItem("key1", "value1");
      expect(storage.length).toBe(1);
      storage.setItem("key2", "value2");
      expect(storage.length).toBe(2);
    });

    it("should get key by index", () => {
      storage.setItem("key1", "value1");
      storage.setItem("key2", "value2");
      expect(storage.key(0)).toBe("key1");
      expect(storage.key(1)).toBe("key2");
      expect(storage.key(99)).toBeNull();
    });
  });
});

describe("WebSocket Mocks", () => {
  describe("createMockWebSocket", () => {
    it("should create a mock WebSocket", () => {
      const { ws } = createMockWebSocket();

      expect(ws.readyState).toBe(0);
      expect(ws.send).toBeDefined();
      expect(ws.close).toBeDefined();
    });

    it("should simulate open event", () => {
      const { ws, events, simulateOpen } = createMockWebSocket();
      const handler = vi.fn();

      ws.addEventListener("open", handler);
      simulateOpen();

      expect(handler).toHaveBeenCalled();
    });

    it("should simulate message event", () => {
      const { ws, events, simulateMessage } = createMockWebSocket();
      const handler = vi.fn();

      ws.addEventListener("message", handler);
      simulateMessage({ type: "test", data: "hello" });

      expect(handler).toHaveBeenCalled();
    });

    it("should simulate close event", () => {
      const { ws, simulateClose } = createMockWebSocket();
      const handler = vi.fn();

      ws.addEventListener("close", handler);
      simulateClose(1000, "Normal closure");

      expect(handler).toHaveBeenCalled();
    });

    it("should simulate error event", () => {
      const { ws, simulateError } = createMockWebSocket();
      const handler = vi.fn();

      ws.addEventListener("error", handler);
      simulateError();

      expect(handler).toHaveBeenCalled();
    });
  });
});

describe("Fetch Mock", () => {
  describe("createMockResponse", () => {
    it("should create a mock response with default values", async () => {
      const response = createMockResponse({ data: "test" });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ data: "test" });
    });

    it("should create a mock response with custom options", async () => {
      const response = createMockResponse(
        { error: "Not found" },
        { ok: false, status: 404, statusText: "Not Found" }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(response.statusText).toBe("Not Found");
      expect(await response.json()).toEqual({ error: "Not found" });
    });

    it("should return text for string data", async () => {
      const response = createMockResponse("plain text");

      expect(await response.text()).toBe("plain text");
    });
  });
});

describe("Assertion Helpers", () => {
  describe("waitFor", () => {
    it("should resolve when condition becomes true", async () => {
      let value = false;
      setTimeout(() => {
        value = true;
      }, 100);

      await waitFor(() => value);
      expect(value).toBe(true);
    });

    it("should resolve immediately if condition is already true", async () => {
      await waitFor(() => true);
    });

    it("should reject on timeout", async () => {
      await expect(waitFor(() => false, { timeout: 100 })).rejects.toThrow(
        "Timeout waiting for condition"
      );
    });
  });
});

describe("Test Data Generators", () => {
  describe("generateRandomString", () => {
    it("should generate a string of default length", () => {
      const str = generateRandomString();
      expect(str.length).toBe(10);
    });

    it("should generate a string of specified length", () => {
      const str = generateRandomString(20);
      expect(str.length).toBe(20);
    });

    it("should generate different strings", () => {
      const str1 = generateRandomString();
      const str2 = generateRandomString();
      expect(str1).not.toBe(str2);
    });
  });

  describe("generateRandomNumber", () => {
    it("should generate a number within default range", () => {
      const num = generateRandomNumber();
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(100);
    });

    it("should generate a number within specified range", () => {
      const num = generateRandomNumber(50, 100);
      expect(num).toBeGreaterThanOrEqual(50);
      expect(num).toBeLessThanOrEqual(100);
    });
  });

  describe("generateRandomBoolean", () => {
    it("should generate a boolean", () => {
      const bool = generateRandomBoolean();
      expect(typeof bool).toBe("boolean");
    });

    it("should generate both true and false values", () => {
      const results = new Set<boolean>();
      for (let i = 0; i < 100; i++) {
        results.add(generateRandomBoolean());
      }
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });
  });

  describe("generateRandomDate", () => {
    it("should generate a date within default range", () => {
      const date = generateRandomDate();
      expect(date instanceof Date).toBe(true);
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should generate a date within specified range", () => {
      const start = new Date(2023, 0, 1);
      const end = new Date(2023, 11, 31);
      const date = generateRandomDate(start, end);

      expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });
});

describe("Performance Test Helpers", () => {
  describe("measurePerformance", () => {
    it("should measure synchronous function performance", async () => {
      const { result, duration } = await measurePerformance("sync-test", () => 42);

      expect(result).toBe(42);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it("should measure async function performance", async () => {
      const { result, duration } = await measurePerformance("async-test", async () => {
        await delay(10);
        return "done";
      });

      expect(result).toBe("done");
      expect(duration).toBeGreaterThanOrEqual(5);
    });
  });

  describe("createPerformanceBenchmark", () => {
    it("should run benchmark and return statistics", () => {
      const benchmark = createPerformanceBenchmark("test-benchmark", 10);
      const stats = benchmark.run(() => Math.random());

      expect(stats.avg).toBeGreaterThanOrEqual(0);
      expect(stats.min).toBeLessThanOrEqual(stats.max);
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Async Test Helpers", () => {
  describe("flushPromises", () => {
    it("should flush pending promises", async () => {
      let resolved = false;
      Promise.resolve().then(() => {
        resolved = true;
      });

      await flushPromises();
      expect(resolved).toBe(true);
    });
  });

  describe("delay", () => {
    it("should delay execution", async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });
});

describe("Test Environment Setup", () => {
  describe("setupTestEnvironment", () => {
    it("should set up global mocks", () => {
      setupTestEnvironment();

      expect(global.ResizeObserver).toBeDefined();
      expect(global.IntersectionObserver).toBeDefined();
      expect(window.matchMedia).toBeDefined();
      expect(window.scrollTo).toBeDefined();
    });
  });

  describe("cleanupTestEnvironment", () => {
    it("should clear mocks and storage", () => {
      localStorage.setItem("test", "value");
      cleanupTestEnvironment();

      expect(localStorage.length).toBe(0);
    });
  });
});
