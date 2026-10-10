/**
 * @file components/PromptsPanel/PromptCard.tsx
 * @description 提示词卡片组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Check } from "lucide-react";
import type { PromptPreset } from "../../constants/prompts";

export interface PromptCardProps {
  preset: PromptPreset;
  isActive: boolean;
  onSelect: (presetId: string) => void;
}

export function PromptCard({ preset, isActive, onSelect }: PromptCardProps) {
  return (
    <div
      className={`p-3 rounded-xl border cursor-pointer transition-all ${
        isActive
          ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)]"
          : "bg-[rgba(0,40,80,0.15)] border-[rgba(0,180,255,0.08)] hover:border-[rgba(0,180,255,0.2)]"
      }`}
      onClick={() => onSelect(preset.id)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[#e0f0ff] text-sm">{preset.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-[rgba(0,212,255,0.06)] text-[rgba(0,212,255,0.4)] text-xs">
            {preset.category}
          </span>
        </div>
        {isActive && <Check className="w-4 h-4 text-[#00ff88]" />}
      </div>
      <p className="text-[rgba(0,212,255,0.35)] text-xs leading-relaxed">
        {preset.prompt.slice(0, 80)}...
      </p>
    </div>
  );
}
