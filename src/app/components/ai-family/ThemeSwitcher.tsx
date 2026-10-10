/**
 * @file: ThemeSwitcher.tsx
 * @description: 家人主题切换器，支持实时预览和动态切换
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, Check, Sparkles } from "lucide-react";
import { useFamilyMemberSlice } from "../../store";
import type { UnifiedFamilyMember } from "../../types";
import { familyThemeManager, type FamilyTheme } from "../../lib/FamilyMusicThemes";
import { Button } from "../ui/button";

interface ThemeSwitcherProps {
  currentMemberId?: string;
  onThemeChange?: (theme: FamilyTheme, member: UnifiedFamilyMember) => void;
  showPreview?: boolean;
  compact?: boolean;
  className?: string;
}

export function ThemeSwitcher({
  currentMemberId = "navigator",
  onThemeChange,
  showPreview = true,
  compact = false,
  className = "",
}: ThemeSwitcherProps) {
  const { members } = useFamilyMemberSlice();
  const [selectedMemberId, setSelectedMemberId] = useState(currentMemberId);
  const [currentTheme, setCurrentTheme] = useState<FamilyTheme | null>(null);
  const [previewTheme, setPreviewTheme] = useState<FamilyTheme | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const theme = familyThemeManager.getTheme(currentMemberId);
    if (theme) {
      setCurrentTheme(theme);
      setSelectedMemberId(currentMemberId);
    }
  }, [currentMemberId]);

  useEffect(() => {
    const unsubscribe = familyThemeManager.subscribe((theme) => {
      setCurrentTheme(theme);
      setSelectedMemberId(theme.memberId);
    });
    return () => unsubscribe();
  }, []);

  const handleMemberSelect = useCallback((memberId: string) => {
    const theme = familyThemeManager.getTheme(memberId);
    if (theme) {
      setPreviewTheme(theme);
    }
  }, []);

  const handleThemeApply = useCallback(
    (memberId: string) => {
      setIsTransitioning(true);

      const theme = familyThemeManager.setTheme(memberId);
      const member = members.find((m) => m.id === memberId);

      if (theme && member) {
        setCurrentTheme(theme);
        setSelectedMemberId(memberId);
        onThemeChange?.(theme, member);
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [onThemeChange, members]
  );

  const handleCancelPreview = useCallback(() => {
    setPreviewTheme(null);
  }, []);

  const displayTheme = previewTheme || currentTheme;

  return (
    <div className={`theme-switcher ${className}`}>
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] rounded-xl border border-[#00d4ff]/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="text-white font-medium">主题皮肤</h3>
          </div>
          {currentTheme && (
            <span className="text-xs text-gray-400">{currentTheme.name}</span>
          )}
        </div>

        {showPreview && displayTheme && (
          <motion.div
            key={displayTheme.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-4 rounded-lg border transition-all"
            style={{
              background: displayTheme.colors.backgroundGradient,
              borderColor: displayTheme.colors.border,
              boxShadow: displayTheme.playerStyle.boxShadow,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${displayTheme.colors.primary}20` }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: displayTheme.colors.primary }}
                />
              </div>
              <div>
                <h4
                  className="font-medium"
                  style={{ color: displayTheme.colors.text }}
                >
                  {displayTheme.name}
                </h4>
                <p
                  className="text-xs"
                  style={{ color: displayTheme.colors.textSecondary }}
                >
                  主题预览
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{ color: displayTheme.colors.textSecondary }}
                >
                  主色
                </span>
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: displayTheme.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: displayTheme.colors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: displayTheme.colors.accent }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{ color: displayTheme.colors.textSecondary }}
                >
                  进度条
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-700">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: "60%",
                      backgroundColor: displayTheme.colors.progress,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded text-xs transition-all"
                  style={{
                    backgroundColor: displayTheme.colors.button,
                    color: displayTheme.colors.background,
                  }}
                >
                  播放
                </button>
                <button
                  className="px-3 py-1 rounded text-xs border transition-all"
                  style={{
                    borderColor: displayTheme.colors.border,
                    color: displayTheme.colors.text,
                  }}
                >
                  暂停
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className={`grid ${compact ? "grid-cols-4" : "grid-cols-4"} gap-2 mb-4`}>
          {members.map((member) => {
            const theme = familyThemeManager.getTheme(member.id);
            const isSelected = selectedMemberId === member.id;
            const isPreviewed = previewTheme?.memberId === member.id;

            return (
              <motion.button
                key={member.id}
                onClick={() => handleMemberSelect(member.id)}
                onDoubleClick={() => handleThemeApply(member.id)}
                className={`relative p-2 rounded-lg border transition-all ${
                  isSelected
                    ? "border-[#00d4ff] bg-[#00d4ff]/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: theme
                        ? `${theme.colors.primary}20`
                        : `${member.color}20`,
                    }}
                  >
                    <member.icon
                      className="w-4 h-4"
                      style={{
                        color: isSelected
                          ? "#00d4ff"
                          : theme
                            ? theme.colors.primary
                            : member.color,
                      }}
                    />
                  </div>
                  {!compact && (
                    <span
                      className={`text-xs ${
                        isSelected ? "text-[#00d4ff]" : "text-gray-400"
                      }`}
                    >
                      {member.shortName}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00d4ff] flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-black" />
                  </motion.div>
                )}

                {isPreviewed && !isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-black" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {previewTheme && previewTheme.memberId !== selectedMemberId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2"
            >
              <Button
                onClick={() => handleThemeApply(previewTheme.memberId)}
                disabled={isTransitioning}
                className="flex-1 bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black"
              >
                {isTransitioning ? "应用中..." : "应用主题"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelPreview}
                disabled={isTransitioning}
                className="border-gray-600 text-gray-300"
              >
                取消
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            单击预览 · 双击应用 · 主题会同步到音乐播放器
          </p>
        </div>
      </div>
    </div>
  );
}

export default ThemeSwitcher;
