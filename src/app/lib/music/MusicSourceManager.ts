/**
 * @file: MusicSourceManager.ts
 * @description: 音乐来源管理器 · 本地文件上传/来源注册与启停/在线搜索/AI 创作演示
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [lib],[music],[source]
 */

import { getAllSongs, getDemoAudioUrl, getPlaceholderCover } from "./MusicData";
import type { MusicSong, MusicSongSource } from "./types";

/** 本地已上传音乐文件（内存态，附带 ObjectURL 供播放） */
export interface LocalMusicFile {
  id: string;
  name: string;
  artist: string;
  album: string;
  /** 时长（秒） */
  duration: number;
  /** 播放用 ObjectURL */
  url: string;
  /** 文件大小（字节） */
  size: number;
  /** MIME 类型 */
  type: string;
  uploadedAt: number;
}

/** 音乐来源描述 */
export interface MusicSource {
  id: string;
  name: string;
  icon: string;
  /** 排序优先级（越大越靠前） */
  priority: number;
  enabled: boolean;
}

/** AI 音乐生成参数 */
export interface AIMusicOptions {
  prompt: string;
  style: string;
  mood: string;
  /** 期望时长（秒） */
  duration: number;
}

const DEFAULT_SOURCES: MusicSource[] = [
  { id: "local", name: "本地音乐", icon: "💿", priority: 100, enabled: true },
  { id: "ai", name: "AI 创作", icon: "✨", priority: 90, enabled: true },
  { id: "jamendo", name: "Jamendo", icon: "🎵", priority: 80, enabled: false },
  { id: "freemusicarchive", name: "Free Music Archive", icon: "🎼", priority: 70, enabled: false },
  { id: "soundcloud", name: "SoundCloud", icon: "☁️", priority: 60, enabled: false },
  { id: "youtube", name: "YouTube Music", icon: "▶️", priority: 50, enabled: false },
  { id: "netease", name: "网易云音乐", icon: "🎶", priority: 40, enabled: false },
  { id: "spotify", name: "Spotify", icon: "🎧", priority: 30, enabled: false },
];

let localFileSeq = 0;
let demoSongSeq = 0;

/** 通过 Audio 元素探测音频时长（秒），失败返回 0；URL 生命周期由调用方管理 */
function readAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration || 0);
    });
    audio.addEventListener("error", () => {
      resolve(0);
    });
    audio.src = url;
    audio.load();
  });
}

/**
 * 音乐来源管理器：管理来源注册/启停、本地上传（内存态）、在线搜索与 AI 创作演示。
 * 在线服务未配置 API Key 时自动降级为演示模式（不崩溃、返回可播放的演示曲目）。
 */
export class MusicSourceManager {
  private sources: MusicSource[] = DEFAULT_SOURCES.map((source) => ({ ...source }));
  private localFiles: LocalMusicFile[] = [];

  /** 获取全部来源（返回副本，避免外部直接改动内部状态） */
  getSources(): MusicSource[] {
    return this.sources.map((source) => ({ ...source }));
  }

  enableSource(sourceId: string): void {
    const source = this.sources.find((item) => item.id === sourceId);
    if (source) {
      source.enabled = true;
    }
  }

  disableSource(sourceId: string): void {
    const source = this.sources.find((item) => item.id === sourceId);
    if (source) {
      source.enabled = false;
    }
  }

  /** 上传本地音频文件（内存态：生成 ObjectURL 并探测时长） */
  async uploadLocalFile(file: File): Promise<LocalMusicFile> {
    if (!file.type.startsWith("audio/")) {
      throw new Error(`不支持的音频类型: ${file.type || file.name}`);
    }

    const objectUrl = URL.createObjectURL(file);
    const duration = await readAudioDuration(objectUrl);

    localFileSeq += 1;
    const entry: LocalMusicFile = {
      id: `local-${Date.now()}-${localFileSeq}`,
      name: file.name,
      artist: "本地上传",
      album: "本地音乐",
      duration,
      url: objectUrl,
      size: file.size,
      type: file.type,
      uploadedAt: Date.now(),
    };
    this.localFiles.push(entry);
    return entry;
  }

  getLocalFiles(): LocalMusicFile[] {
    return [...this.localFiles];
  }

  deleteLocalFile(fileId: string): void {
    const target = this.localFiles.find((item) => item.id === fileId);
    if (!target) {
      return;
    }
    URL.revokeObjectURL(target.url);
    this.localFiles = this.localFiles.filter((item) => item.id !== fileId);
  }

  clearAllLocalFiles(): void {
    for (const item of this.localFiles) {
      URL.revokeObjectURL(item.url);
    }
    this.localFiles = [];
  }

  /** 将本地文件映射为可播放的 MusicSong */
  localFileToSong(file: LocalMusicFile): MusicSong {
    return {
      id: `song-${file.id}`,
      title: file.name,
      artist: file.artist,
      album: file.album,
      albumCover: getPlaceholderCover("Local"),
      duration: file.duration,
      url: file.url,
      source: "local",
    };
  }

  /**
   * 在线搜索（演示模式）：优先返回内置曲库中的匹配结果；
   * 无匹配时生成一条基于关键词的在线演示曲目。
   */
  async searchOnline(query: string, provider = "jamendo"): Promise<MusicSong[]> {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return [];
    }

    const matches = getAllSongs().filter((song) =>
      [song.title, song.artist, song.album].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    );

    if (matches.length > 0) {
      return matches.map((song) => ({
        ...song,
        source: "online" as MusicSongSource,
      }));
    }

    demoSongSeq += 1;
    return [
      {
        id: `online-demo-${Date.now()}-${demoSongSeq}`,
        title: query.trim(),
        artist: "在线演示",
        album: provider,
        albumCover: getPlaceholderCover(provider),
        duration: 180,
        url: getDemoAudioUrl((demoSongSeq % 12) + 1),
        source: "online",
      },
    ];
  }

  /**
   * AI 音乐生成（演示模式）：根据描述/风格/情绪/时长生成一首可播放的演示曲目。
   * 接入 Suno/MusicGen 等第三方服务后替换为真实实现。
   */
  async generateAIMusic(options: AIMusicOptions): Promise<MusicSong | null> {
    const prompt = options.prompt.trim();
    if (!prompt) {
      return null;
    }

    demoSongSeq += 1;
    return {
      id: `ai-demo-${Date.now()}-${demoSongSeq}`,
      title: prompt.slice(0, 24),
      artist: "YYC³ AI",
      album: `${options.style} · ${options.mood}`,
      albumCover: getPlaceholderCover("AI"),
      duration: Math.min(180, Math.max(15, options.duration)),
      url: getDemoAudioUrl((demoSongSeq % 12) + 1),
      source: "ai",
    };
  }
}

/** 全局唯一音乐来源管理器实例 */
export const musicSourceManager = new MusicSourceManager();
