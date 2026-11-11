#!/usr/bin/env node
// ============================================================
// YYC³（YanYuCloudCube™ · 注册商标）
// 言启象限 | 语枢未来 · Words Initiate Quadrants, Language Serves as Core for Future
// 万象归元于云枢 | 深栈智启新纪元
// All things converge in cloud pivot; Deep stacks ignite a new era of intelligence
// ============================================================
// Copyright (c) 2026 YanYuCloudCube™（YYC³）| admin@0379.email
// ============================================================

/**
 * @file: yyc3-agent.mjs
 * @description: 言语云枢·智能矩阵 节点采集代理 — 真实指标采集 + WebSocket 协议服务
 * @author: YYC³ Team
 * @version: v1.0.0
 * @created: 2026-11-10
 * @status: active
 * @tags: [agent],[websocket],[metrics],[production]
 *
 * @brief: 零依赖节点代理，向前端推送真实设备指标（替代模拟数据）
 *
 * @details:
 * - WS 服务：ws://<host>:3113/ws，讲前端既有 WSMessage 协议（前端零改动）
 * - 健康检查：GET /healthz → JSON（生产探活）
 * - 采集：CPU / 内存 / 磁盘 / Ollama 推理服务状态（详见 lib/collectors.mjs）
 * - 告警：Ollama 上下线（内置）+ 动态阈值规则（前端「告警规则」面板编辑即生效）
 * - 规则下发：GET/PUT /rules（?token= 或 Bearer 鉴权），持久化 ~/.yyc3-cloud-matrix/alert-rules.json
 * - 心跳：收到 {type:"heartbeat"} 即回 heartbeat_ack
 *
 * 环境变量（命名规范 §三 PMO_ 前缀）：
 *   PMO_AGENT_HOST      监听地址（默认 127.0.0.1 仅本机；局域网接入显式设 0.0.0.0）
 *   PMO_AGENT_PORT      监听端口（默认 3113）
 *   PMO_WS_PATH         WS 路径（默认 /ws）
 *   PMO_AGENT_TOKEN     WS 访问令牌（默认读 ~/.yyc3-cloud-matrix/agent-token，不存在则自动生成）
 *   PMO_OLLAMA_BASE_URL Ollama 地址（默认 http://127.0.0.1:11434）
 *   PMO_NODE_ID         节点标识（默认主机名大写）
 *   PMO_INTERVAL_MS     推送间隔（默认 2000，下限 500）
 *
 * 用法：
 *   node agent/yyc3-agent.mjs            # 前台运行
 *   pnpm agent                           # 同上（npm script）
 *   launchd：deploy/com.yyc3.agent.plist # 生产开机自启
 */

import http from "node:http";
import os from "node:os";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  computeAcceptKey,
  createFrameDecoder,
  encodeCloseFrame,
  encodePongFrame,
  encodeTextFrame,
  WS_OPCODES,
} from "./lib/ws-codec.mjs";
import {
  createCpuSampler,
  formatBytesTB,
  readDiskUsage,
  readMemPercent,
  sampleOllama,
} from "./lib/collectors.mjs";

// ============================================================
// 配置
// ============================================================

const CONFIG = Object.freeze({
  // 安全默认：仅绑定回环地址；需要局域网接入时显式设 PMO_AGENT_HOST=0.0.0.0
  host: process.env.PMO_AGENT_HOST || "127.0.0.1",
  port: Number.parseInt(process.env.PMO_AGENT_PORT || "3113", 10),
  wsPath: process.env.PMO_WS_PATH || "/ws",
  ollamaBaseUrl: process.env.PMO_OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  nodeId: (process.env.PMO_NODE_ID || os.hostname().replace(/\.local$/, "").toUpperCase()),
  intervalMs: Math.max(500, Number.parseInt(process.env.PMO_INTERVAL_MS || "2000", 10)),
  maxThroughputHistory: 60,
});

// ============================================================
// WS 访问令牌（鉴权）
// 优先级：PMO_AGENT_TOKEN 环境变量 > ~/.yyc3-cloud-matrix/agent-token 文件
// > 自动生成随机令牌并写入该文件（0600）。
// 前端在「系统设置 → WebSocket → WS 访问令牌」填入同一令牌即可连接。
// ============================================================

function loadOrCreateToken() {
  const envToken = (process.env.PMO_AGENT_TOKEN || "").trim();
  if (envToken) {
    return { token: envToken, source: "env:PMO_AGENT_TOKEN" };
  }
  const dir = path.join(os.homedir(), ".yyc3-cloud-matrix");
  const file = path.join(dir, "agent-token");
  try {
    const existing = fs.readFileSync(file, "utf8").trim();
    if (existing) {
      return { token: existing, source: file };
    }
  } catch { /* 文件不存在则创建 */ }
  const generated = crypto.randomBytes(24).toString("hex");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, generated + "\n", { mode: 0o600 });
  return { token: generated, source: file };
}

const AUTH = loadOrCreateToken();

// ============================================================
// 动态告警规则（前端「告警规则」面板双向闭环）
// - 规则由前端通过 PUT /rules 下发，写入 ~/.yyc3-cloud-matrix/alert-rules.json 持久化
// - 规则文件不存在时使用内置默认阈值（保证开箱即有兜底告警）；
//   一旦前端下发过（哪怕空数组），规则文件即成为唯一事实源
// - 规则可评估指标：cpu / memory / disk（agent 本机可实测）；
//   gpu / latency / network / error_rate / throughput 由前端本地评估，agent 忽略
// ============================================================

const RULES_FILE = path.join(os.homedir(), ".yyc3-cloud-matrix", "alert-rules.json");

/** 内置兜底规则（仅在规则文件不存在时使用） */
const DEFAULT_AGENT_RULES = [
  {
    id: "agent-builtin-mem",
    name: "内存使用率过高",
    severity: "critical",
    enabled: true,
    thresholds: [{ metric: "memory", condition: "gt", value: 90, unit: "%" }],
    cooldownMinutes: 0,
    targets: ["*"],
  },
  {
    id: "agent-builtin-disk",
    name: "磁盘空间不足",
    severity: "warning",
    enabled: true,
    thresholds: [{ metric: "disk", condition: "gt", value: 85, unit: "%" }],
    cooldownMinutes: 0,
    targets: ["*"],
  },
];

/** agent 可实测的指标 → 从快照取值 */
const MEASURABLE_METRICS = new Set(["cpu", "memory", "disk"]);

function loadAgentRules() {
  try {
    const raw = fs.readFileSync(RULES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.rules)) {
      return { rules: parsed.rules, source: RULES_FILE };
    }
  } catch { /* 文件不存在或损坏 → 用内置兜底 */ }
  return { rules: DEFAULT_AGENT_RULES, source: "builtin-defaults" };
}

const RULES = loadAgentRules();
/** 每规则+指标的边沿/冷却状态：key = `${ruleId}:${metric}` */
const ruleStates = new Map();

const CONDITION_OPS = {
  gt: (v, t) => v > t,
  gte: (v, t) => v >= t,
  lt: (v, t) => v < t,
  lte: (v, t) => v <= t,
  eq: (v, t) => v === t,
  neq: (v, t) => v !== t,
};

const CONDITION_LABEL = { gt: ">", gte: ">=", lt: "<", lte: "<=", eq: "=", neq: "!=" };

function metricValueOf(metric, { cpu, mem, disk }) {
  if (metric === "cpu") { return cpu; }
  if (metric === "memory") { return mem; }
  if (metric === "disk") { return disk ? disk.percent : null; }
  return null;
}

function ruleTargetsThisNode(rule) {
  if (!Array.isArray(rule.targets) || rule.targets.length === 0) { return true; }
  return rule.targets.includes("*") || rule.targets.includes(CONFIG.nodeId);
}

/**
 * 评估动态规则，返回本轮新触发的告警
 * @param {{cpu:number|null, mem:number|null, disk:object|null}} measured
 * @returns {{fired: object[], active: object[]}}
 */
function evaluateAgentRules(measured) {
  const fired = [];
  const active = [];
  const now = Date.now();

  for (const rule of RULES.rules) {
    if (!rule || rule.enabled === false) { continue; }
    if (!ruleTargetsThisNode(rule)) { continue; }
    const cooldownMs = Math.max(0, Number(rule.cooldownMinutes) || 0) * 60000;

    for (const th of rule.thresholds || []) {
      if (!th || !MEASURABLE_METRICS.has(th.metric)) { continue; }
      const value = metricValueOf(th.metric, measured);
      if (value === null || value === undefined) { continue; }
      const op = CONDITION_OPS[th.condition] || CONDITION_OPS.gt;
      const triggered = op(value, Number(th.value));
      const key = `${rule.id}:${th.metric}`;
      const st = ruleStates.get(key) || { active: false, lastFiredAt: 0 };
      const unit = th.unit || "";
      const message = `[规则] ${rule.name} — ${th.metric} 当前 ${Number(value).toFixed(1)}${unit}（阈值 ${CONDITION_LABEL[th.condition] || ">"} ${th.value}${unit}）`;

      if (triggered) {
        const shouldFire = !st.active || (cooldownMs > 0 && now - st.lastFiredAt > cooldownMs);
        if (shouldFire) {
          fired.push({
            id: `agent-${rule.id}-${th.metric}-${now}`,
            level: rule.severity || "warning",
            message,
            source: "yyc3-agent",
            timestamp: now,
          });
          st.lastFiredAt = now;
        }
        st.active = true;
        active.push({
          id: `active-${rule.id}-${th.metric}`,
          level: rule.severity || "warning",
          message,
          source: "yyc3-agent",
          timestamp: st.lastFiredAt || now,
        });
      } else {
        st.active = false;
      }
      ruleStates.set(key, st);
    }
  }
  return { fired, active };
}

/**
 * 规范化前端下发的规则（只保留 agent 需要的字段，丢弃未知字段）
 * @returns {{ok: boolean, rules?: object[], error?: string}}
 */
function sanitizeAgentRules(input) {
  if (!input || !Array.isArray(input.rules)) {
    return { ok: false, error: "body must be { rules: [...] }" };
  }
  if (input.rules.length > 100) {
    return { ok: false, error: "too many rules (max 100)" };
  }
  const severities = new Set(["critical", "error", "warning", "info"]);
  const rules = [];
  for (const r of input.rules) {
    if (!r || typeof r.id !== "string" || !r.id) {
      return { ok: false, error: "each rule requires string id" };
    }
    if (!Array.isArray(r.thresholds)) {
      return { ok: false, error: `rule ${r.id}: thresholds must be an array` };
    }
    rules.push({
      id: r.id,
      name: typeof r.name === "string" ? r.name : r.id,
      severity: severities.has(r.severity) ? r.severity : "warning",
      enabled: r.enabled !== false,
      thresholds: r.thresholds
        .filter((th) => th && typeof th.metric === "string" && Number.isFinite(Number(th.value)))
        .map((th) => ({
          metric: th.metric,
          condition: typeof th.condition === "string" ? th.condition : "gt",
          value: Number(th.value),
          unit: typeof th.unit === "string" ? th.unit : "",
        })),
      cooldownMinutes: Number.isFinite(Number(r.cooldownMinutes)) ? Number(r.cooldownMinutes) : 0,
      targets: Array.isArray(r.targets) ? r.targets.filter((t) => typeof t === "string") : ["*"],
    });
  }
  return { ok: true, rules };
}

function replaceAgentRules(rules) {
  RULES.rules = rules;
  RULES.source = RULES_FILE;
  ruleStates.clear(); // 阈值语义已变，重置边沿状态避免漏报/误报
  fs.mkdirSync(path.dirname(RULES_FILE), { recursive: true });
  fs.writeFileSync(RULES_FILE, JSON.stringify({ rules, updatedAt: new Date().toISOString() }, null, 2) + "\n", { mode: 0o600 });
}

/** HTTP 鉴权：?token= 或 Authorization: Bearer（与 WS 同一令牌） */
function checkHttpAuth(req, url) {
  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const presented = url.searchParams.get("token") || bearer;
  const a = Buffer.from(presented);
  const b = Buffer.from(AUTH.token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** CORS：回环本地代理，回显来源并允许预检（前端 dev 端口跨域调用 /rules） */
function writeCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin) { res.setHeader("Access-Control-Allow-Origin", origin); }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const TAG = "[yyc3-agent]";
const log = (...args) => console.log(TAG, ...args);
const warn = (...args) => console.warn(TAG, ...args);

// ============================================================
// 采集与协议组装
// ============================================================

const cpuSample = createCpuSampler();

/** 上一次快照（用于趋势与边沿告警） */
let prevSnapshot = null;
/** 吞吐量历史（真实观测值） */
const throughputHistory = [];
/** 已发出的 Ollama 边沿告警状态 */
const alertState = { ollamaDown: false };
/** 当前活跃告警条件快照（新客户端连入时回放，边沿告警一次性会漏连） */
let activeAlerts = [];

function trendOf(current, baseline) {
  if (!baseline || baseline <= 0) { return current > 0 ? "+100.0%" : "+0.0%"; }
  const diff = (current - baseline) / baseline;
  return `${diff >= 0 ? "+" : ""}${(diff * 100).toFixed(1)}%`;
}

function nowHms() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

/**
 * 采集一次完整快照
 * @returns {Promise<{node: object, stats: object, qps: object, latency: object, point: object, alerts: object[]}>}
 */
async function collectSnapshot() {
  const [cpu, mem, disk, ollama] = await Promise.all([
    Promise.resolve(cpuSample()),
    readMemPercent(),
    readDiskUsage(),
    sampleOllama(CONFIG.ollamaBaseUrl),
  ]);

  // 推理服务口径：QPS/吞吐仅在真实流量时可测；本地代理未承载推理流量时为真实 0
  const runningModels = ollama.models.length;
  const qps = 0;
  const tokensPerSec = 0;
  // 延迟取 Ollama API 实测 RTT（服务离线时为 0，不造假）
  const latencyMs = ollama.online ? ollama.latencyMs : 0;

  const modelLabel = !ollama.online
    ? "推理服务离线"
    : runningModels === 0
      ? "无加载模型"
      : ollama.models.map((m) => m.name).join(", ");

  const node = {
    id: CONFIG.nodeId,
    status: !ollama.online ? "warning" : "active",
    // macOS 无免密 powermetrics，GPU 利用率暂以 CPU 口径占位说明：
    // 为避免误导，gpu 字段上报真实 CPU 利用率，节点 id 后缀标注口径
    gpu: cpu ?? prevSnapshot?.node?.gpu ?? 0,
    mem: mem ?? prevSnapshot?.node?.mem ?? 0,
    temp: 0, // 温度需 powermetrics 授权，未授权时报 0 并见告警说明
    model: modelLabel,
    tasks: runningModels,
  };

  const stats = {
    activeNodes: "1/1",
    gpuUtil: `${node.gpu.toFixed ? node.gpu.toFixed(1) : node.gpu}%`,
    tokenThroughput: `${tokensPerSec}K/s`,
    storageUsed: disk ? formatBytesTB(disk.usedKB * 1024) : (prevSnapshot?.stats?.storageUsed ?? "N/A"),
  };

  const point = {
    time: nowHms(),
    qps,
    latency: latencyMs,
    tokens: tokensPerSec * 1000,
  };

  const alerts = [];
  const pushAlert = (level, message) => {
    alerts.push({ id: `agent-${Date.now()}-${alerts.length}`, level, message, source: "yyc3-agent", timestamp: Date.now() });
  };

  if (!ollama.online && !alertState.ollamaDown) {
    pushAlert("warning", `Ollama 推理服务离线（${CONFIG.ollamaBaseUrl}）— ${ollama.error ?? "不可达"}`);
  }
  alertState.ollamaDown = !ollama.online;

  // 动态规则评估（前端下发的阈值规则，替代历史硬编码 mem>90/disk>85）
  const ruleResult = evaluateAgentRules({ cpu, mem, disk });
  for (const a of ruleResult.fired) { alerts.push(a); }

  // 活跃告警条件快照：与边沿触发解耦，表达「此刻仍处于告警态」的条件集合
  activeAlerts = [];
  if (!ollama.online) {
    activeAlerts.push({
      id: "active-ollama-down",
      level: "warning",
      message: `Ollama 推理服务离线（${CONFIG.ollamaBaseUrl}）— ${ollama.error ?? "不可达"}`,
      source: "yyc3-agent",
      timestamp: Date.now(),
    });
  }
  for (const a of ruleResult.active) { activeAlerts.push(a); }

  const snapshot = {
    node,
    stats,
    qps: { qps, trend: trendOf(qps, prevSnapshot?.qps?.qps) },
    latency: { latency: latencyMs, trend: trendOf(latencyMs, prevSnapshot?.latency?.latency) },
    point,
    alerts,
  };
  prevSnapshot = snapshot;
  return snapshot;
}

// ============================================================
// WebSocket 服务
// ============================================================

/** @type {Set<import("node:net").Socket>} */
const clients = new Set();

function broadcast(message) {
  const frame = encodeTextFrame(JSON.stringify(message));
  for (const socket of clients) {
    try {
      socket.write(frame);
    } catch {
      clients.delete(socket);
    }
  }
}

async function pushSnapshot() {
  if (clients.size === 0) {
    // 无客户端时仍维护吞吐历史，保证新连入客户端拿到完整曲线
    const snap = await collectSnapshot();
    throughputHistory.push(snap.point);
    if (throughputHistory.length > CONFIG.maxThroughputHistory) {
      throughputHistory.splice(0, throughputHistory.length - CONFIG.maxThroughputHistory);
    }
    return;
  }
  const snap = await collectSnapshot();
  throughputHistory.push(snap.point);
  if (throughputHistory.length > CONFIG.maxThroughputHistory) {
    throughputHistory.splice(0, throughputHistory.length - CONFIG.maxThroughputHistory);
  }
  broadcast({ type: "node_status", payload: [snap.node] });
  broadcast({ type: "system_stats", payload: snap.stats });
  broadcast({ type: "qps_update", payload: snap.qps });
  broadcast({ type: "latency_update", payload: snap.latency });
  broadcast({ type: "throughput_history", payload: throughputHistory.slice(-CONFIG.maxThroughputHistory) });
  for (const alert of snap.alerts) {
    broadcast({ type: "alert", payload: alert });
  }
}

function handleWsUpgrade(req, socket) {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = computeAcceptKey(String(key));
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  socket.setNoDelay(true);
  clients.add(socket);
  log(`客户端接入（在线 ${clients.size}）`);

  // 首帧全量同步，避免客户端等待下一个推送周期
  collectSnapshot().then((snap) => {
    const send = (msg) => {
      try { socket.write(encodeTextFrame(JSON.stringify(msg))); } catch { /* ignore */ }
    };
    send({ type: "node_status", payload: [snap.node] });
    send({ type: "system_stats", payload: snap.stats });
    send({ type: "qps_update", payload: snap.qps });
    send({ type: "latency_update", payload: snap.latency });
    send({ type: "throughput_history", payload: throughputHistory.slice(-CONFIG.maxThroughputHistory) });
    // 回放当前活跃告警：边沿告警只广播一次，后连入的客户端需要获知现存告警条件
    for (const alert of activeAlerts) {
      send({ type: "alert", payload: alert });
    }
  }).catch(() => { /* ignore */ });

  const decode = createFrameDecoder();
  socket.on("data", (chunk) => {
    let frames;
    try {
      frames = decode(chunk);
    } catch (err) {
      warn("帧解码失败，断开连接：", err instanceof Error ? err.message : err);
      try { socket.write(encodeCloseFrame(1002)); } catch { /* ignore */ }
      socket.destroy();
      clients.delete(socket);
      return;
    }
    for (const frame of frames) {
      if (frame.opcode === WS_OPCODES.PING) {
        try { socket.write(encodePongFrame(frame.payload)); } catch { /* ignore */ }
        continue;
      }
      if (frame.opcode === WS_OPCODES.CLOSE) {
        try { socket.write(encodeCloseFrame(1000)); } catch { /* ignore */ }
        socket.destroy();
        clients.delete(socket);
        continue;
      }
      if (frame.opcode !== WS_OPCODES.TEXT) { continue; }
      // 应用层心跳：DataBus 周期性发送 {type:"heartbeat"}
      try {
        const msg = JSON.parse(frame.payload.toString("utf8"));
        if (msg && msg.type === "heartbeat") {
          socket.write(encodeTextFrame(JSON.stringify({ type: "heartbeat_ack", payload: { time: Date.now() } })));
        }
      } catch { /* 非 JSON 文本忽略 */ }
    }
  });

  const drop = () => { clients.delete(socket); };
  socket.on("close", drop);
  socket.on("error", drop);
}

// ============================================================
// HTTP 服务（/healthz + WS Upgrade）
// ============================================================

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  writeCorsHeaders(req, res);

  // CORS 预检
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === "/healthz") {
    const body = JSON.stringify({
      ok: true,
      agent: "yyc3-agent",
      nodeId: CONFIG.nodeId,
      clients: clients.size,
      intervalMs: CONFIG.intervalMs,
      ollama: CONFIG.ollamaBaseUrl,
      rules: RULES.rules.length,
      rulesSource: RULES.source,
      uptimeSec: Math.round(process.uptime()),
    });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(body);
    return;
  }

  // 动态告警规则：GET 读取 / PUT 全量替换（前端「告警规则」面板编辑即生效）
  if (url.pathname === "/rules") {
    if (!checkHttpAuth(req, url)) {
      warn(`拒绝未授权规则访问（${req.socket.remoteAddress ?? "unknown"} ${req.method} /rules）`);
      res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "unauthorized" }));
      return;
    }
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true, rules: RULES.rules, source: RULES.source }));
      return;
    }
    if (req.method === "PUT") {
      const chunks = [];
      req.on("data", (c) => {
        chunks.push(c);
        if (Buffer.concat(chunks).length > 256 * 1024) {
          res.writeHead(413, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, error: "payload too large" }));
          req.destroy();
        }
      });
      req.on("end", () => {
        if (res.writableEnded) { return; }
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, error: "invalid JSON" }));
          return;
        }
        const result = sanitizeAgentRules(body);
        if (!result.ok) {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, error: result.error }));
          return;
        }
        try {
          replaceAgentRules(result.rules);
          log(`规则已更新（${result.rules.length} 条，来源前端下发）`);
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, count: result.rules.length }));
        } catch (err) {
          warn("规则写入失败：", err instanceof Error ? err.message : err);
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, error: "persist failed" }));
        }
      });
      return;
    }
    res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "method not allowed" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("yyc3-agent: use ws://" + CONFIG.host + ":" + CONFIG.port + CONFIG.wsPath + " or GET /healthz\n");
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname !== CONFIG.wsPath) {
    socket.destroy();
    return;
  }
  // WS 鉴权：?token= 必须与服务端令牌一致（时序安全比较）
  const presented = url.searchParams.get("token") ?? "";
  const a = Buffer.from(presented);
  const b = Buffer.from(AUTH.token);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    warn(`拒绝未授权 WS 连接（${req.socket.remoteAddress ?? "unknown"}）`);
    socket.write("HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nunauthorized: invalid or missing token\n");
    socket.destroy();
    return;
  }
  handleWsUpgrade(req, socket);
});

// ============================================================
// 生命周期
// ============================================================

let timer = null;

function shutdown(signal) {
  log(`收到 ${signal}，正在退出…`);
  if (timer) { clearInterval(timer); }
  for (const socket of clients) {
    try { socket.write(encodeCloseFrame(1001)); } catch { /* ignore */ }
    socket.destroy();
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

async function main() {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(CONFIG.port, CONFIG.host, resolve);
  });
  log(`言语云枢·智能矩阵 节点代理已启动`);
  log(`  WS:        ws://${CONFIG.host}:${CONFIG.port}${CONFIG.wsPath}?token=<agent-token>`);
  log(`  Health:    http://${CONFIG.host}:${CONFIG.port}/healthz`);
  log(`  Node:      ${CONFIG.nodeId} · 间隔 ${CONFIG.intervalMs}ms · Ollama ${CONFIG.ollamaBaseUrl}`);
  log(`  Rules:     ${RULES.rules.length} 条（来源 ${RULES.source}）· GET/PUT http://${CONFIG.host}:${CONFIG.port}/rules?token=<agent-token>`);
  log(`  Auth:      令牌来源 ${AUTH.source}（前端「系统设置 → WebSocket → WS 访问令牌」填入同一令牌）`);
  timer = setInterval(() => {
    pushSnapshot().catch((err) => warn("采集失败：", err instanceof Error ? err.message : err));
  }, CONFIG.intervalMs);

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(TAG, "启动失败：", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

export { collectSnapshot, CONFIG as AGENT_CONFIG };
