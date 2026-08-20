/**
 * @file: useAudioEngine.ts
 * @description: AI Family 音频引擎 Hook，支持三种播放模式
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type Emotion = "happy" | "sad" | "energetic" | "calm" | "neutral";
export type AudioMode = "demo" | "file" | "stream";

interface ChordConfig {
  notes: number[];
  sub: number;
  high: number;
}

const CHORD_SETS: ChordConfig[][] = [
  [
    { notes: [130.81, 155.56, 196.0], sub: 65.41, high: 523.25 },
    { notes: [207.65, 261.63, 311.13], sub: 103.83, high: 622.25 },
    { notes: [155.56, 196.0, 233.08], sub: 77.78, high: 466.16 },
    { notes: [116.54, 146.83, 174.61], sub: 58.27, high: 349.23 },
  ],
  [
    { notes: [110.0, 130.81, 164.81], sub: 55.0, high: 440.0 },
    { notes: [174.61, 220.0, 261.63], sub: 87.31, high: 698.46 },
    { notes: [130.81, 164.81, 196.0], sub: 65.41, high: 523.25 },
    { notes: [196.0, 246.94, 293.66], sub: 98.0, high: 783.99 },
  ],
  [
    { notes: [146.83, 174.61, 220.0], sub: 73.42, high: 587.33 },
    { notes: [116.54, 146.83, 174.61], sub: 58.27, high: 466.16 },
    { notes: [174.61, 220.0, 261.63], sub: 87.31, high: 698.46 },
    { notes: [130.81, 164.81, 196.0], sub: 65.41, high: 523.25 },
  ],
  [
    { notes: [164.81, 196.0, 246.94], sub: 82.41, high: 659.26 },
    { notes: [130.81, 164.81, 196.0], sub: 65.41, high: 523.25 },
    { notes: [196.0, 246.94, 293.66], sub: 98.0, high: 783.99 },
    { notes: [146.83, 185.0, 220.0], sub: 73.42, high: 587.33 },
  ],
];

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  color?: string;
  audioUrl?: string;
  chordSet?: number;
}

export interface AudioEngineConfig {
  track?: AudioTrack;
  initialVolume?: number;
  onTrackEnd?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export interface AudioEngineReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  frequencyData: Uint8Array;
  waveformData: Uint8Array;
  audioEnergy: number;
  bassEnergy: number;
  trebleEnergy: number;
  audioMode: AudioMode;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  loadTrack: (track: AudioTrack) => void;
  loadAudioFile: (file: File) => void;
}

export function useAudioEngine(config: AudioEngineConfig = {}): AudioEngineReturn {
  const { track, initialVolume = 0.65, onTrackEnd, onTimeUpdate } = config;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const oscGainsRef = useRef<GainNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startWallTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const isInitRef = useRef(false);

  const isPlayingRef = useRef(false);
  const volumeRef = useRef(initialVolume);
  const audioModeRef = useRef<AudioMode>("demo");
  const onTrackEndRef = useRef(onTrackEnd);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const currentTrackRef = useRef<AudioTrack | undefined>(track);
  const chordSetRef = useRef(0);
  const demoDurationRef = useRef(180);
  const fileBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    onTrackEndRef.current = onTrackEnd;
  }, [onTrackEnd]);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    currentTrackRef.current = track;
    if (track) {
      chordSetRef.current = track.chordSet ?? 0;
      demoDurationRef.current = track.duration;

      if (track.audioUrl && audioModeRef.current !== "file") {
        audioModeRef.current = "file";
        setAudioMode("file");
        const audio = audioElRef.current;
        if (audio) {
          audio.src = track.audioUrl;
          audio.load();
        }
        setDuration(track.duration);
        setCurrentTime(0);
        accumulatedTimeRef.current = 0;
        oscillatorsRef.current.forEach((osc) => { try { osc.stop(); } catch { /* ignore */ } });
        oscillatorsRef.current = [];
        oscGainsRef.current = [];
        if (lfoRef.current) { try { lfoRef.current.stop(); } catch { /* ignore */ } lfoRef.current = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      } else if (!track.audioUrl && audioModeRef.current !== "demo") {
        audioModeRef.current = "demo";
        setAudioMode("demo");
        setDuration(track.duration);
        setCurrentTime(0);
        accumulatedTimeRef.current = 0;
      }
    }
  }, [track]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track?.duration ?? 180);
  const [volume, setVolumeState] = useState(initialVolume);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(64));
  const [waveformData, setWaveformData] = useState<Uint8Array>(new Uint8Array(64));
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [bassEnergy, setBassEnergy] = useState(0);
  const [trebleEnergy, setTrebleEnergy] = useState(0);
  const [audioMode, setAudioMode] = useState<AudioMode>("demo");

  const startAnalysisLoop = useCallback(() => {
    const analyse = () => {
      const analyser = analyserRef.current;
      if (!analyser) {
        return;
      }

      const freqArray = new Uint8Array(analyser.frequencyBinCount);
      const waveArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqArray);
      analyser.getByteTimeDomainData(waveArray);

      setFrequencyData(new Uint8Array(freqArray));
      setWaveformData(new Uint8Array(waveArray));

      const binCount = freqArray.length;
      const bassEnd = Math.floor(binCount * 0.15);
      const trebleStart = Math.floor(binCount * 0.6);

      let bassSum = 0;
      let trebleSum = 0;
      let totalSum = 0;

      for (let i = 0; i < binCount; i++) {
        totalSum += freqArray[i];
        if (i < bassEnd) {
          bassSum += freqArray[i];
        }
        if (i >= trebleStart) {
          trebleSum += freqArray[i];
        }
      }

      setAudioEnergy(totalSum / (binCount * 255));
      setBassEnergy(bassSum / (bassEnd * 255));
      setTrebleEnergy(trebleSum / ((binCount - trebleStart) * 255));

      animFrameRef.current = requestAnimationFrame(analyse);
    };
    analyse();
  }, []);

  const stopAnalysisLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  const initAudio = useCallback(() => {
    if (isInitRef.current) {
      return;
    }

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    masterGain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(ctx.destination);

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.volume = 1;

    const source = ctx.createMediaElementSource(audio);
    source.connect(masterGain);

    audio.addEventListener("timeupdate", () => {
      if (isPlayingRef.current && audioModeRef.current !== "demo") {
        setCurrentTime(audio.currentTime);
        onTimeUpdateRef.current?.(audio.currentTime);
      }
    });

    audio.addEventListener("ended", () => {
      if (audioModeRef.current !== "demo") {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setTimeout(() => {
          if (!isPlayingRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = 0;
            setFrequencyData(new Uint8Array(64));
            setAudioEnergy(0);
            setBassEnergy(0);
            setTrebleEnergy(0);
          }
        }, 300);
        onTrackEndRef.current?.();
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      if (audioModeRef.current !== "demo" && audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    masterGainRef.current = masterGain;
    audioElRef.current = audio;
    mediaSourceRef.current = source;
    isInitRef.current = true;
  }, []);

  const tearDownOscillators = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    });
    oscillatorsRef.current = [];
    oscGainsRef.current = [];

    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
      } catch {
        /* ignore */
      }
      lfoRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setupOscillators = useCallback(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) {
      return;
    }

    tearDownOscillators();

    const chords = CHORD_SETS[chordSetRef.current % CHORD_SETS.length];
    const chord = chords[0];

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain);
    lfo.start();
    lfoRef.current = lfo;

    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    chord.notes.forEach((freq) => {
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.value = freq;
      g1.gain.value = 0.08;
      osc1.connect(g1);
      g1.connect(masterGain);
      lfoGain.connect(g1.gain);
      osc1.start();
      oscs.push(osc1);
      gains.push(g1);

      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.value = freq * 1.003;
      g2.gain.value = 0.04;
      osc2.connect(g2);
      g2.connect(masterGain);
      osc2.start();
      oscs.push(osc2);
      gains.push(g2);
    });

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.value = chord.sub;
    subGain.gain.value = 0.1;
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    oscs.push(subOsc);
    gains.push(subGain);

    const highOsc = ctx.createOscillator();
    const highGain = ctx.createGain();
    highOsc.type = "sine";
    highOsc.frequency.value = chord.high;
    highGain.gain.value = 0.02;
    highOsc.connect(highGain);
    highGain.connect(masterGain);
    highOsc.start();
    oscs.push(highOsc);
    gains.push(highGain);

    const ethOsc = ctx.createOscillator();
    const ethGain = ctx.createGain();
    ethOsc.type = "sine";
    ethOsc.frequency.value = chord.high * 2;
    ethGain.gain.value = 0.01;
    ethOsc.connect(ethGain);
    ethGain.connect(masterGain);
    ethOsc.start();
    oscs.push(ethOsc);
    gains.push(ethGain);

    oscillatorsRef.current = oscs;
    oscGainsRef.current = gains;
  }, [tearDownOscillators]);

  const updateChord = useCallback((time: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || oscillatorsRef.current.length === 0) {
      return;
    }

    const chords = CHORD_SETS[chordSetRef.current % CHORD_SETS.length];
    const chordIdx = Math.floor(time / 8) % chords.length;
    const chord = chords[chordIdx];
    const now = ctx.currentTime;
    const transition = 2.0;

    const oscs = oscillatorsRef.current;
    chord.notes.forEach((freq, i) => {
      const mainIdx = i * 2;
      const detunedIdx = i * 2 + 1;
      if (oscs[mainIdx]) {
        oscs[mainIdx].frequency.setTargetAtTime(freq, now, transition);
      }
      if (oscs[detunedIdx]) {
        oscs[detunedIdx].frequency.setTargetAtTime(freq * 1.003, now, transition);
      }
    });

    if (oscs[6]) {
      oscs[6].frequency.setTargetAtTime(chord.sub, now, transition);
    }
    if (oscs[7]) {
      oscs[7].frequency.setTargetAtTime(chord.high, now, transition);
    }
    if (oscs[8]) {
      oscs[8].frequency.setTargetAtTime(chord.high * 2, now, transition);
    }

    const dynamicMod = 0.7 + 0.3 * Math.sin(time * 0.3);
    const baseGains = [0.08, 0.04, 0.08, 0.04, 0.08, 0.04, 0.1, 0.02, 0.01];
    oscGainsRef.current.forEach((g, i) => {
      if (baseGains[i] !== undefined) {
        g.gain.setTargetAtTime(baseGains[i] * dynamicMod, now, 0.5);
      }
    });
  }, []);

  const play = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current!;
    const masterGain = masterGainRef.current!;

    const doPlay = () => {
      if (audioModeRef.current === "demo") {
        if (oscillatorsRef.current.length === 0) {
          setupOscillators();
        }

        startWallTimeRef.current = performance.now();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
          const elapsed = (performance.now() - startWallTimeRef.current) / 1000;
          const newTime = accumulatedTimeRef.current + elapsed;
          if (newTime >= demoDurationRef.current) {
            accumulatedTimeRef.current = 0;
            startWallTimeRef.current = performance.now();
            setCurrentTime(0);
            isPlayingRef.current = false;
            setIsPlaying(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = 0;
            const mg = masterGainRef.current;
            const c = audioCtxRef.current;
            if (c && mg) {
              mg.gain.cancelScheduledValues(c.currentTime);
              mg.gain.setTargetAtTime(0, c.currentTime, 0.15);
            }
            setTimeout(() => {
              if (!isPlayingRef.current) {
                setFrequencyData(new Uint8Array(64));
                setAudioEnergy(0);
                setBassEnergy(0);
                setTrebleEnergy(0);
              }
            }, 300);
            onTrackEndRef.current?.();
          } else {
            setCurrentTime(newTime);
            onTimeUpdateRef.current?.(newTime);
            updateChord(newTime);
          }
        }, 50);
      } else {
        const audio = audioElRef.current!;
        const currentTrack = currentTrackRef.current;

        if (currentTrack?.audioUrl && (!audio.src || audio.src === "")) {
          audio.src = currentTrack.audioUrl;
          audio.load();
        }

        const attemptPlay = () => {
          audio.play().catch((err) => {
            console.error("Audio play error:", err);
          });
        };

        if (audio.readyState >= 2) {
          attemptPlay();
        } else {
          audio.addEventListener("canplay", attemptPlay, { once: true });
        }
      }

      isPlayingRef.current = true;
      setIsPlaying(true);
      startAnalysisLoop();
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setTargetAtTime(volumeRef.current, ctx.currentTime, 0.01);
        doPlay();
      }).catch(() => { });
    } else {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setTargetAtTime(volumeRef.current, ctx.currentTime, 0.01);
      doPlay();
    }
  }, [initAudio, setupOscillators, startAnalysisLoop, updateChord]);

  const pause = useCallback(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;

    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    }

    if (audioModeRef.current === "demo") {
      if (isPlayingRef.current) {
        const elapsed = (performance.now() - startWallTimeRef.current) / 1000;
        accumulatedTimeRef.current += elapsed;
      }
    } else if (audioElRef.current) {
      audioElRef.current.pause();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    isPlayingRef.current = false;
    setIsPlaying(false);
    stopAnalysisLoop();

    setTimeout(() => {
      if (!isPlayingRef.current) {
        setFrequencyData(new Uint8Array(64));
        setAudioEnergy(0);
        setBassEnergy(0);
        setTrebleEnergy(0);
      }
    }, 300);
  }, [stopAnalysisLoop]);

  const togglePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (audioModeRef.current === "demo") {
        const clampedTime = Math.max(0, Math.min(time, demoDurationRef.current));
        accumulatedTimeRef.current = clampedTime;
        startWallTimeRef.current = performance.now();
        setCurrentTime(clampedTime);
        updateChord(clampedTime);
      } else if (audioElRef.current && audioElRef.current.readyState >= 1) {
        const maxTime = audioElRef.current.duration || demoDurationRef.current;
        audioElRef.current.currentTime = Math.max(0, Math.min(time, maxTime));
        setCurrentTime(audioElRef.current.currentTime);
      }
    },
    [updateChord]
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volumeRef.current = clamped;
    setVolumeState(clamped);

    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (ctx && masterGain && isPlayingRef.current) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setTargetAtTime(clamped, ctx.currentTime, 0.05);
    }
  }, []);

  const loadTrack = useCallback(
    (newTrack: AudioTrack) => {
      initAudio();

      if (isPlayingRef.current) {
        pause();
      }

      tearDownOscillators();

      currentTrackRef.current = newTrack;
      chordSetRef.current = newTrack.chordSet ?? 0;
      demoDurationRef.current = newTrack.duration;

      if (newTrack.audioUrl) {
        audioModeRef.current = "file";
        setAudioMode("file");

        const audio = audioElRef.current!;
        audio.src = newTrack.audioUrl;
        audio.load();
      } else {
        audioModeRef.current = "demo";
        setAudioMode("demo");
      }

      setDuration(newTrack.duration);
      setCurrentTime(0);
      accumulatedTimeRef.current = 0;
      startWallTimeRef.current = performance.now();

      setFrequencyData(new Uint8Array(64));
      setAudioEnergy(0);
      setBassEnergy(0);
      setTrebleEnergy(0);
    },
    [initAudio, pause, tearDownOscillators]
  );

  const loadAudioFile = useCallback(
    (file: File) => {
      initAudio();

      if (isPlayingRef.current) {
        pause();
      }

      tearDownOscillators();

      if (fileBlobUrlRef.current) {
        URL.revokeObjectURL(fileBlobUrlRef.current);
      }

      const blobUrl = URL.createObjectURL(file);
      fileBlobUrlRef.current = blobUrl;

      const audio = audioElRef.current!;
      audio.src = blobUrl;
      audio.load();

      audioModeRef.current = "file";
      setAudioMode("file");
      setCurrentTime(0);
      accumulatedTimeRef.current = 0;

      setFrequencyData(new Uint8Array(64));
      setAudioEnergy(0);
      setBassEnergy(0);
      setTrebleEnergy(0);
    },
    [initAudio, pause, tearDownOscillators]
  );

  useEffect(() => {
    return () => {
      stopAnalysisLoop();
      tearDownOscillators();
      if (fileBlobUrlRef.current) {
        URL.revokeObjectURL(fileBlobUrlRef.current);
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, [stopAnalysisLoop, tearDownOscillators]);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    frequencyData,
    waveformData,
    audioEnergy,
    bassEnergy,
    trebleEnergy,
    audioMode,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    loadTrack,
    loadAudioFile,
  };
}
