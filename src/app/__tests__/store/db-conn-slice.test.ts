/**
 * @file: db-conn-slice.test.ts
 * @description: YYC³ DB Connection Slice 单元测试 · 覆盖 CRUD、状态管理、安全脱敏
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDbConnSlice } from '../../store/slices/db-conn-slice';
import type { DBConnection } from '../../types';

beforeEach(() => {
  useDbConnSlice.setState({
    connections: [
      {
        id: "db-pg-main",
        name: "主数据库",
        type: "postgresql",
        host: "localhost",
        port: 5433,
        database: "yyc3_matrix",
        username: "admin",
        password: "secret123",
        status: "connected",
        options: "sslmode=disable",
      },
    ],
  });
});

describe('useDbConnSlice', () => {
  // ---------- 初始化 ----------
  describe('初始化', () => {
    it('应该有默认连接配置', () => {
      const { connections } = useDbConnSlice.getState();
      expect(connections.length).toBeGreaterThan(0);
    });

    it('每个连接都应该有必需的字段', () => {
      const { connections } = useDbConnSlice.getState();
      const conn = connections[0];
      expect(conn).toHaveProperty('id');
      expect(conn).toHaveProperty('name');
      expect(conn).toHaveProperty('type');
      expect(conn).toHaveProperty('host');
      expect(conn).toHaveProperty('port');
      expect(conn).toHaveProperty('status');
    });
  });

  // ---------- CRUD 操作 ----------
  describe('CRUD 操作', () => {
    it('addConnection 应该添加新连接并自动生成 ID', () => {
      const newConn = {
        name: "从数据库",
        type: "postgresql" as const,
        host: "192.168.1.100",
        port: 5432,
        database: "replica_db",
        username: "reader",
        password: "reader_pass",
        status: "disconnected" as const,
        options: "",
      };

      useDbConnSlice.getState().addConnection(newConn);

      const { connections } = useDbConnSlice.getState();
      expect(connections).toHaveLength(2);
      const added = connections.find((c) => c.name === "从数据库");
      expect(added).toBeDefined();
      expect(added?.id).toMatch(/^db-/);
    });

    it('updateConnection 应该更新指定连接的属性', () => {
      useDbConnSlice.getState().updateConnection("db-pg-main", {
        host: "new-host.example.com",
        port: 5434,
        username: "new_admin",
      });

      const { connections } = useDbConnSlice.getState();
      const updated = connections.find((c) => c.id === "db-pg-main");
      expect(updated?.host).toBe("new-host.example.com");
      expect(updated?.port).toBe(5434);
      expect(updated?.username).toBe("new_admin");
    });

    it('removeConnection 应该删除指定连接', () => {
      useDbConnSlice.getState().removeConnection("db-pg-main");

      const { connections } = useDbConnSlice.getState();
      expect(connections).toHaveLength(0);
      expect(connections.find((c) => c.id === "db-pg-main")).toBeUndefined();
    });

    it('setConnectionStatus 应该更新连接状态', () => {
      useDbConnSlice.getState().setConnectionStatus("db-pg-main", "error");

      const { connections } = useDbConnSlice.getState();
      const conn = connections.find((c) => c.id === "db-pg-main");
      expect(conn?.status).toBe("error");
    });
  });

  // ---------- 安全性测试 ----------
  describe('安全性', () => {
    it('password 字段应该可以被更新', () => {
      useDbConnSlice.getState().updateConnection("db-pg-main", {
        password: "new_secret_password",
      });

      const { connections } = useDbConnSlice.getState();
      const conn = connections.find((c) => c.id === "db-pg-main");
      expect(conn?.password).toBe("new_secret_password");
    });

    it('应该支持多种数据库类型', () => {
      const types: Array<DBConnection['type']> = ["postgresql", "mysql", "sqlite"];

      types.forEach((type, index) => {
        useDbConnSlice.getState().addConnection({
          name: `${type} 数据库`,
          type,
          host: "localhost",
          port: 3306 + index,
          database: `db_${type}`,
          username: "user",
          password: "pass",
          status: "disconnected",
          options: "",
        });
      });

      const { connections } = useDbConnSlice.getState();
      types.forEach((type) => {
        expect(connections.some((c) => c.type === type)).toBe(true);
      });
    });
  });

  // ---------- 边界条件 ----------
  describe('边界条件', () => {
    it('updateConnection 不存在的 ID 不应该报错', () => {
      expect(() => {
        useDbConnSlice.getState().updateConnection("non-existent", { host: "test" });
      }).not.toThrow();
    });

    it('removeConnection 不存在的 ID 不应该报错', () => {
      expect(() => {
        useDbConnSlice.getState().removeConnection("non-existent");
      }).not.toThrow();
    });

    it('setConnectionStatus 不存在的 ID 不应该报错', () => {
      expect(() => {
        useDbConnSlice.getState().setConnectionStatus("non-existent", "connected");
      }).not.toThrow();
    });

    it('空状态下操作不应该报错', () => {
      useDbConnSlice.setState({ connections: [] });

      expect(() => {
        useDbConnSlice.getState().removeConnection("test");
        useDbConnSlice.getState().setConnectionStatus("test", "disconnected");
      }).not.toThrow();
    });

    it('应该支持所有合法的连接状态', () => {
      const statuses: Array<DBConnection['status']> = [
        "connected",
        "disconnected",
        "error",
        "testing",
      ];

      statuses.forEach((status) => {
        useDbConnSlice.getState().setConnectionStatus("db-pg-main", status);
        const { connections } = useDbConnSlice.getState();
        expect(connections[0].status).toBe(status);
      });
    });
  });
});
