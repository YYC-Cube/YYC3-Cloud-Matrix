/**
 * @file: db-queries.ts
 * @description: 数据库查询函数
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { supabase } from "./supabaseClient";

// ============================================================
// 类型定义
// ============================================================

import type {
  Model,
  Agent,
  InferenceLog,
  NodeStatusRecord,
  ModelStats,
} from "../types/index";

// ============================================================
// Storage Keys
// ============================================================

const MODELS_KEY = "yyc3_db_models";
const AGENTS_KEY = "yyc3_db_agents";
const NODES_KEY = "yyc3_db_nodes";

// ============================================================
// 历史假种子清理 (v1 → v2 真实化)
// 早期版本首次访问即写入 LLaMA-70B 等演示条目；现按 ID 精确
// 清除这些遗留条目，用户自建数据 (时间戳 ID) 完整保留。
// ============================================================

const LEGACY_FAKE_MODEL_IDS = new Set(["m1", "m2", "m3", "m4", "m5"]);
const LEGACY_FAKE_AGENT_IDS = new Set(["a1", "a2", "a3", "a4", "a5"]);
const LEGACY_FAKE_NODE_IDS = new Set(["n1", "n2", "n3", "n4", "n5"]);

const LEGACY_FAKE_IDS: Record<string, Set<string>> = {
  [MODELS_KEY]: LEGACY_FAKE_MODEL_IDS,
  [AGENTS_KEY]: LEGACY_FAKE_AGENT_IDS,
  [NODES_KEY]: LEGACY_FAKE_NODE_IDS,
};

/** 过滤掉历史假种子条目；有变更则写回，全空则删键 */
function sanitizeLegacy<T extends { id: string }>(key: string, rows: T[]): T[] {
  const fakeIds = LEGACY_FAKE_IDS[key];
  if (!fakeIds) {return rows;}
  const kept = rows.filter((r) => !fakeIds.has(r.id));
  if (kept.length === rows.length) {return rows;}
  try {
    if (kept.length === 0) {localStorage.removeItem(key);}
    else {localStorage.setItem(key, JSON.stringify(kept));}
  } catch { /* ignore */ }
  return kept;
}

// ============================================================
// localStorage CRUD 工具层
// ============================================================

function loadData<T extends { id: string }>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {return sanitizeLegacy(key, JSON.parse(raw) as T[]);}
  } catch { /* ignore */ }
  // 无后端设计: 无数据即空数组，绝不写入演示种子
  return [];
}

function saveData<T>(key: string, data: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

// ============================================================
// 内存缓存 (避免频繁解析 JSON)
// ============================================================

let _models: Model[] | null = null;
let _agents: Agent[] | null = null;
let _nodes: NodeStatusRecord[] | null = null;

function getModels(): Model[] {
  if (!_models) {_models = loadData<Model>(MODELS_KEY);}
  return _models;
}

function getAgents(): Agent[] {
  if (!_agents) {_agents = loadData<Agent>(AGENTS_KEY);}
  return _agents;
}

function getNodes(): NodeStatusRecord[] {
  if (!_nodes) {_nodes = loadData<NodeStatusRecord>(NODES_KEY);}
  return _nodes;
}

function persistModels() { saveData(MODELS_KEY, getModels()); }
function persistAgents() { saveData(AGENTS_KEY, getAgents()); }
function persistNodes()  { saveData(NODES_KEY, getNodes()); }

// ============================================================
// CRUD — Models
// ============================================================

export function addDbModel(model: Omit<Model, "id">): Model {
  const models = getModels();
  const newModel: Model = { ...model, id: `m-${Date.now()}` };
  models.push(newModel);
  persistModels();
  return newModel;
}

export function updateDbModel(id: string, updates: Partial<Model>): Model | null {
  const models = getModels();
  const idx = models.findIndex((m) => m.id === id);
  if (idx < 0) {return null;}
  models[idx] = { ...models[idx], ...updates };
  persistModels();
  return models[idx];
}

export function deleteDbModel(id: string): boolean {
  const models = getModels();
  const idx = models.findIndex((m) => m.id === id);
  if (idx < 0) {return false;}
  models.splice(idx, 1);
  persistModels();
  return true;
}

// ============================================================
// CRUD — Agents
// ============================================================

export function addDbAgent(agent: Omit<Agent, "id">): Agent {
  const agents = getAgents();
  const newAgent: Agent = { ...agent, id: `a-${Date.now()}` };
  agents.push(newAgent);
  persistAgents();
  return newAgent;
}

export function updateDbAgent(id: string, updates: Partial<Agent>): Agent | null {
  const agents = getAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx < 0) {return null;}
  agents[idx] = { ...agents[idx], ...updates };
  persistAgents();
  return agents[idx];
}

export function deleteDbAgent(id: string): boolean {
  const agents = getAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx < 0) {return false;}
  agents.splice(idx, 1);
  persistAgents();
  return true;
}

// ============================================================
// CRUD — Nodes
// ============================================================

export function addDbNode(node: Omit<NodeStatusRecord, "id">): NodeStatusRecord {
  const nodes = getNodes();
  const newNode: NodeStatusRecord = { ...node, id: `n-${Date.now()}` };
  nodes.push(newNode);
  persistNodes();
  return newNode;
}

export function updateDbNode(id: string, updates: Partial<NodeStatusRecord>): NodeStatusRecord | null {
  const nodes = getNodes();
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx < 0) {return null;}
  nodes[idx] = { ...nodes[idx], ...updates };
  persistNodes();
  return nodes[idx];
}

export function deleteDbNode(id: string): boolean {
  const nodes = getNodes();
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx < 0) {return false;}
  nodes.splice(idx, 1);
  persistNodes();
  return true;
}

// ============================================================
// ��置 — 恢复默认 Mock 数据
// ============================================================

export function resetDbModels(): Model[] {
  _models = [];
  persistModels();
  return _models;
}

export function resetDbAgents(): Agent[] {
  _agents = [];
  persistAgents();
  return _agents;
}

export function resetDbNodes(): NodeStatusRecord[] {
  _nodes = [];
  persistNodes();
  return _nodes;
}

// ============================================================
// 导入/导出
// ============================================================

export function exportDbData(): string {
  return JSON.stringify({
    version: 1,
    exportedAt: Date.now(),
    models: getModels(),
    agents: getAgents(),
    nodes: getNodes(),
  }, null, 2);
}

export function importDbData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.models) { _models = data.models; persistModels(); }
    if (data.agents) { _agents = data.agents; persistAgents(); }
    if (data.nodes)  { _nodes = data.nodes; persistNodes(); }
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Query Functions (API 兼容 — 签名不变)
// ============================================================

/** 获取活跃模型列表 */
export async function getActiveModels(): Promise<{ data: Model[]; error: null }> {
  void supabase; // placeholder for future Supabase integration
  return { data: [...getModels()], error: null };
}

/**
 * 获取最近推理日志
 * 本地无真实推理遥测源（模型服务端接入后由其提供），返回空数组，
 * 绝不生成 Math.random() 演示日志。
 */
export async function getRecentLogs(_limit = 100): Promise<{ data: InferenceLog[]; error: null }> {
  return { data: [], error: null };
}

/**
 * 获取模型统计
 * 本地无真实遥测源（totalRequests / totalTokens / successRate 需由
 * 模型服务端上报），模型存在但无统计数据时如实返回 null。
 */
export async function getModelStats(
  modelId: string
): Promise<{ data: ModelStats | null; error: null }> {
  const model = getModels().find((m) => m.id === modelId);
  if (!model) {return { data: null, error: null };}
  // 无真实推理统计来源 — 返回 null，由 UI 呈现空态
  return { data: null, error: null };
}

/** 获取节点状态 */
export async function getNodesStatus(): Promise<{ data: NodeStatusRecord[]; error: null }> {
  return { data: [...getNodes()], error: null };
}

/** 获取活跃 Agent 列表 */
export async function getActiveAgents(): Promise<{ data: Agent[]; error: null }> {
  return { data: getAgents().filter((a) => a.is_active), error: null };
}

/** 获取所有 Agent 列表 */
export async function getAllAgents(): Promise<{ data: Agent[]; error: null }> {
  return { data: [...getAgents()], error: null };
}

/** 获取单个模型 */
export async function getModelById(id: string): Promise<{ data: Model | null; error: null }> {
  const model = getModels().find((m) => m.id === id) || null;
  return { data: model, error: null };
}

/** 获取单个节点 */
export async function getNodeById(id: string): Promise<{ data: NodeStatusRecord | null; error: null }> {
  const node = getNodes().find((n) => n.id === id) || null;
  return { data: node, error: null };
}
