/**
 * @file: useAudioEngine.test.ts
 * @description: useAudioEngine Hook单元测试
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
import { useAudioEngine, type AudioTrack } from "../modules/ai-family/hooks/useAudioEngine";

const mockAudioContext = {
  createAnalyser: vi.fn(function(this: typeof mockAudioContext) {
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
  }),
  createGain: vi.fn(function(this: typeof mockAudioContext) {
    return {
      gain: { value: 0, setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() },
      connect: vi.fn(),
    };
  }),
  createDynamicsCompressor: vi.fn(function(this: typeof mockAudioContext) {
    return {
      threshold: { value: -24 },
      knee: { value: 30 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
      connect: vi.fn(),
    };
  }),
  createOscillator: vi.fn(function(this: typeof mockAudioContext) {
    return {
      type: "sine",
      frequency: { value: 440, setTargetAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }),
  createMediaElementSource: vi.fn(function(this: typeof mockAudioContext) {
    return {
      connect: vi.fn(),
    };
  }),
  currentTime: 0,
  destination: {},
  state: "running",
  resume: vi.fn(),
  close: vi.fn(),
};

class MockAudioContext {
  createAnalyser = mockAudioContext.createAnalyser;
  createGain = mockAudioContext.createGain;
  createDynamicsCompressor = mockAudioContext.createDynamicsCompressor;
  createOscillator = mockAudioContext.createOscillator;
  createMediaElementSource = mockAudioContext.createMediaElementSource;
  currentTime = mockAudioContext.currentTime;
  destination = mockAudioContext.destination;
  state = mockAudioContext.state;
  resume = mockAudioContext.resume;
  close = mockAudioContext.close;
}

vi.stubGlobal("AudioContext", MockAudioContext);

describe("useAudioEngine", () => {
  const mockTrack: AudioTrack = {
    id: "track-1",
    title: "Test Track",
    artist: "Test Artist",
    duration: 180,
    color: "#FF0000",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.volume).toBe(0.65);
      expect(result.current.audioMode).toBe("demo");
    });

    it("should initialize with custom volume", () => {
      const { result } = renderHook(() =>
        useAudioEngine({ initialVolume: 0.5 })
      );

      expect(result.current.volume).toBe(0.5);
    });

    it("should initialize with track", () => {
      const { result } = renderHook(() =>
        useAudioEngine({ track: mockTrack })
      );

      expect(result.current.duration).toBe(180);
    });
  });

  describe("playback controls", () => {
    it("should toggle play/pause", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it("should play", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it("should pause", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("volume control", () => {
    it("should set volume", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.setVolume(0.8);
      });

      expect(result.current.volume).toBe(0.8);
    });

    it("should clamp volume to 0-1", () => {
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

  describe("seek", () => {
    it("should seek to time in demo mode", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.seek(60);
      });

      expect(result.current.currentTime).toBe(60);
    });

    it("should clamp seek time to valid range", () => {
      const { result } = renderHook(() =>
        useAudioEngine({ track: mockTrack })
      );

      act(() => {
        result.current.seek(-10);
      });

      expect(result.current.currentTime).toBe(0);

      act(() => {
        result.current.seek(300);
      });

      expect(result.current.currentTime).toBe(180);
    });
  });

  describe("track loading", () => {
    it("should load track", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.loadTrack(mockTrack);
      });

      expect(result.current.duration).toBe(180);
    });

    it("should reset time when loading new track", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.seek(60);
      });

      act(() => {
        result.current.loadTrack(mockTrack);
      });

      expect(result.current.currentTime).toBe(0);
    });

    it("should stop playback when loading new track", () => {
      const { result } = renderHook(() => useAudioEngine());

      act(() => {
        result.current.play();
      });

      act(() => {
        result.current.loadTrack(mockTrack);
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("audio file loading", () => {
    it("should load audio file", () => {
      const { result } = renderHook(() => useAudioEngine());

      const file = new File(["audio content"], "test.mp3", {
        type: "audio/mp3",
      });

      act(() => {
        result.current.loadAudioFile(file);
      });

      expect(result.current.audioMode).toBe("file");
    });
  });

  describe("audio data", () => {
    it("should return frequency data", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.frequencyData).toBeInstanceOf(Uint8Array);
      expect(result.current.frequencyData.length).toBe(64);
    });

    it("should return waveform data", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(result.current.waveformData).toBeInstanceOf(Uint8Array);
      expect(result.current.waveformData.length).toBe(64);
    });

    it("should return audio energy values", () => {
      const { result } = renderHook(() => useAudioEngine());

      expect(typeof result.current.audioEnergy).toBe("number");
      expect(typeof result.current.bassEnergy).toBe("number");
      expect(typeof result.current.trebleEnergy).toBe("number");
    });
  });

  describe("callbacks", () => {
    it("should call onTrackEnd when track ends", async () => {
      const onTrackEnd = vi.fn();
      const shortTrack: AudioTrack = {
        id: "short",
        title: "Short",
        artist: "Test",
        duration: 1,
      };

      const { result } = renderHook(() =>
        useAudioEngine({ track: shortTrack, onTrackEnd })
      );

      act(() => {
        result.current.play();
      });

      vi.advanceTimersByTime(1100);
    });

    it("should call onTimeUpdate during playback", () => {
      const onTimeUpdate = vi.fn();
      const { result } = renderHook(() =>
        useAudioEngine({ onTimeUpdate })
      );

      act(() => {
        result.current.play();
      });

      vi.advanceTimersByTime(100);
    });
  });
});
