import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";

const DB_NAME = "aquariusgirl-music-room";
const DB_VERSION = 1;
const MUSIC_SOURCE_PATHS_KEY = "music-source-paths";
const FULL_TRACK_SAVE_WINDOW_MS = 5000;
// ponytail: 不升版清除已退役的資料 store，避免破壞使用者資料；只有明確要求清理儲存空間時才加 migration。

export type StoredTrackMetadata = Omit<
  Track,
  "file" | "localUrl" | "coverUrl" | "artworkUrl"
> & {
  fileName: string;
};

type StoreName = "tracks" | "playlists" | "settings" | "handles";
type TrackPlaybackPatch = Pick<StoredTrackMetadata, "lastPlayedAt" | "playCount">;

let fullTrackSaveTimestamps: number[] = [];

function warnIfRepeatedFullTrackWrite(reason: string) {
  const now = Date.now();
  fullTrackSaveTimestamps = [...fullTrackSaveTimestamps, now].filter(
    (timestamp) => now - timestamp <= FULL_TRACK_SAVE_WINDOW_MS,
  );

  if (fullTrackSaveTimestamps.length > 1) {
    console.warn(
      `[Aquariusgirl] ${reason} called more than once in ${FULL_TRACK_SAVE_WINDOW_MS / 1000}s; check for a metadata save loop.`,
    );
  }
}

function openLibraryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("tracks")) {
        db.createObjectStore("tracks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("playlists")) {
        db.createObjectStore("playlists", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("handles")) {
        db.createObjectStore("handles", { keyPath: "key" });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
) {
  const db = await openLibraryDb();

  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = run(store);

    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }

    transaction.oncomplete = () => {
      db.close();
      if (!request) {
        resolve(undefined);
      }
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export function toStoredTrackMetadata(track: Track): StoredTrackMetadata {
  const { file, localUrl, coverUrl, artworkUrl, ...metadata } = track;

  return {
    ...metadata,
    fileName: file?.name ?? track.name,
  };
}

async function patchStoredTrack(
  trackId: string,
  createNextTrack: (track: StoredTrackMetadata) => StoredTrackMetadata,
) {
  const db = await openLibraryDb();

  return new Promise<StoredTrackMetadata | undefined>((resolve, reject) => {
    const transaction = db.transaction("tracks", "readwrite");
    const store = transaction.objectStore("tracks");
    const request = store.get(trackId);
    let nextTrack: StoredTrackMetadata | undefined;

    request.onsuccess = () => {
      const currentTrack = request.result as StoredTrackMetadata | undefined;
      if (!currentTrack) return;
      nextTrack = createNextTrack(currentTrack);
      store.put(nextTrack);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      resolve(nextTrack);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getTrackMetadataById(trackId: string) {
  return await withStore<StoredTrackMetadata>("tracks", "readonly", (store) =>
    store.get(trackId),
  );
}

export async function getTrackMetadataBySourcePath(sourcePath: string) {
  const tracks = await getTrackMetadata();
  return tracks.find((track) => track.sourcePath === sourcePath);
}

export async function putTrackMetadata(track: Track) {
  await withStore("tracks", "readwrite", (store) => {
    store.put(toStoredTrackMetadata(track));
  });
}

export async function putManyTrackMetadata(tracks: Track[]) {
  await withStore("tracks", "readwrite", (store) => {
    tracks.map(toStoredTrackMetadata).forEach((track) => store.put(track));
  });
}

export async function patchTrackMetadata(
  trackId: string,
  patch: Partial<StoredTrackMetadata>,
) {
  const hasCoverDataUrlPatch = Object.prototype.hasOwnProperty.call(patch, "coverDataUrl");

  return await patchStoredTrack(trackId, (track) => ({
    ...track,
    ...patch,
    coverDataUrl: hasCoverDataUrlPatch ? patch.coverDataUrl : track.coverDataUrl,
  }));
}

export async function patchTrackPlayback(trackId: string, patch: TrackPlaybackPatch) {
  return await patchStoredTrack(trackId, (track) => ({
    ...track,
    lastPlayedAt: patch.lastPlayedAt,
    playCount: patch.playCount,
  }));
}

export async function patchTrackDuration(trackId: string, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return undefined;
  }

  return await patchStoredTrack(trackId, (track) => ({
    ...track,
    duration,
  }));
}

export async function deleteTrackMetadata(trackId: string) {
  await withStore("tracks", "readwrite", (store) => {
    store.delete(trackId);
  });
}

export async function replaceAllTrackMetadata(tracks: Track[]) {
  warnIfRepeatedFullTrackWrite("replaceAllTrackMetadata");
  await withStore("tracks", "readwrite", (store) => {
    store.clear();
    tracks.map(toStoredTrackMetadata).forEach((track) => store.put(track));
  });
}

export async function saveTrackMetadata(tracks: Track[]) {
  // 僅限整庫重建，不可在一般 tracks state change 中呼叫。
  await replaceAllTrackMetadata(tracks);
}

export async function getTrackMetadata() {
  return (await withStore<StoredTrackMetadata[]>("tracks", "readonly", (store) =>
    store.getAll(),
  )) ?? [];
}

export async function clearTrackMetadata() {
  warnIfRepeatedFullTrackWrite("clearTrackMetadata");
  await withStore("tracks", "readwrite", (store) => {
    store.clear();
  });
}

export async function savePlaylists(playlists: Playlist[]) {
  await withStore("playlists", "readwrite", (store) => {
    // Keep IndexedDB in sync with the current playlist store, including migrations
    // that remove retired seeded playlists from earlier prototypes.
    store.clear();
    playlists.forEach((playlist) => store.put(playlist));
  });
}

export async function saveSetting<T>(key: string, value: T) {
  await withStore("settings", "readwrite", (store) => store.put({ key, value }));
}

export async function getSetting<T>(key: string) {
  const result = await withStore<{ key: string; value: T }>("settings", "readonly", (store) =>
    store.get(key),
  );
  return result?.value;
}

export async function saveMusicSourcePaths(sourcePaths: string[]) {
  const cleanPaths = Array.from(
    new Set(sourcePaths.map((sourcePath) => sourcePath.trim()).filter(Boolean)),
  );
  await saveSetting(MUSIC_SOURCE_PATHS_KEY, cleanPaths);
}

export async function getMusicSourcePaths() {
  const value = await getSetting<unknown>(MUSIC_SOURCE_PATHS_KEY);
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle) {
  await withStore("handles", "readwrite", (store) =>
    store.put({ key: "music-directory", handle }),
  );
}

export async function getDirectoryHandle() {
  const result = await withStore<{ key: string; handle: FileSystemDirectoryHandle }>(
    "handles",
    "readonly",
    (store) => store.get("music-directory"),
  );
  return result?.handle;
}
