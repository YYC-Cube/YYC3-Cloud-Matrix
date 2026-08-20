/**
 * @file: SmartPlaylistGenerator.ts
 * @description: 智能播放列表生成引擎
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import {
  type EmotionType,
  type EmotionState,
  EMOTION_MUSIC_MAPPINGS,
} from "./EmotionMusicBridge";

export interface TrackInfo {
  id: string | number;
  title: string;
  artist: string;
  duration: string;
  genre?: string;
  tempo?: number;
  energy?: number;
  valence?: number;
  color?: string;
}

export interface PlaylistConfig {
  name: string;
  description: string;
  targetEmotion: EmotionType;
  tracks: TrackInfo[];
  createdAt: number;
  duration: number;
}

export interface PlaylistGenerationOptions {
  maxTracks?: number;
  minDuration?: number;
  maxDuration?: number;
  preferRecentEmotions?: boolean;
  includeTransition?: boolean;
  shuffle?: boolean;
}

const DEFAULT_OPTIONS: PlaylistGenerationOptions = {
  maxTracks: 20,
  minDuration: 30 * 60 * 1000,
  maxDuration: 90 * 60 * 1000,
  preferRecentEmotions: true,
  includeTransition: true,
  shuffle: false,
};

class SmartPlaylistGeneratorClass {
  private emotionWeights: Map<EmotionType, number> = new Map();

  calculateEmotionWeights(emotionHistory: EmotionState[]): Map<EmotionType, number> {
    const weights = new Map<EmotionType, number>();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    emotionHistory.forEach((emotion) => {
      const age = now - emotion.timestamp;
      if (age > maxAge) {
        return;
      }

      const timeWeight = 1 - age / maxAge;
      const intensityWeight = emotion.intensity;
      const confidenceWeight = emotion.confidence;

      const currentWeight = weights.get(emotion.type) || 0;
      const additionalWeight = timeWeight * intensityWeight * confidenceWeight;

      weights.set(emotion.type, currentWeight + additionalWeight);
    });

    const totalWeight = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      weights.forEach((weight, emotion) => {
        weights.set(emotion, weight / totalWeight);
      });
    }

    this.emotionWeights = weights;
    return weights;
  }

  getDominantEmotion(emotionHistory: EmotionState[]): EmotionType {
    if (emotionHistory.length === 0) {
      return "neutral";
    }

    const weights = this.calculateEmotionWeights(emotionHistory);
    let dominantEmotion: EmotionType = "neutral";
    let maxWeight = 0;

    weights.forEach((weight, emotion) => {
      if (weight > maxWeight) {
        maxWeight = weight;
        dominantEmotion = emotion;
      }
    });

    return dominantEmotion;
  }

  scoreTrack(
    track: TrackInfo,
    targetEmotion: EmotionType,
    emotionWeights: Map<EmotionType, number>
  ): number {
    const mapping = EMOTION_MUSIC_MAPPINGS[targetEmotion];
    let score = 0;

    if (track.genre && mapping.preferredGenres.includes(track.genre)) {
      score += 0.35;
    }

    if (track.tempo !== undefined) {
      const [minTempo, maxTempo] = mapping.tempoRange;
      const tempoRange = maxTempo - minTempo;
      const tempoCenter = (minTempo + maxTempo) / 2;
      const tempoDiff = Math.abs(track.tempo - tempoCenter);
      const tempoScore = Math.max(0, 1 - tempoDiff / tempoRange);
      score += tempoScore * 0.25;
    }

    if (track.energy !== undefined) {
      const [minEnergy, maxEnergy] = mapping.energyRange;
      if (track.energy >= minEnergy && track.energy <= maxEnergy) {
        score += 0.2;
      } else {
        const energyDiff = Math.min(
          Math.abs(track.energy - minEnergy),
          Math.abs(track.energy - maxEnergy)
        );
        score += Math.max(0, 0.2 - energyDiff * 0.005);
      }
    }

    if (track.valence !== undefined) {
      const [minValence, maxValence] = mapping.valenceRange;
      if (track.valence >= minValence && track.valence <= maxValence) {
        score += 0.15;
      }
    }

    emotionWeights.forEach((weight, emotion) => {
      const em = EMOTION_MUSIC_MAPPINGS[emotion];
      if (track.genre && em.preferredGenres.includes(track.genre)) {
        score += weight * 0.05;
      }
    });

    return Math.min(1, score);
  }

  generatePlaylist(
    availableTracks: TrackInfo[],
    emotionHistory: EmotionState[],
    options: PlaylistGenerationOptions = {}
  ): PlaylistConfig {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (availableTracks.length === 0) {
      return {
        name: "空播放列表",
        description: "没有可用的曲目",
        targetEmotion: "neutral",
        tracks: [],
        createdAt: Date.now(),
        duration: 0,
      };
    }

    const dominantEmotion = this.getDominantEmotion(emotionHistory);
    const weights = this.calculateEmotionWeights(emotionHistory);
    const mapping = EMOTION_MUSIC_MAPPINGS[dominantEmotion];

    const scoredTracks = availableTracks.map((track) => ({
      track,
      score: this.scoreTrack(track, dominantEmotion, weights),
    }));

    scoredTracks.sort((a, b) => b.score - a.score);

    let selectedTracks: TrackInfo[] = [];
    let totalDuration = 0;

    for (const { track } of scoredTracks) {
      if (selectedTracks.length >= opts.maxTracks!) {
        break;
      }

      const trackDuration = this.parseDuration(track.duration);
      if (totalDuration + trackDuration > opts.maxDuration!) {
        continue;
      }

      selectedTracks.push(track);
      totalDuration += trackDuration;

      if (totalDuration >= opts.minDuration!) {
        break;
      }
    }

    if (opts.includeTransition && selectedTracks.length > 3) {
      selectedTracks = this.addTransitions(selectedTracks, dominantEmotion);
    }

    if (opts.shuffle) {
      selectedTracks = this.smartShuffle(selectedTracks);
    }

    const emotionLabels: Record<EmotionType, string> = {
      happy: "欢快", sad: "舒缓", anxious: "平静", confused: "专注",
      angry: "宣泄", neutral: "轻松", excited: "激情", calm: "宁静", relaxed: "悠闲",
    };

    return {
      name: `${emotionLabels[dominantEmotion]}时刻`,
      description: `基于您近期的${mapping.description}心情，为您精选${selectedTracks.length}首曲目`,
      targetEmotion: dominantEmotion,
      tracks: selectedTracks,
      createdAt: Date.now(),
      duration: totalDuration,
    };
  }

  private parseDuration(duration: string): number {
    const parts = duration.split(":");
    if (parts.length === 2) {
      return (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
    }
    return 3 * 60 * 1000;
  }

  private addTransitions(tracks: TrackInfo[], targetEmotion: EmotionType): TrackInfo[] {
    const result: TrackInfo[] = [];
    const mapping = EMOTION_MUSIC_MAPPINGS[targetEmotion];

    for (let i = 0; i < tracks.length; i++) {
      result.push(tracks[i]);

      if (i < tracks.length - 1 && i % 3 === 2) {
        const nextTrack = tracks[i + 1];
        const currentEnergy = tracks[i].energy ?? 50;
        const nextEnergy = nextTrack.energy ?? 50;

        if (Math.abs(currentEnergy - nextEnergy) > 20) {
          const transitionTrack: TrackInfo = {
            id: `transition-${i}`,
            title: "♪ 过渡",
            artist: "AI Mix",
            duration: "0:30",
            energy: (currentEnergy + nextEnergy) / 2,
            genre: mapping.preferredGenres[0],
            color: mapping.color,
          };
          result.push(transitionTrack);
        }
      }
    }

    return result;
  }

  private smartShuffle(tracks: TrackInfo[]): TrackInfo[] {
    const result: TrackInfo[] = [];
    const remaining = [...tracks];

    while (remaining.length > 0) {
      const weights = remaining.map((track, _index) => {
        const lastTrack = result[result.length - 1];
        if (!lastTrack) {
          return 1;
        }

        const energyDiff = Math.abs((track.energy ?? 50) - (lastTrack.energy ?? 50));
        const tempoDiff = Math.abs((track.tempo ?? 120) - (lastTrack.tempo ?? 120));

        return 1 / (1 + energyDiff * 0.01 + tempoDiff * 0.005);
      });

      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;

      for (let i = 0; i < remaining.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          result.push(remaining.splice(i, 1)[0]);
          break;
        }
      }
    }

    return result;
  }

  generateMoodBoostPlaylist(
    availableTracks: TrackInfo[],
    currentEmotion: EmotionType,
    targetEmotion: EmotionType
  ): PlaylistConfig {
    const currentMapping = EMOTION_MUSIC_MAPPINGS[currentEmotion];
    const targetMapping = EMOTION_MUSIC_MAPPINGS[targetEmotion];

    const scoredTracks = availableTracks.map((track) => {
      let score = 0;

      if (track.valence !== undefined) {
        const targetValence = (targetMapping.valenceRange[0] + targetMapping.valenceRange[1]) / 2;
        score += (targetValence - Math.abs(track.valence - targetValence)) / 100;
      }

      if (track.energy !== undefined) {
        const targetEnergy = (targetMapping.energyRange[0] + targetMapping.energyRange[1]) / 2;
        score += (targetEnergy - Math.abs(track.energy - targetEnergy)) / 200;
      }

      if (track.genre && targetMapping.preferredGenres.includes(track.genre)) {
        score += 0.3;
      }

      return { track, score };
    });

    scoredTracks.sort((a, b) => b.score - a.score);

    const selectedTracks = scoredTracks.slice(0, 15).map(({ track }) => track);

    return {
      name: `心情提升：${EMOTION_MUSIC_MAPPINGS[targetEmotion].description}`,
      description: `从${currentMapping.description}到${targetMapping.description}的音乐旅程`,
      targetEmotion,
      tracks: selectedTracks,
      createdAt: Date.now(),
      duration: selectedTracks.reduce((sum, t) => sum + this.parseDuration(t.duration), 0),
    };
  }

  generateFocusPlaylist(availableTracks: TrackInfo[]): PlaylistConfig {
    const focusTracks = availableTracks.filter((track) => {
      const energy = track.energy ?? 50;
      const speechiness = ((track as unknown) as Record<string, unknown>).speechiness as number ?? 20;
      const instrumentalness = ((track as unknown) as Record<string, unknown>).instrumentalness as number ?? 50;

      return (
        energy >= 30 &&
        energy <= 60 &&
        speechiness < 30 &&
        instrumentalness > 40
      );
    });

    focusTracks.sort((a, b) => {
      const aScore = (a.tempo ?? 100) - 100;
      const bScore = (b.tempo ?? 100) - 100;
      return Math.abs(aScore) - Math.abs(bScore);
    });

    const selectedTracks = focusTracks.slice(0, 20);

    return {
      name: "专注时刻",
      description: "低干扰、高专注的背景音乐",
      targetEmotion: "calm",
      tracks: selectedTracks,
      createdAt: Date.now(),
      duration: selectedTracks.reduce((sum, t) => sum + this.parseDuration(t.duration), 0),
    };
  }
}

export const smartPlaylistGenerator = new SmartPlaylistGeneratorClass();

export default smartPlaylistGenerator;
