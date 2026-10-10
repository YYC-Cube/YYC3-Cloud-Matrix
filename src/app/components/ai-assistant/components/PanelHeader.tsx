/**
 * @file components/PanelHeader.tsx
 * @description AI 助手面板头部
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Minimize2, Maximize2, X, Trash2 } from "lucide-react";
import { YYC3LogoSvg } from "../../../modules/shared/YYC3LogoSvg";

export interface PanelHeaderProps {
  modelName: string;
  isLoading: boolean;
  isMaximized: boolean;
  isMobile: boolean;
  onClearChat: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}

export function PanelHeader({
  modelName,
  isLoading,
  isMaximized,
  isMobile,
  onClearChat,
  onToggleMaximize,
  onClose,
}: PanelHeaderProps) {
  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(0,180,255,0.12)] bg-[rgba(0,40,80,0.2)]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] flex items-center justify-center shadow-[0_0_15px_rgba(0,180,255,0.3)] overflow-hidden">
          <YYC3LogoSvg size={20} showText={false} className="rounded" />
        </div>
        <div>
          <h3 className="text-[#e0f0ff] text-sm font-medium">AI 智能助理</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[rgba(0,212,255,0.4)] text-xs">
              {isLoading ? "模型加载中..." : modelName || "未选择模型"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onClearChat}
          className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all"
          title="清空对话"
        >
          <Trash2 className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
        </button>
        {!isMobile && (
          <button
            onClick={onToggleMaximize}
            className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all"
            title={isMaximized ? "还原" : "最大化"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
            )}
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[rgba(255,51,102,0.1)] transition-all"
        >
          <X className="w-4 h-4 text-[rgba(0,212,255,0.5)]" />
        </button>
      </div>
    </div>
  );
}
