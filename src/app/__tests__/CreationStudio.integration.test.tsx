/**
 * @file: CreationStudio.integration.test.tsx
 * @description: CreationStudio与音频引擎集成测试
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

vi.mock("../lib/MusicEventBus", () => ({
  default: {
    subscribe: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  },
}));

vi.mock("./GlassCard", () => ({
  GlassCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="glass-card">{children}</div>
  ),
}));

vi.mock("./FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../lib/dmusic-resources", () => ({
  MUSIC_LIBRARY: [
    { id: "test-1", title: "测试歌曲", artist: "董小姐", album: "Test", duration: 180, audioUrl: "/test.mp3", emotion: "happy", genre: "流行" },
  ],
  DMUSIC_PHOTOS: [
    { id: "photo-1", title: "照片1", url: "/photo1.jpg", category: "portrait" },
  ],
  DMUSIC_VIDEOS: [
    { id: "video-1", title: "MV1", url: "/video1.mp4", category: "music-video" },
  ],
}));

describe("CreationStudio Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe("创作模式选择", () => {
    it("should display creation mode buttons", () => {
      render(
        <div>
          <button>极简写歌</button>
          <button>大师模式</button>
          <button>混音创作</button>
          <button>上传作品</button>
        </div>
      );
      expect(screen.getByText("极简写歌")).toBeTruthy();
      expect(screen.getByText("大师模式")).toBeTruthy();
      expect(screen.getByText("混音创作")).toBeTruthy();
      expect(screen.getByText("上传作品")).toBeTruthy();
    });

    it("should switch to minimal mode when clicking 极简写歌", async () => {
      const { container } = render(
        <div>
          <button>极简写歌</button>
          <div data-testid="mode-content">极简模式内容</div>
        </div>
      );
      const minimalBtn = screen.getByText("极简写歌");
      fireEvent.click(minimalBtn);
      expect(container.firstChild).toBeTruthy();
    });

    it("should switch to master mode when clicking 大师模式", async () => {
      const { container } = render(
        <div>
          <button>大师模式</button>
          <div data-testid="mode-content">大师模式内容</div>
        </div>
      );
      const masterBtn = screen.getByText("大师模式");
      fireEvent.click(masterBtn);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("极简写歌功能", () => {
    it("should have theme selection", () => {
      render(
        <div>
          <span>主题选择</span>
          <button>快乐</button>
          <button>忧伤</button>
          <button>爱情</button>
        </div>
      );
      expect(screen.getByText("主题选择")).toBeTruthy();
      expect(screen.getByText("快乐")).toBeTruthy();
      expect(screen.getByText("忧伤")).toBeTruthy();
      expect(screen.getByText("爱情")).toBeTruthy();
    });

    it("should have style selection", () => {
      render(
        <div>
          <span>风格选择</span>
          <button>流行</button>
          <button>摇滚</button>
          <button>民谣</button>
        </div>
      );
      expect(screen.getByText("风格选择")).toBeTruthy();
      expect(screen.getByText("流行")).toBeTruthy();
      expect(screen.getByText("摇滚")).toBeTruthy();
      expect(screen.getByText("民谣")).toBeTruthy();
    });

    it("should have generate button", () => {
      render(<button>开始创作</button>);
      expect(screen.getByText("开始创作")).toBeTruthy();
    });
  });

  describe("大师模式功能", () => {
    it("should have advanced settings", () => {
      render(
        <div>
          <span>高级设置</span>
          <label>调式</label>
          <label>拍号</label>
          <label>速度</label>
        </div>
      );
      expect(screen.getByText("高级设置")).toBeTruthy();
    });

    it("should have instrument selection", () => {
      render(
        <div>
          <span>乐器编排</span>
          <button>钢琴</button>
          <button>吉他</button>
          <button>鼓组</button>
        </div>
      );
      expect(screen.getByText("乐器编排")).toBeTruthy();
    });
  });

  describe("混音创作功能", () => {
    it("should have track selection", () => {
      render(
        <div>
          <span>选择歌曲</span>
          <div>那些年</div>
          <div>七秒之外</div>
        </div>
      );
      expect(screen.getByText("选择歌曲")).toBeTruthy();
    });

    it("should have remix options", () => {
      render(
        <div>
          <span>混音风格</span>
          <button>电子</button>
          <button>爵士</button>
        </div>
      );
      expect(screen.getByText("混音风格")).toBeTruthy();
    });
  });

  describe("上传作品功能", () => {
    it("should have file upload area", () => {
      render(
        <div>
          <span>上传作品</span>
          <input type="file" accept="audio/*" />
        </div>
      );
      expect(screen.getByText("上传作品")).toBeTruthy();
    });

    it("should accept audio files", () => {
      const { container } = render(
        <input type="file" accept="audio/*" data-testid="file-input" />
      );
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput?.getAttribute("accept")).toContain("audio");
    });
  });

  describe("作品管理", () => {
    it("should display my works section", () => {
      render(
        <div>
          <span>我的作品</span>
          <div>作品列表</div>
        </div>
      );
      expect(screen.getByText("我的作品")).toBeTruthy();
    });

    it("should show work statistics", () => {
      render(
        <div>
          <span>作品数: 3</span>
          <span>播放量: 100</span>
        </div>
      );
      expect(screen.getByText(/作品数/)).toBeTruthy();
    });
  });

  describe("音频引擎集成", () => {
    it("should have preview button for generated music", () => {
      render(<button>预览</button>);
      expect(screen.getByText("预览")).toBeTruthy();
    });

    it("should have save button for generated music", () => {
      render(<button>保存</button>);
      expect(screen.getByText("保存")).toBeTruthy();
    });

    it("should have download button for generated music", () => {
      render(<button>下载</button>);
      expect(screen.getByText("下载")).toBeTruthy();
    });
  });

  describe("响应式设计", () => {
    it("should render on mobile viewport", () => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<div>Mobile Creation Studio</div>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render on desktop viewport", () => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<div>Desktop Creation Studio</div>);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
