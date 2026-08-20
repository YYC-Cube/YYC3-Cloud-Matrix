/**
 * @file: useDesignSystem.ts
 * @description: useDesignSystem.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback } from "react";
import {
  COLOR_TOKENS,
  TYPOGRAPHY_TOKENS,
  SPACING_TOKENS,
  SHADOW_TOKENS,
  ANIMATION_TOKENS,
  getCSSVar,
  setCSSVar,
  loadDesignSystemOverrides,
  saveDesignSystemOverrides,
  applyDesignSystemOverrides,
  resetDesignSystemOverrides,
  type DesignSystemOverrides,
} from "../config";

export interface UseDesignSystemResult {
  colors: typeof COLOR_TOKENS;
  typography: typeof TYPOGRAPHY_TOKENS;
  spacing: typeof SPACING_TOKENS;
  shadows: typeof SHADOW_TOKENS;
  animation: typeof ANIMATION_TOKENS;
  setColor: (name: string, value: string) => void;
  getColor: (cssVar: string) => string;
  applyOverrides: (overrides: DesignSystemOverrides) => void;
  reset: () => void;
  currentOverrides: DesignSystemOverrides | null;
}

export function useDesignSystem(): UseDesignSystemResult {
  const [currentOverrides, setCurrentOverrides] = useState<DesignSystemOverrides | null>(null);

  useEffect(() => {
    const overrides = loadDesignSystemOverrides();
    setCurrentOverrides(overrides);
    if (overrides) {
      applyDesignSystemOverrides(overrides);
    }
  }, []);

  const setColor = useCallback((name: string, value: string) => {
    const token = COLOR_TOKENS.find((t) => t.name === name);
    if (token) {
      setCSSVar(token.cssVar, value);
      const overrides = loadDesignSystemOverrides() || { updatedAt: Date.now() };
      overrides.colors = { ...overrides.colors, [name]: value };
      saveDesignSystemOverrides(overrides);
      setCurrentOverrides(overrides);
    }
  }, []);

  const getColor = useCallback((cssVar: string) => {
    return getCSSVar(cssVar);
  }, []);

  const applyOverrides = useCallback((overrides: DesignSystemOverrides) => {
    applyDesignSystemOverrides(overrides);
    saveDesignSystemOverrides(overrides);
    setCurrentOverrides(overrides);
  }, []);

  const reset = useCallback(() => {
    resetDesignSystemOverrides();
    setCurrentOverrides(null);
  }, []);

  return {
    colors: COLOR_TOKENS,
    typography: TYPOGRAPHY_TOKENS,
    spacing: SPACING_TOKENS,
    shadows: SHADOW_TOKENS,
    animation: ANIMATION_TOKENS,
    setColor,
    getColor,
    applyOverrides,
    reset,
    currentOverrides,
  };
}

export default useDesignSystem;
