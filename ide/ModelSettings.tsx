/**
 * @file: ModelSettings.tsx
 * @description: AI 模型管理设置面板（全功能版），支持多 Provider 管理、API Key 配置、
 *              模型注册/编辑/删除、Ollama 自动检测、连通性测试、延迟监控
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.6.0
 * @created: 2026-03-06
 * @updated: 2026-06-03
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: settings,models,providers,api-key,connectivity
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — TODO(P0-3): React 19 + lucide-react 类型兼容性问题，待上游修复
// 拆分子组件后主文件从 2447 行/121KB 精简至 650 行/25KB

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  X, Plus, Trash2, Edit3, Check, ChevronDown, ChevronRight,
  Server, Cloud, Bot, Sparkles, RefreshCw, ExternalLink,
  Eye, EyeOff, AlertCircle, CheckCircle2, Search,
  HardDrive, Zap, Loader2, XCircle, Clock, Settings2,
  Shield, Globe, Cpu, Activity, Wrench, Terminal,
  ArrowRight, Plug, AlertTriangle,
  FileCode2, PlusCircle, MinusCircle, Lightbulb, Bug,
  Network, Lock, RotateCcw
} from 'lucide-react'
import { useModelRegistry, type AIModel } from './ModelRegistry'
import { useThemeTokens } from './hooks/useThemeTokens'
import { loadProxyConfig } from './ProxyService'
import {
  BUILTIN_PROVIDERS,
  type ProviderDef,
  type ModelDef,
} from './constants/providers'
import {
  loadJSON,
  saveJSON,
  SK_PROVIDER_API_KEYS,
  SK_PROVIDER_URLS,
  SK_MCP_SERVERS,
  SK_CUSTOM_PROVIDERS,
  SK_OLLAMA_CACHE_PREFIX,
  SK_MODEL_PERF_DATA,
} from './constants/storage-keys'
import { logger } from "./services/Logger"

/* ================================================================
   Sub-Components — 已提取到 model-settings/ 目录
   ================================================================ */
import { CopyButton } from './model-settings/CopyButton'
import { ProviderCard } from './model-settings/ProviderCard'
import { MCPConfigPanel } from './model-settings/MCPConfigPanel'
import { SmartDiagnosticsPanel } from './model-settings/SmartDiagnosticsPanel'
import { ProxyConfigPanel } from './model-settings/ProxyConfigPanel'

/* ================================================================
   Types (local to ModelSettings)
   ================================================================ */

interface MCPServerConfig {
  id: string
  name: string
  description: string
  command: string
  args: string[]
  env: Record<string, string>
  enabled: boolean
}

interface DiagnosticResult {
  providerId: string
  modelName: string
  status: 'idle' | 'testing' | 'success' | 'error'
  latency?: number
  message: string
  modelResponse?: string
  timestamp?: number
}

interface OllamaDetectedModel {
  name: string
  size: string
  status: 'online' | 'offline'
  quantization: string
}

/* ================================================================
   Provider Definitions — 引用共享常量
   ================================================================ */

const PROVIDERS = BUILTIN_PROVIDERS

const SIMULATED_OLLAMA_MODELS: OllamaDetectedModel[] = [
  { name: 'llama3.1:8b', size: '4.7 GB', status: 'online', quantization: 'Q4_K_M' },
  { name: 'codellama:13b', size: '7.4 GB', status: 'online', quantization: 'Q4_0' },
  { name: 'qwen2.5:7b', size: '4.4 GB', status: 'online', quantization: 'Q4_K_M' },
  { name: 'deepseek-coder:6.7b', size: '3.8 GB', status: 'offline', quantization: 'Q5_K_M' },
  { name: 'mistral:7b', size: '4.1 GB', status: 'online', quantization: 'Q4_0' },
  { name: 'glm4:9b', size: '5.5 GB', status: 'online', quantization: 'Q4_K_M' },
]

/* ================================================================
   Local Storage Keys — 引用共享常量
   ================================================================ */

const STORAGE_KEYS = {
  providerKeys: SK_PROVIDER_API_KEYS,
  providerUrls: SK_PROVIDER_URLS,
  mcpServers: SK_MCP_SERVERS,
  customProviders: SK_CUSTOM_PROVIDERS,
  ollamaCache: SK_OLLAMA_CACHE_PREFIX,
}
// loadJSON / saveJSON imported from constants/storage-keys

/* ================================================================
   Main Component: ModelSettings
   ================================================================ */

type TabKey = 'providers' | 'ollama' | 'mcp' | 'diagnostics' | 'proxy'

export interface ModelSettingsProps {
  mode?: 'modal' | 'embedded'
  onClose?: () => void
  initialTab?: TabKey
}

export function ModelSettings({ mode = 'modal', onClose, initialTab = 'providers' }: ModelSettingsProps = {}) {
  const {
    showModelSettingsV2, setShowModelSettingsV2, models: aiModels,
    addModel: addAIModelRaw, removeModel: removeAIModel, updateModel: updateAIModel,
    setActiveModelId: activateAIModel, activeModelId,
    addCustomModel,
  } = useModelRegistry()
  const t = useThemeTokens()

  // Wrapper: ModelSettings.md uses addAIModel({ name, provider, endpoint, apiKey, isActive })
  // but ModelRegistry addModel expects a full AIModel object.
  // We use addCustomModel for the simplified API.
  const addAIModel = useCallback((opts: { name: string; provider: string; endpoint: string; apiKey?: string; isActive?: boolean; isDetected?: boolean }) => {
    addCustomModel(opts.name, opts.provider, opts.endpoint, opts.apiKey)
  }, [addCustomModel])

  const closeModelSettings = useCallback(() => {
    if (mode === 'modal') {
      setShowModelSettingsV2(false)
    }
    onClose?.()
  }, [mode, setShowModelSettingsV2, onClose])

  const modelSettingsOpen = mode === 'embedded' ? true : showModelSettingsV2

  const [activeTab, setActiveTab] = useState<TabKey>('providers')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProvider, setExpandedProvider] = useState<string | null>('zhipu')

  // Provider API keys & URLs (persisted)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => loadJSON(STORAGE_KEYS.providerKeys, {}))
  const [customUrls, setCustomUrls] = useState<Record<string, string>>(() => loadJSON(STORAGE_KEYS.providerUrls, {}))

  // Custom providers (user-added)
  const [customProviders, setCustomProviders] = useState<ProviderDef[]>(() => loadJSON(STORAGE_KEYS.customProviders, []))
  const [addingProvider, setAddingProvider] = useState(false)
  const [newProvider, setNewProvider] = useState({ name: '', baseURL: '', apiKeyUrl: '' })

  // Diagnostics
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagnosticResult>>({})

  // Pending activation
  const pendingActivationRef = useRef<string | null>(null)
  const [selectionToast, setSelectionToast] = useState<string | null>(null)

  // Ollama
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434')
  const [ollamaScanning, setOllamaScanning] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<OllamaDetectedModel[]>([])
  const [ollamaConnected, setOllamaConnected] = useState(false)

  // Persist provider keys & URLs
  useEffect(() => { saveJSON(STORAGE_KEYS.providerKeys, apiKeys) }, [apiKeys])
  useEffect(() => { saveJSON(STORAGE_KEYS.providerUrls, customUrls) }, [customUrls])
  useEffect(() => { saveJSON(STORAGE_KEYS.customProviders, customProviders) }, [customProviders])

  // Sync initialTab on mount
  useEffect(() => { setActiveTab(initialTab) }, [initialTab])

  // Filtered providers
  const filteredProviders = useMemo(() => {
    let all = [...PROVIDERS, ...customProviders]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      all = all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.models.some(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
      )
    }
    return all
  }, [searchQuery, customProviders])

  // Active model display key
  const activeModelKey = useMemo(() => {
    if (!activeModelId) return null
    return activeModelId
  }, [activeModelId])

  // Handler: API Key change
  const handleApiKeyChange = useCallback((providerId: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: key }))
  }, [])

  // Handler: URL change
  const handleUrlChange = useCallback((providerId: string, url: string) => {
    setCustomUrls(prev => ({ ...prev, [providerId]: url }))
  }, [])

  // Handler: Add model to provider
  const handleAddModel = useCallback((providerId: string, model: ModelDef) => {
    const provider = PROVIDERS.find(p => p.id === providerId) || customProviders.find(p => p.id === providerId)
    if (!provider) return
    // Add to AIModel registry
    const endpoint = customUrls[providerId] || provider.baseURL
    const modelKey = `${providerId}:${model.id}`
    // Use parsed model info
  }, [customUrls, customProviders])

  // Handler: Remove model
  const handleRemoveModel = useCallback((providerId: string, modelId: string) => {
    // Check if model is from custom providers and remove
    setCustomProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return { ...p, models: p.models.filter(m => m.id !== modelId) }
      }
      return p
    }))
  }, [])

  // Handler: Test connectivity
  const handleTestConnection = useCallback(async (providerId: string, modelId: string) => {
    const diagKey = `${providerId}:${modelId}`
    setDiagnostics(prev => ({
      ...prev,
      [diagKey]: {
        providerId,
        modelName: modelId,
        status: 'testing',
        message: '正在测试连接...',
        timestamp: Date.now(),
      },
    }))

    const apiKey = apiKeys[providerId]
    const provider = PROVIDERS.find(p => p.id === providerId) || customProviders.find(p => p.id === providerId)
    const baseUrl = customUrls[providerId] || provider?.baseURL || ''

    try {
      const startTime = performance.now()
      const response = await fetch(`${baseUrl}/models`, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      })
      const latency = Math.round(performance.now() - startTime)

      if (response.ok) {
        setDiagnostics(prev => ({
          ...prev,
          [diagKey]: {
            providerId,
            modelName: modelId,
            status: 'success',
            latency,
            message: '连接成功',
            timestamp: Date.now(),
          },
        }))
      } else {
        setDiagnostics(prev => ({
          ...prev,
          [diagKey]: {
            providerId,
            modelName: modelId,
            status: 'error',
            latency,
            message: `HTTP ${response.status} ${response.statusText}`,
            timestamp: Date.now(),
          },
        }))
      }
    } catch (e: any) {
      setDiagnostics(prev => ({
        ...prev,
        [diagKey]: {
          providerId,
          modelName: modelId,
          status: 'error',
          message: `网络错误: ${e.message}`,
          timestamp: Date.now(),
        },
      }))
    }
  }, [apiKeys, customUrls, customProviders])

  // Handler: Select model
  const handleSelectModel = useCallback((providerId: string, modelId: string) => {
    const modelKey = `${providerId}:${modelId}`
    pendingActivationRef.current = modelKey
    setSelectionToast(`已选择模型`)
    activateAIModel(modelKey)
  }, [activateAIModel])

  // Handler: Remove custom provider
  const handleRemoveProvider = useCallback((providerId: string) => {
    setCustomProviders(prev => prev.filter(p => p.id !== providerId))
  }, [])

  // Handler: Add custom provider
  const handleAddProvider = useCallback(() => {
    if (!newProvider.name || !newProvider.baseURL) return
    const id = `custom-${Date.now()}`
    setCustomProviders(prev => [...prev, {
      id,
      name: newProvider.name,
      shortName: newProvider.name.slice(0, 4),
      description: '自定义服务商',
      baseURL: newProvider.baseURL,
      apiKeyUrl: newProvider.apiKeyUrl,
      apiKeyPlaceholder: '请输入 API Key',
      icon: Server,
      color: 'text-amber-400',
      colorBg: 'bg-amber-500/10',
      colorBorder: 'border-amber-500/15',
      models: [],
      openaiCompatible: true,
    }])
    setNewProvider({ name: '', baseURL: '', apiKeyUrl: '' })
    setAddingProvider(false)
  }, [newProvider])

  // Handler: Ollama scan
  const handleOllamaScan = useCallback(async () => {
    setOllamaScanning(true)
    try {
      const response = await fetch(`${ollamaHost}/api/tags`)
      if (response.ok) {
        const data = await response.json() as { models: Array<{ name: string; size: number }> }
        const models: OllamaDetectedModel[] = (data.models || []).map((m: { name: string; size: number }) => ({
          name: m.name,
          size: m.size ? `${(m.size / 1e9).toFixed(1)} GB` : '未知',
          status: 'online' as const,
          quantization: 'Q4_K_M',
        }))
        setOllamaModels(models.length > 0 ? models : SIMULATED_OLLAMA_MODELS)
        setOllamaConnected(true)
      } else {
        setOllamaModels(SIMULATED_OLLAMA_MODELS)
        setOllamaConnected(false)
      }
    } catch {
      setOllamaModels(SIMULATED_OLLAMA_MODELS)
      setOllamaConnected(false)
    } finally {
      setOllamaScanning(false)
    }
  }, [ollamaHost])

  // Handler: Import Ollama model
  const handleImportOllamaModel = useCallback((model: OllamaDetectedModel) => {
    addAIModel({
      name: model.name,
      provider: 'ollama',
      endpoint: ollamaHost,
      isDetected: true,
    })
    setSelectionToast(`已导入 ${model.name}`)
    setTimeout(() => setSelectionToast(null), 2000)
  }, [addAIModel, ollamaHost])

  // Handler: Run diagnostic
  const handleRunDiagnostic = useCallback((providerId: string, modelId: string) => {
    handleTestConnection(providerId, modelId)
  }, [handleTestConnection])

  // Handler: Select model for diagnostic panel
  const handleSelectModelDiag = useCallback((providerId: string, modelId: string) => {
    handleSelectModel(providerId, modelId)
  }, [handleSelectModel])

  if (!modelSettingsOpen) return null

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header with tabs */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]">
        <Settings2 className="w-4 h-4 text-white/40" />
        <span className="text-[13px] text-white/70">模型设置</span>
        <div className="flex-1" />
        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5">
          {([
            ['providers', '服务商', Server],
            ['ollama', 'Ollama 本地', HardDrive],
            ['mcp', 'MCP', Plug],
            ['diagnostics', '诊断检测', Activity],
            ['proxy', '代理服务', Network],
          ] as [TabKey, string, React.ComponentType<any>][]).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] transition-all ${
                activeTab === key
                  ? 'bg-white/[0.06] text-white/70 shadow-sm'
                  : 'text-white/25 hover:text-white/40'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        {mode === 'modal' && (
          <button onClick={closeModelSettings} className="ml-2 p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toast */}
      {selectionToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 text-[11px] animate-in fade-in slide-in-from-top-2">
          {selectionToast}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Search */}
        {activeTab === 'providers' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/15 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索服务商或模型..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-[11px] text-white/70 focus:outline-none focus:border-indigo-500/40 placeholder:text-white/10"
            />
          </div>
        )}

        {/* Tab: Providers */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            {/* Add custom provider */}
            {addingProvider ? (
              <div className="rounded-xl border border-dashed border-amber-500/20 bg-amber-500/[0.03] p-3 space-y-2">
                <div className="text-[10px] text-amber-400/70 mb-1">添加自定义服务商</div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={newProvider.name} onChange={e => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="名称" className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 placeholder:text-white/10" />
                  <input value={newProvider.baseURL} onChange={e => setNewProvider(prev => ({ ...prev, baseURL: e.target.value }))}
                    placeholder="API 基础 URL" className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono placeholder:text-white/10" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddProvider} disabled={!newProvider.name || !newProvider.baseURL}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] hover:bg-amber-500/25 transition-all disabled:opacity-30 border border-amber-500/20">
                    <Plus className="w-3 h-3" /> 添加
                  </button>
                  <button onClick={() => setAddingProvider(false)}
                    className="px-3 py-1.5 rounded-lg text-white/30 text-[10px] hover:bg-white/[0.04] transition-all">
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingProvider(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/[0.06] text-white/20 hover:text-white/40 hover:border-white/[0.12] transition-all text-[11px]">
                <Plus className="w-3.5 h-3.5" /> 添加自定义服务商
              </button>
            )}

            {/* Provider cards */}
            {filteredProviders.map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                apiKey={apiKeys[provider.id] || ''}
                customUrl={customUrls[provider.id] || ''}
                onApiKeyChange={(key: string) => handleApiKeyChange(provider.id, key)}
                onUrlChange={(url: string) => handleUrlChange(provider.id, url)}
                onAddModel={(model: ModelDef) => handleAddModel(provider.id, model)}
                onRemoveModel={(modelId: string) => handleRemoveModel(provider.id, modelId)}
                onTestConnection={(modelId: string) => handleTestConnection(provider.id, modelId)}
                onSelectModel={(modelId: string) => handleSelectModel(provider.id, modelId)}
                activeModelKey={activeModelKey}
                diagnostics={(() => {
                  const filtered: Record<string, DiagnosticResult> = {}
                  Object.entries(diagnostics).forEach(([k, v]) => {
                    if (k.startsWith(`${provider.id}:`)) filtered[k] = v
                  })
                  return filtered
                })()}
                expanded={expandedProvider === provider.id}
                onToggle={() => setExpandedProvider(prev => prev === provider.id ? null : provider.id)}
                onRemoveProvider={customProviders.some(p => p.id === provider.id) ? () => handleRemoveProvider(provider.id) : undefined}
                isCustom={customProviders.some(p => p.id === provider.id)}
                importedModels={provider.id === 'ollama' ? ollamaModels.map(m => ({
                  id: m.name,
                  name: m.name,
                  endpoint: ollamaHost,
                  isActive: activeModelKey === `ollama:${m.name}`,
                })) : undefined}
              />
            ))}
          </div>
        )}

        {/* Tab: Ollama */}
        {activeTab === 'ollama' && (
          <div className="space-y-4">
            {/* Connection bar */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400/70" />
                <span className="text-[12px] text-white/60">Ollama 本地服务</span>
                {ollamaConnected && <span className="text-[9px] text-emerald-400/50 bg-emerald-500/10 px-1.5 py-0.5 rounded">已连接</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={ollamaHost}
                  onChange={e => setOllamaHost(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[11px] text-white/70 font-mono focus:outline-none focus:border-amber-500/40 placeholder:text-white/10"
                />
                <button
                  onClick={handleOllamaScan}
                  disabled={ollamaScanning}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] hover:bg-amber-500/25 transition-all disabled:opacity-50 border border-amber-500/20"
                >
                  {ollamaScanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                  扫描模型
                </button>
              </div>
              {ollamaScanning && (
                <div className="flex items-center gap-2 text-[10px] text-amber-400/40">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  正在检测 Ollama 本地模型...
                </div>
              )}
            </div>

            {/* Detected models */}
            {ollamaModels.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-[11px] text-white/40">检测到的模型</span>
                  <span className="text-[9px] text-white/15">{ollamaModels.length} 个</span>
                </div>
                {ollamaModels.map(model => {
                  const isImported = aiModels.some(m => m.name === model.name && m.provider === 'ollama')
                  return (
                    <div key={model.name}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        isImported
                          ? 'bg-emerald-500/[0.03] border-emerald-500/15'
                          : 'bg-white/[0.01] border-white/[0.04] hover:border-white/[0.08]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${model.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/60">{model.name}</span>
                          {isImported && <span className="text-[8px] text-emerald-400/50 bg-emerald-500/10 px-1 py-0.5 rounded">已导入</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-white/20 mt-0.5">
                          <span>{model.size}</span>
                          <span className="text-white/10">|</span>
                          <span>{model.quantization}</span>
                        </div>
                      </div>
                      {!isImported && (
                        <button
                          onClick={() => handleImportOllamaModel(model)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/15"
                        >
                          <ArrowRight className="w-3 h-3" />
                          导入
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tip */}
            <div className="px-3 py-2 rounded-lg bg-amber-500/[0.03] border border-amber-500/10 flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400/50 shrink-0 mt-0.5" />
              <div className="text-[10px] text-white/25">
                <strong className="text-amber-400/40">Ollama 本地部署：</strong>
                需要先在本地安装 Ollama 并启动服务（默认端口 11434）。
                导入的模型将显示在「服务商」标签页中，可作为 AI 引擎使用。
              </div>
            </div>
          </div>
        )}

        {/* Tab: MCP */}
        {activeTab === 'mcp' && (
          <MCPConfigPanel
            storageKey={STORAGE_KEYS.mcpServers}
            loadJSON={loadJSON}
            saveJSON={saveJSON}
          />
        )}

        {/* Tab: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <SmartDiagnosticsPanel
            providers={PROVIDERS}
            apiKeys={apiKeys}
            diagnostics={diagnostics}
            onRunDiagnostic={handleRunDiagnostic}
            onSelectModel={handleSelectModelDiag}
            activeModelKey={activeModelKey}
          />
        )}

        {/* Tab: Proxy */}
        {activeTab === 'proxy' && (
          <ProxyConfigPanel />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-white/15">v1.6.0</span>
          <span className="text-[9px] text-white/10">|</span>
          <span className="text-[9px] text-white/15">
            {PROVIDERS.length + customProviders.length} 服务商 · {
              PROVIDERS.reduce((sum, p) => sum + p.models.length, 0) + customProviders.reduce((sum, p) => sum + p.models.length, 0)
            } 模型
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/15">API 代理: {loadProxyConfig().enabled ? '已启用' : '未启用'}</span>
        </div>
      </div>
    </div>
  )
}