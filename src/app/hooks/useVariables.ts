/**
 * @file: useVariables.ts
 * @description: useVariables.ts
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-06
 * @updated: 2026-11-10
 * @status: active
 * @tags: [hook]
 *
 * @brief: 变量中心 Hook —— P0 修复：接入 variable-center 响应式引擎
 *
 * @details:
 * - useSyncExternalStore 订阅 subscribeVariables，任何一处 set/reset/import 即时广播
 * - 快照为缓存稳定引用，杜绝无限重渲染
 * - 对外接口保持 v1.0 形状（values/get/set/reset/validate/reload/hasChanges）
 */

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import {
  VARIABLE_DEFINITIONS,
  getVariableDefinition,
  getVariablesByCategory,
  getVariableValue,
  setVariableValue,
  resetVariableValue,
  validateVariable,
  getVariableValuesSnapshot,
  subscribeVariables,
  type VariableCategory,
  type VariableDefinition,
  type VariableValue,
} from "../config/variable-center";

export interface UseVariablesOptions {
  category?: VariableCategory;
  autoLoad?: boolean;
}

export interface UseVariablesResult {
  values: Record<string, VariableValue>;
  definitions: VariableDefinition[];
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  reset: (key: string) => void;
  validate: (key: string, value: unknown) => { valid: boolean; errors: string[] };
  reload: () => void;
  hasChanges: boolean;
}

export function useVariables(options: UseVariablesOptions = {}): UseVariablesResult {
  const { category } = options;

  // 响应式快照：任何写入即时反映（v1.0 需手动 reload，v1.1 自动）
  const snapshot = useSyncExternalStore(subscribeVariables, getVariableValuesSnapshot);
  const [hasChanges, setHasChanges] = useState(false);

  const definitions = useMemo(() => {
    return category ? getVariablesByCategory(category) : VARIABLE_DEFINITIONS;
  }, [category]);

  // 合并存储值与默认值，组装完整 values 视图
  const values = useMemo(() => {
    const allValues: Record<string, VariableValue> = {};
    for (const def of definitions) {
      allValues[def.key] = snapshot[def.key] || getVariableValue(def.key);
    }
    return allValues;
  }, [definitions, snapshot]);

  const reload = useCallback(() => {
    // v1.1 起快照自动同步，reload 仅为兼容旧调用方保留
    setHasChanges(false);
  }, []);

  const get = useCallback(
    (key: string): unknown => {
      return values[key]?.value ?? getVariableDefinition(key)?.defaultValue;
    },
    [values]
  );

  const set = useCallback((key: string, value: unknown) => {
    setVariableValue(key, value, "user");
    setHasChanges(true);
  }, []);

  const reset = useCallback((key: string) => {
    resetVariableValue(key);
    setHasChanges(true);
  }, []);

  const validate = useCallback((key: string, value: unknown) => {
    return validateVariable(key, value);
  }, []);

  return {
    values,
    definitions,
    get,
    set,
    reset,
    validate,
    reload,
    hasChanges,
  };
}

export interface UseVariableResult {
  value: unknown;
  definition: VariableDefinition | undefined;
  set: (value: unknown) => void;
  reset: () => void;
  validate: (value: unknown) => { valid: boolean; errors: string[] };
  isDefault: boolean;
  isModified: boolean;
}

export function useVariable(key: string): UseVariableResult {
  const snapshot = useSyncExternalStore(subscribeVariables, getVariableValuesSnapshot);
  const definition = useMemo(() => getVariableDefinition(key), [key]);

  const storedValue = useMemo(() => {
    return snapshot[key] ?? getVariableValue(key);
  }, [snapshot, key]);

  const value = storedValue.value;

  const set = useCallback(
    (newValue: unknown) => {
      setVariableValue(key, newValue, "user");
    },
    [key]
  );

  const reset = useCallback(() => {
    resetVariableValue(key);
  }, [key]);

  const validate = useCallback(
    (val: unknown) => {
      return validateVariable(key, val);
    },
    [key]
  );

  return {
    value,
    definition,
    set,
    reset,
    validate,
    isDefault: storedValue.source === "default",
    isModified: storedValue.source === "user",
  };
}

export function useVariableValue<T = unknown>(key: string, defaultValue?: T): T {
  const definition = getVariableDefinition(key);
  const snapshot = useSyncExternalStore(subscribeVariables, getVariableValuesSnapshot);

  return useMemo(() => {
    const stored = snapshot[key];
    if (stored && stored.source !== "default") {
      return stored.value as T;
    }
    return (defaultValue ?? (definition?.defaultValue as T)) as T;
  }, [snapshot, key, defaultValue, definition]);
}
