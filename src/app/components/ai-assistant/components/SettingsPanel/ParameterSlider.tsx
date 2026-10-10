/**
 * @file components/SettingsPanel/ParameterSlider.tsx
 * @description 参数滑块组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { Slider } from "../../../ui/slider";

export interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
  color?: string;
}

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
  color = "#00d4ff",
}: ParameterSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[#e0f0ff] text-sm font-medium">{label}</h4>
        <span
          className="text-sm font-mono"
          style={{ color }}
        >
          {value.toFixed(2)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[rgba(0,212,255,0.25)] text-xs">{minLabel}</span>
        <span className="text-[rgba(0,212,255,0.25)] text-xs">{maxLabel}</span>
      </div>
    </div>
  );
}
