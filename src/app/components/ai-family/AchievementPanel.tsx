/**
 * @file: AchievementPanel.tsx
 * @description: 成就系统 UI 组件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Star, Lock, Unlock, Filter, ChevronDown } from "lucide-react";
import {
  achievementSystem,
  type Achievement,
  type AchievementTier,
  type AchievementCategory,
  type AchievementProgress,
} from "../../lib/AchievementSystem";

interface AchievementPanelProps {
  userId?: string;
  showFilters?: boolean;
  showStats?: boolean;
  compact?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  listening: "收听",
  discovery: "探索",
  social: "社交",
  collection: "收藏",
  voice: "语音",
  emotion: "情感",
  family: "家人",
  special: "特殊",
};

const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: "青铜",
  silver: "白银",
  gold: "黄金",
  diamond: "钻石",
  legendary: "传奇",
};

export function AchievementPanel({
  userId = "default-user",
  showFilters = true,
  showStats = true,
  compact = false,
  onAchievementClick,
  className = "",
}: AchievementPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Map<string, AchievementProgress>>(new Map());
  const [stats, setStats] = useState<{
    totalPoints: number;
    unlockedCount: number;
    totalAchievements: number;
    byTier: Record<AchievementTier, number>;
    byCategory: Record<AchievementCategory, number>;
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | "all">("all");
  const [filterTier, setFilterTier] = useState<AchievementTier | "all">("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  const loadData = useCallback(() => {
    const allAchievements = achievementSystem.getVisibleAchievements();
    setAchievements(allAchievements);

    const userProgress = achievementSystem.getUserAchievements(userId);
    const progressMap = new Map<string, AchievementProgress>();
    userProgress.forEach((p) => progressMap.set(p.achievementId, p));
    setProgress(progressMap);

    const userStats = achievementSystem.getStats(userId);
    setStats(userStats);
  }, [userId]);

  useEffect(() => {
    achievementSystem.initializeUser(userId);
    loadData();

    const unsubscribe = achievementSystem.subscribe((event) => {
      if (event.type === "achievement_unlocked") {
        const achievement = event.payload.achievement as Achievement;
        setNewlyUnlocked(achievement);
        setTimeout(() => setNewlyUnlocked(null), 3000);
        loadData();
      }
    });

    return () => unsubscribe();
  }, [userId, loadData]);

  const filteredAchievements = achievements.filter((a) => {
    if (filterCategory !== "all" && a.category !== filterCategory) {
      return false;
    }
    if (filterTier !== "all" && a.tier !== filterTier) {
      return false;
    }
    if (showUnlockedOnly) {
      const p = progress.get(a.id);
      if (!p?.unlocked) {
        return false;
      }
    }
    return true;
  });

  const getProgressPercentage = (achievementId: string): number => {
    return achievementSystem.getProgressPercentage(userId, achievementId);
  };

  const getTierGradient = (tier: AchievementTier): string => {
    const colors: Record<AchievementTier, string> = {
      bronze: "from-amber-700 to-amber-900",
      silver: "from-gray-400 to-gray-600",
      gold: "from-yellow-500 to-yellow-700",
      diamond: "from-cyan-400 to-blue-600",
      legendary: "from-purple-500 to-pink-600",
    };
    return colors[tier];
  };

  return (
    <div className={`achievement-panel ${className}`}>
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] rounded-xl border border-[#00d4ff]/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="text-white font-medium">成就系统</h3>
          </div>
          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-yellow-400">
                <Star className="w-4 h-4 inline mr-1" />
                {stats.totalPoints} 点
              </span>
              <span className="text-gray-400">
                {stats.unlockedCount}/{stats.totalAchievements} 已解锁
              </span>
            </div>
          )}
        </div>

        {showStats && stats && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(stats.byTier).map(([tier, count]) => (
              count > 0 && (
                <div
                  key={tier}
                  className={`bg-gradient-to-r ${getTierGradient(tier as AchievementTier)} rounded-lg p-2 text-center`}
                >
                  <div className="text-white text-lg font-bold">{count}</div>
                  <div className="text-white/70 text-xs">{TIER_LABELS[tier as AchievementTier]}</div>
                </div>
              )
            ))}
          </div>
        )}

        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as AchievementCategory | "all")}
                className="appearance-none bg-gray-800 text-gray-300 px-3 py-1.5 pr-8 rounded-lg text-sm border border-gray-700 focus:border-[#00d4ff] focus:outline-none"
              >
                <option value="all">所有类别</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as AchievementTier | "all")}
                className="appearance-none bg-gray-800 text-gray-300 px-3 py-1.5 pr-8 rounded-lg text-sm border border-gray-700 focus:border-[#00d4ff] focus:outline-none"
              >
                <option value="all">所有等级</option>
                {Object.entries(TIER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                showUnlockedOnly
                  ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]"
                  : "border-gray-700 text-gray-300 hover:border-gray-600"
              }`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              已解锁
            </button>
          </div>
        )}

        <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-2"} gap-3 max-h-96 overflow-y-auto`}>
          {filteredAchievements.map((achievement) => {
            const achievementProgress = progress.get(achievement.id);
            const isUnlocked = achievementProgress?.unlocked ?? false;
            const percentage = getProgressPercentage(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                onClick={() => onAchievementClick?.(achievement)}
                className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                  isUnlocked
                    ? "border-[#00d4ff]/50 bg-[#00d4ff]/5"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`text-2xl ${isUnlocked ? "" : "grayscale opacity-50"}`}
                    style={{
                      filter: isUnlocked ? "none" : "grayscale(100%)",
                    }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${isUnlocked ? "text-white" : "text-gray-400"}`}>
                        {achievement.name}
                      </span>
                      {isUnlocked ? (
                        <Unlock className="w-3 h-3 text-green-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{achievement.description}</p>

                    {!isUnlocked && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#00d4ff]"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {achievementProgress?.current ?? 0}/{achievement.requirement.target}
                        </span>
                      </div>
                    )}

                    {isUnlocked && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-yellow-400">+{achievement.reward.points} 点</span>
                        {achievement.reward.title && (
                          <span className="text-xs text-[#00d4ff]">{achievement.reward.title}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: achievementSystem.getTierColor(achievement.tier) }}
                />
              </motion.div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>没有符合条件的成就</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{newlyUnlocked.icon}</span>
                <div>
                  <div className="text-white font-bold">成就解锁！</div>
                  <div className="text-white/90">{newlyUnlocked.name}</div>
                  <div className="text-white/70 text-sm">+{newlyUnlocked.reward.points} 点</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AchievementPanel;
