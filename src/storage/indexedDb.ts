import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";

const DB_NAME = "aquariusgirl-music-room";
const DB_VERSION = 1;
const MUSIC_SOURCE_PATHS_KEY = "music-source-paths";
// ponytail: 不升版清除已退役的資料 store，避免破壞使用者資料；只有明確要求清理儲存空間時才加 migration。

export type StoredTrackMetadata = Omit<
  Track,
  "file" | "localUrl" | "coverUrl" | "artworkUrl"
> & {
  fileName: string;
};

type StoreName = "tracks" | "playlists" | "settings" | "handles";

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

export async function saveTrackMetadata(tracks: Track[]) {
  await withStore("tracks", "readwrite", (store) => {
    store.clear();
    tracks.map(toStoredTrackMetadata).forEach((track) => store.put(track));
  });
}

export async function getTrackMetadata() {
  return (await withStore<StoredTrackMetadata[]>("tracks", "readonly", (store) =>
    store.getAll(),
  )) ?? [];
}

export async function clearTrackMetadata() {
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
