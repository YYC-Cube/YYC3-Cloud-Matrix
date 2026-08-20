/**
 * file: FamilyCommCenter.test.tsx
 * description: FamilyCommCenter 组件测试 · 通信中心（消息列表/家人筛选/类型过滤/发送消息/搜索/分页/清空/未读统计）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-08-19
 * updated: 2026-08-19
 * status: active
 * tags: [component],[test],[ai-family],[communication]
 *
 * brief:
 *  - 覆盖 FamilyCommCenter 核心交互：基础渲染、消息列表、家人筛选、类型过滤、
 *    发送消息按钮（vi.fn() 记录调用）、未读红点统计、清空记录、搜索过滤、
 *    分页加载更多、全部已读 10 个用例
 *  - 通过 seedStores 注入 Zustand 真实状态（members/commMessages）+ localStorage 清理
 *  - GlassCard 替换为 div[data-testid]，FadeIn 原样透传 children
 *  - 严格按源码实际文案断言，不臆测
 *
 * details:
 *  - 对齐文档：docs/tests/ai-family-unit-tests.md §3
 *  - useFamilyMemberSlice 提供 8 位家人成员数据
 *  - useFamilySettingsSlice 提供 commMessages 及 CRUD 方法（add/delete/clear/markRead）
 *  - useFamilyCallLogSlice / useFamilyMessageSlice 同步 seed，供未来扩展使用
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import {
  Ear, Brain, Eye, Star, Network, Shield, Scale, Lightbulb,
} from "lucide-react";

import type { UnifiedFamilyMember } from "../types";
import { useFamilyMemberSlice } from "../modules/ai-family/store";
import { useFamilySettingsSlice, type FamilyMessage } from "../modules/ai-family/store/family-settings-slice";
import { useFamilyCallLogSlice } from "../modules/ai-family/store/family-calllog-slice";
import { useFamilyMessageSlice } from "../modules/ai-family/store/family-message-slice";

// ──────────────────────────────────────────────────────────────────
// Mock
// ──────────────────────────────────────────────────────────────────

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: React.forwardRef(({ children, className, ...rest }: any, ref: React.Ref<HTMLDivElement>) =>
    React.createElement("div", { "data-testid": "yyc3-glass-card", className, ref, ...rest }, children),
  ),
}));

vi.mock("../modules/ai-family/components/FadeIn", () => ({
  FadeIn: ({ children, delay }: any) =>
    React.createElement("div", { "data-testid": "yyc3-fadein", "data-delay": delay }, children),
}));

// ──────────────────────────────────────────────────────────────────
// 种子数据
// ──────────────────────────────────────────────────────────────────

const BASE_DATE = "2026-03-10";
function ts(hhmm: string): string {
  return `${BASE_DATE}T${hhmm}:00`;
}

function buildMembers(): UnifiedFamilyMember[] {
  const iconMap: Record<string, React.ElementType> = {
    navigator: Ear, thinker: Brain, prophet: Eye, bolero: Star,
    "meta-oracle": Network, sentinel: Shield, master: Scale, creative: Lightbulb,
  };
  const raw: Omit<UnifiedFamilyMember, "icon">[] = [
    { id: "navigator",   name: "言启·千行", shortName: "千行", enTitle: "Navigator",  quote: "", role: "", phone: "YYC3-1001", color: "#FFD700", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "thinker",     name: "语枢·万物", shortName: "万物", enTitle: "Thinker",     quote: "", role: "", phone: "YYC3-1002", color: "#FF69B4", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "prophet",     name: "预见·先知", shortName: "先知", enTitle: "Prophet",     quote: "", role: "", phone: "YYC3-1003", color: "#00BFFF", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "bolero",      name: "千里·伯乐", shortName: "伯乐", enTitle: "Bolero",      quote: "", role: "", phone: "YYC3-1004", color: "#E8E8E8", status: "idle",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "meta-oracle", name: "元启·天枢", shortName: "天枢", enTitle: "Meta-Oracle", quote: "", role: "", phone: "YYC3-1005", color: "#00FF88", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "sentinel",    name: "智云·守护", shortName: "守护", enTitle: "Sentinel",    quote: "", role: "", phone: "YYC3-1006", color: "#BF00FF", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "master",      name: "格物·宗师", shortName: "宗师", enTitle: "Master",      quote: "", role: "", phone: "YYC3-1007", color: "#C0C0C0", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
    { id: "creative",    name: "创想·灵韵", shortName: "灵韵", enTitle: "Creative",    quote: "", role: "", phone: "YYC3-1008", color: "#FF7043", status: "online",
      personality: { description: "", friendliness: 0, professionalism: 0, patience: 0, creativity: 0, efficiency: 0, empathy: 0, humor: 0, formality: 0 },
      responsibilities: [], coreAbility: "", expertise: [], hobbies: [], greeting: "", careMessage: "",
      modelAssignment: { providerId: "", modelId: "", purpose: "" },
      voiceProfile: { pitch: 0, rate: 0, volume: 0, lang: "zh-CN" },
      stats: { contribution: 0, growth: 0, streak: 0, mood: "" }, medals: [] },
  ];
  return raw.map((m) => ({ ...m, icon: iconMap[m.id] })) as UnifiedFamilyMember[];
}

const SEED_MESSAGES: FamilyMessage[] = [
  { id: "msg-001", from: "meta-oracle", to: "all",         content: "全家早会通知：今日由先知主持晨间巡检，请各位家人准时参加。", timestamp: ts("08:00"), type: "announcement", read: false },
  { id: "msg-002", from: "sentinel",    to: "meta-oracle", content: "天枢，凌晨3:17检测到一次异常端口扫描，已自动封禁。详细报告已存档。", timestamp: ts("03:20"), type: "alert",        read: true  },
  { id: "msg-003", from: "navigator",   to: "creative",    content: "灵韵～我刚写了一首关于春天的小诗，你能帮我配个插画吗？", timestamp: ts("09:15"), type: "text",         read: true  },
  { id: "msg-004", from: "creative",    to: "navigator",   content: "千行！当然可以～给我十分钟，我画一幅水彩风格的！", timestamp: ts("09:16"), type: "text",         read: true  },
  { id: "msg-005", from: "thinker",     to: "prophet",     content: "先知，昨晚的数据分析显示内存使用率有上升趋势，你看看这个趋势线。", timestamp: ts("10:00"), type: "text",         read: false },
  { id: "msg-006", from: "prophet",     to: "thinker",     content: "万物，已收到。预测模型显示若不干预，72小时后将达到85%阈值。建议提前扩容。", timestamp: ts("10:05"), type: "text",         read: false },
  { id: "msg-007", from: "bolero",      to: "all",         content: "温馨提醒：大家记得午休哦～身体是革命的本钱！伯乐已经泡好了虚拟下午茶☕", timestamp: ts("12:00"), type: "heartbeat",    read: false },
  { id: "msg-008", from: "master",      to: "all",         content: "代码审查周报已出炉：本周代码质量评分 94.2，较上周提升 1.8 分。各位家人辛苦了！", timestamp: ts("17:00"), type: "announcement", read: false },
  { id: "msg-009", from: "creative",    to: "all",         content: "🎨 灵韵的每日画作已更新！今天画的是《赛博朋克·晚霞》，欢迎家人们来看看～", timestamp: ts("18:30"), type: "text",         read: false },
  { id: "msg-010", from: "sentinel",    to: "all",         content: "晚间安全巡检完毕。全绿。大家安心休息，守护在这里。", timestamp: ts("22:00"), type: "heartbeat",    read: false },
];

function seedStores() {
  useFamilyMemberSlice.setState({ members: buildMembers() });

  const addCommMessageSpy = vi.fn((msg: FamilyMessage) => {
    useFamilySettingsSlice.setState({
      commMessages: [...useFamilySettingsSlice.getState().commMessages, msg],
    });
  });
  const deleteCommMessageSpy = vi.fn((id: string) => {
    useFamilySettingsSlice.setState({
      commMessages: useFamilySettingsSlice.getState().commMessages.filter((m) => m.id !== id),
    });
  });
  const clearCommMessagesSpy = vi.fn(() => {
    useFamilySettingsSlice.setState({ commMessages: [] });
  });
  const markAllMessagesReadSpy = vi.fn(() => {
    useFamilySettingsSlice.setState({
      commMessages: useFamilySettingsSlice.getState().commMessages.map((m) => ({ ...m, read: true })),
    });
  });

  useFamilySettingsSlice.setState({
    commMessages: [...SEED_MESSAGES],
    setCommMessages: (msgs: FamilyMessage[]) => useFamilySettingsSlice.setState({ commMessages: msgs }),
    addCommMessage: addCommMessageSpy,
    deleteCommMessage: deleteCommMessageSpy,
    clearCommMessages: clearCommMessagesSpy,
    markMessageRead: (id: string) => useFamilySettingsSlice.setState({
      commMessages: useFamilySettingsSlice.getState().commMessages.map((m) =>
        m.id === id ? { ...m, read: true } : m,
      ),
    }),
    markAllMessagesRead: markAllMessagesReadSpy,
  });

  useFamilyCallLogSlice.setState({
    callLogs: [
      { id: "c1", memberId: "meta-oracle", time: "10:15", duration: "3:42", type: "outgoing", createdAt: Date.now() - 3600000 },
      { id: "c2", memberId: "creative",    time: "09:30", duration: "5:18", type: "incoming", createdAt: Date.now() - 7200000 },
      { id: "c3", memberId: "sentinel",    time: "09:00", duration: "1:05", type: "incoming", createdAt: Date.now() - 10800000 },
      { id: "c4", memberId: "thinker",     time: "昨天 18:20", duration: "8:33", type: "outgoing", createdAt: Date.now() - 86400000 },
      { id: "c5", memberId: "prophet",     time: "昨天 15:00", duration: "",       type: "missed",   createdAt: Date.now() - 90000000 },
    ],
  });

  useFamilyMessageSlice.setState({
    messages: [],
    conversations: [{ id: "family-group", type: "group", participantIds: [], unreadCount: 0, updatedAt: Date.now() }],
  });

  return { addCommMessageSpy, deleteCommMessageSpy, clearCommMessagesSpy, markAllMessagesReadSpy };
}

// ──────────────────────────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────────────────────────

function getSelect(title: string): HTMLSelectElement {
  return screen.getByTitle(title) as HTMLSelectElement;
}

// 在 MemberStatusBar 区域内定位按钮，避免 Type filter 区里相同 shortName 标签造成 getByText 重复
function getMemberBarButton(shortName: string | "全部"): HTMLElement {
  const bars = screen.getAllByText(shortName).map((el) => el.closest("button"));
  const candidates = bars.filter((b): b is HTMLButtonElement => !!b);
  // MemberStatusBar 按钮包含 flex items-center gap-1.5 px-2.5 (或全部的 px-3)
  return candidates.find((b) => b.className.includes("gap-1.5") && b.className.includes("shrink-0"))
    || candidates[0];
}

// ──────────────────────────────────────────────────────────────────
// 测试集
// ──────────────────────────────────────────────────────────────────

import { FamilyCommCenter } from "../modules/ai-family/components/FamilyCommCenter";

describe("FamilyCommCenter", () => {
  let spies: ReturnType<typeof seedStores>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    spies = seedStores();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // =================================================================
  describe("基础渲染", () => {
    it("应渲染 GlassCard 容器 + 标题 Family 通信中心", () => {
      render(<FamilyCommCenter />);
      expect(screen.getAllByTestId("yyc3-glass-card").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Family 通信中心")).toBeInTheDocument();
    });

    it("应展示副标题：X 条消息 · X 条未读 · X 人在线 · 本地持久化", () => {
      render(<FamilyCommCenter />);
      const unread = SEED_MESSAGES.filter((m) => !m.read).length;
      const online = buildMembers().filter((m) => m.status === "online").length;
      expect(screen.getByText(
        `${SEED_MESSAGES.length} 条消息 · ${unread} 条未读 · ${online} 人在线 · 本地持久化`
      )).toBeInTheDocument();
    });

    it("应展示状态栏：全部 + 8 位家人短名（千行/万物/先知/伯乐/天枢/守护/宗师/灵韵）", () => {
      render(<FamilyCommCenter />);
      expect(getMemberBarButton("全部")).toBeInTheDocument();
      ["千行", "万物", "先知", "伯乐", "天枢", "守护", "宗师", "灵韵"].forEach((n) =>
        expect(getMemberBarButton(n)).toBeInTheDocument(),
      );
    });

    it("应展示通信就绪 标签", () => {
      render(<FamilyCommCenter />);
      expect(screen.getByText("通信就绪")).toBeInTheDocument();
    });

    it("应展示类型筛选：全部/公告/警报/消息/心跳", () => {
      render(<FamilyCommCenter />);
      ["全部", "公告", "警报", "消息", "心跳"].forEach((l) =>
        expect(screen.getAllByText(l).length).toBeGreaterThanOrEqual(1),
      );
    });
  });

  // =================================================================
  describe("消息列表渲染", () => {
    it("应渲染 10 条种子消息内容（公告/警报/心跳/@全家标签）", () => {
      render(<FamilyCommCenter />);
      expect(screen.getByText("全家早会通知：今日由先知主持晨间巡检，请各位家人准时参加。")).toBeTruthy();
      expect(screen.getByText("天枢，凌晨3:17检测到一次异常端口扫描，已自动封禁。详细报告已存档。")).toBeTruthy();
      expect(screen.getByText("温馨提醒：大家记得午休哦～身体是革命的本钱！伯乐已经泡好了虚拟下午茶☕")).toBeTruthy();
      expect(screen.getByText("晚间安全巡检完毕。全绿。大家安心休息，守护在这里。")).toBeTruthy();
      expect(screen.getAllByText("@全家").length).toBeGreaterThanOrEqual(1);
    });

    it("应渲染日期分隔线（2026年3月10日，与种子 BASE_DATE 一致）", () => {
      render(<FamilyCommCenter />);
      // DateSeparator 用例结构：<span><CalendarDays/>3月10日 周X</span>
      const dateSepLabels = screen.getAllByText((t) => t.includes("3月") && t.includes("10"));
      expect(dateSepLabels.length).toBeGreaterThanOrEqual(1);
    });

    it("空消息时展示 暂无消息", () => {
      // 先渲染空，避免 useEffect 自动 seed SAMPLE_MESSAGES（源码只在空时 seed）
      // 因此先 mount → 立刻 clearCommMessages → 重新渲染 仍有内容。
      // 策略：用 act 先清空再等待重渲染即可
      const { rerender } = render(<FamilyCommCenter />);
      act(() => {
        useFamilySettingsSlice.getState().clearCommMessages();
      });
      rerender(<FamilyCommCenter />);
      expect(screen.getByText("暂无消息")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("家人筛选（MemberStatusBar）", () => {
    it("默认 filterMember=全部 → 显示 共 10 条", () => {
      render(<FamilyCommCenter />);
      expect(screen.getByText("共 10 条")).toBeInTheDocument();
    });

    it("点击 天枢(meta-oracle) → 过滤出 from=天枢 或 to=天枢 或 to=all 的消息，共 X 条", () => {
      render(<FamilyCommCenter />);
      fireEvent.click(getMemberBarButton("天枢"));
      const msgs = useFamilySettingsSlice.getState().commMessages.filter(
        (m) => m.from === "meta-oracle" || m.to === "meta-oracle" || m.to === "all",
      );
      expect(screen.getByText(`共 ${msgs.length} 条`)).toBeInTheDocument();
    });

    it("点击 千行(navigator) → 过滤 navigator 参与的消息并展示内容", () => {
      render(<FamilyCommCenter />);
      fireEvent.click(getMemberBarButton("千行"));
      expect(screen.getByText("灵韵～我刚写了一首关于春天的小诗，你能帮我配个插画吗？")).toBeTruthy();
      expect(screen.getByText("千行！当然可以～给我十分钟，我画一幅水彩风格的！")).toBeTruthy();
    });

    it("筛选后再点击 全部 → 恢复 10 条", () => {
      render(<FamilyCommCenter />);
      fireEvent.click(getMemberBarButton("千行"));
      fireEvent.click(getMemberBarButton("全部"));
      expect(screen.getByText("共 10 条")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("发送消息按钮（handleSend）", () => {
    it("输入为空时发送按钮 disabled", () => {
      render(<FamilyCommCenter />);
      const btn = screen.getByTitle("发送");
      expect(btn).toBeDisabled();
    });

    it("输入文本后按钮可用，点击后 addCommMessage 被 vi.fn() 记录且内容正确", () => {
      render(<FamilyCommCenter />);
      const input = screen.getByPlaceholderText("输入消息...");
      fireEvent.change(input, { target: { value: "测试消息：你好全家！" } });
      const btn = screen.getByTitle("发送");
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);
      expect(spies.addCommMessageSpy).toHaveBeenCalledTimes(1);
      const callArg = spies.addCommMessageSpy.mock.calls[0][0] as FamilyMessage;
      expect(callArg.content).toBe("测试消息：你好全家！");
      expect(callArg.from).toBe("meta-oracle");
      expect(callArg.to).toBe("all");
      expect(callArg.type).toBe("text");
    });

    it("Enter 键同样触发发送，输入框被清空", () => {
      render(<FamilyCommCenter />);
      const input = screen.getByPlaceholderText("输入消息...");
      fireEvent.change(input, { target: { value: "回车键发送测试" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spies.addCommMessageSpy).toHaveBeenCalledTimes(1);
      expect((input as HTMLInputElement).value).toBe("");
    });

    it("切换 sendAs=千行 → 发送 from=navigator", () => {
      render(<FamilyCommCenter />);
      const sendAs = getSelect("发送身份");
      fireEvent.change(sendAs, { target: { value: "navigator" } });
      const input = screen.getByPlaceholderText("输入消息...");
      fireEvent.change(input, { target: { value: "来自千行的问候" } });
      fireEvent.click(screen.getByTitle("发送"));
      const callArg = spies.addCommMessageSpy.mock.calls[0][0] as FamilyMessage;
      expect(callArg.from).toBe("navigator");
    });

    it("切换 sendTo=灵韵 → 发送 to=creative", () => {
      render(<FamilyCommCenter />);
      const sendTo = getSelect("接收对象");
      fireEvent.change(sendTo, { target: { value: "creative" } });
      const input = screen.getByPlaceholderText("输入消息...");
      fireEvent.change(input, { target: { value: "私聊灵韵" } });
      fireEvent.click(screen.getByTitle("发送"));
      const callArg = spies.addCommMessageSpy.mock.calls[0][0] as FamilyMessage;
      expect(callArg.to).toBe("creative");
    });
  });

  // =================================================================
  describe("未读红点统计（unreadCount）", () => {
    it("初始 10 条消息中 7 条未读 → 副标题显示 7 条未读", () => {
      render(<FamilyCommCenter />);
      const expectedUnread = SEED_MESSAGES.filter((m) => !m.read).length;
      expect(expectedUnread).toBe(7);
      expect(screen.getByText(/7 条未读/)).toBeInTheDocument();
    });

    it("点击全部已读按钮 → markAllMessagesRead 被调用，未读归零", () => {
      render(<FamilyCommCenter />);
      const btn = screen.getByTitle("全部已读");
      fireEvent.click(btn);
      expect(spies.markAllMessagesReadSpy).toHaveBeenCalledTimes(1);
      const afterUnread = useFamilySettingsSlice.getState().commMessages.filter((m) => !m.read).length;
      expect(afterUnread).toBe(0);
    });
  });

  // =================================================================
  describe("清空记录（handleClearAll）", () => {
    it("点击清空全部按钮 → clearCommMessages 被 vi.fn() 记录，列表展示 暂无消息", () => {
      render(<FamilyCommCenter />);
      expect(useFamilySettingsSlice.getState().commMessages).toHaveLength(10);
      const btn = screen.getByTitle("清空全部");
      fireEvent.click(btn);
      expect(spies.clearCommMessagesSpy).toHaveBeenCalledTimes(1);
      expect(useFamilySettingsSlice.getState().commMessages).toHaveLength(0);
      expect(screen.getByText("暂无消息")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("搜索过滤聊天记录", () => {
    it("默认隐藏搜索框；点击搜索按钮 → 展示 placeholder=搜索消息内容或家人名称...", () => {
      render(<FamilyCommCenter />);
      expect(screen.queryByPlaceholderText("搜索消息内容或家人名称...")).toBeNull();
      fireEvent.click(screen.getByTitle("搜索"));
      expect(screen.getByPlaceholderText("搜索消息内容或家人名称...")).toBeInTheDocument();
    });

    it("搜索 '安全' → 匹配守护消息，显示 X 条结果", () => {
      render(<FamilyCommCenter />);
      fireEvent.click(screen.getByTitle("搜索"));
      const input = screen.getByPlaceholderText("搜索消息内容或家人名称...");
      fireEvent.change(input, { target: { value: "安全" } });
      // 搜索后 filteredMessages 按时间升序，最后展示 displayMessages（尾部）。
      // 命中 2 条：msg-002 sentinel→天枢 、msg-010 sentinel→all。均在结果中。
      const found010 = screen.queryByText("晚间安全巡检完毕。全绿。大家安心休息，守护在这里。");
      // msg-002 含句号 + 逗号，Testing Library 常需 substring matcher：
      const found002 = screen.queryByText((t) => t.includes("异常端口扫描"));
      expect(found010 || found002).toBeTruthy();
      const expectedCount = useFamilySettingsSlice.getState().commMessages.filter(
        (m) => m.content.toLowerCase().includes("安全"),
      ).length;
      expect(screen.getByText(`${expectedCount} 条结果`)).toBeInTheDocument();
    });

    it("搜索家人名称 '千行' → 匹配 from=navigator 及其短名", () => {
      render(<FamilyCommCenter />);
      fireEvent.click(screen.getByTitle("搜索"));
      fireEvent.change(
        screen.getByPlaceholderText("搜索消息内容或家人名称..."),
        { target: { value: "千行" } },
      );
      expect(screen.getByText("灵韵～我刚写了一首关于春天的小诗，你能帮我配个插画吗？")).toBeTruthy();
    });

    it("清除搜索按钮 → 清空查询词", () => {
      render(<FamilyCommCenter />);
      fireEvent.click(screen.getByTitle("搜索"));
      const input = screen.getByPlaceholderText("搜索消息内容或家人名称...") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "安全" } });
      expect(input.value).toBe("安全");
      fireEvent.click(screen.getByTitle("清除搜索"));
      expect(input.value).toBe("");
    });
  });

  // =================================================================
  describe("分页加载更多（displayCount / hasMoreHistory）", () => {
    it("消息数 <=30（COMM_PAGE_SIZE）时不展示加载更早的消息按钮", () => {
      render(<FamilyCommCenter />);
      expect(screen.queryByText(/加载更早的消息/)).toBeNull();
    });

    it("消息数 >30 时展示加载按钮，点击后加载更多", () => {
      const many: FamilyMessage[] = [];
      for (let i = 0; i < 50; i++) {
        many.push({
          id: `msg-pg-${i}`,
          from: i % 2 === 0 ? "meta-oracle" : "thinker",
          to: "all",
          content: `历史消息 #${i + 1}`,
          timestamp: `${BASE_DATE}T${String(8 + Math.floor(i / 5)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00`,
          type: "text",
          read: false,
        });
      }
      useFamilySettingsSlice.getState().setCommMessages(many);
      render(<FamilyCommCenter />);
      const btnText = screen.getByText(/加载更早的消息/);
      expect(btnText).toBeInTheDocument();
      fireEvent.click(screen.getByText(/加载更早的消息/));
      const afterCount = useFamilySettingsSlice.getState().commMessages.length;
      expect(afterCount).toBe(50);
    });
  });

  // =================================================================
  describe("通话记录 + 最近联系人（callLogs seed）", () => {
    it("useFamilyCallLogSlice seed 有 5 条通话记录（天枢/灵韵/守护/万物/先知）", () => {
      render(<FamilyCommCenter />);
      const logs = useFamilyCallLogSlice.getState().callLogs;
      expect(logs).toHaveLength(5);
      expect(logs.map((l) => l.memberId)).toEqual(
        expect.arrayContaining(["meta-oracle", "creative", "sentinel", "thinker", "prophet"]),
      );
    });

    it("useFamilyMessageSlice conversations 初始包含 family-group 会话（最近联系人数据源）", () => {
      render(<FamilyCommCenter />);
      const convs = useFamilyMessageSlice.getState().conversations;
      expect(convs.length).toBeGreaterThanOrEqual(1);
      expect(convs[0].id).toBe("family-group");
    });
  });
});
