type PlaylistDuplicateDialogProps = {
  playlistName: string;
  trackTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PlaylistDuplicateDialog({
  playlistName,
  trackTitle,
  onCancel,
  onConfirm,
}: PlaylistDuplicateDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-aquarius-navy/[0.68] p-4 backdrop-blur-lg"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        aria-labelledby="playlist-duplicate-title"
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
        <h2 id="playlist-duplicate-title" className="mt-1 text-2xl font-black text-white">
          重複加入歌曲
        </h2>
        <p className="mt-4 text-sm leading-6 text-aquarius-mist">
          「{trackTitle}」已經在「{playlistName}」裡。仍然加入第二筆嗎？
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
            className="rounded-lg border border-aquarius-blue/[0.45] bg-aquarius-blue/[0.16] px-4 py-2 text-sm font-bold text-white transition hover:bg-aquarius-blue/[0.24]"
            onClick={onConfirm}
          >
            仍然加入
          </button>
        </div>
      </div>
    </div>
  );
}
