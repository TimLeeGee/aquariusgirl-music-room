import { useCallback, useEffect, useRef, useState } from "react";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import {
  clearTrackMetadata,
  getMusicSourcePaths,
  getTrackMetadata,
  savePlaylists,
  saveTrackMetadata,
  toStoredTrackMetadata,
  type StoredTrackMetadata,
} from "../storage/indexedDb";

export function useMusicLibraryDb(tracks: Track[], playlists: Playlist[]) {
  const [storedTracks, setStoredTracks] = useState<StoredTrackMetadata[]>([]);
  const [musicSourcePaths, setMusicSourcePaths] = useState<string[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const trackSaveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    void Promise.all([getTrackMetadata(), getMusicSourcePaths()])
      .then(([nextStoredTracks, nextMusicSourcePaths]) => {
        setStoredTracks(nextStoredTracks);
        setMusicSourcePaths(nextMusicSourcePaths);
      })
      .catch((error) => {
        setDbError(error instanceof Error ? error.message : "IndexedDB read failed");
      });
  }, []);

  const saveTracksNow = useCallback((tracksSnapshot: Track[]) => {
    setStoredTracks(tracksSnapshot.map(toStoredTrackMetadata));

    const saveTask = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => saveTrackMetadata(tracksSnapshot));

    trackSaveQueueRef.current = saveTask.catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track save failed");
    });

    return saveTask;
  }, []);

  useEffect(() => {
    if (tracks.length === 0) {
      return;
    }

    void saveTracksNow(tracks);
  }, [saveTracksNow, tracks]);

  useEffect(() => {
    void savePlaylists(playlists).catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB playlist save failed");
    });
  }, [playlists]);

  const clearStoredTracks = useCallback(() => {
    setStoredTracks([]);
    trackSaveQueueRef.current = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => clearTrackMetadata())
      .catch((error) => {
        setDbError(error instanceof Error ? error.message : "IndexedDB track clear failed");
      });
  }, []);

  return {
    storedTracks,
    musicSourcePaths,
    saveTracksNow,
    clearStoredTracks,
    dbError,
  };
}
