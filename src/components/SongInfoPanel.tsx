import { ImagePlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "../types/track";
import {
  createSongInfoDraft,
  getSongCoverFileValidationError,
  isSupportedOriginalWriteFormat,
  normalizeSongInfoDraft,
  type SongInfoDraft,
  validateSongInfoDraft,
} from "../utils/songInfo";
import { TrackArtwork } from "./TrackArtwork";

type SongInfoPanelProps = {
  open: boolean;
  track: Track | null;
  isDesktopApp: boolean;
  onClose: () => void;
  onSaveToPlayer: (trackId: string, draft: SongInfoDraft) => Promise<boolean>;
  onApplyToOriginal: (trackId: string, draft: SongInfoDraft) => Promise<boolean>;
  onError: (message: string) => void;
};

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("cover read failed"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

const isDevRuntime = Boolean(
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
);

function TextField({ label, value, onChange, multiline = false }: TextFieldProps) {
  const className =
    "w-full rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.72] px-3 py-2 text-sm text-white outline-none transition placeholder:text-aquarius-mist/60 focus:border-aquarius-blue/60";

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-aquarius-mist">{label}</span>
      {multiline ? (
        <textarea
          className={`${className} min-h-[92px] resize-none`}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      ) : (
        <input
          className={className}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
    </label>
  );
}

export function SongInfoPanel({
  open,
  track,
  isDesktopApp,
  onClose,
  onSaveToPlayer,
  onApplyToOriginal,
  onError,
}: SongInfoPanelProps) {
  const [draft, setDraft] = useState<SongInfoDraft>(() => createSongInfoDraft(track));
  const [savedDraft, setSavedDraft] = useState<SongInfoDraft>(() => createSongInfoDraft(track));
  const [busy, setBusy] = useState(false);
  const savingRef = useRef(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const trackDraftSnapshot = useMemo(
    () => createSongInfoDraft(track),
    [
      track?.album,
      track?.albumArtist,
      track?.artist,
      track?.comment,
      track?.composer,
      track?.coverDataUrl,
      track?.coverMimeType,
      track?.discNumber,
      track?.genre,
      track?.id,
      track?.title,
      track?.trackNumber,
      track?.year,
    ],
  );
  const resetDraftState = useCallback((nextDraft: SongInfoDraft) => {
    setDraft(nextDraft);
    setSavedDraft(nextDraft);
  }, []);
  const dirty = useMemo(
    () => JSON.stringify(normalizeSongInfoDraft(draft)) !== JSON.stringify(savedDraft),
    [draft, savedDraft],
  );
  const unsupportedWriteFormat = Boolean(
    track?.sourcePath && !isSupportedOriginalWriteFormat(track.sourcePath),
  );
  const writeBackDisabledReason = !track
    ? "no current track"
    : busy
      ? "saving"
      : !isDesktopApp
        ? "not desktop"
        : !track.sourcePath
          ? "no current track"
          : unsupportedWriteFormat
            ? "unsupported format"
            : !dirty
              ? "no dirty fields"
              : "";
  const writeBackDisabledLabel =
    writeBackDisabledReason === "not desktop"
      ? "寫回原始檔僅支援桌面版"
      : writeBackDisabledReason === "no current track"
        ? "這首歌沒有可寫回的本機路徑"
        : writeBackDisabledReason === "unsupported format"
          ? "這個檔案格式不支援寫回原始檔"
          : writeBackDisabledReason === "no dirty fields"
            ? "沒有任何欄位變更"
            : "";

  useEffect(() => {
    if (!open) {
      resetDraftState(createSongInfoDraft(null));
      savingRef.current = false;
      setBusy(false);
      return;
    }

    resetDraftState(trackDraftSnapshot);
  }, [open, resetDraftState, trackDraftSnapshot]);

  useEffect(() => {
    if (open && writeBackDisabledReason && isDevRuntime) {
      console.debug("[SongInfoPanel] writeback disabled:", writeBackDisabledReason);
    }
  }, [open, writeBackDisabledReason]);

  if (!open || !track) {
    return null;
  }

  const updateDraft = (key: keyof SongInfoDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const closePanel = () => {
    if (dirty && !window.confirm("表單尚未儲存，是否放棄修改？")) {
      return;
    }
    onClose();
  };

  const getValidDraft = () => {
    const normalized = normalizeSongInfoDraft(draft);
    const errors = validateSongInfoDraft(normalized);

    if (errors.length > 0) {
      onError(errors[0]);
      return null;
    }

    return normalized;
  };

  const handleCoverSelected = async (file?: File) => {
    if (!file) return;

    const coverError = getSongCoverFileValidationError(file);
    if (coverError) {
      onError(coverError);
      return;
    }

    try {
      const coverDataUrl = await readFileAsDataUrl(file);
      setDraft((current) => ({
        ...current,
        coverDataUrl,
        coverMimeType: file.type,
      }));
    } catch {
      onError("封面讀取失敗，請換一張圖片。");
    }
  };

  const handleApplyToOriginal = async () => {
    if (writeBackDisabledReason) {
      if (isDevRuntime) {
        console.debug("[SongInfoPanel] writeback disabled:", writeBackDisabledReason);
      }
      return;
    }

    if (savingRef.current) return;

    const validDraft = getValidDraft();
    if (!validDraft) return;

    if (
      !window.confirm(
        "這會修改原始音樂檔的歌曲資訊。建議先確認內容正確。是否繼續？",
      )
    ) {
      return;
    }

    savingRef.current = true;
    setBusy(true);
    try {
      const ok = await onApplyToOriginal(track.id, validDraft);
      if (ok) {
        resetDraftState(createSongInfoDraft(null));
        onClose();
      }
    } catch {
      onError("儲存失敗，請稍後再試");
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  };

  const handleSaveToPlayer = async () => {
    if (!dirty || busy || savingRef.current) return;

    const validDraft = getValidDraft();
    if (!validDraft) return;

    savingRef.current = true;
    setBusy(true);
    try {
      const ok = await onSaveToPlayer(track.id, validDraft);
      if (ok) {
        resetDraftState(createSongInfoDraft(null));
        onClose();
      }
    } catch {
      onError("儲存失敗，請稍後再試");
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-aquarius-navy/60 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-white/[0.12] bg-aquarius-navy/[0.96] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.1] px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-aquarius-blue">Song Info</p>
            <h2 className="truncate text-xl font-black text-white">歌曲資訊</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.08] text-aquarius-mist transition hover:text-white"
            aria-label="關閉歌曲資訊"
            title="關閉歌曲資訊"
            onClick={closePanel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section className="rounded-lg border border-white/[0.1] bg-white/[0.06] p-4">
            <div className="flex items-center gap-4">
              <TrackArtwork
                track={{
                  ...track,
                  artworkUrl: draft.coverDataUrl ?? track.artworkUrl,
                  coverUrl: draft.coverDataUrl ?? track.coverUrl,
                }}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {draft.title || track.title}
                </p>
                <p className="mt-1 truncate text-xs text-aquarius-mist">
                  {track.name}
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-aquarius-blue/[0.35] bg-aquarius-blue/[0.14] px-3 py-2 text-xs font-bold text-white transition hover:bg-aquarius-blue/[0.22]"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                  更換封面
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(event) => {
                    void handleCoverSelected(event.currentTarget.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-3 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4 sm:grid-cols-2">
            <TextField label="標題 title" value={draft.title} onChange={(value) => updateDraft("title", value)} />
            <TextField label="藝人 artist" value={draft.artist} onChange={(value) => updateDraft("artist", value)} />
            <TextField label="專輯 album" value={draft.album} onChange={(value) => updateDraft("album", value)} />
            <TextField label="專輯藝人 albumArtist" value={draft.albumArtist} onChange={(value) => updateDraft("albumArtist", value)} />
          </section>

          <section className="mt-5 grid gap-3 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4 sm:grid-cols-2">
            <TextField label="年份 year" value={draft.year} onChange={(value) => updateDraft("year", value)} />
            <TextField label="類型 genre" value={draft.genre} onChange={(value) => updateDraft("genre", value)} />
            <TextField label="曲目 track" value={draft.track} onChange={(value) => updateDraft("track", value)} />
            <TextField label="光碟 disc" value={draft.disc} onChange={(value) => updateDraft("disc", value)} />
            <TextField label="作曲者 composer" value={draft.composer} onChange={(value) => updateDraft("composer", value)} />
            <div className="sm:col-span-2">
              <TextField label="註解 comment" value={draft.comment} onChange={(value) => updateDraft("comment", value)} multiline />
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.1] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-bold text-aquarius-mist transition hover:text-white"
            onClick={closePanel}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-lg border border-aquarius-pink/[0.36] bg-aquarius-pink/[0.12] px-4 py-2 text-sm font-bold text-white transition hover:bg-aquarius-pink/[0.2] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!dirty || busy}
            onClick={() => void handleSaveToPlayer()}
          >
            儲存到播放器
          </button>
          <button
            type="button"
            className="rounded-lg border border-aquarius-pink/[0.36] bg-aquarius-pink/[0.12] px-4 py-2 text-sm font-bold text-white transition hover:bg-aquarius-pink/[0.2] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!dirty || busy || Boolean(writeBackDisabledReason)}
            title={writeBackDisabledLabel || "套用到原始檔"}
            onClick={() => void handleApplyToOriginal()}
          >
            套用到原始檔
          </button>
        </div>
        {writeBackDisabledLabel && (
          <p className="px-5 pb-4 text-right text-xs text-aquarius-mist">
            {writeBackDisabledLabel}
          </p>
        )}
      </aside>
    </div>
  );
}
