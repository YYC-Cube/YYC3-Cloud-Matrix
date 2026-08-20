/**
 * @file: family-message-slice.ts
 * @description: YYC³ AI Family 消息 Slice — 统一消息管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [store],[slice],[ai-family],[message]
 *
 * @brief: 统一消息数据源，合并 FamilyChat/FamilyCommCenter/FamilyHotel 三套消息
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UnifiedFamilyMessage, FamilyConversation } from '../types';

// ============================================================
//  Slice 接口
// ============================================================

interface FamilyMessageSlice {
  /** 所有消息 */
  messages: UnifiedFamilyMessage[];

  /** 会话列表 */
  conversations: FamilyConversation[];

  /** 当前激活会话 */
  activeConversationId: string | null;

  // ── 读取 ──
  getMessagesByConversation: (conversationId: string) => UnifiedFamilyMessage[];
  getUnreadCount: (conversationId?: string) => number;

  // ── 写入 ──
  sendMessage: (msg: Omit<UnifiedFamilyMessage, 'id' | 'timestamp' | 'deliveryStatus'>) => UnifiedFamilyMessage;
  markRead: (messageId: string) => void;
  markConversationRead: (conversationId: string) => void;
  deleteMessage: (messageId: string) => void;

  // ── 会话管理 ──
  setActiveConversation: (id: string | null) => void;
  ensureConversation: (conversation: FamilyConversation) => void;

  // ── 批量 ──
  importMessages: (messages: UnifiedFamilyMessage[]) => void;
  clearAll: () => void;
}

// ============================================================
//  辅助函数
// ============================================================

let _msgCounter = 0;
function generateMessageId(): string {
  return `fm-${Date.now()}-${++_msgCounter}`;
}

function generateConversationId(senderId: string, receiverId: string): string {
  if (receiverId === "all") {return "family-group";}
  const ids = [senderId, receiverId].sort();
  return `dm:${ids[0]}:${ids[1]}`;
}

// ============================================================
//  Slice 实现
// ============================================================

export const useFamilyMessageSlice = create<FamilyMessageSlice>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [
        {
          id: "family-group",
          type: "group",
          participantIds: ["user", "navigator", "thinker", "prophet", "bolero", "meta-oracle", "sentinel", "master", "creative"],
          unreadCount: 0,
          updatedAt: Date.now(),
        },
      ],
      activeConversationId: null,

      getMessagesByConversation: (conversationId) =>
        get().messages
          .filter((m) => m.conversationId === conversationId)
          .sort((a, b) => a.timestamp - b.timestamp),

      getUnreadCount: (conversationId) => {
        const msgs = conversationId
          ? get().messages.filter((m) => m.conversationId === conversationId)
          : get().messages;
        return msgs.filter((m) => !m.read).length;
      },

      sendMessage: (msg) => {
        const full: UnifiedFamilyMessage = {
          ...msg,
          id: generateMessageId(),
          timestamp: Date.now(),
          deliveryStatus: "sent",
        };

        // 自动确认 conversationId
        if (!full.conversationId) {
          full.conversationId = generateConversationId(full.senderId, full.receiverId);
        }

        set((s) => ({
          messages: [...s.messages, full],
          conversations: s.conversations.map((c) =>
            c.id === full.conversationId
              ? { ...c, lastMessage: full, unreadCount: c.unreadCount + 1, updatedAt: full.timestamp }
              : c
          ),
        }));

        return full;
      },

      markRead: (messageId) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, read: true, deliveryStatus: "read" as const } : m
          ),
        })),

      markConversationRead: (conversationId) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.conversationId === conversationId ? { ...m, read: true } : m
          ),
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      deleteMessage: (messageId) =>
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== messageId),
        })),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      ensureConversation: (conversation) =>
        set((s) => {
          if (s.conversations.some((c) => c.id === conversation.id)) {return s;}
          return { conversations: [...s.conversations, conversation] };
        }),

      importMessages: (messages) =>
        set((s) => {
          const existingIds = new Set(s.messages.map((m) => m.id));
          const newMsgs = messages.filter((m) => !existingIds.has(m.id));
          return { messages: [...s.messages, ...newMsgs] };
        }),

      clearAll: () => set({ messages: [], activeConversationId: null }),
    }),
    {
      name: 'yyc3-family-messages',
      partialize: (state) => ({
        messages: state.messages.slice(-500), // 最多保留 500 条消息
        conversations: state.conversations,
      }),
    }
  )
);
