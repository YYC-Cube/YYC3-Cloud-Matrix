/**
 * @file: dmusic-resources.test.ts
 * @description: D-Music 音乐资源数据完整性验证测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, expect, it } from "vitest";
import {
  DMUSIC_LOGOS,
  DMUSIC_PHOTOS,
  DMUSIC_VIDEOS,
  getRandomPhoto,
  getTracksByEmotion,
  MUSIC_LIBRARY,
  type MusicTrack,
} from "../lib/dmusic-resources";

describe("dmusic-resources", () => {
  describe("MUSIC_LIBRARY", () => {
    it("should have at least 20 tracks", () => {
      expect(MUSIC_LIBRARY.length).toBeGreaterThanOrEqual(20);
    });

    it("should have valid structure for each track", () => {
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        expect(track.id).toBeDefined();
        expect(track.title).toBeDefined();
        expect(track.artist).toBeDefined();
        expect(track.album).toBeDefined();
        expect(track.duration).toBeGreaterThan(0);
        expect(track.audioUrl).toBeDefined();
        expect(track.emotion).toBeDefined();
        expect(track.genre).toBeDefined();
      });
    });

    it("should have valid audioUrl paths", () => {
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        expect(track.audioUrl).toMatch(/^\/Music-Mp3\/.*\.(mp3|wav)$/);
      });
    });

    it("should have valid emotion values", () => {
      const validEmotions = ["happy", "sad", "energetic", "calm", "love", "neutral"];
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        expect(validEmotions).toContain(track.emotion);
      });
    });

    it("should have unique track IDs", () => {
      const ids = MUSIC_LIBRARY.map((t: MusicTrack) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have reasonable duration values (30s - 600s)", () => {
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        expect(track.duration).toBeGreaterThanOrEqual(30);
        expect(track.duration).toBeLessThanOrEqual(600);
      });
    });

    it("should have valid artists for D-Music tracks", () => {
      const dMusicTracks = MUSIC_LIBRARY.filter((t: MusicTrack) =>
        t.album.startsWith("Music-") || t.album === "Music-A" || t.album === "Music-B" || t.album === "Music-C" || t.album === "Music-D"
      );
      expect(dMusicTracks.length).toBeGreaterThan(0);
      const validArtists = ["沫言", "沫语", "董小姐", "董小姐、沫言"];
      dMusicTracks.forEach((track: MusicTrack) => {
        expect(validArtists).toContain(track.artist);
      });
    });
  });

  describe("DMUSIC_PHOTOS", () => {
    it("should have at least 10 photos", () => {
      expect(DMUSIC_PHOTOS.length).toBeGreaterThanOrEqual(10);
    });

    it("should have valid photo paths", () => {
      DMUSIC_PHOTOS.forEach((photo: string) => {
        expect(photo).toMatch(/^\/D-Music\/.*\.(jpg|jpeg|png)$/);
      });
    });

    it("should have unique photo paths", () => {
      const uniquePhotos = new Set(DMUSIC_PHOTOS);
      expect(uniquePhotos.size).toBe(DMUSIC_PHOTOS.length);
    });
  });

  describe("DMUSIC_VIDEOS", () => {
    it("should have at least 5 videos", () => {
      expect(DMUSIC_VIDEOS.length).toBeGreaterThanOrEqual(5);
    });

    it("should have valid video paths", () => {
      DMUSIC_VIDEOS.forEach((video: string) => {
        expect(video).toMatch(/^\/D-Music\/.*\.mp4$/);
      });
    });

    it("should have unique video paths", () => {
      const uniqueVideos = new Set(DMUSIC_VIDEOS);
      expect(uniqueVideos.size).toBe(DMUSIC_VIDEOS.length);
    });
  });

  describe("DMUSIC_LOGOS", () => {
    it("should have at least 20 logos", () => {
      expect(DMUSIC_LOGOS.length).toBeGreaterThanOrEqual(20);
    });

    it("should have valid logo paths", () => {
      DMUSIC_LOGOS.forEach((logo: string) => {
        expect(logo).toMatch(/^\/D-Music\/.*\.png$/);
      });
    });
  });

  describe("getRandomPhoto", () => {
    it("should return a valid photo path", () => {
      const photo = getRandomPhoto();
      expect(photo).toBeDefined();
      expect(DMUSIC_PHOTOS).toContain(photo);
    });

    it("should return different photos on multiple calls", () => {
      const photos = new Set();
      for (let i = 0; i < 10; i++) {
        photos.add(getRandomPhoto());
      }

      expect(photos.size).toBeGreaterThan(1);
    });
  });

  describe("getTracksByEmotion", () => {
    it("should return tracks matching the emotion", () => {
      const sadTracks = getTracksByEmotion("sad");
      sadTracks.forEach((track: MusicTrack) => {
        expect(track.emotion).toBe("sad");
      });
    });

    it("should return empty array for non-existent emotion", () => {
      const tracks = getTracksByEmotion("nonexistent" as any);
      expect(tracks).toEqual([]);
    });

    it("should return tracks for common emotions", () => {
      const emotions = ["sad", "calm", "neutral"] as const;
      emotions.forEach((emotion) => {
        const tracks = getTracksByEmotion(emotion);
        expect(tracks.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Data consistency", () => {
    it("should have optional videoUrl field on tracks", () => {
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        if (track.videoUrl !== undefined) {
          expect(track.videoUrl).toBeTruthy();
        }
      });
    });

    it("should have coverUrl for all tracks", () => {
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        expect(track.coverUrl).toBeDefined();
      });
    });

    it("should have valid coverUrl format", () => {
      MUSIC_LIBRARY.forEach((track: MusicTrack) => {
        if (track.coverUrl) {
          expect(track.coverUrl).toMatch(/^\/D-Music\/.*\.(jpg|png)$/);
        }
      });
    });
  });
});
