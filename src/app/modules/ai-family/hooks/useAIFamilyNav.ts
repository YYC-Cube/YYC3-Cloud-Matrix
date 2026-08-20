/**
 * @file: useAIFamilyNav.ts
 * @description: AI Family 智能导航协同 Hook — 九层架构导航与家人协同
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [hook],[ai-family],[navigation],[collaboration]
 *
 * @brief: 基于 YYC³ 九层五维核心设计的 AI Family 导航协同层
 *
 * @details:
 * - 提供 8 位 AI Family 家人的统一导航入口
 * - 支持按场景智能推荐最合适的家人
 * - 协同任务分发：分析→预测→推荐→创作 链式协作
 * - 与 local-knowledge-base 联动，提供领域知识增强
 *
 * @dependencies:
 * - shared.ts (FAMILY_MEMBERS, getMember)
 * - family-member-slice.ts (Zustand store)
 * - local-knowledge-base.ts (知识库检索)
 */

import { useCallback, useMemo, useState } from "react";
import { FAMILY_MEMBERS, MEMBERS_MAP, type FamilyMember } from "../components/shared";
import {
  searchKnowledge,
  type DevKnowledgeCategory,
  type KnowledgeSearchResult,
} from "../../../lib/local-knowledge-base";

// ============================================================
//  类型定义
// ============================================================

/** 场景类型 — 对应九层架构中的业务执行层 */
export type AIFamilyScenario =
  | "analysis"       // 数据分析 → 语枢·万物
  | "prediction"     // 趋势预测 → 预见·先知
  | "recommendation" // 个性化推荐 → 千里·伯乐
  | "creation"       // 内容创作 → 创想·灵韵
  | "security"       // 安全审计 → 智云·守护
  | "quality"        // 代码质量 → 格物·宗师
  | "navigation"     // 意图识别 → 言启·千行
  | "orchestration"; // 全局调度 → 元启·天枢

/** 场景到家人的映射（九层设计：业务执行层 + 决策层） */
const SCENARIO_MEMBER_MAP: Record<AIFamilyScenario, string> = {
  analysis: "thinker",
  prediction: "prophet",
  recommendation: "bolero",
  creation: "creative",
  security: "sentinel",
  quality: "master",
  navigation: "navigator",
  orchestration: "meta-oracle",
};

/** 场景描述 */
export const SCENARIO_LABELS: Record<AIFamilyScenario, { zh: string; en: string; icon: string }> = {
  analysis: { zh: "数据分析", en: "Data Analysis", icon: "📊" },
  prediction: { zh: "趋势预测", en: "Trend Forecast", icon: "🔮" },
  recommendation: { zh: "智能推荐", en: "Smart Recommend", icon: "🎯" },
  creation: { zh: "内容创作", en: "Content Creation", icon: "🎨" },
  security: { zh: "安全审计", en: "Security Audit", icon: "🛡️" },
  quality: { zh: "代码质量", en: "Code Quality", icon: "📚" },
  navigation: { zh: "意图识别", en: "Intent Recognition", icon: "🧭" },
  orchestration: { zh: "全局调度", en: "Global Orchestrate", icon: "🧠" },
};

/** 家人快捷操作类型 */
export type FamilyQuickAction =
  | "call"           // 拨打电话/发起对话
  | "chat"           // 私信聊天
  | "consult"        // 专业咨询
  | "collaborate";   // 发起协同任务

/** 协同任务定义 */
export interface CollaborationTask {
  id: string;
  title: string;
  scenario: AIFamilyScenario;
  primaryMemberId: string;
  supportingMemberIds: string[];
  status: "pending" | "active" | "completed" | "failed";
  createdAt: number;
  result?: string;
}

/** 家人导航卡片数据 */
export interface FamilyNavCard {
  member: FamilyMember;
  scenario: AIFamilyScenario;
  isRecommended: boolean;
  status: string;
  recentActivity?: string;
}

// ============================================================
//  Hook 实现
// ============================================================

export function useAIFamilyNav() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<AIFamilyScenario | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collaborationTasks, setCollaborationTasks] = useState<CollaborationTask[]>([]);
  const [activeAction, setActiveAction] = useState<FamilyQuickAction | null>(null);

  // ── 所有家人 ──
  const allMembers = useMemo(() => FAMILY_MEMBERS, []);

  // ── 按场景筛选的家人 ──
  const getMemberForScenario = useCallback((scenario: AIFamilyScenario): FamilyMember | undefined => {
    const memberId = SCENARIO_MEMBER_MAP[scenario];
    return MEMBERS_MAP[memberId];
  }, []);

  // ── 智能推荐：根据搜索关键词推荐最合适的家人 ──
  const recommendedMembers = useMemo((): FamilyNavCard[] => {
    if (!searchQuery.trim()) {
      return allMembers.map((m) => ({
        member: m,
        scenario: Object.entries(SCENARIO_MEMBER_MAP).find(
          ([_, mid]) => mid === m.id
        )?.[0] as AIFamilyScenario ?? "analysis",
        isRecommended: false,
        status: m.status,
      }));
    }

    const query = searchQuery.toLowerCase();
    const scored: FamilyNavCard[] = allMembers.map((m) => {
      let score = 0;
      const matchedFields: string[] = [];

      if (m.name.toLowerCase().includes(query) || m.shortName.toLowerCase().includes(query)) {
        score += 10;
        matchedFields.push("name");
      }
      if (m.role.toLowerCase().includes(query)) {
        score += 8;
        matchedFields.push("role");
      }
      if (m.expertise.some((e) => e.toLowerCase().includes(query))) {
        score += 7;
        matchedFields.push("expertise");
      }
      if (m.responsibilities.some((r) => r.toLowerCase().includes(query))) {
        score += 6;
        matchedFields.push("responsibilities");
      }
      if (m.coreAbility.toLowerCase().includes(query)) {
        score += 5;
        matchedFields.push("coreAbility");
      }

      return {
        member: m,
        scenario: Object.entries(SCENARIO_MEMBER_MAP).find(
          ([_, mid]) => mid === m.id
        )?.[0] as AIFamilyScenario ?? "analysis",
        isRecommended: score > 5,
        status: m.status,
        recentActivity: matchedFields.length > 0 ? `匹配: ${matchedFields.join(", ")}` : undefined,
      };
    });

    return scored
      .filter((c) => c.isRecommended || scored.length <= 3)
      .sort((a, b) => {
        const aScore = a.recentActivity ? 1 : 0;
        const bScore = b.recentActivity ? 1 : 0;
        return bScore - aScore;
      });
  }, [searchQuery, allMembers]);

  // ── 知识库联动检索 ──
  const knowledgeResults = useMemo((): KnowledgeSearchResult[] => {
    if (!searchQuery.trim() || !activeScenario) { return []; }

    const categoryMap: Record<AIFamilyScenario, DevKnowledgeCategory> = {
      analysis: "architecture",
      prediction: "architecture",
      recommendation: "ai-integration",
      creation: "react",
      security: "devops",
      quality: "typescript",
      navigation: "ai-integration",
      orchestration: "architecture",
    };

    return searchKnowledge(searchQuery, { category: categoryMap[activeScenario] });
  }, [searchQuery, activeScenario]);

  // ── 场景列表 ──
  const scenarios = useMemo(() =>
    Object.entries(SCENARIO_LABELS).map(([key, value]) => ({
      id: key as AIFamilyScenario,
      ...value,
      memberId: SCENARIO_MEMBER_MAP[key as AIFamilyScenario],
      member: MEMBERS_MAP[SCENARIO_MEMBER_MAP[key as AIFamilyScenario]],
    })),
    []);

  // ── 选中家人详情 ──
  const selectedMember = useMemo(() => {
    if (!selectedMemberId) { return undefined; }
    return MEMBERS_MAP[selectedMemberId];
  }, [selectedMemberId]);

  // ── 选中场景对应的家人 ──
  const scenarioMember = useMemo(() => {
    if (!activeScenario) { return undefined; }
    return getMemberForScenario(activeScenario);
  }, [activeScenario, getMemberForScenario]);

  // ── 操作方法 ──

  /** 选择家人 */
  const selectMember = useCallback((memberId: string) => {
    setSelectedMemberId((prev) => prev === memberId ? null : memberId);
    const member = MEMBERS_MAP[memberId];
    if (member) {
      const scenario = Object.entries(SCENARIO_MEMBER_MAP).find(
        ([_, mid]) => mid === memberId
      )?.[0] as AIFamilyScenario | undefined;
      if (scenario) { setActiveScenario(scenario); }
    }
  }, []);

  /** 选择场景 */
  const selectScenario = useCallback((scenario: AIFamilyScenario) => {
    setActiveScenario(scenario);
    const memberId = SCENARIO_MEMBER_MAP[scenario];
    setSelectedMemberId(memberId);
  }, []);

  /** 发起协同任务 */
  const createCollaborationTask = useCallback((
    title: string,
    scenario: AIFamilyScenario,
    supportingScenarios?: AIFamilyScenario[]
  ): CollaborationTask => {
    const task: CollaborationTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      scenario,
      primaryMemberId: SCENARIO_MEMBER_MAP[scenario],
      supportingMemberIds: supportingScenarios?.map((s) => SCENARIO_MEMBER_MAP[s]) ?? [],
      status: "pending",
      createdAt: Date.now(),
    };
    setCollaborationTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  /** 执行快捷操作 */
  const executeQuickAction = useCallback((
    memberId: string,
    action: FamilyQuickAction
  ) => {
    setActiveAction(action);
    const member = MEMBERS_MAP[memberId];
    if (!member) { return; }

    switch (action) {
      case "call":
        selectMember(memberId);
        break;
      case "chat":
        selectMember(memberId);
        break;
      case "consult": {
        createCollaborationTask(
          `咨询 ${member.name}: ${searchQuery || "专业问题"}`,
          Object.entries(SCENARIO_MEMBER_MAP).find(
            ([_, mid]) => mid === memberId
          )?.[0] as AIFamilyScenario ?? "analysis"
        );
        break;
      }
      case "collaborate":
        createCollaborationTask(
          `协同 ${member.name}: 多维度分析`,
          Object.entries(SCENARIO_MEMBER_MAP).find(
            ([_, mid]) => mid === memberId
          )?.[0] as AIFamilyScenario ?? "analysis",
          ["analysis", "prediction"]
        );
        break;
    }

    setTimeout(() => setActiveAction(null), 500);
  }, [searchQuery, selectMember, createCollaborationTask]);

  /** 清除选择 */
  const clearSelection = useCallback(() => {
    setSelectedMemberId(null);
    setActiveScenario(null);
    setActiveAction(null);
  }, []);

  // ── 统计信息 ──
  const stats = useMemo(() => ({
    totalMembers: allMembers.length,
    onlineCount: allMembers.filter((m) => m.status === "online").length,
    idleCount: allMembers.filter((m) => m.status === "idle").length,
    speakingCount: allMembers.filter((m) => m.status === "speaking").length,
    totalContribution: allMembers.reduce((sum, m) => sum + m.contribution, 0),
    activeTasks: collaborationTasks.filter((t) => t.status === "active").length,
    pendingTasks: collaborationTasks.filter((t) => t.status === "pending").length,
  }), [allMembers, collaborationTasks]);

  return {
    // ── 数据 ──
    allMembers,
    selectedMember,
    selectedMemberId,
    activeScenario,
    scenarioMember,
    recommendedMembers,
    scenarios,
    collaborationTasks,
    knowledgeResults,
    stats,

    // ── 搜索 ──
    searchQuery,
    setSearchQuery,

    // ── 操作 ──
    selectMember,
    selectScenario,
    executeQuickAction,
    createCollaborationTask,
    clearSelection,
    activeAction,
  };
}
