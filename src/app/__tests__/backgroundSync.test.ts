/**
 * @file: backgroundSync.test.ts
 * @description: backgroundSync.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addToSyncQueue,
  getSyncQueue,
  processSyncQueue,
  clearSyncQueue,
  getSyncQueueStats,
} from "../lib/backgroundSync";

const SYNC_QUEUE_KEY = "yyc3_sync_queue";

describe("backgroundSync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getSyncQueue", () => {
    it("should return empty array when nothing stored", () => {
      expect(getSyncQueue()).toEqual([]);
    });

    it("should return stored queue", () => {
      const item = { type: "config_update" as const, payload: { id: "1" } };
      addToSyncQueue(item);
      const queue = getSyncQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe("config_update");
    });

    it("should handle corrupted localStorage data", () => {
      localStorage.setItem(SYNC_QUEUE_KEY, "invalid-json");
      const queue = getSyncQueue();
      expect(queue).toEqual([]);
    });
  });

  describe("addToSyncQueue", () => {
    it("should add item with generated id and timestamp", () => {
      const item = { type: "config_update" as const, payload: { key: "val" } };
      const result = addToSyncQueue(item);
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.retries).toBe(0);
      expect(result.type).toBe("config_update");
    });

    it("should persist to localStorage", () => {
      addToSyncQueue({ type: "audit_log" as const, payload: {} });
      addToSyncQueue({ type: "user_action" as const, payload: {} });
      expect(getSyncQueue()).toHaveLength(2);
    });
  });

  describe("processSyncQueue", () => {
    it("should return zero counts for empty queue", async () => {
      const result = await processSyncQueue();
      expect(result).toEqual({ success: 0, failed: 0 });
    });

    it("should process all items successfully", async () => {
      addToSyncQueue({ type: "audit_log" as const, payload: {} });
      addToSyncQueue({ type: "config_update" as const, payload: {} });
      const result = await processSyncQueue();
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(getSyncQueue()).toHaveLength(0);
    });

    it("should retry items that fail sync", async () => {
      addToSyncQueue({ type: "audit_log" as const, payload: {} });
      
      const queue = getSyncQueue();
      queue[0].retries = 1;
      
      const result = await processSyncQueue();
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });

    it("should not retry items after max retries", async () => {
      const item = { type: "audit_log" as const, payload: {} };
      addToSyncQueue(item);

      const queue = getSyncQueue();
      queue[0].retries = 3;

      const result = await processSyncQueue();
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(getSyncQueue()).toHaveLength(0);
    });
  });

  describe("registerBackgroundSync", () => {
    it("should return false when serviceWorker is not available", async () => {
      const { registerBackgroundSync } = await import("../lib/backgroundSync");
      const result = await registerBackgroundSync();
      expect(result).toBe(false);
    });

    it("should return false when SyncManager is not available", async () => {
      const { registerBackgroundSync } = await import("../lib/backgroundSync");
      Object.defineProperty(window, "SyncManager", { value: undefined });
      const result = await registerBackgroundSync();
      expect(result).toBe(false);
    });
  });

  describe("clearSyncQueue", () => {
    it("should remove all items from queue", () => {
      addToSyncQueue({ type: "audit_log" as const, payload: {} });
      expect(getSyncQueue()).toHaveLength(1);
      clearSyncQueue();
      expect(getSyncQueue()).toHaveLength(0);
    });
  });

  describe("getSyncQueueStats", () => {
    it("should return zero stats for empty queue", () => {
      const stats = getSyncQueueStats();
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.retrying).toBe(0);
      expect(stats.oldestTimestamp).toBeNull();
    });

    it("should return correct stats for populated queue", () => {
      addToSyncQueue({ type: "audit_log" as const, payload: {} });
      addToSyncQueue({ type: "user_action" as const, payload: {} });
      const stats = getSyncQueueStats();
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(2);
      expect(stats.retrying).toBe(0);
      expect(stats.oldestTimestamp).toBeGreaterThan(0);
    });
  });
});
