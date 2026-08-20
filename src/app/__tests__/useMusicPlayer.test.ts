/**
 * @file: useMusicPlayer.test.ts
 * @description: useMusicPlayer Hook单元测试
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
import { useMusicPlayer } from "../modules/ai-family/hooks/useMusicPlayer";

vi.mock("../lib/MusicEventBus", () => ({
  default: {
    subscribe: vi.fn(() => () => {}),
    emit: vi.fn(),
    emitStateChange: vi.fn(),
    emitTrackChange: vi.fn(),
  },
}));

vi.mock("../lib/VoiceCommandParser", () => ({
  parseVoiceCommand: vi.fn(() => ({
    command: "play",
    confidence: 0.9,
    rawTranscript: "播放音乐",
    matchedKeywords: ["播放"],
  })),
}));

describe("useMusicPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.currentTrackIndex).toBe(0);
      expect(result.current.state.progress).toBe(0);
      expect(result.current.state.volume).toBe(75);
      expect(result.current.state.muted).toBe(false);
    });

    it("should initialize with custom options", () => {
      const { result } = renderHook(() =>
        useMusicPlayer({
          autoPlay: true,
          initialVolume: 50,
        })
      );

      expect(result.current.state.isPlaying).toBe(true);
      expect(result.current.state.volume).toBe(50);
    });

    it("should return current track", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.currentTrack).toBeDefined();
      expect(result.current.currentTrack.title).toBe("Family AI — 智慧工坊");
    });

    it("should return playlist", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.playlist).toHaveLength(8);
    });
  });

  describe("play/pause controls", () => {
    it("should play", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.isPlaying).toBe(false);

      act(() => {
        result.current.controls.play();
      });

      expect(result.current.state.isPlaying).toBe(true);
    });

    it("should pause", () => {
      const { result } = renderHook(() =>
        useMusicPlayer({ autoPlay: true })
      );

      expect(result.current.state.isPlaying).toBe(true);

      act(() => {
        result.current.controls.pause();
      });

      expect(result.current.state.isPlaying).toBe(false);
    });

    it("should toggle play/pause", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.isPlaying).toBe(false);

      act(() => {
        result.current.controls.toggle();
      });

      expect(result.current.state.isPlaying).toBe(true);

      act(() => {
        result.current.controls.toggle();
      });

      expect(result.current.state.isPlaying).toBe(false);
    });
  });

  describe("track navigation", () => {
    it("should go to next track", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.currentTrackIndex).toBe(0);

      act(() => {
        result.current.controls.next();
      });

      expect(result.current.state.currentTrackIndex).toBe(1);
    });

    it("should wrap around to first track", () => {
      const customPlaylist = [
        { id: 1, title: "Track 1", artist: "Artist", duration: "3:00", color: "#FFF" },
        { id: 2, title: "Track 2", artist: "Artist", duration: "3:00", color: "#FFF" },
      ];

      const { result } = renderHook(() =>
        useMusicPlayer({ playlist: customPlaylist })
      );

      act(() => {
        result.current.controls.next();
      });

      expect(result.current.state.currentTrackIndex).toBe(1);

      act(() => {
        result.current.controls.next();
      });

      expect(result.current.state.currentTrackIndex).toBe(0);
    });

    it("should go to previous track", () => {
      const customPlaylist = [
        { id: 1, title: "Track 1", artist: "Artist", duration: "3:00", color: "#FFF" },
        { id: 2, title: "Track 2", artist: "Artist", duration: "3:00", color: "#FFF" },
      ];

      const { result } = renderHook(() =>
        useMusicPlayer({ playlist: customPlaylist })
      );

      act(() => {
        result.current.controls.next();
      });

      expect(result.current.state.currentTrackIndex).toBe(1);

      act(() => {
        result.current.controls.previous();
      });

      expect(result.current.state.currentTrackIndex).toBe(0);
    });

    it("should wrap around to last track", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.currentTrackIndex).toBe(0);

      act(() => {
        result.current.controls.previous();
      });

      expect(result.current.state.currentTrackIndex).toBe(7);
    });

    it("should play specific track by index", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.playIndex(3);
      });

      expect(result.current.state.currentTrackIndex).toBe(3);
      expect(result.current.state.isPlaying).toBe(true);
    });

    it("should ignore invalid track index", () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useMusicPlayer({ onError })
      );

      act(() => {
        result.current.controls.playIndex(100);
      });

      expect(result.current.state.currentTrackIndex).toBe(0);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe("volume controls", () => {
    it("should set volume", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.setVolume(50);
      });

      expect(result.current.state.volume).toBe(50);
    });

    it("should clamp volume to 0-100", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.setVolume(150);
      });

      expect(result.current.state.volume).toBe(100);

      act(() => {
        result.current.controls.setVolume(-10);
      });

      expect(result.current.state.volume).toBe(0);
    });

    it("should adjust volume by delta", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.volume).toBe(75);

      act(() => {
        result.current.controls.adjustVolume(10);
      });

      expect(result.current.state.volume).toBe(85);

      act(() => {
        result.current.controls.adjustVolume(-20);
      });

      expect(result.current.state.volume).toBe(65);
    });

    it("should mute", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.muted).toBe(false);

      act(() => {
        result.current.controls.mute();
      });

      expect(result.current.state.muted).toBe(true);
    });

    it("should unmute", () => {
      const { result } = renderHook(() =>
        useMusicPlayer()
      );

      act(() => {
        result.current.controls.mute();
      });

      expect(result.current.state.muted).toBe(true);

      act(() => {
        result.current.controls.unmute();
      });

      expect(result.current.state.muted).toBe(false);
    });

    it("should toggle mute", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.muted).toBe(false);

      act(() => {
        result.current.controls.toggleMute();
      });

      expect(result.current.state.muted).toBe(true);

      act(() => {
        result.current.controls.toggleMute();
      });

      expect(result.current.state.muted).toBe(false);
    });
  });

  describe("like controls", () => {
    it("should like current track", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.likedTracks.has(1)).toBe(false);

      act(() => {
        result.current.controls.like();
      });

      expect(result.current.state.likedTracks.has(1)).toBe(true);
    });

    it("should unlike current track", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.like();
      });

      expect(result.current.state.likedTracks.has(1)).toBe(true);

      act(() => {
        result.current.controls.unlike();
      });

      expect(result.current.state.likedTracks.has(1)).toBe(false);
    });

    it("should toggle like", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.likedTracks.has(1)).toBe(false);

      act(() => {
        result.current.controls.toggleLike();
      });

      expect(result.current.state.likedTracks.has(1)).toBe(true);

      act(() => {
        result.current.controls.toggleLike();
      });

      expect(result.current.state.likedTracks.has(1)).toBe(false);
    });
  });

  describe("shuffle and repeat", () => {
    it("should toggle shuffle", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.shuffle).toBe(false);

      act(() => {
        result.current.controls.shuffle();
      });

      expect(result.current.state.shuffle).toBe(true);
    });

    it("should toggle repeat", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.repeat).toBe(false);

      act(() => {
        result.current.controls.repeat();
      });

      expect(result.current.state.repeat).toBe(true);
    });
  });

  describe("seek controls", () => {
    it("should seek to progress percentage", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.state.progress).toBe(0);

      act(() => {
        result.current.controls.seek(50);
      });

      expect(result.current.state.progress).toBe(50);
    });

    it("should clamp seek progress to 0-100", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.seek(150);
      });

      expect(result.current.state.progress).toBe(100);

      act(() => {
        result.current.controls.seek(-10);
      });

      expect(result.current.state.progress).toBe(0);
    });

    it("should seek to specific time in seconds", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.seekToTime(120);
      });

      expect(result.current.state.progress).toBeGreaterThan(0);
    });
  });

  describe("executeCommand", () => {
    it("should execute play command", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.executeCommand("play");
      });

      expect(result.current.state.isPlaying).toBe(true);
    });

    it("should execute pause command", () => {
      const { result } = renderHook(() =>
        useMusicPlayer({ autoPlay: true })
      );

      act(() => {
        result.current.controls.executeCommand("pause");
      });

      expect(result.current.state.isPlaying).toBe(false);
    });

    it("should execute next command", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.executeCommand("next");
      });

      expect(result.current.state.currentTrackIndex).toBe(1);
    });

    it("should execute volume_up command", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.executeCommand("volume_up");
      });

      expect(result.current.state.volume).toBe(85);
    });

    it("should execute volume_down command", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.executeCommand("volume_down");
      });

      expect(result.current.state.volume).toBe(65);
    });

    it("should execute mute command", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.executeCommand("mute");
      });

      expect(result.current.state.muted).toBe(true);
    });
  });

  describe("currentTime", () => {
    it("should return formatted current time", () => {
      const { result } = renderHook(() => useMusicPlayer());

      expect(result.current.currentTime).toBe("0:00");
    });

    it("should update time when progress changes", () => {
      const { result } = renderHook(() => useMusicPlayer());

      act(() => {
        result.current.controls.seek(50);
      });

      expect(result.current.currentTime).not.toBe("0:00");
    });
  });
});
