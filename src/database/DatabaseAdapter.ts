/**
 * @file: DatabaseAdapter.ts
 * @description: DatabaseAdapter.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { connectionManager } from "./ConnectionManager";
import { IndexManager } from "./IndexManager";
import { QueryCache } from "./QueryCache";
import { QueryAnalyzer } from "./QueryAnalyzer";
import { SlowQueryMonitor } from "./SlowQueryMonitor";
import type {
  DatabaseConfig,
  QueryResult,
  QueryParams,
} from "./types";
import type {
  Model,
  Agent,
  NodeStatusRecord,
} from "../app/types/index";

export interface SyncConfig {
  enabled: boolean;
  syncInterval: number;
  autoMigrate: boolean;
  conflictResolution: "local" | "remote" | "merge";
}

export interface SyncStatus {
  lastSyncTime: number;
  pendingChanges: number;
  isSyncing: boolean;
  lastError?: string;
}

export class DatabaseAdapter {
  private connectionId: string;
  private indexManager: IndexManager | null = null;
  private queryCache: QueryCache;
  private queryAnalyzer: QueryAnalyzer | null = null;
  private slowQueryMonitor: SlowQueryMonitor | null = null;
  private syncConfig: SyncConfig;
  private syncStatus: SyncStatus;
  private syncTimer: NodeJS.Timeout | null = null;
  private pendingChanges: Map<string, Record<string, unknown>> = new Map();

  constructor(
    connectionId: string,
    config: DatabaseConfig,
    syncConfig: Partial<SyncConfig> = {}
  ) {
    this.connectionId = connectionId;
    this.syncConfig = {
      enabled: true,
      syncInterval: 60000,
      autoMigrate: true,
      conflictResolution: "local",
      ...syncConfig,
    };

    this.syncStatus = {
      lastSyncTime: 0,
      pendingChanges: 0,
      isSyncing: false,
    };

    this.queryCache = new QueryCache({
      maxSize: 50 * 1024 * 1024,
      maxEntries: 500,
      defaultTTL: 5 * 60 * 1000,
      enableStats: true,
    });

    this.initializeManagers(config);
  }

  /**
   * 初始化管理器
   */
  private async initializeManagers(config: DatabaseConfig): Promise<void> {
    const connectionInfo = connectionManager.getConnection(this.connectionId);

    if (connectionInfo && connectionInfo.connection) {
      const connection = connectionInfo.connection as {
        query<T = unknown>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
        collection(name: string): { indexes(): Promise<unknown[]>; explain(pipeline: unknown[]): Promise<unknown> };
        listCollections?(): { toArray(): Promise<{ name: string }[]> };
      };
      this.indexManager = new IndexManager(connection, config);
      this.queryAnalyzer = new QueryAnalyzer(connection, config);
      this.slowQueryMonitor = new SlowQueryMonitor(connection, config, {
        enabled: true,
        threshold: 1000,
        enableAlerts: true,
      });
    }
  }

  /**
   * 迁移 localStorage 数据到数据库
   */
  public async migrateLocalStorage(): Promise<void> {
    if (!this.syncConfig.autoMigrate) {
      return;
    }

    const connection = connectionManager.getConnection(this.connectionId);
    if (!connection) {
      throw new Error("Database connection not found");
    }

    try {
      await this.migrateModels();
      await this.migrateAgents();
      await this.migrateNodes();

      console.info("LocalStorage migration completed successfully");
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }

  /**
   * 迁移模型数据
   */
  private async migrateModels(): Promise<void> {
    const models = this.loadFromLocalStorage<Model>("yyc3_db_models", []);
    if (models.length === 0) {
      return;
    }

    await this.executeWithCache(
      "CREATE TABLE IF NOT EXISTS models (id TEXT PRIMARY KEY, name TEXT, provider TEXT, tier TEXT, avg_latency_ms INTEGER, throughput INTEGER, created_at TEXT)",
      []
    );

    for (const model of models) {
      await this.executeWithCache(
        "INSERT OR REPLACE INTO models (id, name, provider, tier, avg_latency_ms, throughput, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [model.id, model.name, model.provider, model.tier, model.avg_latency_ms, model.throughput, model.created_at]
      );
    }
  }

  /**
   * 迁移 Agent 数据
   */
  private async migrateAgents(): Promise<void> {
    const agents = this.loadFromLocalStorage<Agent>("yyc3_db_agents", []);
    if (agents.length === 0) {
      return;
    }

    await this.executeWithCache(
      "CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, name TEXT, name_cn TEXT, role TEXT, description TEXT, is_active INTEGER)",
      []
    );

    for (const agent of agents) {
      await this.executeWithCache(
        "INSERT OR REPLACE INTO agents (id, name, name_cn, role, description, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [agent.id, agent.name, agent.name_cn, agent.role, agent.description, agent.is_active ? 1 : 0]
      );
    }
  }

  /**
   * 迁移节点数据
   */
  private async migrateNodes(): Promise<void> {
    const nodes = this.loadFromLocalStorage<NodeStatusRecord>("yyc3_db_nodes", []);
    if (nodes.length === 0) {
      return;
    }

    await this.executeWithCache(
      "CREATE TABLE IF NOT EXISTS nodes (id TEXT PRIMARY KEY, hostname TEXT, gpu_util INTEGER, mem_util INTEGER, temp_celsius INTEGER, model_deployed TEXT, active_tasks INTEGER, status TEXT)",
      []
    );

    for (const node of nodes) {
      await this.executeWithCache(
        "INSERT OR REPLACE INTO nodes (id, hostname, gpu_util, mem_util, temp_celsius, model_deployed, active_tasks, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [node.id, node.hostname, node.gpu_util, node.mem_util, node.temp_celsius, node.model_deployed, node.active_tasks, node.status]
      );
    }
  }

  /**
   * 从 localStorage 加载数据
   */
  private loadFromLocalStorage<T>(key: string, defaults: T[]): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return defaults;
  }

  /**
   * 执行查询（带缓存）
   */
  public async executeWithCache<T = unknown>(
    sql: string,
    params: QueryParams = []
  ): Promise<QueryResult<T>> {
    const cached = this.queryCache.get<T>(sql, params);
    if (cached) {
      return cached;
    }

    const result = await this.executeQuery<T>(sql, params);
    this.queryCache.set(sql, result, params);

    return result;
  }

  /**
   * 执行查询
   */
  private async executeQuery<T = unknown>(
    sql: string,
    params: QueryParams = []
  ): Promise<QueryResult<T>> {
    const connection = connectionManager.getConnection(this.connectionId);
    if (!connection) {
      throw new Error("Database connection not found");
    }

    if (this.slowQueryMonitor) {
      return this.slowQueryMonitor.monitorQuery(sql, async () => {
        return this.executeRawQuery(sql, params);
      });
    }

    return this.executeRawQuery(sql, params);
  }

  /**
   * 执行原始查询
   */
  private async executeRawQuery<T = unknown>(
    sql: string,
    params: QueryParams = []
  ): Promise<QueryResult<T>> {
    const connection = connectionManager.getConnection(this.connectionId);
    if (!connection) {
      throw new Error("Database connection not found");
    }

    const dbConnection = (connection as { connection?: { query: (sql: string, params: QueryParams) => Promise<QueryResult<T>> } }).connection;
    if (!dbConnection) {
      throw new Error("Database connection object not found");
    }

    const startTime = Date.now();

    try {
      const result = await dbConnection.query(sql, params);
      const executionTime = Date.now() - startTime;

      return {
        rows: result.rows || [],
        rowCount: result.rowCount || 0,
        fields: result.fields,
        executionTime,
      };
    } catch (error) {
      const _executionTime = Date.now() - startTime;
      throw new Error(`Query failed: ${error}`);
    }
  }

  /**
   * 获取模型列表
   */
  public async getModels(): Promise<Model[]> {
    const result = await this.executeWithCache<Model>("SELECT * FROM models");
    return result.rows;
  }

  /**
   * 获取 Agent 列表
   */
  public async getAgents(): Promise<Agent[]> {
    const result = await this.executeWithCache<Omit<Agent, 'is_active'> & { is_active: number }>("SELECT * FROM agents");
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      name_cn: row.name_cn,
      role: row.role,
      description: row.description,
      is_active: row.is_active === 1,
    }));
  }

  /**
   * 获取节点列表
   */
  public async getNodes(): Promise<NodeStatusRecord[]> {
    const result = await this.executeWithCache<NodeStatusRecord>("SELECT * FROM nodes");
    return result.rows;
  }

  /**
   * 添加模型
   */
  public async addModel(model: Omit<Model, "id">): Promise<Model> {
    const newModel: Model = { ...model, id: `m-${Date.now()}` };
    await this.executeWithCache(
      "INSERT INTO models (id, name, provider, tier, avg_latency_ms, throughput, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [newModel.id, newModel.name, newModel.provider, newModel.tier, newModel.avg_latency_ms, newModel.throughput, newModel.created_at]
    );

    this.queryCache.deleteByTable("models");
    this.trackChange("models", newModel as unknown as Record<string, unknown>);

    return newModel;
  }

  /**
   * 更新模型
   */
  public async updateModel(id: string, updates: Partial<Model>): Promise<Model | null> {
    const models = await this.getModels();
    const idx = models.findIndex((m) => m.id === id);
    if (idx < 0) {
      return null;
    }

    const updatedModel = { ...models[idx], ...updates };
    await this.executeWithCache(
      "UPDATE models SET name = ?, provider = ?, tier = ?, avg_latency_ms = ?, throughput = ?, created_at = ? WHERE id = ?",
      [updatedModel.name, updatedModel.provider, updatedModel.tier, updatedModel.avg_latency_ms, updatedModel.throughput, updatedModel.created_at, id]
    );

    this.queryCache.deleteByTable("models");
    this.trackChange("models", updatedModel as unknown as Record<string, unknown>);

    return updatedModel;
  }

  /**
   * 删除模型
   */
  public async deleteModel(id: string): Promise<boolean> {
    await this.executeWithCache("DELETE FROM models WHERE id = ?", [id]);
    this.queryCache.deleteByTable("models");
    this.trackChange("models", { id, deleted: true } as Record<string, unknown>);

    return true;
  }

  /**
   * 同步数据
   */
  public async sync(): Promise<void> {
    if (!this.syncConfig.enabled || this.syncStatus.isSyncing) {
      return;
    }

    this.syncStatus.isSyncing = true;

    try {
      await this.applyPendingChanges();
      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.pendingChanges = 0;
    } catch (error) {
      this.syncStatus.lastError = error instanceof Error ? error.message : String(error);
      console.error("Sync failed:", error);
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * 应用待处理的更改
   */
  private async applyPendingChanges(): Promise<void> {
    for (const [key, value] of this.pendingChanges) {
      const [table, id] = key.split(":");

      if ((value as Record<string, unknown>).deleted) {
        await this.executeWithCache(`DELETE FROM ${table} WHERE id = ?`, [id]);
      } else {
        await this.executeWithCache(
          `INSERT OR REPLACE INTO ${table} VALUES (${Object.keys(value).map(() => "?").join(", ")})`,
          Object.values(value)
        );
      }
    }

    this.pendingChanges.clear();
  }

  /**
   * 跟踪更改
   */
  private trackChange(table: string, data: Record<string, unknown>): void {
    const key = `${table}:${data.id as string}`;
    this.pendingChanges.set(key, data);
    this.syncStatus.pendingChanges = this.pendingChanges.size;
  }

  /**
   * 获取同步状态
   */
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * 启动自动同步
   */
  public startAutoSync(): void {
    if (this.syncTimer) {
      return;
    }

    this.syncTimer = setInterval(() => {
      this.sync();
    }, this.syncConfig.syncInterval);
  }

  /**
   * 停止自动同步
   */
  public stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * 更新同步配置
   */
  public updateSyncConfig(config: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };

    if (config.syncInterval !== undefined && this.syncTimer) {
      this.stopAutoSync();
      this.startAutoSync();
    }
  }

  /**
   * 获取查询缓存统计
   */
  public getCacheStats() {
    return this.queryCache.getStats();
  }

  /**
   * 获取慢查询统计
   */
  public getSlowQueryStats() {
    if (!this.slowQueryMonitor) {
      return null;
    }
    return this.slowQueryMonitor.getStats();
  }

  /**
   * 分析查询
   */
  public async analyzeQuery(query: string) {
    if (!this.queryAnalyzer) {
      return null;
    }
    return this.queryAnalyzer.analyzeQuery(query);
  }

  /**
   * 销毁适配器
   */
  public destroy(): void {
    this.stopAutoSync();
    this.queryCache.destroy();

    if (this.slowQueryMonitor) {
      this.slowQueryMonitor.destroy();
    }

    this.pendingChanges.clear();
  }
}
