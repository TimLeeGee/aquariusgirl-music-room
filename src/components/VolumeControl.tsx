import { Volume1, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "./IconButton";

type VolumeControlProps = {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
};

export function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-2 py-2">
      <IconButton
        icon={<Icon className="h-4 w-4" />}
        label={muted ? "取消靜音" : "靜音"}
        size="sm"
        variant="ghost"
        onClick={onToggleMute}
      />
      <input
        aria-label="音量"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        className="aqua-range w-28 sm:w-36"
        onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
      />
      <span className="w-10 text-right text-xs font-bold text-aquarius-mist">
        {Math.round((muted ? 0 : volume) * 100)}
      </span>
    </div>
  );
}
