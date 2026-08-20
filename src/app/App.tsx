/**
 * @file: App.tsx
 * @description: 根组件 · 提供认证、路由、国际化上下文
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-09
 * @status: active
 * @tags: [component],[root],[context]
 *
 * @brief: 应用根组件
 *
 * @details:
 * - 提供认证上下文（AuthContext）
 * - 提供国际化上下文（I18nContext）
 * - 配置路由（React Router）
 * - 全局错误边界处理
 * - Figma 平台错误过滤
 *
 * @dependencies: React, React Router, AuthContext, I18nContext
 * @exports: App (default)
 * @notes: 所有上下文提供者都在此组件中初始化
 */

import React, { useState, useEffect, useCallback } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Login } from "./modules/shared/Login";
import { ErrorBoundary } from "./modules/shared/ErrorBoundary";
import { installGlobalErrorListeners } from "./lib/error-handler";
import { supabase, ghostSignIn, isGhostMode } from "./lib/supabaseClient";
import { useYYC3Head } from "./hooks/useYYC3Head";
import { useI18nProvider, I18nContext } from "./hooks/useI18n";
import { AuthContext } from "./lib/authContext";
import { isFigmaPlatformError } from "./lib/figma-error-filter";
import { FamilyDataAccessor } from "./modules/ai-family/lib/family-data-accessor";
import { useFamilyMemberSlice } from "./store";
import { refreshFromStore } from "./modules/ai-family/components/shared";
import type { UserRole, AppSession } from "./types";

// ────────────────────────────────────────────────────────────────
// RF-003: Figma 平台 iframe 通信错误静默拦截
// 使用统一判定函数 isFigmaPlatformError()，消除重复逻辑
// 必须在 React 挂载前注册 capture phase，阻止错误冒泡到 error-handler
// ────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    const name = reason?.name || reason?.constructor?.name || "";
    const msg = String(reason?.message || reason || "");
    const stack = reason?.stack || "";
    if (isFigmaPlatformError(name, msg, undefined, stack)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true); // capture phase — runs before any other listener

  window.addEventListener("error", (e) => {
    const src = e.filename || "";
    const msg = String(e.message || "");
    const name = e.error?.name || e.error?.constructor?.name || "";
    const stack = e.error?.stack || "";
    if (isFigmaPlatformError(name, msg, src, stack)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  // Layer 0: legacy window.onerror — return true to fully swallow the error
  const _prevOnerror = window.onerror;
   
  window.onerror = function (this: Window & typeof globalThis, message, source, _lineno, _colno, error) {
    const name = error?.name || error?.constructor?.name || "";
    const msg = String(message || "");
    const src = String(source || "");
    const stack = error?.stack || "";
    if (isFigmaPlatformError(name, msg, src, stack)) {
      return true; // suppress completely
    }
    if (typeof _prevOnerror === "function") {
      return _prevOnerror.call(this, message, source, _lineno, _colno, error);
    }
    return false;
  };

  // Layer 0b: MessagePort error — intercept broken port communications from Figma iframe
  window.addEventListener("messageerror", (e) => {
    // MessagePort errors from Figma's iframe channel are safe to suppress
    e.stopImmediatePropagation();
  }, true);

  // Layer 0c: Suppress console.error noise from Figma platform errors
  // Some Figma errors bypass event listeners and get logged directly via console.error
  const _origConsoleError = console.error;
  console.error = function (...args: unknown[]) {
    const joined = args.map(a => String(a ?? "")).join(" ").toLowerCase();
    if (
      joined.includes("iframemessageaborterror") ||
      joined.includes("message aborted") ||
      joined.includes("message port was destroyed") ||
      joined.includes("setupmessagechannel") ||
      (joined.includes("figma") && joined.includes("abort"))
    ) {
      return; // suppress silently
    }
    return _origConsoleError.apply(console, args);
  };
}

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole | "">("");
  const [isGhost, setIsGhost] = useState(false);

  // 国际化
  const i18nValue = useI18nProvider();

  // 注入 YYC3 品牌 <head> 标签 (favicon / manifest / theme-color / title)
  useYYC3Head();

  // 安装全局错误监听器 + 初始化非 React 服务层
  useEffect(() => {
    installGlobalErrorListeners();
    // 注入 store 成员数据到 FamilyDataAccessor（供非 React 库读取）
    FamilyDataAccessor.initialize(useFamilyMemberSlice.getState().members);
    // 刷新 shared.ts 的 FAMILY_MEMBERS 为 store-backed 数据
    refreshFromStore();
  }, []);

  useEffect(() => {
    // 检查现有会话（带超时保护，防止 iframe 沙盒阻塞）
    const timeout = setTimeout(() => {
      // 超时兜底：3 秒内未完成认证检查，默认未登录
      setAuthenticated((prev) => (prev === null ? false : prev));
    }, 3000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        clearTimeout(timeout);
        setAuthenticated(!!data.session);
        if (data.session) {
          const session = data.session as AppSession;
          setUserEmail(session.user?.email ?? "admin@cloudpivot.local");
          setUserRole(session.user?.role ?? "admin");
          setIsGhost(isGhostMode());
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setAuthenticated(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session as AppSession | null;
      setUserEmail(session?.user?.email ?? "admin@cloudpivot.local");
      setUserRole(session?.user?.role ?? "admin");
      setIsGhost(isGhostMode());
    });
    setAuthenticated(true);
  }, []);

  /** ��灵登录 · 跳过认证直接进入 */
  const handleGhostLogin = useCallback(() => {
    const session = ghostSignIn();
    if (!session) { return; }
    setUserEmail(session.user.email);
    setUserRole(session.user.role as UserRole);
    setIsGhost(true);
    setAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setUserEmail("");
    setUserRole("");
    setIsGhost(false);
  }, []);

  // 初始化检查中 - 显示加载
  if (authenticated === null) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 30%, #081430 60%, #040c1a 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[rgba(0,212,255,0.2)] border-t-[#00d4ff] rounded-full animate-spin" />
          <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.75rem" }}>
            正在初始化...
          </span>
        </div>
      </div>
    );
  }

  // 未登录 - 显示登录页
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} onGhostLogin={handleGhostLogin} />;
  }

  // 已登录 - 显示主应用
  return (
    <ErrorBoundary level="page" source="App">
      <AuthContext.Provider value={{ logout: handleLogout, userEmail, userRole, isGhost }}>
        <I18nContext.Provider value={i18nValue}>
          <RouterProvider router={router} />
        </I18nContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}