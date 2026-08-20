/**
 * @file: family-message.ts
 * @description: YYC³ AI Family 统一消息模型 — 全应用唯一规范定义
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [types],[ai-family],[message],[unified]
 *
 * @brief: 统一消息类型，合并 shared.ts / ai-family-hotel.types.ts / FamilyChat.tsx 三套消息定义
 */


// ============================================================
//  消息内容类型
// ============================================================

export type MessageContentType =
  | "text"
  | "announcement"
  | "alert"
  | "system"
  | "action-request"
  | "heartbeat";

// ============================================================
//  消息优先级 & 状态
// ============================================================

export type MessagePriority = "low" | "normal" | "high" | "urgent";

export type MessageDeliveryStatus = "sent" | "delivered" | "read" | "failed";

// ============================================================
//  统一消息模型
// ============================================================

/**
 * UnifiedFamilyMessage — 全应用唯一消息数据模型
 *
 * 合并自:
 * - shared.ts FamilyMessage (简单版)
 * - ai-family-hotel.types.ts FamilyMessage (酒店版)
 * - FamilyChat.tsx ChatMessage (聊天版)
 */
export interface UnifiedFamilyMessage {
  id: string;

  /** 会话分组 ID（私信=dm:memberId，群聊=family-group） */
  conversationId: string;

  /** 发送者 — memberId 或 "user" */
  senderId: string;
  senderName: string;

  /** 接收者 — memberId、"all"、或 "user" */
  receiverId: string;

  /** 消息内容 */
  content: {
    type: MessageContentType;
    text: string;
    metadata?: Record<string, unknown>;
  };

  priority: MessagePriority;

  /** Unix 毫秒时间戳 */
  timestamp: number;

  deliveryStatus: MessageDeliveryStatus;
  read: boolean;

  /** 线程支持 */
  replyTo?: string;
  threadId?: string;
}

// ============================================================
//  会话模型
// ============================================================

export interface FamilyConversation {
  id: string;
  type: "dm" | "group";
  participantIds: string[];   // memberId 或 "user"
  lastMessage?: UnifiedFamilyMessage;
  unreadCount: number;
  updatedAt: number;
}
