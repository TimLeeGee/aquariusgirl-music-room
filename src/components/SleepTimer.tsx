import { Moon, X } from "lucide-react";
import { useState } from "react";
import type { SleepTimerMode } from "../hooks/useSleepTimer";
import { IconButton } from "./IconButton";
import { useText } from "../config/textOverrides";

type SleepTimerProps = {
  mode: SleepTimerMode;
  label: string;
  active: boolean;
  onStartMinutes: (minutes: number) => void;
  onStartEndOfTrack: () => void;
  onCancel: () => void;
};

export function SleepTimer({
  mode,
  label,
  active,
  onStartMinutes,
  onStartEndOfTrack,
  onCancel,
}: SleepTimerProps) {
  const [customMinutes, setCustomMinutes] = useState(45);
  const sleepTimerTitle = useText("sleepTimerTitle");

  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
            <Moon className="h-4 w-4" />
            Sleep Timer
          </p>
          <h2 className="mt-1 text-xl font-black text-white">{sleepTimerTitle}</h2>
        </div>
        {active && (
          <IconButton
            icon={<X className="h-4 w-4" />}
            label="取消睡前定時"
            size="sm"
            variant="danger"
            onClick={onCancel}
          />
        )}
      </div>

      <p className="mb-4 rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-aquarius-mist">
        {label}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[15, 30, 60].map((minutes) => (
          <button
            key={minutes}
            type="button"
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-bold text-white transition hover:border-aquarius-blue/60 hover:bg-aquarius-blue/[0.12]"
            onClick={() => onStartMinutes(minutes)}
          >
            {minutes} 分鐘
          </button>
        ))}
        <button
          type="button"
          className={[
            "rounded-lg border px-3 py-2 text-sm font-bold transition",
            mode === "endOfTrack"
              ? "border-aquarius-pink/[0.55] bg-aquarius-pink/[0.16] text-white"
              : "border-white/[0.12] bg-white/[0.08] text-white hover:border-aquarius-pink/[0.55]",
          ].join(" ")}
          onClick={onStartEndOfTrack}
        >
          播完本首
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          aria-label="自訂分鐘數"
          type="number"
          min={1}
          max={360}
          value={customMinutes}
          className="min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-white outline-none focus:border-aquarius-blue/60"
          onChange={(event) => setCustomMinutes(Number(event.currentTarget.value))}
        />
        <button
          type="button"
          className="rounded-lg border border-aquarius-blue/[0.42] bg-aquarius-blue/[0.14] px-4 py-2 text-sm font-bold text-white"
          onClick={() => onStartMinutes(customMinutes)}
        >
          自訂
        </button>
      </div>
    </section>
  );
}
