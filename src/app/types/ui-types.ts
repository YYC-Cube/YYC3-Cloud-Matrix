/**
 * @file: ui-types.ts
 * @description: UI 组件公共类型 — 聊天 / 命令面板 / 快捷键 / 终端 / PWA
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[ui]
 */

import type { ModelProviderId } from "./model-provider-types";

/** AI 助理聊天消息 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: string;
  provider?: ModelProviderId;
  tokens?: { input: number; output: number };
}

/** AI 助理系统命令类别 */
export type CommandCategory = "cluster" | "model" | "data" | "security" | "monitor";

/** PWA beforeinstallprompt 事件接口 */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** 快捷键绑定 */
export interface KeyboardShortcut {
  id: string;
  keys: string;
  description: string;
  category: string;
  action: () => void;
}

/** 命令面板条目 */
export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
}

/** 已注册快捷键 (用于帮助面板展示) */
export interface RegisteredShortcut {
  id: string;
  keys: string;
  description: string;
  category: string;
}

/** 终端命令历史条目 */
export interface TerminalHistoryEntry {
  id: string;
  input: string;
  output: string;
  timestamp: number;
  status: "success" | "error" | "info";
}

/** IDE 面板 Tab */
export type IDEPanelTab = "monitor" | "alerts" | "operations" | "logs";

/** Service Worker 状态 */
export type SWStatus = "idle" | "installing" | "waiting" | "active" | "error" | "unsupported";

/** 缓存条目 */
export interface CacheEntry {
  name: string;
  size: number;
  count: number;
  lastUpdated: number;
}

/** PWA 状态概览 */
export interface PWAState {
  swStatus: SWStatus;
  swVersion: string;
  isOnline: boolean;
  cacheEntries: CacheEntry[];
  totalCacheSize: number;
  offlineReady: boolean;
  lastCacheUpdate: number;
}
