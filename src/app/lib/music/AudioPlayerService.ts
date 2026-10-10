/**
 * @file: AudioPlayerService.ts
 * @description: 音频播放服务 · 封装 HTMLAudioElement，提供播放控制与 Web Audio 频谱分析数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [lib],[music],[audio]
 */

import type { MusicSong } from "./types";

/** Web Audio 分析器输出的可视化数据 */
export interface AudioAnalyzerData {
  /** 频域数据（0-255） */
  frequencyData: Uint8Array;
  /** 时域波形数据（0-255） */
  timeDomainData: Uint8Array;
}

/**
 * 音频播放服务：封装 HTMLAudioElement 完成加载/播放/进度/音量控制，
 * 并在首次成功播放后挂载 AnalyserNode 输出频谱数据（浏览器不支持时优雅降级为 null）。
 * Audio 元素按需创建，避免 SSR 环境下的全局副作用。
 */
export class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private freqData = new Uint8Array(64);
  private timeData = new Uint8Array(128);
  private endedHandler: (() => void) | null = null;

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      const element = new Audio();
      element.preload = "metadata";
      this.audio = element;
    }
    return this.audio;
  }

  /** 加载曲目；无有效音频地址时返回 false（UI 仍可展示曲目信息） */
  load(song: MusicSong): boolean {
    if (!song.url) {
      return false;
    }
    const audio = this.ensureAudio();
    audio.crossOrigin = "anonymous";
    audio.src = song.url;
    audio.load();
    return true;
  }

  /** 开始播放；播放失败（自动播放限制/加载失败）返回 false */
  async play(): Promise<boolean> {
    const audio = this.audio;
    if (!audio || !audio.src) {
      return false;
    }
    try {
      await audio.play();
      this.ensureAnalyser();
      return true;
    } catch {
      return false;
    }
  }

  pause(): void {
    this.audio?.pause();
  }

  /** 设置音量（0-1，越界自动收敛） */
  setVolume(volume: number): void {
    const audio = this.ensureAudio();
    audio.volume = Math.min(1, Math.max(0, volume));
  }

  /** 跳转到指定进度百分比（0-100） */
  seekToPercent(percent: number): void {
    const audio = this.audio;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }
    const clamped = Math.min(100, Math.max(0, percent));
    audio.currentTime = (clamped / 100) * audio.duration;
  }

  getCurrentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  getDuration(): number {
    const duration = this.audio?.duration;
    return typeof duration === "number" && Number.isFinite(duration) ? duration : 0;
  }

  isPlaying(): boolean {
    const audio = this.audio;
    return audio ? !audio.paused && !audio.ended : false;
  }

  /** 注册自然播完回调（重复注册会覆盖前一次） */
  onEnded(handler: () => void): void {
    const audio = this.ensureAudio();
    if (this.endedHandler) {
      audio.removeEventListener("ended", this.endedHandler);
    }
    this.endedHandler = handler;
    audio.addEventListener("ended", handler);
  }

  /** 获取频谱分析数据；分析器不可用时返回 null */
  getAnalyzerData(): AudioAnalyzerData | null {
    if (!this.analyser) {
      return null;
    }
    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);
    return { frequencyData: this.freqData, timeDomainData: this.timeData };
  }

  /**
   * 首次成功播放后挂载 Web Audio 分析器。
   * 创建失败（浏览器限制/CORS 等）时静默降级，不影响播放本身。
   */
  private ensureAnalyser(): void {
    if (this.analyser || !this.audio || typeof window === "undefined") {
      return;
    }

    const contextHolder = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const ContextCtor = contextHolder.AudioContext ?? contextHolder.webkitAudioContext;
    if (!ContextCtor) {
      return;
    }

    try {
      this.audioContext = new ContextCtor();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);
    } catch {
      this.analyser = null;
      this.sourceNode = null;
      void this.audioContext?.close().catch(() => undefined);
      this.audioContext = null;
    }
  }
}

/** 全局唯一音频播放服务实例 */
export const audioPlayerService = new AudioPlayerService();
