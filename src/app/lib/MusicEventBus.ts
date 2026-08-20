/**
 * @file: MusicEventBus.ts
 * @description: 音乐事件总线，实现语音系统与音乐播放器的解耦通信
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export type MusicCommand =
  | "play"
  | "pause"
  | "toggle"
  | "next"
  | "previous"
  | "volume_up"
  | "volume_down"
  | "mute"
  | "unmute"
  | "like"
  | "unlike"
  | "shuffle"
  | "repeat"
  | "seek"
  | "play_index";

export type MusicEventType =
  | "music:command"
  | "music:state_change"
  | "music:track_change"
  | "music:volume_change"
  | "music:progress_update"
  | "music:error"
  | "voice:command_detected"
  | "voice:transcript"
  | "emotion:detected"
  | "emotion:changed";

export interface MusicState {
  isPlaying: boolean;
  currentTrackIndex: number;
  progress: number;
  volume: number;
  muted: boolean;
  likedTracks: Set<number>;
  shuffle: boolean;
  repeat: boolean;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  color: string;
  suitableEmotions?: string[];
}

export interface MusicCommandEvent {
  type: "music:command";
  payload: {
    command: MusicCommand;
    params?: Record<string, unknown>;
    source: "voice" | "ui" | "keyboard" | "system";
    timestamp: number;
  };
}

export interface MusicStateChangeEvent {
  type: "music:state_change";
  payload: {
    previousState: Partial<MusicState>;
    currentState: MusicState;
    timestamp: number;
  };
}

export interface MusicTrackChangeEvent {
  type: "music:track_change";
  payload: {
    previousTrack: Track | null;
    currentTrack: Track;
    trackIndex: number;
    timestamp: number;
  };
}

export interface VoiceCommandEvent {
  type: "voice:command_detected";
  payload: {
    command: MusicCommand;
    transcript: string;
    confidence: number;
    memberId?: string;
    timestamp: number;
  };
}

export interface EmotionDetectedEvent {
  type: "emotion:detected";
  payload: {
    emotion: string;
    confidence: number;
    intensity: number;
    valence?: number;
    arousal?: number;
    source: "text" | "voice" | "multimodal";
    timestamp: number;
  };
}

export interface EmotionChangedEvent {
  type: "emotion:changed";
  payload: {
    previousEmotion: string;
    currentEmotion: string;
    confidence: number;
    intensity?: number;
    timestamp: number;
  };
}

export type MusicEvent =
  | MusicCommandEvent
  | MusicStateChangeEvent
  | MusicTrackChangeEvent
  | VoiceCommandEvent
  | EmotionDetectedEvent
  | EmotionChangedEvent
  | { type: "music:volume_change"; payload: { volume: number; muted: boolean; timestamp: number } }
  | { type: "music:progress_update"; payload: { progress: number; currentTime: string; timestamp: number } }
  | { type: "music:error"; payload: { error: string; code?: string; timestamp: number } }
  | { type: "voice:transcript"; payload: { transcript: string; isFinal: boolean; timestamp: number } };

export type MusicEventListener = (event: MusicEvent) => void;

class MusicEventBusClass {
  private listeners: Map<MusicEventType, Set<MusicEventListener>> = new Map();
  private eventHistory: MusicEvent[] = [];
  private maxHistorySize: number = 100;
  private debugMode: boolean = false;

  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
  }

  subscribe(eventType: MusicEventType, listener: MusicEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    if (this.debugMode) {
      console.info(`[MusicEventBus] Subscribed to ${eventType}`);
    }

    return () => {
      this.listeners.get(eventType)?.delete(listener);
      if (this.debugMode) {
        console.info(`[MusicEventBus] Unsubscribed from ${eventType}`);
      }
    };
  }

  subscribeAll(listener: MusicEventListener): () => void {
    const unsubscribers: Array<() => void> = [];

    const allEventTypes: MusicEventType[] = [
      "music:command",
      "music:state_change",
      "music:track_change",
      "music:volume_change",
      "music:progress_update",
      "music:error",
      "voice:command_detected",
      "voice:transcript",
      "emotion:detected",
      "emotion:changed",
    ];

    allEventTypes.forEach(type => {
      unsubscribers.push(this.subscribe(type, listener));
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  emit(event: MusicEvent): void {
    if (this.debugMode) {
      console.info(`[MusicEventBus] Emitting:`, event);
    }

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[MusicEventBus] Listener error for ${event.type}:`, error);
        }
      });
    }
  }

  emitCommand(command: MusicCommand, source: MusicCommandEvent["payload"]["source"] = "ui", params?: Record<string, unknown>): void {
    this.emit({
      type: "music:command",
      payload: {
        command,
        params,
        source,
        timestamp: Date.now(),
      },
    });
  }

  emitVoiceCommand(command: MusicCommand, transcript: string, confidence: number, memberId?: string): void {
    this.emit({
      type: "voice:command_detected",
      payload: {
        command,
        transcript,
        confidence,
        memberId,
        timestamp: Date.now(),
      },
    });

    this.emitCommand(command, "voice");
  }

  emitStateChange(previousState: Partial<MusicState>, currentState: MusicState): void {
    this.emit({
      type: "music:state_change",
      payload: {
        previousState,
        currentState,
        timestamp: Date.now(),
      },
    });
  }

  emitTrackChange(previousTrack: Track | null, currentTrack: Track, trackIndex: number): void {
    this.emit({
      type: "music:track_change",
      payload: {
        previousTrack,
        currentTrack,
        trackIndex,
        timestamp: Date.now(),
      },
    });
  }

  emitError(error: string, code?: string): void {
    this.emit({
      type: "music:error",
      payload: {
        error,
        code,
        timestamp: Date.now(),
      },
    });
  }

  getHistory(): MusicEvent[] {
    return [...this.eventHistory];
  }

  getRecentEvents(count: number = 10): MusicEvent[] {
    return this.eventHistory.slice(-count);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  getListenerCount(eventType?: MusicEventType): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    let total = 0;
    this.listeners.forEach(set => {
      total += set.size;
    });
    return total;
  }
}

export const musicEventBus = new MusicEventBusClass();

export default musicEventBus;
