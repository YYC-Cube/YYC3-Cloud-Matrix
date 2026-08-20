/**
 * @file: log-slice.test.ts
 * @description: YYC³ Log Slice 单元测试 · 覆盖 CRUD、过滤、持久化策略
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useLogSlice } from '../../store/slices/log-slice';
import type { StoredLogEntry } from '../../types';

const DEFAULT_LOGS: StoredLogEntry[] = [
  { id: "log-001", timestamp: Date.now() - 120000, level: "info", source: "GPU-A100-01", message: "推理任务完成 #12847, 延迟 820ms" },
  { id: "log-002", timestamp: Date.now() - 240000, level: "info", source: "GPU-A100-03", message: "模型缓存命中 LLaMA-70B, 跳过加载" },
  { id: "log-003", timestamp: Date.now() - 360000, level: "warn", source: "GPU-A100-03", message: "GPU 温度接近阈值 78°C > 75°C" },
  { id: "log-004", timestamp: Date.now() - 480000, level: "error", source: "GPU-H100-01", message: "推理超时 task #12853, 超过 5000ms" },
  { id: "log-005", timestamp: Date.now() - 600000, level: "info", source: "system", message: "批次处理完成 batch_size=32, tokens=4096" },
  { id: "log-006", timestamp: Date.now() - 720000, level: "warn", source: "GPU-A100-03", message: "内存使用率 89%, 建议清理缓存" },
  { id: "log-007", timestamp: Date.now() - 840000, level: "debug", source: "scheduler", message: "WebSocket 心跳 ack, 延迟 12ms" },
  { id: "log-008", timestamp: Date.now() - 960000, level: "info", source: "system", message: "自动巡查完成, 健康度 96%" },
];

beforeEach(() => {
  // 重置到默认日志（避免状态污染）
  useLogSlice.setState({ logs: [...DEFAULT_LOGS] });
});

describe('useLogSlice', () => {
  // ---------- 初始化 ----------
  describe('初始化', () => {
    it('应该有默认日志数据', () => {
      const { logs } = useLogSlice.getState();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('每条日志都应该有必需的字段', () => {
      const { logs } = useLogSlice.getState();
      const log = logs[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('level');
      expect(log).toHaveProperty('source');
      expect(log).toHaveProperty('message');
    });
  });

  // ---------- CRUD 操作 ----------
  describe('CRUD 操作', () => {
    it('addLog 应该添加新日志并自动生成 ID', () => {
      const newEntry = {
        timestamp: Date.now(),
        level: "info" as const,
        source: "test",
        message: "测试日志消息",
      };

      useLogSlice.getState().addLog(newEntry);

      const { logs } = useLogSlice.getState();
      expect(logs.length).toBeGreaterThan(0);
      const added = logs.find((l) => l.message === "测试日志消息");
      expect(added).toBeDefined();
      expect(added?.id).toMatch(/^log-/);
    });

    it('addLog 应该支持不同日志级别', () => {
      const levels: Array<StoredLogEntry['level']> = ["debug", "info", "warn", "error"];

      levels.forEach((level) => {
        useLogSlice.getState().addLog({
          timestamp: Date.now(),
          level,
          source: "test",
          message: `${level} 日志`,
        });
      });

      const { logs } = useLogSlice.getState();
      levels.forEach((level) => {
        expect(logs.some((l) => l.level === level && l.message === `${level} 日志`)).toBe(true);
      });
    });

    it('updateLog 应该更新指定日志', () => {
      const { logs } = useLogSlice.getState();
      if (logs.length === 0) return;
      const targetId = logs[0].id;

      useLogSlice.getState().updateLog(targetId, { message: "已更新的消息", level: "error" });

      const updatedLogs = useLogSlice.getState().logs;
      const updated = updatedLogs.find((l) => l.id === targetId);
      expect(updated?.message).toBe("已更新的消息");
      expect(updated?.level).toBe("error");
    });

    it('removeLog 应该删除指定日志', () => {
      const { logs } = useLogSlice.getState();
      if (logs.length === 0) return;
      const targetId = logs[0].id;

      useLogSlice.getState().removeLog(targetId);

      const { logs: remaining } = useLogSlice.getState();
      expect(remaining.find((l) => l.id === targetId)).toBeUndefined();
    });

    it('clearLogs 应该清空所有日志', () => {
      useLogSlice.getState().clearLogs();

      const { logs } = useLogSlice.getState();
      expect(logs).toHaveLength(0);
    });
  });

  // ---------- 过滤功能 ----------
  describe('getLogsByLevel', () => {
    beforeEach(() => {
      useLogSlice.setState({ logs: [] });
      useLogSlice.getState().addLog({ timestamp: Date.now(), level: "debug", source: "src", message: "debug msg" });
      useLogSlice.getState().addLog({ timestamp: Date.now(), level: "info", source: "src", message: "info msg" });
      useLogSlice.getState().addLog({ timestamp: Date.now(), level: "warn", source: "src", message: "warn msg" });
      useLogSlice.getState().addLog({ timestamp: Date.now(), level: "error", source: "src", message: "error msg" });
      useLogSlice.getState().addLog({ timestamp: Date.now(), level: "info", source: "src", message: "another info" });
    });

    it('应该只返回指定级别的日志', () => {
      const errorLogs = useLogSlice.getState().getLogsByLevel("error");
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].message).toBe("error msg");
    });

    it('应该返回多个同级别的日志', () => {
      const infoLogs = useLogSlice.getState().getLogsByLevel("info");
      expect(infoLogs).toHaveLength(2);
    });

    it('不存在的级别应该返回空数组', () => {
      const fatalLogs = useLogSlice.getState().getLogsByLevel("fatal" as any);
      expect(fatalLogs).toHaveLength(0);
    });
  });

  // ---------- 边界条件 ----------
  describe('边界条件', () => {
    it('updateLog 不存在的 ID 不应该报错', () => {
      expect(() => {
        useLogSlice.getState().updateLog("non-existent", { message: "test" });
      }).not.toThrow();
    });

    it('removeLog 不存在的 ID 不应该报错', () => {
      expect(() => {
        useLogSlice.getState().removeLog("non-existent");
      }).not.toThrow();
    });

    it('空状态下 clearLogs 不应该报错', () => {
      useLogSlice.setState({ logs: [] });
      expect(() => {
        useLogSlice.getState().clearLogs();
      }).not.toThrow();
    });

    it('应该按时间顺序保留日志（最新的在最后）', () => {
      useLogSlice.setState({ logs: [] });
      const time1 = Date.now();
      const time2 = time1 + 1000;

      useLogSlice.getState().addLog({ timestamp: time1, level: "info", source: "s", message: "first" });
      useLogSlice.getState().addLog({ timestamp: time2, level: "info", source: "s", message: "second" });

      const { logs } = useLogSlice.getState();
      expect(logs[0].timestamp).toBeLessThan(logs[logs.length - 1].timestamp);
    });
  });
});
