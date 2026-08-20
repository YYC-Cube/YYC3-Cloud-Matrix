/**
 * @file: FamilyVoiceSystem.tsx
 * @description: FamilyVoiceSystem.tsx
 * @author: YanYuCloudCube Team
 * @version: v2.0.0 - 集成语音命令与情感检测
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Volume2, VolumeX, Mic, MicOff, Play, Pause,
  Sliders, RefreshCw, AlertCircle,
  Heart, Music2, MessageCircle,
  Loader2, X,
} from "lucide-react";
import { GlassCard } from "../../shared/GlassCard";
import { FadeIn } from "./FadeIn";
import {
  hexToRgb, getHourlyCare,
  DEFAULT_VOICE_PROFILES, AI_RESPONSES,
  type VoiceProfile,
} from "./shared";
import { useFamilyMemberSlice } from "../store";
import { useFamilySettingsSlice } from "../store/family-settings-slice";
import type { VoiceConversation } from "../store/family-settings-slice";
import type { UnifiedFamilyMember } from "../../../types";
import musicEventBus from "../../../lib/MusicEventBus";
import { parseVoiceCommand } from "../../../lib/VoiceCommandParser";
import emotionMusicBridge from "../../../lib/EmotionMusicBridge";

// ═══ TTS 引擎 ═══

function speak(text: string, profile: VoiceProfile, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) {return;}
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = profile.pitch;
  u.rate = profile.rate;
  u.volume = profile.volume;
  u.lang = profile.lang;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith("zh")) || voices[0];
  if (match) {u.voice = match;}
  if (onEnd) {u.onend = onEnd;}
  window.speechSynthesis.speak(u);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {window.speechSynthesis.cancel();}
}

// ═══ 子组件：单个家人语音卡片 ═══

function VoiceCard({
  member,
  profile,
  isPlaying,
  onUpdateProfile,
  onPlay,
  onStop,
  onStartConversation,
}: {
  member: UnifiedFamilyMember;
  profile: VoiceProfile;
  isPlaying: boolean;
  onUpdateProfile: (updates: Partial<VoiceProfile>) => void;
  onPlay: () => void;
  onStop: () => void;
  onStartConversation: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const rgb = hexToRgb(member.color);

  return (
    <GlassCard className="p-0 overflow-hidden" glowColor={isPlaying ? `rgba(${rgb},0.2)` : undefined}>
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `rgba(${rgb},0.15)`, border: `1.5px solid rgba(${rgb},0.4)` }}
        >
          <member.icon className="w-4 h-4" style={{ color: member.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white/90" style={{ fontSize: "0.8rem" }}>{member.shortName}</span>
            {isPlaying && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400" style={{ fontSize: "0.55rem" }}>播报中</span>
              </span>
            )}
          </div>
          <div className="text-white/30" style={{ fontSize: "0.6rem" }}>
            音高 {profile.pitch.toFixed(1)} · 语速 {profile.rate.toFixed(1)} · 音量 {(profile.volume * 100).toFixed(0)}%
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onStartConversation}
            className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all"
            title="语音对话"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={isPlaying ? onStop : onPlay}
            className={`p-2 rounded-lg transition-all ${
              isPlaying
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-[rgba(0,212,255,0.1)] text-cyan-300 hover:bg-[rgba(0,212,255,0.2)]"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${
              showSettings ? "bg-white/[0.08] text-white/60" : "text-white/20 hover:text-white/40 hover:bg-white/[0.04]"
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice settings (expandable) */}
      {showSettings && (
        <div className="border-t border-white/[0.06] p-3 space-y-3">
          {/* Pitch */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40" style={{ fontSize: "0.65rem" }}>音高 (Pitch)</span>
              <span className="text-cyan-400" style={{ fontSize: "0.65rem" }}>{profile.pitch.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0.5" max="2" step="0.05"
              value={profile.pitch}
              onChange={e => onUpdateProfile({ pitch: parseFloat(e.target.value) })}
              className="w-full h-1 rounded-full appearance-none bg-white/10 accent-cyan-400"
            />
          </div>
          {/* Rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40" style={{ fontSize: "0.65rem" }}>语速 (Rate)</span>
              <span className="text-cyan-400" style={{ fontSize: "0.65rem" }}>{profile.rate.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0.5" max="2" step="0.05"
              value={profile.rate}
              onChange={e => onUpdateProfile({ rate: parseFloat(e.target.value) })}
              className="w-full h-1 rounded-full appearance-none bg-white/10 accent-cyan-400"
            />
          </div>
          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40" style={{ fontSize: "0.65rem" }}>音量 (Volume)</span>
              <span className="text-cyan-400" style={{ fontSize: "0.65rem" }}>{(profile.volume * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05"
              value={profile.volume}
              onChange={e => onUpdateProfile({ volume: parseFloat(e.target.value) })}
              className="w-full h-1 rounded-full appearance-none bg-white/10 accent-cyan-400"
            />
          </div>
          {/* Quick preview texts */}
          <div className="flex flex-wrap gap-1.5">
            {["问候语", "关爱播报", "随机回复"].map(label => (
              <button
                key={label}
                onClick={() => {
                  const text = label === "问候语" ? member.greeting
                    : label === "关爱播报" ? member.careMessage
                    : (AI_RESPONSES[member.id]?.[Math.floor(Math.random() * AI_RESPONSES[member.id].length)] || member.quote);
                  speak(text, profile);
                }}
                className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all"
                style={{ fontSize: "0.6rem" }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Reset */}
          <button
            onClick={() => {
              const def = DEFAULT_VOICE_PROFILES.find(p => p.memberId === member.id);
              if (def) {onUpdateProfile({ pitch: def.pitch, rate: def.rate, volume: def.volume });}
            }}
            className="flex items-center gap-1 text-white/30 hover:text-white/50 transition-colors"
            style={{ fontSize: "0.6rem" }}
          >
            <RefreshCw className="w-3 h-3" />
            恢复默认
          </button>
        </div>
      )}
    </GlassCard>
  );
}

// ═══ 子组件：语音对话面板 ═══

function VoiceConversationPanel({
  member,
  profile,
  conversations,
  onClose,
  onNewConversation,
}: {
  member: UnifiedFamilyMember;
  profile: VoiceProfile;
  conversations: VoiceConversation[];
  onClose: () => void;
  onNewConversation: (conv: VoiceConversation) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [srSupported, setSrSupported] = useState(true);
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const rgb = hexToRgb(member.color);

  const memberConvs = conversations.filter(c => c.memberId === member.id).slice(-10);

  useEffect(() => {
    const SpeechRecognition = ((window as unknown) as Record<string, unknown>).SpeechRecognition || ((window as unknown) as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSrSupported(false);
      return;
    }
    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) {
        setTranscript(prev => prev + final);
        setInterimTranscript("");

        const parsedCommand = parseVoiceCommand(final);
        if (parsedCommand && parsedCommand.confidence > 0.5) {
          musicEventBus.emitVoiceCommand(
            parsedCommand.command,
            final,
            parsedCommand.confidence,
            member.id
          );
        }

        const emotionState = emotionMusicBridge.detectEmotion(final);
        if (emotionState.confidence > 0.6) {
          const suggestion = emotionMusicBridge.suggestMusicAction(emotionState.type);
          if (suggestion.action === "change_playlist") {
            console.info(`[VoiceSystem] Emotion-based suggestion: ${suggestion.reason}`);
          }
        }
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      try { recognition.abort(); } catch { /* noop */ }
    };
  }, [member.id]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {return;}
    setTranscript("");
    setInterimTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {return;}
    try { recognitionRef.current.stop(); } catch { /* noop */ }
    setIsListening(false);
  }, []);

  const handleRespond = useCallback((userText: string) => {
    if (!userText.trim()) {return;}
    setIsResponding(true);

    // Pick a random AI response
    const responses = AI_RESPONSES[member.id] || [member.greeting];
    const aiText = responses[Math.floor(Math.random() * responses.length)];

    // Simulate thinking delay
    setTimeout(() => {
      speak(aiText, profile, () => setIsResponding(false));

      const conv: VoiceConversation = {
        id: `vc-${Date.now()}`,
        memberId: member.id,
        userText,
        aiText,
        timestamp: new Date().toISOString(),
      };
      onNewConversation(conv);
      setTranscript("");
      setTextInput("");
    }, 400 + Math.random() * 600);
  }, [member, profile, onNewConversation]);

  const handleSendVoice = useCallback(() => {
    if (transcript.trim()) {
      handleRespond(transcript.trim());
    }
  }, [transcript, handleRespond]);

  const handleSendText = useCallback(() => {
    if (textInput.trim()) {
      handleRespond(textInput.trim());
    }
  }, [textInput, handleRespond]);

  return (
    <GlassCard className="p-0 overflow-hidden" glowColor={`rgba(${rgb},0.15)`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `rgba(${rgb},0.15)`, border: `1.5px solid rgba(${rgb},0.4)` }}
        >
          <member.icon className="w-5 h-5" style={{ color: member.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white/90" style={{ fontSize: "0.9rem" }}>与 {member.shortName} 语音对话</span>
            {isListening && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-300" style={{ fontSize: "0.6rem" }}>录音中</span>
              </span>
            )}
            {isResponding && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10">
                <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                <span className="text-emerald-300" style={{ fontSize: "0.6rem" }}>回复中</span>
              </span>
            )}
          </div>
          <p className="text-white/30" style={{ fontSize: "0.65rem" }}>
            {srSupported ? "点击麦克风开始说话，或使用文字输入" : "语音识别不可用，请使用文字输入"}
          </p>
        </div>
        <button
          onClick={() => { stopSpeaking(); onClose(); }}
          className="p-2 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation history */}
      {memberConvs.length > 0 && (
        <div className="max-h-48 overflow-y-auto p-4 space-y-3 border-b border-white/[0.04]">
          {memberConvs.map(conv => (
            <div key={conv.id} className="space-y-1.5">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-3 h-3 text-cyan-400" />
                </div>
                <p className="text-white/50 bg-white/[0.03] rounded-lg rounded-tl-sm px-2 py-1" style={{ fontSize: "0.7rem" }}>
                  {conv.userText}
                </p>
              </div>
              <div className="flex items-start gap-2 pl-7">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `rgba(${rgb},0.15)` }}
                >
                  <member.icon className="w-3 h-3" style={{ color: member.color }} />
                </div>
                <p className="bg-white/[0.03] rounded-lg rounded-tl-sm px-2 py-1" style={{ fontSize: "0.7rem", color: member.color }}>
                  {conv.aiText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice input area */}
      <div className="p-4 space-y-3">
        {/* Transcript display */}
        {(transcript || interimTranscript) && (
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="text-white/50 mb-1" style={{ fontSize: "0.6rem" }}>识别结果</div>
            <p className="text-white/70" style={{ fontSize: "0.8rem" }}>
              {transcript}
              {interimTranscript && <span className="text-white/30">{interimTranscript}</span>}
            </p>
          </div>
        )}

        {/* Voice controls */}
        <div className="flex items-center gap-3">
          {srSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isResponding}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500/20 border-2 border-red-400 text-red-300 animate-pulse"
                  : "bg-white/[0.06] border-2 border-white/[0.1] text-white/40 hover:bg-white/[0.1] hover:text-white/60"
              } disabled:opacity-30`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          {transcript && (
            <button
              onClick={handleSendVoice}
              disabled={isResponding}
              className="px-4 py-2 rounded-lg bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.2)] text-cyan-300 hover:bg-[rgba(0,212,255,0.25)] transition-all disabled:opacity-30"
              style={{ fontSize: "0.75rem" }}
            >
              发送给 {member.shortName}
            </button>
          )}
        </div>

        {/* Text input fallback */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendText()}
            placeholder={`对 ${member.shortName} 说点什么...`}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/30"
            style={{ fontSize: "0.75rem" }}
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || isResponding}
            className="p-2 rounded-lg bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.2)] text-cyan-300 hover:bg-[rgba(0,212,255,0.25)] transition-all disabled:opacity-30"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// ═══ 主组件 ═══

export function FamilyVoiceSystem() {
  const { members } = useFamilyMemberSlice();
  const profiles = useFamilySettingsSlice((s) => s.voiceProfiles);
  const conversations = useFamilySettingsSlice((s) => s.voiceConversations);
  const [playingMemberId, setPlayingMemberId] = useState<string | null>(null);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [conversationMemberId, setConversationMemberId] = useState<string | null>(null);

  useEffect(() => {
    // Seed default profiles if slice is empty
    if (useFamilySettingsSlice.getState().voiceProfiles.length === 0) {
      useFamilySettingsSlice.getState().setVoiceProfiles(DEFAULT_VOICE_PROFILES);
    }
    setTtsSupported("speechSynthesis" in window);
    // Pre-load voices
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const handleUpdateProfile = useCallback((memberId: string, updates: Partial<VoiceProfile>) => {
    useFamilySettingsSlice.getState().updateVoiceProfile(memberId, updates);
  }, []);

  const handlePlay = useCallback((member: UnifiedFamilyMember) => {
    const profile = profiles.find(p => p.memberId === member.id) || DEFAULT_VOICE_PROFILES[0];
    setPlayingMemberId(member.id);
    speak(member.greeting, profile, () => setPlayingMemberId(null));
  }, [profiles]);

  const handleStop = useCallback(() => {
    stopSpeaking();
    setPlayingMemberId(null);
  }, []);

  const handleCarePlay = useCallback(() => {
    const care = getHourlyCare();
    const profile = profiles.find(p => p.memberId === care.member.id) || DEFAULT_VOICE_PROFILES[0];
    setPlayingMemberId(care.member.id);
    speak(care.message, profile, () => setPlayingMemberId(null));
  }, [profiles]);

  // Broadcast all (sequential)
  const handleBroadcastAll = useCallback(async () => {
    for (const member of members) {
      const profile = profiles.find(p => p.memberId === member.id) || DEFAULT_VOICE_PROFILES[0];
      setPlayingMemberId(member.id);
      await new Promise<void>(resolve => {
        speak(`${member.shortName}：${member.careMessage}`, profile, resolve);
      });
      await new Promise(r => setTimeout(r, 300));
    }
    setPlayingMemberId(null);
  }, [members, profiles]);

  const handleNewConversation = useCallback((conv: VoiceConversation) => {
    useFamilySettingsSlice.getState().addVoiceConversation(conv);
  }, []);

  const srSupported = typeof window !== "undefined" && (
    !!(window as unknown as Record<string, unknown>).SpeechRecognition || !!(window as unknown as Record<string, unknown>).webkitSpeechRecognition
  );

  return (
    <div className="min-h-full pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-white/90" style={{ fontSize: "1.25rem" }}>AI Family 语音系统</h1>
                <p className="text-white/40" style={{ fontSize: "0.7rem" }}>
                  {ttsSupported ? "TTS 就绪" : "TTS 不可用"}{" "}
                  · {srSupported ? "语音识别就绪" : "语音识别不可用"}{" "}
                  · {conversations.length} 条对话记录
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCarePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 transition-all"
                style={{ fontSize: "0.7rem" }}
              >
                <Heart className="w-3 h-3" />
                整点关爱
              </button>
              <button
                onClick={handleBroadcastAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                style={{ fontSize: "0.7rem" }}
              >
                <Music2 className="w-3 h-3" />
                全家播报
              </button>
              {playingMemberId && (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all"
                  style={{ fontSize: "0.7rem" }}
                >
                  <VolumeX className="w-3 h-3" />
                  停止
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* API Status */}
        <FadeIn delay={0.03}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${ttsSupported ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <Volume2 className={`w-3 h-3 ${ttsSupported ? "text-emerald-400" : "text-red-400"}`} />
              <span className={ttsSupported ? "text-emerald-400" : "text-red-400"} style={{ fontSize: "0.65rem" }}>
                Speech Synthesis {ttsSupported ? "OK" : "N/A"}
              </span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${srSupported ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
              <Mic className={`w-3 h-3 ${srSupported ? "text-emerald-400" : "text-amber-400"}`} />
              <span className={srSupported ? "text-emerald-400" : "text-amber-400"} style={{ fontSize: "0.65rem" }}>
                Speech Recognition {srSupported ? "OK" : "N/A (use text)"}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* TTS not supported warning */}
        {!ttsSupported && (
          <GlassCard className="p-4 mb-4 border-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300" style={{ fontSize: "0.75rem" }}>
                当前环境不支持 Web Speech API，语音预览不可用。请在 Chrome/Edge/Safari 中访问。
              </span>
            </div>
          </GlassCard>
        )}

        {/* Active conversation panel */}
        {conversationMemberId && (
          <FadeIn delay={0.05}>
            <div className="mb-6">
              <VoiceConversationPanel
                member={members.find(m => m.id === conversationMemberId) || members[0]}
                profile={profiles.find(p => p.memberId === conversationMemberId) || DEFAULT_VOICE_PROFILES[0]}
                conversations={conversations}
                onClose={() => setConversationMemberId(null)}
                onNewConversation={handleNewConversation}
              />
            </div>
          </FadeIn>
        )}

        {/* Voice cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((member, i) => {
            const profile = profiles.find(p => p.memberId === member.id) || DEFAULT_VOICE_PROFILES[i];
            return (
              <VoiceCard
                key={member.id}
                member={member}
                profile={profile}
                isPlaying={playingMemberId === member.id}
                onUpdateProfile={(updates) => handleUpdateProfile(member.id, updates)}
                onPlay={() => handlePlay(member)}
                onStop={handleStop}
                onStartConversation={() => setConversationMemberId(member.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}