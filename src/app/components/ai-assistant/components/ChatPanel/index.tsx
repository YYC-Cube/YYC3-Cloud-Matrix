/**
 * @file components/ChatPanel/index.tsx
 * @description 聊天面板容器组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import type { RefObject } from "react";
import type { ChatMessage } from "../../types";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";

export interface ChatPanelProps {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  copiedId: string | null;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCopy: (text: string, id: string) => void;
}

export function ChatPanel({
  messages,
  inputValue,
  isTyping,
  copiedId,
  chatEndRef,
  onInputChange,
  onSend,
  onCopy,
}: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-[rgba(0,212,255,0.3)] scrollbar-track-transparent hover:scrollbar-thumb-[rgba(0,212,255,0.5)]">
        {messages.map((msg) => (
          <ChatMessageComponent
            key={msg.id}
            message={msg}
            isCopied={copiedId === msg.id}
            onCopy={onCopy}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>
      <ChatInput value={inputValue} onChange={onInputChange} onSend={onSend} disabled={isTyping} />
    </div>
  );
}
