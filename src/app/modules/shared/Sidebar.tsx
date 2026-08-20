/**
 * @file: Sidebar.tsx
 * @description: Sidebar.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  BookOpen,
  Brain,
  BrainCircuit,
  Building2,
  ChevronLeft, ChevronRight,
  ClipboardList,
  Code2,
  Cog,
  Cpu,
  Database,
  FileBarChart,
  FolderOpen,
  Gauge,
  GitBranch,
  HardDrive,
  House,
  Layers,
  MessageCircle,
  Monitor,
  Package,
  Paintbrush,
  Palette,
  Radar,
  Radio,
  RefreshCcw,
  ServerCog,
  Settings2,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  UserCircle2,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useI18n } from "../../hooks/useI18n";
import { YYC3Logo } from "./YYC3Logo";

/* ── 导航数据结构 ──────────────────────────────── */
interface NavChild {
  key: string;
  path: string;
  icon: React.ElementType;
}

interface NavCategory {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  children: NavChild[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "monitor",
    labelKey: "nav.catMonitor",
    icon: Activity,
    children: [
      { key: "nav.dataMonitor", path: "/", icon: BarChart3 },
      { key: "nav.followUp", path: "/follow-up", icon: AlertTriangle },
      { key: "nav.followUpManager", path: "/follow-up-manager", icon: ClipboardList },
      { key: "nav.patrol", path: "/patrol", icon: Radar },
      { key: "nav.alertRules", path: "/alerts", icon: BellRing },
    ],
  },
  {
    id: "ops",
    labelKey: "nav.catOps",
    icon: Wrench,
    children: [
      { key: "nav.operations", path: "/operations", icon: RefreshCcw },
      { key: "nav.fileManager", path: "/files", icon: FolderOpen },
      { key: "nav.hostFiles", path: "/host-files", icon: HardDrive },
      { key: "nav.database", path: "/database", icon: Database },
      { key: "nav.dbConnections", path: "/db-connections", icon: Database },
      { key: "nav.connectionTest", path: "/connection-test", icon: Zap },
      { key: "nav.serviceLoop", path: "/loop", icon: SettingsIcon },
      { key: "nav.reportExport", path: "/reports", icon: FileBarChart },
      { key: "nav.exportCenter", path: "/export-center", icon: Package },
      { key: "nav.connectionMonitor", path: "/connection-monitor", icon: Activity },
    ],
  },
  {
    id: "ai",
    labelKey: "nav.catAI",
    icon: Brain,
    children: [
      { key: "nav.aiDecision", path: "/ai", icon: Sparkles },
      { key: "modelProvider.title", path: "/models", icon: Cpu },
      { key: "nav.aiDiagnostics", path: "/ai-diagnosis", icon: BrainCircuit },
      { key: "nav.sdkChat", path: "/sdk-chat", icon: MessageCircle },
    ],
  },
  {
    id: "ai-family",
    labelKey: "nav.catAIFamily",
    icon: UserCircle2,
    children: [
      { key: "nav.aiFamily", path: "/ai-family", icon: UserCircle2 },
      { key: "nav.aiFamilyHome", path: "/ai-family/home", icon: House },
      { key: "nav.aiFamilyCenter", path: "/ai-family/center", icon: Sparkles },
      { key: "nav.aiFamilyModels", path: "/ai-family/models", icon: Cpu },
      { key: "nav.aiFamilySettings", path: "/ai-family/settings", icon: Settings2 },
    ],
  },
  {
    id: "business",
    labelKey: "nav.catBusiness",
    icon: Building2,
    children: [
      { key: "nav.hotelDashboard", path: "/hotel", icon: Building2 },
      { key: "nav.commStation", path: "/comm-station", icon: Radio },
    ],
  },
  {
    id: "dev",
    labelKey: "nav.catDev",
    icon: Code2,
    children: [
      { key: "nav.designSystem", path: "/design-system", icon: Palette },
      { key: "nav.devGuide", path: "/dev-guide", icon: BookOpen },
      { key: "nav.theme", path: "/theme", icon: Paintbrush },
      { key: "nav.terminal", path: "/terminal", icon: Terminal },
      { key: "nav.ide", path: "/ide", icon: Monitor },
      { key: "nav.refactoring", path: "/refactoring", icon: GitBranch },
      { key: "nav.architecture", path: "/architecture", icon: Layers },
    ],
  },
  {
    id: "admin",
    labelKey: "nav.catAdmin",
    icon: ShieldCheck,
    children: [
      { key: "nav.audit", path: "/audit", icon: ClipboardList },
      { key: "nav.userMgmt", path: "/users", icon: Users },
      { key: "nav.settings", path: "/settings", icon: Cog },
      { key: "nav.unifiedSettings", path: "/unified-settings", icon: Settings2 },
      { key: "nav.securityMonitor", path: "/security", icon: ShieldCheck },
      { key: "nav.pwa", path: "/pwa", icon: Smartphone },
      { key: "nav.dataEditor", path: "/data-editor", icon: Package },
      { key: "nav.performance", path: "/performance", icon: Gauge },
      { key: "nav.envConfig", path: "/env-config", icon: ServerCog },
      { key: "nav.storageManager", path: "/storage", icon: HardDrive },
      { key: "nav.configCenter", path: "/config-center", icon: SettingsIcon },
      { key: "nav.variableCenter", path: "/variables", icon: Cog },
    ],
  },
];

// backward compat export
export const navItems = NAV_CATEGORIES.flatMap((c) =>
  c.children.map((ch) => ({ label: ch.key, path: ch.path }))
);

/* ── 辅助函数 ──────────────────────────────── */
function getActiveCategoryId(pathname: string): string {
  for (const cat of NAV_CATEGORIES) {
    if (cat.children.some((c) => c.path === pathname)) { return cat.id; }
  }
  return "monitor";
}

/* ── 组件 ──────────────────────────────────── */
export const SIDEBAR_COLLAPSED_W = 52;
export const SIDEBAR_EXPANDED_W = 208;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const activeCatId = getActiveCategoryId(location.pathname);
  const [hoverCatId, setHoverCatId] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // debounced hover
  const handleMouseEnter = useCallback((catId: string) => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); }
    setHoverCatId(catId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => setHoverCatId(null), 180);
  }, []);

  // keep flyout open while hovering it
  const handleFlyoutEnter = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); }
  }, []);

  // close on navigate
  useEffect(() => {
    setHoverCatId(null);
  }, [location.pathname]);

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;

  return (
    <div
      className="relative h-full shrink-0 flex flex-col z-30"
      style={{ width: sidebarW, transition: "width 0.2s cubic-bezier(.4,0,.2,1)" }}
    >
      {/* ── 侧边栏主体 ── */}
      <div className="h-full flex flex-col bg-[rgba(4,10,22,0.95)] backdrop-blur-2xl border-r border-[rgba(0,180,255,0.08)]">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0 border-b border-[rgba(0,180,255,0.06)]"
          style={{ height: 52, padding: collapsed ? "0 12px" : "0 14px" }}
          onClick={() => navigate("/")}
        >
          <div className="shrink-0 w-7 h-7 flex items-center justify-center">
            <YYC3Logo size="xs" showStatus={false} glow={false} />
          </div>
          {!collapsed && (
            <span
              className="text-[#00d4ff] tracking-[0.15em] whitespace-nowrap overflow-hidden"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.82rem", opacity: 0.9 }}
            >
              YYC³
            </span>
          )}
        </div>

        {/* ── 导航分类 ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-none">
          {NAV_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isCatActive = cat.id === activeCatId;
            const isHover = hoverCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* ── 分类按钮 ── */}
                <button
                  data-testid={`nav-cat-${cat.id}`}
                  onClick={() => {
                    // 点击分类：导航到第一个子项
                    const firstChild = cat.children[0];
                    if (firstChild) { navigate(firstChild.path); }
                  }}
                  className="w-full relative group"
                  style={{ padding: collapsed ? "8px 0" : "6px 10px" }}
                >
                  <div
                    className={`
                      flex items-center gap-2.5 rounded-lg transition-all duration-150
                      ${isCatActive
                        ? "text-[#00d4ff]"
                        : "text-[rgba(0,212,255,0.35)] hover:text-[rgba(0,212,255,0.7)]"
                      }
                    `}
                    style={{ padding: collapsed ? "8px 0" : "7px 8px", justifyContent: collapsed ? "center" : "flex-start" }}
                  >
                    {/* 左侧激活指示条 */}
                    {isCatActive && (
                      <div
                        className="absolute left-0 w-[2px] rounded-r-full bg-[#00d4ff]"
                        style={{
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: 20,
                          boxShadow: "0 0 8px rgba(0,212,255,0.5)",
                        }}
                      />
                    )}

                    <CatIcon className="w-[18px] h-[18px] shrink-0" />

                    {!collapsed && (
                      <span
                        className="whitespace-nowrap overflow-hidden"
                        style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}
                      >
                        {t(cat.labelKey)}
                      </span>
                    )}
                  </div>
                </button>

                {/* ── 展开模式下直接显示子项 ── */}
                {!collapsed && (
                  <div className="ml-[18px] pl-3 border-l border-[rgba(0,180,255,0.06)]">
                    {cat.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive = location.pathname === child.path;
                      return (
                        <button
                          key={child.path}
                          data-testid={`nav-item-${child.key}`}
                          onClick={() => navigate(child.path)}
                          className={`
                            w-full flex items-center gap-2 rounded-md my-px transition-all duration-150
                            ${isActive
                              ? "bg-[rgba(0,212,255,0.08)] text-[#00d4ff]"
                              : "text-[rgba(0,212,255,0.3)] hover:text-[rgba(0,212,255,0.65)] hover:bg-[rgba(0,212,255,0.03)]"
                            }
                          `}
                          style={{ padding: "5px 8px", fontSize: "0.68rem" }}
                        >
                          <ChildIcon className="w-3.5 h-3.5 shrink-0" style={{ opacity: isActive ? 0.9 : 0.5 }} />
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t(child.key)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── 折叠模式下的 Flyout 浮层 ── */}
                {collapsed && isHover && (
                  <div
                    ref={flyoutRef}
                    onMouseEnter={handleFlyoutEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute z-50"
                    style={{
                      left: SIDEBAR_COLLAPSED_W - 2,
                      top: 0,
                      minWidth: 180,
                    }}
                  >
                    <div className="ml-1.5 rounded-xl border border-[rgba(0,180,255,0.15)] bg-[rgba(6,14,30,0.98)] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
                      {/* 分类标题 */}
                      <div
                        className="flex items-center gap-2 px-3 border-b border-[rgba(0,180,255,0.06)]"
                        style={{ padding: "10px 14px 8px" }}
                      >
                        <CatIcon className="w-3.5 h-3.5 text-[rgba(0,212,255,0.4)]" />
                        <span
                          className="text-[rgba(0,212,255,0.5)]"
                          style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
                        >
                          {t(cat.labelKey)}
                        </span>
                      </div>

                      {/* 子项列表 */}
                      <div className="py-1">
                        {cat.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isActive = location.pathname === child.path;
                          return (
                            <button
                              key={child.path}
                              data-testid={`flyout-nav-item-${child.key}`}
                              onClick={() => navigate(child.path)}
                              className={`
                                w-full flex items-center gap-2.5 text-left transition-all duration-100
                                ${isActive
                                  ? "bg-[rgba(0,212,255,0.08)] text-[#00d4ff]"
                                  : "text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.04)]"
                                }
                              `}
                              style={{ padding: "8px 14px", fontSize: "0.74rem" }}
                            >
                              {isActive && (
                                <div className="w-[3px] h-3.5 rounded-full bg-[#00d4ff] shadow-[0_0_6px_rgba(0,212,255,0.5)] shrink-0" />
                              )}
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" style={{ opacity: isActive ? 1 : 0.5 }} />
                              <span>{t(child.key)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── 底部操作 ── */}
        <div className="shrink-0 border-t border-[rgba(0,180,255,0.06)] py-2">
          <button
            onClick={onToggle}
            data-testid="sidebar-toggle-btn"
            className="w-full flex items-center gap-2 text-[rgba(0,212,255,0.25)] hover:text-[rgba(0,212,255,0.5)] transition-all"
            style={{
              padding: collapsed ? "8px 0" : "6px 18px",
              justifyContent: collapsed ? "center" : "flex-start",
              fontSize: "0.65rem",
            }}
            title={collapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span style={{ letterSpacing: "0.04em" }}>收起</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
