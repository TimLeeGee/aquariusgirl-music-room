import { useCallback, useEffect, useRef, useState } from "react";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import {
  clearTrackMetadata,
  deleteTrackMetadata,
  getMusicSourcePaths,
  getTrackMetadata,
  patchTrackDuration,
  patchTrackPlayback,
  putManyTrackMetadata,
  putTrackMetadata,
  replaceAllTrackMetadata,
  savePlaylists,
  toStoredTrackMetadata,
  type StoredTrackMetadata,
} from "../storage/indexedDb";

export function useMusicLibraryDb(playlists: Playlist[]) {
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

  const replaceAllTracks = useCallback((tracksSnapshot: Track[]) => {
    setStoredTracks(tracksSnapshot.map(toStoredTrackMetadata));

    const saveTask = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => replaceAllTrackMetadata(tracksSnapshot));

    trackSaveQueueRef.current = saveTask.catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track save failed");
    });

    return saveTask;
  }, []);

  const putTrack = useCallback((track: Track) => {
    setStoredTracks((current) => {
      const storedTrack = toStoredTrackMetadata(track);
      const next = current.filter((item) => item.id !== storedTrack.id);
      return [...next, storedTrack];
    });

    const saveTask = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => putTrackMetadata(track));

    trackSaveQueueRef.current = saveTask.catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track save failed");
    });

    return saveTask;
  }, []);

  const putManyTracks = useCallback((tracksSnapshot: Track[]) => {
    if (tracksSnapshot.length === 0) {
      return Promise.resolve();
    }

    setStoredTracks((current) => {
      const nextById = new Map(current.map((track) => [track.id, track]));
      tracksSnapshot.map(toStoredTrackMetadata).forEach((track) => nextById.set(track.id, track));
      return Array.from(nextById.values());
    });

    const saveTask = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => putManyTrackMetadata(tracksSnapshot));

    trackSaveQueueRef.current = saveTask.catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track save failed");
    });

    return saveTask;
  }, []);

  const patchPlayback = useCallback(
    (trackId: string, patch: { playCount?: number; lastPlayedAt?: number }) => {
      setStoredTracks((current) =>
        current.map((track) => (track.id === trackId ? { ...track, ...patch } : track)),
      );

      const saveTask = trackSaveQueueRef.current
        .catch(() => undefined)
        .then(() => patchTrackPlayback(trackId, patch));

      trackSaveQueueRef.current = saveTask.then(() => undefined).catch((error) => {
        setDbError(error instanceof Error ? error.message : "IndexedDB playback patch failed");
      });

      return saveTask;
    },
    [],
  );

  const patchDuration = useCallback((trackId: string, duration: number) => {
    setStoredTracks((current) =>
      current.map((track) => (track.id === trackId ? { ...track, duration } : track)),
    );

    const saveTask = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => patchTrackDuration(trackId, duration));

    trackSaveQueueRef.current = saveTask.then(() => undefined).catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB duration patch failed");
    });

    return saveTask;
  }, []);

  const deleteTrack = useCallback((trackId: string) => {
    setStoredTracks((current) => current.filter((track) => track.id !== trackId));

    const saveTask = trackSaveQueueRef.current
      .catch(() => undefined)
      .then(() => deleteTrackMetadata(trackId));

    trackSaveQueueRef.current = saveTask.catch((error) => {
      setDbError(error instanceof Error ? error.message : "IndexedDB track delete failed");
    });

    return saveTask;
  }, []);

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
    putTrackMetadata: putTrack,
    putManyTrackMetadata: putManyTracks,
    patchTrackPlayback: patchPlayback,
    patchTrackDuration: patchDuration,
    deleteTrackMetadata: deleteTrack,
    replaceAllTrackMetadata: replaceAllTracks,
    clearStoredTracks,
    dbError,
  };
}
