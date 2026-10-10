/**
 * @file components/ChatPanel/ChatInput.tsx
 * @description 聊天输入框组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Send } from "lucide-react";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "输入指令... (Enter 发送, Shift+Enter 换行)",
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="shrink-0 p-3 border-t border-[rgba(0,180,255,0.1)]">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] resize-none disabled:opacity-50"
          style={{ fontSize: "0.8rem", maxHeight: "100px" }}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white hover:shadow-[0_0_15px_rgba(0,180,255,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
