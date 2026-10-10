/**
 * @file: MusicData.ts
 * @description: 音乐空间内置曲库数据（专辑/艺人/相册/视频）与检索辅助函数
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [lib],[music],[data]
 */

import type {
  MusicActivity,
  MusicAlbum,
  MusicArtist,
  MusicMood,
  MusicPhoto,
  MusicSong,
  MusicVideo,
} from "./types";

/** 公共演示音频（SoundHelix 免费示例曲目，1-12） */
export function getDemoAudioUrl(index: number): string {
  const n = ((index - 1) % 12) + 1;
  return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
}

/** 占位封面图（演示数据用） */
export function getPlaceholderCover(label: string): string {
  return `https://via.placeholder.com/300.png?text=${encodeURIComponent(label)}`;
}

interface DemoSongSeed {
  title: string;
  duration: number;
  moods: MusicMood[];
  activities: MusicActivity[];
}

let demoAudioCursor = 0;

function buildSong(
  albumId: string,
  albumNameZh: string,
  seed: DemoSongSeed
): MusicSong {
  demoAudioCursor += 1;
  const id = `${albumId}-${demoAudioCursor}`;
  return {
    id,
    title: seed.title,
    artist: "YYC³",
    album: albumNameZh,
    albumCover: getPlaceholderCover(albumNameZh),
    duration: seed.duration,
    url: getDemoAudioUrl(demoAudioCursor),
    moods: seed.moods,
    activities: seed.activities,
    source: "preset",
  };
}

function buildAlbum(
  id: string,
  nameZh: string,
  year: number,
  seeds: DemoSongSeed[]
): MusicAlbum {
  return {
    id,
    nameZh,
    cover: getPlaceholderCover(nameZh),
    year,
    songs: seeds.map((seed) => buildSong(id, nameZh, seed)),
  };
}

export const ALBUMS: MusicAlbum[] = [
  buildAlbum("album-pivot-era", "云枢纪元", 2025, [
    { title: "象限之光", duration: 214, moods: ["happy", "upbeat"], activities: ["morning", "party"] },
    { title: "云枢之弦", duration: 187, moods: ["calm"], activities: ["focus", "commute"] },
    { title: "万象归元", duration: 256, moods: ["peaceful", "calm"], activities: ["relax", "sleep"] },
    { title: "深栈智启", duration: 198, moods: ["energetic"], activities: ["exercise", "focus"] },
  ]),
  buildAlbum("album-language-future", "语枢未来", 2026, [
    { title: "语言星图", duration: 231, moods: ["romantic"], activities: ["evening", "relax"] },
    { title: "象限漫步", duration: 176, moods: ["upbeat", "energetic"], activities: ["commute", "exercise"] },
    { title: "静谧云端", duration: 289, moods: ["calm", "peaceful"], activities: ["sleep", "relax"] },
    { title: "晨曦协议", duration: 203, moods: ["happy"], activities: ["morning", "focus"] },
  ]),
  buildAlbum("album-deep-stack", "深栈新纪元", 2026, [
    { title: "蓝色脉冲", duration: 192, moods: ["energetic", "upbeat"], activities: ["party", "exercise"] },
    { title: "月下低语", duration: 267, moods: ["melancholy", "sad"], activities: ["evening", "sleep"] },
    { title: "银河信标", duration: 185, moods: ["upbeat", "happy"], activities: ["commute", "party"] },
    { title: "时光留声", duration: 243, moods: ["melancholy", "romantic"], activities: ["relax", "evening"] },
  ]),
];

export const ARTIST: MusicArtist = {
  name: "YYC3",
  nameZh: "言启象限",
  avatar: "https://via.placeholder.com/200.png?text=YYC3",
  bio: "Words Initiate Quadrants, Language Serves as Core for Future —— 以语言为核的沉浸式音乐空间。",
};

export const PHOTOS: MusicPhoto[] = [
  { id: "photo-01", title: "云枢现场", imageUrl: "https://via.placeholder.com/200.png?text=01" },
  { id: "photo-02", title: "象限之夜", imageUrl: "https://via.placeholder.com/200.png?text=02" },
  { id: "photo-03", title: "语枢录音室", imageUrl: "https://via.placeholder.com/200.png?text=03" },
  { id: "photo-04", title: "深栈巡演", imageUrl: "https://via.placeholder.com/200.png?text=04" },
  { id: "photo-05", title: "云端和声", imageUrl: "https://via.placeholder.com/200.png?text=05" },
  { id: "photo-06", title: "矩阵灯光", imageUrl: "https://via.placeholder.com/200.png?text=06" },
  { id: "photo-07", title: "启象时刻", imageUrl: "https://via.placeholder.com/200.png?text=07" },
  { id: "photo-08", title: "未来音场", imageUrl: "https://via.placeholder.com/200.png?text=08" },
];

export const VIDEOS: MusicVideo[] = [
  { id: "video-01", titleZh: "云枢纪元 · 官方MV", thumbnail: "https://via.placeholder.com/320x180.png?text=MV01", year: 2025 },
  { id: "video-02", titleZh: "语枢未来 · Live 现场", thumbnail: "https://via.placeholder.com/320x180.png?text=MV02", year: 2026 },
  { id: "video-03", titleZh: "万象归元 · 幕后纪录", thumbnail: "https://via.placeholder.com/320x180.png?text=MV03", year: 2026 },
  { id: "video-04", titleZh: "深栈智启 · 视觉特辑", thumbnail: "https://via.placeholder.com/320x180.png?text=MV04", year: 2026 },
];

/** 获取全部曲目（按专辑顺序展开） */
export function getAllSongs(): MusicSong[] {
  return ALBUMS.flatMap((album) => album.songs);
}

/** 按心情标签筛选曲目 */
export function getSongsByMood(mood: MusicMood): MusicSong[] {
  return getAllSongs().filter((song) => song.moods?.includes(mood));
}

/** 按场景标签筛选曲目 */
export function getSongsByActivity(activity: MusicActivity): MusicSong[] {
  return getAllSongs().filter((song) => song.activities?.includes(activity));
}
