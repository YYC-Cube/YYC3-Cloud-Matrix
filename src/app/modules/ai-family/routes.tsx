/**
 * @file: routes.tsx
 * @description: AI Family 模块路由定义
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [routes],[ai-family],[module]
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
      <ErrorBoundary level="module" source={source || LazyComponent.displayName || "AIFamilyRoute"}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

const AIFamilyPage = lazy(() =>
  import("./AIFamilyPage").then((m) => ({ default: m.AIFamilyPage })),
);
const AIFamilyRouter = lazy(() =>
  import("./components/AIFamilyRouter").then((m) => ({ default: m.AIFamilyRouter })),
);

export const aiFamilyRoutes = [
  { path: "ai-family", Component: withSuspense(AIFamilyPage) },
  { path: "ai-family/:subpage", Component: withSuspense(AIFamilyRouter) },
];