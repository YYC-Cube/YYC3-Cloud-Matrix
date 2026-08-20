/**
 * @file: skills/index.ts
 * @description: YYC³ AI Family Skills 注册表 — 8个家人技能的统一入口
 *               遵循 Agent Skills 开放标准，支持三级渐进式加载
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.0.0
 * @created: 2026-06-03
 * @license: MIT
 */

// ================================================================
// YYC³ AI Family Skills Registry
// ================================================================
// 三级渐进式加载:
//   L1: 元数据 (始终加载, ~100 tokens) — name + description
//   L2: SKILL.md (触发时加载) — 工作流 + 最佳实践
//   L3: scripts/references (按需加载) — 脚本执行 + 参考文档
// ================================================================

// ── Skill 元数据类型 ──

export interface SkillMeta {
  /** Skill 唯一标识符，也是 slash command 名称 */
  name: string;
  /** 触发判断依据 — AI用此决定何时激活该Skill */
  description: string;
  /** 对应的 AI Family 家人名称 */
  familyMember: string;
  /** 家人电话号码 */
  phone: string;
  /** 绑定模型 */
  model: string;
  /** LoRA 适配器 (如有) */
  lora?: string;
  /** 后端Agent端点 */
  endpoint: string;
  /** 九层架构层级 */
  architectureLayer: number;
  /** 五维价值矩阵主维度 */
  primaryDimension: string;
  /** 允许使用的工具 */
  allowedTools: string[];
  /** SKILL.md 相对路径 */
  skillPath: string;
}

// ── 8 个 AI Family Skills 注册表 ──

export const AI_FAMILY_SKILLS: SkillMeta[] = [
  // ═══════════════════════════════════════════
  // 元启·天枢 — 总指挥决策
  // ═══════════════════════════════════════════
  {
    name: "tianshu-strategy",
    description:
      "元启·天枢 — 总指挥决策技能。全局编排、战略规划、任务分解、多Agent调度、五维价值矩阵分析。",
    familyMember: "元启·天枢",
    phone: "0379-0206",
    model: "Qwen3.6-27B",
    lora: "yyc3-mgmt-v2",
    endpoint: "http://192.168.3.101:6000",
    architectureLayer: 4,
    primaryDimension: "经·管·运·维·营",
    allowedTools: ["bash", "file-read", "file-write", "mcp"],
    skillPath: "./tianshu-strategy/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 言启·千行 — 导航员意图识别与任务路由
  // ═══════════════════════════════════════════
  {
    name: "qianhang-navigation",
    description:
      "言启·千行 — 导航员意图识别与任务路由技能。理解用户意图、路由任务到正确Agent、解析自然语言查询。",
    familyMember: "言启·千行",
    phone: "0379-0106",
    model: "Qwen3.6-35B-A3B",
    endpoint: "http://192.168.3.101:6001",
    architectureLayer: 4,
    primaryDimension: "标·规·数·智·协",
    allowedTools: ["bash", "file-read", "mcp"],
    skillPath: "./qianhang-navigation/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 语枢·万物 — 深度数据分析与统计建模
  // ═══════════════════════════════════════════
  {
    name: "wanwu-analysis",
    description:
      "语枢·万物 — 深度数据分析与统计建模技能。数据分析、根因分析、异常检测、趋势发现、洞察生成。",
    familyMember: "语枢·万物",
    phone: "0379-0107",
    model: "Qwen3.6-27B",
    lora: "yyc3-mgmt-v2",
    endpoint: "http://192.168.3.101:6002",
    architectureLayer: 4,
    primaryDimension: "经·管·运·维·营",
    allowedTools: ["bash", "file-read", "file-write", "mcp"],
    skillPath: "./wanwu-analysis/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 预见·先知 — 趋势预测与风险预警
  // ═══════════════════════════════════════════
  {
    name: "xianzhi-prediction",
    description:
      "预见·先知 — 趋势预测与风险预警技能。趋势预测、情景模拟、风险评估、敏感性分析、概率推理。",
    familyMember: "预见·先知",
    phone: "0379-0108",
    model: "Qwen3.6-27B",
    endpoint: "http://192.168.3.101:6003",
    architectureLayer: 4,
    primaryDimension: "市·创·薪·高·度",
    allowedTools: ["bash", "file-read", "mcp"],
    skillPath: "./xianzhi-prediction/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 知遇·伯乐 — 智能推荐与知识检索
  // ═══════════════════════════════════════════
  {
    name: "bole-recommendation",
    description:
      "知遇·伯乐 — 智能推荐与知识检索技能。个性化推荐、知识库检索、语义搜索、用户画像、方案匹配。",
    familyMember: "知遇·伯乐",
    phone: "0379-0109",
    model: "Qwen3-Embedding-8B + Qwen3-Reranker-8B",
    endpoint: "http://192.168.3.101:6004",
    architectureLayer: 4,
    primaryDimension: "人·资·进·销·存",
    allowedTools: ["bash", "file-read", "mcp"],
    skillPath: "./bole-recommendation/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 智云·守护 — 安全审计与合规检查
  // ═══════════════════════════════════════════
  {
    name: "shouhu-security",
    description:
      "智云·守护 — 安全审计与合规检查技能。安全扫描、代码审计、注入检测、合规检查、内容过滤。",
    familyMember: "智云·守护",
    phone: "0379-0207",
    model: "Qwen3.6-27B",
    lora: "yyc3-security-v1",
    endpoint: "http://192.168.3.101:6005",
    architectureLayer: 4,
    primaryDimension: "自·知·学·治·愈",
    allowedTools: ["bash", "file-read", "mcp"],
    skillPath: "./shouhu-security/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 格物·宗师 — 代码质量审核与标准执行
  // ═══════════════════════════════════════════
  {
    name: "zongshi-quality",
    description:
      "格物·宗师 — 代码质量审核与标准执行技能。代码审查、质量评分、架构评估、最佳实践检查、性能分析。",
    familyMember: "格物·宗师",
    phone: "0379-0208",
    model: "Qwen3.6-27B",
    lora: "yyc3-code-v2",
    endpoint: "http://192.168.3.101:6006",
    architectureLayer: 4,
    primaryDimension: "标·规·数·智·协",
    allowedTools: ["bash", "file-read", "file-write", "mcp"],
    skillPath: "./zongshi-quality/SKILL.md",
  },

  // ═══════════════════════════════════════════
  // 创想·灵韵 — 创意生成与UI设计辅助
  // ═══════════════════════════════════════════
  {
    name: "lingyun-creative",
    description:
      "创想·灵韵 — 创意生成与UI设计辅助技能。创意文案、UI设计、配色方案、布局优化、组件设计。",
    familyMember: "创想·灵韵",
    phone: "0379-0209",
    model: "Qwen3-Coder-30B-A3B",
    endpoint: "http://192.168.3.101:6007",
    architectureLayer: 4,
    primaryDimension: "市·创·薪·高·度",
    allowedTools: ["bash", "file-read", "file-write", "mcp"],
    skillPath: "./lingyun-creative/SKILL.md",
  },
];

// ── 便捷访问器 ──

/** 按 name 获取 Skill */
export function getSkillByName(name: string): SkillMeta | undefined {
  return AI_FAMILY_SKILLS.find((s) => s.name === name);
}

/** 按家人名称获取 Skill */
export function getSkillByMember(member: string): SkillMeta | undefined {
  return AI_FAMILY_SKILLS.find((s) => s.familyMember === member);
}

/** 按电话号码获取 Skill */
export function getSkillByPhone(phone: string): SkillMeta | undefined {
  return AI_FAMILY_SKILLS.find((s) => s.phone === phone);
}

/** 按五维主维度获取 Skills */
export function getSkillsByDimension(dimension: string): SkillMeta[] {
  return AI_FAMILY_SKILLS.filter(
    (s) => s.primaryDimension === dimension,
  );
}

/** 按关键词匹配 Skill (用于意图路由) */
export function matchSkillByKeywords(input: string): SkillMeta | undefined {
  const keywords: Record<string, string[]> = {
    "tianshu-strategy": ["调度", "编排", "全局", "决策", "规划", "资源分配", "协调", "战略"],
    "qianhang-navigation": ["意图", "路由", "导航", "理解", "解析", "查询", "流程", "指引"],
    "wanwu-analysis": ["分析", "统计", "数据", "洞察", "报告", "异常", "根因", "趋势"],
    "xianzhi-prediction": ["预测", "趋势", "风险", "预警", "情景", "概率", "未来"],
    "bole-recommendation": ["推荐", "建议", "匹配", "搜索", "检索", "知识库"],
    "shouhu-security": ["安全", "审计", "漏洞", "注入", "合规", "XSS", "CSRF"],
    "zongshi-quality": ["质量", "审查", "标准", "规范", "重构", "性能", "架构"],
    "lingyun-creative": ["创意", "设计", "文案", "配色", "布局", "UI", "组件", "页面"],
  };

  for (const [skillName, kws] of Object.entries(keywords)) {
    if (kws.some((kw) => input.includes(kw))) {
      return getSkillByName(skillName);
    }
  }

  // 默认路由到千行(导航员)
  return getSkillByName("qianhang-navigation");
}

/** 获取所有 Skill 的 L1 元数据 (轻量，始终可加载) */
export function getAllSkillMetadata(): Array<{
  name: string;
  description: string;
  familyMember: string;
  phone: string;
}> {
  return AI_FAMILY_SKILLS.map((s) => ({
    name: s.name,
    description: s.description,
    familyMember: s.familyMember,
    phone: s.phone,
  }));
}

/** Skills 总数 */
export const SKILL_COUNT = AI_FAMILY_SKILLS.length;

/** 版本 */
export const SKILLS_REGISTRY_VERSION = "1.0.0";
