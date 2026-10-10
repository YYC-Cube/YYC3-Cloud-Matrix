/**
 * @file 3D封面流组件
 * @description 音乐空间核心交互组件，支持拖拽、键盘导航和响应式布局
 * @author YYC³ Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Heart, Share2 } from 'lucide-react';
import type { MusicSong } from '../../lib/music/types';

interface CoverFlowProps {
  songs: MusicSong[];
  currentIndex: number;
  onSongSelect: (song: MusicSong, index: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  className?: string;
}

interface CardStyle {
  transform: string;
  opacity: number;
  zIndex: number;
  scale: number;
  filter: string;
}

export const CoverFlow: React.FC<CoverFlowProps> = ({
  songs,
  currentIndex,
  onSongSelect,
  isPlaying = false,
  onPlayPause,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDragTime = useRef(Date.now());

  const CARD_WIDTH = 280;
  const CARD_GAP = 60;
  const VISIBLE_CARDS = 5;

  const calculateCardStyle = useCallback(
    (index: number, offset: number = 0): CardStyle => {
      const relativeIndex = index - currentIndex + offset;
      const absIndex = Math.abs(relativeIndex);

      if (absIndex > VISIBLE_CARDS) {
        return {
          transform: `translateX(${relativeIndex * 1000}px) scale(0)`,
          opacity: 0,
          zIndex: 0,
          scale: 0,
          filter: 'blur(10px)',
        };
      }

      const translateX = relativeIndex * (CARD_WIDTH + CARD_GAP);
      const translateZ = -absIndex * 100;
      const rotateY = relativeIndex * -25;
      const scale = Math.max(0.6, 1 - absIndex * 0.15);
      const opacity = Math.max(0.3, 1 - absIndex * 0.2);
      const zIndex = VISIBLE_CARDS - absIndex;
      const blur = absIndex > 2 ? absIndex - 2 : 0;

      return {
        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
        opacity,
        zIndex,
        scale,
        filter: blur > 0 ? `blur(${blur}px)` : 'blur(0px)',
      };
    },
    [currentIndex]
  );

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragOffset(0);
    setVelocity(0);
    lastDragTime.current = Date.now();
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) {return;}

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
    if (!isDragging) {return;}
    setIsDragging(false);

    const threshold = 50;
    const velocityThreshold = 0.5;

    let newIndex = currentIndex;
    const dragDistance = Math.abs(dragOffset);
    const dragVelocity = Math.abs(velocity);

    if (dragDistance > threshold || dragVelocity > velocityThreshold) {
      if (dragOffset > 0 || velocity > velocityThreshold) {
        newIndex = Math.max(0, currentIndex - 1);
      } else if (dragOffset < 0 || velocity < -velocityThreshold) {
        newIndex = Math.min(songs.length - 1, currentIndex + 1);
      }
    }

    if (newIndex !== currentIndex && songs[newIndex]) {
      onSongSelect(songs[newIndex], newIndex);
    }

    setDragOffset(0);
    setVelocity(0);
  }, [isDragging, dragOffset, velocity, currentIndex, songs, onSongSelect]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
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
      handleDragMove(e.touches[0].clientX);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newIndex = Math.max(0, currentIndex - 1);
        if (songs[newIndex]) {
          onSongSelect(songs[newIndex], newIndex);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newIndex = Math.min(songs.length - 1, currentIndex + 1);
        if (songs[newIndex]) {
          onSongSelect(songs[newIndex], newIndex);
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onPlayPause?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, songs, onSongSelect, onPlayPause]);

  const currentSong = songs[currentIndex];

  if (songs.length === 0) {
    return (
      <div className={`flex items-center justify-center h-80 ${className}`}>
        <p className="text-white/50">暂无歌曲</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[500px] select-none ${className}`}
      style={{ perspective: '1200px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateX(${-dragOffset * 0.3}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {songs.map((song, index) => {
          const style = calculateCardStyle(index, dragOffset / (CARD_WIDTH + CARD_GAP));
          const isCenter = index === currentIndex;

          return (
            <motion.div
              key={song.id}
              className="absolute cursor-pointer"
              style={{
                width: CARD_WIDTH,
                height: CARD_WIDTH,
                transformStyle: 'preserve-3d',
                ...style,
              }}
              onClick={() => {
                if (!isDragging && Math.abs(dragOffset) < 10) {
                  onSongSelect(song, index);
                }
              }}
              whileHover={isCenter ? { scale: style.scale * 1.05 } : {}}
            >
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,30,40,0.9), rgba(20,20,30,0.95))',
                  boxShadow: isCenter
                    ? '0 25px 50px -12px rgba(0, 212, 255, 0.25), 0 0 0 1px rgba(0, 212, 255, 0.1)'
                    : '0 10px 30px -10px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={song.albumCover}
                  alt={`${song.title} - ${song.artist}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {isCenter && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                )}

                {isCenter && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg truncate">{song.title}</h3>
                    <p className="text-white/70 text-sm truncate">{song.artist}</p>
                    <p className="text-white/50 text-xs truncate mt-1">{song.album}</p>
                  </div>
                )}

                {isCenter && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                    <button
                      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {isCenter && (
                <div
                  className="absolute top-full left-0 w-full h-full rounded-2xl pointer-events-none"
                  style={{
                    backgroundImage: `url(${song.albumCover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'scaleY(-1) translateY(-20px)',
                    opacity: 0.4,
                    maskImage:
                      'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                    WebkitMaskImage:
                      'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                    filter: 'blur(2px) brightness(0.5)',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {currentSong && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
          <button
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            onClick={() => {
              const newIndex = Math.max(0, currentIndex - 1);
              if (songs[newIndex]) {
                onSongSelect(songs[newIndex], newIndex);
              }
            }}
            disabled={currentIndex === 0}
          >
            <SkipBack className="w-5 h-5 text-white" />
          </button>

          <button
            className="p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          <button
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            onClick={() => {
              const newIndex = Math.min(songs.length - 1, currentIndex + 1);
              if (songs[newIndex]) {
                onSongSelect(songs[newIndex], newIndex);
              }
            }}
            disabled={currentIndex === songs.length - 1}
          >
            <SkipForward className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
        {songs.slice(
          Math.max(0, currentIndex - 3),
          Math.min(songs.length, currentIndex + 4)
        ).map((song, i) => {
          const actualIndex = Math.max(0, currentIndex - 3) + i;
          return (
            <div
              key={song.id}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                actualIndex === currentIndex
                  ? 'bg-cyan-400 w-4'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CoverFlow;
