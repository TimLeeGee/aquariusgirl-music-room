import { existsSync } from "node:fs";
import { chmod, rename, rm, stat } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  InvalidFormatError,
  TagLib,
  type AudioFile,
  type ExtendedTag,
  type LoadTagLibOptions,
  type Picture,
  type PropertyMap,
  type TagInput,
} from "taglib-wasm";

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
  coverHash?: unknown;
  coverBytes?: unknown;
};

const writableExtensions = new Set([".mp3", ".flac", ".m4a"]);
const coverDataUrlPattern = /^data:([^;]*);base64,([a-z0-9+/=\s]+)$/i;
// ponytail: keep this in sync with renderer cover validation; add shared config only if Electron starts consuming more renderer constants.
const maxCoverBytes = 5 * 1024 * 1024;
const coverMimeTypeAliases: Record<string, "image/jpeg" | "image/png"> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/png": "image/png",
  "image/x-png": "image/png",
};
const basicPropertyKeys: Record<
  string,
  keyof Pick<ExtendedTag, "title" | "artist" | "album" | "comment" | "genre" | "year" | "track">
> = {
  title: "title",
  artist: "artist",
  album: "album",
  comment: "comment",
  genre: "genre",
  date: "year",
  trackNumber: "track",
};
const tagLibPropertyKeyAliases: Record<string, string> = {
  TITLE: "title",
  ARTIST: "artist",
  ALBUM: "album",
  COMMENT: "comment",
  GENRE: "genre",
  DATE: "date",
  TRACKNUMBER: "trackNumber",
  TRACKTOTAL: "totalTracks",
  TOTALTRACKS: "totalTracks",
  DISCNUMBER: "discNumber",
  DISCTOTAL: "totalDiscs",
  TOTALDISCS: "totalDiscs",
  ALBUMARTIST: "albumArtist",
  ALBUM_ARTIST: "albumArtist",
  COMPOSER: "composer",
};
const numericFields = new Set(["year", "track", "discNumber", "totalTracks", "totalDiscs", "bpm"]);
const tagInputBasicFields = new Set(["title", "artist", "album", "comment", "genre", "year", "date", "track"]);
let tagLibPromise: Promise<TagLib> | undefined;

function getProcessResourcesPath() {
  return (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
}

export function resolvePackagedTagLibWasmUrl() {
  const wasmDir =
    process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR ??
    (getProcessResourcesPath() ? path.join(getProcessResourcesPath()!, "taglib-wasm") : "");
  const wasmPath = wasmDir ? path.join(wasmDir, "taglib-web.wasm") : "";

  return wasmPath && existsSync(wasmPath) ? pathToFileURL(wasmPath).href : undefined;
}

export function createTagLibLoadOptions(): LoadTagLibOptions | undefined {
  const wasmUrl = resolvePackagedTagLibWasmUrl();

  if (!wasmUrl) {
    return undefined;
  }

  // ponytail: one unpacked web wasm in buffer mode fixes packaged Windows path loading; revisit WASI only if profiling proves path-mode matters.
  return {
    wasmUrl,
    forceWasmType: "emscripten",
  };
}

function getTagLib() {
  if (!tagLibPromise) {
    tagLibPromise = TagLib.initialize(createTagLibLoadOptions()).catch((error) => {
      tagLibPromise = undefined;
      throw error;
    });
  }

  return tagLibPromise;
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toSupportedCoverMimeType(value: unknown) {
  const mimeType = clean(value).toLowerCase();

  return coverMimeTypeAliases[mimeType] ?? "";
}

export function createSongInfoWriterCoverHash(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function toCoverBytes(value: unknown) {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  if (
    Array.isArray(value) &&
    value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)
  ) {
    return new Uint8Array(value);
  }

  return undefined;
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

function parseNumeric(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isNaN(parsed) ? undefined : parsed;
}

function toSongInfoPropertyKey(key: string) {
  return tagLibPropertyKeyAliases[key.toUpperCase()] ?? key;
}

export function mapPropertiesToExtendedTag(props: PropertyMap) {
  const tag: Record<string, unknown> = {};

  for (const [rawKey, values] of Object.entries(props)) {
    const propKey = toSongInfoPropertyKey(rawKey);
    const tagField = basicPropertyKeys[propKey];

    if (!values || values.length === 0) {
      continue;
    }

    if (tagField === "year" || tagField === "track") {
      const parsed = parseNumeric(values[0]);

      if (parsed !== undefined) {
        tag[tagField] = parsed;
      }

      if (propKey === "date") {
        tag.date = values.length === 1 ? values[0] : values;
      }
    } else if (tagField) {
      tag[tagField] = values;
    } else if (numericFields.has(propKey)) {
      const parsed = parseNumeric(values[0]);

      if (parsed !== undefined) {
        tag[propKey] = parsed;
      }
    } else if (propKey === "compilation") {
      tag[propKey] = values[0] === "1";
    } else {
      tag[propKey] = values;
    }
  }

  return tag as ExtendedTag;
}

function readAudioFileTagsAndPictures(audioFile: AudioFile) {
  try {
    if (!audioFile.isValid()) {
      throw new InvalidFormatError("File may be corrupted or in an unsupported format");
    }

    return {
      tags: mapPropertiesToExtendedTag(audioFile.properties()),
      pictures: readPicturesSafely(audioFile),
    };
  } finally {
    audioFile.dispose();
  }
}

function shouldRetryFullTagRead(error: unknown) {
  return error instanceof InvalidFormatError;
}

async function readTagsAndPictures(sourcePath: string) {
  const taglib = await getTagLib();

  try {
    return readAudioFileTagsAndPictures(await taglib.open(sourcePath));
  } catch (error) {
    if (!shouldRetryFullTagRead(error)) {
      throw error;
    }

    if (process.env.NODE_ENV !== "production") {
      console.debug("[song-info] retry full tag read after partial read failed", { sourcePath });
    }

    // ponytail: taglib defaults to a 1MB partial header; big FLAC covers need one full retry.
    return readAudioFileTagsAndPictures(await taglib.open(sourcePath, { partial: false }));
  }
}

function readPicturesSafely(audioFile: AudioFile) {
  try {
    return audioFile.getPictures();
  } catch {
    return [] as Picture[];
  }
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

function createPropertyMapFromTagInput(input: Partial<TagInput>): PropertyMap {
  const props: PropertyMap = {};

  for (const field of ["title", "artist", "album", "comment", "genre"] as const) {
    const value = input[field];
    if (value !== undefined) {
      props[field] = Array.isArray(value) ? value : [value];
    }
  }

  if (input.year !== undefined) {
    props.date = [String(input.year)];
  }

  if (input.date !== undefined) {
    props.date = Array.isArray(input.date) ? input.date : [input.date];
  }

  if (input.track !== undefined) {
    props.trackNumber = [String(input.track)];
  }

  for (const [field, value] of Object.entries(input)) {
    if (tagInputBasicFields.has(field) || value === undefined) {
      continue;
    }

    if (field === "compilation") {
      props[field] = [value ? "1" : "0"];
    } else if (numericFields.has(field)) {
      props[field] = [String(value)];
    } else if (typeof value === "string") {
      props[field] = [value];
    } else if (Array.isArray(value)) {
      props[field] = value;
    }
  }

  return props;
}

function applySongInfoDraftToAudioFile(audioFile: AudioFile, draft: SongInfoWriteDraft) {
  // ponytail: taglib-wasm does not export mergeTagUpdates; keep the tiny local mapper until it does.
  audioFile.setProperties({
    ...audioFile.properties(),
    ...createPropertyMapFromTagInput(createTagInputFromSongInfoDraft(draft)),
  });
}

export function createSongInfoDraftFromTagLib(tags: ExtendedTag, pictures: Picture[] = []) {
  const cover =
    pictures.find((picture) => picture.type === "FrontCover") ??
    pictures.find((picture) => picture.mimeType === "image/jpeg" || picture.mimeType === "image/png");
  const year = firstTagValue(tags.date).slice(0, 4) || (tags.year ? String(tags.year) : "");
  const coverMimeType = toSupportedCoverMimeType(cover?.mimeType);
  const coverDataUrl =
    cover &&
    coverMimeType &&
    cover.data.byteLength <= maxCoverBytes
      ? `data:${coverMimeType};base64,${Buffer.from(cover.data).toString("base64")}`
      : undefined;
  const coverHash = cover && coverDataUrl ? createSongInfoWriterCoverHash(cover.data) : undefined;

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
    coverHash,
  };
}

export function decodeCoverDataUrl(dataUrl: unknown, fallbackMimeType?: unknown) {
  const text = clean(dataUrl);
  const match = coverDataUrlPattern.exec(text);

  if (!match) {
    return undefined;
  }

  const dataUrlMimeType = toSupportedCoverMimeType(match[1]);
  const fallback = toSupportedCoverMimeType(fallbackMimeType);
  const rawMimeType = clean(match[1]).toLowerCase();
  const mimeType =
    dataUrlMimeType ||
    (!rawMimeType || rawMimeType === "application/octet-stream" ? fallback : "");

  if (!mimeType) {
    return undefined;
  }

  const bytes = new Uint8Array(Buffer.from(match[2].replace(/\s/g, ""), "base64"));

  if (bytes.length === 0 || bytes.length > maxCoverBytes) {
    return undefined;
  }

  return {
    mimeType,
    bytes,
    hash: createSongInfoWriterCoverHash(bytes),
  };
}

function decodeCoverDraft(draft: SongInfoWriteDraft) {
  const coverBytes = toCoverBytes(draft.coverBytes);
  const coverMimeType = toSupportedCoverMimeType(draft.coverMimeType);

  if (coverBytes && coverMimeType && coverBytes.length > 0 && coverBytes.length <= maxCoverBytes) {
    return {
      mimeType: coverMimeType,
      bytes: coverBytes,
      hash: createSongInfoWriterCoverHash(coverBytes),
    };
  }

  return decodeCoverDataUrl(draft.coverDataUrl, draft.coverMimeType);
}

const fileLockErrorCodes = new Set(["EPERM", "EBUSY", "EACCES"]);

export function isFileLockError(error: unknown) {
  return fileLockErrorCodes.has((error as NodeJS.ErrnoException)?.code ?? "");
}

async function renameWithRetry(tempPath: string, sourcePath: string) {
  // ponytail: Windows AV scanners / straggler handles briefly lock the target; 3 tries x 150ms covers it.
  // Escalate to copy-into-place only if users still report lock failures after the renderer releases its handle.
  for (let attempt = 0; ; attempt++) {
    try {
      return await rename(tempPath, sourcePath);
    } catch (error) {
      if (attempt >= 2 || !isFileLockError(error)) {
        throw error;
      }

      await delay(150);
    }
  }
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

  const cover = decodeCoverDraft(draft);
  const tempPath = `${sourcePath}.aquariusgirl-${Date.now()}${path.extname(sourcePath)}`;

  try {
    const taglib = await getTagLib();
    const audioFile = await taglib.open(sourcePath, { partial: false });

    try {
      if (!audioFile.isValid()) {
        throw new InvalidFormatError("File may be corrupted or in an unsupported format");
      }

      applySongInfoDraftToAudioFile(audioFile, draft);

      if (cover) {
        // ponytail: one full-load save avoids partial + second edit corrupting large FLAC picture blocks.
        audioFile.setPictures([
          {
            mimeType: cover.mimeType,
            data: cover.bytes,
            type: "FrontCover",
            description: "Front Cover",
          },
        ]);
      }

      await audioFile.saveToFile(tempPath);
    } finally {
      audioFile.dispose();
    }

    await chmod(tempPath, fileStat.mode);
    await renameWithRetry(tempPath, sourcePath);
    return cover ? { ok: true, receivedCoverHash: cover.hash } : { ok: true };
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => undefined);

    if (isFileLockError(error)) {
      // ponytail: lock error after retries means something still holds the file (playback handle / AV); tell the user instead of a generic failure.
      return { ok: false, error: "原始檔正被其他程式使用中，請暫停播放後再試一次。原始檔未修改。" };
    }

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

  const { tags, pictures } = await readTagsAndPictures(sourcePath);

  return {
    ok: true,
    metadata: createSongInfoDraftFromTagLib(tags, pictures),
  };
}
