/**
 * @file: constants/providers.ts
 * @description: 服务商元数据共享常量 — 全局模型数据唯一真相源
 *              ModelSettings / IDE / 聊天页 三处统一引用此文件
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v2.0.0
 * @created: 2026-03-08
 * @updated: 2026-04-16
 * @status: production
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: constants,providers,metadata,zhipu,glm
 */

import { Cpu, Server } from "lucide-react";

/**
 * 图标组件类型 — 解决 React 19 与 Lucide 类型兼容性
 * @description 使用 unknown + 断言绕过 ForwardRefExoticComponent 检查
 */
type IconComponent = React.ComponentType<{ className?: string }>;

export interface ModelDef {
  id: string;
  name: string;
  description: string;
  contextWindow?: string;
  pricing?: string;
}

export interface ProviderDef {
  id: string;
  name: string;
  shortName: string;
  /** 图标组件 — eslint-disable-next-line @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  colorBg: string;
  colorBorder: string;
  description: string;
  baseURL: string;
  apiKeyUrl: string;
  apiKeyPlaceholder: string;
  models: ModelDef[];
  openaiCompatible: boolean;
  docsUrl: string;
}

/**
 * 内置服务商列表 — 全局唯一真相源
 *
 * 优先级：自建vLLM > Ollama > 智谱云端
 *   1. vllm-n1-27b     — DGX N1 推理主节点 Qwen3.6-27B (nvFP4)
 *   2. vllm-n1-35b     — DGX N1 Qwen3.6-35B-A3B MoE (nvFP4)
 *   3. tei-n1-embed    — DGX N1 Qwen3-Embedding-8B (TEI)
 *   4. tei-n1-rerank   — DGX N1 Qwen3-Reranker-8B (TEI)
 *   5. ollama-n1-coder — DGX N1 Qwen3-Coder-30B-A3B (Ollama)
 *   6. zai-plan        — Z.ai Coding Plan (智谱) 云端 API (降级备用)
 *   7. ollama          — 本地推理，运行时动态检测模型（降级备用）
 *
 * 所有页面（IDE / 聊天 / 设置）必须从此数组读取，
 * 禁止在别处硬编码供应商或模型定义。
 */
export const BUILTIN_PROVIDERS: ProviderDef[] = [
  // ═══════════════════════════════════════════
  // 自建算力 — DGX N1 推理主节点 (192.168.3.101)
  // ═══════════════════════════════════════════
  {
    id: "vllm-n1-27b",
    name: "YYC³ vLLM N1 (27B)",
    shortName: "天枢27B",
    icon: Server,
    color: "text-emerald-400",
    colorBg: "bg-emerald-500/10",
    colorBorder: "border-emerald-500/20",
    description: "Qwen3.6-27B Dense nvFP4 · LoRA热加载 · 内网直连",
    baseURL: "http://192.168.3.101:8000/v1",
    apiKeyUrl: "",
    apiKeyPlaceholder: "内网无需API Key",
    openaiCompatible: true,
    docsUrl: "https://docs.vllm.ai",
    models: [
      {
        id: "Qwen3.6-27B",
        name: "Qwen3.6-27B",
        description: "Dense nvFP4 · 主力推理 · LoRA热加载",
        contextWindow: "262K",
        pricing: "自建零成本",
      },
    ],
  },
  {
    id: "vllm-n1-35b",
    name: "YYC³ vLLM N1 (35B MoE)",
    shortName: "千行35B",
    icon: Server,
    color: "text-sky-400",
    colorBg: "bg-sky-500/10",
    colorBorder: "border-sky-500/20",
    description: "Qwen3.6-35B-A3B MoE nvFP4 · 代码专精 · 内网直连",
    baseURL: "http://192.168.3.101:8001/v1",
    apiKeyUrl: "",
    apiKeyPlaceholder: "内网无需API Key",
    openaiCompatible: true,
    docsUrl: "https://docs.vllm.ai",
    models: [
      {
        id: "Qwen3.6-35B-A3B",
        name: "Qwen3.6-35B-A3B",
        description: "MoE nvFP4 · 代码/意图识别专精",
        contextWindow: "262K",
        pricing: "自建零成本",
      },
    ],
  },
  {
    id: "tei-n1-embed",
    name: "YYC³ TEI N1 (Embed-8B)",
    shortName: "伯乐Embed",
    icon: Server,
    color: "text-violet-400",
    colorBg: "bg-violet-500/10",
    colorBorder: "border-violet-500/20",
    description: "Qwen3-Embedding-8B · 知识库向量检索 · 内网直连",
    baseURL: "http://192.168.3.101:8002",
    apiKeyUrl: "",
    apiKeyPlaceholder: "内网无需API Key",
    openaiCompatible: false,
    docsUrl: "https://huggingface.co/docs/text-embeddings-inference",
    models: [
      {
        id: "Qwen3-Embedding-8B",
        name: "Qwen3-Embedding-8B",
        description: "向量嵌入 · RAG检索 · 知识库",
        contextWindow: "32K",
        pricing: "自建零成本",
      },
    ],
  },
  {
    id: "tei-n1-rerank",
    name: "YYC³ TEI N1 (Reranker-8B)",
    shortName: "伯乐Rerank",
    icon: Server,
    color: "text-fuchsia-400",
    colorBg: "bg-fuchsia-500/10",
    colorBorder: "border-fuchsia-500/20",
    description: "Qwen3-Reranker-8B · 检索重排序 · 内网直连",
    baseURL: "http://192.168.3.101:8003",
    apiKeyUrl: "",
    apiKeyPlaceholder: "内网无需API Key",
    openaiCompatible: false,
    docsUrl: "https://huggingface.co/docs/text-embeddings-inference",
    models: [
      {
        id: "Qwen3-Reranker-8B",
        name: "Qwen3-Reranker-8B",
        description: "检索重排序 · RAG精排",
        contextWindow: "32K",
        pricing: "自建零成本",
      },
    ],
  },
  {
    id: "ollama-n1-coder",
    name: "YYC³ Ollama N1 (Coder-30B)",
    shortName: "灵韵Coder",
    icon: Server,
    color: "text-pink-400",
    colorBg: "bg-pink-500/10",
    colorBorder: "border-pink-500/20",
    description: "Qwen3-Coder-30B-A3B Q4 · 创意设计 · 内网直连",
    baseURL: "http://192.168.3.101:11434",
    apiKeyUrl: "",
    apiKeyPlaceholder: "内网无需API Key",
    openaiCompatible: false,
    docsUrl: "https://ollama.com",
    models: [
      {
        id: "qwen3-coder-30b-a3b",
        name: "Qwen3-Coder-30B-A3B",
        description: "代码/创意生成 · MoE架构",
        contextWindow: "128K",
        pricing: "自建零成本",
      },
    ],
  },
  // ═══════════════════════════════════════════
  // 降级备用 — 云端/本地通用
  // ═══════════════════════════════════════════
  {
    id: "zai-plan",
    name: "Z.ai Coding Plan",
    shortName: "智谱",
    icon: Cpu,
    color: "text-indigo-400",
    colorBg: "bg-indigo-500/10",
    colorBorder: "border-indigo-500/20",
    description: "GLM-5 / GLM-5.1 / GLM-4.7 编程专精",
    baseURL: "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions",
    apiKeyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    apiKeyPlaceholder: "输入 Z.ai API Key...",
    openaiCompatible: true,
    docsUrl: "https://open.bigmodel.cn/dev/api#coding",
    models: [
      {
        id: "glm-5",
        name: "GLM-5",
        description: "最新旗舰推理模型",
        contextWindow: "128K",
      },
      {
        id: "glm-5.1",
        name: "GLM-5.1",
        description: "增强版旗舰模型",
        contextWindow: "128K",
      },
      {
        id: "glm-4.7",
        name: "GLM-4.7",
        description: "高性能通用模型",
        contextWindow: "128K",
      },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (本地)",
    shortName: "Local",
    icon: Server,
    color: "text-amber-400",
    colorBg: "bg-amber-500/10",
    colorBorder: "border-amber-500/20",
    description: "本地运行时检测 · 私有数据 · 零预设",
    baseURL: "http://localhost:11434/api/chat",
    apiKeyUrl: "",
    apiKeyPlaceholder: "",
    openaiCompatible: false,
    docsUrl: "https://ollama.com",
    models: [],
  },
];

/** 导出便捷访问器 — 自建算力优先 */
export const VLLM_N1_27B_PROVIDER = BUILTIN_PROVIDERS[0];   // 天枢27B
export const VLLM_N1_35B_PROVIDER = BUILTIN_PROVIDERS[1];   // 千行35B
export const TEI_N1_EMBED_PROVIDER = BUILTIN_PROVIDERS[2];  // 伯乐Embed
export const TEI_N1_RERANK_PROVIDER = BUILTIN_PROVIDERS[3]; // 伯乐Rerank
export const OLLAMA_N1_CODER_PROVIDER = BUILTIN_PROVIDERS[4]; // 灵韵Coder
export const ZAI_PLAN_PROVIDER = BUILTIN_PROVIDERS[5];      // 智谱降级
export const OLLAMA_PROVIDER = BUILTIN_PROVIDERS[6];        // 本地降级
