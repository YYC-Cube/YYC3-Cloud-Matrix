/**
 * @file: 统一认证管理器
 * @description: 自动检测和管理 OpenAI/Ollama 认证
 * @module @family-pai/core/auth
 * @author: YanYuCloudCube Team

 * @updated: 2026-04-30
 * @version: v1.0.0
 * @created: 2026-04-30
 * @status: active
 * @tags: [auth] */

import type { AIProviderType, ChatCompletionResponse, ChatMessage } from '../types.js'
import { OllamaProvider } from './ollama-provider.js'
import { OpenAIProvider } from './openai-provider.js'
import type { AuthProvider, AuthProviderInfo, AuthStatus } from './types.js'

/**
 * 统一认证管理器配置
 */
export interface UnifiedAuthManagerConfig {
  preferLocal?: boolean
  autoDetect?: boolean
  openai?: {
    apiKey?: string
    baseUrl?: string
    defaultModel?: string
  }
  ollama?: {
    baseUrl?: string
    defaultModel?: string
  }
}

/**
 * 统一认证管理器
 * 自动检测 OpenAI API Key 和 Ollama 本地服务
 */
export class UnifiedAuthManager {
  private providers: Map<AIProviderType, AuthProvider> = new Map()
  private activeProvider: AIProviderType | null = null
  private config: UnifiedAuthManagerConfig

  constructor(config: UnifiedAuthManagerConfig = {}) {
    this.config = {
      preferLocal: config.preferLocal ?? false,
      autoDetect: config.autoDetect ?? true,
      ...config,
    }
  }

  /**
   * 自动检测可用的 AI 提供商
   */
  async autoDetect(): Promise<AuthProviderInfo[]> {
    const availableProviders: AuthProviderInfo[] = []
    const errors: Array<{ provider: AIProviderType; error: string }> = []

    // 检测 OpenAI
    try {
      const openai = new OpenAIProvider(this.config.openai)
      const isValid = await openai.validate()
      if (isValid) {
        this.providers.set('openai', openai)
        availableProviders.push(openai.getInfo())
      }
    } catch (error) {
      errors.push({ provider: 'openai', error: String(error) })
    }

    // 检测 Ollama
    try {
      const ollama = new OllamaProvider(this.config.ollama)
      const isValid = await ollama.validate()
      if (isValid) {
        this.providers.set('ollama', ollama)
        availableProviders.push(ollama.getInfo())
      }
    } catch (error) {
      errors.push({ provider: 'ollama', error: String(error) })
    }

    // 自动选择提供商
    if (availableProviders.length > 0 && !this.activeProvider) {
      this.activeProvider = this.selectBestProvider(availableProviders)
      await this.getActiveProvider()?.initialize()
    }

    return availableProviders
  }

  /**
   * 选择最佳提供商
   */
  private selectBestProvider(providers: AuthProviderInfo[]): AIProviderType {
    if (this.config.preferLocal) {
      const local = providers.find(p => p.isLocal)
      if (local) { return local.name }
    }

    // 优先选择 OpenAI，其次 Ollama
    return providers[0].name
  }

  /**
   * 获取当前活跃的提供商
   */
  getActiveProvider(): AuthProvider | null {
    if (!this.activeProvider) { return null }
    return this.providers.get(this.activeProvider) || null
  }

  /**
   * 切换提供商
   */
  async switchProvider(name: AIProviderType): Promise<void> {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new Error(`提供商 ${name} 不可用`)
    }

    if (!provider.isReady) {
      await provider.initialize()
    }

    this.activeProvider = name
  }

  /**
   * 发送聊天消息
   */
  async chat(messages: ChatMessage[], options?: Record<string, unknown>): Promise<ChatCompletionResponse> {
    const provider = this.getActiveProvider()
    if (!provider) {
      throw new Error('没有可用的 AI 提供商。请配置 OpenAI API Key 或启动 Ollama 服务。')
    }

    return provider.chat(messages, options)
  }

  /**
   * 流式聊天
   */
  async *stream(messages: ChatMessage[], options?: Record<string, unknown>): AsyncIterable<ChatCompletionResponse> {
    const provider = this.getActiveProvider()
    if (!provider) {
      throw new Error('没有可用的 AI 提供商。请配置 OpenAI API Key 或启动 Ollama 服务。')
    }

    yield* provider.stream(messages, options)
  }

  /**
   * 获取认证状态
   */
  getStatus(): AuthStatus {
    const providers = Array.from(this.providers.values()).map(p => p.getInfo())

    return {
      activeProvider: this.activeProvider,
      providers,
      lastChecked: new Date(),
      errors: [],
    }
  }

  /**
   * 获取所有可用提供商
   */
  getProviders(): AuthProviderInfo[] {
    return Array.from(this.providers.values()).map(p => p.getInfo())
  }

  /**
   * 注册自定义提供商
   */
  registerProvider(provider: AuthProvider): void {
    this.providers.set(provider.name, provider)
  }

  /**
   * 销毁所有提供商
   */
  async dispose(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.dispose()
    }
    this.providers.clear()
    this.activeProvider = null
  }
}
