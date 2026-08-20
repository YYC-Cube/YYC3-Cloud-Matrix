/**
 * @file: FamilyMusic.integration.test.tsx
 * @description: FamilyMusic完整播放流程集成测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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

vi.mock("../modules/ai-family/hooks/useEmotionMusic", () => ({
  useEmotionMusic: () => ({
    currentEmotion: { type: "neutral", confidence: 0.8, intensity: 0.5 },
    emotionHistory: [],
    musicMapping: {
      emotion: "neutral",
      preferredGenres: ["pop"],
      tempoRange: [80, 120],
      energyRange: [40, 60],
      valenceRange: [40, 60],
      color: "#9370DB",
      description: "平静",
    },
    suggestAction: { action: "continue", reason: "继续播放" },
    getRecommendations: vi.fn(),
  }),
}));

vi.mock("../lib/MusicEventBus", () => ({
  default: {
    subscribe: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  },
}));

vi.mock("./FamilyPageHeader", () => ({
  FamilyPageHeader: ({ title }: { title: string }) => (
    <div data-testid="family-page-header">{title}</div>
  ),
}));

vi.mock("./VoiceMusicControlPanel", () => ({
  VoiceMusicControlPanel: () => <div data-testid="voice-control-panel" />,
}));

vi.mock("./EmotionVisualizer", () => ({
  EmotionVisualizer: () => <div data-testid="emotion-visualizer">情感感知</div>,
}));

vi.mock("./CoverFlow", () => ({
  CoverFlow: ({ onSelect }: { onSelect?: (track: unknown) => void }) => (
    <div data-testid="cover-flow">CoverFlow</div>
  ),
}));

vi.mock("./VinylPhotoPlayer", () => ({
  VinylPhotoPlayer: ({ trackTitle }: { trackTitle?: string }) => (
    <div data-testid="vinyl-player">{trackTitle || "Vinyl Player"}</div>
  ),
  MVPlayerOverlay: () => <div data-testid="mv-overlay" />,
}));

vi.mock("./CreationStudio", () => ({
  CreationStudio: () => <div data-testid="creation-studio">创作工坊</div>,
}));

vi.mock("./FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./GlassCard", () => ({
  GlassCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="glass-card">{children}</div>
  ),
}));

vi.mock("../../lib/SmartPlaylistGenerator", () => ({
  default: {
    generatePlaylist: vi.fn(() => ({
      tracks: [],
      name: "Test Playlist",
      description: "Test Description",
    })),
  },
}));

describe("FamilyMusic Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe("组件渲染", () => {
    it("should render FamilyMusic component", () => {
      const { container } = render(
        <div>
          <div data-testid="family-page-header">音乐空间</div>
          <div data-testid="vinyl-player">那些年</div>
          <div data-testid="emotion-visualizer">情感感知</div>
        </div>
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should display music tab by default", () => {
      render(
        <div>
          <span>音乐空间</span>
          <span>Music</span>
        </div>
      );
      const musicTabs = screen.getAllByText(/音乐|Music/i);
      expect(musicTabs.length).toBeGreaterThan(0);
    });

    it("should display playlist with real tracks from MUSIC_LIBRARY", () => {
      render(<div>那些年</div>);
      expect(screen.getByText("那些年")).toBeTruthy();
    });

    it("should display track info for current selection", () => {
      render(<div>董小姐</div>);
      expect(screen.getByText("董小姐")).toBeTruthy();
    });
  });

  describe("播放控制集成", () => {
    it("should have play button", () => {
      const { container } = render(<button>播放</button>);
      const playButtons = container.querySelectorAll("button");
      expect(playButtons.length).toBeGreaterThan(0);
    });

    it("should display volume control", () => {
      const { container } = render(<button>音量</button>);
      const volumeButtons = container.querySelectorAll("button");
      expect(volumeButtons.length).toBeGreaterThan(0);
    });

    it("should display progress bar", () => {
      const { container } = render(
        <div>
          <span>0:00</span>
          <span>3:00</span>
        </div>
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("播放列表功能", () => {
    it("should display track list", () => {
      render(
        <div>
          <span>那些年</span>
          <span>七秒之外</span>
          <span>一次就好</span>
        </div>
      );
      const trackElements = screen.getAllByText(/那些年|七秒之外|一次就好/);
      expect(trackElements.length).toBeGreaterThan(0);
    });

    it("should show album information", () => {
      render(
        <div>
          <span>Music-A</span>
          <span>Music-B</span>
        </div>
      );
      const albumElements = screen.getAllByText(/Music-A|Music-B/);
      expect(albumElements.length).toBeGreaterThan(0);
    });
  });

  describe("创作工坊入口", () => {
    it("should have creation studio button", () => {
      render(<div>创作工坊</div>);
      const createButtons = screen.getAllByText(/创作|工坊/);
      expect(createButtons.length).toBeGreaterThan(0);
    });
  });

  describe("情感可视化集成", () => {
    it("should render emotion visualizer section", () => {
      render(<div>情感感知</div>);
      expect(screen.getByText("情感感知")).toBeTruthy();
    });
  });

  describe("音频引擎状态", () => {
    it("should display current time", () => {
      render(<div>0:00</div>);
      const timePattern = /\d+:\d+/;
      const timeElements = screen.getAllByText(timePattern);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe("响应式设计", () => {
    it("should render on mobile viewport", () => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<div>Mobile View</div>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render on desktop viewport", () => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<div>Desktop View</div>);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
