/**
 * @file components/SettingsPanel/ApiKeyInput.tsx
 * @description API Key 输入组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Key } from "lucide-react";

export interface ApiKeyInputProps {
  value: string;
  showValue: boolean;
  onToggleShow: () => void;
  onChange: (value: string) => void;
}

export function ApiKeyInput({ value, showValue, onToggleShow, onChange }: ApiKeyInputProps) {
  return (
    <div>
      <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2 text-sm font-medium">
        <Key className="w-4 h-4 text-[#ffdd00]" />
        OpenAI API 认证
      </h4>
      <div className="relative">
        <input
          type={showValue ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] font-mono text-xs"
        />
        <button
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[rgba(0,212,255,0.1)]"
        >
          <span className="text-[rgba(0,212,255,0.4)] text-xs">{showValue ? "隐藏" : "显示"}</span>
        </button>
      </div>
      <p className="text-[rgba(0,212,255,0.25)] mt-1 text-xs">
        {value ? "✅ API Key 已配置" : "⚠️ 未配置 Key，将使用本地模拟模式"}
        {" · 密钥仅保存在本地浏览器"}
      </p>
    </div>
  );
}
