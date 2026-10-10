/**
 * @file components/CommandsPanel/index.tsx
 * @description 命令面板容器组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { SystemCommand, CMD_CATEGORIES } from "../../constants/commands";
import { CommandCard } from "./CommandCard";

export interface CommandsPanelProps {
  commands: SystemCommand[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onExecute: (command: SystemCommand) => void;
}

export function CommandsPanel({ commands, filter, onFilterChange, onExecute }: CommandsPanelProps) {
  const filteredCommands = filter === "all" ? commands : commands.filter((c) => c.category === filter);

  return (
    <div className="min-h-0">
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {CMD_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onFilterChange(cat.key)}
            className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
              filter === cat.key
                ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
                : "text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] border border-transparent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredCommands.map((cmd) => (
          <CommandCard key={cmd.id} command={cmd} onExecute={onExecute} />
        ))}
      </div>
    </div>
  );
}
