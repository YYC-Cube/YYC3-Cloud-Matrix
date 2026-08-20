/**
 * @file: broadcast-channel.test.ts
 * @description: broadcast-channel.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-05-03
 * @updated: 2026-05-03
 * @status: active
 * @tags: [lib]
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/error-handler", () => ({
  captureError: vi.fn(),
}));

import {
  broadcastAgentState,
  broadcastInferenceState,
  broadcastSyncMessage,
  closeAllChannels,
  closeChannel,
  getSharedChannel,
  onAgentStateChange,
  onUnifiedSync,
  postToChannel,
  UNIFIED_SYNC_CHANNEL,
} from "../../lib/broadcast-channel";

describe("broadcast-channel", () => {
  beforeEach(() => {
    closeAllChannels();
  });

  afterEach(() => {
    closeAllChannels();
  });

  describe("getSharedChannel", () => {
    it("should return a BroadcastChannel instance", () => {
      const ch = getSharedChannel("test-ch");
      expect(ch).toBeDefined();
      expect(ch!.name).toBe("test-ch");
    });

    it("should return same instance for same name (singleton)", () => {
      const a = getSharedChannel("same");
      const b = getSharedChannel("same");
      expect(a).toBe(b);
    });

    it("should return different instances for different names", () => {
      const a = getSharedChannel("ch-a");
      const b = getSharedChannel("ch-b");
      expect(a).not.toBe(b);
    });
  });

  describe("broadcastSyncMessage", () => {
    it("should not throw", () => {
      expect(() =>
        broadcastSyncMessage({ domain: "global-store", action: "update" })
      ).not.toThrow();
    });

    it("should handle all domain types", () => {
      const domains = [
        "global-store",
        "settings",
        "model-providers",
        "api-config",
        "indexeddb",
        "node-slice",
        "db-conn-slice",
        "follow-up-slice",
        "user-mgmt-slice",
        "network-slice",
        "agent-state",
        "mcp-event",
        "inference",
      ] as const;

      for (const domain of domains) {
        expect(() =>
          broadcastSyncMessage({ domain, action: "update" })
        ).not.toThrow();
      }
    });

    it("should handle all action types", () => {
      const actions = ["update", "create", "delete", "reset"] as const;
      for (const action of actions) {
        expect(() =>
          broadcastSyncMessage({ domain: "settings", action })
        ).not.toThrow();
      }
    });

    it("should accept optional source", () => {
      expect(() =>
        broadcastSyncMessage({ domain: "settings", action: "update", source: "tab-1" })
      ).not.toThrow();
    });
  });

  describe("postToChannel", () => {
    it("should not throw for valid channel", () => {
      getSharedChannel("post-test");
      expect(() => postToChannel("post-test", { hello: "world" })).not.toThrow();
    });

    it("should not throw for unknown channel", () => {
      expect(() => postToChannel("unknown-ch", { data: 1 })).not.toThrow();
    });

    it("should not throw for various data types", () => {
      getSharedChannel("type-test");
      expect(() => postToChannel("type-test", null)).not.toThrow();
      expect(() => postToChannel("type-test", "string")).not.toThrow();
      expect(() => postToChannel("type-test", 123)).not.toThrow();
      expect(() => postToChannel("type-test", [1, 2, 3])).not.toThrow();
    });
  });

  describe("onUnifiedSync", () => {
    it("should return a cleanup function", () => {
      const cleanup = onUnifiedSync(vi.fn());
      expect(typeof cleanup).toBe("function");
      cleanup();
    });
  });

  describe("closeChannel", () => {
    it("should close and remove a named channel", () => {
      const ch = getSharedChannel("to-close");
      expect(ch).toBeDefined();

      closeChannel("to-close");

      const ch2 = getSharedChannel("to-close");
      expect(ch2).not.toBe(ch);
    });

    it("should not throw for non-existent channel", () => {
      expect(() => closeChannel("non-existent")).not.toThrow();
    });
  });

  describe("closeAllChannels", () => {
    it("should close all open channels", () => {
      const a = getSharedChannel("a");
      const b = getSharedChannel("b");

      closeAllChannels();

      const a2 = getSharedChannel("a");
      const b2 = getSharedChannel("b");

      expect(a2).not.toBe(a);
      expect(b2).not.toBe(b);
    });

    it("should handle being called with no channels open", () => {
      closeAllChannels();
      expect(() => closeAllChannels()).not.toThrow();
    });
  });

  describe("broadcastAgentState", () => {
    it("should not throw with taskId", () => {
      expect(() =>
        broadcastAgentState("agent-1", "running", "task-001")
      ).not.toThrow();
    });

    it("should not throw without taskId", () => {
      expect(() =>
        broadcastAgentState("agent-2", "idle")
      ).not.toThrow();
    });
  });

  describe("onAgentStateChange", () => {
    it("should return a cleanup function", () => {
      const cleanup = onAgentStateChange(vi.fn());
      expect(typeof cleanup).toBe("function");
      cleanup();
    });
  });

  describe("broadcastInferenceState", () => {
    it("should not throw", () => {
      expect(() =>
        broadcastInferenceState("ollama", "llama3", "running")
      ).not.toThrow();
    });

    it("should handle different statuses", () => {
      const statuses = ["running", "stopped", "error", "loading"];
      for (const s of statuses) {
        expect(() =>
          broadcastInferenceState("vllm", "glm-4", s)
        ).not.toThrow();
      }
    });
  });

  describe("UNIFIED_SYNC_CHANNEL", () => {
    it("should be a string constant", () => {
      expect(UNIFIED_SYNC_CHANNEL).toBe("yyc3-unified-sync");
    });
  });
});
