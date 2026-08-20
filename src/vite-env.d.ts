/**
 * @file: vite-env.d.ts
 * @description: vite-env.d.ts - YYC³ 功能模块
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly API_PROXY_BASE_URL: string;
  readonly API_PROXY_TIMEOUT: string;
  readonly API_PROXY_VERSION: string;
  readonly VITE_WS_URL: string;
  readonly VITE_WS_RECONNECT_INTERVAL: string;
  readonly VITE_WS_MAX_RECONNECT_ATTEMPTS: string;
  readonly VITE_WS_HEARTBEAT_INTERVAL: string;
  readonly VITE_ENABLE_GHOST_MODE: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_ENABLE_AI_ASSistant: string;
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly DB_HOST: string;
  readonly DB_PORT: string;
  readonly DB_USER: string;
  readonly DB_PASSWORD: string;
  readonly DB_NAME: string;
  readonly REDIS_HOST: string;
  readonly REDIS_PORT: string;
  readonly REDIS_DB: string;
  readonly REDIS_PASSWORD: string;
  readonly OLLAMA_HOST: string;
  readonly OLLAMA_PORT: string;
  readonly OLLAMA_MODELS: string;
  readonly PROMETHEUS_MULTIPROC_DIR: string;
  readonly VITE_YYC3_SYSTEM_NAME: string;
  readonly VITE_YYC3_SYSTEM_VERSION: string;
  readonly VITE_YYC3_API_BASE_URL: string;
  readonly VITE_YYC3_WS_ENDPOINT: string;
  readonly VITE_YYC3_OLLAMA_BASE_URL: string;
  readonly VITE_YYC3_OLLAMA_PROXY_PATH: string;
  readonly VITE_YYC3_CLUSTER_ID: string;
  readonly VITE_YYC3_STORAGE_PREFIX: string;
  readonly VITE_YYC3_ENABLE_MOCK: string;
  readonly VITE_YYC3_ENABLE_DEBUG: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_USE_MOCK_AUTH: string;
  readonly VITE_MOCK_ADMIN_PASSWORD: string;
  readonly VITE_MOCK_DEV_PASSWORD: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface Timeout {
    ref(): this;
    unref(): this;
    hasRef(): boolean;
    refresh(): this;
    [Symbol.toPrimitive](): number;
  }

  interface Immediate {
    ref(): this;
    unref(): this;
    hasRef(): boolean;
    [Symbol.toPrimitive](): number;
  }

  interface Global {
    clearInterval(intervalId: NodeJS.Timeout | string | number | undefined): void;
    clearTimeout(timeoutId: NodeJS.Timeout | string | number | undefined): void;
    setInterval(callback: (...args: unknown[]) => void, ms?: number, ...args: unknown[]): NodeJS.Timeout;
    setTimeout(callback: (...args: unknown[]) => void, ms?: number, ...args: unknown[]): NodeJS.Timeout;
    clearImmediate(immediateId: NodeJS.Immediate | undefined): void;
    setImmediate(callback: (...args: unknown[]) => void, ...args: unknown[]): NodeJS.Immediate;
  }
}

type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "base64url" | "latin1" | "binary" | "hex";

declare module "@yyc3/ai-family" {
  import type { ComponentType } from "react";

  export interface CareResponse {
    message: string;
    emotion?: string;
    suggestions?: string[];
    wisdomQuote?: { content: string; author?: string };
  }

  export interface FamilyAnthemPlayerProps {
    anthemUrl?: string;
    showLyrics?: boolean;
    autoScroll?: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onLyricHighlight?: (lyric: { emotion: string; text: string }) => void;
  }

  export const FamilyAnthemPlayer: ComponentType<FamilyAnthemPlayerProps>;

  export interface SongUploadZoneProps {
    onUploadSuccess?: (song: { title: string; url: string }) => void;
    onError?: (error: Error) => void;
    maxFiles?: number;
  }

  export const SongUploadZone: ComponentType<SongUploadZoneProps>;

  export function createCareLanguageEngine(config?: {
    founderExperienceYears?: number;
    wisdomCorpusSize?: number;
    personality?: string[];
    defaultStyle?: string;
    enableMusicIntegration?: boolean;
    enableWisdomQuotes?: boolean;
  }): {
    respondToEmotion(emotion: string, context: { context: string; userName: string }): Promise<CareResponse>;
    encourage(params: { achievement: string; context: string }): Promise<CareResponse>;
  };
}

declare module "dompurify" {
  interface DOMPurifyConfig {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    ADD_ATTR?: string[];
  }
  
  export default class DOMPurify {
    static sanitize(dirty: string, config?: DOMPurifyConfig): string;
    sanitize(dirty: string, config?: DOMPurifyConfig): string;
  }
}

import type { MessageContent as BaseMessageContent } from "./app/lib/ai-family-hotel.types";

declare module "./app/lib/ai-family-hotel.types" {
  interface MessageContent extends BaseMessageContent {
    priority?: "low" | "normal" | "high" | "urgent" | "critical";
    context?: Record<string, unknown>;
    messageType?: "text" | "notification" | "escalation" | "action-request" | "decision";
  }
}
