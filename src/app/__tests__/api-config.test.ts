/**
 * @file: api-config.test.ts
 * @description: api-config.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAPIConfig,
  setAPIConfig,
  resetAPIConfig,
  onAPIConfigChange,
  ENDPOINT_META,
} from "../lib/api-config";
import type { APIEndpoints } from "../types";

let mockChannel: {
  postMessage: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  messageHandlers: Array<(event: MessageEvent) => void>;
} | null = null;

vi.mock("../lib/broadcast-channel", () => ({
  getSharedChannel: vi.fn(() => {
    if (!mockChannel) {
      mockChannel = {
        postMessage: vi.fn(),
        addEventListener: vi.fn((type: string, handler: (event: MessageEvent) => void) => {
          if (type === "message") {
            mockChannel!.messageHandlers.push(handler);
          }
        }),
        removeEventListener: vi.fn((type: string, handler: (event: MessageEvent) => void) => {
          if (type === "message") {
            const idx = mockChannel!.messageHandlers.indexOf(handler);
            if (idx >= 0) {
              mockChannel!.messageHandlers.splice(idx, 1);
            }
          }
        }),
        messageHandlers: [],
      };
    }
    return mockChannel;
  }),
}));

describe("api-config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetAPIConfig();
    mockChannel = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAPIConfig", () => {
    it("should return default config when no config saved", () => {
      const config = getAPIConfig();
      expect(config).toBeDefined();
      expect(config.fsBase).toBe("/api/fs");
      expect(config.dbBase).toBe("/api/db");
      expect(config.wsEndpoint).toBe("ws://localhost:3113/ws");
      expect(config.aiBase).toBe("https://api.openai.com/v1");
      expect(config.clusterBase).toBe("/api/cluster");
      expect(config.enableBackend).toBe(false);
      expect(config.timeout).toBe(15000);
      expect(config.maxRetries).toBe(2);
    });

    it("should return saved config", () => {
      const customConfig: Partial<APIEndpoints> = {
        fsBase: "/custom/fs",
        enableBackend: true,
      };
      setAPIConfig(customConfig);
      const config = getAPIConfig();
      expect(config.fsBase).toBe("/custom/fs");
      expect(config.enableBackend).toBe(true);
    });

    it("should handle corrupted localStorage data", () => {
      localStorage.setItem("yyc3_api_endpoints", "invalid-json");
      const config = getAPIConfig();
      expect(config.fsBase).toBe("/api/fs");
    });
  });

  describe("setAPIConfig", () => {
    it("should update config", () => {
      const initialConfig = getAPIConfig();
      setAPIConfig({ fsBase: "/new/fs" });
      const updatedConfig = getAPIConfig();
      expect(updatedConfig.fsBase).toBe("/new/fs");
      expect(updatedConfig.dbBase).toBe(initialConfig.dbBase);
    });

    it("should persist to localStorage", () => {
      setAPIConfig({ aiBase: "https://custom.ai.com/v1" });
      const saved = localStorage.getItem("yyc3_api_endpoints");
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved as string);
      expect(parsed.aiBase).toBe("https://custom.ai.com/v1");
    });

    it("should handle localStorage quota errors gracefully", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });
      
      expect(() => setAPIConfig({ fsBase: "/new/fs" })).not.toThrow();
      
      localStorage.setItem = originalSetItem;
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("ListenerError");
      });
      const normalListener = vi.fn();
      
      onAPIConfigChange(errorListener);
      onAPIConfigChange(normalListener);
      
      expect(() => setAPIConfig({ fsBase: "/new/fs" })).not.toThrow();
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });

    it("should merge with existing config", () => {
      setAPIConfig({ fsBase: "/fs1" });
      setAPIConfig({ dbBase: "/db1" });
      const config = getAPIConfig();
      expect(config.fsBase).toBe("/fs1");
      expect(config.dbBase).toBe("/db1");
    });

    it("should notify listeners", () => {
      const listener = vi.fn();
      const unsubscribe = onAPIConfigChange(listener);
      setAPIConfig({ timeout: 20000 });
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: 20000 })
      );
      unsubscribe();
    });
  });

  describe("resetAPIConfig", () => {
    it("should reset to default config", () => {
      setAPIConfig({ fsBase: "/custom/fs", enableBackend: true });
      resetAPIConfig();
      const config = getAPIConfig();
      expect(config.fsBase).toBe("/api/fs");
      expect(config.enableBackend).toBe(false);
    });

    it("should clear localStorage", () => {
      setAPIConfig({ fsBase: "/custom/fs" });
      expect(localStorage.getItem("yyc3_api_endpoints")).toBeDefined();
      resetAPIConfig();
      expect(localStorage.getItem("yyc3_api_endpoints")).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error("StorageError");
      });
      
      expect(() => resetAPIConfig()).not.toThrow();
      
      localStorage.removeItem = originalRemoveItem;
    });

    it("should notify listeners", () => {
      const listener = vi.fn();
      const unsubscribe = onAPIConfigChange(listener);
      setAPIConfig({ fsBase: "/custom/fs" });
      resetAPIConfig();
      expect(listener).toHaveBeenCalledTimes(2);
      unsubscribe();
    });
  });

  describe("onAPIConfigChange", () => {
    it("should return unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = onAPIConfigChange(listener);
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
    });

    it("should call listener on config change", () => {
      const listener = vi.fn();
      onAPIConfigChange(listener);
      setAPIConfig({ fsBase: "/new/fs" });
      expect(listener).toHaveBeenCalled();
    });

    it("should stop calling after unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = onAPIConfigChange(listener);
      unsubscribe();
      setAPIConfig({ fsBase: "/new/fs" });
      expect(listener).not.toHaveBeenCalled();
    });

    it("should support multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      onAPIConfigChange(listener1);
      onAPIConfigChange(listener2);
      setAPIConfig({ fsBase: "/new/fs" });
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it("should handle broadcast messages from other tabs", () => {
      const listener = vi.fn();
      onAPIConfigChange(listener);
      
      const newConfig: APIEndpoints = {
        fsBase: "/broadcast/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: true,
        timeout: 20000,
        maxRetries: 3,
      };
      
      mockChannel!.messageHandlers.forEach(handler => {
        handler({ data: { type: "config_update", config: newConfig } } as MessageEvent);
      });
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ fsBase: "/broadcast/fs" }));
      expect(getAPIConfig().fsBase).toBe("/broadcast/fs");
    });

    it("should ignore non-config-update messages", () => {
      const listener = vi.fn();
      onAPIConfigChange(listener);
      
      mockChannel!.messageHandlers.forEach(handler => {
        handler({ data: { type: "other_type", config: {} } } as MessageEvent);
      });
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("ENDPOINT_META", () => {
    it("should provide endpoint metadata", () => {
      expect(ENDPOINT_META).toBeDefined();
      expect(typeof ENDPOINT_META).toBe("object");
    });
  });
});
