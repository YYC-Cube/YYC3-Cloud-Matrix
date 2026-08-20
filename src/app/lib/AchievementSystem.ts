/**
 * @file: AchievementSystem.ts
 * @description: 音乐成就系统，包含成就定义、解锁条件、奖励机制
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export type AchievementTier = "bronze" | "silver" | "gold" | "diamond" | "legendary";
export type AchievementCategory =
  | "listening"
  | "discovery"
  | "social"
  | "collection"
  | "voice"
  | "emotion"
  | "family"
  | "special";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  relatedMember?: string;
  hidden?: boolean;
  progress?: number;
  unlocked?: boolean;
  unlockedAt?: number;
}

export interface AchievementRequirement {
  type: "count" | "streak" | "time" | "unique" | "combo" | "special";
  target: number;
  metric: string;
  timeWindow?: number;
  conditions?: Record<string, unknown>;
}

export interface AchievementReward {
  points: number;
  title?: string;
  badge?: string;
  unlockFeature?: string;
  memberAffinity?: Record<string, number>;
}

export interface UserAchievementProgress {
  userId: string;
  achievements: Map<string, AchievementProgress>;
  totalPoints: number;
  unlockedCount: number;
  lastUpdated: number;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface AchievementEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-listen",
    name: "初次聆听",
    description: "播放第一首歌曲",
    icon: "🎵",
    tier: "bronze",
    category: "listening",
    requirement: { type: "count", target: 1, metric: "songs_played" },
    reward: { points: 10 },
  },
  {
    id: "music-lover",
    name: "音乐爱好者",
    description: "累计播放 100 首歌曲",
    icon: "🎧",
    tier: "silver",
    category: "listening",
    requirement: { type: "count", target: 100, metric: "songs_played" },
    reward: { points: 100, title: "音乐爱好者" },
  },
  {
    id: "music-enthusiast",
    name: "音乐发烧友",
    description: "累计播放 500 首歌曲",
    icon: "🎶",
    tier: "gold",
    category: "listening",
    requirement: { type: "count", target: 500, metric: "songs_played" },
    reward: { points: 500, title: "音乐发烧友" },
  },
  {
    id: "music-master",
    name: "音乐大师",
    description: "累计播放 1000 首歌曲",
    icon: "🏆",
    tier: "diamond",
    category: "listening",
    requirement: { type: "count", target: 1000, metric: "songs_played" },
    reward: { points: 1000, title: "音乐大师" },
  },
  {
    id: "streak-7",
    name: "周周不断",
    description: "连续 7 天使用音乐播放器",
    icon: "🔥",
    tier: "bronze",
    category: "listening",
    requirement: { type: "streak", target: 7, metric: "daily_usage" },
    reward: { points: 50 },
  },
  {
    id: "streak-30",
    name: "月月坚持",
    description: "连续 30 天使用音乐播放器",
    icon: "💪",
    tier: "silver",
    category: "listening",
    requirement: { type: "streak", target: 30, metric: "daily_usage" },
    reward: { points: 200, title: "坚持达人" },
  },
  {
    id: "streak-100",
    name: "百日如一",
    description: "连续 100 天使用音乐播放器",
    icon: "⭐",
    tier: "gold",
    category: "listening",
    requirement: { type: "streak", target: 100, metric: "daily_usage" },
    reward: { points: 500, title: "百日达人" },
  },
  {
    id: "genre-explorer",
    name: "风格探索者",
    description: "收听 10 种不同音乐风格",
    icon: "🌍",
    tier: "silver",
    category: "discovery",
    requirement: { type: "unique", target: 10, metric: "genres_listened" },
    reward: { points: 100 },
  },
  {
    id: "genre-master",
    name: "风格大师",
    description: "收听 20 种不同音乐风格",
    icon: "🌐",
    tier: "gold",
    category: "discovery",
    requirement: { type: "unique", target: 20, metric: "genres_listened" },
    reward: { points: 300, title: "风格大师" },
  },
  {
    id: "artist-discoverer",
    name: "艺术家发现者",
    description: "收听 50 位不同艺术家的作品",
    icon: "🎤",
    tier: "silver",
    category: "discovery",
    requirement: { type: "unique", target: 50, metric: "artists_listened" },
    reward: { points: 150 },
  },
  {
    id: "first-voice-command",
    name: "语音初体验",
    description: "首次使用语音控制音乐",
    icon: "🗣️",
    tier: "bronze",
    category: "voice",
    requirement: { type: "count", target: 1, metric: "voice_commands" },
    reward: { points: 20 },
  },
  {
    id: "voice-master",
    name: "语音达人",
    description: "使用语音控制 100 次",
    icon: "🎙️",
    tier: "gold",
    category: "voice",
    requirement: { type: "count", target: 100, metric: "voice_commands" },
    reward: { points: 300, title: "语音达人" },
  },
  {
    id: "emotion-aware",
    name: "情感感知",
    description: "首次使用情感音乐推荐",
    icon: "💭",
    tier: "bronze",
    category: "emotion",
    requirement: { type: "count", target: 1, metric: "emotion_recommendations" },
    reward: { points: 30 },
  },
  {
    id: "emotion-master",
    name: "情感大师",
    description: "使用情感推荐 50 次",
    icon: "🧠",
    tier: "gold",
    category: "emotion",
    requirement: { type: "count", target: 50, metric: "emotion_recommendations" },
    reward: { points: 400, title: "情感大师" },
  },
  {
    id: "family-friend",
    name: "家人朋友",
    description: "与 4 位 AI 家人互动",
    icon: "👨‍👩‍👧‍👦",
    tier: "bronze",
    category: "family",
    requirement: { type: "unique", target: 4, metric: "family_members_interacted" },
    reward: { points: 50 },
  },
  {
    id: "family-beloved",
    name: "家人挚爱",
    description: "与所有 8 位 AI 家人互动",
    icon: "💝",
    tier: "gold",
    category: "family",
    requirement: { type: "unique", target: 8, metric: "family_members_interacted" },
    reward: { points: 300, title: "家人挚爱" },
  },
  {
    id: "navigator-fan",
    name: "千行粉丝",
    description: "与千行互动 50 次",
    icon: "👂",
    tier: "silver",
    category: "family",
    requirement: { type: "count", target: 50, metric: "navigator_interactions" },
    reward: { points: 100, memberAffinity: { navigator: 10 } },
    relatedMember: "navigator",
  },
  {
    id: "thinker-fan",
    name: "万物粉丝",
    description: "与万物互动 50 次",
    icon: "🧠",
    tier: "silver",
    category: "family",
    requirement: { type: "count", target: 50, metric: "thinker_interactions" },
    reward: { points: 100, memberAffinity: { thinker: 10 } },
    relatedMember: "thinker",
  },
  {
    id: "prophet-fan",
    name: "先知粉丝",
    description: "与先知互动 50 次",
    icon: "👁️",
    tier: "silver",
    category: "family",
    requirement: { type: "count", target: 50, metric: "prophet_interactions" },
    reward: { points: 100, memberAffinity: { prophet: 10 } },
    relatedMember: "prophet",
  },
  {
    id: "creative-fan",
    name: "灵韵粉丝",
    description: "与灵韵互动 50 次",
    icon: "💡",
    tier: "silver",
    category: "family",
    requirement: { type: "count", target: 50, metric: "creative_interactions" },
    reward: { points: 100, memberAffinity: { creative: 10 } },
    relatedMember: "creative",
  },
  {
    id: "lyrics-creator",
    name: "歌词创作者",
    description: "使用 AI 生成 10 首歌词",
    icon: "✍️",
    tier: "silver",
    category: "special",
    requirement: { type: "count", target: 10, metric: "lyrics_generated" },
    reward: { points: 150 },
  },
  {
    id: "lyrics-master",
    name: "歌词大师",
    description: "使用 AI 生成 50 首歌词",
    icon: "📝",
    tier: "gold",
    category: "special",
    requirement: { type: "count", target: 50, metric: "lyrics_generated" },
    reward: { points: 500, title: "歌词大师" },
  },
  {
    id: "playlist-creator",
    name: "播放列表创建者",
    description: "创建 5 个播放列表",
    icon: "📋",
    tier: "bronze",
    category: "collection",
    requirement: { type: "count", target: 5, metric: "playlists_created" },
    reward: { points: 50 },
  },
  {
    id: "playlist-master",
    name: "播放列表大师",
    description: "创建 20 个播放列表",
    icon: "📑",
    tier: "gold",
    category: "collection",
    requirement: { type: "count", target: 20, metric: "playlists_created" },
    reward: { points: 300, title: "播放列表大师" },
  },
  {
    id: "night-owl",
    name: "夜猫子",
    description: "在凌晨 0-4 点收听音乐 10 次",
    icon: "🦉",
    tier: "bronze",
    category: "special",
    requirement: { type: "count", target: 10, metric: "late_night_listening" },
    reward: { points: 50 },
    hidden: true,
  },
  {
    id: "early-bird",
    name: "早起鸟",
    description: "在早上 5-7 点收听音乐 10 次",
    icon: "🐦",
    tier: "bronze",
    category: "special",
    requirement: { type: "count", target: 10, metric: "early_morning_listening" },
    reward: { points: 50 },
    hidden: true,
  },
  {
    id: "legendary-listener",
    name: "传奇听众",
    description: "解锁所有其他成就",
    icon: "👑",
    tier: "legendary",
    category: "special",
    requirement: { type: "special", target: 26, metric: "achievements_unlocked" },
    reward: { points: 2000, title: "传奇听众", badge: "legendary" },
    hidden: true,
  },
];

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  diamond: "#B9F2FF",
  legendary: "#FF00FF",
};

const TIER_POINTS: Record<AchievementTier, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  diamond: 5,
  legendary: 10,
};

class AchievementSystemClass {
  private achievements: Map<string, Achievement> = new Map();
  private userProgress: Map<string, UserAchievementProgress> = new Map();
  private eventListeners: Set<(event: AchievementEvent) => void> = new Set();

  constructor() {
    ACHIEVEMENTS.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter((a) => a.category === category);
  }

  getAchievementsByTier(tier: AchievementTier): Achievement[] {
    return this.getAllAchievements().filter((a) => a.tier === tier);
  }

  getVisibleAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => !a.hidden);
  }

  getTierColor(tier: AchievementTier): string {
    return TIER_COLORS[tier];
  }

  getTierPoints(tier: AchievementTier): number {
    return TIER_POINTS[tier];
  }

  initializeUser(userId: string): UserAchievementProgress {
    if (this.userProgress.has(userId)) {
      return this.userProgress.get(userId)!;
    }

    const progress: UserAchievementProgress = {
      userId,
      achievements: new Map(),
      totalPoints: 0,
      unlockedCount: 0,
      lastUpdated: Date.now(),
    };

    this.achievements.forEach((achievement) => {
      progress.achievements.set(achievement.id, {
        achievementId: achievement.id,
        current: 0,
        target: achievement.requirement.target,
        unlocked: false,
      });
    });

    this.userProgress.set(userId, progress);
    return progress;
  }

  updateProgress(
    userId: string,
    metric: string,
    value: number,
    _context?: Record<string, unknown>
  ): Achievement[] {
    const progress = this.initializeUser(userId);
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (achievement.requirement.metric !== metric) {
        return;
      }

      const achievementProgress = progress.achievements.get(achievement.id);
      if (!achievementProgress || achievementProgress.unlocked) {
        return;
      }

      if (achievement.requirement.type === "count" || achievement.requirement.type === "unique") {
        achievementProgress.current += value;
      } else if (achievement.requirement.type === "streak") {
        achievementProgress.current = value;
      } else if (achievement.requirement.type === "time") {
        achievementProgress.current = value;
      }

      if (achievementProgress.current >= achievementProgress.target) {
        achievementProgress.unlocked = true;
        achievementProgress.unlockedAt = Date.now();
        progress.unlockedCount++;
        progress.totalPoints += achievement.reward.points;
        newlyUnlocked.push(achievement);

        this.emitEvent({
          type: "achievement_unlocked",
          payload: { achievement, userId },
          timestamp: Date.now(),
        });
      }
    });

    progress.lastUpdated = Date.now();
    return newlyUnlocked;
  }

  getUserProgress(userId: string): UserAchievementProgress | undefined {
    return this.userProgress.get(userId);
  }

  getUserAchievements(userId: string): AchievementProgress[] {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return [];
    }
    return Array.from(progress.achievements.values());
  }

  getUnlockedAchievements(userId: string): Achievement[] {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return [];
    }

    return Array.from(progress.achievements.values())
      .filter((p) => p.unlocked)
      .map((p) => this.achievements.get(p.achievementId))
      .filter((a): a is Achievement => a !== undefined);
  }

  getProgressPercentage(userId: string, achievementId: string): number {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return 0;
    }

    const achievementProgress = progress.achievements.get(achievementId);
    if (!achievementProgress) {
      return 0;
    }

    return Math.min(100, (achievementProgress.current / achievementProgress.target) * 100);
  }

  getTotalProgressPercentage(userId: string): number {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return 0;
    }

    const totalAchievements = this.achievements.size;
    const unlocked = progress.unlockedCount;

    return (unlocked / totalAchievements) * 100;
  }

  getStats(userId: string): {
    totalPoints: number;
    unlockedCount: number;
    totalAchievements: number;
    byTier: Record<AchievementTier, number>;
    byCategory: Record<AchievementCategory, number>;
  } {
    const progress = this.userProgress.get(userId);
    const unlocked = progress ? this.getUnlockedAchievements(userId) : [];

    const byTier: Record<AchievementTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      diamond: 0,
      legendary: 0,
    };

    const byCategory: Record<AchievementCategory, number> = {
      listening: 0,
      discovery: 0,
      social: 0,
      collection: 0,
      voice: 0,
      emotion: 0,
      family: 0,
      special: 0,
    };

    unlocked.forEach((achievement) => {
      byTier[achievement.tier]++;
      byCategory[achievement.category]++;
    });

    return {
      totalPoints: progress?.totalPoints ?? 0,
      unlockedCount: unlocked.length,
      totalAchievements: this.achievements.size,
      byTier,
      byCategory,
    };
  }

  subscribe(listener: (event: AchievementEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(event: AchievementEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Achievement event listener error:", error);
      }
    });
  }

  resetUser(userId: string): void {
    this.userProgress.delete(userId);
  }

  exportProgress(userId: string): string {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return "{}";
    }

    const exportData = {
      userId: progress.userId,
      totalPoints: progress.totalPoints,
      unlockedCount: progress.unlockedCount,
      achievements: Array.from(progress.achievements.entries()).map(([id, p]) => ({
        id,
        current: p.current,
        unlocked: p.unlocked,
        unlockedAt: p.unlockedAt,
      })),
      exportedAt: Date.now(),
    };

    return JSON.stringify(exportData);
  }

  importProgress(userId: string, data: string): boolean {
    try {
      const importData = JSON.parse(data);
      const progress = this.initializeUser(userId);

      progress.totalPoints = importData.totalPoints ?? 0;
      progress.unlockedCount = importData.unlockedCount ?? 0;

      importData.achievements?.forEach((a: { id: string; current: number; unlocked: boolean; unlockedAt?: number }) => {
        const existing = progress.achievements.get(a.id);
        if (existing) {
          existing.current = a.current;
          existing.unlocked = a.unlocked;
          existing.unlockedAt = a.unlockedAt;
        }
      });

      progress.lastUpdated = Date.now();
      return true;
    } catch {
      return false;
    }
  }
}

export const achievementSystem = new AchievementSystemClass();

export default achievementSystem;
