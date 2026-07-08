import {
  Heart,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useState } from "react";
import type { NormalPlaylist } from "../types/playlist";
import type { RepeatMode, Track } from "../types/track";
import { getTrackPrimaryText, getTrackSecondaryText } from "../utils/trackDisplay";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";
import { TrackArtwork } from "./TrackArtwork";
import { VolumeControl } from "./VolumeControl";
import { useText } from "../config/textOverrides";

type PlayerCoreProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  trackCount: number;
  sourceLabel?: string;
  sleepTimerActive?: boolean;
  sleepTimerLabel?: string;
  showWebLimitNotice?: boolean;
  playlists?: NormalPlaylist[];
  currentTrackPlaylistIds?: string[];
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeatMode: () => void;
  onToggleLike: (trackId: string) => void;
  onAddCurrentTrackToPlaylist?: (playlistId: string, trackId: string) => void;
  onEditCurrentTrack?: () => void;
  onReloadCurrentTrackMetadata?: () => void;
  onShowCurrentTrackFileLocation?: () => void;
  canShowCurrentTrackFileLocation?: boolean;
};

function getRepeatLabel(repeatMode: RepeatMode) {
  if (repeatMode === "one") {
    return "單曲循環";
  }

  if (repeatMode === "all") {
    return "全部循環";
  }

  return "不循環";
}

export function PlayerCore({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  repeatMode,
  shuffle,
  trackCount,
  sourceLabel,
  sleepTimerActive = false,
  sleepTimerLabel,
  showWebLimitNotice = false,
  playlists = [],
  currentTrackPlaylistIds = [],
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeatMode,
  onToggleLike,
  onAddCurrentTrackToPlaylist,
  onEditCurrentTrack,
  onReloadCurrentTrackMetadata,
  onShowCurrentTrackFileLocation,
  canShowCurrentTrackFileLocation = false,
}: PlayerCoreProps) {
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const hasTracks = trackCount > 0;
  const currentTrackPlaylistIdSet = new Set(currentTrackPlaylistIds);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const closeMoreMenu = () => setMoreMenuOpen(false);
  const playerWaiting = useText("playerWaiting");
  const playerSelectHint = useText("playerSelectHint");
  const playerDropHint = useText("playerDropHint");

  return (
    <section className="glass-panel p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <TrackArtwork track={currentTrack} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
                {isPlaying ? "Playing" : hasTracks ? "Ready" : "Waiting"}
              </p>
              <h2 className="mt-2 animate-track-in truncate text-2xl font-black text-white sm:text-3xl">
                {currentTrack ? getTrackPrimaryText(currentTrack) : playerWaiting}
              </h2>
              <p className="mt-1 truncate text-sm text-aquarius-mist">
                {currentTrack ? getTrackSecondaryText(currentTrack) : playerSelectHint}
              </p>
              {currentTrack?.album && (
                <p className="mt-1 truncate text-xs text-aquarius-mist">
                  {currentTrack.album}
                </p>
              )}
              {sourceLabel && (
                <p className="mt-2 truncate text-xs font-bold text-aquarius-blue">
                  來自：{sourceLabel}
                </p>
              )}
              {sleepTimerActive && sleepTimerLabel && (
                <p className="mt-3 inline-flex rounded-full border border-aquarius-pink/[0.32] bg-aquarius-pink/[0.12] px-3 py-1 text-xs font-bold text-pink-50">
                  {sleepTimerLabel}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* ponytail: Fixed width keeps native option labels from resizing this control; revisit only if the card breakpoint changes. */}
            <select
              aria-label="將目前歌曲加入播放清單"
              title={
                currentTrack
                  ? playlists.length > 0
                    ? "將目前歌曲加入播放清單"
                    : "尚無播放清單"
                  : "目前沒有正在播放的歌曲"
              }
              className="w-36 shrink-0 rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.76] px-2 py-2 text-xs font-bold text-aquarius-mist outline-none transition hover:border-aquarius-blue/[0.45] hover:text-white focus:border-aquarius-blue/60 disabled:cursor-not-allowed disabled:opacity-40"
              value=""
              disabled={!currentTrack || playlists.length === 0}
              onChange={(event) => {
                const playlistId = event.currentTarget.value;
                if (playlistId && currentTrack) {
                  onAddCurrentTrackToPlaylist?.(playlistId, currentTrack.id);
                }
              }}
            >
              <option value="">
                {playlists.length > 0 ? "加入歌單" : "尚無歌單"}
              </option>
              {playlists.map((playlist) => {
                const alreadyAdded = currentTrackPlaylistIdSet.has(playlist.id);

                return (
                  <option key={playlist.id} value={playlist.id}>
                    {alreadyAdded ? `已在 ${playlist.name}` : playlist.name}
                  </option>
                );
              })}
            </select>
            <IconButton
              icon={
                <Heart
                  className="h-5 w-5"
                  fill={currentTrack?.liked ? "currentColor" : "none"}
                />
              }
              label={currentTrack?.liked ? "取消收藏" : "收藏歌曲"}
              active={Boolean(currentTrack?.liked)}
              disabled={!currentTrack}
              onClick={() => currentTrack && onToggleLike(currentTrack.id)}
            />
            <div className="relative">
              <IconButton
                icon={<MoreHorizontal className="h-5 w-5" />}
                label="更多"
                disabled={!currentTrack}
                onClick={() => setMoreMenuOpen((open) => !open)}
              />
              {moreMenuOpen && currentTrack && (
                <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.96] p-1 text-sm font-bold text-aquarius-mist shadow-[0_16px_44px_rgba(0,0,0,0.35)]">
                  <button
                    type="button"
                    className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-white/[0.09] hover:text-white"
                    onClick={() => {
                      closeMoreMenu();
                      onEditCurrentTrack?.();
                    }}
                  >
                    編輯歌曲資訊
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-white/[0.09] hover:text-white"
                    onClick={() => {
                      closeMoreMenu();
                      onReloadCurrentTrackMetadata?.();
                    }}
                  >
                    重新讀取音樂標籤
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!canShowCurrentTrackFileLocation}
                    title={
                      canShowCurrentTrackFileLocation
                        ? "顯示檔案位置"
                        : "這個模式不支援顯示檔案位置"
                    }
                    onClick={() => {
                      closeMoreMenu();
                      onShowCurrentTrackFileLocation?.();
                    }}
                  >
                    顯示檔案位置
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <IconButton
            icon={<Shuffle className="h-5 w-5" />}
            label={shuffle ? "關閉隨機播放" : "開啟隨機播放"}
            active={shuffle}
            disabled={!hasTracks}
            onClick={onToggleShuffle}
          />
          <IconButton
            icon={<SkipBack className="h-5 w-5" />}
            label="上一首"
            disabled={!hasTracks}
            onClick={() => onPrevious()}
          />
          <IconButton
            icon={isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            label={isPlaying ? "暫停" : "播放"}
            size="lg"
            variant="primary"
            disabled={!hasTracks}
            onClick={onTogglePlay}
          />
          <IconButton
            icon={<SkipForward className="h-5 w-5" />}
            label="下一首"
            disabled={!hasTracks}
            onClick={() => onNext()}
          />
          <IconButton
            icon={<RepeatIcon className="h-5 w-5" />}
            label={getRepeatLabel(repeatMode)}
            active={repeatMode !== "none"}
            disabled={!hasTracks}
            onClick={onCycleRepeatMode}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <VolumeControl
            volume={volume}
            muted={muted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />
          <p className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-xs leading-5 text-aquarius-mist">
            {showWebLimitNotice
              ? "Web preview 重新整理後，請重新選擇本地音樂檔或資料夾。"
              : playerDropHint}
          </p>
        </div>
      </div>
    </section>
  );
}
