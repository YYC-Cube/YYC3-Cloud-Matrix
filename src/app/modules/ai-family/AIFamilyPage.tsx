/**
 * @file: AIFamilyPage.tsx
 * @description: AIFamilyPage.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Activity,
  ChevronRight,
  Clock,
  MessageCircle,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useClockMinutes } from "../../hooks/useClock";
import { useI18n } from "../../hooks/useI18n";
import { useFamilyMemberSlice } from "./store";
import type { UnifiedFamilyMember } from "./types";

// ======== 时钟布局扩展 ========

interface ClockMember extends UnifiedFamilyMember {
  angle: number;       // 在时钟环上的角度 (度)
  timeLabel: string;   // 对应时间刻度
}

const CLOCK_SLOTS: { angle: number; timeLabel: string }[] = [
  { angle: 0, timeLabel: "06:00" },
  { angle: 45, timeLabel: "07:30" },
  { angle: 90, timeLabel: "09:00" },
  { angle: 135, timeLabel: "10:30" },
  { angle: 180, timeLabel: "12:00" },
  { angle: 225, timeLabel: "13:30" },
  { angle: 270, timeLabel: "15:00" },
  { angle: 315, timeLabel: "16:30" },
];

// 兼容旧代码中对 title 字段的引用 (enTitle 映射)
function getTitle(m: ClockMember): string {
  return `${m.enTitle} · ${m.shortName}`;
}

// ======== 时钟逻辑 ========


/** 容器自适应尺寸 hook */
function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    const el = ref.current;
    if (!el) { return; }
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) { setSize({ width, height }); }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// ======== 日期格式化 ========
const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

function formatDateInfo(date: Date) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dayIdx = date.getDay(); // 0=日, 6=六
  const dayLabel = DAY_LABELS[dayIdx];
  const isWeekend = dayIdx === 0 || dayIdx === 6;
  return { dateStr: `${yy}/${mm}/${dd}`, dayLabel, isWeekend };
}

// ======== 主组件 ========

export function AIFamilyPage() {
  const { t } = useI18n();
  const time = useClockMinutes();
  const { members } = useFamilyMemberSlice();
  const [selectedMember, setSelectedMember] = useState<ClockMember | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: cW, height: cH } = useContainerSize(containerRef);

  // 将 store members 映射为带时钟位置的 ClockMember
  const clockMembers: ClockMember[] = useMemo(
    () => members.map((m, i) => ({ ...m, ...CLOCK_SLOTS[i] })),
    [members],
  );

  // Simulated speaking rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeaker((prev) => (prev + 1) % clockMembers.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [clockMembers.length]);

  // Clock hands
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const hourAngle = (hours * 30) + (minutes * 0.5) - 90;
  const minuteAngle = (minutes * 6) - 90;
  const secondAngleBase = (time.getSeconds() * 6) - 90;

  const timeStr = time.toLocaleTimeString("zh-CN", { hour12: false });
  const { dateStr, dayLabel, isWeekend } = formatDateInfo(time);

  // ===== 自适应尺寸计算 =====
  // 可用空间 = 容器短边，留出 top/bottom UI 的间距
  const usable = Math.min(cW, cH) - 80;        // 留边距
  const RING_RADIUS = Math.max(120, Math.min(usable * 0.38, 280));
  const scale = RING_RADIUS / 280;              // 相对于设计稿 280 的缩放因子
  const MEMBER_SIZE = Math.round(72 * scale);
  const CENTER_SIZE = Math.round(100 * scale);
  const SVG_SIZE = Math.round(RING_RADIUS * 2 + 100 * scale);
  const LED_SIZE = Math.max(8, Math.round(10 * scale));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, rgba(10,15,40,0.95) 0%, rgba(4,8,20,1) 60%, #020510 100%)",
        minHeight: "400px",
      }}
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial glow rings */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: RING_RADIUS * 2 + 120 * scale,
            height: RING_RADIUS * 2 + 120 * scale,
            border: "1px solid rgba(0,240,255,0.06)",
            boxShadow: "0 0 60px rgba(0,240,255,0.03)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: RING_RADIUS * 2 + 200 * scale,
            height: RING_RADIUS * 2 + 200 * scale,
            border: "1px solid rgba(191,0,255,0.04)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: RING_RADIUS * 2 - 40 * scale,
            height: RING_RADIUS * 2 - 40 * scale,
            border: "1px solid rgba(0,240,255,0.04)",
          }}
        />
      </div>

      {/* Clock tick marks */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      >
        <g transform={`translate(${SVG_SIZE / 2}, ${SVG_SIZE / 2})`}>
          {/* 60 minor ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isMajor = i % 5 === 0;
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const outerR = RING_RADIUS + 30 * scale;
            const innerR = isMajor ? RING_RADIUS + 8 * scale : RING_RADIUS + 18 * scale;
            return (
              <line
                key={`tick-${i}`}
                x1={Math.cos(angle) * innerR}
                y1={Math.sin(angle) * innerR}
                x2={Math.cos(angle) * outerR}
                y2={Math.sin(angle) * outerR}
                stroke={isMajor ? "rgba(0,240,255,0.4)" : "rgba(0,240,255,0.12)"}
                strokeWidth={isMajor ? 2 : 1}
              />
            );
          })}

          {/* Clock hands */}
          {/* Hour hand */}
          <line
            x1={0} y1={0}
            x2={Math.cos(hourAngle * Math.PI / 180) * (RING_RADIUS * 0.45)}
            y2={Math.sin(hourAngle * Math.PI / 180) * (RING_RADIUS * 0.45)}
            stroke="rgba(0,240,255,0.5)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1={0} y1={0}
            x2={Math.cos(minuteAngle * Math.PI / 180) * (RING_RADIUS * 0.6)}
            y2={Math.sin(minuteAngle * Math.PI / 180) * (RING_RADIUS * 0.6)}
            stroke="rgba(0,240,255,0.4)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Second hand */}
          <line
            x1={0} y1={0}
            x2={Math.cos(secondAngleBase * Math.PI / 180) * (RING_RADIUS * 0.7)}
            y2={Math.sin(secondAngleBase * Math.PI / 180) * (RING_RADIUS * 0.7)}
            stroke="rgba(255,0,110,0.6)"
            strokeWidth={1}
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx={0} cy={0} r={4 * scale} fill="#00F0FF" />

          {/* Holographic connection lines from center to members */}
          {clockMembers.map((member, i) => {
            const angle = (member.angle - 90) * (Math.PI / 180);
            const isActive = i === activeSpeaker;
            return (
              <line
                key={`conn-${member.id}`}
                x1={0} y1={0}
                x2={Math.cos(angle) * (RING_RADIUS - 20 * scale)}
                y2={Math.sin(angle) * (RING_RADIUS - 20 * scale)}
                stroke={isActive ? member.color : "rgba(191,0,255,0.15)"}
                strokeWidth={isActive ? 1.5 : 0.5}
                strokeDasharray={isActive ? "none" : "4 4"}
                style={{
                  filter: isActive ? `drop-shadow(0 0 6px ${member.color})` : "none",
                  transition: "all 0.6s ease",
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* ======== Center Brand Logo ======== */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ width: CENTER_SIZE, height: CENTER_SIZE }}
      >
        <div
          className="w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer"
          style={{
            background: "radial-gradient(circle, rgba(0,40,80,0.8) 0%, rgba(4,10,22,0.95) 70%)",
            border: "2px solid rgba(0,240,255,0.3)",
            boxShadow: "0 0 30px rgba(0,240,255,0.15), inset 0 0 20px rgba(0,240,255,0.05)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: `${Math.max(0.5, 0.65 * scale)}rem`, color: "#00F0FF", letterSpacing: "2px" }}>YYC³</span>
          <span style={{ fontSize: `${Math.max(0.35, 0.45 * scale)}rem`, color: "rgba(0,240,255,0.4)", marginTop: "2px" }}>AI Family</span>
        </div>
        {/* Time + Date display below center */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ top: CENTER_SIZE + 6, whiteSpace: "nowrap" }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: `${Math.max(0.55, 0.7 * scale)}rem`,
              color: "#00F0FF",
              textShadow: "0 0 10px rgba(0,240,255,0.4)",
              letterSpacing: "2px",
            }}
          >
            {timeStr}
          </span>
          <div
            className="font-mono flex items-center justify-center gap-1"
            style={{ marginTop: "3px" }}
          >
            <span
              style={{
                fontSize: `${Math.max(0.42, 0.52 * scale)}rem`,
                color: "rgba(0,240,255,0.35)",
                letterSpacing: "1px",
              }}
            >
              {dateStr}
            </span>
            <span
              style={{
                fontSize: `${Math.max(0.42, 0.52 * scale)}rem`,
                color: isWeekend ? "#FF006E" : "rgba(0,240,255,0.35)",
                textShadow: isWeekend ? "0 0 6px rgba(255,0,110,0.4)" : "none",
                letterSpacing: "1px",
              }}
            >
              {dayLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ======== AI Family Members on Clock Ring ======== */}
      {clockMembers.map((member, idx) => {
        const angleRad = (member.angle - 90) * (Math.PI / 180);
        const x = Math.cos(angleRad) * RING_RADIUS;
        const y = Math.sin(angleRad) * RING_RADIUS;
        const isSpeaking = idx === activeSpeaker;
        const isHovered = hoveredMember === member.id;
        const isSelected = selectedMember?.id === member.id;
        const Icon = member.icon;

        // LED 沿径向外侧放置：圆心→成员方向的外边缘
        const ledOffsetX = Math.cos(angleRad) * (MEMBER_SIZE / 2 + LED_SIZE / 2 - 1);
        const ledOffsetY = Math.sin(angleRad) * (MEMBER_SIZE / 2 + LED_SIZE / 2 - 1);

        return (
          <div
            key={member.id}
            className="absolute z-10 flex flex-col items-center"
            style={{
              left: `calc(50% + ${x}px - ${MEMBER_SIZE / 2}px)`,
              top: `calc(50% + ${y}px - ${MEMBER_SIZE / 2}px)`,
              width: MEMBER_SIZE,
            }}
          >
            {/* Member avatar */}
            <button
              onClick={() => setSelectedMember(isSelected ? null : member)}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              className="relative rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                width: MEMBER_SIZE,
                height: MEMBER_SIZE,
                background: `radial-gradient(circle, ${member.color}15 0%, rgba(4,10,22,0.9) 70%)`,
                border: `2px solid ${isSpeaking ? member.color : isHovered ? `${member.color}80` : `${member.color}30`}`,
                boxShadow: isSpeaking
                  ? `0 0 20px ${member.color}40, 0 0 40px ${member.color}15, inset 0 0 15px ${member.color}10`
                  : isHovered
                    ? `0 0 15px ${member.color}20`
                    : "none",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            >
              <Icon
                className="w-6 h-6"
                style={{
                  color: isSpeaking ? member.color : `${member.color}90`,
                  filter: isSpeaking ? `drop-shadow(0 0 8px ${member.color})` : "none",
                  transition: "all 0.3s ease",
                  width: Math.max(16, 24 * scale),
                  height: Math.max(16, 24 * scale),
                }}
              />

              {/* Speaking indicator LED — 沿圆径方向外侧 */}
              <div
                className="absolute rounded-full"
                style={{
                  width: LED_SIZE,
                  height: LED_SIZE,
                  left: MEMBER_SIZE / 2 + ledOffsetX - LED_SIZE / 2,
                  top: MEMBER_SIZE / 2 + ledOffsetY - LED_SIZE / 2,
                  background: isSpeaking ? "#FF006E" : member.status === "online" ? "rgba(0,255,136,0.4)" : "rgba(128,128,128,0.3)",
                  boxShadow: isSpeaking ? "0 0 8px #FF006E" : member.status === "online" ? "0 0 4px rgba(0,255,136,0.3)" : "none",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(0,0,0,0.4)",
                }}
              />

              {/* Pulse ring animation */}
              {isSpeaking && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${member.color}`,
                    animation: "ring-pulse 2s ease-out infinite",
                  }}
                />
              )}
            </button>

            {/* Member name */}
            <span
              className="mt-1 text-center truncate"
              style={{
                fontSize: `${Math.max(0.48, 0.6 * scale)}rem`,
                color: isSpeaking ? member.color : "rgba(192,220,240,0.6)",
                textShadow: isSpeaking ? `0 0 8px ${member.color}60` : "none",
                maxWidth: MEMBER_SIZE + 24,
                transition: "all 0.3s ease",
                letterSpacing: "0.5px",
              }}
            >
              {member.name}
            </span>

            {/* Time label */}
            <span
              style={{
                fontSize: `${Math.max(0.36, 0.45 * scale)}rem`,
                color: "rgba(0,240,255,0.25)",
                marginTop: "1px",
              }}
            >
              {member.timeLabel}
            </span>

            {/* Hover tooltip */}
            {isHovered && !isSelected && (
              <div
                className="absolute z-30 rounded-lg px-3 py-2"
                style={{
                  bottom: MEMBER_SIZE + 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(10,10,10,0.9)",
                  border: `1px solid ${member.color}40`,
                  backdropFilter: "blur(12px)",
                  whiteSpace: "nowrap",
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${member.color}10`,
                }}
              >
                <p style={{ fontSize: "0.6rem", color: member.color }}>{getTitle(member)}</p>
                <p className="mt-0.5 italic" style={{ fontSize: "0.52rem", color: "rgba(192,220,240,0.5)" }}>
                  「{member.quote}」
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* ======== Selected Member Detail Drawer ======== */}
      {selectedMember && (
        <MemberDetailDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {/* ======== Top-left title ======== */}
      <div className="absolute top-4 left-5 z-10">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#00F0FF]" />
          <span style={{ fontSize: "0.8rem", color: "#00F0FF", letterSpacing: "2px" }}>
            AI Family
          </span>
        </div>
        <p className="mt-1" style={{ fontSize: "0.55rem", color: "rgba(0,240,255,0.3)", letterSpacing: "1px" }}>
          八魂归一，云枢乃成
        </p>
      </div>

      {/* ======== Top-right stats ======== */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-3">
        <StatusBadge icon={Activity} label={t("aiFamily.online")} value="7/8" color="#00FF88" />
        <StatusBadge icon={Zap} label={t("aiFamily.activeTasks")} value="142" color="#FFD700" />
        <StatusBadge icon={Clock} label={t("aiFamily.uptime")} value="99.97%" color="#00BFFF" />
      </div>

      {/* ======== Bottom slogan ======== */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-center">
        <p style={{ fontSize: "0.55rem", color: "rgba(0,240,255,0.25)", letterSpacing: "3px" }}>
          亦师亦友亦伯乐 · 一言一语一协同
        </p>
        <p className="mt-1" style={{ fontSize: "0.45rem", color: "rgba(191,0,255,0.25)", letterSpacing: "1px" }}>
          Words Initiate Quadrants, Language Serves as Core for the Future
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0,240,255,0.15), inset 0 0 20px rgba(0,240,255,0.05); }
          50% { box-shadow: 0 0 50px rgba(0,240,255,0.25), inset 0 0 30px rgba(0,240,255,0.1); }
        }
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ======== Sub-components ========

function StatusBadge({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{
        background: "rgba(10,10,10,0.6)",
        border: "1px solid rgba(0,240,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Icon className="w-3 h-3" style={{ color }} />
      <div>
        <p style={{ fontSize: "0.45rem", color: "rgba(192,220,240,0.4)" }}>{label}</p>
        <p style={{ fontSize: "0.65rem", color, textShadow: `0 0 6px ${color}40` }}>{value}</p>
      </div>
    </div>
  );
}

function MemberDetailDrawer({ member, onClose }: { member: ClockMember; onClose: () => void }) {
  const Icon = member.icon;

  const metrics = useMemo(() => {
    const seed = member.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
    return {
      tasks: Math.floor(pseudoRandom * 500) + 100,
      latency: Math.floor(pseudoRandom * 80) + 20,
      accuracy: (95 + pseudoRandom * 4.5).toFixed(1),
      calls: Math.floor(pseudoRandom * 200) + 50,
    };
  }, [member.id]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: "rgba(0,0,0,0.3)" }} />
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: "380px",
          maxWidth: "90vw",
          background: "linear-gradient(180deg, rgba(8,15,35,0.98) 0%, rgba(4,8,20,0.98) 100%)",
          borderLeft: `1px solid ${member.color}25`,
          boxShadow: `-10px 0 60px rgba(0,0,0,0.5), 0 0 30px ${member.color}08`,
          backdropFilter: "blur(16px)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,180,255,0.15) transparent",
        }}
      >
        {/* Header */}
        <div className="relative shrink-0 p-6 pb-4" style={{ borderBottom: `1px solid ${member.color}15` }}>
          <button
            onClick={onClose}
            title="关闭"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[rgba(0,240,255,0.3)] hover:text-[#00F0FF] hover:bg-[rgba(0,240,255,0.08)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: 64,
                height: 64,
                background: `radial-gradient(circle, ${member.color}20 0%, rgba(4,10,22,0.9) 70%)`,
                border: `2px solid ${member.color}50`,
                boxShadow: `0 0 25px ${member.color}20`,
              }}
            >
              <Icon className="w-7 h-7" style={{ color: member.color }} />
            </div>

            <div>
              <h2 style={{ fontSize: "1rem", color: member.color, letterSpacing: "1px" }}>
                {member.name}
              </h2>
              <p className="mt-0.5" style={{ fontSize: "0.65rem", color: "rgba(192,220,240,0.5)" }}>
                {getTitle(member)}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div
                  className="rounded-full"
                  style={{
                    width: 8, height: 8,
                    background: member.status === "speaking" ? "#FF006E" : member.status === "online" ? "#00FF88" : "#808080",
                    boxShadow: member.status === "speaking" ? "0 0 6px #FF006E" : member.status === "online" ? "0 0 6px #00FF88" : "none",
                  }}
                />
                <span style={{ fontSize: "0.55rem", color: "rgba(192,220,240,0.4)" }}>
                  {member.status === "speaking" ? "发言中" : member.status === "online" ? "在线" : "待命"}
                </span>
                <span className="mx-1" style={{ color: "rgba(0,240,255,0.15)" }}>|</span>
                <Clock className="w-3 h-3" style={{ color: "rgba(0,240,255,0.25)" }} />
                <span style={{ fontSize: "0.55rem", color: "rgba(0,240,255,0.3)" }}>{member.timeLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div
          className="mx-6 mt-4 px-4 py-3 rounded-lg italic"
          style={{
            background: `${member.color}08`,
            borderLeft: `3px solid ${member.color}40`,
          }}
        >
          <p style={{ fontSize: "0.72rem", color: "rgba(192,220,240,0.7)", lineHeight: "1.6" }}>
            「{member.quote}」
          </p>
        </div>

        {/* Role */}
        <div className="px-6 mt-5">
          <SectionTitle label="角色定位" color={member.color} />
          <p className="mt-2" style={{ fontSize: "0.68rem", color: "rgba(192,220,240,0.6)", lineHeight: "1.6" }}>
            {member.role}
          </p>
        </div>

        {/* Responsibilities */}
        <div className="px-6 mt-5">
          <SectionTitle label="核心职责" color={member.color} />
          <div className="mt-2 space-y-2">
            {member.responsibilities.map((resp: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 shrink-0 mt-0.5" style={{ color: member.color }} />
                <span style={{ fontSize: "0.68rem", color: "rgba(192,220,240,0.6)", lineHeight: "1.5" }}>
                  {resp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Ability */}
        <div className="px-6 mt-5">
          <SectionTitle label="核心能力" color={member.color} />
          <div
            className="mt-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(0,40,80,0.2)",
              border: "1px solid rgba(0,180,255,0.08)",
            }}
          >
            <p className="font-mono" style={{ fontSize: "0.62rem", color: "rgba(0,240,255,0.5)", lineHeight: "1.5" }}>
              {member.coreAbility}
            </p>
          </div>
        </div>

        {/* Activity Metrics (mock) */}
        <div className="px-6 mt-5 mb-6">
          <SectionTitle label="运行指标" color={member.color} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <MetricCard label="今日处理" value={`${metrics.tasks}`} unit="tasks" color={member.color} />
            <MetricCard label="平均延迟" value={`${metrics.latency}`} unit="ms" color="#00BFFF" />
            <MetricCard label="准确率" value={`${metrics.accuracy}`} unit="%" color="#00FF88" />
            <MetricCard label="协作次数" value={`${metrics.calls}`} unit="calls" color="#BF00FF" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-6 pb-6 mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                window.location.hash = "#/ai-family/chat";
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
              style={{
                background: `${member.color}12`,
                border: `1px solid ${member.color}30`,
                color: member.color,
                fontSize: "0.68rem",
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              对话
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.hash = "#/ai-family/activities";
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
              style={{
                background: "rgba(0,40,80,0.2)",
                border: "1px solid rgba(0,180,255,0.12)",
                color: "rgba(0,240,255,0.5)",
                fontSize: "0.68rem",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              任务分配
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full" style={{ width: 6, height: 6, background: color }} />
      <span style={{ fontSize: "0.62rem", color: "rgba(0,240,255,0.5)", letterSpacing: "1px" }}>
        {label}
      </span>
    </div>
  );
}

function MetricCard({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string;
}) {
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        background: "rgba(0,40,80,0.15)",
        border: "1px solid rgba(0,180,255,0.06)",
      }}
    >
      <p style={{ fontSize: "0.5rem", color: "rgba(192,220,240,0.35)" }}>{label}</p>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span style={{ fontSize: "0.85rem", color, textShadow: `0 0 6px ${color}30` }}>{value}</span>
        <span style={{ fontSize: "0.45rem", color: "rgba(192,220,240,0.3)" }}>{unit}</span>
      </div>
    </div>
  );
}
