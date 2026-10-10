/**
 * @file 浮动CD组件
 * @description 悬浮在页面上的CD播放指示器，显示当前播放歌曲
 * @author YYC³ Team
 * @version 1.0.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Cpu } from 'lucide-react';

interface FloatingCDProps {
  isPlaying: boolean;
  trackTitle: string;
  artist?: string;
  albumCover?: string;
  isActive: boolean;
}

export function FloatingCD({ 
  isPlaying, 
  trackTitle, 
  artist, 
  albumCover,
  isActive 
}: FloatingCDProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute top-20 right-5 z-[5] pointer-events-none hidden md:flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2.5 border border-dashed border-cyan-500/15 rounded-full"
            />
            
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-cyan-500/30 rounded-tl-sm" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-purple-500/30 rounded-br-sm" />

            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-white/15 flex items-center justify-center relative shadow-lg overflow-hidden ring-2 ring-white/[0.04]"
            >
              {albumCover && (
                <img
                  src={albumCover}
                  alt=""
                  className="absolute inset-0 w-full h-full rounded-full object-cover opacity-60"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="absolute inset-0 opacity-20 bg-[repeating-radial-gradient(circle_at_center,transparent_0,transparent_2px,rgba(255,255,255,0.05)_3px,rgba(255,255,255,0.05)_4px)]" />
              
              <div className="w-5 h-5 rounded-full bg-black/90 border border-white/10 flex items-center justify-center z-10 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
              </div>
            </motion.div>
            
            <motion.div
              animate={{
                opacity: isPlaying ? [1, 0.4, 1] : 0.5,
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-black z-20 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
            />
          </div>

          <div className="flex flex-col gap-0.5 min-w-[80px] max-w-[140px]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-2.5 h-2.5 text-cyan-400/60 flex-shrink-0" />
              <span className="text-[7px] font-bold text-cyan-400/50 uppercase tracking-[0.15em]">YYC³ Play</span>
            </div>
            <motion.p
              key={trackTitle}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/70 font-semibold text-xs tracking-tight truncate"
            >
              {trackTitle}
            </motion.p>
            <div className="flex items-center gap-1.5">
              <div className="h-[1px] w-3 bg-white/10" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="text-white text-[8px] uppercase tracking-[0.15em] font-mono truncate"
              >
                {artist || 'YYC³ MUSIC'}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
