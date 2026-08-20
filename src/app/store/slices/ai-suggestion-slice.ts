/**
 * @file: ai-suggestion-slice.ts
 * @description: AI 辅助决策 Zustand Slice · 异常模式检测与智能推荐
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-18
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[ai]
 *
 * @brief: AI 辅助决策 Zustand Store（替代 useAISuggestion.ts 中的 createLocalStore）
 *
 * @details:
 * - 从 useAISuggestion.ts 迁移，保持相同数据和业务逻辑
 * - persist 仅保存 patterns + recommendations（运行时状态不持久化）
 * - toast 副作用保留在 slice actions 内
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { DetectedPattern, AIRecommendation } from '../../types';
import { migrateKey } from '../../lib/migrate-storage';

// ============================================================
// 默认种子数据
// ============================================================

const now = Date.now();

const DEFAULT_PATTERNS: DetectedPattern[] = [
  {
    id: 'pat-1',
    type: 'latency_spike',
    severity: 'high',
    title: 'GPU-A100-03 推理延迟持续异常',
    description: '过去 1 小时内连续 3 次延迟 > 2000ms，平均延迟 2,450ms',
    source: 'GPU-A100-03',
    metric: '2,450ms > 2,000ms 阈值',
    detectedAt: now - 15 * 60000,
    occurrences: 3,
    trend: 'rising',
  },
  {
    id: 'pat-2',
    type: 'memory_pressure',
    severity: 'medium',
    title: 'GPU-A100-03 显存压力过大',
    description: '显存使用率持续 89%+ ，接近 OOM 阈值',
    source: 'GPU-A100-03',
    metric: '89% > 85% 阈值',
    detectedAt: now - 30 * 60000,
    occurrences: 5,
    trend: 'stable',
  },
  {
    id: 'pat-3',
    type: 'storage_near_full',
    severity: 'medium',
    title: 'NAS 存储空间接近阈值',
    description: 'NAS-Storage-01 已使用 85.8%，预计 7 天后达到 90% 告警线',
    source: 'NAS-Storage-01',
    metric: '85.8% → 预计 7 天达 90%',
    detectedAt: now - 2 * 3600000,
    occurrences: 1,
    trend: 'rising',
  },
  {
    id: 'pat-4',
    type: 'gpu_overheat',
    severity: 'critical',
    title: 'GPU-H100-02 温度过高',
    description: 'GPU 核心温度 85°C，超过安全阈值 80°C，风扇已满速运行',
    source: 'GPU-H100-02',
    metric: '85°C > 80°C 安全阈值',
    detectedAt: now - 5 * 60000,
    occurrences: 2,
    trend: 'rising',
  },
  {
    id: 'pat-5',
    type: 'throughput_drop',
    severity: 'low',
    title: '推理吞吐量波动',
    description: '最近 30 分钟 Token 吞吐量下降 12.3%，可能受任务调度影响',
    source: '集群整体',
    metric: '138K/s → 121K/s (↓12.3%)',
    detectedAt: now - 20 * 60000,
    occurrences: 1,
    trend: 'declining',
  },
];

const DEFAULT_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-1',
    patternId: 'pat-1',
    action: '迁移模型到 GPU-A100-07',
    description: 'GPU-A100-07 当前负载 15%，迁移 LLaMA-70B 后预计延迟降至 800ms',
    impact: 'high',
    confidence: 92,
    autoExecutable: true,
  },
  {
    id: 'rec-2',
    patternId: 'pat-1',
    action: '重启 GPU-A100-03 推理服务',
    description: '重启推理服务以清理内存碎片，预计恢复延迟到正常水平',
    impact: 'medium',
    confidence: 78,
    autoExecutable: true,
  },
  {
    id: 'rec-3',
    patternId: 'pat-2',
    action: '启用动态显存分配',
    description: '减小 batch_size 从 32 到 16，降低显存占用约 30%',
    impact: 'medium',
    confidence: 85,
    autoExecutable: true,
  },
  {
    id: 'rec-4',
    patternId: 'pat-3',
    action: '清理历史日志归档',
    description: '删除 30 天前的推理日志，预计释放 8.2GB 空间',
    impact: 'low',
    confidence: 95,
    autoExecutable: true,
  },
  {
    id: 'rec-5',
    patternId: 'pat-3',
    action: '扩容 NAS 存储卷',
    description: '从 48TB 扩容到 64TB，需要手动操作 RAID 配置',
    impact: 'high',
    confidence: 88,
    autoExecutable: false,
  },
  {
    id: 'rec-6',
    patternId: 'pat-4',
    action: '降低 GPU-H100-02 工作频率',
    description: '将 GPU 频率从 1.8GHz 降至 1.5GHz，温度预计下降 10°C',
    impact: 'high',
    confidence: 90,
    autoExecutable: true,
  },
  {
    id: 'rec-7',
    patternId: 'pat-4',
    action: '将任务从 GPU-H100-02 迁出',
    description: '临时将所有推理任务迁移到其他节点，让 GPU 冷却',
    impact: 'high',
    confidence: 95,
    autoExecutable: true,
  },
  {
    id: 'rec-8',
    patternId: 'pat-5',
    action: '启用动态负载均衡',
    description: '开启跨节点负载均衡，自动将任务分配到空闲节点',
    impact: 'medium',
    confidence: 72,
    autoExecutable: true,
  },
];

// ============================================================
// Slice Interface
// ============================================================

interface AISuggestionSlice {
  patterns: DetectedPattern[];
  recommendations: AIRecommendation[];
  isAnalyzing: boolean;
  lastAnalyzedAt: number;
  enabledAutoSuggestion: boolean;

  runAnalysis: () => Promise<void>;
  applyRecommendation: (recId: string) => Promise<void>;
  dismissRecommendation: (recId: string) => void;
  dismissPattern: (patternId: string) => void;
  setEnabledAutoSuggestion: (enabled: boolean) => void;
}

// ============================================================
// Store
// ============================================================

export const useAISuggestionSlice = create<AISuggestionSlice>()(
  persist(
    (set, get) => ({
      patterns: DEFAULT_PATTERNS,
      recommendations: DEFAULT_RECOMMENDATIONS,
      isAnalyzing: false,
      lastAnalyzedAt: now - 5 * 60000,
      enabledAutoSuggestion: true,

      runAnalysis: async () => {
        set({ isAnalyzing: true });
        toast.info('AI 正在分析系统状态...');
        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1500));
        set({ lastAnalyzedAt: Date.now(), isAnalyzing: false });
        toast.success('AI 分析完成', { description: `检测到 ${get().patterns.length} 个异常模式` });
      },

      applyRecommendation: async (recId) => {
        const rec = get().recommendations.find((r) => r.id === recId);
        if (!rec) { return; }
        toast.info(`正在执行: ${rec.action}`);
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));
        set((s) => ({
          recommendations: s.recommendations.map((r) =>
            r.id === recId ? { ...r, applied: true } : r
          ),
        }));
        toast.success(`已应用: ${rec.action}`);
      },

      dismissRecommendation: (recId) => {
        set((s) => ({
          recommendations: s.recommendations.filter((r) => r.id !== recId),
        }));
        toast.info('建议已忽略');
      },

      dismissPattern: (patternId) => {
        set((s) => ({
          patterns: s.patterns.filter((p) => p.id !== patternId),
          recommendations: s.recommendations.filter((r) => r.patternId !== patternId),
        }));
        toast.info('异常模式已忽略');
      },

      setEnabledAutoSuggestion: (enabled) => {
        set({ enabledAutoSuggestion: enabled });
      },
    }),
    {
      name: 'yyc3-ai-suggestion',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        patterns: state.patterns,
        recommendations: state.recommendations,
      }),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyAISuggestion(): boolean {
  let migrated = false;
  migrated = migrateKey<DetectedPattern[]>('yyc3_ai_patterns', (v) => useAISuggestionSlice.setState({ patterns: v })) || migrated;
  migrated = migrateKey<AIRecommendation[]>('yyc3_ai_recommendations', (v) => useAISuggestionSlice.setState({ recommendations: v })) || migrated;
  return migrated;
}
