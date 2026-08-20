---
file: COMPONENTS.md
description: AI Family 模块组件详解 · 按功能域分组的 30+ 组件用途、Props 与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components],[ai-family],[module],[reference]
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

- [组件索引总览](#组件索引总览)
- [🏠 家庭首页（2组件）](#-家庭首页2组件)
  - [FamilyHome](#familyhome)
  - [FamilyCluster](#familycluster)
- [💬 家庭中心（3组件）](#-家庭中心3组件)
  - [AIFamilyCenterPage](#aifamilycenterpage)
  - [FamilyChat](#familychat)
  - [FamilyCommCenter](#familycommcenter)
- [⚙️ 设置系统（2组件）](#️-设置系统2组件)
  - [FamilyModelSettings](#familymodelsettings)
  - [FamilyUISettings](#familyuisettings)
- [🎵 娱乐系统（4组件）](#-娱乐系统4组件)
  - [FamilyMusic](#familymusic)
  - [FamilyEntertainment](#familyentertainment)
  - [VinylPhotoPlayer](#vinylphotoplayer)
  - [LyricsGeneratorPanel](#lyricsgeneratorpanel)
- [🌱 成长系统（2组件）](#-成长系统2组件)
  - [FamilyGrowth](#familygrowth)
  - [AchievementPanel](#achievementpanel)
- [🎙️ 语音系统（3组件）](#️-语音系统3组件)
  - [FamilyVoiceSystem](#familyvoicesystem)
  - [AudioVisualizer](#audiovisualizer)
  - [EmotionVisualizer](#emotionvisualizer)
- [📚 学习系统（1组件）](#-学习系统1组件)
  - [FamilyLearn](#familylearn)
- [📊 数据系统（2组件）](#-数据系统2组件)
  - [FamilyDataHub](#familydatahub)
  - [FamilyActivityCenter](#familyactivitycenter)
- [🔷 通用组件（10+）](#-通用组件10)
  - [FamilyPageHeader](#familypageheader)
  - [AIFamilyRouter](#aifamilyrouter)
  - [LazyWrap](#lazywrap)
  - [FadeIn](#fadein)
  - [CoverFlow](#coverflow)
  - [EmotionRipple](#emotionripple)
  - [FamilyHotel](#familyhotel)
  - [FamilyPhone](#familyphone)
  - [FamilyShare](#familyshare)
  - [FamilyAnnouncer](#familyannouncer)
  - [CreationStudio](#creationstudio)
  - [ThemeSwitcher](#themeswitcher)
  - [AgentSkills](#agentskills)

---

## 🔗 组件索引总览

| 功能域 | 组件名 | 路由/位置 | 页面级 | 通用 | 复杂度 | 类型 |
|:-------|:-------|:----------|:------:|:----:|:------:|:-----|
| 🏠 家庭首页 | [FamilyHome](#familyhome) | `/ai-family/home` | ✅ | ❌ | ⭐⭐⭐ | Page |
| 🏠 家庭首页 | [FamilyCluster](#familycluster) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐⭐ | Cluster |
| 💬 家庭中心 | [AIFamilyCenterPage](#aifamilycenterpage) | `/ai-family/center` | ✅ | ❌ | ⭐⭐⭐⭐⭐ | Page |
| 💬 家庭中心 | [FamilyChat](#familychat) | 子组件 | ❌ | ❌ | ⭐⭐⭐⭐⭐ | Chat |
| 💬 家庭中心 | [FamilyCommCenter](#familycommcenter) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐⭐ | Comm |
| ⚙️ 设置 | [FamilyModelSettings](#familymodelsettings) | `/ai-family/settings` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| ⚙️ 设置 | [FamilyUISettings](#familyuisettings) | `/ai-family/settings/ui` | ✅ | ❌ | ⭐⭐⭐ | Page |
| 🎵 娱乐 | [FamilyMusic](#familymusic) | 子路由 | ❌ | ❌ | ⭐⭐⭐⭐ | Music |
| 🎵 娱乐 | [FamilyEntertainment](#familyentertainment) | `/ai-family/entertainment` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| 🎵 娱乐 | [VinylPhotoPlayer](#vinylphotoplayer) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐⭐ | Player |
| 🎵 娱乐 | [LyricsGeneratorPanel](#lyricsgeneratorpanel) | 子组件 | ❌ | ❌ | ⭐⭐⭐⭐ | AI Panel |
| 🌱 成长 | [FamilyGrowth](#familygrowth) | `/ai-family/growth` | ✅ | ❌ | ⭐⭐⭐ | Page |
| 🌱 成长 | [AchievementPanel](#achievementpanel) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐⭐ | Achievement |
| 🎙️ 语音 | [FamilyVoiceSystem](#familyvoicesystem) | `/ai-family/voice` | ✅ | ❌ | ⭐⭐⭐⭐⭐ | Page |
| 🎙️ 语音 | [AudioVisualizer](#audiovisualizer) | 子组件 | ❌ | ✅★ | ⭐⭐⭐ | Visual |
| 🎙️ 语音 | [EmotionVisualizer](#emotionvisualizer) | 子组件 | ❌ | ✅★ | ⭐⭐⭐⭐ | Visual |
| 📚 学习 | [FamilyLearn](#familylearn) | `/ai-family/learn` | ✅ | ❌ | ⭐⭐⭐ | Page |
| 📊 数据 | [FamilyDataHub](#familydatahub) | `/ai-family/datahub` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| 📊 数据 | [FamilyActivityCenter](#familyactivitycenter) | 子组件 | ❌ | ❌ | ⭐⭐⭐⭐ | Activity |
| 🔷 通用 | [FamilyPageHeader](#familypageheader) | shared/ | ❌ | ✅★★ | ⭐⭐ | Header |
| 🔷 通用 | [AIFamilyRouter](#aifamilyrouter) | 根组件 | ❌ | ❌ | ⭐⭐⭐ | Router |
| 🔷 通用 | [LazyWrap](#lazywrap) | shared/ | ❌ | ✅★★ | ⭐ | Wrapper |
| 🔷 通用 | [FadeIn](#fadein) | shared/ | ❌ | ✅★★★ | ⭐ | Animation |
| 🔷 通用 | [CoverFlow](#coverflow) | shared/ | ❌ | ✅★ | ⭐⭐⭐⭐ | Carousel |
| 🔷 通用 | [EmotionRipple](#emotionripple) | shared/ | ❌ | ✅★ | ⭐⭐⭐ | Visual |
| 🏨 业务 | [FamilyHotel](#familyhotel) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐⭐ | Business |
| 🏨 业务 | [FamilyPhone](#familyphone) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐ | Widget |
| 🏨 业务 | [FamilyShare](#familyshare) | 子组件 | ❌ | ✅★ | ⭐⭐ | Share |
| 🏨 业务 | [FamilyAnnouncer](#familyannouncer) | 子组件 | ❌ | ✅★★ | ⭐⭐ | Notice |
| 🏨 业务 | [CreationStudio](#creationstudio) | 子组件 | ❌ | ⚠️ | ⭐⭐⭐⭐ | Studio |
| 🏨 业务 | [ThemeSwitcher](#themeswitcher) | 子组件 | ❌ | ✅★ | ⭐⭐ | Theme |
| 🏨 业务 | [AgentSkills](#agentskills) | 子组件 | ❌ | ✅★ | ⭐⭐⭐ | Skills |

> ✅★ = 跨模块复用 · ✅★★ = 跨模块高频复用 · ✅★★★ = 全局级复用

---

## 🏠 家庭首页（2组件）

### FamilyHome

**文件**：`src/app/modules/ai-family/components/FamilyHome.tsx`
**路由**：`/ai-family/home`
**类型**：页面级组件 (Page Component)
**复杂度**：⭐⭐⭐

#### 用途

AI Family 模块门户首页。根据当前时段显示动态问候语（使用 `getGreeting()` + `getHourlyCare()`），家人经验值总览 + 今日活动简报，底部嵌入 `FamilyCluster` 家人集群卡片区，右侧是 6 个功能域快捷入口（中心 / 设置 / 娱乐 / 成长 / 语音 / 数据）。

#### 关键 Props

**无 Props**（页面级组件，内部通过 13 Store Hooks 获取数据）

#### 依赖的 Store Slices

```typescript
import { useFamilyMemberStore }     from '../store/family-member';
import { useFamilyActivitiesStore } from '../store/family-activities';
import { useFamilyMilestonesStore } from '../store/family-milestones';
import { useFamilyNewsStore }       from '../store/family-news';
```

#### 使用示例

```tsx
// routes.tsx
const FamilyHome = lazy(() => import('.../FamilyHome').then(m => ({ default: m.FamilyHome })));
<Route path="/ai-family/home" element={
  <Suspense fallback={<LoadingSpinner />}><FamilyHome /></Suspense>
} />
```

---

### FamilyCluster

**文件**：`src/app/modules/ai-family/components/FamilyCluster.tsx`
**路由**：-（FamilyHome 内嵌，亦可独立复用）
**类型**：家人集群卡片组件
**复杂度**：⭐⭐⭐⭐（motion 动画密集）

#### 用途

以 3D 翻转卡片集群展示 8 位家人。每张卡片显示家人头像 emoji、名字、头衔、主题色高亮边框、在线状态灯（绿/黄/灰），hover 时翻转显示技能雷达图 + 当前心情文案。点击卡片激活该家人并同步 `activeMemberId` 到 `family-member` Store。

#### Props

```typescript
interface FamilyClusterProps {
  /** 是否启用点击切换激活家人（默认 true，嵌入只读面板时可 false） */
  interactive?: boolean;
  /** 网格列数断点覆盖（默认响应式：sm:2 / md:4 / lg:4） */
  gridCols?: string;
  /** 自定义 className */
  className?: string;
  /** 卡片被点击时回调（覆盖默认 setActiveMember 行为） */
  onMemberClick?: (memberRole: MemberRole) => void;
}
```

#### 使用示例

```tsx
// 1. 标准用法 - FamilyHome 内部
<FamilyCluster />

// 2. 只读展示（嵌入业务大屏）
<FamilyCluster interactive={false} className="max-w-3xl mx-auto" />

// 3. 自定义点击回调（跳转到家人专属对话）
<FamilyCluster
  onMemberClick={(role) => navigate(`/ai-family/center?member=${role}`)}
/>
```

---

## 💬 家庭中心（3组件）

### AIFamilyCenterPage

**文件**：`src/app/modules/ai-family/components/AIFamilyCenterPage.tsx`
**路由**：`/ai-family/center`
**类型**：页面级 · Tab 主控布局
**复杂度**：⭐⭐⭐⭐⭐

#### 用途

家庭中心主控页面，采用 **三栏栅格 + Tabs** 布局：
- 左栏（lg:col-span-1）：8位家人切换侧栏 + 在线状态
- 中栏（lg:col-span-2）：Tab 内容区（`聊天` / `通话记录` / `公告` / `时光相册`）
- 右栏（xl:col-span-1，响应式隐藏）：当前激活家人详情卡 + 心情波纹

内部直接组合 `FamilyChat` + `FamilyCommCenter` + `FamilyAnnouncer` 等子组件。

#### Props

**无 Props**（页面级组件）

#### 内部状态

```typescript
type CenterTab = 'chat' | 'calllog' | 'news' | 'moments';
const [activeTab, setActiveTab] = useState<CenterTab>('chat');
```

#### 使用示例

```tsx
<Route path="/ai-family/center" element={<AIFamilyCenterPage />} />
```

---

### FamilyChat

**文件**：`src/app/modules/ai-family/components/FamilyChat.tsx`
**路由**：-（AIFamilyCenterPage 内嵌）
**类型**：群聊 + 单聊双模式聊天组件
**复杂度**：⭐⭐⭐⭐⭐

#### 用途

核心聊天组件，支持两种模式：
- **家庭群聊模式**：8位家人 + 用户共 9 方并发对话，气泡按发言人主题色渲染，`typingMembers` 状态驱动「输入中…」动画
- **单聊模式**：通过 URL `?member=moyan` 或主动切换，进入 1v1 对话窗口，历史消息按 `family-message` Store 线程加载

内置：消息输入框（Enter发送 / Shift+Enter换行）、语音消息按钮（接入 FamilyVoiceSystem）、@提及家人、表情包选择。

#### Props

```typescript
interface FamilyChatProps {
  /** 强制单聊模式：指定家人 role（不设置则为群聊模式） */
  directMember?: MemberRole | null;
  /** 头部是否隐藏（嵌入浮窗时用） */
  hideHeader?: boolean;
  /** 最大高度，默认 60vh */
  maxHeight?: string;
  /** 发送消息后回调，可用于联动活动日志 */
  onMessageSent?: (msg: ChatMessage) => void;
}
```

#### 依赖 Store

```typescript
// 群聊
import { useFamilyChatStore }  from '../store/family-chat';
// 单聊线程
import { useFamilyMessageStore } from '../store/family-message';
// 家人信息
import { useFamilyMemberStore } from '../store/family-member';
```

#### 使用示例

```tsx
// 1. 群聊（家庭中心默认）
<FamilyChat />

// 2. 与沫言 1v1 单聊
const searchParams = useSearchParams();
<FamilyChat directMember={searchParams.get('member') as MemberRole} />

// 3. 紧凑浮窗模式
<FamilyChat hideHeader maxHeight="400px" onMessageSent={(m) => logActivity(m)} />
```

---

### FamilyCommCenter

**文件**：`src/app/modules/ai-family/components/FamilyCommCenter.tsx`
**路由**：-（AIFamilyCenterPage 的 Tab 内嵌，亦可被 business 复用）
**类型**：通讯中心组件（通话记录 + 拨号盘）
**复杂度**：⭐⭐⭐⭐

#### 用途

家庭通讯中心，包含两个子面板：
1. **通话记录 Tab**：按家人分组显示历史通话（来电/去电/未接），每条显示时长、开始时间、通话质量图标
2. **拨号盘 Tab**：模拟电话拨号盘 + 8位家人快捷拨号按钮，点击触发 `FamilyCallLogStore.startCall()`，实际通话接入 `FamilyVoiceSystem`

被 `business/CommStationPanel` 跨模块复用为通讯基站控制台。

#### Props

```typescript
interface FamilyCommCenterProps {
  /** 仅显示通话记录，隐藏拨号盘（只读面板时用） */
  logsOnly?: boolean;
  /** 拨号点击回调（覆盖默认行为，用于接入真实 VOIP） */
  onDial?: (memberRole: MemberRole) => Promise<void>;
  /** 挂断回调 */
  onHangup?: (callId: string) => void;
}
```

#### 使用示例

```tsx
// 1. 家庭中心内标准用法
<FamilyCommCenter />

// 2. 业务复用：通讯基站只读通话历史
<FamilyCommCenter logsOnly />

// 3. 自定义拨号：接入企业 VOIP
<FamilyCommCenter
  onDial={async (role) => {
    const ext = getMemberExtByRole(role);
    await window.voipAPI.call(ext);
  }}
/>
```

---

## ⚙️ 设置系统（2组件）

### FamilyModelSettings

**文件**：`src/app/modules/ai-family/components/FamilyModelSettings.tsx`
**路由**：`/ai-family/settings`
**类型**：页面级 · 模型绑定配置面板
**复杂度**：⭐⭐⭐⭐

#### 用途

为 8 位家人分别绑定独立的 AI 模型提供商与参数：
- 左列：8 位家人切换列表（主题色高亮当前选中）
- 右列：当前家人的模型配置表，包含 `Provider`（智谱/DeepSeek/Ollama 等）、`Model Name`、`API Key`（遮罩显示 + 一键测试）、`Temperature`、`Top P`、`Max Tokens`、`System Prompt 预设`

保存后写入 `family-settings` Store 并同步到全局 `useProviderSlice`。

#### Props

```typescript
interface FamilyModelSettingsProps {
  /** 初始选中的家人 role（默认从 URL ?member= 读取，否则 moyan） */
  defaultMember?: MemberRole;
  /** 是否显示 UI 设置 Tab（独立嵌入时可显示，/settings/ui 则反之） */
  showUITab?: boolean;
}
```

#### 使用示例

```tsx
// 标准：/ai-family/settings
<Route path="/ai-family/settings" element={<FamilyModelSettings showUITab />} />

// 嵌入某家人详情页：只配置沫言
<FamilyModelSettings defaultMember="moyan" showUITab={false} />
```

---

### FamilyUISettings

**文件**：`src/app/modules/ai-family/components/FamilyUISettings.tsx`
**路由**：`/ai-family/settings/ui`
**类型**：页面级 · UI 皮肤设置面板
**复杂度**：⭐⭐⭐

#### 用途

AI Family 模块独立外观设置（不影响全局主题）：
- **主题色绑定**：是否启用家人主题色高亮（开/关）
- **动画等级**：`Full`（全部 motion 动画）/ `Reduced`（仅关键帧）/ `None`（完全关闭）
- **气泡样式**：玻璃拟态 / 扁平 / 拟物三种风格
- **CoverFlow 密度**：家庭首页卡片显示密度（紧凑/舒适/宽松）
- **语音可视化样式**：频谱 / 波纹 / 雷达图
- **字体字号缩放**：消息气泡字号 12px ~ 18px 滑杆

#### Props

**无 Props**（页面级组件，读写 `family-settings` Store 的 `uiTheme` 字段）

#### 使用示例

```tsx
<Route path="/ai-family/settings/ui" element={<FamilyUISettings />} />
```

---

## 🎵 娱乐系统（4组件）

### FamilyMusic

**文件**：`src/app/modules/ai-family/components/FamilyMusic.tsx`
**路由**：FamilyEntertainment 的 Tab 内嵌
**类型**：家庭音乐台（8位家人 DJ 模式）
**复杂度**：⭐⭐⭐⭐

#### 用途

家庭音乐中心，支持 8 位家人的「DJ 切换」：每位家人拥有独立的歌单（如沫言-治愈系 / 董小姐-经典老歌 / 凌云-运动燃曲）。UI 分为：
- 顶部 DJ 家人切换栏（头像 + 主题色）
- 中部播放器（委托给 `VinylPhotoPlayer`）
- 下部歌单列表（可拖动排序，双击即播）
- 右下角 `LyricsGeneratorPanel` 启动按钮

#### Props

```typescript
interface FamilyMusicProps {
  /** 默认 DJ 家人 role，默认 dongxiaojie（董小姐） */
  defaultDJ?: MemberRole;
  /** 播放完成回调，用于成就解锁 */
  onTrackComplete?: (trackId: string, djRole: MemberRole) => void;
}
```

#### 使用示例

```tsx
<FamilyMusic defaultDJ="dongxiaojie" onTrackComplete={unlockMusicBadge} />
```

---

### FamilyEntertainment

**文件**：`src/app/modules/ai-family/components/FamilyEntertainment.tsx`
**路由**：`/ai-family/entertainment`
**类型**：页面级 · 娱乐中心主控
**复杂度**：⭐⭐⭐⭐

#### 用途

娱乐中心总控页面，四 Tab 架构：
| Tab | 内嵌组件 | 功能说明 |
|:----|:---------|:---------|
| 🎵 音乐 | `FamilyMusic` | 家庭音乐台（8DJ） |
| 📸 相册 | `VinylPhotoPlayer` 相册模式 | 黑胶风格时光相册轮播 |
| ✍️ 创作 | `LyricsGeneratorPanel` | AI 歌词/诗句创作台 |
| 🎮 轻游 | 内嵌 mini-games（待实现） | 家人互动小游戏 |

#### Props

**无 Props**

#### 使用示例

```tsx
<Route path="/ai-family/entertainment" element={<FamilyEntertainment />} />
```

---

### VinylPhotoPlayer

**文件**：`src/app/modules/ai-family/components/VinylPhotoPlayer.tsx`
**路由**：-（FamilyEntertainment 内嵌，可独立复用）
**类型**：黑胶唱片播放器 + 相册轮播双模式
**复杂度**：⭐⭐⭐⭐（Canvas 动画）

#### 用途

一个组件两种模式：
- **Player 模式**（默认）：渲染一张旋转的 SVG 黑胶唱片（中心显示当前歌曲封面），右栏显示歌名、歌手、进度条、播放/暂停/上一首/下一首控件，Canvas 绘制动圈。**Motion 动画驱动唱片旋转**。
- **Album 模式**（`mode="album"`）：同样的黑胶旋转基座但中心替换为家庭照片，底部显示照片描述与拍摄时间，用于家庭时光相册。

#### Props

```typescript
interface VinylPhotoPlayerProps {
  /** 运行模式 */
  mode?: 'player' | 'album';
  /** 播放列表（模式决定内部字段） */
  tracks: Array<{
    id: string;
    title: string;
    subtitle?: string;  // 歌手名 或 照片描述
    coverUrl: string;
    audioUrl?: string;  // player 模式必填
    takenAt?: number;   // album 模式：拍摄时间戳
  }>;
  /** 黑胶尺寸，默认 280px */
  vinylSize?: number;
  /** 自动播放（用户交互后才生效，浏览器策略） */
  autoPlay?: boolean;
  /** 切歌回调 */
  onTrackChange?: (trackIndex: number) => void;
}
```

#### 使用示例

```tsx
// 🎵 播放器模式（董小姐歌单）
<VinylPhotoPlayer
  mode="player"
  tracks={[
    { id: 't1', title: '往事如风', subtitle: '沫言', coverUrl: '/covers/moyan-1.jpg', audioUrl: '/Music-Mp3/沫言-往事如风.mp3' },
    { id: 't2', title: '过客',     subtitle: '董小姐', coverUrl: '/covers/dxj-1.jpg',  audioUrl: '/Music-Mp3/董小姐-过客.mp3' },
  ]}
/>

// 📸 相册模式
<VinylPhotoPlayer
  mode="album"
  tracks={familyMoments.map(p => ({
    id: p.id, title: p.title, subtitle: p.caption, coverUrl: p.url, takenAt: p.takenAt,
  }))}
  vinylSize={220}
/>
```

---

### LyricsGeneratorPanel

**文件**：`src/app/modules/ai-family/components/LyricsGeneratorPanel.tsx`
**路由**：-（FamilyEntertainment 内嵌）
**类型**：AI 歌词生成器面板
**复杂度**：⭐⭐⭐⭐

#### 用途

基于当前绑定的家人模型，AI 生成原创歌词 / 现代诗 / 古风词。
参数区：
- 「曲风」流行/摇滚/古风/民谣/R&B
- 「情感」治愈/热血/思念/励志/忧郁
- 「字数」四句/八句/完整副歌
- 「主唱家人」沫言/沫语/董小姐（决定语言风格 System Prompt）

生成结果区：实时流式显示逐字输出，支持「重新生成」「保存到家庭记忆」「导出为 .lrc / .md」。

#### Props

```typescript
interface LyricsGeneratorPanelProps {
  /** 初始作者家人 role，默认 moyu（沫语-诗人） */
  defaultAuthor?: MemberRole;
  /** 展开高度，默认 520px */
  height?: string | number;
  /** 作品保存成功回调 */
  onSaved?: (pieceId: string) => void;
}
```

#### 使用示例

```tsx
<LyricsGeneratorPanel
  defaultAuthor="moyu"
  height={520}
  onSaved={(pid) => useFamilyMemoriesStore.getState().saveMemory({ type: 'lyrics', refId: pid })}
/>
```

---

## 🌱 成长系统（2组件）

### FamilyGrowth

**文件**：`src/app/modules/ai-family/components/FamilyGrowth.tsx`
**路由**：`/ai-family/growth`
**类型**：页面级 · 成长中心总控
**复杂度**：⭐⭐⭐

#### 用途

家人成长中心，三栏布局：
- 顶部总览：全家族总经验值 + 平均等级 + 8位家人等级进度条排行榜
- 左栏：8位家人切换侧栏（等级徽章 + 经验百分比）
- 右栏：当前家人成长时间轴（从小到大展示已解锁的 `family-milestones`）+ 下一级所需经验进度环

底部 Tab 可切换到「勋章墙」（内嵌 `AchievementPanel`）。

#### Props

**无 Props**

#### 依赖 Store

```typescript
import { useFamilyMilestonesStore } from '../store/family-milestones';
import { useFamilyMedalsStore }     from '../store/family-medals';
import { useFamilyMemberStore }     from '../store/family-member';
```

#### 使用示例

```tsx
<Route path="/ai-family/growth" element={<FamilyGrowth />} />
```

---

### AchievementPanel

**文件**：`src/app/modules/ai-family/components/AchievementPanel.tsx`
**路由**：-（FamilyGrowth 内嵌，可独立嵌入家人详情）
**类型**：勋章成就面板
**复杂度**：⭐⭐⭐⭐（动画效果丰富）

#### 用途

勋章墙组件：
- 按分类（社交 / 创造 / 语音 / 学习 / 隐藏彩蛋）分组展示所有勋章定义
- 未解锁勋章灰化 + 进度条显示「完成度 65%」
- 已解锁勋章悬浮播放「金粉掉落」Motion 动画 + 解锁时间戳
- 顶部统计：已解锁 N / 总数 M，完成率百分比环形进度条
- 可筛选：指定家人 / 全家族

#### Props

```typescript
interface AchievementPanelProps {
  /** 仅展示指定家人的勋章，不设置则全家族 */
  memberRole?: MemberRole;
  /** 紧凑网格（嵌入详情卡时用） */
  compact?: boolean;
  /** 点击单枚勋章回调，可弹出详情对话框 */
  onMedalClick?: (medalCode: string) => void;
}
```

#### 使用示例

```tsx
// 1. 全家族勋章墙（FamilyGrowth 使用）
<AchievementPanel />

// 2. 沫言个人成就（家人详情卡）
<AchievementPanel memberRole="moyan" compact />
```

---

## 🎙️ 语音系统（3组件）

### FamilyVoiceSystem

**文件**：`src/app/modules/ai-family/components/FamilyVoiceSystem.tsx`
**路由**：`/ai-family/voice`
**类型**：页面级 · 全双工语音主控
**复杂度**：⭐⭐⭐⭐⭐（Web Audio API + MediaRecorder + 多状态机）

#### 用途

语音交互主控页面，构建完整「听 → 想 → 说」闭环：
1. **左侧配置栏**：当前对话家人切换 · STT（语音识别）引擎选择 · TTS（合成）音色选择 · 麦克风音量计
2. **中央可视化区**：上部 `EmotionVisualizer`（家人实时情感雷达）· 下部 `AudioVisualizer`（用户麦克风频谱 Canvas）
3. **底部转录区**：实时显示用户语音识别文字 + AI回复转录文字，支持手动编辑 + 重新生成

状态机：`idle → listening → recognizing → thinking → speaking → idle`，每个状态驱动动画变化。

#### Props

```typescript
interface FamilyVoiceSystemProps {
  /** 默认对话家人，默认 moyan（沫言-情感倾诉官） */
  defaultSpeaker?: MemberRole;
  /** 是否允许切换家人（默认 true，嵌入单家人模式时 false） */
  allowSwitchSpeaker?: boolean;
  /** TTS 说完一句话回调，用于活动日志 */
  onUtteranceComplete?: (text: string, speakerRole: MemberRole) => void;
}
```

#### 浏览器权限依赖

需用户授权 `navigator.mediaDevices.getUserMedia({ audio: true })`，首次进入会渲染权限引导面板。

#### 使用示例

```tsx
<Route path="/ai-family/voice" element={<FamilyVoiceSystem />} />
```

---

### AudioVisualizer

**文件**：`src/app/modules/ai-family/components/AudioVisualizer.tsx`
**路由**：-（通用可视化组件）
**类型**：Canvas 音频频谱可视化
**复杂度**：⭐⭐⭐
**复用等级**：✅★（跨模块通用）

#### 用途

接收一个 `AnalyserNode` 或 `MediaStream`，在 Canvas 上实时绘制：
- 柱状频谱（默认）
- 波形曲线
- 环形频谱

颜色随当前激活家人主题色自动绑定。

#### Props

```typescript
interface AudioVisualizerProps {
  /** 可视化样式 */
  variant?: 'bars' | 'wave' | 'ring';
  /** 音频源：要么传 stream，要么传 analyser */
  stream?: MediaStream | null;
  analyser?: AnalyserNode | null;
  /** 画布高度，默认 160 */
  height?: number;
  /** 主题色（若不传则自动读取 useFamilyMemberStore.activeMember.themeColor） */
  color?: string;
  /** 每秒帧率，默认 60 */
  fps?: number;
}
```

#### 使用示例

```tsx
// 1. 标准：传麦克风 stream
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
<AudioVisualizer stream={stream} variant="bars" height={200} />

// 2. 复用：音乐台播放器的 AnalyserNode
<audio ref={audioRef} src="..." />
<AudioVisualizer
  analyser={audioCtx.createAnalyser()}
  variant="ring"
  color={NEON_GOLD}
/>
```

---

### EmotionVisualizer

**文件**：`src/app/modules/ai-family/components/EmotionVisualizer.tsx`
**路由**：-（通用可视化组件）
**类型**：SVG 情感雷达图
**复杂度**：⭐⭐⭐⭐
**复用等级**：✅★（跨模块通用）

#### 用途

五维情感雷达图，实时显示当前家人的情绪状态：
| 维度 | 说明 |
|:-----|:-----|
| 喜悦 Joy | 正向情感强度 |
| 平静 Calm | 情绪稳定度 |
| 好奇 Curious | 对输入内容兴趣度 |
| 共情 Empathy | 对用户情绪匹配度 |
| 活力 Energy | 回复积极程度 |

数据来源：`family-member` Store 的 `emotionState` 字段，由各 AI 模型推理后更新。

#### Props

```typescript
interface EmotionVisualizerProps {
  /** 指定显示哪个家人的情感（默认读取 activeMemberId） */
  memberRole?: MemberRole;
  /** 雷达尺寸，默认 260 */
  size?: number;
  /** 静态快照模式（禁用自动刷新动画） */
  staticSnapshot?: EmotionState | null;
  /** 背景填充透明度，默认 0.25 */
  fillOpacity?: number;
}
```

#### 使用示例

```tsx
// 1. 自动绑定当前激活家人（语音系统中心）
<EmotionVisualizer size={300} />

// 2. 静态快照（聊天消息卡片里的情感小图）
<EmotionVisualizer
  memberRole="moyan"
  staticSnapshot={{ joy: 0.82, calm: 0.7, curious: 0.6, empathy: 0.9, energy: 0.75 }}
  size={120}
  fillOpacity={0.4}
/>
```

---

## 📚 学习系统（1组件）

### FamilyLearn

**文件**：`src/app/modules/ai-family/components/FamilyLearn.tsx`
**路由**：`/ai-family/learn`
**类型**：页面级 · 家庭学习中心
**复杂度**：⭐⭐⭐

#### 用途

家庭学习中心，按家人所长分配导师角色：
| 学习领域 | 推荐导师家人 |
|:---------|:-------------|
| 语言写作 | 沫语（二姐·文字） |
| 音乐艺术 | 董小姐（音乐女神） |
| 视觉设计 | 墨尘（三哥·视觉） |
| 健身运动 | 凌云（四哥·教练） |
| 信息安全 | 守护（五弟·安全） |
| 编程/工程 | 万象宗师（长老·质量） |
| 通用学习 | 天枢（总指挥·个性化路径） |

页面由三部分组成：
- 顶部「当前学习路径」卡片（天枢动态生成个性化计划）
- 中部 2×4 导师矩阵（点击切换到该导师的专属学习面板）
- 下部学习进度 + 已完成课程时间轴

#### Props

**无 Props**

#### 使用示例

```tsx
<Route path="/ai-family/learn" element={<FamilyLearn />} />
```

---

## 📊 数据系统（2组件）

### FamilyDataHub

**文件**：`src/app/modules/ai-family/components/FamilyDataHub.tsx`
**路由**：`/ai-family/datahub`
**类型**：页面级 · 家庭数据仪表盘
**复杂度**：⭐⭐⭐⭐

#### 用途

家庭数据总览仪表盘（Recharts 可视化），展示 8 个指标：
1. 📈 消息数量趋势（7日线图：家人消息 vs 用户消息）
2. 💬 家人发言占比（饼图，按 `family-chat` 统计）
3. 📞 通话时长 Top 5（条形图）
4. 🎵 音乐听歌排行榜（董小姐 vs 沫言 vs 其他）
5. 🎖️ 勋章解锁进度（环形进度条 ×8）
6. ⚡ 经验值增长曲线（7日累计 exp）
7. 🔥 活动热力图（30日格子热力图，`family-activities`）
8. 🧠 记忆库容量（向量 + 文本存储占用统计）

#### Props

```typescript
interface FamilyDataHubProps {
  /** 默认统计范围天数，默认 7 */
  rangeDays?: number;
  /** 管理员模式：显示数据导出 / 清理按钮 */
  adminMode?: boolean;
}
```

#### 使用示例

```tsx
// 用户端
<Route path="/ai-family/datahub" element={<FamilyDataHub />} />

// 管理端（嵌入 admin 面板）
<FamilyDataHub rangeDays={30} adminMode />
```

---

### FamilyActivityCenter

**文件**：`src/app/modules/ai-family/components/FamilyActivityCenter.tsx`
**路由**：-（FamilyDataHub 的 Tab 内嵌）
**类型**：活动中心 · 动态流墙
**复杂度**：⭐⭐⭐⭐

#### 用途

家庭活动时间线 + 动态发布墙：
- 左栏：活动分类过滤器（全部 / 聊天 / 通话 / 音乐 / 勋章 / 学习 / 创作）
- 中央：**事件流**（按时间倒序的卡片列表），每张卡片显示事件类型图标、触发家人头像、事件描述 + 相对时间 `timeAgo()`
- 右栏：「发布动态」面板（用户可发布家庭动态 `family-posts`，支持图片 + 艾特家人）
- 顶部：今日摘要统计（`getDailyDigest()` 输出）

#### Props

```typescript
interface FamilyActivityCenterProps {
  /** 初始活动类型过滤器 */
  defaultFilter?: ActivityType | 'all';
  /** 最大事件流条数，默认 100 */
  maxItems?: number;
  /** 是否隐藏发布面板（只读嵌入时） */
  hidePublisher?: boolean;
}
```

#### 使用示例

```tsx
// 1. 完整功能（家庭数据面板内嵌）
<FamilyActivityCenter />

// 2. 只读预览（FamilyHome 首页今日动态）
<FamilyActivityCenter maxItems={8} hidePublisher />
```

---

## 🔷 通用组件（10+）

### FamilyPageHeader

**文件**：`src/app/modules/ai-family/components/shared/FamilyPageHeader.tsx`
**类型**：统一页面头部
**复杂度**：⭐⭐
**复用等级**：✅★★★（模块内所有页面级组件复用）

#### 用途

AI Family 模块统一页面头部组件，所有页面级组件顶部必须调用：
- 左：模块 emoji 标题 + 二级小标题（随页面传入）
- 中：8 位家人快速切换 Tab 胶囊（点击同步到 `activeMemberId`）
- 右：全局搜索入口 · 通知铃铛（未读数） · 主题按钮

#### Props

```typescript
interface FamilyPageHeaderProps {
  /** 页面大标题 emoji + 文字，如 "🏠 家庭首页" */
  title: string;
  /** 二级副标题（可选） */
  subtitle?: string;
  /** 是否隐藏中央家人 Tab（纯设置页时传 false） */
  showMemberTabs?: boolean;
  /** 右侧额外操作区（可放按钮） */
  extraActions?: React.ReactNode;
}
```

#### 使用示例

```tsx
export function FamilyHome() {
  return (
    <div>
      <FamilyPageHeader
        title="🏠 家庭首页"
        subtitle={getHourlyCare()}
        extraActions={<Button variant="ghost"><SettingsIcon size={18} /></Button>}
      />
      {/* 页面内容... */}
    </div>
  );
}
```

---

### AIFamilyRouter

**文件**：`src/app/modules/ai-family/components/AIFamilyRouter.tsx`
**类型**：模块内部路由分发器
**复杂度**：⭐⭐⭐

#### 用途

模块内嵌套路由分发容器，读取 `routes.ts` 配置，基于 `useRoutes()` 或 `useParams()` 渲染对应的子页面。一般被 `AIFamilyPage.tsx` 调用。

#### Props

```typescript
interface AIFamilyRouterProps {
  /** 自定义基础路由前缀（默认 /ai-family） */
  basename?: string;
}
```

#### 使用示例

```tsx
// AIFamilyPage.tsx
export function AIFamilyPage() {
  return <AIFamilyRouter />;
}
```

---

### LazyWrap

**文件**：`src/app/modules/ai-family/components/shared/LazyWrap.tsx`
**类型**：懒加载 + 骨架屏包装器
**复杂度**：⭐
**复用等级**：✅★★★（跨模块通用）

#### 用途

统一包装 `React.lazy` 组件，内置：
- `Suspense` 骨架屏（Shimmer 动画）
- 错误边界（渲染失败时显示重试按钮）
- 首屏渐入（内嵌 `FadeIn`）

#### Props

```typescript
interface LazyWrapProps {
  children: React.ReactNode;
  /** 骨架屏高度，默认 320 */
  skeletonHeight?: number;
  /** 骨架屏样式：card / list / image */
  skeletonVariant?: 'card' | 'list' | 'image';
}
```

#### 使用示例

```tsx
<LazyWrap skeletonHeight={500} skeletonVariant="card">
  <SomeLazyLoadedComponent />
</LazyWrap>
```

---

### FadeIn

**文件**：`src/app/modules/ai-family/components/shared/FadeIn.tsx`
**类型**：渐入动画包装器
**复杂度**：⭐
**复用等级**：✅★★★★（全局级复用，被 shared/Layout 引入）

#### 用途

任何内容包一层 `<FadeIn>` 即可获得：首屏载入时 `opacity 0→1` + `translateY(20px→0)` 的柔和动画。动画使用 `motion`，可配置延迟、时长、缓动。

#### Props

```typescript
interface FadeInProps {
  children: React.ReactNode;
  /** 动画延迟毫秒，默认 0 */
  delay?: number;
  /** 动画时长毫秒，默认 420 */
  duration?: number;
  /** Y 轴偏移，默认 20 */
  offsetY?: number;
  /** 触发视口（进入视口才触发，默认 true，false 则挂载即播） */
  viewport?: boolean;
  /** 自定义 className */
  className?: string;
}
```

#### 使用示例

```tsx
// 列表项 stagger 渐入
items.map((item, i) => (
  <FadeIn key={item.id} delay={i * 60}>
    <Card item={item} />
  </FadeIn>
));
```

---

### CoverFlow

**文件**：`src/app/modules/ai-family/components/shared/CoverFlow.tsx`
**类型**：3D CoverFlow 轮播
**复杂度**：⭐⭐⭐⭐
**复用等级**：✅★

#### 用途

苹果风格的 3D CoverFlow 轮播：
- 当前居中卡片 1:1 放大
- 两侧卡片 3D 透视旋转 + 缩小
- 拖拽 / 滚轮 / 左右按钮切换
- 点击卡片激活并居中

用于：家人相册封面流、音乐专辑封面流、创作作品展示流。

#### Props

```typescript
interface CoverFlowProps<T> {
  /** 卡片数据数组 */
  items: T[];
  /** 卡片渲染函数 */
  renderItem: (item: T, index: number, active: boolean) => React.ReactNode;
  /** 卡片宽度，默认 260 */
  itemWidth?: number;
  /** 卡片高度，默认 260 */
  itemHeight?: number;
  /** 初始激活 index，默认 0 */
  defaultIndex?: number;
  /** 切换到下一张的回调 */
  onIndexChange?: (index: number, item: T) => void;
}
```

#### 使用示例

```tsx
<CoverFlow<FamilyMember>
  items={FAMILY_MEMBERS}
  itemWidth={240}
  itemHeight={320}
  renderItem={(m, i, active) => (
    <GlassCard accent={m.themeColor} className={cn('h-full p-4', active && 'ring-2')}>
      <div className="text-7xl text-center">{m.emoji}</div>
      <div className="mt-4 text-xl font-bold text-center">{m.name}</div>
    </GlassCard>
  )}
/>
```

---

### EmotionRipple

**文件**：`src/app/modules/ai-family/components/shared/EmotionRipple.tsx`
**类型**：情感波纹 SVG 可视化
**复杂度**：⭐⭐⭐
**复用等级**：✅★

#### 用途

以家人主题色为中心渲染多层「水波纹扩散」SVG 动画：波纹密度 → 情感强度，波纹颜色 → 家人主题色，波纹频率 → 当前心情活力。通常嵌入家人卡片 / 语音系统的活跃指示。

#### Props

```typescript
interface EmotionRippleProps {
  /** 家人主题色，默认读取 activeMember */
  color?: string;
  /** 波纹数量，默认 3-5 条 */
  rippleCount?: number;
  /** 尺寸（正方形），默认 120 */
  size?: number;
  /** 强度 0-1，越大波纹扩散越快，默认 0.6 */
  intensity?: number;
}
```

#### 使用示例

```tsx
// 家人卡片：沫言的心情波纹
<EmotionRipple color={NEON_PINK} rippleCount={4} size={80} intensity={member.emotionStrength} />
```

---

### FamilyHotel

**文件**：`src/app/modules/ai-family/components/FamilyHotel.tsx`
**类型**：智慧酒店映射控制台
**复杂度**：⭐⭐⭐⭐

#### 用途

将 AI Family 8 角色映射到酒店业务岗位的控制面板：
| 家人 | 酒店岗位 | 核心面板能力 |
|:-----|:---------|:-------------|
| 沫言 | 前台接待 | 客户语言识别 + 多语言翻译面板 |
| 沫语 | 礼宾服务 | 欢迎词/告别词 AI 文案生成 |
| 董小姐 | 大堂音乐总监 | 公共区域背景音乐调度 |
| 墨尘 | 视觉设计 | 酒店海报/菜单快速生成 |
| 凌云 | 康体教练 | 客人健身计划推荐 |
| 守护 | 安全保卫 | UEBA 异常行为 + 监控告警 |
| 天枢 | 酒店经理 | 全局入住率 + 资源调度仪表盘 |
| 万象 | 质量总监 | 服务质量 QA + 投诉处理建议 |

被 `business/HotelDashboard` 跨模块嵌入。

#### Props

```typescript
interface FamilyHotelProps {
  /** 酒店 ID（多门店场景），默认 'default-hotel' */
  hotelId?: string;
  /** 是否显示岗位映射关系图（首屏展示引导） */
  showMappingIntro?: boolean;
}
```

#### 使用示例

```tsx
// 业务模块：智慧酒店总控
<FamilyHotel hotelId={currentHotel.id} showMappingIntro={!visitedBefore} />
```

---

### FamilyPhone

**文件**：`src/app/modules/ai-family/components/FamilyPhone.tsx`
**类型**：模拟家庭电话机 Widget
**复杂度**：⭐⭐⭐

#### 用途

拟物化家庭电话机（1990s 风格）小部件：
- 可拿起的听筒（Motion 动画）
- 旋转拨号盘（可拖动拨数字，真实音效）
- 来电显示屏幕（显示家人头像 + 名字）
- 「一键拨打沫言 / 天枢」热键

趣味组件，通常嵌入 FamilyCommCenter 底部作为装饰 + 快捷拨号入口。

#### Props

```typescript
interface FamilyPhoneProps {
  /** 拨号后回调，参数为电话号码或家人 role */
  onDial?: (target: string) => void;
  /** 来电动画触发（模拟家人来电） */
  incomingCall?: { fromRole: MemberRole } | null;
}
```

#### 使用示例

```tsx
<FamilyPhone
  onDial={(t) => useFamilyCallLogStore.getState().startCall(t as MemberRole)}
  incomingCall={incomingCallState}
/>
```

---

### FamilyShare

**文件**：`src/app/modules/ai-family/components/FamilyShare.tsx`
**类型**：分享面板（生成精美分享卡片）
**复杂度**：⭐⭐
**复用等级**：✅★

#### 用途

统一分享面板：
- 分享对象：成就勋章 / 歌词作品 / 家人动态 / 成长里程碑
- 导出格式：PNG 精美卡片（html2canvas 渲染） · Markdown 文本 · 纯文本链接
- 分享渠道：复制到剪贴板 / 下载 PNG / 一键分享到系统分享 API

#### Props

```typescript
interface FamilyShareProps {
  /** 打开状态（受控） */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 要分享的内容对象（根据 type 渲染模板） */
  payload:
    | { type: 'medal'; code: string; memberRole: MemberRole }
    | { type: 'lyrics'; id: string; title: string; lines: string[] }
    | { type: 'post'; postId: string }
    | { type: 'milestone'; milestoneId: string };
}
```

#### 使用示例

```tsx
const [shareOpen, setShareOpen] = useState(false);
const sharePayload = { type: 'medal' as const, code: 'FIRST_100_CHATS', memberRole: 'moyan' };

<Button onClick={() => setShareOpen(true)}>分享成就</Button>
<FamilyShare open={shareOpen} onOpenChange={setShareOpen} payload={sharePayload} />
```

---

### FamilyAnnouncer

**文件**：`src/app/modules/ai-family/components/FamilyAnnouncer.tsx`
**类型**：家庭公告广播器（全局悬浮通知）
**复杂度**：⭐⭐
**复用等级**：✅★★★（被 shared/Layout 全局嵌入）

#### 用途

读取 `family-news` Store 的 `pushQueue`，渲染为顶部下拉式通知条：
- 紧急公告：全家红色全宽 banner + 关闭倒计时
- 普通公告：右侧 toast 卡片堆叠，点击展开详情
- 勋章解锁：特殊金粉特效公告（自动触发 `AchievementPanel.unlockMedal`）

通常在全局 Layout 挂载一次即可。

#### Props

```typescript
interface FamilyAnnouncerProps {
  /** 最多同时显示多少条堆叠 toast，默认 3 */
  maxStacked?: number;
  /** 普通公告自动关闭毫秒数，默认 6000 */
  autoDismissMs?: number;
}
```

#### 使用示例

```tsx
// shared/Layout.tsx - 全局挂载一次
export function Layout({ children }) {
  return (
    <div>
      <TopBar />
      <FamilyAnnouncer /> {/* 全局通知层 */}
      <main>{children}</main>
    </div>
  );
}
```

---

### CreationStudio

**文件**：`src/app/modules/ai-family/components/CreationStudio.tsx`
**类型**：多模态创意工坊
**复杂度**：⭐⭐⭐⭐

#### 用途

AI 多模态创作工作台，按家人能力分区：
- 文字创作区（沫语）：散文/情书/诗词
- 音乐创作区（董小姐）：歌词 + 旋律导出 MIDI
- 图像创作区（墨尘）：文生图 prompt 工作台
- 代码创作区（万象宗师）：AI 代码生成 + 审查

作品可一键发送到家庭群聊 / 保存到 `family-memories` / 分享（委托 `FamilyShare`）。

#### Props

```typescript
interface CreationStudioProps {
  /** 初始聚焦的创作家人（决定默认 Tab） */
  defaultCreator?: MemberRole;
  /** 作品保存回调 */
  onWorkSaved?: (workId: string) => void;
}
```

#### 使用示例

```tsx
// 嵌入 dev/IDEPane 作为代码创作助手
<CreationStudio defaultCreator="wanxiang" />
```

---

### ThemeSwitcher

**文件**：`src/app/modules/ai-family/components/ThemeSwitcher.tsx`
**类型**：家族主题切换器
**复杂度**：⭐⭐
**复用等级**：✅★

#### 用途

AI Family 专用主题切换器（不影响全局主题）：
- 8 位家人主题色一键切换（全局写入 `--family-accent` CSS 变量）
- 3 套氛围预设：「日间阳光」 / 「深夜霓虹」 / 「节日庆典」
- 一键「随机」：每次点击随机一位家人主题
- 预览：切换时页面立即实时渲染

#### Props

```typescript
interface ThemeSwitcherProps {
  /** 切换方式：icons(仅家人色) / full(含氛围预设) / mini(仅下拉按钮) */
  variant?: 'icons' | 'full' | 'mini';
  /** 主题变更后回调 */
  onThemeChange?: (nextTheme: { accentRole: MemberRole; mood: 'day' | 'night' | 'festival' }) => void;
}
```

#### 使用示例

```tsx
// 顶部栏完整模式
<ThemeSwitcher variant="full" />

// 家人详情卡内嵌迷你模式
<ThemeSwitcher variant="mini" />
```

---

### AgentSkills

**文件**：`src/app/modules/ai-family/components/AgentSkills.tsx`
**类型**：家人技能矩阵面板
**复杂度**：⭐⭐⭐
**复用等级**：✅★

#### 用途

8 位家人的 6 维技能矩阵对比面板（6 轴：创造力 / 分析力 / 共情力 / 表达力 / 执行力 / 安全力）。
- 雷达图综合对比（8 色多线）
- 点击单个家人可查看其技能树详情（技能等级 + 冷却时间 + 下次升级建议 exp）
- 「一键推荐」：根据当前任务类型（创作/分析/客服/编码）推荐最优家人组合

#### Props

```typescript
interface AgentSkillsProps {
  /** 模式：compare(8人综合对比) / detail(单家人技能树) */
  mode?: 'compare' | 'detail';
  /** detail 模式必填：目标家人 role */
  detailMember?: MemberRole;
  /** 雷达尺寸，默认 400 */
  radarSize?: number;
  /** 推荐按钮点击回调（结果可用于 FamilyChat 激活组合） */
  onRecommend?: (teamRoles: MemberRole[]) => void;
}
```

#### 使用示例

```tsx
// 综合对比模式
<AgentSkills mode="compare" onRecommend={(team) => setActiveTeam(team)} />

// 详情模式：沫言技能树
<AgentSkills mode="detail" detailMember="moyan" />
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[API-REFERENCE.md](./API-REFERENCE.md)** · **[DEV-GUIDE.md](../../src/app/modules/ai-family/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
