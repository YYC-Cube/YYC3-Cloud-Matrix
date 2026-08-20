/**
 * @file: hotel-voice-service.ts
 * @description: 酒店语音交互服务 - 语音识别与合成
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hotel, voice, speech, recognition, synthesis]
 *
 * @brief: AI Family酒店人语音交互能力
 * - Web Speech API 语音识别（SpeechRecognition）
 * - Web Speech API 语音合成（SpeechSynthesis）
 * - 多语言支持（中文/英文/日文等）
 * - 酒店场景优化（专业术语识别）
 */

// ============================================================
// Web Speech API Type Declarations (浏览器原生API扩展)
// ============================================================

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    grammars: unknown;
    start(): void;
    stop(): void;
    abort(): void;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ============================================================
// 类型定义
// ============================================================

export interface VoiceServiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  enableAutoPunctuation: boolean;
  speechRate: number;        // 0.1 - 2.0 (1.0 = 正常)
  speechPitch: number;       // 0.0 - 2.0 (1.0 = 正常)
  speechVolume: number;      // 0.0 - 1.0 (1.0 = 最大)
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export interface VoiceSynthesisOptions {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Event) => void;
}

export type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

export interface VoiceEvent {
  type: "start" | "result" | "end" | "error";
  data?: VoiceRecognitionResult | string | Error;
  timestamp: number;
}

// ============================================================
// 酒店专用词汇表（提升识别准确度）
// ============================================================

export const HOTEL_VOCABULARY = {
  // 房间类型
  rooms: ["标准间", "大床房", "双床房", "套房", "总统套房", "海景房", "山景房", "商务套房", "豪华房"],

  // 服务项目
  services: ["入住", "退房", "预订", "叫醒", "客房服务", "洗衣", "行李寄存", "租车", "机场接送"],

  // 餐饮相关
  dining: ["早餐", "午餐", "晚餐", "自助餐", "中餐", "西餐", "日料", "酒吧", "咖啡厅", "送餐"],

  // 设施
  facilities: ["健身房", "游泳池", "SPA", "会议室", "WiFi", "停车场", "商务中心", "儿童乐园"],

  // 常见问题
  issues: ["空调", "热水", "噪音", "清洁", "网络", "电视", "马桶", "淋浴"],

  // 紧急情况
  emergency: ["紧急", "火警", "急救", "报警", "帮助", "投诉", "不满意"],

  // 称呼和礼貌用语
  greetings: ["你好", "您好", "谢谢", "对不起", "不好意思", "麻烦", "请", "请问"],
};

// ============================================================
// 语音服务类
// ============================================================

export class HotelVoiceService {
  private config: VoiceServiceConfig;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private status: VoiceStatus = "idle";
  private eventListeners: Map<string, Set<(event: VoiceEvent) => void>> = new Map();
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(config: Partial<VoiceServiceConfig> = {}) {
    this.config = {
      language: config.language || "zh-CN",
      continuous: config.continuous || false,
      interimResults: config.interimResults || true,
      maxAlternatives: config.maxAlternatives || 3,
      enableAutoPunctuation: config.enableAutoPunctuation ?? true,
      speechRate: config.speechRate || 1.0,
      speechPitch: config.speechPitch || 1.0,
      speechVolume: config.speechVolume || 1.0,
    };

    this.synthesis = window.speechSynthesis || (null as unknown as SpeechSynthesis);

    this.initializeSpeechRecognition();
  }

  // ========== 公共 API ==========

  /**
   * 开始语音识别（监听用户说话）
   */
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("浏览器不支持语音识别"));
        return;
      }

      if (this.status === "listening") {
        resolve(); // 已经在监听中
        return;
      }

      try {
        this.recognition.lang = this.config.language;
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;
        this.recognition.maxAlternatives = this.config.maxAlternatives;

        this.recognition.start();
        this.setStatus("listening");

        this.emit({ type: "start", timestamp: Date.now() });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 停止语音识别
   */
  stopListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || this.status !== "listening") {
        resolve();
        return;
      }

      try {
        this.recognition.stop();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 文本转语音（让AI说话）
   */
  speak(text: string, options?: Partial<VoiceSynthesisOptions>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("浏览器不支持语音合成"));
        return;
      }

      // 如果正在说话，先停止
      if (this.currentUtterance) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // 配置语音参数
      utterance.rate = options?.rate || this.config.speechRate;
      utterance.pitch = options?.pitch || this.config.speechPitch;
      utterance.volume = options?.volume || this.config.speechVolume;
      utterance.lang = this.config.language;

      // 选择合适的语音（优先选择中文女声，更友好）
      if (options?.voice) {
        utterance.voice = options.voice;
      } else {
        const voices = this.synthesis.getVoices();
        const preferredVoice = this.findBestVoice(voices);
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      // 事件处理
      utterance.onstart = () => {
        this.setStatus("speaking");
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.setStatus("idle");
        this.currentUtterance = null;
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.setStatus("idle");
        this.currentUtterance = null;
        options?.onError?.(event);
        reject(new Error(`语音合成错误: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * 立即停止说话
   */
  stopSpeaking(): void {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.setStatus("idle");
    }
  }

  /**
   * 获取当前状态
   */
  getStatus(): VoiceStatus {
    return this.status;
  }

  updateVoiceConfig(updates: { speechRate?: number; speechPitch?: number; speechVolume?: number; language?: string }): void {
    if (updates.speechRate !== undefined) { this.config.speechRate = updates.speechRate; }
    if (updates.speechPitch !== undefined) { this.config.speechPitch = updates.speechPitch; }
    if (updates.speechVolume !== undefined) { this.config.speechVolume = updates.speechVolume; }
    if (updates.language !== undefined) { this.config.language = updates.language; }
  }

  /**
   * 检查浏览器是否支持语音功能
   */
  static checkBrowserSupport(): {
    recognition: boolean;
    synthesis: boolean;
    availableLanguages: string[];
    availableVoices: string[];
  } {
    const recognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const synthesis = !!window.speechSynthesis;

    let availableLanguages: string[] = [];
    let availableVoices: string[] = [];

    if (synthesis) {
      const synth = window.speechSynthesis;
      availableVoices = synth.getVoices().map(v => `${v.name} (${v.lang})`);

      // 尝试获取支持的语言
      if (recognition) {
        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionClass) {
          availableLanguages = ["zh-CN", "en-US", "ja-JP", "ko-KR"]; // 常见语言
        }
      }
    }

    return { recognition, synthesis, availableLanguages, availableVoices };
  }

  /**
   * 获取可用的语音列表
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) { return []; }
    return this.synthesis.getVoices();
  }

  /**
   * 监听语音事件
   */
  on(eventType: string, callback: (event: VoiceEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    return () => this.off(eventType, callback);
  }

  off(eventType: string, callback: (event: VoiceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // ========== 私有方法 ==========

  private initializeSpeechRecognition(): void {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn("[HotelVoice] 浏览器不支持语音识别");
      return;
    }

    this.recognition = new SpeechRecognitionClass();

    this.recognition.onaudiostart = () => {
      console.info("[HotelVoice] 开始监听...");
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.setStatus("processing");

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        const voiceResult: VoiceRecognitionResult = {
          transcript: this.postProcessText(transcript),
          confidence,
          isFinal,
          timestamp: Date.now(),
        };

        this.emit({
          type: "result",
          data: voiceResult,
          timestamp: Date.now(),
        });

        if (isFinal) {
          this.setStatus("idle");
        }
      }
    };

    this.recognition.onerror = (event: Event) => {
      console.error("[HotelVoice] 识别错误:", event);
      this.setStatus("idle");
      this.emit({
        type: "error",
        data: event as unknown as Error,
        timestamp: Date.now(),
      });
    };

    this.recognition.onend = () => {
      if (this.status === "listening") {
        // 如果配置了连续监听，自动重启
        if (this.config.continuous) {
          try {
            this.recognition!.start();
          } catch {
            this.setStatus("idle");
          }
        } else {
          this.setStatus("idle");
        }
      }

      this.emit({
        type: "end",
        timestamp: Date.now(),
      });
    };
  }

  private findBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // 根据语言和性别选择最佳语音
    const langPrefix = this.config.language.split("-")[0];

    // 优先级：目标语言女性 > 目标语言男性 > 默认语音
    const preferred = voices.find(v =>
      v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes("female")
    ) || voices.find(v =>
      v.lang.startsWith(langPrefix)
    ) || voices[0];

    return preferred || null;
  }

  private postProcessText(text: string): string {
    // 后处理：修正酒店专业术语
    let processed = text;

    // 常见误识别修正
    const corrections: [RegExp, string][] = [
      [/入组/g, "入住"],
      [/退房费/g, "退房"],
      [/订房/g, "预订"],
      [/叫行/g, "叫醒"],
      [/WIFI|wifi|Wifi/gi, "WiFi"],
      [/SPA|spa/gi, "SPA"],
      [/VIP|vip/gi, "VIP"],
    ];

    for (const [pattern, replacement] of corrections) {
      processed = processed.replace(pattern, replacement);
    }

    return processed;
  }

  private setStatus(status: VoiceStatus): void {
    this.status = status;
  }

  private emit(event: VoiceEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error("[HotelVoice] 事件处理器错误:", error);
        }
      });
    }
  }
}

// ============================================================
// 导出单例实例
// ============================================================

let voiceServiceInstance: HotelVoiceService | null = null;

export function getHotelVoiceService(config?: Partial<VoiceServiceConfig>): HotelVoiceService {
  if (!voiceServiceInstance) {
    voiceServiceInstance = new HotelVoiceService(config);
  }
  return voiceServiceInstance;
}
