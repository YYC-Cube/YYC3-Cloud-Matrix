/**
 * @file components/SettingsPanel/index.tsx
 * @description 设置面板容器组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { ApiKeyInput, type ApiKeyInputProps } from "./ApiKeyInput";
import { ModelSelector, type ModelSelectorProps } from "./ModelSelector";
import { ParameterSlider } from "./ParameterSlider";

export interface SettingsPanelProps {
  apiKey: ApiKeyInputProps["value"];
  showApiKey: boolean;
  onToggleApiKey: () => void;
  onApiKeyChange: ApiKeyInputProps["onChange"];
  models: ModelSelectorProps["models"];
  selectedModel: ModelSelectorProps["selectedId"];
  modelsLoading: ModelSelectorProps["loading"];
  onModelSelect: ModelSelectorProps["onSelect"];
  temperature: number;
  onTemperatureChange: (value: number) => void;
  topP: number;
  onTopPChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
}

export function SettingsPanel({
  apiKey,
  showApiKey,
  onToggleApiKey,
  onApiKeyChange,
  models,
  selectedModel,
  modelsLoading,
  onModelSelect,
  temperature,
  onTemperatureChange,
  topP,
  onTopPChange,
  maxTokens,
  onMaxTokensChange,
}: SettingsPanelProps) {
  return (
    <div className="space-y-4 min-h-0">
      <ApiKeyInput
        value={apiKey}
        showValue={showApiKey}
        onToggleShow={onToggleApiKey}
        onChange={onApiKeyChange}
      />
      <ModelSelector
        models={models}
        selectedId={selectedModel}
        loading={modelsLoading}
        onSelect={onModelSelect}
      />
      <ParameterSlider
        label="温度 (Temperature)"
        value={temperature}
        min={0}
        max={2}
        step={0.05}
        minLabel="精确 0"
        maxLabel="创意 2.0"
        onChange={onTemperatureChange}
        color="#00d4ff"
      />
      <ParameterSlider
        label="Top-P (核采样)"
        value={topP}
        min={0}
        max={1}
        step={0.05}
        minLabel="集中 0"
        maxLabel="多样 1.0"
        onChange={onTopPChange}
        color="#aa55ff"
      />
      <ParameterSlider
        label="最大 Token 数"
        value={maxTokens}
        min={256}
        max={8192}
        step={256}
        minLabel="256"
        maxLabel="8192"
        onChange={onMaxTokensChange}
        color="#00ff88"
      />
    </div>
  );
}
