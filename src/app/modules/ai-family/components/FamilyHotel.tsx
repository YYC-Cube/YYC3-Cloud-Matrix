/**
 * @file: FamilyHotel.tsx
 * @description: AI Family - 智慧酒店管理面板 (统一UI风格)
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-20
 * @status: active
 * @tags: [ai-family, hotel, dashboard]
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2, Users, MessageCircle, BarChart3, Mic, BookOpen,
  GraduationCap, ChevronRight, Activity, Zap, Shield, Star,
  Phone, Coffee, UtensilsCrossed, Sparkles, Heart,
} from "lucide-react";
import { GlassCard } from "../../shared/GlassCard";
import { FadeIn } from "./FadeIn";
import { useI18n } from "../../../hooks/useI18n";
import { NEON_CYAN, NEON_PINK, hexToRgb } from "./shared";

import { AIFamilyHotelManager } from "../../../lib/ai-family-hotel-manager";
import { getHotelVoiceService } from "../../../lib/hotel-voice-service";
import { getHotelKnowledgeBase } from "../../../lib/hotel-knowledge-base";
import {
  type MultiModelConversation,
} from "../../../lib/ai-family-hotel.types";
import { useFamilyMemberSlice } from "../store";
import {
  toHotelStaffCard,
  HOTEL_ROLE_LABELS,
  FAMILY_TO_HOTEL_ROLE,
} from "../../../lib/hotel-bridge";

type DashboardTab = "overview" | "staff" | "conversations" | "analytics" | "voice" | "knowledge";

interface StaffCardData {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: React.ElementType;
  roleKey: string;
  roleLabel: string;
  emoji: string;
  status: string;
  model: string;
  satisfaction: number;
  interactions: number;
  personality: string;
}

const TAB_CONFIG: { key: DashboardTab; icon: React.ElementType; labelKey: string }[] = [
  { key: "overview", icon: Activity, labelKey: "hotel.tabOverview" },
  { key: "staff", icon: Users, labelKey: "hotel.tabStaff" },
  { key: "conversations", icon: MessageCircle, labelKey: "hotel.tabConversations" },
  { key: "analytics", icon: BarChart3, labelKey: "hotel.tabAnalytics" },
  { key: "voice", icon: Mic, labelKey: "hotel.tabVoice" },
  { key: "knowledge", icon: BookOpen, labelKey: "hotel.tabKnowledge" },
];

const ROLE_ICON_MAP: Record<string, React.ElementType> = {
  "front-desk": Phone,
  concierge: Coffee,
  housekeeping: Shield,
  restaurant: UtensilsCrossed,
  manager: Star,
  "it-support": Zap,
  security: Shield,
};

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  online: { bg: "rgba(0,255,136,0.1)", text: "#00FF88", dot: "#00FF88" },
  busy: { bg: "rgba(255,180,0,0.1)", text: "#FFB400", dot: "#FFB400" },
  speaking: { bg: "rgba(255,180,0,0.1)", text: "#FFB400", dot: "#FFB400" },
  idle: { bg: "rgba(128,128,128,0.1)", text: "#808080", dot: "#808080" },
  offline: { bg: "rgba(128,128,128,0.1)", text: "#808080", dot: "#808080" },
};

const HOTEL_ROLE_EMOJI: Record<string, string> = {
  "front-desk": "🎫", "finance": "💰", "sales": "📊",
  "guest-relations": "🤝", "manager": "⭐", "security": "🛡️",
  "it-support": "💻", "event-coordinator": "🎉",
};

export function FamilyHotel() {
  const { t } = useI18n();
  const { members } = useFamilyMemberSlice();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const [manager] = useState(() => new AIFamilyHotelManager());
  const [voiceService] = useState(() => getHotelVoiceService());
  const [knowledgeBase] = useState(() => getHotelKnowledgeBase());

  const [conversations, setConversations] = useState<MultiModelConversation[]>([]);

  const loadInitialData = useCallback(() => {
    setConversations(manager.getAllConversations());
  }, [manager]);

  useEffect(() => {
    loadInitialData();
    const unsub = voiceService.on("result", (event) => {
      if (event.data && typeof event.data === "object" && "transcript" in event.data) {
        setTranscript(event.data.transcript);
      }
    });
    return () => unsub();
  }, [loadInitialData, voiceService]);

  // Derive staff cards from unified family members
  const staffList: StaffCardData[] = useMemo(() => members.map(m => {
    const hotelRole = FAMILY_TO_HOTEL_ROLE[m.id] || "front-desk";
    const hotelCard = toHotelStaffCard(m);
    return {
      id: m.id,
      name: m.name,
      shortName: m.shortName,
      color: m.color,
      icon: m.icon,
      roleKey: hotelRole,
      roleLabel: HOTEL_ROLE_LABELS[hotelRole] || hotelRole,
      emoji: HOTEL_ROLE_EMOJI[hotelRole] || "👤",
      status: m.status,
      model: m.modelAssignment.modelId,
      satisfaction: hotelCard.satisfactionScore,
      interactions: hotelCard.interactionCount,
      personality: hotelCard.personality,
    };
  }), [members]);

  const stats = useMemo(() => ({
    totalInteractions: staffList.reduce((s, c) => s + c.interactions, 0),
    avgSatisfaction: Math.round(staffList.reduce((s, c) => s + c.satisfaction, 0) / Math.max(staffList.length, 1)),
    activeStaff: staffList.filter(c => c.status === "online" || c.status === "busy" || c.status === "speaking").length,
    modelUsage: staffList.reduce((acc, c) => {
      acc[c.model] = (acc[c.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [staffList]);

  const _selectedStaff = staffList.find((s) => s.id === selectedStaffId);

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      voiceService.startListening();
      setIsListening(true);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-4 md:px-6 md:py-5"
      style={{ background: "transparent" }}
    >
      <FadeIn>
        {/* ═══ Page Header ═══ */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${NEON_CYAN}20, ${NEON_PINK}15)` }}
          >
            <Building2 className="w-5 h-5" style={{ color: NEON_CYAN }} />
          </div>
          <div>
            <h1 className="text-[0.95rem] font-semibold tracking-wide" style={{ color: NEON_CYAN }}>
              {t("hotel.title")}
            </h1>
            <p className="text-[0.68rem] mt-0.5" style={{ color: "rgba(196,220,240,0.45)" }}>
              {t("hotel.subtitle")}
            </p>
          </div>
        </div>

        {/* ═══ Tab Bar ═══ */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] transition-all duration-200"
                style={{
                  background: isActive ? `rgba(${hexToRgb(NEON_CYAN)},0.12)` : "rgba(8,25,55,0.5)",
                  border: `1px solid ${isActive ? `rgba(${hexToRgb(NEON_CYAN)},0.35)` : "rgba(0,180,255,0.1)"}`,
                  color: isActive ? NEON_CYAN : "rgba(196,220,240,0.55)",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* ═══ Overview Tab ═══ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: t("hotel.statTotalInteractions"), value: stats.totalInteractions.toLocaleString(), icon: MessageCircle, color: NEON_CYAN },
              { label: t("hotel.statAvgSatisfaction"), value: `${stats.avgSatisfaction}%`, icon: Heart, color: "#FF69B4" },
              { label: t("hotel.statActiveStaff"), value: `${stats.activeStaff}/${staffList.length}`, icon: Users, color: "#00FF88" },
              { label: t("hotel.statModelCount"), value: Object.keys(stats.modelUsage).length.toString(), icon: Sparkles, color: "#FFD700" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeIn key={stat.label} delay={i * 60}>
                  <GlassCard className="p-4" glowColor={`${stat.color}10`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                      <span className="text-[0.62rem]" style={{ color: "rgba(196,220,240,0.4)" }}>
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-[1.3rem] font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </GlassCard>
                </FadeIn>
              );
            })}

            {/* Model Usage */}
            <FadeIn delay={280}>
              <GlassCard className="p-4 lg:col-span-2">
                <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("hotel.modelDistribution")}
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.modelUsage).map(([model, count]) => (
                    <div key={model} className="flex items-center gap-3">
                      <span className="text-[0.68rem] w-28 truncate" style={{ color: "rgba(196,220,240,0.65)" }}>{model}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,212,255,0.08)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / staffList.length) * 100}%`,
                            background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_PINK})`,
                          }}
                        />
                      </div>
                      <span className="text-[0.64rem] w-6 text-right" style={{ color: "rgba(196,220,240,0.5)" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Quick Actions */}
            <FadeIn delay={320}>
              <GlassCard className="p-4 lg:col-span-2">
                <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                  <Zap className="w-3.5 h-3.5" />
                  {t("hotel.quickActions")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t("hotel.actionNewConversation"), icon: MessageCircle },
                    { label: t("hotel.actionVoiceInput"), icon: Mic },
                    { label: t("hotel.actionViewKnowledge"), icon: BookOpen },
                    { label: t("hotel.actionTraining"), icon: GraduationCap },
                  ].map((action) => {
                    const AIcon = action.icon;
                    const _targetTab: DashboardTab = action.label.includes("语音") ? "voice" : action.label.includes("对话") ? "conversations" : action.label.includes("知识") ? "knowledge" : "overview";
                    return (
                      <button
                        key={action.label}
                        onClick={() => action.label.includes("语音") ? toggleListening() : setActiveTab(
                          action.label.includes("对话") ? "conversations" :
                          action.label.includes("知识") ? "knowledge" :
                          "overview"
                        )}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[0.68rem] transition-all duration-200"
                        style={{
                          background: "rgba(0,212,255,0.05)",
                          border: "1px solid rgba(0,212,255,0.12)",
                          color: "rgba(196,220,240,0.7)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(0,212,255,0.12)";
                          e.currentTarget.style.borderColor = `rgba(${hexToRgb(NEON_CYAN)},0.35)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,212,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(0,212,255,0.12)";
                        }}
                      >
                        <AIcon className="w-3.5 h-3.5" style={{ color: NEON_CYAN }} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </FadeIn>
          </div>
        )}

        {/* ═══ Staff Tab ═══ */}
        {activeTab === "staff" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {staffList.map((staff, i) => {
              const RoleIcon = ROLE_ICON_MAP[staff.roleKey] || Users;
              const sc = STATUS_COLOR[staff.status] || STATUS_COLOR.offline;
              const isSelected = selectedStaffId === staff.id;
              return (
                <FadeIn key={staff.id} delay={i * 50}>
                  <GlassCard
                    className={`p-4 cursor-pointer transition-all duration-200 ${isSelected ? "ring-1" : ""}`}
                    glowColor={isSelected ? `${NEON_CYAN}20` : undefined}
                    onClick={() => setSelectedStaffId(isSelected ? null : staff.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{staff.emoji}</span>
                        <div>
                          <p className="text-[0.76rem] font-medium" style={{ color: "rgba(228,240,255,0.9)" }}>
                            {staff.name}
                          </p>
                          <p className="text-[0.62rem]" style={{ color: "rgba(196,220,240,0.45)" }}>
                            {staff.roleLabel}
                          </p>
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full mt-1"
                        style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.dot}40` }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 mb-2.5">
                      <RoleIcon className="w-3 h-3" style={{ color: NEON_CYAN }} />
                      <span className="text-[0.62rem]" style={{ color: "rgba(196,220,240,0.5)" }}>{staff.model}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[0.64rem]">
                      <div style={{ color: "rgba(196,220,240,0.5)" }}>
                        满意度 <span className="font-medium ml-1" style={{ color: sc.text }}>{staff.satisfaction}%</span>
                      </div>
                      <div style={{ color: "rgba(196,220,240,0.5)" }}>
                        交互 <span className="font-medium ml-1" style={{ color: NEON_CYAN }}>{staff.interactions}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                        <p className="text-[0.64rem] leading-relaxed" style={{ color: "rgba(196,220,240,0.55)" }}>
                          {staff.personality}
                        </p>
                      </div>
                    )}
                  </GlassCard>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* ═══ Conversations Tab ═══ */}
        {activeTab === "conversations" && (
          <div className="space-y-2.5 max-w-3xl">
            {conversations.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(0,212,255,0.25)" }} />
                <p className="text-[0.72rem]" style={{ color: "rgba(196,220,240,0.4)" }}>
                  {t("hotel.noConversations")}
                </p>
              </GlassCard>
            ) : conversations.map((conv, i) => (
              <FadeIn key={conv.conversationId} delay={i * 50}>
                <GlassCard className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.72rem] font-medium" style={{ color: "rgba(228,240,255,0.85)" }}>
                      {conv.summary || t("hotel.untitledConversation")}
                    </span>
                    <span className="text-[0.6rem] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,212,255,0.08)", color: "rgba(196,220,240,0.45)" }}
                    >
                      {conv.participants.length} {t("hotel.participants")}
                    </span>
                  </div>
                  <p className="text-[0.66rem] line-clamp-2" style={{ color: "rgba(196,220,240,0.45)" }}>
                    {conv.messages.slice(-1)[0]?.content?.text?.slice(0, 120) || ""}
                  </p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}

        {/* ═══ Voice Tab ═══ */}
        {activeTab === "voice" && (
          <div className="max-w-xl mx-auto space-y-4">
            <GlassCard className="p-6 text-center">
              <button
                onClick={toggleListening}
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isListening
                    ? `radial-gradient(circle, ${NEON_PINK}30, ${NEON_PINK}10)`
                    : `radial-gradient(circle, rgba(${hexToRgb(NEON_CYAN)},0.15), rgba(${hexToRgb(NEON_CYAN)},0.05))`,
                  border: `2px solid ${isListening ? NEON_PINK + "60" : "rgba(0,212,255,0.3)"}`,
                  boxShadow: isListening
                    ? `0 0 30px ${NEON_PINK}30`
                    : "0 0 20px rgba(0,212,255,0.1)",
                }}
              >
                <Mic className={`w-6 h-6 transition-colors duration-300`}
                  style={{ color: isListening ? NEON_PINK : NEON_CYAN }}
                />
              </button>
              <p className="mt-3 text-[0.76rem]" style={{ color: "rgba(228,240,255,0.8)" }}>
                {isListening ? t("hotel.listening") : t("hotel.tapToSpeak")}
              </p>
              {transcript && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                  <p className="text-[0.7rem] italic" style={{ color: "rgba(196,220,240,0.7)" }}>&ldquo;{transcript}&rdquo;</p>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ═══ Knowledge Tab ═══ */}
        {activeTab === "knowledge" && (
          <div className="max-w-2xl mx-auto space-y-2.5">
            {knowledgeBase.getCategories().map((cat, i: number) => (
              <FadeIn key={cat.id} delay={i * 50}>
                <GlassCard className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" style={{ color: NEON_CYAN }} />
                    <span className="text-[0.72rem]" style={{ color: "rgba(228,240,255,0.8)" }}>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(196,220,240,0.25)" }} />
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}

        {/* ═══ Analytics Tab ═══ */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <GlassCard className="p-4">
              <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                <BarChart3 className="w-3.5 h-3.5" />
                {t("hotel.staffPerformance")}
              </h3>
              <div className="space-y-2">
                {[...staffList]
                  .sort((a, b) => b.interactions - a.interactions)
                  .slice(0, 5)
                  .map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <span className="text-[0.6rem] w-4 text-center font-bold"
                        style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(196,220,240,0.3)" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[0.68rem]">{s.emoji} {s.name}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.08)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(s.interactions / Math.max(...staffList.map((st) => st.interactions), 1)) * 100}%`,
                            background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_PINK})`,
                          }}
                        />
                      </div>
                      <span className="text-[0.62rem]" style={{ color: "rgba(196,220,240,0.5)" }}>{s.interactions}</span>
                    </div>
                  ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                <Heart className="w-3.5 h-3.5" />
                {t("hotel.satisfactionTrend")}
              </h3>
              <div className="space-y-2">
                {[...staffList]
                  .sort((a, b) => b.satisfaction - a.satisfaction)
                  .slice(0, 5)
                  .map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <span className="text-[0.68rem]">{s.emoji} {s.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.08)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.satisfaction}%`,
                              background: s.satisfaction >= 90 ? "#00FF88" : s.satisfaction >= 70 ? NEON_CYAN : NEON_PINK,
                            }}
                          />
                        </div>
                        <span className="text-[0.62rem] w-8 text-right" style={{ color: "rgba(196,220,240,0.5)" }}>
                          {s.satisfaction}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
