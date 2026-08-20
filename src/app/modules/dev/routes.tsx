/**
 * @file: routes.tsx
 * @description: Dev 模块路由定义
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [routes],[dev],[module]
 */

import { lazy, Suspense, type ComponentType } from "react";
import { ErrorBoundary } from "../shared/ErrorBoundary";

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
      <ErrorBoundary level="module" source={source || LazyComponent.displayName || "DevRoute"}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

const DesignSystemPage = lazy(() =>
  import("./design-system/DesignSystemPage").then((m) => ({ default: m.DesignSystemPage })),
);
const DevGuidePage = lazy(() =>
  import("./DevGuidePage").then((m) => ({ default: m.DevGuidePage })),
);
const ThemeCustomizer = lazy(() =>
  import("./ThemeCustomizer").then((m) => ({ default: m.ThemeCustomizer })),
);
const CLITerminal = lazy(() =>
  import("./CLITerminal").then((m) => ({ default: m.CLITerminal })),
);
const IDEPanel = lazy(() =>
  import("./IDEPanel").then((m) => ({ default: m.IDEPanel })),
);
const RefactoringReport = lazy(() =>
  import("./RefactoringReport").then((m) => ({ default: m.RefactoringReport })),
);
const ArchitectureAudit = lazy(() =>
  import("./ArchitectureAudit").then((m) => ({ default: m.ArchitectureAudit })),
);

export const devRoutes = [
  { path: "design-system", Component: withSuspense(DesignSystemPage) },
  { path: "dev-guide", Component: withSuspense(DevGuidePage) },
  { path: "theme", Component: withSuspense(ThemeCustomizer) },
  { path: "terminal", Component: withSuspense(CLITerminal) },
  { path: "ide", Component: withSuspense(IDEPanel) },
  { path: "refactoring", Component: withSuspense(RefactoringReport) },
  { path: "architecture", Component: withSuspense(ArchitectureAudit) },
];