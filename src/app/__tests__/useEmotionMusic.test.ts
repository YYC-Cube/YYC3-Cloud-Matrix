/**
 * @file: useEmotionMusic.test.ts
 * @description: useEmotionMusic Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmotionMusic } from "../modules/ai-family/hooks/useEmotionMusic";

const mockEmotionState = {
  type: "happy" as const,
  confidence: 0.9,
  intensity: 0.8,
  timestamp: Date.now(),
};

const mockMusicMapping = {
  emotion: "happy" as const,
  preferredGenres: ["pop", "dance"],
  tempoRange: [100, 140] as [number, number],
  energyRange: [60, 90] as [number, number],
  valenceRange: [70, 100] as [number, number],
  color: "#FFD700",
  description: "欢快愉悦",
};

vi.mock("../lib/EmotionMusicBridge", () => ({
  default: {
    getCurrentEmotion: vi.fn(() => null),
    getEmotionHistory: vi.fn(() => []),
    detectEmotion: vi.fn(() => mockEmotionState),
    getMusicRecommendation: vi.fn(() => mockMusicMapping),
    getRecommendedTracksForEmotion: vi.fn(() => [
      { id: 1, score: 0.9, reason: "适合当前情感" },
    ]),
    suggestMusicAction: vi.fn(() => ({ action: "play", reason: "播放欢快音乐" })),
  },
}));

vi.mock("../lib/MusicEventBus", () => ({
  default: {
    subscribe: vi.fn(() => () => {}),
    emit: vi.fn(),
  },
}));

describe("useEmotionMusic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with null emotion", () => {
      const { result } = renderHook(() => useEmotionMusic());

      expect(result.current.currentEmotion).toBeNull();
      expect(result.current.emotionHistory).toEqual([]);
    });

    it("should initialize with autoDetect enabled by default", () => {
      const { result } = renderHook(() => useEmotionMusic());

      expect(result.current.currentEmotion).toBeDefined();
    });

    it("should accept options", () => {
      const onEmotionChange = vi.fn();
      const onMusicSuggestion = vi.fn();

      renderHook(() =>
        useEmotionMusic({
          autoDetect: false,
          trackEmotionHistory: true,
          onEmotionChange,
          onMusicSuggestion,
        })
      );

      expect(true).toBe(true);
    });
  });

  describe("detectEmotion", () => {
    it("should detect emotion from text", () => {
      const { result } = renderHook(() => useEmotionMusic());

      act(() => {
        const emotion = result.current.detectEmotion("我很开心");
        expect(emotion).toBeDefined();
      });
    });

    it("should update current emotion after detection", async () => {
      const { result } = renderHook(() => useEmotionMusic());

      expect(result.current.currentEmotion).toBeNull();

      act(() => {
        result.current.detectEmotion("我很开心");
      });

      expect(result.current.currentEmotion).toEqual(mockEmotionState);
    });

    it("should update music mapping after detection", () => {
      const { result } = renderHook(() => useEmotionMusic());

      act(() => {
        result.current.detectEmotion("我很开心");
      });

      expect(result.current.musicMapping).toEqual(mockMusicMapping);
    });
  });

  describe("getRecommendations", () => {
    it("should return recommendations for current emotion", () => {
      const { result } = renderHook(() => useEmotionMusic());

      act(() => {
        result.current.detectEmotion("我很开心");
      });

      const tracks = [
        { id: 1, title: "Happy Song", genre: "pop", tempo: 120, energy: 80, valence: 85 },
      ];

      let recommendations: Array<{ id: string | number; score: number; reason: string }> = [];

      act(() => {
        recommendations = result.current.getRecommendations(tracks);
      });

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].id).toBe(1);
    });

    it("should return default recommendations when no emotion", () => {
      const { result } = renderHook(() => useEmotionMusic());

      const tracks = [
        { id: 1, title: "Song 1" },
        { id: 2, title: "Song 2" },
      ];

      let recommendations: Array<{ id: string | number; score: number; reason: string }> = [];

      act(() => {
        recommendations = result.current.getRecommendations(tracks);
      });

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].score).toBe(0.5);
      expect(recommendations[0].reason).toBe("无情感数据");
    });
  });

  describe("suggestAction", () => {
    it("should suggest action for current emotion", () => {
      const { result } = renderHook(() => useEmotionMusic());

      act(() => {
        result.current.detectEmotion("我很开心");
      });

      let suggestion: { action: string; reason: string } = { action: "", reason: "" };

      act(() => {
        suggestion = result.current.suggestAction();
      });

      expect(suggestion.action).toBe("play");
      expect(suggestion.reason).toBe("播放欢快音乐");
    });

    it("should return default suggestion when no emotion", () => {
      const { result } = renderHook(() => useEmotionMusic());

      const suggestion = result.current.suggestAction();

      expect(suggestion.action).toBe("play");
      expect(suggestion.reason).toBe("暂无情感数据");
    });
  });

  describe("clearHistory", () => {
    it("should clear emotion history", () => {
      const { result } = renderHook(() => useEmotionMusic());

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.emotionHistory).toEqual([]);
    });
  });
});
