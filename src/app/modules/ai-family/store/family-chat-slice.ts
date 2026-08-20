/**
 * @file: family-chat-slice.ts
 * @description: YYC³ AI Family 对话历史 Slice — 按频道隔离 + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[chat]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  type: "text" | "system" | "thinking";
  source?: "llm" | "agent" | "mock";
}

const SEED_GROUP_MESSAGES: ChatMessage[] = [
  { id: "sys-1", sender: "system", text: "欢迎来到 AI Family 家庭群聊，这里是我们的温馨空间。", time: "09:00", type: "system" },
  { id: "m1", sender: "meta-oracle", text: "大家早上好！今日系统状态良好，开始美好的一天吧！", time: "09:01", type: "text" },
  { id: "m2", sender: "navigator", text: "早安家人们~ 今天我收到了3个新的分析需求，已经路由分配了。", time: "09:05", type: "text" },
];

const MAX_MESSAGES_PER_CHANNEL = 200;

interface FamilyChatSlice {
  channels: Record<string, ChatMessage[]>;
  addMessage: (channelId: string, message: Omit<ChatMessage, "id">) => void;
  clearChannel: (channelId: string) => void;
  getChannelMessages: (channelId: string) => ChatMessage[];
}

function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.length > MAX_MESSAGES_PER_CHANNEL
    ? messages.slice(-MAX_MESSAGES_PER_CHANNEL)
    : messages;
}

export const useFamilyChatSlice = create<FamilyChatSlice>()(
  persist(
    (set, get) => ({
      channels: { "family-group": SEED_GROUP_MESSAGES },

      addMessage: (channelId, message) =>
        set((s) => {
          const existing = s.channels[channelId] || [];
          const updated = trimMessages([
            ...existing,
            { ...message, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
          ]);
          return { channels: { ...s.channels, [channelId]: updated } };
        }),

      clearChannel: (channelId) =>
        set((s) => {
          const updated = { ...s.channels };
          delete updated[channelId];
          return { channels: updated };
        }),

      getChannelMessages: (channelId) => get().channels[channelId] || [],
    }),
    {
      name: "yyc3-family-chat",
      partialize: (state) => ({ channels: state.channels }),
    },
  ),
);
