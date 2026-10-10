/**
 * @file types.ts
 * @description AI 助手类型定义
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import type { ChatMessage } from "../../types";

export type { ChatMessage };

export type AITab = "chat" | "commands" | "prompts" | "settings";

export interface FloatingPanelState {
  isOpen: boolean;
  isMaximized: boolean;
  activeTab: AITab;
}

export interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  systemPrompt: string;
}

export interface AIConfigState {
  apiKey: string;
  selectedModel: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export interface AIAssistantProps {
  isMobile: boolean;
}
