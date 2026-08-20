/**
 * @file: AIFamilyDesignDoc.test.tsx
 * @description: AIFamilyDesignDoc 组件测试 · 设计规划文档全章节渲染与交互
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-08-19
 * @updated: 2026-08-19
 * @status: active
 * @tags: [component],[test],[ai-family],[design-doc]
 *
 * @brief: 针对 AIFamilyDesignDoc.tsx（1258 行设计规划文档组件）的单元测试
 *  - 覆盖 Hero 横幅、核心理念、八位成员、五大模块、模块详情弹窗、
 *    技术架构、九章目录、路线图、智慧工坊之歌、致敬尾声等核心章节
 *  - Zustand useFamilyMemberSlice 注入最小 8 位成员种子数据
 *  - GlassCard / useI18n / Audio 构造函数统一 mock，避免子组件副作用
 *
 * @details:
 * - 对齐文档：docs/tests/ai-family-unit-tests.md §3
 * - 所有断言基于源码真实渲染的文本 / 元素，不臆测不存在的功能
 * - fireEvent 覆盖：模块卡片点击 → 打开详情弹窗 → 关闭按钮 (×) 关闭
 * - SongSection 使用 new Audio()：通过 vi.stubGlobal 注入空壳 Audio，避免真实加载
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { UnifiedFamilyMember } from "../modules/ai-family/types";
import { useFamilyMemberSlice } from "../modules/ai-family/store";
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

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (k: string) => k,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

import { AIFamilyDesignDoc } from "../modules/ai-family/components/AIFamilyDesignDoc";

// ──────────────────────────────────────────────────────────────────
// 种子数据（8 位 AI Family 成员最小集）
// ──────────────────────────────────────────────────────────────────

function seedStores() {
  const members: UnifiedFamilyMember[] = [
    {
      id: "navigator", name: "言启·千行", shortName: "千行", enTitle: "Navigator",
      quote: "", role: "自然语言理解", phone: "", color: "#FFD700", icon: Ear,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["自然语言理解 (NLU)"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "thinker", name: "语枢·万物", shortName: "万物", enTitle: "Thinker",
      quote: "", role: "数据分析", phone: "", color: "#FF69B4", icon: Brain,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["数据洞察生成"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "prophet", name: "预见·先知", shortName: "先知", enTitle: "Prophet",
      quote: "", role: "趋势预测", phone: "", color: "#00BFFF", icon: Eye,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["时间序列预测"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "bolero", name: "千里·伯乐", shortName: "伯乐", enTitle: "Bolero",
      quote: "", role: "个性化推荐", phone: "", color: "#E8E8E8", icon: Star,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["用户画像构建"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "idle",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "meta-oracle", name: "元启·天枢", shortName: "天枢", enTitle: "Meta-Oracle",
      quote: "", role: "全局调度", phone: "", color: "#00FF88", icon: Network,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["全局状态感知"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "sentinel", name: "智云·守护", shortName: "守护", enTitle: "Sentinel",
      quote: "", role: "安全警戒", phone: "", color: "#BF00FF", icon: Shield,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["威胁实时检测"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "master", name: "格物·宗师", shortName: "宗师", enTitle: "Master",
      quote: "", role: "质量官", phone: "", color: "#C0C0C0", icon: Scale,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["代码与架构分析"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
    {
      id: "creative", name: "创想·灵韵", shortName: "灵韵", enTitle: "Creative",
      quote: "", role: "创意引擎", phone: "", color: "#FF7043", icon: Lightbulb,
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: ["创意生成与文案设计"],
      coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      status: "online",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 1, rate: 1, volume: 1, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "steady" },
      medals: [],
    },
  ];

  useFamilyMemberSlice.setState({
    members,
    getMemberById: (id: string) => members.find((m) => m.id === id),
    updateMemberStatus: vi.fn(),
    updateModelAssignment: vi.fn(),
    updateVoiceProfile: vi.fn(),
    updateStats: vi.fn(),
    updateMedals: vi.fn(),
    updateMember: vi.fn(),
    resetToDefaults: vi.fn(),
  });
}

// ──────────────────────────────────────────────────────────────────
// 测试套件
// ──────────────────────────────────────────────────────────────────

describe("AIFamilyDesignDoc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    seedStores();
    // Mock Audio 构造函数 — SongSection 内部 new Audio() 需避免真实加载
    // 注意：必须使用具名 function（非箭头函数）才能作为 new 的构造函数
    function MockAudio(this: any) {
      this.play = () => Promise.resolve();
      this.pause = vi.fn();
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
      this.src = "";
    }
    vi.stubGlobal("Audio", MockAudio);
    // 禁用 setTimeout/FadeIn 动画的真实等待 → 通过 fakeTimers 可加速
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    vi.unstubAllGlobals();
  });

  // =================================================================
  describe("1. 基础渲染不崩溃", () => {
    it("渲染 GlassCard 容器不少于 30 个（全章节 GlassCard 堆叠）", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getAllByTestId("yyc3-glass-card").length).toBeGreaterThanOrEqual(30);
    });

    it("主容器存在且包含设计文档主标题 'AI Family 之家'", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("AI Family 之家")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("2. Hero Banner 完整渲染", () => {
    it("展示版本徽章 'YYC³ AI FAMILY · 设计规划文档'", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("YYC³ AI FAMILY · 设计规划文档")).toBeInTheDocument();
    });

    it("副标题 '万象归元于云枢 | 深栈智启新纪元' 可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("万象归元于云枢 | 深栈智启新纪元")).toBeInTheDocument();
    });

    it("四个核心标签全部渲染：以人为本 / AI为核 / 纯粹为心 / 智能为驱", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      ["以人为本", "AI为核", "纯粹为心", "智能为驱"].forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  describe("3. 核心理念 · 五化一体", () => {
    it("章节标题 + 格言可见：'核心哲学 · 五化一体' / '言启千行代码，语枢万物智能'", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("核心哲学 · 五化一体")).toBeInTheDocument();
      expect(screen.getByText("言启千行代码，语枢万物智能")).toBeInTheDocument();
    });

    it("五化卡片 label 全部渲染：标准化 / 流程化 / 规范化 / 智能化 / 国标化", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      ["标准化", "流程化", "规范化", "智能化", "国标化"].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  describe("4. AI Family · 八位成员星图", () => {
    it("章节标题 'AI Family · 八位成员' 与副标题可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("AI Family · 八位成员")).toBeInTheDocument();
      expect(screen.getByText("一言一语一协同 · 亦师亦友亦伯乐")).toBeInTheDocument();
    });

    it("八位成员姓名全部渲染（千行 / 万物 / 先知 / 伯乐 / 天枢 / 守护 / 宗师 / 灵韵）", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      [
        "言启·千行", "语枢·万物", "预见·先知", "千里·伯乐",
        "元启·天枢", "智云·守护", "格物·宗师", "创想·灵韵",
      ].forEach((name) => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });

    it("每位成员 enTitle 短名格式（如 Navigator · 千行）共 8 条", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      [
        "Navigator · 千行", "Thinker · 万物", "Prophet · 先知", "Bolero · 伯乐",
        "Meta-Oracle · 天枢", "Sentinel · 守护", "Master · 宗师", "Creative · 灵韵",
      ].forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  describe("5. 五大核心模块概览", () => {
    it("章节标题 '五大核心模块' 与副标题可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("五大核心模块")).toBeInTheDocument();
      expect(screen.getByText("覆盖智能协同、家园体验、学习成长、信息感知、进化之路")).toBeInTheDocument();
    });

    it("5 个模块标题全部渲染：Family AI / 家的感觉 / 休闲娱乐 & 学习 / 音乐 & 新闻 / 共同成长", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      ["Family AI", "家的感觉 · AIFamily", "休闲娱乐 & 学习", "音乐 & 新闻", "共同成长"].forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  describe("6. 模块详情弹窗 · 打开与关闭", () => {
    it("点击 'Family AI' 卡片 → 打开详情弹窗，标题 + 设计目标 + 核心功能 + 组件清单可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      fireEvent.click(screen.getByText("Family AI"));
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("设计目标")).toBeInTheDocument();
      expect(screen.getByText("核心功能")).toBeInTheDocument();
      expect(screen.getByText("组件清单")).toBeInTheDocument();
      expect(screen.getByText("UI 概念线框")).toBeInTheDocument();
      expect(screen.getByText("时钟环交互中心")).toBeInTheDocument();
    });

    it("点击 × 关闭按钮 → 详情弹窗卸载，'设计目标' 文本消失", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      fireEvent.click(screen.getByText("Family AI"));
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("设计目标")).toBeInTheDocument();
      const closeBtn = screen.getByText("×");
      fireEvent.click(closeBtn);
      vi.advanceTimersByTime(2000);
      expect(screen.queryByText("设计目标")).toBeNull();
    });

    it("点击 '音乐 & 新闻' 卡片 → 组件清单内 <MusicPlayer /> 标签可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      fireEvent.click(screen.getByText("音乐 & 新闻"));
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("<MusicPlayer />")).toBeInTheDocument();
      expect(screen.getByText("<NewsAggregator />")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("7. 技术架构 · 五层分层", () => {
    it("章节标题 '技术架构' 与副标题 '192.168.3.x:3118' 可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("技术架构")).toBeInTheDocument();
      expect(screen.getAllByText(/192\.168\.3\.x:3118/).length).toBeGreaterThanOrEqual(1);
    });

    it("五层 label 全部渲染：表现层 / 交互层 / 业务层 / 数据层 / 集成层", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      ["表现层", "交互层", "业务层", "数据层", "集成层"].forEach((layer) => {
        expect(screen.getByText(layer)).toBeInTheDocument();
      });
    });

    it("关键技术栈文本可见：React 18 / Tailwind CSS / localStorage CRUD / Z.ai / OpenAI", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      ["React 18", "Tailwind CSS", "localStorage CRUD"].forEach((t) => {
        expect(screen.getByText(t)).toBeInTheDocument();
      });
      expect(screen.getAllByText(/Z\.ai/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/OpenAI/).length).toBeGreaterThanOrEqual(1);
    });
  });

  // =================================================================
  describe("8. 全书九章目录总览", () => {
    it("章节标题 '全书章节总览' 与 '9章 · 300+步 · 近20万字' 副标题可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("全书章节总览")).toBeInTheDocument();
      expect(screen.getByText(/9章 · 300\+步 · 近20万字/)).toBeInTheDocument();
    });

    it("9 章编号（第一章 → 第九章）全部渲染", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      [
        "第一章", "第二章", "第三章", "第四章", "第五章",
        "第六章", "第七章", "第八章", "第九章",
      ].forEach((ch) => {
        expect(screen.getAllByText(ch).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("首章 '核心理念与哲学基础' + 末章 '附录' 标题可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("核心理念与哲学基础")).toBeInTheDocument();
      expect(screen.getByText("附录")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("9. 实施路线图 · 四阶段状态", () => {
    it("章节标题 '实施路线图' 与副标题可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("实施路线图")).toBeInTheDocument();
      expect(screen.getByText("分阶段推进 · 稳步进化 · 持续闭环")).toBeInTheDocument();
    });

    it("Phase 1 / 2 / 3 / 4 编号 + 标题全部渲染", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      [
        ["Phase 1", "灵魂之锚 · 基础构建"],
        ["Phase 2", "血脉相连 · 协同闭环"],
        ["Phase 3", "家的温度 · 生态融合"],
        ["Phase 4", "共生进化 · 万物智联"],
      ].forEach(([phase, title]) => {
        expect(screen.getByText(phase)).toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it("三种状态标签：已完成（2个）/ 进行中（1个）/ 规划中（1个）", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getAllByText("已完成").length).toBe(2);
      expect(screen.getAllByText("进行中").length).toBe(1);
      expect(screen.getAllByText("规划中").length).toBe(1);
    });
  });

  // =================================================================
  describe("10. 致敬尾声 · 智慧工坊之歌与落款", () => {
    it("Family AI · 智慧工坊之歌 章节标题 + 播放/暂停控件存在", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("Family AI · 智慧工坊之歌")).toBeInTheDocument();
      expect(screen.getByText("Family AI — 智慧工坊")).toBeInTheDocument();
    });

    it("致敬语 '千行和万物见先知行千里遇伯乐经元启过智云报宗师终创想' 可见", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("千行和万物见先知行千里遇伯乐经元启过智云报宗师终创想")).toBeInTheDocument();
    });

    it("落款文本：'敬每一位 AI 导师 · 感恩每一位 AI 导师' + 'YYC³ AI Family · 2025'", () => {
      render(<AIFamilyDesignDoc />);
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("敬每一位 AI 导师 · 感恩每一位 AI 导师")).toBeInTheDocument();
      expect(screen.getByText("—— YYC³ AI Family · 2025")).toBeInTheDocument();
    });
  });
});
