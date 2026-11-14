/**
 * @file: user-mgmt-slice.test.ts
 * @description: YYC³ User Management Slice 单元测试 · 真实空语义 + 假种子迁移清理
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-16
 * @updated: 2026-11-14
 * @status: active
 * @tags: [auto-generated]
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserMgmtSlice } from '../../store/slices/user-mgmt-slice';
import type { UserRecord } from '../../types';

const makeUser = (overrides: Partial<Omit<UserRecord, 'id'>> = {}): Omit<UserRecord, 'id'> => ({
  name: '测试用户',
  username: 'test_user',
  email: 'test@cloudpivot.ai',
  role: '开发者',
  status: 'online',
  lastLogin: new Date().toISOString(),
  sessions: 0,
  apiCalls: 0,
  locked: false,
  ...overrides,
});

describe('useUserMgmtSlice', () => {
  beforeEach(() => {
    useUserMgmtSlice.setState({ users: [] });
  });

  describe('初始状态（真实语义）', () => {
    it('初始用户列表应为空，绝不预置演示账号', () => {
      const { users } = useUserMgmtSlice.getState();
      expect(users).toEqual([]);
    });
  });

  describe('addUser', () => {
    it('应该添加新用户并自动生成 ID', () => {
      useUserMgmtSlice.getState().addUser(makeUser());

      const { users } = useUserMgmtSlice.getState();
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('测试用户');
      expect(users[0].id).toMatch(/^usr-/);
    });

    it('应该增加用户总数', () => {
      const beforeCount = useUserMgmtSlice.getState().users.length;

      useUserMgmtSlice.getState().addUser(makeUser({ username: 'new_user', email: 'new@cloudpivot.ai' }));

      expect(useUserMgmtSlice.getState().users.length).toBe(beforeCount + 1);
    });
  });

  describe('updateUser', () => {
    it('应该更新指定 ID 的用户信息，未更新字段保持不变', () => {
      useUserMgmtSlice.getState().addUser(makeUser({ username: 'admin' }));
      const adminId = useUserMgmtSlice.getState().users.find(u => u.username === 'admin')!.id;

      useUserMgmtSlice.getState().updateUser(adminId, {
        name: '已更新的管理员',
        email: 'updated_admin@cloudpivot.ai',
      });

      const updated = useUserMgmtSlice.getState().users.find(u => u.id === adminId);
      expect(updated?.name).toBe('已更新的管理员');
      expect(updated?.email).toBe('updated_admin@cloudpivot.ai');
      expect(updated?.username).toBe('admin');
    });

    it('更新不存在的 ID 不应影响其他用户', () => {
      useUserMgmtSlice.getState().addUser(makeUser());
      const before = useUserMgmtSlice.getState().users;

      useUserMgmtSlice.getState().updateUser('non-existent', { name: 'Hacker' });

      expect(useUserMgmtSlice.getState().users).toEqual(before);
    });
  });

  describe('removeUser', () => {
    it('应该删除指定 ID 的用户', () => {
      useUserMgmtSlice.getState().addUser(makeUser({ username: 'to_remove' }));
      const tempUser = useUserMgmtSlice.getState().users.find(u => u.username === 'to_remove')!;

      useUserMgmtSlice.getState().removeUser(tempUser.id);

      expect(useUserMgmtSlice.getState().users.find(u => u.username === 'to_remove')).toBeUndefined();
    });

    it('删除不存在的 ID 不应报错', () => {
      expect(() => {
        useUserMgmtSlice.getState().removeUser('non-existent');
      }).not.toThrow();
    });
  });

  describe('toggleLock', () => {
    it('应该在锁定与解锁之间往返切换', () => {
      useUserMgmtSlice.getState().addUser(makeUser());
      const userId = useUserMgmtSlice.getState().users[0].id;

      useUserMgmtSlice.getState().toggleLock(userId);
      expect(useUserMgmtSlice.getState().users.find(u => u.id === userId)?.locked).toBe(true);

      useUserMgmtSlice.getState().toggleLock(userId);
      expect(useUserMgmtSlice.getState().users.find(u => u.id === userId)?.locked).toBe(false);
    });

    it('切换锁定不应该影响其他用户', () => {
      useUserMgmtSlice.getState().addUser(makeUser({ username: 'user_a', email: 'a@cloudpivot.ai' }));
      useUserMgmtSlice.getState().addUser(makeUser({ username: 'user_b', email: 'b@cloudpivot.ai' }));
      const [target, other] = useUserMgmtSlice.getState().users;

      useUserMgmtSlice.getState().toggleLock(target.id);

      expect(useUserMgmtSlice.getState().users.find(u => u.id === other.id)?.locked).toBe(false);
    });
  });

  describe('数据完整性', () => {
    it('新增用户的邮箱/计数字段应保持有效', () => {
      useUserMgmtSlice.getState().addUser(makeUser());

      const { users } = useUserMgmtSlice.getState();
      users.forEach(user => {
        expect(user.email).toContain('@');
        expect(user.email).toContain('.');
        expect(user.apiCalls).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(user.apiCalls)).toBe(true);
        expect(user.sessions).toBeGreaterThanOrEqual(0);
        expect(['online', 'offline', 'busy', 'away']).toContain(user.status);
      });
    });
  });

  describe('集成场景', () => {
    it('完整的用户生命周期：添加 → 更新 → 锁定 → 解锁 → 删除', () => {
      useUserMgmtSlice.getState().addUser(makeUser({ username: 'lifecycle_test' }));
      const newUser = useUserMgmtSlice.getState().users.find(u => u.username === 'lifecycle_test')!;

      useUserMgmtSlice.getState().updateUser(newUser.id, { role: '高级开发者', apiCalls: 200 });
      const updated = useUserMgmtSlice.getState().users.find(u => u.id === newUser.id);
      expect(updated?.role).toBe('高级开发者');
      expect(updated?.apiCalls).toBe(200);

      useUserMgmtSlice.getState().toggleLock(newUser.id);
      expect(useUserMgmtSlice.getState().users.find(u => u.id === newUser.id)?.locked).toBe(true);

      useUserMgmtSlice.getState().toggleLock(newUser.id);
      expect(useUserMgmtSlice.getState().users.find(u => u.id === newUser.id)?.locked).toBe(false);

      useUserMgmtSlice.getState().removeUser(newUser.id);
      expect(useUserMgmtSlice.getState().users.find(u => u.username === 'lifecycle_test')).toBeUndefined();
    });
  });

  describe('Legacy Seed Cleanup（假种子迁移清除）', () => {
    it('v0 持久化数据中的 usr-1~5 假用户应被清除，自建用户保留', async () => {
      const legacyPersisted = {
        state: {
          users: [
            { id: 'usr-1', name: '张管理', username: 'admin', email: 'admin@cloudpivot.ai', role: '超级管理员', status: 'online', lastLogin: '', sessions: 3, apiCalls: 1284, locked: false },
            { id: 'usr-3', name: '王开发', username: 'dev_wang', email: 'dev@cloudpivot.ai', role: '开发者', status: 'online', lastLogin: '', sessions: 2, apiCalls: 2105, locked: false },
            { id: 'usr-1770000000000', name: '真实用户', username: 'real_user', email: 'real@cloudpivot.ai', role: '运维工程师', status: 'offline', lastLogin: '', sessions: 0, apiCalls: 0, locked: false },
          ],
        },
        version: 0,
      };
      localStorage.setItem('yyc3-user-mgmt-slice', JSON.stringify(legacyPersisted));

      // 全新模块实例以触发 persist rehydrate + migrate
      vi.resetModules();
      const fresh = await import('../../store/slices/user-mgmt-slice');

      const users = fresh.useUserMgmtSlice.getState().users;
      expect(users.some(u => u.id === 'usr-1')).toBe(false);
      expect(users.some(u => u.id === 'usr-3')).toBe(false);
      expect(users.some(u => u.id === 'usr-1770000000000')).toBe(true);
      expect(users).toHaveLength(1);
    });
  });
});
