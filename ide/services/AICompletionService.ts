/**
 * @file: AICompletionService.ts
 * @description: AI 代码补全服务 — 基于 LLM 的上下文感知内联补全
 *              本地优先架构：Ollama 优先，智谱降级，无可用 provider 时静默
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.0.0
 * @created: 2026-04-17
 * @updated: 2026-04-17
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: ai,completion,inline,monaco,llm
 */

import type * as monaco from "monaco-editor";
import {
  findAvailableProvider,
  getChatEndpoint,
  buildHeaders,
  type ProviderConfig,
} from "../LLMService";
import { logger } from "../services/Logger";

interface CompletionCache {
  prefix: string;
  suffix: string;
  language: string;
  result: string;
  timestamp: number;
}

const CACHE_TTL = 30000;
const MAX_CACHE_SIZE = 50;
const DEBOUNCE_MS = 400;
const MAX_PREFIX_LINES = 40;
const MAX_SUFFIX_LINES = 10;
const MAX_COMPLETION_TOKENS = 256;

class AICompletionServiceImpl {
  private cache: CompletionCache[] = [];
  private pendingAbort: AbortController | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private enabled = true;
  private stats = { requests: 0, hits: 0, errors: 0, avgLatency: 0 };

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    if (!v) {
      this.cancelPending();
    }
  }

  getStats() {
    return { ...this.stats };
  }

  cancelPending(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.pendingAbort) {
      this.pendingAbort.abort();
      this.pendingAbort = null;
    }
  }

  private trimCache(): void {
    const now = Date.now();
    this.cache = this.cache.filter((c) => now - c.timestamp < CACHE_TTL);
    if (this.cache.length > MAX_CACHE_SIZE) {
      this.cache = this.cache.slice(-MAX_CACHE_SIZE);
    }
  }

  private checkCache(prefix: string, suffix: string, language: string): string | null {
    this.trimCache();
    const entry = this.cache.find(
      (c) => c.prefix === prefix && c.suffix === suffix && c.language === language,
    );
    if (entry) {
      this.stats.hits++;
      return entry.result;
    }
    return null;
  }

  private addToCache(prefix: string, suffix: string, language: string, result: string): void {
    this.trimCache();
    this.cache.push({ prefix, suffix, language, result, timestamp: Date.now() });
  }

  buildPrompt(prefix: string, suffix: string, language: string): string {
    const langLabel = language || "code";
    const prefixLines = prefix.split("\n");
    const suffixLines = suffix.split("\n");

    const trimmedPrefix = prefixLines.slice(-MAX_PREFIX_LINES).join("\n");
    const trimmedSuffix = suffixLines.slice(0, MAX_SUFFIX_LINES).join("\n");

    let prompt = `You are an expert ${langLabel} code completion engine. Continue the code from where the cursor is (marked by <CURSOR>). Output ONLY the code to insert at the cursor position. No explanations, no markdown, no code fences.\n\n`;

    if (trimmedSuffix) {
      prompt += `Code after cursor:\n\`\`\`\n${trimmedSuffix}\n\`\`\`\n\n`;
    }

    prompt += `Code before cursor (continue from <CURSOR>):\n\`\`\`\n${trimmedPrefix}<CURSOR>\n\`\`\``;

    return prompt;
  }

  async requestCompletion(
    prefix: string,
    suffix: string,
    language: string,
  ): Promise<string | null> {
    if (!this.enabled) return null;

    const cached = this.checkCache(prefix, suffix, language);
    if (cached !== null) return cached;

    this.cancelPending();

    const providerInfo = findAvailableProvider();
    if (!providerInfo) return null;

    const { config, modelId } = providerInfo;

    return new Promise<string | null>((resolve) => {
      this.debounceTimer = setTimeout(async () => {
        const abortController = new AbortController();
        this.pendingAbort = abortController;

        const startTime = Date.now();
        this.stats.requests++;

        try {
          const prompt = this.buildPrompt(prefix, suffix, language);

          const endpoint = getChatEndpoint(config);
          const headers = buildHeaders(config);

          const body: Record<string, unknown> = {
            model: modelId,
            messages: [
              { role: "system", content: "You are a code completion engine. Output ONLY the code to insert. No explanations." },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
            max_tokens: MAX_COMPLETION_TOKENS,
            stream: false,
          };

          const res = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal: abortController.signal,
          });

          if (!res.ok) {
            this.stats.errors++;
            resolve(null);
            return;
          }

          const data = await res.json();
          let content = "";

          if (config.id === "ollama") {
            content = (data as any).message?.content || "";
          } else {
            content = (data as any).choices?.[0]?.message?.content || "";
          }

          content = this.cleanCompletion(content, prefix);

          if (!content) {
            resolve(null);
            return;
          }

          const latency = Date.now() - startTime;
          this.stats.avgLatency = this.stats.avgLatency === 0
            ? latency
            : Math.round((this.stats.avgLatency * 0.8 + latency * 0.2));

          this.addToCache(prefix, suffix, language, content);
          resolve(content);
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            this.stats.errors++;
          }
          resolve(null);
        } finally {
          if (this.pendingAbort === abortController) {
            this.pendingAbort = null;
          }
        }
      }, DEBOUNCE_MS);
    });
  }

  private cleanCompletion(raw: string, prefix: string): string {
    let cleaned = raw
      .replace(/^```[\w]*\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const prefixLastLine = prefix.split("\n").pop() || "";
    const firstLine = cleaned.split("\n")[0] || "";

    if (prefixLastLine.trim() && firstLine.startsWith(prefixLastLine.trim())) {
      cleaned = cleaned.slice(firstLine.indexOf(prefixLastLine.trim()) + prefixLastLine.trim().length);
    }

    return cleaned;
  }
}

const aiCompletionService = new AICompletionServiceImpl();
export { aiCompletionService };

export function registerAIInlineCompletionProvider(
  monacoInstance: typeof monaco,
): monaco.IDisposable {
  return monacoInstance.languages.registerInlineCompletionsProvider(
    { pattern: "**" },
    {
      provideInlineCompletions: async (model, position, context, token) => {
        if (!aiCompletionService.isEnabled()) {
          return { items: [] };
        }

        if (context.triggerKind === 0 && !context.selectedSuggestionInfo) {
          return { items: [] };
        }

        const lineNumber = position.lineNumber;
        const column = position.column;
        const lineContent = model.getLineContent(lineNumber);

        const textBeforeCursor = lineContent.substring(0, column - 1);
        if (textBeforeCursor.trim().length < 2) {
          return { items: [] };
        }

        const prefix = model.getValueInRange({
          startLineNumber: Math.max(1, lineNumber - MAX_PREFIX_LINES),
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: column,
        });

        const suffix = model.getValueInRange({
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: Math.min(model.getLineCount(), lineNumber + MAX_SUFFIX_LINES),
          endColumn: model.getLineMaxColumn(Math.min(model.getLineCount(), lineNumber + MAX_SUFFIX_LINES)),
        });

        const language = model.getLanguageId();

        if (token.isCancellationRequested) {
          return { items: [] };
        }

        const completion = await aiCompletionService.requestCompletion(
          prefix,
          suffix,
          language,
        );

        if (!completion || token.isCancellationRequested) {
          return { items: [] };
        }

        return {
          items: [
            {
              insertText: completion,
              range: {
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column,
              },
              commands: [],
            },
          ],
        };
      },

      disposeInlineCompletions: () => {},
    },
  );
}
