/**
 * @file: cache-manager.test.ts
 * @description: cache-manager.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CacheManager, createCache, getGlobalCache, clearAllGlobalCaches } from "../../lib/cache-manager";

describe("CacheManager", () => {
  let cache: CacheManager<string>;

  beforeEach(() => {
    cache = new CacheManager<string>({ maxSize: 5, ttl: 1000 });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Basic operations", () => {
    it("should set and get values", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return undefined for missing keys", () => {
      expect(cache.get("missing")).toBeUndefined();
    });

    it("should check has correctly", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
      expect(cache.has("missing")).toBe(false);
    });

    it("should delete entries", () => {
      cache.set("key1", "value1");
      expect(cache.delete("key1")).toBe(true);
      expect(cache.get("key1")).toBeUndefined();
    });

    it("should clear all entries", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it("should track size", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      expect(cache.size).toBe(2);
    });
  });

  describe("TTL expiration", () => {
    it("should expire entries after TTL", async () => {
      const shortCache = new CacheManager<string>({ ttl: 50 });
      shortCache.set("key1", "value1");
      expect(shortCache.get("key1")).toBe("value1");

      await new Promise((r) => setTimeout(r, 100));
      expect(shortCache.get("key1")).toBeUndefined();
      shortCache.destroy();
    });

    it("should accept per-entry TTL", async () => {
      cache.set("short", "value", 50);
      cache.set("long", "value", 5000);

      await new Promise((r) => setTimeout(r, 100));
      expect(cache.get("short")).toBeUndefined();
      expect(cache.get("long")).toBe("value");
    });
  });

  describe("LRU eviction", () => {
    it("should evict when maxSize reached", () => {
      for (let i = 0; i < 6; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      expect(cache.size).toBeLessThanOrEqual(5);
    });

    it("should track evictions in stats", () => {
      for (let i = 0; i < 6; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      expect(cache.getStats().evictions).toBeGreaterThan(0);
    });
  });

  describe("Stats", () => {
    it("should track hit rate", () => {
      cache.set("key1", "value1");
      cache.get("key1");
      cache.get("missing");

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it("should return zero hitRate with no accesses", () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
      expect(stats.maxSize).toBe(5);
    });
  });

  describe("getOrSet", () => {
    it("should return cached value if exists", () => {
      cache.set("key1", "cached");
      const result = cache.getOrSet("key1", () => "factory");
      expect(result).toBe("cached");
    });

    it("should call factory and cache result", () => {
      const factory = vi.fn().mockReturnValue("fresh");
      const result = cache.getOrSet("key1", factory);
      expect(result).toBe("fresh");
      expect(factory).toHaveBeenCalledTimes(1);
      expect(cache.get("key1")).toBe("fresh");
    });

    it("should handle async factory", async () => {
      const factory = vi.fn().mockResolvedValue("async-value");
      const result = await cache.getOrSet("key1", factory);
      expect(result).toBe("async-value");
      expect(cache.get("key1")).toBe("async-value");
    });
  });

  describe("keys and values", () => {
    it("should return all keys", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      expect(cache.keys()).toEqual(["a", "b"]);
    });

    it("should return all values", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      expect(cache.values()).toEqual(["1", "2"]);
    });
  });
});

describe("createCache", () => {
  it("should create a cache instance", () => {
    const cache = createCache<string>({ maxSize: 10 });
    expect(cache).toBeInstanceOf(CacheManager);
    cache.destroy();
  });
});

describe("Global caches", () => {
  afterEach(() => {
    clearAllGlobalCaches();
  });

  it("should get or create global cache", () => {
    const cache1 = getGlobalCache("test");
    const cache2 = getGlobalCache("test");
    expect(cache1).toBe(cache2);
  });

  it("should create different caches for different names", () => {
    const cache1 = getGlobalCache("a");
    const cache2 = getGlobalCache("b");
    expect(cache1).not.toBe(cache2);
  });

  it("should clear all global caches", () => {
    getGlobalCache("a").set("k", "v");
    getGlobalCache("b").set("k", "v");
    clearAllGlobalCaches();
    const statsA = getGlobalCache("a").getStats();
    expect(statsA.size).toBe(0);
  });
});
