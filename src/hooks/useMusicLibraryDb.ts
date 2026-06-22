import { useCallback, useEffect, useState } from "react";
import type { TrackLyrics } from "../types/lyrics";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import {
  clearTrackMetadata,
  getLyrics,
  getPlaylists,
  getTrackMetadata,
  saveLyrics,
  savePlaylists,
  saveTrackMetadata,
  toStoredTrackMetadata,
  type StoredTrackMetadata,
} from "../storage/indexedDb";

export function useMusicLibraryDb(tracks: Track[], playlists: Playlist[]) {
  const [storedTracks, setStoredTracks] = useState<StoredTrackMetadata[]>([]);
  const [storedLyrics, setStoredLyrics] = useState<Record<string, TrackLyrics>>({});
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([getTrackMetadata(), getLyrics(), getPlaylists()])
      .then(([trackMetadata, lyrics]) => {
        setStoredTracks(trackMetadata);
        setStoredLyrics(
          Object.fromEntries(lyrics.map((item) => [item.trackId, item])),
        );
      })
      .catch((error) => {
        setDbError(error instanceof Error ? error.message : "IndexedDB read failed");
      });
  }, []);

  useEffect(() => {
    if (tracks.length === 0) {
      return;
    }

    setStoredTracks(tracks.map(toStoredTrackMetadata));
    void saveTrackMetadata(tracks).catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track save failed");
    });
  }, [tracks]);

  useEffect(() => {
    void savePlaylists(playlists).catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB playlist save failed");
    });
  }, [playlists]);

  const persistLyrics = useCallback((lyrics: TrackLyrics) => {
    setStoredLyrics((current) => ({ ...current, [lyrics.trackId]: lyrics }));
    void saveLyrics(lyrics).catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB lyrics save failed");
    });
  }, []);

  const clearStoredTracks = useCallback(() => {
    setStoredTracks([]);
    void clearTrackMetadata().catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track clear failed");
    });
  }, []);

  return {
    storedTracks,
    storedLyrics,
    persistLyrics,
    clearStoredTracks,
    dbError,
  };
}
