/**
 * @file: user-mgmt-slice.test.ts
 * @description: YYC³ User Management Slice 单元测试 · 用户管理功能
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { useUserMgmtSlice } from '../../store/slices/user-mgmt-slice';
import type { UserRecord } from '../../types';

describe('useUserMgmtSlice', () => {
  beforeEach(() => {
    useUserMgmtSlice.setState({ users: useUserMgmtSlice.getInitialState().users });
  });

  describe('初始状态', () => {
    it('应该包含5个默认用户', () => {
      const { users } = useUserMgmtSlice.getState();
      expect(users).toHaveLength(5);
    });

    it('应该包含管理员用户', () => {
      const { users } = useUserMgmtSlice.getState();
      const admin = users.find(u => u.username === 'admin');
      expect(admin).toBeDefined();
      expect(admin?.name).toBe('张管理');
      expect(admin?.role).toBe('超级管理员');
    });

    it('默认用户都不应该被锁定', () => {
      const { users } = useUserMgmtSlice.getState();
      users.forEach(user => {
        expect(user.locked).toBe(false);
      });
    });

    it('应该包含不同角色的用户', () => {
      const { users } = useUserMgmtSlice.getState();
      const roles = users.map(u => u.role);

      expect(roles).toContain('超级管理员');
      expect(roles).toContain('运维工程师');
      expect(roles).toContain('开发者');
      expect(roles).toContain('数据分析师');
      expect(roles).toContain('测试工程师');
    });
  });

  describe('addUser', () => {
    it('应该添加新用户并自动生成 ID', () => {
      const newUser: Omit<UserRecord, 'id'> = {
        name: '测试用户',
        username: 'test_user',
        email: 'test@cloudpivot.ai',
        role: '开发者',
        status: 'online',
        lastLogin: new Date().toISOString(),
        sessions: 0,
        apiCalls: 0,
        locked: false,
      };

      useUserMgmtSlice.getState().addUser(newUser);

      const { users } = useUserMgmtSlice.getState();
      const added = users.find(u => u.username === 'test_user');

      expect(added).toBeDefined();
      expect(added?.name).toBe('测试用户');
      expect(added?.id).toMatch(/^usr-\d+$/);
    });

    it('应该增加用户总数', () => {
      const beforeCount = useUserMgmtSlice.getState().users.length;

      useUserMgmtSlice.getState().addUser({
        name: 'New User',
        username: 'new_user',
        email: 'new@cloudpivot.ai',
        role: '测试工程师',
        status: 'offline',
        lastLogin: '',
        sessions: 0,
        apiCalls: 0,
        locked: false,
      });

      expect(useUserMgmtSlice.getState().users.length).toBe(beforeCount + 1);
    });
  });

  describe('updateUser', () => {
    it('应该更新指定 ID 的用户信息', () => {
      const adminId = useUserMgmtSlice.getState().users.find(u => u.username === 'admin')?.id;

      if (adminId) {
        useUserMgmtSlice.getState().updateUser(adminId, {
          name: '已更新的管理员',
          email: 'updated_admin@cloudpivot.ai',
        });

        const updated = useUserMgmtSlice.getState().users.find(u => u.id === adminId);
        expect(updated?.name).toBe('已更新的管理员');
        expect(updated?.email).toBe('updated_admin@cloudpivot.ai');
        expect(updated?.username).toBe('admin'); // 未更新字段保持不变
      }
    });

    it('更新不存在的 ID 不应影响其他用户', () => {
      const beforeCount = useUserMgmtSlice.getState().users.length;

      useUserMgmtSlice.getState().updateUser('non-existent', {
        name: 'Hacker',
      });

      expect(useUserMgmtSlice.getState().users.length).toBe(beforeCount);
    });

    it('应该支持部分字段更新', () => {
      const devId = useUserMgmtSlice.getState().users.find(u => u.username === 'dev_wang')?.id;

      if (devId) {
        useUserMgmtSlice.getState().updateUser(devId, {
          role: '高级开发者',
        });

        const updated = useUserMgmtSlice.getState().users.find(u => u.id === devId);
        expect(updated?.role).toBe('高级开发者');
        expect(updated?.name).toBe('王开发'); // 其他字段不变
      }
    });
  });

  describe('removeUser', () => {
    it('应该删除指定 ID 的用户', () => {
      // 先添加一个临时用户
      useUserMgmtSlice.getState().addUser({
        name: '待删除',
        username: 'to_remove',
        email: 'remove@cloudpivot.ai',
        role: '临时',
        status: 'offline',
        lastLogin: '',
        sessions: 0,
        apiCalls: 0,
        locked: false,
      });

      const tempUser = useUserMgmtSlice.getState().users.find(u => u.username === 'to_remove');

      if (tempUser) {
        const beforeCount = useUserMgmtSlice.getState().users.length;

        useUserMgmtSlice.getState().removeUser(tempUser.id);

        expect(useUserMgmtSlice.getState().users.length).toBe(beforeCount - 1);
        expect(useUserMgmtSlice.getState().users.find(u => u.username === 'to_remove')).toBeUndefined();
      }
    });

    it('删除不存在的 ID 不应报错', () => {
      expect(() => {
        useUserMgmtSlice.getState().removeUser('non-existent');
      }).not.toThrow();
    });
  });

  describe('toggleLock', () => {
    it('应该将未锁定的用户锁定', () => {
      const userId = useUserMgmtSlice.getState().users[0].id;

      useUserMgmtSlice.getState().toggleLock(userId);

      const user = useUserMgmtSlice.getState().users.find(u => u.id === userId);
      expect(user?.locked).toBe(true);
    });

    it('应该将锁定的用户解锁', () => {
      const userId = useUserMgmtSlice.getState().users[0].id;

      // 先锁定
      useUserMgmtSlice.getState().toggleLock(userId);
      const afterFirstToggle = useUserMgmtSlice.getState().users.find(u => u.id === userId);
      expect(afterFirstToggle?.locked).toBe(true);

      // 再解锁
      useUserMgmtSlice.getState().toggleLock(userId);
      const afterSecondToggle = useUserMgmtSlice.getState().users.find(u => u.id === userId);
      expect(afterSecondToggle?.locked).toBe(false);
    });

    it('切换锁定不应该影响其他用户', () => {
      const targetId = useUserMgmtSlice.getState().users[0].id;
      const otherUsers = useUserMgmtSlice.getState().users.slice(1);

      useUserMgmtSlice.getState().toggleLock(targetId);

      otherUsers.forEach(user => {
        expect(user.locked).toBe(false); // 其他用户仍然未锁定
      });
    });
  });

  describe('边界情况和数据完整性', () => {
    it('所有用户都应该有有效的邮箱格式', () => {
      const { users } = useUserMgmtSlice.getState();

      users.forEach(user => {
        expect(user.email).toContain('@');
        expect(user.email).toContain('.');
      });
    });

    it('apiCalls 应该是非负整数', () => {
      const { users } = useUserMgmtSlice.getState();

      users.forEach(user => {
        expect(user.apiCalls).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(user.apiCalls)).toBe(true);
      });
    });

    it('sessions 应该是非负整数', () => {
      const { users } = useUserMgmtSlice.getState();

      users.forEach(user => {
        expect(user.sessions).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(user.sessions)).toBe(true);
      });
    });

    it('status 应该是有效的值', () => {
      const validStatuses = ['online', 'offline', 'busy', 'away'];
      const { users } = useUserMgmtSlice.getState();

      users.forEach(user => {
        expect(validStatuses).toContain(user.status);
      });
    });
  });

  describe('集成场景', () => {
    it('完整的用户生命周期：添加 → 更新 → 锁定 → 解锁 → 删除', () => {
      // 1. 添加新用户
      useUserMgmtSlice.getState().addUser({
        name: '生命周期用户',
        username: 'lifecycle_test',
        email: 'lifecycle@cloudpivot.ai',
        role: '开发者',
        status: 'online',
        lastLogin: new Date().toISOString(),
        sessions: 1,
        apiCalls: 100,
        locked: false,
      });

      const newUser = useUserMgmtSlice.getState().users.find(u => u.username === 'lifecycle_test');
      expect(newUser).toBeDefined();

      if (newUser) {
        // 2. 更新用户信息
        useUserMgmtSlice.getState().updateUser(newUser.id, {
          role: '高级开发者',
          apiCalls: 200,
        });

        let updated = useUserMgmtSlice.getState().users.find(u => u.id === newUser.id);
        expect(updated?.role).toBe('高级开发者');
        expect(updated?.apiCalls).toBe(200);

        // 3. 锁定用户
        useUserMgmtSlice.getState().toggleLock(newUser.id);
        expect(useUserMgmtSlice.getState().users.find(u => u.id === newUser.id)?.locked).toBe(true);

        // 4. 解锁用户
        useUserMgmtSlice.getState().toggleLock(newUser.id);
        expect(useUserMgmtSlice.getState().users.find(u => u.id === newUser.id)?.locked).toBe(false);

        // 5. 删除用户
        useUserMgmtSlice.getState().removeUser(newUser.id);
        expect(useUserMgmtSlice.getState().users.find(u => u.username === 'lifecycle_test')).toBeUndefined();
      }
    });

    it('批量操作多个用户', () => {
      const initialCount = useUserMgmtSlice.getState().users.length;

      // 批量添加3个用户
      for (let i = 1; i <= 3; i++) {
        useUserMgmtSlice.getState().addUser({
          name: `批量用户${i}`,
          username: `batch_user_${i}`,
          email: `batch${i}@cloudpivot.ai`,
          role: '测试工程师',
          status: 'online',
          lastLogin: new Date().toISOString(),
          sessions: 0,
          apiCalls: 0,
          locked: false,
        });
      }

      expect(useUserMgmtSlice.getState().users.length).toBe(initialCount + 3);

      // 批量锁定所有新用户
      const batchUsers = useUserMgmtSlice.getState().users.filter(
        u => u.username.startsWith('batch_user_')
      );

      batchUsers.forEach(user => {
        useUserMgmtSlice.getState().toggleLock(user.id);
      });

      // 验证所有批量用户都被锁定
      batchUsers.forEach(user => {
        const updated = useUserMgmtSlice.getState().users.find(u => u.id === user.id);
        expect(updated?.locked).toBe(true);
      });
    });
  });
});
