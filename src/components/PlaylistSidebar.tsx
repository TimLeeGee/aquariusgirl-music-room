import {
  ListMusic,
  ListPlus,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { Playlist } from "../types/playlist";

type PlaylistSidebarProps = {
  playlists: Playlist[];
  activePlaylistId: string;
  playlistTrackIdsById: Record<string, string[]>;
  onSelect: (playlistId: string) => void;
  onCreateNormal: () => void;
  onCreateSmart: () => void;
};

function getPlaylistIcon(playlist: Playlist) {
  if (playlist.type === "smart") return <Sparkles className="h-4 w-4 text-aquarius-pink" />;
  return <ListMusic className="h-4 w-4 text-aquarius-blue" />;
}

function getPlaylistMeta(playlist: Playlist, count: number) {
  if (playlist.type === "smart") return `${count} 首 · 智慧`;
  return `${count} 首`;
}

export function PlaylistSidebar({
  playlists,
  activePlaylistId,
  playlistTrackIdsById,
  onSelect,
  onCreateNormal,
  onCreateSmart,
}: PlaylistSidebarProps) {
  return (
    <section className="glass-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
            Playlists
          </p>
          <h2 className="mt-1 text-lg font-black text-white">歌單</h2>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-aquarius-blue/[0.34] bg-aquarius-blue/[0.12] px-3 py-2 text-sm font-bold text-white transition hover:border-aquarius-blue/60"
          onClick={onCreateNormal}
        >
          <ListPlus className="h-4 w-4" />
          新增播放清單
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-aquarius-pink/[0.32] bg-aquarius-pink/[0.12] px-3 py-2 text-sm font-bold text-white transition hover:border-aquarius-pink/[0.55]"
          onClick={onCreateSmart}
        >
          <WandSparkles className="h-4 w-4" />
          新增智慧型播放清單
        </button>
      </div>

      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {playlists.map((playlist) => {
          const count = playlistTrackIdsById[playlist.id]?.length ?? 0;

          return (
            <button
              key={playlist.id}
              type="button"
              className={[
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition",
                playlist.id === activePlaylistId
                  ? "border-aquarius-blue/[0.55] bg-aquarius-blue/[0.14] text-white"
                  : "border-white/[0.08] bg-white/[0.06] text-aquarius-mist hover:text-white",
              ].join(" ")}
              onClick={() => onSelect(playlist.id)}
            >
              {getPlaylistIcon(playlist)}
              <span className="truncate font-bold">{playlist.name}</span>
              <span className="shrink-0 text-xs">{getPlaylistMeta(playlist, count)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
