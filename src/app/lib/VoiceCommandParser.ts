/**
 * @file: VoiceCommandParser.ts
 * @description: 语音命令解析器，支持中英文语音命令识别
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import type { MusicCommand } from "./MusicEventBus";

export interface ParsedCommand {
  command: MusicCommand;
  confidence: number;
  params?: Record<string, unknown>;
  rawTranscript: string;
  matchedKeywords: string[];
}

export interface CommandMapping {
  command: MusicCommand;
  keywords: string[];
  params?: Record<string, unknown>;
}

const COMMAND_MAPPINGS: CommandMapping[] = [
  {
    command: "play",
    keywords: [
      "播放", "开始播放", "放音乐", "播放音乐",
      "继续播放", "继续", "开始",
      "play", "start playing", "resume",
    ],
  },
  {
    command: "pause",
    keywords: [
      "暂停", "停止", "停", "停下",
      "暂停播放", "停止播放",
      "pause", "stop",
    ],
  },
  {
    command: "toggle",
    keywords: [
      "切换播放", "播放暂停",
      "toggle", "play pause",
    ],
  },
  {
    command: "next",
    keywords: [
      "下一首", "切歌", "跳过", "下一曲",
      "换一首", "换歌", "跳过这首",
      "next", "skip", "next song",
    ],
  },
  {
    command: "previous",
    keywords: [
      "上一首", "上一曲", "返回", "倒回",
      "回上一首", "前一首",
      "previous", "previous song", "go back",
    ],
  },
  {
    command: "volume_up",
    keywords: [
      "大声点", "音量大点", "调大音量", "声音大点",
      "大声", "提高音量", "增加音量",
      "louder", "volume up", "turn up",
    ],
  },
  {
    command: "volume_down",
    keywords: [
      "小声点", "音量小点", "调小音量", "声音小点",
      "小声", "降低音量", "减小音量",
      "quieter", "volume down", "turn down",
    ],
  },
  {
    command: "mute",
    keywords: [
      "静音", "关闭声音", "没声音",
      "mute", "silence",
    ],
  },
  {
    command: "unmute",
    keywords: [
      "取消静音", "恢复声音", "打开声音",
      "unmute", "restore sound",
    ],
  },
  {
    command: "like",
    keywords: [
      "喜欢", "收藏", "点赞", "喜欢这首",
      "收藏这首", "这首歌不错",
      "like", "favorite", "love this",
    ],
  },
  {
    command: "unlike",
    keywords: [
      "取消喜欢", "取消收藏", "不喜欢",
      "unlike", "unfavorite",
    ],
  },
  {
    command: "shuffle",
    keywords: [
      "随机播放", "乱序播放", "随机",
      "shuffle", "random",
    ],
  },
  {
    command: "repeat",
    keywords: [
      "循环播放", "单曲循环", "循环",
      "repeat", "loop",
    ],
  },
];

const VOLUME_PARAMS_REGEX = [
  {
    regex: /音量[调设]?[为到]?(\d+)[%％]?/,
    param: "volume",
    transform: (match: RegExpMatchArray) => parseInt(match[1], 10),
  },
  {
    regex: /volume\s*(?:to\s*)?(\d+)/i,
    param: "volume",
    transform: (match: RegExpMatchArray) => parseInt(match[1], 10),
  },
  {
    regex: /大声[点些]?\s*[，,]?\s*[再]?大声[点些]?/,
    param: "volumeDelta",
    transform: () => 20,
  },
  {
    regex: /小声[点些]?\s*[，,]?\s*[再]?小声[点些]?/,
    param: "volumeDelta",
    transform: () => -20,
  },
];

const SEEK_PARAMS_REGEX = [
  {
    regex: /跳[到转]?(\d+)[分:]?(\d+)?/,
    param: "seekTime",
    transform: (match: RegExpMatchArray) => {
      const minutes = parseInt(match[1], 10);
      const seconds = match[2] ? parseInt(match[2], 10) : 0;
      return minutes * 60 + seconds;
    },
  },
  {
    regex: /seek\s*(?:to\s*)?(\d+):(\d+)/i,
    param: "seekTime",
    transform: (match: RegExpMatchArray) => {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      return minutes * 60 + seconds;
    },
  },
  {
    regex: /快进(\d+)[秒分钟]?/,
    param: "seekForward",
    transform: (match: RegExpMatchArray) => {
      const value = parseInt(match[1], 10);
      return match[0].includes("分") ? value * 60 : value;
    },
  },
  {
    regex: /快退(\d+)[秒分钟]?/,
    param: "seekBackward",
    transform: (match: RegExpMatchArray) => {
      const value = parseInt(match[1], 10);
      return match[0].includes("分") ? value * 60 : value;
    },
  },
];

const TRACK_INDEX_REGEX = [
  {
    regex: /播放第([一二三四五六七八九十\d]+)[首曲目]/,
    param: "trackIndex",
    transform: (match: RegExpMatchArray) => {
      const numMap: Record<string, number> = {
        "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
        "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
      };
      const num = match[1];
      return (numMap[num] || parseInt(num, 10)) - 1;
    },
  },
  {
    regex: /play\s*(?:track\s*)?(?:number\s*)?(\d+)/i,
    param: "trackIndex",
    transform: (match: RegExpMatchArray) => parseInt(match[1], 10) - 1,
  },
];

function normalizeTranscript(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[，。！？、；：""''（）【】《》]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateConfidence(transcript: string, matchedKeywords: string[]): number {
  if (matchedKeywords.length === 0) {return 0;}

  const normalizedTranscript = normalizeTranscript(transcript);
  const maxKeywordLength = Math.max(...matchedKeywords.map(k => k.length));
  const transcriptLength = normalizedTranscript.length;

  const coverageScore = Math.min(maxKeywordLength / transcriptLength, 1);
  const matchScore = matchedKeywords.length > 0 ? 0.8 : 0;

  return Math.min((coverageScore * 0.3 + matchScore * 0.7), 1);
}

function extractParams(transcript: string): Record<string, unknown> | undefined {
  const params: Record<string, unknown> = {};

  for (const { regex, param, transform } of VOLUME_PARAMS_REGEX) {
    const match = transcript.match(regex);
    if (match) {
      params[param] = transform(match);
    }
  }

  for (const { regex, param, transform } of SEEK_PARAMS_REGEX) {
    const match = transcript.match(regex);
    if (match) {
      params[param] = transform(match);
    }
  }

  for (const { regex, param, transform } of TRACK_INDEX_REGEX) {
    const match = transcript.match(regex);
    if (match) {
      params[param] = transform(match);
    }
  }

  return Object.keys(params).length > 0 ? params : undefined;
}

export function parseVoiceCommand(transcript: string): ParsedCommand | null {
  if (!transcript || typeof transcript !== "string") {
    return null;
  }

  const normalizedTranscript = normalizeTranscript(transcript);

  let bestMatch: ParsedCommand | null = null;
  let bestConfidence = 0;

  for (const mapping of COMMAND_MAPPINGS) {
    const matchedKeywords: string[] = [];

    for (const keyword of mapping.keywords) {
      if (normalizedTranscript.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      const confidence = calculateConfidence(transcript, matchedKeywords);

      if (confidence > bestConfidence) {
        const params = extractParams(transcript);

        bestMatch = {
          command: mapping.command,
          confidence,
          params: params || mapping.params,
          rawTranscript: transcript,
          matchedKeywords,
        };
        bestConfidence = confidence;
      }
    }
  }

  return bestMatch;
}

export function parseVoiceCommandWithFallback(transcript: string): ParsedCommand {
  const parsed = parseVoiceCommand(transcript);

  if (parsed) {
    return parsed;
  }

  return {
    command: "toggle",
    confidence: 0,
    rawTranscript: transcript,
    matchedKeywords: [],
  };
}

export function getSupportedCommands(): MusicCommand[] {
  return COMMAND_MAPPINGS.map(m => m.command);
}

export function getCommandKeywords(command: MusicCommand): string[] {
  const mapping = COMMAND_MAPPINGS.find(m => m.command === command);
  return mapping ? mapping.keywords : [];
}

export function isCommandSupported(command: string): command is MusicCommand {
  return COMMAND_MAPPINGS.some(m => m.command === command);
}

export const VoiceCommandParser = {
  parse: parseVoiceCommand,
  parseWithFallback: parseVoiceCommandWithFallback,
  getSupportedCommands,
  getCommandKeywords,
  isCommandSupported,
};

export default VoiceCommandParser;
