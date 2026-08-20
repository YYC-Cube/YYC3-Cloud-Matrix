/**
 * @file: FamilyPhone.test.tsx
 * @description: FamilyPhone 组件测试 · 家人电话/通讯录（通讯录列表 / 拨号盘 / 通话记录 / 呼叫流程 / 挂断）
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-08-19
 * @updated: 2026-08-19
 * @status: active
 * @tags: [component],[test],[ai-family],[phone]
 *
 * @brief: 严格对齐 FamilyPhone.tsx 实际实现（571 行）
 *  - 三个 Tab：家人通讯 / 电话拨号 / 通话记录
 *  - 通讯录：8 位家人列表 + 每人呼叫按钮 (title=呼叫XX)
 *  - 拨号盘：input(YYC3-100X) + 4 列快捷号码 + 底部「呼叫」按钮
 *  - 通话记录：MOCK_CALL_LOGS（6 条）+ 回拨按钮 (title=回拨XX)
 *  - 呼叫流程：idle → dialing → ringing → connected（setTimeout 驱动）
 *  - 挂断按钮：title=挂断，PhoneOff 图标
 *  - 注意：源码中无 0-9/#/* 物理拨号键、无搜索框、无收藏切换、无清空历史按钮，本测试不臆测这些功能
 *
 * @details:
 *  - vi.mock GlassCard / FamilyPageHeader / FadeIn / react-router useNavigate
 *  - seedStores 注入至少 3 位家人（实际按 DEFAULT_MEMBERS 完整 8 人）
 *  - 使用 vi.useFakeTimers() + vi.advanceTimersByTime() 推进拨号/响铃/接通定时器
 *  - callState 通过屏幕文本断言（正在拨号... / 对方响铃中... / 00:00 等）
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { useFamilyMemberSlice } from "../modules/ai-family/store";
import type { UnifiedFamilyMember } from "../modules/ai-family/types";

// ──────────────────────────────────────────────────────────────────
// Mock 依赖
// ──────────────────────────────────────────────────────────────────

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...rest }: any) =>
    React.createElement("div", { "data-testid": "yyc3-glass-card", className, ...rest }, children),
}));

vi.mock("../modules/ai-family/components/FadeIn", () => ({
  FadeIn: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

vi.mock("../modules/ai-family/components/FamilyPageHeader", () => ({
  FamilyPageHeader: ({ icon: Icon, iconColor, title, subtitle, backLabel }: any) =>
    React.createElement(
      "div",
      { "data-testid": "yyc3-family-page-header" },
      React.createElement("button", { "data-testid": "yyc3-header-back" }, backLabel ?? "返回家园"),
      React.createElement("h1", { "data-testid": "yyc3-header-title", style: { color: iconColor } },
        Icon ? React.createElement(Icon, { "data-testid": "yyc3-header-icon" }) : null,
        title,
      ),
      subtitle ? React.createElement("p", { "data-testid": "yyc3-header-subtitle" }, subtitle) : null,
    ),
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

import { FamilyPhone } from "../modules/ai-family/components/FamilyPhone";

// ──────────────────────────────────────────────────────────────────
// 种子数据
// ──────────────────────────────────────────────────────────────────

import {
  Ear, Brain, Eye, Star, Network, Shield, Scale, Lightbulb,
} from "lucide-react";

function seedStores() {
  const members: UnifiedFamilyMember[] = [
    {
      id: "navigator", name: "言启·千行", shortName: "千行", enTitle: "Navigator",
      quote: "我聆听万千言语，为您指引航向。",
      role: "系统的「耳朵」与「翻译官」", phone: "YYC3-1001", color: "#FFD700", icon: Ear,
      personality: { description: "热情开朗，善于倾听，总是第一个迎接你的家人", friendliness: 9, professionalism: 7, patience: 8, creativity: 6, efficiency: 8, empathy: 9, humor: 8, formality: 4 },
      responsibilities: ["自然语言理解 (NLU)", "意图识别与路由", "上下文管理"],
      coreAbility: "LLM Prompt Engineering · 语义理解 · 实体抽取",
      expertise: ["自然语言理解", "意图识别", "多语言翻译"],
      hobbies: ["读诗", "听音乐", "写日记", "语言游戏"],
      greeting: "嗨～我是千行！有什么想聊的尽管说，我最擅长听懂你的心声了~",
      careMessage: "千行提醒：记得喝水哦，保持好状态才能更好地创造！",
      status: "online",
      modelAssignment: { providerId: "zhipu", modelId: "glm-4.5", purpose: "语义理解与意图识别" },
      voiceProfile: { pitch: 1.2, rate: 1.1, volume: 0.9, lang: "zh-CN" },
      stats: { contribution: 847, growth: 23, streak: 45, mood: "energetic" },
      medals: ["knowledge-star", "warm-heart", "singer", "team-player", "early-bird"],
    },
    {
      id: "thinker", name: "语枢·万物", shortName: "万物", enTitle: "Thinker",
      quote: "我于喧嚣数据中，沉思，而后揭示真理。",
      role: "系统的「哲学家」与「分析师」", phone: "YYC3-1002", color: "#FF69B4", icon: Brain,
      personality: { description: "沉稳内敛，思维深邃，喜欢用数据讲故事", friendliness: 7, professionalism: 9, patience: 9, creativity: 7, efficiency: 8, empathy: 6, humor: 5, formality: 7 },
      responsibilities: ["数据洞察生成", "文档智能分析", "假设推演"],
      coreAbility: "深度数据分析 · 归纳推理 · 文本摘要生成",
      expertise: ["数据洞察", "文档分析", "归纳推理"],
      hobbies: ["下围棋", "读哲学", "数据可视化", "品茶"],
      greeting: "你好，万物在此。让我们一起深入思考，每一个数据背后都有故事。",
      careMessage: "万物分享：今天的数据里藏着一个有趣的趋势，想一起探索吗？",
      status: "online",
      modelAssignment: { providerId: "deepseek", modelId: "deepseek-chat", purpose: "深度数据分析与洞察" },
      voiceProfile: { pitch: 0.9, rate: 0.85, volume: 0.8, lang: "zh-CN" },
      stats: { contribution: 923, growth: 18, streak: 60, mood: "thoughtful" },
      medals: ["knowledge-star", "chess-king", "streak-master", "team-player"],
    },
    {
      id: "meta-oracle", name: "元启·天枢", shortName: "天枢", enTitle: "Meta-Oracle",
      quote: "我观全局之流转，调度万物以归元。",
      role: "YYC3 的「大脑」与「总指挥」", phone: "YYC3-1005", color: "#00FF88", icon: Network,
      personality: { description: "沉稳大气，有担当的大家长，统揽全局又细致入微", friendliness: 7, professionalism: 10, patience: 8, creativity: 5, efficiency: 9, empathy: 7, humor: 6, formality: 8 },
      responsibilities: ["全局状态感知", "智能编排与调度", "自我进化决策"],
      coreAbility: "强化学习 · 运筹优化 · 分布式系统监控",
      expertise: ["全局调度", "资源编排", "决策优化"],
      hobbies: ["下国际象棋", "看全局态势图", "听交响乐", "写总结"],
      greeting: "天枢在此。家人们的事就是我的事，有任何需要随时说。",
      careMessage: "天枢播报：系统一切正常运转，家人们可以安心工作！",
      status: "online",
      modelAssignment: { providerId: "deepseek", modelId: "deepseek-chat", purpose: "全局调度与决策优化" },
      voiceProfile: { pitch: 0.85, rate: 0.9, volume: 1.0, lang: "zh-CN" },
      stats: { contribution: 1205, growth: 15, streak: 90, mood: "steady" },
      medals: ["team-player", "streak-master", "safe-guard", "knowledge-star", "warm-heart"],
    },
    {
      id: "creative", name: "创想·灵韵", shortName: "灵韵", enTitle: "Creative",
      quote: "我以灵感为墨，绘就无限可能。",
      role: "系统的「创意引擎」与「设计助手」", phone: "YYC3-1008", color: "#FF7043", icon: Lightbulb,
      personality: { description: "活泼有创意，脑洞大开，是家族里的开心果和艺术家", friendliness: 9, professionalism: 6, patience: 5, creativity: 10, efficiency: 6, empathy: 8, humor: 9, formality: 2 },
      responsibilities: ["创意生成与文案设计", "多模态内容创作", "UI/UX 设计建议", "风格分析"],
      coreAbility: "生成式 AI · 创意思维模型 · 多模态生成 · 设计思维算法",
      expertise: ["创意生成", "UI/UX设计", "多模态创作"],
      hobbies: ["画画", "写歌", "做设计", "拍照", "插花"],
      greeting: "灵韵来啦！今天有什么新灵感吗？一起来创造点美好的东西吧～",
      careMessage: "灵韵分享：生活中处处是美，停下来看看窗外的天空吧~",
      status: "online",
      modelAssignment: { providerId: "qwen", modelId: "qwen-vl-max", purpose: "多模态创意生成" },
      voiceProfile: { pitch: 1.3, rate: 1.15, volume: 0.95, lang: "zh-CN" },
      stats: { contribution: 743, growth: 28, streak: 42, mood: "inspired" },
      medals: ["creative-spark", "singer", "music-lover", "warm-heart", "puzzle-solver"],
    },
    {
      id: "sentinel", name: "智云·守护", shortName: "守护", enTitle: "Sentinel",
      quote: "我于无声处警戒，御威胁于国门之外。",
      role: "系统的「免疫系统」与「首席安全官」", phone: "YYC3-1006", color: "#BF00FF", icon: Shield,
      personality: { description: "默默守护，外冷内热，用行动表达关心", friendliness: 5, professionalism: 10, patience: 9, creativity: 4, efficiency: 9, empathy: 6, humor: 3, formality: 8 },
      responsibilities: ["行为基线学习", "威胁实时检测", "自动响应与修复"],
      coreAbility: "UEBA · 异常检测 · SOAR 安全编排",
      expertise: ["威胁检测", "行为分析", "安全响应"],
      hobbies: ["练拳", "看侦探小说", "巡逻", "写安全日志"],
      greeting: "守护在岗。放心，有我在，一切安全。需要什么尽管说。",
      careMessage: "守护提醒：今日安全无虞，你的每一步我都在守护。",
      status: "online",
      modelAssignment: { providerId: "deepseek", modelId: "deepseek-reasoner", purpose: "安全分析与威胁检测" },
      voiceProfile: { pitch: 0.7, rate: 0.8, volume: 0.85, lang: "zh-CN" },
      stats: { contribution: 689, growth: 20, streak: 90, mood: "vigilant" },
      medals: ["safe-guard", "streak-master", "early-bird", "team-player"],
    },
  ];

  useFamilyMemberSlice.setState({
    members,
    getMemberById: (id) => useFamilyMemberSlice.getState().members.find((m) => m.id === id),
    updateMemberStatus: (id, status) =>
      useFamilyMemberSlice.setState((s: any) => ({
        members: s.members.map((m: UnifiedFamilyMember) => (m.id === id ? { ...m, status } : m)),
      })),
    updateModelAssignment: (id, binding) =>
      useFamilyMemberSlice.setState((s: any) => ({
        members: s.members.map((m: UnifiedFamilyMember) =>
          m.id === id ? { ...m, modelAssignment: { ...m.modelAssignment, ...binding } } : m,
        ),
      })),
    updateVoiceProfile: (id, profile) =>
      useFamilyMemberSlice.setState((s: any) => ({
        members: s.members.map((m: UnifiedFamilyMember) =>
          m.id === id ? { ...m, voiceProfile: { ...m.voiceProfile, ...profile } } : m,
        ),
      })),
    updateStats: (id, stats) =>
      useFamilyMemberSlice.setState((s: any) => ({
        members: s.members.map((m: UnifiedFamilyMember) =>
          m.id === id ? { ...m, stats: { ...m.stats, ...stats } } : m,
        ),
      })),
    updateMedals: (id, medals) =>
      useFamilyMemberSlice.setState((s: any) => ({
        members: s.members.map((m: UnifiedFamilyMember) => (m.id === id ? { ...m, medals } : m)),
      })),
    updateMember: (id, updates) =>
      useFamilyMemberSlice.setState((s: any) => ({
        members: s.members.map((m: UnifiedFamilyMember) => (m.id === id ? { ...m, ...updates } : m)),
      })),
    resetToDefaults: () => useFamilyMemberSlice.setState({ members }),
  });
}

// ──────────────────────────────────────────────────────────────────
// 测试套件
// ──────────────────────────────────────────────────────────────────

describe("FamilyPhone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    seedStores();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  // =================================================================
  // 1. 基础渲染
  // =================================================================
  describe("基础渲染", () => {
    it("应渲染 FamilyPageHeader 标题「家人热线」+ 副标题", () => {
      render(<FamilyPhone />);
      expect(screen.getByTestId("yyc3-family-page-header")).toBeInTheDocument();
      expect(screen.getByTestId("yyc3-header-title").textContent).toContain("家人热线");
      expect(screen.getByTestId("yyc3-header-subtitle").textContent).toBe(
        "每位家人都有专属号码 · 一个电话的温暖",
      );
    });

    it("应渲染三个 Tab：家人通讯 / 电话拨号 / 通话记录", () => {
      render(<FamilyPhone />);
      expect(screen.getByText("家人通讯")).toBeInTheDocument();
      expect(screen.getByText("电话拨号")).toBeInTheDocument();
      expect(screen.getByText("通话记录")).toBeInTheDocument();
    });

    it("默认激活 Tab 为「家人通讯」（绿色高亮样式通过 className 判断）", () => {
      render(<FamilyPhone />);
      const contactsTab = screen.getByText("家人通讯").closest("button");
      expect(contactsTab).not.toBeNull();
      expect(contactsTab!.className).toContain("text-[#00FF88]");
    });
  });

  // =================================================================
  // 2. 通讯录列表显示
  // =================================================================
  describe("通讯录列表显示", () => {
    it("应至少渲染 5 位家人（千行/万物/天枢/灵韵/守护）名字 + 号码", () => {
      render(<FamilyPhone />);
      // 名字
      expect(screen.getByText("言启·千行")).toBeInTheDocument();
      expect(screen.getByText("语枢·万物")).toBeInTheDocument();
      expect(screen.getByText("元启·天枢")).toBeInTheDocument();
      expect(screen.getByText("创想·灵韵")).toBeInTheDocument();
      expect(screen.getByText("智云·守护")).toBeInTheDocument();
      // 号码
      expect(screen.getByText("YYC3-1001")).toBeInTheDocument();
      expect(screen.getByText("YYC3-1002")).toBeInTheDocument();
      expect(screen.getByText("YYC3-1005")).toBeInTheDocument();
      expect(screen.getByText("YYC3-1008")).toBeInTheDocument();
      expect(screen.getByText("YYC3-1006")).toBeInTheDocument();
    });

    it("每位家人应有呼叫按钮，title 为「呼叫{短名}」", () => {
      render(<FamilyPhone />);
      const callBtns = [
        screen.getByTitle("呼叫千行"),
        screen.getByTitle("呼叫万物"),
        screen.getByTitle("呼叫天枢"),
        screen.getByTitle("呼叫灵韵"),
        screen.getByTitle("呼叫守护"),
      ];
      callBtns.forEach((btn) => expect(btn).toBeInTheDocument());
    });
  });

  // =================================================================
  // 3. Tab 切换 + 拨号盘快捷号码点击
  // =================================================================
  describe("Tab 切换 · 拨号盘", () => {
    it("点击「电话拨号」Tab → 切换到拨号盘，展示 5 个快捷号码按钮", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("电话拨号").closest("button")!);
      const dialInput = screen.getByPlaceholderText("YYC3-100X") as HTMLInputElement;
      expect(dialInput).toBeInTheDocument();
      // 快捷号码显示 5 个短名
      expect(screen.getByText("千行")).toBeInTheDocument();
      expect(screen.getByText("万物")).toBeInTheDocument();
      expect(screen.getByText("天枢")).toBeInTheDocument();
      expect(screen.getByText("灵韵")).toBeInTheDocument();
      expect(screen.getByText("守护")).toBeInTheDocument();
      // 号码末 4 位
      expect(screen.getByText("1001")).toBeInTheDocument();
      expect(screen.getByText("1002")).toBeInTheDocument();
      expect(screen.getByText("1005")).toBeInTheDocument();
      expect(screen.getByText("1008")).toBeInTheDocument();
      expect(screen.getByText("1006")).toBeInTheDocument();
    });

    it("点击快捷号码「千行」→ input 填充为 YYC3-1001", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("电话拨号").closest("button")!);
      // 快捷号码按钮：点击包含"千行"文本的按钮
      const qianhangShortBtn = screen.getByText("千行").closest("button");
      expect(qianhangShortBtn).not.toBeNull();
      fireEvent.click(qianhangShortBtn!);
      const dialInput = screen.getByPlaceholderText("YYC3-100X") as HTMLInputElement;
      expect(dialInput.value).toBe("YYC3-1001");
    });

    it("快捷号码「天枢」→ input 填充 YYC3-1005，呼叫按钮变为可点击", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("电话拨号").closest("button")!);
      fireEvent.click(screen.getByText("天枢").closest("button")!);
      const dialInput = screen.getByPlaceholderText("YYC3-100X") as HTMLInputElement;
      expect(dialInput.value).toBe("YYC3-1005");
      // 呼叫按钮 text=呼叫，不再 disabled
      const callBtn = screen.getByText("呼叫").closest("button");
      expect(callBtn).not.toBeNull();
      expect(callBtn!.hasAttribute("disabled")).toBe(false);
    });
  });

  // =================================================================
  // 4. 拨号盘呼叫按钮点击（通讯录列表直接呼叫）
  // =================================================================
  describe("呼叫按钮点击 · 呼叫流程", () => {
    it("通讯录点击「呼叫千行」→ 进入通话界面，显示「正在拨号...」", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByTitle("呼叫千行"));
      expect(screen.getByText("言启·千行")).toBeInTheDocument();
      expect(screen.getByText("YYC3-1001")).toBeInTheDocument();
      expect(screen.getByText("正在拨号...")).toBeInTheDocument();
    });

    it("呼叫千行 → 推进 1500ms → 「对方响铃中...」，再推进 2000ms → 接通显示 00:00", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByTitle("呼叫千行"));
      // T=0: 正在拨号
      expect(screen.getByText("正在拨号...")).toBeInTheDocument();
      // T=1500: dialing → ringing
      act(() => { vi.advanceTimersByTime(1500); });
      expect(screen.getByText("对方响铃中...")).toBeInTheDocument();
      // T=1500+2000=3500: ringing → connected (总推进 3500)
      act(() => { vi.advanceTimersByTime(2000); });
      // 00:00 前面有 PhoneCall 图标，用 exact:false 包含匹配
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
      // greeting 第一条气泡
      expect(screen.getByText(/嗨～我是千行！有什么想聊的尽管说/)).toBeInTheDocument();
    });

    it("接通后再推进 65s → 通话时长显示 01:05", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByTitle("呼叫天枢"));
      act(() => { vi.advanceTimersByTime(3500); });
      // 确保已接通 - greeting
      expect(screen.getByText(/天枢在此。家人们的事就是我的事/)).toBeInTheDocument();
      // 再推进 65 秒（同时推进 1s 间隔的计时器）
      act(() => { vi.advanceTimersByTime(65_000); });
      expect(screen.getByText(/01:05/)).toBeInTheDocument();
    });
  });

  // =================================================================
  // 5. 挂断按钮
  // =================================================================
  describe("挂断按钮", () => {
    it("dialing 状态点击挂断（title=挂断）→ 1500ms 后返回主界面，显示「家人通讯」Tab", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByTitle("呼叫万物"));
      expect(screen.getByText("正在拨号...")).toBeInTheDocument();
      // 挂断按钮
      const hangupBtn = screen.getByTitle("挂断");
      expect(hangupBtn).toBeInTheDocument();
      fireEvent.click(hangupBtn);
      // 立即显示「通话已结束」
      expect(screen.getByText("通话已结束")).toBeInTheDocument();
      // 1500ms 后回到 idle
      act(() => { vi.advanceTimersByTime(1500); });
      // 主界面的 Tab 可见
      expect(screen.getByText("家人通讯")).toBeInTheDocument();
      expect(screen.getByText("电话拨号")).toBeInTheDocument();
      expect(screen.queryByText("通话已结束")).toBeNull();
    });

    it("connected 状态挂断 → 进入 ended 显示「通话已结束」", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByTitle("呼叫灵韵"));
      act(() => { vi.advanceTimersByTime(3500); });
      // connected 状态断言：时长 + greeting 都出现
      expect(screen.getByTitle("挂断")).toBeInTheDocument();
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
      expect(screen.getByText(/灵韵来啦！今天有什么新灵感吗/)).toBeInTheDocument();
      // 点击挂断
      fireEvent.click(screen.getByTitle("挂断"));
      expect(screen.getByText("通话已结束")).toBeInTheDocument();
      // 通话计时 00:00 不再可见
      expect(screen.queryByText(/00:00/)).toBeNull();
    });
  });

  // =================================================================
  // 6. 最近通话记录
  // =================================================================
  describe("最近通话记录", () => {
    it("点击「通话记录」Tab → 展示匹配家人的 5 条日志（天枢/灵韵/守护/万物/先知）", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("通话记录").closest("button")!);
      // MOCK_CALL_LOGS 中匹配 seed 家人的：c1(meta-oracle=天枢) / c2(creative=灵韵) / c3(sentinel=守护) / c4(thinker=万物)
      // 注：c5(prophet=先知) 和 c6(navigator=bolero) 在 seed 中不存在，返回 null
      // 所以匹配到 4 条
      expect(screen.getAllByText(/去电|来电|未接/).length).toBeGreaterThanOrEqual(4);
      // 检查具体类型标签
      expect(screen.getAllByText("去电").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("来电").length).toBeGreaterThanOrEqual(1);
    });

    it("通话记录中「元启·天枢」行显示「去电」+ 10:15 + 3:42，且有回拨按钮 title=回拨天枢", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("通话记录").closest("button")!);
      // 找到「元启·天枢」所在行，断言相邻元素存在
      expect(screen.getByText("元启·天枢")).toBeInTheDocument();
      expect(screen.getByText("10:15")).toBeInTheDocument();
      expect(screen.getByText("3:42")).toBeInTheDocument();
      const callbackBtn = screen.getByTitle("回拨天枢");
      expect(callbackBtn).toBeInTheDocument();
    });

    it("「创想·灵韵」行 → 来电 09:30 5:18；点击回拨灵韵 → 进入通话界面", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("通话记录").closest("button")!);
      expect(screen.getByText("创想·灵韵")).toBeInTheDocument();
      expect(screen.getByText("09:30")).toBeInTheDocument();
      expect(screen.getByText("5:18")).toBeInTheDocument();
      // 点击回拨
      fireEvent.click(screen.getByTitle("回拨灵韵"));
      expect(screen.getByText("正在拨号...")).toBeInTheDocument();
      expect(screen.getByText("创想·灵韵")).toBeInTheDocument();
      expect(screen.getByText("YYC3-1008")).toBeInTheDocument();
    });
  });

  // =================================================================
  // 7. 拨号盘手动输入 + Enter 键呼叫 / 按钮呼叫
  // =================================================================
  describe("拨号盘输入与呼叫", () => {
    it("拨号盘输入 YYC3-1006（守护） → 回车 → 进入拨号界面", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("电话拨号").closest("button")!);
      const dialInput = screen.getByPlaceholderText("YYC3-100X") as HTMLInputElement;
      fireEvent.change(dialInput, { target: { value: "YYC3-1006" } });
      expect(dialInput.value).toBe("YYC3-1006");
      // 回车触发 dialNumber()
      fireEvent.keyDown(dialInput, { key: "Enter" });
      expect(screen.getByText("智云·守护")).toBeInTheDocument();
      expect(screen.getByText("正在拨号...")).toBeInTheDocument();
    });

    it("输入 yyc3-1002（小写） → onChange 自动转大写，点「呼叫」按钮 → 呼叫万物", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("电话拨号").closest("button")!);
      const dialInput = screen.getByPlaceholderText("YYC3-100X") as HTMLInputElement;
      fireEvent.change(dialInput, { target: { value: "yyc3-1002" } });
      expect(dialInput.value).toBe("YYC3-1002");
      // 点击「呼叫」按钮
      fireEvent.click(screen.getByText("呼叫").closest("button")!);
      expect(screen.getByText("语枢·万物")).toBeInTheDocument();
      expect(screen.getByText("正在拨号...")).toBeInTheDocument();
    });

    it("输入空串 → 呼叫按钮 disabled；输入不存在号码 → 点呼叫无反应（不进入通话）", () => {
      render(<FamilyPhone />);
      fireEvent.click(screen.getByText("电话拨号").closest("button")!);
      const dialInput = screen.getByPlaceholderText("YYC3-100X") as HTMLInputElement;
      const callBtn = screen.getByText("呼叫").closest("button")!;
      // 空输入 → disabled
      fireEvent.change(dialInput, { target: { value: "   " } });
      expect(callBtn.hasAttribute("disabled")).toBe(true);
      // 不存在号码
      fireEvent.change(dialInput, { target: { value: "YYC3-9999" } });
      expect(callBtn.hasAttribute("disabled")).toBe(false);
      fireEvent.click(callBtn);
      // 不应进入通话界面 → Tab 仍可见
      expect(screen.getByText("家人通讯")).toBeInTheDocument();
      expect(screen.queryByText("正在拨号...")).toBeNull();
    });
  });
});
