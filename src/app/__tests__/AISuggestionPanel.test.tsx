/**
 * @file: AISuggestionPanel.test.tsx
 * @description: AISuggestionPanel.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * AISuggestionPanel.test.tsx
 * =========================
 * AISuggestionPanel 组件测试
 *
 * 覆盖范围:
 * - 组件基本渲染
 * - Tab 切换功能
 * - 分析 Tab 的 UI 元素
 * - 聊天 Tab 的渲染
 * - 健康度显示
 * - 统计数据显示
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { AISuggestionPanel } from "../modules/monitor/AISuggestionPanel";

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  const icons = Object.fromEntries(
    Object.keys(actual).map((key) => [key, (props: Record<string, unknown>) =>
      React.createElement("span", { ...props, "data-testid": `icon-${key}` })
    ])
  );
  return icons;
});

vi.mock("../modules/monitor/SDKChatPanel", () => ({
  __esModule: true,
  SDKChatPanel: () => React.createElement("div", { "data-testid": "sdk-chat-panel" }, "SDK Chat Panel Mock"),
  default: () => React.createElement("div", { "data-testid": "sdk-chat-panel" }, "SDK Chat Panel Mock"),
}));

vi.mock("../modules/monitor/PatternAnalyzer", () => ({
  __esModule: true,
  PatternAnalyzer: () => React.createElement("div", { "data-testid": "pattern-analyzer" }, "Pattern Analyzer Mock"),
  default: () => React.createElement("div", { "data-testid": "pattern-analyzer" }, "Pattern Analyzer Mock"),
}));

vi.mock("../modules/monitor/ActionRecommender", () => ({
  __esModule: true,
  ActionRecommender: () => React.createElement("div", { "data-testid": "action-recommender" }, "Action Recommender Mock"),
  default: () => React.createElement("div", { "data-testid": "action-recommender" }, "Action Recommender Mock"),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock("../modules/shared/Layout", () => ({
  ViewContext: React.createContext({ isMobile: false, theme: "dark" as const }),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "ai.title": "AI 辅助决策",
        "ai.subtitle": "智能分析系统健康状态，提供优化建议",
        "sdk.analysisTab": "分析",
        "sdk.chatTab": "对话",
        "ai.autoAnalysis": "自动分析",
        "ai.reAnalyze": "重新分析",
        "ai.analyzing": "分析中...",
        "ai.systemHealth": "系统健康度",
        "ai.anomalyPatterns": "异常模式",
        "ai.severity.critical": "严重",
        "ai.pendingSuggestions": "待处理建议",
        "ai.applied": "已应用",
        "common.justNow": "刚刚",
        "common.minutesAgo": "{{n}} 分钟前",
        "common.hoursAgo": "{{n}} 小时前",
      };
      let result = translations[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, String(v));
        });
      }
      return result;
    },
  }),
}));

describe("AISuggestionPanel", () => {
  beforeEach(() => {
    cleanup();
    vi.mock("../hooks/useAISuggestion", () => ({
      useAISuggestion: () => ({
        patterns: [
          {
            id: "pat-1",
            type: "latency_spike",
            severity: "critical",
            description: "延迟突增至 2500ms",
            firstSeen: Date.now() - 3600000,
            occurrences: 5,
          },
          {
            id: "pat-2",
            type: "memory_leak",
            severity: "warning",
            description: "内存使用持续增长",
            firstSeen: Date.now() - 7200000,
            occurrences: 3,
          },
        ],
        recommendations: [
          {
            id: "rec-1",
            patternId: "pat-1",
            action: "迁移模型到 GPU-A100-07",
            description: "负载 15%，延迟预计降至 800ms",
            impact: "high",
            confidence: 92,
            autoExecutable: true,
          },
          {
            id: "rec-2",
            patternId: "pat-1",
            action: "重启推理服务",
            description: "清理内存碎片",
            impact: "medium",
            confidence: 78,
            autoExecutable: true,
          },
        ],
        overallHealth: 75,
        isAnalyzing: false,
        lastAnalyzedAt: Date.now() - 1800000,
        enabledAutoSuggestion: true,
        setEnabledAutoSuggestion: vi.fn(),
        stats: {
          totalPatterns: 12,
          criticalCount: 3,
          totalRecommendations: 8,
          appliedCount: 5,
        },
        runAnalysis: vi.fn(),
        applyRecommendation: vi.fn(),
        dismissRecommendation: vi.fn(),
        dismissPattern: vi.fn(),
        getRecommendationsForPattern: vi.fn(() => [
          {
            id: "rec-1",
            patternId: "pat-1",
            action: "迁移模型到 GPU-A100-07",
            description: "负载 15%，延迟预计降至 800ms",
            impact: "high",
            confidence: 92,
            autoExecutable: true,
          },
        ]),
      }),
    }));
  });

  afterEach(() => {
    cleanup();
  });

  describe("组件渲染", () => {
    it("应该渲染标题和副标题", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("AI 辅助决策")).toBeInTheDocument();
      expect(screen.getByText("智能分析系统健康状态，提供优化建议")).toBeInTheDocument();
    });

    it("应该渲染两个 Tab 按钮", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("分析")).toBeInTheDocument();
      expect(screen.getByText("对话")).toBeInTheDocument();
    });

    it("应该渲染自动分析开关", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("自动分析")).toBeInTheDocument();
    });

    it("应该渲染运行分析按钮", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("重新分析")).toBeInTheDocument();
    });
  });

  describe("分析 Tab 内容", () => {
    it("应该显示系统健康度", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("系统健康度")).toBeInTheDocument();
    });

    it("应该显示异常模式", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("异常模式")).toBeInTheDocument();
    });

    it("应该显示待处理建议", () => {
      render(React.createElement(AISuggestionPanel));
      expect(screen.getByText("待处理建议")).toBeInTheDocument();
    });
  });

  describe("聊天 Tab", () => {
    it("切换到聊天 Tab 应该显示 SDKChatPanel", () => {
      render(React.createElement(AISuggestionPanel));
      const chatTab = screen.getByText("对话");
      fireEvent.click(chatTab);
      expect(screen.getByTestId("sdk-chat-panel")).toBeInTheDocument();
    });
  });
});
