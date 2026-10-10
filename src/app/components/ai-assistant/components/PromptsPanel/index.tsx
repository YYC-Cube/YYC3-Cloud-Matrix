/**
 * @file components/PromptsPanel/index.tsx
 * @description 提示词面板容器组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { PROMPT_PRESETS } from "../../constants/prompts";
import { PromptCard } from "./PromptCard";

export interface PromptsPanelProps {
  activePrompt: string;
  onSelect: (presetId: string) => void;
  onCustomChange: (prompt: string) => void;
}

export function PromptsPanel({ activePrompt, onSelect, onCustomChange }: PromptsPanelProps) {
  const activePreset = PROMPT_PRESETS.find((p) => p.prompt === activePrompt);

  return (
    <div className="min-h-0">
      <h4 className="text-[#e0f0ff] mb-3 text-sm font-medium">系统提示词预设</h4>
      <div className="space-y-2 mb-4">
        {PROMPT_PRESETS.map((preset) => (
          <PromptCard
            key={preset.id}
            preset={preset}
            isActive={activePreset?.id === preset.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      <h4 className="text-[#e0f0ff] mb-2 text-sm font-medium">自定义系统提示词</h4>
      <textarea
        value={activePrompt}
        onChange={(e) => onCustomChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] resize-none"
        style={{ fontSize: "0.75rem", lineHeight: 1.6 }}
        rows={5}
        placeholder="输入自定义系统提示词..."
      />
      <p className="text-[rgba(0,212,255,0.25)] mt-1 text-xs">
        字数: {activePrompt.length} | 建议控制在 500 字以内以获得最佳效果
      </p>
    </div>
  );
}
