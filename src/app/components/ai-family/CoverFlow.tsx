/**
 * @file: CoverFlow.tsx
 * @description: 3D 封面流滚动组件，支持拖拽、键盘导航、反射效果
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useResponsive } from "../../hooks/useResponsive";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  albumCover?: string;
  color?: string;
}

interface CoverFlowProps {
  tracks: MusicTrack[];
  onTrackSelect: (track: MusicTrack) => void;
  selectedTrack: MusicTrack | null;
  isPlaying?: boolean;
  getCover?: (track: MusicTrack) => string | null;
  isLoading?: (trackId: string) => boolean;
  className?: string;
}

function ReflectionComponent({
  track,
  index,
  currentIndex,
  getCover,
}: {
  track: MusicTrack;
  index: number;
  currentIndex: number;
  getCover?: (track: MusicTrack) => string | null;
}) {
  const albumCover = getCover ? getCover(track) : track.albumCover;

  if (!albumCover) {
    return null;
  }

  return (
    <div
      className="absolute top-full left-0 w-full h-full rounded-lg pointer-events-none select-none transition-all duration-500"
      style={{
        backgroundImage: `url(${albumCover})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transform: "scaleY(-1) translateY(0px)",
        opacity: index === currentIndex ? "0.9" : "0.75",
        maskImage:
          "linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.15) 40%, transparent 60%)",
        WebkitMaskImage:
          "linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.15) 40%, transparent 60%)",
        filter: "blur(0.5px) brightness(0.6) contrast(1.3)",
      }}
    />
  );
}

export function CoverFlow({
  tracks,
  onTrackSelect,
  selectedTrack,
  isPlaying = false,
  getCover,
  isLoading,
  className = "",
}: CoverFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(tracks.length / 2));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, albumSize } = useResponsive();
  const lastDragTime = useRef(Date.now());
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (selectedTrack) {
      const index = tracks.findIndex((t) => t.id === selectedTrack.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedTrack, tracks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const newIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        onTrackSelect(tracks[newIndex]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const newIndex = Math.min(tracks.length - 1, currentIndex + 1);
        setCurrentIndex(newIndex);
        onTrackSelect(tracks[newIndex]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onTrackSelect(tracks[currentIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, tracks, onTrackSelect]);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragOffset(0);
    setVelocity(0);
    lastDragTime.current = Date.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) {
        return;
      }

      const currentTime = Date.now();
      const deltaTime = currentTime - lastDragTime.current;
      const newOffset = clientX - dragStart;
      const deltaOffset = newOffset - dragOffset;

      setDragOffset(newOffset);
      setVelocity(deltaOffset / Math.max(deltaTime, 1));
      lastDragTime.current = currentTime;
    },
    [isDragging, dragStart, dragOffset]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) {
      return;
    }
    setIsDragging(false);

    const threshold = 50;
    const velocityThreshold = 0.5;
    const highVelocityThreshold = 2.0;

    let targetIndex = currentIndex;
    const dragDistance = Math.abs(dragOffset);
    const dragVelocity = Math.abs(velocity);

    if (dragDistance > threshold || dragVelocity > velocityThreshold) {
      let jumpCount = 1;

      if (dragVelocity > highVelocityThreshold) {
        jumpCount = Math.min(2, Math.ceil(dragVelocity / 1.5));
      }

      if (dragDistance > threshold * 2) {
        jumpCount = Math.max(jumpCount, Math.floor(dragDistance / (threshold * 1.5)));
      }

      if (dragOffset < 0 || velocity < -velocityThreshold) {
        targetIndex = Math.min(tracks.length - 1, currentIndex + jumpCount);
      } else if (dragOffset > 0 || velocity > velocityThreshold) {
        targetIndex = Math.max(0, currentIndex - jumpCount);
      }
    }

    setCurrentIndex(targetIndex);
    onTrackSelect(tracks[targetIndex]);
    setDragOffset(0);
    setVelocity(0);
  }, [isDragging, dragOffset, velocity, currentIndex, tracks, onTrackSelect]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragMove(e.clientX);
    },
    [handleDragMove]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleDragMove(e.touches[0].clientX);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleAlbumClick = useCallback(
    (track: MusicTrack, index: number) => {
      if (!isDragging) {
        setCurrentIndex(index);
        onTrackSelect(track);
      }
    },
    [isDragging, onTrackSelect]
  );

  const getTransform = useCallback(
    (index: number) => {
      const baseOffset = index - currentIndex;
      const offset = baseOffset + (isDragging ? dragOffset / 100 : 0);

      const SPACING = isMobile ? 120 : 160;
      const ROTATION = 55;

      if (Math.abs(offset) < 0.1) {
        return `translateX(0px) translateZ(300px) rotateY(0deg) scale(1.3)`;
      } else if (offset < 0) {
        const distance = Math.abs(offset);
        const x = -SPACING * distance;
        const z = -80 * distance;
        const scale = Math.max(0.8, 1.15 - distance * 0.04);
        return `translateX(${x}px) translateZ(${z}px) rotateY(${ROTATION}deg) scale(${scale})`;
      } else {
        const distance = Math.abs(offset);
        const x = SPACING * distance;
        const z = -80 * distance;
        const scale = Math.max(0.8, 1.15 - distance * 0.04);
        return `translateX(${x}px) translateZ(${z}px) rotateY(-${ROTATION}deg) scale(${scale})`;
      }
    },
    [currentIndex, isDragging, dragOffset, isMobile]
  );

  const getZIndex = useCallback((index: number) => {
    const MAX_ZINDEX = 1000;
    const offset = Math.abs(index - currentIndex);

    if (offset === 0) {
      return MAX_ZINDEX;
    } else if (offset === 1) {
      return 100;
    } else if (offset === 2) {
      return 50;
    } else if (offset === 3) {
      return 25;
    } else if (offset === 4) {
      return 15;
    } else {
      return Math.max(1, 10 - offset);
    }
  }, [currentIndex]);

  const getOpacity = useCallback(
    (index: number) => {
      const baseOffset = index - currentIndex;
      const offset = Math.abs(baseOffset + (isDragging ? dragOffset / 100 : 0));

      if (offset < 0.1) {
        return 1;
      }
      if (offset <= 1) {
        return 1;
      }
      if (offset <= 2) {
        return 1;
      }
      if (offset <= 3) {
        return 0.95;
      }
      if (offset <= 4) {
        return 0.9;
      }
      return Math.max(0.8, 0.9 - (offset - 4) * 0.05);
    },
    [currentIndex, isDragging, dragOffset]
  );

  if (tracks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No tracks available
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto relative ${className}`} style={{ zIndex: 300 }}>
      <div
        ref={containerRef}
        className="relative h-96 flex items-center justify-center overflow-visible select-none"
        style={{
          perspective: "1500px",
          perspectiveOrigin: "center center",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {tracks.map((track, index) => {
          const albumCover = getCover ? getCover(track) : track.albumCover;

          return (
            <div
              key={track.id}
              className="absolute select-none"
              style={{
                transform: getTransform(index),
                zIndex: getZIndex(index) + 1000,
                opacity: getOpacity(index),
                transformOrigin: "center center",
                transformStyle: "preserve-3d",
                transition: isDragging
                  ? "none"
                  : "all 400ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onClick={() => handleAlbumClick(track, index)}
            >
              <div
                className="relative group select-none"
                style={{
                  width: `${albumSize}px`,
                  height: `${albumSize}px`,
                }}
              >
                {albumCover ? (
                  <img
                    src={albumCover}
                    alt={track.title}
                    draggable={false}
                    className="w-full h-full object-cover rounded-lg shadow-2xl border border-gray-800/30 select-none"
                    style={{
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                      userSelect: "none",
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-lg shadow-2xl border border-gray-800/30 select-none flex items-center justify-center bg-gradient-to-br from-gray-950 to-black"
                    style={{
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                      userSelect: "none",
                    }}
                  >
                    {isLoading && isLoading(track.id) ? (
                      <div className="flex flex-col items-center gap-2 text-white/60">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                        <span className="text-xs text-center px-2">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/40">
                        <svg
                          className="w-12 h-12"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <span className="text-xs text-center px-2">{track.artist}</span>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 25%, transparent 50%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.08) 100%)",
                  }}
                />

                <ReflectionComponent
                  track={track}
                  index={index}
                  currentIndex={currentIndex}
                  getCover={getCover}
                />

                <div
                  className="absolute top-full left-0 w-full h-3 rounded-lg pointer-events-none select-none transition-opacity duration-1000"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 40%, transparent 100%)",
                    transform: "translateY(6px)",
                    opacity: index === currentIndex ? "0.6" : "0.35",
                  }}
                />

                {index === currentIndex && (
                  <>
                    <div className="absolute inset-0 rounded-lg border border-white/30 shadow-2xl"></div>

                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full opacity-90 shadow-lg animate-pulse"></div>

                    <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-white/20 rounded-full blur-sm" />

                    {isPlaying && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-white/80 rounded-full animate-pulse"
                            style={{
                              height: `${8 + Math.random() * 8}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4 text-sm text-gray-400">
        <span className="opacity-60">
          {currentIndex + 1} / {tracks.length}
        </span>
        <span className="mx-2">•</span>
        <span className="opacity-60">
          Use ← → keys or drag to navigate
        </span>
      </div>
    </div>
  );
}
