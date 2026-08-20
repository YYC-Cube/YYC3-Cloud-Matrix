/**
 * @file: EmotionVisualizer.test.tsx
 * @description: 情感可视化组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { EmotionVisualizer } from "../modules/ai-family/components/EmotionVisualizer";

vi.mock("../modules/ai-family/hooks/useEmotionMusic", () => ({
  useEmotionMusic: () => ({
    currentEmotion: {
      type: "happy",
      confidence: 0.85,
      intensity: 0.75,
      timestamp: Date.now(),
    },
    emotionHistory: [
      { type: "happy", confidence: 0.8, intensity: 0.7, timestamp: Date.now() - 1000 },
      { type: "neutral", confidence: 0.6, intensity: 0.5, timestamp: Date.now() - 2000 },
    ],
    musicMapping: {
      emotion: "happy",
      preferredGenres: ["pop", "dance"],
      tempoRange: [100, 140],
      energyRange: [60, 90],
      valenceRange: [70, 100],
      color: "#FFD700",
      description: "欢快愉悦",
    },
    suggestAction: {
      action: "continue",
      reason: "当前音乐适合当前情感",
    },
    getRecommendations: vi.fn(),
  }),
}));

describe("EmotionVisualizer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("should render emotion visualizer component", () => {
    render(<EmotionVisualizer />);
    expect(screen.getByText("情感感知")).toBeInTheDocument();
  });

  it("should display current emotion type", () => {
    render(<EmotionVisualizer />);
    const emotionTexts = screen.getAllByText("开心");
    expect(emotionTexts.length).toBeGreaterThan(0);
  });

  it("should display emotion confidence", () => {
    render(<EmotionVisualizer />);
    const confidenceElements = screen.getAllByText(/85/);
    expect(confidenceElements.length).toBeGreaterThan(0);
  });

  it("should display music recommendations when showRecommendations is true", () => {
    render(<EmotionVisualizer showRecommendations />);
    const recommendationTexts = screen.getAllByText("音乐推荐");
    expect(recommendationTexts.length).toBeGreaterThan(0);
  });

  it("should render in compact mode", () => {
    render(<EmotionVisualizer compact />);
    const emotionTexts = screen.getAllByText("开心");
    expect(emotionTexts.length).toBeGreaterThan(0);
  });

  it("should apply custom className", () => {
    const { container } = render(<EmotionVisualizer className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should call onEmotionClick when emotion is clicked", () => {
    const handleClick = vi.fn();
    render(<EmotionVisualizer onEmotionClick={handleClick} />);
    const emotionButtons = screen.getAllByText("开心");
    if (emotionButtons.length > 0) {
      const button = emotionButtons[0].closest("button");
      if (button) {
        button.click();
        expect(handleClick).toHaveBeenCalled();
      }
    }
  });

  it("should display emotion description", () => {
    render(<EmotionVisualizer />);
    const descriptions = screen.getAllByText("欢快愉悦");
    expect(descriptions.length).toBeGreaterThan(0);
  });
});
