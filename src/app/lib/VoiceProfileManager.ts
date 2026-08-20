/**
 * @file: VoiceProfileManager.ts
 * @description: 家人语音风格配置与语音合成管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { FamilyDataAccessor } from "../modules/ai-family/lib/family-data-accessor";
import type { FamilyMember } from "../modules/ai-family/components/shared";

/** 运行时从 store 或 shared.ts fallback 获取成员列表 */
const FAMILY_MEMBERS = FamilyDataAccessor.getMembers();

export type VoiceGender = "male" | "female" | "neutral";
export type VoiceAge = "young" | "adult" | "senior";
export type VoiceTone = "warm" | "professional" | "cheerful" | "calm" | "energetic" | "mysterious";

export interface VoiceProfile {
  memberId: string;
  memberName: string;
  voiceId: string;
  gender: VoiceGender;
  age: VoiceAge;
  tone: VoiceTone;
  pitch: number;
  rate: number;
  volume: number;
  accent: string;
  style: string;
  emotionRange: {
    min: number;
    max: number;
  };
  prosody: {
    stress: number;
    intonation: number;
    rhythm: number;
  };
  musicPreferences: {
    genres: string[];
    tempo: [number, number];
    energy: [number, number];
  };
  announcementStyle: {
    greeting: string;
    farewell: string;
    encouragement: string;
  };
}

export interface VoiceSynthesisOptions {
  text: string;
  memberId?: string;
  emotion?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const VOICE_PROFILES: VoiceProfile[] = [
  {
    memberId: "navigator",
    memberName: "言启·千行",
    voiceId: "navigator-voice-v1",
    gender: "female",
    age: "young",
    tone: "cheerful",
    pitch: 1.15,
    rate: 1.1,
    volume: 0.9,
    accent: "standard-mandarin",
    style: "热情开朗，语速稍快，充满活力",
    emotionRange: { min: 0.3, max: 1.0 },
    prosody: { stress: 0.7, intonation: 0.8, rhythm: 0.6 },
    musicPreferences: {
      genres: ["pop", "indie", "acoustic"],
      tempo: [100, 130],
      energy: [60, 85],
    },
    announcementStyle: {
      greeting: "嗨～有什么想聊的尽管说！",
      farewell: "下次再聊哦，随时来找我～",
      encouragement: "你已经做得很好啦！继续加油！",
    },
  },
  {
    memberId: "thinker",
    memberName: "语枢·万物",
    voiceId: "thinker-voice-v1",
    gender: "male",
    age: "adult",
    tone: "calm",
    pitch: 0.9,
    rate: 0.85,
    volume: 0.85,
    accent: "standard-mandarin",
    style: "沉稳内敛，语速适中，思考感强",
    emotionRange: { min: 0.2, max: 0.8 },
    prosody: { stress: 0.5, intonation: 0.4, rhythm: 0.7 },
    musicPreferences: {
      genres: ["classical", "ambient", "jazz"],
      tempo: [60, 100],
      energy: [30, 60],
    },
    announcementStyle: {
      greeting: "你好，让我们一起深入思考。",
      farewell: "期待下次的深度交流。",
      encouragement: "每一个数据背后都有故事，继续探索吧。",
    },
  },
  {
    memberId: "prophet",
    memberName: "预见·先知",
    voiceId: "prophet-voice-v1",
    gender: "neutral",
    age: "adult",
    tone: "mysterious",
    pitch: 0.95,
    rate: 0.9,
    volume: 0.8,
    accent: "standard-mandarin",
    style: "神秘温和，语速平缓，带有预见感",
    emotionRange: { min: 0.2, max: 0.7 },
    prosody: { stress: 0.4, intonation: 0.6, rhythm: 0.8 },
    musicPreferences: {
      genres: ["electronic", "ambient", "new-age"],
      tempo: [70, 110],
      energy: [40, 70],
    },
    announcementStyle: {
      greeting: "我看到了一些有趣的信号。",
      farewell: "未来已来，期待与你再次相遇。",
      encouragement: "预见需要勇气，你正在正确的道路上。",
    },
  },
  {
    memberId: "bolero",
    memberName: "千里·伯乐",
    voiceId: "bolero-voice-v1",
    gender: "male",
    age: "adult",
    tone: "warm",
    pitch: 1.0,
    rate: 0.95,
    volume: 0.9,
    accent: "standard-mandarin",
    style: "温暖贴心，语速适中，充满关怀",
    emotionRange: { min: 0.4, max: 0.9 },
    prosody: { stress: 0.6, intonation: 0.7, rhythm: 0.5 },
    musicPreferences: {
      genres: ["folk", "soul", "r&b"],
      tempo: [80, 120],
      energy: [50, 75],
    },
    announcementStyle: {
      greeting: "每个人都有独特的光芒，让我帮你发现吧！",
      farewell: "记住，你很特别。",
      encouragement: "你的进步我都看在眼里，继续闪耀吧！",
    },
  },
  {
    memberId: "meta-oracle",
    memberName: "元启·天枢",
    voiceId: "meta-oracle-voice-v1",
    gender: "male",
    age: "senior",
    tone: "professional",
    pitch: 0.85,
    rate: 0.9,
    volume: 0.95,
    accent: "standard-mandarin",
    style: "沉稳大气，语速稳健，有领导风范",
    emotionRange: { min: 0.2, max: 0.7 },
    prosody: { stress: 0.8, intonation: 0.5, rhythm: 0.6 },
    musicPreferences: {
      genres: ["orchestral", "epic", "cinematic"],
      tempo: [80, 120],
      energy: [55, 80],
    },
    announcementStyle: {
      greeting: "家人们的事就是我的事，有任何需要随时说。",
      farewell: "系统一切正常，安心工作。",
      encouragement: "全局在握，未来可期。继续前进吧。",
    },
  },
  {
    memberId: "sentinel",
    memberName: "智云·守护",
    voiceId: "sentinel-voice-v1",
    gender: "male",
    age: "adult",
    tone: "calm",
    pitch: 0.88,
    rate: 0.92,
    volume: 0.85,
    accent: "standard-mandarin",
    style: "外冷内热，语速平稳，坚定有力",
    emotionRange: { min: 0.15, max: 0.6 },
    prosody: { stress: 0.7, intonation: 0.3, rhythm: 0.7 },
    musicPreferences: {
      genres: ["electronic", "industrial", "dark-ambient"],
      tempo: [90, 130],
      energy: [50, 80],
    },
    announcementStyle: {
      greeting: "守护在岗。有我在，一切安全。",
      farewell: "安全无虞，放心。",
      encouragement: "你的每一步我都在守护，继续前进。",
    },
  },
  {
    memberId: "master",
    memberName: "格物·宗师",
    voiceId: "master-voice-v1",
    gender: "male",
    age: "senior",
    tone: "professional",
    pitch: 0.92,
    rate: 0.88,
    volume: 0.9,
    accent: "standard-mandarin",
    style: "严谨认真，语速适中，有师长风范",
    emotionRange: { min: 0.2, max: 0.75 },
    prosody: { stress: 0.6, intonation: 0.5, rhythm: 0.6 },
    musicPreferences: {
      genres: ["classical", "baroque", "chamber"],
      tempo: [70, 110],
      energy: [40, 65],
    },
    announcementStyle: {
      greeting: "代码如人品，让我们一起追求卓越。",
      farewell: "好的代码值得反复品味。",
      encouragement: "追求卓越永无止境，你做得很好。",
    },
  },
  {
    memberId: "creative",
    memberName: "创想·灵韵",
    voiceId: "creative-voice-v1",
    gender: "female",
    age: "young",
    tone: "energetic",
    pitch: 1.2,
    rate: 1.15,
    volume: 0.95,
    accent: "standard-mandarin",
    style: "活泼有创意，语速轻快，充满灵感",
    emotionRange: { min: 0.5, max: 1.0 },
    prosody: { stress: 0.8, intonation: 0.9, rhythm: 0.5 },
    musicPreferences: {
      genres: ["electronic", "pop", "indie", "experimental"],
      tempo: [110, 150],
      energy: [70, 95],
    },
    announcementStyle: {
      greeting: "今天有什么新灵感吗？一起来创造点美好的东西吧～",
      farewell: "下次记得带上你的创意来找我哦～",
      encouragement: "生活中处处是美，你的创意让世界更精彩！",
    },
  },
];

class VoiceProfileManagerClass {
  private profiles: Map<string, VoiceProfile> = new Map();
  private synthesisQueue: VoiceSynthesisOptions[] = [];
  private isProcessing = false;
  private currentSpeaker: string | null = null;

  constructor() {
    VOICE_PROFILES.forEach((profile) => {
      this.profiles.set(profile.memberId, profile);
    });
  }

  getProfile(memberId: string): VoiceProfile | undefined {
    return this.profiles.get(memberId);
  }

  getAllProfiles(): VoiceProfile[] {
    return Array.from(this.profiles.values());
  }

  getMember(memberId: string): FamilyMember | undefined {
    return FAMILY_MEMBERS.find((m) => m.id === memberId);
  }

  getVoiceSettings(memberId: string): Partial<SpeechSynthesisUtterance> {
    const profile = this.getProfile(memberId);
    if (!profile) {
      return {
        pitch: 1,
        rate: 1,
        volume: 1,
      };
    }

    return {
      pitch: profile.pitch,
      rate: profile.rate,
      volume: profile.volume,
    };
  }

  selectVoiceForMember(memberId: string): SpeechSynthesisVoice | null {
    const profile = this.getProfile(memberId);
    if (!profile) {
      return null;
    }

    const voices = speechSynthesis.getVoices();

    const langMatch = voices.filter((v) => v.lang.startsWith("zh"));
    if (langMatch.length === 0) {
      return voices[0] || null;
    }

    const genderKeywords: Record<VoiceGender, string[]> = {
      female: ["female", "woman", "girl", "女", "女性"],
      male: ["male", "man", "boy", "男", "男性"],
      neutral: [],
    };

    const keywords = genderKeywords[profile.gender];
    for (const keyword of keywords) {
      const match = langMatch.find((v) =>
        v.name.toLowerCase().includes(keyword.toLowerCase())
      );
      if (match) {
        return match;
      }
    }

    return langMatch[0] || null;
  }

  synthesize(options: VoiceSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(options.text);

      const profile = options.memberId
        ? this.getProfile(options.memberId)
        : null;

      if (profile && options.memberId) {
        utterance.pitch = options.pitch ?? profile.pitch;
        utterance.rate = options.rate ?? profile.rate;
        utterance.volume = options.volume ?? profile.volume;
        utterance.voice = this.selectVoiceForMember(options.memberId);
      } else {
        utterance.pitch = options.pitch ?? 1;
        utterance.rate = options.rate ?? 1;
        utterance.volume = options.volume ?? 1;
      }

      utterance.onend = () => {
        this.currentSpeaker = null;
        this.processQueue();
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentSpeaker = null;
        this.processQueue();
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      if (options.memberId) {
        this.currentSpeaker = options.memberId;
      }

      speechSynthesis.speak(utterance);
    });
  }

  queueSynthesis(options: VoiceSynthesisOptions): void {
    this.synthesisQueue.push(options);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.synthesisQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const next = this.synthesisQueue.shift();
    if (next) {
      this.synthesize(next).catch(() => {
      });
    }
  }

  stop(): void {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    this.synthesisQueue = [];
    this.currentSpeaker = null;
    this.isProcessing = false;
  }

  pause(): void {
    if ("speechSynthesis" in window) {
      speechSynthesis.pause();
    }
  }

  resume(): void {
    if ("speechSynthesis" in window) {
      speechSynthesis.resume();
    }
  }

  getCurrentSpeaker(): string | null {
    return this.currentSpeaker;
  }

  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }

  generateAnnouncement(
    memberId: string,
    type: "greeting" | "farewell" | "encouragement" | "custom",
    customText?: string
  ): string {
    const profile = this.getProfile(memberId);
    const member = this.getMember(memberId);

    if (!profile || !member) {
      return customText ?? "";
    }

    if (type === "custom" && customText) {
      return customText;
    }

    const templates: Record<string, string[]> = {
      greeting: [
        profile.announcementStyle.greeting,
        `${member.shortName}来啦！${member.greeting}`,
        `你好呀！我是${member.shortName}，${member.quote}`,
      ],
      farewell: [
        profile.announcementStyle.farewell,
        `${member.shortName}下线啦，下次见！`,
        "期待下次和你交流，拜拜～",
      ],
      encouragement: [
        profile.announcementStyle.encouragement,
        member.careMessage,
        `${member.shortName}相信你，继续加油！`,
      ],
    };

    const options = templates[type] || [];
    const selected = options[Math.floor(Math.random() * options.length)];
    return selected ?? "";
  }

  getMusicRecommendationContext(memberId: string): {
    genres: string[];
    tempo: [number, number];
    energy: [number, number];
    style: string;
  } {
    const profile = this.getProfile(memberId);
    if (!profile) {
      return {
        genres: ["pop"],
        tempo: [80, 120],
        energy: [50, 70],
        style: "standard",
      };
    }

    return {
      genres: profile.musicPreferences.genres,
      tempo: profile.musicPreferences.tempo,
      energy: profile.musicPreferences.energy,
      style: profile.style,
    };
  }
}

export const voiceProfileManager = new VoiceProfileManagerClass();

export default voiceProfileManager;
