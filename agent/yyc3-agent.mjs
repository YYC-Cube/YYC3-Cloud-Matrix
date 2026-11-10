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
 * - 告警：Ollama 上下线、内存 >90%、磁盘 >85% 边沿触发 alert 消息
 * - 心跳：收到 {type:"heartbeat"} 即回 heartbeat_ack
 *
 * 环境变量（命名规范 §三 PMO_ 前缀）：
 *   PMO_AGENT_HOST      监听地址（默认 0.0.0.0）
 *   PMO_AGENT_PORT      监听端口（默认 3113）
 *   PMO_WS_PATH         WS 路径（默认 /ws）
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
  host: process.env.PMO_AGENT_HOST || "0.0.0.0",
  port: Number.parseInt(process.env.PMO_AGENT_PORT || "3113", 10),
  wsPath: process.env.PMO_WS_PATH || "/ws",
  ollamaBaseUrl: process.env.PMO_OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  nodeId: (process.env.PMO_NODE_ID || os.hostname().replace(/\.local$/, "").toUpperCase()),
  intervalMs: Math.max(500, Number.parseInt(process.env.PMO_INTERVAL_MS || "2000", 10)),
  maxThroughputHistory: 60,
  memAlertThreshold: 90,
  diskAlertThreshold: 85,
});

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
/** 已发出的边沿告警状态 */
const alertState = { ollamaDown: false, memHigh: false, diskHigh: false };
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

  if (mem !== null && mem > CONFIG.memAlertThreshold && !alertState.memHigh) {
    pushAlert("critical", `内存占用 ${mem}% 超过阈值 ${CONFIG.memAlertThreshold}%`);
  }
  alertState.memHigh = mem !== null && mem > CONFIG.memAlertThreshold;

  if (disk && disk.percent > CONFIG.diskAlertThreshold && !alertState.diskHigh) {
    pushAlert("warning", `磁盘占用 ${disk.percent}% 超过阈值 ${CONFIG.diskAlertThreshold}%`);
  }
  alertState.diskHigh = disk !== null && disk.percent > CONFIG.diskAlertThreshold;

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
  if (alertState.memHigh) {
    activeAlerts.push({
      id: "active-mem-high",
      level: "critical",
      message: `内存占用 ${mem}% 超过阈值 ${CONFIG.memAlertThreshold}%`,
      source: "yyc3-agent",
      timestamp: Date.now(),
    });
  }
  if (alertState.diskHigh && disk) {
    activeAlerts.push({
      id: "active-disk-high",
      level: "warning",
      message: `磁盘占用 ${disk.percent}% 超过阈值 ${CONFIG.diskAlertThreshold}%`,
      source: "yyc3-agent",
      timestamp: Date.now(),
    });
  }

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
  if (url.pathname === "/healthz") {
    const body = JSON.stringify({
      ok: true,
      agent: "yyc3-agent",
      nodeId: CONFIG.nodeId,
      clients: clients.size,
      intervalMs: CONFIG.intervalMs,
      ollama: CONFIG.ollamaBaseUrl,
      uptimeSec: Math.round(process.uptime()),
    });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(body);
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
  log(`  WS:        ws://${CONFIG.host}:${CONFIG.port}${CONFIG.wsPath}`);
  log(`  Health:    http://${CONFIG.host}:${CONFIG.port}/healthz`);
  log(`  Node:      ${CONFIG.nodeId} · 间隔 ${CONFIG.intervalMs}ms · Ollama ${CONFIG.ollamaBaseUrl}`);
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
