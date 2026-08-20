/**
 * @file: XtermTerminal.tsx
 * @description: XtermTerminal.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import * as React from "react";
import { useEffect, useRef, useCallback, useState } from "react";
import { Terminal, Plus, X, ChevronUp, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { useI18n } from "../../../hooks/useI18n";
import {
  createTerminalBackend,
  DEFAULT_XTERM_OPTIONS,
  type TerminalBackend,
  type TerminalConnectionState,
  type TerminalMessage,
  type XtermConfig,
} from "./XtermIntegration";

interface XtermTerminalProps {
  sessionId: string;
  wsUrl?: string;
  config?: XtermConfig;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSessionCreate?: (sessionId: string) => void;
  onSessionClose?: (sessionId: string) => void;
}

interface TerminalSessionState {
  id: string;
  label: string;
  connectionState: TerminalConnectionState;
}

const CONNECTION_ICONS: Record<TerminalConnectionState, { icon: React.ElementType; color: string }> = {
  connected: { icon: Wifi, color: "#00ff88" },
  connecting: { icon: Wifi, color: "#ffaa00" },
  disconnected: { icon: WifiOff, color: "#ff3366" },
  error: { icon: WifiOff, color: "#ff3366" },
};

export function XtermTerminal({
  sessionId: initialSessionId,
  wsUrl,
  config,
  isCollapsed = false,
  onToggleCollapse,
  onSessionCreate,
  onSessionClose,
}: XtermTerminalProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<TerminalBackend | null>(null);
  const xtermRef = useRef<import("@xterm/xterm").Terminal | null>(null);
  const fitAddonRef = useRef<import("@xterm/addon-fit").FitAddon | null>(null);

  const [sessions, setSessions] = useState<TerminalSessionState[]>([
    { id: initialSessionId, label: "bash", connectionState: "disconnected" },
  ]);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const connectionState = activeSession?.connectionState ?? "disconnected";
  const ConnectionIcon = CONNECTION_ICONS[connectionState].icon;

  const initializeTerminal = useCallback(async () => {
    if (!terminalRef.current || xtermRef.current) {return;}

    try {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      const terminal = new Terminal({
        ...DEFAULT_XTERM_OPTIONS,
        ...config,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);

      terminal.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = terminal;
      fitAddonRef.current = fitAddon;

      terminal.onData((data: string) => {
        if (backendRef.current) {
          backendRef.current.write(activeSessionId, data);
        }
      });

      terminal.onResize(({ cols, rows }: { cols: number; rows: number }) => {
        if (backendRef.current) {
          backendRef.current.resize(activeSessionId, cols, rows);
        }
      });

      backendRef.current = createTerminalBackend(wsUrl);

      const unsubscribe = backendRef.current.onMessage((msg: TerminalMessage) => {
        if (msg.type === "data" && xtermRef.current) {
          xtermRef.current.write(msg.data ?? "");
        } else if (msg.type === "connect") {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === msg.sessionId ? { ...s, connectionState: "connected" } : s
            )
          );
        } else if (msg.type === "error") {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === msg.sessionId ? { ...s, connectionState: "error" } : s
            )
          );
        }
      });

      await backendRef.current.connect(activeSessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, connectionState: "connecting" } : s
        )
      );

      onSessionCreate?.(activeSessionId);

      return () => {
        unsubscribe();
        terminal.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      };
    } catch (error) {
      console.error("Failed to initialize terminal:", error);
    }
  }, [activeSessionId, config, wsUrl, onSessionCreate]);

  useEffect(() => {
    if (!isCollapsed) {
      initializeTerminal();
    }
  }, [isCollapsed, initializeTerminal]);

  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addSession = useCallback(() => {
    const id = `term-${Date.now()}`;
    setSessions((prev) => [
      ...prev,
      { id, label: "bash", connectionState: "disconnected" },
    ]);
    setActiveSessionId(id);
    onSessionCreate?.(id);
  }, [onSessionCreate]);

  const closeSession = useCallback(
    (id: string) => {
      if (sessions.length <= 1) {return;}

      if (backendRef.current) {
        backendRef.current.disconnect(id);
      }

      setSessions((prev) => prev.filter((s) => s.id !== id));
      onSessionClose?.(id);

      if (activeSessionId === id) {
        setActiveSessionId(sessions.find((s) => s.id !== id)?.id ?? sessions[0].id);
      }
    },
    [sessions, activeSessionId, onSessionClose]
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col"
      style={{
        background: "rgba(4,10,22,0.8)",
        borderTop: "1px solid rgba(0,180,255,0.12)",
        height: isCollapsed ? "28px" : "100%",
      }}
    >
      {/* Terminal title bar */}
      <div
        className="flex items-center justify-between px-2 shrink-0"
        style={{ height: "28px", borderBottom: isCollapsed ? "none" : "1px solid rgba(0,180,255,0.08)" }}
      >
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          <Terminal className="w-3 h-3 text-[rgba(0,212,255,0.4)] shrink-0 mr-1" />
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-t shrink-0 transition-all ${
                session.id === activeSessionId
                  ? "bg-[rgba(0,40,80,0.3)] text-[#e0f0ff]"
                  : "text-[rgba(0,212,255,0.3)] hover:text-[rgba(0,212,255,0.5)]"
              }`}
              style={{ fontSize: "0.6rem" }}
            >
              <ConnectionIcon
                className="w-2 h-2"
                style={{ color: CONNECTION_ICONS[session.connectionState].color }}
              />
              <span>{session.label}</span>
              {sessions.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSession(session.id);
                  }}
                  className="hover:text-[#ff3366] transition-colors"
                >
                  <X className="w-2 h-2" />
                </span>
              )}
            </button>
          ))}
          <button
            onClick={addSession}
            className="p-0.5 rounded text-[rgba(0,212,255,0.2)] hover:text-[#00d4ff] transition-all"
            title={t("ide.newTerminal")}
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
            title={t("ide.terminalToggle")}
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Terminal content */}
      {!isCollapsed && (
        <div
          ref={terminalRef}
          className="flex-1 p-2"
          style={{
            height: "calc(100% - 28px)",
            overflow: "hidden",
          }}
        />
      )}
    </div>
  );
}

export default XtermTerminal;
