/**
 * @file components/FloatingButton.tsx
 * @description AI 助手浮动触发按钮
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Sparkles } from "lucide-react";
import { YYC3LogoSvg } from "../../../modules/shared/YYC3LogoSvg";

export interface FloatingButtonProps {
  onClick: () => void;
  isMobile?: boolean;
  tooltip?: string;
}

export function FloatingButton({ onClick, isMobile = false, tooltip = "AI 智能助理 (⌘J)" }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed z-[60] group"
      style={{
        bottom: isMobile ? 80 : 24,
        right: isMobile ? 16 : 24,
      }}
    >
      <div
        className="relative rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] flex items-center justify-center shadow-[0_0_30px_rgba(0,180,255,0.4)] hover:shadow-[0_0_40px_rgba(0,180,255,0.6)] transition-all hover:scale-105 active:scale-95"
        style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
      >
        <YYC3LogoSvg size={isMobile ? 24 : 28} showText={false} className="rounded-md" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] animate-ping opacity-20" />
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,136,0.5)]">
          <Sparkles className="w-3 h-3 text-[#060e1f]" />
        </div>
      </div>
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-[rgba(8,25,55,0.95)] border border-[rgba(0,180,255,0.2)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <span className="text-[#00d4ff] text-xs">{tooltip}</span>
      </div>
    </button>
  );
}
