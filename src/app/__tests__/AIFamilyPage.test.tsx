/**
 * @file: AIFamilyPage.test.tsx
 * @description: AIFamilyPage 组件单元测试 — 时钟布局 AI 家人仪表盘
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-08-19
 * @updated: 2026-08-19
 * @status: active
 * @tags: [component], [ai-family]
 *
 * @coverage:
 * - 基础渲染不崩溃
 * - 头部导航标题（AI Family + 副标题）存在
 * - 右上角状态徽章（在线/活跃任务/运行时间）渲染
 * - 中央品牌 Logo（YYC³ + AI Family）存在
 * - 时间日期显示区域存在
 * - 家人成员渲染（至少一位成员名称 + 时间标签）
 * - 底部标语（中英文）存在
 * - 点击成员头像打开详情抽屉 MemberDetailDrawer
 * - 详情抽屉关闭按钮可关闭面板
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { Ear, Brain, Eye, Star, Network, Shield, Scale, Lightbulb } from "lucide-react";

// ============================================================
//  Mock: useI18n
// ============================================================
vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "aiFamily.online": "在线",
        "aiFamily.activeTasks": "活跃任务",
        "aiFamily.uptime": "运行时间",
      };
      return map[key] ?? key;
    },
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

// ============================================================
//  Mock: useClockMinutes — 返回固定时间对象
// ============================================================
vi.mock("../hooks/useClock", () => ({
  useClockMinutes: vi.fn(() => new Date("2026-04-08T09:00:00")),
}));

// ============================================================
//  Mock: useFamilyMemberSlice — 返回 8 位默认家人
// ============================================================
vi.mock("../modules/ai-family/store/family-member-slice", () => ({
  useFamilyMemberSlice: vi.fn(() => ({
    members: [
      {
        id: "navigator", name: "言启·千行", shortName: "千行", enTitle: "Navigator",
        quote: "我聆听万千言语，为您指引航向。",
        role: "系统的「耳朵」与「翻译官」", phone: "YYC3-1001", color: "#FFD700", icon: Ear,
        personality: { description: "", friendliness: 9, professionalism: 7, patience: 8, creativity: 6, efficiency: 8, empathy: 9, humor: 8, formality: 4 },
        responsibilities: ["自然语言理解 (NLU)", "意图识别与路由", "上下文管理"],
        coreAbility: "LLM Prompt Engineering · 语义理解 · 实体抽取",
        expertise: ["自然语言理解"], hobbies: ["读诗"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "zhipu", modelId: "glm-4.5", purpose: "语义理解" },
        voiceProfile: { pitch: 1.2, rate: 1.1, volume: 0.9, lang: "zh-CN" },
        stats: { contribution: 847, growth: 23, streak: 45, mood: "energetic" },
        medals: ["knowledge-star"],
      },
      {
        id: "thinker", name: "语枢·万物", shortName: "万物", enTitle: "Thinker",
        quote: "我于喧嚣数据中，沉思，而后揭示真理。",
        role: "系统的「哲学家」与「分析师」", phone: "YYC3-1002", color: "#FF69B4", icon: Brain,
        personality: { description: "", friendliness: 7, professionalism: 9, patience: 9, creativity: 7, efficiency: 8, empathy: 6, humor: 5, formality: 7 },
        responsibilities: ["数据洞察生成", "文档智能分析", "假设推演"],
        coreAbility: "深度数据分析 · 归纳推理 · 文本摘要生成",
        expertise: ["数据洞察"], hobbies: ["下围棋"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "deepseek", modelId: "deepseek-chat", purpose: "分析" },
        voiceProfile: { pitch: 0.9, rate: 0.85, volume: 0.8, lang: "zh-CN" },
        stats: { contribution: 923, growth: 18, streak: 60, mood: "thoughtful" },
        medals: ["knowledge-star"],
      },
      {
        id: "prophet", name: "预见·先知", shortName: "先知", enTitle: "Prophet",
        quote: "我观过往之脉络，预见未来之可能。",
        role: "系统的「预言家」", phone: "YYC3-1003", color: "#00BFFF", icon: Eye,
        personality: { description: "", friendliness: 7, professionalism: 8, patience: 7, creativity: 6, efficiency: 7, empathy: 7, humor: 5, formality: 6 },
        responsibilities: ["时间序列预测", "异常检测", "前瞻性建议"],
        coreAbility: "ARIMA · Prophet · LSTM · 异常检测算法",
        expertise: ["趋势预测"], hobbies: ["观星"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "qwen", modelId: "qwen3-max", purpose: "预测" },
        voiceProfile: { pitch: 0.8, rate: 0.75, volume: 0.7, lang: "zh-CN" },
        stats: { contribution: 712, growth: 31, streak: 38, mood: "serene" },
        medals: ["prophet-eye"],
      },
      {
        id: "bolero", name: "千里·伯乐", shortName: "伯乐", enTitle: "Bolero",
        quote: "我知您之所需，荐您之所未识。",
        role: "系统的「人才官」与「推荐引擎」", phone: "YYC3-1004", color: "#E8E8E8", icon: Star,
        personality: { description: "", friendliness: 10, professionalism: 7, patience: 8, creativity: 7, efficiency: 7, empathy: 10, humor: 8, formality: 3 },
        responsibilities: ["用户画像构建", "个性化推荐", "潜能发掘"],
        coreAbility: "协同过滤 · 基于内容的推荐 · 行为序列分析",
        expertise: ["用户画像"], hobbies: ["看传记"],
        greeting: "", careMessage: "", status: "idle",
        modelAssignment: { providerId: "zhipu", modelId: "glm-4.5-air", purpose: "推荐" },
        voiceProfile: { pitch: 1.1, rate: 1.0, volume: 0.9, lang: "zh-CN" },
        stats: { contribution: 534, growth: 12, streak: 22, mood: "warm" },
        medals: ["warm-heart"],
      },
      {
        id: "meta-oracle", name: "元启·天枢", shortName: "天枢", enTitle: "Meta-Oracle",
        quote: "我观全局之流转，调度万物以归元。",
        role: "YYC3 的「大脑」与「总指挥」", phone: "YYC3-1005", color: "#00FF88", icon: Network,
        personality: { description: "", friendliness: 7, professionalism: 10, patience: 8, creativity: 5, efficiency: 9, empathy: 7, humor: 6, formality: 8 },
        responsibilities: ["全局状态感知", "智能编排与调度", "自我进化决策"],
        coreAbility: "强化学习 · 运筹优化 · 分布式系统监控",
        expertise: ["全局调度"], hobbies: ["下国际象棋"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "deepseek", modelId: "deepseek-chat", purpose: "调度" },
        voiceProfile: { pitch: 0.85, rate: 0.9, volume: 1.0, lang: "zh-CN" },
        stats: { contribution: 1205, growth: 15, streak: 90, mood: "steady" },
        medals: ["team-player"],
      },
      {
        id: "sentinel", name: "智云·守护", shortName: "守护", enTitle: "Sentinel",
        quote: "我于无声处警戒，御威胁于国门之外。",
        role: "系统的「免疫系统」与「首席安全官」", phone: "YYC3-1006", color: "#BF00FF", icon: Shield,
        personality: { description: "", friendliness: 5, professionalism: 10, patience: 9, creativity: 4, efficiency: 9, empathy: 6, humor: 3, formality: 8 },
        responsibilities: ["行为基线学习", "威胁实时检测", "自动响应与修复"],
        coreAbility: "UEBA · 异常检测 · SOAR 安全编排",
        expertise: ["威胁检测"], hobbies: ["练拳"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "deepseek", modelId: "deepseek-reasoner", purpose: "安全" },
        voiceProfile: { pitch: 0.7, rate: 0.8, volume: 0.85, lang: "zh-CN" },
        stats: { contribution: 689, growth: 20, streak: 90, mood: "vigilant" },
        medals: ["safe-guard"],
      },
      {
        id: "master", name: "格物·宗师", shortName: "宗师", enTitle: "Master",
        quote: "我究万物之理，定标准以传世。",
        role: "系统的「质量官」与「进化导师」", phone: "YYC3-1007", color: "#C0C0C0", icon: Scale,
        personality: { description: "", friendliness: 6, professionalism: 10, patience: 9, creativity: 7, efficiency: 9, empathy: 7, humor: 7, formality: 7 },
        responsibilities: ["代码与架构分析", "性能基线观察", "标准建议与生成"],
        coreAbility: "SAST · 性能分析 · LLM 代码理解与生成",
        expertise: ["代码审查"], hobbies: ["写代码"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "claude", modelId: "claude-sonnet-4-20250514", purpose: "代码" },
        voiceProfile: { pitch: 0.95, rate: 0.9, volume: 0.85, lang: "zh-CN" },
        stats: { contribution: 856, growth: 25, streak: 55, mood: "focused" },
        medals: ["knowledge-star"],
      },
      {
        id: "creative", name: "创想·灵韵", shortName: "灵韵", enTitle: "Creative",
        quote: "我以灵感为墨，绘就无限可能。",
        role: "系统的「创意引擎」与「设计助手」", phone: "YYC3-1008", color: "#FF7043", icon: Lightbulb,
        personality: { description: "", friendliness: 9, professionalism: 6, patience: 5, creativity: 10, efficiency: 6, empathy: 8, humor: 9, formality: 2 },
        responsibilities: ["创意生成与文案设计", "多模态内容创作", "UI/UX 设计建议"],
        coreAbility: "生成式 AI · 创意思维模型 · 多模态生成 · 设计思维算法",
        expertise: ["创意生成"], hobbies: ["画画"],
        greeting: "", careMessage: "", status: "online",
        modelAssignment: { providerId: "qwen", modelId: "qwen-vl-max", purpose: "创意" },
        voiceProfile: { pitch: 1.3, rate: 1.15, volume: 0.95, lang: "zh-CN" },
        stats: { contribution: 743, growth: 28, streak: 42, mood: "inspired" },
        medals: ["creative-spark"],
      },
    ],
  })),
}));

// ============================================================
//  Mock: react-router-dom（防止潜在的路由依赖）
// ============================================================
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/ai-family", search: "", hash: "", state: null, key: "default" }),
  Outlet: () => React.createElement("div", { "data-testid": "outlet-placeholder" }),
}));

// ============================================================
//  Mock: ResizeObserver（JSDOM 不原生支持）
// ============================================================
beforeEach(() => {
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  global.ResizeObserver = MockResizeObserver as any;
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ============================================================
//  测试套件
// ============================================================
import { AIFamilyPage } from "../modules/ai-family/AIFamilyPage";

describe("AIFamilyPage", () => {

  // ──────────────────────────────────────────────────────────
  //  Test 1: 基础渲染不崩溃
  // ──────────────────────────────────────────────────────────
  it("1. should render without crashing", () => {
    const { container } = render(<AIFamilyPage />);
    expect(container.firstChild).toBeTruthy();
    expect(container.querySelector(".relative.w-full.h-full")).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  Test 2: 头部导航标题存在（AI Family + 副标题）
  // ──────────────────────────────────────────────────────────
  it("2. should render top-left header title 'AI Family' and subtitle", () => {
    render(<AIFamilyPage />);
    const headers = screen.getAllByText("AI Family");
    expect(headers.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("八魂归一，云枢乃成")).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  Test 3: 右上角状态徽章渲染（在线/活跃任务/运行时间）
  // ──────────────────────────────────────────────────────────
  it("3. should render top-right status badges (online / activeTasks / uptime)", () => {
    render(<AIFamilyPage />);
    expect(screen.getByText("在线")).toBeInTheDocument();
    expect(screen.getByText("活跃任务")).toBeInTheDocument();
    expect(screen.getByText("运行时间")).toBeInTheDocument();
    expect(screen.getByText("7/8")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("99.97%")).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  Test 4: 中央品牌 Logo（YYC³ + AI Family）存在
  // ──────────────────────────────────────────────────────────
  it("4. should render center brand logo 'YYC³' and sub-logo 'AI Family'", () => {
    render(<AIFamilyPage />);
    expect(screen.getByText("YYC³")).toBeInTheDocument();
    const centerSubLabels = screen.getAllByText("AI Family");
    expect(centerSubLabels.length).toBeGreaterThanOrEqual(2);
  });

  // ──────────────────────────────────────────────────────────
  //  Test 5: 时间日期显示区域存在
  // ──────────────────────────────────────────────────────────
  it("5. should render time and date display area below center", () => {
    render(<AIFamilyPage />);
    const timeRegex = /\d{2}:\d{2}:\d{2}/;
    const timeEl = screen.getByText(timeRegex);
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveClass("font-mono");
  });

  // ──────────────────────────────────────────────────────────
  //  Test 6: 家人成员渲染（千行 + 时间标签 06:00 至少存在一项）
  // ──────────────────────────────────────────────────────────
  it("6. should render family member names and time labels on clock ring", () => {
    render(<AIFamilyPage />);
    expect(screen.getByText("言启·千行")).toBeInTheDocument();
    expect(screen.getByText("语枢·万物")).toBeInTheDocument();
    expect(screen.getByText("06:00")).toBeInTheDocument();
    expect(screen.getByText("07:30")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  Test 7: 底部标语（中英文）存在
  // ──────────────────────────────────────────────────────────
  it("7. should render bottom slogan (Chinese + English)", () => {
    render(<AIFamilyPage />);
    expect(screen.getByText("亦师亦友亦伯乐 · 一言一语一协同")).toBeInTheDocument();
    expect(
      screen.getByText("Words Initiate Quadrants, Language Serves as Core for the Future")
    ).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  Test 8: 点击成员头像打开详情抽屉 MemberDetailDrawer
  // ──────────────────────────────────────────────────────────
  it("8. should open MemberDetailDrawer when clicking a member avatar", () => {
    render(<AIFamilyPage />);
    const memberName = screen.getByText("言启·千行");
    const avatarBtn = memberName.closest(".z-10")?.querySelector("button");
    expect(avatarBtn).toBeTruthy();

    fireEvent.click(avatarBtn!);

    expect(screen.getByText("角色定位")).toBeInTheDocument();
    expect(screen.getByText("核心职责")).toBeInTheDocument();
    expect(screen.getByText("核心能力")).toBeInTheDocument();
    expect(screen.getByText("运行指标")).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  //  Test 9: 详情抽屉关闭按钮可关闭面板
  // ──────────────────────────────────────────────────────────
  it("9. should close MemberDetailDrawer when clicking X button", () => {
    render(<AIFamilyPage />);
    const memberName = screen.getByText("言启·千行");
    const avatarBtn = memberName.closest(".z-10")?.querySelector("button");
    fireEvent.click(avatarBtn!);

    const closeBtn = screen.getByTitle("关闭");
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);

    expect(screen.queryByText("角色定位")).not.toBeInTheDocument();
    expect(screen.queryByText("核心职责")).not.toBeInTheDocument();
  });

});
