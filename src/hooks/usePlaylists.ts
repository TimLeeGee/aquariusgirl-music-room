import { useCallback, useEffect, useMemo } from "react";
import type {
  NormalPlaylist,
  Playlist,
  SmartPlaylist,
  StoredPlaylist,
} from "../types/playlist";
import { SYSTEM_PLAYLIST_IDS, isTrackListPlaylist } from "../types/playlist";
import type { Track } from "../types/track";
import { evaluateSmartPlaylist } from "../utils/evaluateSmartPlaylist";
import { STORAGE_KEYS, useLocalStorage } from "./useLocalStorage";

const systemPlaylistIdSet = new Set<string>(Object.values(SYSTEM_PLAYLIST_IDS));
const retiredSeededPlaylistNames = new Set([
  "睡前小水波",
  "罐子閃亮 Cover",
  "狐狸女孩元氣歌",
]);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createSystemPlaylists(now = Date.now()): Playlist[] {
  return [
    {
      id: SYSTEM_PLAYLIST_IDS.all,
      name: "全部歌曲",
      trackIds: [],
      createdAt: now,
      updatedAt: now,
      type: "system",
    },
    {
      id: SYSTEM_PLAYLIST_IDS.liked,
      name: "我喜歡的歌曲",
      trackIds: [],
      liked: true,
      createdAt: now,
      updatedAt: now,
      type: "system",
    },
  ];
}

function normalizeStoredPlaylist(playlist: Playlist): StoredPlaylist | null {
  const playlistType = (playlist as { type?: string }).type;

  if (!playlist?.name?.trim()) {
    return null;
  }

  if (
    playlistType === "system" ||
    playlistType === "folder" ||
    systemPlaylistIdSet.has(playlist.id)
  ) {
    return null;
  }

  // Migration: remove old seeded default playlists from earlier prototypes.
  // This uses exact title matching and keeps all user-created playlists intact.
  if (retiredSeededPlaylistNames.has(playlist.name.trim())) {
    return null;
  }

  const now = Date.now();
  const base = {
    id: playlist.id && !systemPlaylistIdSet.has(playlist.id) ? playlist.id : createId("playlist"),
    name: playlist.name.trim(),
    description: playlist.description,
    parentId: playlist.parentId ?? null,
    createdAt: Number.isFinite(playlist.createdAt) ? playlist.createdAt : now,
    updatedAt: Number.isFinite(playlist.updatedAt) ? playlist.updatedAt : now,
  };

  if (playlist.type === "smart") {
    return {
      ...base,
      type: "smart",
      match: playlist.match === "any" ? "any" : "all",
      rules: Array.isArray(playlist.rules) ? playlist.rules : [],
      excludedTrackIds: Array.isArray(playlist.excludedTrackIds)
        ? playlist.excludedTrackIds.filter((id): id is string => typeof id === "string")
        : [],
      sortBy: playlist.sortBy ?? "title",
      sortDirection: playlist.sortDirection === "desc" ? "desc" : "asc",
      limit: typeof playlist.limit === "number" ? playlist.limit : null,
    };
  }

  const trackIds = (playlist as { trackIds?: unknown }).trackIds;

  return {
    ...base,
    type: "normal",
    trackIds: Array.isArray(trackIds)
      ? trackIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

function normalizeStoredPlaylists(playlists: Playlist[]) {
  return playlists
    .map(normalizeStoredPlaylist)
    .filter((playlist): playlist is StoredPlaylist => Boolean(playlist));
}

function samePlaylists(a: StoredPlaylist[], b: StoredPlaylist[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function usePlaylists(tracks: Track[]) {
  const [storedPlaylists, setStoredPlaylists] = useLocalStorage<StoredPlaylist[]>(
    STORAGE_KEYS.playlists,
    [],
  );
  const [activePlaylistId, setActivePlaylistId] = useLocalStorage<string>(
    STORAGE_KEYS.activePlaylistId,
    SYSTEM_PLAYLIST_IDS.all,
  );

  const normalizedStoredPlaylists = useMemo(
    () => normalizeStoredPlaylists(storedPlaylists as Playlist[]),
    [storedPlaylists],
  );

  useEffect(() => {
    if (!samePlaylists(storedPlaylists, normalizedStoredPlaylists)) {
      setStoredPlaylists(normalizedStoredPlaylists);
    }
  }, [normalizedStoredPlaylists, setStoredPlaylists, storedPlaylists]);

  const systemPlaylists = useMemo(() => {
    const trackIds = tracks.map((track) => track.id);
    const likedTrackIds = tracks.filter((track) => track.liked).map((track) => track.id);

    return createSystemPlaylists().map((playlist) => {
      if (playlist.id === SYSTEM_PLAYLIST_IDS.all) return { ...playlist, trackIds };
      if (playlist.id === SYSTEM_PLAYLIST_IDS.liked) return { ...playlist, trackIds: likedTrackIds };
      return playlist;
    });
  }, [tracks]);

  const smartPlaylistTrackIds = useMemo(() => {
    return Object.fromEntries(
      normalizedStoredPlaylists
        .filter((playlist): playlist is SmartPlaylist => playlist.type === "smart")
        .map((playlist) => [
          playlist.id,
          evaluateSmartPlaylist(playlist, tracks).map((track) => track.id),
        ]),
    );
  }, [normalizedStoredPlaylists, tracks]);

  const playlistTrackIdsById = useMemo(() => {
    const entries = [...systemPlaylists, ...normalizedStoredPlaylists].map((playlist) => {
      if (isTrackListPlaylist(playlist)) {
        return [playlist.id, playlist.trackIds] as const;
      }
      if (playlist.type === "smart") {
        return [playlist.id, smartPlaylistTrackIds[playlist.id] ?? []] as const;
      }

      const exhaustive: never = playlist;
      return [exhaustive, []] as const;
    });

    return Object.fromEntries(entries);
  }, [normalizedStoredPlaylists, smartPlaylistTrackIds, systemPlaylists]);

  const playlists = useMemo(
    () => [...systemPlaylists, ...normalizedStoredPlaylists],
    [normalizedStoredPlaylists, systemPlaylists],
  );

  useEffect(() => {
    if (!playlists.some((playlist) => playlist.id === activePlaylistId)) {
      setActivePlaylistId(SYSTEM_PLAYLIST_IDS.all);
    }
  }, [activePlaylistId, playlists, setActivePlaylistId]);

  const createPlaylist = useCallback(
    (name = "未命名播放清單", parentId: string | null = null) => {
      const now = Date.now();
      const playlist: NormalPlaylist = {
        id: createId("playlist"),
        name: name.trim() || "未命名播放清單",
        trackIds: [],
        parentId,
        createdAt: now,
        updatedAt: now,
        type: "normal",
      };
      setStoredPlaylists((current) => [...current, playlist]);
      setActivePlaylistId(playlist.id);
      return playlist;
    },
    [setActivePlaylistId, setStoredPlaylists],
  );

  const createSmartPlaylist = useCallback(
    (input: Omit<SmartPlaylist, "id" | "createdAt" | "updatedAt" | "type">) => {
      const now = Date.now();
      const playlist: SmartPlaylist = {
        ...input,
        id: createId("smart-playlist"),
        type: "smart",
        createdAt: now,
        updatedAt: now,
      };
      setStoredPlaylists((current) => [...current, playlist]);
      setActivePlaylistId(playlist.id);
      return playlist;
    },
    [setActivePlaylistId, setStoredPlaylists],
  );

  const renamePlaylist = useCallback((playlistId: string, name: string) => {
    setStoredPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, name, updatedAt: Date.now() }
          : playlist,
      ),
    );
  }, [setStoredPlaylists]);

  const deletePlaylist = useCallback((playlistId: string) => {
    setStoredPlaylists((current) =>
      current
        .filter((playlist) => playlist.id !== playlistId)
        .map((playlist) =>
          playlist.parentId === playlistId
            ? { ...playlist, parentId: null, updatedAt: Date.now() }
            : playlist,
        ),
    );
    setActivePlaylistId(SYSTEM_PLAYLIST_IDS.all);
  }, [setActivePlaylistId, setStoredPlaylists]);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setStoredPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId && playlist.type === "normal"
          ? {
              ...playlist,
              trackIds: [...playlist.trackIds, trackId],
              updatedAt: Date.now(),
            }
          : playlist,
      ),
    );
  }, [setStoredPlaylists]);

  const removeTrackFromPlaylist = useCallback((
    playlistId: string,
    trackId: string,
    occurrenceIndex?: number,
  ) => {
    setStoredPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId || playlist.type !== "normal") {
          return playlist;
        }

        const targetIndex =
          typeof occurrenceIndex === "number"
            ? occurrenceIndex
            : playlist.trackIds.findIndex((item) => item === trackId);

        if (targetIndex < 0 || playlist.trackIds[targetIndex] !== trackId) {
          return playlist;
        }

        return {
          ...playlist,
          trackIds: playlist.trackIds.filter((_, index) => index !== targetIndex),
          updatedAt: Date.now(),
        };
      }),
    );
  }, [setStoredPlaylists]);

  const excludeTrackFromSmartPlaylist = useCallback((playlistId: string, trackId: string) => {
    setStoredPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId && playlist.type === "smart"
          ? {
              ...playlist,
              // ponytail: One saved exclusion keeps smart rules dynamic without cloning a static track list.
              excludedTrackIds: Array.from(new Set([...(playlist.excludedTrackIds ?? []), trackId])),
              updatedAt: Date.now(),
            }
          : playlist,
      ),
    );
  }, [setStoredPlaylists]);

  const removeTrackFromAllPlaylists = useCallback((trackId: string) => {
    setStoredPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.type !== "normal" || !playlist.trackIds.includes(trackId)) {
          return playlist;
        }

        return {
          ...playlist,
          // ponytail: Library delete owns cleanup; smart playlists recalculate from tracks.
          trackIds: playlist.trackIds.filter((item) => item !== trackId),
          updatedAt: Date.now(),
        };
      }),
    );
  }, [setStoredPlaylists]);

  const moveTrackInPlaylist = useCallback((playlistId: string, fromIndex: number, toIndex: number) => {
    setStoredPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId || playlist.type !== "normal") {
          return playlist;
        }

        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= playlist.trackIds.length ||
          toIndex >= playlist.trackIds.length
        ) {
          return playlist;
        }

        const trackIds = [...playlist.trackIds];
        const [movedTrackId] = trackIds.splice(fromIndex, 1);
        trackIds.splice(toIndex, 0, movedTrackId);

        return {
          ...playlist,
          trackIds,
          updatedAt: Date.now(),
        };
      }),
    );
  }, [setStoredPlaylists]);

  const mergeImportedPlaylists = useCallback((importedPlaylists: Playlist[]) => {
    const now = Date.now();
    setStoredPlaylists((current) => {
      const existingIds = new Set(current.map((playlist) => playlist.id));
      const nextPlaylists = normalizeStoredPlaylists(importedPlaylists)
        .filter((playlist) => playlist.name?.trim())
        .map((playlist, index) => {
          const requestedId =
            playlist.id && !systemPlaylistIdSet.has(playlist.id)
              ? playlist.id
              : `playlist-import-${now}-${index}`;
          const id = existingIds.has(requestedId)
            ? `${requestedId}-import-${now}-${index}`
            : requestedId;
          existingIds.add(id);

          return {
            ...playlist,
            id,
            name: id === playlist.id ? playlist.name : `${playlist.name}（匯入）`,
            updatedAt: now,
          };
        });

      return [...current, ...nextPlaylists];
    });
  }, [setStoredPlaylists]);

  const activePlaylist =
    playlists.find((playlist) => playlist.id === activePlaylistId) ?? playlists[0];
  const activeTrackIds = playlistTrackIdsById[activePlaylist?.id ?? ""] ?? [];

  return {
    playlists,
    userPlaylists: normalizedStoredPlaylists,
    activePlaylist,
    activePlaylistId,
    activeTrackIds,
    playlistTrackIdsById,
    setActivePlaylistId,
    createPlaylist,
    createSmartPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    excludeTrackFromSmartPlaylist,
    removeTrackFromAllPlaylists,
    moveTrackInPlaylist,
    mergeImportedPlaylists,
  };
}
