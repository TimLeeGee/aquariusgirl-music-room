import { ListMusic } from "lucide-react";
import { SYSTEM_PLAYLIST_IDS } from "../types/playlist";
import type { NormalPlaylist, Playlist } from "../types/playlist";
import type { SortMode, Track } from "../types/track";
import { formatTime } from "../utils/formatTime";
import { SearchBox } from "./SearchBox";
import { SortControls } from "./SortControls";
import { TrackList } from "./TrackList";

type PlaylistPanelProps = {
  tracks: Track[];
  totalTrackCount: number;
  currentTrackId: string | null;
  isPlaying: boolean;
  searchKeyword: string;
  sortMode: SortMode;
  onSearchChange: (value: string) => void;
  onSortModeChange: (value: SortMode) => void;
  onPlayTrack: (trackId: string) => void;
  onTogglePlay: () => void;
  onToggleLike: (trackId: string) => void;
  onRemoveTrack: (trackId: string, index: number) => void;
  activePlaylist?: Playlist;
  canReorder?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  playlists: NormalPlaylist[];
  trackPlaylistIdsByTrackId: Record<string, string[]>;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
};

export function PlaylistPanel({
  tracks,
  totalTrackCount,
  currentTrackId,
  isPlaying,
  searchKeyword,
  sortMode,
  onSearchChange,
  onSortModeChange,
  onPlayTrack,
  onTogglePlay,
  onToggleLike,
  onRemoveTrack,
  activePlaylist,
  canReorder,
  onReorder,
  playlists,
  trackPlaylistIdsByTrackId,
  onAddTrackToPlaylist,
}: PlaylistPanelProps) {
  const isNormalPlaylist = activePlaylist?.type === "normal";
  const removeLabel = isNormalPlaylist
    ? "只從此播放清單移除"
    : activePlaylist?.type === "smart"
      ? "從此智慧型播放清單排除"
    : activePlaylist?.id === SYSTEM_PLAYLIST_IDS.all
      ? "移除歌曲"
      : "請到全部歌曲移除";
  const totalDuration = tracks.reduce((sum, track) => sum + (track.duration ?? 0), 0);

  // ponytail: Native scroll bounds plus the existing windowed TrackList are enough until real large-library QA proves a heavier virtualizer is needed.
  return (
    <aside className="glass-panel flex min-h-[520px] flex-col overflow-hidden p-4 sm:p-5 lg:sticky lg:top-5 lg:min-h-0 lg:flex-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
            <ListMusic className="h-4 w-4" />
            Playlist
          </p>
          <h2 className="mt-1 truncate text-xl font-black text-white">
            {activePlaylist?.name ?? "本地歌單"}
          </h2>
          <p className="mt-1 text-xs text-aquarius-mist">
            {tracks.length} 首 · {formatTime(totalDuration)}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-aquarius-mist">
          {tracks.length}/{totalTrackCount}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <SearchBox value={searchKeyword} onChange={onSearchChange} />
        <SortControls value={sortMode} onChange={onSortModeChange} />
      </div>

      <div className="mt-4 min-h-0 flex-1 -mr-3 pr-1">
        <TrackList
          tracks={tracks}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          onPlay={onPlayTrack}
          onTogglePlay={onTogglePlay}
          onToggleLike={onToggleLike}
          onRemove={onRemoveTrack}
          removeLabel={removeLabel}
          canReorder={Boolean(canReorder)}
          onReorder={onReorder}
          playlists={playlists}
          trackPlaylistIdsByTrackId={trackPlaylistIdsByTrackId}
          onAddToPlaylist={onAddTrackToPlaylist}
        />
      </div>
    </aside>
  );
}
