import { useCallback, useEffect, useState, type SetStateAction } from "react";

export const STORAGE_KEYS = {
  volume: "aquariusgirl.musicRoom.volume",
  repeatMode: "aquariusgirl.musicRoom.repeatMode",
  shuffle: "aquariusgirl.musicRoom.shuffle",
  likedTrackNames: "aquariusgirl.musicRoom.likedTrackNames",
  sortMode: "aquariusgirl.musicRoom.sortMode",
  onboardingCompleted: "aquariusgirl.musicRoom.onboardingCompleted",
  visualizerEnabled: "aquariusgirl.musicRoom.visualizerEnabled",
  playlists: "aquariusgirl.musicRoom.userPlaylists",
  activePlaylistId: "aquariusgirl.musicRoom.activePlaylistId",
  miniPlayerSettings: "aquariusgirl.musicRoom.miniPlayerSettings",
  windowBoundsState: "aquariusgirl.musicRoom.windowBoundsState",
  audioVisualizerSettings: "aquariusgirl.musicRoom.audioVisualizerSettings",
  themeColorSettings: "aquariusgirl.musicRoom.themeColorSettings",
  textOverrideSettings: "aquariusgirl.musicRoom.textOverrideSettings",
} as const;

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((nextValue: SetStateAction<T>) => {
    setValue((currentValue) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previousValue: T) => T)(currentValue)
          : nextValue;

      if (typeof window !== "undefined") {
        try {
          // ponytail: write-through keeps the last playlist click if Electron quits before effects run.
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          // The player can still run when storage is unavailable or full.
        }
      }

      return resolvedValue;
    });
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The player can still run when storage is unavailable or full.
    }
  }, [key, value]);

  return [value, setStoredValue] as const;
}
