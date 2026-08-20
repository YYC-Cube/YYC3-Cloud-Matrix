/**
 * @file: XtermIntegration.ts
 * @description: XtermIntegration.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import type { Terminal as XTermTerminal, ITerminalOptions } from "@xterm/xterm";

export interface XtermConfig {
  fontSize?: number;
  fontFamily?: string;
  theme?: XtermTheme;
  cursorBlink?: boolean;
  cursorStyle?: "block" | "underline" | "bar";
  scrollback?: number;
  allowTransparency?: boolean;
}

export interface XtermTheme {
  background?: string;
  foreground?: string;
  cursor?: string;
  cursorAccent?: string;
  selection?: string;
  black?: string;
  red?: string;
  green?: string;
  yellow?: string;
  blue?: string;
  magenta?: string;
  cyan?: string;
  white?: string;
  brightBlack?: string;
  brightRed?: string;
  brightGreen?: string;
  brightYellow?: string;
  brightBlue?: string;
  brightMagenta?: string;
  brightCyan?: string;
  brightWhite?: string;
}

export const YYC3_TERMINAL_THEME: XtermTheme = {
  background: "#040a16",
  foreground: "#c0dcf0",
  cursor: "#00d4ff",
  cursorAccent: "#040a16",
  selection: "rgba(0, 212, 255, 0.25)",
  black: "#040a16",
  red: "#ff3366",
  green: "#00ff88",
  yellow: "#ffaa00",
  blue: "#00d4ff",
  magenta: "#c792ea",
  cyan: "#00d4ff",
  white: "#e0f0ff",
  brightBlack: "#1a2a4a",
  brightRed: "#ff5577",
  brightGreen: "#33ff99",
  brightYellow: "#ffcc33",
  brightBlue: "#33ddff",
  brightMagenta: "#d9a6ff",
  brightCyan: "#33ddff",
  brightWhite: "#ffffff",
};

export const DEFAULT_XTERM_OPTIONS: ITerminalOptions = {
  fontSize: 12,
  fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
  theme: YYC3_TERMINAL_THEME,
  cursorBlink: true,
  cursorStyle: "block",
  scrollback: 5000,
  allowTransparency: true,
  convertEol: true,
  lineHeight: 1.2,
  letterSpacing: 0,
  fontWeight: "400",
  fontWeightBold: "600",
  drawBoldTextInBrightColors: true,
};

export interface TerminalSession {
  id: string;
  pid?: number;
  cwd: string;
  env: Record<string, string>;
  shell: string;
  connected: boolean;
}

export interface TerminalMessage {
  type: "data" | "resize" | "exit" | "error" | "connect";
  sessionId: string;
  data?: string;
  cols?: number;
  rows?: number;
  code?: number;
  message?: string;
}

export type TerminalConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface TerminalBackend {
  connect(sessionId: string): Promise<void>;
  disconnect(sessionId: string): void;
  write(sessionId: string, data: string): void;
  resize(sessionId: string, cols: number, rows: number): void;
  onMessage(callback: (msg: TerminalMessage) => void): () => void;
  getState(): TerminalConnectionState;
}

export class MockTerminalBackend implements TerminalBackend {
  private state: TerminalConnectionState = "disconnected";
  private callbacks: Set<(msg: TerminalMessage) => void> = new Set();
  private sessions: Map<string, TerminalSession> = new Map();

  async connect(sessionId: string): Promise<void> {
    this.state = "connecting";
    this.notify({ type: "connect", sessionId });
    await new Promise((r) => setTimeout(r, 100));
    this.state = "connected";
    this.sessions.set(sessionId, {
      id: sessionId,
      cwd: "/home/yyc3/project",
      env: { PATH: "/usr/local/bin:/usr/bin:/bin" },
      shell: "/bin/bash",
      connected: true,
    });
    this.notify({
      type: "data",
      sessionId,
      data: "\x1b[1;36mYYC³ Terminal\x1b[0m ready.\r\n$ ",
    });
  }

  disconnect(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.state = this.sessions.size > 0 ? "connected" : "disconnected";
  }

  write(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    if (data === "\r") {
      this.notify({ type: "data", sessionId, data: "\r\n" });
      setTimeout(() => {
        this.notify({ type: "data", sessionId, data: "$ " });
      }, 50);
    } else {
      this.notify({ type: "data", sessionId, data });
    }
  }

  resize(_sessionId: string, _cols: number, _rows: number): void {
    // Mock resize
  }

  onMessage(callback: (msg: TerminalMessage) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getState(): TerminalConnectionState {
    return this.state;
  }

  private notify(msg: TerminalMessage): void {
    this.callbacks.forEach((cb) => cb(msg));
  }
}

export class WebSocketTerminalBackend implements TerminalBackend {
  private ws: WebSocket | null = null;
  private state: TerminalConnectionState = "disconnected";
  private callbacks: Set<(msg: TerminalMessage) => void> = new Set();
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect(_sessionId: string): Promise<void> {
    this.state = "connecting";
    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.state = "connected";
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as TerminalMessage;
          this.notify(msg);
        } catch {
          this.notify({ type: "data", sessionId: "default", data: event.data });
        }
      };

      this.ws.onerror = () => {
        this.state = "error";
        this.notify({ type: "error", sessionId: "default", message: "WebSocket error" });
      };

      this.ws.onclose = () => {
        this.state = "disconnected";
      };
    } catch (error) {
      this.state = "error";
      throw error;
    }
  }

  disconnect(_sessionId: string): void {
    this.ws?.close();
    this.ws = null;
    this.state = "disconnected";
  }

  write(_sessionId: string, data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "input", data }));
    }
  }

  resize(_sessionId: string, cols: number, rows: number): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "resize", cols, rows }));
    }
  }

  onMessage(callback: (msg: TerminalMessage) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getState(): TerminalConnectionState {
    return this.state;
  }

  private notify(msg: TerminalMessage): void {
    this.callbacks.forEach((cb) => cb(msg));
  }
}

export function createTerminalBackend(wsUrl?: string): TerminalBackend {
  if (wsUrl) {
    return new WebSocketTerminalBackend(wsUrl);
  }
  return new MockTerminalBackend();
}

export type { XTermTerminal };
