/**
 * @file: QueryCache.test.ts
 * @description: QueryCache.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryCache } from "../../database/QueryCache";
import type { QueryResult } from "../../database/types";

describe("QueryCache", () => {
  let cache: QueryCache;

  beforeEach(() => {
    cache = new QueryCache({
      maxSize: 1024 * 1024,
      maxEntries: 100,
      defaultTTL: 5000,
      enableStats: true,
      cleanupInterval: 1000,
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("generateKey", () => {
    it("should generate unique keys for different queries", () => {
      const key1 = cache.generateKey("SELECT * FROM users");
      const key2 = cache.generateKey("SELECT * FROM orders");

      expect(key1).not.toBe(key2);
    });

    it("should generate same key for same query", () => {
      const key1 = cache.generateKey("SELECT * FROM users");
      const key2 = cache.generateKey("SELECT * FROM users");

      expect(key1).toBe(key2);
    });

    it("should generate different keys for queries with different params", () => {
      const key1 = cache.generateKey("SELECT * FROM users WHERE id = ?", [1]);
      const key2 = cache.generateKey("SELECT * FROM users WHERE id = ?", [2]);

      expect(key1).not.toBe(key2);
    });
  });

  describe("get and set", () => {
    it("should return null for non-existent cache", () => {
      const result = cache.get("SELECT * FROM users");

      expect(result).toBeNull();
    });

    it("should cache and retrieve query result", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      const result = cache.get("SELECT * FROM users");

      expect(result).toEqual(queryResult);
    });

    it("should return null for expired cache", async () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult, [], 100);
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = cache.get("SELECT * FROM users");

      expect(result).toBeNull();
    });

    it("should update stats on cache hit", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.get("SELECT * FROM users");

      const stats = cache.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(1);
    });

    it("should update stats on cache miss", () => {
      cache.get("SELECT * FROM users");

      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete cached query", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.delete("SELECT * FROM users");

      const result = cache.get("SELECT * FROM users");

      expect(result).toBeNull();
    });

    it("should return false for non-existent cache", () => {
      const deleted = cache.delete("SELECT * FROM users");

      expect(deleted).toBe(false);
    });

    it("should return true for successful deletion", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      const deleted = cache.delete("SELECT * FROM users");

      expect(deleted).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all cache entries", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.set("SELECT * FROM orders", queryResult);
      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get("SELECT * FROM users")).toBeNull();
      expect(cache.get("SELECT * FROM orders")).toBeNull();
    });

    it("should reset stats", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.get("SELECT * FROM users");
      cache.clear();

      const stats = cache.getStats();

      expect(stats.entries).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });

  describe("deleteByTable", () => {
    it("should delete all cache entries for a table", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.set("SELECT * FROM users WHERE id = 1", queryResult);
      cache.set("SELECT * FROM orders", queryResult);

      const deleted = cache.deleteByTable("users");

      expect(deleted).toBe(2);
      expect(cache.get("SELECT * FROM users")).toBeNull();
      expect(cache.get("SELECT * FROM users WHERE id = 1")).toBeNull();
      expect(cache.get("SELECT * FROM orders")).not.toBeNull();
    });
  });

  describe("getStats", () => {
    it("should return correct stats", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.set("SELECT * FROM orders", queryResult);
      cache.get("SELECT * FROM users");
      cache.get("SELECT * FROM products");

      const stats = cache.getStats();

      expect(stats.entries).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe("size and totalSize", () => {
    it("should return correct size", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.set("SELECT * FROM orders", queryResult);

      expect(cache.size()).toBe(2);
    });

    it("should return correct total size", () => {
      const queryResult: QueryResult = {
        rows: [{ id: 1, name: "John" }],
        rowCount: 1,
        executionTime: 100,
      };

      cache.set("SELECT * FROM users", queryResult);
      cache.set("SELECT * FROM orders", queryResult);

      expect(cache.totalSize()).toBeGreaterThan(0);
    });
  });

  describe("updateConfig", () => {
    it("should update cache configuration", () => {
      cache.updateConfig({
        maxSize: 2048 * 1024,
        maxEntries: 200,
      });

      const config = cache.getConfig();

      expect(config.maxSize).toBe(2048 * 1024);
      expect(config.maxEntries).toBe(200);
    });
  });
});
