/**
 * @file: GitPanel.tsx
 * @description: 💻 Git面板 - 跨平台版本（Web/桌面/PWA/Mobile全支持）
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v2.0.0
 * @updated: 2026-04-09
 *
 * 升级亮点：
 * ✅ 全平台支持（Web/Desktop/PWA/Mobile）
 * ✅ 响应式设计（移动端优化）
 * ✅ 真实Git操作能力
 * ✅ PWA离线缓存支持
 * ✅ AI Family关爱集成
 * @created: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import * as React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  GitBranch, GitCommit as GitCommitIcon,
  Plus, Minus, FileEdit, FilePlus, FileX, FileType,
  Check, ChevronDown, RefreshCw,
  ArrowUp, ArrowDown, Search,
  Smartphone, Monitor, Globe, Wifi, WifiOff,
  Loader2, AlertCircle, Sparkles, MessageCircleHeart
} from "lucide-react";
import { useI18n } from "../../../hooks/useI18n";
import {
  getGitService,
  type GitService,
  type GitFileChange,
  type GitCommitInfo,
  type GitBranchInfo,
} from "../../../lib/GitService";

type GitTab = "changes" | "commits" | "branches";

const STATUS_ICONS: Record<string, React.ElementType> = {
  modified: FileEdit,
  added: FilePlus,
  deleted: FileX,
  renamed: FileType,
  untracked: Plus,
};

const STATUS_COLORS: Record<string, string> = {
  modified: "#ffaa00",
  added: "#00ff88",
  deleted: "#ff3366",
  renamed: "#c792ea",
  untracked: "#7b8cff",
};

interface GitPanelProps {
  className?: string;
  compact?: boolean;
  showAIIntegration?: boolean;
}

export function GitPanel({
  className = '',
  compact = false,
  showAIIntegration = true
}: GitPanelProps) {
  const { t } = useI18n();
  const [gitService] = useState<GitService>(() => getGitService({
    autoRefresh: true,
    refreshInterval: 30000,
    onError: (error) => console.error('[GitPanel] Error:', error),
  }));

  const [activeTab, setActiveTab] = useState<GitTab>("changes");
  const [changes, setChanges] = useState<GitFileChange[]>([]);
  const [commits, setCommits] = useState<GitCommitInfo[]>([]);
  const [branches, setBranches] = useState<GitBranchInfo[]>([]);
  const [commitMsg, setCommitMsg] = useState("");
  const [showBranchSelect, setShowBranchSelect] = useState(false);
  const [searchCommits, setSearchCommits] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<string>('web');
  const [isOnline, setIsOnline] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [careMessage, setCareMessage] = useState<string | null>(null);

  useEffect(() => {
    initializeGit();
    detectPlatform();
    setupNetworkListener();

    return () => {
      gitService.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeGit = async () => {
    setIsLoading(true);
    try {
      await gitService.initialize();

      const status = await gitService.getStatus();
      setChanges([...status.staged, ...status.unstaged]);

      const commitList = await gitService.getCommits(20);
      setCommits(commitList);

      const branchList = await gitService.getBranches();
      setBranches(branchList);

      console.info(`[GitPanel] ✅ Initialized on ${gitService.getPlatform()}`);
    } catch (error) {
      console.error('[GitPanel] Initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectPlatform = () => {
    setPlatform(gitService.getPlatform());
  };

  const setupNetworkListener = () => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      window.addEventListener('online', () => setIsOnline(true));
      window.addEventListener('offline', () => setIsOffline(false));
    }
  };

  const setIsOffline = (offline: boolean) => {
    setIsOnline(!offline);
    if (offline && showAIIntegration) {
      generateCareMessage('offline');
    }
  };

  const generateCareMessage = async (context: string) => {
    try {

      const messages: Record<string, string> = {
        offline: '🌐 网络暂时断开了，但您的代码改动都安全地保存在本地。网络恢复后，一切都会同步上去。',
        commit_success: '✨ 太棒了！每一次提交都是成长的印记。保持这个节奏，您正在创造了不起的东西！',
        push_success: '🚀 代码已成功推送到远程！您的智慧现在正与世界分享，这是技术最美好的时刻。',
        error: '💪 遇到小挫折没关系，每个伟大的项目都经历过这样的时刻。让我们一起解决它！',
        late_night: '🌙 夜深了还在写代码吗？记得休息一下，好的灵感需要充沛的精力来孕育。',
      };

      setCareMessage(messages[context] || messages.error);

      setTimeout(() => setCareMessage(null), 8000);
    } catch (error) {
      console.error('[GitPanel] Failed to generate care message:', error);
    }
  };

  const currentBranch = useMemo(
    () => branches.find((b) => b.current) ?? branches[0],
    [branches]
  );

  const stagedChanges = useMemo(() => changes.filter((c) => c.staged), [changes]);
  const unstagedChanges = useMemo(() => changes.filter((c) => !c.staged), [changes]);

  const toggleStage = useCallback(async (id: string) => {
    const file = changes.find(c => c.id === id);
    if (!file) {return;}

    try {
      if (file.staged) {
        await gitService.unstageFile(id);
      } else {
        await gitService.stageFile(id);
      }

      const status = await gitService.getStatus();
      setChanges([...status.staged, ...status.unstaged]);
    } catch (error) {
      console.error('[GitPanel] Toggle stage failed:', error);
    }
  }, [changes, gitService]);

  const stageAll = useCallback(async () => {
    try {
      await gitService.stageAllFiles();
      const status = await gitService.getStatus();
      setChanges([...status.staged, ...status.unstaged]);
    } catch (error) {
      console.error('[GitPanel] Stage all failed:', error);
    }
  }, [gitService]);

  const unstageAll = useCallback(async () => {
    try {
      await gitService.unstageAllFiles();
      const status = await gitService.getStatus();
      setChanges([...status.staged, ...status.unstaged]);
    } catch (error) {
      console.error('[GitPanel] Unstage all failed:', error);
    }
  }, [gitService]);

  const handleCommit = useCallback(async () => {
    if (!commitMsg.trim() || stagedChanges.length === 0) {return;}

    setIsLoading(true);
    try {
      const result = await gitService.commit(commitMsg.trim());

      if (result) {
        setCommits(prev => [result!, ...prev]);
        setChanges(prev => prev.filter(c => !c.staged));
        setCommitMsg('');
        setLastAction(`✅ Committed: ${result.hash}`);

        if (showAIIntegration) {
          await generateCareMessage('commit_success');
        }

        setTimeout(() => setLastAction(null), 5000);
      }
    } catch (error) {
      console.error('[GitPanel] Commit failed:', error);
      setLastAction('❌ Commit failed');

      if (showAIIntegration) {
        await generateCareMessage('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [commitMsg, stagedChanges, gitService, showAIIntegration]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await gitService.refreshStatus();

      const status = await gitService.getStatus();
      setChanges([...status.staged, ...status.unstaged]);

      const commitList = await gitService.getCommits(20, 0, true);
      setCommits(commitList);

      const branchList = await gitService.getBranches();
      setBranches(branchList);

      setLastAction('🔄 Refreshed');
      setTimeout(() => setLastAction(null), 3000);
    } catch (error) {
      console.error('[GitPanel] Refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gitService]);

  const handlePull = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gitService.pull();
      setLastAction(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);

      if (result.success) {
        await handleRefresh();
      }

      setTimeout(() => setLastAction(null), 5000);
    } catch (error) {
      console.error('[GitPanel] Pull failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gitService, handleRefresh]);

  const handlePush = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gitService.push();
      setLastAction(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);

      if (result.success && showAIIntegration) {
        await generateCareMessage('push_success');
      }

      if (result.success) {
        await handleRefresh();
      }

      setTimeout(() => setLastAction(null), 5000);
    } catch (error) {
      console.error('[GitPanel] Push failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gitService, handleRefresh, showAIIntegration]);

  const filteredCommits = useMemo(() => {
    if (!searchCommits) {return commits;}

    return commits.filter((c) =>
      c.message.toLowerCase().includes(searchCommits.toLowerCase()) ||
      c.hash.toLowerCase().includes(searchCommits.toLowerCase())
    );
  }, [commits, searchCommits]);

  const tabs = [
    { id: "changes" as GitTab, label: t("ide.gitChanges"), count: changes.length },
    { id: "commits" as GitTab, label: t("ide.gitHistory"), count: commits.length },
    { id: "branches" as GitTab, label: t("ide.gitBranches"), count: branches.length },
  ];

  const PlatformIcon = platform === 'mobile' ? Smartphone :
                       platform === 'desktop' ? Monitor :
                       platform === 'pwa' ? Globe : Globe;

  return (
    <div className={`flex flex-col h-full git-panel ${className}`} style={{ background: "rgba(4,10,22,0.5)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,180,255,0.08)" }}
      >
        <div className="relative flex items-center gap-1.5 min-w-0">
          <GitBranch className="w-3.5 h-3.5 text-[#00d4ff] shrink-0" />
          <button
            onClick={() => setShowBranchSelect(!showBranchSelect)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[rgba(0,212,255,0.08)] transition-all"
          >
            <span className="text-[#e0f0ff] truncate" style={{ fontSize: compact ? "0.62rem" : "0.68rem" }}>
              {currentBranch?.name || 'main'}
            </span>
            <ChevronDown className="w-2.5 h-2.5 text-[rgba(0,212,255,0.3)]" />
          </button>

          {currentBranch?.ahead > 0 && (
            <span className="flex items-center gap-0.5 text-[#00ff88]" style={{ fontSize: "0.5rem" }}>
              <ArrowUp className="w-2 h-2" />{currentBranch.ahead}
            </span>
          )}
          {currentBranch?.behind > 0 && (
            <span className="flex items-center gap-0.5 text-[#ff6b9d]" style={{ fontSize: "0.5rem" }}>
              <ArrowDown className="w-2 h-2" />{currentBranch.behind}
            </span>
          )}

          {/* Branch Selector Dropdown */}
          {showBranchSelect && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBranchSelect(false)} />
              <div
                className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto"
                style={{
                  background: "rgba(8,20,45,0.95)",
                  border: "1px solid rgba(0,180,255,0.2)",
                  backdropFilter: "blur(12px)",
                  minWidth: compact ? "150px" : "180px",
                }}
              >
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={async () => {
                      setShowBranchSelect(false);
                      setIsLoading(true);
                      await gitService.checkoutBranch(b.name);
                      const branchList = await gitService.getBranches();
                      setBranches(branchList);
                      setIsLoading(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 transition-all ${
                      b.current ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff]" : "text-[#c0dcf0] hover:bg-[rgba(0,40,80,0.3)]"
                    }`}
                  >
                    <GitBranch className="w-3 h-3 shrink-0" />
                    <span className="truncate flex-1 text-left" style={{ fontSize: "0.65rem" }}>{b.name}</span>
                    {b.current && <Check className="w-3 h-3 text-[#00ff88]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {/* Platform Indicator */}
          <PlatformIcon
            className="w-3 h-3 shrink-0"
            style={{
              color: platform === 'mobile' ? '#a78bfa' :
                     platform === 'desktop' ? '#00d4ff' :
                     platform === 'pwa' ? '#f59e0b' : '#64748b',
              opacity: 0.6
            }}
          />

          {/* Network Status */}
          {isOnline ? (
            <Wifi
              className="w-3 h-3 text-[#00ff88]"
            />
          ) : (
            <WifiOff
              className="w-3 h-3 text-[#ff6b6b]"
            />
          )}

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all disabled:opacity-50"
            title="Refresh"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={handlePull}
            disabled={isLoading || !isOnline}
            className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all disabled:opacity-50"
            title="Pull"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          <button
            onClick={handlePush}
            disabled={isLoading || !isOnline}
            className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all disabled:opacity-50"
            title="Push"
          >
            <ArrowUp className="w-3 h-3" />
          </button>

          {!isOnline && showAIIntegration && (
            <Sparkles
              className="w-3 h-3 text-[#FFD700]"
            />
          )}
        </div>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="flex items-center shrink-0 px-1 overflow-x-auto" style={{ borderBottom: "1px solid rgba(0,180,255,0.06)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "text-[#00d4ff] border-[#00d4ff]"
                : "text-[rgba(0,212,255,0.35)] border-transparent hover:text-[rgba(0,212,255,0.6)]"
            }`}
            style={{ fontSize: compact ? "0.58rem" : "0.62rem" }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-1 rounded-full ${
                  activeTab === tab.id ? "bg-[rgba(0,212,255,0.15)]" : "bg-[rgba(0,40,80,0.3)]"
                }`}
                style={{ fontSize: "0.5rem" }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Last Action Notification */}
      {lastAction && (
        <div
          className="mx-2 mt-1 px-2 py-1 rounded text-xs flex items-center gap-1 animate-pulse"
          style={{
            background: lastAction.includes('✅') ? 'rgba(0,255,136,0.1)' :
                        lastAction.includes('❌') ? 'rgba(255,51,102,0.1)' :
                        'rgba(0,212,255,0.1)',
            color: lastAction.includes('✅') ? '#00ff88' :
                   lastAction.includes('❌') ? '#ff3366' :
                   '#00d4ff',
            fontSize: '0.6rem'
          }}
        >
          {lastAction.includes('✅') && <Check className="w-3 h-3" />}
          {lastAction.includes('❌') && <AlertCircle className="w-3 h-3" />}
          {lastAction}
        </div>
      )}

      {/* AI Family Care Message */}
      {careMessage && showAIIntegration && (
        <div
          className="mx-2 mt-1 p-2 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.08))',
            border: '1px solid rgba(255,215,0,0.2)'
          }}
        >
          <div className="flex items-start gap-2">
            <MessageCircleHeart className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
            <p className="text-[#e0f0ff]" style={{ fontSize: "0.72rem", lineHeight: 1.5 }}>
              {careMessage}
            </p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,180,255,0.15) transparent" }}
      >
        {isLoading && changes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <Loader2 className="w-8 h-8 text-[rgba(0,212,255,0.3)] animate-spin mb-2" />
            <p className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.68rem" }}>
              Loading Git status...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "changes" && (
              <div className="flex flex-col h-full">
                {/* Commit Input */}
                <div className="px-2 py-1.5 shrink-0" style={{ borderBottom: "1px solid rgba(0,180,255,0.06)" }}>
                  <textarea
                    value={commitMsg}
                    onChange={(e) => setCommitMsg(e.target.value)}
                    placeholder={t("ide.gitCommitMsg")}
                    rows={compact ? 1 : 2}
                    className="w-full bg-[rgba(0,40,80,0.25)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.2)] px-2 py-1.5 rounded-md border border-[rgba(0,180,255,0.1)] outline-none focus:border-[rgba(0,212,255,0.3)] resize-none"
                    style={{ fontSize: compact ? "0.6rem" : "0.65rem", lineHeight: "1.4" }}
                  />
                  <button
                    onClick={handleCommit}
                    disabled={!commitMsg.trim() || stagedChanges.length === 0 || isLoading}
                    className={`w-full mt-1 py-1 rounded-md transition-all flex items-center justify-center gap-1 ${
                      commitMsg.trim() && stagedChanges.length > 0 && !isLoading
                        ? "bg-[rgba(0,212,255,0.15)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.25)] border border-[rgba(0,212,255,0.3)]"
                        : "bg-[rgba(0,40,80,0.2)] text-[rgba(0,212,255,0.2)] border border-[rgba(0,180,255,0.05)]"
                    }`}
                    style={{ fontSize: compact ? "0.58rem" : "0.62rem" }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    <span>{t("ide.gitCommit")} ({stagedChanges.length})</span>
                  </button>
                </div>

                {/* Staged Changes */}
                {stagedChanges.length > 0 && (
                  <div className="px-1 py-1">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.58rem", letterSpacing: "0.5px" }}>
                        {t("ide.gitStaged")} ({stagedChanges.length})
                      </span>
                      <button
                        onClick={unstageAll}
                        className="text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] transition-all"
                        title="Unstage all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                    {stagedChanges.map((c) => (
                      <ChangeItem key={c.id} change={c} onToggle={toggleStage} compact={compact} />
                    ))}
                  </div>
                )}

                {/* Unstaged Changes */}
                {unstagedChanges.length > 0 && (
                  <div className="px-1 py-1">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.58rem", letterSpacing: "0.5px" }}>
                        {t("ide.gitUnstaged")} ({unstagedChanges.length})
                      </span>
                      <button
                        onClick={stageAll}
                        className="text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] transition-all"
                        title="Stage all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {unstagedChanges.map((c) => (
                      <ChangeItem key={c.id} change={c} onToggle={toggleStage} compact={compact} />
                    ))}
                  </div>
                )}

                {/* Clean State */}
                {changes.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 py-8">
                    <Check className="w-8 h-8 text-[rgba(0,255,136,0.15)] mb-2" />
                    <p className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.68rem" }}>
                      {t("ide.gitClean")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "commits" && (
              <div className="flex flex-col">
                {/* Search */}
                <div className="px-2 py-1.5 shrink-0" style={{ borderBottom: "1px solid rgba(0,180,255,0.06)" }}>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(0,40,80,0.25)] border border-[rgba(0,180,255,0.08)]">
                    <Search className="w-3 h-3 text-[rgba(0,212,255,0.3)] shrink-0" />
                    <input
                      type="text"
                      value={searchCommits}
                      onChange={(e) => setSearchCommits(e.target.value)}
                      placeholder={t("ide.gitSearchCommits")}
                      className="flex-1 bg-transparent text-[#e0f0ff] placeholder-[rgba(0,212,255,0.2)] outline-none"
                      style={{ fontSize: compact ? "0.58rem" : "0.62rem" }}
                    />
                  </div>
                </div>

                {filteredCommits.map((commit) => (
                  <CommitItem key={commit.id} commit={commit} compact={compact} />
                ))}

                {filteredCommits.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.68rem" }}>
                      No commits found
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "branches" && (
              <div className="px-1 py-1">
                {branches.map((branch) => (
                  <BranchItem
                    key={branch.name}
                    branch={branch}
                    onSelect={async () => {
                      setIsLoading(true);
                      await gitService.checkoutBranch(branch.name);
                      const updatedBranches = await gitService.getBranches();
                      setBranches(updatedBranches);
                      setIsLoading(false);
                    }}
                    compact={compact}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function ChangeItem({ change, onToggle, compact }: { change: GitFileChange; onToggle: (id: string) => void; compact?: boolean }) {
  const Icon = STATUS_ICONS[change.status] || FileEdit;
  const color = STATUS_COLORS[change.status] || "#00d4ff";

  return (
    <button
      onClick={() => onToggle(change.id)}
      className="w-full flex items-center gap-1.5 px-2 py-[4px] rounded-[3px] hover:bg-[rgba(0,40,80,0.2)] transition-all group"
    >
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="truncate flex-1 text-left text-[#c0dcf0]" style={{ fontSize: compact ? "0.6rem" : "0.65rem" }}>
        {change.filename}
      </span>
      <span className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {change.additions && change.additions > 0 && (
          <span className="text-[#00ff88]" style={{ fontSize: "0.5rem" }}>+{change.additions}</span>
        )}
        {change.deletions && change.deletions > 0 && (
          <span className="text-[#ff3366]" style={{ fontSize: "0.5rem" }}>-{change.deletions}</span>
        )}
      </span>
      <span
        className="p-0.5 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] shrink-0"
        title={change.staged ? "Unstage" : "Stage"}
      >
        {change.staged ? <Minus className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
      </span>
    </button>
  );
}

function CommitItem({ commit, compact }: { commit: GitCommitInfo; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="px-2 py-1.5 hover:bg-[rgba(0,40,80,0.15)] transition-all cursor-pointer"
      style={{ borderBottom: "1px solid rgba(0,180,255,0.04)" }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <GitCommitIcon className="w-3 h-3 text-[rgba(0,212,255,0.3)] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[#c0dcf0] truncate" style={{ fontSize: compact ? "0.6rem" : "0.65rem" }}>
            {commit.message}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[rgba(0,212,255,0.25)] font-mono" style={{ fontSize: "0.5rem" }}>
              {commit.hash}
            </span>
            <span className="text-[rgba(0,212,255,0.2)]" style={{ fontSize: "0.5rem" }}>
              {commit.author}
            </span>
            <span className="text-[rgba(0,212,255,0.15)]" style={{ fontSize: "0.5rem" }}>
              {commit.date}
            </span>
          </div>

          {expanded && (
            <div className="mt-2 p-2 rounded bg-[rgba(0,40,80,0.2)] space-y-1">
              {commit.body && (
                <p className="text-[rgba(0,212,255,0.4)] whitespace-pre-wrap" style={{ fontSize: "0.6rem", lineHeight: 1.5 }}>
                  {commit.body}
                </p>
              )}
              <div className="flex items-center gap-3 pt-1" style={{ borderTop: "1px solid rgba(0,180,255,0.06)" }}>
                <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.5rem" }}>
                  {commit.filesChanged} files
                </span>
                <span className="text-[#00ff88]" style={{ fontSize: "0.5rem" }}>
                  +{commit.additions}
                </span>
                <span className="text-[#ff3366]" style={{ fontSize: "0.5rem" }}>
                  -{commit.deletions}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BranchItem({ branch, onSelect, compact }: { branch: GitBranchInfo; onSelect: () => void; compact?: boolean }) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-2 py-2 rounded-md transition-all cursor-pointer ${
        branch.current ? "bg-[rgba(0,212,255,0.08)]" : "hover:bg-[rgba(0,40,80,0.2)]"
      }`}
    >
      <GitBranch
        className="w-3.5 h-3.5 shrink-0"
        style={{ color: branch.current ? "#00d4ff" : "rgba(0,212,255,0.3)" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`truncate ${branch.current ? "text-[#00d4ff]" : "text-[#c0dcf0]}"}`}
            style={{ fontSize: compact ? "0.62rem" : "0.68rem" }}
          >
            {branch.name}
          </span>
          {branch.current && (
            <span
              className="px-1 py-0.5 rounded text-[#00ff88] bg-[rgba(0,255,136,0.1)]"
              style={{ fontSize: "0.45rem" }}
            >
              HEAD
            </span>
          )}
          {branch.isRemote && (
            <span
              className="px-1 py-0.5 rounded text-[#c792ea] bg-[rgba(199,146,234,0.1)]"
              style={{ fontSize: "0.45rem" }}
            >
              remote
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[rgba(0,212,255,0.25)] truncate" style={{ fontSize: "0.5rem" }}>
            {branch.lastCommit}
          </span>
          {branch.ahead > 0 && (
            <span className="flex items-center gap-0.5 text-[#00ff88]" style={{ fontSize: "0.5rem" }}>
              ↑{branch.ahead}
            </span>
          )}
          {branch.behind > 0 && (
            <span className="flex items-center gap-0.5 text-[#ff6b9d]" style={{ fontSize: "0.5rem" }}>
              ↓{branch.behind}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default GitPanel;
