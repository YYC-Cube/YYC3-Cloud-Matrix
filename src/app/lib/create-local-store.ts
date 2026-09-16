/**
 * @file: create-local-store.ts
 * @description: YYC³ 本地存储工厂 - 支持事务、验证、缓存优化
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-09
 * @status: active
 * @tags: [lib],[store],[cache]
 *
 * @brief: 增强版本地存储，支持：
 * - 事务机制确保批量操作原子性
 * - 内存缓存层减少 localStorage 读写
 * - 数据校验集成
 * - 自动防抖持久化
 */

// ============================================================
// 类型定义
// ============================================================

export interface LocalStore<T extends { id: string }> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  add: (item: Omit<T, "id"> & { id?: string }) => T;
  update: (id: string, updates: Partial<T>) => T | null;
  remove: (id: string) => boolean;
  removeBatch: (ids: string[]) => number;
  reset: () => T[];
  exportData: () => string;
  importData: (json: string) => boolean;
  count: () => number;

  // 新增：事务支持
  transaction: () => Transaction<T>;

  // 新增：验证支持
  validate: (item: Partial<T>) => import("./validators").ValidationResult;

  // 新增：缓存控制
  clearCache: () => void;
  getCacheStats: () => CacheStats;
}

export interface Transaction<T> {
  add: (item: Omit<T, "id"> & { id?: string }) => Transaction<T>;
  update: (id: string, updates: Partial<T>) => Transaction<T>;
  remove: (id: string) => Transaction<T>;
  removeBatch: (ids: string[]) => Transaction<T>;
  commit: () => boolean;
  rollback: () => void;
  getChanges: () => TransactionChange[];
}

export interface TransactionChange {
  type: "add" | "update" | "remove";
  id: string;
  data?: unknown;
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  writes: number;
  lastSync: number | null;
  size: number;
}

export interface StoreOptions<T extends { id: string }> {
  storageKey: string;
  defaults: T[];
  idPrefix?: string;
  validator?: (item: Partial<T>) => import("./validators").ValidationResult;
  debounceMs?: number;
  maxCacheSize?: number;
}

// ============================================================
// 工厂函数
// ============================================================

export function createLocalStore<T extends { id: string }>(
  storageKey: string,
  defaults: T[],
  idPrefix = "item",
  options?: Partial<StoreOptions<T>>
): LocalStore<T> {
  const {
    validator,
    debounceMs = 0,
    maxCacheSize = 1000,
  } = options || {};

  // ============================================================
  // 内存缓存层（增强版）
  // ============================================================

  let _cache: T[] | null = null;

  // 缓存统计
  const stats: CacheStats = {
    hits: 0,
    misses: 0,
    writes: 0,
    lastSync: null,
    size: 0,
  };

  // 防抖定时器
  let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 加载数据（带缓存和统计）
   */
  function load(): T[] {
    if (_cache) {
      stats.hits++;
      return _cache;
    }

    stats.misses++;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          _cache = parsed as T[];
          stats.size = _cache.length;
          stats.lastSync = Date.now();
          return _cache;
        }
      }
    } catch { /* ignore */ }

    // 首次加载：写入默认值
    _cache = defaults.map((d) => ({ ...d }));
    saveImmediate();
    return _cache;
  }

  /**
   * 立即保存到 localStorage
   */
  function saveImmediate(): void {
    if (!_cache) {return;}
    try {
      localStorage.setItem(storageKey, JSON.stringify(_cache));
      stats.writes++;
      stats.lastSync = Date.now();
      stats.size = _cache.length;
    } catch { /* Storage unavailable */ }
  }

  /**
   * 防抖保存（优化频繁写入）
   */
  function saveDebounced(): void {
    if (debounceMs > 0) {
      if (_debounceTimer) {
        clearTimeout(_debounceTimer);
      }
      _debounceTimer = setTimeout(() => {
        saveImmediate();
        _debounceTimer = null;
      }, debounceMs);
    } else {
      saveImmediate();
    }
  }

  // ============================================================
  // 事务实现
  // ============================================================

  function createTransaction(): Transaction<T> {
    const snapshot = load().map((item) => ({ ...item }));
    const changes: TransactionChange[] = [];
    let committed = false;

    return {
      add(item) {
        if (committed) {throw new Error("Transaction already committed");}
        const data = snapshot;
        const newItem = {
          ...item,
          id: item.id || `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        } as T;
        data.push(newItem);
        changes.push({ type: "add", id: newItem.id, data: newItem, timestamp: Date.now() });
        return this;
      },

      update(id, updates) {
        if (committed) {throw new Error("Transaction already committed");}
        const data = snapshot;
        const idx = data.findIndex((item) => item.id === id);
        if (idx >= 0) {
          data[idx] = { ...data[idx], ...updates };
          changes.push({ type: "update", id, data: data[idx], timestamp: Date.now() });
        }
        return this;
      },

      remove(id) {
        if (committed) {throw new Error("Transaction already committed");}
        const data = snapshot;
        const idx = data.findIndex((item) => item.id === id);
        if (idx >= 0) {
          const removed = data.splice(idx, 1)[0];
          changes.push({ type: "remove", id, data: removed, timestamp: Date.now() });
        }
        return this;
      },

      removeBatch(ids) {
        if (committed) {throw new Error("Transaction already committed");}
        const data = snapshot;
        const _idSet = new Set(ids);
        ids.forEach((id) => {
          const idx = data.findIndex((item) => item.id === id);
          if (idx >= 0) {
            const removed = data.splice(idx, 1)[0];
            changes.push({ type: "remove", id, data: removed, timestamp: Date.now() });
          }
        });
        return this;
      },

      commit() {
        if (committed) {return false;}
        committed = true;
        _cache = snapshot;
        saveDebounced();
        return true;
      },

      rollback() {
        if (committed) {throw new Error("Cannot rollback committed transaction");}
        // 直接丢弃快照，不影响实际数据
      },

      getChanges() {
        return [...changes];
      },
    };
  }

  // ============================================================
  // 返回 Store 接口
  // ============================================================

  return {
    getAll: () => [...load()],

    getById: (id: string) => load().find((item) => item.id === id),

    add: (item) => {
      const data = load();

      // 验证数据（如果提供了验证器）
      if (validator) {
        const result = validator(item as Partial<T>);
        if (!result.valid) {
          console.warn(`[Store:${storageKey}] Validation failed:`, result.errors);
          throw new Error(`Validation failed: ${result.errors.join("; ")}`);
        }
      }

      const newItem = {
        ...item,
        id: item.id || `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      } as T;
      data.push(newItem);
      _cache = data;
      saveDebounced();
      return newItem;
    },

    update: (id, updates) => {
      const data = load();
      const idx = data.findIndex((item) => item.id === id);
      if (idx < 0) {return null;}

      // 验证更新数据（如果提供了验证器）
      if (validator) {
        const merged = { ...data[idx], ...updates };
        const result = validator(merged);
        if (!result.valid) {
          console.warn(`[Store:${storageKey}] Validation failed:`, result.errors);
          throw new Error(`Validation failed: ${result.errors.join("; ")}`);
        }
      }

      data[idx] = { ...data[idx], ...updates };
      _cache = data;
      saveDebounced();
      return data[idx];
    },

    remove: (id) => {
      const data = load();
      const idx = data.findIndex((item) => item.id === id);
      if (idx < 0) {return false;}
      data.splice(idx, 1);
      _cache = data;
      saveDebounced();
      return true;
    },

    removeBatch: (ids) => {
      const data = load();
      const idSet = new Set(ids);
      const before = data.length;
      _cache = data.filter((item) => !idSet.has(item.id));
      saveDebounced();
      return before - _cache.length;
    },

    reset: () => {
      _cache = defaults.map((d) => ({ ...d }));
      saveImmediate();
      return [..._cache];
    },

    exportData: () => JSON.stringify({
      _key: storageKey,
      _exportedAt: new Date().toISOString(),
      _version: "2.0.0",
      data: load(),
    }, null, 2),

    importData: (json) => {
      try {
        const parsed = JSON.parse(json);
        const items = Array.isArray(parsed) ? parsed : parsed.data;
        if (!Array.isArray(items)) {return false;}

        // 验证导入的数据（如果提供了验证器）
        if (validator) {
          for (const item of items) {
            const result = validator(item as Partial<T>);
            if (!result.valid) {
              console.warn(`[Store:${storageKey}] Import validation failed for item:`, result.errors);
              return false;
            }
          }
        }

        _cache = items;
        saveImmediate();
        return true;
      } catch {
        return false;
      }
    },

    count: () => load().length,

    // 新增方法
    transaction: createTransaction,

    validate: (item) => {
      if (!validator) {
        return { valid: true, errors: [] };
      }
      return validator(item);
    },

    clearCache: () => {
      _cache = null;
    },

    getCacheStats: () => ({ ...stats }),
  };
}
