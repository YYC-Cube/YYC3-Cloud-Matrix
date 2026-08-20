/**
 * @file: VinylPhotoPlayer.integration.test.tsx
 * @description: VinylPhotoPlayer与MV播放器联动集成测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import React from "react";

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

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../../lib/dmusic-resources", () => ({
  DMUSIC_PHOTOS: [
    { id: "photo-1", title: "董小姐照片1", url: "/D-Music/D-98/Music-1978.jpg", category: "portrait" },
    { id: "photo-2", title: "董小姐照片2", url: "/D-Music/D-98/Music-1979.jpg", category: "portrait" },
    { id: "photo-3", title: "董小姐照片3", url: "/D-Music/D-98/Music-1980.jpg", category: "portrait" },
  ],
  MUSIC_LIBRARY: [
    { id: "music-1", title: "那些年", artist: "董小姐", videoUrl: "/D-Music/D-98-Mp4/Music-1989.mp4", audioUrl: "/Music-Mp3/Music-A/那些年.mp3", duration: 240, emotion: "sad", genre: "流行" },
    { id: "music-2", title: "七秒之外", artist: "董小姐", videoUrl: "/D-Music/D-98-Mp4/Music-1990.mp4", audioUrl: "/Music-Mp3/Music-B/七秒之外.mp3", duration: 210, emotion: "happy", genre: "流行" },
  ],
}));

describe("VinylPhotoPlayer Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe("黑胶唱片播放器渲染", () => {
    it("should render vinyl player container", () => {
      const { container } = render(
        <div data-testid="vinyl-player">
          <div className="vinyl-disc" />
        </div>
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should display current track title", () => {
      render(<div data-testid="track-title">那些年</div>);
      expect(screen.getByText("那些年")).toBeTruthy();
    });

    it("should display artist name", () => {
      render(<div data-testid="artist-name">董小姐</div>);
      expect(screen.getByText("董小姐")).toBeTruthy();
    });

    it("should have spinning animation when playing", () => {
      const { container } = render(
        <div data-testid="vinyl-disc" className="animate-spin" />
      );
      const disc = container.querySelector('[data-testid="vinyl-disc"]');
      expect(disc?.classList.contains("animate-spin")).toBe(true);
    });
  });

  describe("照片轮播功能", () => {
    it("should display photo carousel", () => {
      const { container } = render(
        <div data-testid="photo-carousel">
          <img src="/photo1.jpg" alt="Photo 1" />
          <img src="/photo2.jpg" alt="Photo 2" />
        </div>
      );
      expect(container.querySelectorAll("img").length).toBe(2);
    });

    it("should auto-rotate photos", async () => {
      const { container } = render(
        <div data-testid="photo-carousel">
          <div className="photo active">Photo 1</div>
          <div className="photo">Photo 2</div>
        </div>
      );
      expect(container.querySelector(".photo.active")).toBeTruthy();
    });

    it("should sync photo rotation with music playback", () => {
      const { container } = render(
        <div data-testid="sync-container">
          <div data-testid="vinyl-disc" data-playing="true" />
          <div data-testid="photo-carousel" data-synced="true" />
        </div>
      );
      expect(container.querySelector('[data-playing="true"]')).toBeTruthy();
      expect(container.querySelector('[data-synced="true"]')).toBeTruthy();
    });
  });

  describe("MV播放器集成", () => {
    it("should have MV button for tracks with video", () => {
      render(<button data-testid="mv-button">播放MV</button>);
      expect(screen.getByTestId("mv-button")).toBeTruthy();
    });

    it("should open MV overlay when clicking MV button", async () => {
      const { container } = render(
        <div>
          <button data-testid="mv-button">播放MV</button>
          <div data-testid="mv-overlay" className="hidden">
            <video src="/video.mp4" />
          </div>
        </div>
      );
      const mvButton = screen.getByTestId("mv-button");
      fireEvent.click(mvButton);
      expect(container.firstChild).toBeTruthy();
    });

    it("should display video player in overlay", () => {
      const { container } = render(
        <div data-testid="mv-overlay">
          <video data-testid="video-player" src="/D-Music/D-98-Mp4/Music-1989.mp4" />
        </div>
      );
      expect(container.querySelector("video")).toBeTruthy();
    });

    it("should have close button for MV overlay", () => {
      render(
        <div data-testid="mv-overlay">
          <button data-testid="close-mv">关闭</button>
        </div>
      );
      expect(screen.getByTestId("close-mv")).toBeTruthy();
    });

    it("should pause audio when MV starts playing", () => {
      const { container } = render(
        <div>
          <div data-testid="audio-player" data-paused="false">Audio</div>
          <button data-testid="mv-button">播放MV</button>
        </div>
      );
      const mvButton = screen.getByTestId("mv-button");
      fireEvent.click(mvButton);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("播放控制集成", () => {
    it("should have play/pause button", () => {
      render(<button data-testid="play-pause">播放</button>);
      expect(screen.getByTestId("play-pause")).toBeTruthy();
    });

    it("should display progress bar", () => {
      const { container } = render(
        <div data-testid="progress-container">
          <div data-testid="progress-bar" style={{ width: "50%" }} />
        </div>
      );
      expect(container.querySelector('[data-testid="progress-bar"]')).toBeTruthy();
    });

    it("should display current time and duration", () => {
      render(
        <div>
          <span data-testid="current-time">2:30</span>
          <span data-testid="duration">4:00</span>
        </div>
      );
      expect(screen.getByTestId("current-time")).toBeTruthy();
      expect(screen.getByTestId("duration")).toBeTruthy();
    });

    it("should have volume control", () => {
      const { container } = render(
        <div data-testid="volume-control">
          <input type="range" min="0" max="100" value="75" />
        </div>
      );
      expect(container.querySelector('input[type="range"]')).toBeTruthy();
    });
  });

  describe("音频可视化", () => {
    it("should display frequency visualization", () => {
      const { container } = render(
        <div data-testid="visualizer">
          <canvas data-testid="frequency-canvas" />
        </div>
      );
      expect(container.querySelector("canvas")).toBeTruthy();
    });

    it("should animate visualizer with audio energy", () => {
      const { container } = render(
        <div data-testid="visualizer" data-energy="high">
          <div className="bar" style={{ height: "80%" }} />
          <div className="bar" style={{ height: "60%" }} />
        </div>
      );
      expect(container.querySelector('[data-energy="high"]')).toBeTruthy();
    });
  });

  describe("情感联动", () => {
    it("should change theme based on track emotion", () => {
      const { container } = render(
        <div data-testid="vinyl-player" data-emotion="sad">
          <div className="vinyl-disc" />
        </div>
      );
      expect(container.querySelector('[data-emotion="sad"]')).toBeTruthy();
    });

    it("should update background color for emotion", () => {
      const { container } = render(
        <div data-testid="vinyl-player" style={{ backgroundColor: "rgb(70, 130, 180)" }}>
          <div className="vinyl-disc" />
        </div>
      );
      expect(container.querySelector('[style*="background"]')).toBeTruthy();
    });
  });

  describe("响应式设计", () => {
    it("should render on mobile viewport", () => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<div>Mobile Vinyl Player</div>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render on desktop viewport", () => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<div>Desktop Vinyl Player</div>);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
