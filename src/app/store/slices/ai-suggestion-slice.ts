/**
 * @file: ai-suggestion-slice.ts
 * @description: AI 辅助决策 Zustand Slice · 异常模式检测与智能推荐
 * @author: YanYuCloudCube Team
 * @version: v3.0.0
 * @created: 2026-04-18
 * @updated: 2026-11-11
 * @status: active
 * @tags: [store],[slice],[ai]
 *
 * @brief: AI 辅助决策 — 基于真实数据的规则派生引擎（v3 真实化）
 *
 * @details:
 * - v3: 清除全部假种子（DEFAULT_PATTERNS / DEFAULT_RECOMMENDATIONS），
 *   runAnalysis 改为从真实数据源同步派生：
 *   · useNodeSlice — WS 推送的真实节点指标（内存/温度/状态）
 *   · useFollowUpSlice — agent 推送的真实告警工单
 * - applyRecommendation 的真实动作 = 生成一张可追踪的跟进工单（写入 follow-up-slice），
 *   不再用 setTimeout 假装执行
 * - persist version 2：旧版本持久化的假种子在 rehydrate 时自动清空
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { DetectedPattern, AIRecommendation, PatternSeverity } from '../../types';
import { migrateKey } from '../../lib/migrate-storage';
import { useNodeSlice } from './node-slice';
import { useFollowUpSlice } from './follow-up-slice';

// ============================================================
// 派生引擎（代码逻辑 ≠ 硬编码数据：阈值参考点是分析启发式，
// 所有展示值均来自真实节点指标与真实告警工单）
// ============================================================

/** 内存分析参考点（百分比） */
const MEM_HIGH = 90;
const MEM_CRITICAL = 95;
/** 温度分析参考点（摄氏度；agent 未授权 powermetrics 时上报 0，0 视为无数据不参与判定） */
const TEMP_HIGH = 80;

const PRIORITY_TO_SEVERITY: Record<string, PatternSeverity> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

export function deriveFromRealData(): { patterns: DetectedPattern[]; recommendations: AIRecommendation[] } {
  const patterns: DetectedPattern[] = [];
  const recommendations: AIRecommendation[] = [];
  const now = Date.now();

  const pushRec = (patternId: string, rec: Omit<AIRecommendation, 'id' | 'patternId'>, idx: number) => {
    recommendations.push({ id: `rec-${patternId}-${idx}`, patternId, ...rec });
  };

  // ── 来源一：真实节点指标（WS 权威快照） ──
  const nodes = useNodeSlice.getState().nodes;
  for (const node of nodes) {
    if (node.mem >= MEM_HIGH) {
      const severity: PatternSeverity = node.mem >= MEM_CRITICAL ? 'critical' : 'high';
      const patId = `pat-mem-${node.id}`;
      patterns.push({
        id: patId,
        type: 'memory_pressure',
        severity,
        title: `${node.id} 内存压力过高`,
        description: `节点 ${node.id} 内存使用率 ${node.mem.toFixed(1)}%，超过 ${MEM_HIGH}% 参考线`,
        source: node.id,
        metric: `${node.mem.toFixed(1)}% > ${MEM_HIGH}% 参考线`,
        detectedAt: now,
        occurrences: 1,
        trend: 'stable',
      });
      pushRec(patId, {
        action: `排查 ${node.id} 内存占用`,
        description: `定位 ${node.id} 上内存占用最高的进程，评估重启服务或迁移任务（当前 ${node.mem.toFixed(1)}%）`,
        impact: 'high',
        confidence: 88,
        autoExecutable: true,
      }, 0);
      pushRec(patId, {
        action: `为 ${node.id} 创建降载工单`,
        description: `减少 ${node.id} 并发任务（当前 ${node.tasks} 个），观察内存回落`,
        impact: 'medium',
        confidence: 75,
        autoExecutable: true,
      }, 1);
    }

    if (node.temp > 0 && node.temp >= TEMP_HIGH) {
      const patId = `pat-temp-${node.id}`;
      patterns.push({
        id: patId,
        type: 'gpu_overheat',
        severity: 'critical',
        title: `${node.id} 温度过高`,
        description: `节点 ${node.id} 温度 ${node.temp.toFixed(1)}°C，达到 ${TEMP_HIGH}°C 参考线`,
        source: node.id,
        metric: `${node.temp.toFixed(1)}°C >= ${TEMP_HIGH}°C 参考线`,
        detectedAt: now,
        occurrences: 1,
        trend: 'rising',
      });
      pushRec(patId, {
        action: `降低 ${node.id} 负载`,
        description: `将任务从 ${node.id} 迁出或降频运行，待温度回落至安全区间`,
        impact: 'high',
        confidence: 90,
        autoExecutable: true,
      }, 0);
    }

    if (node.status === 'warning') {
      const patId = `pat-status-${node.id}`;
      patterns.push({
        id: patId,
        type: 'error_burst',
        severity: 'medium',
        title: `${node.id} 节点状态异常`,
        description: `节点 ${node.id} 处于 warning 状态（${node.model || '无运行任务'}）`,
        source: node.id,
        metric: `status = warning`,
        detectedAt: now,
        occurrences: 1,
        trend: 'stable',
      });
      pushRec(patId, {
        action: `核查 ${node.id} 服务状态`,
        description: `检查 ${node.id} 的推理服务可达性与日志（${node.model || '服务未运行'}）`,
        impact: 'medium',
        confidence: 82,
        autoExecutable: true,
      }, 0);
    }
  }

  // ── 来源二：真实告警工单（agent 推送的 WS 告警，按来源聚合） ──
  const pendingAlerts = useFollowUpSlice.getState().followUps.filter(
    (f) => f.status === 'pending' && f.taskId.startsWith('ALERT-'),
  );
  const bySource = new Map<string, typeof pendingAlerts>();
  for (const f of pendingAlerts) {
    const list = bySource.get(f.assigneeName) || [];
    list.push(f);
    bySource.set(f.assigneeName, list);
  }
  for (const [source, list] of bySource) {
    const latest = list.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
    const topPriority = list.map((f) => f.priority).sort(
      (a, b) => (Object.keys(PRIORITY_TO_SEVERITY).indexOf(a)) - (Object.keys(PRIORITY_TO_SEVERITY).indexOf(b)),
    )[0] ?? 'low';
    const patId = `pat-alert-${source}`;
    patterns.push({
      id: patId,
      type: 'error_burst',
      severity: PRIORITY_TO_SEVERITY[topPriority] ?? 'low',
      title: `${source} 存在 ${list.length} 条未处理告警`,
      description: `最新：${latest.taskName}`,
      source,
      metric: `${list.length} 条待处理`,
      detectedAt: latest.createdAt,
      occurrences: list.length,
      trend: 'stable',
    });
    pushRec(patId, {
      action: `处理 ${source} 的告警工单`,
      description: `在「一键跟进」中完成 ${list.length} 条待处理工单并记录处置结论`,
      impact: 'high',
      confidence: 95,
      autoExecutable: true,
    }, 0);
  }

  return { patterns, recommendations };
}

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
      patterns: [],
      recommendations: [],
      isAnalyzing: false,
      lastAnalyzedAt: 0,
      enabledAutoSuggestion: true,

      runAnalysis: async () => {
        set({ isAnalyzing: true });
        toast.info('正在分析真实节点与告警数据...');
        // 同步派生（无假延迟）：微任务让出一次事件循环供 UI 渲染分析态
        await Promise.resolve();
        const { patterns, recommendations } = deriveFromRealData();
        set({ patterns, recommendations, lastAnalyzedAt: Date.now(), isAnalyzing: false });
        if (patterns.length > 0) {
          toast.success('分析完成', { description: `检测到 ${patterns.length} 个异常模式（基于真实数据）` });
        } else {
          toast.success('分析完成', { description: '未发现异常模式 — 节点指标与告警流均正常' });
        }
      },

      applyRecommendation: async (recId) => {
        const rec = get().recommendations.find((r) => r.id === recId);
        if (!rec) { return; }
        // 真实动作：生成一张可追踪的跟进工单（写入 follow-up-slice SSOT）
        const pattern = get().patterns.find((p) => p.id === rec.patternId);
        const nowTs = Date.now();
        useFollowUpSlice.getState().addFollowUp({
          taskId: `AI-${rec.id}`,
          taskName: rec.action,
          assignee: 'operator',
          assigneeName: pattern?.source ?? '系统',
          priority: pattern?.severity === 'critical' ? 'critical'
            : pattern?.severity === 'high' ? 'high'
            : pattern?.severity === 'medium' ? 'medium' : 'low',
          status: 'pending',
          dueDate: nowTs + 86400000,
          notes: `AI 决策建议落地 · ${rec.description}（置信度 ${rec.confidence}%）`,
          updatedAt: nowTs,
          category: 'maintenance',
        });
        set((s) => ({
          recommendations: s.recommendations.map((r) =>
            r.id === recId ? { ...r, applied: true } : r,
          ),
        }));
        toast.success(`已生成跟进工单: ${rec.action}`, { description: '可在「监控中心 → 一键跟进」中跟踪执行' });
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        patterns: state.patterns,
        recommendations: state.recommendations,
      }),
      // v1 持久化的是假种子数据，rehydrate 时直接清空（用户无真实数据损失）
      migrate: (persisted, version) => {
        if (version < 2) {
          return { patterns: [], recommendations: [] } as { patterns: DetectedPattern[]; recommendations: AIRecommendation[] };
        }
        return persisted as { patterns: DetectedPattern[]; recommendations: AIRecommendation[] };
      },
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
