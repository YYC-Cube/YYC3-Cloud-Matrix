/**
 * @file hooks/useChat.ts
 * @description 聊天消息管理 Hook
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "../types";
import { PROMPT_PRESETS } from "../constants";

function generateMockResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes("状态") || lower.includes("总览") || lower.includes("节点")) {
    return `## 集群状态报告\n\n**时间**: ${new Date().toLocaleString("zh-CN")}\n\n| 节点 | 状态 | GPU | 温度 |\n|------|------|-----|------|\n| GPU-A100-01 | 🟢 正常 | 87% | 68°C |\n| GPU-A100-02 | 🟢 正常 | 92% | 74°C |\n| GPU-A100-03 | 🟡 预警 | 98% | 82°C |\n| GPU-H100-01 | 🟢 正常 | 65% | 55°C |\n\n**建议**: GPU-A100-03 负载过高，建议将部分任务迁移到 GPU-H100-01。`;
  }

  if (lower.includes("部署") || lower.includes("模型")) {
    return `## 模型部署方案\n\n**目标模型**: DeepSeek-V3\n**推荐节点**: GPU-H100-03（当前空闲）\n\n**部署步骤**:\n1. 检查节点可用显存 → 80GB 可用 ✅\n2. 加载模型权重 → 预计 3 分钟\n3. 初始化推理引擎 → KV-Cache 预热\n4. 健康检查 → 验证推理准确率\n\n**预计时间**: 5-8 分钟\n**状态**: 等待确认执行`;
  }

  if (lower.includes("优化") || lower.includes("配置")) {
    return `## AI 优化建议\n\n基于当前系统状态分析：\n\n1. **推理并行度**: 建议从 4 提升到 6（当前 GPU 利用率有余量）\n2. **Batch Size**: 从 32 调整为 48（可提升 15% 吞吐）\n3. **KV-Cache**: 建议启用 PagedAttention，预计减少 30% 显存占用\n4. **负载均衡**: 建议切换为加权轮询策略\n\n**预估提升**: 整体推理吞吐提升约 22%`;
  }

  if (lower.includes("安全") || lower.includes("审计")) {
    return `## 安全审计摘要\n\n**扫描范围**: 全系统\n**扫描时间**: ${new Date().toLocaleString("zh-CN")}\n\n⚠️ **发现 2 项需关注**:\n1. IP 203.0.113.45 尝试非法 Token 访问（已拦截）\n2. 缓存服务响应时间波动（建议监控）\n\n✅ **安全项通过**: API 速率限制、MFA 认证、审计日志\n\n**风险评级**: 低风险 🟢`;
  }

  if (lower.includes("数据库") || lower.includes("存储") || lower.includes("postgresql")) {
    return `## 数据库健康报告\n\n**PostgreSQL** (localhost:5433)\n- 连接状态: 🟢 正常\n- 活跃连接: 24/100\n- 慢查询: 2 条（> 500ms）\n- 存储使用: 12.8TB / 48TB (27%)\n\n**向量数据库**: 5.2TB / 8TB (65%) ⚠️\n\n**建议**: 向量数据库使用率较高，建议计划扩容或清理过期索引。`;
  }

  return `收到您的请求："${userMsg}"\n\n我正在分析系统当前状态...\n\n**系统概览**:\n- 集群运行正常，7/8 节点活跃\n- 当前 QPS: ~3,800，推理延: ~48ms\n- GPU 平均利用率: 82.4%\n\n请问需要我执行具体操作还是查看更多详情？您可以输入具体命令或使用左侧的快捷操作按钮。`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你好！我是 CP-IM AI 智能助理。\n\n我可以帮你：\n- 📊 查看集群状态和性能报告\n- 🚀 部署和管理推理模型\n- 🔧 执行系统运维操作\n- 🔍 分析日志和诊断问题\n\n请输入指令或点击右侧快捷命令开始操作。",
  timestamp: Date.now(),
};

export interface UseChatOptions {
  initialMessages?: ChatMessage[];
  onResponse?: (message: ChatMessage) => void;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  systemPrompt: string;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (content: string) => Promise<void>;
  setInputValue: (value: string) => void;
  clearChat: () => void;
  setSystemPrompt: (prompt: string) => void;
  applyPreset: (presetId: string) => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessages, onResponse } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? [WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_PRESETS[4].prompt);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {return;}

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);

      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

      const response = generateMockResponse(content);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      onResponse?.(assistantMsg);
    },
    [onResponse]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "对话已清空。请输入新的指令开始操作。",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = PROMPT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSystemPrompt(preset.prompt);
      const sysMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        role: "system",
        content: `✅ 已切换系统角色为「${preset.name}」`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, sysMsg]);
    }
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return {
    messages,
    inputValue,
    isTyping,
    systemPrompt,
    chatEndRef,
    sendMessage,
    setInputValue,
    clearChat,
    setSystemPrompt,
    applyPreset,
    copyToClipboard,
    copiedId,
  };
}
