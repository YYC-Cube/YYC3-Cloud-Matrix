/**
 * @file: useEmotionMusic.ts
 * @description: YYC³ 情感感知音乐 Hook · 统一实现转发入口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [hook],[emotion],[music]
 *
 * @brief: 基于 EmotionMusicBridge 的情感检测与音乐推荐 Hook
 *
 * @details:
 * - 唯一实现位于 modules/ai-family/hooks/useEmotionMusic.ts
 * - 情感类型 (EmotionType/EmotionState/EmotionMusicMapping) 从 lib/EmotionMusicBridge
 *   一并转发, 供组件以 useEmotionMusic 为单一入口消费
 */

export {
  useEmotionMusic,
  type UseEmotionMusicOptions,
  type UseEmotionMusicReturn,
} from '../modules/ai-family/hooks/useEmotionMusic';

export type {
  EmotionType,
  EmotionState,
  EmotionMusicMapping,
} from '../lib/EmotionMusicBridge';
