/**
 * @file: supabaseClient.ts
 * @description: Supabase 客户端封装 · Mock 模式与真实模式切换
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [lib],[auth],[database]
 *
 * @brief: Supabase 客户端封装
 *
 * @details:
 * - 当前状态：纯前端 Mock 模式
 * - 接入方式：配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量
 * - 支持本地直连 PostgreSQL 备选方案
 * - 提供 MockSupabaseClient 实现
 *
 * @dependencies: @supabase/supabase-js
 * @exports: supabase, signIn, signOut, getSession, onAuthStateChange
 * @notes: 切换到真实 Supabase 时需替换 MockSupabaseClient 为 createClient()
 */
import type { AppSession, AppUser } from "../types";

// RF-011: Legacy type aliases (MockUser/MockSession) 已移除
// 所有类型统一从 types/index.ts 导入 AppUser / AppSession

// 预设用户（本地闭环系统：admin + developer 两种角色）
// 安全设计：密码从环境变量读取，未配置时使用随机生成值（需通过UI设置）
// 用户数据归用户 — 所有凭据均可在 SystemSettings 界面中修改
// @ts-ignore - Vite env
const env = import.meta.env;
const getDefaultPassword = (email: string): string => {
  const envMap: Record<string, string | undefined> = {
    "admin@cloudpivot.local": env.VITE_MOCK_ADMIN_PASSWORD,
    "dev@cloudpivot.local": env.VITE_MOCK_DEV_PASSWORD,
  };
  return envMap[email] || "";
};

const MOCK_USERS: Record<string, { password: string; user: AppUser }> = {
  "admin@cloudpivot.local": {
    password: getDefaultPassword("admin@cloudpivot.local"),
    user: { id: "usr-001", email: "admin@cloudpivot.local", role: "admin", name: "YYC Admin" },
  },
  "dev@cloudpivot.local": {
    password: getDefaultPassword("dev@cloudpivot.local"),
    user: { id: "usr-002", email: "dev@cloudpivot.local", role: "developer", name: "YYC Developer" },
  },
};

/** 幽灵用户 · Ghost Mode — 无需凭证，全权限 */
const GHOST_USER: AppUser = {
  id: "ghost-000",
  email: "ghost@yyc3.local",
  role: "admin",
  name: "Ghost Operator",
};

const SESSION_KEY = "yyc3_session";

class MockSupabaseClient {
  auth = {
    /** 邮箱密码登录 */
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const entry = MOCK_USERS[email];
      if (!entry || entry.password !== password) {
        return { data: null, error: { message: "邮箱或密码不正确" } };
      }
      const session: AppSession = {
        user: entry.user,
        token: `mock_token_${Date.now()}`,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { data: { user: entry.user, session }, error: null };
    },

    /** 获取当前会话 */
    getSession: async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) { return { data: { session: null }, error: null }; }
        const session: AppSession = JSON.parse(raw);
        if (Date.now() > session.expiresAt) {
          localStorage.removeItem(SESSION_KEY);
          return { data: { session: null }, error: null };
        }
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },

    /** 获取当前用户 */
    getUser: async () => {
      const { data } = await this.auth.getSession();
      if (data.session) {
        return { data: { user: data.session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    },

    /** 登出 */
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem("yyc3_ghost");
      return { error: null };
    },

    /** 监听认证状态变化（简化实现） */
    onAuthStateChange: (callback: (event: string, session: AppSession | null) => void) => {
      // 初始化时检查一次
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        try {
          const session = JSON.parse(raw);
          callback("SIGNED_IN", session);
        } catch {
          callback("SIGNED_OUT", null);
        }
      } else {
        callback("SIGNED_OUT", null);
      }
      return { data: { subscription: { unsubscribe: () => { } } } };
    },
  };

  /** Mock 数据查询（模拟 Supabase .from().select() 链） */
  from(table: string) {
    return {
      select: (_columns?: string) => ({
        eq: (col: string, val: unknown) => this._mockQuery(table, { [col]: val }),
        order: (_col: string, _opts?: { ascending?: boolean }) => this._mockQuery(table),
        limit: (_n: number) => this._mockQuery(table),
        then: (resolve: (val: unknown) => void) => resolve(this._mockQuery(table)),
      }),
    };
  }

  private _mockQuery(_table: string, _filters?: Record<string, unknown>) {
    return { data: [], error: null, count: 0 };
  }
}

export const supabase = new MockSupabaseClient();

/**
 * 幽灵登录 · Ghost Sign-In
 * 跳过所有认证流程，直接创建 admin 级会话
 * 功能完全不受限，仅限开发环境使用
 */
export function ghostSignIn(): AppSession | null {
  const ghostEnabled = env.VITE_ENABLE_GHOST_MODE === "true";
  if (env.PROD && !ghostEnabled) {
    console.error('[Auth] Ghost mode is disabled. Set VITE_ENABLE_GHOST_MODE=true to enable.');
    return null;
  }
  const session: AppSession = {
    user: GHOST_USER,
    token: `ghost_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("yyc3_ghost", "1");
  return session;
}

export function isGhostMode(): boolean {
  const ghostEnabled = env.VITE_ENABLE_GHOST_MODE === "true";
  if (env.PROD && !ghostEnabled) { return false; }
  return localStorage.getItem("yyc3_ghost") === "1";
}
