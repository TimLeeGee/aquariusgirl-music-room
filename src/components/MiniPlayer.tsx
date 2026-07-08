import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { Track } from "../types/track";
import { getTrackPrimaryText, getTrackSecondaryText } from "../utils/trackDisplay";
import { useText } from "../config/textOverrides";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";
import { TrackArtwork } from "./TrackArtwork";

type MiniPlayerProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trackCount: number;
  sleepTimerActive?: boolean;
  sleepTimerLabel?: string;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
};

export function MiniPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  trackCount,
  sleepTimerActive = false,
  sleepTimerLabel,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
}: MiniPlayerProps) {
  const hasTracks = trackCount > 0;
  const miniIdle = useText("miniIdle");

  return (
    <div className="mini-player-surface fixed inset-x-3 bottom-3 z-40 mx-auto max-w-5xl rounded-lg border border-white/[0.15] p-3 text-white shadow-glass backdrop-blur-2xl sm:bottom-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <TrackArtwork track={currentTrack} size="md" className="h-12 w-12" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">
            {currentTrack ? getTrackPrimaryText(currentTrack) : miniIdle}
          </p>
          <p className="truncate text-xs text-aquarius-mist">
            {currentTrack ? getTrackSecondaryText(currentTrack) : "加入本地音樂後開始播放"}
          </p>
          {sleepTimerActive && sleepTimerLabel && (
            <p className="mt-1 truncate text-[11px] font-bold text-aquarius-pink">
              {sleepTimerLabel}
            </p>
          )}
          <div className="mt-2">
            <ProgressBar
              compact
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={<SkipBack className="h-4 w-4" />}
            label="上一首"
            size="sm"
            disabled={!hasTracks}
            onClick={() => onPrevious()}
          />
          <IconButton
            icon={isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            label={isPlaying ? "暫停" : "播放"}
            size="md"
            variant="primary"
            disabled={!hasTracks}
            onClick={onTogglePlay}
          />
          <IconButton
            icon={<SkipForward className="h-4 w-4" />}
            label="下一首"
            size="sm"
            disabled={!hasTracks}
            onClick={() => onNext()}
          />
        </div>
      </div>
    </div>
  );
}
