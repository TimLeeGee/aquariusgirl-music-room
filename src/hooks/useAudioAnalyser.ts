import { type RefObject, useEffect, useRef, useState } from "react";
import type { AudioVisualizerSettings } from "../types/settings";

const IDLE_LEVEL = 0.08;
const MIN_ACTIVE_LEVEL = 0.04;

type UseAudioAnalyserOptions = {
  audioRef: RefObject<HTMLAudioElement>;
  enabled: boolean;
  isPlaying: boolean;
  bars?: number;
  settings?: AudioVisualizerSettings;
};

export function useAudioAnalyser({
  audioRef,
  enabled,
  isPlaying,
  bars = 32,
  settings,
}: UseAudioAnalyserOptions) {
  const barCount = settings?.barCount ?? bars;
  const [levels, setLevels] = useState(() => Array.from({ length: barCount }, () => IDLE_LEVEL));
  const [supported, setSupported] = useState(true);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousLevelsRef = useRef<number[]>(Array.from({ length: barCount }, () => IDLE_LEVEL));

  useEffect(() => {
    previousLevelsRef.current = Array.from({ length: barCount }, () => IDLE_LEVEL);
    setLevels(previousLevelsRef.current);
  }, [barCount]);

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (!enabled) {
      void contextRef.current?.suspend();
      setLevels(Array.from({ length: barCount }, () => IDLE_LEVEL));
      return;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      setSupported(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!contextRef.current) {
      const context = new AudioContextCtor();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.minDecibels = -82;
      analyser.maxDecibels = -12;
      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);
      contextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }

    const activeAnalyser = analyserRef.current;
    if (!activeAnalyser) {
      return;
    }

    activeAnalyser.smoothingTimeConstant = Math.min(
      0.9,
      Math.max(0, settings?.smoothing ?? 0.18),
    );

    const data = new Uint8Array(activeAnalyser.frequencyBinCount);
    const nextLevels = new Array<number>(barCount);

    const tick = () => {
      const analyser = analyserRef.current;
      if (!analyser || !enabled) {
        return;
      }

      if (isPlaying) {
        void contextRef.current?.resume();
        analyser.getByteFrequencyData(data);
        const bucketSize = Math.max(1, Math.floor(data.length / barCount));
        const sensitivity = settings?.sensitivity ?? 1;
        const intensity = settings?.intensity ?? 1;
        const bassBoost = settings?.bassBoost ?? 1;
        const responsiveness = Math.min(1, Math.max(0.1, settings?.responsiveness ?? 1));

        for (let index = 0; index < barCount; index += 1) {
          const start = index * bucketSize;
          const end = Math.min(data.length, start + bucketSize);
          let total = 0;

          for (let dataIndex = start; dataIndex < end; dataIndex += 1) {
            total += data[dataIndex];
          }

          const count = Math.max(1, end - start);
          const bandBoost = index < Math.max(2, Math.floor(barCount * 0.22)) ? bassBoost : 1;
          const normalized = Math.min(1, (total / count / 255) * sensitivity * intensity * bandBoost);
          const targetLevel = Math.max(MIN_ACTIVE_LEVEL, Math.pow(normalized, 0.72));
          const previousLevel = previousLevelsRef.current[index] ?? IDLE_LEVEL;
          nextLevels[index] =
            previousLevel + (targetLevel - previousLevel) * responsiveness;
        }
        previousLevelsRef.current = [...nextLevels];
        setLevels(previousLevelsRef.current);
      } else {
        previousLevelsRef.current = previousLevelsRef.current.map((value) =>
          Math.max(IDLE_LEVEL, value * 0.72),
        );
        setLevels(previousLevelsRef.current);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    audioRef,
    barCount,
    enabled,
    isPlaying,
    settings?.bassBoost,
    settings?.intensity,
    settings?.responsiveness,
    settings?.sensitivity,
    settings?.smoothing,
  ]);

  return {
    levels,
    supported,
  };
}
