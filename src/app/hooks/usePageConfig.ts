/**
 * @file: usePageConfig.ts
 * @description: usePageConfig.ts
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-06
 * @updated: 2026-11-10
 * @status: active
 * @tags: [hook]
 *
 * @brief: 页面配置 Hook —— P0 修复：接入 page-config 响应式引擎
 *
 * @details:
 * - useSyncExternalStore 订阅 subscribePageConfigs，编辑保存/重置/跨标签写入即时重渲染
 * - getMergedPageConfig 返回缓存稳定引用，不触发无限重渲染
 * - 接口保持 v1.0 形状不变（isLoading 恒 false，配置为同步本地读取）
 */

import { useCallback, useSyncExternalStore } from "react";
import { useLocation } from "react-router";
import {
  getPageConfigByPath,
  getMergedPageConfig,
  subscribePageConfigs,
  updatePageConfig as updateConfig,
  resetPageConfig as resetConfig,
  type PageConfig,
} from "../config";

export interface UsePageConfigResult {
  config: PageConfig | null;
  isLoading: boolean;
  updateConfig: (overrides: Partial<PageConfig>) => void;
  resetConfig: () => void;
  isEditable: boolean;
  storageKeys: string[];
}

export function usePageConfig(): UsePageConfigResult {
  const location = useLocation();
  const path = location.pathname === "/" ? "/" : location.pathname.replace(/^\//, "");
  const pageId = getPageConfigByPath(path)?.id || "";
  return usePageConfigById(pageId);
}

export function usePageConfigById(pageId: string): UsePageConfigResult {
  const getSnapshot = useCallback(
    () => (pageId ? (getMergedPageConfig(pageId) ?? null) : null),
    [pageId]
  );

  const config = useSyncExternalStore(subscribePageConfigs, getSnapshot);

  const handleUpdateConfig = useCallback((overrides: Partial<PageConfig>) => {
    if (pageId) {
      updateConfig(pageId, overrides);
    }
  }, [pageId]);

  const handleResetConfig = useCallback(() => {
    if (pageId) {
      resetConfig(pageId);
    }
  }, [pageId]);

  return {
    config,
    isLoading: false,
    updateConfig: handleUpdateConfig,
    resetConfig: handleResetConfig,
    isEditable: config?.editable ?? false,
    storageKeys: config?.storageKeys ?? [],
  };
}

export default usePageConfig;
