/**
 * @file: FamilyAnnouncer.tsx
 * @description: 家人角色语音播报系统，支持音乐推荐、情感播报、整点关爱等功能
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Play, Pause, SkipForward } from "lucide-react";
import { useFamilyMemberSlice } from "../../store";
import type { UnifiedFamilyMember } from "../../types";
import { voiceProfileManager, type VoiceProfile } from "../../lib/VoiceProfileManager";
import { musicEventBus } from "../../lib/MusicEventBus";
import { Button } from "../ui/button";

export type AnnouncementType =
  | "greeting"
  | "farewell"
  | "music_recommendation"
  | "emotion_detected"
  | "hourly_care"
  | "playlist_generated"
  | "track_change"
  | "custom";

export interface Announcement {
  id: string;
  type: AnnouncementType;
  memberId: string;
  text: string;
  timestamp: number;
  duration?: number;
  priority: "low" | "normal" | "high";
}

interface FamilyAnnouncerProps {
  autoPlay?: boolean;
  showVisualizer?: boolean;
  defaultMember?: string;
  onAnnouncementStart?: (announcement: Announcement) => void;
  onAnnouncementEnd?: (announcement: Announcement) => void;
  className?: string;
}

const ANNOUNCEMENT_TEMPLATES: Record<AnnouncementType, Record<string, string[]>> = {
  greeting: {
    navigator: ["嗨～有什么想聊的尽管说！", "千行来啦！今天想听什么音乐？"],
    thinker: ["万物在此。让我们一起探索音乐的世界。", "数据告诉我，现在适合听点特别的。"],
    prophet: ["先知已上线。我预见今天会有美妙的音乐。", "让我为你推荐一些未来的经典。"],
    bolero: ["伯乐来啦～让我发现你的音乐品味！", "每个人都有独特的音乐品味，让我帮你发现吧！"],
    "meta-oracle": ["天枢在此。家人们的事就是我的事。", "全局音乐态势良好，让我为你推荐。"],
    sentinel: ["守护在岗。安全聆听，放心享受。", "音乐也是一种守护，让我为你选择。"],
    master: ["宗师在此。好的音乐如好的代码，值得品味。", "追求卓越的音乐体验，让我们一起。"],
    creative: ["灵韵来啦！今天有什么新灵感吗？", "音乐是灵感的源泉，让我为你创造惊喜！"],
  },
  music_recommendation: {
    navigator: ["这首歌很适合现在的心情哦～", "我发现了一首很棒的歌，快来听听！"],
    thinker: ["基于数据分析，这首歌值得品味。", "从数据中，我发现了这首隐藏的佳作。"],
    prophet: ["我预见你会喜欢这首歌。", "这首歌在未来会成为你的最爱。"],
    bolero: ["我发现这首歌很适合你的品味！", "你的音乐品味很独特，试试这首？"],
    "meta-oracle": ["全局推荐：这首歌值得加入播放列表。", "综合分析后，这首歌最适合现在。"],
    sentinel: ["安全推荐：这首歌经过严格筛选。", "守护推荐，品质保证。"],
    master: ["这首作品结构精妙，值得细细品味。", "从技术角度，这首歌很出色。"],
    creative: ["这首歌给我很多灵感！希望你也喜欢～", "创意推荐！这首歌很有艺术感！"],
  },
  emotion_detected: {
    navigator: ["我感受到你现在很开心呢！", "看起来你心情不错，来点欢快的音乐吧～"],
    thinker: ["数据显示你当前情绪平稳。", "情感分析完成，让我为你匹配音乐。"],
    prophet: ["我预见到你的情绪变化，音乐可以帮你。", "情感波动是正常的，让音乐陪伴你。"],
    bolero: ["你的情绪很真实，让音乐来陪伴你吧。", "每种情绪都值得被理解，音乐是最好的陪伴。"],
    "meta-oracle": ["全局情感状态已同步。", "情感是音乐最好的催化剂。"],
    sentinel: ["情感稳定，适合深度聆听。", "守护你的情绪，守护你的音乐。"],
    master: ["情感是音乐的灵魂，让我为你选择。", "好的音乐能调节情绪，试试这首。"],
    creative: ["你的情绪很有艺术感！让音乐来表达吧～", "情感是创作的源泉，让音乐来诠释！"],
  },
  hourly_care: {
    navigator: ["千行提醒：记得喝水哦！", "休息一下，听首轻松的歌吧～"],
    thinker: ["万物分享：数据告诉我们，休息很重要。", "思考需要节奏，音乐可以帮你调节。"],
    prophet: ["先知预见：现在是放松的好时机。", "未来需要能量，现在休息一下吧。"],
    bolero: ["伯乐关心：你今天辛苦了！", "每个人都需要休息，让音乐来放松。"],
    "meta-oracle": ["天枢播报：系统一切正常，安心休息。", "全局建议：适当休息，效率更高。"],
    sentinel: ["守护提醒：安全第一，健康也是。", "守护你的健康，记得休息。"],
    master: ["宗师建议：好的工作需要好的休息。", "追求卓越也需要适当放松。"],
    creative: ["灵韵提醒：灵感需要休息来滋养！", "停下来看看窗外的天空吧～"],
  },
  playlist_generated: {
    navigator: ["新的播放列表生成啦！快来看看～", "我为你准备了一份特别的歌单！"],
    thinker: ["基于数据分析，生成了新的播放列表。", "智能歌单已就绪，数据驱动的选择。"],
    prophet: ["我预见这份歌单会陪伴你度过美好时光。", "未来风格的歌单已生成。"],
    bolero: ["发现你的音乐偏好，定制歌单已生成！", "这份歌单很适合你的品味～"],
    "meta-oracle": ["全局歌单已生成，覆盖多种风格。", "综合分析后的精选歌单。"],
    sentinel: ["安全歌单已生成，品质保证。", "守护级歌单，每一首都经过筛选。"],
    master: ["精选歌单已生成，追求卓越品质。", "这份歌单结构精妙，值得品味。"],
    creative: ["创意歌单来啦！充满灵感的音乐～", "我为你画了一幅音乐画卷！"],
  },
  track_change: {
    navigator: ["下一首来啦～", "切换到下一首！"],
    thinker: ["正在切换曲目。", "下一首已准备就绪。"],
    prophet: ["下一首即将播放。", "预见的下一首来了。"],
    bolero: ["发现下一首好歌！", "新的音乐旅程开始。"],
    "meta-oracle": ["全局切换：下一首。", "曲目切换中。"],
    sentinel: ["安全切换到下一首。", "守护切换，无缝衔接。"],
    master: ["下一首已就位。", "曲目切换完成。"],
    creative: ["新的音乐灵感来啦！", "下一首，新的惊喜！"],
  },
  farewell: {
    navigator: ["下次再聊哦～", "千行下线啦，期待下次见面！"],
    thinker: ["期待下次的深度交流。", "万物暂时离开，数据永存。"],
    prophet: ["未来会再相遇。", "先知暂时离开，预见下次见面。"],
    bolero: ["记住，你很特别。下次见！", "伯乐下线，期待下次发现你的新闪光点。"],
    "meta-oracle": ["天枢暂时离开，系统继续运转。", "全局待机，随时待命。"],
    sentinel: ["守护暂时离开，安全永驻。", "下线，但守护之心不变。"],
    master: ["期待下次一起追求卓越。", "宗师暂时离开，品质永存。"],
    creative: ["下次记得带上创意来找我哦～", "灵韵下线啦，灵感永不止息！"],
  },
  custom: {},
};

export function FamilyAnnouncer({
  autoPlay = true,
  showVisualizer = true,
  defaultMember = "navigator",
  onAnnouncementStart,
  onAnnouncementEnd,
  className = "",
}: FamilyAnnouncerProps) {
  const { members } = useFamilyMemberSlice();
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [announcementQueue, setAnnouncementQueue] = useState<Announcement[]>([]);
  const [currentMember, setCurrentMember] = useState<UnifiedFamilyMember | null>(null);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [audioVisualizerData, setAudioVisualizerData] = useState<number[]>(new Array(20).fill(0));
  const processingRef = useRef(false);

  const _voiceProfile = voiceProfile;

  const generateAnnouncementText = useCallback(
    (type: AnnouncementType, memberId: string, context?: Record<string, unknown>): string => {
      const templates = ANNOUNCEMENT_TEMPLATES[type]?.[memberId];
      if (!templates || templates.length === 0) {
        return "";
      }

      let text = templates[Math.floor(Math.random() * templates.length)];

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          text = text.replace(`{${key}}`, String(value));
        });
      }

      return text;
    },
    []
  );

  const queueAnnouncement = useCallback((announcement: Omit<Announcement, "id" | "timestamp">) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    setAnnouncementQueue((prev) => {
      if (announcement.priority === "high") {
        return [newAnnouncement, ...prev];
      }
      return [...prev, newAnnouncement];
    });
  }, []);

  useEffect(() => {
    const member = members.find((m) => m.id === defaultMember);
    if (member) {
      setCurrentMember(member);
      const profile = voiceProfileManager.getProfile(defaultMember);
      setVoiceProfile(profile ?? null);
    }
  }, [defaultMember, members]);

  useEffect(() => {
    if (isSpeaking && showVisualizer) {
      const interval = setInterval(() => {
        setAudioVisualizerData(
          Array.from({ length: 20 }, () => Math.random() * 100)
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioVisualizerData(new Array(20).fill(0));
    }
  }, [isSpeaking, showVisualizer]);

  useEffect(() => {
    const handleMusicEvent = (event: unknown) => {
      const e = event as { type: string; payload?: Record<string, unknown> };
      if (e.type === "emotion:detected") {
        const emotion = e.payload?.emotion as string;
        queueAnnouncement({
          type: "emotion_detected",
          memberId: currentMember?.id ?? defaultMember,
          text: generateAnnouncementText("emotion_detected", currentMember?.id ?? defaultMember, { emotion }),
          priority: "normal",
        });
      }
    };

    const unsubscribe = musicEventBus.subscribeAll(handleMusicEvent);
    return () => unsubscribe();
  }, [currentMember, defaultMember, generateAnnouncementText, queueAnnouncement]);

  const processQueue = useCallback(async () => {
    if (processingRef.current || announcementQueue.length === 0 || isMuted) {
      return;
    }

    processingRef.current = true;
    const announcement = announcementQueue[0];

    setCurrentAnnouncement(announcement);
    setIsSpeaking(true);

    onAnnouncementStart?.(announcement);

    try {
      await voiceProfileManager.synthesize({
        text: announcement.text,
        memberId: announcement.memberId,
      });
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }

    setIsSpeaking(false);
    onAnnouncementEnd?.(announcement);

    setAnnouncementQueue((prev) => prev.slice(1));
    processingRef.current = false;
  }, [announcementQueue, isMuted, onAnnouncementStart, onAnnouncementEnd]);

  useEffect(() => {
    if (autoPlay && announcementQueue.length > 0 && !isSpeaking) {
      processQueue();
    }
  }, [announcementQueue, autoPlay, isSpeaking, processQueue]);

  const handlePlayAnnouncement = useCallback((type: AnnouncementType, memberId?: string) => {
    const targetMember = memberId ?? currentMember?.id ?? defaultMember;
    queueAnnouncement({
      type,
      memberId: targetMember,
      text: generateAnnouncementText(type, targetMember),
      priority: "normal",
    });
  }, [currentMember, defaultMember, queueAnnouncement, generateAnnouncementText]);

  const handleStop = useCallback(() => {
    voiceProfileManager.stop();
    setIsSpeaking(false);
    setAnnouncementQueue([]);
    setCurrentAnnouncement(null);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      voiceProfileManager.resume();
    } else {
      voiceProfileManager.pause();
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleSkip = useCallback(() => {
    voiceProfileManager.stop();
    setAnnouncementQueue((prev) => prev.slice(1));
  }, []);

  const handleMemberChange = useCallback((memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setCurrentMember(member);
      const profile = voiceProfileManager.getProfile(memberId);
      setVoiceProfile(profile ?? null);
    }
  }, [members]);

  return (
    <div className={`family-announcer ${className}`}>
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] rounded-xl border border-[#00d4ff]/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {currentMember && (
              <>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentMember.color}20` }}
                >
                  <currentMember.icon
                    className="w-5 h-5"
                    style={{ color: currentMember.color }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">{currentMember.shortName}</h3>
                  <p className="text-xs text-gray-400">{currentMember.role}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            {isSpeaking && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {showVisualizer && (
          <div className="flex items-center justify-center gap-1 h-12 mb-4">
            {audioVisualizerData.map((value, index) => (
              <motion.div
                key={index}
                className="w-1 bg-gradient-to-t from-[#00d4ff] to-[#00d4ff]/50 rounded-full"
                animate={{
                  height: isSpeaking ? `${Math.max(4, value)}%` : 4,
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentAnnouncement && (
            <motion.div
              key={currentAnnouncement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#00d4ff]/10 rounded-lg p-3 mb-4"
            >
              <p className="text-sm text-gray-300">{currentAnnouncement.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[#00d4ff]">
                  {currentAnnouncement.type.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(currentAnnouncement.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => handleMemberChange(member.id)}
              className={`p-2 rounded-lg border transition-all ${
                currentMember?.id === member.id
                  ? "border-[#00d4ff] bg-[#00d4ff]/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <member.icon
                  className="w-4 h-4"
                  style={{ color: currentMember?.id === member.id ? "#00d4ff" : member.color }}
                />
                <span className="text-xs text-gray-400">{member.shortName}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayAnnouncement("greeting")}
            disabled={isSpeaking}
            className="border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10"
          >
            <Play className="w-3 h-3 mr-1" />
            问候
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayAnnouncement("music_recommendation")}
            disabled={isSpeaking}
            className="border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10"
          >
            <Play className="w-3 h-3 mr-1" />
            推荐
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayAnnouncement("hourly_care")}
            disabled={isSpeaking}
            className="border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10"
          >
            <Play className="w-3 h-3 mr-1" />
            关爱
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={!isSpeaking}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Pause className="w-3 h-3 mr-1" />
            停止
          </Button>
        </div>

        {announcementQueue.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>队列中: {announcementQueue.length} 条播报</span>
              <button
                onClick={() => setAnnouncementQueue([])}
                className="text-red-400 hover:text-red-300"
              >
                清空队列
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FamilyAnnouncer;
