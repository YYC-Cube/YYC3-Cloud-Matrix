/**
 * @file: supabaseClientReal.ts
 * @description: supabaseClientReal.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppUser, AppSession } from '../types';

// ============================================================
// 环境配置
// ============================================================

// @ts-ignore - Vite env
const env = import.meta.env;
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const USE_MOCK = !SUPABASE_URL || !SUPABASE_ANON_KEY || env.VITE_USE_MOCK_AUTH === 'true';

// ============================================================
// 类型适配器
// ============================================================

/**
 * Supabase User → AppUser
 */
export function toAppUser(supabaseUser: { id: string; email?: string; user_metadata?: { role?: string; name?: string } }): AppUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role: (supabaseUser.user_metadata?.role as "admin" | "developer") || 'developer',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
  };
}

/**
 * Supabase Session → AppSession
 */
export function toAppSession(supabaseSession: { user: { id: string; email?: string; user_metadata?: { role?: string; name?: string } }; access_token: string; expires_at?: number }): AppSession {
  return {
    user: toAppUser(supabaseSession.user),
    token: supabaseSession.access_token,
    expiresAt: new Date((supabaseSession.expires_at ?? Date.now() / 1000) * 1000).getTime(),
  };
}

/**
 * AppUser → Supabase User Metadata
 */
export function toSupabaseMetadata(user: Partial<AppUser>): Record<string, unknown> {
  return {
    role: user.role || 'developer',
    name: user.name || '',
  };
}

// ============================================================
// 真实 Supabase 客户端
// ============================================================

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient!;
}

// ============================================================
// Mock 客户端（降级方案）
// 安全设计：密码从环境变量读取，未配置时为空（需通过UI设置）
// 用户数据归用户 — 所有凭据均可在 SystemSettings 界面中修改
// ============================================================

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

const GHOST_USER: AppUser = {
  id: "ghost-000",
  email: "ghost@yyc3.local",
  role: "admin",
  name: "Ghost Operator",
};

const SESSION_KEY = "yyc3_session";
const GHOST_KEY = "yyc3_ghost";

class MockSupabaseClient {
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const entry = MOCK_USERS[email];
      if (!entry || entry.password !== password) {
        return { data: null, error: { message: "邮箱或密码不正确" } };
      }
      const session: AppSession = {
        user: entry.user,
        token: `mock_token_${Date.now()}`,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { data: { user: entry.user, session }, error: null };
    },

    getSession: async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) {return { data: { session: null }, error: null };}
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

    getUser: async () => {
      const { data } = await this.auth.getSession();
      if (data.session) {
        return { data: { user: data.session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(GHOST_KEY);
      return { error: null };
    },

    onAuthStateChange: (callback: (event: string, session: AppSession | null) => void) => {
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
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };

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

// ============================================================
// 统一导出接口
// ============================================================

export const supabase = USE_MOCK ? new MockSupabaseClient() : getSupabaseClient();

/**
 * 幽灵登录（仅限开发环境）
 */
export function ghostSignIn(): AppSession | null {
  // @ts-ignore - Vite env
  if (import.meta.env.PROD) {
    console.error('[Auth] Ghost mode is disabled in production builds');
    return null;
  }
  const session: AppSession = {
    user: GHOST_USER,
    token: `ghost_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(GHOST_KEY, "1");
  return session;
}

/**
 * 检查是否为幽灵模式
 */
export function isGhostMode(): boolean {
  // @ts-ignore - Vite env
  if (import.meta.env.PROD) { return false; }
  return localStorage.getItem(GHOST_KEY) === "1";
}

/**
 * 检查是否使用 Mock 模式
 */
export function isMockMode(): boolean {
  return USE_MOCK;
}

/**
 * 获取当前认证模式
 */
export function getAuthMode(): 'real' | 'mock' {
  return USE_MOCK ? 'mock' : 'real';
}

// ============================================================
// 增强版认证方法（可选）
// ============================================================

/**
 * 注册新用户
 */
export async function signUp(email: string, password: string, name?: string) {
  if (USE_MOCK) {
    return { data: null, error: { message: "Mock 模式不支持注册" } };
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: toSupabaseMetadata({ name }),
    },
  });

  if (error) {return { data: null, error };}

  return {
    data: {
      user: data.user ? toAppUser(data.user) : null,
      session: data.session ? toAppSession(data.session) : null,
    },
    error: null,
  };
}

/**
 * 重置密码
 */
export async function resetPassword(email: string) {
  if (USE_MOCK) {
    return { error: { message: "Mock 模式不支持密码重置" } };
  }

  const client = getSupabaseClient();
  const { error } = await client.auth.resetPasswordForEmail(email);
  return { error };
}

/**
 * 更新用户信息
 */
export async function updateUser(updates: Partial<AppUser>) {
  if (USE_MOCK) {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {return { error: { message: "未登录" } };}
    
    const session: AppSession = JSON.parse(raw);
    session.user = { ...session.user, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { error: null };
  }

  const client = getSupabaseClient();
  const { error } = await client.auth.updateUser({
    data: toSupabaseMetadata(updates),
  });

  return { error };
}

// ============================================================
// 调试信息
// ============================================================

if (typeof window !== 'undefined') {
  console.info('[Supabase] 认证模式:', getAuthMode());
  if (USE_MOCK) {
    console.warn('[Supabase] 使用 Mock 模式 - 请配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  } else {
    console.info('[Supabase] 连接地址:', SUPABASE_URL);
  }
}
