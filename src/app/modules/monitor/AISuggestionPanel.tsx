/**
 * @file: AISuggestionPanel.tsx
 * @description: AISuggestionPanel.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Activity, AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle,
  Loader2,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  ToggleLeft, ToggleRight,
  Users,
  Zap,
} from "lucide-react";
import { useContext, useState } from "react";
import { useAIFamilyNav } from "../ai-family/hooks/useAIFamilyNav";
import { useAISuggestion } from "../../hooks/useAISuggestion";
import { useI18n } from "../../hooks/useI18n";
import { ViewContext } from "../../lib/view-context";
import { ActionRecommender } from "./ActionRecommender";
import { GlassCard } from "../shared/GlassCard";
import { PatternAnalyzer } from "./PatternAnalyzer";
import { SDKChatPanel } from "./SDKChatPanel";

type AITab = "analysis" | "chat" | "family";

function formatTimeAgo(ts: number, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) { return t("common.justNow"); }
  if (min < 60) { return t("common.minutesAgo", { n: min }); }
  return t("common.hoursAgo", { n: Math.floor(min / 60) });
}

export function AISuggestionPanel() {
  const view = useContext(ViewContext);
  const isMobile = view?.isMobile ?? false;
  const { t } = useI18n();

  const {
    patterns,
    recommendations,
    overallHealth,
    isAnalyzing,
    lastAnalyzedAt,
    enabledAutoSuggestion,
    setEnabledAutoSuggestion,
    stats,
    runAnalysis,
    applyRecommendation,
    dismissRecommendation,
    dismissPattern,
    getRecommendationsForPattern,
  } = useAISuggestion();

  const {
    allMembers,
    selectedMember,
    selectedMemberId,
    activeScenario,
    recommendedMembers,
    scenarios,
    collaborationTasks,
    stats: familyStats,
    searchQuery,
    setSearchQuery,
    selectMember,
    selectScenario,
    executeQuickAction,
  } = useAIFamilyNav();

  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AITab>("analysis");

  const handleApply = async (recId: string) => {
    setApplyingId(recId);
    await applyRecommendation(recId);
    setApplyingId(null);
  };

  const displayedRecs = selectedPatternId
    ? getRecommendationsForPattern(selectedPatternId)
    : recommendations;

  const healthColor =
    overallHealth >= 80 ? "#00ff88" :
      overallHealth >= 60 ? "#ffaa00" :
        overallHealth >= 40 ? "#ff6600" : "#ff0044";

  return (
    <div className="space-y-4">
      {/* ======== Header ======== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>
              {t("ai.title")}
            </h2>
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
              {t("ai.subtitle")}
            </p>
          </div>
        </div>

        {/* Tab 切换 + 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* Tab 按钮 */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.15)" }}>
            <button
              onClick={() => setActiveTab("analysis")}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{
                fontSize: "0.72rem",
                background: activeTab === "analysis" ? "rgba(0,212,255,0.12)" : "transparent",
                color: activeTab === "analysis" ? "#00d4ff" : "rgba(0,212,255,0.4)",
              }}
              data-testid="tab-analysis"
            >
              <Activity className="w-3.5 h-3.5" />
              {t("sdk.analysisTab")}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{
                fontSize: "0.72rem",
                background: activeTab === "chat" ? "rgba(0,212,255,0.12)" : "transparent",
                color: activeTab === "chat" ? "#00d4ff" : "rgba(0,212,255,0.4)",
                borderLeft: "1px solid rgba(0,212,255,0.15)",
              }}
              data-testid="tab-chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {t("sdk.chatTab")}
            </button>
            <button
              onClick={() => setActiveTab("family")}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{
                fontSize: "0.72rem",
                background: activeTab === "family" ? "rgba(0,212,255,0.12)" : "transparent",
                color: activeTab === "family" ? "#00d4ff" : "rgba(0,212,255,0.4)",
                borderLeft: "1px solid rgba(0,212,255,0.15)",
              }}
              data-testid="tab-family"
            >
              <Users className="w-3.5 h-3.5" />
              {t("ai.familyTab") || "AI Family"}
            </button>
          </div>

          {/* 分析 Tab 的操作按钮 */}
          {activeTab === "analysis" && (
            <>
              <button
                onClick={() => setEnabledAutoSuggestion(!enabledAutoSuggestion)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] transition-all"
                style={{ fontSize: "0.68rem" }}
                data-testid="toggle-auto"
              >
                {enabledAutoSuggestion ? (
                  <ToggleRight className="w-4 h-4 text-[#00ff88]" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                {t("ai.autoAnalysis")}
              </button>

              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.15)] transition-all disabled:opacity-40"
                style={{ fontSize: "0.72rem" }}
                data-testid="run-analysis"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isAnalyzing ? t("ai.analyzing") : t("ai.reAnalyze")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ======== Tab: Analysis ======== */}
      {activeTab === "analysis" && (
        <>
          {/* Health + Stats */}
          <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}>
            <GlassCard className="p-4 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-2">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke="rgba(0,180,255,0.08)" strokeWidth="4"
                  />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={healthColor} strokeWidth="4"
                    strokeDasharray={`${overallHealth * 1.76} 176`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: "1rem", color: healthColor, fontFamily: "'Orbitron', monospace" }}>
                    {overallHealth}
                  </span>
                </div>
              </div>
              <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                {t("ai.systemHealth")}
              </p>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#ffaa00] mb-2" />
              <span className="text-[#e0f0ff]" style={{ fontSize: "1.2rem", fontFamily: "'Orbitron', monospace" }}>
                {stats.totalPatterns}
              </span>
              <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                {t("ai.anomalyPatterns")}
              </p>
              {stats.criticalCount > 0 && (
                <span className="text-[#ff0044] mt-0.5" style={{ fontSize: "0.58rem" }}>
                  {stats.criticalCount} {t("ai.severity.critical")}
                </span>
              )}
            </GlassCard>

            <GlassCard className="p-4 flex flex-col items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#00ff88] mb-2" />
              <span className="text-[#e0f0ff]" style={{ fontSize: "1.2rem", fontFamily: "'Orbitron', monospace" }}>
                {stats.totalRecommendations}
              </span>
              <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                {t("ai.pendingSuggestions")}
              </p>
              {stats.appliedCount > 0 && (
                <span className="text-[#00ff88] mt-0.5" style={{ fontSize: "0.58rem" }}>
                  {stats.appliedCount} {t("ai.applied")}
                </span>
              )}
            </GlassCard>

            <GlassCard className="p-4 flex flex-col items-center justify-center">
              <Activity className="w-6 h-6 text-[#00d4ff] mb-2" />
              <span className="text-[#e0f0ff]" style={{ fontSize: "0.72rem" }}>
                {lastAnalyzedAt ? formatTimeAgo(lastAnalyzedAt, t) : "--"}
              </span>
              <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                {t("ai.lastAnalysis")}
              </p>
            </GlassCard>
          </div>

          {/* Pattern + Recommendations */}
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
            <PatternAnalyzer
              patterns={patterns}
              selectedPatternId={selectedPatternId}
              onSelectPattern={(id) => setSelectedPatternId(id === selectedPatternId ? null : id)}
              onDismiss={dismissPattern}
            />
            <ActionRecommender
              recommendations={displayedRecs}
              isApplying={applyingId}
              onApply={handleApply}
              onDismiss={dismissRecommendation}
            />
          </div>
        </>
      )}

      {/* ======== Tab: Chat ======== */}
      {activeTab === "chat" && (
        <SDKChatPanel embedded />
      )}

      {/* ======== Tab: AI Family ======== */}
      {activeTab === "family" && (
        <div className="space-y-4">
          {/* 搜索栏 + 统计 */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.12)]">
                <Search className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("ai.familySearchPlaceholder") || "搜索家人能力、专业技能..."}
                  className="flex-1 bg-transparent border-none outline-none text-[#e0f0ff] placeholder:text-[rgba(0,212,255,0.3)]"
                  style={{ fontSize: "0.78rem" }}
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,255,136,0.06)] border border-[rgba(0,255,136,0.15)]">
                <span className="text-[#00ff88]" style={{ fontSize: "0.7rem", fontFamily: "'Orbitron', monospace" }}>
                  {familyStats.onlineCount}
                </span>
                <span className="text-[rgba(0,255,136,0.5)]" style={{ fontSize: "0.6rem" }}>在线</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)]">
                <span className="text-[#00d4ff]" style={{ fontSize: "0.7rem", fontFamily: "'Orbitron', monospace" }}>
                  {familyStats.totalMembers}
                </span>
                <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.6rem" }}>家人</span>
              </div>
            </div>

            {/* 场景快捷入口 — 九层业务执行层 */}
            <div className="mb-3">
              <p className="text-[rgba(0,212,255,0.35)] mb-2" style={{ fontSize: "0.65rem" }}>
                {t("ai.familyScenarios") || "场景导航 · 九层架构"}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {scenarios.map((s) => {
                  const isActive = activeScenario === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectScenario(s.id)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-all text-left"
                      style={{
                        fontSize: "0.65rem",
                        background: isActive ? `${s.member?.color}18` : "rgba(0,212,255,0.04)",
                        border: `1px solid ${isActive ? `${s.member?.color}35` : "rgba(0,212,255,0.1)"}`,
                        color: isActive ? (s.member?.color ?? "#00d4ff") : "rgba(0,212,255,0.5)",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem" }}>{s.icon}</span>
                      <span className="truncate">{s.zh}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* 8 位家人卡片网格 */}
          <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-4"}`}>
            {(searchQuery.trim() ? recommendedMembers : allMembers.map((m) => ({
              member: m,
              scenario: Object.entries({
                analysis: "thinker", prediction: "prophet", recommendation: "bolero",
                creation: "creative", security: "sentinel", quality: "master",
                navigation: "navigator", orchestration: "meta-oracle",
              }).find(([_, mid]) => mid === m.id)?.[0] as string ?? "analysis",
              isRecommended: false,
              status: m.status,
            }))).map((card) => {
              const m = card.member;
              const MemberIcon = m.icon;
              const isSelected = selectedMemberId === m.id;
              const statusColor =
                m.status === "online" ? "#00ff88" :
                  m.status === "speaking" ? "#FFD700" :
                    m.status === "idle" ? "#ffaa00" : "#666";

              return (
                <GlassCard
                  key={m.id}
                  className={`p-3 cursor-pointer transition-all hover:border-opacity-50 ${isSelected ? "border-opacity-60" : "border-opacity-20"
                    }`}
                  style={{
                    borderColor: isSelected ? m.color : undefined,
                    background: isSelected ? `${m.color}08` : undefined,
                  }}
                  onClick={() => selectMember(m.id)}
                >
                  {/* 头像 + 状态 */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                      style={{ background: `${m.color}18` }}
                    >
                      <MemberIcon className="w-4.5 h-4.5" style={{ color: m.color }} />
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#060e1f]"
                        style={{ backgroundColor: statusColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e0f0ff] truncate" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {m.shortName}
                      </p>
                      <p className="text-[rgba(0,212,255,0.35)] truncate" style={{ fontSize: "0.58rem" }}>
                        {m.enTitle}
                      </p>
                    </div>
                  </div>

                  {/* 座右铭 */}
                  <p className="text-[rgba(224,240,255,0.5)] line-clamp-2 mb-2" style={{ fontSize: "0.62rem" }}>
                    &ldquo;{m.quote}&rdquo;
                  </p>

                  {/* 核心能力标签 */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {m.expertise.slice(0, 2).map((exp) => (
                      <span
                        key={exp}
                        className="px-1.5 py-0.5 rounded text-[0.55rem]"
                        style={{
                          background: `${m.color}15`,
                          color: `${m.color}cc`,
                          border: `1px solid ${m.color}25`,
                        }}
                      >
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* 快捷操作按钮 */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[rgba(0,212,255,0.08)]">
                    <button
                      onClick={(e) => { e.stopPropagation(); executeQuickAction(m.id, "call"); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[0.55rem] transition-all hover:bg-[rgba(0,212,255,0.1)]"
                      style={{ color: "rgba(0,212,255,0.6)" }}
                      title="呼叫"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); executeQuickAction(m.id, "chat"); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[0.55rem] transition-all hover:bg-[rgba(0,212,255,0.1)]"
                      style={{ color: "rgba(0,212,255,0.6)" }}
                      title="私信"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); executeQuickAction(m.id, "consult"); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[0.55rem] transition-all hover:bg-[rgba(0,212,255,0.1)]"
                      style={{ color: "rgba(0,212,255,0.6)" }}
                      title="咨询"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); executeQuickAction(m.id, "collaborate"); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[0.55rem] transition-all hover:bg-[rgba(0,212,255,0.1)]"
                      style={{ color: "rgba(0,212,255,0.6)" }}
                      title="协同"
                    >
                      <Zap className="w-3 h-3" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* 选中家人详情面板 */}
          {selectedMember && (
            <GlassCard className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${selectedMember.color}15` }}
                >
                  {(() => {
                    const Icon = selectedMember.icon;
                    return <Icon className="w-7 h-7" style={{ color: selectedMember.color }} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                      {selectedMember.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[0.55rem]"
                      style={{
                        background: `${selectedMember.color}18`,
                        color: selectedMember.color,
                      }}
                    >
                      {selectedMember.enTitle}
                    </span>
                  </div>
                  <p className="text-[rgba(0,212,255,0.5)] mb-2" style={{ fontSize: "0.72rem" }}>
                    {selectedMember.role}
                  </p>
                  <p className="text-[rgba(224,240,255,0.6)] italic mb-3" style={{ fontSize: "0.72rem" }}>
                    &ldquo;{selectedMember.quote}&rdquo;
                  </p>

                  {/* 职责列表 */}
                  <div className="mb-3">
                    <p className="text-[rgba(0,212,255,0.35)] mb-1.5" style={{ fontSize: "0.62rem" }}>
                      核心职责
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.responsibilities.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-1 rounded-md text-[0.62rem] bg-[rgba(0,212,255,0.06)] text-[rgba(0,212,255,0.7)] border border-[rgba(0,212,255,0.12)]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 核心能力 + 统计 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.08)]">
                      <p className="text-[rgba(0,212,255,0.35)] mb-1" style={{ fontSize: "0.58rem" }}>核心能力</p>
                      <p className="text-[#e0f0ff]" style={{ fontSize: "0.68rem" }}>{selectedMember.coreAbility}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.08)]">
                      <p className="text-[rgba(0,212,255,0.35)] mb-1" style={{ fontSize: "0.58rem" }}>贡献分</p>
                      <p className="text-[#00d4ff]" style={{ fontSize: "0.9rem", fontFamily: "'Orbitron', monospace" }}>
                        {selectedMember.contribution.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* 操作按钮行 */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(0,212,255,0.1)]">
                    <button
                      onClick={() => executeQuickAction(selectedMember.id, "call")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.68rem] transition-all"
                      style={{
                        background: `${selectedMember.color}15`,
                        color: selectedMember.color,
                        border: `1px solid ${selectedMember.color}30`,
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      呼叫 {selectedMember.shortName}
                    </button>
                    <button
                      onClick={() => executeQuickAction(selectedMember.id, "collaborate")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff] text-[0.68rem] transition-all hover:bg-[rgba(0,212,255,0.15)]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      发起协同任务
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 协同任务队列 */}
          {collaborationTasks.length > 0 && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>
                  <Zap className="w-3.5 h-3.5 inline mr-1.5 text-[#FFD700]" />
                  {t("ai.familyTasks") || "协同任务队列"}
                </p>
                <span className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.6rem" }}>
                  {collaborationTasks.length} 个任务
                </span>
              </div>
              <div className="space-y-2">
                {collaborationTasks.slice(0, 5).map((task) => {
                  const member = allMembers.find((m) => m.id === task.primaryMemberId);
                  const MemberIcon = member?.icon;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.08)]"
                    >
                      {MemberIcon && <MemberIcon className="w-4 h-4" style={{ color: member?.color }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#e0f0ff] truncate" style={{ fontSize: "0.7rem" }}>{task.title}</p>
                        <p className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.58rem" }}>
                          {new Date(task.createdAt).toLocaleTimeString("zh-CN")}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[0.55rem]"
                        style={{
                          background:
                            task.status === "active" ? "rgba(0,212,255,0.1)" :
                              task.status === "completed" ? "rgba(0,255,136,0.1)" :
                                "rgba(255,170,0,0.1)",
                          color:
                            task.status === "active" ? "#00d4ff" :
                              task.status === "completed" ? "#00ff88" :
                                "#ffaa00",
                        }}
                      >
                        {task.status === "active" ? "执行中" :
                          task.status === "completed" ? "已完成" :
                            task.status === "pending" ? "等待中" : "失败"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
