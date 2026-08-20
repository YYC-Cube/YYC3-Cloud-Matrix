/**
 * @file: EmotionVisualizer.tsx
 * @description: 情感状态可视化组件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Smile, Frown, AlertTriangle, HelpCircle, Angry,
  Sparkles, Heart, Zap, Moon, Sun, TrendingUp,
} from "lucide-react";
import { GlassCard } from "../../shared/GlassCard";
import { useEmotionMusic } from "../hooks/useEmotionMusic";
import {
  EMOTION_MUSIC_MAPPINGS,
  type EmotionType,
  type EmotionState,
} from "../../../lib/EmotionMusicBridge";

const EMOTION_ICONS: Record<EmotionType, React.ElementType> = {
  happy: Sun,
  sad: Frown,
  anxious: AlertTriangle,
  confused: HelpCircle,
  angry: Angry,
  neutral: Smile,
  excited: Zap,
  calm: Moon,
  relaxed: Heart,
};

const EMOTION_LABELS: Record<EmotionType, string> = {
  happy: "开心",
  sad: "悲伤",
  anxious: "焦虑",
  confused: "困惑",
  angry: "愤怒",
  neutral: "平静",
  excited: "兴奋",
  calm: "宁静",
  relaxed: "放松",
};

interface EmotionVisualizerProps {
  compact?: boolean;
  showRecommendations?: boolean;
  onEmotionClick?: (emotion: EmotionState) => void;
  className?: string;
}

export function EmotionVisualizer({
  compact = false,
  showRecommendations = true,
  onEmotionClick,
  className = "",
}: EmotionVisualizerProps) {
  const {
    currentEmotion,
    emotionHistory,
    musicMapping,
    suggestAction: _suggestAction,
  } = useEmotionMusic({
    autoDetect: true,
    trackEmotionHistory: true,
  });

  const [animatedIntensity, setAnimatedIntensity] = useState(0);

  useEffect(() => {
    if (currentEmotion) {
      const targetIntensity = currentEmotion.intensity;
      const animate = () => {
        setAnimatedIntensity((prev) => {
          const diff = targetIntensity - prev;
          if (Math.abs(diff) < 0.01) {
            return targetIntensity;
          }
          return prev + diff * 0.1;
        });
      };
      const interval = setInterval(animate, 50);
      return () => clearInterval(interval);
    }
  }, [currentEmotion]);

  const emotionType = currentEmotion?.type ?? "neutral";
  const EmotionIcon = EMOTION_ICONS[emotionType];
  const mapping = musicMapping ?? EMOTION_MUSIC_MAPPINGS.neutral;

  const recentEmotions = useMemo(() => {
    return emotionHistory.slice(-5);
  }, [emotionHistory]);

  const emotionDistribution = useMemo(() => {
    const dist: Record<EmotionType, number> = {
      happy: 0, sad: 0, anxious: 0, confused: 0, angry: 0,
      neutral: 0, excited: 0, calm: 0, relaxed: 0,
    };
    emotionHistory.forEach((e) => {
      dist[e.type] += 1;
    });
    return Object.entries(dist)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [emotionHistory]);

  if (compact) {
    return (
      <button
        onClick={() => currentEmotion && onEmotionClick?.(currentEmotion)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${className}`}
        style={{
          background: `${mapping.color}15`,
          border: `1px solid ${mapping.color}40`,
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: `${mapping.color}25` }}
        >
          <EmotionIcon className="w-3.5 h-3.5" style={{ color: mapping.color }} />
        </div>
        <span className="text-white/80 text-xs">{EMOTION_LABELS[emotionType]}</span>
        {currentEmotion && (
          <span className="text-white/40 text-xs">
            {(currentEmotion.confidence * 100).toFixed(0)}%
          </span>
        )}
      </button>
    );
  }

  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-white/80 text-sm">情感感知</span>
        </div>
        {currentEmotion && (
          <span className="text-white/40 text-xs">
            {new Date(currentEmotion.timestamp).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${mapping.color}30 0%, transparent 70%)`,
            border: `2px solid ${mapping.color}50`,
            boxShadow: `0 0 20px ${mapping.color}20`,
          }}
        >
          <EmotionIcon
            className="w-8 h-8 transition-all duration-300"
            style={{
              color: mapping.color,
              transform: `scale(${0.8 + animatedIntensity * 0.4})`,
            }}
          />
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: `${mapping.color}20`,
              animationDuration: `${2 - animatedIntensity}s`,
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-lg font-medium">
              {EMOTION_LABELS[emotionType]}
            </span>
            {currentEmotion && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: `${mapping.color}20`,
                  color: mapping.color,
                }}
              >
                {(currentEmotion.confidence * 100).toFixed(0)}% 置信度
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm">{mapping.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/40 text-xs">情感强度</span>
          <span className="text-white/60 text-xs">
            {(animatedIntensity * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${animatedIntensity * 100}%`,
              background: `linear-gradient(90deg, ${mapping.color}60, ${mapping.color})`,
            }}
          />
        </div>
      </div>

      {showRecommendations && (
        <div className="border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white/60 text-xs">音乐推荐</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {mapping.preferredGenres.slice(0, 3).map((genre) => (
              <div
                key={genre}
                className="px-2 py-1.5 rounded-lg text-center"
                style={{
                  background: `${mapping.color}10`,
                  border: `1px solid ${mapping.color}20`,
                }}
              >
                <span className="text-white/70 text-xs capitalize">{genre}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white/[0.03]">
              <span className="text-white/40">节奏范围</span>
              <p className="text-white/70 mt-0.5">
                {mapping.tempoRange[0]}-{mapping.tempoRange[1]} BPM
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03]">
              <span className="text-white/40">能量范围</span>
              <p className="text-white/70 mt-0.5">
                {mapping.energyRange[0]}-{mapping.energyRange[1]}%
              </p>
            </div>
          </div>
        </div>
      )}

      {emotionDistribution.length > 1 && (
        <div className="border-t border-white/[0.06] pt-4 mt-4">
          <span className="text-white/40 text-xs mb-2 block">近期情感分布</span>
          <div className="flex gap-1">
            {emotionDistribution.map(([emotion, count]) => {
              const e = emotion as EmotionType;
              const m = EMOTION_MUSIC_MAPPINGS[e];
              const Icon = EMOTION_ICONS[e];
              return (
                <div
                  key={emotion}
                  className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg"
                  style={{ background: `${m.color}10` }}
                >
                  <Icon className="w-3 h-3" style={{ color: m.color }} />
                  <span className="text-white/50 text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentEmotions.length > 0 && (
        <div className="border-t border-white/[0.06] pt-4 mt-4">
          <span className="text-white/40 text-xs mb-2 block">情感历史</span>
          <div className="flex gap-1">
            {recentEmotions.map((emotion, index) => {
              const m = EMOTION_MUSIC_MAPPINGS[emotion.type];
              const Icon = EMOTION_ICONS[emotion.type];
              return (
                <div
                  key={`${emotion.timestamp}-${index}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: `${m.color}15`,
                    border: `1px solid ${m.color}30`,
                    opacity: 0.5 + (index / recentEmotions.length) * 0.5,
                  }}
                  title={`${EMOTION_LABELS[emotion.type]} (${(emotion.confidence * 100).toFixed(0)}%)`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default EmotionVisualizer;
