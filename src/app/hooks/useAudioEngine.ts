/**
 * @file: useAudioEngine.ts
 * @description: YYC³ 音频引擎 Hook · 统一实现转发入口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [hook],[audio]
 *
 * @brief: Web Audio API 驱动的音频播放/分析引擎 (demo 合弦 / 文件 / 流三种模式)
 *
 * @details:
 * - 唯一实现位于 modules/ai-family/hooks/useAudioEngine.ts
 * - 类型 (AudioTrack/AudioEngineConfig/AudioEngineReturn) 随实现一并转发, 自包含无外部 music 库依赖
 */

export {
  useAudioEngine,
  type AudioTrack,
  type AudioMode,
  type AudioEngineConfig,
  type AudioEngineReturn,
} from '../modules/ai-family/hooks/useAudioEngine';
