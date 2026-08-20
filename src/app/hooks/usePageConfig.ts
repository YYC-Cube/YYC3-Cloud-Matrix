/**
 * @file: usePageConfig.ts
 * @description: usePageConfig.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router";
import {
  getPageConfigByPath,
  getMergedPageConfig,
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
  const [isLoading, setIsLoading] = useState(true);

  const config = useMemo(() => {
    const path = location.pathname === "/" ? "/" : location.pathname.replace(/^\//, "");
    return getMergedPageConfig(getPageConfigByPath(path)?.id || "");
  }, [location.pathname]);

  useEffect(() => {
    setIsLoading(false);
  }, [config]);

  const handleUpdateConfig = useCallback((overrides: Partial<PageConfig>) => {
    if (config?.id) {
      updateConfig(config.id, overrides);
    }
  }, [config?.id]);

  const handleResetConfig = useCallback(() => {
    if (config?.id) {
      resetConfig(config.id);
    }
  }, [config?.id]);

  return {
    config: config ?? null,
    isLoading,
    updateConfig: handleUpdateConfig,
    resetConfig: handleResetConfig,
    isEditable: config?.editable ?? false,
    storageKeys: config?.storageKeys ?? [],
  };
}

export function usePageConfigById(pageId: string): UsePageConfigResult {
  const [isLoading, setIsLoading] = useState(true);

  const config = useMemo(() => {
    return getMergedPageConfig(pageId);
  }, [pageId]);

  useEffect(() => {
    setIsLoading(false);
  }, [config]);

  const handleUpdateConfig = useCallback((overrides: Partial<PageConfig>) => {
    updateConfig(pageId, overrides);
  }, [pageId]);

  const handleResetConfig = useCallback(() => {
    resetConfig(pageId);
  }, [pageId]);

  return {
    config: config ?? null,
    isLoading,
    updateConfig: handleUpdateConfig,
    resetConfig: handleResetConfig,
    isEditable: config?.editable ?? false,
    storageKeys: config?.storageKeys ?? [],
  };
}

export default usePageConfig;
