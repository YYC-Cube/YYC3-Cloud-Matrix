/**
 * @file: useEmotionMusic.ts
 * @description: 情感感知音乐控制 Hook
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback, useRef } from "react";
import musicEventBus from "../../../lib/MusicEventBus";
import emotionMusicBridge, {
  type EmotionType,
  type EmotionState,
  type EmotionMusicMapping,
  type UserBehavior,
} from "../../../lib/EmotionMusicBridge";

export interface UseEmotionMusicOptions {
  autoDetect?: boolean;
  trackEmotionHistory?: boolean;
  onEmotionChange?: (emotion: EmotionState) => void;
  onMusicSuggestion?: (suggestion: ReturnType<typeof emotionMusicBridge.suggestMusicAction>) => void;
}

export interface UseEmotionMusicReturn {
  currentEmotion: EmotionState | null;
  emotionHistory: EmotionState[];
  musicMapping: EmotionMusicMapping | null;
  detectEmotion: (text: string, behavior?: UserBehavior) => EmotionState;
  getRecommendations: <T extends { id: string | number; title: string }>(
    tracks: Array<T & {
      genre?: string;
      tempo?: number;
      energy?: number;
      valence?: number;
    }>
  ) => Array<{ id: string | number; score: number; reason: string }>;
  suggestAction: () => ReturnType<typeof emotionMusicBridge.suggestMusicAction>;
  clearHistory: () => void;
}

export function useEmotionMusic(options: UseEmotionMusicOptions = {}): UseEmotionMusicReturn {
  const {
    autoDetect = true,
    trackEmotionHistory = true,
    onEmotionChange,
    onMusicSuggestion,
  } = options;

  const [currentEmotion, setCurrentEmotion] = useState<EmotionState | null>(
    emotionMusicBridge.getCurrentEmotion()
  );
  const [emotionHistory, setEmotionHistory] = useState<EmotionState[]>(
    emotionMusicBridge.getEmotionHistory()
  );
  const [musicMapping, setMusicMapping] = useState<EmotionMusicMapping | null>(null);

  const onEmotionChangeRef = useRef(onEmotionChange);
  const onMusicSuggestionRef = useRef(onMusicSuggestion);

  useEffect(() => {
    onEmotionChangeRef.current = onEmotionChange;
    onMusicSuggestionRef.current = onMusicSuggestion;
  }, [onEmotionChange, onMusicSuggestion]);

  useEffect(() => {
    if (!autoDetect) {
      return;
    }

    const handleEmotionDetected = (event: typeof musicEventBus extends { emit: (e: infer E) => void } ? E : never) => {
      if (event.type !== "emotion:detected") {
        return;
      }

      const emotionState: EmotionState = {
        type: event.payload.emotion as EmotionType,
        confidence: event.payload.confidence,
        intensity: event.payload.intensity,
        timestamp: event.payload.timestamp,
      };

      setCurrentEmotion(emotionState);
      setMusicMapping(emotionMusicBridge.getMusicRecommendation(emotionState.type));

      if (trackEmotionHistory) {
        setEmotionHistory(emotionMusicBridge.getEmotionHistory());
      }

      onEmotionChangeRef.current?.(emotionState);
    };

    const handleEmotionChanged = (event: typeof musicEventBus extends { emit: (e: infer E) => void } ? E : never) => {
      if (event.type !== "emotion:changed") {
        return;
      }

      const suggestion = emotionMusicBridge.suggestMusicAction(
        event.payload.currentEmotion as EmotionType
      );

      onMusicSuggestionRef.current?.(suggestion);
    };

    const unsubDetected = musicEventBus.subscribe("emotion:detected", handleEmotionDetected as (data: unknown) => void);
    const unsubChanged = musicEventBus.subscribe("emotion:changed", handleEmotionChanged as (data: unknown) => void);

    return () => {
      unsubDetected();
      unsubChanged();
    };
  }, [autoDetect, trackEmotionHistory]);

  const detectEmotion = useCallback((text: string, behavior?: UserBehavior): EmotionState => {
    const emotion = emotionMusicBridge.detectEmotion(text, behavior);
    setCurrentEmotion(emotion);
    setMusicMapping(emotionMusicBridge.getMusicRecommendation(emotion.type));

    if (trackEmotionHistory) {
      setEmotionHistory(emotionMusicBridge.getEmotionHistory());
    }

    return emotion;
  }, [trackEmotionHistory]);

  const getRecommendations = useCallback(
    <T extends { id: string | number; title: string }>(
      tracks: Array<T & {
        genre?: string;
        tempo?: number;
        energy?: number;
        valence?: number;
      }>
    ): Array<{ id: string | number; score: number; reason: string }> => {
      if (!currentEmotion) {
        return tracks.map((track) => ({
          id: track.id,
          score: 0.5,
          reason: "无情感数据",
        }));
      }

      return emotionMusicBridge.getRecommendedTracksForEmotion(currentEmotion.type, tracks);
    },
    [currentEmotion]
  );

  const suggestAction = useCallback(() => {
    if (!currentEmotion) {
      return {
        action: "play" as const,
        reason: "暂无情感数据",
      };
    }

    return emotionMusicBridge.suggestMusicAction(currentEmotion.type);
  }, [currentEmotion]);

  const clearHistory = useCallback(() => {
    setEmotionHistory([]);
  }, []);

  return {
    currentEmotion,
    emotionHistory,
    musicMapping,
    detectEmotion,
    getRecommendations,
    suggestAction,
    clearHistory,
  };
}

export default useEmotionMusic;
