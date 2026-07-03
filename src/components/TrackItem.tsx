import { GripVertical, Heart, Pause, Play, Trash2 } from "lucide-react";
import type { NormalPlaylist } from "../types/playlist";
import type { Track } from "../types/track";
import { formatTime } from "../utils/formatTime";
import { getTrackPrimaryText, getTrackSecondaryText } from "../utils/trackDisplay";
import { IconButton } from "./IconButton";
import { TrackArtwork } from "./TrackArtwork";

type TrackItemProps = {
  track: Track;
  active: boolean;
  playing: boolean;
  onPlay: (trackId: string) => void;
  onTogglePlay: () => void;
  onToggleLike: (trackId: string) => void;
  onRemove: (trackId: string) => void;
  removeLabel?: string;
  draggableItem?: boolean;
  onDragStart?: () => void;
  onDragOver?: () => void;
  onDrop?: () => void;
  playlists: NormalPlaylist[];
  playlistIdsForTrack: string[];
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
};

export function TrackItem({
  track,
  active,
  playing,
  onPlay,
  onTogglePlay,
  onToggleLike,
  onRemove,
  removeLabel = "移除歌曲",
  draggableItem = false,
  onDragStart,
  onDragOver,
  onDrop,
  playlists,
  playlistIdsForTrack,
  onAddToPlaylist,
}: TrackItemProps) {
  const isCurrentPlaying = active && playing;
  const playlistIdSet = new Set(playlistIdsForTrack);

  return (
    <li
      draggable={draggableItem}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        if (!draggableItem) return;
        event.preventDefault();
        onDragOver?.();
      }}
      onDrop={(event) => {
        if (!draggableItem) return;
        event.preventDefault();
        onDrop?.();
      }}
    >
      <button
        type="button"
        className={[
          "group grid w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition",
          draggableItem
            ? "grid-cols-[auto_auto_minmax(0,1fr)_auto]"
            : "grid-cols-[auto_minmax(0,1fr)_auto]",
          active
            ? "border-aquarius-blue/[0.55] bg-aquarius-blue/[0.14] shadow-glow"
            : "border-white/[0.08] bg-white/[0.07] hover:border-white/[0.18] hover:bg-white/[0.11]",
        ].join(" ")}
        onClick={() => {
          if (active) {
            onTogglePlay();
            return;
          }
          onPlay(track.id);
        }}
      >
        {draggableItem && (
          <span
            className="hidden cursor-grab text-aquarius-mist active:cursor-grabbing sm:inline-flex"
            aria-hidden="true"
          >
            <GripVertical className="h-4 w-4" />
          </span>
        )}
        <span className="relative">
          <TrackArtwork track={track} size="sm" />
          <span
            className={[
              "absolute inset-0 flex items-center justify-center rounded-lg bg-aquarius-navy/[0.52] text-white opacity-0 transition",
              active ? "opacity-100" : "group-hover:opacity-100",
            ].join(" ")}
          >
            {isCurrentPlaying ? (
              <Pause className="h-4 w-4 animate-soft-pulse" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </span>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-white">
            {getTrackPrimaryText(track)}
          </span>
          <span className="mt-1 block truncate text-xs text-aquarius-mist">
            {getTrackSecondaryText(track)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="hidden w-12 text-right text-xs font-medium text-aquarius-mist sm:inline">
            {formatTime(track.duration)}
          </span>
          {/* ponytail: Fixed width stops native option text resizing rows; revisit only if the desktop breakpoint changes. */}
          <select
            aria-label={`將 ${track.title} 加入播放清單`}
            className="hidden w-32 shrink-0 rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.76] px-2 py-2 text-xs font-bold text-aquarius-mist outline-none transition hover:border-aquarius-blue/[0.45] hover:text-white focus:border-aquarius-blue/60 sm:block"
            value=""
            disabled={playlists.length === 0}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              event.stopPropagation();
              const playlistId = event.currentTarget.value;
              if (playlistId) {
                onAddToPlaylist(playlistId, track.id);
              }
            }}
          >
            <option value="">
              {playlists.length > 0 ? "加入歌單" : "尚無歌單"}
            </option>
            {playlists.map((playlist) => {
              const alreadyAdded = playlistIdSet.has(playlist.id);

              return (
                <option key={playlist.id} value={playlist.id}>
                  {alreadyAdded ? `已在 ${playlist.name}` : playlist.name}
                </option>
              );
            })}
          </select>
          <IconButton
            icon={<Heart className="h-4 w-4" fill={track.liked ? "currentColor" : "none"} />}
            label={track.liked ? "取消收藏" : "收藏歌曲"}
            active={track.liked}
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onToggleLike(track.id);
            }}
          />
          <IconButton
            icon={<Trash2 className="h-4 w-4" />}
            label={removeLabel}
            size="sm"
            variant="danger"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(track.id);
            }}
          />
        </span>
      </button>
    </li>
  );
}
