/**
 * @file 音乐源管理面板组件
 * @description 统一管理多种音乐来源的UI组件
 * @author YYC³ Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Search,
  Sparkles,
  Music,
  Trash2,
  Play,
  AlertCircle,
} from 'lucide-react';
import { musicSourceManager, type LocalMusicFile, type MusicSource } from '../../lib/music/MusicSourceManager';
import type { MusicSong } from '../../lib/music/types';

interface MusicSourcePanelProps {
  onSongSelect?: (song: MusicSong) => void;
  onSongsLoaded?: (songs: MusicSong[]) => void;
  className?: string;
}

type ActiveTab = 'local' | 'online' | 'ai' | 'sources';

const ONLINE_PROVIDERS_LIST = [
  { id: 'jamendo', name: 'Jamendo', icon: '🎵', description: '免费音乐库' },
  { id: 'freemusicarchive', name: 'Free Music Archive', icon: '🎼', description: '开源音乐' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '☁️', description: '独立音乐人' },
  { id: 'youtube', name: 'YouTube Music', icon: '▶️', description: '视频音乐' },
  { id: 'netease', name: '网易云音乐', icon: '🎶', description: '国内热门' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', description: '全球流媒体' },
];

const AI_STYLES = [
  { id: 'electronic', name: '电子', icon: '⚡' },
  { id: 'classical', name: '古典', icon: '🎻' },
  { id: 'jazz', name: '爵士', icon: '🎷' },
  { id: 'hiphop', name: '嘻哈', icon: '🎤' },
  { id: 'ambient', name: '氛围', icon: '🌙' },
  { id: 'rock', name: '摇滚', icon: '🎸' },
];

const AI_MOODS = [
  { id: 'happy', name: '欢快', color: '#FFD700' },
  { id: 'calm', name: '平静', color: '#87CEEB' },
  { id: 'energetic', name: '活力', color: '#FF6B6B' },
  { id: 'romantic', name: '浪漫', color: '#FF69B4' },
  { id: 'melancholic', name: '忧郁', color: '#9370DB' },
  { id: 'focus', name: '专注', color: '#32CD32' },
];

export const MusicSourcePanel: React.FC<MusicSourcePanelProps> = ({
  onSongSelect,
  onSongsLoaded,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('local');
  const [localFiles, setLocalFiles] = useState<LocalMusicFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('jamendo');
  const [sources, setSources] = useState<MusicSource[]>(musicSourceManager.getSources());

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('electronic');
  const [aiMood, setAiMood] = useState('calm');
  const [aiDuration, setAiDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) {return;}

      setIsUploading(true);
      setUploadProgress(0);

      const uploadedFiles: LocalMusicFile[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/')) {
          try {
            const localFile = await musicSourceManager.uploadLocalFile(file);
            uploadedFiles.push(localFile);
          } catch (error) {
            console.error('Failed to upload file:', file.name, error);
          }
        }
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      setLocalFiles(musicSourceManager.getLocalFiles());
      setIsUploading(false);

      if (uploadedFiles.length > 0 && onSongsLoaded) {
        const songs = uploadedFiles.map((f) => musicSourceManager.localFileToSong(f));
        onSongsLoaded(songs);
      }
    },
    [onSongsLoaded]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;

      setIsUploading(true);
      setUploadProgress(0);

      const uploadedFiles: LocalMusicFile[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/')) {
          try {
            const localFile = await musicSourceManager.uploadLocalFile(file);
            uploadedFiles.push(localFile);
          } catch (error) {
            console.error('Failed to upload file:', file.name, error);
          }
        }
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      setLocalFiles(musicSourceManager.getLocalFiles());
      setIsUploading(false);

      if (uploadedFiles.length > 0 && onSongsLoaded) {
        const songs = uploadedFiles.map((f) => musicSourceManager.localFileToSong(f));
        onSongsLoaded(songs);
      }
    },
    [onSongsLoaded]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDeleteFile = useCallback((fileId: string) => {
    musicSourceManager.deleteLocalFile(fileId);
    setLocalFiles(musicSourceManager.getLocalFiles());
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {return;}

    setIsSearching(true);
    setSearchResults([]);

    try {
      const results = await musicSourceManager.searchOnline(searchQuery, selectedProvider);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedProvider]);

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) {return;}

    setIsGenerating(true);

    try {
      const song = await musicSourceManager.generateAIMusic({
        prompt: aiPrompt,
        style: aiStyle,
        mood: aiMood,
        duration: aiDuration,
      });

      if (song && onSongSelect) {
        onSongSelect(song);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, aiStyle, aiMood, aiDuration, onSongSelect]);

  const toggleSource = useCallback((sourceId: string) => {
    const source = sources.find((s) => s.id === sourceId);
    if (source) {
      if (source.enabled) {
        musicSourceManager.disableSource(sourceId);
      } else {
        musicSourceManager.enableSource(sourceId);
      }
      setSources(musicSourceManager.getSources());
    }
  }, [sources]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`music-source-panel ${className}`}>
      <div className="flex border-b border-white/10 mb-4">
        {[
          { id: 'local' as const, label: '本地音乐', icon: <Upload className="w-4 h-4" /> },
          { id: 'online' as const, label: '在线搜索', icon: <Search className="w-4 h-4" /> },
          { id: 'ai' as const, label: 'AI创作', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'sources' as const, label: '音乐源', icon: <Music className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'local' && (
          <motion.div
            key="local"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60 mb-2">拖拽音频文件到这里，或点击上传</p>
              <p className="text-white/40 text-sm">支持 MP3, WAV, FLAC, OGG, AAC 格式</p>
            </div>

            {isUploading && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">上传中...</span>
                  <span className="text-cyan-400 text-sm">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {localFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white/70 text-sm">已上传 ({localFiles.length})</h3>
                  <button
                    onClick={() => musicSourceManager.clearAllLocalFiles()}
                    className="text-red-400/60 hover:text-red-400 text-xs"
                  >
                    清空全部
                  </button>
                </div>
                {localFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Music className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{file.name}</p>
                      <p className="text-white/40 text-xs">
                        {file.artist} · {formatDuration(file.duration)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const song = musicSourceManager.localFileToSong(file);
                        onSongSelect?.(song);
                      }}
                      className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'online' && (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {ONLINE_PROVIDERS_LIST.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    selectedProvider === provider.id
                      ? 'bg-cyan-500/20 border-cyan-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{provider.icon}</span>
                  <p className="text-white/70 text-xs mt-1">{provider.name}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索歌曲、艺术家、专辑..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors"
              >
                {isSearching ? '搜索中...' : '搜索'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white/70 text-sm">搜索结果 ({searchResults.length})</h3>
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={song.albumCover}
                      alt={song.album}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{song.title}</p>
                      <p className="text-white/40 text-xs">
                        {song.artist} · {formatDuration(song.duration)}
                      </p>
                    </div>
                    <button
                      onClick={() => onSongSelect?.(song)}
                      className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">AI 音乐创作</span>
              </div>
              <p className="text-white/60 text-sm">
                描述你想要的音乐风格和情绪，AI 将为你生成独特的音乐作品
              </p>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">音乐描述</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="例如：一首轻快的电子舞曲，适合夏日派对..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">音乐风格</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {AI_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setAiStyle(style.id)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      aiStyle === style.id
                        ? 'bg-cyan-500/20 border-cyan-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{style.icon}</span>
                    <p className="text-white/70 text-xs mt-1">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">情绪氛围</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {AI_MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setAiMood(mood.id)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      aiMood === mood.id
                        ? 'border-current'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    style={{
                      borderColor: aiMood === mood.id ? mood.color : undefined,
                      backgroundColor: aiMood === mood.id ? `${mood.color}20` : undefined,
                    }}
                  >
                    <p className="text-white/70 text-xs">{mood.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">
                时长: {aiDuration} 秒
              </label>
              <input
                type="range"
                min="15"
                max="180"
                value={aiDuration}
                onChange={(e) => setAiDuration(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-white/40 text-xs mt-1">
                <span>15秒</span>
                <span>3分钟</span>
              </div>
            </div>

            <button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始创作
                </>
              )}
            </button>

            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-400/80 text-xs">
                AI 音乐生成功能需要接入第三方服务（如 Suno AI、Udio、MusicGen 等）。
                当前为演示模式，完整功能需要配置 API 密钥。
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'sources' && (
          <motion.div
            key="sources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-white/70 text-sm">音乐来源设置</h3>
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{source.icon}</span>
                  <div>
                    <p className="text-white font-medium">{source.name}</p>
                    <p className="text-white/40 text-xs">
                      优先级: {source.priority}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSource(source.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    source.enabled ? 'bg-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    animate={{ left: source.enabled ? '28px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white/70 text-sm mb-3">在线音乐服务状态</h4>
              <div className="space-y-2">
                {ONLINE_PROVIDERS_LIST.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{provider.icon}</span>
                      <span className="text-white/60">{provider.name}</span>
                    </div>
                    <span className="text-yellow-400/60 text-xs">需要配置</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicSourcePanel;
