/**
 * @file: AIAssistant.tsx
 * @description: AIAssistant.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Command,
  Copy,
  Cpu,
  Database,
  Eye,
  Gauge,
  GripVertical,
  HardDrive,
  Key,
  Layers,
  Loader2,
  Maximize2,
  MemoryStick,
  MessageSquare,
  Minimize2,
  Network,
  Play,
  Radio,
  RotateCcw,
  Send,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Thermometer,
  Trash2,
  Wifi,
  X,
  XCircle,
  Zap
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { useSettingsStore } from "../../hooks/useSettingsStore";
import { useWebSocketData } from "../../hooks/useWebSocketData";
import { runFullSystemDiagnostic, testAIConnection, type AIConnectionConfig, type SystemDiagnosticResult } from "../../lib/connection-test-engine";
import { useNodeSlice } from "../../store/slices/node-slice";
import { useProviderSlice } from "../../store/slices/provider-slice";
import { useUIPrefsSlice } from "../../store/slices/ui-prefs-slice";
import type { ChatMessage, CommandCategory } from "../../types";
import { YYC3LogoSvg } from "./YYC3LogoSvg";

// ============================================================
// Types (local to AIAssistant)
// ============================================================

interface SystemCommand {
  id: string;
  icon: typeof Zap;
  label: string;
  desc: string;
  category: CommandCategory;
  action: string;
  color: string;
}

interface PromptPreset {
  id: string;
  name: string;
  prompt: string;
  category: string;
}

// ============================================================
// Constants
// ============================================================

const INITIAL_TIMESTAMP = Date.now();

let messageIdCounter = 0;
const generateMessageId = (suffix: string = ""): string => {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}${suffix}`;
};

const getCurrentTimestamp = (): number => Date.now();

const SYSTEM_COMMANDS: SystemCommand[] = [
  { id: "cmd-01", icon: Activity, label: "集群状态总览", desc: "获取所有节点实时状态", category: "cluster", action: "查看当前集群所有节点的运行状态、GPU利用率和温度", color: "#00d4ff" },
  { id: "cmd-02", icon: Server, label: "重启异常节点", desc: "自动检测并重启异常节点", category: "cluster", action: "检测并重启所有状态异常的推理节点", color: "#ff6600" },
  { id: "cmd-03", icon: Layers, label: "部署模型", desc: "将模型部署到指定节点", category: "model", action: "将 DeepSeek-V3 模型部署到空闲 GPU 节点", color: "#00ff88" },
  { id: "cmd-04", icon: Cpu, label: "推理性能报告", desc: "生成推理性能分析报告", category: "model", action: "生成过去24小时的推理性能分析报告", color: "#aa55ff" },
  { id: "cmd-05", icon: Database, label: "数据库健康检查", desc: "检查 PostgreSQL 连接状态", category: "data", action: "执行数据库健康检查，检测连接池和慢查询", color: "#ffdd00" },
  { id: "cmd-06", icon: HardDrive, label: "存储空间分析", desc: "分析存储使用和清理建议", category: "data", action: "分析当前存储空间使用情况给出清理建议", color: "#ff3366" },
  { id: "cmd-07", icon: Shield, label: "安全审计扫描", desc: "扫描安全漏洞和异常访问", category: "security", action: "执行安全审计扫描，检查异常访问和潜在风险", color: "#ff3366" },
  { id: "cmd-08", icon: Network, label: "网络延迟诊断", desc: "诊断节点间网络延迟", category: "monitor", action: "诊断所有节点间的网络延迟和带宽状态", color: "#00d4ff" },
  { id: "cmd-09", icon: Zap, label: "一键优化配置", desc: "AI 自动优化系统配置", category: "cluster", action: "根据当前负载情况，AI 自动优化集群配置参数", color: "#00ff88" },
  { id: "cmd-10", icon: RotateCcw, label: "WebSocket 重连", desc: "重新建立数据推送连接", category: "monitor", action: "重新建立 WebSocket 实时数据推送连接", color: "#aa55ff" },
];

const PROMPT_PRESETS: PromptPreset[] = [
  { id: "p1", name: "运维诊断专家", prompt: "你是 CP-IM 矩阵系统的运维诊断专家。请分析系统当前状态，识别潜在问题，给出优化建议。使用中文回答，简洁专业。", category: "运维" },
  { id: "p2", name: "模型调优顾问", prompt: "你是大模型推理调优专家。请根据当前模型部署情况，分析推理性能瓶颈，建议最优的 batch size、并行策略和内存配置。", category: "模型" },
  { id: "p3", name: "数据分析师", prompt: "你是数据分析专家。请解读系统监控数据，识别趋势和异常，生成可视化报告建议。关注 QPS、延迟、GPU 利用率等关键指标。", category: "数据" },
  { id: "p4", name: "安全审计员", prompt: "你是信息安全审计专家。请审查系统安全日志，识别异常访问模式、潜在入侵行为，并建议安全加固措施。", category: "安全" },
  { id: "p5", name: "智能运维助手", prompt: "你是 CP-IM 本地推理矩阵的 AI 运维助手。帮助用户快速执行运维操作、查询系统状态、部署模型、分析日志。一切以中文交互，保持简洁友好。", category: "通用" },
];

// Simulated AI responses
function generateMockResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes("状态") || lower.includes("总览") || lower.includes("节点")) {
    return `## 集群状态报告\n\n**时间**: ${new Date().toLocaleString("zh-CN")}\n\n| 节点 | 状态 | GPU | 温度 |\n|------|------|-----|------|\n| GPU-A100-01 | 🟢 正常 | 87% | 68°C |\n| GPU-A100-02 | 🟢 正常 | 92% | 74°C |\n| GPU-A100-03 | 🟡 预警 | 98% | 82°C |\n| GPU-H100-01 | 🟢 正常 | 65% | 55°C |\n\n**建议**: GPU-A100-03 负载过高，建议将部分任务迁移到 GPU-H100-01。`;
  }

  if (lower.includes("部署") || lower.includes("模型")) {
    return `## 模型部署方案\n\n**目标模型**: DeepSeek-V3\n**推荐节点**: GPU-H100-03（当前空闲）\n\n**部署步骤**:\n1. 检查节点可用显存 → 80GB 可用 ✅\n2. 加载模型权重 → 预计 3 分钟\n3. 初始化推理引擎 → KV-Cache 预热\n4. 健康检查 → 验证推理准确率\n\n**预计时间**: 5-8 分钟\n**状态**: 等待确认执行`;
  }

  if (lower.includes("优化") || lower.includes("配置")) {
    return `## AI 优化建议\n\n基于当前系统状态分析：\n\n1. **推理并行度**: 建议从 4 提升到 6（当前 GPU 利用率有余量）\n2. **Batch Size**: 从 32 调整为 48（可提升 15% 吞吐）\n3. **KV-Cache**: 建议启用 PagedAttention，预计减少 30% 显存占用\n4. **负载均衡**: 建议切换为加权轮询策略\n\n**预估提升**: 整体推理吞吐提升约 22%`;
  }

  if (lower.includes("安全") || lower.includes("审计")) {
    return `## 安全审计摘要\n\n**扫描范围**: 全系统\n**扫描时间**: ${new Date().toLocaleString("zh-CN")}\n\n⚠️ **发现 2 项需关注**:\n1. IP 203.0.113.45 尝试非法 Token 访问（已拦截）\n2. 缓存服务响应时间波动（建议监控）\n\n✅ **安全项通过**: API 速率限制、MFA 认证、审计日志\n\n**风险评级**: 低风险 🟢`;
  }

  if (lower.includes("数据库") || lower.includes("存储") || lower.includes("postgresql")) {
    return `## 数据库健康报告\n\n**PostgreSQL** (localhost:5433)\n- 连接状态: 🟢 正常\n- 活跃连接: 24/100\n- 慢查询: 2 条（> 500ms）\n- 存储使用: 12.8TB / 48TB (27%)\n\n**向量数据库**: 5.2TB / 8TB (65%) ⚠️\n\n**建议**: 向量数据库使用率较高，建议计划扩容或清理过期索引。`;
  }

  return `收到您的请求："${userMsg}"\n\n我正在分析系统当前状态...\n\n**系统概览**:\n- 集群运行正常，7/8 节点活跃\n- 当前 QPS: ~3,800，推理延: ~48ms\n- GPU 平均利用率: 82.4%\n\n请问需要我执行具体操作还是查看更多详情？您可以输入具体命令或使用左侧的快捷操作按钮。`;
}

// ============================================================
// Component
// ============================================================

interface AIAssistantProps {
  isMobile: boolean;
}

export function AIAssistant({ isMobile }: AIAssistantProps) {
  // Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "commands" | "prompts" | "settings" | "overview">("chat");

  // Drag state (position persisted via useUIPrefsSlice)
  const position = useUIPrefsSlice((s) => s.aiFloatPosition);
  const setAIFloatPosition = useUIPrefsSlice((s) => s.setAIFloatPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Connection test state
  const [connTestStatus, setConnTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [connTestResult, setConnTestResult] = useState<string>("");
  const [connTestTime, setConnTestTime] = useState<number>(0);
  const [connTestSteps, setConnTestSteps] = useState<Array<{ label: string; status: string; detail: string; latencyMs?: number }>>([]);

  // Data hooks for overview tab
  const { nodes } = useNodeSlice();
  const wsData = useWebSocketData();

  // 从 provider-slice 获取动态模型列表
  const { configuredModels: _configuredModels, ollamaModels, ollamaLoading, fetchOllamaModels } = useProviderSlice();

  const availableModels = useMemo(() => {
    const models: Array<{ id: string; name: string; provider: string; isLocal: boolean }> = [];
    _configuredModels.forEach((cm) => {
      models.push({
        id: cm.id,
        name: `${cm.model} (${cm.providerLabel})`,
        provider: cm.providerLabel,
        isLocal: cm.providerId === "ollama",
      });
    });
    const configuredOllamaNames = new Set(
      _configuredModels.filter((cm) => cm.providerId === "ollama").map((cm) => cm.model)
    );
    ollamaModels.forEach((om) => {
      if (!configuredOllamaNames.has(om.name)) {
        models.push({
          id: `ollama-live-${om.name}`,
          name: om.name,
          provider: "Ollama (本地)",
          isLocal: true,
        });
      }
    });
    return models.sort((a, b) => (a.isLocal === b.isLocal ? 0 : a.isLocal ? -1 : 1));
  }, [_configuredModels, ollamaModels]);

  // ★ 从 useSettingsStore 获取全局 AI 配置 (设置页 = 唯一数据源)
  const { values: settingsValues, updateValue: updateSettingsValue } = useSettingsStore();

  // 派生自全局设置 — 修改即时同步到 Settings 页
  const apiKey = settingsValues.aiApiKey;
  const setApiKey = useCallback((v: string) => updateSettingsValue("aiApiKey", v), [updateSettingsValue]);
  const selectedModel = settingsValues.aiModel;
  const setSelectedModel = useCallback((v: string) => updateSettingsValue("aiModel", v), [updateSettingsValue]);
  const temperature = parseFloat(settingsValues.aiTemperature) || 0.7;
  const setTemperature = useCallback((v: number) => updateSettingsValue("aiTemperature", String(v)), [updateSettingsValue]);
  const topP = parseFloat(settingsValues.aiTopP) || 0.9;
  const setTopP = useCallback((v: number) => updateSettingsValue("aiTopP", String(v)), [updateSettingsValue]);
  const maxTokens = parseInt(settingsValues.aiMaxTokens) || 2048;
  const setMaxTokens = useCallback((v: number) => updateSettingsValue("aiMaxTokens", String(v)), [updateSettingsValue]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是 CP-IM AI 智能助理。\n\n我可以帮你：\n- 📊 查看集群状态和性能报告\n- 🚀 部署和管理推理模型\n- 🔧 执行系统运维操作\n- 🔍 分析日志和诊断问题\n\n请输入指令或点击右侧快捷命令开始操作。",
      timestamp: INITIAL_TIMESTAMP,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // AI Settings (只保留本地 UI 状态)
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_PRESETS[4].prompt);

  // Command filter
  const [cmdFilter, setCmdFilter] = useState<string>("all");
  const [copiedId, copyToClipboard] = useCopyFeedback<string>();

  // 自动选中第一个可用模型
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableModels, selectedModel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) { return; }

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: content.trim(),
      timestamp: getCurrentTimestamp(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const response = generateMockResponse(content);
    const assistantMsg: ChatMessage = {
      id: generateMessageId("-resp"),
      role: "assistant",
      content: response,
      timestamp: getCurrentTimestamp(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const executeCommand = (cmd: SystemCommand) => {
    setActiveTab("chat");
    sendMessage(cmd.action);
  };

  const applyPreset = (preset: PromptPreset) => {
    setSystemPrompt(preset.prompt);
    setActiveTab("chat");
    const sysMsg: ChatMessage = {
      id: generateMessageId("-sys"),
      role: "system",
      content: `✅ 已切换系统角色为「${preset.name}」`,
      timestamp: getCurrentTimestamp(),
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: "对话已清空。请输入新的指令开始操作。",
      timestamp: getCurrentTimestamp(),
    }]);
  };

  // ========== DRAG HANDLERS ==========
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMobile || isMaximized) { return; }
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  }, [isMobile, isMaximized, position.x, position.y]);

  useEffect(() => {
    if (!isDragging || !dragRef.current) { return; }
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) { return; }
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      let newX = dragRef.current.startPosX + dx;
      let newY = dragRef.current.startPosY + dy;

      const panelW = 480;
      const panelH = 640;
      const padding = 12;
      newX = Math.max(padding, Math.min(newX, window.innerWidth - panelW - padding));
      newY = Math.max(padding, Math.min(newY, window.innerHeight - panelH - padding));

      setAIFloatPosition({ x: newX, y: newY });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, setAIFloatPosition]);

  // ========== ONE-CLICK FULL SYSTEM DIAGNOSTIC ==========
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<SystemDiagnosticResult | null>(null);

  const runDiagnostic = useCallback(async () => {
    setDiagRunning(true);
    setDiagResult(null);
    try {
      const model = availableModels.find(m => m.id === selectedModel);
      const aiConfigs: AIConnectionConfig[] = model ? [{
        providerId: model.provider || "unknown",
        providerLabel: model.provider || "Unknown",
        baseUrl: model.isLocal
          ? (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:11434` : "http://localhost:11434")
          : "",
        authType: "bearer",
        apiKey: apiKey || "",
        modelId: model.id,
        modelName: model.name,
        isLocal: model.isLocal,
      }] : [];
      const result = await runFullSystemDiagnostic({ aiConfigs, testWs: true });
      setDiagResult(result);
    } catch (err: unknown) {
      console.error("[AIAssistant] Diagnostic error:", err);
    } finally {
      setDiagRunning(false);
    }
  }, [selectedModel, availableModels, apiKey]);

  // Also upgrade single-model testConnection to use engine
  const testConnection = useCallback(async () => {
    const model = availableModels.find(m => m.id === selectedModel);
    if (!model) { return; }
    setConnTestStatus("testing");
    setConnTestResult("");
    setConnTestTime(0);
    setConnTestSteps([]);
    const t0 = Date.now();
    try {
      const config: AIConnectionConfig = {
        providerId: model.provider || "unknown",
        providerLabel: model.provider || "Unknown",
        baseUrl: model.isLocal
          ? (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:11434` : "http://localhost:11434")
          : "",
        authType: "bearer",
        apiKey: apiKey || "",
        modelId: model.id,
        modelName: model.name,
        isLocal: model.isLocal,
      };
      const result = await testAIConnection(config);
      setConnTestStatus(result.overallStatus === "pass" ? "success" : "error");
      setConnTestSteps(result.steps.map(s => ({ label: s.label, status: s.status, detail: s.detail, latencyMs: s.latencyMs })));
      setConnTestResult(result.steps.map(s => `[${s.status === "pass" ? "✅" : s.status === "warn" ? "⚠️" : "❌"}] ${s.label}: ${s.detail}`).join(" | "));
      setConnTestTime(result.totalLatencyMs || (Date.now() - t0));
    } catch (err: unknown) {
      setConnTestStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      setConnTestResult(msg.includes("timeout") ? "连接超时，请检查网络或服务地址" : msg);
      setConnTestTime(Date.now() - t0);
    }
  }, [selectedModel, availableModels, apiKey]);

  const cmdCategories = [
    { key: "all", label: "全部" },
    { key: "cluster", label: "集群" },
    { key: "model", label: "模型" },
    { key: "data", label: "数据" },
    { key: "security", label: "安全" },
    { key: "monitor", label: "监控" },
  ];

  const filteredCommands = cmdFilter === "all"
    ? SYSTEM_COMMANDS
    : SYSTEM_COMMANDS.filter(c => c.category === cmdFilter);

  // Panel positioning: drag position > default fixed
  const panelStyle: React.CSSProperties | undefined = !isMobile && !isMaximized && position.x >= 0 && position.y >= 0
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : undefined;
  const panelBaseClass = isMaximized
    ? "fixed inset-4 md:inset-8 z-[60]"
    : isMobile
      ? "fixed inset-0 z-[60]"
      : "fixed bottom-20 right-4 w-[480px] h-[640px] z-[60]";

  // ========== FLOATING BUTTON ==========
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-testid="ai-assistant-float-btn"
        className="fixed z-[60] group"
        style={{
          bottom: isMobile ? 80 : 24,
          right: isMobile ? 16 : 24,
        }}
      >
        <div className="relative rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] flex items-center justify-center shadow-[0_0_30px_rgba(0,180,255,0.4)] hover:shadow-[0_0_40px_rgba(0,180,255,0.6)] transition-all hover:scale-105 active:scale-95"
          style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
        >
          <YYC3LogoSvg size={isMobile ? 24 : 28} showText={false} className="rounded-md" />
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] animate-ping opacity-20" />
          {/* Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,136,0.5)]">
            <Sparkles className="w-3 h-3 text-[#060e1f]" />
          </div>
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-[rgba(8,25,55,0.95)] border border-[rgba(0,180,255,0.2)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-[#00d4ff]" style={{ fontSize: "0.72rem" }}>AI 智能助理 (⌘J)</span>
        </div>
      </button>
    );
  }

  // ========== MAIN PANEL ==========
  return (
    <div className={panelBaseClass} style={panelStyle} ref={panelRef}>
      <div className="w-full h-full rounded-2xl bg-[rgba(8,25,55,0.95)] backdrop-blur-2xl border border-[rgba(0,180,255,0.2)] shadow-[0_0_60px_rgba(0,180,255,0.12)] flex flex-col overflow-hidden">

        {/* ========= Header (Drag Handle) ========= */}
        <div
          className={`shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(0,180,255,0.12)] bg-[rgba(0,40,80,0.2)] ${!isMobile && !isMaximized ? "cursor-grab active:cursor-grabbing select-none" : ""}`}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-3">
            {!isMobile && !isMaximized && (
              <GripVertical className="w-3.5 h-3.5 text-[rgba(0,212,255,0.25)] shrink-0" />
            )}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] flex items-center justify-center shadow-[0_0_15px_rgba(0,180,255,0.3)] overflow-hidden">
              <YYC3LogoSvg size={20} showText={false} className="rounded" />
            </div>
            <div>
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>AI 智能助理</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.62rem" }}>
                  {availableModels.find(m => m.id === selectedModel)?.name ?? (ollamaLoading ? "模型加载中..." : "未选择模型")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all"
              title="清空对话"
            >
              <Trash2 className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
            </button>
            {!isMobile && (
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                data-testid="ai-assistant-maximize-btn"
                className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all"
                title={isMaximized ? "还原" : "最大化"}
              >
                {isMaximized
                  ? <Minimize2 className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
                  : <Maximize2 className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />}
              </button>
            )}
            <button
              onClick={() => { setIsOpen(false); setIsMaximized(false); }}
              data-testid="ai-assistant-close-btn"
              className="p-1.5 rounded-lg hover:bg-[rgba(255,51,102,0.1)] transition-all"
            >
              <X className="w-4 h-4 text-[rgba(0,212,255,0.5)]" />
            </button>
          </div>
        </div>

        {/* ========= Tab Bar ========= */}
        <div className="shrink-0 flex items-center gap-0.5 px-3 py-2 border-b border-[rgba(0,180,255,0.08)] bg-[rgba(0,40,80,0.1)]">
          {([
            { key: "chat" as const, icon: MessageSquare, label: "对话" },
            { key: "overview" as const, icon: Eye, label: "速览" },
            { key: "commands" as const, icon: Command, label: "命令" },
            { key: "prompts" as const, icon: BookOpen, label: "提示词" },
            { key: "settings" as const, icon: Sliders, label: "配置" },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === tab.key
                ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
                : "text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] border border-transparent"
                }`}
              style={{ fontSize: "0.72rem" }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========= Content ========= */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* === Chat Tab === */}
          {activeTab === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] relative group ${msg.role === "user"
                      ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.2)] rounded-2xl rounded-br-sm"
                      : msg.role === "system"
                        ? "bg-[rgba(255,221,0,0.08)] border border-[rgba(255,221,0,0.15)] rounded-2xl"
                        : "bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] rounded-2xl rounded-bl-sm"
                      } px-3.5 py-2.5`}>
                      <div
                        className={`whitespace-pre-wrap ${msg.role === "user" ? "text-[#e0f0ff]" : msg.role === "system" ? "text-[#ffdd00]" : "text-[#c0dcf0]"
                          }`}
                        style={{ fontSize: "0.78rem", lineHeight: "1.6" }}
                      >
                        {msg.content}
                      </div>
                      {/* Copy button */}
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgba(0,212,255,0.1)] transition-all"
                        >
                          {copiedId === msg.id
                            ? <Check className="w-3 h-3 text-[#00ff88]" />
                            : <Copy className="w-3 h-3 text-[rgba(0,212,255,0.3)]" />}
                        </button>
                      )}
                      <div className="text-[rgba(0,212,255,0.2)] mt-1" style={{ fontSize: "0.58rem" }}>
                        {new Date(msg.timestamp).toLocaleTimeString("zh-CN")}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 p-3 border-t border-[rgba(0,180,255,0.1)]">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入指令... (Enter 发送, Shift+Enter 换行)"
                    rows={1}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] resize-none"
                    style={{ fontSize: "0.8rem", maxHeight: "100px" }}
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    data-testid="ai-assistant-send-btn"
                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white hover:shadow-[0_0_15px_rgba(0,180,255,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* === Commands Tab === */}
          {activeTab === "commands" && (
            <div className="flex-1 overflow-auto p-3">
              <div className="flex items-center gap-1 mb-3 flex-wrap">
                {cmdCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCmdFilter(cat.key)}
                    data-testid={`cmd-cat-${cat.key}`}
                    className={`px-2.5 py-1 rounded-lg transition-all ${cmdFilter === cat.key
                      ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
                      : "text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] border border-transparent"
                      }`}
                    style={{ fontSize: "0.68rem" }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)] hover:border-[rgba(0,180,255,0.25)] hover:bg-[rgba(0,40,80,0.3)] transition-all text-left group"
                    >
                      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${cmd.color}12` }}>
                        <Icon className="w-4 h-4" style={{ color: cmd.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#e0f0ff] group-hover:text-[#00d4ff] transition-colors" style={{ fontSize: "0.8rem" }}>
                          {cmd.label}
                        </p>
                        <p className="text-[rgba(0,212,255,0.35)] truncate" style={{ fontSize: "0.68rem" }}>
                          {cmd.desc}
                        </p>
                      </div>
                      <Play className="w-4 h-4 text-[rgba(0,212,255,0.2)] group-hover:text-[#00d4ff] transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* === Prompts Tab === */}
          {activeTab === "prompts" && (
            <div className="flex-1 overflow-auto p-3">
              <h4 className="text-[#e0f0ff] mb-3" style={{ fontSize: "0.82rem" }}>
                系统提示词预设
              </h4>
              <div className="space-y-2 mb-4">
                {PROMPT_PRESETS.map(preset => (
                  <div
                    key={preset.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${systemPrompt === preset.prompt
                      ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)]"
                      : "bg-[rgba(0,40,80,0.15)] border-[rgba(0,180,255,0.08)] hover:border-[rgba(0,180,255,0.2)]"
                      }`}
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#e0f0ff]" style={{ fontSize: "0.8rem" }}>{preset.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[rgba(0,212,255,0.06)] text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.58rem" }}>
                          {preset.category}
                        </span>
                      </div>
                      {systemPrompt === preset.prompt && (
                        <Check className="w-4 h-4 text-[#00ff88]" />
                      )}
                    </div>
                    <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.68rem", lineHeight: 1.5 }}>
                      {preset.prompt.slice(0, 80)}...
                    </p>
                  </div>
                ))}
              </div>

              {/* Custom prompt editor */}
              <h4 className="text-[#e0f0ff] mb-2" style={{ fontSize: "0.82rem" }}>
                自定义系统提示词
              </h4>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] resize-none"
                style={{ fontSize: "0.75rem", lineHeight: 1.6 }}
                rows={5}
                placeholder="输入自定义系统提示词..."
              />
              <p className="text-[rgba(0,212,255,0.25)] mt-1" style={{ fontSize: "0.62rem" }}>
                字数: {systemPrompt.length} | 建议控制在 500 字以内以获得最佳效果
              </p>
            </div>
          )}

          {/* === Overview Tab (速览) === */}
          {activeTab === "overview" && (
            <div className="flex-1 overflow-auto p-3 space-y-4">
              {/* System Real-time Metrics */}
              <div>
                <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                  <Radio className="w-4 h-4 text-[#00d4ff]" />
                  系统实时指标
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "QPS", value: wsData.liveQPS?.toLocaleString() ?? "--", icon: Radio, color: "#00d4ff", unit: "" },
                    { label: "延迟", value: wsData.liveLatency?.toFixed(1) ?? "--", icon: Activity, color: "#aa55ff", unit: "ms" },
                    { label: "活跃节点", value: String(nodes.filter(n => n.status === "active").length), icon: Server, color: "#00ff88", unit: `/${nodes.length}` },
                    { label: "连接状态", value: wsData.connectionState, icon: Wifi, color: wsData.connectionState === "connected" ? "#00ff88" : "#ff6600", unit: "" },
                  ].map((metric) => (
                    <div key={metric.label} className="p-2.5 rounded-xl bg-[rgba(0,40,80,0.35)] border border-[rgba(0,180,255,0.08)]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <metric.icon className="w-3 h-3" style={{ color: metric.color }} />
                        <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.58rem" }}>{metric.label}</span>
                      </div>
                      <span className="font-medium" style={{ fontSize: "0.88rem", color: metric.color, fontFamily: "'Orbitron', sans-serif" }}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Quick Status */}
              <div>
                <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                  <Server className="w-4 h-4 text-[#00ff88]" />
                  节点速览
                  <span className="text-[rgba(0,212,255,0.25)] text-[0.58rem]">({nodes.length} 节点)</span>
                </h4>
                {nodes.length > 0 ? (
                  <div className="space-y-1.5 max-h-[200px] overflow-auto pr-1">
                    {nodes.slice(0, 8).map((node) => {
                      const statusColor = node.status === "active" ? "#00ff88" : node.status === "warning" ? "#ffdd00" : "rgba(0,212,255,0.3)";
                      const gpuColor = node.gpu >= 90 ? "#ff3366" : node.gpu >= 70 ? "#ffdd00" : "#00d4ff";
                      const tempColor = node.temp >= 75 ? "#ff3366" : node.temp >= 60 ? "#ffdd00" : "#00ff88";
                      return (
                        <div key={node.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[rgba(0,40,80,0.25)] border border-[rgba(0,180,255,0.06)] hover:border-[rgba(0,180,255,0.15)] transition-all">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}40` }} />
                          <span className="text-[#e0f0ff] truncate flex-1" style={{ fontSize: "0.68rem" }}>{node.id}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="flex items-center gap-0.5" title={`GPU ${node.gpu}%`} style={{ fontSize: "0.55rem", color: gpuColor }}>
                              <Cpu className="w-3 h-3" />{node.gpu}%
                            </span>
                            <span className="flex items-center gap-0.5" title={`内存 ${node.mem}%`} style={{ fontSize: "0.55rem", color: node.mem > 80 ? "#ffdd00" : "rgba(0,212,255,0.5)" }}>
                              <MemoryStick className="w-3 h-3" />{node.mem}%
                            </span>
                            <span className="flex items-center gap-0.5" title={`${node.temp}°C`} style={{ fontSize: "0.55rem", color: tempColor }}>
                              <Thermometer className="w-3 h-3" />{node.temp}°
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {nodes.length > 8 && (
                      <p className="text-center text-[rgba(0,212,255,0.25)] py-1" style={{ fontSize: "0.6rem" }}>
                        还有 {nodes.length - 8} 个节点...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Gauge className="w-8 h-8 mx-auto mb-2 text-[rgba(0,212,255,0.15)]" />
                    <p className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.72rem" }}>暂无节点数据</p>
                    <p className="text-[rgba(0,212,255,0.18)]" style={{ fontSize: "0.58rem" }}>节点数据将通过 WebSocket 实时同步</p>
                  </div>
                )}
              </div>

              {/* One-Click Full System Diagnostic */}
              <div>
                <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                  <ShieldCheck className="w-4 h-4 text-[#00d4ff]" />
                  一键全系统检测
                </h4>
                <button
                  onClick={runDiagnostic}
                  disabled={diagRunning}
                  className="w-full px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2"
                  style={{
                    background: diagRunning ? "rgba(255,221,0,0.1)" : "rgba(0,212,255,0.08)",
                    borderColor: diagRunning ? "rgba(255,221,0,0.3)" : "rgba(0,180,255,0.15)",
                    color: diagRunning ? "#ffdd00" : "#00d4ff",
                    fontSize: "0.75rem",
                    cursor: diagRunning ? "wait" : "pointer",
                  }}
                >
                  {diagRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> 正在检测 AI / WebSocket / 网络...
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" /> 执行全系统连接诊断
                    </>
                  )}
                </button>

                {/* Diagnostic Results */}
                {diagResult && (
                  <div className="mt-2 space-y-2">
                    {/* Health Score Bar */}
                    <div className="px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.35)] border border-[rgba(0,180,255,0.08)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[rgba(0,212,255,0.6)]" style={{ fontSize: "0.65rem" }}>系统健康评分</span>
                        <span className="font-medium" style={{
                          fontSize: "0.9rem",
                          color: diagResult.healthScore >= 80 ? "#00ff88" : diagResult.healthScore >= 50 ? "#ffdd00" : "#ff3366",
                          fontFamily: "'Orbitron', sans-serif",
                        }}>
                          {diagResult.healthScore}/100
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(0,40,80,0.6)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${diagResult.healthScore}%`,
                            background: `linear-gradient(90deg, ${diagResult.healthScore >= 60 ? "#00ff88" : "#ff3366"}, ${diagResult.healthScore >= 80 ? "#00d4ff" : "#ffdd00"})`,
                            boxShadow: `0 0 8px ${diagResult.healthScore >= 80 ? "#00ff8840" : "#ff336630"}`,
                          }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-[#00ff88]" style={{ fontSize: "0.55rem" }}>✅ {diagResult.summary.passed} 通过</span>
                        <span className="text-[#ffdd00]" style={{ fontSize: "0.55rem" }}>⚠️ {diagResult.summary.warned} 警告</span>
                        <span className="text-[#ff3366]" style={{ fontSize: "0.55rem" }}>❌ {diagResult.summary.failed} 失败</span>
                      </div>
                    </div>

                    {/* Test Details */}
                    {diagResult.tests.map((test) => (
                      <div key={test.id} className="px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.25)] border border-[rgba(0,180,255,0.06)]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[#e0f0ff] flex items-center gap-1.5" style={{ fontSize: "0.68rem" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: test.color }} />
                            {test.name}
                          </span>
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{
                            color: test.overallStatus === "pass" ? "#00ff88" : test.overallStatus === "warn" ? "#ffdd00" : "#ff3366",
                            background: `${test.overallStatus === "pass" ? "rgba(0,255,136,0.1)" : test.overallStatus === "warn" ? "rgba(255,221,0,0.1)" : "rgba(255,51,102,0.1)"}`,
                          }}>
                            {test.totalLatencyMs}ms · {test.overallStatus === "pass" ? "通过" : test.overallStatus === "warn" ? "警告" : "失败"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {test.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span style={{ fontSize: "0.55rem", color: step.status === "pass" ? "#00ff88" : step.status === "warn" ? "#ffdd00" : step.status === "fail" ? "#ff3366" : "rgba(0,212,255,0.3)" }}>
                                {step.status === "pass" ? "✓" : step.status === "warn" ? "!" : step.status === "fail" ? "×" : "·"}
                              </span>
                              <span className="text-[rgba(0,212,255,0.45)]" style={{ fontSize: "0.58rem", flex: 1 }}>{step.label}</span>
                              {step.latencyMs !== null && (
                                <span className="shrink-0 font-mono" style={{ fontSize: "0.52rem", color: "rgba(0,212,255,0.25)" }}>{step.latencyMs}ms</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {test.suggestion && (
                          <p className="mt-1 pt-1 border-t border-[rgba(0,180,255,0.06)] text-[#ffdd00]" style={{ fontSize: "0.58rem", lineHeight: 1.4 }}>
                            💡 {test.suggestion}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Top Issues Summary */}
                    {diagResult.topIssues.length > 0 && (
                      <div className="px-3 py-2 rounded-lg bg-[rgba(255,51,102,0.06)] border border-[rgba(255,51,102,0.12)]">
                        <p className="text-[#ffaa00] mb-1 flex items-center gap-1" style={{ fontSize: "0.65rem" }}>
                          <AlertTriangle className="w-3 h-3" /> 待处理问题
                        </p>
                        <ul className="space-y-0.5">
                          {diagResult.topIssues.map((issue, i) => (
                            <li key={i} className="text-[rgba(255,170,0,0.7)]" style={{ fontSize: "0.58rem", lineHeight: 1.3 }}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                  <Zap className="w-4 h-4 text-[#ffdd00]" />
                  快捷操作
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {SYSTEM_COMMANDS.slice(0, 4).map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      className="px-2.5 py-2 rounded-lg text-left border border-[rgba(0,180,255,0.08)] bg-[rgba(0,40,80,0.2)] hover:bg-[rgba(0,40,80,0.4)] hover:border-[rgba(0,180,255,0.2)] transition-all group"
                    >
                      <cmd.icon className="w-3.5 h-3.5 mb-1" style={{ color: cmd.color }} />
                      <p className="text-[#e0f0ff] truncate" style={{ fontSize: "0.65rem" }}>{cmd.label}</p>
                      <p className="text-[rgba(0,212,255,0.25)] truncate leading-tight" style={{ fontSize: "0.52rem" }}>{cmd.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === Settings Tab === */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-auto p-3 space-y-4">
              {/* API Key */}
              <div>
                <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                  <Key className="w-4 h-4 text-[#ffdd00]" />
                  OpenAI API 认证
                </h4>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                    style={{ fontSize: "0.78rem", fontFamily: "monospace" }}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[rgba(0,212,255,0.1)]"
                  >
                    <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                      {showApiKey ? "隐藏" : "显示"}
                    </span>
                  </button>
                </div>
                <p className="text-[rgba(0,212,255,0.25)] mt-1" style={{ fontSize: "0.62rem" }}>
                  {apiKey ? "✅ API Key 已配置" : "⚠️ 未配置 Key，将使用本地模拟模式"}
                  {" · 密钥仅保存在本地浏览器"}
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                    <Cpu className="w-4 h-4 text-[#00d4ff]" />
                    模型选择
                  </h4>
                  <button
                    onClick={() => fetchOllamaModels()}
                    disabled={ollamaLoading}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] text-white/30 hover:text-cyan-400 transition-all disabled:opacity-50"
                    style={{ fontSize: "0.6rem" }}
                    title="刷新 Ollama 模型列表"
                  >
                    <RotateCcw className={`w-3 h-3 ${ollamaLoading ? "animate-spin" : ""}`} />
                    刷新
                  </button>
                </div>
                {ollamaLoading && (
                  <p className="text-[rgba(0,212,255,0.35)] mb-2" style={{ fontSize: "0.65rem" }}>
                    正在检测 Ollama 本地模型...
                  </p>
                )}
                {availableModels.length > 0 ? (
                  <div className="space-y-1">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        data-testid={`model-btn-${model.id}`}
                        className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-center gap-2 ${selectedModel === model.id
                          ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff]"
                          : "bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)] text-[rgba(0,212,255,0.5)] hover:border-[rgba(0,180,255,0.2)]"
                          }`}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {model.isLocal && (
                          <span className="text-[#00ff88] shrink-0" style={{ fontSize: "0.58rem" }}>本地</span>
                        )}
                        <span className="truncate flex-1">{model.name}</span>
                        <span className="text-[rgba(0,212,255,0.25)] shrink-0" style={{ fontSize: "0.55rem" }}>
                          {model.provider}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[rgba(0,212,255,0.25)] text-center py-3" style={{ fontSize: "0.72rem" }}>
                    暂无可用模型，请前往「模型设置」页面添加
                  </p>
                )}
              </div>

              {/* Connection Test */}
              {selectedModel && (
                <div>
                  <button
                    onClick={testConnection}
                    disabled={connTestStatus === "testing"}
                    className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                    style={{
                      fontSize: "0.78rem",
                      background: connTestStatus === "success"
                        ? "rgba(0,255,136,0.08)"
                        : connTestStatus === "error"
                          ? "rgba(255,51,102,0.08)"
                          : "rgba(0,40,80,0.2)",
                      border: connTestStatus === "success"
                        ? "1px solid rgba(0,255,136,0.25)"
                        : connTestStatus === "error"
                          ? "1px solid rgba(255,51,102,0.25)"
                          : "1px solid rgba(0,180,255,0.15)",
                      color: connTestStatus === "success"
                        ? "#00ff88"
                        : connTestStatus === "error"
                          ? "#ff3366"
                          : "rgba(0,212,255,0.6)",
                    }}
                  >
                    {connTestStatus === "testing" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> 测试连接中...</>
                    ) : connTestStatus === "success" ? (
                      <><CheckCircle2 className="w-4 h-4" /> 连接成功 ({connTestTime}ms)</>
                    ) : connTestStatus === "error" ? (
                      <><XCircle className="w-4 h-4" /> 连接失败</>
                    ) : (
                      <><Play className="w-4 h-4" /> 测试模型连接</>
                    )}
                  </button>
                  {(connTestStatus === "success" || connTestStatus === "error") && connTestSteps.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg space-y-1"
                      style={{
                        background: connTestStatus === "success" ? "rgba(0,255,136,0.04)" : "rgba(255,51,102,0.04)",
                        border: `1px solid ${connTestStatus === "success" ? "rgba(0,255,136,0.15)" : "rgba(255,51,102,0.15)"}`,
                      }}
                    >
                      {connTestSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span style={{ fontSize: "0.6rem" }}>
                            {step.status === "pass" ? "✅" : step.status === "warn" ? "⚠️" : "❌"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[rgba(224,240,255,0.6)]" style={{ fontSize: "0.62rem" }}>
                              {step.label}
                              {step.latencyMs !== undefined && (
                                <span className="text-[rgba(0,212,255,0.35)] ml-1">{step.latencyMs}ms</span>
                              )}
                            </span>
                            <p className="text-[rgba(224,240,255,0.35)] truncate" style={{ fontSize: "0.55rem" }}>
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                    温度 (Temperature)
                  </h4>
                  <span className="text-[#00d4ff]" style={{ fontSize: "0.8rem", fontFamily: "'Orbitron', sans-serif" }}>
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={temperature}
                  onChange={e => setTemperature(Number(e.target.value))}
                  title="温度"
                  aria-label="温度"
                  className="w-full accent-[#00d4ff]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.6rem" }}>精确 0</span>
                  <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.6rem" }}>创意 2.0</span>
                </div>
              </div>

              {/* Top-P */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                    Top-P (核采样)
                  </h4>
                  <span className="text-[#00d4ff]" style={{ fontSize: "0.8rem", fontFamily: "'Orbitron', sans-serif" }}>
                    {topP.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={e => setTopP(Number(e.target.value))}
                  title="核采样 Top-P"
                  aria-label="核采样 Top-P"
                  className="w-full accent-[#aa55ff]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.6rem" }}>集中 0</span>
                  <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.6rem" }}>多样 1.0</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                    最大 Token 数
                  </h4>
                  <span className="text-[#00d4ff]" style={{ fontSize: "0.8rem", fontFamily: "'Orbitron', sans-serif" }}>
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={maxTokens}
                  onChange={e => setMaxTokens(Number(e.target.value))}
                  title="最大 Token"
                  aria-label="最大 Token"
                  className="w-full accent-[#00ff88]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.6rem" }}>256</span>
                  <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.6rem" }}>8192</span>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => { setTemperature(0.7); setTopP(0.9); setMaxTokens(2048); }}
                className="w-full py-2.5 rounded-xl bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:border-[rgba(0,180,255,0.2)] transition-all"
                style={{ fontSize: "0.78rem" }}
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-2" />
                恢复默认参数
              </button>

              {/* Global sync hint */}
              <div className="p-2.5 rounded-xl bg-[rgba(0,255,136,0.04)] border border-[rgba(0,255,136,0.1)]">
                <p className="text-[rgba(0,255,136,0.5)] flex items-center gap-1.5" style={{ fontSize: "0.62rem" }}>
                  <Settings className="w-3 h-3" />
                  以上参数与「系统设置 → AI / 大模型配置」实时双向同步
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
