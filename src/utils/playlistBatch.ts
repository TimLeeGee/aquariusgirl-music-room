export function appendTrackIds(trackIds: string[], nextTrackIds: string[]) {
  return nextTrackIds.length > 0 ? [...trackIds, ...nextTrackIds] : trackIds;
}

export function createNormalPlaylist(
  name: string,
  initialTrackIds: string[] = [],
  now = Date.now(),
) {
  return {
    name: name.trim() || "未命名播放清單",
    trackIds: appendTrackIds([], initialTrackIds),
    createdAt: now,
    updatedAt: now,
    type: "normal" as const,
  };
}
