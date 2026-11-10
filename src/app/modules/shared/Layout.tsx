/**
 * @file: Layout.tsx
 * @description: Layout.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-19
 * @updated: 2026-03-19
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import React, { useState, useContext, Suspense, useMemo, useCallback } from "react";
import { Outlet, useLocation } from "react-router";
import { Toaster } from "sonner";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { AIAssistant } from "./AIAssistant";
import { PWAInstallPrompt } from "../admin/PWAInstallPrompt";
import { OfflineIndicator } from "./OfflineIndicator";
import { ErrorBoundary } from "./ErrorBoundary";
import { CommandPalette } from "./CommandPalette";
import { IntegratedTerminal } from "../dev/IntegratedTerminal";
import { useWebSocketData } from "../../hooks/useWebSocketData";
import { useMobileView } from "../../hooks/useMobileView";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { usePageConfig } from "../../hooks/usePageConfig";
import { getPageConfigOverride, type PageLayout } from "../../config";
import { AuthContext } from "../../lib/authContext";
import { WebSocketContext, ViewContext } from "../../lib/view-context";

/** 页面布局配置 → Tailwind 类映射（仅显式覆盖时接管，默认保持现状） */
const MAX_W_CLASS: Record<PageLayout["maxWidth"], string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "",
};

const PAD_CLASS: Record<PageLayout["padding"], string> = {
  none: "p-0",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

/**
 * 路由懒加载 Suspense fallback — 赛博朋克风格加载指示器
 */
function RouteFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[rgba(0,212,255,0.15)] border-t-[#00d4ff] rounded-full animate-spin" />
        <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.72rem" }}>
          Loading module...
        </span>
      </div>
    </div>
  );
}

export function Layout() {
  const wsData = useWebSocketData();
  const view = useMobileView();
  const auth = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const isDesktop = !view.isMobile && !view.isTablet;

  // 页面配置消费（P0：面板编辑即生效）
  // showHeader/showSidebar：注册表默认全 true，仅显式编辑为 false 时隐藏
  // showBottomNav/maxWidth/padding：注册表默认与现状不一致，仅显式覆盖时接管
  const { config: pageConfig } = usePageConfig();
  const pageOverride = pageConfig ? getPageConfigOverride(pageConfig.id) : undefined;
  const showHeader = pageConfig?.layout.showHeader ?? true;
  const showSidebar = pageConfig?.layout.showSidebar ?? true;
  const showBottomNav = pageOverride?.layout?.showBottomNav ?? true;
  const maxWidthCls = pageOverride?.layout?.maxWidth ? MAX_W_CLASS[pageOverride.layout.maxWidth] : "";
  const paddingCls = pageOverride?.layout?.padding ? PAD_CLASS[pageOverride.layout.padding] : null;

  const stableView = useMemo(() => view, [view]);

  const handleEscape = useCallback(() => {
    setMobileMenuOpen(false);
    setCommandPaletteOpen(false);
    setTerminalOpen(false);
  }, []);
  const handleSearch = useCallback(() => setCommandPaletteOpen(true), []);
  const handleToggleTerminal = useCallback(() => setTerminalOpen((prev) => !prev), []);

  useKeyboardShortcuts({
    enabled: true,
    onEscape: handleEscape,
    onSearch: handleSearch,
    onToggleTerminal: handleToggleTerminal,
  });

  return (
    <WebSocketContext.Provider value={wsData}>
      <ViewContext.Provider value={stableView}>
        <div className="h-screen w-screen flex flex-col overflow-hidden" style={{
          background: "linear-gradient(135deg, #060e1f 0%, #0a1628 30%, #081430 60%, #040c1a 100%)",
        }}>
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `
                linear-gradient(rgba(0,212,255,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)
              `,
              backgroundSize: view.isMobile ? "40px 40px" : "60px 60px",
            }} />
            {/* Gradient orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full opacity-[0.06]"
              style={{ background: "radial-gradient(circle, #00d4ff, transparent 70%)" }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full opacity-[0.04]"
              style={{ background: "radial-gradient(circle, #7b2ff7, transparent 70%)" }} />
            <div className="absolute top-[40%] left-[50%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full opacity-[0.03]"
              style={{ background: "radial-gradient(circle, #00ff88, transparent 70%)" }} />
            {/* Scan line */}
            <div className="absolute w-full h-[2px] opacity-[0.03] animate-[scanline_8s_linear_infinite]"
              style={{ background: "linear-gradient(90deg, transparent, #00d4ff, transparent)" }} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* TopBar: minimal, always on top（page-config layout.showHeader 可关闭） */}
            {showHeader && (
            <TopBar
              connectionState={wsData.connectionState}
              isSimulated={wsData.isSimulated}
              reconnectCount={wsData.reconnectCount}
              lastSyncTime={wsData.lastSyncTime}
              onReconnect={wsData.manualReconnect}
              isMobile={view.isMobile}
              isTablet={view.isTablet}
              mobileMenuOpen={mobileMenuOpen}
              onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
              onLogout={auth.logout}
              userEmail={auth.userEmail}
              userRole={auth.userRole}
              onToggleTerminal={() => setTerminalOpen(prev => !prev)}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
            )}

            {/* Main area: Sidebar (desktop) + Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar: desktop only（page-config layout.showSidebar 可关闭） */}
              {isDesktop && showSidebar && (
                <Sidebar
                  collapsed={sidebarCollapsed}
                  onToggle={() => setSidebarCollapsed((prev) => !prev)}
                />
              )}

              {/* Page content */}
              <div className={`flex-1 overflow-auto ${
                paddingCls ?? (
                  location.pathname.startsWith("/ai-family")
                    ? ""
                    : view.isMobile ? "px-3 pt-2 pb-[72px]" : view.isTablet ? "px-4 pt-3 pb-[72px]" : "p-4"
                )
              }`}>
                <div className={maxWidthCls ? `${maxWidthCls} mx-auto w-full` : "w-full"}>
                  <ErrorBoundary level="module" source="PageContent">
                    <Suspense fallback={<RouteFallback />}>
                      <Outlet />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            {/* Bottom Nav - mobile & tablet only（page-config 显式覆盖可关闭） */}
            {(view.isMobile || view.isTablet) && showBottomNav && <BottomNav />}
          </div>

          {/* AI 智能助理浮窗 */}
          <AIAssistant isMobile={view.isMobile} />

          {/* 全局命令面板 (⌘K) */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />

          {/* 集成终端 (Ctrl+`) */}
          <IntegratedTerminal
            open={terminalOpen}
            onClose={() => setTerminalOpen(false)}
          />

          {/* PWA 安装提示 */}
          <PWAInstallPrompt />

          {/* 离线状态指示器 */}
          <OfflineIndicator />

          {/* Toast notifications */}
          <Toaster
            position={view.isMobile ? "top-center" : "top-right"}
            toastOptions={{
              style: {
                background: "rgba(8, 25, 55, 0.95)",
                border: "1px solid rgba(0, 180, 255, 0.2)",
                color: "#e0f0ff",
                backdropFilter: "blur(10px)",
              },
            }}
          />

          <style>{`
            @keyframes scanline {
              0% { top: 0%; }
              100% { top: 100%; }
            }
          `}</style>
        </div>
      </ViewContext.Provider>
    </WebSocketContext.Provider>
  );
}