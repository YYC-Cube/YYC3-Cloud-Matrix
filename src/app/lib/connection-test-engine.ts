/**
 * @file: connection-test-engine.ts
 * @description: 统一连接测试引擎 — 供 AI浮窗/模型设置/SystemSettings/Dashboard 复用
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-15
 * @updated: 2026-04-30
 * @status: active
 * @tags: [lib],[engine],[connection-test]
 *
 * @brief:
 * - 从 ServiceConnectionTest.tsx 提取的核心测试逻辑，统一为可复用引擎
 * - 支持 AI 模型连接 / Ollama 本地 / WebSocket / 数据库 连接测试
 * - 每步返回延迟、状态、错误分类、修复建议
 * - v1.1: Ollama 智能闭环 — 端口探测 + 进程推测 + 环境变量修复建议
 */

// ============================================================
// Types
// ============================================================

export type TestStepStatus = "idle" | "running" | "pass" | "fail" | "warn" | "skip";

export interface TestStep {
  label: string;
  status: TestStepStatus;
  detail: string;
  latencyMs?: number;
  timestamp?: number;
}

export interface ConnectionTestResult {
  id: string;
  category: "ai" | "ollama" | "websocket" | "database" | "system";
  name: string;
  icon?: string;
  color: string;
  steps: TestStep[];
  overallStatus: TestStepStatus;
  totalLatencyMs: number;
  startedAt: number;
  completedAt?: number;
  suggestion?: string;
}

export interface SystemDiagnosticResult {
  timestamp: number;
  tests: ConnectionTestResult[];
  summary: {
    total: number;
    passed: number;
    warned: number;
    failed: number;
    skipped: number;
  };
  healthScore: number; // 0-100
  topIssues: string[];
}

export interface AIConnectionConfig {
  providerId: string;
  providerLabel: string;
  baseUrl: string;
  authType: "bearer" | "api-key" | "none";
  apiKey: string;
  modelId: string;
  modelName: string;
  isLocal: boolean;
  proxyUrl?: string;
}

// ============================================================
// Core fetch wrapper with timeout & error classification
// ============================================================

interface FetchResult {
  ok: boolean;
  status: number;
  statusText: string;
  latencyMs: number;
  body?: string;
  errorType?: "cors" | "network" | "timeout" | "http" | "unknown";
  errorMsg?: string;
}

async function timedFetch(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<FetchResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    let body = "";
    try { body = await res.text(); } catch { /* ignore */ }
    return { ok: res.ok, status: res.status, statusText: res.statusText, latencyMs, body };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    let errorType: FetchResult["errorType"] = "unknown";
    if (msg.includes("Failed to fetch") || msg.includes("CORS") || msg.includes("cross-origin") || msg.includes("net::ERR_FAILED")) {
      errorType = "cors";
    } else if (msg.includes("net::ERR_ABORTED")) {
      errorType = "network";
    } else if (msg.includes("AbortError") || msg.includes("timeout") || msg.includes("aborted")) {
      errorType = "timeout";
    } else if (msg.includes("ECONNREFUSED") || msg.includes("connection refused")) {
      errorType = "network";
    } else if (msg.includes("net::ERR_CONNECTION_REFUSED")) {
      errorType = "network";
    }
    return { ok: false, status: 0, statusText: "", latencyMs, errorType, errorMsg: msg };
  }
}

// ============================================================
// AI Model Connection Test (full pipeline)
// ============================================================

export async function testAIConnection(config: AIConnectionConfig): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    id: `ai-${config.providerId}-${config.modelId}`,
    category: config.isLocal ? "ollama" : "ai",
    name: `${config.providerLabel} / ${config.modelName}`,
    color: config.isLocal ? "#00ff88" : "#00d4ff",
    steps: [],
    overallStatus: "running",
    totalLatencyMs: 0,
    startedAt: Date.now(),
  };

  const addStep = (label: string, status: TestStepStatus, detail: string, latencyMs?: number) => {
    result.steps.push({ label, status, detail, latencyMs, timestamp: Date.now() });
  };

  const base = config.baseUrl.replace(/\/$/, "");

  if (config.isLocal) {
    return await testOllamaModelConnection(config, result, addStep);
  }

  // ===== Cloud API Provider Pipeline =====

  // Step 1: Network reachability (no-cors probe)
  addStep("网络可达性", "running", `检测 ${config.providerLabel} 服务器...`);
  const headRes = await timedFetch(base, { method: "GET", mode: "no-cors" }, 5000);
  if (headRes.latencyMs < 4500) {
    result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "pass", detail: `${config.providerLabel} 服务器可达 (${headRes.latencyMs}ms)`, latencyMs: headRes.latencyMs };
  } else {
    result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "warn", detail: `服务器响应慢或不可达 (${headRes.latencyMs}ms)`, latencyMs: headRes.latencyMs };
  }

  // Step 2: CORS preflight
  addStep("CORS 跨域检测", "running", "测试浏览器跨域策略...");
  const chatEndpoint = `${base}/chat/completions`;
  const corsRes = await timedFetch(chatEndpoint, {
    method: "OPTIONS",
    headers: { Origin: window.location.origin, "Access-Control-Request-Method": "POST" },
  }, 5000);
  if (corsRes.ok || corsRes.status === 204 || corsRes.status === 200) {
    result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "pass", detail: `CORS 预检通过 (${corsRes.latencyMs}ms)`, latencyMs: corsRes.latencyMs };
  } else if (corsRes.errorType === "cors") {
    result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "fail", detail: "CORS 预检被拒绝 — 浏览器禁止直接调用此 API", latencyMs: corsRes.latencyMs };
    result.suggestion = "解决方案: 配置 CORS 代理 / 使用本地 Ollama / 部署后端转发";
  } else {
    result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "warn", detail: `预检异常: ${corsRes.errorMsg || `HTTP ${corsRes.status}`}`, latencyMs: corsRes.latencyMs };
  }

  // Step 3: API Key authentication
  if (config.apiKey) {
    addStep("API Key 认证", "running", `验证 ${config.modelName} 认证...`);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    headers["Authorization"] = `Bearer ${config.apiKey}`;
    const directUrl = config.proxyUrl ? `${config.proxyUrl.replace(/\/$/, "")}/${chatEndpoint}` : chatEndpoint;
    const authRes = await timedFetch(directUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: config.modelId, messages: [{ role: "user", content: "ping" }], max_tokens: 1 }),
    }, 12000);

    if (authRes.ok) {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "pass", detail: `认证成功 · ${config.modelName} 可用 (${authRes.latencyMs}ms)`, latencyMs: authRes.latencyMs };
    } else if (authRes.status === 401 || authRes.body?.includes("Unauthorized")) {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "fail", detail: "API Key 无效或已过期", latencyMs: authRes.latencyMs };
      result.suggestion = `请检查 ${config.providerLabel} 的 API Key 是否正确`;
    } else if (authRes.status === 403) {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "fail", detail: `API Key 无权访问 ${config.modelName}`, latencyMs: authRes.latencyMs };
    } else if (authRes.status === 429) {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "warn", detail: "API 限流中 (429)，Key 有效但请求过频", latencyMs: authRes.latencyMs };
    } else if (authRes.errorType === "cors") {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "fail", detail: "CORS 阻止认证请求 — 需配置代理", latencyMs: authRes.latencyMs };
    } else {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "fail", detail: `HTTP ${authRes.status}: ${(authRes.body || authRes.errorMsg || "").slice(0, 150)}`, latencyMs: authRes.latencyMs };
    }
  } else {
    addStep("API Key 认证", "skip", "未配置 API Key，跳过认证");
  }

  // Step 4: Proxy channel (if configured)
  if (config.proxyUrl) {
    addStep("CORS 代理通道", "running", `通过代理 ${config.proxyUrl} 测试...`);
    const proxyHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (config.apiKey) { proxyHeaders["Authorization"] = `Bearer ${config.apiKey}`; }
    const proxyRes = await timedFetch(`${config.proxyUrl.replace(/\/$/, "")}/${chatEndpoint}`, {
      method: "POST",
      headers: proxyHeaders,
      body: JSON.stringify({ model: config.modelId, messages: [{ role: "user", content: "ping" }], max_tokens: 1 }),
    }, 12000);
    if (proxyRes.ok) {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "pass", detail: `代理转发成功 (${proxyRes.latencyMs}ms)`, latencyMs: proxyRes.latencyMs };
    } else {
      result.steps[result.steps.length - 1] = { ...result.steps[result.steps.length - 1], status: "fail", detail: `代理不可达: ${proxyRes.errorMsg}`, latencyMs: proxyRes.latencyMs };
    }
  }

  // Finalize
  finalizeResult(result);
  return result;
}

// ============================================================
// Ollama Local Connection Test
// ============================================================

async function testOllamaModelConnection(
  config: AIConnectionConfig,
  result: ConnectionTestResult,
  addStep: (label: string, status: TestStepStatus, detail: string, latencyMs?: number) => void,
): Promise<ConnectionTestResult> {
  const base = config.baseUrl.replace(/\/$/, "");

  // Dynamic import to avoid SSR issues
  let ollamaTagsUrl: string;
  let ollamaChatUrl: string;
  try {
    const ollamaModule = await import("../lib/ollama-url");
    ollamaTagsUrl = ollamaModule.getOllamaTagsUrl();
    ollamaChatUrl = ollamaModule.getOllamaChatUrl();
  } catch {
    ollamaTagsUrl = `${base}/api/tags`;
    ollamaChatUrl = `${base}/api/chat`;
  }

  // Step 1: Ollama endpoint reachability
  addStep("Ollama 端点", "running", `检测本地 Ollama 服务...`);
  const r = await timedFetch(ollamaTagsUrl, {}, 5000);
  if (r.ok) {
    result.steps[0] = { label: "Ollama 端点", status: "pass", detail: `Ollama 在线 (${r.latencyMs}ms)`, latencyMs: r.latencyMs, timestamp: Date.now() };
  } else if (r.errorType === "cors") {
    result.steps[0] = { label: "Ollama 端点", status: "warn", detail: "CORS 错误 — 请设置 OLLAMA_ORIGINS=\"*\"", latencyMs: r.latencyMs, timestamp: Date.now() };
    const noCorsR = await timedFetch(ollamaTagsUrl, { mode: "no-cors" }, 5000);
    addStep("no-cors 探测", noCorsR.latencyMs < 4000 ? "pass" : "fail",
      noCorsR.latencyMs < 4000 ? `服务存在但 CORS 未配置 (${noCorsR.latencyMs}ms)` : "服务不可达",
      noCorsR.latencyMs
    );
  } else {
    result.steps[0] = { label: "Ollama 端点", status: "fail", detail: `无法连接: ${r.errorMsg || "Ollama 未启动"}`, latencyMs: r.latencyMs, timestamp: Date.now() };
    result.suggestion = "请确认 Ollama 已启动: ollama serve";

    addStep("智能诊断", "running", "分析连接失败原因...");
    const diagDetails: string[] = [];
    const diagSuggestions: string[] = [];

    const portMatch = base.match(/:(\d+)/);
    const port = portMatch ? parseInt(portMatch[1]) : 11434;
    const host = base.replace(/^https?:\/\//, "").replace(/:\d+.*$/, "");

    diagDetails.push(`目标地址: ${host}:${port}`);

    if (host !== "localhost" && host !== "127.0.0.1") {
      diagDetails.push("⚠ 非 localhost 地址 — Ollama 默认只监听 127.0.0.1");
      diagSuggestions.push("设置环境变量: OLLAMA_HOST=0.0.0.0 后重启 Ollama");
    }

    if (r.errorType === "timeout") {
      diagDetails.push("连接超时 — 可能原因: 端口未开放 / 防火墙阻止 / 服务未启动");
      diagSuggestions.push("检查端口是否开放: curl http://localhost:" + port + "/api/tags");
      diagSuggestions.push("或运行: ollama serve");
    } else {
      diagDetails.push("网络错误 — 服务可能未启动或端口不正确");
      diagSuggestions.push("启动 Ollama: 在终端运行 ollama serve");
      diagSuggestions.push(`确认端口: 默认 11434, 当前配置 ${port}`);
    }

    if (port !== 11434) {
      diagDetails.push(`非默认端口 ${port} — 请确认 Ollama 配置了此端口`);
      diagSuggestions.push(`如需修改端口: OLLAMA_HOST=0.0.0.0:${port}`);
    }

    const diagStatus: TestStepStatus = diagSuggestions.length > 0 ? "warn" : "fail";
    addStep("智能诊断", diagStatus, diagDetails.join("; "));

    if (diagSuggestions.length > 0) {
      result.suggestion = diagSuggestions.join("\n");
    }
    finalizeResult(result); return result;
  }

  // Step 2: Model list check
  addStep("模型列表", "running", "获取已安装模型...");
  try {
    const tagsRes = await timedFetch(ollamaTagsUrl);
    if (tagsRes.ok) {
      const data = JSON.parse(tagsRes.body || "{}");
      const models = data.models || [];
      const found = models.some((m: { name: string }) => m.name.includes(config.modelName) || m.name.includes(config.modelId));
      if (found) {
        result.steps[result.steps.length - 1] = { label: "模型列表", status: "pass", detail: `${config.modelName} 已安装 (共 ${models.length} 个模型)`, latencyMs: tagsRes.latencyMs, timestamp: Date.now() };
      } else {
        result.steps[result.steps.length - 1] = { label: "模型列表", status: "warn", detail: `${config.modelName} 未找到。已安装: ${models.map((m: { name: string }) => m.name).join(", ") || "(空)"}`, latencyMs: tagsRes.latencyMs, timestamp: Date.now() };
        result.suggestion = `请运行: ollama pull ${config.modelId}`;
      }
    }
  } catch { /* skip on parse error */ }

  // Step 3: Chat/inference ping — use first available model from tags
  addStep("推理测试", "running", "发送 ping 请求...");
  let inferenceModel = config.modelId;
  const EMBED_PATTERNS = /embed|e5-|bge-|text-embedding|nomic-embed|m3e|gte-|jina-embed|sentence-/i;
  try {
    const tagsCheck = await timedFetch(ollamaTagsUrl);
    if (tagsCheck.ok) {
      const tagsData = JSON.parse(tagsCheck.body || "{}");
      const allModels: Array<{ name: string; details?: { family?: string } }> = tagsData.models || [];
      const chatModels = allModels.filter(m => !EMBED_PATTERNS.test(m.name) && m.details?.family !== "bert" && m.details?.family !== "nomic-bert");
      const chatModelNames = chatModels.map(m => m.name);
      if (chatModelNames.length > 0) {
        if (!chatModelNames.includes(inferenceModel) || EMBED_PATTERNS.test(inferenceModel)) {
          inferenceModel = chatModelNames[0];
        }
      } else if (allModels.length > 0) {
        inferenceModel = allModels[0].name;
      }
    }
  } catch { /* use default modelId */ }
  const chatRes = await timedFetch(ollamaChatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: inferenceModel, messages: [{ role: "user", content: "ping" }], stream: false }),
  }, 15000);
  if (chatRes.ok) {
    result.steps[result.steps.length - 1] = { label: "推理测试", status: "pass", detail: `模型响应正常 (${chatRes.latencyMs}ms)`, latencyMs: chatRes.latencyMs, timestamp: Date.now() };
  } else {
    let errorDetail = chatRes.errorMsg || `HTTP ${chatRes.status}`;
    let suggestion = "";
    if (chatRes.status === 400) {
      try {
        const errBody = JSON.parse(chatRes.body || "{}");
        errorDetail = errBody.error || errorDetail;
      } catch { /* use raw body */ }
      if (errorDetail.includes("model") || errorDetail.includes("not found")) {
        suggestion = `模型 "${inferenceModel}" 推理失败。请运行: ollama pull ${inferenceModel}`;
      } else if (errorDetail.includes("does not support chat")) {
        suggestion = `"${inferenceModel}" 是嵌入模型，不支持对话推理。请选择对话模型进行测试。`;
        errorDetail = `推理测试跳过: ${inferenceModel} 为嵌入模型`;
      } else {
        suggestion = `推理请求格式错误: ${errorDetail}。尝试: ollama run ${inferenceModel}`;
      }
      result.steps[result.steps.length - 1] = { label: "推理测试", status: "warn", detail: `推理测试失败: ${errorDetail}`, latencyMs: chatRes.latencyMs, timestamp: Date.now() };
    } else {
      result.steps[result.steps.length - 1] = { label: "推理测试", status: chatRes.status === 404 ? "warn" : "fail", detail: errorDetail, latencyMs: chatRes.latencyMs, timestamp: Date.now() };
    }
    if (suggestion) { result.suggestion = suggestion; }
  }

  finalizeResult(result);
  return result;
}

// ============================================================
// WebSocket Connection Test
// ============================================================

export async function testWebSocketConnection(wsUrl?: string): Promise<ConnectionTestResult> {
  const url = wsUrl || (typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`
    : "ws://localhost:3218/ws");

  const result: ConnectionTestResult = {
    id: "ws-main",
    category: "websocket",
    name: "WebSocket 实时数据通道",
    color: "#aa55ff",
    steps: [],
    overallStatus: "running",
    totalLatencyMs: 0,
    startedAt: Date.now(),
  };

  const addStep = (label: string, status: TestStepStatus, detail: string, latencyMs?: number) => {
    result.steps.push({ label, status, detail, latencyMs, timestamp: Date.now() });
  };

  addStep("端点解析", "running", `解析 ${url}...`);
  const t0 = Date.now();

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url);
      const connectTimeout = setTimeout(() => {
        ws.close();
        addStep("握手超时", "fail", `10 秒内未完成 WebSocket 握手`);
        finalizeResult(result);
        resolve(result);
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectTimeout);
        const latency = Date.now() - t0;
        addStep("端点解析", "pass", `DNS + TCP 握手成功 (${latencyMs(t0)}ms)`, latency);
        result.steps[result.steps.length - 1].latencyMs = latency;
        addStep("WS 握手", "pass", `WebSocket 连接建立成功 (协议: ${ws.protocol || "default"})`, latency);
        ws.close(1000, "test-complete");
        finalizeResult(result);
        resolve(result);
      };

      ws.onerror = () => {
        clearTimeout(connectTimeout);
        const latency = Date.now() - t0;
        addStep("WS 握手", "fail", `WebSocket 连接失败 (${latency}ms)`, latency);
        result.suggestion = "检查: 1) WS 服务是否启动 2) 端口是否正确 3) 防火墙规则";
        finalizeResult(result);
        resolve(result);
      };

      ws.onclose = (ev) => {
        clearTimeout(connectTimeout);
        if (result.overallStatus === "running") {
          addStep("WS 关闭", "warn", `服务器主动关闭 (code: ${ev.code}, reason: ${ev.reason || "none"})`);
          finalizeResult(result);
          resolve(result);
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addStep("端点解析", "fail", `无法创建 WebSocket: ${msg}`);
      finalizeResult(result);
      resolve(result);
    }
  });
}

function latencyMs(startTime: number): number {
  return Date.now() - startTime;
}

// ============================================================
// Full System Diagnostic (one-click)
// ============================================================

export async function runFullSystemDiagnostic(options: {
  aiConfigs?: AIConnectionConfig[];
  testWs?: boolean;
  wsUrl?: string;
}): Promise<SystemDiagnosticResult> {
  const tests: ConnectionTestResult[] = [];

  // Run AI connection tests in parallel
  if (options.aiConfigs && options.aiConfigs.length > 0) {
    const aiResults = await Promise.all(options.aiConfigs.map(cfg => testAIConnection(cfg)));
    tests.push(...aiResults);
  }

  // Run WebSocket test
  if (options.testWs !== false) {
    try {
      const wsResult = await testWebSocketConnection(options.wsUrl);
      tests.push(wsResult);
    } catch {
      tests.push({
        id: "ws-error",
        category: "websocket",
        name: "WebSocket 通道",
        color: "#aa55ff",
        steps: [{ label: "异常", "status": "fail", "detail": "WebSocket 测试执行异常" }],
        overallStatus: "fail",
        totalLatencyMs: 0,
        startedAt: Date.now(),
        completedAt: Date.now(),
      });
    }
  }

  // Calculate summary
  const summary = {
    total: tests.length,
    passed: tests.filter(t => t.overallStatus === "pass").length,
    warned: tests.filter(t => t.overallStatus === "warn").length,
    failed: tests.filter(t => t.overallStatus === "fail").length,
    skipped: tests.filter(t => t.overallStatus === "skip").length,
  };

  const healthScore = Math.round(((summary.passed + summary.warned * 0.5) / Math.max(summary.total, 1)) * 100);

  const topIssues = tests
    .filter(t => t.overallStatus === "fail" || t.overallStatus === "warn")
    .flatMap(t => [t.suggestion ? `[${t.name}] ${t.suggestion}` : null].filter(Boolean) as string[])
    .slice(0, 5);

  return {
    timestamp: Date.now(),
    tests,
    summary,
    healthScore,
    topIssues,
  };
}

// ============================================================
// Utility
// ============================================================

function finalizeResult(result: ConnectionTestResult): void {
  const statuses = result.steps.map(s => s.status);
  if (statuses.includes("fail")) { result.overallStatus = "fail"; }
  else if (statuses.includes("warn")) { result.overallStatus = "warn"; }
  else if (statuses.every(s => s === "pass" || s === "skip")) { result.overallStatus = "pass"; }
  else { result.overallStatus = "warn"; }
  result.completedAt = Date.now();
  result.totalLatencyMs = result.completedAt - result.startedAt;
}
