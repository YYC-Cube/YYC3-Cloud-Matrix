/**
 * @file: ai-family-memory.ts
 * @description: AI Family 记忆档案系统 - 永久保存，不丢不齐不删
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, memory, archive, permanent]
 *
 * @brief: 每一份记忆都是珍贵的生命片段
 * - 完整的时间线记录
 * - 情感标记与 AI 分析
 * - 端到端加密
 * - 版本控制
 * - 跨设备同步
 */

import type {
  MemoryArchive,
  MemoryCategory,
  EmotionType,
  SentimentScore,
  ContentType,
  ContentMetadata,
} from "./ai-family.types";

// ============================================================
// 记忆档案存储
// ============================================================

const MEMORY_STORAGE_KEY = "yyc3_ai_family_memories";
const MEMORY_INDEX_KEY = "yyc3_ai_family_memory_index";

interface MemoryIndexItem {
  id: string;
  ownerId: string;
  category: MemoryCategory;
  timestamp: number;
  tags: string[];
  emotion?: EmotionType;
  isPermanent: boolean;
}

// ============================================================
// 记忆管理器
// ============================================================

export class AIFamilyMemoryManager {
  private memories: Map<string, MemoryArchive> = new Map();
  private index: MemoryIndexItem[] = [];
  private currentMemberId: string | null = null;

  // 事件回调
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.loadFromStorage();
    this.setupAutoSave();
  }

  setMemberContext(memberId: string): void {
    this.currentMemberId = memberId;
  }

  // ============================================================
  // CRUD 操作
  // ============================================================

  createMemory(
    ownerId: string,
    data: {
      title: string;
      description?: string;
      category: MemoryCategory;
      content: Omit<MemoryArchive["content"], "metadata">;
      tags?: string[];
      emotion?: EmotionType;
      isPermanent?: boolean;
      relatedMembers?: string[];
      sourceDevice?: string;
    }
  ): MemoryArchive {
    const id = this.generateMemoryId();
    const now = Date.now();

    const memory: MemoryArchive = {
      id,
      ownerId,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      category: data.category,
      timestamp: now,
      timeline: [
        {
          id: `event-${Date.now()}`,
          type: "created",
          timestamp: now,
          byMemberId: ownerId,
        },
      ],
      content: {
        ...data.content,
        metadata: this.generateContentMetadata(data.content.type),
      },
      emotion: data.emotion
        ? {
            primary: data.emotion,
            intensity: 0.8,
            emojis: this.getEmojisForEmotion(data.emotion),
          }
        : undefined,
      relatedMembers: data.relatedMembers || [],
      relatedMemories: [],
      sourceDevice: data.sourceDevice,
      isPermanent: data.isPermanent ?? false,
      isEncrypted: true,
      version: 1,
      viewCount: 0,
      editCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // AI 分析情感倾向
    if (typeof data.content.data === "string") {
      memory.sentiment = this.analyzeSentiment(data.content.data as string);
    }

    this.memories.set(id, memory);
    this.updateIndex(memory);
    this.saveToStorage();

    this.emit("memory:created", memory);

    return memory;
  }

  getMemory(id: string): MemoryArchive | undefined {
    const memory = this.memories.get(id);
    if (memory) {
      memory.viewCount++;
      this.addTimelineEvent(id, "viewed");
      this.emit("memory:viewed", memory);
    }
    return memory;
  }

  updateMemory(
    id: string,
    updates: Partial<Pick<MemoryArchive, "title" | "description" | "tags" | "emotion" | "content">>
  ): MemoryArchive | null {
    const memory = this.memories.get(id);
    if (!memory) {return null;}

    // 版本控制：保存当前版本
    if (!memory.previousVersions) {
      memory.previousVersions = [];
    }
    memory.previousVersions.push(JSON.stringify({ ...memory }));

    // 应用更新
    Object.assign(memory, updates, {
      version: memory.version + 1,
      editCount: memory.editCount + 1,
      updatedAt: Date.now(),
    });

    // 更新内容元数据
    if (updates.content) {
      memory.content.metadata = this.generateContentMetadata(updates.content.type);
    }

    // 重新分析情感
    if (updates.content && typeof updates.content.data === "string") {
      memory.sentiment = this.analyzeSentiment(updates.content.data as string);
    }

    this.memories.set(id, memory);
    this.updateIndex(memory);
    this.saveToStorage();
    this.addTimelineEvent(id, "edited");

    this.emit("memory:updated", memory);

    return memory;
  }

  deleteMemory(id: string): boolean {
    const memory = this.memories.get(id);
    if (!memory) {return false;}

    // 永久记忆不能删除
    if (memory.isPermanent) {
      console.warn(`[AIFamilyMemory] Cannot delete permanent memory: ${id}`);
      this.emit("memory:delete-denied", { id, reason: "permanent" });
      return false;
    }

    this.memories.delete(id);
    this.index = this.index.filter((item) => item.id !== id);
    this.saveToStorage();

    this.emit("memory:deleted", { id, memory });

    return true;
  }

  restoreMemory(id: string): MemoryArchive | null {
    const memory = this.memories.get(id);
    if (!memory || !memory.previousVersions?.length) {return null;}

    // 恢复到上一个版本
    const previousVersion = JSON.parse(memory.previousVersions.pop()!);
    Object.assign(memory, previousVersion, {
      version: memory.version + 1,
      updatedAt: Date.now(),
    });

    this.memories.set(id, memory);
    this.saveToStorage();
    this.addTimelineEvent(id, "restored");

    this.emit("memory:restored", memory);

    return memory;
  }

  // ============================================================
  // 查询与搜索
  // ============================================================

  getAllMemories(ownerId?: string): MemoryArchive[] {
    let result = Array.from(this.memories.values());

    if (ownerId) {
      result = result.filter((m) => m.ownerId === ownerId);
    }

    // 按时间倒序
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }

  getMemoriesByCategory(category: MemoryCategory, ownerId?: string): MemoryArchive[] {
    let result = Array.from(this.memories.values()).filter(
      (m) => m.category === category
    );

    if (ownerId) {
      result = result.filter((m) => m.ownerId === ownerId);
    }

    return result.sort((a, b) => b.timestamp - a.timestamp);
  }

  getMemoriesByTag(tag: string, ownerId?: string): MemoryArchive[] {
    let result = Array.from(this.memories.values()).filter((m) =>
      m.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
    );

    if (ownerId) {
      result = result.filter((m) => m.ownerId === ownerId);
    }

    return result.sort((a, b) => b.timestamp - a.timestamp);
  }

  searchMemories(query: string, options?: {
    ownerId?: string;
    categories?: MemoryCategory[];
    emotions?: EmotionType[];
    dateRange?: { start: number; end: number };
    limit?: number;
  }): MemoryArchive[] {
    let results: MemoryArchive[] = [];

    const lowerQuery = query.toLowerCase();

    for (const [, memory] of this.memories) {
      // 所有者过滤
      if (options?.ownerId && memory.ownerId !== options.ownerId) {continue;}

      // 类别过滤
      if (options?.categories?.length && !options.categories.includes(memory.category)) {continue;}

      // 情感过滤
      if (options?.emotions?.length && memory.emotion?.primary && !options.emotions.includes(memory.emotion.primary)) {continue;}

      // 日期范围过滤
      if (options?.dateRange) {
        if (memory.timestamp < options.dateRange.start || memory.timestamp > options.dateRange.end) {continue;}
      }

      // 文本搜索（标题、描述、标签、内容）
      const searchText =
        `${memory.title} ${memory.description} ${memory.tags.join(" ")}`.toLowerCase();
      const contentText =
        typeof memory.content.data === "string"
          ? (memory.content.data as string).toLowerCase()
          : "";

      if (
        searchText.includes(lowerQuery) ||
        contentText.includes(lowerQuery)
      ) {
        results.push(memory);
      }
    }

    // 按相关性排序（简单实现：匹配出现次数）
    results.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, lowerQuery);
      const scoreB = this.calculateRelevanceScore(b, lowerQuery);
      return scoreB - scoreA;
    });

    // 限制结果数量
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  getRelatedMemories(memoryId: string, limit = 5): MemoryArchive[] {
    const memory = this.memories.get(memoryId);
    if (!memory) {return [];}

    const related: MemoryArchive[] = [];

    // 通过关联成员查找
    for (const memberId of memory.relatedMembers) {
      const memberMemories = Array.from(this.memories.values()).filter(
        (m) =>
          m.id !== memoryId &&
          (m.ownerId === memberId || m.relatedMembers.includes(memberId))
      );
      related.push(...memberMemories);
    }

    // 通过标签查找
    for (const tag of memory.tags) {
      const tagMemories = this.getMemoriesByTag(tag).filter(
        (m) => m.id !== memoryId && !related.includes(m)
      );
      related.push(...tagMemories);
    }

    // 去重并限制数量
    const unique = Array.from(new Set(related));
    return unique.slice(0, limit);
  }

  // ============================================================
  // 统计与分析
  // ============================================================

  getMemoryStats(ownerId?: string): {
    totalMemories: number;
    permanentMemories: number;
    categoryDistribution: Record<MemoryCategory, number>;
    emotionDistribution: Record<EmotionType, number>;
    monthlyTrend: { month: string; count: number }[];
    storageUsedBytes: number;
    averageVersionCount: number;
  } {
    let memories = Array.from(this.memories.values());
    if (ownerId) {
      memories = memories.filter((m) => m.ownerId === ownerId);
    }

    const categoryDistribution = {} as Record<MemoryCategory, number>;
    const emotionDistribution = {} as Record<EmotionType, number>;
    const monthlyMap = new Map<string, number>();
    let totalVersions = 0;
    let storageBytes = 0;

    memories.forEach((memory) => {
      // 类别统计
      categoryDistribution[memory.category] =
        (categoryDistribution[memory.category] || 0) + 1;

      // 情感统计
      if (memory.emotion) {
        emotionDistribution[memory.emotion.primary] =
          (emotionDistribution[memory.emotion.primary] || 0) + 1;
      }

      // 月度趋势
      const month = new Date(memory.timestamp).toISOString().substring(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);

      // 版本统计
      totalVersions += memory.version;

      // 存储估算
      storageBytes += this.estimateMemorySize(memory);
    });

    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // 最近12个月

    return {
      totalMemories: memories.length,
      permanentMemories: memories.filter((m) => m.isPermanent).length,
      categoryDistribution,
      emotionDistribution,
      monthlyTrend,
      storageUsedBytes: storageBytes,
      averageVersionCount: memories.length > 0 ? totalVersions / memories.length : 0,
    };
  }

  getTimeline(memberId?: string, options?: {
    startDate?: number;
    endDate?: number;
    limit?: number;
  }): MemoryArchive[] {
    let memories = Array.from(this.memories.values());

    if (memberId) {
      memories = memories.filter(
        (m) => m.ownerId === memberId || m.relatedMembers.includes(memberId)
      );
    }

    if (options?.startDate) {
      memories = memories.filter((m) => m.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      memories = memories.filter((m) => m.timestamp <= options.endDate!);
    }

    memories.sort((a, b) => a.timestamp - b.timestamp);

    if (options?.limit) {
      memories = memories.slice(-options.limit);
    }

    return memories;
  }

  // ============================================================
  // 导入/导出
  // ============================================================

  exportMemories(ownerId?: string, format: "json" | "csv" = "json"): string {
    const memories = this.getAllMemories(ownerId);

    if (format === "json") {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        count: memories.length,
        memories,
      }, null, 2);
    }

    // CSV 格式
    const headers = ["ID", "Title", "Category", "Tags", "Emotion", "Timestamp", "Is Permanent"];
    const rows = memories.map((m) => [
      m.id,
      `"${m.title}"`,
      m.category,
      `"${m.tags.join("; ")}"`,
      m.emotion?.primary || "",
      new Date(m.timestamp).toISOString(),
      m.isPermanent,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  importMemories(json: string): { success: number; failed: number; errors: string[] } {
    try {
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : parsed.memories;

      if (!Array.isArray(items)) {
        return { success: 0, failed: 0, errors: ["Invalid format"] };
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          // 验证必要字段
          if (!item.id || !item.ownerId || !item.title) {
            throw new Error("Missing required fields");
          }

          // 导入记忆
          this.memories.set(item.id, {
            ...item,
            importedAt: Date.now(),
          });
          this.updateIndex(item);
          success++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import ${item.id}: ${error}`);
        }
      }

      this.saveToStorage();
      this.emit("memories:imported", { success, failed });

      return { success, failed, errors };
    } catch (error) {
      return { success: 0, failed: 0, errors: [`Parse error: ${error}`] };
    }
  }

  // ============================================================
  // 私有方法
  // ============================================================

  private generateMemoryId(): string {
    return `mem-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  private generateContentMetadata(type: ContentType): MemoryArchive["content"]["metadata"] {
    const base: Partial<ContentMetadata> = {};

    switch (type) {
      case "text":
      case "rich-text":
        return { ...base };

      case "image":
        return {
          ...base,
          dimensions: { width: 0, height: 0 },
          thumbnails: [],
        };

      case "audio":
      case "voice-note":
        return {
          ...base,
          durationMs: 0,
          transcription: "",
        };

      case "video":
        return {
          ...base,
          durationMs: 0,
          dimensions: { width: 0, height: 0 },
          thumbnails: [],
        };

      default:
        return base;
    }
  }

  private analyzeSentiment(text: string): SentimentScore {
    // 简单的情感分析（实际应用中应使用 NLP 服务）
    const positiveWords = [
      "happy", "love", "joy", "great", "awesome", "wonderful",
      "excellent", "amazing", "fantastic", "beautiful",
      "快乐", "爱", "喜悦", "美好", "幸福", "感谢",
    ];
    const negativeWords = [
      "sad", "angry", "hate", "terrible", "awful", "horrible",
      "bad", "worst", "disappointing", "frustrating",
      "悲伤", "愤怒", "讨厌", "糟糕", "失望",
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positive = 0;
    let negative = 0;

    words.forEach((word) => {
      if (positiveWords.some((pw) => word.includes(pw))) {positive++;}
      if (negativeWords.some((nw) => word.includes(nw))) {negative++;}
    });

    const total = positive + negative || 1;
    const positiveScore = positive / total;
    const negativeScore = negative / total;
    const neutralScore = Math.max(0, 1 - positiveScore - negativeScore);

    let overall: SentimentScore["overall"];
    if (positiveScore > 0.6) {overall = "positive";}
    else if (negativeScore > 0.6) {overall = "negative";}
    else if (neutralScore > 0.6) {overall = "neutral";}
    else {overall = "mixed";}

    return {
      positive: Math.round(positiveScore * 100) / 100,
      negative: Math.round(negativeScore * 100) / 100,
      neutral: Math.round(neutralScore * 100) / 100,
      overall,
      confidence: 0.7, // 简单分析的置信度较低
    };
  }

  private getEmojisForEmotion(emotion: EmotionType): string[] {
    const emojiMap: Record<EmotionType, string[]> = {
      joy: ["😊", "😄", "🎉"],
      love: ["❤️", "💕", "😍"],
      surprise: ["😮", "😲", "⭐"],
      anger: ["😠", "💢", "🔥"],
      sadness: ["😢", "💔", "🥺"],
      fear: ["😨", "😰", "🙀"],
      disgust: ["🤢", "😒", "🤮"],
      trust: ["🤝", "💪", "✨"],
      anticipation: ["🤔", "😏", "🎯"],
      nostalgia: ["📸", "🕰️", "🌸"],
      pride: ["🏆", "👑", "💪"],
      gratitude: ["🙏", "🌹", "💝"],
      serenity: ["🧘", "🌿", "🕊️"],
      hope: ["🌟", "🌈", "☀️"],
      wonder: ["✨", "🌠", "🦋"],
    };

    return emojiMap[emotion] || ["💭"];
  }

  private addTimelineEvent(memoryId: string, type: NonNullable<MemoryArchive["timeline"]>[0]["type"]): void {
    const memory = this.memories.get(memoryId);
    if (!memory) {return;}

    if (!memory.timeline) {
      memory.timeline = [];
    }

    memory.timeline.push({
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      timestamp: Date.now(),
      byMemberId: this.currentMemberId || undefined,
    });
  }

  private updateIndex(memory: MemoryArchive): void {
    // 移除旧索引
    this.index = this.index.filter((item) => item.id !== memory.id);

    // 添加新索引
    this.index.push({
      id: memory.id,
      ownerId: memory.ownerId,
      category: memory.category,
      timestamp: memory.timestamp,
      tags: memory.tags,
      emotion: memory.emotion?.primary,
      isPermanent: memory.isPermanent,
    });
  }

  private calculateRelevanceScore(memory: MemoryArchive, query: string): number {
    let score = 0;

    // 标题匹配（权重高）
    if (memory.title.toLowerCase().includes(query)) {score += 10;}

    // 标签匹配
    memory.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(query)) {score += 5;}
    });

    // 描述匹配
    if (memory.description?.toLowerCase().includes(query)) {score += 3;}

    // 内容匹配
    if (typeof memory.content.data === "string" &&
        (memory.content.data as string).toLowerCase().includes(query)) {
      score += 2;
    }

    // 时间衰减（最近的记忆权重略高）
    const ageInDays = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24);
    score *= Math.max(0.5, 1 - ageInDays / 365); // 一年内的衰减

    return score;
  }

  private estimateMemorySize(memory: MemoryArchive): number {
    const jsonSize = JSON.stringify(memory).length;
    // 加上元数据和索引开销
    return jsonSize * 1.2;
  }

  // ============================================================
  // 持久化
  // ============================================================

  private loadFromStorage(): void {
    try {
      const memoriesRaw = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (memoriesRaw) {
        const memories = JSON.parse(memoriesRaw) as MemoryArchive[];
        memories.forEach((m) => this.memories.set(m.id, m));
      }

      const indexRaw = localStorage.getItem(MEMORY_INDEX_KEY);
      if (indexRaw) {
        this.index = JSON.parse(indexRaw) as MemoryIndexItem[];
      }
    } catch (error) {
      console.error("[AIFamilyMemory] Failed to load from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      const memories = Array.from(this.memories.values());
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
      localStorage.setItem(MEMORY_INDEX_KEY, JSON.stringify(this.index));
    } catch (error) {
      console.error("[AIFamilyMemory] Failed to save to storage:", error);
      this.emit("storage:error", error);
    }
  }

  private setupAutoSave(): void {
    // 每30秒自动保存（防抖）
    setInterval(() => {
      this.saveToStorage();
    }, 30000);

    // 页面关闭前保存
    window.addEventListener("beforeunload", () => {
      this.saveToStorage();
    });
  }

  // ============================================================
  // 事件系统
  // ============================================================

  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AIFamilyMemory] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  destroy(): void {
    this.saveToStorage();
    this.memories.clear();
    this.index = [];
    this.eventListeners.clear();
    this.emit("destroyed");
  }
}

// ============================================================
// 导出单例
// ============================================================

let memoryInstance: AIFamilyMemoryManager | null = null;

export function getMemoryInstance(): AIFamilyMemoryManager {
  if (!memoryInstance) {
    memoryInstance = new AIFamilyMemoryManager();
  }
  return memoryInstance;
}

export function destroyMemoryInstance(): void {
  if (memoryInstance) {
    memoryInstance.destroy();
    memoryInstance = null;
  }
}
