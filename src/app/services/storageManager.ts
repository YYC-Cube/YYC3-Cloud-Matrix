/**
 * @file: storageManager.ts
 * @description: storageManager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { DatabaseAdapter } from "../../database/DatabaseAdapter";
import { connectionManager } from "../../database/ConnectionManager";
import type { StorageConfig, StorageStatus, StorageEvent, OfflineQueueItem, SyncData } from "../types/storage";
import type { Model, Agent, NodeStatusRecord } from "../types";

const STORAGE_CONFIG_KEY = "yyc3_storage_config";
const DEFAULT_CONFIG: StorageConfig = {
  type: "localStorage",
  syncInterval: 30,
  autoSync: true,
  offlineMode: true,
  conflictResolution: "local"
};

export class StorageManager {
  private static instance: StorageManager;
  private config: StorageConfig;
  private adapter: DatabaseAdapter | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private status: StorageStatus = {
    connected: false,
    syncing: false,
    lastSync: null,
    pendingChanges: 0
  };
  private eventListeners: Array<(event: StorageEvent) => void> = [];
  private offlineQueue: OfflineQueueItem[] = [];
  private isOnline = navigator.onLine;
  private networkListenerAdded = false;
  private lastSyncData: SyncData = {};
  private syncThrottleTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.loadConfig();
    this.loadOfflineQueue();
    this.addNetworkListeners();
    this.initialize();
  }

  /**
   * 添加网络状态监听器
   */
  private addNetworkListeners(): void {
    if (this.networkListenerAdded) {
      return;
    }

    window.addEventListener('online', () => {
      this.handleNetworkOnline();
    });

    window.addEventListener('offline', () => {
      this.handleNetworkOffline();
    });

    this.networkListenerAdded = true;
  }

  /**
   * 处理网络在线事件
   */
  private async handleNetworkOnline(): Promise<void> {
    if (!this.isOnline) {
      this.isOnline = true;
      this.status.connected = true;
      this.emitEvent({ type: "online" });

      // 网络恢复后执行离线队列中的操作
      if (this.offlineQueue.length > 0 && this.config.offlineMode) {
        await this.processOfflineQueue();
      }

      // 执行一次同步
      if (this.config.autoSync) {
        await this.sync();
      }
    }
  }

  /**
   * 处理网络离线事件
   */
  private handleNetworkOffline(): void {
    if (this.isOnline) {
      this.isOnline = false;
      this.status.connected = false;
      this.emitEvent({ type: "offline" });
    }
  }

  /**
   * 加载离线队列
   */
  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem('yyc3_offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        this.status.pendingChanges = this.offlineQueue.length;
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * 保存离线队列
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('yyc3_offline_queue', JSON.stringify(this.offlineQueue));
      this.status.pendingChanges = this.offlineQueue.length;
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * 处理离线操作
   */
  public addToOfflineQueue(operation: OfflineQueueItem): void {
    if (!this.isOnline && this.config.offlineMode) {
      this.offlineQueue.push(operation);
      this.saveOfflineQueue();
      this.emitEvent({ type: "offlineOperationAdded" });
    }
  }

  /**
   * 处理离线队列
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) {
      return;
    }

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveOfflineQueue();

    for (const operation of queue) {
      try {
        const data = operation.data as Record<string, unknown>;
        switch (operation.type) {
          case 'addModel':
            if (this.adapter && data) {
              await this.adapter.addModel(data as Omit<import("../types").Model, "id">);
            }
            break;
          case 'updateModel':
            if (this.adapter && data && typeof data === 'object' && 'id' in data) {
              const { id, ...updates } = data as Record<string, unknown> & { id: string };
              await this.adapter.updateModel(id as string, updates);
            }
            break;
          case 'deleteModel':
            if (this.adapter && data && typeof data === 'object' && 'id' in data) {
              await this.adapter.deleteModel((data as { id: string }).id);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to process offline operation:', error);
        // 将失败的操作重新加入队列
        this.offlineQueue.push(operation);
      }
    }

    this.saveOfflineQueue();
    this.emitEvent({ type: "offlineQueueProcessed" });
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * 加载存储配置
   */
  private loadConfig(): StorageConfig {
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load storage config:", error);
    }
    return DEFAULT_CONFIG;
  }

  /**
   * 保存存储配置
   */
  public saveConfig(config: StorageConfig): void {
    this.config = config;
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
      this.initialize();
    } catch (error) {
      console.error("Failed to save storage config:", error);
    }
  }

  /**
   * 获取存储配置
   */
  public getConfig(): StorageConfig {
    return this.config;
  }

  /**
   * 获取存储状态
   */
  public getStatus(): StorageStatus {
    return this.status;
  }

  /**
   * 初始化存储管理器
   */
  private async initialize(): Promise<void> {
    // 停止现有的同步定时器
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    // 销毁现有的数据库适配器
    if (this.adapter) {
      this.adapter.destroy();
      this.adapter = null;
    }

    // 初始化数据库适配器（如果配置为数据库存储）
    if (this.config.type === "database" && this.config.database) {
      try {
        const connectionId = "storage-connection";
        
        // 检查连接是否存在
        const existingConnection = connectionManager.getConnection(connectionId);
        if (!existingConnection) {
          await connectionManager.createConnection(
            connectionId,
            "Storage Connection",
            this.config.database!
          );
        }

        this.adapter = new DatabaseAdapter(connectionId, this.config.database!);
        this.status.connected = true;
        this.emitEvent({ type: "online" });

        // 启动自动同步
        if (this.config.autoSync) {
          this.startAutoSync();
        }
      } catch (error) {
        console.error("Failed to initialize database adapter:", error);
        this.status.connected = false;
        this.status.error = error instanceof Error ? error.message : String(error);
        this.emitEvent({ 
          type: "syncError", 
          error: this.status.error 
        });
      }
    } else {
      this.status.connected = true;
      this.emitEvent({ type: "online" });
    }
  }

  /**
   * 启动自动同步
   */
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      await this.sync();
    }, this.config.syncInterval * 1000);
  }

  /**
   * 执行同步
   */
  public async sync(): Promise<void> {
    if (this.status.syncing) {
      return;
    }

    this.status.syncing = true;
    this.emitEvent({ type: "syncStart" });

    try {
      if (this.adapter) {
        // 1. 从本地存储同步到数据库
        await this.syncLocalToDatabase();
        // 2. 从数据库同步到本地存储
        await this.syncDatabaseToLocal();
        
        this.status.lastSync = Date.now();
        this.status.pendingChanges = 0;
        this.emitEvent({ type: "syncComplete" });
      }
    } catch (error) {
      console.error("Sync failed:", error);
      this.status.error = error instanceof Error ? error.message : String(error);
      this.emitEvent({ 
        type: "syncError", 
        error: this.status.error 
      });
    } finally {
      this.status.syncing = false;
    }
  }

  /**
   * 从本地存储同步到数据库（增量同步）
   */
  private async syncLocalToDatabase(): Promise<void> {
    if (!this.adapter) {
      return;
    }

    try {
      // 增量同步模型数据
      const localModels = this.loadFromLocalStorage<Model[]>("yyc3_db_models", []);
      const lastModels = (this.lastSyncData.models || []) as Model[];
      const changedModels = this.getChangedItems(localModels, lastModels, "models");
      if (changedModels.length > 0) {
        await this.batchSyncModels(changedModels);
        this.lastSyncData.models = [...localModels];
      }

      // 增量同步 Agent 数据
      const localAgents = this.loadFromLocalStorage<Agent[]>("yyc3_db_agents", []);
      const lastAgents = (this.lastSyncData.agents || []) as Agent[];
      const changedAgents = this.getChangedItems(localAgents, lastAgents, "agents");
      if (changedAgents.length > 0) {
        await this.batchSyncAgents(changedAgents);
        this.lastSyncData.agents = [...localAgents];
      }

      // 增量同步节点数据
      const localNodes = this.loadFromLocalStorage<NodeStatusRecord[]>("yyc3_db_nodes", []);
      const lastNodes = (this.lastSyncData.nodes || []) as NodeStatusRecord[];
      const changedNodes = this.getChangedItems(localNodes, lastNodes, "nodes");
      if (changedNodes.length > 0) {
        await this.batchSyncNodes(changedNodes);
        this.lastSyncData.nodes = [...localNodes];
      }
    } catch (error) {
      console.error("Sync local to database failed:", error);
      throw error;
    }
  }

  /**
   * 批量同步模型数据
   */
  private async batchSyncModels(models: Model[]): Promise<void> {
    if (!this.adapter || models.length === 0) {
      return;
    }

    const existingModels = await this.adapter.getModels();
    const existingMap = new Map(existingModels.map((m) => [m.id, m]));

    for (const model of models) {
      const existingModel = existingMap.get(model.id);
      
      if (existingModel) {
        const resolvedModel = this.resolveConflict(model, existingModel, "models") as Model;
        await this.adapter.executeWithCache(
          "UPDATE models SET name = ?, provider = ?, tier = ?, avg_latency_ms = ?, throughput = ?, created_at = ? WHERE id = ?",
          [resolvedModel.name, resolvedModel.provider, resolvedModel.tier, resolvedModel.avg_latency_ms, resolvedModel.throughput, resolvedModel.created_at, resolvedModel.id]
        );
      } else {
        await this.adapter.executeWithCache(
          "INSERT INTO models (id, name, provider, tier, avg_latency_ms, throughput, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [model.id, model.name, model.provider, model.tier, model.avg_latency_ms, model.throughput, model.created_at]
        );
      }
    }
  }

  /**
   * 批量同步 Agent 数据
   */
  private async batchSyncAgents(agents: Agent[]): Promise<void> {
    if (!this.adapter || agents.length === 0) {
      return;
    }

    const existingAgents = await this.adapter.getAgents();
    const existingMap = new Map(existingAgents.map((a) => [a.id, a]));

    for (const agent of agents) {
      const existingAgent = existingMap.get(agent.id);
      
      if (existingAgent) {
        const resolvedAgent = this.resolveConflict(agent, existingAgent, "agents") as Agent;
        await this.adapter.executeWithCache(
          "UPDATE agents SET name = ?, name_cn = ?, role = ?, description = ?, is_active = ? WHERE id = ?",
          [resolvedAgent.name, resolvedAgent.name_cn, resolvedAgent.role, resolvedAgent.description, resolvedAgent.is_active ? 1 : 0, resolvedAgent.id]
        );
      } else {
        await this.adapter.executeWithCache(
          "INSERT INTO agents (id, name, name_cn, role, description, is_active) VALUES (?, ?, ?, ?, ?, ?)",
          [agent.id, agent.name, agent.name_cn, agent.role, agent.description, agent.is_active ? 1 : 0]
        );
      }
    }
  }

  /**
   * 批量同步节点数据
   */
  private async batchSyncNodes(nodes: NodeStatusRecord[]): Promise<void> {
    if (!this.adapter || nodes.length === 0) {
      return;
    }

    const existingNodes = await this.adapter.getNodes();
    const existingMap = new Map(existingNodes.map((n) => [n.id, n]));

    for (const node of nodes) {
      const existingNode = existingMap.get(node.id);
      
      if (existingNode) {
        const resolvedNode = this.resolveConflict(node, existingNode, "nodes") as NodeStatusRecord;
        await this.adapter.executeWithCache(
          "UPDATE nodes SET hostname = ?, gpu_util = ?, mem_util = ?, temp_celsius = ?, model_deployed = ?, active_tasks = ?, status = ? WHERE id = ?",
          [resolvedNode.hostname, resolvedNode.gpu_util, resolvedNode.mem_util, resolvedNode.temp_celsius, resolvedNode.model_deployed, resolvedNode.active_tasks, resolvedNode.status, resolvedNode.id]
        );
      } else {
        await this.adapter.executeWithCache(
          "INSERT INTO nodes (id, hostname, gpu_util, mem_util, temp_celsius, model_deployed, active_tasks, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [node.id, node.hostname, node.gpu_util, node.mem_util, node.temp_celsius, node.model_deployed, node.active_tasks, node.status]
        );
      }
    }
  }

  /**
   * 获取有变化的项目（增量同步）
   */
  private getChangedItems<T>(currentItems: T[], lastItems: T[], table: string): T[] {
    const lastMap = new Map<string, T>();
    for (const item of lastItems) {
      const record = item as unknown as { id?: string };
      if (record.id) {
        lastMap.set(record.id, item);
      }
    }
    const changedItems: T[] = [];

    for (const currentItem of currentItems) {
      const currentRecord = currentItem as unknown as { id?: string };
      const lastItem = currentRecord?.id ? lastMap.get(currentRecord.id) : undefined;
      if (!lastItem || this.itemsAreDifferent(currentItem as unknown as Record<string, unknown>, lastItem as unknown as Record<string, unknown>, table)) {
        changedItems.push(currentItem);
      }
    }

    return changedItems;
  }

  /**
   * 检查两个项目是否不同
   */
  private itemsAreDifferent(item1: Record<string, unknown>, item2: Record<string, unknown>, table: string): boolean {
    switch (table) {
      case "models":
        return item1.name !== item2.name ||
               item1.provider !== item2.provider ||
               item1.tier !== item2.tier ||
               item1.avg_latency_ms !== item2.avg_latency_ms ||
               item1.throughput !== item2.throughput;
      case "agents":
        return item1.name !== item2.name ||
               item1.name_cn !== item2.name_cn ||
               item1.role !== item2.role ||
               item1.description !== item2.description ||
               item1.is_active !== item2.is_active;
      case "nodes":
        return item1.hostname !== item2.hostname ||
               item1.gpu_util !== item2.gpu_util ||
               item1.mem_util !== item2.mem_util ||
               item1.temp_celsius !== item2.temp_celsius ||
               item1.model_deployed !== item2.model_deployed ||
               item1.active_tasks !== item2.active_tasks ||
               item1.status !== item2.status;
      default:
        return JSON.stringify(item1) !== JSON.stringify(item2);
    }
  }

  /**
   * 从数据库同步到本地存储
   */
  private async syncDatabaseToLocal(): Promise<void> {
    if (!this.adapter) {
      return;
    }

    try {
      // 同步模型数据
      const dbModels = await this.adapter.getModels();
      const localModels = this.loadFromLocalStorage<Model[]>("yyc3_db_models", []);
      const resolvedModels = this.resolveConflicts(dbModels, localModels, "models");
      this.saveToLocalStorage("yyc3_db_models", resolvedModels);

      // 同步 Agent 数据
      const dbAgents = await this.adapter.getAgents();
      const localAgents = this.loadFromLocalStorage<Agent[]>("yyc3_db_agents", []);
      const resolvedAgents = this.resolveConflicts(dbAgents, localAgents, "agents");
      this.saveToLocalStorage("yyc3_db_agents", resolvedAgents);

      // 同步节点数据
      const dbNodes = await this.adapter.getNodes();
      const localNodes = this.loadFromLocalStorage<NodeStatusRecord[]>("yyc3_db_nodes", []);
      const resolvedNodes = this.resolveConflicts(dbNodes, localNodes, "nodes");
      this.saveToLocalStorage("yyc3_db_nodes", resolvedNodes);
    } catch (error) {
      console.error("Sync database to local failed:", error);
      throw error;
    }
  }

  /**
   * 解决单个冲突
   */
  private resolveConflict(localItem: unknown, remoteItem: unknown, table: string): unknown {
    switch (this.config.conflictResolution) {
      case "local":
        return localItem;
      case "remote":
        return remoteItem;
      case "merge":
        return this.mergeItems(localItem, remoteItem, table);
      default:
        return localItem;
    }
  }

  /**
   * 解决多个冲突
   */
  private resolveConflicts<T>(remoteItems: T[], localItems: T[], table: string): T[] {
    const localMap = new Map<string, T>();
    for (const item of localItems) {
      const record = item as unknown as { id?: string };
      if (record.id) {
        localMap.set(record.id, item);
      }
    }
    const resolvedItems: T[] = [];

    for (const remoteItem of remoteItems) {
      const remoteRecord = remoteItem as unknown as { id?: string };
      const localItem = remoteRecord?.id ? localMap.get(remoteRecord.id) : undefined;
      if (localItem) {
        const resolvedItem = this.resolveConflict(localItem, remoteItem, table) as T;
        resolvedItems.push(resolvedItem);
        if (remoteRecord?.id) {
          localMap.delete(remoteRecord.id);
        }
      } else {
        resolvedItems.push(remoteItem);
      }
    }

    for (const [_, localItem] of localMap) {
      resolvedItems.push(localItem);
    }

    return resolvedItems;
  }

  /**
   * 合并两个项目
   */
  private mergeItems(localItem: unknown, remoteItem: unknown, _table: string): unknown {
    const local = localItem as Record<string, unknown>;
    const remote = remoteItem as Record<string, unknown>;
    
    const localTimestamp = this.getItemTimestamp(local, _table);
    const remoteTimestamp = this.getItemTimestamp(remote, _table);

    if (localTimestamp > remoteTimestamp) {
      return localItem;
    } else if (remoteTimestamp > localTimestamp) {
      return remoteItem;
    } else {
      return {
        ...(typeof remoteItem === 'object' && remoteItem !== null ? remoteItem : {}),
        ...(typeof localItem === 'object' && localItem !== null ? localItem : {}),
      };
    }
  }

  /**
   * 获取项目的时间戳
   */
  private getItemTimestamp(item: Record<string, unknown>, table: string): number {
    switch (table) {
      case "models":
        return new Date((item.created_at as string) || 0).getTime();
      case "agents":
      case "nodes":
        return item.id ? parseInt((item.id as string).split('-')[1] || '0') : 0;
      default:
        return 0;
    }
  }

  /**
   * 从 localStorage 加载数据
   */
  private loadFromLocalStorage<T>(key: string, defaults: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return defaults;
  }

  /**
   * 保存数据到 localStorage
   */
  private saveToLocalStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }

  /**
   * 手动触发同步（带节流）
   */
  public async triggerSync(): Promise<void> {
    // 节流：避免短时间内多次触发同步
    if (this.syncThrottleTimer) {
      clearTimeout(this.syncThrottleTimer);
    }

    this.syncThrottleTimer = setTimeout(async () => {
      await this.sync();
      this.syncThrottleTimer = null;
    }, 500);
  }

  /**
   * 注册事件监听器
   */
  public onEvent(listener: (event: StorageEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * 移除事件监听器
   */
  public offEvent(listener: (event: StorageEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: StorageEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in event listener:", error);
      }
    });
  }

  /**
   * 销毁存储管理器
   */
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.adapter) {
      this.adapter.destroy();
      this.adapter = null;
    }

    this.eventListeners = [];
  }
}

export const storageManager = StorageManager.getInstance();
