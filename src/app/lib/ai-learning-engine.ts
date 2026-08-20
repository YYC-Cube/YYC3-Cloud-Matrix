/**
 * @file: ai-learning-engine.ts
 * @description: AI Family酒店人 - 学习引擎与质量优化系统
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai, learning, optimization, feedback, quality]
 *
 * @brief: 让AI从历史交互中学习，持续优化服务质量
 * - 反馈收集与分析
 * - 响应质量评估
 * - 自动优化策略
 * - 个性化调整
 */




// ============================================================
// 类型定义
// ============================================================

export interface InteractionFeedback {
  id: string;
  interactionId: string;
  staffId: string;
  messageId: string;
  
  // 反馈类型
  type: "satisfaction" | "accuracy" | "helpfulness" | "tone" | "speed";
  
  // 评分（1-5星或1-10分）
  rating: number;
  
  // 详细反馈
  comment?: string;
  
  // 元数据
  timestamp: number;
  source: "guest" | "staff" | "manager" | "system";
  context?: {
    guestTier?: string;
    issueType?: string;
    resolutionTimeMs?: number;
  };
}

export interface QualityMetrics {
  staffId: string;
  period: {
    start: number;
    end: number;
  };
  
  // 核心指标
  totalInteractions: number;
  averageSatisfaction: number;      // 0-100
  averageAccuracy: number;          // 0-100
  averageHelpfulness: number;       // 0-100
  averageResponseTime: number;      // ms
  
  // 细分指标
  satisfactionDistribution: Record<number, number>;  // 1-5星的分布
  resolutionRate: number;           // 问题解决率
  escalationRate: number;          // 升级率
  repeatContactRate: number;       // 重复联系率
  
  // 趋势数据
  trend: "improving" | "stable" | "declining";
  improvementPercentage: number;   // 相比上一周期的改善百分比
}

export interface LearningInsight {
  id: string;
  type: "strength" | "weakness" | "opportunity" | "pattern";
  title: string;
  description: string;
  confidence: number;              // 0-100
  impact: "high" | "medium" | "low";
  actionableRecommendations: string[];
  affectedStaffIds: string[];
  generatedAt: number;
}

export interface PersonalizationProfile {
  staffId: string;
  
  // 个性化参数（基于学习结果动态调整）
  adjustedTemperature: number;
  adjustedResponseLength: "concise" | "moderate" | "detailed";
  preferredPhrases: string[];
  avoidedPhrases: string[];
  
  // 学习到的模式
  successfulPatterns: Array<{
    pattern: string;
    successRate: number;
    usageCount: number;
  }>;
  
  // 需要改进的领域
  improvementAreas: string[];
  
  lastUpdated: number;
  version: number;
}

// ============================================================
// 学习引擎类
// ============================================================

export class AILearningEngine {
  private feedbackRecords: Map<string, InteractionFeedback> = new Map();
  private qualityHistory: Map<string, QualityMetrics[]> = new Map();
  private personalizationProfiles: Map<string, PersonalizationProfile> = new Map();
  private insights: LearningInsight[] = [];
  
  private config: {
    minFeedbackForAnalysis: number;
    autoOptimizationEnabled: boolean;
    learningRate: number;
    insightGenerationInterval: number;
  };

  constructor(config?: Partial<typeof AILearningEngine.prototype.config>) {
    this.config = {
      minFeedbackForAnalysis: config?.minFeedbackForAnalysis || 10,
      autoOptimizationEnabled: config?.autoOptimizationEnabled ?? true,
      learningRate: config?.learningRate || 0.3,
      insightGenerationInterval: config?.insightGenerationInterval || 3600000, // 1小时
    };

    // 启动定期洞察生成
    if (typeof window !== "undefined") {
      setInterval(() => this.generateInsights(), this.config.insightGenerationInterval);
    }
  }

  // ========== 公共 API ==========

  /**
   * 记录反馈
   */
  recordFeedback(feedback: Omit<InteractionFeedback, "id" | "timestamp">): InteractionFeedback {
    const fullFeedback: InteractionFeedback = {
      ...feedback,
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    };

    this.feedbackRecords.set(fullFeedback.id, fullFeedback);

    // 触发自动优化（如果启用）
    if (this.config.autoOptimizationEnabled) {
      this.triggerAutoOptimization(fullFeedback.staffId);
    }

    return fullFeedback;
  }

  /**
   * 批量记录反馈
   */
  recordFeedbackBatch(feedbacks: Omit<InteractionFeedback, "id" | "timestamp">[]): InteractionFeedback[] {
    return feedbacks.map(f => this.recordFeedback(f));
  }

  /**
   * 计算员工质量指标
   */
  calculateQualityMetrics(
    staffId: string,
    periodDays: number = 7
  ): QualityMetrics {
    const now = Date.now();
    const periodStart = now - (periodDays * 24 * 60 * 60 * 1000);

    // 筛选该员工在指定时间段的反馈
    const relevantFeedbacks = Array.from(this.feedbackRecords.values()).filter(f =>
      f.staffId === staffId &&
      f.timestamp >= periodStart &&
      f.timestamp <= now
    );

    // 如果没有足够的数据，返回默认值
    if (relevantFeedbacks.length < this.config.minFeedbackForAnalysis) {
      return this.getDefaultQualityMetrics(staffId, periodStart, now);
    }

    // 计算各项指标
    const satisfactionFeedbacks = relevantFeedbacks.filter(f => f.type === "satisfaction");
    const accuracyFeedbacks = relevantFeedbacks.filter(f => f.type === "accuracy");
    const helpfulnessFeedbacks = relevantFeedbacks.filter(f => f.type === "helpfulness");

    const avgSatisfaction = this.calculateAverage(satisfactionFeedbacks.map(f => f.rating)) * 20; // 转换为0-100
    const avgAccuracy = this.calculateAverage(accuracyFeedbacks.map(f => f.rating)) * 20;
    const avgHelpfulness = this.calculateAverage(helpfulnessFeedbacks.map(f => f.rating)) * 20;

    // 满意度分布
    const satisfactionDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    satisfactionFeedbacks.forEach(f => {
      const starRating = Math.ceil(f.rating / 2); // 将10分制转换为5星制
      satisfactionDistribution[Math.min(Math.max(starRating, 1), 5)]++;
    });

    // 计算趋势
    const previousMetrics = this.getPreviousPeriodMetrics(staffId, periodDays);
    const trend = this.calculateTrend(avgSatisfaction, previousMetrics.averageSatisfaction);
    const improvementPercent = previousMetrics.averageSatisfaction > 0
      ? ((avgSatisfaction - previousMetrics.averageSatisfaction) / previousMetrics.averageSatisfaction) * 100
      : 0;

    const metrics: QualityMetrics = {
      staffId,
      period: { start: periodStart, end: now },
      totalInteractions: relevantFeedbacks.length,
      averageSatisfaction: Math.round(avgSatisfaction),
      averageAccuracy: Math.round(avgAccuracy),
      averageHelpfulness: Math.round(avgHelpfulness),
      averageResponseTime: this.calculateAverageResponseTime(relevantFeedbacks),
      satisfactionDistribution,
      resolutionRate: this.calculateResolutionRate(relevantFeedbacks),
      escalationRate: this.calculateEscalationRate(relevantFeedbacks),
      repeatContactRate: this.calculateRepeatContactRate(staffId, relevantFeedbacks),
      trend,
      improvementPercentage: Math.round(improvementPercent * 100) / 100,
    };

    // 保存到历史
    if (!this.qualityHistory.has(staffId)) {
      this.qualityHistory.set(staffId, []);
    }
    this.qualityHistory.get(staffId)!.push(metrics);

    return metrics;
  }

  /**
   * 获取个性化配置文件
   */
  getPersonalizationProfile(staffId: string): PersonalizationProfile {
    let profile = this.personalizationProfiles.get(staffId);

    if (!profile) {
      profile = this.initializePersonalizationProfile(staffId);
      this.personalizationProfiles.set(staffId, profile);
    }

    return profile;
  }

  /**
   * 更新个性化配置（应用学习成果）
   */
  updatePersonalizationFromLearning(staffId: string): PersonalizationProfile {
    const metrics = this.calculateQualityMetrics(staffId);
    const currentProfile = this.getPersonalizationProfile(staffId);

    // 根据满意度调整temperature
    if (metrics.averageSatisfaction < 70) {
      // 满意度低 → 降低随机性，更保守
      currentProfile.adjustedTemperature = Math.max(
        0.3,
        currentProfile.adjustedTemperature - (this.config.learningRate * 0.2)
      );
    } else if (metrics.averageSatisfaction > 85) {
      // 满意度高 → 可以更有创意
      currentProfile.adjustedTemperature = Math.min(
        1.0,
        currentProfile.adjustedTemperature + (this.config.learningRate * 0.1)
      );
    }

    // 根据响应长度偏好调整
    if (metrics.trend === "declining") {
      // 表现下降 → 尝试更简洁的回复
      currentProfile.adjustedResponseLength = "concise";
    } else if (metrics.trend === "improving" && metrics.averageSatisfaction > 80) {
      // 表现良好且满意度高 → 可以提供详细信息
      currentProfile.adjustedResponseLength = "detailed";
    }

    // 识别成功模式
    const successfulPatterns = this.identifySuccessfulPatterns(staffId);
    currentProfile.successfulPatterns = successfulPatterns;

    // 识别需要改进的领域
    currentProfile.improvementAreas = this.identifyImprovementAreas(metrics);

    currentProfile.lastUpdated = Date.now();
    currentProfile.version++;

    this.personalizationProfiles.set(staffId, currentProfile);

    return currentProfile;
  }

  /**
   * 获取学习洞察
   */
  getInsights(options?: {
    type?: LearningInsight["type"];
    impact?: LearningInsight["impact"];
    limit?: number;
  }): LearningInsight[] {
    let filtered = [...this.insights];

    if (options?.type) {
      filtered = filtered.filter(i => i.type === options.type);
    }

    if (options?.impact) {
      filtered = filtered.filter(i => i.impact === options.impact);
    }

    // 按置信度和影响排序
    filtered.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) {return impactDiff;}
      return b.confidence - a.confidence;
    });

    return options?.limit ? filtered.slice(0, options.limit) : filtered;
  }

  /**
   * 应用个性化设置到AI请求参数
   */
  applyPersonalizationToRequest(
    staffId: string,
    baseParams: {
      temperature?: number;
      maxTokens?: number;
    }
  ): typeof baseParams {
    const profile = this.getPersonalizationProfile(staffId);
    
    return {
      temperature: profile.adjustedTemperature,
      maxTokens: baseParams.maxTokens,
    };
  }

  /**
   * 获取学习统计摘要
   */
  getLearningSummary(): {
    totalFeedbackRecords: number;
    totalStaffTracked: number;
    totalInsightsGenerated: number;
    averageSatisfactionAcrossAllStaff: number;
    topPerformers: string[];
    needsAttention: string[];
    mostCommonImprovementArea: string;
  } {
    const allFeedbacks = Array.from(this.feedbackRecords.values());
    const allStaffIds = new Set(allFeedbacks.map(f => f.staffId));

    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    const staffAvgSatisfaction: Map<string, number> = new Map();

    for (const staffId of allStaffIds) {
      const staffFeedbacks = allFeedbacks.filter(f => 
        f.staffId === staffId && f.type === "satisfaction"
      );
      
      if (staffFeedbacks.length > 0) {
        const avg = this.calculateAverage(staffFeedbacks.map(f => f.rating)) * 20;
        staffAvgSatisfaction.set(staffId, avg);
        totalSatisfaction += avg;
        satisfactionCount++;
      }
    }

    const sortedStaff = Array.from(staffAvgSatisfaction.entries())
      .sort((a, b) => b[1] - a[1]);

    const topPerformers = sortedStaff.slice(0, 3).map(([id]) => id);
    const needsAttention = sortedStaff.slice(-3).map(([id]) => id).reverse();

    // 最常见的改进领域
    const areaCounts = new Map<string, number>();
    for (const [, profile] of this.personalizationProfiles) {
      profile.improvementAreas.forEach(area => {
        areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
      });
    }
    const mostCommonArea = Array.from(areaCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "暂无数据";

    return {
      totalFeedbackRecords: allFeedbacks.length,
      totalStaffTracked: allStaffIds.size,
      totalInsightsGenerated: this.insights.length,
      averageSatisfactionAcrossAllStaff: satisfactionCount > 0 
        ? Math.round(totalSatisfaction / satisfactionCount) 
        : 0,
      topPerformers,
      needsAttention,
      mostCommonImprovementArea: mostCommonArea,
    };
  }

  // ========== 私有方法 ==========

  private triggerAutoOptimization(staffId: string): void {
    // 检查是否有足够的反馈进行分析
    const staffFeedbacks = Array.from(this.feedbackRecords.values())
      .filter(f => f.staffId === staffId);

    if (staffFeedbacks.length >= this.config.minFeedbackForAnalysis) {
      // 异步执行优化（避免阻塞）
      setTimeout(() => {
        this.updatePersonalizationFromLearning(staffId);
      }, 0);
    }
  }

  private generateInsights(): void {
    const newInsights: LearningInsight[] = [];

    // 分析所有员工的最新指标
    for (const [staffId] of this.personalizationProfiles) {
      const metrics = this.calculateQualityMetrics(staffId);

      // 生成优势洞察
      if (metrics.averageSatisfaction > 85) {
        newInsights.push({
          id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: "strength",
          title: `${staffId} 客户满意度优秀`,
          description: `该员工近期平均满意度达到 ${metrics.averageSatisfaction}%，表现优异。`,
          confidence: 90,
          impact: "high",
          actionableRecommendations: [
            "可考虑将该员工的成功经验分享给团队",
            "适合承担培训新人的任务",
            "可作为服务标杆进行推广"
          ],
          affectedStaffIds: [staffId],
          generatedAt: Date.now(),
        });
      }

      // 生成弱点洞察
      if (metrics.averageSatisfaction < 60) {
        newInsights.push({
          id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: "weakness",
          title: `${staffId} 需要关注和改进`,
          description: `该员工近期平均满意度仅为 ${metrics.averageSatisfaction}%，低于标准线。`,
          confidence: 85,
          impact: "high",
          actionableRecommendations: [
            "安排一对一辅导或再培训",
            "分析具体差评案例找出问题根源",
            "暂时减少复杂任务的分配",
            "增加监督和指导频率"
          ],
          affectedStaffIds: [staffId],
          generatedAt: Date.now(),
        });
      }

      // 生成趋势洞察
      if (metrics.trend === "declining" && Math.abs(metrics.improvementPercentage) > 10) {
        newInsights.push({
          id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: "pattern",
          title: `${staffId} 服务质量呈下降趋势`,
          description: `相比上一周期，满意度下降了 ${Math.abs(metrics.improvementPercentage)}%。`,
          confidence: 75,
          impact: "medium",
          actionableRecommendations: [
            "立即进行绩效面谈了解原因",
            "检查最近是否有特殊事件影响",
            "回顾并调整工作分配",
            "提供额外支持和资源"
          ],
          affectedStaffIds: [staffId],
          generatedAt: Date.now(),
        });
      }
    }

    // 合并新洞察（避免重复）
    this.insights = [...this.insights, ...newInsights]
      .slice(-100); // 保留最近100条洞察
  }

  private initializePersonalizationProfile(staffId: string): PersonalizationProfile {
    return {
      staffId,
      adjustedTemperature: 0.7, // 默认值
      adjustedResponseLength: "moderate",
      preferredPhrases: [],
      avoidedPhrases: [],
      successfulPatterns: [],
      improvementAreas: [],
      lastUpdated: Date.now(),
      version: 1,
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) {return 0;}
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateAverageResponseTime(feedbacks: InteractionFeedback[]): number {
    const timesWithResponse = feedbacks
      .filter(f => f.context?.resolutionTimeMs)
      .map(f => f.context!.resolutionTimeMs!);

    return timesWithResponse.length > 0
      ? Math.round(this.calculateAverage(timesWithResponse))
      : 3000; // 默认3秒
  }

  private calculateResolutionRate(feedbacks: InteractionFeedback[]): number {
    const resolved = feedbacks.filter(f => f.rating >= 4).length;
    return Math.round((resolved / feedbacks.length) * 100);
  }

  private calculateEscalationRate(_feedbacks: InteractionFeedback[]): number {
    // 这里简化处理，实际应该从其他数据源获取升级次数
    return Math.round(Math.random() * 15); // 模拟数据
  }

  private calculateRepeatContactRate(_staffId: string, _feedbacks: InteractionFeedback[]): number {
    // 简化处理：假设有10%的客人会再次联系
    return 10;
  }

  private getPreviousPeriodMetrics(staffId: string, _periodDays: number): QualityMetrics {
    const history = this.qualityHistory.get(staffId) || [];
    return history.length > 1 ? history[history.length - 2] : this.getDefaultQualityMetrics(staffId, 0, 0);
  }

  private getDefaultQualityMetrics(
    staffId: string,
    start: number,
    end: number
  ): QualityMetrics {
    return {
      staffId,
      period: { start, end },
      totalInteractions: 0,
      averageSatisfaction: 75,
      averageAccuracy: 75,
      averageHelpfulness: 75,
      averageResponseTime: 3000,
      satisfactionDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      resolutionRate: 90,
      escalationRate: 5,
      repeatContactRate: 10,
      trend: "stable",
      improvementPercentage: 0,
    };
  }

  private calculateTrend(current: number, previous: number): "improving" | "stable" | "declining" {
    if (previous === 0) {return "stable";}
    const change = ((current - previous) / previous) * 100;
    if (change > 5) {return "improving";}
    if (change < -5) {return "declining";}
    return "stable";
  }

  private identifySuccessfulPatterns(staffId: string): PersonalizationProfile["successfulPatterns"] {
    const feedbacks = Array.from(this.feedbackRecords.values())
      .filter(f => f.staffId === staffId && f.rating >= 8 && f.comment);

    // 简单的模式提取：从高评分反馈中提取关键词
    const patterns: PersonalizationProfile["successfulPatterns"] = [];
    const keywordCount = new Map<string, number>();

    feedbacks.forEach(f => {
      if (f.comment) {
        const words = f.comment.split(/[\s,。！？、；：""''（）]+/).filter(w => w.length > 1);
        words.forEach(word => {
          keywordCount.set(word, (keywordCount.get(word) || 0) + 1);
        });
      }
    });

    // 取出现频率最高的词作为成功模式
    const sortedKeywords = Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedKeywords.forEach(([word, count]) => {
      patterns.push({
        pattern: word,
        successRate: 90 + Math.random() * 10, // 模拟成功率
        usageCount: count,
      });
    });

    return patterns;
  }

  private identifyImprovementAreas(metrics: QualityMetrics): string[] {
    const areas: string[] = [];

    if (metrics.averageSatisfaction < 70) {areas.push("客户满意度待提升");}
    if (metrics.averageAccuracy < 70) {areas.push("回答准确性需改进");}
    if (metrics.averageHelpfulness < 70) {areas.push("帮助有效性不足");}
    if (metrics.averageResponseTime > 5000) {areas.push("响应速度偏慢");}
    if (metrics.escalationRate > 15) {areas.push("问题解决能力需加强");}

    return areas.length > 0 ? areas : ["整体表现良好"];
  }
}

// ============================================================
// 导出单例实例
// ============================================================

export interface AILearningEngineConfig {
  minFeedbackForAnalysis: number;
  autoOptimizationEnabled: boolean;
  learningRate: number;
}

let learningEngineInstance: AILearningEngine | null = null;

export function getAILearningEngine(config?: Partial<AILearningEngineConfig>): AILearningEngine {
  if (!learningEngineInstance) {
    learningEngineInstance = new AILearningEngine(config);
  }
  return learningEngineInstance;
}

export function resetAILearningEngine(): void {
  learningEngineInstance = null;
}
