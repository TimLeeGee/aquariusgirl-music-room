import {
  Maximize2,
  Minus,
  Pause,
  Pin,
  PinOff,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AudioVisualizerSettings, MiniPlayerSettings } from "../types/settings";
import type { Track } from "../types/track";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";
import { TrackArtwork } from "./TrackArtwork";

type MiniPlayerAssistantProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  levels: number[];
  visualizerSettings: AudioVisualizerSettings;
  miniSettings: MiniPlayerSettings;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onExitMini: () => void;
  onAlwaysOnTopChange: (enabled: boolean) => void;
  onOpacityChange: (opacity: number) => void;
};

function clampOpacityPercent(value: number) {
  return Math.min(100, Math.max(20, Math.round(value)));
}

export function MiniPlayerAssistant({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  levels,
  visualizerSettings,
  miniSettings,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onExitMini,
  onAlwaysOnTopChange,
  onOpacityChange,
}: MiniPlayerAssistantProps) {
  const opacityPercent = Math.round(miniSettings.opacity * 100);
  const [opacityInput, setOpacityInput] = useState(String(opacityPercent));
  // ponytail: Keep the native Windows caption; use a separate frameless window only if it must be removed.
  const isWindowsDesktop = Boolean(
    window.aquariusgirlAPI && navigator.userAgent.includes("Windows"),
  );

  useEffect(() => {
    setOpacityInput(String(opacityPercent));
  }, [opacityPercent]);

  const commitOpacity = (value: number | string) => {
    const parsed = Number(value);
    const next = clampOpacityPercent(Number.isFinite(parsed) ? parsed : opacityPercent);
    setOpacityInput(String(next));
    onOpacityChange(next / 100);
  };

  return (
    <div
      className={`app-drag-region h-screen w-screen overflow-hidden bg-transparent px-2 pb-2 ${isWindowsDesktop ? "pt-7" : "pt-2"} text-white`}
    >
      <div
        className="mini-assistant-card app-drag-region relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-[20px] p-2 shadow-glass backdrop-blur-xl"
        style={{ opacity: window.aquariusgirlAPI ? 1 : miniSettings.opacity }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
          <div className="star-field h-full w-full opacity-20" />
        </div>
        <section className="mini-assistant-header relative grid h-[68px] shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[16px] border border-white/[0.12] p-2">
          <TrackArtwork track={currentTrack} size="sm" className="h-12 w-12 rounded-[12px]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-tight text-white">
              {currentTrack?.title ?? "水瓶罐子待機中"}
            </p>
            <p className="truncate text-xs leading-tight text-aquarius-mist">
              {currentTrack?.artist ?? "把音樂放進小水池"}
            </p>
            <div className="mt-2 flex h-4 items-end gap-[3px]">
              {levels.slice(0, visualizerSettings.barCount).map((level, index) => (
                <div
                  key={index}
                  className="w-full rounded-full bg-gradient-to-t from-aquarius-blue to-aquarius-pink"
                  style={{
                    height: `${Math.max(
                      visualizerSettings.minBarHeight,
                      level * Math.min(18, visualizerSettings.maxBarHeight),
                    )}px`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <div
          className="mini-assistant-controls app-no-drag relative z-20 flex min-h-0 flex-1 flex-col gap-2 rounded-[16px] border border-white/[0.12] p-2 shadow-soft backdrop-blur-xl"
        >
          <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2">
            <IconButton
              icon={<SkipBack className="h-4 w-4" />}
              label="上一首"
              size="md"
              className="h-10 w-10"
              onClick={() => onPrevious()}
            />
            <button
              type="button"
              className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[14px] border border-aquarius-blue/[0.42] bg-aquarius-blue/[0.16] px-3 text-sm font-black text-white transition hover:border-aquarius-blue hover:bg-aquarius-blue/[0.22]"
              onClick={onTogglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "暫停" : "播放"}
            </button>
            <IconButton
              icon={<SkipForward className="h-4 w-4" />}
              label="下一首"
              size="md"
              className="h-10 w-10"
              onClick={() => onNext()}
            />
          </div>

          <div className="flex h-5 items-center rounded-full px-0.5">
            <ProgressBar
              compact
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
          </div>

          <div className="flex h-5 items-center gap-2">
            <Volume2 className="h-4 w-4 text-aquarius-mist" />
            <input
              aria-label="mini player 音量"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              className="aqua-range min-w-0 flex-1"
              onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
            />
          </div>

          <div className="grid grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2">
            <IconButton
              icon={miniSettings.alwaysOnTop ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              label={miniSettings.alwaysOnTop ? "取消置頂" : "置頂"}
              size="sm"
              className="h-9 w-9"
              active={miniSettings.alwaysOnTop}
              onClick={() => onAlwaysOnTopChange(!miniSettings.alwaysOnTop)}
            />
            <div className="grid h-9 min-w-0 grid-cols-[28px_minmax(0,1fr)_28px] items-center overflow-hidden rounded-[12px] border border-white/[0.14] bg-white/[0.08]">
              <button
                type="button"
                aria-label="降低 Mini 背景透明度"
                title="降低透明度"
                className="inline-flex h-full items-center justify-center text-aquarius-mist transition hover:bg-white/10 hover:text-white disabled:opacity-35"
                disabled={opacityPercent <= 20}
                onClick={() => commitOpacity(opacityPercent - 5)}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                aria-label="Mini 背景透明度百分比"
                type="number"
                inputMode="numeric"
                min={20}
                max={100}
                step={5}
                value={opacityInput}
                className="mini-opacity-number h-full min-w-0 border-x border-white/[0.1] bg-transparent px-1 text-center text-xs font-black tabular-nums text-white outline-none focus:bg-aquarius-blue/[0.12]"
                onChange={(event) => setOpacityInput(event.currentTarget.value)}
                onBlur={() => commitOpacity(opacityInput)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
              />
              <button
                type="button"
                aria-label="提高 Mini 背景透明度"
                title="提高透明度"
                className="inline-flex h-full items-center justify-center text-aquarius-mist transition hover:bg-white/10 hover:text-white disabled:opacity-35"
                disabled={opacityPercent >= 100}
                onClick={() => commitOpacity(opacityPercent + 5)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <IconButton
              icon={<Maximize2 className="h-4 w-4" />}
              label="回到完整播放器"
              size="sm"
              className="h-9 w-9"
              variant="primary"
              onClick={onExitMini}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
