import { formatTime } from "../utils/formatTime";

type ProgressBarProps = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  compact?: boolean;
};

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  compact = false,
}: ProgressBarProps) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrentTime =
    Number.isFinite(currentTime) && currentTime > 0
      ? Math.min(currentTime, safeDuration || currentTime)
      : 0;

  return (
    <div className={compact ? "w-full" : "space-y-2"}>
      {!compact && (
        <div className="flex items-center justify-between text-xs font-medium text-aquarius-mist">
          <span>{formatTime(safeCurrentTime)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>
      )}
      <input
        aria-label="播放進度"
        type="range"
        min={0}
        max={safeDuration || 0}
        step="0.1"
        value={safeDuration ? safeCurrentTime : 0}
        disabled={!safeDuration}
        className="aqua-range w-full"
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
      />
    </div>
  );
}
