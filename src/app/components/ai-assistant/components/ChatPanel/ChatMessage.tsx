/**
 * @file components/ChatPanel/ChatMessage.tsx
 * @description 聊天消息气泡组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Copy, Check } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../../types";

export interface ChatMessageProps {
  message: ChatMessageType;
  isCopied: boolean;
  onCopy: (text: string, id: string) => void;
}

export function ChatMessage({ message, isCopied, onCopy }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const containerClass = isUser ? "justify-end" : "justify-start";
  const bubbleClass = isUser
    ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.2)] rounded-2xl rounded-br-sm"
    : isSystem
      ? "bg-[rgba(255,221,0,0.08)] border border-[rgba(255,221,0,0.15)] rounded-2xl"
      : "bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] rounded-2xl rounded-bl-sm";

  const textClass = isUser
    ? "text-[#e0f0ff]"
    : isSystem
      ? "text-[#ffdd00]"
      : "text-[#c0dcf0]";

  return (
    <div className={`flex ${containerClass}`}>
      <div className={`max-w-[85%] relative group ${bubbleClass} px-3.5 py-2.5`}>
        <div className={`whitespace-pre-wrap ${textClass}`} style={{ fontSize: "0.78rem", lineHeight: "1.6" }}>
          {message.content}
        </div>
        {message.role === "assistant" && (
          <button
            onClick={() => onCopy(message.content, message.id)}
            className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgba(0,212,255,0.1)] transition-all"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-[#00ff88]" />
            ) : (
              <Copy className="w-3 h-3 text-[rgba(0,212,255,0.3)]" />
            )}
          </button>
        )}
        <div className="text-[rgba(0,212,255,0.2)] mt-1" style={{ fontSize: "0.58rem" }}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN")}
        </div>
      </div>
    </div>
  );
}
