/**
 * @file: useMusicPlayer.ts
 * @description: YYC³ 音乐播放器 Hook · 统一实现转发入口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [hook],[music],[voice]
 *
 * @brief: 音乐播放器状态机 useMusicPlayer + Web Speech 语音控制 useVoiceMusicControl
 *
 * @details:
 * - 唯一实现位于 modules/ai-family/hooks/useMusicPlayer.ts
 * - useVoiceMusicControl 供 VoiceMusicControlPanel 消费
 */

export {
  useMusicPlayer,
  useVoiceMusicControl,
  type UseMusicPlayerOptions,
  type UseMusicPlayerReturn,
  type MusicPlayerControls,
} from '../modules/ai-family/hooks/useMusicPlayer';
