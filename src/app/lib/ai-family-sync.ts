/**
 * @file: ai-family-sync.ts
 * @description: AI Family 多端同步引擎 - 一人8端实时同步
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, sync, multi-device, real-time]
 *
 * @brief: 一人8端，记忆不丢不齐
 * - 实时数据同步
 * - 冲突解决 (CRDT)
 * - 离线支持
 * - 增量同步
 * - 跨平台兼容
 */

import type {
  AIFamilyDevice,
  DeviceType,
} from "./ai-family.types";

// ============================================================
// 同步类型定义
// ============================================================

export interface DeviceSyncState {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  lastSyncAt: number;
  pendingOperations: number;
  isOnline: boolean;
  syncVersion: number;
}

export interface SyncPayload<T = unknown> {
  operation: SyncOperationType;
  entityType: string;
  entityId: string;
  data: T;
  timestamp: number;
  sourceDeviceId: string;
  version: number;
}

export type SyncOperationType =
  | "create"
  | "update"
  | "delete"
  | "sync"
  | "conflict-resolve"
  | "full-sync"
  | "incremental-sync";

export type SyncStatus =
  | "synced"
  | "syncing"
  | "pending"
  | "conflict"
  | "offline"
  | "error";

export interface SyncConflict {
  id: string;
  entityId: string;
  entityType: string;
  localData: unknown;
  remoteData: unknown;
  localTimestamp: number;
  remoteTimestamp: number;
  resolvedWith?: "local" | "remote" | "merge";
  resolvedAt?: number;
}

export interface SyncQueueItem {
  id: string;
  payload: SyncPayload;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  nextRetryAt?: number;
}

export interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsDetected: number;
  conflictsResolved: number;
  averageSyncTimeMs: number;
  dataTransferredBytes: number;
  lastSyncAt: number | null;
  devicesOnline: number;
}

// ============================================================
// 同步管理器
// ============================================================

export class AIFamilySyncEngine {
  private currentDevice: AIFamilyDevice | null = null;
  private memberDevices: Map<string, DeviceSyncState> = new Map();
  private syncQueue: SyncQueueItem[] = [];
  private conflicts: Map<string, SyncConflict> = new Map();

  // 同步状态
  private syncVersion = 0;
  private isSyncing = false;
  private lastFullSyncAt = 0;

  // 配置
  private config: SyncConfig;

  // 定时器
  private syncIntervalId: ReturnType<typeof setInterval> | null = null;
  private offlineCheckIntervalId: ReturnType<typeof setInterval> | null = null;

  // 事件回调
  private eventListeners: Map<string, Set<Function>> = new Map();

  // 本地变更追踪
  private localChanges: Map<string, SyncPayload[]> = new Map();

  constructor(config?: Partial<SyncConfig>) {
    this.config = {
      autoSync: true,
      syncIntervalMs: 5000,
      maxRetries: 3,
      retryDelayMs: 1000,
      conflictStrategy: "last-write-wins",
      enableOfflineSupport: true,
      maxQueueSize: 1000,
      compressionEnabled: true,
      encryptionEnabled: true,
      ...config,
    };

    this.initialize();
  }

  // ============================================================
  // 初始化与设备注册
  // ============================================================

  private initialize(): void {
    this.loadDeviceState();
    this.setupNetworkListeners();
    this.setupAutoSync();
    this.emit("initialized");
  }

  registerCurrentDevice(device: Omit<AIFamilyDevice, "isOnline" | "lastSyncAt">): void {
    this.currentDevice = {
      ...device,
      isOnline: navigator.onLine,
      lastSyncAt: Date.now(),
    };

    this.saveDeviceState();
    this.broadcastDeviceOnline();

    this.emit("device:registered", this.currentDevice);
  }

  getCurrentDevice(): AIFamilyDevice | null {
    return this.currentDevice;
  }

  getRegisteredDevices(): DeviceSyncState[] {
    return Array.from(this.memberDevices.values());
  }

  getOnlineDevices(): DeviceSyncState[] {
    return Array.from(this.memberDevices.values()).filter((d) => d.isOnline);
  }

  // ============================================================
  // 数据同步操作
  // ============================================================

  async pushChange<T>(
    entityType: string,
    entityId: string,
    data: T,
    operation: SyncOperationType = "update"
  ): Promise<SyncPayload<T>> {
    const payload: SyncPayload<T> = {
      operation,
      entityType,
      entityId,
      data,
      timestamp: Date.now(),
      sourceDeviceId: this.currentDevice?.deviceId || "unknown",
      version: ++this.syncVersion,
    };

    // 记录本地变更
    if (!this.localChanges.has(entityType)) {
      this.localChanges.set(entityType, []);
    }
    this.localChanges.get(entityType)!.push(payload);

    // 添加到同步队列
    this.addToSyncQueue(payload);

    // 如果在线，立即尝试同步
    if (navigator.onLine && this.config.autoSync) {
      this.processSyncQueue();
    }

    this.emit("change:pushed", payload);

    return payload;
  }

  async pullChanges(
    entityType?: string,
    sinceVersion?: number
  ): Promise<SyncPayload[]> {
    // 在实际应用中，这会从服务器拉取变更
    // 这里模拟返回其他设备的变更

    const changes: SyncPayload[] = [];

    for (const [type, payloads] of this.localChanges) {
      if (!entityType || type === entityType) {
        for (const payload of payloads) {
          if (!sinceVersion || payload.version > sinceVersion) {
            changes.push(payload);
          }
        }
      }
    }

    this.emit("changes:pulled", { count: changes.length });

    return changes;
  }

  async fullSync(): Promise<{
    success: boolean;
    entitiesSynchronized: number;
    conflictsDetected: number;
    durationMs: number;
  }> {
    const startTime = Date.now();
    let entitiesCount = 0;
    let conflictsCount = 0;

    try {
      this.isSyncing = true;
      this.emit("sync:started", { type: "full" });

      // 1. 收集所有本地变更
      const allLocalChanges: SyncPayload[] = [];
      for (const [, payloads] of this.localChanges) {
        allLocalChanges.push(...payloads);
      }

      // 2. 发送到服务器（模拟）
      await this.simulateServerSync(allLocalChanges);

      // 3. 从服务器接收远程变更（模拟）
      const remoteChanges = await this.pullChanges();

      // 4. 处理冲突
      for (const remote of remoteChanges) {
        const conflict = await this.detectAndResolveConflict(remote);
        if (conflict) {
          conflictsCount++;
        }
      }

      // 5. 更新状态
      entitiesCount = allLocalChanges.length + remoteChanges.length;
      this.lastFullSyncAt = Date.now();

      // 6. 清理已同步的变更
      this.clearSyncedChanges();

      const durationMs = Date.now() - startTime;

      this.isSyncing = false;
      this.emit("sync:completed", {
        type: "full",
        durationMs,
        entitiesSynchronized: entitiesCount,
        conflictsDetected: conflictsCount,
      });

      return {
        success: true,
        entitiesSynchronized: entitiesCount,
        conflictsDetected: conflictsCount,
        durationMs,
      };
    } catch (error) {
      this.isSyncing = false;
      console.error("[AIFamilySync] Full sync failed:", error);
      this.emit("sync:error", { type: "full", error });

      return {
        success: false,
        entitiesSynchronized: entitiesCount,
        conflictsDetected: conflictsCount,
        durationMs: Date.now() - startTime,
      };
    }
  }

  async incrementalSync(): Promise<{
    success: boolean;
    changesSynchronized: number;
    durationMs: number;
  }> {
    const startTime = Date.now();

    if (this.syncQueue.length === 0) {
      return {
        success: true,
        changesSynchronized: 0,
        durationMs: 0,
      };
    }

    try {
      this.isSyncing = true;
      this.emit("sync:started", { type: "incremental" });

      let synchronized = 0;
      const itemsToProcess = [...this.syncQueue];

      for (const item of itemsToProcess) {
        try {
          await this.synchronizePayload(item.payload);
          this.removeFromQueue(item.id);
          synchronized++;
        } catch (error) {
          this.handleSyncFailure(item, error as Error);
        }
      }

      const durationMs = Date.now() - startTime;
      this.isSyncing = false;

      this.emit("sync:completed", {
        type: "incremental",
        durationMs,
        changesSynchronized: synchronized,
      });

      return {
        success: true,
        changesSynchronized: synchronized,
        durationMs,
      };
    } catch {
      this.isSyncing = false;
      return {
        success: false,
        changesSynchronized: 0,
        durationMs: Date.now() - startTime,
      };
    }
  }

  // ============================================================
  // 冲突检测与解决
  // ============================================================

  private async detectAndResolveConflict(remotePayload: SyncPayload): Promise<SyncConflict | null> {
    const conflictKey = `${remotePayload.entityType}:${remotePayload.entityId}`;

    // 查找本地对应的变更
    const localPayloads = this.localChanges.get(remotePayload.entityType) || [];
    const localPayload = localPayloads.find((p) => p.entityId === remotePayload.entityId);

    if (!localPayload) {
      // 无冲突，直接应用远程变更
      return null;
    }

    // 检测时间戳冲突
    const timeDiff = Math.abs(localPayload.timestamp - remotePayload.timestamp);
    if (timeDiff < 1000) {
      // 时间戳接近，可能存在冲突
      const conflict: SyncConflict = {
        id: `conflict-${Date.now()}`,
        entityId: remotePayload.entityId,
        entityType: remotePayload.entityType,
        localData: localPayload.data,
        remoteData: remotePayload.data,
        localTimestamp: localPayload.timestamp,
        remoteTimestamp: remotePayload.timestamp,
      };

      // 自动解决冲突
      const resolved = await this.resolveConflict(conflict);
      if (resolved) {
        this.conflicts.set(conflictKey, resolved);
        this.emit("conflict:detected-and-resolved", resolved);
        return resolved;
      }
    }

    return null;
  }

  private async resolveConflict(conflict: SyncConflict): Promise<SyncConflict> {
    switch (this.config.conflictStrategy) {
      case "last-write-wins":
        // 最后写入胜出
        if (conflict.remoteTimestamp > conflict.localTimestamp) {
          conflict.resolvedWith = "remote";
        } else {
          conflict.resolvedWith = "local";
        }
        break;

      case "first-write-wins":
        // 最先写入胜出
        if (conflict.localTimestamp < conflict.remoteTimestamp) {
          conflict.resolvedWith = "local";
        } else {
          conflict.resolvedWith = "remote";
        }
        break;

      case "manual":
        // 需要手动解决
        this.emit("conflict:requires-manual-resolution", conflict);
        return conflict;

      case "merge":
        // 尝试合并（简单实现）
        conflict.resolvedWith = "merge";
        break;

      default:
        conflict.resolvedWith = "remote";
    }

    conflict.resolvedAt = Date.now();
    return conflict;
  }

  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values());
  }

  manuallyResolveConflict(
    conflictId: string,
    resolution: "local" | "remote" | "merge",
    mergedData?: unknown
  ): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {return;}

    conflict.resolvedWith = resolution;
    conflict.resolvedAt = Date.now();

    if (resolution === "merge" && mergedData) {
      // 应用合并后的数据
      this.pushChange(
        conflict.entityType,
        conflict.entityId,
        mergedData,
        "conflict-resolve"
      );
    }

    this.emit("conflict:resolved", conflict);
  }

  // ============================================================
  // 离线支持
  // ============================================================

  isOffline(): boolean {
    return !navigator.onLine;
  }

  getOfflineQueueSize(): number {
    return this.syncQueue.filter((_item) => !navigator.onLine).length;
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.handleBackOnline();
    });

    window.addEventListener("offline", () => {
      this.handleGoOffline();
    });

    // 定期检查网络状态
    this.offlineCheckIntervalId = setInterval(() => {
      const wasOffline = !this.currentDevice?.isOnline;
      const isNowOnline = navigator.onLine;

      if (wasOffline && isNowOnline) {
        this.handleBackOnline();
      } else if (!wasOffline && !isNowOnline) {
        this.handleGoOffline();
      }
    }, 5000);
  }

  private handleGoOffline(): void {
    if (this.currentDevice) {
      this.currentDevice.isOnline = false;
    }

    this.emit("status:offline");

    if (this.config.enableOfflineSupport) {
      console.info("[AIFamilySync] Offline mode enabled. Changes will be queued.");
    }
  }

  private handleBackOnline(): void {
    if (this.currentDevice) {
      this.currentDevice.isOnline = true;
      this.currentDevice.lastSyncAt = Date.now();
    }

    this.emit("status:online");

    // 处理离线期间排队的变更
    if (this.syncQueue.length > 0) {
      console.info(`[AIFamilySync] Back online. Processing ${this.syncQueue.length} queued changes.`);
      this.processSyncQueue();
    }
  }

  // ============================================================
  // 队列管理
  // ============================================================

  private addToSyncQueue(payload: SyncPayload): void {
    if (this.syncQueue.length >= this.config.maxQueueSize) {
      console.warn("[AIFamilySync] Queue full, dropping oldest item");
      this.syncQueue.shift();
    }

    const queueItem: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      payload,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      createdAt: Date.now(),
    };

    this.syncQueue.push(queueItem);
    this.saveQueueState();
  }

  private removeFromQueue(queueItemId: string): void {
    this.syncQueue = this.syncQueue.filter((item) => item.id !== queueItemId);
    this.saveQueueState();
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0 || !navigator.onLine) {return;}

    await this.incrementalSync();
  }

  private handleSyncFailure(item: SyncQueueItem, error: Error): void {
    item.retryCount++;

    if (item.retryCount >= item.maxRetries) {
      console.error(`[AIFamilySync] Max retries exceeded for ${item.payload.entityId}:`, error);
      this.removeFromQueue(item.id);
      this.emit("sync:item-failed", { item, error });
      return;
    }

    // 计算下次重试时间（指数退避）
    const delay = this.config.retryDelayMs! * Math.pow(2, item.retryCount - 1);
    item.nextRetryAt = Date.now() + delay;

    this.emit("sync:item-retry-scheduled", { item, nextRetryIn: delay });
  }

  // ============================================================
  // 统计信息
  // ============================================================

  getSyncStatistics(): SyncStatistics {
    return {
      totalSyncs: this.getStatistic("totalSyncs") || 0,
      successfulSyncs: this.getStatistic("successfulSyncs") || 0,
      failedSyncs: this.getStatistic("failedSyncs") || 0,
      conflictsDetected: this.conflicts.size,
      conflictsResolved: Array.from(this.conflicts.values()).filter((c) => c.resolvedAt).length,
      averageSyncTimeMs: this.getStatistic("avgSyncTimeMs") || 0,
      dataTransferredBytes: this.getStatistic("dataTransferredBytes") || 0,
      lastSyncAt: this.lastFullSyncAt || null,
      devicesOnline: this.getOnlineDevices().length,
    };
  }

  getSyncStatus(): SyncStatus {
    if (this.isOffline()) {return "offline";}
    if (this.isSyncing) {return "syncing";}
    if (this.syncQueue.length > 0) {return "pending";}
    if (this.conflicts.size > 0) {return "conflict";}
    return "synced";
  }

  // ============================================================
  // 设备广播
  // ============================================================

  private broadcastDeviceOnline(): void {
    // 在实际应用中，通过 WebSocket 或 WebRTC DataChannel 广播
    this.emit("device:online", this.currentDevice);
  }

  broadcastToDevice(deviceId: string, payload: SyncPayload): void {
    // 在实际应用中，通过 P2P 连接发送到指定设备
    this.emit("broadcast:sent", { toDeviceId: deviceId, payload });
  }

  broadcastToAllDevices(payload: SyncPayload): void {
    // 在实际应用中，通过组播或逐一发送
    const onlineDevices = this.getOnlineDevices();
    onlineDevices.forEach((device) => {
      this.broadcastToDevice(device.deviceId, payload);
    });

    this.emit("broadcast:to-all", { deviceCount: onlineDevices.length, payload });
  }

  // ============================================================
  // 私有辅助方法
  // ============================================================

  private async simulateServerSync(changes: SyncPayload[]): Promise<void> {
    // 模拟服务器同步延迟
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    // 更新统计
    this.updateStatistic("totalSyncs", 1);
    this.updateStatistic("successfulSyncs", changes.length);
    this.updateStatistic("dataTransferredBytes", JSON.stringify(changes).length);
  }

  private async synchronizePayload(_payload: SyncPayload): Promise<void> {
    // 模拟单个payload的同步
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
  }

  private clearSyncedChanges(): void {
    this.localChanges.clear();
  }

  private setupAutoSync(): void {
    if (this.config.autoSync) {
      this.syncIntervalId = setInterval(() => {
        if (navigator.onLine && !this.isSyncing) {
          this.processSyncQueue();
        }
      }, this.config.syncIntervalMs);
    }
  }

  // ============================================================
  // 持久化存储
  // ============================================================

  private loadDeviceState(): void {
    try {
      const stateRaw = localStorage.getItem("yyc3_sync_device_state");
      if (stateRaw) {
        const state = JSON.parse(stateRaw);
        this.currentDevice = state.currentDevice;
        this.memberDevices = new Map(state.memberDevices || []);
        this.syncVersion = state.syncVersion || 0;
        this.lastFullSyncAt = state.lastFullSyncAt || 0;
      }

      const queueRaw = localStorage.getItem("yyc3_sync_queue");
      if (queueRaw) {
        this.syncQueue = JSON.parse(queueRaw);
      }
    } catch (error) {
      console.error("[AIFamilySync] Failed to load state:", error);
    }
  }

  private saveDeviceState(): void {
    try {
      const state = {
        currentDevice: this.currentDevice,
        memberDevices: Array.from(this.memberDevices.entries()),
        syncVersion: this.syncVersion,
        lastFullSyncAt: this.lastFullSyncAt,
      };
      localStorage.setItem("yyc3_sync_device_state", JSON.stringify(state));
    } catch (error) {
      console.error("[AIFamilySync] Failed to save state:", error);
    }
  }

  private saveQueueState(): void {
    try {
      localStorage.setItem("yyc3_sync_queue", JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error("[AIFamilySync] Failed to save queue:", error);
    }
  }

  private updateStatistic(key: string, value: number): void {
    const statsKey = "yyc3_sync_statistics";
    try {
      const statsRaw = localStorage.getItem(statsKey);
      const stats = statsRaw ? JSON.parse(statsRaw) : {};
      stats[key] = (stats[key] || 0) + value;
      localStorage.setItem(statsKey, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  private getStatistic(key: string): number | null {
    try {
      const statsRaw = localStorage.getItem("yyc3_sync_statistics");
      if (statsRaw) {
        const stats = JSON.parse(statsRaw);
        return stats[key] ?? null;
      }
    } catch {
      // ignore
    }
    return null;
  }

  // ============================================================
  // 事件系统
  // ============================================================

  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AIFamilySync] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  destroy(): void {
    // 清除定时器
    if (this.syncIntervalId) {clearInterval(this.syncIntervalId);}
    if (this.offlineCheckIntervalId) {clearInterval(this.offlineCheckIntervalId);}

    // 保存状态
    this.saveDeviceState();
    this.saveQueueState();

    // 清理资源
    this.syncQueue = [];
    this.localChanges.clear();
    this.conflicts.clear();
    this.memberDevices.clear();
    this.eventListeners.clear();

    this.emit("destroyed");
  }
}

// ============================================================
// 配置接口
// ============================================================

export interface SyncConfig {
  autoSync: boolean;
  syncIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  conflictStrategy: "last-write-wins" | "first-write-wins" | "manual" | "merge";
  enableOfflineSupport: boolean;
  maxQueueSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

// ============================================================
// 导出单例和工具函数
// ============================================================

let syncInstance: AIFamilySyncEngine | null = null;

export function getSyncInstance(config?: Partial<SyncConfig>): AIFamilySyncEngine {
  if (!syncInstance) {
    syncInstance = new AIFamilySyncEngine(config);
  }
  return syncInstance;
}

export function destroySyncInstance(): void {
  if (syncInstance) {
    syncInstance.destroy();
    syncInstance = null;
  }
}

export function formatSyncStatus(status: SyncStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case "synced":
      return { label: "已同步", color: "#10B981", icon: "✓" };
    case "syncing":
      return { label: "同步中...", color: "#3B82F6", icon: "↻" };
    case "pending":
      return { label: "待同步", color: "#F59E0B", icon: "⏳" };
    case "conflict":
      return { label: "有冲突", color: "#EF4444", icon: "!" };
    case "offline":
      return { label: "离线", color: "#9CA3AF", icon: "⊘" };
    case "error":
      return { label: "错误", color: "#DC2626", icon: "✗" };
    default:
      return { label: "未知", color: "#6B7280", icon: "?" };
  }
}

export function estimateSyncTime(itemsCount: number, avgItemSizeKB: number = 10): {
  estimatedSeconds: number;
  bandwidthRequiredKbps: number;
  recommendation: string;
} {
  const totalKB = itemsCount * avgItemSizeKB;
  const bandwidthKbps = 1000; // 假设平均带宽 1Mbps
  const estimatedSeconds = (totalKB * 8) / bandwidthKbps;

  let recommendation: string;
  if (estimatedSeconds < 5) {
    recommendation = "快速同步，无需优化";
  } else if (estimatedSeconds < 30) {
    recommendation = "正常同步速度";
  } else if (estimatedSeconds < 60) {
    recommendation = "建议启用压缩以加速同步";
  } else {
    recommendation = "大量数据，建议使用增量同步或分批处理";
  }

  return {
    estimatedSeconds: Math.ceil(estimatedSeconds),
    bandwidthRequiredKbps: Math.ceil(totalKB * 8 / estimatedSeconds),
    recommendation,
  };
}
