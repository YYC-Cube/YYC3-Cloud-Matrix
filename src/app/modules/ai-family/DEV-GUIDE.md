---
file: DEV-GUIDE.md
description: AI Family 生态模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[ai-family],[module]
category: guide
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

## 模块概述

`ai-family` 是 AI Family 生态模块，包含 8 位 AI 家人的完整交互体系——家庭聊天、通讯、娱乐、成长、勋章、记忆、模型绑定和语音配置。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| 家庭首页 | FamilyHome, FamilyCluster | `/ai-family/home` |
| 家庭中心 | AIFamilyCenterPage, FamilyChat, FamilyCommCenter | `/ai-family/center` |
| 模型设置 | FamilyModelSettings, FamilyUISettings | `/ai-family/settings` |
| 娱乐系统 | FamilyMusic, FamilyEntertainment, VinylPhotoPlayer, LyricsGeneratorPanel | - |
| 成长系统 | FamilyGrowth, AchievementPanel | - |
| 语音系统 | FamilyVoiceSystem, AudioVisualizer, EmotionVisualizer | - |
| 学习系统 | FamilyLearn | - |
| 数据系统 | FamilyDataHub, FamilyActivityCenter | - |

## 文件结构

```
ai-family/
├── index.ts                    # Barrel 统一导出
├── DEV-GUIDE.md                # 本文档
├── routes.ts                   # 模块路由配置
├── AIFamilyPage.tsx            # 模块入口页
│
├── components/
│   ├── shared.ts               # 共享数据与类型
│   ├── AIFamilyRouter.tsx      # 路由容器
│   ├── FamilyHome.tsx          # 家庭首页
│   ├── FamilyChat.tsx          # 家庭聊天
│   ├── FamilyCommCenter.tsx    # 家庭通讯中心
│   ├── FamilyMusic.tsx         # 家庭音乐
│   ├── FamilyEntertainment.tsx # 家庭娱乐
│   ├── FamilyGrowth.tsx        # 家人成长
│   ├── FamilyLearn.tsx         # 家人学习
│   ├── FamilyVoiceSystem.tsx   # 语音系统
│   ├── FamilyDataHub.tsx       # 数据中枢
│   ├── FamilyActivityCenter.tsx # 活动中心
│   ├── FamilyModelSettings.tsx # 模型设置
│   ├── FamilyUISettings.tsx    # UI 设置
│   ├── FamilyHotel.tsx         # 家庭酒店
│   ├── FamilyPhone.tsx         # 家庭通讯
│   ├── FamilyShare.tsx         # 家庭分享
│   ├── FamilyAnnouncer.tsx     # 家庭播报员
│   ├── FamilyCluster.tsx       # 家人集群
│   ├── CoverFlow.tsx           # 封面流
│   ├── EmotionRipple.tsx       # 情感涟漪
│   ├── AudioVisualizer.tsx     # 音频可视化
│   ├── VinylPhotoPlayer.tsx    # 黑胶照片播放器
│   ├── LyricsGeneratorPanel.tsx # 歌词生成
│   ├── CreationStudio.tsx      # 创作工作室
│   ├── AchievementPanel.tsx    # 成就面板
│   ├── ThemeSwitcher.tsx       # 主题切换
│   ├── AgentSkills.ts          # 技能定义
│   ├── FamilyPageHeader.tsx    # 页面头部
│   ├── LazyWrap.tsx            # 懒加载包裹
│   ├── FadeIn.tsx              # 淡入动画
│   └── ai-family-local.tsx     # 本地数据
│
├── store/
│   ├── index.ts                # Store barrel
│   ├── family-member-slice.ts  # 家人成员状态
│   ├── family-message-slice.ts # 消息状态
│   ├── family-settings-slice.ts # 设置状态
│   ├── family-skills-slice.ts  # 技能状态
│   ├── family-memories-slice.ts # 记忆状态
│   ├── family-calllog-slice.ts # 通话记录
│   ├── family-milestones-slice.ts # 里程碑
│   ├── family-medals-slice.ts  # 勋章状态
│   ├── family-posts-slice.ts   # 动态状态
│   ├── family-moments-slice.ts # 朋友圈
│   ├── family-news-slice.ts    # 新闻状态
│   ├── family-chat-slice.ts    # 聊天状态
│   └── family-activities-slice.ts # 活动状态
│
└── types/
    ├── index.ts                # 类型 barrel
    ├── family-member.ts        # 家人成员类型
    └── family-message.ts       # 消息类型
```

## 导出清单

### 组件

```typescript
export { AIFamilyRouter, AIFamilyPage } from './...';
```

### Store (13 个 Zustand Slice)

```typescript
export {
  useFamilyMemberSlice, useFamilyMessageSlice, useFamilySettingsSlice,
  useFamilySkillsSlice, useFamilyMemoriesSlice, useFamilyCallLogSlice,
  useFamilyMilestonesSlice, useFamilyMedalsSlice, useFamilyPostsSlice,
  useFamilyMomentsSlice, useFamilyNewsSlice, useFamilyChatSlice,
  useFamilyActivitiesSlice,
} from './store';
```

### 类型

```typescript
export type {
  MemberPresenceStatus, MemberPersonality, MemberStats,
  MemberModelBinding, MemberVoiceProfile, FamilyMemberId,
  UnifiedFamilyMember, UnifiedFamilyMessage, FamilyConversation,
  MessageContentType, MessagePriority, MessageDeliveryStatus,
} from './types';
```

### 共享数据

```typescript
export {
  FAMILY_MEMBERS, MEMBERS_MAP, getMember, refreshFromStore,
  getMembersMap, getGreeting, getHourlyCare, generateDailyBroadcast,
  getFamilyDataSummary, getTodayReporter,
  NEON_CYAN, NEON_PINK, DEEP_BG,
} from './components/shared';
```

## 依赖关系

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/*` | 布局与共用组件 |
| `../../hooks/useI18n` | 国际化 |
| `../../store/*` | 全局状态 |
| `../../types` | 类型定义 |
| `zustand` | 状态管理 |
| `lucide-react` | 图标库 |
| `motion` | 动画库 |

## 使用方式

### 模块路由

```typescript
// 独立的模块路由配置
export { aiFamilyRoutes } from './routes';

// 在应用路由中注册
{
  path: "/ai-family/*",
  element: <AIFamilyRouter />,
  children: aiFamilyRoutes,
}
```

### 新增 AI 家人

1. 在 `components/shared.ts` 的 `FAMILY_MEMBERS` 数组中添加成员定义
2. 在 `types/family-member.ts` 中补充类型
3. 如需新状态，在 `store/` 中创建对应 slice
4. 在 `store/index.ts` 和模块 `index.ts` 中导出

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>