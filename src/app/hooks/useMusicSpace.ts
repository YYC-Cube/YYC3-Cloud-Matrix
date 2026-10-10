/**
 * @file: useMusicSpace.ts
 * @description: 音乐空间主 Hook · 播放器状态/播放队列/推荐/语音控制/频谱数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [hook],[music],[player]
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  audioPlayerService,
  type AudioAnalyzerData,
} from "../lib/music/AudioPlayerService";
import {
  getAllSongs,
  getSongsByActivity,
  getSongsByMood,
} from "../lib/music/MusicData";
import type {
  MusicActivity,
  MusicMood,
  MusicRecommendation,
  MusicSong,
  RepeatMode,
} from "../lib/music/types";

/** useMusicSpace 配置项 */
export interface UseMusicSpaceOptions {
  /** 挂载后自动播放第一首 */
  autoPlay?: boolean;
  /** 初始音量（0-1，默认 0.8） */
  initialVolume?: number;
  /** 切歌回调 */
  onSongChange?: (song: MusicSong) => void;
}

/** 播放器渲染状态 */
export interface MusicSpacePlayerState {
  isPlaying: boolean;
  currentSong: MusicSong | null;
  /** 当前进度（秒） */
  progress: number;
  /** 总时长（秒） */
  duration: number;
  /** 音量（0-1） */
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
}

/** useMusicSpace 返回值 */
export interface UseMusicSpaceReturn {
  playerState: MusicSpacePlayerState;
  playlist: MusicSong[];
  recommendation: MusicRecommendation | null;
  isListening: boolean;
  analyzerData: AudioAnalyzerData | null;
  equalizerPreset: string;
  playSong: (song: MusicSong, index?: number) => Promise<void>;
  pauseSong: () => void;
  resumeSong: () => Promise<void>;
  nextSong: () => void;
  previousSong: () => void;
  setVolume: (volume: number) => void;
  /** 切换静音，返回切换后的静音状态 */
  toggleMute: () => boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  /** 按百分比（0-100）跳转进度 */
  seekToPercent: (percent: number) => void;
  searchSongs: (query: string) => MusicSong[];
  recommendByMood: (mood: MusicMood) => MusicSong[];
  recommendByActivity: (activity: MusicActivity) => MusicSong[];
  setEqualizerPreset: (preset: string) => void;
  loadPlaylist: (songs: MusicSong[]) => void;
  startVoiceControl: () => void;
  stopVoiceControl: () => void;
}

/* ---------- 语音识别最小结构类型（Web Speech API 未进入 lib.dom） ---------- */

interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}

interface SpeechRecognitionResultLike
  extends ArrayLike<SpeechRecognitionAlternativeLike> {
  readonly isFinal: boolean;
}

type SpeechRecognitionResultListLike = ArrayLike<SpeechRecognitionResultLike>;

interface SpeechRecognitionEventLike {
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const holder = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return holder.SpeechRecognition ?? holder.webkitSpeechRecognition ?? null;
}

/* ------------------------------- Hook 实现 ------------------------------- */

/**
 * 音乐空间主 Hook：封装播放器状态、队列推进（随机/循环）、
 * 心情与场景推荐、语音控制和频谱可视化数据。
 */
export function useMusicSpace(options: UseMusicSpaceOptions = {}): UseMusicSpaceReturn {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [currentSong, setCurrentSong] = useState<MusicSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeState, setVolumeState] = useState(() => options.initialVolume ?? 0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [playlist, setPlaylist] = useState<MusicSong[]>([]);
  const [recommendation, setRecommendation] = useState<MusicRecommendation | null>(
    () => ({
      songs: getAllSongs(),
      reason: "根据你的收听偏好，为你精选 YYC³ 音乐空间全部曲目",
    })
  );
  const [isListening, setIsListening] = useState(false);
  const [analyzerData, setAnalyzerData] = useState<AudioAnalyzerData | null>(null);
  const [equalizerPreset, setEqualizerPresetState] = useState("flat");

  const volumeRef = useRef(volumeState);
  const mutedRef = useRef(false);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");
  const playlistRef = useRef<MusicSong[]>([]);
  const indexRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const playSong = useCallback(async (song: MusicSong, index?: number) => {
    if (typeof index === "number") {
      indexRef.current = index;
    }
    setCurrentSong(song);
    const loaded = audioPlayerService.load(song);
    if (loaded) {
      const started = await audioPlayerService.play();
      setIsPlaying(started);
    } else {
      setIsPlaying(false);
    }
    optionsRef.current.onSongChange?.(song);
  }, []);

  /** 队列推进：direction 为播放方向；auto 表示由自然播完触发 */
  const advance = useCallback(
    (direction: 1 | -1, auto = false) => {
      const list = playlistRef.current;
      if (list.length === 0) {
        return;
      }

      let nextIndex: number;
      if (shuffleRef.current && list.length > 1) {
        nextIndex = Math.floor(Math.random() * list.length);
        if (nextIndex === indexRef.current) {
          nextIndex = (nextIndex + 1) % list.length;
        }
      } else {
        nextIndex = indexRef.current + direction;
      }

      if (nextIndex < 0) {
        nextIndex = list.length - 1;
      } else if (nextIndex >= list.length) {
        if (auto && repeatRef.current === "off") {
          audioPlayerService.pause();
          return;
        }
        nextIndex = 0;
      }

      indexRef.current = nextIndex;
      void playSong(list[nextIndex], nextIndex);
    },
    [playSong]
  );

  const handleEnded = useCallback(() => {
    if (repeatRef.current === "one") {
      audioPlayerService.seekToPercent(0);
      void audioPlayerService.play();
      return;
    }
    advance(1, true);
  }, [advance]);

  const pauseSong = useCallback(() => {
    audioPlayerService.pause();
    setIsPlaying(false);
  }, []);

  const resumeSong = useCallback(async () => {
    const started = await audioPlayerService.play();
    setIsPlaying(started);
  }, []);

  const nextSong = useCallback(() => {
    advance(1, false);
  }, [advance]);

  const previousSong = useCallback(() => {
    advance(-1, false);
  }, [advance]);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    if (!mutedRef.current) {
      audioPlayerService.setVolume(clamped);
    }
  }, []);

  const toggleMute = useCallback((): boolean => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    audioPlayerService.setVolume(next ? 0 : volumeRef.current);
    return next;
  }, []);

  const toggleShuffle = useCallback(() => {
    shuffleRef.current = !shuffleRef.current;
    setShuffle(shuffleRef.current);
  }, []);

  const toggleRepeat = useCallback(() => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const next = order[(order.indexOf(repeatRef.current) + 1) % order.length];
    repeatRef.current = next;
    setRepeat(next);
  }, []);

  const seekToPercent = useCallback((percent: number) => {
    audioPlayerService.seekToPercent(percent);
    setProgress(audioPlayerService.getCurrentTime());
  }, []);

  const handleVoiceCommand = useCallback(
    (text: string) => {
      const command = text.trim();
      if (!command) {
        return;
      }
      if (/(播放|继续)/.test(command)) {
        void resumeSong();
      } else if (/(暂停|停止)/.test(command)) {
        pauseSong();
      } else if (/下一首/.test(command)) {
        nextSong();
      } else if (/上一首/.test(command)) {
        previousSong();
      } else if (/(调高|增大)音量/.test(command)) {
        setVolume(Math.min(1, volumeRef.current + 0.2));
      } else if (/(调低|减小)音量/.test(command)) {
        setVolume(Math.max(0, volumeRef.current - 0.2));
      }
    },
    [resumeSong, pauseSong, nextSong, previousSong, setVolume]
  );

  const startVoiceControl = useCallback(() => {
    setIsListening(true);
    if (recognitionRef.current) {
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      return; // 浏览器不支持时仅切换监听状态（演示模式）
    }
    try {
      const recognition = new Ctor();
      recognition.lang = "zh-CN";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (!result) {
          return;
        }
        handleVoiceCommand(result[0].transcript);
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
      };
      recognition.onerror = () => undefined;
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      recognitionRef.current = null;
    }
  }, [handleVoiceCommand]);

  const stopVoiceControl = useCallback(() => {
    setIsListening(false);
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // 已停止，忽略
      }
      recognitionRef.current = null;
    }
  }, []);

  const searchSongs = useCallback((query: string): MusicSong[] => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return [];
    }
    return getAllSongs().filter((song) =>
      [song.title, song.artist, song.album].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    );
  }, []);

  const recommendByMood = useCallback((mood: MusicMood): MusicSong[] => {
    const songs = getSongsByMood(mood);
    setRecommendation({ songs, reason: `匹配「${mood}」心情的推荐曲目`, mood });
    return songs;
  }, []);

  const recommendByActivity = useCallback((activity: MusicActivity): MusicSong[] => {
    const songs = getSongsByActivity(activity);
    setRecommendation({
      songs,
      reason: `适合「${activity}」场景的推荐曲目`,
      activity,
    });
    return songs;
  }, []);

  const setEqualizerPreset = useCallback((preset: string) => {
    setEqualizerPresetState(preset);
  }, []);

  const loadPlaylist = useCallback((songs: MusicSong[]) => {
    playlistRef.current = songs;
    indexRef.current = 0;
    setPlaylist(songs);
  }, []);

  // 初始化音量、注册自然播完回调；卸载时停止播放
  useEffect(() => {
    audioPlayerService.setVolume(volumeRef.current);
    audioPlayerService.onEnded(handleEnded);
    return () => {
      audioPlayerService.pause();
    };
  }, [handleEnded]);

  // 轮询同步进度/时长/播放状态/频谱数据
  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress(audioPlayerService.getCurrentTime());
      setDuration(audioPlayerService.getDuration());
      setIsPlaying(audioPlayerService.isPlaying());
      setAnalyzerData(audioPlayerService.getAnalyzerData());
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  // 可选自动播放
  useEffect(() => {
    if (!optionsRef.current.autoPlay) {
      return;
    }
    const first = playlistRef.current[0];
    if (first) {
      void playSong(first, 0);
    }
  }, [playSong]);

  // 卸载时停止语音识别
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        try {
          recognition.stop();
        } catch {
          // 已停止，忽略
        }
      }
    };
  }, []);

  const playerState = useMemo<MusicSpacePlayerState>(
    () => ({
      isPlaying,
      currentSong,
      progress,
      duration,
      volume: volumeState,
      shuffle,
      repeat,
    }),
    [isPlaying, currentSong, progress, duration, volumeState, shuffle, repeat]
  );

  return {
    playerState,
    playlist,
    recommendation,
    isListening,
    analyzerData,
    equalizerPreset,
    playSong,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    seekToPercent,
    searchSongs,
    recommendByMood,
    recommendByActivity,
    setEqualizerPreset,
    loadPlaylist,
    startVoiceControl,
    stopVoiceControl,
  };
}

export default useMusicSpace;
