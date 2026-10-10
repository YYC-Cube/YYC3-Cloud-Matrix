/**
 * @file: VinylPhotoPlayer.tsx
 * @description: VinylPhotoPlayer.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [component]
 */

import { Disc3, Film, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DMUSIC_PHOTOS } from "../../lib/dmusic-resources";

interface VinylPhotoPlayerProps {
  photos: string[];
  coverUrl?: string;
  isPlaying: boolean;
  audioEnergy: number;
  trackTitle?: string;
  artist?: string;
  hasVideo: boolean;
  onOpenVideo: () => void;
}

export function VinylPhotoPlayer({
  photos,
  coverUrl,
  isPlaying,
  audioEnergy,
  trackTitle,
  artist,
  hasVideo,
  onOpenVideo,
}: VinylPhotoPlayerProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [_imageLoaded, setImageLoaded] = useState(false);
  const [showVideoHint, setShowVideoHint] = useState(false);

  const displayPhotos = photos.length > 0 ? photos : DMUSIC_PHOTOS;
  const currentPhoto = coverUrl || displayPhotos[photoIndex % displayPhotos.length];

  useEffect(() => {
    if (!isPlaying) { return; }
    const interval = setInterval(() => {
      setPhotoIndex(prev => (prev + 1) % displayPhotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, displayPhotos.length]);

  const rotationDeg = isPlaying ? 360 : 0;

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 group"
      style={{
        background: `radial-gradient(circle at center, rgba(30,10,60,0.95) 0%, rgba(4,10,22,0.98) 70%)`,
        border: "1px solid rgba(168,85,247,0.15)",
      }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: isPlaying
            ? `inset 0 0 40px rgba(168,85,247,${0.05 + audioEnergy * 0.1}), 0 0 30px rgba(168,85,247,${0.03 + audioEnergy * 0.08})`
            : "inset 0 0 20px rgba(168,85,247,0.03)",
        }}
      />

      {/* Ambient particles */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-400/20"
              style={{
                left: `${20 + i * 13}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-20, -80],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Vinyl Record Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: rotationDeg }}
          transition={isPlaying ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
          className="relative"
          style={{ width: "85%", height: "85%" }}
        >
          {/* Vinyl base */}
          <div className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: `conic-gradient(from 0deg, #0a0612 0deg, #1a0a28 30deg, #0a0612 60deg, #12081f 90deg, #0a0612 120deg, #1a0a28 150deg, #0a0612 180deg, #12081f 210deg, #0a0612 240deg, #1a0a28 270deg, #0a0612 300deg, #12081f 330deg, #0a0612 360deg)`,
              boxShadow: `0 0 60px rgba(168,85,247,${0.1 + audioEnergy * 0.15}), inset 0 0 50px rgba(0,0,0,0.8)`,
            }}
          >
            {/* Vinyl grooves */}
            {[...Array(12)].map((_, i) => {
              const size = 25 + i * 5.5;
              return (
                <div
                  key={i}
                  className="absolute rounded-full border border-white/[0.03]"
                  style={{
                    width: `${size}%`,
                    height: `${size}%`,
                    top: `${(100 - size) / 2}%`,
                    left: `${(100 - size) / 2}%`,
                  }}
                />
              );
            })}

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full opacity-[0.04]"
              style={{
                background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
              }}
            />
          </div>

          {/* Photo area (center of vinyl) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: rotationDeg }}
              transition={isPlaying ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
              className="relative"
              style={{ width: "52%", height: "52%" }}
            >
              {/* Photo container with clipped circle */}
              <div className="absolute inset-0 rounded-full overflow-hidden ring-2 ring-white/[0.08] shadow-2xl shadow-black/50">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentPhoto}
                    src={currentPhoto}
                    alt={trackTitle || "董小姐"}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = displayPhotos[0];
                    }}
                  />
                </AnimatePresence>
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
              </div>

              {/* Center spindle hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] h-[18%] rounded-full z-10"
                style={{
                  background: "linear-gradient(135deg, #1a0a28 0%, #0a0612 50%, #12081f 100%)",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(168,85,247,0.2)",
                  border: "2px solid rgba(168,85,247,0.25)",
                }}
              >
                {/* Spindle center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-500/80"
                  style={{
                    boxShadow: isPlaying ? "0 0 10px rgba(168,85,247,0.8), 0 0 20px rgba(168,85,247,0.4)" : "none",
                  }}
                />
              </div>

              {/* Playing indicator pulse */}
              {isPlaying && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    border: "1px solid rgba(168,85,247,0.3)",
                  }}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Video button overlay */}
      {hasVideo && (
        <button
          onClick={onOpenVideo}
          onMouseEnter={() => setShowVideoHint(true)}
          onMouseLeave={() => setShowVideoHint(false)}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all z-20"
          title="播放 MV"
        >
          <Film className="w-4 h-4" />
          <AnimatePresence>
            {showVideoHint && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-purple-300 bg-black/60 px-2 py-1 rounded"
              >
                MV
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* Status badge */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/[0.06]">
          <Disc3 className={`w-3 h-3 ${isPlaying ? "text-purple-400" : "text-white/30"}`}
            style={isPlaying ? { animation: "spin 3s linear infinite" } : {}}
          />
          <span className="text-[rgba(168,85,247,0.7)]" style={{ fontSize: "0.55rem" }}>
            {isPlaying ? "D-VINYL" : "PAUSED"}
          </span>
        </div>
      </div>

      {/* Track info overlay at bottom of vinyl */}
      {(trackTitle || artist) && (
        <div className="absolute bottom-14 left-0 right-0 text-center pointer-events-none z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${trackTitle}-${photoIndex}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
            >
              {trackTitle && (
                <p className="text-white/80 font-medium truncate px-4" style={{ fontSize: "0.72rem" }}>
                  {trackTitle}
                </p>
              )}
              {artist && (
                <p className="text-white/30 truncate px-4 mt-0.5" style={{ fontSize: "0.58rem" }}>
                  {artist}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface MVPlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  trackTitle: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (pct: number) => void;
  formatTime: (t: number) => string;
}

export function MVPlayerOverlay({
  isOpen, onClose, videoUrl, trackTitle,
  isPlaying: _externalIsPlaying, currentTime, duration, onSeek, formatTime,
}: MVPlayerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const [size, setSize] = useState({ w: 640, h: 420 });
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) { return; }
    if (v.paused) { v.play().catch(() => { }); setVideoPlaying(true); }
    else { v.pause(); setVideoPlaying(false); }
  }, [videoUrl]);

  const changeVolume = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) { return; }
    const vol = Math.max(0, Math.min(1, v.volume + delta));
    v.volume = vol;
    v.muted = vol === 0;
    setVideoVolume(vol);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) { return; }
    const onPlay = () => setVideoPlaying(true);
    const onPause = () => setVideoPlaying(false);
    const onTime = () => setVideoTime(v.currentTime);
    const onDur = () => setVideoDuration(v.duration);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    return () => { v.removeEventListener("play", onPlay); v.removeEventListener("pause", onPause); v.removeEventListener("timeupdate", onTime); v.removeEventListener("loadedmetadata", onDur); };
  }, [videoUrl]);

  useEffect(() => {
    if (!isOpen) { return; }
    setVideoPlaying(false);
    setVideoTime(0);
    setVideoDuration(0);
  }, [isOpen, videoUrl]);

  useEffect(() => {
    if (!isOpen) { return; }
    const handleMouseUp = () => { dragRef.current = null; resizeRef.current = null; };
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPos({ x: Math.max(0, dragRef.current.startPosX + dx), y: Math.max(0, dragRef.current.startPosY + dy) });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setSize({ w: Math.max(320, resizeRef.current.startW + dx), h: Math.max(240, resizeRef.current.startH + dy) });
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mouseup", handleMouseUp); window.removeEventListener("mousemove", handleMouseMove); };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) { return; }
    const handleKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === " ") { e.preventDefault(); togglePlay(); return; }
      if (e.key === "ArrowLeft" && v) { v.currentTime = Math.max(0, v.currentTime - 5); }
      if (e.key === "ArrowRight" && v) { v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); }
      if (e.key === "ArrowUp") { e.preventDefault(); changeVolume(0.1); }
      if (e.key === "ArrowDown") { e.preventDefault(); changeVolume(-0.1); }
      if (e.key === "f" || e.key === "F") { setSize({ w: window.innerWidth - 40, h: window.innerHeight - 40 }); setPos({ x: 20, y: 20 }); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, togglePlay, changeVolume]);

  const scheduleHideControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); }
    if (videoPlaying) { hideTimerRef.current = setTimeout(() => setShowControls(false), 3000); }
  }, [videoPlaying]);

  const progressPct = videoDuration > 0 ? (videoTime / videoDuration) * 100 : 0;
  const effectiveDuration = videoDuration || duration;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]" />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed bg-black/95 backdrop-blur-2xl rounded-2xl border border-white/10 z-[70] flex flex-col overflow-hidden shadow-2xl"
            style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
            onMouseMove={scheduleHideControls}
          >
            {/* Header — drag handle */}
            <div
              className="flex items-center justify-between p-3 border-b border-white/[0.06] cursor-move select-none shrink-0"
              style={{ opacity: showControls ? 1 : 0, transition: "opacity 0.3s" }}
              onMouseDown={(e) => { if ((e.target as HTMLElement).closest("button")) { return; } dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y }; }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-white/10 flex items-center justify-center">
                  <Film className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold" style={{ fontSize: "0.82rem" }}>{trackTitle}</h3>
                  <p className="text-white/30" style={{ fontSize: "0.55rem" }}>拖拽标题栏移动 · 右下角调整大小</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setSize({ w: 640, h: 420 })} className="p-1.5 text-white/30 hover:text-white/60 transition-colors rounded hover:bg-white/[0.06]" title="默认大小">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                </button>
                <button onClick={() => { setSize({ w: window.innerWidth - 40, h: window.innerHeight - 40 }); setPos({ x: 20, y: 20 }); }} className="p-1.5 text-white/30 hover:text-white/60 transition-colors rounded hover:bg-white/[0.06]" title="最大化 (F)">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
                </button>
                <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white transition-colors rounded hover:bg-white/[0.06]" title="关闭 (Esc)">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative bg-black flex items-center justify-center min-h-0" onClick={togglePlay}>
              {videoUrl ? (
                <video ref={videoRef as React.RefObject<HTMLVideoElement>} src={videoUrl} className="w-full h-full object-contain" playsInline loop />
              ) : (
                <div className="flex flex-col items-center justify-center text-white/30 gap-3">
                  <Film className="w-16 h-16 opacity-20" />
                  <p className="text-sm">暂无 MV 视频</p>
                </div>
              )}
              {!videoPlaying && videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <svg className="w-6 h-6 text-white/80 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="shrink-0 px-3 pt-2 pb-2 border-t border-white/[0.04]" style={{ opacity: showControls ? 1 : 0, transition: "opacity 0.3s" }}>
              <div
                className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group relative mb-2"
                onClick={(e) => {
                  const v = videoRef.current;
                  if (!v || !v.duration) { return; }
                  const rect = e.currentTarget.getBoundingClientRect();
                  v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
                }}
              >
                <div className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-blue-500 rounded-full relative" style={{ width: `${progressPct}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { const v = videoRef.current; if (v) { v.currentTime = Math.max(0, v.currentTime - 10); } }} className="p-1 text-white/50 hover:text-white transition-colors" title="后退10s (←)">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20a10 10 0 00-17.32-6.5L1 10" /></svg>
                </button>
                <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all" title={videoPlaying ? "暂停 (Space)" : "播放 (Space)"}>
                  {videoPlaying ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <button onClick={() => { const v = videoRef.current; if (v) { v.currentTime = Math.min(v.duration || 0, v.currentTime + 10); } }} className="p-1 text-white/50 hover:text-white transition-colors" title="前进10s (→)">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20a10 10 0 0017.32-6.5L23 10" /></svg>
                </button>
                <span className="text-white/30 font-mono ml-1" style={{ fontSize: "0.6rem" }}>{formatTime(videoTime)} / {formatTime(effectiveDuration)}</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setVideoVolume(v.muted ? 0 : v.volume); } }} className="p-1 text-white/50 hover:text-white transition-colors" title="静音">
                    {videoVolume === 0 ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6M17 9l6 6" /></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
                    )}
                  </button>
                  <div className="w-16 h-1 bg-white/10 rounded-full cursor-pointer relative" onClick={(e) => { const v = videoRef.current; if (!v) { return; } const rect = e.currentTarget.getBoundingClientRect(); const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); v.volume = vol; v.muted = vol === 0; setVideoVolume(vol); }}>
                    <div className="h-full bg-white/40 rounded-full" style={{ width: `${videoVolume * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10"
              onMouseDown={(e) => { e.stopPropagation(); resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h }; }}
            >
              <svg className="w-4 h-4 text-white/15 absolute bottom-1 right-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15l-9-9m9 3l-6-6" /></svg>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
