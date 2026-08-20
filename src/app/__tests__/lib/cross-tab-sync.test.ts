/**
 * @file: cross-tab-sync.test.ts
 * @description: cross-tab-sync.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initCrossTabSync,
  onCrossTabMessage,
  broadcastNodeUpdate,
  broadcastNodeAdd,
  broadcastNodeRemove,
  getTabId,
  destroyCrossTabSync,
} from "../../lib/cross-tab-sync";

describe("cross-tab-sync", () => {
  afterEach(() => {
    destroyCrossTabSync();
  });

  it("should return a tab ID", () => {
    const tabId = getTabId();
    expect(tabId).toMatch(/^tab-\d+-[a-z0-9]+$/);
  });

  it("should always return the same tab ID", () => {
    const id1 = getTabId();
    const id2 = getTabId();
    expect(id1).toBe(id2);
  });

  it("should register and unregister listeners", () => {
    const handler = vi.fn();
    const unsub = onCrossTabMessage("NODE_UPDATE", handler);
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("should not throw when BroadcastChannel is unavailable", () => {
    const orig = globalThis.BroadcastChannel;
    // @ts-ignore
    delete globalThis.BroadcastChannel;
    expect(() => initCrossTabSync()).not.toThrow();
    globalThis.BroadcastChannel = orig;
  });

  it("should broadcast node update without error", () => {
    initCrossTabSync();
    expect(() => broadcastNodeUpdate("node-1", { status: "active" })).not.toThrow();
  });

  it("should broadcast node add without error", () => {
    initCrossTabSync();
    expect(() => broadcastNodeAdd({ id: "node-2", name: "test" })).not.toThrow();
  });

  it("should broadcast node remove without error", () => {
    initCrossTabSync();
    expect(() => broadcastNodeRemove("node-1")).not.toThrow();
  });

  it("should destroy cleanly", () => {
    initCrossTabSync();
    expect(() => destroyCrossTabSync()).not.toThrow();
  });
});
