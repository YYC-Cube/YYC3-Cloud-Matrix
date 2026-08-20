/**
 * @file: MusicEventBus.test.ts
 * @description: 音乐事件总线功能测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import musicEventBus from "../lib/MusicEventBus";
import type {
  MusicCommand,
  MusicEventType,
  MusicEvent,
  MusicState,
  Track,
} from "../lib/MusicEventBus";

describe("MusicEventBus", () => {
  beforeEach(() => {
    musicEventBus.clearHistory();
    musicEventBus.setDebugMode(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("订阅与发布", () => {
    it("should subscribe to an event type", () => {
      const listener = vi.fn();
      const unsubscribe = musicEventBus.subscribe("music:command", listener);

      musicEventBus.emitCommand("play", "ui");

      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should unsubscribe from an event type", () => {
      const listener = vi.fn();
      const unsubscribe = musicEventBus.subscribe("music:command", listener);

      musicEventBus.emitCommand("play", "ui");
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      musicEventBus.emitCommand("pause", "ui");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should support multiple listeners for same event type", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsub1 = musicEventBus.subscribe("music:command", listener1);
      const unsub2 = musicEventBus.subscribe("music:command", listener2);

      musicEventBus.emitCommand("play", "ui");

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });

    it("should subscribe to all event types", () => {
      const listener = vi.fn();
      const unsubscribe = musicEventBus.subscribeAll(listener);

      musicEventBus.emitCommand("play", "ui");
      musicEventBus.emitError("test error");

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe("命令发射", () => {
    it("should emit play command", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:command", listener);

      musicEventBus.emitCommand("play", "ui");

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:command",
          payload: expect.objectContaining({
            command: "play",
            source: "ui",
          }),
        })
      );

      unsub();
    });

    it("should emit pause command", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:command", listener);

      musicEventBus.emitCommand("pause", "keyboard");

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:command",
          payload: expect.objectContaining({
            command: "pause",
            source: "keyboard",
          }),
        })
      );

      unsub();
    });

    it("should emit command with params", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:command", listener);

      musicEventBus.emitCommand("seek", "ui", { position: 60 });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:command",
          payload: expect.objectContaining({
            command: "seek",
            params: { position: 60 },
          }),
        })
      );

      unsub();
    });

    it("should emit voice command", () => {
      const commandListener = vi.fn();
      const voiceListener = vi.fn();

      const unsub1 = musicEventBus.subscribe("music:command", commandListener);
      const unsub2 = musicEventBus.subscribe("voice:command_detected", voiceListener);

      musicEventBus.emitVoiceCommand("play", "播放音乐", 0.95, "member-1");

      expect(voiceListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "voice:command_detected",
          payload: expect.objectContaining({
            command: "play",
            transcript: "播放音乐",
            confidence: 0.95,
            memberId: "member-1",
          }),
        })
      );

      expect(commandListener).toHaveBeenCalled();

      unsub1();
      unsub2();
    });
  });

  describe("状态变化", () => {
    it("should emit state change event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:state_change", listener);

      const previousState: Partial<MusicState> = { isPlaying: false };
      const currentState: MusicState = {
        isPlaying: true,
        currentTrackIndex: 0,
        progress: 0,
        volume: 0.5,
        muted: false,
        likedTracks: new Set(),
        shuffle: false,
        repeat: false,
      };

      musicEventBus.emitStateChange(previousState, currentState);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:state_change",
          payload: expect.objectContaining({
            previousState,
            currentState,
          }),
        })
      );

      unsub();
    });

    it("should emit track change event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:track_change", listener);

      const previousTrack: Track = {
        id: 1,
        title: "Previous Track",
        artist: "Artist",
        duration: "3:00",
        color: "#FF0000",
      };

      const currentTrack: Track = {
        id: 2,
        title: "Current Track",
        artist: "Artist",
        duration: "4:00",
        color: "#00FF00",
      };

      musicEventBus.emitTrackChange(previousTrack, currentTrack, 1);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:track_change",
          payload: expect.objectContaining({
            previousTrack,
            currentTrack,
            trackIndex: 1,
          }),
        })
      );

      unsub();
    });

    it("should emit track change with null previous track", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:track_change", listener);

      const currentTrack: Track = {
        id: 1,
        title: "First Track",
        artist: "Artist",
        duration: "3:00",
        color: "#FF0000",
      };

      musicEventBus.emitTrackChange(null, currentTrack, 0);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:track_change",
          payload: expect.objectContaining({
            previousTrack: null,
            currentTrack,
          }),
        })
      );

      unsub();
    });
  });

  describe("错误处理", () => {
    it("should emit error event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:error", listener);

      musicEventBus.emitError("Playback failed", "PLAYBACK_ERROR");

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:error",
          payload: expect.objectContaining({
            error: "Playback failed",
            code: "PLAYBACK_ERROR",
          }),
        })
      );

      unsub();
    });

    it("should emit error without code", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:error", listener);

      musicEventBus.emitError("Unknown error");

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "music:error",
          payload: expect.objectContaining({
            error: "Unknown error",
          }),
        })
      );

      unsub();
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      const unsub1 = musicEventBus.subscribe("music:command", errorListener);
      const unsub2 = musicEventBus.subscribe("music:command", normalListener);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      musicEventBus.emitCommand("play", "ui");

      expect(normalListener).toHaveBeenCalled();

      consoleSpy.mockRestore();
      unsub1();
      unsub2();
    });
  });

  describe("事件历史", () => {
    it("should store events in history", () => {
      musicEventBus.emitCommand("play", "ui");
      musicEventBus.emitCommand("pause", "ui");

      const history = musicEventBus.getHistory();
      expect(history.length).toBe(2);
    });

    it("should get recent events", () => {
      for (let i = 0; i < 15; i++) {
        musicEventBus.emitCommand("play", "ui");
      }

      const recent = musicEventBus.getRecentEvents(5);
      expect(recent.length).toBe(5);
    });

    it("should clear history", () => {
      musicEventBus.emitCommand("play", "ui");
      musicEventBus.emitCommand("pause", "ui");

      expect(musicEventBus.getHistory().length).toBe(2);

      musicEventBus.clearHistory();

      expect(musicEventBus.getHistory().length).toBe(0);
    });

    it("should limit history size", () => {
      musicEventBus.clearHistory();
      for (let i = 0; i < 150; i++) {
        musicEventBus.emitCommand("play", "ui");
      }

      const history = musicEventBus.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
      musicEventBus.clearHistory();
    });
  });

  describe("调试模式", () => {
    it("should enable debug mode", () => {
      musicEventBus.setDebugMode(true);
      musicEventBus.emitCommand("play", "ui");
      musicEventBus.setDebugMode(false);
    });
  });

  describe("监听器统计", () => {
    it("should count listeners for specific event type", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:command", listener);

      const count = musicEventBus.getListenerCount("music:command");
      expect(count).toBeGreaterThanOrEqual(1);

      unsub();
    });

    it("should count total listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsub1 = musicEventBus.subscribe("music:command", listener1);
      const unsub2 = musicEventBus.subscribe("music:state_change", listener2);

      const total = musicEventBus.getListenerCount();
      expect(total).toBeGreaterThanOrEqual(2);

      unsub1();
      unsub2();
    });
  });

  describe("所有命令类型", () => {
    const commands: MusicCommand[] = [
      "play",
      "pause",
      "toggle",
      "next",
      "previous",
      "volume_up",
      "volume_down",
      "mute",
      "unmute",
      "like",
      "unlike",
      "shuffle",
      "repeat",
      "seek",
      "play_index",
    ];

    commands.forEach((command) => {
      it(`should emit ${command} command`, () => {
        const listener = vi.fn();
        const unsub = musicEventBus.subscribe("music:command", listener);

        musicEventBus.emitCommand(command, "ui");

        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "music:command",
            payload: expect.objectContaining({
              command,
            }),
          })
        );

        unsub();
      });
    });
  });

  describe("所有事件类型", () => {
    it("should handle music:volume_change event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:volume_change", listener);

      const event: MusicEvent = {
        type: "music:volume_change",
        payload: {
          volume: 0.8,
          muted: false,
          timestamp: Date.now(),
        },
      };

      musicEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);

      unsub();
    });

    it("should handle music:progress_update event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("music:progress_update", listener);

      const event: MusicEvent = {
        type: "music:progress_update",
        payload: {
          progress: 50,
          currentTime: "1:30",
          timestamp: Date.now(),
        },
      };

      musicEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);

      unsub();
    });

    it("should handle voice:transcript event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("voice:transcript", listener);

      const event: MusicEvent = {
        type: "voice:transcript",
        payload: {
          transcript: "播放下一首",
          isFinal: true,
          timestamp: Date.now(),
        },
      };

      musicEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);

      unsub();
    });

    it("should handle emotion:detected event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("emotion:detected", listener);

      const event: MusicEvent = {
        type: "emotion:detected",
        payload: {
          emotion: "happy",
          confidence: 0.9,
          intensity: 0.8,
          source: "voice",
          timestamp: Date.now(),
        },
      };

      musicEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);

      unsub();
    });

    it("should handle emotion:changed event", () => {
      const listener = vi.fn();
      const unsub = musicEventBus.subscribe("emotion:changed", listener);

      const event: MusicEvent = {
        type: "emotion:changed",
        payload: {
          previousEmotion: "neutral",
          currentEmotion: "happy",
          confidence: 0.85,
          timestamp: Date.now(),
        },
      };

      musicEventBus.emit(event);

      expect(listener).toHaveBeenCalledWith(event);

      unsub();
    });
  });
});
