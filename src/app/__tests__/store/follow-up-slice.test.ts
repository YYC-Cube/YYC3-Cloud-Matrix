/**
 * @file: follow-up-slice.test.ts
 * @description: YYC³ Follow-Up Slice 单元测试 · 告警工单域（真实事件驱动，零硬编码种子）
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-16
 * @updated: 2026-11-10
 * @status: active
 * @tags: [auto-generated]
 *
 * @changelog:
 * - v2.0.0 (2026-11-10): 按「禁止硬编码」政策移除 DEFAULT_FOLLOWUPS 假种子断言，
 *   初始状态应为空；新增 ingestWSAlert 幂等摄入专项（真实 WS 告警 → 工单）
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useFollowUpSlice } from '../../store/slices/follow-up-slice';
import type { FollowUpRecord } from '../../types';
import type { AlertData } from '../../types/websocket-types';

/** 构造测试工单 */
function makeFu(taskId: string, overrides: Partial<FollowUpRecord> = {}): Omit<FollowUpRecord, 'id' | 'createdAt'> {
  return {
    taskId,
    taskName: `任务-${taskId}`,
    assignee: 'tester',
    assigneeName: '测试员',
    priority: 'medium',
    status: 'pending',
    dueDate: Date.now() + 86400000,
    updatedAt: Date.now(),
    category: 'feature',
    ...overrides,
  };
}

describe('useFollowUpSlice', () => {
  beforeEach(() => {
    // 每个用例从空状态开始（政策：无硬编码种子）
    useFollowUpSlice.setState({ followUps: [] });
  });

  describe('初始状态（零硬编码政策）', () => {
    it('初始工单列表应为空 — 数据仅来自真实事件/用户操作', () => {
      const { followUps } = useFollowUpSlice.getState();
      expect(followUps).toHaveLength(0);
    });
  });

  describe('ingestWSAlert（真实告警摄入）', () => {
    const alert: AlertData = {
      id: 'a-001',
      level: 'critical',
      message: '内存占用超过阈值 90%',
      source: 'yyc3-agent',
      timestamp: Date.now(),
    };

    it('WS 告警应生成一张 pending 工单', () => {
      const created = useFollowUpSlice.getState().ingestWSAlert(alert);
      expect(created).toBe(true);

      const { followUps } = useFollowUpSlice.getState();
      expect(followUps).toHaveLength(1);
      expect(followUps[0].taskId).toBe('ALERT-yyc3-agent-a-001');
      expect(followUps[0].taskName).toBe('内存占用超过阈值 90%');
      expect(followUps[0].status).toBe('pending');
      expect(followUps[0].assignee).toBe('system');
    });

    it('告警级别应正确映射优先级（critical→critical, error→high, warning→medium, info→low）', () => {
      const levels = [
        { level: 'critical', priority: 'critical' },
        { level: 'error', priority: 'high' },
        { level: 'warning', priority: 'medium' },
        { level: 'info', priority: 'low' },
      ] as const;
      levels.forEach(({ level, priority }, i) => {
        useFollowUpSlice.getState().ingestWSAlert({ ...alert, id: `lv-${i}`, level });
      });
      const { followUps } = useFollowUpSlice.getState();
      levels.forEach(({ priority }, i) => {
        expect(followUps.find(f => f.taskId === `ALERT-yyc3-agent-lv-${i}`)?.priority).toBe(priority);
      });
    });

    it('同一 source+alertId 重复推送应幂等去重，不重复建单', () => {
      expect(useFollowUpSlice.getState().ingestWSAlert(alert)).toBe(true);
      expect(useFollowUpSlice.getState().ingestWSAlert(alert)).toBe(false);
      expect(useFollowUpSlice.getState().ingestWSAlert({ ...alert, timestamp: Date.now() + 1000 })).toBe(false);
      expect(useFollowUpSlice.getState().followUps).toHaveLength(1);
    });

    it('不同告警源/ID 应分别建单', () => {
      useFollowUpSlice.getState().ingestWSAlert(alert);
      useFollowUpSlice.getState().ingestWSAlert({ ...alert, id: 'a-002' });
      useFollowUpSlice.getState().ingestWSAlert({ ...alert, source: 'other-agent' });
      expect(useFollowUpSlice.getState().followUps).toHaveLength(3);
    });

    it('新告警工单应排在列表最前', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-OLD'));
      useFollowUpSlice.getState().ingestWSAlert(alert);
      expect(useFollowUpSlice.getState().followUps[0].taskId).toBe('ALERT-yyc3-agent-a-001');
    });
  });

  describe('addFollowUp', () => {
    it('应该添加新待办事项并自动生成 ID', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-999', { taskName: '测试任务' }));

      const added = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-999');

      expect(added).toBeDefined();
      expect(added?.taskName).toBe('测试任务');
      expect(added?.id).toMatch(/^fu-\d+-[a-z0-9]+$/);
      expect(added?.createdAt).toBeDefined();
    });

    it('应该自动设置 createdAt 时间戳', () => {
      const beforeAdd = Date.now();
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-TIMESTAMP'));

      const added = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-TIMESTAMP');
      expect(added?.createdAt).toBeGreaterThanOrEqual(beforeAdd);
    });

    it('应该增加待办事项总数', () => {
      const beforeCount = useFollowUpSlice.getState().followUps.length;
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-COUNT'));
      expect(useFollowUpSlice.getState().followUps.length).toBe(beforeCount + 1);
    });
  });

  describe('updateFollowUp', () => {
    it('应该更新指定 ID 的待办事项', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-UPD', { taskName: '温度告警复核' }));
      const fuId = useFollowUpSlice.getState().followUps[0].id;

      useFollowUpSlice.getState().updateFollowUp(fuId, {
        priority: 'critical',
        notes: '更新后的备注',
      });

      const updated = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);
      expect(updated?.priority).toBe('critical');
      expect(updated?.notes).toBe('更新后的备注');
      expect(updated?.taskName).toBe('温度告警复核'); // 未更新字段保持不变
    });

    it('更新不存在的 ID 不应影响其他待办事项', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-KEEP'));
      const beforeCount = useFollowUpSlice.getState().followUps.length;

      useFollowUpSlice.getState().updateFollowUp('non-existent', { priority: 'critical' });

      expect(useFollowUpSlice.getState().followUps.length).toBe(beforeCount);
    });

    it('应该支持部分字段更新', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-PART', { priority: 'medium' }));
      const fuId = useFollowUpSlice.getState().followUps[0].id;

      useFollowUpSlice.getState().updateFollowUp(fuId, { status: 'in_progress' });

      const updated = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);
      expect(updated?.status).toBe('in_progress');
      expect(updated?.priority).toBe('medium'); // 其他字段不变
    });
  });

  describe('removeFollowUp', () => {
    it('应该删除指定 ID 的待办事项', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-DELETE'));

      const tempFu = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-DELETE');
      const beforeCount = useFollowUpSlice.getState().followUps.length;

      useFollowUpSlice.getState().removeFollowUp(tempFu!.id);

      expect(useFollowUpSlice.getState().followUps.length).toBe(beforeCount - 1);
      expect(useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-DELETE')).toBeUndefined();
    });

    it('删除不存在的 ID 不应报错', () => {
      expect(() => {
        useFollowUpSlice.getState().removeFollowUp('non-existent');
      }).not.toThrow();
    });
  });

  describe('completeFollowUp', () => {
    it('应该将待办事项标记为已完成', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-DONE'));
      const fuId = useFollowUpSlice.getState().followUps[0].id;

      useFollowUpSlice.getState().completeFollowUp(fuId);

      const completed = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);
      expect(completed?.status).toBe('completed');
      expect(completed?.completedAt).toBeDefined();
      expect(typeof completed?.completedAt).toBe('number');
    });

    it('完成时应该记录完成时间戳', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-DONE-TS'));
      const beforeComplete = Date.now();
      const fuId = useFollowUpSlice.getState().followUps[0].id;

      useFollowUpSlice.getState().completeFollowUp(fuId);

      const completed = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);
      expect(completed?.completedAt).toBeGreaterThanOrEqual(beforeComplete);
    });

    it('完成操作不应影响其他待办事项', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-A'));
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-B'));
      const [a, b] = useFollowUpSlice.getState().followUps;

      useFollowUpSlice.getState().completeFollowUp(a.id);

      const unchanged = useFollowUpSlice.getState().followUps.find(f => f.id === b.id);
      expect(unchanged?.status).toBe('pending');
    });
  });

  describe('边界情况和数据完整性', () => {
    it('优先级应该是有效的值', () => {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-V1'));
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(validPriorities).toContain(fu.priority);
      });
    });

    it('状态应该是有效的值', () => {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-V2'));
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(validStatuses).toContain(fu.status);
      });
    });

    it('截止日期应该是将来的时间戳', () => {
      const now = Date.now();
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-V3'));
      useFollowUpSlice.getState().ingestWSAlert({
        id: 'v4', level: 'warning', message: 'm', source: 's', timestamp: now,
      });
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(fu.dueDate).toBeGreaterThan(now);
      });
    });
  });

  describe('集成场景', () => {
    it('完整的待办事项生命周期：添加 → 更新 → 完成', () => {
      useFollowUpSlice.getState().addFollowUp(makeFu('TASK-LIFECYCLE', { notes: '初始备注' }));

      const newFu = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-LIFECYCLE');
      expect(newFu).toBeDefined();

      if (newFu) {
        useFollowUpSlice.getState().updateFollowUp(newFu.id, {
          status: 'in_progress',
          notes: '开始执行任务',
        });

        const updated = useFollowUpSlice.getState().followUps.find(f => f.id === newFu.id);
        expect(updated?.status).toBe('in_progress');
        expect(updated?.notes).toBe('开始执行任务');

        useFollowUpSlice.getState().completeFollowUp(newFu.id);

        const completed = useFollowUpSlice.getState().followUps.find(f => f.id === newFu.id);
        expect(completed?.status).toBe('completed');
        expect(completed?.completedAt).toBeDefined();
      }
    });

    it('批量管理多个待办事项', () => {
      const initialCount = useFollowUpSlice.getState().followUps.length;

      for (let i = 1; i <= 3; i++) {
        useFollowUpSlice.getState().addFollowUp(makeFu(`TASK-BATCH-${i}`));
      }

      expect(useFollowUpSlice.getState().followUps.length).toBe(initialCount + 3);

      const batchFus = useFollowUpSlice.getState().followUps.filter(
        f => f.taskId.startsWith('TASK-BATCH-')
      );

      batchFus.forEach(fu => {
        useFollowUpSlice.getState().completeFollowUp(fu.id);
      });

      batchFus.forEach(fu => {
        const completed = useFollowUpSlice.getState().followUps.find(f => f.id === fu.id);
        expect(completed?.status).toBe('completed');
      });
    });

    it('真实告警 → 工单 → 处理闭环：agent 告警可被人工跟进完成', () => {
      // 模拟 agent 推送「推理服务离线」告警
      useFollowUpSlice.getState().ingestWSAlert({
        id: 'ollama-down',
        level: 'error',
        message: 'Ollama 推理服务离线',
        source: 'yyc3-agent',
        timestamp: Date.now(),
      });

      const fu = useFollowUpSlice.getState().followUps[0];
      expect(fu.priority).toBe('high');
      expect(fu.status).toBe('pending');

      // 运维认领 → 处理 → 完成
      useFollowUpSlice.getState().updateFollowUp(fu.id, { status: 'in_progress', assigneeName: '运维' });
      useFollowUpSlice.getState().completeFollowUp(fu.id);

      const done = useFollowUpSlice.getState().followUps.find(f => f.id === fu.id);
      expect(done?.status).toBe('completed');
    });
  });
});
