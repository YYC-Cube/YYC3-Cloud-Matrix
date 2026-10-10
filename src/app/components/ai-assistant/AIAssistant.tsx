/**
 * AIAssistant.tsx
 * =================================
 * YYC³ CloudPivot Intelli-Matrix · AI 集成控制中心
 *
 * 重构版本 - 采用模块化架构
 * - 使用 Radix UI 组件替换内联实现
 * - Hooks 抽取：useChat, useAIConfig, useFloatingPanel, useDraggable
 * - 组件拆分：ChatPanel, CommandsPanel, PromptsPanel, SettingsPanel
 * - 可拖拽设计：支持鼠标和触摸拖拽
 */

import { useState, useCallback } from "react";
import { MessageSquare, Command, BookOpen, Sliders, GripVertical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { FloatingButton, PanelHeader, ChatPanel, CommandsPanel, PromptsPanel, SettingsPanel } from "./components";
import { useChat, useAIConfig, useFloatingPanel, useDraggable } from "./hooks";
import { SYSTEM_COMMANDS, type SystemCommand } from "./constants";
import type { AIAssistantProps, AITab } from "./types";

const DRAGGABLE_BOUNDS = {
  left: 20,
  top: 60,
  right: typeof window !== "undefined" ? window.innerWidth - 20 : 1920,
  bottom: typeof window !== "undefined" ? window.innerHeight - 20 : 1080,
};

export function AIAssistant({ isMobile }: AIAssistantProps) {
  const {
    isOpen,
    isMaximized,
    activeTab,
    openPanel,
    closePanel,
    toggleMaximize,
    setActiveTab,
    panelClass,
  } = useFloatingPanel({ isMobile });

  const {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    draggableRef,
    resetPosition,
  } = useDraggable({
    initialPosition: { x: typeof window !== "undefined" ? window.innerWidth - 420 : 1500, y: 80 },
    bounds: DRAGGABLE_BOUNDS,
  });

  const {
    messages,
    inputValue,
    isTyping,
    systemPrompt,
    chatEndRef,
    sendMessage,
    setInputValue,
    clearChat,
    setSystemPrompt,
    applyPreset,
    copyToClipboard,
    copiedId,
  } = useChat();

  const {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
    topP,
    setTopP,
    maxTokens,
    setMaxTokens,
    availableModels,
    ollamaLoading,
  } = useAIConfig();

  const [showApiKey, setShowApiKey] = useState(false);
  const [cmdFilter, setCmdFilter] = useState<string>("all");

  const executeCommand = (cmd: SystemCommand) => {
    setActiveTab("chat");
    sendMessage(cmd.action);
  };

  const handleSend = () => {
    sendMessage(inputValue);
  };

  const handleClose = useCallback(() => {
    resetPosition();
    closePanel();
  }, [resetPosition, closePanel]);

  const currentModel = availableModels.find((m) => m.id === selectedModel);

  if (!isOpen) {
    return <FloatingButton onClick={openPanel} isMobile={isMobile} />;
  }

  const panelStyle = isMaximized
    ? {}
    : {
        position: "fixed" as const,
        left: position.x,
        top: position.y,
        zIndex: 1000,
        cursor: isDragging ? "grabbing" : "default",
      };

  return (
    <div
      ref={draggableRef}
      className={isMaximized ? panelClass : "w-[380px] h-[520px]"}
      style={panelStyle}
    >
      <div className="w-full h-full rounded-2xl bg-[rgba(8,25,55,0.95)] backdrop-blur-2xl border border-[rgba(0,180,255,0.2)] shadow-[0_0_60px_rgba(0,180,255,0.12)] flex flex-col overflow-hidden">
        {/* 拖拽手柄 */}
        {!isMaximized && (
          <div
            className="shrink-0 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing bg-[rgba(0,40,80,0.3)] border-b border-[rgba(0,180,255,0.1)]"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <GripVertical className="w-4 h-4 text-[rgba(0,212,255,0.3)]" />
          </div>
        )}

        <PanelHeader
          modelName={currentModel?.name ?? ""}
          isLoading={ollamaLoading}
          isMaximized={isMaximized}
          isMobile={isMobile}
          onClearChat={clearChat}
          onToggleMaximize={toggleMaximize}
          onClose={handleClose}
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AITab)} className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-2 border-b border-[rgba(0,180,255,0.08)] bg-[rgba(0,40,80,0.1)]">
            <TabsList className="bg-transparent gap-0.5">
              <TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                对话
              </TabsTrigger>
              <TabsTrigger value="commands" className="flex items-center gap-1.5 text-xs">
                <Command className="w-3.5 h-3.5" />
                命令
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                提示词
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
                <Sliders className="w-3.5 h-3.5" />
                配置
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(0,212,255,0.3)] scrollbar-track-transparent hover:scrollbar-thumb-[rgba(0,212,255,0.5)]">
            <TabsContent value="chat" className="flex flex-col h-full m-0 data-[state=inactive]:hidden overflow-hidden">
              <ChatPanel
                messages={messages}
                inputValue={inputValue}
                isTyping={isTyping}
                copiedId={copiedId}
                chatEndRef={chatEndRef}
                onInputChange={setInputValue}
                onSend={handleSend}
                onCopy={copyToClipboard}
              />
            </TabsContent>

            <TabsContent value="commands" className="m-0 data-[state=inactive]:hidden p-3 overflow-hidden">
              <CommandsPanel
                commands={SYSTEM_COMMANDS}
                filter={cmdFilter}
                onFilterChange={setCmdFilter}
                onExecute={executeCommand}
              />
            </TabsContent>

            <TabsContent value="prompts" className="m-0 data-[state=inactive]:hidden p-3 overflow-hidden">
              <PromptsPanel
                activePrompt={systemPrompt}
                onSelect={applyPreset}
                onCustomChange={setSystemPrompt}
              />
            </TabsContent>

            <TabsContent value="settings" className="m-0 data-[state=inactive]:hidden p-3 overflow-hidden">
              <SettingsPanel
                apiKey={apiKey}
                showApiKey={showApiKey}
                onToggleApiKey={() => setShowApiKey(!showApiKey)}
                onApiKeyChange={setApiKey}
                models={availableModels}
                selectedModel={selectedModel}
                modelsLoading={ollamaLoading}
                onModelSelect={setSelectedModel}
                temperature={temperature}
                onTemperatureChange={setTemperature}
                topP={topP}
                onTopPChange={setTopP}
                maxTokens={maxTokens}
                onMaxTokensChange={setMaxTokens}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
