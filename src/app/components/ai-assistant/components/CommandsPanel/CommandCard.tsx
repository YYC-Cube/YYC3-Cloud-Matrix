/**
 * @file components/CommandsPanel/CommandCard.tsx
 * @description 命令卡片组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Play } from "lucide-react";
import type { SystemCommand } from "../../constants/commands";

export interface CommandCardProps {
  command: SystemCommand;
  onExecute: (command: SystemCommand) => void;
}

export function CommandCard({ command, onExecute }: CommandCardProps) {
  const Icon = command.icon;

  return (
    <button
      onClick={() => onExecute(command)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)] hover:border-[rgba(0,180,255,0.25)] hover:bg-[rgba(0,40,80,0.3)] transition-all text-left group"
    >
      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${command.color}12` }}>
        <Icon className="w-4 h-4" style={{ color: command.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#e0f0ff] group-hover:text-[#00d4ff] transition-colors text-sm">
          {command.label}
        </p>
        <p className="text-[rgba(0,212,255,0.35)] truncate text-xs">{command.desc}</p>
      </div>
      <Play className="w-4 h-4 text-[rgba(0,212,255,0.2)] group-hover:text-[#00d4ff] transition-colors shrink-0" />
    </button>
  );
}
