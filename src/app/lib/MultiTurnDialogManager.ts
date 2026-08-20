/**
 * @file: MultiTurnDialogManager.ts
 * @description: 多轮对话管理系统，支持音乐推荐的上下文理解和连续对话
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
import { familyPersonalizedRecommender } from "./FamilyPersonalizedRecommender";
import type { EmotionType } from "./EmotionMusicBridge";

export type DialogState =
  | "idle"
  | "greeting"
  | "collecting_preferences"
  | "making_recommendation"
  | "refining_recommendation"
  | "playing"
  | "feedback"
  | "concluding";

export type DialogIntent =
  | "greet"
  | "request_recommendation"
  | "like_song"
  | "dislike_song"
  | "request_similar"
  | "request_different"
  | "change_mood"
  | "ask_about_recommendation"
  | "provide_feedback"
  | "end_conversation"
  | "help"
  | "unknown";

export interface DialogTurn {
  id: string;
  turnNumber: number;
  timestamp: number;
  userInput: string;
  intent: DialogIntent;
  entities: DialogEntities;
  systemResponse: string;
  context: DialogContext;
  musicRecommendation?: MusicRecommendationResult;
  action?: DialogAction;
}

export interface DialogEntities {
  genre?: string;
  artist?: string;
  mood?: string;
  tempo?: number;
  energy?: number;
  trackId?: string;
  memberId?: string;
}

export interface DialogContext {
  currentEmotion?: EmotionType;
  preferredGenres: string[];
  dislikedGenres: string[];
  recentTracks: string[];
  conversationHistory: string[];
  lastRecommendation?: MusicRecommendationResult;
  feedbackScore?: number;
}

export interface MusicRecommendationResult {
  tracks: RecommendedTrack[];
  member: FamilyMember;
  reasoning: string;
  confidence: number;
}

export interface RecommendedTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  energy: number;
}

export interface DialogAction {
  type: "play" | "pause" | "next" | "previous" | "like" | "dislike" | "recommend" | "explain" | "confirm" | "none";
  payload?: Record<string, unknown>;
}

export interface MultiTurnDialogConfig {
  maxTurns: number;
  emotionTracking: boolean;
  familyMember?: string;
  autoRecommend: boolean;
  responseStyle: "concise" | "detailed" | "playful";
}

const DEFAULT_CONFIG: MultiTurnDialogConfig = {
  maxTurns: 10,
  emotionTracking: true,
  familyMember: "navigator",
  autoRecommend: true,
  responseStyle: "detailed",
};

const INTENT_PATTERNS: Record<DialogIntent, RegExp[]> = {
  greet: [/你好|嗨|哈喽|hi|hello/i, /早上好|下午好|晚上好/i],
  request_recommendation: [/推荐|播放|放首歌|来首|想听|点歌/i, /播放.*音乐|放.*歌/i],
  like_song: [/喜欢|好听|棒|不错|赞|爱了/i, /再.*放|再.*听/i],
  dislike_song: [/不好听|难听|不要|跳过|换一首/i, /不.*这.*首/i],
  request_similar: [/类似|相似|同样风格|同.*类型/i, /再.*首/i],
  request_different: [/换个风格|不一样|其他|另外/i, /想.*别的/i],
  change_mood: [/心情|情绪|换个.*心情|想.*听/i, /.*开心|.*难过|.*放松/i],
  ask_about_recommendation: [/为什么|怎么|推荐.*理由/i, /为什么.*这首/i],
  provide_feedback: [/满意|一般|还可以|不.*喜欢/i],
  end_conversation: [/再见|拜拜|结束|退出/i, /不用了|好了/i],
  help: [/帮助|帮助|怎么|使用/i, /.*是什么|.*意思/i],
  unknown: [],
};

class MultiTurnDialogManagerClass {
  private config: MultiTurnDialogConfig;
  private currentState: DialogState = "idle";
  private currentTurn: number = 0;
  private dialogHistory: DialogTurn[] = [];
  private context: DialogContext;
  private currentMember: FamilyMember;
  private isActive: boolean = false;

  constructor(config: Partial<MultiTurnDialogConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.context = this.initContext();
    this.currentMember = FAMILY_MEMBERS.find((m) => m.id === this.config.familyMember) || FAMILY_MEMBERS[0];
  }

  private initContext(): DialogContext {
    return {
      preferredGenres: [],
      dislikedGenres: [],
      recentTracks: [],
      conversationHistory: [],
      lastRecommendation: undefined,
      feedbackScore: undefined,
    };
  }

  start(memberId?: string): void {
    if (memberId) {
      this.currentMember = FAMILY_MEMBERS.find((m) => m.id === memberId) || FAMILY_MEMBERS[0];
    }
    this.isActive = true;
    this.currentTurn = 0;
    this.currentState = "greeting";
    this.dialogHistory = [];
    this.context = this.initContext();
  }

  processInput(userInput: string): DialogTurn {
    if (!this.isActive) {
      this.start();
    }

    if (this.currentTurn >= this.config.maxTurns) {
      return this.createTurn(userInput, "unknown", {}, "对话已达最大轮次，感谢使用！", { type: "none" });
    }

    this.currentTurn++;
    const intent = this.parseIntent(userInput);
    const entities = this.extractEntities(userInput);
    const { response, action } = this.generateResponse(intent, entities, userInput);

    const turn = this.createTurn(userInput, intent, entities, response, action);
    this.dialogHistory.push(turn);
    this.context.conversationHistory.push(userInput);

    if (intent === "end_conversation" || this.currentTurn >= this.config.maxTurns) {
      this.end();
    }

    return turn;
  }

  private parseIntent(userInput: string): DialogIntent {
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (intent === "unknown") {
        continue;
      }

      for (const pattern of patterns) {
        if (pattern.test(userInput)) {
          return intent as DialogIntent;
        }
      }
    }
    return "unknown";
  }

  private extractEntities(userInput: string): DialogEntities {
    const entities: DialogEntities = {};

    const genreKeywords: Record<string, string> = {
      流行: "pop",
      摇滚: "rock",
      爵士: "jazz",
      电子: "electronic",
      古典: "classical",
      嘻哈: "hip-hop",
      民谣: "folk",
      轻音乐: "ambient",
    };

    for (const [keyword, genre] of Object.entries(genreKeywords)) {
      if (userInput.includes(keyword)) {
        entities.genre = genre;
        break;
      }
    }

    const moodKeywords: Record<string, string> = {
      开心: "happy",
      快乐: "happy",
      高兴: "happy",
      难过: "sad",
      伤心: "sad",
      悲伤: "sad",
      放松: "relaxed",
      舒缓: "relaxed",
      平静: "calm",
      焦虑: "anxious",
      紧张: "anxious",
      兴奋: "excited",
      激动: "excited",
    };

    for (const [keyword, mood] of Object.entries(moodKeywords)) {
      if (userInput.includes(keyword)) {
        entities.mood = mood;
        break;
      }
    }

    return entities;
  }

  private generateResponse(
    intent: DialogIntent,
    entities: DialogEntities,
    userInput: string
  ): { response: string; action: DialogAction } {
    switch (intent) {
      case "greet":
        return this.handleGreet();
      case "request_recommendation":
        return this.handleRecommendation(entities);
      case "like_song":
        return this.handleLike();
      case "dislike_song":
        return this.handleDislike();
      case "request_similar":
        return this.handleSimilar();
      case "request_different":
        return this.handleDifferent(entities);
      case "change_mood":
        return this.handleMoodChange(entities);
      case "ask_about_recommendation":
        return this.handleExplain();
      case "provide_feedback":
        return this.handleFeedback(userInput);
      case "end_conversation":
        return this.handleEnd();
      case "help":
        return this.handleHelp();
      default:
        return this.handleUnknown();
    }
  }

  private handleGreet(): { response: string; action: DialogAction } {
    this.currentState = "collecting_preferences";
    const greetings = [
      `${this.currentMember.greeting} 我是${this.currentMember.shortName}，有什么音乐想听吗？`,
      `你好！${this.currentMember.quote} 告诉我你想听什么风格的音乐？`,
    ];
    return { response: greetings[Math.floor(Math.random() * greetings.length)], action: { type: "none" } };
  }

  private handleRecommendation(entities: DialogEntities): { response: string; action: DialogAction } {
    this.currentState = "making_recommendation";

    if (entities.genre) {
      this.context.preferredGenres.push(entities.genre);
    }

    const recommendation = this.generateMusicRecommendation(entities);
    this.context.lastRecommendation = recommendation;

    if (recommendation.tracks.length === 0) {
      return {
        response: this.getResponseText("no_recommendation"),
        action: { type: "recommend" },
      };
    }

    const trackList = recommendation.tracks.slice(0, 3).map((t, i) => `${i + 1}. ${t.title} - ${t.artist}`).join("\n");
    const response = `${recommendation.reasoning}\n\n为你推荐：\n${trackList}\n\n想听哪一首？`;

    return { response, action: { type: "recommend", payload: { recommendation } } };
  }

  private handleLike(): { response: string; action: DialogAction } {
    this.context.feedbackScore = 1;
    const responses = [
      "太好了！我也很喜欢这首歌～",
      "见解相同！这首歌确实很棒。",
      "很有品味！要继续播放吗？",
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)], action: { type: "play" } };
  }

  private handleDislike(): { response: string; action: DialogAction } {
    this.currentState = "refining_recommendation";
    const responses = [
      "好吧，让我们换一首～",
      "明白了，我再为你推荐其他的。",
      "没关系，试试这首怎么样？",
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)], action: { type: "next" } };
  }

  private handleSimilar(): { response: string; action: DialogAction } {
    if (!this.context.lastRecommendation) {
      return { response: "让我先为你推荐一些歌曲～", action: { type: "recommend" } };
    }
    const genre = this.context.lastRecommendation.tracks[0]?.genre;
    return this.handleRecommendation({ genre });
  }

  private handleDifferent(_entities: DialogEntities): { response: string; action: DialogAction } {
    this.currentState = "refining_recommendation";
    const responses = [
      "好的，换个风格！",
      "明白了，换一种口味～",
      "没问题，让我为你找点不同的！",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    return { response, action: { type: "recommend" } };
  }

  private handleMoodChange(entities: DialogEntities): { response: string; action: DialogAction } {
    if (entities.mood) {
      this.context.currentEmotion = entities.mood as EmotionType;
    }
    return this.handleRecommendation(entities);
  }

  private handleExplain(): { response: string; action: DialogAction } {
    if (!this.context.lastRecommendation) {
      return { response: "还没有推荐呢，让我为你推荐一些～", action: { type: "recommend" } };
    }
    return {
      response: this.context.lastRecommendation.reasoning,
      action: { type: "explain" },
    };
  }

  private handleFeedback(userInput: string): { response: string; action: DialogAction } {
    const positivePatterns = [/满意|棒|不错|喜欢|好/i];
    const negativePatterns = [/一般|普通|不.*满意/i];

    if (positivePatterns.some((p) => p.test(userInput))) {
      this.context.feedbackScore = 1;
      return { response: "很高兴能帮到你！还有其他想听的吗？", action: { type: "none" } };
    } else if (negativePatterns.some((p) => p.test(userInput))) {
      this.context.feedbackScore = 0;
      return { response: "明白，我会继续改进的。想听点别的吗？", action: { type: "recommend" } };
    }
    return { response: "感谢反馈！还有其他需要吗？", action: { type: "none" } };
  }

  private handleEnd(): { response: string; action: DialogAction } {
    const farewells = [
      `${this.currentMember.shortName}下线啦，期待下次见面！`,
      "再见，希望音乐给你带来好心情！",
      "有需要随时找我哦～",
    ];
    return { response: farewells[Math.floor(Math.random() * farewells.length)], action: { type: "none" } };
  }

  private handleHelp(): { response: string; action: DialogAction } {
    const helpText = `我可以帮你：
1. 推荐音乐 - 说"推荐首歌"或"想听XX风格的歌"
2. 播放控制 - 说"播放"、"暂停"、"下一首"
3. 调整心情 - 说"我想听放松的音乐"
4. 反馈偏好 - 说"喜欢"或"不喜欢"
5. 结束对话 - 说"再见"或"拜拜"`;
    return { response: helpText, action: { type: "none" } };
  }

  private handleUnknown(): { response: string; action: DialogAction } {
    const responses = [
      "抱歉，我没太听懂。你可以说'推荐首歌'或'想听什么风格的音乐'。",
      "让我换个方式帮你。可以说'播放音乐'或'推荐摇滚'。",
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)], action: { type: "none" } };
  }

  private getResponseText(key: string): string {
    const responses: Record<string, string> = {
      no_recommendation: "暂时没有找到符合条件的歌曲，不如试试其他风格？",
      error: "抱歉，出了点问题，让我们重新开始吧。",
    };
    return responses[key] || "好的，让我来处理。";
  }

  private generateMusicRecommendation(_entities: DialogEntities): MusicRecommendationResult {
    const tracks = this.getMockTracks();
    const context = {
      memberId: this.currentMember.id,
      userEmotion: this.context.currentEmotion,
      timeOfDay: this.getTimeOfDay(),
      activity: undefined,
      recentGenres: this.context.preferredGenres,
    };

    const recommendation = familyPersonalizedRecommender.generateRecommendation(
      tracks.map((t) => ({
        ...t,
        valence: t.energy * 0.8,
        matchScore: 0,
        reasons: [],
      })),
      context
    );

    return {
      tracks: recommendation.recommendedTracks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        tempo: t.tempo,
        energy: t.energy,
      })),
      member: this.currentMember,
      reasoning: recommendation.reasoning,
      confidence: recommendation.confidence,
    };
  }

  private getMockTracks(): { id: string; title: string; artist: string; genre: string; tempo: number; energy: number }[] {
    return [
      { id: "1", title: "晨曦之光", artist: "都市节拍", genre: "pop", tempo: 110, energy: 75 },
      { id: "2", title: "星空漫步", artist: "夜间旋律", genre: "electronic", tempo: 95, energy: 60 },
      { id: "3", title: "雨后咖啡馆", artist: "午后音符", genre: "jazz", tempo: 85, energy: 45 },
      { id: "4", title: "奔跑的理由", artist: "青春浪潮", genre: "rock", tempo: 130, energy: 85 },
      { id: "5", title: "静夜思", artist: "冥想空间", genre: "ambient", tempo: 60, energy: 25 },
      { id: "6", title: "舞动人生", artist: "派对精灵", genre: "electronic", tempo: 125, energy: 90 },
      { id: "7", title: "时光流转", artist: "怀旧岁月", genre: "folk", tempo: 80, energy: 50 },
      { id: "8", title: "未来之声", artist: "科技浪潮", genre: "electronic", tempo: 140, energy: 80 },
    ];
  }

  private getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "morning";
    }
    if (hour < 18) {
      return "afternoon";
    }
    if (hour < 21) {
      return "evening";
    }
    return "night";
  }

  private createTurn(
    userInput: string,
    intent: DialogIntent,
    entities: DialogEntities,
    systemResponse: string,
    action: DialogAction
  ): DialogTurn {
    return {
      id: `turn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      turnNumber: this.currentTurn,
      timestamp: Date.now(),
      userInput,
      intent,
      entities,
      systemResponse,
      context: { ...this.context },
      action,
    };
  }

  end(): void {
    this.isActive = false;
    this.currentState = "concluding";
  }

  reset(): void {
    this.isActive = false;
    this.currentState = "idle";
    this.currentTurn = 0;
    this.dialogHistory = [];
    this.context = this.initContext();
  }

  getState(): DialogState {
    return this.currentState;
  }

  getHistory(): DialogTurn[] {
    return [...this.dialogHistory];
  }

  getContext(): DialogContext {
    return { ...this.context };
  }

  getCurrentMember(): FamilyMember {
    return this.currentMember;
  }

  isDialogActive(): boolean {
    return this.isActive;
  }

  setEmotion(emotion: EmotionType): void {
    this.context.currentEmotion = emotion;
  }

  getTurnCount(): number {
    return this.currentTurn;
  }
}

export const multiTurnDialogManager = new MultiTurnDialogManagerClass();

export default multiTurnDialogManager;
