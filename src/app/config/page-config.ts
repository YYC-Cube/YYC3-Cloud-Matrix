/**
 * @file: page-config.ts
 * @description: page-config.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type { ElementType } from "react";

// ═══════════════════════════════════════════════════════════════
//  页面配置类型定义
// ═══════════════════════════════════════════════════════════════

export interface PageConfig {
  id: string;
  path: string;
  title: string;
  titleEn: string;
  description: string;
  icon: ElementType;
  category: PageCategory;
  layout: PageLayout;
  header: PageHeaderConfig;
  sidebar: PageSidebarConfig;
  permissions: PagePermission[];
  storageKeys: string[];
  editable: boolean;
  version: string;
}

export type PageCategory =
  | "monitoring"
  | "operations"
  | "ai-family"
  | "ide"
  | "settings"
  | "data"
  | "system";

export interface PageLayout {
  showHeader: boolean;
  showSidebar: boolean;
  showBottomNav: boolean;
  maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding: "none" | "sm" | "md" | "lg";
  scrollable: boolean;
}

export interface PageHeaderConfig {
  showTitle: boolean;
  showBackButton: boolean;
  showActions: boolean;
  sticky: boolean;
  fontSize: "sm" | "md" | "lg";
}

export interface PageSidebarConfig {
  showInNav: boolean;
  navOrder: number;
  navGroup: string;
  badge?: string;
}

export type PagePermission = "admin" | "developer" | "guest";

// ═══════════════════════════════════════════════════════════════
//  页面注册表
// ═══════════════════════════════════════════════════════════════

export const PAGE_REGISTRY: Record<string, PageConfig> = {
  // ── 监控类 ──
  "data-monitoring": {
    id: "data-monitoring",
    path: "/",
    title: "数据监控",
    titleEn: "Data Monitoring",
    description: "实时数据监控仪表盘，展示节点状态、性能指标、告警信息",
    icon: "Activity" as unknown as ElementType,
    category: "monitoring",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 1,
      navGroup: "监控",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-dashboard-layout", "yyc3-dashboard-filters"],
    editable: true,
    version: "1.0.0",
  },

  "patrol-dashboard": {
    id: "patrol-dashboard",
    path: "/patrol",
    title: "巡查仪表盘",
    titleEn: "Patrol Dashboard",
    description: "系统健康度巡查、自动巡检任务管理",
    icon: "Shield" as unknown as ElementType,
    category: "monitoring",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 2,
      navGroup: "监控",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-patrol-config", "yyc3-patrol-history"],
    editable: true,
    version: "1.0.0",
  },

  "performance-monitor": {
    id: "performance-monitor",
    path: "/performance",
    title: "性能监控",
    titleEn: "Performance Monitor",
    description: "系统性能指标实时监控与分析",
    icon: "TrendingUp" as unknown as ElementType,
    category: "monitoring",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 3,
      navGroup: "监控",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-performance-thresholds"],
    editable: true,
    version: "1.0.0",
  },

  // ── 运维类 ──
  "operation-center": {
    id: "operation-center",
    path: "/operations",
    title: "运维中心",
    titleEn: "Operation Center",
    description: "运维操作编排、任务链管理、自动化执行",
    icon: "Settings" as unknown as ElementType,
    category: "operations",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 10,
      navGroup: "运维",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-operation-templates", "yyc3-operation-history"],
    editable: true,
    version: "1.0.0",
  },

  "follow-up": {
    id: "follow-up",
    path: "/follow-up",
    title: "跟进管理",
    titleEn: "Follow Up",
    description: "问题跟进、任务追踪、状态管理",
    icon: "ListTodo" as unknown as ElementType,
    category: "operations",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 11,
      navGroup: "运维",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3_follow_ups"],
    editable: true,
    version: "1.0.0",
  },

  "service-loop": {
    id: "service-loop",
    path: "/loop",
    title: "服务循环",
    titleEn: "Service Loop",
    description: "服务巡检循环、自动化任务调度",
    icon: "RefreshCw" as unknown as ElementType,
    category: "operations",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 12,
      navGroup: "运维",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-service-loop-config"],
    editable: true,
    version: "1.0.0",
  },

  // ── AI Family 类 ──
  "ai-family-home": {
    id: "ai-family-home",
    path: "/ai-family/home",
    title: "家族首页",
    titleEn: "Family Home",
    description: "AI Family 家族成员状态、动态展示、空间入口",
    icon: "Heart" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 20,
      navGroup: "AI Family",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-family-home-config"],
    editable: true,
    version: "1.0.0",
  },

  "ai-family-center": {
    id: "ai-family-center",
    path: "/ai-family/center",
    title: "Family中心",
    titleEn: "Family Center",
    description: "全景规划、信任公约、家族管理",
    icon: "Sparkles" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 21,
      navGroup: "AI Family",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-family-center-config"],
    editable: true,
    version: "1.0.0",
  },

  "ai-family-chat": {
    id: "ai-family-chat",
    path: "/ai-family/chat",
    title: "家人对话",
    titleEn: "Family Chat",
    description: "多轮对话、群聊、消息管理",
    icon: "MessageCircle" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 22,
      navGroup: "AI Family",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-family-chat-messages"],
    editable: true,
    version: "1.0.0",
  },

  "ai-family-music": {
    id: "ai-family-music",
    path: "/ai-family/music",
    title: "音乐空间",
    titleEn: "Family Music",
    description: "音乐推荐、情感音乐、行业资讯",
    icon: "Music" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 23,
      navGroup: "AI Family",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-family-music-config", "yyc3-family-music-playlist"],
    editable: true,
    version: "1.0.0",
  },

  "ai-family-voice": {
    id: "ai-family-voice",
    path: "/ai-family/voice",
    title: "语音系统",
    titleEn: "Voice System",
    description: "TTS/STT、语音对话、音色配置",
    icon: "Volume2" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 24,
      navGroup: "AI Family",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-family-voice-profiles", "yyc3-family-voice-conversations"],
    editable: true,
    version: "1.0.0",
  },

  "ai-family-models": {
    id: "ai-family-models",
    path: "/ai-family/models",
    title: "模型控制",
    titleEn: "Model Settings",
    description: "大模型绑定、API Key 管理、连接测试",
    icon: "Server" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 25,
      navGroup: "AI Family",
    },
    permissions: ["admin"],
    storageKeys: ["yyc3-family-model-assignments", "yyc3-family-provider-keys"],
    editable: true,
    version: "1.0.0",
  },

  "ai-family-ui-settings": {
    id: "ai-family-ui-settings",
    path: "/ai-family/ui-settings",
    title: "UI设置",
    titleEn: "UI Settings",
    description: "UI偏好、生态链路、智能测通、数据管理",
    icon: "Settings2" as unknown as ElementType,
    category: "ai-family",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: true,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 26,
      navGroup: "AI Family",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-family-ui-config"],
    editable: true,
    version: "1.0.0",
  },

  // ── IDE 类 ──
  "ide-panel": {
    id: "ide-panel",
    path: "/ide",
    title: "IDE 面板",
    titleEn: "IDE Panel",
    description: "集成开发环境、代码编辑、终端",
    icon: "Code" as unknown as ElementType,
    category: "ide",
    layout: {
      showHeader: false,
      showSidebar: false,
      showBottomNav: false,
      maxWidth: "full",
      padding: "none",
      scrollable: false,
    },
    header: {
      showTitle: false,
      showBackButton: false,
      showActions: false,
      sticky: false,
      fontSize: "md",
    },
    sidebar: {
      showInNav: true,
      navOrder: 30,
      navGroup: "开发",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-ide-layout", "yyc3-ide-settings"],
    editable: true,
    version: "1.0.0",
  },

  "cli-terminal": {
    id: "cli-terminal",
    path: "/terminal",
    title: "CLI 终端",
    titleEn: "CLI Terminal",
    description: "命令行终端、脚本执行",
    icon: "Terminal" as unknown as ElementType,
    category: "ide",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "none",
      scrollable: false,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 31,
      navGroup: "开发",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-terminal-history"],
    editable: true,
    version: "1.0.0",
  },

  // ── 设置类 ──
  "system-settings": {
    id: "system-settings",
    path: "/settings",
    title: "系统设置",
    titleEn: "System Settings",
    description: "系统全局配置、偏好设置",
    icon: "Settings" as unknown as ElementType,
    category: "settings",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "lg",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: false,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 40,
      navGroup: "设置",
    },
    permissions: ["admin"],
    storageKeys: ["yyc3-system-settings"],
    editable: true,
    version: "1.0.0",
  },

  "theme-customizer": {
    id: "theme-customizer",
    path: "/theme",
    title: "主题定制",
    titleEn: "Theme Customizer",
    description: "主题颜色、字体、样式定制",
    icon: "Palette" as unknown as ElementType,
    category: "settings",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "lg",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: false,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 41,
      navGroup: "设置",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-theme-config"],
    editable: true,
    version: "1.0.0",
  },

  "model-provider": {
    id: "model-provider",
    path: "/models",
    title: "模型提供商",
    titleEn: "Model Provider",
    description: "AI 模型提供商配置、API 管理",
    icon: "Cpu" as unknown as ElementType,
    category: "settings",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "lg",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 42,
      navGroup: "设置",
    },
    permissions: ["admin"],
    storageKeys: ["yyc3-model-providers", "yyc3-api-keys"],
    editable: true,
    version: "1.0.0",
  },

  // ── 数据类 ──
  "storage-manager": {
    id: "storage-manager",
    path: "/storage",
    title: "存储管理",
    titleEn: "Storage Manager",
    description: "本地存储管理、数据导入导出",
    icon: "Database" as unknown as ElementType,
    category: "data",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "lg",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 50,
      navGroup: "数据",
    },
    permissions: ["admin"],
    storageKeys: [],
    editable: false,
    version: "1.0.0",
  },

  "database-manager": {
    id: "database-manager",
    path: "/database",
    title: "数据库管理",
    titleEn: "Database Manager",
    description: "数据库连接、查询、管理",
    icon: "Database" as unknown as ElementType,
    category: "data",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 51,
      navGroup: "数据",
    },
    permissions: ["admin"],
    storageKeys: ["yyc3-db-connections"],
    editable: true,
    version: "1.0.0",
  },

  // ── 系统类 ──
  "security-monitor": {
    id: "security-monitor",
    path: "/security",
    title: "安全监控",
    titleEn: "Security Monitor",
    description: "安全审计、威胁检测、访问控制",
    icon: "Shield" as unknown as ElementType,
    category: "system",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 60,
      navGroup: "系统",
    },
    permissions: ["admin"],
    storageKeys: ["yyc3-security-config"],
    editable: true,
    version: "1.0.0",
  },

  "user-management": {
    id: "user-management",
    path: "/users",
    title: "用户管理",
    titleEn: "User Management",
    description: "用户账户、权限、角色管理",
    icon: "Users" as unknown as ElementType,
    category: "system",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "lg",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 61,
      navGroup: "系统",
    },
    permissions: ["admin"],
    storageKeys: ["yyc3-users"],
    editable: true,
    version: "1.0.0",
  },

  "design-system": {
    id: "design-system",
    path: "/design-system",
    title: "设计系统",
    titleEn: "Design System",
    description: "设计规范、组件库、样式指南",
    icon: "Palette" as unknown as ElementType,
    category: "system",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "md",
      scrollable: true,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: false,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 62,
      navGroup: "系统",
    },
    permissions: ["admin", "developer"],
    storageKeys: [],
    editable: false,
    version: "1.0.0",
  },

  variables: {
    id: "variables",
    path: "/variables",
    title: "变量中心",
    titleEn: "Variable Center",
    description: "统一管理设备、人员、密钥、模型、系统等所有变量",
    icon: "Settings" as unknown as ElementType,
    category: "system",
    layout: {
      showHeader: true,
      showSidebar: true,
      showBottomNav: false,
      maxWidth: "full",
      padding: "none",
      scrollable: false,
    },
    header: {
      showTitle: true,
      showBackButton: false,
      showActions: true,
      sticky: true,
      fontSize: "lg",
    },
    sidebar: {
      showInNav: true,
      navOrder: 63,
      navGroup: "系统",
    },
    permissions: ["admin", "developer"],
    storageKeys: ["yyc3-variable-values"],
    editable: true,
    version: "1.0.0",
  },
};

// ═══════════════════════════════════════════════════════════════
//  页面配置工具函数
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "yyc3-page-configs";

export function getPageConfig(pageId: string): PageConfig | undefined {
  return PAGE_REGISTRY[pageId];
}

export function getPageConfigByPath(path: string): PageConfig | undefined {
  return Object.values(PAGE_REGISTRY).find((p) => p.path === path);
}

export function getPagesByCategory(category: PageCategory): PageConfig[] {
  return Object.values(PAGE_REGISTRY).filter((p) => p.category === category);
}

export function getAllPages(): PageConfig[] {
  return Object.values(PAGE_REGISTRY).sort((a, b) => a.sidebar.navOrder - b.sidebar.navOrder);
}

export function getNavGroups(): Record<string, PageConfig[]> {
  const groups: Record<string, PageConfig[]> = {};
  for (const page of Object.values(PAGE_REGISTRY)) {
    if (page.sidebar.showInNav) {
      const group = page.sidebar.navGroup;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(page);
    }
  }
  return groups;
}

// ═══════════════════════════════════════════════════════════════
//  页面配置持久化（自编辑支持）
// ═══════════════════════════════════════════════════════════════

interface PageConfigOverride {
  pageId: string;
  overrides: Partial<PageConfig>;
  updatedAt: number;
}

export function loadPageConfigOverrides(): Record<string, PageConfigOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePageConfigOverrides(overrides: Record<string, PageConfigOverride>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

export function updatePageConfig(pageId: string, overrides: Partial<PageConfig>): PageConfig | null {
  const baseConfig = PAGE_REGISTRY[pageId];
  if (!baseConfig) {return null;}

  const allOverrides = loadPageConfigOverrides();
  allOverrides[pageId] = {
    pageId,
    overrides: { ...allOverrides[pageId]?.overrides, ...overrides },
    updatedAt: Date.now(),
  };
  savePageConfigOverrides(allOverrides);

  return { ...baseConfig, ...allOverrides[pageId].overrides };
}

export function getMergedPageConfig(pageId: string): PageConfig | undefined {
  const baseConfig = PAGE_REGISTRY[pageId];
  if (!baseConfig) {return undefined;}

  const overrides = loadPageConfigOverrides();
  const pageOverride = overrides[pageId];

  if (pageOverride) {
    return { ...baseConfig, ...pageOverride.overrides };
  }

  return baseConfig;
}

export function resetPageConfig(pageId: string): void {
  const overrides = loadPageConfigOverrides();
  delete overrides[pageId];
  savePageConfigOverrides(overrides);
}

export function resetAllPageConfigs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
