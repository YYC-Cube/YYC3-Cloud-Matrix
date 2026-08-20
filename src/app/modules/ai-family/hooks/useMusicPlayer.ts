/**
 * @file: useMusicPlayer.ts
 * @description: 音乐播放器 Hook，支持语音控制
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback, useRef } from "react";
import musicEventBus, {
  type MusicState,
  type Track,
  type MusicCommand,
  type MusicEventListener,
} from "../../../lib/MusicEventBus";
import { parseVoiceCommand, type ParsedCommand } from "../../../lib/VoiceCommandParser";

const DEFAULT_PLAYLIST: Track[] = [
  { id: 1, title: "Family AI — 智慧工坊", artist: "YYC3 Family", duration: "4:32", color: "#FF69B4" },
  { id: 2, title: "Deep Focus · 深海专注", artist: "AI Ambient", duration: "6:15", color: "#00d4ff" },
  { id: 3, title: "Code Flow · 编程心流", artist: "Digital Waves", duration: "5:48", color: "#00FF88" },
  { id: 4, title: "Dawn Break · 晨曦微光", artist: "Nature Synth", duration: "4:05", color: "#FFD700" },
  { id: 5, title: "Cyber Night · 赛博之夜", artist: "Neon Dreams", duration: "5:20", color: "#BF00FF" },
  { id: 6, title: "Thinking Space · 思考空间", artist: "AI Ambient", duration: "7:00", color: "#00BFFF" },
  { id: 7, title: "Victory Loop · 成功循环", artist: "Epic Sound", duration: "3:55", color: "#FF7043" },
  { id: 8, title: "Gentle Rain · 温柔细雨", artist: "Nature Synth", duration: "8:30", color: "#C0C0C0" },
];

function parseDuration(duration: string): number {
  const parts = duration.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface UseMusicPlayerOptions {
  playlist?: Track[];
  autoPlay?: boolean;
  initialVolume?: number;
  onCommand?: (command: ParsedCommand) => void;
  onTrackChange?: (track: Track, index: number) => void;
  onError?: (error: string) => void;
}

export interface MusicPlayerControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  adjustVolume: (delta: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  like: () => void;
  unlike: () => void;
  toggleLike: () => void;
  shuffle: () => void;
  repeat: () => void;
  seek: (progress: number) => void;
  seekToTime: (seconds: number) => void;
  playIndex: (index: number) => void;
  executeCommand: (command: MusicCommand, params?: Record<string, unknown>) => void;
}

export interface UseMusicPlayerReturn {
  state: MusicState;
  currentTrack: Track;
  playlist: Track[];
  currentTime: string;
  controls: MusicPlayerControls;
}

export function useMusicPlayer(options: UseMusicPlayerOptions = {}): UseMusicPlayerReturn {
  const {
    playlist = DEFAULT_PLAYLIST,
    autoPlay = false,
    initialVolume = 75,
    onCommand,
    onTrackChange,
    onError,
  } = options;

  const [state, setState] = useState<MusicState>({
    isPlaying: autoPlay,
    currentTrackIndex: 0,
    progress: 0,
    volume: initialVolume,
    muted: false,
    likedTracks: new Set(),
    shuffle: false,
    repeat: false,
  });

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef<Partial<MusicState>>(state);
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  const currentTrack = playlist[state.currentTrackIndex] || playlist[0];
  const totalSeconds = parseDuration(currentTrack.duration);
  const currentSeconds = Math.floor(totalSeconds * state.progress / 100);
  const currentTime = formatTime(currentSeconds);

  const play = useCallback(() => {
    setState(prev => {
      if (prev.isPlaying) {return prev;}
      musicEventBus.emitStateChange(prev, { ...prev, isPlaying: true });
      return { ...prev, isPlaying: true };
    });
  }, []);

  const pause = useCallback(() => {
    setState(prev => {
      if (!prev.isPlaying) {return prev;}
      musicEventBus.emitStateChange(prev, { ...prev, isPlaying: false });
      return { ...prev, isPlaying: false };
    });
  }, []);

  const toggle = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, isPlaying: !prev.isPlaying };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const next = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.shuffle
        ? Math.floor(Math.random() * playlistRef.current.length)
        : (prev.currentTrackIndex + 1) % playlistRef.current.length;
      const newState = { ...prev, currentTrackIndex: nextIndex, progress: 0 };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const previous = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.currentTrackIndex === 0
        ? playlistRef.current.length - 1
        : prev.currentTrackIndex - 1;
      const newState = { ...prev, currentTrackIndex: prevIndex, progress: 0 };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => {
      const newVolume = Math.max(0, Math.min(100, volume));
      const newState = { ...prev, volume: newVolume, muted: false };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    setState(prev => {
      const newVolume = Math.max(0, Math.min(100, prev.volume + delta));
      const newState = { ...prev, volume: newVolume };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const mute = useCallback(() => {
    setState(prev => {
      if (prev.muted) {return prev;}
      const newState = { ...prev, muted: true };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const unmute = useCallback(() => {
    setState(prev => {
      if (!prev.muted) {return prev;}
      const newState = { ...prev, muted: false };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, muted: !prev.muted };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const like = useCallback(() => {
    setState(prev => {
      const track = playlistRef.current[prev.currentTrackIndex];
      if (!track) {return prev;}
      const newLiked = new Set(prev.likedTracks);
      newLiked.add(track.id);
      const newState = { ...prev, likedTracks: newLiked };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const unlike = useCallback(() => {
    setState(prev => {
      const track = playlistRef.current[prev.currentTrackIndex];
      if (!track) {return prev;}
      const newLiked = new Set(prev.likedTracks);
      newLiked.delete(track.id);
      const newState = { ...prev, likedTracks: newLiked };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const toggleLike = useCallback(() => {
    setState(prev => {
      const track = playlistRef.current[prev.currentTrackIndex];
      if (!track) {return prev;}
      const newLiked = new Set(prev.likedTracks);
      if (newLiked.has(track.id)) {
        newLiked.delete(track.id);
      } else {
        newLiked.add(track.id);
      }
      const newState = { ...prev, likedTracks: newLiked };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const shuffle = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, shuffle: !prev.shuffle };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const repeat = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, repeat: !prev.repeat };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const seek = useCallback((progress: number) => {
    setState(prev => {
      const track = playlistRef.current[prev.currentTrackIndex];
      if (!track) {return prev;}
      const _total = parseDuration(track.duration);
      const newProgress = Math.max(0, Math.min(100, progress));
      const newState = { ...prev, progress: newProgress };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const seekToTime = useCallback((seconds: number) => {
    setState(prev => {
      const track = playlistRef.current[prev.currentTrackIndex];
      if (!track) {return prev;}
      const total = parseDuration(track.duration);
      const newProgress = Math.max(0, Math.min(100, (seconds / total) * 100));
      const newState = { ...prev, progress: newProgress };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, []);

  const playIndex = useCallback((index: number) => {
    if (index < 0 || index >= playlistRef.current.length) {
      onError?.(`Invalid track index: ${index}`);
      return;
    }
    setState(prev => {
      const newState = { ...prev, currentTrackIndex: index, progress: 0, isPlaying: true };
      musicEventBus.emitStateChange(prev, newState);
      return newState;
    });
  }, [onError]);

  const executeCommand = useCallback((command: MusicCommand, params?: Record<string, unknown>) => {
    switch (command) {
      case "play":
        play();
        break;
      case "pause":
        pause();
        break;
      case "toggle":
        toggle();
        break;
      case "next":
        next();
        break;
      case "previous":
        previous();
        break;
      case "volume_up":
        adjustVolume((params?.volumeDelta as number) || 10);
        break;
      case "volume_down":
        adjustVolume((params?.volumeDelta as number) || -10);
        break;
      case "mute":
        mute();
        break;
      case "unmute":
        unmute();
        break;
      case "like":
        like();
        break;
      case "unlike":
        unlike();
        break;
      case "shuffle":
        shuffle();
        break;
      case "repeat":
        repeat();
        break;
      case "seek":
        if (params?.seekTime !== undefined) {
          seekToTime(params.seekTime as number);
        } else if (params?.progress !== undefined) {
          seek(params.progress as number);
        }
        break;
      case "play_index":
        if (params?.trackIndex !== undefined) {
          playIndex(params.trackIndex as number);
        }
        break;
      default:
        onError?.(`Unknown command: ${command}`);
    }
  }, [play, pause, toggle, next, previous, adjustVolume, mute, unmute, like, unlike, shuffle, repeat, seekToTime, seek, playIndex, onError]);

  const controls: MusicPlayerControls = {
    play,
    pause,
    toggle,
    next,
    previous,
    setVolume,
    adjustVolume,
    mute,
    unmute,
    toggleMute,
    like,
    unlike,
    toggleLike,
    shuffle,
    repeat,
    seek,
    seekToTime,
    playIndex,
    executeCommand,
  };

  const updateProgress = useCallback(() => {
    setState(prev => {
      if (!prev.isPlaying) {return prev;}
      const track = playlistRef.current[prev.currentTrackIndex];
      if (!track) {return prev;}
      const total = parseDuration(track.duration);
      const newProgress = prev.progress + (100 / total) * 0.3;

      if (newProgress >= 100) {
        const nextIndex = prev.shuffle
          ? Math.floor(Math.random() * playlistRef.current.length)
          : (prev.currentTrackIndex + 1) % playlistRef.current.length;

        return {
          ...prev,
          progress: 0,
          currentTrackIndex: nextIndex,
        };
      }

      return { ...prev, progress: newProgress };
    });
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      progressIntervalRef.current = setInterval(updateProgress, 300);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state.isPlaying, updateProgress]);

  useEffect(() => {
    if (previousStateRef.current.currentTrackIndex !== state.currentTrackIndex) {
      musicEventBus.emitTrackChange(
        playlist[previousStateRef.current.currentTrackIndex || 0] || null,
        currentTrack,
        state.currentTrackIndex
      );
      onTrackChange?.(currentTrack, state.currentTrackIndex);
    }

    previousStateRef.current = state;
  }, [state, currentTrack, playlist, onTrackChange]);

  useEffect(() => {
    const handleMusicCommand: MusicEventListener = (event) => {
      if (event.type !== "music:command") {return;}
      const { command, params } = event.payload;
      executeCommand(command, params);
    };

    const handleVoiceCommand: MusicEventListener = (event) => {
      if (event.type !== "voice:command_detected") {return;}
      const { command, transcript, confidence } = event.payload;
      const parsedCommand: ParsedCommand = {
        command,
        confidence,
        rawTranscript: transcript,
        matchedKeywords: [],
      };

      onCommand?.(parsedCommand);
      executeCommand(command);
    };

    const unsubCommand = musicEventBus.subscribe("music:command", handleMusicCommand);
    const unsubVoice = musicEventBus.subscribe("voice:command_detected", handleVoiceCommand);

    return () => {
      unsubCommand();
      unsubVoice();
    };
  }, [executeCommand, onCommand]);

  return {
    state,
    currentTrack,
    playlist,
    currentTime,
    controls,
  };
}

export function useVoiceMusicControl(
  onTranscript?: (transcript: string) => void
): {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  lastCommand: ParsedCommand | null;
} {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<ParsedCommand | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      const currentTranscript = final || interim;
      setTranscript(currentTranscript);
      onTranscript?.(currentTranscript);

      if (final) {
        const parsed = parseVoiceCommand(final);
        if (parsed && parsed.confidence > 0.5) {
          setLastCommand(parsed);
          musicEventBus.emitVoiceCommand(parsed.command, final, parsed.confidence);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (_event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // noop
      }
    };
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {return;}
    setTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {return;}
    try {
      recognitionRef.current.stop();
    } catch {
      // noop
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    lastCommand,
  };
}

export default useMusicPlayer;
