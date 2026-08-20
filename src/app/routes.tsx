/**
 * @file: routes.ts
 * @description: YYC³ 路由表 — React.lazy 按需加载
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-17
 * @status: active
 * @tags: [module],[routes]
 */

import { lazy, Suspense, type ComponentType } from "react";
import { createHashRouter } from "react-router";
import { ErrorBoundary } from "./modules/shared/ErrorBoundary";
import { Layout } from "./modules/shared/Layout";
import { NotFound } from "./modules/shared/NotFound";

// ============================================================
//  Loading 占位组件
// ============================================================

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#00ff88]/60 text-sm">加载中...</span>
      </div>
    </div>
  );
}

function withSuspense<T extends object>(
  LazyComponent: ComponentType<T>,
  source?: string,
): ComponentType<T> {
  return function Suspensed(props: T) {
    return (
      <ErrorBoundary level="module" source={source || LazyComponent.displayName || "Route"}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// ============================================================
//  首屏路由 — 静态导入（立即需要）
// ============================================================

// Layout, NotFound — 已在顶部静态导入

// ============================================================
//  按需加载路由 — React.lazy()
// ============================================================

const DataMonitoring = lazy(() =>
  import("./modules/monitor/DataMonitoring").then((m) => ({ default: m.DataMonitoring })),
);
const FollowUpPanel = lazy(() =>
  import("./modules/monitor/FollowUpPanel").then((m) => ({ default: m.FollowUpPanel })),
);
const PatrolDashboard = lazy(() =>
  import("./modules/monitor/PatrolDashboard").then((m) => ({ default: m.PatrolDashboard })),
);
const OperationCenter = lazy(() =>
  import("./modules/ops/OperationCenter").then((m) => ({ default: m.OperationCenter })),
);
const LocalFileManager = lazy(() =>
  import("./modules/ops/LocalFileManager").then((m) => ({ default: m.LocalFileManager })),
);
const AISuggestionPanel = lazy(() =>
  import("./modules/monitor/AISuggestionPanel").then((m) => ({ default: m.AISuggestionPanel })),
);
const ServiceLoopPanel = lazy(() =>
  import("./modules/ops/ServiceLoopPanel").then((m) => ({ default: m.ServiceLoopPanel })),
);
const PWAStatusPanel = lazy(() =>
  import("./modules/admin/PWAStatusPanel").then((m) => ({ default: m.PWAStatusPanel })),
);
// Dev 模块
const DesignSystemPage = lazy(() =>
  import("./modules/dev/design-system/DesignSystemPage").then((m) => ({ default: m.DesignSystemPage })),
);
const DevGuidePage = lazy(() =>
  import("./modules/dev/DevGuidePage").then((m) => ({ default: m.DevGuidePage })),
);
const ModelProviderPanel = lazy(() =>
  import("./modules/ai/ModelProviderPanel").then((m) => ({ default: m.ModelProviderPanel })),
);
const ThemeCustomizer = lazy(() =>
  import("./modules/dev/ThemeCustomizer").then((m) => ({ default: m.ThemeCustomizer })),
);
const CLITerminal = lazy(() =>
  import("./modules/dev/CLITerminal").then((m) => ({ default: m.CLITerminal })),
);
const IDEPanel = lazy(() =>
  import("./modules/dev/IDEPanel").then((m) => ({ default: m.IDEPanel })),
);
const OperationAudit = lazy(() =>
  import("./modules/admin/OperationAudit").then((m) => ({ default: m.OperationAudit })),
);
const UserManagement = lazy(() =>
  import("./modules/admin/UserManagement").then((m) => ({ default: m.UserManagement })),
);
const SystemSettings = lazy(() =>
  import("./modules/admin/SystemSettings").then((m) => ({ default: m.SystemSettings })),
);
const SecurityMonitor = lazy(() =>
  import("./modules/admin/SecurityMonitor").then((m) => ({ default: m.SecurityMonitor })),
);
const AlertRulesPanel = lazy(() =>
  import("./modules/monitor/AlertRulesPanel").then((m) => ({ default: m.AlertRulesPanel })),
);
const ReportExporter = lazy(() =>
  import("./modules/ops/ReportExporter").then((m) => ({ default: m.ReportExporter })),
);
const AIDiagnostics = lazy(() =>
  import("./modules/ai/AIDiagnostics").then((m) => ({ default: m.AIDiagnostics })),
);
const HostFileManager = lazy(() =>
  import("./modules/ops/HostFileManager").then((m) => ({ default: m.HostFileManager })),
);
const DatabaseManager = lazy(() =>
  import("./modules/ops/DatabaseManager").then((m) => ({ default: m.DatabaseManager })),
);
const RefactoringReport = lazy(() =>
  import("./modules/dev/RefactoringReport").then((m) => ({ default: m.RefactoringReport })),
);
const DataEditorPanel = lazy(() =>
  import("./modules/admin/DataEditorPanel").then((m) => ({ default: m.DataEditorPanel })),
);
const PerformanceMonitor = lazy(() =>
  import("./modules/admin/PerformanceMonitor").then((m) => ({ default: m.PerformanceMonitor })),
);
const EnvConfigEditor = lazy(() =>
  import("./modules/admin/EnvConfigEditor").then((m) => ({ default: m.EnvConfigEditor })),
);
const DatabaseConnectionPanel = lazy(() =>
  import("./modules/ops/DatabaseConnectionPanel").then((m) => ({ default: m.DatabaseConnectionPanel })),
);
const ConnectionMonitorPanel = lazy(() =>
  import("./modules/ops/ConnectionMonitorPanel").then((m) => ({ default: m.ConnectionMonitorPanel })),
);
const StorageManager = lazy(() =>
  import("./modules/admin/StorageManager").then((m) => ({ default: m.StorageManager })),
);
const ArchitectureAudit = lazy(() =>
  import("./modules/dev/ArchitectureAudit").then((m) => ({ default: m.ArchitectureAudit })),
);
const AIFamilyPage = lazy(() =>
  import("./modules/ai-family/AIFamilyPage").then((m) => ({ default: m.AIFamilyPage })),
);
const AIFamilyRouter = lazy(() =>
  import("./modules/ai-family/components/AIFamilyRouter").then((m) => ({ default: m.AIFamilyRouter })),
);
const ServiceConnectionTest = lazy(() =>
  import("./modules/ops/ServiceConnectionTest").then((m) => ({ default: m.ServiceConnectionTest })),
);
const FollowUpManager = lazy(() =>
  import("./modules/monitor/FollowUpManager").then((m) => ({ default: m.FollowUpManager })),
);
const ConfigCenter = lazy(() =>
  import("./modules/admin/ConfigCenter").then((m) => ({ default: m.ConfigCenter })),
);
const VariableCenter = lazy(() =>
  import("./modules/admin/VariableCenter").then((m) => ({ default: m.VariableCenter })),
);
const UnifiedSettingsPanel = lazy(() =>
  import("./modules/admin/UnifiedSettingsPanel").then((m) => ({ default: m.UnifiedSettingsPanel })),
);
const HotelDashboard = lazy(() =>
  import("./modules/business/HotelDashboard").then((m) => ({ default: m.HotelDashboard })),
);
const CommStationPanel = lazy(() =>
  import("./modules/business/CommStationPanel").then((m) => ({ default: m.CommStationPanel })),
);
const SDKChatPanel = lazy(() =>
  import("./modules/monitor/SDKChatPanel").then((m) => ({ default: m.SDKChatPanel })),
);
const ConfigExportCenter = lazy(() =>
  import("./modules/ops/ConfigExportCenter").then((m) => ({ default: m.ConfigExportCenter })),
);

// ============================================================
//  路由表
// ============================================================

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: withSuspense(DataMonitoring) },
      { path: "follow-up", Component: withSuspense(FollowUpPanel) },
      { path: "follow-up-manager", Component: withSuspense(FollowUpManager) },
      { path: "patrol", Component: withSuspense(PatrolDashboard) },
      { path: "operations", Component: withSuspense(OperationCenter) },
      { path: "files", Component: withSuspense(LocalFileManager) },
      { path: "ai", Component: withSuspense(AISuggestionPanel) },
      { path: "loop", Component: withSuspense(ServiceLoopPanel) },
      { path: "pwa", Component: withSuspense(PWAStatusPanel) },
      { path: "design-system", Component: withSuspense(DesignSystemPage) },
      { path: "dev-guide", Component: withSuspense(DevGuidePage) },
      { path: "models", Component: withSuspense(ModelProviderPanel) },
      { path: "theme", Component: withSuspense(ThemeCustomizer) },
      { path: "terminal", Component: withSuspense(CLITerminal) },
      { path: "ide", Component: withSuspense(IDEPanel) },
      { path: "audit", Component: withSuspense(OperationAudit) },
      { path: "users", Component: withSuspense(UserManagement) },
      { path: "settings", Component: withSuspense(SystemSettings) },
      { path: "security", Component: withSuspense(SecurityMonitor) },
      { path: "alerts", Component: withSuspense(AlertRulesPanel) },
      { path: "reports", Component: withSuspense(ReportExporter) },
      { path: "ai-diagnosis", Component: withSuspense(AIDiagnostics) },
      { path: "host-files", Component: withSuspense(HostFileManager) },
      { path: "database", Component: withSuspense(DatabaseManager) },
      { path: "refactoring", Component: withSuspense(RefactoringReport) },
      { path: "data-editor", Component: withSuspense(DataEditorPanel) },
      { path: "performance", Component: withSuspense(PerformanceMonitor) },
      { path: "env-config", Component: withSuspense(EnvConfigEditor) },
      { path: "db-connections", Component: withSuspense(DatabaseConnectionPanel) },
      { path: "connection-monitor", Component: withSuspense(ConnectionMonitorPanel) },
      { path: "architecture", Component: withSuspense(ArchitectureAudit) },
      { path: "ai-family", Component: withSuspense(AIFamilyPage) },
      { path: "ai-family/:subpage", Component: withSuspense(AIFamilyRouter) },
      { path: "connection-test", Component: withSuspense(ServiceConnectionTest) },
      { path: "storage", Component: withSuspense(StorageManager) },
      { path: "config-center", Component: withSuspense(ConfigCenter) },
      { path: "variables", Component: withSuspense(VariableCenter) },
      { path: "unified-settings", Component: withSuspense(UnifiedSettingsPanel) },
      { path: "hotel-dashboard", Component: withSuspense(HotelDashboard) },
      { path: "hotel", Component: withSuspense(HotelDashboard) },
      { path: "comm-station", Component: withSuspense(CommStationPanel) },
      { path: "sdk-chat", Component: withSuspense(SDKChatPanel) },
      { path: "export-center", Component: withSuspense(ConfigExportCenter) },
      { path: "*", Component: NotFound },
    ],
  },
]);
