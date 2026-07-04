import { useState } from "react";
import type { NormalPlaylist } from "../types/playlist";
import type { Track } from "../types/track";
import { TrackItem } from "./TrackItem";

const TRACK_ROW_HEIGHT = 88;
const TRACK_LIST_VIEWPORT_HEIGHT = 520;
const TRACK_LIST_OVERSCAN = 8;

type TrackListProps = {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onTogglePlay: () => void;
  onToggleLike: (trackId: string) => void;
  onRemove: (trackId: string, index: number) => void;
  removeLabel?: string;
  canReorder?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  playlists: NormalPlaylist[];
  trackPlaylistIdsByTrackId: Record<string, string[]>;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
};

export function TrackList({
  tracks,
  currentTrackId,
  isPlaying,
  onPlay,
  onTogglePlay,
  onToggleLike,
  onRemove,
  removeLabel,
  canReorder = false,
  onReorder,
  playlists,
  trackPlaylistIdsByTrackId,
  onAddToPlaylist,
}: TrackListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  if (tracks.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.08] px-4 py-10 text-center text-sm leading-6 text-aquarius-mist">
        找不到符合條件的歌曲。換個關鍵字，水瓶罐子再幫你撈一次。
      </div>
    );
  }

  const visibleCapacity =
    Math.ceil(TRACK_LIST_VIEWPORT_HEIGHT / TRACK_ROW_HEIGHT) + TRACK_LIST_OVERSCAN * 2;
  const maxVisibleStart = Math.max(0, tracks.length - visibleCapacity);
  const visibleStart = Math.min(
    Math.max(0, Math.floor(scrollTop / TRACK_ROW_HEIGHT) - TRACK_LIST_OVERSCAN),
    maxVisibleStart,
  );
  const visibleEnd = Math.min(tracks.length, visibleStart + visibleCapacity);
  const visibleTracks = tracks.slice(visibleStart, visibleEnd);
  const paddingTop = visibleStart * TRACK_ROW_HEIGHT;
  const paddingBottom = Math.max(0, (tracks.length - visibleEnd) * TRACK_ROW_HEIGHT);

  return (
    <div
      className="h-full min-h-0 overflow-y-auto pr-1"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <ul className="space-y-2" style={{ paddingTop, paddingBottom }}>
        {visibleTracks.map((track, offset) => {
          const index = visibleStart + offset;

          return (
            <TrackItem
              key={`${track.id}-${index}`}
              track={track}
              active={track.id === currentTrackId}
              playing={isPlaying}
              onPlay={onPlay}
              onTogglePlay={onTogglePlay}
              onToggleLike={onToggleLike}
              onRemove={(trackId) => onRemove(trackId, index)}
              removeLabel={removeLabel}
              draggableItem={canReorder}
              onDragStart={() => setDragIndex(index)}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) {
                  onReorder?.(dragIndex, index);
                }
                setDragIndex(null);
              }}
              playlists={playlists}
              playlistIdsForTrack={trackPlaylistIdsByTrackId[track.id] ?? []}
              onAddToPlaylist={onAddToPlaylist}
            />
          );
        })}
      </ul>
    </div>
  );
}
