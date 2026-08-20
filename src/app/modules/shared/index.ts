/**
 * file: index.ts
 * description: 全局 UI/UX 共用层 · 布局、认证、品牌、通用组件统一入口
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-07-25
 * updated: 2026-07-25
 * status: active
 * tags: [shared],[layout],[auth],[branding]
 *
 * brief: 全局共用模块 Barrel 导出
 *
 * details:
 * - 布局组件: Layout, Sidebar, TopBar, BottomNav
 * - 认证组件: Login
 * - 品牌组件: YYC3Logo, YYC3LogoSvg
 * - 通用组件: ErrorBoundary, GlassCard, NotFound, LanguageSwitcher
 * - 每个独立模块可依赖此共享层
 *
 * exports: Layout, Sidebar, TopBar, BottomNav, Login, YYC3Logo, YYC3LogoSvg, ErrorBoundary, GlassCard, NotFound, LanguageSwitcher
 * notes: 此模块为所有独立子项目的公共依赖
 */

// 布局组件
export { Layout } from './Layout';
export { Sidebar } from './Sidebar';
export { TopBar } from './TopBar';
export { BottomNav } from './BottomNav';

// 认证组件
export { Login } from './Login';

// 品牌组件
export { YYC3Logo } from './YYC3Logo';
export { YYC3LogoSvg } from './YYC3LogoSvg';

// 通用组件
export { ErrorBoundary } from './ErrorBoundary';
export { GlassCard } from './GlassCard';
export { NotFound } from './NotFound';
export { LanguageSwitcher } from './LanguageSwitcher';

// 全局交互组件
export { AIAssistant } from './AIAssistant';
export { CommandPalette } from './CommandPalette';
export { OfflineIndicator } from './OfflineIndicator';
export { ConnectionStatus } from './ConnectionStatus';
export { QuickActionGrid } from './QuickActionGrid';