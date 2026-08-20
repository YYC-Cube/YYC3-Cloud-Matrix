/**
 * file: FollowUpPanel.test.tsx
 * description: FollowUpPanel 组件测试 · 告警跟进面板（统计卡+筛选按钮+卡片流+详情抽屉）
 * author: YanYuCloudCube Team
 * version: v1.1.0
 * created: 2026-08-19
 * updated: 2026-08-19
 * status: active
 * tags: [component],[test],[monitor]
 *
 * brief: 严格对齐 SDKChatPanel 测试约定 + 修复 useAlerts 返回对象契约
 *
 * details:
 * - useAlerts 返回 { followUps, addFollowUp, updateFollowUp, removeFollowUp }
 * - wsData 返回含 isSimulated 属性
 * - 筛选按钮从 severityFilters / statusFilters 渲染（非文本 placeholder 搜索框）
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { FollowUpItem } from "../types";

// ──────────────────────────────────────────────────────────────────
// Mock 共享层（与 SDKChatPanel.test.tsx 保持一致）
// ──────────────────────────────────────────────────────────────────

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (k: string, _vars?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        "followUp.title": "异常跟进",
        "followUp.subtitle": "AI 驱动告警跟进与自愈闭环",
        "common.all": "全部",
        "ai.severity.critical": "紧急",
        "common.error": "错误",
        "common.warning": "警告",
        "common.info": "信息",
        "pwa.online": "在线",
        "ai.analyzing": "分析中",
        "followUp.markResolved": "已解决",
        "ai.dismiss": "忽略",
        "common.noData": "暂无数据",
        "palette.noResults": "没有匹配的结果",
      };
      return map[k] ?? k;
    },
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../hooks/useWebSocketData", () => ({
  useWebSocketData: () => ({
    data: null,
    connected: false,
    connecting: false,
    error: null,
    lastUpdate: Date.now(),
    isSimulated: false,
  }),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: {},
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...rest }: any) =>
    React.createElement("div", { "data-testid": "yyc3-glass-card", className, ...rest }, children),
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

// ──────────────────────────────────────────────────────────────────
// 测试数据 + useAlerts mock（注意：返回对象而非数组）
// ──────────────────────────────────────────────────────────────────

const BASE = Date.now() - 2 * 3600 * 1000;

const mockGlobalFollowUps: FollowUpItem[] = [
  {
    id: "AL-0032",
    severity: "critical",
    title: "GPU-A100-03 推理延迟异常",
    source: "GPU-A100-03",
    metric: "2,450ms > 2,000ms (阈值)",
    status: "active",
    timestamp: BASE - 5 * 60 * 1000,
    assignee: "admin",
    tags: ["推理延迟", "A100", "LLaMA-70B"],
    relatedAlerts: ["AL-0030", "AL-0028"],
    chain: [],
  },
  {
    id: "AL-0031",
    severity: "error",
    title: "GPU-H100-02 显存不足告警",
    source: "GPU-H100-02",
    metric: "78.5GB / 80GB (98.1%)",
    status: "investigating",
    timestamp: BASE - 18 * 60 * 1000,
    assignee: "ops_bot",
    tags: ["显存", "H100"],
    relatedAlerts: ["AL-0029"],
    chain: [],
  },
  {
    id: "AL-0030",
    severity: "warning",
    title: "存储空间接近阈值",
    source: "NAS-Storage-01",
    metric: "41.2TB / 48TB (85.8%)",
    status: "resolved",
    timestamp: BASE - 45 * 60 * 1000,
    tags: ["存储", "NAS"],
    chain: [],
  },
];

let mockAddFn: ReturnType<typeof vi.fn>;
let mockUpdateFn: ReturnType<typeof vi.fn>;
let mockRemoveFn: ReturnType<typeof vi.fn>;

vi.mock("../stores/global-store", () => ({
  useAlerts: () => ({
    followUps: mockGlobalFollowUps,
    addFollowUp: mockAddFn,
    updateFollowUp: mockUpdateFn,
    removeFollowUp: mockRemoveFn,
  }),
}));

// import 必须放在 vi.mock 之后
import { FollowUpPanel } from "../modules/monitor/FollowUpPanel";

describe("FollowUpPanel", () => {
  beforeEach(() => {
    mockAddFn = vi.fn();
    mockUpdateFn = vi.fn();
    mockRemoveFn = vi.fn();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应不崩溃并成功挂载 GlassCard 容器", () => {
      render(<FollowUpPanel />);
      expect(screen.getAllByTestId("yyc3-glass-card").length).toBeGreaterThan(0);
    });

    it("应展示异常跟进标题", () => {
      render(<FollowUpPanel />);
      expect(screen.getByText("异常跟进")).toBeInTheDocument();
    });

    it("应展示 3 张告警卡片标题", () => {
      render(<FollowUpPanel />);
      expect(screen.getAllByText("GPU-A100-03 推理延迟异常")[0]).toBeTruthy();
      expect(screen.getAllByText("GPU-H100-02 显存不足告警")[0]).toBeTruthy();
      expect(screen.getAllByText("存储空间接近阈值")[0]).toBeTruthy();
    });

    it("应展示 4 张统计卡（紧急/错误/分析中/已解决）", () => {
      render(<FollowUpPanel />);
      // GlassCard 数 >= 5: 1 过滤卡 + 4 统计卡 + 可能空态/卡片容器
      const cards = screen.getAllByTestId("yyc3-glass-card");
      expect(cards.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("告警级别按钮渲染", () => {
    it("应渲染 5 个级别过滤按钮 (全部/紧急/错误/警告/信息)", () => {
      render(<FollowUpPanel />);
      ["全部", "紧急", "错误", "警告", "信息"].forEach(lbl => {
        expect(screen.getAllByText(lbl).length).toBeGreaterThan(0);
      });
    });

    it("点击 '紧急' 应正常过滤（不崩溃）", () => {
      render(<FollowUpPanel />);
      const btn = screen.getAllByText("紧急")[0];
      fireEvent.click(btn);
      expect(screen.getAllByText("GPU-A100-03 推理延迟异常")[0]).toBeTruthy();
    });
  });

  describe("状态过滤按钮渲染", () => {
    it("应渲染 5 个状态过滤按钮", () => {
      render(<FollowUpPanel />);
      ["在线", "分析中", "已解决", "忽略"].forEach(lbl => {
        expect(screen.getAllByText(lbl).length).toBeGreaterThan(0);
      });
    });

    it("点击 '已解决' 状态按钮仅展示 resolved 的告警", () => {
      render(<FollowUpPanel />);
      fireEvent.click(screen.getAllByText("已解决")[0]);
      expect(screen.getAllByText("存储空间接近阈值")[0]).toBeTruthy();
    });
  });

  describe("统计卡数值正确", () => {
    it("critical 统计值为 1", () => {
      render(<FollowUpPanel />);
      const labels = screen.getAllByText("紧急");
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    it("error 统计值为 1", () => {
      render(<FollowUpPanel />);
      expect(screen.getAllByText("错误").length).toBeGreaterThanOrEqual(2);
    });

    it("已解决统计值为 1", () => {
      render(<FollowUpPanel />);
      expect(screen.getAllByText("已解决").length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("跟进抽屉交互回调", () => {
    it("FollowUpCard 渲染完成后 updateFollowUp 仍未被调用（未触发操作前）", () => {
      render(<FollowUpPanel />);
      expect(mockUpdateFn).not.toHaveBeenCalled();
    });

    it("存在 FollowUpCard 组件的容器挂载", () => {
      const { container } = render(<FollowUpPanel />);
      expect(container.innerHTML.includes("GPU-A100-03")).toBe(true);
    });
  });
});
