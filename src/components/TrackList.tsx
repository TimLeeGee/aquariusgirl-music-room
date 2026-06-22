import { useState } from "react";
import type { NormalPlaylist } from "../types/playlist";
import type { Track } from "../types/track";
import { TrackItem } from "./TrackItem";

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

  if (tracks.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.08] px-4 py-10 text-center text-sm leading-6 text-aquarius-mist">
        找不到符合條件的歌曲。換個關鍵字，水瓶罐子再幫你撈一次。
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tracks.map((track, index) => (
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
      ))}
    </ul>
  );
}
