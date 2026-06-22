import { RotateCcw } from "lucide-react";
import type { AudioVisualizerSettings } from "../types/settings";
import { defaultAudioVisualizerSettings } from "../types/settings";

type AudioVisualizerSettingsPanelProps = {
  settings: AudioVisualizerSettings;
  onChange: (settings: AudioVisualizerSettings) => void;
  title?: string;
};

type RangeSettingProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function RangeSetting({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: RangeSettingProps) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between gap-2 text-[11px] font-bold text-aquarius-mist">
        <span>{label}</span>
        <span>{Number.isInteger(value) ? value : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="aqua-range w-full"
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

export function AudioVisualizerSettingsPanel({
  settings,
  onChange,
  title = "音樂譜設定",
}: AudioVisualizerSettingsPanelProps) {
  const update = (patch: Partial<AudioVisualizerSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div className="app-no-drag space-y-3 rounded-lg border border-white/[0.14] bg-aquarius-navy/[0.92] p-3 shadow-glass">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black text-white">{title}</p>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.08] px-2 py-1 text-[11px] font-bold text-aquarius-mist"
          onClick={() => onChange(defaultAudioVisualizerSettings)}
        >
          <RotateCcw className="h-3 w-3" />
          重設
        </button>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-xs font-bold text-white">
        啟用音樂條
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => update({ enabled: event.currentTarget.checked })}
        />
      </label>

      <RangeSetting
        label="強度"
        min={0.5}
        max={3}
        step={0.05}
        value={settings.intensity}
        onChange={(value) => update({ intensity: value })}
      />
      <RangeSetting
        label="靈敏度"
        min={0.5}
        max={3}
        step={0.05}
        value={settings.sensitivity}
        onChange={(value) => update({ sensitivity: value })}
      />
      <RangeSetting
        label="平滑度"
        min={0}
        max={0.9}
        step={0.01}
        value={settings.smoothing}
        onChange={(value) => update({ smoothing: value })}
      />
      <RangeSetting
        label="音樂條數量"
        min={8}
        max={48}
        step={1}
        value={settings.barCount}
        onChange={(value) => update({ barCount: Math.round(value) })}
      />
      <RangeSetting
        label="最小高度"
        min={2}
        max={12}
        step={1}
        value={settings.minBarHeight}
        onChange={(value) => update({ minBarHeight: Math.round(value) })}
      />
      <RangeSetting
        label="最大高度"
        min={12}
        max={64}
        step={1}
        value={settings.maxBarHeight}
        onChange={(value) => update({ maxBarHeight: Math.round(value) })}
      />
      <RangeSetting
        label="低音增益"
        min={0.5}
        max={3}
        step={0.05}
        value={settings.bassBoost}
        onChange={(value) => update({ bassBoost: value })}
      />
      <RangeSetting
        label="反應速度"
        min={0.1}
        max={1}
        step={0.01}
        value={settings.responsiveness}
        onChange={(value) => update({ responsiveness: value })}
      />
    </div>
  );
}
