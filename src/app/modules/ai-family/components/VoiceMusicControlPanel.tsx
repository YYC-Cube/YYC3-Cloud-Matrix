/**
 * @file: VoiceMusicControlPanel.tsx
 * @description: 语音音乐控制面板组件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { GlassCard } from "../../shared/GlassCard";
import { useVoiceMusicControl } from "../hooks/useMusicPlayer";
import { type ParsedCommand } from "../../../lib/VoiceCommandParser";
import type { MusicCommand } from "../../../lib/MusicEventBus";

const COMMAND_EXAMPLES: { command: MusicCommand; examples: string[] }[] = [
  { command: "play", examples: ["播放", "开始播放", "play"] },
  { command: "pause", examples: ["暂停", "停止", "pause"] },
  { command: "next", examples: ["下一首", "切歌", "next"] },
  { command: "previous", examples: ["上一首", "返回", "previous"] },
  { command: "volume_up", examples: ["大声点", "音量大点"] },
  { command: "volume_down", examples: ["小声点", "音量小点"] },
  { command: "like", examples: ["喜欢", "收藏", "点赞"] },
];

interface VoiceMusicControlPanelProps {
  onCommand?: (command: ParsedCommand) => void;
  className?: string;
  compact?: boolean;
}

export function VoiceMusicControlPanel({
  onCommand,
  className = "",
  compact = false,
}: VoiceMusicControlPanelProps) {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    lastCommand,
  } = useVoiceMusicControl();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (lastCommand) {
      onCommand?.(lastCommand);
      if (lastCommand.confidence > 0.5) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setShowError(true);
        setErrorMessage("命令识别置信度较低，请重试");
        setTimeout(() => {
          setShowError(false);
          setErrorMessage("");
        }, 3000);
      }
    }
  }, [lastCommand, onCommand]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleMicClick}
        className={`relative p-3 rounded-full transition-all ${
          isListening
            ? "bg-red-500/20 border-2 border-red-400 text-red-300 animate-pulse"
            : "bg-[rgba(0,212,255,0.1)] border-2 border-[rgba(0,212,255,0.3)] text-cyan-300 hover:bg-[rgba(0,212,255,0.2)]"
        } ${className}`}
        title={isListening ? "点击停止" : "点击开始语音控制"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        {showSuccess && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </button>
    );
  }

  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={handleMicClick}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500/20 border-2 border-red-400 text-red-300 animate-pulse"
              : "bg-[rgba(0,212,255,0.1)] border-2 border-[rgba(0,212,255,0.3)] text-cyan-300 hover:bg-[rgba(0,212,255,0.2)]"
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          {isListening && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="text-white/90 text-sm">语音控制</span>
            {isListening && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-xs text-red-300">
                <Loader2 className="w-3 h-3 animate-spin" />
                录音中
              </span>
            )}
            {showSuccess && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs text-emerald-300">
                <CheckCircle className="w-3 h-3" />
                已识别
              </span>
            )}
            {showError && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-xs text-red-300">
                <XCircle className="w-3 h-3" />
                {errorMessage || "识别失败"}
              </span>
            )}
          </div>

          {transcript ? (
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-white/70 text-sm truncate">{transcript}</p>
              {lastCommand && (
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-300">
                    识别命令: {lastCommand.command}
                  </span>
                  <span className="text-xs text-white/30">
                    置信度: {(lastCommand.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/40 text-xs">
              {isListening ? "请说出您的命令..." : "点击麦克风开始语音控制"}
            </p>
          )}
        </div>
      </div>

      {isListening && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-white/40 text-xs mb-2">支持的语音命令：</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMAND_EXAMPLES.slice(0, 6).map(({ command, examples }) => (
              <span
                key={command}
                className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-white/50 text-xs cursor-help"
                title={`示例: ${examples.join(", ")}`}
              >
                {examples[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default VoiceMusicControlPanel;
