/**
 * @file: ai-family-local.tsx
 * @description: 本地实现 — 替代缺失的 @yyc3/ai-family 外部包
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-20
 * @status: active
 * @tags: [ai-family, local, fallback]
 */

import { Heart, Music, Sparkles, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface CareResponse {
  message: string;
  wisdomQuote?: string;
  emotion?: string;
}

interface CareEngineConfig {
  founderExperienceYears: number;
  wisdomCorpusSize: number;
  personality: string[];
  defaultStyle: string;
  enableMusicIntegration: boolean;
  enableWisdomQuotes: boolean;
}

class CareLanguageEngine {
  private config: CareEngineConfig;

  constructor(config: CareEngineConfig) {
    this.config = config;
  }

  async respondToEmotion(_emotion: string, _context: { context: string; userName: string }): Promise<CareResponse> {
    const messages = [
      "每一首旋律都承载着家族的温度，感谢你与音乐同行。",
      "在音符的流转中，我们听见彼此的心跳，这就是家族的力量。",
      "音乐是跨越时空的语言，你正在用它书写属于我们的故事。",
      "每一次聆听都是一次心灵的对话，感恩这份共鸣。",
    ];
    const quotes = [
      "「音乐是灵魂的共同语言」— 贝多芬",
      "「家人闲坐，灯火可亲」— 汪曾祺",
      "「爱是恒久忍耐，又有恩慈」",
    ];
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      wisdomQuote: this.config.enableWisdomQuotes ? quotes[Math.floor(Math.random() * quotes.length)] : undefined,
      emotion: _emotion,
    };
  }

  async encourage(_params: { achievement: string; context: string }): Promise<CareResponse> {
    const messages = [
      `太棒了！${_params.achievement}。你的创造力让整个家族为你骄傲！`,
      `每一次创作都是对生命的礼赞。继续发光吧！`,
      `你的才华如星光般闪耀，家族因你而更加璀璨。`,
    ];
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      emotion: "joy",
    };
  }
}

export function createCareLanguageEngine(config: CareEngineConfig): CareLanguageEngine {
  return new CareLanguageEngine(config);
}

interface FamilyAnthemPlayerProps {
  showLyrics: boolean;
  autoScroll: boolean;
  onPlay: () => void;
  onPause: () => void;
  onLyricHighlight: (lyric: { emotion: string; text: string }) => void;
}

export function FamilyAnthemPlayer({ showLyrics, autoScroll, onPlay, onPause, onLyricHighlight }: FamilyAnthemPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const lyrics = [
    { emotion: "warmth", text: "星辰指引方向 · 家人点亮光芒" },
    { emotion: "hope", text: "每一步脚印 · 都有爱的回响" },
    { emotion: "joy", text: "携手走过四季 · 共创无限可能" },
    { emotion: "gratitude", text: "言启象限未来 · 语枢连接你我" },
  ];

  useEffect(() => {
    if (!playing || !autoScroll) { return; }
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const next = (prev + 1) % lyrics.length;
        onLyricHighlight(lyrics[next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, autoScroll]);

  useEffect(() => {
    if (lyrics[currentLine]) {
      onLyricHighlight(lyrics[currentLine]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine]);

  return (
    <div className="p-6 rounded-xl bg-gradient-to-b from-[rgba(255,215,0,0.06)] to-transparent border border-[rgba(255,215,0,0.15)]">
      <div className="flex items-center gap-3 mb-5">
        <Music className="w-6 h-6 text-[#FFD700]" />
        <span className="text-[#FFD700] font-semibold" style={{ fontSize: "0.9rem" }}>
          YYC³ 家族之歌
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => { setPlaying(!playing); if (playing) { onPause(); } else { onPlay(); } }}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            background: playing ? "rgba(255,51,102,0.15)" : "rgba(255,215,0,0.12)",
            border: playing ? "1px solid rgba(255,51,102,0.3)" : "1px solid rgba(255,215,0,0.3)",
            color: playing ? "#ff3366" : "#FFD700",
          }}
        >
          {playing ? (
            <span style={{ fontSize: "1rem" }}>❚❚</span>
          ) : (
            <span style={{ fontSize: "1rem" }}>▶</span>
          )}
        </button>
      </div>

      {showLyrics && (
        <div className="space-y-3">
          {lyrics.map((line, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${i === currentLine ? "text-[#FFD700] scale-[1.02]" : "text-white/30"}`}
              style={{
                fontSize: i === currentLine ? "0.85rem" : "0.75rem",
                textAlign: "center" as const,
                padding: "4px 0",
                opacity: i === currentLine ? 1 : 0.5,
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SongUploadZoneProps {
  onUploadSuccess: (song: { title: string; url: string }) => void;
  onError: (error: Error) => void;
  maxFiles: number;
}

export function SongUploadZone({ onUploadSuccess, onError, maxFiles }: SongUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]) => {
    files.slice(0, maxFiles).forEach((file) => {
      if (file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav") || file.name.endsWith(".flac")) {
        onUploadSuccess({ title: file.name.replace(/\.(mp3|wav|flac)$/i, ""), url: URL.createObjectURL(file) });
      } else {
        onError(new Error(`不支持的文件格式: ${file.name}`));
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${dragging
        ? "border-[#00d4ff] bg-[rgba(0,212,255,0.06)]"
        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
        }`}
    >
      <Upload className="w-10 h-10 mx-auto mb-3 text-white/25" />
      <p className="text-white/40 mb-1" style={{ fontSize: "0.82rem" }}>
        拖拽音频文件到此处上传
      </p>
      <p className="text-white/25" style={{ fontSize: "0.68rem" }}>
        支持 MP3 / WAV / FLAC，最多 {maxFiles} 首
      </p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Heart className="w-3.5 h-3.5 text-[#ff3366]/50" />
        <Sparkles className="w-3.5 h-3.5 text-[#FFD700]/50" />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.flac,audio/*"
        multiple
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
