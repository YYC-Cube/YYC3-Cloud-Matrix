/**
 * @file: CreationStudio.tsx
 * @description: CreationStudio.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [component]
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Wand2, Copy, Check, Loader2, Sparkles,
  Smile, Frown, Zap, Cloud, Heart,
  Plus, Minus, Music,
  Layers, FolderOpen, Trash2,
  ArrowLeft, Settings2, Upload, Disc3,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../../hooks/useI18n';
import { MUSIC_LIBRARY, type MusicTrack, getRandomPhoto } from '../../lib/dmusic-resources';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useFamilySettingsSlice } from '../../store/slices/family-settings-slice';
import type { CreatedWork } from '../../store/slices/family-settings-slice';

type CreationMode = 'quick' | 'master' | 'remix' | 'works' | 'upload';
type AILyricsTheme = 'happy' | 'sad' | 'energetic' | 'calm' | 'love';

interface CreationStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrack?: (track: MusicTrack) => void;
  playlist: MusicTrack[];
  currentTrackIndex: number;
  onHaptic?: (pattern: string) => void;
  onShareWork?: (work: CreatedWork) => void;
  user?: { id: string; name?: string };
  starPower?: number;
  onStarPowerUpdate?: (sp: number) => void;
}

const THEMES: Array<{
  id: AILyricsTheme;
  label: string;
  labelZh: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  premium?: boolean;
  spCost?: number;
}> = [
  { id: 'happy', label: 'Happy', labelZh: '快乐', icon: Smile, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'sad', label: 'Sad', labelZh: '忧伤', icon: Frown, color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'energetic', label: 'Energetic', labelZh: '活力', icon: Zap, color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20', premium: true, spCost: 200 },
  { id: 'calm', label: 'Calm', labelZh: '宁静', icon: Cloud, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-teal-500/20' },
  { id: 'love', label: 'Love', labelZh: '爱情', icon: Heart, color: 'text-pink-400', bg: 'from-pink-500/20 to-red-500/20', premium: true, spCost: 200 },
];

const MODES: Array<{
  id: CreationMode;
  label: string;
  labelZh: string;
  icon: React.ElementType;
  desc: string;
  descZh: string;
  gradient: string;
}> = [
  {
    id: 'quick',
    label: 'Quick Song',
    labelZh: '极简写歌',
    icon: Sparkles,
    desc: 'AI lyrics + auto compose in seconds',
    descZh: '一键AI写词作曲，秒出成品',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'master',
    label: 'Master Mode',
    labelZh: '大师写歌',
    icon: Settings2,
    desc: 'Full control over theme, structure & style',
    descZh: '精细控制主题、结构与风格',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'remix',
    label: 'Remix & Cover',
    labelZh: '热歌改编',
    icon: Layers,
    desc: 'Transform existing tracks with AI',
    descZh: 'AI改编翻唱热门曲目',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'upload',
    label: 'Upload Music',
    labelZh: '上传音乐',
    icon: Upload,
    desc: 'Add your own music files',
    descZh: '上传本地音乐文件',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'works',
    label: 'My Works',
    labelZh: '作品管理',
    icon: FolderOpen,
    desc: 'View & manage your creations',
    descZh: '查看管理你的创作',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const STRUCTURES = [
  { id: 'verse-chorus', label: 'Verse-Chorus', labelZh: '主副歌' },
  { id: 'verse-bridge', label: 'Verse-Bridge', labelZh: '主歌-桥段' },
  { id: 'aaba', label: 'AABA', labelZh: 'AABA经典' },
  { id: 'through', label: 'Through-composed', labelZh: '通谱体' },
];

const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', labelZh: '钢琴', emoji: '🎹' },
  { id: 'guitar', label: 'Guitar', labelZh: '吉他', emoji: '🎸' },
  { id: 'synth', label: 'Synth', labelZh: '合成器', emoji: '🎛️' },
  { id: 'strings', label: 'Strings', labelZh: '弦乐', emoji: '🎻' },
  { id: 'drums', label: 'Drums', labelZh: '鼓', emoji: '🥁' },
  { id: 'bass', label: 'Bass', labelZh: '贝斯', emoji: '🎸' },
];

export const CreationStudio: React.FC<CreationStudioProps> = ({
  isOpen,
  onClose,
  onCreateTrack,
  playlist,
  currentTrackIndex: _currentTrackIndex,
  onHaptic,
  user: _user,
  starPower: _starPower = 0,
}) => {
  const { locale } = useI18n();
  const [activeMode, setActiveMode] = useState<CreationMode | null>(null);

  const [quickTheme, setQuickTheme] = useState<AILyricsTheme>('happy');
  const [quickPrompt, setQuickPrompt] = useState('');
  const [quickGenerating, setQuickGenerating] = useState(false);
  const [quickLyrics, setQuickLyrics] = useState<string[] | null>(null);
  const [quickComposing, setQuickComposing] = useState<'idle' | 'lyrics' | 'composing' | 'done'>('idle');

  const [masterTheme, setMasterTheme] = useState<AILyricsTheme>('calm');
  const [masterKeywords, setMasterKeywords] = useState<string[]>([]);
  const [masterKwInput, setMasterKwInput] = useState('');
  const [masterLineCount, setMasterLineCount] = useState(10);
  const [masterStructure, setMasterStructure] = useState('verse-chorus');
  const [masterInstruments, setMasterInstruments] = useState<string[]>(['piano', 'strings']);
  const [masterTempo, setMasterTempo] = useState(100);
  const [masterGenerating, setMasterGenerating] = useState(false);
  const [masterLyrics, setMasterLyrics] = useState<string[] | null>(null);
  const [masterComposing, setMasterComposing] = useState<'idle' | 'lyrics' | 'composing' | 'done'>('idle');

  const [remixSourceTrack, setRemixSourceTrack] = useState<number | null>(null);
  const [remixTargetTheme, setRemixTargetTheme] = useState<AILyricsTheme>('energetic');
  const [remixGenerating, setRemixGenerating] = useState(false);
  const [remixResult, setRemixResult] = useState<string[] | null>(null);
  const [remixComposing, setRemixComposing] = useState<'idle' | 'lyrics' | 'composing' | 'done'>('idle');

  const works = useFamilySettingsSlice((s) => s.musicWorks);
  const [copied, handleCopyLyrics] = useCopyFeedback<string>();

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('董小姐');
  const [uploading, setUploading] = useState(false);

  const saveWork = useCallback((work: CreatedWork) => {
    useFamilySettingsSlice.getState().addMusicWork(work);
  }, []);

  const deleteWork = useCallback((id: string) => {
    useFamilySettingsSlice.getState().removeMusicWork(id);
  }, []);

  const generateDemoLyrics = useCallback((theme: AILyricsTheme, keywords: string[], lines: number): string[] => {
    const templates: Record<AILyricsTheme, string[][]> = {
      happy: [
        ['阳光洒落在窗台', '心情像花儿盛开', '每一个瞬间都精彩', '幸福就在这一刻'],
        ['笑声在风中飘扬', '快乐不需要伪装', '生活本该这样', '充满希望的光芒'],
        ['美好的一天开始了', '所有的烦恼都忘掉', '让快乐在心中跳跃', '这就是幸福的味道'],
      ],
      sad: [
        ['夜深人静的时候', '思念在心中游走', '那些逝去的温柔', '再也回不到从前'],
        ['雨滴落在窗前', '模糊了我的视线', '那些未说出口的话', '化作无声的叹息'],
        ['回忆像潮水涌来', '淹没了我所有的期待', '曾经以为的永远', '不过是瞬间的尘埃'],
      ],
      energetic: [
        ['燃烧吧我的青春', '追逐梦想的脚步', '没有什么能阻挡', '我前进的方向'],
        ['热血在心中沸腾', '挑战每一个不可能', '这就是我的态度', '永不言败的精神'],
        ['奔跑在追梦的路上', '汗水是最好的勋章', '每一次跌倒都更坚强', '这就是青春的力量'],
      ],
      calm: [
        ['静静地坐在窗前', '看着云朵慢慢飘远', '时间仿佛停止了', '这一刻如此安详'],
        ['微风轻抚过脸庞', '带来远方的花香', '闭上眼感受这宁静', '心灵找到了归宿'],
        ['星空下的夜晚', '一切都那么安详', '让思绪随风飘荡', '找到内心的方向'],
      ],
      love: [
        ['遇见你的那一刻', '心跳突然加速了', '原来这就是爱情', '最美的意外'],
        ['你的笑容像阳光', '照亮我所有的迷茫', '想牵着你的手', '走过每一个春夏秋冬'],
        ['不需要华丽的语言', '只想陪在你身边', '每一个平凡的日子', '因为有你而特别'],
      ],
    };

    const themeTemplates = templates[theme];
    const result: string[] = [];
    
    for (let i = 0; i < lines; i++) {
      const template = themeTemplates[i % themeTemplates.length];
      const line = template[i % template.length];
      
      let modifiedLine = line;
      if (keywords.length > 0) {
        const keyword = keywords[i % keywords.length];
        if (i % 3 === 0 && !line.includes(keyword)) {
          modifiedLine = line.replace(/我的|你的|这/, keyword);
        }
      }
      result.push(modifiedLine);
    }
    
    return result;
  }, []);

  const handleQuickCreate = useCallback(async () => {
    setQuickGenerating(true);
    setQuickComposing('lyrics');
    onHaptic?.('medium');

    try {
      await new Promise(r => setTimeout(r, 1500));
      
      const keywords = quickPrompt ? quickPrompt.split(/[,，\s]+/).filter(Boolean) : [];
      const lyrics = generateDemoLyrics(quickTheme, keywords, 8);
      
      setQuickLyrics(lyrics);
      setQuickComposing('composing');
      
      await new Promise(r => setTimeout(r, 1000));
      
      const newTrack: MusicTrack = {
        id: `created-${Date.now()}`,
        title: `${quickTheme} · Quick Song`,
        artist: '董小姐',
        album: 'AI Creation',
        duration: 180,
        audioUrl: '',
        coverUrl: getRandomPhoto(),
        emotion: quickTheme,
        genre: 'AI生成',
        year: new Date().getFullYear(),
      };

      saveWork({
        id: newTrack.id,
        title: newTrack.title,
        theme: quickTheme,
        lyrics,
        createdAt: Date.now(),
        mode: 'quick',
      });

      setQuickComposing('done');
      onHaptic?.('success');
      
      setTimeout(() => {
        setQuickComposing('idle');
        setActiveMode(null);
      }, 2000);
    } catch (err) {
      console.error('Quick create failed:', err);
      setQuickComposing('idle');
    } finally {
      setQuickGenerating(false);
    }
  }, [quickTheme, quickPrompt, generateDemoLyrics, onHaptic, saveWork]);

  const handleMasterCreate = useCallback(async () => {
    setMasterGenerating(true);
    setMasterComposing('lyrics');
    onHaptic?.('medium');

    try {
      await new Promise(r => setTimeout(r, 2000));
      
      const lyrics = generateDemoLyrics(masterTheme, masterKeywords, masterLineCount);
      setMasterLyrics(lyrics);
      setMasterComposing('composing');
      
      await new Promise(r => setTimeout(r, 1500));

      saveWork({
        id: `master-${Date.now()}`,
        title: `${masterTheme} · Master Work`,
        theme: masterTheme,
        lyrics,
        createdAt: Date.now(),
        mode: 'master',
      });

      setMasterComposing('done');
      onHaptic?.('success');
      
      setTimeout(() => {
        setMasterComposing('idle');
        setActiveMode(null);
      }, 2000);
    } catch (err) {
      console.error('Master create failed:', err);
      setMasterComposing('idle');
    } finally {
      setMasterGenerating(false);
    }
  }, [masterTheme, masterKeywords, masterLineCount, generateDemoLyrics, onHaptic, saveWork]);

  const handleRemix = useCallback(async () => {
    if (remixSourceTrack === null) {return;}
    setRemixGenerating(true);
    setRemixComposing('lyrics');
    onHaptic?.('medium');

    try {
      await new Promise(r => setTimeout(r, 1500));
      
      const lyrics = generateDemoLyrics(remixTargetTheme, [], 8);
      setRemixResult(lyrics);
      setRemixComposing('composing');
      
      await new Promise(r => setTimeout(r, 1000));

      const sourceTrack = playlist[remixSourceTrack];
      saveWork({
        id: `remix-${Date.now()}`,
        title: `Remix · ${sourceTrack.title}`,
        theme: remixTargetTheme,
        lyrics,
        createdAt: Date.now(),
        mode: 'remix',
      });

      setRemixComposing('done');
      onHaptic?.('success');
      
      setTimeout(() => {
        setRemixComposing('idle');
        setActiveMode(null);
      }, 2000);
    } catch (err) {
      console.error('Remix failed:', err);
      setRemixComposing('idle');
    } finally {
      setRemixGenerating(false);
    }
  }, [remixSourceTrack, remixTargetTheme, playlist, generateDemoLyrics, onHaptic, saveWork]);

  const handleFileUpload = useCallback(async () => {
    if (!uploadFile) {return;}
    setUploading(true);
    onHaptic?.('medium');

    try {
      const audioUrl = URL.createObjectURL(uploadFile);
      
      const newTrack: MusicTrack = {
        id: `upload-${Date.now()}`,
        title: uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''),
        artist: uploadArtist,
        album: '本地音乐',
        duration: 180,
        audioUrl,
        coverUrl: getRandomPhoto(),
        emotion: 'neutral',
        genre: '本地',
        year: new Date().getFullYear(),
      };

      onCreateTrack?.(newTrack);

      saveWork({
        id: newTrack.id,
        title: newTrack.title,
        theme: 'neutral',
        lyrics: [],
        createdAt: Date.now(),
        mode: 'upload',
        audioUrl,
      });

      onHaptic?.('success');
      setUploadFile(null);
      setUploadTitle('');
      setActiveMode(null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, [uploadFile, uploadTitle, uploadArtist, onCreateTrack, onHaptic, saveWork]);


  const addMasterKeyword = useCallback(() => {
    const trimmed = masterKwInput.trim();
    if (trimmed && masterKeywords.length < 8 && !masterKeywords.includes(trimmed)) {
      setMasterKeywords(prev => [...prev, trimmed]);
      setMasterKwInput('');
    }
  }, [masterKwInput, masterKeywords]);

  const toggleInstrument = useCallback((id: string) => {
    setMasterInstruments(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const formatDate = useCallback((ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, []);

  const getProgressLabel = (stage: string) => {
    if (stage === 'lyrics') {return locale === 'zh-CN' ? 'AI 写词中...' : 'Generating lyrics...';}
    if (stage === 'composing') {return locale === 'zh-CN' ? '编曲设计中...' : 'Composing...';}
    if (stage === 'done') {return locale === 'zh-CN' ? '创作完成!' : 'Complete!';}
    return '';
  };

  const currentTheme = THEMES.find(t => t.id === quickTheme) || THEMES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[92vh] bg-[#0B1030]/98 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl flex flex-col shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl md:border md:max-h-[88vh]"
          >
            <div className="flex items-center justify-between p-5 pb-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                  <Wand2 className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight">
                    {locale === 'zh-CN' ? 'AI 创作工坊' : 'AI Creation Studio'}
                  </h3>
                  <p className="text-white/30 text-xs">
                    {locale === 'zh-CN' ? '董小姐音乐空间' : 'D-Music Studio'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: 'none' }}>
              {!activeMode ? (
                <div className="grid grid-cols-2 gap-3">
                  {MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <motion.button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-white font-medium text-sm mb-1">
                          {locale === 'zh-CN' ? mode.labelZh : mode.label}
                        </h4>
                        <p className="text-white/30 text-xs leading-relaxed">
                          {locale === 'zh-CN' ? mode.descZh : mode.desc}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveMode(null)}
                    className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {locale === 'zh-CN' ? '返回' : 'Back'}
                  </button>

                  {activeMode === 'quick' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '选择主题' : 'Select Theme'}
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {THEMES.map((theme) => {
                            const Icon = theme.icon;
                            const isActive = quickTheme === theme.id;
                            return (
                              <button
                                key={theme.id}
                                onClick={() => setQuickTheme(theme.id)}
                                className={clsx(
                                  'p-3 rounded-xl border transition-all text-center',
                                  isActive
                                    ? `bg-gradient-to-br ${theme.bg} border-white/15 shadow-lg`
                                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                                )}
                              >
                                <Icon className={clsx('w-5 h-5 mx-auto mb-1', isActive ? theme.color : 'text-white/30')} />
                                <p className={clsx('text-[10px]', isActive ? 'text-white/80' : 'text-white/30')}>
                                  {locale === 'zh-CN' ? theme.labelZh : theme.label}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '关键词提示 (可选)' : 'Keywords (optional)'}
                        </p>
                        <input
                          type="text"
                          value={quickPrompt}
                          onChange={(e) => setQuickPrompt(e.target.value)}
                          placeholder={locale === 'zh-CN' ? '输入关键词，用逗号分隔...' : 'Enter keywords, comma separated...'}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <motion.button
                        onClick={handleQuickCreate}
                        disabled={quickGenerating}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-opacity"
                      >
                        {quickGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {getProgressLabel(quickComposing)}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {locale === 'zh-CN' ? '一键创作' : 'Create Now'}
                          </>
                        )}
                      </motion.button>

                      {quickLyrics && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/50">
                              {locale === 'zh-CN' ? '生成的歌词' : 'Generated Lyrics'}
                            </p>
                            <button
                              onClick={() => handleCopyLyrics(quickLyrics.join('\n'), 'quick')}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-white/50 hover:text-white/80"
                            >
                              {copied === 'quick' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              {copied === 'quick' ? (locale === 'zh-CN' ? '已复制' : 'Copied') : (locale === 'zh-CN' ? '复制' : 'Copy')}
                            </button>
                          </div>
                          <div className={clsx('rounded-xl border p-4 bg-gradient-to-br', currentTheme.bg, 'border-white/[0.08]')}>
                            {quickLyrics.map((line, i) => (
                              <p key={i} className="text-sm text-white/80 leading-relaxed mb-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {activeMode === 'master' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '选择主题' : 'Select Theme'}
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {THEMES.map((theme) => {
                            const Icon = theme.icon;
                            const isActive = masterTheme === theme.id;
                            return (
                              <button
                                key={theme.id}
                                onClick={() => setMasterTheme(theme.id)}
                                className={clsx(
                                  'p-3 rounded-xl border transition-all text-center',
                                  isActive
                                    ? `bg-gradient-to-br ${theme.bg} border-white/15 shadow-lg`
                                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                                )}
                              >
                                <Icon className={clsx('w-5 h-5 mx-auto mb-1', isActive ? theme.color : 'text-white/30')} />
                                <p className={clsx('text-[10px]', isActive ? 'text-white/80' : 'text-white/30')}>
                                  {locale === 'zh-CN' ? theme.labelZh : theme.label}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '关键词' : 'Keywords'} ({masterKeywords.length}/8)
                        </p>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={masterKwInput}
                            onChange={(e) => setMasterKwInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addMasterKeyword()}
                            placeholder={locale === 'zh-CN' ? '输入关键词...' : 'Enter keyword...'}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50"
                          />
                          <button
                            onClick={addMasterKeyword}
                            disabled={!masterKwInput.trim() || masterKeywords.length >= 8}
                            aria-label="Add keyword"
                            className="p-2 rounded-lg bg-white/5 border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {masterKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {masterKeywords.map((kw) => (
                              <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300">
                                {kw}
                                <button onClick={() => setMasterKeywords(prev => prev.filter(k => k !== kw))} aria-label={`Remove ${kw}`} className="text-purple-400/60 hover:text-purple-300">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '歌词行数' : 'Line Count'}
                        </p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setMasterLineCount(Math.max(4, masterLineCount - 2))} aria-label="Decrease line count" className="p-2 rounded-lg bg-white/5 border border-white/[0.08] text-white/60 hover:text-white transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-center text-2xl font-bold text-white font-mono">{masterLineCount}</span>
                          <button onClick={() => setMasterLineCount(Math.min(20, masterLineCount + 2))} aria-label="Increase line count" className="p-2 rounded-lg bg-white/5 border border-white/[0.08] text-white/60 hover:text-white transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '歌曲结构' : 'Song Structure'}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {STRUCTURES.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setMasterStructure(s.id)}
                              className={clsx(
                                'p-2.5 rounded-lg border text-xs transition-all',
                                masterStructure === s.id
                                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                                  : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05]'
                              )}
                            >
                              {locale === 'zh-CN' ? s.labelZh : s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '乐器选择' : 'Instruments'}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {INSTRUMENTS.map((inst) => (
                            <button
                              key={inst.id}
                              onClick={() => toggleInstrument(inst.id)}
                              className={clsx(
                                'p-2.5 rounded-lg border text-xs transition-all flex items-center gap-2',
                                masterInstruments.includes(inst.id)
                                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                                  : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05]'
                              )}
                            >
                              <span>{inst.emoji}</span>
                              {locale === 'zh-CN' ? inst.labelZh : inst.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '节拍速度' : 'Tempo'}: {masterTempo} BPM
                        </p>
                        <input
                          type="range"
                          min="60"
                          max="180"
                          aria-label="Tempo"
                          value={masterTempo}
                          onChange={(e) => setMasterTempo(parseInt(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer"
                        />
                      </div>

                      <motion.button
                        onClick={handleMasterCreate}
                        disabled={masterGenerating}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-opacity"
                      >
                        {masterGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {getProgressLabel(masterComposing)}
                          </>
                        ) : (
                          <>
                            <Settings2 className="w-4 h-4" />
                            {locale === 'zh-CN' ? '大师创作' : 'Create Masterpiece'}
                          </>
                        )}
                      </motion.button>

                      {masterLyrics && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/50">
                              {locale === 'zh-CN' ? '生成的歌词' : 'Generated Lyrics'}
                            </p>
                            <button
                              onClick={() => handleCopyLyrics(masterLyrics.join('\n'), 'master')}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-white/50 hover:text-white/80"
                            >
                              {copied === 'master' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              {copied === 'master' ? (locale === 'zh-CN' ? '已复制' : 'Copied') : (locale === 'zh-CN' ? '复制' : 'Copy')}
                            </button>
                          </div>
                          <div className="rounded-xl border p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-white/[0.08]">
                            {masterLyrics.map((line, i) => (
                              <p key={i} className="text-sm text-white/80 leading-relaxed mb-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {activeMode === 'remix' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '选择源曲目' : 'Select Source Track'}
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border border-white/[0.06] p-2">
                          {(playlist.length > 0 ? playlist : MUSIC_LIBRARY.slice(0, 10)).map((track, i) => (
                            <button
                              key={track.id}
                              onClick={() => setRemixSourceTrack(i)}
                              className={clsx(
                                'w-full p-2 rounded-lg flex items-center gap-3 text-left transition-all',
                                remixSourceTrack === i
                                  ? 'bg-orange-500/20 border border-orange-500/30'
                                  : 'bg-white/[0.02] hover:bg-white/[0.05]'
                              )}
                            >
                              <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                <Music className="w-4 h-4 text-orange-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{track.title}</p>
                                <p className="text-white/30 text-[10px]">{track.artist}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '目标风格' : 'Target Style'}
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {THEMES.map((theme) => {
                            const Icon = theme.icon;
                            const isActive = remixTargetTheme === theme.id;
                            return (
                              <button
                                key={theme.id}
                                onClick={() => setRemixTargetTheme(theme.id)}
                                className={clsx(
                                  'p-3 rounded-xl border transition-all text-center',
                                  isActive
                                    ? `bg-gradient-to-br ${theme.bg} border-white/15 shadow-lg`
                                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                                )}
                              >
                                <Icon className={clsx('w-5 h-5 mx-auto mb-1', isActive ? theme.color : 'text-white/30')} />
                                <p className={clsx('text-[10px]', isActive ? 'text-white/80' : 'text-white/30')}>
                                  {locale === 'zh-CN' ? theme.labelZh : theme.label}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <motion.button
                        onClick={handleRemix}
                        disabled={remixGenerating || remixSourceTrack === null}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-opacity"
                      >
                        {remixGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {getProgressLabel(remixComposing)}
                          </>
                        ) : (
                          <>
                            <Layers className="w-4 h-4" />
                            {locale === 'zh-CN' ? '开始改编' : 'Start Remix'}
                          </>
                        )}
                      </motion.button>

                      {remixResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/50">
                              {locale === 'zh-CN' ? '改编歌词' : 'Remix Lyrics'}
                            </p>
                            <button
                              onClick={() => handleCopyLyrics(remixResult.join('\n'), 'remix')}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-white/50 hover:text-white/80"
                            >
                              {copied === 'remix' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              {copied === 'remix' ? (locale === 'zh-CN' ? '已复制' : 'Copied') : (locale === 'zh-CN' ? '复制' : 'Copy')}
                            </button>
                          </div>
                          <div className="rounded-xl border p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-white/[0.08]">
                            {remixResult.map((line, i) => (
                              <p key={i} className="text-sm text-white/80 leading-relaxed mb-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {activeMode === 'upload' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '选择音乐文件' : 'Select Music File'}
                        </p>
                        <label className="block w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer text-center">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          {uploadFile ? (
                            <div className="flex items-center justify-center gap-3">
                              <Disc3 className="w-8 h-8 text-purple-400" />
                              <div className="text-left">
                                <p className="text-white text-sm font-medium">{uploadFile.name}</p>
                                <p className="text-white/30 text-xs">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                              <p className="text-white/50 text-sm">{locale === 'zh-CN' ? '点击上传 MP3/WAV 文件' : 'Click to upload MP3/WAV'}</p>
                            </>
                          )}
                        </label>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '歌曲标题' : 'Song Title'}
                        </p>
                        <input
                          type="text"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder={locale === 'zh-CN' ? '输入歌曲标题...' : 'Enter song title...'}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                          {locale === 'zh-CN' ? '艺术家' : 'Artist'}
                        </p>
                        <input
                          type="text"
                          value={uploadArtist}
                          onChange={(e) => setUploadArtist(e.target.value)}
                          placeholder={locale === 'zh-CN' ? '输入艺术家名称...' : 'Enter artist name...'}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <motion.button
                        onClick={handleFileUpload}
                        disabled={!uploadFile || uploading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-opacity"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {locale === 'zh-CN' ? '上传中...' : 'Uploading...'}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {locale === 'zh-CN' ? '添加到播放列表' : 'Add to Playlist'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}

                  {activeMode === 'works' && (
                    <div className="space-y-3">
                      {works.length === 0 ? (
                        <div className="text-center py-8">
                          <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40 text-sm">{locale === 'zh-CN' ? '暂无作品' : 'No works yet'}</p>
                          <p className="text-white/20 text-xs mt-1">{locale === 'zh-CN' ? '开始创作你的第一首歌曲' : 'Create your first song'}</p>
                        </div>
                      ) : (
                        works.map((work) => (
                          <div key={work.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm font-medium truncate">{work.title}</h4>
                                <p className="text-white/30 text-xs mt-0.5">
                                  {work.theme} · {formatDate(work.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {work.lyrics.length > 0 && (
                                  <button
                                    onClick={() => handleCopyLyrics(work.lyrics.join('\n'), work.id)}
                                    className="p-1.5 rounded text-white/30 hover:text-white/60 hover:bg-white/5"
                                  >
                                    {copied === work.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteWork(work.id)}
                                  aria-label="Delete work"
                                  className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-white/5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {work.lyrics.length > 0 && (
                              <div className="mt-2 p-2 rounded bg-white/[0.02] text-xs text-white/50 leading-relaxed line-clamp-2">
                                {work.lyrics.slice(0, 2).join(' · ')}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreationStudio;
