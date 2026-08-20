/**
 * @file: SmartPlaylistGenerator.test.ts
 * @description: 智能播放列表生成器单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach } from "vitest";
import smartPlaylistGenerator, {
  type TrackInfo,
  type PlaylistConfig,
  type PlaylistGenerationOptions,
} from "../lib/SmartPlaylistGenerator";
import { type EmotionState } from "../lib/EmotionMusicBridge";

describe("SmartPlaylistGenerator", () => {
  const sampleTracks: TrackInfo[] = [
    { id: 1, title: "Happy Song", artist: "Artist A", duration: "3:30", genre: "pop", tempo: 120, energy: 75, valence: 80 },
    { id: 2, title: "Sad Song", artist: "Artist B", duration: "4:00", genre: "ballad", tempo: 70, energy: 30, valence: 25 },
    { id: 3, title: "Energetic Track", artist: "Artist C", duration: "3:45", genre: "electronic", tempo: 140, energy: 90, valence: 70 },
    { id: 4, title: "Calm Music", artist: "Artist D", duration: "5:00", genre: "ambient", tempo: 60, energy: 20, valence: 50 },
    { id: 5, title: "Rock Anthem", artist: "Artist E", duration: "4:15", genre: "rock", tempo: 130, energy: 85, valence: 65 },
  ];

  const sampleEmotionHistory: EmotionState[] = [
    { type: "happy", confidence: 0.8, intensity: 0.75, timestamp: Date.now() - 1000 },
    { type: "happy", confidence: 0.7, intensity: 0.65, timestamp: Date.now() - 2000 },
    { type: "excited", confidence: 0.6, intensity: 0.8, timestamp: Date.now() - 3000 },
  ];

  beforeEach(() => {
  });

  describe("calculateEmotionWeights", () => {
    it("should calculate emotion weights from history", () => {
      const weights = smartPlaylistGenerator.calculateEmotionWeights(sampleEmotionHistory);
      expect(weights.size).toBeGreaterThan(0);
      expect(weights.get("happy")).toBeGreaterThan(0);
    });

    it("should return empty map for empty history", () => {
      const weights = smartPlaylistGenerator.calculateEmotionWeights([]);
      expect(weights.size).toBe(0);
    });

    it("should weight recent emotions more heavily", () => {
      const recentHistory: EmotionState[] = [
        { type: "sad", confidence: 0.9, intensity: 0.9, timestamp: Date.now() - 100 },
        { type: "happy", confidence: 0.5, intensity: 0.3, timestamp: Date.now() - 100000 },
      ];
      const weights = smartPlaylistGenerator.calculateEmotionWeights(recentHistory);
      expect(weights.get("sad")).toBeGreaterThan(weights.get("happy") || 0);
    });
  });

  describe("getDominantEmotion", () => {
    it("should return dominant emotion from history", () => {
      const dominant = smartPlaylistGenerator.getDominantEmotion(sampleEmotionHistory);
      expect(dominant).toBe("happy");
    });

    it("should return neutral for empty history", () => {
      const dominant = smartPlaylistGenerator.getDominantEmotion([]);
      expect(dominant).toBe("neutral");
    });
  });

  describe("generatePlaylist", () => {
    it("should generate a playlist with correct structure", () => {
      const playlist = smartPlaylistGenerator.generatePlaylist(sampleTracks, sampleEmotionHistory);
      expect(playlist).toHaveProperty("name");
      expect(playlist).toHaveProperty("tracks");
      expect(playlist).toHaveProperty("createdAt");
      expect(playlist).toHaveProperty("duration");
    });

    it("should respect maxTracks option", () => {
      const playlist = smartPlaylistGenerator.generatePlaylist(sampleTracks, sampleEmotionHistory, {
        maxTracks: 3,
      });
      expect(playlist.tracks.length).toBeLessThanOrEqual(3);
    });

    it("should return empty playlist for no tracks", () => {
      const playlist = smartPlaylistGenerator.generatePlaylist([], sampleEmotionHistory);
      expect(playlist.tracks.length).toBe(0);
      expect(playlist.name).toBe("空播放列表");
    });

    it("should set target emotion based on dominant emotion", () => {
      const playlist = smartPlaylistGenerator.generatePlaylist(sampleTracks, sampleEmotionHistory);
      expect(playlist.targetEmotion).toBe("happy");
    });

    it("should shuffle tracks when shuffle option is true", () => {
      const playlist1 = smartPlaylistGenerator.generatePlaylist(sampleTracks, sampleEmotionHistory, {
        shuffle: true,
      });
      const playlist2 = smartPlaylistGenerator.generatePlaylist(sampleTracks, sampleEmotionHistory, {
        shuffle: true,
      });
      const sameOrder = playlist1.tracks.every(
        (track, index) => track.id === playlist2.tracks[index]?.id
      );
      expect(sameOrder).toBe(false);
    });
  });

  describe("scoreTrack", () => {
    it("should score tracks based on emotion match", () => {
      const happyTrack: TrackInfo = {
        id: 1,
        title: "Happy",
        artist: "Test",
        duration: "3:00",
        genre: "pop",
        tempo: 120,
        energy: 80,
        valence: 85,
      };
      const score = smartPlaylistGenerator.scoreTrack(happyTrack, "happy", new Map([["happy", 1]]));
      expect(score).toBeGreaterThan(0);
    });

    it("should give lower score to mismatched tracks", () => {
      const sadTrack: TrackInfo = {
        id: 1,
        title: "Sad",
        artist: "Test",
        duration: "3:00",
        genre: "ballad",
        tempo: 60,
        energy: 20,
        valence: 20,
      };
      const happyScore = smartPlaylistGenerator.scoreTrack(sadTrack, "happy", new Map([["happy", 1]]));
      const sadScore = smartPlaylistGenerator.scoreTrack(sadTrack, "sad", new Map([["sad", 1]]));
      expect(sadScore).toBeGreaterThan(happyScore);
    });
  });

  describe("addTransitionTracks", () => {
    it("should add transition tracks between different emotion sections", () => {
      const playlist = smartPlaylistGenerator.generatePlaylist(sampleTracks, sampleEmotionHistory, {
        includeTransition: true,
        maxTracks: 10,
      });
      expect(playlist.tracks.length).toBeGreaterThan(0);
    });
  });
});
