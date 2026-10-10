/**
 * @file: types.ts
 * @description: 音乐空间共享类型定义（歌曲/专辑/艺人/推荐/枚举）
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [lib],[music],[types]
 */

/** 心情标签（用于情绪推荐） */
export type MusicMood =
  | "happy"
  | "sad"
  | "energetic"
  | "calm"
  | "romantic"
  | "melancholy"
  | "upbeat"
  | "peaceful";

/** 场景标签（用于场景推荐） */
export type MusicActivity =
  | "focus"
  | "relax"
  | "exercise"
  | "sleep"
  | "party"
  | "commute"
  | "morning"
  | "evening";

/** 循环模式 */
export type RepeatMode = "off" | "one" | "all";

/** 曲目来源类别 */
export type MusicSongSource = "preset" | "local" | "online" | "ai";

/** 歌曲实体 */
export interface MusicSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumCover: string;
  /** 时长（秒） */
  duration: number;
  /** 音频源地址（为空时仅展示不播放） */
  url: string;
  /** 匹配的心情标签（情绪推荐用） */
  moods?: MusicMood[];
  /** 匹配的场景标签（场景推荐用） */
  activities?: MusicActivity[];
  /** 曲目来源 */
  source?: MusicSongSource;
}

/** 专辑 */
export interface MusicAlbum {
  id: string;
  nameZh: string;
  cover: string;
  year: number;
  songs: MusicSong[];
}

/** 艺人 */
export interface MusicArtist {
  name: string;
  nameZh: string;
  avatar: string;
  bio: string;
}

/** 艺人相册照片 */
export interface MusicPhoto {
  id: string;
  title: string;
  imageUrl: string;
}

/** 音乐视频 */
export interface MusicVideo {
  id: string;
  titleZh: string;
  thumbnail: string;
  year: number;
}

/** 推荐结果 */
export interface MusicRecommendation {
  songs: MusicSong[];
  reason: string;
  mood?: MusicMood;
  activity?: MusicActivity;
}
