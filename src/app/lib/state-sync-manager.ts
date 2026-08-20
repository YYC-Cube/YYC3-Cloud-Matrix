/**
 * @file: state-sync-manager.ts
 * @description: state-sync-manager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

// ============================================================
// Types
// ============================================================

export type StateChangeType = "create" | "update" | "delete";

export interface StateChange<T> {
  id: string;
  type: StateChangeType;
  key: string;
  oldValue: T | null;
  newValue: T | null;
  timestamp: number;
  source: string;
}

export interface StateSnapshot<T> {
  version: number;
  data: Record<string, T>;
  timestamp: number;
  checksum: string;
}

export interface StateSyncConfig {
  persistenceEnabled: boolean;
  syncIntervalMs: number;
  maxHistorySize: number;
  maxSnapshots: number;
  autoSnapshotIntervalMs: number;
}

export interface StateSyncStats {
  totalChanges: number;
  pendingChanges: number;
  lastSyncAt: number | null;
  lastSnapshotAt: number | null;
  snapshotsCount: number;
  historySize: number;
}

type StateListener<T> = (change: StateChange<T>) => void;

// ============================================================
// Constants
// ============================================================

const DEFAULT_CONFIG: StateSyncConfig = {
  persistenceEnabled: true,
  syncIntervalMs: 5000,
  maxHistorySize: 100,
  maxSnapshots: 10,
  autoSnapshotIntervalMs: 60000,
};

const STORAGE_PREFIX = "yyc3_state_";

// ============================================================
// State Sync Manager Class
// ============================================================

export class StateSyncManager<T extends { id: string }> {
  private config: StateSyncConfig;
  private state: Map<string, T> = new Map();
  private history: StateChange<T>[] = [];
  private snapshots: StateSnapshot<T>[] = [];
  private listeners: Set<StateListener<T>> = new Set();
  private version: number = 0;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private snapshotTimer: ReturnType<typeof setInterval> | null = null;
  private storageKey: string;

  constructor(storageKey: string, config: Partial<StateSyncConfig> = {}) {
    this.storageKey = STORAGE_PREFIX + storageKey;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
    this.startAutoSync();
  }

  // ========== Public API ==========

  /**
   * 获取所有状态
   */
  getAll(): T[] {
    return Array.from(this.state.values());
  }

  /**
   * 根据 ID 获取状态
   */
  getById(id: string): T | undefined {
    return this.state.get(id);
  }

  /**
   * 设置状态
   */
  set(item: T, source: string = "unknown"): void {
    const existing = this.state.get(item.id);
    const change: StateChange<T> = {
      id: this.generateChangeId(),
      type: existing ? "update" : "create",
      key: item.id,
      oldValue: existing || null,
      newValue: item,
      timestamp: Date.now(),
      source,
    };

    this.state.set(item.id, item);
    this.recordChange(change);
    this.notifyListeners(change);
    this.version++;
  }

  /**
   * 批量设置状态
   */
  setBatch(items: T[], source: string = "batch"): void {
    for (const item of items) {
      this.set(item, source);
    }
  }

  /**
   * 删除状态
   */
  delete(id: string, source: string = "unknown"): boolean {
    const existing = this.state.get(id);
    if (!existing) {return false;}

    const change: StateChange<T> = {
      id: this.generateChangeId(),
      type: "delete",
      key: id,
      oldValue: existing,
      newValue: null,
      timestamp: Date.now(),
      source,
    };

    this.state.delete(id);
    this.recordChange(change);
    this.notifyListeners(change);
    this.version++;

    return true;
  }

  /**
   * 清除所有状态
   */
  clear(source: string = "clear"): void {
    const items = this.getAll();
    for (const item of items) {
      this.delete(item.id, source);
    }
  }

  /**
   * 订阅状态变更
   */
  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 获取变更历史
   */
  getHistory(limit?: number): StateChange<T>[] {
    const history = [...this.history].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * 创建快照
   */
  createSnapshot(): StateSnapshot<T> {
    const data: Record<string, T> = {};
    this.state.forEach((value, key) => {
      data[key] = value;
    });

    const snapshot: StateSnapshot<T> = {
      version: this.version,
      data,
      timestamp: Date.now(),
      checksum: this.calculateChecksum(data),
    };

    this.snapshots.push(snapshot);

    // Keep only the last N snapshots
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.config.maxSnapshots);
    }

    this.saveToStorage();
    return snapshot;
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(version?: number): boolean {
    let snapshot: StateSnapshot<T> | undefined;

    if (version !== undefined) {
      snapshot = this.snapshots.find((s) => s.version === version);
    } else {
      snapshot = this.snapshots[this.snapshots.length - 1];
    }

    if (!snapshot) {return false;}

    // Verify checksum
    if (snapshot.checksum !== this.calculateChecksum(snapshot.data)) {
      console.error("[StateSyncManager] Snapshot checksum mismatch");
      return false;
    }

    // Clear current state
    this.state.clear();

    // Restore from snapshot
    for (const [key, value] of Object.entries(snapshot.data)) {
      this.state.set(key, value);
    }

    this.version = snapshot.version;
    this.saveToStorage();

    return true;
  }

  /**
   * 回滚到指定版本
   */
  rollback(version: number): boolean {
    const snapshot = this.snapshots.find((s) => s.version === version);
    if (!snapshot) {return false;}
    return this.restoreSnapshot(version);
  }

  /**
   * 获取统计信息
   */
  getStats(): StateSyncStats {
    return {
      totalChanges: this.history.length,
      pendingChanges: this.history.filter((c) => c.timestamp > (this.getLastSyncTime() || 0)).length,
      lastSyncAt: this.getLastSyncTime(),
      lastSnapshotAt: this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1].timestamp : null,
      snapshotsCount: this.snapshots.length,
      historySize: this.history.length,
    };
  }

  /**
   * 手动同步
   */
  sync(): void {
    this.saveToStorage();
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoSync();
    this.state.clear();
    this.history = [];
    this.snapshots = [];
    this.listeners.clear();
  }

  // ========== Private Methods ==========

  private generateChangeId(): string {
    return `change-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private recordChange(change: StateChange<T>): void {
    this.history.push(change);

    // Keep only the last N changes
    if (this.history.length > this.config.maxHistorySize) {
      this.history = this.history.slice(-this.config.maxHistorySize);
    }
  }

  private notifyListeners(change: StateChange<T>): void {
    this.listeners.forEach((listener) => {
      try {
        listener(change);
      } catch { /* ignore listener errors */ }
    });
  }

  private calculateChecksum(data: Record<string, T>): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private loadFromStorage(): void {
    if (!this.config.persistenceEnabled) {return;}

    try {
      // Load state
      const stateRaw = localStorage.getItem(this.storageKey);
      if (stateRaw) {
        const parsed = JSON.parse(stateRaw);
        if (parsed.state) {
          for (const [key, value] of Object.entries(parsed.state)) {
            this.state.set(key, value as T);
          }
        }
        if (parsed.version) {
          this.version = parsed.version;
        }
      }

      // Load snapshots
      const snapshotsRaw = localStorage.getItem(this.storageKey + "_snapshots");
      if (snapshotsRaw) {
        this.snapshots = JSON.parse(snapshotsRaw);
      }
    } catch { /* ignore load errors */ }
  }

  private saveToStorage(): void {
    if (!this.config.persistenceEnabled) {return;}

    try {
      const data: Record<string, T> = {};
      this.state.forEach((value, key) => {
        data[key] = value;
      });

      localStorage.setItem(this.storageKey, JSON.stringify({
        state: data,
        version: this.version,
        lastSync: Date.now(),
      }));

      localStorage.setItem(this.storageKey + "_snapshots", JSON.stringify(this.snapshots));
    } catch { /* ignore save errors */ }
  }

  private getLastSyncTime(): number | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.lastSync || null;
      }
    } catch { /* ignore */ }
    return null;
  }

  private startAutoSync(): void {
    if (this.config.persistenceEnabled) {
      this.syncTimer = setInterval(() => {
        this.saveToStorage();
      }, this.config.syncIntervalMs);

      this.snapshotTimer = setInterval(() => {
        this.createSnapshot();
      }, this.config.autoSnapshotIntervalMs);
    }
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = null;
    }
  }
}

// ============================================================
// Factory Function
// ============================================================

export function createStateSyncManager<T extends { id: string }>(
  storageKey: string,
  config?: Partial<StateSyncConfig>
): StateSyncManager<T> {
  return new StateSyncManager<T>(storageKey, config);
}
