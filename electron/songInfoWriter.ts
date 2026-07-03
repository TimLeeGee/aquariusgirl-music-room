import { chmod, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { TagLib, type ExtendedTag, type Picture, type TagInput } from "taglib-wasm";
import { readPictures, readTags } from "taglib-wasm/simple";

export type SongInfoWriteDraft = {
  title?: unknown;
  artist?: unknown;
  album?: unknown;
  albumArtist?: unknown;
  year?: unknown;
  genre?: unknown;
  track?: unknown;
  disc?: unknown;
  comment?: unknown;
  composer?: unknown;
  coverDataUrl?: unknown;
  coverMimeType?: unknown;
};

const writableExtensions = new Set([".mp3", ".flac", ".m4a"]);
const coverDataUrlPattern = /^data:(image\/(?:jpeg|png));base64,([a-z0-9+/=\s]+)$/i;
// ponytail: keep this in sync with renderer cover validation; add shared config only if Electron starts consuming more renderer constants.
const maxCoverBytes = 5 * 1024 * 1024;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstTagValue(value: unknown) {
  if (Array.isArray(value)) {
    return clean(value[0]);
  }

  return clean(value);
}

function parsePosition(value: unknown) {
  const text = clean(value);
  const match = /^(\d+)(?:\/(\d+))?$/.exec(text);

  if (!match) {
    return {};
  }

  return {
    current: Number(match[1]),
    total: match[2] ? Number(match[2]) : undefined,
  };
}

function formatPosition(current?: number, total?: number) {
  if (!current) {
    return "";
  }

  return total ? `${current}/${total}` : String(current);
}

export function isWritableSongInfoPath(sourcePath: string) {
  return writableExtensions.has(path.extname(sourcePath).toLowerCase());
}

export function createTagInputFromSongInfoDraft(draft: SongInfoWriteDraft): Partial<TagInput> {
  const track = parsePosition(draft.track);
  const disc = parsePosition(draft.disc);
  const year = clean(draft.year);

  return {
    title: clean(draft.title),
    artist: clean(draft.artist),
    album: clean(draft.album),
    albumArtist: clean(draft.albumArtist),
    date: /^\d{4}$/.test(year) ? year : undefined,
    genre: clean(draft.genre),
    track: track.current,
    totalTracks: track.total,
    discNumber: disc.current,
    totalDiscs: disc.total,
    comment: clean(draft.comment),
    composer: clean(draft.composer),
  };
}

export function createSongInfoDraftFromTagLib(tags: ExtendedTag, pictures: Picture[] = []) {
  const cover =
    pictures.find((picture) => picture.type === "FrontCover") ??
    pictures.find((picture) => picture.mimeType === "image/jpeg" || picture.mimeType === "image/png");
  const year = firstTagValue(tags.date).slice(0, 4) || (tags.year ? String(tags.year) : "");
  const coverMimeType = cover?.mimeType?.toLowerCase();
  const coverDataUrl =
    cover &&
    (coverMimeType === "image/jpeg" || coverMimeType === "image/png") &&
    cover.data.byteLength <= maxCoverBytes
      ? `data:${coverMimeType};base64,${Buffer.from(cover.data).toString("base64")}`
      : undefined;

  return {
    title: firstTagValue(tags.title),
    artist: firstTagValue(tags.artist),
    album: firstTagValue(tags.album),
    albumArtist: firstTagValue(tags.albumArtist),
    year: /^\d{4}$/.test(year) ? year : "",
    genre: firstTagValue(tags.genre),
    track: formatPosition(tags.track, tags.totalTracks),
    disc: formatPosition(tags.discNumber, tags.totalDiscs),
    comment: firstTagValue(tags.comment),
    composer: firstTagValue(tags.composer),
    coverDataUrl,
    coverMimeType: coverDataUrl ? coverMimeType : undefined,
  };
}

export function decodeCoverDataUrl(dataUrl: unknown) {
  const text = clean(dataUrl);
  const match = coverDataUrlPattern.exec(text);

  if (!match) {
    return undefined;
  }

  const bytes = new Uint8Array(Buffer.from(match[2].replace(/\s/g, ""), "base64"));

  if (bytes.length === 0 || bytes.length > maxCoverBytes) {
    return undefined;
  }

  return {
    mimeType: match[1].toLowerCase(),
    bytes,
  };
}

export async function writeSongInfoToOriginalFile(
  sourcePath: string,
  draft: SongInfoWriteDraft,
) {
  if (!path.isAbsolute(sourcePath) || !isWritableSongInfoPath(sourcePath)) {
    return { ok: false, error: "這個音樂格式目前不支援寫回原始檔。" };
  }

  const fileStat = await stat(sourcePath);
  if (!fileStat.isFile()) {
    return { ok: false, error: "寫回原始檔失敗，原始檔未修改" };
  }

  const cover = decodeCoverDataUrl(draft.coverDataUrl);
  const tempPath = `${sourcePath}.aquariusgirl-${Date.now()}${path.extname(sourcePath)}`;

  try {
    const taglib = await TagLib.initialize();
    await taglib.copyWithTags(sourcePath, tempPath, createTagInputFromSongInfoDraft(draft));

    if (cover) {
      await taglib.edit(tempPath, (file) => {
        file.setPictures([
          {
            mimeType: cover.mimeType,
            data: cover.bytes,
            type: "FrontCover",
            description: "Front Cover",
          },
        ]);
      });
    }

    await chmod(tempPath, fileStat.mode);
    await rename(tempPath, sourcePath);
    return { ok: true };
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export async function readSongInfoFromOriginalFile(sourcePath: string) {
  if (!path.isAbsolute(sourcePath) || !isWritableSongInfoPath(sourcePath)) {
    return { ok: false, error: "這個音樂格式目前不支援重新讀取標籤。" };
  }

  const fileStat = await stat(sourcePath);
  if (!fileStat.isFile()) {
    return { ok: false, error: "重新讀取音樂標籤失敗，請確認原始檔仍可讀取。" };
  }

  const [tags, pictures] = await Promise.all([
    readTags(sourcePath),
    readPictures(sourcePath).catch(() => [] as Picture[]),
  ]);

  return {
    ok: true,
    metadata: createSongInfoDraftFromTagLib(tags, pictures),
  };
}
