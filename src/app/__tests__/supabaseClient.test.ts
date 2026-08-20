/**
 * @file: supabaseClient.test.ts
 * @description: supabaseClient.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";

// ============================================================
// Mock import.meta.env - 必须在 import supabaseClient 之前
// ============================================================
vi.stubEnv("VITE_MOCK_ADMIN_PASSWORD", "admin123");
vi.stubEnv("VITE_MOCK_DEV_PASSWORD", "dev123");

// 动态导入 (确保 env stubs 生效)
let supabase: typeof import("../lib/supabaseClient").supabase;
let ghostSignIn: typeof import("../lib/supabaseClient").ghostSignIn;
let isGhostMode: typeof import("../lib/supabaseClient").isGhostMode;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("supabaseClient (Mock)", () => {
  beforeEach(async () => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // 重置模块并重新加载以确保环境变量生效
    vi.resetModules();
    const module = await import("../lib/supabaseClient");
    supabase = module.supabase;
    ghostSignIn = module.ghostSignIn;
    isGhostMode = module.isGhostMode;
  });

  // ----------------------------------------------------------
  // signInWithPassword
  // ----------------------------------------------------------

  describe("auth.signInWithPassword", () => {
    it("正确凭据应登录成功", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@cloudpivot.local",
        password: "admin123",
      });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.user.email).toBe("admin@cloudpivot.local");
      expect(data!.user.role).toBe("admin");
    });

    it("开发者账号应登录成功", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "dev@cloudpivot.local",
        password: "dev123",
      });

      expect(error).toBeNull();
      expect(data!.user.role).toBe("developer");
    });

    it("错误密码应返回错误", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@cloudpivot.local",
        password: "wrong-password",
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain("不正确");
    });

    it("不存在的邮箱应返回错误", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "nobody@example.com",
        password: "password",
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it("登录成功后应写入 localStorage", async () => {
      await supabase.auth.signInWithPassword({
        email: "admin@cloudpivot.local",
        password: "admin123",
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "yyc3_session",
        expect.any(String)
      );
    });
  });

  // ----------------------------------------------------------
  // getSession
  // ----------------------------------------------------------

  describe("auth.getSession", () => {
    it("未登录时应返回空会话", async () => {
      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });

    it("登录后应返回有效会话", async () => {
      await supabase.auth.signInWithPassword({
        email: "admin@cloudpivot.local",
        password: "admin123",
      });

      const { data } = await supabase.auth.getSession();
      expect(data.session).not.toBeNull();
      expect(data.session!.user.email).toBe("admin@cloudpivot.local");
    });

    it("会话过期后应返回空会话", async () => {
      // 手动写入一个过期会话
      const expiredSession = {
        user: { id: "test", email: "test@test.com", role: "admin", name: "Test" },
        token: "expired_token",
        expiresAt: Date.now() - 1000, // 已过期
      };
      localStorageMock.setItem("yyc3_session", JSON.stringify(expiredSession));

      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });

    it("localStorage 数据损坏时应返回空会话", async () => {
      localStorageMock.setItem("yyc3_session", "corrupted-data!!!");
      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });

    it("localStorage JSON 解析失败时应回调 SIGNED_OUT", () => {
      localStorageMock.setItem("yyc3_session", "corrupted-data!!!");

      const callback = vi.fn();
      supabase.auth.onAuthStateChange(callback);

      expect(callback).toHaveBeenCalledWith("SIGNED_OUT", null);
    });
  });

  // ----------------------------------------------------------
  // getUser
  // ----------------------------------------------------------

  describe("auth.getUser", () => {
    it("未登录时应返回 null 用户", async () => {
      const { data } = await supabase.auth.getUser();
      expect(data.user).toBeNull();
    });

    it("登录后应返回当前用户信息", async () => {
      await supabase.auth.signInWithPassword({
        email: "dev@cloudpivot.local",
        password: "dev123",
      });

      const { data } = await supabase.auth.getUser();
      expect(data.user).not.toBeNull();
      expect(data.user!.email).toBe("dev@cloudpivot.local");
      expect(data.user!.role).toBe("developer");
    });
  });

  // ----------------------------------------------------------
  // signOut
  // ----------------------------------------------------------

  describe("auth.signOut", () => {
    it("登出后会话应被清除", async () => {
      await supabase.auth.signInWithPassword({
        email: "admin@cloudpivot.local",
        password: "admin123",
      });

      await supabase.auth.signOut();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("yyc3_session");

      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // onAuthStateChange
  // ----------------------------------------------------------

  describe("auth.onAuthStateChange", () => {
    it("未登录时应回调 SIGNED_OUT", () => {
      const callback = vi.fn();
      supabase.auth.onAuthStateChange(callback);

      expect(callback).toHaveBeenCalledWith("SIGNED_OUT", null);
    });

    it("已登录时应回调 SIGNED_IN", async () => {
      await supabase.auth.signInWithPassword({
        email: "admin@cloudpivot.local",
        password: "admin123",
      });

      const callback = vi.fn();
      supabase.auth.onAuthStateChange(callback);

      expect(callback).toHaveBeenCalledWith("SIGNED_IN", expect.any(Object));
    });

    it("应返回包含 unsubscribe 函数的对象", () => {
      const { data } = supabase.auth.onAuthStateChange(() => {});
      expect(typeof data.subscription.unsubscribe).toBe("function");
    });
  });

  // ----------------------------------------------------------
  // from (Mock 查询)
  // ----------------------------------------------------------

  describe("from (Mock 查询)", () => {
    it("应返回空数据和 null 错误", () => {
      const result = supabase.from("any_table").select("*").eq("id", "1");
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("应支持 order 方法", () => {
      const result = supabase.from("any_table").select("*").order("created_at", { ascending: true });
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("应支持 limit 方法", () => {
      const result = supabase.from("any_table").select("*").limit(10);
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("应支持 then 方法（Promise 风格）", () => {
      const callback = vi.fn();
      supabase.from("any_table").select("*").then(callback);
      expect(callback).toHaveBeenCalledWith({ data: [], error: null, count: 0 });
    });
  });

  // ----------------------------------------------------------
  // ghostSignIn & isGhostMode
  // ----------------------------------------------------------

  describe("ghostSignIn", () => {
    it("应创建幽灵模式会话", () => {
      const session = ghostSignIn();
      expect(session).not.toBeNull();
      if (!session) { return; }
      expect(session.user.role).toBe("admin");
      expect(session.user.email).toBe("ghost@yyc3.local");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("yyc3_session", expect.any(String));
      expect(localStorageMock.setItem).toHaveBeenCalledWith("yyc3_ghost", "1");
    });

    it("应生成唯一 token", () => {
      const session1 = ghostSignIn();
      const session2 = ghostSignIn();
      expect(session1).not.toBeNull();
      expect(session2).not.toBeNull();
      if (!session1 || !session2) { return; }
      expect(session1.token).not.toBe(session2.token);
    });

    it("应设置 24 小时过期时间", () => {
      const session = ghostSignIn();
      expect(session).not.toBeNull();
      if (!session) { return; }
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      expect(session.expiresAt).toBeGreaterThan(now);
      expect(session.expiresAt).toBeLessThanOrEqual(now + oneDay + 1000);
    });
  });

  describe("isGhostMode", () => {
    it("幽灵登录后应返回 true", () => {
      ghostSignIn();
      expect(isGhostMode()).toBe(true);
    });

    it("未设置幽灵标志时应返回 false", () => {
      expect(isGhostMode()).toBe(false);
    });

    it("应读取 yyc3_ghost 标志", () => {
      localStorageMock.setItem("yyc3_ghost", "1");
      expect(isGhostMode()).toBe(true);

      localStorageMock.setItem("yyc3_ghost", "0");
      expect(isGhostMode()).toBe(false);

      localStorageMock.removeItem("yyc3_ghost");
      expect(isGhostMode()).toBe(false);
    });
  });
});