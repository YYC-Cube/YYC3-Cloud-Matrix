/**
 * @file: db-conn-slice.ts
 * @description: 数据库连接 + 连接池配置 + SQL 历史 Zustand Slice
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[database]
 *
 * @brief: 数据库连接管理 + 连接池配置 + SQL 历史统一 Store
 *
 * @details:
 * - v2: 合并 yyc3_db_pool_config + yyc3_sql_history 两个 localStorage 键
 * - partialize 仅持久化 connections (去密码) + poolConfig + sqlHistory
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DBConnection } from '../../types';
import { migrateKeyWithMerge, migrateKeyAsArray } from '../../lib/migrate-storage';

// ============================================================
// 类型定义
// ============================================================

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeoutMs: number;
  acquireTimeoutMs: number;
  maxRetries: number;
  healthCheckIntervalMs: number;
  enableAutoScale: boolean;
  enableHealthCheck: boolean;
}

// ============================================================
// 默认值
// ============================================================

const DEFAULT_CONNECTIONS: DBConnection[] = [
  {
    id: "db-pg-main",
    name: "主数据库 (PostgreSQL)",
    type: "postgresql",
    host: "localhost",
    port: 5433,
    database: "yyc3_matrix",
    username: "admin",
    password: "",
    status: "disconnected",
    options: "sslmode=disable",
  },
];

const DEFAULT_POOL_CONFIG: PoolConfig = {
  minConnections: 2,
  maxConnections: 10,
  idleTimeoutMs: 30000,
  acquireTimeoutMs: 5000,
  maxRetries: 3,
  healthCheckIntervalMs: 60000,
  enableAutoScale: true,
  enableHealthCheck: true,
};

// ============================================================
// Slice Interface
// ============================================================

interface DbConnSlice {
  // 数据域
  connections: DBConnection[];
  poolConfig: PoolConfig;
  sqlHistory: string[];

  // 连接操作
  addConnection: (conn: Omit<DBConnection, 'id'>) => void;
  updateConnection: (id: string, updates: Partial<DBConnection>) => void;
  removeConnection: (id: string) => void;
  setConnectionStatus: (id: string, status: DBConnection['status']) => void;

  // 连接池操作
  setPoolConfig: (config: Partial<PoolConfig>) => void;
  resetPoolConfig: () => void;

  // SQL 历史操作
  addSqlHistory: (sql: string) => void;
  clearSqlHistory: () => void;
}

// ============================================================
// Store
// ============================================================

export const useDbConnSlice = create<DbConnSlice>()(
  persist(
    (set) => ({
      connections: DEFAULT_CONNECTIONS,
      poolConfig: DEFAULT_POOL_CONFIG,
      sqlHistory: [],

      // 连接操作
      addConnection: (conn) => set((s) => ({
        connections: [...s.connections, { ...conn, id: `db-${Date.now()}` }],
      })),
      updateConnection: (id, updates) => set((s) => ({
        connections: s.connections.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      removeConnection: (id) => set((s) => ({
        connections: s.connections.filter((c) => c.id !== id),
      })),
      setConnectionStatus: (id, status) => set((s) => ({
        connections: s.connections.map((c) => c.id === id ? { ...c, status } : c),
      })),

      // 连接池操作
      setPoolConfig: (updates) => set((s) => ({
        poolConfig: { ...s.poolConfig, ...updates },
      })),
      resetPoolConfig: () => set({ poolConfig: { ...DEFAULT_POOL_CONFIG } }),

      // SQL 历史操作 (cap at 20)
      addSqlHistory: (sql) => set((s) => ({
        sqlHistory: [sql, ...s.sqlHistory.filter((h) => h !== sql)].slice(0, 20),
      })),
      clearSqlHistory: () => set({ sqlHistory: [] }),
    }),
    {
      name: 'yyc3-db-conn-slice',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        connections: state.connections.map(({ password: _password, ...rest }) => rest),
        poolConfig: state.poolConfig,
        sqlHistory: state.sqlHistory,
      }),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyDbStorage(): boolean {
  let migrated = false;
  migrated = migrateKeyWithMerge('yyc3_db_pool_config', DEFAULT_POOL_CONFIG, (v) => useDbConnSlice.getState().setPoolConfig(v)) || migrated;
  migrated = migrateKeyAsArray<string>('yyc3_sql_history', (v) => useDbConnSlice.setState({ sqlHistory: v })) || migrated;
  return migrated;
}
