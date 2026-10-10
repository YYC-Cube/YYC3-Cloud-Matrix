/**
 * @file: LyricsGeneratorPanel.tsx
 * @description: AI 歌词生成器 UI 组件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Music, Copy, RefreshCw, Download, Share2 } from "lucide-react";
import { useFamilyMemberSlice } from "../../store";
import { lyricsGenerator, type LyricsStyle, type LyricsTheme, type GeneratedLyrics } from "../../lib/LyricsGenerator";
import { Button } from "../ui/button";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";

// _FAMILY_MEMBERS removed — members now from store

interface LyricsGeneratorPanelProps {
  defaultStyle?: LyricsStyle;
  defaultTheme?: LyricsTheme;
  onLyricsGenerated?: (lyrics: GeneratedLyrics) => void;
  className?: string;
}

export function LyricsGeneratorPanel({
  defaultStyle = "pop",
  defaultTheme = "love",
  onLyricsGenerated,
  className = "",
}: LyricsGeneratorPanelProps) {
  const { members } = useFamilyMemberSlice();
  const [selectedStyle, setSelectedStyle] = useState<LyricsStyle>(defaultStyle);
  const [selectedTheme, setSelectedTheme] = useState<LyricsTheme>(defaultTheme);
  const [selectedMember, setSelectedMember] = useState<string>("creative");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<GeneratedLyrics | null>(null);
  const [copied, copyToClipboard] = useCopyFeedback();

  const styles = lyricsGenerator.getStyles();
  const themes = lyricsGenerator.getThemes();

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    setTimeout(() => {
      const lyrics = lyricsGenerator.generateWithMemberInfluence(
        {
          style: selectedStyle,
          theme: selectedTheme,
          includeBridge: true,
          rhymeScheme: "AABB",
          memberInfluence: selectedMember,
        },
        selectedMember
      );

      setGeneratedLyrics(lyrics);
      setIsGenerating(false);
      onLyricsGenerated?.(lyrics);
    }, 800);
  }, [selectedStyle, selectedTheme, selectedMember, onLyricsGenerated]);

  const handleCopy = useCallback(() => {
    if (!generatedLyrics) { return; }
    copyToClipboard(formatLyricsForCopy(generatedLyrics), true);
  }, [generatedLyrics, copyToClipboard]);

  const handleDownload = useCallback(() => {
    if (!generatedLyrics) {
      return;
    }

    const text = formatLyricsForCopy(generatedLyrics);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedLyrics.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedLyrics]);

  const formatLyricsForCopy = (lyrics: GeneratedLyrics): string => {
    let text = `${lyrics.title}\n\n`;

    lyrics.sections.forEach((section) => {
      const sectionName =
        section.type === "verse"
          ? `【主歌${section.number ?? ""}】`
          : section.type === "chorus"
            ? `【副歌${section.number ?? ""}】`
            : section.type === "bridge"
              ? "【桥段】"
              : section.type === "intro"
                ? "【前奏】"
                : "【尾声】";

      text += `${sectionName}\n`;
      section.lines.forEach((line) => {
        text += `${line}\n`;
      });
      text += "\n";
    });

    text += `\n---\n风格: ${lyrics.style} | 主题: ${lyrics.theme}\n`;
    text += `字数: ${lyrics.metadata.wordCount} | 行数: ${lyrics.metadata.lineCount}\n`;

    return text;
  };

  return (
    <div className={`lyrics-generator-panel ${className}`}>
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] rounded-xl border border-[#00d4ff]/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#00d4ff]" />
          <h3 className="text-white font-medium">AI 歌词生成器</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">音乐风格</label>
            <div className="grid grid-cols-4 gap-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedStyle === style.id
                      ? "bg-[#00d4ff] text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">歌词主题</label>
            <div className="grid grid-cols-5 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTheme === theme.id
                      ? "bg-[#00d4ff] text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">家人灵感</label>
            <div className="grid grid-cols-4 gap-2">
              {members.slice(0, 8).map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedMember === member.id
                      ? "border-[#00d4ff] bg-[#00d4ff]/10"
                      : "border-gray-700 hover:border-gray-600"
                  } border`}
                >
                  <member.icon
                    className="w-4 h-4"
                    style={{
                      color: selectedMember === member.id ? "#00d4ff" : member.color,
                    }}
                  />
                  <span className="text-gray-300">{member.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black font-medium"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Music className="w-4 h-4 mr-2" />
                生成歌词
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {generatedLyrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
              <div className="bg-[#0d1f3c] rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[#00d4ff] font-medium">{generatedLyrics.title}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      title="复制"
                    >
                      <Copy className={`w-4 h-4 ${copied ? "text-green-400" : "text-gray-400"}`} />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      title="下载"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      title="分享"
                    >
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {generatedLyrics.sections.map((section, index) => (
                    <div key={index} className="space-y-1">
                      <span className="text-xs text-gray-500 uppercase">
                        {section.type === "verse" && `主歌 ${section.number ?? ""}`}
                        {section.type === "chorus" && `副歌 ${section.number ?? ""}`}
                        {section.type === "bridge" && "桥段"}
                        {section.type === "intro" && "前奏"}
                        {section.type === "outro" && "尾声"}
                      </span>
                      {section.lines.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-300 text-sm leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    字数: {generatedLyrics.metadata.wordCount} | 行数: {generatedLyrics.metadata.lineCount}
                  </span>
                  <span>置信度: {(generatedLyrics.metadata.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LyricsGeneratorPanel;
