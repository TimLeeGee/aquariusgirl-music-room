import { useEffect, useState } from "react";
import { useBrandAssets } from "../config/brandAssets";
import type { BroadcastPlayerState } from "../utils/playerBroadcast";
import {
  createPlayerBroadcastChannel,
  readPlayerStateFromStorage,
} from "../utils/playerBroadcast";
import { formatTime } from "../utils/formatTime";
import { AudioVisualizer } from "./AudioVisualizer";
import { SafeImage } from "./SafeImage";

type ObsOverlayProps = {
  visualizerLevels: number[];
};

export function ObsOverlay({ visualizerLevels }: ObsOverlayProps) {
  const brandAssets = useBrandAssets();
  const [state, setState] = useState<BroadcastPlayerState | null>(() =>
    readPlayerStateFromStorage(),
  );

  useEffect(() => {
    const previousBodyBackground = document.body.style.background;
    const previousHtmlBackground = document.documentElement.style.background;
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";

    return () => {
      document.body.style.background = previousBodyBackground;
      document.documentElement.style.background = previousHtmlBackground;
    };
  }, []);

  useEffect(() => {
    const channel = createPlayerBroadcastChannel();
    if (!channel) return undefined;
    channel.onmessage = (event) => setState(event.data as BroadcastPlayerState);
    return () => channel.close();
  }, []);

  const progress =
    state?.duration && state.duration > 0 ? Math.min(100, (state.currentTime / state.duration) * 100) : 0;
  const artwork = state?.track?.artworkUrl || state?.track?.coverUrl || brandAssets.avatar || brandAssets.characterMain;

  return (
    <div className="min-h-screen bg-transparent p-6 text-white">
      <div className="inline-flex max-w-3xl items-center gap-4 rounded-lg border border-white/[0.18] bg-aquarius-navy/[0.68] p-4 shadow-glass backdrop-blur-xl">
        <div className="h-24 w-24 overflow-hidden rounded-lg border border-white/[0.14] bg-white/[0.08]">
          <SafeImage src={artwork} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-black text-white drop-shadow">
            {state?.track?.title ?? "水瓶罐子的音樂小水池待機中"}
          </p>
          <p className="truncate text-base font-bold text-aquarius-blue drop-shadow">
            {state?.track?.artist ?? "等待播放器同步"}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.16]">
            <div className="h-full bg-aquarius-blue" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-xs text-aquarius-mist">
            <span>{formatTime(state?.currentTime)}</span>
            <span>{formatTime(state?.duration)}</span>
          </div>
          <AudioVisualizer
            compact
            enabled
            supported
            levels={visualizerLevels.slice(0, 24)}
            onToggle={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}
