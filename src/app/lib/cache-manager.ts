/**
 * @file: cache-manager.ts
 * @description: Performance Cache Manager with TTL and LRU eviction
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-10
 * @updated: 2026-04-20
 * @status: active
 * @tags: [cache, performance, lru, ttl]
 */

export interface CacheOptions<T> {
  ttl?: number;
  maxSize?: number;
  serializer?: (data: T) => string;
  deserializer?: (data: string) => T;
  onEvict?: (key: string, value: T) => void;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class CacheManager<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private stats = { hits: 0, misses: 0, evictions: 0 };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions<T> = {}) {
    this.maxSize = options.maxSize ?? 100;
    this.defaultTTL = options.ttl ?? 5 * 60 * 1000;

    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    entry.hits++;
    this.stats.hits++;

    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  get size(): number {
    return this.cache.size;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): T | Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = factory();

    if (value instanceof Promise) {
      return value.then(resolved => {
        this.set(key, resolved, ttl);
        return resolved;
      });
    }

    this.set(key, value, ttl);
    return value;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      const lastAccess = entry.timestamp + (entry.hits * 1000);
      if (lastAccess < oldestAccess) {
        oldestAccess = lastAccess;
        lruKey = key;
      }
    }

    if (lruKey) {
      const _entry = this.cache.get(lruKey)!;
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export function createCache<T = unknown>(options?: CacheOptions<T>): CacheManager<T> {
  return new CacheManager<T>(options);
}

const globalCaches = new Map<string, CacheManager>();

export function getGlobalCache<T = unknown>(name: string, options?: CacheOptions<T>): CacheManager<T> {
  let cache = globalCaches.get(name) as CacheManager<T> | undefined;

  if (!cache) {
    cache = new CacheManager<T>(options);
    globalCaches.set(name, cache);
  }

  return cache;
}

export function clearAllGlobalCaches(): void {
  for (const cache of globalCaches.values()) {
    cache.destroy();
  }
  globalCaches.clear();
}
