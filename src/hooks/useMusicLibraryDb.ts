import { useCallback, useEffect, useState } from "react";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import {
  clearTrackMetadata,
  getTrackMetadata,
  savePlaylists,
  saveTrackMetadata,
  toStoredTrackMetadata,
  type StoredTrackMetadata,
} from "../storage/indexedDb";

export function useMusicLibraryDb(tracks: Track[], playlists: Playlist[]) {
  const [storedTracks, setStoredTracks] = useState<StoredTrackMetadata[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    void getTrackMetadata()
      .then(setStoredTracks)
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

  const clearStoredTracks = useCallback(() => {
    setStoredTracks([]);
    void clearTrackMetadata().catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track clear failed");
    });
  }, []);

  return {
    storedTracks,
    clearStoredTracks,
    dbError,
  };
}
