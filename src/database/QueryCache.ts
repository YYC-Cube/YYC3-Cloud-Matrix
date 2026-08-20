/**
 * @file: QueryCache.ts
 * @description: QueryCache.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type { QueryResult } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CacheEntry<T = any> {
  key: string;
  result: QueryResult<T>;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
  lastAccessedAt: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  totalSize: number;
  evicted: number;
}

export interface CacheConfig {
  maxSize: number;
  maxEntries: number;
  defaultTTL: number;
  enableStats: boolean;
  cleanupInterval: number;
}

export class QueryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    entries: 0,
    totalSize: 0,
    evicted: 0,
  };
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024,
      maxEntries: 1000,
      defaultTTL: 5 * 60 * 1000,
      enableStats: true,
      cleanupInterval: 60 * 1000,
      ...config,
    };

    this.startCleanup();
  }

  /**
   * 生成缓存键
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public generateKey(sql: string, params: any[] = []): string {
    const normalizedSql = sql.trim().replace(/\s+/g, " ");
    const paramsStr = JSON.stringify(params);
    return `${normalizedSql}|${paramsStr}`;
  }

  /**
   * 获取缓存
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get<T = any>(sql: string, params: any[] = []): QueryResult<T> | null {
    const key = this.generateKey(sql, params);
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return null;
    }

    entry.accessCount++;
    entry.lastAccessedAt = Date.now();

    if (this.config.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }

    return entry.result;
  }

  /**
   * 设置缓存
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public set<T = any>(
    sql: string,
    result: QueryResult<T>,
    params: any[] = [],
    ttl?: number
  ): void {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const key = this.generateKey(sql, params);
    const size = this.calculateSize(result);

    if (size > this.config.maxSize) {
      return;
    }

    const entry: CacheEntry<T> = {
      key,
      result,
      createdAt: Date.now(),
      expiresAt: Date.now() + (ttl || this.config.defaultTTL),
      accessCount: 0,
      lastAccessedAt: Date.now(),
      size,
    };

    this.ensureCapacity(size);
    this.cache.set(key, entry);

    if (this.config.enableStats) {
      this.stats.entries = this.cache.size;
      this.stats.totalSize = this.calculateTotalSize();
    }
  }

  /**
   * 删除缓存
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public delete(sql: string, params: any[] = []): boolean {
    const key = this.generateKey(sql, params);
    const deleted = this.cache.delete(key);

    if (deleted && this.config.enableStats) {
      this.stats.entries = this.cache.size;
      this.stats.totalSize = this.calculateTotalSize();
    }

    return deleted;
  }

  /**
   * 清空缓存
   */
  public clear(): void {
    this.cache.clear();

    if (this.config.enableStats) {
      this.stats.entries = 0;
      this.stats.totalSize = 0;
    }
  }

  /**
   * 删除过期缓存
   */
  public deleteExpired(): number {
    const now = Date.now();
    let deleted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        deleted++;
      }
    }

    if (deleted > 0 && this.config.enableStats) {
      this.stats.entries = this.cache.size;
      this.stats.totalSize = this.calculateTotalSize();
    }

    return deleted;
  }

  /**
   * 删除表相关缓存
   */
  public deleteByTable(tableName: string): number {
    let deleted = 0;

    for (const [key, _entry] of this.cache.entries()) {
      if (this.keyContainsTable(key, tableName)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    if (deleted > 0 && this.config.enableStats) {
      this.stats.entries = this.cache.size;
      this.stats.totalSize = this.calculateTotalSize();
    }

    return deleted;
  }

  /**
   * 获取统计信息
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 获取缓存条目
   */
  public getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * 获取缓存大小
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存总大小（字节）
   */
  public totalSize(): number {
    return this.calculateTotalSize();
  }

  /**
   * 销毁缓存
   */
  public destroy(): void {
    this.stopCleanup();
    this.clear();
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.cleanupInterval !== undefined) {
      this.stopCleanup();
      this.startCleanup();
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * 确保缓存容量
   */
  private ensureCapacity(requiredSize: number): void {
    const currentSize = this.calculateTotalSize();

    if (currentSize + requiredSize <= this.config.maxSize && this.cache.size < this.config.maxEntries) {
      return;
    }

    const entries = Array.from(this.cache.entries()).sort((a, b) => {
      const scoreA = this.calculateEvictionScore(a[1]);
      const scoreB = this.calculateEvictionScore(b[1]);
      return scoreA - scoreB;
    });

    while (
      (this.calculateTotalSize() + requiredSize > this.config.maxSize || this.cache.size >= this.config.maxEntries) &&
      entries.length > 0
    ) {
      const [key] = entries.shift()!;
      this.cache.delete(key);
      this.stats.evicted++;
    }
  }

  /**
   * 计算驱逐分数
   */
  private calculateEvictionScore(entry: CacheEntry): number {
    const age = Date.now() - entry.createdAt;
    const idleTime = Date.now() - entry.lastAccessedAt;
    const accessFrequency = entry.accessCount / (age || 1);

    return (idleTime * 0.6) + (age * 0.3) - (accessFrequency * 1000 * 0.1);
  }

  /**
   * 计算缓存条目大小
   */
  private calculateSize(result: QueryResult): number {
    const resultStr = JSON.stringify(result);
    return new Blob([resultStr]).size;
  }

  /**
   * 计算总大小
   */
  private calculateTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 检查键是否包含表名
   */
  private keyContainsTable(key: string, tableName: string): boolean {
    const normalizedKey = key.toLowerCase();
    const normalizedTable = tableName.toLowerCase();

    return (
      normalizedKey.includes(`from ${normalizedTable}`) ||
      normalizedKey.includes(`into ${normalizedTable}`) ||
      normalizedKey.includes(`update ${normalizedTable}`) ||
      normalizedKey.includes(`delete from ${normalizedTable}`)
    );
  }

  /**
   * 启动清理定时器
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.deleteExpired();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止清理定时器
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
