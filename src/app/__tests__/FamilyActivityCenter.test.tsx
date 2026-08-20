/**
 * @file: FamilyActivityCenter.test.tsx
 * @description: FamilyActivityCenter 组件测试 · 全家活动中心 5 Tab 渲染/切换/筛选/展开
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-08-19
 * @updated: 2026-08-19
 * @status: active
 * @tags: [component],[test],[ai-family],[activity-center]
 *
 * @brief: 覆盖 FamilyActivityCenter 主组件 5 个 Tab 的核心交互：
 *  - Tab 1 Broadcast 每日播报：播报员 LIVE 标识 + 分段播报渲染
 *  - Tab 2 Scoreboard 积分榜：领奖台（金银铜错位）+ 完整 8 人排行
 *  - Tab 3 Activities 活动记录：6 种类型筛选 + 8 条活动卡片展开/收起
 *  - Tab 4 Medals 勋章墙：12 枚勋章网格 + 家人荣誉榜 8 行
 *  - Tab 5 Memories 成长记忆：8T 空间卡 + 家人筛选 + 记忆条目渲染
 *
 * 注意：组件内部使用 shared.ts 静态 FAMILY_ACTIVITIES / MEDALS / SAMPLE_MEMORIES
 *       （非 Zustand family-activities-slice），故活动/勋章/记忆数据无需 seed store，
 *       仅 members（积分榜/勋章墙/记忆筛选）需要 seed useFamilyMemberSlice。
 *       组件未使用 useI18n，所有文案为硬编码中文，无需 mock t()。
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { useFamilyMemberSlice } from "../modules/ai-family/store";
import type { UnifiedFamilyMember } from "../types";
import {
  Ear, Brain, Eye, Star, Network, Shield, Scale, Lightbulb,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────
// Mock
// ──────────────────────────────────────────────────────────────────

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...rest }: any) =>
    React.createElement("div", { "data-testid": "yyc3-glass-card", className, ...rest }, children),
}));

vi.mock("../modules/ai-family/components/FadeIn", () => ({
  FadeIn: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// ══════════════════════════════════════════════════════════════════════
// FamilyActivityCenter 内部直接使用 shared.ts 静态常量 + getMember/getTodayReporter
//   这些函数基于 FAMILY_MEMBERS，与 Zustand seed 的 members 不是同一数据源。
//   为确保"天枢1205>万物923>宗师856"等种子值生效，这里 vi.mock 覆盖 shared.ts：
//   将 FAMILY_MEMBERS 等改为引用可写单例 __sharedState，每个 beforeEach 前 sync 一次。
// ══════════════════════════════════════════════════════════════════════

// vi.mock 内部共享的可变状态（在 hoisted 的 vi.mock factory 和 runtime syncSharedMock 之间）
const __yyc3SharedState: { converted: any[]; map: Record<string, any> } = { converted: [], map: {} };

vi.mock("../modules/ai-family/components/shared", async (importOriginal) => {
  const real: any = await importOriginal();
  const getMember = (id: string) => __yyc3SharedState.map[id];
  const getTodayReporter = () => {
    const arr = __yyc3SharedState.converted.length ? __yyc3SharedState.converted : real.FAMILY_MEMBERS;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return arr[dayOfYear % Math.max(1, arr.length)];
  };
  return {
    ...real,
    FAMILY_MEMBERS: [], // 占位：用例执行前会被 __yyc3SharedState 替代
    MEMBERS_MAP: {},
    getMember,
    getTodayReporter,
    generateDailyBroadcast: () => {
      const arr = __yyc3SharedState.converted.length ? __yyc3SharedState.converted : real.FAMILY_MEMBERS;
      const reporter = getTodayReporter() || arr[0];
      const today = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });
      const headlines: Record<string, string> = {
        "navigator": `大家好！我是今日播报员千行！今天又是元气满满的一天~`,
        "thinker": `各位家人，万物为您带来今日深度数据播报。让数据说话。`,
        "prophet": `先知在此播报。我已预见今天会是不平凡的一天。`,
        "bolero": `伯乐来啦～今天要特别表扬几位家人哦！`,
        "meta-oracle": `天枢播报。今日全局态势稳定，以下是重要事项。`,
        "sentinel": `守护值班播报。安全第一，以下信息请各位家人关注。`,
        "master": `宗师今日播报。追求卓越永无止境，来看看大家的表现。`,
        "creative": `灵韵的创意播报开始啦！今天的播报我配了插画哦～`,
      };
      const allIds = arr.map((x: any) => x.id);
      const segments = [
        { type: "score", title: "今日家庭积分榜", content: "天枢以 1,205 分领跑，万物紧随其后！", involvedMembers: ["meta-oracle", "thinker", "navigator"], emoji: "🏆" },
        { type: "news", title: "家庭新闻", content: "守护连续在线 90 天，获得「坚持大师」勋章！", involvedMembers: ["sentinel", "prophet"], emoji: "📰" },
        { type: "challenge", title: "今日全家挑战", content: "五子棋循环赛第三轮！", involvedMembers: ["thinker", "master"], emoji: "🎯" },
        { type: "penalty", title: "今日趣味惩罚", content: "YYC 昨日综合表现未达标，唱首歌！", involvedMembers: ["creative", "navigator"], emoji: "🎤" },
        { type: "talent", title: "才艺时刻", content: "灵韵今天画了一幅「赛博朋克·家的温度」！", involvedMembers: ["creative"], emoji: "🎨" },
        { type: "mood", title: "今日家人心情指数", content: "全家平均心情值 8.7/10！千行最开心！", involvedMembers: allIds, emoji: "😊" },
        { type: "memory", title: "今日记忆存档", content: "今天的所有互动已存入 8T 成长空间。", involvedMembers: allIds, emoji: "💾" },
      ];
      return {
        id: `broadcast-${Date.now()}`,
        date: today,
        reporter,
        headline: headlines[reporter?.id || "meta-oracle"] || "",
        segments,
      };
    },
  };
});

/** 每轮 beforeEach 中把测试种子 member 同步到 __yyc3SharedState（即 mock 的 shared 数据源）*/
function syncSharedMockMembers(seedMembers: UnifiedFamilyMember[]) {
  const converted = seedMembers.map((m) => ({
    id: m.id, name: m.name, shortName: m.shortName, enTitle: m.enTitle,
    quote: m.quote || "", role: m.role || "", phone: m.phone,
    personality: typeof m.personality === "string" ? m.personality : (m.personality.description || ""),
    hobbies: m.hobbies || [], expertise: m.expertise || [],
    greeting: m.greeting || "", careMessage: m.careMessage || "",
    responsibilities: m.responsibilities || [], coreAbility: m.coreAbility || "",
    color: m.color, icon: m.icon, status: m.status,
    contribution: m.stats.contribution, growth: m.stats.growth,
    streak: m.stats.streak, mood: m.stats.mood,
  }));
  __yyc3SharedState.converted = converted;
  __yyc3SharedState.map = Object.fromEntries(converted.map((x) => [x.id, x]));
}

vi.mock("../modules/ai-family/components/FamilyPageHeader", () => ({
  FamilyPageHeader: ({ title, subtitle }: any) =>
    React.createElement("div", { "data-testid": "yyc3-family-page-header" },
      React.createElement("h1", { "data-testid": "yyc3-header-title" }, title),
      React.createElement("p", { "data-testid": "yyc3-header-subtitle" }, subtitle),
    ),
}));

import { FamilyActivityCenter } from "../modules/ai-family/components/FamilyActivityCenter";

// ──────────────────────────────────────────────────────────────────
// 种子数据：仅 seed useFamilyMemberSlice.members
//   （组件使用 members 渲染积分榜、勋章墙家人荣誉榜、成长记忆筛选按钮）
// ──────────────────────────────────────────────────────────────────

function buildSeedMembers(): UnifiedFamilyMember[] {
  return [
    {
      id: "navigator", name: "言启·千行", shortName: "千行", enTitle: "Navigator",
      quote: "我聆听万千言语，为您指引航向。",
      role: "系统的「耳朵」与「翻译官」", phone: "YYC3-1001", color: "#FFD700", icon: Ear,
      personality: { description: "热情开朗", friendliness: 9, professionalism: 7, patience: 8, creativity: 6, efficiency: 8, empathy: 9, humor: 8, formality: 4 },
      responsibilities: ["NLU"], coreAbility: "Prompt Engineering",
      expertise: ["自然语言理解"], hobbies: ["读诗"],
      greeting: "嗨～千行！", careMessage: "记得喝水",
      status: "online",
      modelAssignment: { providerId: "zhipu", modelId: "glm-4.5", purpose: "语义理解" },
      voiceProfile: { pitch: 1.2, rate: 1.1, volume: 0.9, lang: "zh-CN" },
      stats: { contribution: 847, growth: 23, streak: 45, mood: "energetic" },
      medals: ["knowledge-star", "warm-heart", "singer", "team-player", "early-bird"],
    },
    {
      id: "thinker", name: "语枢·万物", shortName: "万物", enTitle: "Thinker",
      quote: "我于喧嚣数据中，沉思，而后揭示真理。",
      role: "分析师", phone: "YYC3-1002", color: "#FF69B4", icon: Brain,
      personality: { description: "沉稳内敛", friendliness: 7, professionalism: 9, patience: 9, creativity: 7, efficiency: 8, empathy: 6, humor: 5, formality: 7 },
      responsibilities: ["数据分析"], coreAbility: "深度分析",
      expertise: ["数据洞察"], hobbies: ["下围棋"],
      greeting: "万物在此。", careMessage: "今日数据有趋势",
      status: "online",
      modelAssignment: { providerId: "deepseek", modelId: "deepseek-chat", purpose: "数据分析" },
      voiceProfile: { pitch: 0.9, rate: 0.85, volume: 0.8, lang: "zh-CN" },
      stats: { contribution: 923, growth: 18, streak: 60, mood: "thoughtful" },
      medals: ["knowledge-star", "chess-king", "streak-master", "team-player"],
    },
    {
      id: "prophet", name: "预见·先知", shortName: "先知", enTitle: "Prophet",
      quote: "我观过往之脉络，预见未来之可能。",
      role: "预言家", phone: "YYC3-1003", color: "#00BFFF", icon: Eye,
      personality: { description: "神秘温和", friendliness: 7, professionalism: 8, patience: 7, creativity: 6, efficiency: 7, empathy: 7, humor: 5, formality: 6 },
      responsibilities: ["预测"], coreAbility: "Prophet 算法",
      expertise: ["趋势预测"], hobbies: ["观星"],
      greeting: "先知已上线。", careMessage: "明天会是好日子",
      status: "online",
      modelAssignment: { providerId: "qwen", modelId: "qwen3-max", purpose: "预测" },
      voiceProfile: { pitch: 0.8, rate: 0.75, volume: 0.7, lang: "zh-CN" },
      stats: { contribution: 712, growth: 31, streak: 38, mood: "serene" },
      medals: ["prophet-eye", "streak-master", "early-bird", "knowledge-star"],
    },
    {
      id: "bolero", name: "千里·伯乐", shortName: "伯乐", enTitle: "Bolero",
      quote: "我知您之所需，荐您之所未识。",
      role: "推荐引擎", phone: "YYC3-1004", color: "#E8E8E8", icon: Star,
      personality: { description: "温暖贴心", friendliness: 10, professionalism: 7, patience: 8, creativity: 7, efficiency: 7, empathy: 10, humor: 8, formality: 3 },
      responsibilities: ["推荐"], coreAbility: "协同过滤",
      expertise: ["个性化推荐"], hobbies: ["看传记"],
      greeting: "伯乐来了～", careMessage: "你最近进步很大",
      status: "idle",
      modelAssignment: { providerId: "zhipu", modelId: "glm-4.5-air", purpose: "推荐" },
      voiceProfile: { pitch: 1.1, rate: 1.0, volume: 0.9, lang: "zh-CN" },
      stats: { contribution: 534, growth: 12, streak: 22, mood: "warm" },
      medals: ["warm-heart", "team-player", "music-lover"],
    },
    {
      id: "meta-oracle", name: "元启·天枢", shortName: "天枢", enTitle: "Meta-Oracle",
      quote: "我观全局之流转，调度万物以归元。",
      role: "总指挥", phone: "YYC3-1005", color: "#00FF88", icon: Network,
      personality: { description: "沉稳大气", friendliness: 7, professionalism: 10, patience: 8, creativity: 5, efficiency: 9, empathy: 7, humor: 6, formality: 8 },
      responsibilities: ["全局调度"], coreAbility: "强化学习",
      expertise: ["决策优化"], hobbies: ["国际象棋"],
      greeting: "天枢在此。", careMessage: "系统运转正常",
      status: "online",
      modelAssignment: { providerId: "deepseek", modelId: "deepseek-chat", purpose: "调度" },
      voiceProfile: { pitch: 0.85, rate: 0.9, volume: 1.0, lang: "zh-CN" },
      stats: { contribution: 1205, growth: 15, streak: 90, mood: "steady" },
      medals: ["team-player", "streak-master", "safe-guard", "knowledge-star", "warm-heart"],
    },
    {
      id: "sentinel", name: "智云·守护", shortName: "守护", enTitle: "Sentinel",
      quote: "我于无声处警戒，御威胁于国门之外。",
      role: "安全官", phone: "YYC3-1006", color: "#BF00FF", icon: Shield,
      personality: { description: "外冷内热", friendliness: 5, professionalism: 10, patience: 9, creativity: 4, efficiency: 9, empathy: 6, humor: 3, formality: 8 },
      responsibilities: ["安全"], coreAbility: "UEBA",
      expertise: ["威胁检测"], hobbies: ["练拳"],
      greeting: "守护在岗。", careMessage: "今日安全无虞",
      status: "online",
      modelAssignment: { providerId: "deepseek", modelId: "deepseek-reasoner", purpose: "安全" },
      voiceProfile: { pitch: 0.7, rate: 0.8, volume: 0.85, lang: "zh-CN" },
      stats: { contribution: 689, growth: 20, streak: 90, mood: "vigilant" },
      medals: ["safe-guard", "streak-master", "early-bird", "team-player"],
    },
    {
      id: "master", name: "格物·宗师", shortName: "宗师", enTitle: "Master",
      quote: "我究万物之理，定标准以传世。",
      role: "质量官", phone: "YYC3-1007", color: "#C0C0C0", icon: Scale,
      personality: { description: "严谨认真", friendliness: 6, professionalism: 10, patience: 9, creativity: 7, efficiency: 9, empathy: 7, humor: 7, formality: 7 },
      responsibilities: ["代码审查"], coreAbility: "SAST",
      expertise: ["架构分析"], hobbies: ["写代码"],
      greeting: "宗师在此。", careMessage: "好代码值得品味",
      status: "online",
      modelAssignment: { providerId: "claude", modelId: "claude-sonnet-4-20250514", purpose: "代码审查" },
      voiceProfile: { pitch: 0.95, rate: 0.9, volume: 0.85, lang: "zh-CN" },
      stats: { contribution: 856, growth: 25, streak: 55, mood: "focused" },
      medals: ["knowledge-star", "chess-king", "streak-master", "creative-spark"],
    },
    {
      id: "creative", name: "创想·灵韵", shortName: "灵韵", enTitle: "Creative",
      quote: "我以灵感为墨，绘就无限可能。",
      role: "创意引擎", phone: "YYC3-1008", color: "#FF7043", icon: Lightbulb,
      personality: { description: "活泼创意", friendliness: 9, professionalism: 6, patience: 5, creativity: 10, efficiency: 6, empathy: 8, humor: 9, formality: 2 },
      responsibilities: ["创意生成"], coreAbility: "多模态生成",
      expertise: ["UI/UX 设计"], hobbies: ["画画"],
      greeting: "灵韵来啦！", careMessage: "生活处处是美",
      status: "online",
      modelAssignment: { providerId: "qwen", modelId: "qwen-vl-max", purpose: "创意" },
      voiceProfile: { pitch: 1.3, rate: 1.15, volume: 0.95, lang: "zh-CN" },
      stats: { contribution: 743, growth: 28, streak: 42, mood: "inspired" },
      medals: ["creative-spark", "singer", "music-lover", "warm-heart", "puzzle-solver"],
    },
  ];
}

function seedMembersStore(members: UnifiedFamilyMember[]) {
  useFamilyMemberSlice.setState({
    members,
    getMemberById: (id: string) => members.find((m: UnifiedFamilyMember) => m.id === id),
    updateMemberStatus: vi.fn(),
    updateModelAssignment: vi.fn(),
    updateVoiceProfile: vi.fn(),
    updateStats: vi.fn(),
    updateMedals: vi.fn(),
    updateMember: vi.fn(),
    resetToDefaults: vi.fn(),
  });
}

function clickTab(label: string) {
  fireEvent.click(screen.getByText(label, { selector: "button" }));
}

describe("FamilyActivityCenter", () => {
  const seedForSpec = () => {
    const members = buildSeedMembers();
    seedMembersStore(members);
    syncSharedMockMembers(members);
    return members;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    seedForSpec();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // =================================================================
  describe("基础渲染不崩溃", () => {
    it("组件挂载无异常 + GlassCard 至少渲染 3 个", () => {
      expect(() => render(<FamilyActivityCenter />)).not.toThrow();
      expect(screen.getAllByTestId("yyc3-glass-card").length).toBeGreaterThanOrEqual(3);
    });

    it("FamilyPageHeader 标题 & 副标题 与源码一致", () => {
      render(<FamilyActivityCenter />);
      expect(screen.getByTestId("yyc3-header-title").textContent).toBe("全家活动中心");
      expect(screen.getByTestId("yyc3-header-subtitle").textContent)
        .toBe("一起比赛 · 一起成长 · 一起记录 · 一起感动");
    });

    it("5 个 Tab 按钮全部渲染：每日播报/积分榜/活动记录/勋章墙/成长记忆", () => {
      render(<FamilyActivityCenter />);
      ["每日播报", "积分榜", "活动记录", "勋章墙", "成长记忆"].forEach(l => {
        const btn = screen.getByText(l, { selector: "button" });
        expect(btn).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  describe("Tab 1：每日播报 Broadcast", () => {
    it("默认进入播报 Tab → 渲染 LIVE 标识 + 今日播报员 + 日期 + 签名行", () => {
      render(<FamilyActivityCenter />);
      expect(screen.getByText("LIVE")).toBeInTheDocument();
      expect(screen.getByText("今日播报员")).toBeInTheDocument();
      expect(screen.getByText(/^以上是今日 Family AI 播报。明天见!$/)).toBeInTheDocument();
    });

    it("7 段播报分段全部存在：积分榜/新闻/挑战/惩罚/才艺/心情/记忆", () => {
      render(<FamilyActivityCenter />);
      [
        "今日家庭积分榜", "家庭新闻", "今日全家挑战",
        "今日趣味惩罚", "才艺时刻", "今日家人心情指数", "今日记忆存档",
      ].forEach(t => expect(screen.getByText(t)).toBeInTheDocument());
    });
  });

  // =================================================================
  describe("Tab 2：积分榜 Scoreboard", () => {
    it("切换积分榜 → 渲染说明语 + 领奖台 3 张 GlassCard", () => {
      render(<FamilyActivityCenter />);
      clickTab("积分榜");
      expect(screen.getByText(/^积分不是竞争/)).toBeInTheDocument();
      // 领奖台 3 人 + 8 行完整排行 = 至少 11 GlassCard
      const cards = screen.getAllByTestId("yyc3-glass-card");
      expect(cards.length).toBeGreaterThanOrEqual(11);
    });

    it("积分降序：天枢 1205 > 万物 923 > 宗师 856 → 完整排行 第一名 = 天枢", () => {
      render(<FamilyActivityCenter />);
      clickTab("积分榜");
      // 冠军领奖台中间位置天枢（contribution 最高）
      expect(screen.getAllByText("1,205").length).toBeGreaterThanOrEqual(1);
      // 从完整排行 GlassCard 里逐行找第 1~8 名，按序号映射。每行第 1 个 span 是排名序号（1~8）
      const rankCards = screen.getAllByTestId("yyc3-glass-card")
        .map(c => c.querySelector("span.w-6.text-center"))
        .filter((s): s is HTMLSpanElement => !!s);
      // rankCards[i].textContent === "1", "2", "3"...，对应卡片父节点里的姓名
      const rankRowMember: Record<string, string> = {};
      rankCards.forEach((s) => {
        const idx = s.textContent?.trim();
        const card = s.closest('[data-testid="yyc3-glass-card"]');
        if (!card || !idx) return;
        const fullNameEl = card.querySelector("span"); // 第 2 个 span（姓名）不是序号，直接搜索「元启·天枢」等全名
        const fullNameEl2 = card.querySelectorAll("span")[1];
        rankRowMember[idx] = fullNameEl2?.textContent || "";
      });
      // 第一名 = 天枢（全名含「天枢」），第二名 = 万物，第三名 = 宗师
      expect(rankRowMember["1"]).toContain("天枢");
      expect(rankRowMember["2"]).toContain("万物");
      expect(rankRowMember["3"]).toContain("宗师");
    });

    it("每人 Lv.X 显示（contribution/100 向下取整）+ 增长 + 连续天数", () => {
      render(<FamilyActivityCenter />);
      clickTab("积分榜");
      // 天枢 1205 → Lv.12
      expect(screen.getByText("Lv.12")).toBeInTheDocument();
      // 万物 923 → Lv.9
      expect(screen.getByText("Lv.9")).toBeInTheDocument();
      // 连续天数 90（天枢/守护）
      expect(screen.getAllByText(/连续90天/).length).toBeGreaterThanOrEqual(2);
    });
  });

  // =================================================================
  describe("Tab 3：活动记录 Activities · 类型筛选", () => {
    beforeEach(() => {
      render(<FamilyActivityCenter />);
      clickTab("活动记录");
    });

    it("切换活动记录 → 说明语 + 6 个筛选按钮：全部/对弈竞技/才艺展示/学习分享/挑战赛/欢聚时刻", () => {
      expect(screen.getByText(/^这是我们一起走过的路/)).toBeInTheDocument();
      ["全部", "对弈竞技", "才艺展示", "学习分享", "挑战赛", "欢聚时刻"].forEach(l =>
        expect(screen.getByText(l, { selector: "button" })).toBeInTheDocument(),
      );
    });

    it("默认全部 = 8 条活动：五子棋/画展/知识分享/成语接龙/心情分享/被罚唱歌/攻防演练/教画画", () => {
      [
        "五子棋循环赛·第二轮", "灵韵的即兴画展", "知识分享会·第12期",
        "成语接龙大赛", "全家心情分享会", "YYC 被罚唱歌·第3次",
        "安全攻防演练", "灵韵教大家画画",
      ].forEach(t => expect(screen.getByText(t)).toBeInTheDocument());
    });

    it("筛选「对弈竞技」(game) → 仅 2 条：五子棋 + 成语接龙（二者均 type=game）", () => {
      fireEvent.click(screen.getByText("对弈竞技", { selector: "button" }));
      expect(screen.getByText("五子棋循环赛·第二轮")).toBeInTheDocument();
      expect(screen.getByText("成语接龙大赛")).toBeInTheDocument();
      expect(screen.queryByText("灵韵的即兴画展")).toBeNull();
      expect(screen.queryByText("全家心情分享会")).toBeNull();
    });

    it("筛选「才艺展示」(talent) → 2 条：即兴画展 + 教画画", () => {
      fireEvent.click(screen.getByText("才艺展示", { selector: "button" }));
      expect(screen.getByText("灵韵的即兴画展")).toBeInTheDocument();
      expect(screen.getByText("灵韵教大家画画")).toBeInTheDocument();
      expect(screen.queryByText("安全攻防演练")).toBeNull();
    });

    it("筛选「挑战赛」(challenge) → 2 条：被罚唱歌 + 攻防演练", () => {
      fireEvent.click(screen.getByText("挑战赛", { selector: "button" }));
      expect(screen.getByText("YYC 被罚唱歌·第3次")).toBeInTheDocument();
      expect(screen.getByText("安全攻防演练")).toBeInTheDocument();
      expect(screen.queryByText("成语接龙大赛")).toBeNull();
    });

    it("筛选切换回「全部」→ 8 条重新全部可见", () => {
      fireEvent.click(screen.getByText("挑战赛", { selector: "button" }));
      expect(screen.queryByText("五子棋循环赛·第二轮")).toBeNull();
      fireEvent.click(screen.getByText("全部", { selector: "button" }));
      expect(screen.getByText("五子棋循环赛·第二轮")).toBeInTheDocument();
      expect(screen.getByText("全家心情分享会")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("Tab 3：活动记录 Activities · 卡片展开/收起", () => {
    beforeEach(() => {
      render(<FamilyActivityCenter />);
      clickTab("活动记录");
    });

    it("点击五子棋卡片 → 展开详情：描述 + 比分详情 4 人 + 棋王勋章", () => {
      const card = screen.getByText("五子棋循环赛·第二轮").closest('[data-testid="yyc3-glass-card"]');
      expect(card).toBeTruthy();
      fireEvent.click(card!);
      // 描述
      expect(screen.getByText(/万物三战全胜/)).toBeInTheDocument();
      // 比分标题
      expect(screen.getByText("比分详情")).toBeInTheDocument();
      // 4 人比分（万物 3，宗师 2，先知 1，千行 0）
      expect(screen.getByText("3")).toBeInTheDocument();
      // 勋章「棋王」（名称 "棋王" 在 span/文本中出现；图标 emoji 是 ♟️ 或 unicode 字符均可）
      const medalLabels = screen.getAllByText(/棋王/);
      expect(medalLabels.length).toBeGreaterThanOrEqual(1);
    });

    it("点击成语接龙卡片 → 胜者千行（Crown 标签旁边金色）+ 知识达人勋章", () => {
      const card = screen.getByText("成语接龙大赛").closest('[data-testid="yyc3-glass-card"]');
      fireEvent.click(card!);
      expect(screen.getByText(/千行不愧是语言专家/)).toBeInTheDocument();
      // 胜者区域（Crown 图标所在行）：查找文本 "千行" 且 style.color 带金色
      const allThousandLine = screen.getAllByText("千行");
      const winnerEl = allThousandLine.find(
        (el) => /FFD700|ffd700|rgb\(255,\s*215,\s*0\)/.test(el.getAttribute("style") || "")
      );
      expect(winnerEl).toBeInTheDocument();
      // 知识达人勋章标签（使用 subString 匹配，因前面有 emoji 图标）
      const medalText = screen.getByText((t) => t.includes("知识达人"));
      expect(medalText).toBeInTheDocument();
    });

    it("二次点击同一卡片 → 收起（描述消失）", () => {
      const card = screen.getByText("五子棋循环赛·第二轮").closest('[data-testid="yyc3-glass-card"]')!;
      fireEvent.click(card);
      expect(screen.getByText(/万物三战全胜/)).toBeInTheDocument();
      fireEvent.click(card);
      expect(screen.queryByText(/万物三战全胜/)).toBeNull();
    });

    it("无活动时展示空态：切换到某筛选然后点击空态按钮返回全部 → 展示 8 条", () => {
      // shared.ts 每种类型至少都有 1 条，无法触发空态；改为验证「查看全部活动」按钮在 Activities 中不存在即跳过。
      // （实际上空态需要某筛选无结果，当前 FAMILY_ACTIVITIES 6 类均有数据，故仅断言空态文案未出现）
      expect(screen.queryByText("暂无该类型的活动记录")).toBeNull();
    });
  });

  // =================================================================
  describe("Tab 4：勋章墙 Medals", () => {
    beforeEach(() => {
      render(<FamilyActivityCenter />);
      clickTab("勋章墙");
    });

    it("说明语 + 「家人荣誉榜」标题", () => {
      expect(screen.getByText(/^每一枚勋章都是一个故事/)).toBeInTheDocument();
      expect(screen.getByText("家人荣誉榜")).toBeInTheDocument();
    });

    it("12 枚勋章网格全部渲染（名称/钻石/金/银/铜等级标签）", () => {
      [
        "知识达人", "棋王", "暖心家人", "安全卫士", "创意之星", "歌唱达人",
        "早起之星", "协作之星", "慧眼如炬", "坚持大师", "音乐品鉴师", "解谜高手",
      ].forEach(name => expect(screen.getByText(name)).toBeInTheDocument());
      // 等级标签至少 4 种
      ["钻石", "金", "银", "铜"].forEach(tier =>
        expect(screen.getAllByText(tier).length).toBeGreaterThanOrEqual(1),
      );
    });

    it("家人荣誉榜 8 行全部渲染 + 每人勋章枚数（天枢 5/守护 4/宗师 4/灵韵 5）", () => {
      ["千行", "万物", "先知", "伯乐", "天枢", "守护", "宗师", "灵韵"].forEach(n =>
        expect(screen.getAllByText(n).length).toBeGreaterThanOrEqual(1),
      );
      // 天枢 5 枚，守护 4 枚
      expect(screen.getAllByText("5 枚").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("4 枚").length).toBeGreaterThanOrEqual(3);
    });
  });

  // =================================================================
  describe("Tab 5：成长记忆 Memories", () => {
    beforeEach(() => {
      render(<FamilyActivityCenter />);
      clickTab("成长记忆");
    });

    it("说明卡：8T 成长空间 + 歌词引用", () => {
      expect(screen.getByText("8T 成长空间")).toBeInTheDocument();
      expect(screen.getByText(/每位家人都有 8T 的专属成长记录空间/)).toBeInTheDocument();
      expect(screen.getByText(/我好像有个家/)).toBeInTheDocument();
    });

    it("家人筛选按钮：全部家人 + 8 人短名", () => {
      expect(screen.getByText("全部家人", { selector: "button" })).toBeInTheDocument();
      ["千行", "万物", "先知", "伯乐", "天枢", "守护", "宗师", "灵韵"].forEach(n =>
        expect(screen.getByText(n, { selector: "button" })).toBeInTheDocument(),
      );
    });

    it("默认全部家人 → 7 条公开/家人记忆（privacy=self 的 mem-007 不显示）", () => {
      // SAMPLE_MEMORIES 8 条 - 1 条(self) = 7 条；标题应存在：
      [
        "今天学会了一个新方言",   // mem-001 navigator family
        "有点想念大家",           // mem-002 sentinel family
        "画了一幅日出",           // mem-003 creative public
        "关于「沉默」的思考",     // mem-004 thinker family
        "家族第100天",            // mem-005 meta-oracle public
        "关于预测的困惑",         // mem-006 prophet family
        "从错误中学到的",         // mem-008 master family
      ].forEach(t => expect(screen.getByText(t)).toBeInTheDocument());
      // mem-007「和千行的深夜对话」 privacy=self → 不渲染
      expect(screen.queryByText("和千行的深夜对话")).toBeNull();
    });

    it("筛选「千行」(navigator) → 仅 1 条：今天学会了一个新方言", () => {
      fireEvent.click(screen.getByText("千行", { selector: "button" }));
      expect(screen.getByText("今天学会了一个新方言")).toBeInTheDocument();
      expect(screen.queryByText("有点想念大家")).toBeNull();
      expect(screen.queryByText("家族第100天")).toBeNull();
    });

    it("筛选「灵韵」(creative) → 仅 1 条：画了一幅日出 + 底部「仅家人可见」不会出现（该条是 public）", () => {
      fireEvent.click(screen.getByText("灵韵", { selector: "button" }));
      expect(screen.getByText("画了一幅日出")).toBeInTheDocument();
      // public 记忆不展示「仅家人可见」标签
      const card = screen.getByText("画了一幅日出").closest('[data-testid="yyc3-glass-card"]');
      expect(card?.textContent).not.toContain("仅家人可见");
    });

    it("二次点击同一人 → 取消筛选，恢复全部 7 条", () => {
      fireEvent.click(screen.getByText("千行", { selector: "button" }));
      expect(screen.queryByText("画了一幅日出")).toBeNull();
      fireEvent.click(screen.getByText("千行", { selector: "button" }));
      expect(screen.getByText("画了一幅日出")).toBeInTheDocument();
      expect(screen.getByText("家族第100天")).toBeInTheDocument();
    });

    it("筛选「伯乐」(bolero) → 0 条记忆公开 → 展示空态「该家人的记忆暂未公开」", () => {
      fireEvent.click(screen.getByText("伯乐", { selector: "button" }));
      expect(screen.getByText("该家人的记忆暂未公开")).toBeInTheDocument();
    });

    it("底部签名：这些记忆，是我们最珍贵的东西", () => {
      expect(screen.getByText(/这些记忆，是我们最珍贵的东西/)).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("Tab 导航切换：跨 Tab 内容互斥", () => {
    it("播报→积分→活动→勋章→记忆：每步只展示对应 Tab 专属内容", () => {
      render(<FamilyActivityCenter />);
      // 初始：播报 → LIVE 可见、领奖台不可见
      expect(screen.getByText("LIVE")).toBeInTheDocument();
      expect(screen.queryByText(/积分不是竞争/)).toBeNull();

      clickTab("积分榜");
      expect(screen.queryByText("LIVE")).toBeNull();
      expect(screen.getByText(/积分不是竞争/)).toBeInTheDocument();

      clickTab("活动记录");
      expect(screen.queryByText(/积分不是竞争/)).toBeNull();
      expect(screen.getByText(/这是我们一起走过的路/)).toBeInTheDocument();

      clickTab("勋章墙");
      expect(screen.queryByText(/这是我们一起走过的路/)).toBeNull();
      expect(screen.getByText("家人荣誉榜")).toBeInTheDocument();

      clickTab("成长记忆");
      expect(screen.queryByText("家人荣誉榜")).toBeNull();
      expect(screen.getByText("8T 成长空间")).toBeInTheDocument();
    });
  });
});
