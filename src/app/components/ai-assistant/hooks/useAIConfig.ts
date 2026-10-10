/**
 * @file hooks/useAIConfig.ts
 * @description AI 配置状态管理 Hook
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { useCallback, useEffect } from "react";
import { useModelProvider } from "../../../hooks/useModelProvider";
import { useSettingsStore } from "../../../hooks/useSettingsStore";

export interface UseAIConfigReturn {
  apiKey: string;
  setApiKey: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  topP: number;
  setTopP: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  availableModels: Array<{ id: string; name: string; provider: string; isLocal?: boolean }>;
  ollamaLoading: boolean;
  showApiKey: boolean;
  setShowApiKey: (value: boolean) => void;
}

export function useAIConfig(): UseAIConfigReturn {
  const { availableModels, ollamaLoading } = useModelProvider();
  const { values: settingsValues, updateValue: updateSettingsValue } = useSettingsStore();

  const apiKey = settingsValues.aiApiKey;
  const setApiKey = useCallback(
    (v: string) => updateSettingsValue("aiApiKey", v),
    [updateSettingsValue]
  );

  const selectedModel = settingsValues.aiModel;
  const setSelectedModel = useCallback(
    (v: string) => updateSettingsValue("aiModel", v),
    [updateSettingsValue]
  );

  const temperature = parseFloat(settingsValues.aiTemperature) || 0.7;
  const setTemperature = useCallback(
    (v: number) => updateSettingsValue("aiTemperature", String(v)),
    [updateSettingsValue]
  );

  const topP = parseFloat(settingsValues.aiTopP) || 0.9;
  const setTopP = useCallback(
    (v: number) => updateSettingsValue("aiTopP", String(v)),
    [updateSettingsValue]
  );

  const maxTokens = parseInt(settingsValues.aiMaxTokens) || 2048;
  const setMaxTokens = useCallback(
    (v: number) => updateSettingsValue("aiMaxTokens", String(v)),
    [updateSettingsValue]
  );

  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
    }
  }, [availableModels, selectedModel, setSelectedModel]);

  return {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
    topP,
    setTopP,
    maxTokens,
    setMaxTokens,
    availableModels,
    ollamaLoading,
    showApiKey: false,
    setShowApiKey: () => {},
  };
}
