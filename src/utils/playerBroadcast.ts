import type { Track } from "../types/track";

export type BroadcastPlayerState = {
  track: Pick<Track, "title" | "artist" | "album" | "artworkUrl" | "coverUrl"> | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  updatedAt: number;
};

const CHANNEL_NAME = "aquariusgirl-player-state";

export function createPlayerBroadcastChannel() {
  if (!("BroadcastChannel" in window)) {
    return null;
  }

  return new BroadcastChannel(CHANNEL_NAME);
}

export function writePlayerStateToStorage(state: BroadcastPlayerState) {
  try {
    window.localStorage.setItem(CHANNEL_NAME, JSON.stringify(state));
  } catch {
    // OBS mode can still show a standby state when storage is blocked.
  }
}

export function readPlayerStateFromStorage() {
  try {
    const raw = window.localStorage.getItem(CHANNEL_NAME);
    return raw ? (JSON.parse(raw) as BroadcastPlayerState) : null;
  } catch {
    return null;
  }
}
