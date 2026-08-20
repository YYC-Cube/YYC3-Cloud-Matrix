/**
 * @file: useAudioEngine.test.tsx
 * @description: 音频引擎核心功能测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useAudioEngine, type AudioTrack } from "../modules/ai-family/hooks/useAudioEngine";

class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createAnalyser() {
    return {
      fftSize: 256,
      smoothingTimeConstant: 0.82,
      minDecibels: -90,
      maxDecibels: -10,
      frequencyBinCount: 128,
      connect: vi.fn(),
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { value: 0, cancelScheduledValues: vi.fn(), setTargetAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
  createDynamicsCompressor() {
    return {
      threshold: { value: -24 },
      knee: { value: 30 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
      connect: vi.fn(),
    };
  }
  createOscillator() {
    return {
      type: "sine",
      frequency: { value: 440, setTargetAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createMediaElementSource() {
    return { connect: vi.fn() };
  }
  resume() {
    this.state = "running";
    return Promise.resolve();
  }
  close() {
    this.state = "closed";
    return Promise.resolve();
  }
}

vi.stubGlobal("AudioContext", MockAudioContext);

// Mock HTML Audio element for jsdom
class MockHTMLAudioElement {
  src = "";
  crossOrigin = "";
  preload = "";
  volume = 1;
  currentTime = 0;
  duration = NaN;
  readyState = 0;
  private listeners: Record<string, (() => void)[]> = {};

  load() { this.readyState = 4; }
  play() { return Promise.resolve(); }
  pause() {}
  addEventListener(event: string, handler: () => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  removeEventListener(event: string, handler: () => void) {
    this.listeners[event] = (this.listeners[event] || []).filter(h => h !== handler);
  }
}

vi.stubGlobal("Audio", function() { return new MockHTMLAudioElement(); });

const mockTrack: AudioTrack = {
  id: "test-01",
  title: "测试歌曲",
  artist: "董小姐",
  duration: 180,
  audioUrl: "/Music-Mp3/Music-A/那些年.mp3",
  color: "#FFD700",
};

const mockTrackWithoutUrl: AudioTrack = {
  id: "test-02",
  title: "演示歌曲",
  artist: "系统",
  duration: 180,
  color: "#00CED1",
};

describe("useAudioEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe("初始化状态", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.volume).toBe(0.65);
      expect(result.current.audioMode).toBe("demo");
    });

    it("should initialize with custom volume", () => {
      const { result } = renderHook(() =>
        useAudioEngine({ initialVolume: 0.8 })
      );

      expect(result.current.volume).toBe(0.8);
    });

    it("should initialize with track duration", () => {
      const { result } = renderHook(() =>
        useAudioEngine({ track: mockTrack })
      );

      expect(result.current.duration).toBe(180);
    });
  });

  describe("播放控制", () => {
    it("should toggle play state", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it("should toggle play/pause with togglePlayPause", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("音量控制", () => {
    it("should set volume correctly", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(result.current.volume).toBe(0.5);
    });

    it("should clamp volume to 0-1 range", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.setVolume(1.5);
      });

      expect(result.current.volume).toBe(1);

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(result.current.volume).toBe(0);
    });
  });

  describe("进度控制", () => {
    it("should seek to specific time", () => {
      // Use a track without audioUrl so seek works in demo mode
      const demoTrack: AudioTrack = {
        id: "test-demo",
        title: "演示歌曲",
        artist: "系统",
        duration: 180,
      };
      const { result } = renderHook(() =>
        useAudioEngine({ track: demoTrack })
      );

      act(() => {
        result.current.seek(60);
      });

      expect(result.current.currentTime).toBe(60);
    });

    it("should clamp seek time to valid range", () => {
      const demoTrack: AudioTrack = {
        id: "test-demo",
        title: "演示歌曲",
        artist: "系统",
        duration: 180,
      };
      const { result } = renderHook(() =>
        useAudioEngine({ track: demoTrack })
      );

      act(() => {
        result.current.seek(-10);
      });

      expect(result.current.currentTime).toBe(0);

      act(() => {
        result.current.seek(300);
      });

      expect(result.current.currentTime).toBeLessThanOrEqual(180);
    });
  });

  describe("曲目加载", () => {
    it("should load track with audioUrl and switch to file mode", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.loadTrack(mockTrack);
      });

      expect(result.current.audioMode).toBe("file");
      expect(result.current.duration).toBe(180);
    });

    it("should load track without audioUrl and stay in demo mode", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.loadTrack(mockTrackWithoutUrl);
      });

      expect(result.current.audioMode).toBe("demo");
      expect(result.current.duration).toBe(180);
    });

    it("should reset current time when loading new track", () => {
      // Use a demo-mode track (no audioUrl) so seek works in demo mode
      const demoTrack: AudioTrack = {
        id: "test-demo",
        title: "演示歌曲",
        artist: "系统",
        duration: 180,
      };
      const { result } = renderHook(() =>
        useAudioEngine({ track: demoTrack })
      );

      act(() => {
        result.current.seek(60);
      });

      expect(result.current.currentTime).toBe(60);

      act(() => {
        result.current.loadTrack({
          id: "new-track",
          title: "新歌曲",
          artist: "新艺术家",
          duration: 200,
          audioUrl: "/Music-Mp3/Music-B/七秒之外.mp3",
        });
      });

      expect(result.current.currentTime).toBe(0);
    });
  });

  describe("文件加载", () => {
    it("should load audio file from File object", () => {
      const { result } = renderHook(() => useAudioEngine());

      const mockFile = new File(["audio content"], "test.mp3", {
        type: "audio/mpeg",
      });

      act(() => {
        result.current.loadAudioFile(mockFile);
      });

      expect(result.current.audioMode).toBe("file");
    });
  });

  describe("音频数据分析", () => {
    it("should provide frequency data array", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.frequencyData).toBeInstanceOf(Uint8Array);
      expect(result.current.frequencyData.length).toBe(64);
    });

    it("should provide waveform data array", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.waveformData).toBeInstanceOf(Uint8Array);
      expect(result.current.waveformData.length).toBe(64);
    });

    it("should provide audio energy values", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(typeof result.current.audioEnergy).toBe("number");
      expect(typeof result.current.bassEnergy).toBe("number");
      expect(typeof result.current.trebleEnergy).toBe("number");
    });
  });

  describe("回调函数", () => {
    it("should call onTrackEnd when demo track ends", async () => {
      const onTrackEnd = vi.fn();
      const shortTrack: AudioTrack = {
        id: "short",
        title: "Short",
        artist: "Test",
        duration: 0.1,
      };

      const { result } = renderHook(() =>
        useAudioEngine({
          track: shortTrack,
          onTrackEnd,
        })
      );

      act(() => {
        result.current.play();
      });

      vi.advanceTimersByTime(200);

      expect(onTrackEnd).toHaveBeenCalled();
    });

    it("should call onTimeUpdate during playback", () => {
      const onTimeUpdate = vi.fn();
      // Use a track without audioUrl so playback works in demo mode
      const demoTrack: AudioTrack = {
        id: "test-demo",
        title: "演示歌曲",
        artist: "系统",
        duration: 180,
      };
      const { result } = renderHook(() =>
        useAudioEngine({
          track: demoTrack,
          onTimeUpdate,
        })
      );

      act(() => {
        result.current.play();
      });

      vi.advanceTimersByTime(100);

      expect(onTimeUpdate).toHaveBeenCalled();
    });
  });

  describe("真实MP3路径验证", () => {
    it("should accept valid MP3 paths from MUSIC_LIBRARY", () => {
      const validPaths = [
        "/Music-Mp3/Music-A/那些年.mp3",
        "/Music-Mp3/Music-B/七秒之外.mp3",
        "/Music-Mp3/Music-C/一次就好.mp3",
        "/Music-Mp3/Music-D/98.mp3",
      ];

      const { result } = renderHook(() => useAudioEngine());

      validPaths.forEach((path) => {
        act(() => {
          result.current.loadTrack({
            id: `track-${path}`,
            title: "测试歌曲",
            artist: "董小姐",
            duration: 180,
            audioUrl: path,
          });
        });

        expect(result.current.audioMode).toBe("file");
      });
    });

    it("should accept WAV file paths", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.loadTrack({
          id: "wav-track",
          title: "WAV歌曲",
          artist: "董小姐",
          duration: 180,
          audioUrl: "/Music-Mp3/Music-B/董小姐的祝福.wav",
        });
      });

      expect(result.current.audioMode).toBe("file");
    });
  });
});
