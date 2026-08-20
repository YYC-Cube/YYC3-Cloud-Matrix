/**
 * @file: FamilyMusic.tsx
 * @description: FamilyMusic.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Brain,
  ExternalLink,
  Heart,
  LayoutGrid,
  ListMusic,
  MessageCircleHeart,
  Mic,
  MoreHorizontal,
  Music,
  Music2,
  Newspaper,
  Pause,
  Play,
  Plus,
  Repeat,
  Rss,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Upload,
  Volume2, VolumeX,
  Wand2,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAudioEngine, type AudioTrack } from "../hooks/useAudioEngine";
import { useEmotionMusic } from "../hooks/useEmotionMusic";
import musicEventBus, { type MusicCommand } from "../../../lib/MusicEventBus";
import smartPlaylistGenerator, { type PlaylistConfig, type TrackInfo } from "../../../lib/SmartPlaylistGenerator";
import { type ParsedCommand } from "../../../lib/VoiceCommandParser";
import { DMUSIC_PHOTOS, DMUSIC_VIDEOS, MUSIC_LIBRARY, type MusicTrack } from "../../../lib/dmusic-resources";
import { useFamilySettingsSlice } from "../store/family-settings-slice";
import { GlassCard } from "../../shared/GlassCard";
import { CoverFlow, type MusicTrack as CoverFlowTrack } from "./CoverFlow";
import { CreationStudio } from "./CreationStudio";
import { type EmotionType } from "./EmotionRipple";
import { EmotionVisualizer } from "./EmotionVisualizer";
import { FadeIn } from "./FadeIn";
import { FamilyPageHeader } from "./FamilyPageHeader";
import { MVPlayerOverlay, VinylPhotoPlayer } from "./VinylPhotoPlayer";
import { VoiceMusicControlPanel } from "./VoiceMusicControlPanel";
import {
  FamilyAnthemPlayer,
  SongUploadZone,
  createCareLanguageEngine,
  type CareResponse
} from "./ai-family-local";

const EMOTION_COLORS: Record<string, string> = {
  happy: "#FFD700",
  sad: "#4169E1",
  energetic: "#FF4500",
  calm: "#00CED1",
  love: "#FF69B4",
  neutral: "#9370DB",
};

const NEWS_ITEMS = [
  { id: "n1", title: "OpenAI 发布 GPT-5 技术报告，推理能力大幅跃升", source: "AI前沿", time: "30分钟前", category: "AI", color: "#00d4ff" },
  { id: "n2", title: "DeepSeek V3 开源模型性能超越 Claude 3.5", source: "开源社区", time: "1小时前", category: "开源", color: "#00FF88" },
  { id: "n3", title: "英伟达发布 Blackwell Ultra 芯片，推理性能翻倍", source: "硬件资讯", time: "2小时前", category: "硬件", color: "#FFD700" },
  { id: "n4", title: "React 20 正式发布：Server Components 全面稳定", source: "前端周刊", time: "3小时前", category: "前端", color: "#00BFFF" },
  { id: "n5", title: "智谱 AI 推出 GLM-5 系列模型，支持超长上下文", source: "国内AI", time: "4小时前", category: "AI", color: "#BF00FF" },
  { id: "n6", title: "Kubernetes 2.0 路线图公布：AI工作负载原生支持", source: "云原生", time: "5小时前", category: "架构", color: "#FF7043" },
  { id: "n7", title: "全球 AI 安全峰会达成共识：建立统一评估标准", source: "行业动态", time: "6小时前", category: "安全", color: "#FF6B6B" },
  { id: "n8", title: "Rust 在系统编程领域市场份额突破15%", source: "编程语言", time: "昨天", category: "语言", color: "#E8E8E8" },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatProgress(currentTime: number, _duration: number): string {
  const m = Math.floor(currentTime / 60);
  const s = Math.floor(currentTime % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FamilyMusic() {
  const [activeTab, setActiveTab] = useState<"music" | "news">("music");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<ParsedCommand | null>(null);
  const [showEmotionPanel, setShowEmotionPanel] = useState(false);
  const [smartPlaylist, setSmartPlaylist] = useState<PlaylistConfig | null>(null);
  const [viewMode, setViewMode] = useState<"coverflow" | "list">("list");
  const [showCreationStudio, setShowCreationStudio] = useState(false);
  const [showMVPlayer, setShowMVPlayer] = useState(false);
  const [showMyWorks, setShowMyWorks] = useState(false);
  const { musicWorks, removeMusicWork } = useFamilySettingsSlice();
  const [playlist, setPlaylist] = useState<MusicTrack[]>(MUSIC_LIBRARY);

  const [showAnthemPlayer, setShowAnthemPlayer] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showAddTracks, setShowAddTracks] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnthemModal, setShowAnthemModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [musicSearch, setMusicSearch] = useState("");
  const [careResponse, setCareResponse] = useState<CareResponse | null>(null);

  interface UploadedSong {
    id?: string;
    title: string;
    url?: string;
    artist?: string;
    duration?: number;
  }
  const [uploadedSongs, setUploadedSongs] = useState<UploadedSong[]>([]);

  const careEngine = useMemo(() => createCareLanguageEngine({
    founderExperienceYears: 18,
    wisdomCorpusSize: 300000,
    personality: ['温暖', '专业', '洞察', '真诚'],
    defaultStyle: 'gentle',
    enableMusicIntegration: true,
    enableWisdomQuotes: true,
  }), []);

  const currentTrackData = playlist[currentTrackIndex];

  const audioTrack: AudioTrack = useMemo(() => {
    if (!currentTrackData) {
      return {
        id: "empty",
        title: "无歌曲",
        artist: "请选择歌曲",
        duration: 180,
        color: "#9370DB",
      };
    }
    return {
      id: currentTrackData.id,
      title: currentTrackData.title,
      artist: currentTrackData.artist,
      duration: currentTrackData.duration,
      color: EMOTION_COLORS[currentTrackData.emotion] || "#9370DB",
      audioUrl: currentTrackData.audioUrl,
    };
  }, [currentTrackData]);

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    frequencyData: _frequencyData,
    audioEnergy,
    bassEnergy: _bassEnergy,
    audioMode: _audioMode,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    loadTrack,
  } = useAudioEngine({
    track: audioTrack,
    initialVolume: 0.75,
    onTrackEnd: () => {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    },
  });

  const coverFlowTracks: CoverFlowTrack[] = useMemo(() => {
    return playlist.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      albumCover: t.coverUrl,
      color: EMOTION_COLORS[t.emotion] || "#9370DB",
    }));
  }, [playlist]);

  const selectedMusicTrack = useMemo(() => {
    return coverFlowTracks[currentTrackIndex] || null;
  }, [coverFlowTracks, currentTrackIndex]);

  const {
    emotionHistory,
  } = useEmotionMusic({
    autoDetect: true,
    trackEmotionHistory: true,
  });

  const _currentEmotionType: EmotionType = useMemo(() => {
    if (!currentTrackData) { return "neutral"; }
    const emotionMap: Record<string, EmotionType> = {
      happy: "happy",
      sad: "sad",
      energetic: "energetic",
      calm: "calm",
      love: "happy",
      neutral: "neutral",
    };
    return emotionMap[currentTrackData.emotion] || "neutral";
  }, [currentTrackData]);

  const handleVoiceCommand = useCallback((command: ParsedCommand) => {
    setLastVoiceCommand(command);

    setTimeout(() => {
      setLastVoiceCommand(null);
    }, 3000);
  }, []);

  const handleCoverFlowSelect = useCallback((track: CoverFlowTrack) => {
    const index = playlist.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      setCurrentTrackIndex(index);
      const selectedTrack = playlist[index];
      const newAudioTrack: AudioTrack = {
        id: selectedTrack.id,
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        duration: selectedTrack.duration,
        color: EMOTION_COLORS[selectedTrack.emotion] || "#9370DB",
        audioUrl: selectedTrack.audioUrl,
      };
      loadTrack(newAudioTrack);
      play();
    }
  }, [playlist, loadTrack, play]);

  const generateSmartPlaylist = useCallback(() => {
    const tracks: TrackInfo[] = playlist.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      duration: formatDuration(t.duration),
      color: EMOTION_COLORS[t.emotion] || "#9370DB",
      genre: t.genre || "pop",
      tempo: t.emotion === "energetic" ? 140 : t.emotion === "calm" ? 60 : 100,
      energy: t.emotion === "energetic" ? 80 : t.emotion === "calm" ? 20 : 50,
      valence: t.emotion === "happy" ? 75 : t.emotion === "sad" ? 30 : 50,
    }));

    const generatedPlaylist = smartPlaylistGenerator.generatePlaylist(tracks, emotionHistory, {
      maxTracks: 8,
      shuffle: false,
    });

    setSmartPlaylist(generatedPlaylist);
  }, [playlist, emotionHistory]);

  const executeCommand = useCallback((cmd: MusicCommand) => {
    switch (cmd) {
      case "play":
        play();
        break;
      case "pause":
        pause();
        break;
      case "toggle":
        togglePlayPause();
        break;
      case "next":
        setCurrentTrackIndex((prev) => {
          const next = (prev + 1) % playlist.length;
          const selectedTrack = playlist[next];
          const newAudioTrack: AudioTrack = {
            id: selectedTrack.id,
            title: selectedTrack.title,
            artist: selectedTrack.artist,
            duration: selectedTrack.duration,
            color: EMOTION_COLORS[selectedTrack.emotion] || "#9370DB",
            audioUrl: selectedTrack.audioUrl,
          };
          loadTrack(newAudioTrack);
          play();
          return next;
        });
        break;
      case "previous":
        setCurrentTrackIndex((prev) => {
          const next = (prev - 1 + playlist.length) % playlist.length;
          const selectedTrack = playlist[next];
          const newAudioTrack: AudioTrack = {
            id: selectedTrack.id,
            title: selectedTrack.title,
            artist: selectedTrack.artist,
            duration: selectedTrack.duration,
            color: EMOTION_COLORS[selectedTrack.emotion] || "#9370DB",
            audioUrl: selectedTrack.audioUrl,
          };
          loadTrack(newAudioTrack);
          play();
          return next;
        });
        break;
      case "volume_up":
        setVolume(Math.min(1, volume + 0.1));
        break;
      case "volume_down":
        setVolume(Math.max(0, volume - 0.1));
        break;
      case "mute":
        setVolume(0);
        break;
      case "unmute":
        setVolume(0.75);
        break;
      case "like":
        if (currentTrackData) {
          setLiked((prev) => new Set(prev).add(currentTrackData.id));
        }
        break;
      case "shuffle":
        break;
      default:
        break;
    }
  }, [play, pause, togglePlayPause, loadTrack, setVolume, volume, currentTrackData, playlist]);

  useEffect(() => {
    const unsubscribe = musicEventBus.subscribe("music:command", (event) => {
      if (event.type === "music:command") {
        executeCommand(event.payload.command);
      }
    });

    return () => unsubscribe();
  }, [executeCommand]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const currentTrackColor = currentTrackData ? (EMOTION_COLORS[currentTrackData.emotion] || "#9370DB") : "#9370DB";

  return (
    <div className="min-h-full pb-8">
      <FamilyPageHeader
        icon={activeTab === "music" ? Music : Newspaper}
        iconColor={activeTab === "music" ? "#FFD700" : "#00d4ff"}
        title={activeTab === "music" ? "音乐空间" : "行业资讯"}
        subtitle={activeTab === "music" ? "沉浸专注 · AI 智能推荐" : "AI 精选行业前沿动态"}
      />

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-4 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("music")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${activeTab === "music" ? "bg-[rgba(255,215,0,0.1)] text-[#FFD700] border border-[rgba(255,215,0,0.2)]" : "text-[rgba(224,240,255,0.4)]"}`}
            style={{ fontSize: "0.78rem" }}
          >
            <Music className="w-3.5 h-3.5" /> 音乐
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${activeTab === "news" ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]" : "text-[rgba(224,240,255,0.4)]"}`}
            style={{ fontSize: "0.78rem" }}
          >
            <Newspaper className="w-3.5 h-3.5" /> 资讯
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {activeTab === "music" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 播放器 */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6" glowColor={`${currentTrackColor}08`}>
                {/* AI 音乐助手控制栏 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-white/60 text-xs">AI 音乐助手</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowEmotionPanel(!showEmotionPanel)}
                      className={`p-2 rounded-lg transition-all ${showEmotionPanel
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-white/[0.04] text-white/40 hover:text-white/60"
                        }`}
                      title="情感感知"
                    >
                      <Brain className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowVoicePanel(!showVoicePanel)}
                      className={`p-2 rounded-lg transition-all ${showVoicePanel
                        ? "bg-[rgba(0,212,255,0.2)] text-cyan-300"
                        : "bg-white/[0.04] text-white/40 hover:text-white/60"
                        }`}
                      title="语音控制"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 情感感知面板 */}
                {showEmotionPanel && (
                  <div className="mb-4">
                    <EmotionVisualizer compact={false} showRecommendations />
                  </div>
                )}

                {/* 语音控制面板 */}
                {showVoicePanel && (
                  <div className="mb-4">
                    <VoiceMusicControlPanel
                      compact
                      onCommand={handleVoiceCommand}
                    />
                    {lastVoiceCommand && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300 text-xs">
                            已执行: {lastVoiceCommand.command}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <VinylPhotoPlayer
                  photos={DMUSIC_PHOTOS}
                  coverUrl={currentTrackData?.coverUrl}
                  isPlaying={isPlaying}
                  audioEnergy={audioEnergy}
                  trackTitle={currentTrackData?.title}
                  artist={currentTrackData?.artist}
                  hasVideo={!!currentTrackData?.videoUrl || DMUSIC_VIDEOS.length > 0}
                  onOpenVideo={() => setShowMVPlayer(true)}
                />

                <div className="text-center mb-4">
                  <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.95rem" }}>{currentTrackData.title}</h3>
                  <p className="text-[rgba(224,240,255,0.4)] mt-1" style={{ fontSize: "0.72rem" }}>{currentTrackData.artist}</p>
                </div>

                <div className="mb-4">
                  <div className="h-1 rounded-full bg-[rgba(0,40,80,0.3)] cursor-pointer overflow-hidden" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickProgress = (e.clientX - rect.left) / rect.width;
                    seek(clickProgress * duration);
                  }}>
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${currentTrackColor}, ${currentTrackColor}60)` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[rgba(224,240,255,0.2)]" style={{ fontSize: "0.55rem" }}>{formatProgress(currentTime, duration)}</span>
                    <span className="text-[rgba(224,240,255,0.2)]" style={{ fontSize: "0.55rem" }}>{formatDuration(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-5">
                  <Shuffle className="w-4 h-4 text-[rgba(224,240,255,0.25)] cursor-pointer hover:text-[rgba(224,240,255,0.6)] transition-colors" />
                  <SkipBack className="w-5 h-5 text-[rgba(224,240,255,0.5)] cursor-pointer hover:text-[#e0f0ff] transition-colors" onClick={() => executeCommand("previous")} />
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{ background: `${currentTrackColor}20`, border: `2px solid ${currentTrackColor}50`, boxShadow: isPlaying ? `0 0 20px ${currentTrackColor}20` : "none" }}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" style={{ color: currentTrackColor }} /> : <Play className="w-5 h-5 ml-0.5" style={{ color: currentTrackColor }} />}
                  </button>
                  <SkipForward className="w-5 h-5 text-[rgba(224,240,255,0.5)] cursor-pointer hover:text-[#e0f0ff] transition-colors" onClick={() => executeCommand("next")} />
                  <Repeat className="w-4 h-4 text-[rgba(224,240,255,0.25)] cursor-pointer hover:text-[rgba(224,240,255,0.6)] transition-colors" />
                </div>

                <div className="flex items-center gap-2 mt-4 px-4">
                  <button onClick={() => setVolume(volume > 0 ? 0 : 0.75)} className="text-[rgba(224,240,255,0.3)]">
                    {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 h-1 rounded-full bg-[rgba(0,40,80,0.3)] cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVolume((e.clientX - rect.left) / rect.width);
                  }}>
                    <div className="h-full rounded-full bg-[rgba(0,212,255,0.4)]" style={{ width: `${volume * 100}%` }} />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* 播放列表 */}
            <div className="lg:col-span-2">
              {/* 搜索 + 视图切换 + 操作栏 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Search className="w-3.5 h-3.5 text-white/25 shrink-0" />
                  <input
                    value={musicSearch}
                    onChange={(e) => setMusicSearch(e.target.value)}
                    placeholder="搜索歌曲、歌手..."
                    className="flex-1 bg-transparent text-[rgba(224,240,255,0.7)] outline-none"
                    style={{ fontSize: "0.72rem" }}
                  />
                  {musicSearch && (
                    <button onClick={() => setMusicSearch("")} className="text-white/20 hover:text-white/50">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setViewMode(viewMode === "list" ? "coverflow" : "list")}
                  className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-all"
                  title={viewMode === "list" ? "切换到3D封面流" : "切换到列表视图"}
                >
                  {viewMode === "list" ? <LayoutGrid className="w-4 h-4" /> : <ListMusic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowAddTracks(!showAddTracks)}
                  className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-all"
                  title="添加歌曲"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-all"
                    title="更多功能"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[rgba(10,15,30,0.98)] border border-white/10 shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
                      <button onClick={() => { generateSmartPlaylist(); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all" style={{ fontSize: "0.72rem" }}>
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" /> 智能生成
                      </button>
                      <button onClick={() => { setShowCreationStudio(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all" style={{ fontSize: "0.72rem" }}>
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" /> AI 创作
                      </button>
                      {musicWorks.length > 0 && (
                        <button onClick={() => { setShowMyWorks(!showMyWorks); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all" style={{ fontSize: "0.72rem" }}>
                          <Music2 className="w-3.5 h-3.5 text-cyan-400" /> 我的创作 ({musicWorks.length})
                        </button>
                      )}
                      <div className="border-t border-white/[0.06]" />
                      <button onClick={() => { setShowAnthemModal(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all" style={{ fontSize: "0.72rem" }}>
                        <Music2 className="w-3.5 h-3.5 text-amber-400" /> 家族之歌
                      </button>
                      <button onClick={() => { setShowUploadModal(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all" style={{ fontSize: "0.72rem" }}>
                        <Upload className="w-3.5 h-3.5 text-emerald-400" /> 上传歌曲
                      </button>
                      <div className="border-t border-white/[0.06]" />
                      <button onClick={() => { setPlaylist([...MUSIC_LIBRARY]); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all" style={{ fontSize: "0.72rem" }}>
                        <Repeat className="w-3.5 h-3.5 text-white/30" /> 恢复默认列表
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 智能播放列表结果 */}
              {smartPlaylist && (
                <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-purple-300 text-xs font-medium">{smartPlaylist.name}</span>
                    </div>
                    <span className="text-purple-300/60" style={{ fontSize: "0.6rem" }}>
                      {smartPlaylist.tracks.length} 首 · {Math.floor(smartPlaylist.duration / 60)}分钟
                    </span>
                  </div>
                  <p className="text-purple-300/60" style={{ fontSize: "0.65rem" }}>{smartPlaylist.description}</p>
                </div>
              )}

              {/* 从音乐库添加歌曲 */}
              {showAddTracks && (
                <FadeIn>
                  <GlassCard className="p-3 mb-4" glowColor="rgba(0,212,255,0.03)">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300 text-xs font-medium">音乐库</span>
                        <span className="text-[rgba(224,240,255,0.3)]" style={{ fontSize: "0.6rem" }}>
                          {MUSIC_LIBRARY.filter(t => !playlist.some(p => p.id === t.id)).length} 首可添加
                        </span>
                      </div>
                      <button
                        onClick={() => setShowAddTracks(false)}
                        className="p-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {MUSIC_LIBRARY.filter(t => !playlist.some(p => p.id === t.id)).map((t) => (
                        <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-all group">
                          <div className="flex-1 min-w-0">
                            <p className="text-[rgba(224,240,255,0.7)] truncate" style={{ fontSize: "0.78rem" }}>{t.title}</p>
                            <p className="text-[rgba(224,240,255,0.3)] truncate" style={{ fontSize: "0.6rem" }}>{t.artist} · {t.album}</p>
                          </div>
                          <button
                            onClick={() => {
                              setPlaylist(prev => [...prev, t]);
                            }}
                            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                            style={{ fontSize: "0.65rem" }}
                          >
                            <Plus className="w-3 h-3" />
                            添加
                          </button>
                        </div>
                      ))}
                      {MUSIC_LIBRARY.filter(t => !playlist.some(p => p.id === t.id)).length === 0 && (
                        <p className="text-center text-[rgba(224,240,255,0.3)] py-4" style={{ fontSize: "0.75rem" }}>
                          所有歌曲已在播放列表中
                        </p>
                      )}
                      {playlist.length > 0 && (
                        <button
                          onClick={() => setPlaylist([...MUSIC_LIBRARY])}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          恢复全部默认歌曲
                        </button>
                      )}
                    </div>
                  </GlassCard>
                </FadeIn>
              )}

              {/* CoverFlow 3D 展示 */}
              {viewMode === "coverflow" && (
                <FadeIn>
                  <GlassCard className="p-4 mb-4" glowColor={`${currentTrackColor}05`}>
                    <CoverFlow
                      tracks={coverFlowTracks}
                      onTrackSelect={handleCoverFlowSelect}
                      selectedTrack={selectedMusicTrack}
                      isPlaying={isPlaying}
                    />
                  </GlassCard>
                </FadeIn>
              )}

              {/* 列表视图 */}
              {viewMode === "list" && (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {playlist.filter(t => {
                    if (!musicSearch) { return true; }
                    const q = musicSearch.toLowerCase();
                    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q);
                  }).map((t, i) => {
                    const isCurrent = i === currentTrackIndex;
                    const trackColor = EMOTION_COLORS[t.emotion] || "#9370DB";
                    return (
                      <FadeIn delay={i * 0.04} key={t.id}>
                        <GlassCard
                          className={`p-3 cursor-pointer group transition-all ${isCurrent ? "" : "hover:bg-[rgba(0,40,80,0.15)]"}`}
                          onClick={() => {
                            setCurrentTrackIndex(i);
                            const newAudioTrack: AudioTrack = {
                              id: t.id,
                              title: t.title,
                              artist: t.artist,
                              duration: t.duration,
                              color: trackColor,
                              audioUrl: t.audioUrl,
                            };
                            loadTrack(newAudioTrack);
                            play();
                          }}
                          glowColor={isCurrent ? `${trackColor}06` : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 text-center shrink-0">
                              {isCurrent && isPlaying ? (
                                <div className="flex items-end justify-center gap-0.5 h-4">
                                  {[0, 1, 2].map(j => (
                                    <div key={j} className="w-1 rounded-t animate-pulse" style={{ height: `${40 + Math.random() * 60}%`, background: trackColor, animationDelay: `${j * 0.15}s` }} />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[rgba(224,240,255,0.2)]" style={{ fontSize: "0.72rem" }}>{i + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${isCurrent ? "" : "text-[rgba(224,240,255,0.7)]"}`} style={{ fontSize: "0.8rem", color: isCurrent ? trackColor : undefined }}>
                                {t.title}
                              </p>
                              <p className="text-[rgba(224,240,255,0.3)] truncate" style={{ fontSize: "0.6rem" }}>{t.artist}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); toggleLike(t.id); }} title="收藏" className="shrink-0 p-1">
                              <Heart className="w-3.5 h-3.5 transition-colors" style={{ color: liked.has(t.id) ? "#FF69B4" : "rgba(224,240,255,0.15)", fill: liked.has(t.id) ? "#FF69B4" : "none" }} />
                            </button>
                            <button
                              title="从列表移除"
                              onClick={e => {
                                e.stopPropagation();
                                setPlaylist(prev => prev.filter((_, idx) => idx !== i));
                                if (i === currentTrackIndex) { pause(); }
                                else if (i < currentTrackIndex) { setCurrentTrackIndex(prev => prev - 1); }
                              }}
                              className="shrink-0 p-1 text-white/10 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[rgba(224,240,255,0.2)] shrink-0" style={{ fontSize: "0.65rem" }}>{formatDuration(t.duration)}</span>
                          </div>
                        </GlassCard>
                      </FadeIn>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Rss className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-[rgba(224,240,255,0.4)]" style={{ fontSize: "0.72rem" }}>AI 精选 · 行业前沿资讯</span>
            </div>
            {NEWS_ITEMS.map((news, i) => (
              <FadeIn delay={i * 0.05} key={news.id}>
                <GlassCard className="p-5 cursor-pointer group hover:border-[rgba(0,212,255,0.2)] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "0.58rem", background: `${news.color}10`, border: `1px solid ${news.color}20`, color: news.color }}>
                          {news.category}
                        </span>
                        <span className="text-[rgba(224,240,255,0.2)]" style={{ fontSize: "0.6rem" }}>{news.source}</span>
                        <span className="text-[rgba(224,240,255,0.15)]" style={{ fontSize: "0.55rem" }}>{news.time}</span>
                      </div>
                      <h3 className="text-[rgba(224,240,255,0.8)] group-hover:text-[#e0f0ff] transition-colors" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                        {news.title}
                      </h3>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[rgba(224,240,255,0.1)] group-hover:text-[rgba(0,212,255,0.5)] transition-colors shrink-0 mt-1" />
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      <CreationStudio
        isOpen={showCreationStudio}
        onClose={() => setShowCreationStudio(false)}
        playlist={playlist}
        currentTrackIndex={currentTrackIndex}
        onCreateTrack={(track) => {
          setPlaylist((prev) => [...prev, track]);
        }}
      />

      {showMyWorks && musicWorks.length > 0 && (
        <FadeIn>
          <div className="max-w-5xl mx-auto px-4 md:px-8 mt-4">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.85rem" }}>我的创作</span>
                  <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.65rem" }}>{musicWorks.length} 首作品</span>
                </div>
                <button onClick={() => setShowMyWorks(false)} className="text-white/20 hover:text-white/50">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {musicWorks.map((work) => (
                  <div key={work.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(120,80,255,0.1)", border: "1px solid rgba(120,80,255,0.2)" }}>
                      <Music className="w-4 h-4 text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#e0f0ff] truncate" style={{ fontSize: "0.78rem" }}>{work.title}</div>
                      <div className="text-[rgba(0,212,255,0.3)] truncate" style={{ fontSize: "0.65rem" }}>{work.theme} · {work.mode} · {new Date(work.createdAt).toLocaleDateString("zh-CN")}</div>
                    </div>
                    <button
                      onClick={() => removeMusicWork(work.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="删除作品"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </FadeIn>
      )}

      {showAnthemModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAnthemModal(false)}>
          <div className="w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-6" glowColor="rgba(255, 215, 0, 0.08)">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFD70020, #FFA50020)', border: '2px solid #FFD70040' }}>
                    <Music2 className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-[#FFD300]" style={{ fontSize: "1rem" }}>Family AI · 智慧工坊之歌</h3>
                    <p className="text-[rgba(224,240,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                      原创歌曲 · AI Family 独家关爱之语
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAnthemModal(false)} className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <FamilyAnthemPlayer
                showLyrics={true}
                autoScroll={true}
                onPlay={() => { console.info('[FamilyMusic] 家族之歌开始播放'); }}
                onPause={() => { console.info('[FamilyMusic] 家族之歌暂停'); }}
                onLyricHighlight={(lyric: { emotion: string; text: string }) => {
                  careEngine.respondToEmotion(lyric.emotion as string, { context: `正在聆听《${lyric.text}》`, userName: '创始人' }).then((response: CareResponse) => { setCareResponse(response); setTimeout(() => setCareResponse(null), 8000); });
                }}
              />
              {careResponse && (
                <div className="mt-4 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.08))', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <div className="flex items-start gap-3">
                    <MessageCircleHeart className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[#e0f0ff]" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{careResponse.message}</p>
                      {careResponse.wisdomQuote && (
                        <p className="text-[rgba(255,215,0,0.6)] mt-2 italic" style={{ fontSize: "0.72rem" }}>💡 {careResponse.wisdomQuote}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
          <div className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-6" glowColor="rgba(16, 185, 129, 0.08)">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B98120, #14B8A620)', border: '2px solid #10B98140' }}>
                    <Upload className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-emerald-300" style={{ fontSize: "1rem" }}>上传原创歌曲</h3>
                    <p className="text-[rgba(224,240,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                      拖拽或点击上传，加入AI Family音乐库
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SongUploadZone
                onUploadSuccess={(song: { title: string; url: string }) => {
                  const id = `upload-${Date.now()}`;
                  const newSong: UploadedSong = { id, title: song.title, url: song.url, artist: "本地" };
                  setUploadedSongs(prev => [...prev, newSong]);
                  const newTrack: MusicTrack = {
                    id, title: song.title, artist: "本地", album: "用户上传", duration: 0,
                    audioUrl: song.url, coverUrl: "/yyc3-icons/Web App/android-chrome-192.png",
                    genre: "unknown", emotion: "happy",
                  };
                  setPlaylist(prev => [...prev, newTrack]);
                  careEngine.encourage({ achievement: `上传了原创歌曲《${song.title}》`, context: '音乐创作' }).then((response: CareResponse) => { setCareResponse(response); setTimeout(() => setCareResponse(null), 8000); }).catch(() => { });
                }}
                onError={(error: Error) => { console.error('[FamilyMusic] 上传失败:', error); }}
                maxFiles={10}
              />
              {uploadedSongs.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Music2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">已上传 {uploadedSongs.length} 首</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {uploadedSongs.map((song, index) => (
                      <div key={song.id || index} className="flex items-center gap-2 text-xs text-[rgba(224,240,255,0.6)]">
                        <span className="text-emerald-400">✓</span>
                        <button title={`播放 ${song.title}`} onClick={() => { const idx = playlist.findIndex(t => t.id === song.id); if (idx >= 0) { setCurrentTrackIndex(idx); } }} className="text-white/40 hover:text-[#00d4ff] transition-colors">{song.title}</button>
                        <button title="删除" onClick={() => { setUploadedSongs(prev => prev.filter((_, i) => i !== index)); if (song.id) { setPlaylist(prev => prev.filter(t => t.id !== song.id)); } }} className="ml-auto p-1 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      <MVPlayerOverlay
        isOpen={showMVPlayer}
        onClose={() => setShowMVPlayer(false)}
        videoUrl={currentTrackData?.videoUrl || (DMUSIC_VIDEOS.length > 0 ? DMUSIC_VIDEOS[currentTrackIndex % DMUSIC_VIDEOS.length] : null)}
        trackTitle={currentTrackData?.title || "D-Music"}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onSeek={(pct) => seek(pct * duration)}
        formatTime={formatDuration}
      />
    </div>
  );
}
