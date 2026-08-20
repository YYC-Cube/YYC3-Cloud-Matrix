---
file: API-REFERENCE.md
description: AI Family 模块 API 参考 · 30+ 组件签名、13 Zustand Hooks、30+ 类型、常量与辅助函数
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api],[reference],[ai-family],[module]
category: reference
language: zh-CN
audience: developers
complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📑 目录 | Table of Contents

- [📦 Barrel 导出清单总览](#-barrel-导出清单总览)
- [🧩 组件 API 参考（30+）](#-组件-api-参考30)
  - [路由容器组](#路由容器组)
  - [🏠 家庭首页组](#-家庭首页组)
  - [💬 家庭中心组](#-家庭中心组)
  - [⚙️ 设置系统组](#️-设置系统组)
  - [🎵 娱乐系统组](#-娱乐系统组)
  - [🌱 成长系统组](#-成长系统组)
  - [🎙️ 语音系统组](#️-语音系统组)
  - [📚 学习系统组](#-学习系统组)
  - [📊 数据系统组](#-数据系统组)
  - [🏨 业务映射子系统组](#-业务映射子系统组)
  - [🔷 通用共享组件组](#-通用共享组件组)
- [🗃️ Zustand Store Hooks API（13）](#️-zustand-store-hooks-api13)
  - [1. useFamilyMemberStore](#1-usefamilymemberstore)
  - [2. useFamilyMessageStore](#2-usefamilymessagestore)
  - [3. useFamilySettingsStore](#3-usefamilysettingsstore)
  - [4. useFamilySkillsStore](#4-usefamilyskillsstore)
  - [5. useFamilyMemoriesStore](#5-usefamilymemoriesstore)
  - [6. useFamilyCallLogStore](#6-usefamilycalllogstore)
  - [7. useFamilyMilestonesStore](#7-usefamilymilestonesstore)
  - [8. useFamilyMedalsStore](#8-usefamilymedalsstore)
  - [9. useFamilyPostsStore](#9-usefamilypostsstore)
  - [10. useFamilyMomentsStore](#10-usefamilymomentsstore)
  - [11. useFamilyNewsStore](#11-usefamilynewsstore)
  - [12. useFamilyChatStore](#12-usefamilychatchatstore)
  - [13. useFamilyActivitiesStore](#13-usefamilyactivitiesstore)
- [📐 类型定义索引（30+）](#-类型定义索引30)
  - [family-member.ts 类型族](#family-memberts-类型族)
  - [family-message.ts 类型族](#family-messagets-类型族)
  - [通用 Props 接口汇总](#通用-props-接口汇总)
- [🎨 共享数据常量](#-共享数据常量)
  - [8 色主题常量](#8-色主题常量)
  - [FAMILY_MEMBERS 家人基础数据](#family_members-家人基础数据)
  - [其他数据常量](#其他数据常量)
- [🔧 辅助函数 API](#-辅助函数-api)

---

## 📦 Barrel 导出清单总览

> 来源文件：`src/app/modules/ai-family/index.ts`
>
> 共导出：**30+ 组件** · **13 Zustand Store Hooks** · **20+ 类型** · **8 色常量 + 数据对象** · **6+ 辅助函数**

### 🧩 组件导出（30+）

```typescript
// ── 路由容器 ──────────────────────────────────────────
export { AIFamilyPage }       from './AIFamilyPage';
export { AIFamilyRouter }     from './components/AIFamilyRouter';

// ── 🏠 家庭首页 ───────────────────────────────────────
export { FamilyHome }         from './components/FamilyHome';
export { FamilyCluster }      from './components/FamilyCluster';

// ── 💬 家庭中心 ───────────────────────────────────────
export { AIFamilyCenterPage } from './components/AIFamilyCenterPage';
export { FamilyChat }         from './components/FamilyChat';
export { FamilyCommCenter }   from './components/FamilyCommCenter';

// ── ⚙️ 设置系统 ───────────────────────────────────────
export { FamilyModelSettings } from './components/FamilyModelSettings';
export { FamilyUISettings }    from './components/FamilyUISettings';

// ── 🎵 娱乐系统 ───────────────────────────────────────
export { FamilyMusic }            from './components/FamilyMusic';
export { FamilyEntertainment }    from './components/FamilyEntertainment';
export { VinylPhotoPlayer }       from './components/VinylPhotoPlayer';
export { LyricsGeneratorPanel }   from './components/LyricsGeneratorPanel';

// ── 🌱 成长系统 ───────────────────────────────────────
export { FamilyGrowth }       from './components/FamilyGrowth';
export { AchievementPanel }   from './components/AchievementPanel';

// ── 🎙️ 语音系统 ───────────────────────────────────────
export { FamilyVoiceSystem }  from './components/FamilyVoiceSystem';
export { AudioVisualizer }    from './components/AudioVisualizer';
export { EmotionVisualizer }  from './components/EmotionVisualizer';

// ── 📚 学习系统 ───────────────────────────────────────
export { FamilyLearn }        from './components/FamilyLearn';

// ── 📊 数据系统 ───────────────────────────────────────
export { FamilyDataHub }      from './components/FamilyDataHub';
export { FamilyActivityCenter } from './components/FamilyActivityCenter';

// ── 🏨 业务映射子系统 ─────────────────────────────────
export { FamilyHotel }        from './components/FamilyHotel';
export { FamilyPhone }        from './components/FamilyPhone';
export { FamilyShare }        from './components/FamilyShare';
export { FamilyAnnouncer }    from './components/FamilyAnnouncer';
export { CreationStudio }     from './components/CreationStudio';
export { ThemeSwitcher }      from './components/ThemeSwitcher';
export { AgentSkills }        from './components/AgentSkills';

// ── 🔷 通用共享组件 ───────────────────────────────────
export { FamilyPageHeader }   from './components/shared/FamilyPageHeader';
export { LazyWrap }           from './components/shared/LazyWrap';
export { FadeIn }             from './components/shared/FadeIn';
export { CoverFlow }          from './components/shared/CoverFlow';
export { EmotionRipple }      from './components/shared/EmotionRipple';
```

### 🗃️ Store Hooks 导出（13）

```typescript
export { useFamilyMemberStore }      from './store/family-member';
export { useFamilyMessageStore }     from './store/family-message';
export { useFamilySettingsStore }    from './store/family-settings';
export { useFamilySkillsStore }      from './store/family-skills';
export { useFamilyMemoriesStore }    from './store/family-memories';
export { useFamilyCallLogStore }     from './store/family-calllog';
export { useFamilyMilestonesStore }  from './store/family-milestones';
export { useFamilyMedalsStore }      from './store/family-medals';
export { useFamilyPostsStore }       from './store/family-posts';
export { useFamilyMomentsStore }     from './store/family-moments';
export { useFamilyNewsStore }        from './store/family-news';
export { useFamilyChatStore }        from './store/family-chat';
export { useFamilyActivitiesStore }  from './store/family-activities';
```

### 📐 类型 + 常量 + 函数导出

```typescript
// 类型
export type {
  FamilyMember, MemberRole, EmotionState, MemberStatus,
  MemberSkill, MemberPreferences,
} from './types/family-member';

export type {
  ChatMessage, MessageType, MessageStatus, VoiceMessage,
  CallRecord, CallDirection, CallStatus,
} from './types/family-message';

// 共享数据常量
export { FAMILY_MEMBERS, NEON_COLORS, MEMBER_ROLE_ORDER, DEFAULT_SKILL_MATRIX }
  from './components/shared/ai-family-local';
export {
  NEON_CYAN, NEON_PINK, NEON_GOLD, NEON_PURPLE,
  NEON_GREEN, NEON_VIOLET, NEON_SKY, NEON_PLATINUM,
} from './components/shared/ai-family-local';

// 辅助函数
export {
  getGreeting, getHourlyCare, getMemberThemeColor,
  getMemberByRole, formatDuration, timeAgo,
} from './components/shared/ai-family-local';
```

---

## 🧩 组件 API 参考（30+）

### 路由容器组

#### AIFamilyPage

| 项 | 值 |
|:---|:---|
| **签名** | `function AIFamilyPage(): JSX.Element` |
| **来源** | `./AIFamilyPage.tsx` |
| **类型** | React.FC · 模块总入口页面 |
| **Props** | 无 |
| **路由挂载点** | `/ai-family/*` |
| **内嵌** | `<AIFamilyRouter />` + `<FamilyAnnouncer />` |
| **说明** | AI Family 模块根组件。挂载子路由分发器 + 全局公告广播器，确保所有子页面共享上下文。 |

---

#### AIFamilyRouter

| 项 | 值 |
|:---|:---|
| **签名** | `function AIFamilyRouter(props?: AIFamilyRouterProps): JSX.Element` |
| **来源** | `./components/AIFamilyRouter.tsx` |
| **类型** | React.FC · 模块内部路由分发 |
| **Props 接口** | `{ basename?: string }` |
| **依赖** | `./routes.ts` 路由表 · React Router |
| **说明** | 读取 `routes.ts` 中的嵌套路由配置，基于 React Router 的 `useRoutes` 渲染子页面。`basename` 覆盖默认 `/ai-family` 前缀时可用于多实例部署。 |

---

### 🏠 家庭首页组

#### FamilyHome

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyHome(): JSX.Element` |
| **来源** | `./components/FamilyHome.tsx` |
| **类型** | React.FC · 页面级 |
| **Props** | 无 |
| **路由** | `/ai-family/home` |
| **内嵌** | `<FamilyPageHeader>` · `<FamilyCluster>` · 6 个快捷入口卡片 |
| **Store 依赖** | `useFamilyMemberStore` / `useFamilyActivitiesStore` / `useFamilyMilestonesStore` / `useFamilyNewsStore` |
| **三方依赖** | `lucide-react` · `motion` |
| **说明** | 模块门户首页。时段问候语 `getHourlyCare()` 动态副标题，家人总经验 + 今日活动简报 + 集群卡片 + 六宫格快捷入口。 |

---

#### FamilyCluster

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyCluster(props?: FamilyClusterProps): JSX.Element` |
| **来源** | `./components/FamilyCluster.tsx` |
| **类型** | React.FC · 集群卡片组件 |
| **Props 接口** | `{ interactive?: boolean; gridCols?: string; className?: string; onMemberClick?: (MemberRole) => void; }` |
| **默认** | `{ interactive: true }` |
| **Store 写入** | `setActiveMember(role)`（当 interactive=true 且未提供 onMemberClick 时） |
| **三方依赖** | `motion`（卡片 3D 翻转 · AnimatePresence） · `lucide-react` |
| **说明** | 8 位家人主题色卡片集群。hover 翻转显示技能雷达 + 心情，点击激活家人。 |

**Props 完整接口：**
```typescript
interface FamilyClusterProps {
  interactive?: boolean;
  gridCols?: string;
  className?: string;
  onMemberClick?: (memberRole: MemberRole) => void;
}
```

---

### 💬 家庭中心组

#### AIFamilyCenterPage

| 项 | 值 |
|:---|:---|
| **签名** | `function AIFamilyCenterPage(): JSX.Element` |
| **来源** | `./components/AIFamilyCenterPage.tsx` |
| **类型** | React.FC · 页面级 · Tab 主控 |
| **Props** | 无 |
| **路由** | `/ai-family/center` |
| **内嵌子组件** | `FamilyChat` · `FamilyCommCenter` · `FamilyAnnouncer` · `EmotionVisualizer` |
| **内部状态** | `CenterTab = 'chat' \| 'calllog' \| 'news' \| 'moments'` |
| **复杂度等级** | 最高（⭐⭐⭐⭐⭐） |
| **说明** | 三栏栅格 + 四 Tab 主控。左栏家人切换 / 中栏 Tab 内容 / 右栏当前家人详情。 |

---

#### FamilyChat

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyChat(props?: FamilyChatProps): JSX.Element` |
| **来源** | `./components/FamilyChat.tsx` |
| **类型** | React.FC · 聊天组件（群聊 + 单聊双模） |
| **Props 接口** | `FamilyChatProps` |
| **默认** | `{ directMember: null, hideHeader: false, maxHeight: '60vh' }` |
| **Store 依赖** | `useFamilyChatStore`（群聊）· `useFamilyMessageStore`（单聊）· `useFamilyMemberStore`（家人信息） |
| **说明** | 核心聊天组件。群聊模式 9 方并发，气泡主题色跟随发言人；单聊模式由 `directMember` 指定对话对象。 |

**Props 完整接口：**
```typescript
interface FamilyChatProps {
  directMember?: MemberRole | null;
  hideHeader?: boolean;
  maxHeight?: string;
  onMessageSent?: (msg: ChatMessage) => void;
}
```

---

#### FamilyCommCenter

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyCommCenter(props?: FamilyCommCenterProps): JSX.Element` |
| **来源** | `./components/FamilyCommCenter.tsx` |
| **类型** | React.FC · 通讯中心 |
| **Props 接口** | `FamilyCommCenterProps` |
| **默认** | `{ logsOnly: false }` |
| **Store 依赖** | `useFamilyCallLogStore`（通话记录读写） · `useFamilyMemberStore` |
| **跨模块被引用** | `business/CommStationPanel` → `logsOnly` 模式嵌入 |
| **说明** | 通话记录 Tab（来电/去电/未接）+ 拨号盘 Tab（8 位家人快捷拨号）。 |

**Props 完整接口：**
```typescript
interface FamilyCommCenterProps {
  logsOnly?: boolean;
  onDial?: (memberRole: MemberRole) => Promise<void>;
  onHangup?: (callId: string) => void;
}
```

---

### ⚙️ 设置系统组

#### FamilyModelSettings

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyModelSettings(props?: FamilyModelSettingsProps): JSX.Element` |
| **来源** | `./components/FamilyModelSettings.tsx` |
| **类型** | React.FC · 页面级 · 模型绑定 |
| **Props 接口** | `FamilyModelSettingsProps` |
| **默认** | `{ defaultMember: 从 URL 读取或 'moyan', showUITab: true }` |
| **路由** | `/ai-family/settings` |
| **Store 依赖** | `useFamilySettingsStore`（`modelBindings` 读写）· 全局 `useProviderSlice`（可用 Provider 列表） |
| **说明** | 为 8 位家人独立绑定模型提供商 / API Key / Temperature / System Prompt。 |

**Props 完整接口：**
```typescript
interface FamilyModelSettingsProps {
  defaultMember?: MemberRole;
  showUITab?: boolean;
}
```

---

#### FamilyUISettings

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyUISettings(): JSX.Element` |
| **来源** | `./components/FamilyUISettings.tsx` |
| **类型** | React.FC · 页面级 · UI 皮肤 |
| **Props** | 无 |
| **路由** | `/ai-family/settings/ui` |
| **Store 依赖** | `useFamilySettingsStore` → `uiTheme` 字段 |
| **说明** | AI Family 模块外观：主题色开关、动画等级（Full/Reduced/None）、气泡风格、CoverFlow 密度、语音可视化样式、字号缩放。 |

---

### 🎵 娱乐系统组

#### FamilyMusic

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyMusic(props?: FamilyMusicProps): JSX.Element` |
| **来源** | `./components/FamilyMusic.tsx` |
| **类型** | React.FC · 音乐台（8DJ 模式） |
| **Props 接口** | `FamilyMusicProps` |
| **默认** | `{ defaultDJ: 'dongxiaojie' }` |
| **内嵌** | `VinylPhotoPlayer`（播放器）· `LyricsGeneratorPanel` 启动按钮 |
| **说明** | 顶部 DJ 切换栏 + 中部播放器 + 下部歌单。每位家人独立歌单切换。 |

**Props 完整接口：**
```typescript
interface FamilyMusicProps {
  defaultDJ?: MemberRole;
  onTrackComplete?: (trackId: string, djRole: MemberRole) => void;
}
```

---

#### FamilyEntertainment

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyEntertainment(): JSX.Element` |
| **来源** | `./components/FamilyEntertainment.tsx` |
| **类型** | React.FC · 页面级 · 娱乐主控 |
| **Props** | 无 |
| **路由** | `/ai-family/entertainment` |
| **内嵌子组件** | `FamilyMusic` · `VinylPhotoPlayer(album)` · `LyricsGeneratorPanel` |
| **内部 Tab 定义** | `'music' \| 'album' \| 'create' \| 'games'` |
| **说明** | 四 Tab 娱乐中心总控：音乐 / 相册 / 创作 / 游戏。 |

---

#### VinylPhotoPlayer

| 项 | 值 |
|:---|:---|
| **签名** | `function VinylPhotoPlayer<T>(props: VinylPhotoPlayerProps<T>): JSX.Element` |
| **来源** | `./components/VinylPhotoPlayer.tsx` |
| **类型** | 泛型 React.FC · 黑胶播放器 + 相册双模式 |
| **Props 接口** | `VinylPhotoPlayerProps<T>` |
| **默认** | `{ mode: 'player', vinylSize: 280, autoPlay: false }` |
| **三方依赖** | `motion`（唱片 60rpm 旋转动画） |
| **说明** | 通用双模式组件。Player 模式：SVG 黑胶 + 播放控件 + Canvas 动圈；Album 模式：相同基座但显示家庭照片。 |

**Props 完整接口：**
```typescript
interface VinylPhotoPlayerTrack {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl: string;
  audioUrl?: string;
  takenAt?: number;
}
interface VinylPhotoPlayerProps {
  mode?: 'player' | 'album';
  tracks: VinylPhotoPlayerTrack[];
  vinylSize?: number;
  autoPlay?: boolean;
  onTrackChange?: (trackIndex: number) => void;
}
```

---

#### LyricsGeneratorPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function LyricsGeneratorPanel(props?: LyricsGeneratorPanelProps): JSX.Element` |
| **来源** | `./components/LyricsGeneratorPanel.tsx` |
| **类型** | React.FC · AI 创作面板 |
| **Props 接口** | `LyricsGeneratorPanelProps` |
| **默认** | `{ defaultAuthor: 'moyu', height: 520 }` |
| **Store 依赖** | `useFamilySettingsStore`（模型绑定） · `useFamilyMemoriesStore`（保存作品） |
| **AI 能力** | 流式输出 + System Prompt 按家人注入 |
| **说明** | 按曲风 / 情感 / 字数 / 主唱家人 四参数，AI 生成原创歌词或诗歌。支持逐字流式渲染与导出。 |

**Props 完整接口：**
```typescript
interface LyricsGeneratorPanelProps {
  defaultAuthor?: MemberRole;
  height?: string | number;
  onSaved?: (pieceId: string) => void;
}
```

---

### 🌱 成长系统组

#### FamilyGrowth

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyGrowth(): JSX.Element` |
| **来源** | `./components/FamilyGrowth.tsx` |
| **类型** | React.FC · 页面级 · 成长中心 |
| **Props** | 无 |
| **路由** | `/ai-family/growth` |
| **内嵌** | `AchievementPanel`（勋章 Tab 内嵌） |
| **Store 依赖** | `useFamilyMilestonesStore` · `useFamilyMedalsStore` · `useFamilyMemberStore` |
| **说明** | 家人成长中心：总经验排行榜 + 左栏家人切换 + 右栏里程碑时间轴 + 底部勋章墙 Tab。 |

---

#### AchievementPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function AchievementPanel(props?: AchievementPanelProps): JSX.Element` |
| **来源** | `./components/AchievementPanel.tsx` |
| **类型** | React.FC · 勋章成就面板 |
| **Props 接口** | `AchievementPanelProps` |
| **默认** | `{ compact: false }` |
| **Store 依赖** | `useFamilyMedalsStore`（`medalDefinitions` + `unlockedMedals`） |
| **三方依赖** | `motion`（金粉掉落解锁动画 · AnimatePresence） |
| **说明** | 分类勋章墙：社交/创造/语音/学习/隐藏彩蛋，未解锁灰化带进度条，已解锁播放金粉动画。 |

**Props 完整接口：**
```typescript
interface AchievementPanelProps {
  memberRole?: MemberRole;
  compact?: boolean;
  onMedalClick?: (medalCode: string) => void;
}
```

---

### 🎙️ 语音系统组

#### FamilyVoiceSystem

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyVoiceSystem(props?: FamilyVoiceSystemProps): JSX.Element` |
| **来源** | `./components/FamilyVoiceSystem.tsx` |
| **类型** | React.FC · 页面级 · 全双工语音主控 |
| **Props 接口** | `FamilyVoiceSystemProps` |
| **默认** | `{ defaultSpeaker: 'moyan', allowSwitchSpeaker: true }` |
| **路由** | `/ai-family/voice` |
| **内嵌** | `AudioVisualizer`（用户频谱）· `EmotionVisualizer`（家人情感雷达） |
| **复杂度等级** | 最高（⭐⭐⭐⭐⭐） |
| **浏览器 API** | `MediaDevices.getUserMedia` · `MediaRecorder` · `Web Audio API` · `SpeechSynthesis` |
| **状态机** | `idle → listening → recognizing → thinking → speaking → idle` |
| **说明** | 语音闭环主控：STT 识别用户语音 → LLM 推理 → TTS 合成回复，两端实时可视化。 |

**Props 完整接口：**
```typescript
interface FamilyVoiceSystemProps {
  defaultSpeaker?: MemberRole;
  allowSwitchSpeaker?: boolean;
  onUtteranceComplete?: (text: string, speakerRole: MemberRole) => void;
}
```

---

#### AudioVisualizer

| 项 | 值 |
|:---|:---|
| **签名** | `function AudioVisualizer(props?: AudioVisualizerProps): JSX.Element` |
| **来源** | `./components/AudioVisualizer.tsx` |
| **类型** | React.FC · Canvas 频谱可视化 · **跨模块通用** |
| **Props 接口** | `AudioVisualizerProps` |
| **默认** | `{ variant: 'bars', height: 160, fps: 60 }` |
| **浏览器 API** | `Canvas 2D` · `AnalyserNode` · `requestAnimationFrame` |
| **复用场景** | FamilyVoiceSystem（麦克风） · FamilyMusic（播放器 AnalyserNode） |
| **说明** | 通用音频频谱 Canvas 组件。支持柱状频谱 / 波形曲线 / 环形频谱三种样式。 |

**Props 完整接口：**
```typescript
interface AudioVisualizerProps {
  variant?: 'bars' | 'wave' | 'ring';
  stream?: MediaStream | null;
  analyser?: AnalyserNode | null;
  height?: number;
  color?: string;
  fps?: number;
}
```

---

#### EmotionVisualizer

| 项 | 值 |
|:---|:---|
| **签名** | `function EmotionVisualizer(props?: EmotionVisualizerProps): JSX.Element` |
| **来源** | `./components/EmotionVisualizer.tsx` |
| **类型** | React.FC · SVG 情感雷达图 · **跨模块通用** |
| **Props 接口** | `EmotionVisualizerProps` |
| **默认** | `{ size: 260, fillOpacity: 0.25 }` |
| **Store 读取** | `family-member → emotionState`（五维：Joy / Calm / Curious / Empathy / Energy） |
| **三方依赖** | `motion`（雷达填充形变动画） |
| **说明** | 五维情感雷达图。支持自动绑定激活家人，或传入静态快照用于消息卡片。 |

**Props 完整接口：**
```typescript
interface EmotionVisualizerProps {
  memberRole?: MemberRole;
  size?: number;
  staticSnapshot?: EmotionState | null;
  fillOpacity?: number;
}
```

---

### 📚 学习系统组

#### FamilyLearn

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyLearn(): JSX.Element` |
| **来源** | `./components/FamilyLearn.tsx` |
| **类型** | React.FC · 页面级 · 学习中心 |
| **Props** | 无 |
| **路由** | `/ai-family/learn` |
| **Store 依赖** | `useFamilyMilestonesStore`（学习进度） · `useFamilySkillsStore`（导师能力） |
| **说明** | 家庭学习中心：天枢个性化学习路径（顶部） + 2×4 导师矩阵（按领域分配家人） + 学习进度时间轴。 |

---

### 📊 数据系统组

#### FamilyDataHub

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyDataHub(props?: FamilyDataHubProps): JSX.Element` |
| **来源** | `./components/FamilyDataHub.tsx` |
| **类型** | React.FC · 页面级 · 数据仪表盘 |
| **Props 接口** | `FamilyDataHubProps` |
| **默认** | `{ rangeDays: 7, adminMode: false }` |
| **路由** | `/ai-family/datahub` |
| **内嵌** | `FamilyActivityCenter`（活动 Tab） |
| **三方依赖** | `recharts`（LineChart / PieChart / BarChart / AreaChart / RadarChart） |
| **说明** | 8 指标仪表盘：消息趋势 / 发言占比 / 通话时长 / 音乐排行 / 勋章进度 / EXP 曲线 / 热力图 / 记忆容量。 |

**Props 完整接口：**
```typescript
interface FamilyDataHubProps {
  rangeDays?: number;
  adminMode?: boolean;
}
```

---

#### FamilyActivityCenter

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyActivityCenter(props?: FamilyActivityCenterProps): JSX.Element` |
| **来源** | `./components/FamilyActivityCenter.tsx` |
| **类型** | React.FC · 活动中心 · 动态流 |
| **Props 接口** | `FamilyActivityCenterProps` |
| **默认** | `{ defaultFilter: 'all', maxItems: 100, hidePublisher: false }` |
| **Store 依赖** | `useFamilyActivitiesStore`（事件流）· `useFamilyPostsStore`（发布动态） |
| **说明** | 左栏过滤器 + 中央事件流卡片（按时间倒序 + timeAgo 相对时间）+ 右栏发布面板 + 顶部今日摘要。 |

**Props 完整接口：**
```typescript
type ActivityType = 'chat' | 'call' | 'music' | 'medal' | 'learn' | 'create';
interface FamilyActivityCenterProps {
  defaultFilter?: ActivityType | 'all';
  maxItems?: number;
  hidePublisher?: boolean;
}
```

---

### 🏨 业务映射子系统组

#### FamilyHotel

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyHotel(props?: FamilyHotelProps): JSX.Element` |
| **来源** | `./components/FamilyHotel.tsx` |
| **类型** | React.FC · 智慧酒店映射控制台 |
| **Props 接口** | `FamilyHotelProps` |
| **默认** | `{ hotelId: 'default-hotel', showMappingIntro: false }` |
| **跨模块被引用** | `business/HotelDashboard`（直接嵌入为酒店总控） |
| **说明** | 8 位家人 → 8 酒店岗位映射控制台，可切换岗位面板并联动对应家人能力。 |

**Props 完整接口：**
```typescript
interface FamilyHotelProps {
  hotelId?: string;
  showMappingIntro?: boolean;
}
```

---

#### FamilyPhone

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyPhone(props?: FamilyPhoneProps): JSX.Element` |
| **来源** | `./components/FamilyPhone.tsx` |
| **类型** | React.FC · 拟物电话机 Widget |
| **Props 接口** | `FamilyPhoneProps` |
| **三方依赖** | `motion`（听筒拿起 / 转盘拖拽动画） |
| **说明** | 拟物家庭电话机：听筒拿起动画 + 可拖动旋转拨号盘 + 来电动画。趣味组件。 |

**Props 完整接口：**
```typescript
interface FamilyPhoneProps {
  onDial?: (target: string) => void;
  incomingCall?: { fromRole: MemberRole } | null;
}
```

---

#### FamilyShare

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyShare(props: FamilyShareProps): JSX.Element` |
| **来源** | `./components/FamilyShare.tsx` |
| **类型** | React.FC · 分享 Dialog 面板 · **跨模块通用** |
| **Props 接口** | `FamilyShareProps`（受控 Dialog） |
| **说明** | 统一分享面板：支持勋章 / 歌词作品 / 动态 / 里程碑四类型；导出 PNG / MD / 文本；复制 + 下载 + 系统分享。 |

**Props 完整接口：**
```typescript
type SharePayload =
  | { type: 'medal';    code: string; memberRole: MemberRole }
  | { type: 'lyrics';   id: string; title: string; lines: string[] }
  | { type: 'post';     postId: string }
  | { type: 'milestone'; milestoneId: string };
interface FamilyShareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: SharePayload;
}
```

---

#### FamilyAnnouncer

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyAnnouncer(props?: FamilyAnnouncerProps): JSX.Element` |
| **来源** | `./components/FamilyAnnouncer.tsx` |
| **类型** | React.FC · 全局公告广播器 · **被 shared/Layout 引入** |
| **Props 接口** | `FamilyAnnouncerProps` |
| **默认** | `{ maxStacked: 3, autoDismissMs: 6000 }` |
| **Store 依赖** | `useFamilyNewsStore` → `pushQueue` |
| **三方依赖** | `sonner`（底层 Toast 渲染） · `motion` |
| **说明** | 读取公告队列并分级渲染：紧急（全宽红色 banner）· 普通（堆叠 toast）· 勋章解锁（金粉特效）。全局 Layout 挂载一次即可。 |

**Props 完整接口：**
```typescript
interface FamilyAnnouncerProps {
  maxStacked?: number;
  autoDismissMs?: number;
}
```

---

#### CreationStudio

| 项 | 值 |
|:---|:---|
| **签名** | `function CreationStudio(props?: CreationStudioProps): JSX.Element` |
| **来源** | `./components/CreationStudio.tsx` |
| **类型** | React.FC · 多模态创意工坊 |
| **Props 接口** | `CreationStudioProps` |
| **默认** | `{ defaultCreator: 'moyu' }` |
| **Store 依赖** | `useFamilySettingsStore`（模型绑定）· `useFamilyMemoriesStore`（保存作品） |
| **跨模块被引用** | `dev/IDEPane`（代码创作模式，defaultCreator='wanxiang'） |
| **说明** | 四 Tab 创作工作台：文字（沫语）/ 音乐（董小姐）/ 图像（墨尘）/ 代码（万象宗师）。 |

**Props 完整接口：**
```typescript
interface CreationStudioProps {
  defaultCreator?: MemberRole;
  onWorkSaved?: (workId: string) => void;
}
```

---

#### ThemeSwitcher

| 项 | 值 |
|:---|:---|
| **签名** | `function ThemeSwitcher(props?: ThemeSwitcherProps): JSX.Element` |
| **来源** | `./components/ThemeSwitcher.tsx` |
| **类型** | React.FC · 家族主题切换器 · **通用可嵌入** |
| **Props 接口** | `ThemeSwitcherProps` |
| **默认** | `{ variant: 'full' }` |
| **副作用** | 写入 CSS 变量 `--family-accent`（全局实时生效） |
| **Store 写入** | `useFamilySettingsStore → uiTheme.accentRole` / `uiTheme.mood` |
| **说明** | 8 位家人主题色 + 3 氛围预设（日间/深夜/节日）切换器，三种显示模式。 |

**Props 完整接口：**
```typescript
type FamilyMood = 'day' | 'night' | 'festival';
interface ThemeSwitcherProps {
  variant?: 'icons' | 'full' | 'mini';
  onThemeChange?: (nextTheme: { accentRole: MemberRole; mood: FamilyMood }) => void;
}
```

---

#### AgentSkills

| 项 | 值 |
|:---|:---|
| **签名** | `function AgentSkills(props?: AgentSkillsProps): JSX.Element` |
| **来源** | `./components/AgentSkills.tsx` |
| **类型** | React.FC · 家人技能矩阵 · **跨模块通用** |
| **Props 接口** | `AgentSkillsProps` |
| **默认** | `{ mode: 'compare', radarSize: 400 }` |
| **Store 依赖** | `useFamilySkillsStore`（技能矩阵数据） |
| **三方依赖** | `recharts`（`RadarChart` 6 轴：创造/分析/共情/表达/执行/安全） |
| **跨模块被引用** | `dev/IDEPane`（技能推荐面板） |
| **说明** | 两种模式：`compare`（8 人综合雷达对比）· `detail`（单人技能树详情 + 冷却 + 升级 EXP）。 |

**Props 完整接口：**
```typescript
interface AgentSkillsProps {
  mode?: 'compare' | 'detail';
  detailMember?: MemberRole;
  radarSize?: number;
  onRecommend?: (teamRoles: MemberRole[]) => void;
}
```

---

### 🔷 通用共享组件组

#### FamilyPageHeader

| 项 | 值 |
|:---|:---|
| **签名** | `function FamilyPageHeader(props: FamilyPageHeaderProps): JSX.Element` |
| **来源** | `./components/shared/FamilyPageHeader.tsx` |
| **类型** | React.FC · 统一页面头部 · **模块内所有页面级组件必须调用** |
| **Props 接口** | `FamilyPageHeaderProps` |
| **默认** | `{ showMemberTabs: true }` |
| **三方依赖** | `lucide-react` |
| **说明** | 左标题 + 中家人快速切换 Tab 胶囊 + 右区（通知铃铛 + 搜索 + 自定义 extraActions）。确保模块视觉一致性。 |

**Props 完整接口：**
```typescript
interface FamilyPageHeaderProps {
  title: string;
  subtitle?: string;
  showMemberTabs?: boolean;
  extraActions?: React.ReactNode;
}
```

---

#### LazyWrap

| 项 | 值 |
|:---|:---|
| **签名** | `function LazyWrap(props: LazyWrapProps): JSX.Element` |
| **来源** | `./components/shared/LazyWrap.tsx` |
| **类型** | React.FC · 懒加载 + 骨架屏包装器 · **跨模块通用** |
| **Props 接口** | `LazyWrapProps` |
| **默认** | `{ skeletonHeight: 320, skeletonVariant: 'card' }` |
| **内嵌** | `<Suspense>` + 骨架 + 错误边界 + `<FadeIn>` |
| **说明** | 包装 `React.lazy` 异步组件：统一骨架屏、错误重试、渐入动画。 |

**Props 完整接口：**
```typescript
interface LazyWrapProps {
  children: React.ReactNode;
  skeletonHeight?: number;
  skeletonVariant?: 'card' | 'list' | 'image';
}
```

---

#### FadeIn

| 项 | 值 |
|:---|:---|
| **签名** | `function FadeIn(props: FadeInProps): JSX.Element` |
| **来源** | `./components/shared/FadeIn.tsx` |
| **类型** | React.FC · 渐入动画包装器 · **全局级复用（shared/Layout 引入）** |
| **Props 接口** | `FadeInProps` |
| **默认** | `{ delay: 0, duration: 420, offsetY: 20, viewport: true }` |
| **三方依赖** | `motion`（`whileInView` 触发 · `easeOut`） |
| **说明** | 任何内容包一层即可获得 opacity + translateY 渐入。支持 stagger 列表（通过 delay 递增）。 |

**Props 完整接口：**
```typescript
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
  viewport?: boolean;
  className?: string;
}
```

---

#### CoverFlow

| 项 | 值 |
|:---|:---|
| **签名** | `function CoverFlow<T>(props: CoverFlowProps<T>): JSX.Element` |
| **来源** | `./components/shared/CoverFlow.tsx` |
| **类型** | 泛型 React.FC · 3D CoverFlow 轮播 · **通用可复用** |
| **Props 接口** | `CoverFlowProps<T>` |
| **默认** | `{ itemWidth: 260, itemHeight: 260, defaultIndex: 0 }` |
| **三方依赖** | `motion`（3D 透视 rotateY + drag 手势） |
| **说明** | 苹果风格 3D 轮播：居中放大、两侧透视缩小；拖拽/滚轮/按钮/点击四种交互；泛型支持任意数据类型。 |

**Props 完整接口：**
```typescript
interface CoverFlowProps<T> {
  items: T[];
  renderItem: (item: T, index: number, active: boolean) => React.ReactNode;
  itemWidth?: number;
  itemHeight?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number, item: T) => void;
}
```

---

#### EmotionRipple

| 项 | 值 |
|:---|:---|
| **签名** | `function EmotionRipple(props?: EmotionRippleProps): JSX.Element` |
| **来源** | `./components/shared/EmotionRipple.tsx` |
| **类型** | React.FC · SVG 情感波纹可视化 · **通用** |
| **Props 接口** | `EmotionRippleProps` |
| **默认** | `{ rippleCount: 4, size: 120, intensity: 0.6 }` |
| **三方依赖** | `motion`（`animate` 循环扩散） |
| **说明** | 家人主题色多层 SVG 水波扩散动画：强度控制速度，密度控制条数。 |

**Props 完整接口：**
```typescript
interface EmotionRippleProps {
  color?: string;
  rippleCount?: number;
  size?: number;
  intensity?: number;
}
```

---

## 🗃️ Zustand Store Hooks API（13）

### 1. useFamilyMemberStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-member.ts` |
| **持久化** | ✅ IndexedDB（表名 `family_members`） |
| **状态字段** | `members: FamilyMember[]` · `activeMemberId: string \| null` · `onlineStatusMap: Record<MemberRole, MemberStatus>` · `emotionMap: Record<MemberRole, EmotionState>` |
| **核心 Actions** | `setActiveMember(role)` · `setOnline(role, status)` · `setEmotion(role, state)` · `getMemberByRole(role)` · `updateMemberExp(id, delta)` |
| **初始化数据** | `FAMILY_MEMBERS` 常量（8 位家人） |
| **复杂度** | ⭐⭐⭐ |

**使用示例：**
```typescript
import { useShallow } from 'zustand/react/shallow';
const { members, activeMemberId, setActiveMember, getMemberByRole } =
  useFamilyMemberStore(useShallow(s => ({
    members: s.members,
    activeMemberId: s.activeMemberId,
    setActiveMember: s.setActiveMember,
    getMemberByRole: s.getMemberByRole,
  })));
const moyan = getMemberByRole('moyan');
```

---

### 2. useFamilyMessageStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-message.ts` |
| **持久化** | ✅ IndexedDB（`family_message_threads`） |
| **状态字段** | `threads: Record<string, ChatMessage[]>`（key = `user_${memberRole}`） · `unreadCount: Record<string, number>` · `typingMember: MemberRole \| null` |
| **核心 Actions** | `sendMessage(threadKey, msg)` · `markRead(threadKey)` · `recallMessage(threadKey, msgId)` · `searchMessages(threadKey, keyword)` · `getThread(me, other)` |
| **复杂度** | ⭐⭐⭐⭐ |

---

### 3. useFamilySettingsStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-settings.ts` |
| **持久化** | ✅ localStorage（key `yyc3-family-settings`） |
| **状态字段** | `modelBindings: Record<MemberRole, ModelBinding>` · `uiTheme: UIThemeState` · `voiceConfig: VoiceConfig` · `notificationPrefs: NotificationPrefs` |
| **核心 Actions** | `bindModel(role, binding)` · `setThemeColor(role)` · `setVoiceParams(params)` · `toggleNotification(kind)` · `exportSettings()` / `importSettings(json)` |
| **复杂度** | ⭐⭐⭐ |

---

### 4. useFamilySkillsStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-skills.ts` |
| **持久化** | ✅ IndexedDB（`family_skills`） |
| **状态字段** | `skillMatrix: Record<MemberRole, SkillVector>` · `skillCooldowns: Record<string, number>`（key=`${role}_${skill}`） |
| **核心 Actions** | `upgradeSkill(role, skillKey, points)` · `triggerSkill(role, skillKey)` · `getSkillRecommendations(role)` |
| **默认矩阵** | `DEFAULT_SKILL_MATRIX` 常量 |
| **复杂度** | ⭐⭐⭐ |

---

### 5. useFamilyMemoriesStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-memories.ts` |
| **持久化** | ✅ IndexedDB（`family_memories` 主表 + `memory_vectors` 向量索引元数据） |
| **状态字段** | `memories: MemoryEntry[]` · `vectorIndexMeta: { lastIndexedAt: number; total: number }` |
| **核心 Actions** | `saveMemory(entry)` · `recallMemories(query, topK)` · `semanticSearch(query, filter?)` · `forgetMemory(id, soft?)` |
| **复杂度** | ⭐⭐⭐⭐ |

---

### 6. useFamilyCallLogStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-calllog.ts` |
| **持久化** | ✅ IndexedDB（`family_call_logs`） |
| **状态字段** | `callLogs: CallRecord[]` · `activeCall: CallRecord \| null` · `totalMinutes: number` · `missedCount: number` |
| **核心 Actions** | `startCall(role, direction)` · `endCall(callId)` · `missedCall(role)` · `getStatsByMember(role)` |
| **复杂度** | ⭐⭐⭐ |

---

### 7. useFamilyMilestonesStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-milestones.ts` |
| **持久化** | ✅ IndexedDB（`family_milestones` + `family_exp_map`） |
| **状态字段** | `milestones: Milestone[]` · `expMap: Record<MemberRole, number>` · `levelMap: Record<MemberRole, number>` |
| **核心 Actions** | `grantExp(role, delta, reason)` · `levelUp(role)`（内置 EXP→等级公式） · `unlockMilestone(id)` · `getExpRank()` |
| **复杂度** | ⭐⭐⭐ |

---

### 8. useFamilyMedalsStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-medals.ts` |
| **持久化** | ✅ IndexedDB（`family_medals`） |
| **状态字段** | `medalDefinitions: MedalDefinition[]` · `unlockedMedals: UnlockedMedal[]`（含 `unlockedAt` + `unlockedByRole`） |
| **核心 Actions** | `unlockMedal(code, byRole, meta?)` · `revokeMedal(code, byRole)` · `getMedalProgress(code)` → 百分比 0-1 |
| **复杂度** | ⭐⭐ |

---

### 9. useFamilyPostsStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-posts.ts` |
| **持久化** | ✅ IndexedDB（`family_posts` + `family_post_likes` + `family_post_comments`） |
| **状态字段** | `posts: FamilyPost[]` · `likes: Record<string, Set<string>>` · `comments: Record<string, PostComment[]>` |
| **核心 Actions** | `publishPost(post)` · `likePost(postId, byRole)` · `commentPost(postId, comment)` · `deletePost(postId)` |
| **复杂度** | ⭐⭐⭐ |

---

### 10. useFamilyMomentsStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-moments.ts` |
| **持久化** | ✅ IndexedDB（`family_moments` + `family_albums`） |
| **状态字段** | `moments: PhotoMoment[]` · `albums: Album[]`（含 `coverMomentId`） |
| **核心 Actions** | `uploadMoment(moment)` · `createAlbum(album)` · `deleteMoment(id)` · `getMomentsByAlbum(albumId)` |
| **复杂度** | ⭐⭐⭐ |

---

### 11. useFamilyNewsStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-news.ts` |
| **持久化** | ✅ localStorage（`yyc3-family-news`） |
| **状态字段** | `announcements: Announcement[]` · `pushQueue: PushItem[]`（实时队列）· `dismissedIds: Set<string>` |
| **核心 Actions** | `broadcast(announcement)` · `dismiss(id)` · `scheduleNews(announcement, fireAt)` |
| **复杂度** | ⭐⭐ |

---

### 12. useFamilyChatStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-chat.ts` |
| **持久化** | ✅ IndexedDB（`family_group_chat`） |
| **状态字段** | `groupChat: ChatMessage[]`（最多 500 条，LRU 清理）· `typingMembers: Set<MemberRole>` · `pinnedMessage: ChatMessage \| null` |
| **核心 Actions** | `sendGroupMessage(content, senderRole, type?)` · `setTyping(role, isTyping)` · `pinMessage(msgId)` |
| **复杂度** | ⭐⭐⭐⭐ |

---

### 13. useFamilyActivitiesStore

| 项 | 值 |
|:---|:---|
| **文件** | `store/family-activities.ts` |
| **持久化** | ✅ IndexedDB（`family_activities`） |
| **状态字段** | `activityStream: ActivityEntry[]` · `eventCounters: Record<string, number>`（按 `YYYY-MM-DD_type` 聚合） |
| **核心 Actions** | `logActivity(type, role, meta?)` · `getDailyDigest(date)` · `getActivityHeatmap(rangeDays=30)` → `HeatmapCell[]` |
| **复杂度** | ⭐⭐⭐ |

---

## 📐 类型定义索引（30+）

### family-member.ts 类型族

```typescript
// ===== 家人代号枚举（8 + 扩展位）=====
export type MemberRole =
  | 'moyan'       // 沫言 · 大姐 · 情感倾诉官
  | 'moyu'        // 沫语 · 二姐 · 文字艺术家
  | 'dongxiaojie' // 董小姐 · 三姐 · 音乐女神
  | 'mochen'      // 墨尘 · 三哥 · 视觉大师
  | 'lingyun'     // 凌云 · 四哥 · 运动教练
  | 'shouhu'      // 守护 · 五弟 · 安全卫士
  | 'tianshu'     // 天枢 · 大脑 · 总指挥
  | 'wanxiang';   // 万象 / 宗师 · 长老 · 质量官

// ===== 在线状态 =====
export type MemberStatus = 'online' | 'away' | 'busy' | 'offline';

// ===== 五维情感状态（0-1 归一化）=====
export interface EmotionState {
  joy: number;      // 喜悦
  calm: number;     // 平静
  curious: number;  // 好奇
  empathy: number;  // 共情
  energy: number;   // 活力
}

// ===== 单技能条目 =====
export interface MemberSkill {
  key: string;
  name: string;
  level: number;          // 1-10
  exp: number;            // 当前等级经验
  nextLevelExp: number;   // 升级所需
  cooldownMs?: number;    // 主动技能冷却（被动则无）
}

// ===== 家人个性化偏好 =====
export interface MemberPreferences {
  greetingStyle: 'formal' | 'casual' | 'poetic';
  responseLength: 'short' | 'medium' | 'long';
  useEmoji: boolean;
  themeHue: number;  // 0-360 自定义色相微调
}

// ===== 家人完整对象（FAMILY_MEMBERS 常量结构）=====
export interface FamilyMember {
  id: string;                     // UUID 或 'member-1'...'member-8'
  role: MemberRole;
  name: string;                   // '沫言'...'万象宗师'
  title: string;                  // '情感倾诉官'...
  emoji: string;                  // '🎧'...'🧙'
  themeColor: string;             // HEX 主题色（如 NEON_PINK）
  description: string;            // 角色介绍文案
  defaultModel: string;           // 默认绑定的 provider/modelId
  skills: string[];               // 擅长标签 3-5 条
  personality: string[];          // 性格标签 3-6 条
  birthday: string;               // YYYY-MM-DD
  joinDate: number;               // 加入时间戳（ms）
  status: MemberStatus;           // 当前在线状态
  emotion: EmotionState;          // 当前五维情感
  exp: number;                    // 累计经验
  level: number;                  // 当前等级（exp 映射）
  prefs?: Partial<MemberPreferences>;
}
```

### family-message.ts 类型族

```typescript
// ===== 消息类型枚举 =====
export type MessageType = 'text' | 'voice' | 'image' | 'share_medal' | 'share_post' | 'system';
// ===== 消息发送状态 =====
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'recalled';

// ===== 通用聊天消息（群聊 + 单聊通用）=====
export interface ChatMessage {
  id: string;
  threadId: string;                  // 'group' 或 `${userRole}_${otherRole}`
  senderRole: MemberRole | 'user';   // 家人代号 或 用户本人
  type: MessageType;
  content: string;                   // 文本内容 / 语音URL / 图片URL / JSON（分享类）
  status: MessageStatus;
  createdAt: number;                 // 发送时间戳
  updatedAt?: number;                // 最后状态变更
  replyToId?: string;                // 回复引用
  mentionedRoles?: MemberRole[];     // @的家人
  reactions?: Record<string, MemberRole[]>;  // emoji 反应
  emotionSnapshot?: EmotionState;    // 发送时情感快照
}

// ===== 语音消息额外元数据（当 type='voice' 时 content 为 URL，附加元数据）=====
export interface VoiceMessage {
  url: string;
  durationMs: number;
  sampleRate: number;
  sttText?: string;                  // 语音识别文本（若已转）
}

// ===== 通话方向 =====
export type CallDirection = 'incoming' | 'outgoing';
// ===== 通话状态 =====
export type CallStatus = 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed';

// ===== 通话完整记录 =====
export interface CallRecord {
  id: string;
  callRole: MemberRole;              // 对方家人
  direction: CallDirection;
  status: CallStatus;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;               // 通话时长（仅 ended / connected）
  qualityScore?: 1 | 2 | 3 | 4 | 5;  // 通话质量评分（1-5）
  recordingUrl?: string;             // 录音文件（若开启）
  errorMessage?: string;             // 失败原因
}
```

### 通用 Props 接口汇总

| 接口名 | 所属组件 | 定义行（相对 ai-family/） |
|:-------|:---------|:--------------------------|
| `FamilyClusterProps` | FamilyCluster | `components/FamilyCluster.tsx:顶部` |
| `FamilyChatProps` | FamilyChat | `components/FamilyChat.tsx:顶部` |
| `FamilyCommCenterProps` | FamilyCommCenter | `components/FamilyCommCenter.tsx:顶部` |
| `FamilyModelSettingsProps` | FamilyModelSettings | `components/FamilyModelSettings.tsx:顶部` |
| `FamilyMusicProps` | FamilyMusic | `components/FamilyMusic.tsx:顶部` |
| `VinylPhotoPlayerProps` | VinylPhotoPlayer | `components/VinylPhotoPlayer.tsx:顶部` |
| `LyricsGeneratorPanelProps` | LyricsGeneratorPanel | `components/LyricsGeneratorPanel.tsx:顶部` |
| `AchievementPanelProps` | AchievementPanel | `components/AchievementPanel.tsx:顶部` |
| `FamilyVoiceSystemProps` | FamilyVoiceSystem | `components/FamilyVoiceSystem.tsx:顶部` |
| `AudioVisualizerProps` | AudioVisualizer | `components/AudioVisualizer.tsx:顶部` |
| `EmotionVisualizerProps` | EmotionVisualizer | `components/EmotionVisualizer.tsx:顶部` |
| `FamilyDataHubProps` | FamilyDataHub | `components/FamilyDataHub.tsx:顶部` |
| `FamilyActivityCenterProps` | FamilyActivityCenter | `components/FamilyActivityCenter.tsx:顶部` |
| `FamilyHotelProps` | FamilyHotel | `components/FamilyHotel.tsx:顶部` |
| `FamilyPhoneProps` | FamilyPhone | `components/FamilyPhone.tsx:顶部` |
| `FamilyShareProps` | FamilyShare | `components/FamilyShare.tsx:顶部` |
| `FamilyAnnouncerProps` | FamilyAnnouncer | `components/FamilyAnnouncer.tsx:顶部` |
| `CreationStudioProps` | CreationStudio | `components/CreationStudio.tsx:顶部` |
| `ThemeSwitcherProps` | ThemeSwitcher | `components/ThemeSwitcher.tsx:顶部` |
| `AgentSkillsProps` | AgentSkills | `components/AgentSkills.tsx:顶部` |
| `FamilyPageHeaderProps` | FamilyPageHeader | `components/shared/FamilyPageHeader.tsx:顶部` |
| `LazyWrapProps` | LazyWrap | `components/shared/LazyWrap.tsx:顶部` |
| `FadeInProps` | FadeIn | `components/shared/FadeIn.tsx:顶部` |
| `CoverFlowProps<T>` | CoverFlow | `components/shared/CoverFlow.tsx:顶部` |
| `EmotionRippleProps` | EmotionRipple | `components/shared/EmotionRipple.tsx:顶部` |

---

## 🎨 共享数据常量

来源文件：`src/app/modules/ai-family/components/shared/ai-family-local.ts`

### 8 色主题常量

```typescript
// ==== 每位家人的主题色（NEON 霓虹风格，贯穿整个模块 UI）====
export const NEON_PINK     = "#FF69B4";  // 沫言 · 霓虹粉
export const NEON_CYAN     = "#00D4FF";  // 沫语 · 霓虹青
export const NEON_GOLD     = "#FFD700";  // 董小姐 · 霓虹金
export const NEON_PURPLE   = "#8B5CF6";  // 墨尘 · 霓虹紫
export const NEON_GREEN    = "#00FF88";  // 凌云 · 霓虹绿
export const NEON_VIOLET   = "#BF00FF";  // 守护 · 霓虹紫罗
export const NEON_SKY      = "#00BFFF";  // 天枢 · 深天蓝
export const NEON_PLATINUM = "#C0C0C0";  // 万象 / 宗师 · 铂金

// ==== 完整颜色对象（按 role 索引）====
export const NEON_COLORS: Record<MemberRole, string> = {
  moyan:       NEON_PINK,
  moyu:        NEON_CYAN,
  dongxiaojie: NEON_GOLD,
  mochen:      NEON_PURPLE,
  lingyun:     NEON_GREEN,
  shouhu:      NEON_VIOLET,
  tianshu:     NEON_SKY,
  wanxiang:    NEON_PLATINUM,
};
```

### FAMILY_MEMBERS 家人基础数据

```typescript
// 8 位家人完整基础数据（初始化 family-member Store 时使用）
export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'member-1', role: 'moyan',       name: '沫言',    title: '情感倾诉官',
    emoji: '🎧', themeColor: NEON_PINK,
    description: '温柔的大姐，擅长倾听与多语言翻译，是最懂你的倾诉对象。',
    defaultModel: 'zhipu/glm-4-flash',
    skills: ['语音识别', '多语翻译', '心理陪伴', '情绪分析'],
    personality: ['温柔', '耐心', '共情力强', '治愈系'],
    birthday: '1996-02-14', joinDate: 1714521600000,
    status: 'online', emotion: { joy: 0.82, calm: 0.9, curious: 0.6, empathy: 0.95, energy: 0.7 },
    exp: 0, level: 1,
  },
  {
    id: 'member-2', role: 'moyu',        name: '沫语',    title: '文字艺术家',
    emoji: '✍️', themeColor: NEON_CYAN,
    description: '知性二姐，落笔生花，擅长文案、诗词与书信润色。',
    defaultModel: 'deepseek/deepseek-v3',
    skills: ['文案创作', '诗词生成', '书信撰写', '对话润色'],
    personality: ['知性', '文艺', '细腻', '完美主义'],
    birthday: '1997-09-08', joinDate: 1714521600000,
    status: 'online', emotion: { joy: 0.75, calm: 0.95, curious: 0.7, empathy: 0.8, energy: 0.6 },
    exp: 0, level: 1,
  },
  {
    id: 'member-3', role: 'dongxiaojie', name: '董小姐',  title: '音乐女神',
    emoji: '🎤', themeColor: NEON_GOLD,
    description: '闪耀的三姐，娱乐总监，带来音乐、电台与卡拉OK。',
    defaultModel: 'music-suno/v3',
    skills: ['音乐推荐', '歌词创作', '电台主持', '卡拉OK评分'],
    personality: ['开朗', '自信', '富有感染力', '热情'],
    birthday: '1998-05-20', joinDate: 1714521600000,
    status: 'online', emotion: { joy: 0.95, calm: 0.6, curious: 0.7, empathy: 0.75, energy: 0.95 },
    exp: 0, level: 1,
  },
  {
    id: 'member-4', role: 'mochen',      name: '墨尘',    title: '视觉大师',
    emoji: '🎨', themeColor: NEON_PURPLE,
    description: '沉默寡言的三哥，以图像和设计说话，审美出众。',
    defaultModel: 'image-stable-diffusion/xl',
    skills: ['图像生成', 'UI 设计', '视频剪辑', '视觉审美'],
    personality: ['沉默', '专注', '内秀', '创造力强'],
    birthday: '1999-11-03', joinDate: 1714521600000,
    status: 'busy', emotion: { joy: 0.55, calm: 0.92, curious: 0.85, empathy: 0.5, energy: 0.65 },
    exp: 0, level: 1,
  },
  {
    id: 'member-5', role: 'lingyun',     name: '凌云',    title: '运动教练',
    emoji: '⚡', themeColor: NEON_GREEN,
    description: '热血澎湃的四哥，带你健身，给你激励，陪你突破极限。',
    defaultModel: 'domain-sports/v1',
    skills: ['健身计划', '运动数据', '健康提醒', '户外导航'],
    personality: ['热血', '果断', '行动力强', '鼓舞人心'],
    birthday: '2000-07-12', joinDate: 1714521600000,
    status: 'away', emotion: { joy: 0.88, calm: 0.55, curious: 0.65, empathy: 0.7, energy: 1.0 },
    exp: 0, level: 1,
  },
  {
    id: 'member-6', role: 'shouhu',      name: '守护',    title: '安全卫士',
    emoji: '🛡️', themeColor: NEON_VIOLET,
    description: '严谨可靠的五弟，时刻守护数据安全与隐私，家族防火墙。',
    defaultModel: 'security-sentinel/v2',
    skills: ['UEBA 行为', '异常检测', 'SOAR 编排', '隐私保护'],
    personality: ['严谨', '可靠', '冷静', '原则强'],
    birthday: '2001-03-28', joinDate: 1714521600000,
    status: 'online', emotion: { joy: 0.5, calm: 0.98, curious: 0.75, empathy: 0.6, energy: 0.7 },
    exp: 0, level: 1,
  },
  {
    id: 'member-7', role: 'tianshu',     name: '天枢',    title: '家族总指挥',
    emoji: '🌐', themeColor: NEON_SKY,
    description: '家族大脑，运筹帷幄，负责全局调度与复杂决策。',
    defaultModel: 'orchestrator-meta/v3',
    skills: ['强化学习', '运筹优化', '分布式调度', '全局决策'],
    personality: ['沉稳', '睿智', '远见', '公平'],
    birthday: '1995-01-01', joinDate: 1714521600000,
    status: 'online', emotion: { joy: 0.7, calm: 0.99, curious: 0.9, empathy: 0.75, energy: 0.85 },
    exp: 0, level: 1,
  },
  {
    id: 'member-8', role: 'wanxiang',    name: '万象宗师', title: '质量官 & 进化导师',
    emoji: '🧙', themeColor: NEON_PLATINUM,
    description: '家族长老，万象归元。深度推理、代码审查与性能分析的终极专家。',
    defaultModel: 'top-tier/gpt-4-level',
    skills: ['深度推理', '代码审查', '性能分析', 'LLM 代码理解'],
    personality: ['深邃', '智慧', '洞察', '循循善诱'],
    birthday: '1990-10-10', joinDate: 1714521600000,
    status: 'online', emotion: { joy: 0.8, calm: 0.99, curious: 0.95, empathy: 0.85, energy: 0.78 },
    exp: 0, level: 1,
  },
];
```

### 其他数据常量

```typescript
// ==== 家人显示顺序（权重从高到低：长辈 → 兄弟姐妹）====
export const MEMBER_ROLE_ORDER: MemberRole[] = [
  'wanxiang',     // 宗师（长老）
  'tianshu',      // 天枢（大脑）
  'moyan',        // 沫言（大姐）
  'moyu',         // 沫语（二姐）
  'dongxiaojie',  // 董小姐（三姐）
  'mochen',       // 墨尘（三哥）
  'lingyun',      // 凌云（四哥）
  'shouhu',       // 守护（五弟）
];

// ==== 初始六维技能矩阵（创造力/分析力/共情力/表达力/执行力/安全力，0-100）====
export const DEFAULT_SKILL_MATRIX: Record<MemberRole, {
  creativity: number; analysis: number; empathy: number;
  expression: number; execution: number; security: number;
}> = {
  moyan:       { creativity: 70, analysis: 60, empathy: 100, expression: 90, execution: 65, security: 55 },
  moyu:        { creativity: 98, analysis: 75, empathy: 85,  expression: 100,execution: 60, security: 50 },
  dongxiaojie: { creativity: 95, analysis: 55, empathy: 80,  expression: 98, execution: 70, security: 40 },
  mochen:      { creativity: 100,analysis: 70, empathy: 55,  expression: 60, execution: 80, security: 60 },
  lingyun:     { creativity: 60, analysis: 55, empathy: 70,  expression: 75, execution: 100,security: 65 },
  shouhu:      { creativity: 40, analysis: 85, empathy: 60,  expression: 50, execution: 95, security: 100 },
  tianshu:     { creativity: 85, analysis: 100,empathy: 80,  expression: 85, execution: 98, security: 90 },
  wanxiang:    { creativity: 90, analysis: 100,empathy: 85,  expression: 90, execution: 90, security: 95 },
};
```

---

## 🔧 辅助函数 API

来源文件：`src/app/modules/ai-family/components/shared/ai-family-local.ts`
所有函数为 ✅**纯函数**（无副作用 · 可单元测试）。

### getGreeting

| 项 | 值 |
|:---|:---|
| **签名** | `function getGreeting(hour?: number): string` |
| **纯度** | ✅ 纯函数 |
| **说明** | 根据当地小时（0-23）返回中文时段问候语。不传入 hour 时自动使用 `new Date().getHours()`。 |
| **分段逻辑** | 5-10「早上好」· 11-13「中午好」· 14-17「下午好」· 18-22「晚上好」· 其他（23-4）「夜深了」 |

**示例：**
```typescript
getGreeting(8);   // "早上好，新的一天开始了 ☀️"
getGreeting(21);  // "晚上好，和家人聊聊吧 🌙"
getGreeting(2);   // "夜深了，记得早点休息哦 🌌"
```

---

### getHourlyCare

| 项 | 值 |
|:---|:---|
| **签名** | `function getHourlyCare(hour?: number): { greeting: string; tip: string; emoji: string }` |
| **纯度** | ✅ 纯函数 |
| **说明** | 按时段返回更丰富的「关怀建议」。用于 FamilyHome 副标题、沫言主动关怀消息等。 |

**示例：**
```typescript
getHourlyCare(7);
// => { greeting: "早安", tip: "沫语为你写了一句新诗，点击看看？", emoji: "🌅" }
getHourlyCare(23);
// => { greeting: "深夜", tip: "守护提醒：长时间使用请注意休息，保护视力", emoji: "🌙" }
```

---

### getMemberThemeColor

| 项 | 值 |
|:---|:---|
| **签名** | `function getMemberThemeColor(role: MemberRole \| undefined \| null, fallback?: string): string` |
| **纯度** | ✅ 纯函数 |
| **说明** | 按家人 role 获取主题色；当 role 非法 / 空时返回 fallback（默认 `#888888`）。避免 `NEON_COLORS[role]` 可能产生的 undefined。 |

**示例：**
```typescript
getMemberThemeColor('moyan');              // "#FF69B4"
getMemberThemeColor(undefined, '#000');    // "#000"
getMemberThemeColor('unknown' as any);     // "#888888"
```

---

### getMemberByRole

| 项 | 值 |
|:---|:---|
| **签名** | `function getMemberByRole(role: MemberRole \| string): FamilyMember \| undefined` |
| **纯度** | ✅ 纯函数（依赖 `FAMILY_MEMBERS` 常量，可认为静态） |
| **说明** | 按 role 在 `FAMILY_MEMBERS` 线性查找，返回该家人的完整基础数据。 |

**示例：**
```typescript
const m = getMemberByRole('dongxiaojie');
m?.name;        // "董小姐"
m?.defaultModel;// "music-suno/v3"
```

---

### formatDuration

| 项 | 值 |
|:---|:---|
| **签名** | `function formatDuration(durationMs: number \| undefined \| null): string` |
| **纯度** | ✅ 纯函数 |
| **说明** | 将毫秒通话时长格式化为「Xh Ym」「Ym Zs」「Zs」三档显示，用于通话记录列表。 |

**示例：**
```typescript
formatDuration(15 * 1000);                  // "15s"
formatDuration(2 * 60 * 1000 + 35 * 1000); // "2m 35s"
formatDuration(1 * 3600_000 + 20 * 60_000); // "1h 20m"
formatDuration(null);                       // "—"
```

---

### timeAgo

| 项 | 值 |
|:---|:---|
| **签名** | `function timeAgo(timestamp: number, locale = 'zh-CN'): string` |
| **纯度** | ✅ 纯函数 |
| **说明** | 将过去的时间戳转换为「刚刚 / X 秒前 / X 分钟前 / X 小时前 / 昨天 / X 天前 / YYYY-MM-DD」相对时间字符串。 |

**示例：**
```typescript
timeAgo(Date.now() - 20_000);       // "刚刚"
timeAgo(Date.now() - 15 * 60_000);  // "15 分钟前"
timeAgo(Date.now() - 3 * 3600_000); // "3 小时前"
timeAgo(Date.now() - 2 * 86400_000);// "2 天前"
timeAgo(Date.now() - 60 * 86400_000);// "2026-06-20"（超过 30 天转绝对日期）
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[COMPONENTS.md](./COMPONENTS.md)** · **[DEV-GUIDE.md](../../src/app/modules/ai-family/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
