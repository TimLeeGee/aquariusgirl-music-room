import type { Track } from "../types/track";

export function getTrackPrimaryText(track?: Track | null) {
  if (!track) return "水瓶罐子正在等音樂";
  return track.file?.name || track.name || track.title || "未命名歌曲";
}

export function getTrackSecondaryText(track?: Track | null, fallback = "未知歌手") {
  return track?.artist?.trim() || fallback;
}
