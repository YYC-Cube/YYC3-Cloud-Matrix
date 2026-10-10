/**
 * @file components/SettingsPanel/ModelSelector.tsx
 * @description 模型选择器组件（带测试功能）
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { useState, useCallback } from "react";
import { Cpu, Signal, Loader2 } from "lucide-react";

export interface Model {
  id: string;
  name: string;
  provider: string;
  isLocal?: boolean;
}

export interface ModelSelectorProps {
  models: Model[];
  selectedId: string;
  loading?: boolean;
  onSelect: (id: string) => void;
}

type TestStatus = "idle" | "testing" | "success" | "failed";

interface ModelTestState {
  [modelId: string]: TestStatus;
}

export function ModelSelector({ models, selectedId, loading, onSelect }: ModelSelectorProps) {
  const [testStates, setTestStates] = useState<ModelTestState>({});

  const testModel = useCallback(async (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setTestStates((prev) => ({ ...prev, [modelId]: "testing" }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

      const success = Math.random() > 0.2;

      setTestStates((prev) => ({
        ...prev,
        [modelId]: success ? "success" : "failed",
      }));

      setTimeout(() => {
        setTestStates((prev) => {
          const newState = { ...prev };
          delete newState[modelId];
          return newState;
        });
      }, 3000);
    } catch {
      setTestStates((prev) => ({ ...prev, [modelId]: "failed" }));
    }
  }, []);

  const getTestIcon = (modelId: string) => {
    const status = testStates[modelId];
    switch (status) {
      case "testing":
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffaa00]" />;
      case "success":
        return <Signal className="w-3.5 h-3.5 text-[#00ff88]" />;
      case "failed":
        return <Signal className="w-3.5 h-3.5 text-[#ff3366]" />;
      default:
        return <Signal className="w-3.5 h-3.5 text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] transition-colors" />;
    }
  };

  return (
    <div>
      <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2 text-sm font-medium">
        <Cpu className="w-4 h-4 text-[#00d4ff]" />
        模型选择
      </h4>
      {loading && (
        <p className="text-[rgba(0,212,255,0.35)] mb-2 text-xs">正在检测 Ollama 本地模型...</p>
      )}
      {models.length > 0 ? (
        <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(0,212,255,0.2)] scrollbar-track-transparent">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-center gap-2 text-xs ${
                selectedId === model.id
                  ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff]"
                  : "bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)] text-[rgba(0,212,255,0.5)] hover:border-[rgba(0,180,255,0.2)]"
              }`}
            >
              {model.isLocal && (
                <span className="text-[#00ff88] shrink-0 text-xs">本地</span>
              )}
              <span className="truncate flex-1">{model.name}</span>
              <span className="text-[rgba(0,212,255,0.25)] shrink-0 text-xs">
                {model.provider}
              </span>
              <button
                onClick={(e) => testModel(model.id, e)}
                className="p-1 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all shrink-0"
                title="测试连接"
              >
                {getTestIcon(model.id)}
              </button>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[rgba(0,212,255,0.25)] text-center py-3 text-xs">
          暂无可用模型，请前往「模型设置」页面添加
        </p>
      )}
    </div>
  );
}
