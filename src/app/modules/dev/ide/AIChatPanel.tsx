/**
 * @file: AIChatPanel.tsx
 * @description: AIChatPanel.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Bot,
  Bug,
  Check,
  Clipboard,
  Copy,
  FileCode,
  Image as ImageIcon,
  Lightbulb,
  Link,
  Plus,
  RefreshCw,
  Send,
  Sigma,
  Sparkles,
  TestTube,
  User,
  Wand2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBigModelSDK } from "../../../hooks/useBigModelSDK";
import { useCopyFeedback } from "../../../hooks/useCopyFeedback";
import { useI18n } from "../../../hooks/useI18n";
import type { KnowledgeSearchResult } from "../../../lib/local-knowledge-base";
import {
  formatSearchResultForAI,
  searchKnowledge,
} from "../../../lib/local-knowledge-base";
import { useProviderSlice } from "../../../store/slices/provider-slice";
import type { ConfiguredModel } from "../../../types";
import { MOCK_CHAT_HISTORY } from "./ide-mock-data";
import type { ChatMessage } from "./ide-types";

// AI Quick Actions — labels are resolved via i18n at render time
const AI_QUICK_ACTIONS = [
  { id: "explain", icon: Lightbulb, labelKey: "ide.explain", color: "#ffaa00", prompt: "请解释这段代码的功能和逻辑" },
  { id: "fix", icon: Bug, labelKey: "ide.fixBug", color: "#ff3366", prompt: "请找出并修复这段代码中的 bug" },
  { id: "optimize", icon: Zap, labelKey: "ide.optimize", color: "#00ff88", prompt: "请优化这段代码的性能" },
  { id: "test", icon: TestTube, labelKey: "ide.test", color: "#c792ea", prompt: "请为这段代码生成单元测试" },
  { id: "refactor", icon: RefreshCw, labelKey: "ide.refactor", color: "#00d4ff", prompt: "请重构这段代码，改善可读性" },
  { id: "generate", icon: Wand2, labelKey: "ide.generate", color: "#7b61ff", prompt: "请根据描述生成代码" },
];

// Mock AI response generator
function generateEnhancedResponse(
  prompt: string,
  kbHits: KnowledgeSearchResult[],
): string {
  const kbSection = kbHits.length > 0
    ? `\n\n📚 **本地知识库参考**:\n${kbHits.map((r, i) => `${i + 1}. **${r.article.title}** — ${r.article.summary}`).join("\n")}`
    : "";

  if (prompt.includes("解释") || prompt.includes("explain")) {
    return "这段代码实现了一个 **React 函数组件**，主要功能包括：\n\n1. 使用 `useState` 管理组件状态\n2. 通过 `useEffect` 处理副作用\n3. 使用 Tailwind CSS 进行样式控制\n\n核心逻辑是通过 props 接收数据，经过内部处理后渲染 UI。" + kbSection;
  }
  if (prompt.includes("bug") || prompt.includes("修复")) {
    return "发现 **2 个潜在问题**：\n\n🔴 **Issue 1**: `useEffect` 缺少依赖项\n🟡 **Issue 2**: 未处理 `null` 边界情况\n\n修复后代码应该可以正常运行。" + kbSection;
  }
  if (prompt.includes("优化") || prompt.includes("optimize")) {
    return "🚀 **性能优化建议**：\n\n1. **Memoize** 计算密集的函数\n2. **虚拟滚动**: 列表超过 100 项时使用虚拟化\n3. **Code Splitting**: 使用 `React.lazy` 延迟加载\n\n预计优化后渲染时间降低 **40-60%**。" + kbSection;
  }
  if (prompt.includes("测试") || prompt.includes("test")) {
    return "已生成 **Vitest 单元测试**模板，覆盖核心渲染和边界情况。\n\n提示: 项目使用 Vitest + @testing-library/react，运行 `pnpm test` 执行。" + kbSection;
  }
  if (prompt.includes("重构") || prompt.includes("refactor")) {
    return "♻️ **重构建议**：\n\n1. 提取自定义 Hook\n2. 拆分为子组件\n3. 使用 discriminated union 优化类型\n\n重构后代码行数减少约 **30%**。" + kbSection;
  }

  const defaultKb = kbSection || "\n\n💡 输入 `kb search <关键词>` 在终端中搜索项目知识库。";
  return "收到！正在分析你的需求...\n\n基于当前项目上下文，我建议结合项目组件库来实现。需要我生成完整代码吗？" + defaultKb;
}

function _generateMockResponse(prompt: string): string {
  return generateEnhancedResponse(prompt, []);
}

let messageIdCounter = 0;
const generateMessageId = (suffix: string = ""): string => {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}${suffix}`;
};

const getCurrentTimestamp = (): string => {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
};

export function AIChatPanel() {
  const { t } = useI18n();
  const { configuredModels } = useProviderSlice();
  const sdk = useBigModelSDK();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_HISTORY);
  const [input, setInput] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [_kbResults, setKbResults] = useState<KnowledgeSearchResult[]>([]);
  const [copiedId, handleCopyMessage] = useCopyFeedback<string>();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(async (content?: string) => {
    const text = content || input.trim();
    if (!text) { return; }

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: text,
      timestamp: getCurrentTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const kbHits = searchKnowledge(text);
    setKbResults(kbHits);
    const _kbContext = kbHits.length > 0 ? formatSearchResultForAI(kbHits) : "";

    const activeModel: ConfiguredModel | undefined = configuredModels[0];
    const hasActiveProvider = !!activeModel;

    if (hasActiveProvider) {
      try {
        const response = await sdk.sendMessage(activeModel, text);
        const aiMsg: ChatMessage = {
          id: generateMessageId("-ai"),
          role: "assistant",
          content: response.content || generateEnhancedResponse(text, kbHits),
          timestamp: getCurrentTimestamp(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        const aiMsg: ChatMessage = {
          id: generateMessageId("-ai"),
          role: "assistant",
          content: generateEnhancedResponse(text, kbHits),
          timestamp: getCurrentTimestamp(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } else {
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: generateMessageId("-ai"),
          role: "assistant",
          content: generateEnhancedResponse(text, kbHits),
          timestamp: getCurrentTimestamp(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 600 + Math.random() * 800);
      return;
    }
    setIsTyping(false);
  }, [input, configuredModels, sdk]);

  const handleQuickAction = useCallback((action: typeof AI_QUICK_ACTIONS[0]) => {
    handleSend(action.prompt);
  }, [handleSend]);

  const attachOptions = [
    { icon: ImageIcon, label: t("ide.uploadImage"), color: "#ff6b9d" },
    { icon: FileCode, label: t("ide.codeSnippet"), color: "#00d4ff" },
    { icon: Link, label: t("ide.githubLink"), color: "#7b61ff" },
    { icon: Sigma, label: t("ide.figmaFile"), color: "#00ff88" },
    { icon: Clipboard, label: t("ide.clipboard"), color: "#ffaa00" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "rgba(4,10,22,0.6)" }}>
      {/* Quick Actions Bar */}
      <div
        className="shrink-0 px-2 py-1.5 overflow-x-auto"
        style={{
          borderBottom: "1px solid rgba(0,180,255,0.08)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,180,255,0.1) transparent",
        }}
      >
        <div className="flex items-center gap-1">
          {AI_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)] hover:border-[rgba(0,212,255,0.25)] hover:bg-[rgba(0,40,80,0.4)] transition-all shrink-0"
                title={action.prompt}
              >
                <Icon className="w-3 h-3" style={{ color: action.color }} />
                <span className="text-[#c0dcf0]" style={{ fontSize: "0.58rem" }}>{t(action.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat History */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 space-y-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,180,255,0.15) transparent" }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
              style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #00d4ff, #7b61ff)"
                  : msg.role === "assistant"
                    ? "linear-gradient(135deg, #00ff88, #00d4ff)"
                    : "rgba(0,40,80,0.5)",
              }}
            >
              {msg.role === "user" ? (
                <User className="w-3 h-3 text-white" />
              ) : msg.role === "assistant" ? (
                <Sparkles className="w-3 h-3 text-white" />
              ) : (
                <Bot className="w-3 h-3 text-[#00d4ff]" />
              )}
            </div>
            <div
              className={`relative max-w-[85%] rounded-lg px-2.5 py-2 group ${msg.role === "user"
                ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.2)]"
                : "bg-[rgba(0,40,80,0.25)] border border-[rgba(0,180,255,0.08)]"
                }`}
            >
              <p className="text-[#c0dcf0] whitespace-pre-wrap" style={{ fontSize: "0.68rem", lineHeight: "1.5" }}>
                {msg.content}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[rgba(0,212,255,0.2)]" style={{ fontSize: "0.5rem" }}>
                  {msg.timestamp}
                </p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] transition-all"
                    title="Copy"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-[#00ff88]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div
              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00ff88, #00d4ff)" }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="bg-[rgba(0,40,80,0.25)] border border-[rgba(0,180,255,0.08)] rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-2 py-1.5" style={{ borderTop: "1px solid rgba(0,180,255,0.08)" }}>
        <div
          className="flex items-end gap-1 rounded-lg p-1"
          style={{
            background: "rgba(0,40,80,0.3)",
            border: "1px solid rgba(0,180,255,0.12)",
          }}
        >
          {/* Attach button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              title="附件"
              className="p-1.5 rounded-md text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {showAttachMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                <div
                  className="absolute bottom-full left-0 mb-1 rounded-lg overflow-hidden z-50"
                  style={{
                    background: "rgba(8,20,45,0.95)",
                    border: "1px solid rgba(0,180,255,0.2)",
                    backdropFilter: "blur(12px)",
                    minWidth: "140px",
                  }}
                >
                  {attachOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => setShowAttachMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[#c0dcf0] hover:bg-[rgba(0,40,80,0.3)] transition-all"
                      >
                        <Icon className="w-3 h-3" style={{ color: opt.color }} />
                        <span style={{ fontSize: "0.65rem" }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Text input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("ide.askAI")}
            rows={1}
            className="flex-1 bg-transparent text-[#e0f0ff] placeholder-[rgba(0,212,255,0.2)] resize-none outline-none"
            style={{
              fontSize: "0.72rem",
              lineHeight: "1.5",
              maxHeight: "80px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,180,255,0.15) transparent",
            }}
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            title="发送"
            disabled={!input.trim() || isTyping}
            className={`p-1.5 rounded-md transition-all ${input.trim() && !isTyping
              ? "text-[#00d4ff] hover:bg-[rgba(0,212,255,0.12)]"
              : "text-[rgba(0,212,255,0.15)]"
              }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
