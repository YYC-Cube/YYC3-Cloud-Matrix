/**
 * @file: music-storage.ts
 * @description: 音乐库持久化存储服务 · IndexedDB CRUD 操作
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @status: active
 * @tags: [lib],[storage],[music]
 *
 * @brief: 音乐文件 IndexedDB 持久化
 *
 * @details:
 * - 支持音频文件 Blob 存储（IndexedDB）
 * - 完整 CRUD：上传/读取/更新/删除
 * - 元数据管理：标题、艺术家、专辑、流派、情感标签
 * - 自动获取音频时长（通过 Audio 元素分析）
 * - 与 FamilyMusic 组件无缝集成

 * @updated: 2026-04-30 */

import type { MusicTrack } from "./dmusic-resources";
import { idbDelete, idbGet, idbGetAll, idbPut } from "./yyc3-storage";

export interface StoredMusicTrack extends MusicTrack {
  /** 音频文件 Blob（存储在 IndexedDB 中） */
  audioBlob?: Blob;
  /** 文件名（原始上传文件名） */
  fileName?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 文件类型 MIME */
  mimeType?: string;
  /** 上传时间戳 */
  uploadedAt?: number;
  /** 最后修改时间 */
  updatedAt?: number;
  /** 是否为用户上传（区别于预设曲目） */
  isUserUpload?: boolean;
}

/**
 * 获取音频时长（异步解析）
 * @param blob 音频文件 Blob
 * @returns 时长（秒）
 */
export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration || 0);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });

    audio.src = url;
    audio.load();
  });
}

/**
 * 上传音乐到 IndexedDB
 * @param file 音频文件（File 对象）
 * @param metadata 可选元数据（标题、艺术家等）
 * @returns 存储的音乐轨道
 */
export async function uploadMusic(
  file: File,
  metadata?: Partial<StoredMusicTrack>
): Promise<StoredMusicTrack> {
  const duration = await getAudioDuration(file);

  const audioUrl = URL.createObjectURL(file);

  const track: StoredMusicTrack = {
    id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: metadata?.title || file.name.replace(/\.[^/.]+$/, ""),
    artist: metadata?.artist || "未知艺术家",
    album: metadata?.album || "用户上传",
    duration,
    genre: metadata?.genre || "unknown",
    emotion: metadata?.emotion || "neutral",
    coverUrl: metadata?.coverUrl || "/yyc3-icons/Web App/android-chrome-192.png",
    audioUrl,
    audioBlob: file,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: Date.now(),
    updatedAt: Date.now(),
    isUserUpload: true,
  };

  await idbPut("music_library", track);
  return track;
}

/**
 * 从 IndexedDB 获取所有音乐
 * @returns 音乐轨道数组
 */
export async function getAllMusic(): Promise<StoredMusicTrack[]> {
  const tracks = await idbGetAll("music_library");
  return (tracks as StoredMusicTrack[]).map((track) => {
    // 如果有 Blob 但没有 URL，创建临时 URL
    if (track.audioBlob && !track.audioUrl) {
      track.audioUrl = URL.createObjectURL(track.audioBlob);
    }
    return track;
  });
}

/**
 * 根据 ID 获取单首音乐
 * @param id 音乐 ID
 * @returns 音乐轨道或 null
 */
export async function getMusicById(id: string): Promise<StoredMusicTrack | null> {
  const track = await idbGet<StoredMusicTrack>("music_library", id);
  if (!track) { return null; }
  if (track.audioBlob && !track.audioUrl) {
    track.audioUrl = URL.createObjectURL(track.audioBlob);
  }
  return track;
}

/**
 * 更新音乐元数据
 * @param id 音乐 ID
 * @param updates 要更新的字段
 * @returns 更新后的轨道或 null
 */
export async function updateMusic(
  id: string,
  updates: Partial<StoredMusicTrack>
): Promise<StoredMusicTrack | null> {
  const existing = await getMusicById(id);
  if (!existing) { return null; }

  const updated: StoredMusicTrack = {
    ...existing,
    ...updates,
    id, // 确保 ID 不被覆盖
    updatedAt: Date.now(),
  };

  // 如果更新了 Blob，重新创建 URL
  if (updates.audioBlob && updated.audioBlob) {
    if (updated.audioUrl) {
      URL.revokeObjectURL(updated.audioUrl);
    }
    updated.audioUrl = URL.createObjectURL(updated.audioBlob);

    // 重新计算时长
    if (!updates.duration) {
      updated.duration = await getAudioDuration(updated.audioBlob);
    }
  }

  await idbPut("music_library", updated);
  return updated;
}

/**
 * 删除音乐
 * @param id 音乐 ID
 * @returns 是否成功
 */
export async function deleteMusic(id: string): Promise<boolean> {
  // 先获取轨道以释放 URL
  const track = await getMusicById(id);
  if (track?.audioUrl) {
    URL.revokeObjectURL(track.audioUrl);
  }

  await idbDelete("music_library", id);
  return true;
}

/**
 * 批量删除音乐
 * @param ids 要删除的 ID 数组
 * @returns 成功删除的数量
 */
export async function batchDeleteMusic(ids: string[]): Promise<number> {
  let count = 0;
  for (const id of ids) {
    const success = await deleteMusic(id);
    if (success) { count++; }
  }
  return count;
}

/**
 * 搜索音乐（按标题或艺术家模糊匹配）
 * @param query 搜索关键词
 * @returns 匹配的音乐轨道
 */
export async function searchMusic(query: string): Promise<StoredMusicTrack[]> {
  const allTracks = await getAllMusic();
  const lowerQuery = query.toLowerCase();

  return allTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album?.toLowerCase().includes(lowerQuery)
  );
}
