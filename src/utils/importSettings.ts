import type { TrackLyrics } from "../types/lyrics";
import type { Playlist } from "../types/playlist";

export type ImportedTrackMetadata = {
  id?: string;
  fileName?: string;
  name?: string;
  title?: string;
  liked?: boolean;
  [key: string]: unknown;
};

export type ImportedSettings = {
  app?: string;
  appVersion?: string;
  exportedAt?: string;
  playlists?: Playlist[];
  trackMetadata?: ImportedTrackMetadata[];
  lyrics?: TrackLyrics[];
  preferences?: Record<string, unknown>;
};

function assertArray(value: unknown, label: string) {
  if (value !== undefined && !Array.isArray(value)) {
    throw new Error(`匯入檔案的 ${label} 格式不正確。`);
  }
}

export function parseImportedSettings(raw: string): ImportedSettings {
  const parsed = JSON.parse(raw) as ImportedSettings;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("匯入檔案不是有效的設定 JSON。");
  }

  if (parsed.app && parsed.app !== "Aquariusgirl Music Room") {
    throw new Error("這不是 Aquariusgirl Music Room 的備份檔。");
  }

  if (parsed.appVersion && !parsed.appVersion.startsWith("0.")) {
    throw new Error("這份備份版本較新，請先更新播放器再匯入。");
  }

  assertArray(parsed.playlists, "playlists");
  assertArray(parsed.trackMetadata, "trackMetadata");
  assertArray(parsed.lyrics, "lyrics");

  return parsed;
}

export function summarizeImportedSettings(settings: ImportedSettings) {
  return {
    playlists: settings.playlists?.length ?? 0,
    tracks: settings.trackMetadata?.length ?? 0,
    lyrics: settings.lyrics?.length ?? 0,
    version: settings.appVersion ?? "unknown",
  };
}
