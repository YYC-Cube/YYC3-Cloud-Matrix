/**
 * @file: types.ts
 * @description: types.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

export type AIProviderType = 'openai' | 'anthropic' | 'azure' | 'ollama' | 'zhipu' | 'google' | 'custom'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
}

export interface ChatCompletionChoice {
  index: number
  message: {
    role: string
    content: string
  }
  finishReason: string
}

export interface ChatCompletionUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatCompletionChoice[]
  usage?: ChatCompletionUsage
}
