/**
 * @file: follow-up-slice.test.ts
 * @description: YYC³ Follow-Up Slice 单元测试 · 待办事项管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useFollowUpSlice } from '../../store/slices/follow-up-slice';
import type { FollowUpRecord } from '../../types';

describe('useFollowUpSlice', () => {
  beforeEach(() => {
    // 清理额外添加的待办事项
    const currentFollowUps = useFollowUpSlice.getState().followUps;
    currentFollowUps.forEach(fu => {
      if (!fu.id.startsWith('fu-001') && !fu.id.startsWith('fu-002')) {
        useFollowUpSlice.getState().removeFollowUp(fu.id);
      }
    });

    // 重置所有默认待办事项的状态
    useFollowUpSlice.getState().followUps.forEach(fu => {
      if (fu.status === 'completed') {
        useFollowUpSlice.getState().updateFollowUp(fu.id, {
          status: fu.taskId === 'TASK-042' ? 'in_progress' as any : 'pending' as any,
          completedAt: undefined,
        });
      }
    });
  });

  describe('初始状态', () => {
    it('应该包含2个默认待办事项', () => {
      const { followUps } = useFollowUpSlice.getState();
      expect(followUps).toHaveLength(2);
    });

    it('应该包含 GPU 温度告警处理任务', () => {
      const { followUps } = useFollowUpSlice.getState();
      const tempAlert = followUps.find(f => f.taskName.includes('温度告警'));
      expect(tempAlert).toBeDefined();
      expect(tempAlert?.priority).toBe('high');
      expect(tempAlert?.status).toBe('in_progress');
    });

    it('应该包含模型版本升级任务', () => {
      const { followUps } = useFollowUpSlice.getState();
      const modelUpgrade = followUps.find(f => f.taskName.includes('模型版本升级'));
      expect(modelUpgrade).toBeDefined();
      expect(modelUpgrade?.priority).toBe('medium');
      expect(modelUpgrade?.status).toBe('pending');
    });

    it('所有默认待办事项应该有有效的截止日期', () => {
      const { followUps } = useFollowUpSlice.getState();
      const now = Date.now();

      followUps.forEach(fu => {
        expect(fu.dueDate).toBeGreaterThan(now); // 截止日期应该在将来
        expect(typeof fu.dueDate).toBe('number');
      });
    });

    it('所有待办事项应该有创建时间', () => {
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(fu.createdAt).toBeDefined();
        expect(typeof fu.createdAt).toBe('number');
        expect(fu.createdAt).toBeGreaterThan(0);
      });
    });
  });

  describe('addFollowUp', () => {
    it('应该添加新待办事项并自动生成 ID', () => {
      const newFu: Omit<FollowUpRecord, 'id' | 'createdAt'> = {
        taskId: 'TASK-999',
        taskName: '测试任务',
        assignee: 'test_user',
        assigneeName: '测试用户',
        priority: 'low' as any,
        status: 'pending' as any,
        dueDate: Date.now() + 86400000,
        notes: '这是一个测试任务',
        updatedAt: Date.now(),
        category: 'feature' as any,
      };

      useFollowUpSlice.getState().addFollowUp(newFu);

      const { followUps } = useFollowUpSlice.getState();
      const added = followUps.find(f => f.taskId === 'TASK-999');

      expect(added).toBeDefined();
      expect(added?.taskName).toBe('测试任务');
      expect(added?.id).toMatch(/^fu-\d+$/);
      expect(added?.createdAt).toBeDefined();
    });

    it('应该自动设置 createdAt 时间戳', () => {
      const beforeAdd = Date.now();

      useFollowUpSlice.getState().addFollowUp({
        taskId: 'TASK-TIMESTAMP',
        taskName: '时间戳测试',
        assignee: 'tester',
        assigneeName: '测试员',
        priority: 'medium' as any,
        status: 'pending' as any,
        dueDate: Date.now() + 86400000,
        updatedAt: Date.now(),
        category: 'feature' as any,
      });

      const added = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-TIMESTAMP');

      if (added) {
        expect(added.createdAt).toBeGreaterThanOrEqual(beforeAdd);
      }
    });

    it('应该增加待办事项总数', () => {
      const beforeCount = useFollowUpSlice.getState().followUps.length;

      useFollowUpSlice.getState().addFollowUp({
        taskId: 'TASK-COUNT',
        taskName: '计数测试',
        assignee: 'counter',
        assigneeName: '计数器',
        priority: 'low' as any,
        status: 'pending' as any,
        dueDate: Date.now() + 86400000,
        updatedAt: Date.now(),
        category: 'feature' as any,
      });

      expect(useFollowUpSlice.getState().followUps.length).toBe(beforeCount + 1);
    });
  });

  describe('updateFollowUp', () => {
    it('应该更新指定 ID 的待办事项', () => {
      const fuId = useFollowUpSlice.getState().followUps[0].id;

      useFollowUpSlice.getState().updateFollowUp(fuId, {
        priority: 'critical',
        notes: '更新后的备注',
      });

      const updated = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);

      expect(updated?.priority).toBe('critical');
      expect(updated?.notes).toBe('更新后的备注');
      expect(updated?.taskName).toContain('温度告警'); // 未更新字段保持不变
    });

    it('更新不存在的 ID 不应影响其他待办事项', () => {
      const beforeCount = useFollowUpSlice.getState().followUps.length;

      useFollowUpSlice.getState().updateFollowUp('non-existent', {
        priority: 'critical',
      });

      expect(useFollowUpSlice.getState().followUps.length).toBe(beforeCount);
    });

    it('应该支持部分字段更新', () => {
      const fuId = useFollowUpSlice.getState().followUps[1].id;

      useFollowUpSlice.getState().updateFollowUp(fuId, {
        status: 'in_progress' as any,
      });

      const updated = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);

      expect(updated?.status).toBe('in_progress');
      expect(updated?.priority).toBe('medium'); // 其他字段不变
    });
  });

  describe('removeFollowUp', () => {
    it('应该删除指定 ID 的待办事项', () => {
      // 先添加一个临时待办事项
      useFollowUpSlice.getState().addFollowUp({
        taskId: 'TASK-DELETE',
        taskName: '待删除任务',
        assignee: 'deleter',
        assigneeName: '删除者',
        priority: 'low' as any,
        status: 'pending' as any,
        dueDate: Date.now() + 86400000,
        notes: '',
        updatedAt: Date.now(),
        category: 'feature' as any,
      });

      const tempFu = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-DELETE');

      if (tempFu) {
        const beforeCount = useFollowUpSlice.getState().followUps.length;

        useFollowUpSlice.getState().removeFollowUp(tempFu.id);

        expect(useFollowUpSlice.getState().followUps.length).toBe(beforeCount - 1);
        expect(useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-DELETE')).toBeUndefined();
      }
    });

    it('删除不存在的 ID 不应报错', () => {
      expect(() => {
        useFollowUpSlice.getState().removeFollowUp('non-existent');
      }).not.toThrow();
    });
  });

  describe('completeFollowUp', () => {
    it('应该将待办事项标记为已完成', () => {
      const fuId = useFollowUpSlice.getState().followUps[0].id;

      useFollowUpSlice.getState().completeFollowUp(fuId);

      const completed = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);

      expect(completed?.status).toBe('completed');
      expect(completed?.completedAt).toBeDefined();
      expect(typeof completed?.completedAt).toBe('number');
    });

    it('完成时应该记录完成时间戳', () => {
      const beforeComplete = Date.now();
      const fuId = useFollowUpSlice.getState().followUps[1].id;

      useFollowUpSlice.getState().completeFollowUp(fuId);

      const completed = useFollowUpSlice.getState().followUps.find(f => f.id === fuId);

      if (completed) {
        expect(completed.completedAt).toBeGreaterThanOrEqual(beforeComplete);
      }
    });

    it('完成操作不应影响其他待办事项', () => {
      const targetId = useFollowUpSlice.getState().followUps[0].id;
      const otherFus = useFollowUpSlice.getState().followUps.slice(1);

      useFollowUpSlice.getState().completeFollowUp(targetId);

      otherFus.forEach(fu => {
        expect(fu.status).not.toBe('completed'); // 其他待办事项状态不变
      });
    });
  });

  describe('边界情况和数据完整性', () => {
    it('优先级应该是有效的值', () => {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(validPriorities).toContain(fu.priority);
      });
    });

    it('状态应该是有效的值', () => {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(validStatuses).toContain(fu.status);
      });
    });

    it('分类应该是有效的', () => {
      const validCategories = ['maintenance', 'optimization', 'testing', 'deployment'];
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(validCategories).toContain(fu.category);
      });
    });

    it('截止日期应该是将来的时间戳', () => {
      const now = Date.now();
      const { followUps } = useFollowUpSlice.getState();

      followUps.forEach(fu => {
        expect(fu.dueDate).toBeGreaterThan(now);
      });
    });
  });

  describe('集成场景', () => {
    it('完整的待办事项生命周期：添加 → 更新 → 完成', () => {
      // 1. 添加新的待办事项
      useFollowUpSlice.getState().addFollowUp({
        taskId: 'TASK-LIFECYCLE',
        taskName: '生命周期测试任务',
        assignee: 'lifecycle_user',
        assigneeName: '生命周期用户',
        priority: 'high' as any,
        status: 'pending' as any,
        dueDate: Date.now() + 86400000,
        notes: '初始备注',
        updatedAt: Date.now(),
        category: 'feature' as any,
      });

      const newFu = useFollowUpSlice.getState().followUps.find(f => f.taskId === 'TASK-LIFECYCLE');
      expect(newFu).toBeDefined();

      if (newFu) {
        // 2. 更新待办事项
        useFollowUpSlice.getState().updateFollowUp(newFu.id, {
          status: 'in_progress' as any,
          notes: '开始执行任务',
        });

        let updated = useFollowUpSlice.getState().followUps.find(f => f.id === newFu.id);
        expect(updated?.status).toBe('in_progress');
        expect(updated?.notes).toBe('开始执行任务');

        // 3. 完成待办事项
        useFollowUpSlice.getState().completeFollowUp(newFu.id);

        let completed = useFollowUpSlice.getState().followUps.find(f => f.id === newFu.id);
        expect(completed?.status).toBe('completed');
        expect(completed?.completedAt).toBeDefined();
      }
    });

    it('批量管理多个待办事项', () => {
      const initialCount = useFollowUpSlice.getState().followUps.length;

      // 批量添加3个待办事项
      for (let i = 1; i <= 3; i++) {
        useFollowUpSlice.getState().addFollowUp({
          taskId: `TASK-BATCH-${i}`,
          taskName: `批量任务${i}`,
          assignee: `batch_user_${i}`,
          assigneeName: `批量用户${i}`,
          priority: 'medium' as any,
          status: 'pending' as any,
          dueDate: Date.now() + 86400000 * i,
          notes: '',
          updatedAt: Date.now(),
          category: 'feature' as any,
        });
      }

      expect(useFollowUpSlice.getState().followUps.length).toBe(initialCount + 3);

      // 批量完成所有新增的待办事项
      const batchFus = useFollowUpSlice.getState().followUps.filter(
        f => f.taskId.startsWith('TASK-BATCH-')
      );

      batchFus.forEach(fu => {
        useFollowUpSlice.getState().completeFollowUp(fu.id);
      });

      // 验证所有批量待办事项都已完成
      batchFus.forEach(fu => {
        const completed = useFollowUpSlice.getState().followUps.find(f => f.id === fu.id);
        expect(completed?.status).toBe('completed');
      });
    });
  });
});
