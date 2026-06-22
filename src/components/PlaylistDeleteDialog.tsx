type PlaylistDeleteDialogProps = {
  playlistName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PlaylistDeleteDialog({
  playlistName,
  onCancel,
  onConfirm,
}: PlaylistDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-aquarius-navy/[0.68] p-4 backdrop-blur-lg"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        aria-labelledby="playlist-delete-title"
        aria-modal="true"
        className="glass-panel app-no-drag w-full max-w-md p-5"
        role="dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
          Playlist
        </p>
        <h2 id="playlist-delete-title" className="mt-1 text-2xl font-black text-white">
          刪除播放清單
        </h2>
        <p className="mt-4 text-sm leading-6 text-aquarius-mist">
          確定要刪除「{playlistName}」嗎？這只會刪除播放清單，不會刪除原始音樂檔案。
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            autoFocus
            type="button"
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm font-bold text-aquarius-mist transition hover:text-white"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-300/[0.34] bg-red-500/[0.12] px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/[0.2]"
            onClick={onConfirm}
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}
