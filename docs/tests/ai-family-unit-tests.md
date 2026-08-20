---
file: ai-family-unit-tests.md
description: YYC³ AI-Family 家庭生态 · 8 位家人角色 + 13 Zustand Slices + 家庭娱乐音乐 + 多模态情感引擎（complexity: advanced）
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, ai-family, unit]
category: technical
language: zh-CN
audience: developers
complexity: advanced
---

# AI-Family 家庭生态模块 · 单元测试用例

> 覆盖 AI-Family 家庭生态层 **8 位家人角色** + **13 个 Zustand Slices** + **家庭娱乐音乐系统** + **多模态情感引擎**。难度 Expert 级，测试需覆盖角色个性/记忆/家庭关系/语音交互/音乐推荐/情感流状态机。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 家人角色覆盖 | 8/8（爸/妈/哥/妹/爷/奶/宠物/管家） |
| Zustand Slice | 13/13 全部 getState/setState 路径 |
| 情感引擎 | 8 种基础情绪 × 3 种强度（平和/激动/极端） |
| 音乐系统 | VPP 黑胶播放 + 智能歌单 + 情感匹配 |
| 语句覆盖 | ≥ 80% |

---

## 二、8 位家人角色定义

| # | 角色 ID | 中文名 | 人设关键词 | 声线/音色 | 默认模型偏好 |
|:-:|:--------|:------|:----------|:---------|:------------|
| 1 | `FATHER` | 严父 | 理性/数据驱动/工程专家 | 男低音 沉稳 | Ollama qwen2.5:14b |
| 2 | `MOTHER` | 慈母 | 关怀/情感/健康守护 | 女中音 温暖 | 智谱 glm-4-flash |
| 3 | `BROTHER` | 哥哥 | 极客/开发/开源爱好者 | 男声 阳光 | DeepSeek V3 |
| 4 | `SISTER` | 妹妹 | 艺术/设计/创意灵感 | 女声 清脆 | 智谱 glm-4v |
| 5 | `GRANDFA` | 爷爷 | 历史/智慧/故事讲述 | 男声 沧桑 | Ollama qwen:7b |
| 6 | `GRANDMA` | 奶奶 | 烹饪/家务/节气民俗 | 女声 慈祥 | 本地 small |
| 7 | `PET` | 宠物 (橘猫YY) | 拟声/表情包/简单应答 | 合成喵音 | 轻量本地 |
| 8 | `BUTLER` | AI 管家 | 中立/调度/任务协调 | 中性 标准 | 按任务路由 |

---

## 三、13 个 Zustand Slices 清单与测试重点

```
AI-Family Store (组合 Slices)
├──  1. family-member-slice     成员 CRUD / 人设 / 模型路由
├──  2. family-settings-slice   全局家庭设定 / 风格 / 时区
├──  3. family-message-slice    家庭聊天消息流 / 已读回执
├──  4. family-memories-slice   长期记忆向量库索引 / 召回
├──  5. family-medals-slice     成就徽章 / 成长积分
├──  6. family-moments-slice    家庭瞬间 / 时间轴 / 照片
├──  7. family-voice-slice      语音会话 / TTS 配置 / VAD 端点
├──  8. family-music-slice      音乐偏好 / 歌单 / 播放历史
├──  9. family-emotion-slice    情绪状态机 / 情绪流 / 影响因子
├── 10. family-relationship-slice 成员关系图 / 亲密度 / 互动
├── 11. family-calendar-slice   家庭日历 / 节气 / 生日提醒
├── 12. family-health-slice     健康档案 / 运动 / 睡眠 / 饮食
└── 13. family-scenario-slice   场景模式 (早安/晚餐/电影/睡前)
```

### 3.1 每个 Slice 至少 3 组断言模板

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { create } from "zustand";
import {
  familyMemberSlice,
  type FamilyMember,
} from "../store/ai-family/family-member-slice";

describe("Slice #1 · family-member-slice", () => {
  let useStore: ReturnType<typeof create>;

  beforeEach(() => {
    useStore = create((...a) => ({ ...familyMemberSlice(...a) }));
    vi.clearAllMocks();
  });

  describe("数据结构正确", () => {
    it("初始 8 位默认家人存在", () => {
      const { members } = useStore.getState();
      expect(members).toHaveLength(8);
      expect(members.map((m) => m.roleId).sort()).toEqual([
        "BROTHER","BUTLER","FATHER","GRANDMA","GRANDFA","MOTHER","PET","SISTER",
      ]);
    });
  });

  describe("更新人设", () => {
    it("updateMemberPersona 只允许覆盖白名单字段", () => {
      const id = useStore.getState().members[0].id;
      useStore.getState().updateMemberPersona(id, { name: "爸", invalidField: "x" });
      const m = useStore.getState().members.find((x) => x.id === id)!;
      expect(m.name).toBe("爸");
      expect((m as any).invalidField).toBeUndefined();
    });
  });

  describe("模型路由", () => {
    it("BUTLER 按任务类型 dispatch: code→BROTHER模型，art→SISTER模型", () => {
      const route = useStore.getState().resolveProviderForTask;
      expect(route("code-review").roleId).toBe("BROTHER");
      expect(route("logo-design").roleId).toBe("SISTER");
    });
  });
});
```

---

## 四、8 位家人角色组件测试

### 4.1 `FamilyModelSettings` · 家人模型设定总页（路由调度）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 8 位家人卡片网格（头像/角色/名称/当前模型/延迟/启用状态） |
| **i18n 中文** | 角色名中文（"严父"、"慈母"、"哥哥"、"妹妹"...）而非 ID |
| **用户交互** | 点击卡片 → 展开参数抽屉；温度/TopP 滑块；保存 → dispatch(updateModelCfg) |

**现有测试：** `src/app/__tests__/FamilyModelSettings.test.tsx`

---

### 4.2 `FamilyUISettings` · 家庭 UI 主题定制

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 4 大风格预设（温馨原木/赛博极客/北欧简约/中式古典）；预览窗 |
| **数据流** | 选择预设 → CSS var 实时注入；保存 → localStorage 持久化 |
| **用户交互** | 自定义主色 → ColorPicker 联动；字体大小滑块（12-20px） |

**现有测试：** `src/app/__tests__/FamilyUISettings.test.tsx`

---

### 4.3 `FamilyVoiceSystem` · 家庭语音系统（VAD + TTS）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 麦克风大按钮 + 说话人切换器（8 角色）+ 语音波形可视化 + 历史转录 |
| **数据流** | VAD 检测 → 语音片段录制；停止 → 调用 mock Whisper STT；返回文本 |
| **用户交互** | 长按录音；松开 → 结束并转写；说话人切换 → TTS voice 变化 |

**现有测试：** `src/app/__tests__/FamilyVoiceSystem.test.tsx` + `useAudioEngine.test.ts` + `useAudioEngine.test.tsx`

```typescript
describe("FamilyVoiceSystem · 8 位家人 TTS 声线切换", () => {
  it("切换到 PET 橘猫 → TTS 引擎使用 cat-meow synth", async () => {
    const ttsSpeak = vi.fn();
    vi.mock("../../hooks/useAudioEngine", () => ({
      useAudioEngine: () => ({ speak: ttsSpeak, voices: VOICE_MAP }),
    }));
    render(<FamilyVoiceSystem />);
    fireEvent.click(screen.getByTestId("yyc3-fam-voice-speaker-PET"));
    fireEvent.click(screen.getByTestId("yyc3-fam-voice-tts-play"));
    await waitFor(() => {
      expect(ttsSpeak).toHaveBeenCalledWith(expect.objectContaining({
        voice: expect.stringMatching(/cat|meow|pet/i),
      }));
    });
  });
});
```

---

### 4.4 `EmotionVisualizer` · 情感可视化器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 8 位家人情绪球（颜色/大小/振频映射情绪值）+ 关系连线（亲密度） |
| **数据流** | emotion-slice state 变化 → 球颜色 HSL 同步；激动态 scale 放大 |
| **用户交互** | 点击某情绪球 → 弹出该角色最近情绪时间线；播放情绪变化动画 |

**现有测试：** `src/app/__tests__/EmotionVisualizer.test.tsx` + `MultimodalEmotionEngine.test.ts`

---

### 4.5 `VinylPhotoPlayer` (VPP) · 黑胶-家庭照片音乐播放器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 旋转黑胶（CSS animation 33 rpm）+ 封面照片 + 歌曲信息 + 唱臂过渡动画 |
| **数据流** | play → vinyl rotate 启用；pause → animation-play-state=paused |
| **用户交互** | 下一首/上一首；音量滑块；封面点击翻转（照片正反面）；LRC 歌词行高亮 |

**现有测试：** `src/app/__tests__/VinylPhotoPlayer.test.tsx` + `VinylPhotoPlayer.integration.test.tsx` + `useMusicPlayer.test.ts`

---

### 4.6 `SmartPlaylistGenerator` · 智能歌单生成器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 种子（心情/活动/时段/家人在场）+ 生成按钮 + 生成歌单预览 10 首 |
| **数据流** | 种子参数 → 算法推荐分数；≥ 0.75 阈值进入歌单；按 BPM 升序排序 |
| **用户交互** | 生成进度条；替换不满意曲目；保存到 family-music-slice |

**现有测试：** `src/app/__tests__/SmartPlaylistGenerator.test.ts` + `FamilyMusic.integration.test.tsx` + `dmusic-resources.test.ts`

---

### 4.7 `MultimodalEmotionEngine` · 多模态情感引擎（纯函数核心）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 单元测试（非组件）：5 大输入源 → 情绪合成公式 |
| **数据流** | 输入：文本情感分 + 语音韵律 + 音乐 BPM + 时间生物节律 + 历史情感滑动平均 → 输出：8×3 情绪矩阵 |
| **状态机** | happy(平和) → happy(激动) 阈值 0.7；sad → angry 需要触发词"指责/失望" |

**现有测试：** `src/app/__tests__/MultimodalEmotionEngine.test.ts` + `useEmotionMusic.test.ts` + `MusicEventBus.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { synthesizeEmotion, emotionStateMachine } from "../lib/multimodal-emotion";

describe("MultimodalEmotionEngine · 情感合成公式", () => {
  it("文本=正向+音乐=120BPM(活泼)+晚上=精力低 => 综合 happy 平和", () => {
    const e = synthesizeEmotion({
      textSentiment: { positive: 0.8, negative: 0.1 },
      voicePitch: "neutral",
      musicBPM: 120,
      circadian: "evening-low-energy",
      historyEMA: [{ joy: 0.6, t: Date.now() - 60000 }],
    });
    expect(e.primary).toBe("joy");
    expect(e.intensity).toBe("calm"); // 晚上精力低 → 不达到 excited
  });
});

describe("情感状态机迁移", () => {
  it("joy(calm) + 触发词'中奖'+ 0.8 强度 → joy(excited)", () => {
    const next = emotionStateMachine(
      { emotion: "joy", intensity: "calm" },
      { type: "trigger-word", word: "中奖", score: 0.85 }
    );
    expect(next).toEqual({ emotion: "joy", intensity: "excited" });
  });
});
```

---

### 4.8 家庭场景模式 Scenario 集成测试

| 套件 | 关键断言 |
|:-----|:--------|
| **早安模式** | 07:00 → 音乐 BPM 80-100（爵士/民谣）；窗帘开；咖啡机任务；父亲播报日程 |
| **晚餐模式** | 18:30 → 暖色调灯光；背景音乐 BPM 60-80；奶奶推荐菜谱；聊天话题"今日见闻" |
| **电影模式** | 20:00 → 关灯；低蓝光；音量降；提示语"把手机调静音"；管家统一调度 |

**现有测试：** `src/app/__tests__/ai-family.test.ts` + `ai-family-hotel.test.ts` + `ai-family-hotel-scenarios.test.ts` + `lib/yyc3-core-aifamily.test.ts`

---

## 五、13 Zustand Slices 专项测试汇总（每个至少 3 套件）

| # | Slice | 套件 A（数据结构） | 套件 B（核心动作） | 套件 C（边界/持久化） |
|:-:|:------|:-----------------|:----------------|:-------------------|
| 1 | family-member | 8 家人存在 | updateMemberPersona 白名单 | 非法 roleId 拒绝 |
| 2 | family-settings | 默认预设 4 套 | applyPreset → theme.css 变化 | 非法 preset 名 fallback |
| 3 | family-message | empty→length=0 | sendMessage + reply AI 模拟 | 超长 4000 字截断 |
| 4 | family-memories | empty→0 | addMemory + vectorId 生成 | topK 召回阈值测试 |
| 5 | family-medals | 初始 0 | unlockMedal("first-chat") 幂等 | 重复解锁不重复积分 |
| 6 | family-moments | 空时间轴 | addMoment{photo+caption} | 时间倒序排序正确 |
| 7 | family-voice | voice=BUTLER 默认 | setVoice(ROLE) + TTS 缓存 | 无效角色 ID 拒绝 |
| 8 | family-music | 默认歌单 50 首 | enqueue/dequeue/循环模式 | 重复去重不重复添加 |
| 9 | family-emotion | 默认 8 情绪 neutral/calm | triggerEmotion 迁移 | 极端强度自动回落 10min |
| 10 | family-relationship | 亲密度初始 50/100 | interact(A→B,"gift") 亲密度 +X | 上限 100、下限 0 |
| 11 | family-calendar | 今年节气列表准确 | addBirthday + 提醒开关 | 农历转换断言 |
| 12 | family-health | 步数=0/睡眠=0h | logStep(8000) 成就触发 | BMI 计算(身高体重) |
| 13 | family-scenario | 默认 idle | activate("morning") 调度回调 | 场景冲突互斥（电影/睡眠） |

---

## 六、现有测试文件清单（AI-Family 模块）

### 组件测试（8 组件）
| # | 组件 | 测试文件路径 |
|:-:|:-----|:------------|
| 1 | FamilyModelSettings | `src/app/__tests__/FamilyModelSettings.test.tsx` |
| 2 | FamilyUISettings | `src/app/__tests__/FamilyUISettings.test.tsx` |
| 3 | FamilyVoiceSystem | `src/app/__tests__/FamilyVoiceSystem.test.tsx` |
| 4 | EmotionVisualizer | `src/app/__tests__/EmotionVisualizer.test.tsx` |
| 5 | VinylPhotoPlayer | `src/app/__tests__/VinylPhotoPlayer.test.tsx` |
| 6 | VinylPhotoPlayer (集成) | `src/app/__tests__/VinylPhotoPlayer.integration.test.tsx` |
| 7 | FamilyMusic (集成) | `src/app/__tests__/FamilyMusic.integration.test.tsx` |
| 8 | SmartPlaylistGenerator | `src/app/__tests__/SmartPlaylistGenerator.test.ts` |

### Store / Engine / Hook 支撑（13 Slices + 多模态）
```
src/app/__tests__/
├── ai-family.test.ts                         ← 核心 13 Slice 场景主测试
├── ai-family-hotel.test.ts                   ← 行业扩展（酒店管家）
├── ai-family-hotel-scenarios.test.ts
├── MultimodalEmotionEngine.test.ts           ← 情感引擎纯函数
├── useAudioEngine.test.ts                    ← VAD/TTS
├── useAudioEngine.test.tsx
├── useEmotionMusic.test.ts                   ← 情感→音乐匹配
├── useMusicPlayer.test.ts
├── MusicEventBus.test.ts                     ← 音乐事件总线
├── dmusic-resources.test.ts
├── lib/yyc3-core-aifamily.test.ts            ← 核心家族能力
├── lib/family-db-bridge.test.ts              ← 家庭 DB 桥
└── lib/multimodal-emotion-impl.test.ts
```

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · AI-Family Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
