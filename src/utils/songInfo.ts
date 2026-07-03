import type { Track } from "../types/track";

export const MAX_SONG_COVER_MB = 5;
// ponytail: 5 MB accepts real album art like Cover 01 while still blocking huge accidental images; add canvas compression only if users need larger covers.
export const MAX_SONG_COVER_BYTES = MAX_SONG_COVER_MB * 1024 * 1024;

export type SongInfoDraft = {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  year: string;
  genre: string;
  track: string;
  disc: string;
  comment: string;
  composer: string;
  coverDataUrl?: string;
  coverMimeType?: string;
};

const supportedCoverMimeTypes = new Set(["image/jpeg", "image/png"]);
const supportedCoverExtensions = new Set([".jpg", ".jpeg", ".png"]);
const supportedOriginalWriteExtensions = new Set([".mp3", ".flac", ".m4a"]);

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isTrackPosition(value: string) {
  return /^\d+(\s*\/\s*\d+)?$/.test(value);
}

export function normalizeSongInfoDraft(draft: Partial<SongInfoDraft>): SongInfoDraft {
  return {
    title: clean(draft.title),
    artist: clean(draft.artist),
    album: clean(draft.album),
    albumArtist: clean(draft.albumArtist),
    year: clean(draft.year),
    genre: clean(draft.genre),
    track: clean(draft.track).replace(/\s*\/\s*/g, "/"),
    disc: clean(draft.disc).replace(/\s*\/\s*/g, "/"),
    comment: clean(draft.comment),
    composer: clean(draft.composer),
    coverDataUrl: clean(draft.coverDataUrl) || undefined,
    coverMimeType: clean(draft.coverMimeType) || undefined,
  };
}

export function createSongInfoDraft(track: Track | null): SongInfoDraft {
  return normalizeSongInfoDraft({
    title: track?.title ?? "",
    artist: track?.artist ?? "",
    album: track?.album ?? "",
    albumArtist: track?.albumArtist ?? "",
    year: track?.year ?? "",
    genre: track?.genre ?? "",
    track: track?.trackNumber ?? "",
    disc: track?.discNumber ?? "",
    comment: track?.comment ?? "",
    composer: track?.composer ?? "",
    coverDataUrl: track?.coverDataUrl,
    coverMimeType: track?.coverMimeType,
  });
}

export function validateSongInfoDraft(draft: SongInfoDraft) {
  const errors: string[] = [];

  if (!draft.title.trim()) {
    errors.push("標題不能空白。");
  }

  if (draft.year && !/^\d{4}$/.test(draft.year)) {
    errors.push("年份請輸入 4 位數年份。");
  }

  if (draft.track && !isTrackPosition(draft.track)) {
    errors.push("曲目請輸入數字，或使用 1/12 這種格式。");
  }

  if (draft.disc && !isTrackPosition(draft.disc)) {
    errors.push("光碟請輸入數字，或使用 1/2 這種格式。");
  }

  return errors;
}

export function isSupportedSongCoverFile(file: Pick<File, "name" | "type" | "size">) {
  return getSongCoverFileValidationError(file) === "";
}

export function getSongCoverFileValidationError(file: Pick<File, "name" | "type" | "size">) {
  const extension = getExtension(file.name);
  const mimeType = file.type.toLowerCase();

  if (file.size <= 0) {
    return "封面圖片是空檔案，請換一張 JPG / PNG。";
  }

  if (file.size > MAX_SONG_COVER_BYTES) {
    return `封面圖片太大，請選擇 ${MAX_SONG_COVER_MB} MB 以內的 JPG / PNG。`;
  }

  if (!supportedCoverExtensions.has(extension) || !supportedCoverMimeTypes.has(mimeType)) {
    return "封面只支援 JPG / PNG。";
  }

  return "";
}

export function isSupportedOriginalWriteFormat(fileNameOrPath: string) {
  return supportedOriginalWriteExtensions.has(getExtension(fileNameOrPath));
}
