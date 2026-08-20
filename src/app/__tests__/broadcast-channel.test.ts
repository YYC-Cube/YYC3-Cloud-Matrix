/**
 * @file: broadcast-channel.test.ts
 * @description: broadcast-channel模块单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("broadcast-channel", () => {
  const originalBroadcastChannel = global.BroadcastChannel;
  let mockChannels: Map<string, { postMessage: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }> = new Map();

  const createMockBroadcastChannel = (name: string) => {
    const channel = {
      postMessage: vi.fn(),
      close: vi.fn(),
    };
    mockChannels.set(name, channel);
    return channel;
  };

  beforeEach(async () => {
    mockChannels.clear();

    const { closeAllChannels } = await import("../lib/broadcast-channel");
    closeAllChannels();

    class MockBroadcastChannel {
      postMessage = vi.fn();
      close = vi.fn();
      constructor(public name: string) {
        mockChannels.set(name, this);
      }
    }

    Object.defineProperty(global, "BroadcastChannel", {
      value: MockBroadcastChannel,
      writable: true,
    });
  });

  afterEach(async () => {
    const { closeAllChannels } = await import("../lib/broadcast-channel");
    closeAllChannels();
    global.BroadcastChannel = originalBroadcastChannel;
    mockChannels.clear();
  });

  describe("getSharedChannel()", () => {
    it("should return null when BroadcastChannel is undefined", async () => {
      Object.defineProperty(global, "BroadcastChannel", {
        value: undefined,
        writable: true,
      });

      vi.resetModules();
      const { getSharedChannel } = await import("../lib/broadcast-channel");
      const channel = getSharedChannel("test");
      expect(channel).toBeNull();
    });

    it("should create a new channel for new name", async () => {
      const { getSharedChannel } = await import("../lib/broadcast-channel");
      const channel = getSharedChannel("test-channel");
      expect(channel).toBeDefined();
      expect(channel?.name).toBe("test-channel");
    });

    it("should return the same channel instance for the same name", async () => {
      const { getSharedChannel } = await import("../lib/broadcast-channel");
      const channel1 = getSharedChannel("test-channel");
      const channel2 = getSharedChannel("test-channel");
      expect(channel1).toBe(channel2);
    });

    it("should create different channels for different names", async () => {
      const { getSharedChannel } = await import("../lib/broadcast-channel");
      const channel1 = getSharedChannel("channel-1");
      const channel2 = getSharedChannel("channel-2");
      expect(channel1).not.toBe(channel2);
    });
  });

  describe("postToChannel()", () => {
    it("should post message to channel", async () => {
      const { postToChannel, getSharedChannel } = await import("../lib/broadcast-channel");
      const testData = { type: "test", value: 123 };
      postToChannel("test-channel", testData);
      const channel = getSharedChannel("test-channel");
      expect(channel?.postMessage).toHaveBeenCalledWith(testData);
    });

    it("should handle error gracefully", async () => {
      class ErrorBroadcastChannel {
        postMessage = vi.fn(() => {
          throw new Error("Post failed");
        });
        close = vi.fn();
        constructor(public name: string) {}
      }

      Object.defineProperty(global, "BroadcastChannel", {
        value: ErrorBroadcastChannel,
        writable: true,
      });

      vi.resetModules();
      const { postToChannel } = await import("../lib/broadcast-channel");
      expect(() => postToChannel("test-channel", {})).not.toThrow();
    });

    it("should handle undefined BroadcastChannel", async () => {
      Object.defineProperty(global, "BroadcastChannel", {
        value: undefined,
        writable: true,
      });

      vi.resetModules();
      const { postToChannel } = await import("../lib/broadcast-channel");
      expect(() => postToChannel("test-channel", {})).not.toThrow();
    });
  });

  describe("closeChannel()", () => {
    it("should close and remove channel", async () => {
      const { getSharedChannel, closeChannel } = await import("../lib/broadcast-channel");
      const channel = getSharedChannel("test-channel");
      closeChannel("test-channel");
      expect(channel?.close).toHaveBeenCalled();

      vi.resetModules();
      const { getSharedChannel: getSharedChannel2 } = await import("../lib/broadcast-channel");
      const newChannel = getSharedChannel2("test-channel");
      expect(newChannel).not.toBe(channel);
    });

    it("should handle non-existent channel", async () => {
      const { closeChannel } = await import("../lib/broadcast-channel");
      expect(() => closeChannel("non-existent")).not.toThrow();
    });

    it("should handle close error gracefully", async () => {
      class ErrorBroadcastChannel {
        postMessage = vi.fn();
        close = vi.fn(() => {
          throw new Error("Close failed");
        });
        constructor(public name: string) {}
      }

      Object.defineProperty(global, "BroadcastChannel", {
        value: ErrorBroadcastChannel,
        writable: true,
      });

      vi.resetModules();
      const { getSharedChannel, closeChannel } = await import("../lib/broadcast-channel");
      getSharedChannel("test-channel");
      expect(() => closeChannel("test-channel")).not.toThrow();
    });
  });

  describe("closeAllChannels()", () => {
    it("should close all channels", async () => {
      const { getSharedChannel, closeAllChannels } = await import("../lib/broadcast-channel");
      const channel1 = getSharedChannel("channel-1");
      const channel2 = getSharedChannel("channel-2");
      closeAllChannels();
      expect(channel1?.close).toHaveBeenCalled();
      expect(channel2?.close).toHaveBeenCalled();
    });

    it("should handle close error gracefully", async () => {
      class ErrorBroadcastChannel {
        postMessage = vi.fn();
        close = vi.fn(() => {
          throw new Error("Close failed");
        });
        constructor(public name: string) {}
      }

      Object.defineProperty(global, "BroadcastChannel", {
        value: ErrorBroadcastChannel,
        writable: true,
      });

      vi.resetModules();
      const { getSharedChannel, closeAllChannels } = await import("../lib/broadcast-channel");
      getSharedChannel("test-channel");
      expect(() => closeAllChannels()).not.toThrow();
    });

    it("should clear all channels from cache", async () => {
      const { getSharedChannel, closeAllChannels } = await import("../lib/broadcast-channel");
      const channel = getSharedChannel("test-channel");
      closeAllChannels();

      vi.resetModules();
      const { getSharedChannel: getSharedChannel2 } = await import("../lib/broadcast-channel");
      const newChannel = getSharedChannel2("test-channel");
      expect(newChannel).not.toBe(channel);
    });
  });
});
