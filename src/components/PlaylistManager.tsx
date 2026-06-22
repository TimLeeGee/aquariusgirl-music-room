import { isEditablePlaylist } from "../types/playlist";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";

type PlaylistManagerProps = {
  activePlaylist?: Playlist;
  currentTrack: Track | null;
  activeTrackIds: string[];
  onRenameRequest: (playlist: Playlist) => void;
  onDelete: (playlistId: string) => void;
  onAddCurrentTrack: (playlistId: string, trackId: string) => void;
  onRemoveCurrentTrack: (playlistId: string, trackId: string) => void;
};

function getDescription(activePlaylist: Playlist) {
  if (activePlaylist.type === "smart") {
    return "智慧型播放清單會依照規則即時篩選歌曲，不會把結果寫死。";
  }

  return "一般播放清單可以手動加入目前歌曲，移除只會移出歌單，不會刪除音樂檔。";
}

export function PlaylistManager({
  activePlaylist,
  currentTrack,
  activeTrackIds,
  onRenameRequest,
  onDelete,
  onAddCurrentTrack,
  onRemoveCurrentTrack,
}: PlaylistManagerProps) {
  if (!isEditablePlaylist(activePlaylist)) {
    return null;
  }

  const currentTrackInPlaylist = currentTrack
    ? activeTrackIds.includes(currentTrack.id)
    : false;
  const canEditTracks = activePlaylist.type === "normal";

  return (
    <div className="glass-panel p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
        Playlist Tools
      </p>
      <h2 className="mt-1 truncate text-lg font-black text-white">
        {activePlaylist.name}
      </h2>
      <p className="mt-2 text-xs leading-5 text-aquarius-mist">
        {getDescription(activePlaylist)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {canEditTracks && (
          <>
            <button
              type="button"
              className="rounded-lg border border-aquarius-blue/[0.32] bg-aquarius-blue/[0.12] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!currentTrack || currentTrackInPlaylist}
              onClick={() => {
                if (currentTrack) onAddCurrentTrack(activePlaylist.id, currentTrack.id);
              }}
            >
              加入目前歌曲
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-xs font-bold text-aquarius-mist disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!currentTrack || !currentTrackInPlaylist}
              onClick={() => {
                if (currentTrack) onRemoveCurrentTrack(activePlaylist.id, currentTrack.id);
              }}
            >
              只從此播放清單移除
            </button>
          </>
        )}
        <button
          type="button"
          className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-xs font-bold text-white"
          onClick={() => onRenameRequest(activePlaylist)}
        >
          改名
        </button>
        <button
          type="button"
          className="rounded-lg border border-red-300/[0.34] bg-red-500/[0.12] px-3 py-2 text-xs font-bold text-red-100"
          onClick={() => onDelete(activePlaylist.id)}
        >
          刪除
        </button>
      </div>
    </div>
  );
}
