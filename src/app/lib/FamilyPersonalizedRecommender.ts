/**
 * @file: FamilyPersonalizedRecommender.ts
 * @description: 家人角色个性化音乐推荐系统
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { FamilyDataAccessor } from "../modules/ai-family/lib/family-data-accessor";
import type { FamilyMember } from "../modules/ai-family/components/shared";

/** 运行时从 store 或 shared.ts fallback 获取成员列表 */
const FAMILY_MEMBERS = FamilyDataAccessor.getMembers();
import type { EmotionType } from "./EmotionMusicBridge";

export interface FamilyRecommendationContext {
  memberId: string;
  userEmotion?: EmotionType;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  activity?: "working" | "relaxing" | "exercising" | "learning" | "socializing";
  recentGenres?: string[];
  userPreferences?: {
    likedGenres: string[];
    dislikedGenres: string[];
    tempoPreference: [number, number];
    energyPreference: [number, number];
  };
}

export interface FamilyRecommendation {
  memberId: string;
  memberName: string;
  recommendedTracks: RecommendedTrack[];
  reasoning: string;
  confidence: number;
  timestamp: number;
}

export interface RecommendedTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  energy: number;
  valence: number;
  matchScore: number;
  reasons: string[];
}

export interface FamilyRecommendationWeights {
  emotionMatch: number;
  genreMatch: number;
  tempoMatch: number;
  energyMatch: number;
  personalityMatch: number;
  timeContext: number;
}

const DEFAULT_WEIGHTS: FamilyRecommendationWeights = {
  emotionMatch: 0.25,
  genreMatch: 0.20,
  tempoMatch: 0.15,
  energyMatch: 0.15,
  personalityMatch: 0.15,
  timeContext: 0.10,
};

const FAMILY_MUSIC_PERSONALITIES: Record<
  string,
  {
    preferredGenres: string[];
    avoidedGenres: string[];
    tempoRange: [number, number];
    energyRange: [number, number];
    valencePreference: number;
    description: string;
  }
> = {
  navigator: {
    preferredGenres: ["pop", "indie", "acoustic", "folk"],
    avoidedGenres: ["metal", "industrial", "dark-ambient"],
    tempoRange: [100, 130],
    energyRange: [60, 85],
    valencePreference: 0.7,
    description: "千行喜欢轻快、有活力的音乐，适合语言交流和日常陪伴",
  },
  thinker: {
    preferredGenres: ["classical", "ambient", "jazz", "electronic"],
    avoidedGenres: ["trap", "brostep", "hardcore"],
    tempoRange: [60, 100],
    energyRange: [30, 60],
    valencePreference: 0.5,
    description: "万物偏好深沉、有思考空间的音乐，适合深度分析场景",
  },
  prophet: {
    preferredGenres: ["electronic", "ambient", "new-age", "cinematic"],
    avoidedGenres: ["country", "polka", "novelty"],
    tempoRange: [70, 110],
    energyRange: [40, 70],
    valencePreference: 0.55,
    description: "先知喜欢神秘、有预见感的音乐，适合预测和洞察场景",
  },
  bolero: {
    preferredGenres: ["folk", "soul", "r&b", "soft-rock"],
    avoidedGenres: ["death-metal", "hardcore-techno"],
    tempoRange: [80, 120],
    energyRange: [50, 75],
    valencePreference: 0.65,
    description: "伯乐偏好温暖、有人情味的音乐，适合发现和推荐场景",
  },
  "meta-oracle": {
    preferredGenres: ["orchestral", "epic", "cinematic", "electronic"],
    avoidedGenres: ["bubblegum-pop", "novelty"],
    tempoRange: [80, 120],
    energyRange: [55, 80],
    valencePreference: 0.6,
    description: "天枢偏好大气、有全局感的音乐，适合统筹和决策场景",
  },
  sentinel: {
    preferredGenres: ["electronic", "industrial", "dark-ambient", "downtempo"],
    avoidedGenres: ["bubblegum-pop", "happy-hardcore"],
    tempoRange: [90, 130],
    energyRange: [50, 80],
    valencePreference: 0.45,
    description: "守护偏好冷静、有安全感的音乐，适合监控和保护场景",
  },
  master: {
    preferredGenres: ["classical", "baroque", "chamber", "jazz"],
    avoidedGenres: ["trap", "mumble-rap"],
    tempoRange: [70, 110],
    energyRange: [40, 65],
    valencePreference: 0.55,
    description: "宗师偏好精致、有品质的音乐，适合学习和精进场景",
  },
  creative: {
    preferredGenres: ["electronic", "pop", "indie", "experimental", "dream-pop"],
    avoidedGenres: ["corporate-pop", "generic-country"],
    tempoRange: [110, 150],
    energyRange: [70, 95],
    valencePreference: 0.75,
    description: "灵韵偏好创意、有灵感的音乐，适合创作和艺术场景",
  },
};

const EMOTION_FAMILY_AFFINITY: Record<EmotionType, string[]> = {
  happy: ["navigator", "creative", "bolero"],
  sad: ["thinker", "sentinel"],
  angry: ["sentinel", "meta-oracle"],
  anxious: ["prophet", "thinker"],
  calm: ["thinker", "master", "prophet"],
  excited: ["creative", "navigator"],
  neutral: ["meta-oracle", "master"],
  confused: ["thinker", "master"],
  relaxed: ["bolero", "prophet"],
};

const TIME_FAMILY_AFFINITY: Record<string, string[]> = {
  morning: ["navigator", "creative"],
  afternoon: ["bolero", "master"],
  evening: ["thinker", "prophet"],
  night: ["sentinel", "meta-oracle"],
};

const ACTIVITY_FAMILY_AFFINITY: Record<string, string[]> = {
  working: ["master", "meta-oracle", "thinker"],
  relaxing: ["bolero", "thinker", "prophet"],
  exercising: ["creative", "navigator"],
  learning: ["master", "thinker"],
  socializing: ["navigator", "creative", "bolero"],
};

class FamilyPersonalizedRecommenderClass {
  private recommendationHistory: Map<string, FamilyRecommendation[]> = new Map();
  private maxHistoryPerMember = 50;

  getBestMemberForContext(context: FamilyRecommendationContext): FamilyMember {
    const scores: Map<string, number> = new Map();

    FAMILY_MEMBERS.forEach((member) => {
      let score = 0;

      if (context.userEmotion) {
        const emotionAffinity = EMOTION_FAMILY_AFFINITY[context.userEmotion] || [];
        if (emotionAffinity.includes(member.id)) {
          score += 30;
        }
      }

      if (context.timeOfDay) {
        const timeAffinity = TIME_FAMILY_AFFINITY[context.timeOfDay] || [];
        if (timeAffinity.includes(member.id)) {
          score += 20;
        }
      }

      if (context.activity) {
        const activityAffinity = ACTIVITY_FAMILY_AFFINITY[context.activity] || [];
        if (activityAffinity.includes(member.id)) {
          score += 25;
        }
      }

      if (context.memberId === member.id) {
        score += 15;
      }

      scores.set(member.id, score);
    });

    let bestMemberId = "navigator";
    let bestScore = 0;

    scores.forEach((score, memberId) => {
      if (score > bestScore) {
        bestScore = score;
        bestMemberId = memberId;
      }
    });

    return FAMILY_MEMBERS.find((m) => m.id === bestMemberId) || FAMILY_MEMBERS[0];
  }

  generateRecommendation(
    availableTracks: RecommendedTrack[],
    context: FamilyRecommendationContext,
    weights: Partial<FamilyRecommendationWeights> = {}
  ): FamilyRecommendation {
    const effectiveWeights = { ...DEFAULT_WEIGHTS, ...weights };
    const member = FAMILY_MEMBERS.find((m) => m.id === context.memberId);
    const personality = FAMILY_MUSIC_PERSONALITIES[context.memberId];

    if (!member || !personality) {
      return this.getDefaultRecommendation(availableTracks, context);
    }

    const scoredTracks = availableTracks.map((track) => {
      const score = this.scoreTrackForFamily(track, context, personality, effectiveWeights);
      const reasons = this.generateReasons(track, context, personality, score);
      return {
        ...track,
        matchScore: score.total,
        reasons,
      };
    });

    scoredTracks.sort((a, b) => b.matchScore - a.matchScore);

    const topTracks = scoredTracks.slice(0, 10);
    const reasoning = this.generateReasoning(member, context, topTracks);

    const recommendation: FamilyRecommendation = {
      memberId: member.id,
      memberName: member.name,
      recommendedTracks: topTracks,
      reasoning,
      confidence: this.calculateConfidence(topTracks),
      timestamp: Date.now(),
    };

    this.addToHistory(member.id, recommendation);

    return recommendation;
  }

  private scoreTrackForFamily(
    track: RecommendedTrack,
    context: FamilyRecommendationContext,
    personality: (typeof FAMILY_MUSIC_PERSONALITIES)[string],
    weights: FamilyRecommendationWeights
  ): { total: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};

    const genreScore = this.scoreGenreMatch(track.genre, personality);
    breakdown.genreMatch = genreScore * weights.genreMatch;

    const tempoScore = this.scoreTempoMatch(track.tempo, personality.tempoRange);
    breakdown.tempoMatch = tempoScore * weights.tempoMatch;

    const energyScore = this.scoreEnergyMatch(track.energy, personality.energyRange);
    breakdown.energyMatch = energyScore * weights.energyMatch;

    const emotionScore = context.userEmotion
      ? this.scoreEmotionMatch(track, context.userEmotion)
      : 0.5;
    breakdown.emotionMatch = emotionScore * weights.emotionMatch;

    const personalityScore = this.scorePersonalityMatch(track, personality);
    breakdown.personalityMatch = personalityScore * weights.personalityMatch;

    const timeScore = context.timeOfDay
      ? this.scoreTimeContext(track, context.timeOfDay)
      : 0.5;
    breakdown.timeContext = timeScore * weights.timeContext;

    const total = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

    return { total, breakdown };
  }

  private scoreGenreMatch(genre: string, personality: (typeof FAMILY_MUSIC_PERSONALITIES)[string]): number {
    if (personality.preferredGenres.includes(genre)) {
      return 1.0;
    }
    if (personality.avoidedGenres.includes(genre)) {
      return 0.1;
    }
    return 0.5;
  }

  private scoreTempoMatch(tempo: number, range: [number, number]): number {
    const [min, max] = range;
    if (tempo >= min && tempo <= max) {
      const mid = (min + max) / 2;
      const distance = Math.abs(tempo - mid);
      const maxDistance = (max - min) / 2;
      return 1 - distance / maxDistance;
    }
    const distanceToRange = tempo < min ? min - tempo : tempo - max;
    return Math.max(0, 1 - distanceToRange / 50);
  }

  private scoreEnergyMatch(energy: number, range: [number, number]): number {
    const [min, max] = range;
    if (energy >= min && energy <= max) {
      return 1.0;
    }
    const distanceToRange = energy < min ? min - energy : energy - max;
    return Math.max(0, 1 - distanceToRange / 30);
  }

  private scoreEmotionMatch(track: RecommendedTrack, emotion: EmotionType): number {
    const emotionValenceMap: Record<EmotionType, number> = {
      happy: 0.8,
      sad: 0.2,
      angry: 0.3,
      anxious: 0.35,
      calm: 0.6,
      excited: 0.85,
      neutral: 0.5,
      confused: 0.4,
      relaxed: 0.65,
    };

    const targetValence = emotionValenceMap[emotion];
    const valenceDiff = Math.abs(track.valence / 100 - targetValence);

    return Math.max(0, 1 - valenceDiff);
  }

  private scorePersonalityMatch(
    track: RecommendedTrack,
    personality: (typeof FAMILY_MUSIC_PERSONALITIES)[string]
  ): number {
    const valenceDiff = Math.abs(track.valence / 100 - personality.valencePreference);
    return Math.max(0, 1 - valenceDiff);
  }

  private scoreTimeContext(track: RecommendedTrack, timeOfDay: string): number {
    const timeEnergyMap: Record<string, [number, number]> = {
      morning: [60, 80],
      afternoon: [50, 70],
      evening: [40, 65],
      night: [30, 55],
    };

    const [minEnergy, maxEnergy] = timeEnergyMap[timeOfDay] || [50, 70];
    if (track.energy >= minEnergy && track.energy <= maxEnergy) {
      return 1.0;
    }
    const distanceToRange =
      track.energy < minEnergy ? minEnergy - track.energy : track.energy - maxEnergy;
    return Math.max(0, 1 - distanceToRange / 30);
  }

  private generateReasons(
    track: RecommendedTrack,
    context: FamilyRecommendationContext,
    personality: (typeof FAMILY_MUSIC_PERSONALITIES)[string],
    _score: { total: number; breakdown: Record<string, number> }
  ): string[] {
    const reasons: string[] = [];

    if (personality.preferredGenres.includes(track.genre)) {
      reasons.push(`${personality.description.split("，")[0]}偏好的风格`);
    }

    if (context.userEmotion) {
      const emotionReasons: Record<EmotionType, string> = {
        happy: "适合开心时聆听",
        sad: "能抚慰忧伤的心情",
        angry: "有助于释放情绪",
        anxious: "能缓解焦虑感",
        calm: "保持平静的心境",
        excited: "延续兴奋的感觉",
        neutral: "中性百搭的选择",
        confused: "帮助理清思绪",
        relaxed: "延续放松的状态",
      };
      reasons.push(emotionReasons[context.userEmotion]);
    }

    if (context.timeOfDay) {
      const timeReasons: Record<string, string> = {
        morning: "适合清晨聆听",
        afternoon: "午后的好伴侣",
        evening: "傍晚的放松之选",
        night: "夜晚的宁静时光",
      };
      reasons.push(timeReasons[context.timeOfDay]);
    }

    if (track.energy >= 70) {
      reasons.push("充满活力");
    } else if (track.energy <= 40) {
      reasons.push("舒缓放松");
    }

    return reasons.slice(0, 3);
  }

  private generateReasoning(
    member: FamilyMember,
    context: FamilyRecommendationContext,
    tracks: RecommendedTrack[]
  ): string {
    const personality = FAMILY_MUSIC_PERSONALITIES[member.id];
    const avgScore =
      tracks.reduce((sum, t) => sum + t.matchScore, 0) / tracks.length;

    let reasoning = `${member.shortName}为你精选了${tracks.length}首歌曲。`;

    if (context.userEmotion) {
      const emotionText: Record<EmotionType, string> = {
        happy: "开心",
        sad: "忧伤",
        angry: "愤怒",
        anxious: "焦虑",
        calm: "平静",
        excited: "兴奋",
        neutral: "中性",
        confused: "困惑",
        relaxed: "放松",
      };
      reasoning += `基于你当前的${emotionText[context.userEmotion]}情绪，`;
    }

    if (context.timeOfDay) {
      const timeText: Record<string, string> = {
        morning: "清晨",
        afternoon: "午后",
        evening: "傍晚",
        night: "夜晚",
      };
      reasoning += `结合${timeText[context.timeOfDay]}的氛围，`;
    }

    reasoning += personality.description;

    if (avgScore > 0.8) {
      reasoning += "这些歌曲与你的偏好高度匹配。";
    } else if (avgScore > 0.6) {
      reasoning += "这些歌曲应该会让你喜欢。";
    } else {
      reasoning += "希望这些推荐能给你带来惊喜。";
    }

    return reasoning;
  }

  private calculateConfidence(tracks: RecommendedTrack[]): number {
    if (tracks.length === 0) {return 0;}
    const avgScore = tracks.reduce((sum, t) => sum + t.matchScore, 0) / tracks.length;
    return Math.min(1, avgScore * 1.2);
  }

  private getDefaultRecommendation(
    availableTracks: RecommendedTrack[],
    context: FamilyRecommendationContext
  ): FamilyRecommendation {
    const member = FAMILY_MEMBERS.find((m) => m.id === context.memberId) || FAMILY_MEMBERS[0];

    return {
      memberId: member.id,
      memberName: member.name,
      recommendedTracks: availableTracks.slice(0, 10).map((t) => ({
        ...t,
        matchScore: 0.5,
        reasons: ["默认推荐"],
      })),
      reasoning: `${member.shortName}为你推荐了一些歌曲。`,
      confidence: 0.5,
      timestamp: Date.now(),
    };
  }

  private addToHistory(memberId: string, recommendation: FamilyRecommendation): void {
    if (!this.recommendationHistory.has(memberId)) {
      this.recommendationHistory.set(memberId, []);
    }

    const history = this.recommendationHistory.get(memberId)!;
    history.push(recommendation);

    if (history.length > this.maxHistoryPerMember) {
      history.shift();
    }
  }

  getHistory(memberId: string): FamilyRecommendation[] {
    return this.recommendationHistory.get(memberId) || [];
  }

  getFamilyMusicPreferences(memberId: string): {
    preferredGenres: string[];
    avoidedGenres: string[];
    tempoRange: [number, number];
    energyRange: [number, number];
  } {
    const personality = FAMILY_MUSIC_PERSONALITIES[memberId];
    if (!personality) {
      return {
        preferredGenres: [],
        avoidedGenres: [],
        tempoRange: [80, 120],
        energyRange: [50, 70],
      };
    }

    return {
      preferredGenres: personality.preferredGenres,
      avoidedGenres: personality.avoidedGenres,
      tempoRange: personality.tempoRange,
      energyRange: personality.energyRange,
    };
  }
}

export const familyPersonalizedRecommender = new FamilyPersonalizedRecommenderClass();

export default familyPersonalizedRecommender;
