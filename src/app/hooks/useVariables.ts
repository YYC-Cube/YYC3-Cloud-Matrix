/**
 * @file: useVariables.ts
 * @description: useVariables.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  VARIABLE_DEFINITIONS,
  getVariableDefinition,
  getVariablesByCategory,
  getVariableValue,
  setVariableValue,
  resetVariableValue,
  validateVariable,
  loadVariableValues,
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
  const { category, autoLoad = true } = options;

  const [values, setValues] = useState<Record<string, VariableValue>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const definitions = useMemo(() => {
    return category ? getVariablesByCategory(category) : VARIABLE_DEFINITIONS;
  }, [category]);

  const reload = useCallback(() => {
    const loadedValues = loadVariableValues();
    const allValues: Record<string, VariableValue> = {};

    for (const def of definitions) {
      allValues[def.key] = loadedValues[def.key] || getVariableValue(def.key);
    }

    setValues(allValues);
    setHasChanges(false);
  }, [definitions]);

  useEffect(() => {
    if (autoLoad) {
      reload();
    }
  }, [autoLoad, reload]);

  const get = useCallback(
    (key: string): unknown => {
      return values[key]?.value ?? getVariableDefinition(key)?.defaultValue;
    },
    [values]
  );

  const set = useCallback((key: string, value: unknown) => {
    setVariableValue(key, value, "user");
    setValues((prev) => ({
      ...prev,
      [key]: {
        key,
        value,
        source: "user",
        updatedAt: Date.now(),
      },
    }));
    setHasChanges(true);
  }, []);

  const reset = useCallback((key: string) => {
    resetVariableValue(key);
    const def = getVariableDefinition(key);
    if (def) {
      setValues((prev) => ({
        ...prev,
        [key]: {
          key,
          value: def.defaultValue,
          source: "default",
          updatedAt: Date.now(),
        },
      }));
    }
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
  const [value, setValue] = useState<unknown>(() => getVariableValue(key).value);
  const definition = useMemo(() => getVariableDefinition(key), [key]);

  const set = useCallback(
    (newValue: unknown) => {
      setVariableValue(key, newValue, "user");
      setValue(newValue);
    },
    [key]
  );

  const reset = useCallback(() => {
    resetVariableValue(key);
    setValue(definition?.defaultValue);
  }, [key, definition]);

  const validate = useCallback(
    (val: unknown) => {
      return validateVariable(key, val);
    },
    [key]
  );

  const storedValue = getVariableValue(key);
  const isDefault = storedValue.source === "default";
  const isModified = storedValue.source === "user";

  return {
    value,
    definition,
    set,
    reset,
    validate,
    isDefault,
    isModified,
  };
}

export function useVariableValue<T = unknown>(key: string, defaultValue?: T): T {
  const definition = getVariableDefinition(key);
  const [value, setValue] = useState<T>(() => {
    const stored = getVariableValue(key);
    return (stored.value as T) ?? (defaultValue ?? (definition?.defaultValue as T));
  });

  useEffect(() => {
    const stored = getVariableValue(key);
    if (stored.source !== "default") {
      setValue(stored.value as T);
    }
  }, [key]);

  const _setVariable = useCallback(
    (newValue: T) => {
      setVariableValue(key, newValue, "user");
      setValue(newValue);
    },
    [key]
  );

  return value;
}
