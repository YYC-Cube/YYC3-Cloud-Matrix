/**
 * @file: LyricsGenerator.ts
 * @description: AI 歌词生成系统，支持多种风格和主题
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { FamilyDataAccessor } from "../modules/ai-family/lib/family-data-accessor";

/** 运行时从 store 或 shared.ts fallback 获取成员列表 */
const FAMILY_MEMBERS = FamilyDataAccessor.getMembers();
import type { EmotionType } from "./EmotionMusicBridge";

export type LyricsStyle =
  | "pop"
  | "rock"
  | "ballad"
  | "electronic"
  | "folk"
  | "rap"
  | "jazz"
  | "classical";

export type LyricsTheme =
  | "love"
  | "friendship"
  | "dream"
  | "nature"
  | "city"
  | "memory"
  | "freedom"
  | "hope"
  | "farewell"
  | "celebration";

export interface LyricsGenerationConfig {
  style: LyricsStyle;
  theme: LyricsTheme;
  emotion?: EmotionType;
  language?: "zh-CN" | "en-US";
  verseCount?: number;
  chorusCount?: number;
  includeBridge?: boolean;
  rhymeScheme?: "AABB" | "ABAB" | "ABBA" | "free";
  memberInfluence?: string;
}

export interface GeneratedLyrics {
  id: string;
  title: string;
  style: LyricsStyle;
  theme: LyricsTheme;
  emotion: EmotionType;
  sections: LyricsSection[];
  metadata: {
    wordCount: number;
    lineCount: number;
    generatedAt: number;
    member: string;
    confidence: number;
  };
}

export interface LyricsSection {
  type: "verse" | "chorus" | "bridge" | "intro" | "outro";
  number?: number;
  lines: string[];
}

interface StyleTemplate {
  name: string;
  lineLength: [number, number];
  rhymeDensity: number;
  emotionalIntensity: number;
  vocabulary: string[];
  structure: string[];
}

interface ThemeTemplate {
  name: string;
  keywords: string[];
  metaphors: string[];
  emotions: EmotionType[];
}

const STYLE_TEMPLATES: Record<LyricsStyle, StyleTemplate> = {
  pop: {
    name: "流行",
    lineLength: [6, 12],
    rhymeDensity: 0.7,
    emotionalIntensity: 0.6,
    vocabulary: ["阳光", "微笑", "心跳", "梦想", "青春", "回忆", "约定", "永远"],
    structure: ["verse", "chorus", "verse", "chorus", "bridge", "chorus"],
  },
  rock: {
    name: "摇滚",
    lineLength: [4, 10],
    rhymeDensity: 0.5,
    emotionalIntensity: 0.9,
    vocabulary: ["燃烧", "自由", "呐喊", "力量", "突破", "黑夜", "黎明", "战斗"],
    structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
  },
  ballad: {
    name: "抒情",
    lineLength: [8, 15],
    rhymeDensity: 0.8,
    emotionalIntensity: 0.7,
    vocabulary: ["月光", "思念", "泪水", "温柔", "等待", "守候", "承诺", "离别"],
    structure: ["verse", "verse", "chorus", "verse", "chorus", "bridge", "chorus"],
  },
  electronic: {
    name: "电子",
    lineLength: [4, 8],
    rhymeDensity: 0.4,
    emotionalIntensity: 0.8,
    vocabulary: ["霓虹", "节奏", "脉冲", "信号", "虚拟", "现实", "未来", "光速"],
    structure: ["intro", "verse", "chorus", "bridge", "chorus", "outro"],
  },
  folk: {
    name: "民谣",
    lineLength: [8, 14],
    rhymeDensity: 0.6,
    emotionalIntensity: 0.5,
    vocabulary: ["田野", "故乡", "小路", "黄昏", "炊烟", "故事", "岁月", "远方"],
    structure: ["verse", "verse", "chorus", "verse", "chorus"],
  },
  rap: {
    name: "说唱",
    lineLength: [10, 20],
    rhymeDensity: 0.9,
    emotionalIntensity: 0.85,
    vocabulary: ["节奏", "街头", "真实", "态度", "梦想", "奋斗", "兄弟", "坚持"],
    structure: ["intro", "verse", "verse", "chorus", "verse", "bridge", "chorus", "outro"],
  },
  jazz: {
    name: "爵士",
    lineLength: [6, 12],
    rhymeDensity: 0.5,
    emotionalIntensity: 0.6,
    vocabulary: ["夜色", "钢琴", "酒杯", "摇摆", "即兴", "蓝调", "烟雾", "沉醉"],
    structure: ["intro", "verse", "chorus", "bridge", "chorus", "outro"],
  },
  classical: {
    name: "古典",
    lineLength: [10, 18],
    rhymeDensity: 0.9,
    emotionalIntensity: 0.7,
    vocabulary: ["山川", "明月", "流水", "琴声", "红尘", "天涯", "相思", "千年"],
    structure: ["verse", "verse", "chorus", "verse", "chorus"],
  },
};

const THEME_TEMPLATES: Record<LyricsTheme, ThemeTemplate> = {
  love: {
    name: "爱情",
    keywords: ["心跳", "拥抱", "温柔", "承诺", "永远", "思念"],
    metaphors: ["如星光闪烁", "似春风拂面", "像海浪轻拍"],
    emotions: ["happy", "calm", "excited"],
  },
  friendship: {
    name: "友情",
    keywords: ["陪伴", "信任", "默契", "岁月", "成长", "并肩"],
    metaphors: ["如陈年老酒", "似高山流水", "像北斗星"],
    emotions: ["happy", "calm"],
  },
  dream: {
    name: "梦想",
    keywords: ["追逐", "飞翔", "坚持", "未来", "希望", "勇气"],
    metaphors: ["如破茧成蝶", "似凤凰涅槃", "像星河璀璨"],
    emotions: ["excited", "happy"],
  },
  nature: {
    name: "自然",
    keywords: ["山川", "河流", "森林", "星空", "晨曦", "晚霞"],
    metaphors: ["如流水潺潺", "似云卷云舒", "像花开花落"],
    emotions: ["calm", "relaxed"],
  },
  city: {
    name: "城市",
    keywords: ["霓虹", "街道", "人群", "夜晚", "孤独", "繁华"],
    metaphors: ["如钢铁森林", "似不夜之城", "像流动的光"],
    emotions: ["neutral", "anxious"],
  },
  memory: {
    name: "回忆",
    keywords: ["往事", "青春", "时光", "痕迹", "遗憾", "珍藏"],
    metaphors: ["如泛黄照片", "似老歌旋律", "像落叶飘零"],
    emotions: ["sad", "calm"],
  },
  freedom: {
    name: "自由",
    keywords: ["飞翔", "远方", "无拘", "天空", "海洋", "奔跑"],
    metaphors: ["如雄鹰展翅", "似野马奔腾", "像风过原野"],
    emotions: ["excited", "happy"],
  },
  hope: {
    name: "希望",
    keywords: ["黎明", "曙光", "明天", "相信", "力量", "重生"],
    metaphors: ["如破晓之光", "似春回大地", "像凤凰重生"],
    emotions: ["happy", "excited"],
  },
  farewell: {
    name: "离别",
    keywords: ["再见", "珍重", "思念", "不舍", "远方", "祝福"],
    metaphors: ["如秋叶飘落", "似夕阳西下", "像潮水退去"],
    emotions: ["sad", "calm"],
  },
  celebration: {
    name: "庆祝",
    keywords: ["欢呼", "喜悦", "胜利", "辉煌", "此刻", "永恒"],
    metaphors: ["如烟火绽放", "似繁星点点", "像金光闪耀"],
    emotions: ["excited", "happy"],
  },
};

const RHYME_GROUPS: Record<string, string[]> = {
  a: ["啊", "花", "家", "夏", "霞", "沙", "茶", "牙", "瓜", "涯"],
  i: ["你", "起", "里", "雨", "语", "心", "音", "深", "真", "人"],
  u: ["路", "树", "书", "湖", "雾", "步", "舞", "苦", "土", "故"],
  an: ["山", "天", "间", "远", "年", "缘", "愿", "念", "变", "现"],
  ang: ["光", "方", "想", "望", "长", "香", "阳", "亮", "唱", "强"],
  ou: ["走", "手", "头", "楼", "愁", "秋", "流", "留", "游", "柔"],
  ing: ["星", "情", "听", "声", "影", "景", "醒", "静", "灵", "明"],
  ong: ["风", "空", "梦", "中", "红", "动", "痛", "重", "送", "容"],
};

class LyricsGeneratorClass {
  private generationHistory: GeneratedLyrics[] = [];
  private maxHistorySize = 50;

  generate(config: LyricsGenerationConfig): GeneratedLyrics {
    const styleTemplate = STYLE_TEMPLATES[config.style];
    const themeTemplate = THEME_TEMPLATES[config.theme];
    const emotion = config.emotion ?? themeTemplate.emotions[0] ?? "neutral";

    const sections = this.buildStructure(styleTemplate, config);
    const title = this.generateTitle(config.theme, config.style);

    const lyrics: GeneratedLyrics = {
      id: `lyrics-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      style: config.style,
      theme: config.theme,
      emotion,
      sections,
      metadata: {
        wordCount: this.countWords(sections),
        lineCount: this.countLines(sections),
        generatedAt: Date.now(),
        member: config.memberInfluence ?? "creative",
        confidence: 0.85,
      },
    };

    this.addToHistory(lyrics);
    return lyrics;
  }

  private buildStructure(styleTemplate: StyleTemplate, config: LyricsGenerationConfig): LyricsSection[] {
    const sections: LyricsSection[] = [];
    const structure = styleTemplate.structure;

    let verseNumber = 0;
    let chorusNumber = 0;

    for (const sectionType of structure) {
      if (sectionType === "verse") {
        verseNumber++;
        sections.push(this.generateSection("verse", styleTemplate, config, verseNumber));
      } else if (sectionType === "chorus") {
        chorusNumber++;
        sections.push(this.generateSection("chorus", styleTemplate, config, chorusNumber));
      } else if (sectionType === "bridge" && config.includeBridge !== false) {
        sections.push(this.generateSection("bridge", styleTemplate, config));
      } else if (sectionType === "intro") {
        sections.push(this.generateSection("intro", styleTemplate, config));
      } else if (sectionType === "outro") {
        sections.push(this.generateSection("outro", styleTemplate, config));
      }
    }

    return sections;
  }

  private generateSection(
    type: "verse" | "chorus" | "bridge" | "intro" | "outro",
    styleTemplate: StyleTemplate,
    config: LyricsGenerationConfig,
    number?: number
  ): LyricsSection {
    const themeTemplate = THEME_TEMPLATES[config.theme];
    const lineCount = this.getLineCountForSection(type);
    const lines: string[] = [];

    const rhymes = this.selectRhymes(lineCount, config.rhymeScheme ?? "AABB");

    for (let i = 0; i < lineCount; i++) {
      const line = this.generateLine(styleTemplate, themeTemplate, config, rhymes[i]);
      lines.push(line);
    }

    return { type, number, lines };
  }

  private getLineCountForSection(type: "verse" | "chorus" | "bridge" | "intro" | "outro"): number {
    const counts: Record<string, number> = {
      verse: 4,
      chorus: 4,
      bridge: 2,
      intro: 2,
      outro: 2,
    };
    return counts[type] ?? 4;
  }

  private selectRhymes(lineCount: number, scheme: string): string[] {
    const rhymes: string[] = [];
    const groups = Object.values(RHYME_GROUPS);

    if (scheme === "AABB") {
      const group1 = groups[Math.floor(Math.random() * groups.length)];
      const group2 = groups[Math.floor(Math.random() * groups.length)];
      for (let i = 0; i < lineCount; i++) {
        const group = i < 2 ? group1 : group2;
        rhymes.push(group[Math.floor(Math.random() * group.length)]);
      }
    } else if (scheme === "ABAB") {
      const group1 = groups[Math.floor(Math.random() * groups.length)];
      const group2 = groups[Math.floor(Math.random() * groups.length)];
      for (let i = 0; i < lineCount; i++) {
        const group = i % 2 === 0 ? group1 : group2;
        rhymes.push(group[Math.floor(Math.random() * group.length)]);
      }
    } else {
      for (let i = 0; i < lineCount; i++) {
        const group = groups[Math.floor(Math.random() * groups.length)];
        rhymes.push(group[Math.floor(Math.random() * group.length)]);
      }
    }

    return rhymes;
  }

  private generateLine(
    styleTemplate: StyleTemplate,
    themeTemplate: ThemeTemplate,
    config: LyricsGenerationConfig,
    rhyme: string
  ): string {
    const [minLen, maxLen] = styleTemplate.lineLength;
    const targetLength = minLen + Math.floor(Math.random() * (maxLen - minLen));

    const vocabulary = [...styleTemplate.vocabulary, ...themeTemplate.keywords];
    const metaphor = themeTemplate.metaphors[Math.floor(Math.random() * themeTemplate.metaphors.length)];

    const templates = [
      () => this.buildSimpleLine(vocabulary, targetLength, rhyme),
      () => this.buildMetaphorLine(metaphor, vocabulary, targetLength, rhyme),
      () => this.buildEmotionalLine(vocabulary, config.emotion, targetLength, rhyme),
    ];

    const templateIndex = Math.floor(Math.random() * templates.length);
    return templates[templateIndex]();
  }

  private buildSimpleLine(vocabulary: string[], targetLength: number, rhyme: string): string {
    const words: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength - 2) {
      const word = vocabulary[Math.floor(Math.random() * vocabulary.length)];
      words.push(word);
      currentLength += word.length;
    }

    words.push(rhyme);
    return words.join("");
  }

  private buildMetaphorLine(metaphor: string, vocabulary: string[], targetLength: number, rhyme: string): string {
    const prefixWords = vocabulary.slice(0, 3);
    const prefix = prefixWords.slice(0, Math.floor(Math.random() * 2) + 1).join("");

    if (prefix.length + metaphor.length >= targetLength - 2) {
      return `${prefix}${metaphor}`;
    }

    return `${prefix}${metaphor.slice(0, -1)}${rhyme}`;
  }

  private buildEmotionalLine(
    vocabulary: string[],
    emotion: EmotionType | undefined,
    targetLength: number,
    rhyme: string
  ): string {
    const emotionalWords: Record<EmotionType, string[]> = {
      happy: ["欢笑", "阳光", "快乐", "甜蜜"],
      sad: ["泪水", "忧伤", "思念", "离别"],
      angry: ["燃烧", "怒火", "抗争", "不屈"],
      anxious: ["等待", "迷茫", "寻找", "期盼"],
      calm: ["宁静", "安详", "温柔", "平静"],
      excited: ["激动", "澎湃", "热血", "沸腾"],
      neutral: ["时光", "岁月", "故事", "回忆"],
      confused: ["迷雾", "彷徨", "疑问", "寻找"],
      relaxed: ["轻松", "自在", "悠然", "惬意"],
    };

    const emotionWords = emotion ? emotionalWords[emotion] ?? [] : [];
    const allWords = [...vocabulary, ...emotionWords];

    const words: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength - 2) {
      const word = allWords[Math.floor(Math.random() * allWords.length)];
      words.push(word);
      currentLength += word.length;
    }

    words.push(rhyme);
    return words.join("");
  }

  private generateTitle(theme: LyricsTheme, _style: LyricsStyle): string {
    const themeTemplate = THEME_TEMPLATES[theme];
    const keywords = themeTemplate.keywords;

    const titleTemplates = [
      () => `${keywords[Math.floor(Math.random() * keywords.length)]}之歌`,
      () => `${keywords[Math.floor(Math.random() * keywords.length)]}与${keywords[Math.floor(Math.random() * keywords.length)]}`,
      () => `那片${keywords[Math.floor(Math.random() * keywords.length)]}`,
      () => `${keywords[Math.floor(Math.random() * keywords.length)]}的旋律`,
    ];

    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)]();
  }

  private countWords(sections: LyricsSection[]): number {
    return sections.reduce((total, section) => {
      return total + section.lines.reduce((sum, line) => sum + line.length, 0);
    }, 0);
  }

  private countLines(sections: LyricsSection[]): number {
    return sections.reduce((total, section) => total + section.lines.length, 0);
  }

  private addToHistory(lyrics: GeneratedLyrics): void {
    this.generationHistory.push(lyrics);
    if (this.generationHistory.length > this.maxHistorySize) {
      this.generationHistory.shift();
    }
  }

  getHistory(): GeneratedLyrics[] {
    return [...this.generationHistory];
  }

  getStyles(): { id: LyricsStyle; name: string }[] {
    return Object.entries(STYLE_TEMPLATES).map(([id, template]) => ({
      id: id as LyricsStyle,
      name: template.name,
    }));
  }

  getThemes(): { id: LyricsTheme; name: string }[] {
    return Object.entries(THEME_TEMPLATES).map(([id, template]) => ({
      id: id as LyricsTheme,
      name: template.name,
    }));
  }

  generateWithMemberInfluence(config: LyricsGenerationConfig, memberId: string): GeneratedLyrics {
    const member = FAMILY_MEMBERS.find((m) => m.id === memberId);
    if (member) {
      const memberVocabulary = member.hobbies.flatMap((hobby) => [hobby, hobby.slice(0, 2)]);
      const styleTemplate = STYLE_TEMPLATES[config.style];
      styleTemplate.vocabulary = [...styleTemplate.vocabulary, ...memberVocabulary.slice(0, 5)];
    }

    return this.generate({ ...config, memberInfluence: memberId });
  }
}

export const lyricsGenerator = new LyricsGeneratorClass();

export default lyricsGenerator;
