/**
 * @file: app-slice.test.ts
 * @description: YYC³ App Slice 单元测试 · 运行时状态
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-17
 * @status: active
 * @tags: [store],[slice],[test]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppSlice } from '../../store/slices/app-slice';
import type { AlertData } from '../../types';
import type { RecentOpEntry } from '../../store/slices/app-slice';

describe('useAppSlice', () => {
  const mockAlert: AlertData = {
    id: 'alert-001',
    level: 'warning' as any,
    message: 'This is a test alert',
    source: 'test',
    timestamp: Date.now(),
  };

  beforeEach(() => {
    useAppSlice.getState().clearAlerts();
    useAppSlice.getState().clearRecentOps();
    useAppSlice.getState().setCommandPaletteOpen(false);
  });

  describe('初始状态', () => {
    it('commandPaletteOpen 默认值应该是 false', () => {
      expect(useAppSlice.getState().commandPaletteOpen).toBe(false);
    });

    it('alerts 默认应该为空数组', () => {
      expect(useAppSlice.getState().alerts).toHaveLength(0);
    });

    it('maxAlerts 应该是 100', () => {
      expect(useAppSlice.getState().maxAlerts).toBe(100);
    });

    it('fps 默认值应该是 60', () => {
      expect(useAppSlice.getState().fps).toBe(60);
    });

    it('memoryUsage 默认值应该是 0', () => {
      expect(useAppSlice.getState().memoryUsage).toBe(0);
    });
  });

  describe('UI 设置方法', () => {
    describe('setCommandPaletteOpen', () => {
      it('应该打开命令面板', () => {
        useAppSlice.getState().setCommandPaletteOpen(true);
        expect(useAppSlice.getState().commandPaletteOpen).toBe(true);
      });

      it('应该关闭命令面板', () => {
        useAppSlice.getState().setCommandPaletteOpen(true);
        useAppSlice.getState().setCommandPaletteOpen(false);
        expect(useAppSlice.getState().commandPaletteOpen).toBe(false);
      });
    });
  });

  describe('告警管理', () => {
    describe('addAlert', () => {
      it('应该添加告警到列表头部', () => {
        useAppSlice.getState().addAlert(mockAlert);
        const { alerts } = useAppSlice.getState();
        expect(alerts).toHaveLength(1);
        expect(alerts[0].id).toBe('alert-001');
      });

      it('新告警应该在列表最前面', () => {
        const alert2: AlertData = { ...mockAlert, id: 'alert-002' };
        useAppSlice.getState().addAlert(mockAlert);
        useAppSlice.getState().addAlert(alert2);
        const { alerts } = useAppSlice.getState();
        expect(alerts[0].id).toBe('alert-002');
        expect(alerts[1].id).toBe('alert-001');
      });

      it('告警数量不应该超过 maxAlerts', () => {
        for (let i = 0; i < 110; i++) {
          useAppSlice.getState().addAlert({ ...mockAlert, id: `alert-${i}` });
        }
        const { alerts, maxAlerts } = useAppSlice.getState();
        expect(alerts.length).toBeLessThanOrEqual(maxAlerts);
        expect(alerts.length).toBe(100);
      });
    });

    describe('removeAlert', () => {
      it('应该删除指定 ID 的告警', () => {
        useAppSlice.getState().addAlert(mockAlert);
        useAppSlice.getState().removeAlert('alert-001');
        expect(useAppSlice.getState().alerts).toHaveLength(0);
      });

      it('删除不存在的 ID 不应影响其他告警', () => {
        useAppSlice.getState().addAlert(mockAlert);
        useAppSlice.getState().removeAlert('non-existent');
        expect(useAppSlice.getState().alerts).toHaveLength(1);
      });
    });

    describe('clearAlerts', () => {
      it('应该清空所有告警', () => {
        for (let i = 0; i < 5; i++) {
          useAppSlice.getState().addAlert({ ...mockAlert, id: `alert-${i}` });
        }
        useAppSlice.getState().clearAlerts();
        expect(useAppSlice.getState().alerts).toHaveLength(0);
      });

      it('清空空列表不应该报错', () => {
        expect(() => { useAppSlice.getState().clearAlerts(); }).not.toThrow();
      });
    });
  });

  describe('性能指标', () => {
    describe('setFps', () => {
      it('应该设置帧率', () => {
        useAppSlice.getState().setFps(120);
        expect(useAppSlice.getState().fps).toBe(120);
      });

      it('应该支持低帧率', () => {
        useAppSlice.getState().setFps(15);
        expect(useAppSlice.getState().fps).toBe(15);
      });
    });

    describe('setMemoryUsage', () => {
      it('应该设置内存使用量', () => {
        useAppSlice.getState().setMemoryUsage(75.5);
        expect(useAppSlice.getState().memoryUsage).toBeCloseTo(75.5, 1);
      });

      it('应该支持 0 内存使用', () => {
        useAppSlice.getState().setMemoryUsage(0);
        expect(useAppSlice.getState().memoryUsage).toBe(0);
      });
    });
  });

  describe('最近操作', () => {
    describe('addRecentOp', () => {
      it('应该添加操作记录到列表头部', () => {
        const op: RecentOpEntry = {
          id: 'OP-new', action: '测试操作', target: '测试目标',
          user: 'test-user', time: '00:00:00', status: 'success',
        };
        useAppSlice.getState().addRecentOp(op);
        expect(useAppSlice.getState().recentOps[0].id).toBe('OP-new');
      });

      it('操作记录数量不应超过 50 条', () => {
        for (let i = 0; i < 60; i++) {
          useAppSlice.getState().addRecentOp({
            id: `OP-batch-${i}`, action: `批量操作${i}`, target: `目标${i}`,
            user: 'system', time: `${String(i).padStart(2, '0')}:00:00`, status: 'success',
          });
        }
        expect(useAppSlice.getState().recentOps.length).toBe(50);
      });
    });

    describe('clearRecentOps', () => {
      it('应该清空所有操作记录', () => {
        useAppSlice.getState().addRecentOp({
          id: 'OP-temp', action: '临时操作', target: '临时目标',
          user: 'temp-user', time: '12:00:00', status: 'running',
        });
        useAppSlice.getState().clearRecentOps();
        expect(useAppSlice.getState().recentOps).toHaveLength(0);
      });
    });
  });

  describe('集成场景', () => {
    it('告警处理流程', () => {
      const warningAlert: AlertData = { ...mockAlert, id: 'warn-001', level: 'warning' as any, message: '温度警告' };
      const errorAlert: AlertData = { ...mockAlert, id: 'error-001', level: 'error' as any, message: '连接失败' };

      useAppSlice.getState().addAlert(warningAlert);
      useAppSlice.getState().addAlert(errorAlert);
      expect(useAppSlice.getState().alerts).toHaveLength(2);

      useAppSlice.getState().removeAlert('error-001');
      expect(useAppSlice.getState().alerts).toHaveLength(1);
      expect(useAppSlice.getState().alerts[0].level).toBe('warning');

      useAppSlice.getState().clearAlerts();
      expect(useAppSlice.getState().alerts).toHaveLength(0);
    });

    it('命令面板切换流程', () => {
      useAppSlice.getState().setCommandPaletteOpen(true);
      expect(useAppSlice.getState().commandPaletteOpen).toBe(true);

      useAppSlice.getState().setCommandPaletteOpen(false);
      expect(useAppSlice.getState().commandPaletteOpen).toBe(false);
    });
  });
});
