import { Settings2 } from "lucide-react";
import { useState } from "react";
import type { AudioVisualizerSettings } from "../types/settings";
import { AudioVisualizerSettingsPanel } from "./AudioVisualizerSettingsPanel";

type AudioVisualizerProps = {
  levels: number[];
  enabled: boolean;
  supported: boolean;
  onToggle: () => void;
  settings?: AudioVisualizerSettings;
  onSettingsChange?: (settings: AudioVisualizerSettings) => void;
  compact?: boolean;
  minBarHeight?: number;
  maxBarHeight?: number;
};

export function AudioVisualizer({
  levels,
  enabled,
  supported,
  onToggle,
  settings,
  onSettingsChange,
  compact = false,
  minBarHeight = 8,
  maxBarHeight = compact ? 48 : 112,
}: AudioVisualizerProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <section className={compact ? "" : "glass-panel p-5"}>
      {!compact && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
              Visualizer
            </p>
            <h2 className="mt-1 text-xl font-black text-white">音樂頻譜</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-bold text-white transition hover:border-aquarius-blue/50"
              onClick={onToggle}
            >
              {enabled ? "關閉" : "開啟"}
            </button>
            {settings && onSettingsChange && (
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.08] text-white transition hover:border-aquarius-blue/50"
                aria-label="音樂譜設定"
                title="音樂譜設定"
                onClick={() => setSettingsOpen((open) => !open)}
              >
                <Settings2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      {!compact && settingsOpen && settings && onSettingsChange && (
        <div className="mb-4 max-w-md">
          <AudioVisualizerSettingsPanel
            title="音樂譜設定"
            settings={settings}
            onChange={onSettingsChange}
          />
        </div>
      )}
      {!supported ? (
        <p className="text-sm text-aquarius-mist">
          這個瀏覽器不支援 AudioContext，播放器仍可正常播放。
        </p>
      ) : (
        <div className={compact ? "flex h-14 items-end gap-1" : "flex h-28 items-end gap-1"}>
          {levels.map((level, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-full bg-gradient-to-t from-aquarius-blue to-aquarius-pink"
              style={{
                height: `${Math.max(minBarHeight, level * maxBarHeight)}px`,
                transition: enabled ? "none" : "height 160ms ease-out",
                willChange: "height",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
