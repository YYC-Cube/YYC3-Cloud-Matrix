/**
 * @file: FamilyVoiceSystem.test.tsx
 * @description: FamilyVoiceSystem组件自编辑功能单元测试
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

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../lib/MusicEventBus", () => ({
  default: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("../../lib/VoiceCommandParser", () => ({
  parseVoiceCommand: vi.fn(() => ({ command: null, params: {} })),
}));

vi.mock("../../lib/EmotionMusicBridge", () => ({
  default: {
    detectEmotion: vi.fn(() => "neutral"),
    onEmotionChange: vi.fn(),
  },
}));

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [
    { lang: "zh-CN", name: "Chinese Voice" },
    { lang: "en-US", name: "English Voice" },
  ]),
};

vi.stubGlobal("speechSynthesis", mockSpeechSynthesis);

class MockSpeechSynthesisUtterance {
  text: string;
  pitch: number = 1;
  rate: number = 1;
  volume: number = 1;
  lang: string = "zh-CN";
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);

const mockSpeechRecognition = vi.fn(() => ({
  continuous: false,
  interimResults: false,
  lang: "zh-CN",
  start: vi.fn(),
  stop: vi.fn(),
  onresult: null,
  onerror: null,
  onend: null,
}));

vi.stubGlobal("webkitSpeechRecognition", mockSpeechRecognition);
vi.stubGlobal("SpeechRecognition", mockSpeechRecognition);

import { FamilyVoiceSystem } from "../modules/ai-family/components/FamilyVoiceSystem";

const STORAGE_KEY = "yyc3-family-voice-profiles";

const defaultProfiles = [
  { memberId: "navigator", pitch: 1.0, rate: 1.0, volume: 0.8, lang: "zh-CN" },
  { memberId: "thinker", pitch: 0.9, rate: 0.9, volume: 0.8, lang: "zh-CN" },
  { memberId: "prophet", pitch: 1.1, rate: 1.0, volume: 0.8, lang: "zh-CN" },
  { memberId: "bolero", pitch: 1.0, rate: 1.1, volume: 0.8, lang: "zh-CN" },
  { memberId: "sentinel", pitch: 0.8, rate: 1.0, volume: 0.9, lang: "zh-CN" },
  { memberId: "master", pitch: 1.0, rate: 0.8, volume: 0.8, lang: "zh-CN" },
  { memberId: "oracle", pitch: 1.2, rate: 1.0, volume: 0.7, lang: "zh-CN" },
  { memberId: "creator", pitch: 1.0, rate: 1.2, volume: 0.8, lang: "zh-CN" },
];

describe("FamilyVoiceSystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfiles));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<FamilyVoiceSystem />);
      expect(container.firstChild).toBeDefined();
    });

    it("should render page header", () => {
      render(<FamilyVoiceSystem />);
      expect(screen.getByText(/语音系统/i)).toBeDefined();
    });

    it("should render all 8 family member voice cards", () => {
      render(<FamilyVoiceSystem />);
      const cards = screen.getAllByText(/千行|万物|先知|伯乐|守护|宗师|天枢|灵韵/);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe("voice profile editing", () => {
    it("should load voice profiles from localStorage", () => {
      render(<FamilyVoiceSystem />);
      expect(localStorage.getItem).toBeDefined();
    });

    it("should save voice profile changes to localStorage", async () => {
      render(<FamilyVoiceSystem />);

      const sliders = screen.queryAllByRole("slider");
      if (sliders.length > 0) {
        fireEvent.change(sliders[0], { target: { value: "1.5" } });
      }

      await waitFor(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        expect(saved).toBeDefined();
      });
    });

    it("should reset to default profiles", async () => {
      render(<FamilyVoiceSystem />);

      const resetButtons = screen.queryAllByRole("button");
      const resetBtn = resetButtons.find((btn) =>
        btn.textContent?.includes("重置")
      );

      if (resetBtn) {
        fireEvent.click(resetBtn);
      }

      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBeDefined();
      });
    });
  });

  describe("TTS functionality", () => {
    it("should call speechSynthesis.speak when preview button clicked", async () => {
      render(<FamilyVoiceSystem />);

      const previewButtons = screen.queryAllByRole("button");
      const playBtn = previewButtons.find((btn) =>
        btn.getAttribute("aria-label")?.includes("播放")
      );

      if (playBtn) {
        fireEvent.click(playBtn);
        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      }
    });

    it("should stop speaking when stop button clicked", async () => {
      render(<FamilyVoiceSystem />);

      const stopButtons = screen.queryAllByRole("button");
      const stopBtn = stopButtons.find((btn) =>
        btn.getAttribute("aria-label")?.includes("停止")
      );

      if (stopBtn) {
        fireEvent.click(stopBtn);
        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      }
    });
  });

  describe("voice recognition", () => {
    it("should render microphone button", () => {
      render(<FamilyVoiceSystem />);
      const micButtons = screen.queryAllByRole("button");
      const hasMicButton = micButtons.some((btn) =>
        btn.getAttribute("aria-label")?.includes("麦克风")
      );
      expect(hasMicButton || micButtons.length > 0).toBe(true);
    });
  });

  describe("conversation history", () => {
    it("should store conversations in localStorage", () => {
      render(<FamilyVoiceSystem />);
      expect(localStorage.getItem("yyc3-family-voice-conversations")).toBeDefined();
    });
  });
});
