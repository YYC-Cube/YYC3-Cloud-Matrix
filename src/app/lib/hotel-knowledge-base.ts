/**
 * @file: hotel-knowledge-base.ts
 * @description: 酒店专业知识库 - 结构化知识管理与检索
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hotel, knowledge-base, faq, expertise]
 *
 * @brief: AI Family酒店人的专业知识库
 * - 酒店FAQ问答库
* - 服务流程与标准操作程序(SOP)
* - 应急预案与处理流程
* - 本地信息与推荐资源
 */

// ============================================================
// 类型定义
// ============================================================

export interface KnowledgeArticle {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  keywords: string[];
  priority: "high" | "medium" | "low";
  difficulty: "easy" | "moderate" | "hard";
  lastUpdated: string;
  version: number;
  tags: string[];
  relatedArticles: string[];
  applicableRoles: string[];
}

export type KnowledgeCategory =
  | "faq-general"
  | "check-in-out"
  | "room-service"
  | "dining"
  | "facilities"
  | "emergency"
  | "local-info"
  | "policies"
  | "vip-services"
  | "complaints"
  | "technical"
  | "hr-policies";

export interface SearchResult {
  article: KnowledgeArticle;
  relevanceScore: number;
  matchedKeywords: string[];
}

export interface KnowledgeQuery {
  query: string;
  category?: KnowledgeCategory;
  role?: string;
  limit?: number;
  threshold?: number;
}

// ============================================================
// 知识库数据
// ============================================================

export const HOTEL_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  // ========== FAQ通用类 ==========
  {
    id: "kb-faq-001",
    category: "faq-general",
    title: "酒店基本设施介绍",
    content: `YYC3智慧酒店为您提供全方位的优质服务：

**🏨 客房设施**
- 所有房间配备高速WiFi、智能控制系统、55寸智能电视
- 独立卫浴、24小时热水、迷你吧、保险箱
- 高级房型配有按摩浴缸、独立办公区

**🍽️ 餐饮设施**
- 云端餐厅：中西合璧自助餐（7:00-10:00, 12:00-14:00, 18:00-21:30）
- 星空酒吧：精选酒水与小食（18:00-02:00）
- 大堂茶室：精致茶点（10:00-22:00）

**💪 康乐设施**
- 25层健身中心（24小时开放，持房卡进入）
- 室内恒温游泳池（06:00-22:00）
- SPA康养中心（10:00-22:00，需预约）

**💼 商务设施**
- 多功能会议室（可容纳10-200人）
- 商务中心（打印、复印、秘书服务）
- 快速入住/退房通道（VIP专属）`,
    keywords: ["设施", "介绍", "有什么", "设备", "WiFi", "餐厅", "健身房"],
    priority: "high",
    difficulty: "easy",
    lastUpdated: "2026-04-01",
    version: 1,
    tags: ["基础设施", "客人常见问题"],
    relatedArticles: ["kb-room-001", "kb-dining-001"],
    applicableRoles: ["front-desk", "concierge", "guest-relations"],
  },

  // ========== 入住退房流程 ==========
  {
    id: "kb-checkin-001",
    category: "check-in-out",
    title: "标准入住流程SOP",
    content: `**标准入住流程（预计时间：5-8分钟）**

**步骤1: 迎接与问候（30秒）**
- 微笑迎接，目光接触
- 主动问候："您好，欢迎光临YYC3智慧酒店！"
- 确认预订信息

**步骤2: 身份验证（1分钟）**
- 查验有效身份证件（身份证/护照）
- 确认预订姓名与证件一致
- 登记证件信息至公安系统

**步骤3: 房间分配与说明（2分钟）**
- 根据偏好分配房间
- 说明房间位置、楼层设施
- 提供房卡及WiFi密码
- 说明早餐时间地点

**步骤4: 附加服务推荐（1-2分钟）**
- 介绍酒店特色服务
- 推荐升级选项（如适用）
- 确认特殊需求

**步骤5: 引导至房间或电梯（30秒）**
- 提供行李服务（如需要）
- 清晰指引房间方向
- 表达祝福："祝您入住愉快！"

**⚠️ 特殊情况处理**
- VIP客人：启用快速通道，经理亲自接待
- 团队入住：提前准备资料，批量办理
- 无预订客人：查询房态，灵活安排`,
    keywords: ["入住", "流程", "SOP", "办入住", "check-in", "手续"],
    priority: "high",
    difficulty: "moderate",
    lastUpdated: "2026-04-05",
    version: 2,
    tags: ["SOP", "前台工作流程"],
    relatedArticles: ["kb-checkout-001", "kb-vip-001"],
    applicableRoles: ["front-desk", "concierge", "manager"],
  },

  {
    id: "kb-checkout-001",
    category: "check-in-out",
    title: "退房结算流程",
    content: `**标准退房流程（预计时间：3-5分钟）**

**步骤1: 确认退房意向（30秒）**
- 询问："您好，今天要办理退房吗？"
- 确认房号和客人姓名

**步骤2: 账单核对（1-2分钟）**
- 打印详细账单
- 逐项说明消费明细
- 确认 minibar 消费、电话费等

**步骤3: 支付处理（1分钟）**
- 结算方式确认（现金/刷卡/会员账户）
- 打印发票/收据
- 退还押金（如适用）

**步骤4: 房卡回收与反馈收集（1分钟）**
- 回收房卡
- 询问入住体验
- 记录客户反馈
- 处理遗留物品

**步骤5: 送别（30秒）**
- 协助行李（如需要）
- 表达感谢："感谢您选择YYC3智慧酒店，期待再次为您服务！"

**💡 退房小贴士**
- 提前15分钟通知可加快流程
- 会员积分可在退房时兑换
- 可提供延迟退房服务（视房态而定）`,
    keywords: ["退房", "结账", "checkout", "离开", "账单"],
    priority: "high",
    difficulty: "easy",
    lastUpdated: "2026-04-03",
    version: 1,
    tags: ["SOP", "前台工作流程"],
    relatedArticles: ["kb-checkin-001"],
    applicableRoles: ["front-desk", "guest-relations"],
  },

  // ========== VIP服务 ==========
  {
    id: "kb-vip-001",
    category: "vip-services",
    title: "VIP客人接待标准",
    content: `**VIP分级与服务标准**

**🥇 白金会员 (Platinum)**
- 专车机场/火车站接送到店
- 总经理亲自迎候
- 免费升级至套房（视房态）
- 欢迎果篮 + 定制欢迎卡片
- 专属管家一对一服务
- 免费洗衣服务（每日3件）
- 延迟退房至16:00
- 行政酒廊全天候使用权

**🥈 金牌会员 (Gold)**
- 礼宾部协助交通安排
- 部门经理迎候
- 优先升级机会
- 欢迎饮品
- 快速入住/退房通道
- 免费洗衣服务（每日1件）
- 延迟退房至14:00
- 行政酒廊使用权（特定时段）

**🥉 银牌会员 (Silver)**
- 快速入住通道
- 欢迎礼品
- 房型升级优先权
- 延迟退房至13:00
- 双倍积分累积

**⭐ 重要提示**
- 所有VIP信息需严格保密
- 服务细节需提前准备
- 任何特殊情况立即上报经理
- 保持服务一致性`,
    keywords: ["VIP", "贵宾", "白金", "金牌", "银牌", "会员", "特权"],
    priority: "high",
    difficulty: "moderate",
    lastUpdated: "2026-04-08",
    version: 3,
    tags: ["VIP服务", "客户关系"],
    relatedArticles: ["kb-checkin-001", "kb-complaint-001"],
    applicableRoles: ["front-desk", "concierge", "guest-relations", "manager"],
  },

  // ========== 投诉处理 ==========
  {
    id: "kb-complaint-001",
    category: "complaints",
    title: "客户投诉处理流程",
    content: `**LEARN原则 - 专业投诉处理法**

**L - Listen（倾听）**
- 让客人完整表达不满
- 保持眼神接触，点头示意
- 不打断，不辩解
- 记录关键点

**E - Empathize（共情）**
- 表示理解："我完全理解您的感受"
- 承认情绪："换做是我也会很生气"
- 不急于解释原因

**A - Apologize（道歉）**
- 真诚道歉："非常抱歉给您带来不便"
- 不推卸责任
- 代表酒店道歉

**R - Resolve（解决）**
- 提出解决方案："我建议我们可以..."
- 给予选择权
- 设定明确时限
- 必要时升级处理

**N - Notify（跟进）**
- 记录投诉详情
- 跟进解决结果
- 回访确认满意度
- 总结改进措施

**⚠️ 投诉升级触发条件**
- 涉及安全问题 → 立即上报安保+经理
- 涉及法律风险 → 上报法务+经理
- 客户威胁曝光媒体 → 立即上报总经理
- 涉及金额超过¥5000 → 上报财务+经理
- 同一问题重复出现3次以上 → 上报质检部门`,
    keywords: ["投诉", "不满", "解决问题", "LEARN", "处理", "道歉"],
    priority: "high",
    difficulty: "hard",
    lastUpdated: "2026-04-07",
    version: 2,
    tags: ["投诉处理", "危机管理"],
    relatedArticles: ["kb-emergency-001", "kb-vip-001"],
    applicableRoles: ["front-desk", "guest-relations", "manager", "concierge"],
  },

  // ========== 应急预案 ==========
  {
    id: "kb-emergency-001",
    category: "emergency",
    title: "紧急事件应急预案",
    content: `**紧急事件分类与响应**

**🔥 一级紧急（立即响应）**
- **火灾警报**
  1. 启动消防广播系统
  2. 组织有序疏散（东侧楼梯）
  3. 拨打119并报告具体位置
  4. 清点人数，确保无人遗漏
  5. 配合消防员工作

- **医疗急救**
  1. 拨打120，保持通话
  2. 安排专人引导救护车
  3. 如有AED设备，按规程使用
  4. 保护现场，疏散围观人群
  5. 记录事件详情

**⚠️ 二级紧急（快速响应）**
- **电梯困人**
  1. 通过对讲机安抚被困人员
  2. 立即联系维保公司（电话：400-XXX-XXXX）
  3. 记录被困人数和时间
  4. 准备应急物资（水、毛毯）

- **大面积停电**
  1. 启动备用发电机
  2. 检查电梯是否有人被困
  3. 为客人提供应急照明
  4. 解释情况并致歉
  5. 联系电力公司查明原因

**📞 三级紧急（常规处理）**
- **水管爆裂**: 关闭总阀，清理积水，调房
- **食物中毒**: 保留样本，送医检查，上报卫生部门
- **客人纠纷**: 安保介入，隔离双方，调解处理

**📞 紧急联系人**
- 总经理：138-XXXX-XXXX（24小时）
- 安保主管：139-XXXX-XXXX
- 工程部：137-XXXX-XXXX
- 医务室：136-XXXX-XXXX（08:00-20:00）`,
    keywords: ["紧急", "火灾", "急救", "停电", "应急预案", "突发事件"],
    priority: "high",
    difficulty: "hard",
    lastUpdated: "2026-04-09",
    version: 4,
    tags: ["安全", "应急预案", "风险管理"],
    relatedArticles: ["kb-complaint-001"],
    applicableRoles: ["all"], // 所有员工都应了解
  },

  // ========== 当地信息 ==========
  {
    id: "kb-local-001",
    category: "local-info",
    title: "本地景点与餐饮推荐",
    content: `**🏛️ 文化景点**

**博物馆群（距酒店2公里）**
- 市博物馆：免费，需预约，9:00-17:00（周一闭馆）
- 美术馆：门票¥50，10:00-18:00
- 科技馆：适合亲子，门票¥80

**历史古迹（距酒店3-5公里）**
- 古城墙遗址公园：免费开放，晨练佳地
- 名人故居：门票¥30，需预约讲解
- 古街步行区：免费，购物美食一体

**🌳 自然风光**

**城市公园（距酒店1公里）**
- 中央公园：晨跑首选，有湖景
- 植物园：四季花展，门票¥20
- 湿地公园：观鸟胜地，免费

**周边景区（车程30-60分钟）**
- 山风景区：登山步道，门票¥100
- 湖度假村：水上项目，门票¥150
- 温泉小镇：温泉体验，门票¥200起

**🍽️ 特色餐饮推荐**

**本地必吃**
- 老字号餐馆（步行10分钟）：招牌菜XX，人均¥80
- 小吃街（步行15分钟）：汇集50+种地方小吃
- 夜市（打车10分钟）：18:00-02:00营业

**高端餐饮**
- 米其林一星餐厅（酒店3楼）：需提前预订
- 粤菜馆（距酒店500米）：人均¥300
- 日料店（距酒店800米）：新鲜食材，人均¥400

**☕ 休闲去处**
- 独立书店（步行5分钟）：安静阅读空间
- 咖啡街区（步行8分钟）：精品咖啡馆聚集
- 艺术园区（打车15分钟）：画廊+手作工坊`,
    keywords: ["景点", "旅游", "推荐", "玩", "去哪", "吃饭", "餐厅"],
    priority: "medium",
    difficulty: "easy",
    lastUpdated: "2026-04-06",
    version: 2,
    tags: ["本地信息", "礼宾服务"],
    relatedArticles: [],
    applicableRoles: ["concierge", "guest-relations"],
  },
];

// 补充ID常量
const _kb_dining_001 = "kb-dining-001"; // 占位符
const _kb_room_001 = "kb-room-001";     // 占位符

// ============================================================
// 知识库服务类
// ============================================================

export class HotelKnowledgeBase {
  private articles: Map<string, KnowledgeArticle> = new Map();
  private searchHistory: Array<{
    query: string;
    results: SearchResult[];
    timestamp: number;
  }> = [];

  constructor(customArticles?: KnowledgeArticle[]) {
    const allArticles = customArticles || HOTEL_KNOWLEDGE_BASE;
    allArticles.forEach(article => {
      this.articles.set(article.id, article);
    });
  }

  /**
   * 搜索知识库
   */
  search(query: KnowledgeQuery): SearchResult[] {
    const {
      query: searchText,
      category,
      role,
      limit = 5,
      threshold = 0.3,
    } = query;

    const results: SearchResult[] = [];

    for (const [, article] of this.articles) {
      // 分类过滤
      if (category && article.category !== category) {continue;}

      // 角色过滤
      if (role && !article.applicableRoles.includes(role) && !article.applicableRoles.includes("all")) {continue;}

      // 计算相关性分数
      const score = this.calculateRelevance(searchText, article);
      
      if (score >= threshold) {
        const matchedKeywords = this.extractMatchedKeywords(searchText, article);
        results.push({
          article,
          relevanceScore: score,
          matchedKeywords,
        });
      }
    }

    // 按相关性排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 限制返回数量
    const limitedResults = results.slice(0, limit);

    // 记录搜索历史
    this.searchHistory.push({
      query: searchText,
      results: limitedResults,
      timestamp: Date.now(),
    });

    return limitedResults;
  }

  /**
   * 获取文章详情
   */
  getArticle(articleId: string): KnowledgeArticle | undefined {
    return this.articles.get(articleId);
  }

  /**
   * 获取所有分类
   */
  getCategories(): { id: KnowledgeCategory; name: string; count: number }[] {
    const categoryMap = new Map<KnowledgeCategory, number>();

    for (const [, article] of this.articles) {
      const current = categoryMap.get(article.category) || 0;
      categoryMap.set(article.category, current + 1);
    }

    const categoryNames: Record<KnowledgeCategory, string> = {
      "faq-general": "通用FAQ",
      "check-in-out": "入住退房",
      "room-service": "客房服务",
      "dining": "餐饮服务",
      "facilities": "设施使用",
      "emergency": "应急预案",
      "local-info": "本地信息",
      "policies": "酒店政策",
      "vip-services": "VIP服务",
      "complaints": "投诉处理",
      "technical": "技术支持",
      "hr-policies": "人事政策",
    };

    return Array.from(categoryMap.entries()).map(([id, count]) => ({
      id,
      name: categoryNames[id] || id,
      count,
    }));
  }

  /**
   * 获取热门搜索
   */
  getPopularSearches(limit: number = 10): string[] {
    const queryCount = new Map<string, number>();

    this.searchHistory.forEach(({ query }) => {
      const current = queryCount.get(query) || 0;
      queryCount.set(query, current + 1);
    });

    return Array.from(queryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  /**
   * 添加自定义知识条目
   */
  addArticle(article: Omit<KnowledgeArticle, "id" | "lastUpdated" | "version">): KnowledgeArticle {
    const newArticle: KnowledgeArticle = {
      ...article,
      id: `kb-custom-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastUpdated: new Date().toISOString().split("T")[0],
      version: 1,
    };

    this.articles.set(newArticle.id, newArticle);
    return newArticle;
  }

  /**
   * 更新知识条目
   */
  updateArticle(
    articleId: string,
    updates: Partial<Omit<KnowledgeArticle, "id">>
  ): KnowledgeArticle | null {
    const existing = this.articles.get(articleId);
    if (!existing) {return null;}

    const updated: KnowledgeArticle = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString().split("T")[0],
      version: existing.version + 1,
    };

    this.articles.set(articleId, updated);
    return updated;
  }

  /**
   * 删除知识条目
   */
  deleteArticle(articleId: string): boolean {
    return this.articles.delete(articleId);
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalArticles: number;
    categories: number;
    averageVersion: number;
    lastUpdate: string;
  } {
    let totalVersions = 0;
    let latestUpdate = "";

    for (const [, article] of this.articles) {
      totalVersions += article.version;
      if (article.lastUpdated > latestUpdate) {
        latestUpdate = article.lastUpdated;
      }
    }

    return {
      totalArticles: this.articles.size,
      categories: this.getCategories().length,
      averageVersion: this.articles.size > 0 ? totalVersions / this.articles.size : 0,
      lastUpdate: latestUpdate,
    };
  }

  // ========== 私有方法 ==========

  private calculateRelevance(query: string, article: KnowledgeArticle): number {
    const queryTerms = this.tokenize(query.toLowerCase());
    let score = 0;

    // 标题匹配（权重高）
    const titleTerms = this.tokenize(article.title.toLowerCase());
    const titleMatches = queryTerms.filter(term => titleTerms.includes(term)).length;
    score += (titleMatches / Math.max(titleTerms.length, 1)) * 0.4;

    // 关键词匹配（权重中等）
    const keywordMatches = queryTerms.filter(term =>
      article.keywords.some(kw => kw.toLowerCase().includes(term))
    ).length;
    score += (keywordMatches / Math.max(article.keywords.length, 1)) * 0.35;

    // 内容匹配（权重低但覆盖广）
    const contentText = article.content.toLowerCase();
    const contentMatches = queryTerms.filter(term => contentText.includes(term)).length;
    score += (contentMatches / queryTerms.length) * 0.2;

    // Tag匹配（权重低）
    const tagMatches = queryTerms.filter(term =>
      article.tags.some(tag => tag.toLowerCase().includes(term))
    ).length;
    score += (tagMatches / Math.max(article.tags.length, 1)) * 0.05;

    return Math.min(score, 1.0); // 限制在0-1范围内
  }

  private extractMatchedKeywords(query: string, article: KnowledgeArticle): string[] {
    const queryTerms = this.tokenize(query.toLowerCase());
    const matched: string[] = [];

    for (const term of queryTerms) {
      if (article.title.toLowerCase().includes(term)) { matched.push(term); }
      const matchedKeyword = article.keywords.find((k) => k.toLowerCase().includes(term));
      if (matchedKeyword) { matched.push(matchedKeyword); }
      if (article.tags.some((t) => t.toLowerCase().includes(term))) { matched.push(term); }
    }

    return [...new Set(matched)]; // 去重
  }

  private tokenize(text: string): string[] {
    return text
      .split(/[\s,，。！？、；：""''（）[\]]]+/)
      .filter(token => token.length > 0);
  }
}

// ============================================================
// 导出单例实例
// ============================================================

let knowledgeBaseInstance: HotelKnowledgeBase | null = null;

export function getHotelKnowledgeBase(customArticles?: KnowledgeArticle[]): HotelKnowledgeBase {
  if (!knowledgeBaseInstance) {
    knowledgeBaseInstance = new HotelKnowledgeBase(customArticles);
  }
  return knowledgeBaseInstance;
}

export function resetHotelKnowledgeBase(): void {
  knowledgeBaseInstance = null;
}
