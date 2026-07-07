type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

// ponytail: renderer modal 取代 window.confirm — Windows 上原生同步對話框會弄壞 webContents 焦點
// （排序 select 打不開、搜尋 / AI 輸入框點不進去）；樣式與焦點行為照抄 PlaylistDeleteDialog。
// z-[85]：高於歌曲資訊面板 z-[80]、低於 MessageToast z-[90]。
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "繼續",
  cancelLabel = "取消",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-aquarius-navy/[0.68] p-4 backdrop-blur-lg"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="glass-panel app-no-drag w-full max-w-md p-5"
        role="dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
          Confirm
        </p>
        <h2 id="confirm-dialog-title" className="mt-1 text-2xl font-black text-white">
          {title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-aquarius-mist">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            autoFocus
            type="button"
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm font-bold text-aquarius-mist transition hover:text-white"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-lg border border-aquarius-pink/[0.36] bg-aquarius-pink/[0.12] px-4 py-2 text-sm font-bold text-white transition hover:bg-aquarius-pink/[0.2]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
