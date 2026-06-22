import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SleepTimerMode = "off" | "minutes" | "endOfTrack";

type UseSleepTimerOptions = {
  pause: () => void;
  setVolume: (volume: number) => void;
  volume: number;
  onEndOfTrackStart?: () => void;
  onCancelEndOfTrack?: () => void;
};

export function useSleepTimer({
  pause,
  setVolume,
  volume,
  onEndOfTrackStart,
  onCancelEndOfTrack,
}: UseSleepTimerOptions) {
  const [mode, setMode] = useState<SleepTimerMode>("off");
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const originalVolumeRef = useRef(volume);
  const fadeStartedRef = useRef(false);
  const fadeTimeoutsRef = useRef<number[]>([]);

  const clearFadeTimeouts = useCallback(() => {
    fadeTimeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
    fadeTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    originalVolumeRef.current = volume;
  }, [volume]);

  const cancel = useCallback(() => {
    clearFadeTimeouts();
    setMode("off");
    setTargetTime(null);
    setRemainingSeconds(0);
    fadeStartedRef.current = false;
    onCancelEndOfTrack?.();
  }, [clearFadeTimeouts, onCancelEndOfTrack]);

  const startMinutes = useCallback((minutes: number) => {
    clearFadeTimeouts();
    const safeMinutes = Math.max(1, Math.round(minutes));
    setMode("minutes");
    setTargetTime(Date.now() + safeMinutes * 60 * 1000);
    setRemainingSeconds(safeMinutes * 60);
    fadeStartedRef.current = false;
  }, [clearFadeTimeouts]);

  const startEndOfTrack = useCallback(() => {
    clearFadeTimeouts();
    setMode("endOfTrack");
    setTargetTime(null);
    setRemainingSeconds(0);
    fadeStartedRef.current = false;
    onEndOfTrackStart?.();
  }, [clearFadeTimeouts, onEndOfTrackStart]);

  const completeEndOfTrack = useCallback(() => {
    if (mode !== "endOfTrack") {
      return;
    }

    pause();
    cancel();
  }, [cancel, mode, pause]);

  useEffect(() => {
    if (mode !== "minutes" || !targetTime) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextRemaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 5 && !fadeStartedRef.current) {
        fadeStartedRef.current = true;
        const startVolume = originalVolumeRef.current;
        const steps = 5;
        for (let step = 1; step <= steps; step += 1) {
          const timer = window.setTimeout(() => {
            setVolume(Math.max(0, startVolume * (1 - step / steps)));
          }, step * 800);
          fadeTimeoutsRef.current.push(timer);
        }
      }

      if (nextRemaining <= 0) {
        pause();
        setVolume(originalVolumeRef.current);
        cancel();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cancel, mode, pause, setVolume, targetTime]);

  useEffect(() => {
    return () => clearFadeTimeouts();
  }, [clearFadeTimeouts]);

  return {
    mode,
    active: mode !== "off",
    targetTime,
    remainingSeconds,
    stopAfterCurrentTrack: mode === "endOfTrack",
    label: useMemo(() => {
      if (mode === "endOfTrack") {
        return "播完目前歌曲後停止";
      }

      if (mode === "minutes") {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")} 後停止`;
      }

      return "睡前定時未啟用";
    }, [mode, remainingSeconds]),
    startMinutes,
    startEndOfTrack,
    completeEndOfTrack,
    cancel,
  };
}
