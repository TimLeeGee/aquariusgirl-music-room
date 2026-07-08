import type { Track } from "../types/track";
// 註：本檔由 node --experimental-strip-types 的 check 直接載入，不能加 runtime 相對 import，
// 故此處預設字維持字面「水瓶罐子」，不套用角色改名。

export function getTrackPrimaryText(track?: Track | null) {
  if (!track) return "";
  return track.file?.name || track.name || track.title || "未命名歌曲";
}

export function getTrackSecondaryText(track?: Track | null, fallback = "未知歌手") {
  return track?.artist?.trim() || fallback;
}
