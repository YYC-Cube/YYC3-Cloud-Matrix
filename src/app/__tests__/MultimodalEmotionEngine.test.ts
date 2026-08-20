/**
 * @file: MultimodalEmotionEngine.test.ts
 * @description: 多模态情感融合引擎单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import multimodalEmotionEngine, {
  type ModalityInput,
  type TextModalityData,
  type VoiceModalityData,
  type BehaviorModalityData,
} from "../lib/MultimodalEmotionEngine";

vi.mock("../lib/MusicEventBus", () => ({
  default: {
    emit: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

describe("MultimodalEmotionEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeTextModality", () => {
    it("should analyze text and return emotion", () => {
      const data: TextModalityData = {
        text: "今天真是太开心了！",
        source: "chat",
      };
      const result = multimodalEmotionEngine.analyzeTextModality(data);
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("confidence");
    });

    it("should detect negative emotion from text", () => {
      const data: TextModalityData = {
        text: "我很沮丧，事情进展不顺利",
        source: "chat",
      };
      const result = multimodalEmotionEngine.analyzeTextModality(data);
      expect(["sad", "anxious", "neutral"]).toContain(result.emotion);
    });

    it("should detect positive emotion from text", () => {
      const data: TextModalityData = {
        text: "太棒了！我成功了！",
        source: "chat",
      };
      const result = multimodalEmotionEngine.analyzeTextModality(data);
      expect(["happy", "excited", "calm", "neutral"]).toContain(result.emotion);
    });
  });

  describe("analyzeVoiceModality", () => {
    it("should analyze voice data and return emotion", () => {
      const data: VoiceModalityData = {
        transcript: "我很高兴",
        pitch: 1.3,
        rate: 1.2,
      };
      const result = multimodalEmotionEngine.analyzeVoiceModality(data);
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("confidence");
    });

    it("should detect excited emotion from high pitch", () => {
      const data: VoiceModalityData = {
        transcript: "好的",
        pitch: 1.5,
        rate: 1.4,
      };
      const result = multimodalEmotionEngine.analyzeVoiceModality(data);
      expect(result.confidence).toBeGreaterThan(0.2);
    });

    it("should detect calm emotion from low pitch and rate", () => {
      const data: VoiceModalityData = {
        transcript: "好的",
        pitch: 0.7,
        rate: 0.6,
      };
      const result = multimodalEmotionEngine.analyzeVoiceModality(data);
      expect(result.confidence).toBeGreaterThan(0.2);
    });
  });

  describe("analyzeBehaviorModality", () => {
    it("should analyze behavior data and return emotion", () => {
      const data: BehaviorModalityData = {
        clickFrequency: 5,
        dwellTime: 30,
        scrollSpeed: 50,
      };
      const result = multimodalEmotionEngine.analyzeBehaviorModality(data);
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("confidence");
    });

    it("should detect anxious from high click frequency", () => {
      const data: BehaviorModalityData = {
        clickFrequency: 20,
        dwellTime: 2,
        scrollSpeed: 200,
      };
      const result = multimodalEmotionEngine.analyzeBehaviorModality(data);
      expect(result.emotion).toBe("anxious");
    });

    it("should detect calm from low activity", () => {
      const data: BehaviorModalityData = {
        clickFrequency: 2,
        dwellTime: 120,
        scrollSpeed: 20,
      };
      const result = multimodalEmotionEngine.analyzeBehaviorModality(data);
      expect(result.confidence).toBeGreaterThan(0.4);
    });
  });

  describe("fuse", () => {
    it("should fuse multiple modalities", () => {
      const inputs: ModalityInput[] = [
        {
          type: "text",
          data: { text: "我很开心", source: "chat" },
          confidence: 0.8,
          timestamp: Date.now(),
        },
        {
          type: "voice",
          data: { transcript: "开心", pitch: 1.2 },
          confidence: 0.7,
          timestamp: Date.now(),
        },
      ];
      const result = multimodalEmotionEngine.fuse(inputs);
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("contributions");
      expect(result).toHaveProperty("confidence");
    });

    it("should return neutral for empty inputs", () => {
      const result = multimodalEmotionEngine.fuse([]);
      expect(result.emotion.type).toBe("neutral");
    });
  });

  describe("processText", () => {
    it("should process text and return fused result", () => {
      const result = multimodalEmotionEngine.processText("我很高兴", "chat");
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("confidence");
    });
  });

  describe("processVoice", () => {
    it("should process voice data and return fused result", () => {
      const result = multimodalEmotionEngine.processVoice({
        transcript: "好的",
        pitch: 1.0,
        rate: 1.0,
      });
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("confidence");
    });
  });

  describe("processBehavior", () => {
    it("should process behavior data and return fused result", () => {
      const result = multimodalEmotionEngine.processBehavior({
        clickFrequency: 5,
        dwellTime: 30,
        scrollSpeed: 50,
      });
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("confidence");
    });
  });

  describe("processMultimodal", () => {
    it("should process multiple modalities together", () => {
      const result = multimodalEmotionEngine.processMultimodal(
        "我很开心",
        { transcript: "开心", pitch: 1.2 },
        { clickFrequency: 5, dwellTime: 30, scrollSpeed: 50 }
      );
      expect(result).toHaveProperty("emotion");
      expect(result).toHaveProperty("contributions");
    });

    it("should work with partial data", () => {
      const result = multimodalEmotionEngine.processMultimodal("我很开心");
      expect(result).toHaveProperty("emotion");
    });
  });

  describe("setModalityWeight", () => {
    it("should update modality weight", () => {
      multimodalEmotionEngine.setModalityWeight("text", 0.5, 0.9);
    });
  });

  describe("getFusionHistory", () => {
    it("should return fusion history", () => {
      multimodalEmotionEngine.processText("测试");
      const history = multimodalEmotionEngine.getFusionHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("getCurrentFusedEmotion", () => {
    it("should return current fused emotion", () => {
      multimodalEmotionEngine.processText("测试");
      const current = multimodalEmotionEngine.getCurrentFusedEmotion();
      expect(current).toHaveProperty("emotion");
    });
  });
});
