/**
 * @file 音乐空间主页面
 * @description YYC³音乐空间核心页面，整合3D封面流、语音控制、情感推荐、真实音频播放
 * @author YYC³ Team
 * @version 3.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Search,
  Heart,
  ListMusic,
  Radio,
  TrendingUp,
  Clock,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  Dumbbell,
  PartyPopper,
  Car,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Settings,
  Upload,
  Disc,
  User,
  Video,
} from 'lucide-react';
import { CoverFlow } from './CoverFlow';
import { AudioVisualizer } from './AudioVisualizer';
import { MusicSourcePanel } from './MusicSourcePanel';
import { FloatingCD } from './FloatingCD';
import { useMusicSpace } from '../../hooks/useMusicSpace';
import { useI18n } from '../../hooks/useI18n';
import type { MusicSong, MusicActivity, MusicMood } from '../../lib/music/types';
import { 
  ALBUMS, 
  ARTIST, 
  PHOTOS, 
  VIDEOS, 
  getAllSongs
} from '../../lib/music/MusicData';

type TabType = 'recommend' | 'mood' | 'activity' | 'albums' | 'artist' | 'search' | 'equalizer' | 'source';

const MOOD_ICONS: Record<MusicMood, React.ReactNode> = {
  happy: <Sparkles className="w-4 h-4" />,
  sad: <Moon className="w-4 h-4" />,
  energetic: <Dumbbell className="w-4 h-4" />,
  calm: <Sun className="w-4 h-4" />,
  romantic: <Heart className="w-4 h-4" />,
  melancholy: <Moon className="w-4 h-4" />,
  upbeat: <PartyPopper className="w-4 h-4" />,
  peaceful: <Coffee className="w-4 h-4" />,
};

const ACTIVITY_ICONS: Record<MusicActivity, React.ReactNode> = {
  focus: <Sparkles className="w-4 h-4" />,
  relax: <Coffee className="w-4 h-4" />,
  exercise: <Dumbbell className="w-4 h-4" />,
  sleep: <Moon className="w-4 h-4" />,
  party: <PartyPopper className="w-4 h-4" />,
  commute: <Car className="w-4 h-4" />,
  morning: <Sun className="w-4 h-4" />,
  evening: <Moon className="w-4 h-4" />,
};

const MOOD_COLORS: Record<MusicMood, string> = {
  happy: 'from-yellow-500 to-orange-500',
  sad: 'from-blue-500 to-indigo-500',
  energetic: 'from-red-500 to-pink-500',
  calm: 'from-cyan-500 to-blue-500',
  romantic: 'from-pink-500 to-rose-500',
  melancholy: 'from-purple-500 to-indigo-500',
  upbeat: 'from-green-500 to-emerald-500',
  peaceful: 'from-teal-500 to-cyan-500',
};

const EQUALIZER_PRESETS = [
  { id: 'flat', name: '原声' },
  { id: 'bass-boost', name: '低音增强' },
  { id: 'treble-boost', name: '高音增强' },
  { id: 'vocal', name: '人声' },
  { id: 'electronic', name: '电子' },
  { id: 'classical', name: '古典' },
];

export const MusicSpacePage: React.FC = () => {
  const { t: _t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('recommend');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<MusicMood | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<MusicActivity | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('flat');
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());

  const {
    playerState,
    recommendation,
    isListening,
    analyzerData,
    startVoiceControl,
    stopVoiceControl,
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
  } = useMusicSpace({
    autoPlay: false,
    onSongChange: (song) => {
      console.info('🎵 Now playing:', song.title, '-', song.artist);
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displaySongs, setDisplaySongs] = useState<MusicSong[]>([]);

  useEffect(() => {
    if (recommendation) {
      setDisplaySongs(recommendation.songs);
      loadPlaylist(recommendation.songs);
    }
  }, [recommendation, loadPlaylist]);

  const handleSongSelect = useCallback(
    async (song: MusicSong, index: number) => {
      setCurrentIndex(index);
      await playSong(song, index);
    },
    [playSong]
  );

  const handlePlayPause = useCallback(async () => {
    if (playerState.isPlaying) {
      pauseSong();
    } else {
      await resumeSong();
    }
  }, [playerState.isPlaying, pauseSong, resumeSong]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      const results = searchSongs(searchQuery);
      setDisplaySongs(results);
      setCurrentIndex(0);
      loadPlaylist(results);
      setActiveTab('search');
    }
  }, [searchQuery, searchSongs, loadPlaylist]);

  const handleMoodSelect = useCallback(
    (mood: MusicMood) => {
      setSelectedMood(mood);
      const songs = recommendByMood(mood);
      setDisplaySongs(songs);
      setCurrentIndex(0);
      loadPlaylist(songs);
    },
    [recommendByMood, loadPlaylist]
  );

  const handleActivitySelect = useCallback(
    (activity: MusicActivity) => {
      setSelectedActivity(activity);
      const songs = recommendByActivity(activity);
      setDisplaySongs(songs);
      setCurrentIndex(0);
      loadPlaylist(songs);
    },
    [recommendByActivity, loadPlaylist]
  );

  const toggleVoiceControl = useCallback(() => {
    if (isListening) {
      stopVoiceControl();
    } else {
      startVoiceControl();
    }
  }, [isListening, startVoiceControl, stopVoiceControl]);

  const handleMuteToggle = useCallback(() => {
    const muted = toggleMute();
    setIsMuted(muted);
  }, [toggleMute]);

  const handlePresetChange = useCallback(
    (preset: string) => {
      setSelectedPreset(preset);
      setEqualizerPreset(preset);
    },
    [setEqualizerPreset]
  );

  const toggleLike = useCallback((songId: string) => {
    setLikedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const moods: MusicMood[] = ['happy', 'calm', 'energetic', 'romantic', 'melancholy', 'peaceful'];
  const activities: MusicActivity[] = ['focus', 'relax', 'exercise', 'sleep', 'party', 'commute'];

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-[#0a0a1a] to-[#0f0f2a]">
      <FloatingCD
        isPlaying={playerState.isPlaying}
        trackTitle={playerState.currentSong?.title || ''}
        artist={playerState.currentSong?.artist}
        albumCover={playerState.currentSong?.albumCover}
        isActive={!!playerState.currentSong}
      />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white/90">音乐空间</h1>
              <p className="text-sm text-white/40">YYC³ Music Space · 真实音频播放</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceControl}
              className={`p-3 rounded-full transition-all ${
                isListening
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 animate-pulse'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              title="语音控制"
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-sm">语音控制已开启，请说出您的指令...</span>
              <span className="text-white/30 text-xs ml-auto">支持：播放、暂停、下一首、音量控制</span>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 p-1 rounded-xl bg-white/5 overflow-x-auto">
          {[
            { key: 'recommend', label: '推荐', icon: <Sparkles className="w-4 h-4" /> },
            { key: 'albums', label: '专辑', icon: <Disc className="w-4 h-4" /> },
            { key: 'artist', label: '艺人', icon: <User className="w-4 h-4" /> },
            { key: 'mood', label: '心情', icon: <Heart className="w-4 h-4" /> },
            { key: 'activity', label: '场景', icon: <Radio className="w-4 h-4" /> },
            { key: 'search', label: '搜索', icon: <Search className="w-4 h-4" /> },
            { key: 'source', label: '音乐源', icon: <Upload className="w-4 h-4" /> },
            { key: 'equalizer', label: '均衡器', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'recommend' && recommendation && (
            <motion.div
              key="recommend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/70 text-sm">{recommendation.reason}</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'albums' && (
            <motion.div
              key="albums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ALBUMS.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => {
                      setDisplaySongs(album.songs);
                      setCurrentIndex(0);
                      loadPlaylist(album.songs);
                    }}
                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                      <img
                        src={album.cover}
                        alt={album.nameZh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-white font-medium truncate">{album.nameZh}</h3>
                    <p className="text-white/50 text-sm truncate">{album.songs.length} 首歌曲</p>
                    <p className="text-white/30 text-xs mt-1">{album.year}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'artist' && (
            <motion.div
              key="artist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-6 p-6 rounded-xl bg-white/5 border border-white/10">
                <img
                  src={ARTIST.avatar}
                  alt={ARTIST.nameZh}
                  className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96';
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{ARTIST.nameZh}</h2>
                  <p className="text-white/50 text-sm">{ARTIST.name}</p>
                  <p className="text-white/70 text-sm mt-2">{ARTIST.bio}</p>
                  <div className="flex gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-cyan-400">{ALBUMS.length}</p>
                      <p className="text-white/50 text-xs">专辑</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-cyan-400">{getAllSongs().length}</p>
                      <p className="text-white/50 text-xs">歌曲</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-cyan-400">{VIDEOS.length}</p>
                      <p className="text-white/50 text-xs">视频</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PHOTOS.slice(0, 8).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-white font-medium">音乐视频</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {VIDEOS.map((video) => (
                    <div
                      key={video.id}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 cursor-pointer"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.titleZh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                        <p className="text-white text-xs truncate">{video.titleZh}</p>
                        <p className="text-white/50 text-xs">{video.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 md:grid-cols-6 gap-3"
            >
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedMood === mood
                      ? `bg-gradient-to-br ${MOOD_COLORS[mood]} border-transparent text-white`
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {MOOD_ICONS[mood]}
                    <span className="text-xs capitalize">{mood}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {activities.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleActivitySelect(activity)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedActivity === activity
                      ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {ACTIVITY_ICONS[activity]}
                    <span className="text-xs capitalize">{activity}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="搜索歌曲、歌手、专辑..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 transition-colors"
                >
                  搜索
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'equalizer' && (
            <motion.div
              key="equalizer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white/70 text-sm mb-4">均衡器预设</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {EQUALIZER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetChange(preset.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedPreset === preset.id
                          ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white/70 text-sm mb-4">音频可视化</h3>
                <AudioVisualizer
                  analyzerData={analyzerData}
                  type="bars"
                  color="#00d4ff"
                  height={120}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'source' && (
            <motion.div
              key="source"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <MusicSourcePanel
                onSongSelect={(song) => handleSongSelect(song, 0)}
                onSongsLoaded={(songs) => {
                  setDisplaySongs(songs);
                  setCurrentIndex(0);
                  loadPlaylist(songs);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <CoverFlow
            songs={displaySongs}
            currentIndex={currentIndex}
            onSongSelect={handleSongSelect}
            isPlaying={playerState.isPlaying}
            onPlayPause={handlePlayPause}
          />
        </div>

        {playerState.currentSong && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <img
                src={playerState.currentSong.albumCover}
                alt={playerState.currentSong.title}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {playerState.currentSong.title}
                </h3>
                <p className="text-white/50 text-sm truncate">
                  {playerState.currentSong.artist} · {playerState.currentSong.album}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(playerState.currentSong!.id)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedSongs.has(playerState.currentSong.id)
                        ? 'text-pink-500 fill-pink-500'
                        : 'text-white/70'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div
                className="h-1 rounded-full bg-white/10 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = ((e.clientX - rect.left) / rect.width) * 100;
                  seekToPercent(percent);
                }}
              >
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{
                    width: `${
                      playerState.duration > 0
                        ? (playerState.progress / playerState.duration) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-white/30">
                <span>{formatTime(playerState.progress)}</span>
                <span>{formatTime(playerState.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg transition-colors ${
                  playerState.shuffle ? 'text-cyan-400' : 'text-white/30 hover:text-white/50'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={previousSong}
                className="p-2 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-400 transition-colors"
              >
                {playerState.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-2 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-lg transition-colors ${
                  playerState.repeat !== 'off' ? 'text-cyan-400' : 'text-white/30 hover:text-white/50'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 px-4">
              <button onClick={handleMuteToggle} className="text-white/50 hover:text-white/70">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div
                className="flex-1 h-1 rounded-full bg-white/10 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const vol = (e.clientX - rect.left) / rect.width;
                  setVolume(vol);
                  if (isMuted) {handleMuteToggle();}
                }}
              >
                <div
                  className="h-full rounded-full bg-cyan-500/50"
                  style={{ width: `${isMuted ? 0 : playerState.volume * 100}%` }}
                />
              </div>
              <span className="text-white/30 text-xs">{Math.round(playerState.volume * 100)}%</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">今日推荐</span>
            </div>
            <p className="text-2xl font-bold text-white">{displaySongs.length}</p>
            <p className="text-xs text-white/30">首歌曲</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs">播放时长</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.floor(playerState.progress / 60)}:{Math.floor(playerState.progress % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-white/30">当前播放</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs">收藏歌曲</span>
            </div>
            <p className="text-2xl font-bold text-white">{likedSongs.size}</p>
            <p className="text-xs text-white/30">首</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">播放状态</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {playerState.isPlaying ? '播放中' : '已暂停'}
            </p>
            <p className="text-xs text-white/30">
              {playerState.repeat === 'one' ? '单曲循环' : playerState.repeat === 'all' ? '列表循环' : '顺序播放'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicSpacePage;
