/**
 * @file: user-mgmt-slice.ts
 * @description: user-mgmt-slice.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-15
 * @status: active
 * @tags: [type]
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRecord } from '../../types';

const DEFAULT_USERS: UserRecord[] = [
  { id: "usr-1", name: "张管理", username: "admin", email: "admin@cloudpivot.ai", role: "超级管理员", status: "online", lastLogin: "2026-02-22 14:30", sessions: 3, apiCalls: 1284, locked: false },
  { id: "usr-2", name: "李运维", username: "ops_li", email: "ops_li@cloudpivot.ai", role: "运维工程师", status: "online", lastLogin: "2026-02-22 14:25", sessions: 1, apiCalls: 856, locked: false },
  { id: "usr-3", name: "王开发", username: "dev_wang", email: "dev_wang@cloudpivot.ai", role: "开发者", status: "online", lastLogin: "2026-02-22 14:18", sessions: 2, apiCalls: 2105, locked: false },
  { id: "usr-4", name: "赵分析", username: "analyst_zhao", email: "zhao@cloudpivot.ai", role: "数据分析师", status: "online", lastLogin: "2026-02-22 13:55", sessions: 1, apiCalls: 432, locked: false },
  { id: "usr-5", name: "刘测试", username: "qa_liu", email: "qa_liu@cloudpivot.ai", role: "测试工程师", status: "offline", lastLogin: "2026-02-21 18:30", sessions: 0, apiCalls: 321, locked: false },
];

export interface UserMgmtSlice {
  users: UserRecord[];
  addUser: (user: Omit<UserRecord, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserRecord>) => void;
  removeUser: (id: string) => void;
  toggleLock: (id: string) => void;
}

export const useUserMgmtSlice = create<UserMgmtSlice>()(
  persist(
    (set, _get) => ({
      users: DEFAULT_USERS,
      addUser: (user) => set((s) => ({ users: [...s.users, { ...user, id: `usr-${Date.now()}` }] })),
      updateUser: (id, updates) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, ...updates } : u) })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      toggleLock: (id) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, locked: !u.locked } : u) })),
    }),
    {
      name: 'yyc3-user-mgmt-slice',
      partialize: (state) => ({ users: state.users }),
    }
  )
);
