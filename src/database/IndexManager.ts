/**
 * @file: IndexManager.ts
 * @description: IndexManager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type {
  IndexInfo,
  IndexRecommendation,
  IndexUsageStats,
  DatabaseConfig,
  QueryResult,
  QueryParams,
} from "./types";

interface MySQLIndexRow {
  Key_name: string;
  Table: string;
  Column_name: string;
  Non_unique: number;
}

interface _PostgresIndexRow {
  indexname: string;
  tablename: string;
  indexdef: string;
}

interface _PostgresIndexStatsRow {
  indexrelname: string;
  relname: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  pg_relation_size: number;
}

interface _MySQLIndexStatsRow {
  INDEX_NAME: string;
  TABLE_NAME: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  index_size: number;
}

interface Connection {
  query<T = unknown>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
  collection?(name: string): { indexes(): Promise<unknown[]> };
  listCollections?(): { toArray(): Promise<{ name: string }[]> };
}

export class IndexManager {
  private connection: Connection;
  private config: DatabaseConfig;

  constructor(connection: Connection, config: DatabaseConfig) {
    this.connection = connection;
    this.config = config;
  }

  /**
   * 获取表的所有索引
   */
  public async getTableIndexes(tableName: string): Promise<IndexInfo[]> {
    if (this.config.type === "postgresql") {
      return this.getPostgresIndexes(tableName);
    } else if (this.config.type === "mysql") {
      return this.getMySQLIndexes(tableName);
    } else if (this.config.type === "mongodb") {
      return this.getMongoDBIndexes(tableName);
    }
    return [];
  }

  /**
   * 获取所有索引
   */
  public async getAllIndexes(): Promise<IndexInfo[]> {
    if (this.config.type === "postgresql") {
      return this.getAllPostgresIndexes();
    } else if (this.config.type === "mysql") {
      return this.getAllMySQLIndexes();
    } else if (this.config.type === "mongodb") {
      return this.getAllMongoDBIndexes();
    }
    return [];
  }

  /**
   * 创建索引
   */
  public async createIndex(
    tableName: string,
    columns: string[],
    options: {
      unique?: boolean;
      name?: string;
      type?: "btree" | "hash" | "gin" | "gist";
    } = {}
  ): Promise<void> {
    const indexName = options.name || `idx_${tableName}_${columns.join("_")}`;
    const unique = options.unique ? "UNIQUE " : "";
    const type = options.type ? ` USING ${options.type.toUpperCase()}` : "";

    const sql = `CREATE ${unique}INDEX IF NOT EXISTS ${indexName} ON ${tableName}${type} (${columns.join(", ")})`;

    await this.executeQuery(sql);
  }

  /**
   * 删除索引
   */
  public async dropIndex(indexName: string): Promise<void> {
    const sql = `DROP INDEX IF EXISTS ${indexName}`;
    await this.executeQuery(sql);
  }

  /**
   * 重建索引
   */
  public async rebuildIndex(indexName: string): Promise<void> {
    if (this.config.type === "postgresql") {
      await this.executeQuery(`REINDEX INDEX ${indexName}`);
    } else if (this.config.type === "mysql") {
      await this.executeQuery(`ALTER TABLE ${indexName} DROP INDEX ${indexName}`);
      await this.executeQuery(`ALTER TABLE ${indexName} ADD INDEX ${indexName}`);
    }
  }

  /**
   * 分析索引使用情况
   */
  public async analyzeIndexUsage(): Promise<IndexUsageStats[]> {
    if (this.config.type === "postgresql") {
      return this.analyzePostgresIndexUsage();
    } else if (this.config.type === "mysql") {
      return this.analyzeMySQLIndexUsage();
    }
    return [];
  }

  /**
   * 推荐索引
   */
  public async recommendIndexes(
    queries: string[],
    options: {
      minBenefit?: number;
      maxRecommendations?: number;
    } = {}
  ): Promise<IndexRecommendation[]> {
    const minBenefit = options.minBenefit || 50;
    const maxRecommendations = options.maxRecommendations || 10;

    const recommendations: IndexRecommendation[] = [];

    for (const query of queries) {
      const queryRecommendations = await this.analyzeQueryForIndex(query);
      recommendations.push(...queryRecommendations);
    }

    return recommendations
      .filter((rec) => rec.estimatedBenefit >= minBenefit)
      .sort((a, b) => b.estimatedBenefit - a.estimatedBenefit)
      .slice(0, maxRecommendations);
  }

  /**
   * 分析查询以推荐索引
   */
  private async analyzeQueryForIndex(query: string): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = [];

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("where")) {
      const whereMatch = lowerQuery.match(/where\s+([^;]+)/i);
      if (whereMatch) {
        const conditions = whereMatch[1].split(/\s+and\s+|\s+or\s+/i);
        for (const condition of conditions) {
          const columnMatch = condition.match(/(\w+)\s*[=<>!]/);
          if (columnMatch) {
            recommendations.push({
              tableName: this.extractTableName(query),
              columns: [columnMatch[1]],
              reason: "WHERE clause filter",
              estimatedBenefit: 70,
              type: "btree",
            });
          }
        }
      }
    }

    if (lowerQuery.includes("order by")) {
      const orderByMatch = lowerQuery.match(/order\s+by\s+([^;\s]+)/i);
      if (orderByMatch) {
        recommendations.push({
          tableName: this.extractTableName(query),
          columns: [orderByMatch[1]],
          reason: "ORDER BY clause",
          estimatedBenefit: 60,
          type: "btree",
        });
      }
    }

    if (lowerQuery.includes("join")) {
      const joinMatches = lowerQuery.matchAll(/join\s+(\w+)\s+on\s+(\w+)\.(\w+)/gi);
      for (const match of joinMatches) {
        recommendations.push({
          tableName: match[1],
          columns: [match[3]],
          reason: "JOIN condition",
          estimatedBenefit: 80,
          type: "btree",
        });
      }
    }

    return recommendations;
  }

  /**
   * 提取表名
   */
  private extractTableName(query: string): string {
    const fromMatch = query.match(/from\s+(\w+)/i);
    if (fromMatch) {
      return fromMatch[1];
    }
    return "";
  }

  /**
   * 执行查询
   */
  private async executeQuery<T = unknown>(sql: string, params: QueryParams = []): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await this.connection.query<T>(sql, params);
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
   * PostgreSQL 索引查询
   */
  private async getPostgresIndexes(tableName: string): Promise<IndexInfo[]> {
    const sql = `
      SELECT
        i.relname as name,
        t.relname as table_name,
        array_agg(a.attname ORDER BY k.n) as columns,
        ix.indisunique as unique,
        pg_relation_size(i.oid) as size,
        COALESCE(idx_scan, 0) as usage
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      CROSS JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, n)
      LEFT JOIN pg_stat_user_indexes ON indexrelid = i.oid
      WHERE t.relname = $1
      GROUP BY i.relname, t.relname, ix.indisunique, idx_scan, i.oid
    `;

    const result = await this.executeQuery(sql, [tableName]);

    return result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        name: r.name as string,
        tableName: r.table_name as string,
        columns: r.columns as string[],
        unique: Boolean(r.unique),
        size: (r.size as number) || 0,
        usage: (r.usage as number) || 0,
      };
    });
  }

  /**
   * PostgreSQL 所有索引
   */
  private async getAllPostgresIndexes(): Promise<IndexInfo[]> {
    const sql = `
      SELECT
        i.relname as name,
        t.relname as table_name,
        array_agg(a.attname ORDER BY k.n) as columns,
        ix.indisunique as unique,
        pg_relation_size(i.oid) as size,
        COALESCE(idx_scan, 0) as usage
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      CROSS JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, n)
      LEFT JOIN pg_stat_user_indexes ON indexrelid = i.oid
      GROUP BY i.relname, t.relname, ix.indisunique, idx_scan, i.oid
    `;

    const result = await this.executeQuery(sql);

    return result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        name: r.name as string,
        tableName: r.table_name as string,
        columns: r.columns as string[],
        unique: Boolean(r.unique),
        size: (r.size as number) || 0,
        usage: (r.usage as number) || 0,
      };
    });
  }

  /**
   * PostgreSQL 索引使用分析
   */
  private async analyzePostgresIndexUsage(): Promise<IndexUsageStats[]> {
    const sql = `
      SELECT
        s.indexrelname as index_name,
        s.relname as table_name,
        COALESCE(s.idx_scan, 0) as scans,
        COALESCE(s.idx_tup_read, 0) as tuples_read,
        COALESCE(s.idx_tup_fetch, 0) as tuples_fetched,
        pg_stat_get_last_autoanalyze_time(s.indexrelid) as last_used,
        pg_relation_size(s.indexrelid) as size
      FROM pg_stat_user_indexes s
      ORDER BY s.idx_scan DESC
    `;

    const result = await this.executeQuery(sql);

    return result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        indexName: r.index_name as string,
        tableName: r.table_name as string,
        scans: (r.scans as number) || 0,
        tuplesRead: (r.tuples_read as number) || 0,
        tuplesFetched: (r.tuples_fetched as number) || 0,
        lastUsed: r.last_used as unknown as number,
        size: (r.size as number) || 0,
      };
    });
  }

  /**
   * MySQL 索引查询
   */
  private async getMySQLIndexes(tableName: string): Promise<IndexInfo[]> {
    const sql = `SHOW INDEX FROM ${tableName}`;
    const result = await this.executeQuery<MySQLIndexRow>(sql);

    const indexMap = new Map<string, IndexInfo>();

    for (const row of result.rows) {
      const indexName = row.Key_name;
      if (!indexMap.has(indexName)) {
        indexMap.set(indexName, {
          name: indexName,
          tableName: row.Table,
          columns: [],
          unique: row.Non_unique === 0,
          size: 0,
          usage: 0,
        });
      }

      const index = indexMap.get(indexName)!;
      index.columns.push(row.Column_name);
    }

    return Array.from(indexMap.values());
  }

  /**
   * MySQL 所有索引
   */
  private async getAllMySQLIndexes(): Promise<IndexInfo[]> {
    const tablesResult = await this.executeQuery<Record<string, string>>("SHOW TABLES");

    const allIndexes: IndexInfo[] = [];

    for (const row of tablesResult.rows) {
      const tableName = Object.values(row)[0];
      const indexes = await this.getMySQLIndexes(tableName);
      allIndexes.push(...indexes);
    }

    return allIndexes;
  }

  /**
   * MySQL 索引使用分析
   */
  private async analyzeMySQLIndexUsage(): Promise<IndexUsageStats[]> {
    const sql = `
      SELECT
        table_name,
        index_name,
        rows_read as scans,
        0 as tuples_read,
        0 as tuples_fetched,
        0 as last_used,
        0 as size
      FROM performance_schema.table_io_waits_summary_by_index_usage
      WHERE index_name IS NOT NULL
      ORDER BY rows_read DESC
    `;

    const result = await this.executeQuery(sql);

    return result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        indexName: r.index_name as string,
        tableName: r.table_name as string,
        scans: (r.scans as number) || 0,
        tuplesRead: (r.tuples_read as number) || 0,
        tuplesFetched: (r.tuples_fetched as number) || 0,
        lastUsed: r.last_used as unknown as number,
        size: (r.size as number) || 0,
      };
    });
  }

  /**
   * MongoDB 索引查询
   */
  private async getMongoDBIndexes(collectionName: string): Promise<IndexInfo[]> {
    if (!this.connection.collection) {
      return [];
    }
    const collection = this.connection.collection(collectionName);
    const indexes = await collection.indexes();

    return indexes.map((idx) => {
      const index = idx as { name: string; key: Record<string, unknown>; unique?: boolean };
      return {
        name: index.name,
        tableName: collectionName,
        columns: Object.keys(index.key),
        unique: index.unique || false,
        size: 0,
        usage: 0,
      };
    });
  }

  /**
   * MongoDB 所有索引
   */
  private async getAllMongoDBIndexes(): Promise<IndexInfo[]> {
    if (!this.connection.listCollections) {
      return [];
    }
    const collections = await this.connection.listCollections().toArray();
    const allIndexes: IndexInfo[] = [];

    for (const collection of collections) {
      const indexes = await this.getMongoDBIndexes(collection.name);
      allIndexes.push(...indexes);
    }

    return allIndexes;
  }
}
