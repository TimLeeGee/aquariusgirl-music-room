import type { Playlist } from "../types/playlist";
import type {
  AudioVisualizerSettings,
  MiniPlayerSettings,
  ThemeColorSettings,
} from "../types/settings";
import type { RepeatMode, SortMode, Track } from "../types/track";
import { toStoredTrackMetadata } from "../storage/indexedDb";

export type ExportSettingsInput = {
  tracks: Track[];
  playlists: Playlist[];
  volume: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  sortMode: SortMode;
  audioVisualizerSettings: AudioVisualizerSettings;
  miniPlayerSettings: MiniPlayerSettings;
  themeColorSettings: ThemeColorSettings;
};

export function createExportPayload(input: ExportSettingsInput) {
  return {
    app: "Aquariusgirl Music Room",
    appVersion: "0.1.15",
    exportedAt: new Date().toISOString(),
    playlists: input.playlists,
    trackMetadata: input.tracks.map(toStoredTrackMetadata),
    preferences: {
      volume: input.volume,
      repeatMode: input.repeatMode,
      shuffle: input.shuffle,
      sortMode: input.sortMode,
      audioVisualizerSettings: input.audioVisualizerSettings,
      miniPlayerSettings: {
        ...input.miniPlayerSettings,
        enabled: false,
      },
      themeColorSettings: input.themeColorSettings,
    },
    theme: {
      brand: "Aquariusgirl",
    },
  };
}

export function getExportFileName(date = new Date()) {
  return `aquariusgirl-music-room-backup-${date.toISOString().slice(0, 10)}.json`;
}

export function downloadJsonFile(fileName: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
