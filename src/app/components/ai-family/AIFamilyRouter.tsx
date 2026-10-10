/**
 * @file: AIFamilyRouter.tsx
 * @description: AIFamilyRouter.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { Suspense, useMemo } from "react";
import { useParams, useLocation } from "react-router";

// ═══ Lazy 加载（减少初始 bundle 大小）═══
// 沙箱可能阻止 dynamic import，需要 fallback

const lazyMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  home: () => import("./FamilyHome").then(m => ({ default: m.FamilyHome })),
  center: () => import("./AIFamilyCenterPage").then(m => ({ default: m.AIFamilyCenterPage })),
  planning: () => import("./AIFamilyDesignDoc").then(m => ({ default: m.AIFamilyDesignDoc })),
  chat: () => import("./FamilyChat").then(m => ({ default: m.FamilyChat })),
  share: () => import("./FamilyShare").then(m => ({ default: m.FamilyShare })),
  learn: () => import("./FamilyLearn").then(m => ({ default: m.FamilyLearn })),
  music: () => import("./FamilyMusic").then(m => ({ default: m.FamilyMusic })),
  growth: () => import("./FamilyGrowth").then(m => ({ default: m.FamilyGrowth })),
  phone: () => import("./FamilyPhone").then(m => ({ default: m.FamilyPhone })),
  fun: () => import("./FamilyEntertainment").then(m => ({ default: m.FamilyEntertainment })),
  activities: () => import("./FamilyActivityCenter").then(m => ({ default: m.FamilyActivityCenter })),
  models: () => import("./FamilyModelSettings").then(m => ({ default: m.FamilyModelSettings })),
  voice: () => import("./FamilyVoiceSystem").then(m => ({ default: m.FamilyVoiceSystem })),
  data: () => import("./FamilyDataHub").then(m => ({ default: m.FamilyDataHub })),
  comm: () => import("./FamilyCommCenter").then(m => ({ default: m.FamilyCommCenter })),
  settings: () => import("./FamilyUISettings").then(m => ({ default: m.FamilyUISettings })),
  hotel: () => import("./FamilyHotel").then(m => ({ default: m.FamilyHotel })),
  cluster: () => import("./FamilyCluster").then(m => ({ default: m.FamilyCluster })),
};

const VALID_KEYS = Object.keys(lazyMap);

// ═══ Loading spinner ═══

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[rgba(0,212,255,0.15)] border-t-[rgba(0,212,255,0.6)] rounded-full animate-spin" />
        <span className="text-white/30" style={{ fontSize: "0.75rem" }}>加载中...</span>
      </div>
    </div>
  );
}

// ═══ Error fallback ═══

function ErrorFallback({ subpage }: { subpage: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-amber-400/60" style={{ fontSize: "0.9rem" }}>加载模块失败</p>
        <p className="text-white/30 mt-2" style={{ fontSize: "0.7rem" }}>
          页面 &ldquo;{subpage}&rdquo; 暂时不可用
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-cyan-300 hover:bg-[rgba(0,212,255,0.2)] transition-all"
          style={{ fontSize: "0.75rem" }}
        >
          刷新页面
        </button>
      </div>
    </div>
  );
}

// ═══ Lazy wrapper with error boundary ═══

interface LazyErrorBoundaryState {
  hasError: boolean;
}

interface LazyErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class LazyErrorBoundary extends React.Component<LazyErrorBoundaryProps, LazyErrorBoundaryState> {
  state: LazyErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): LazyErrorBoundaryState {
    return { hasError: true };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ═══ URL → subpage key 解析 ═══

function resolveSubpage(pathname: string, hash: string, paramSubpage?: string): string {
  if (paramSubpage && VALID_KEYS.includes(paramSubpage)) {return paramSubpage;}
  
  // HashRouter: 从 hash 中提取路径
  const hashPath = hash.replace(/^#\/?/, '');
  const hashMatch = hashPath.match(/ai-family\/(\w+)/);
  if (hashMatch && VALID_KEYS.includes(hashMatch[1])) {return hashMatch[1];}
  
  // 也尝试从 pathname 匹配（非 HashRouter 模式）
  const pathMatch = pathname.match(/\/ai-family\/(\w+)/);
  if (pathMatch && VALID_KEYS.includes(pathMatch[1])) {return pathMatch[1];}
  
  return "home";
}

// ═══ 缓存 lazy 组件 ═══
const lazyCache: Record<string, React.LazyExoticComponent<React.ComponentType>> = {};

function getLazyComponent(key: string): React.LazyExoticComponent<React.ComponentType> {
  if (!lazyCache[key]) {
    lazyCache[key] = React.lazy(lazyMap[key]);
  }
  return lazyCache[key];
}

// ═══ 主组件 ═══

export function AIFamilyRouter() {
  const { subpage } = useParams<{ subpage: string }>();
  const location = useLocation();
  const key = resolveSubpage(location.pathname, location.hash, subpage);
  
  console.info('[AIFamilyRouter] Debug:', {
    pathname: location.pathname,
    hash: location.hash,
    subpage,
    resolvedKey: key,
    isValid: VALID_KEYS.includes(key),
  });
  
  const LazyComponent = useMemo(() => getLazyComponent(key), [key]);

  return (
    <LazyErrorBoundary fallback={<ErrorFallback subpage={key} />}>
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent />
      </Suspense>
    </LazyErrorBoundary>
  );
}
