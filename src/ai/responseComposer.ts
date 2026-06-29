import type { AITrackCandidate } from "../utils/aiTrackSearch";
import type { SkillResult } from "./skillRegistry";

function summarizeCandidates(candidates: AITrackCandidate[]) {
  return candidates
    .slice(0, 6)
    .map(({ track }) => `「${track.title}」${track.artist ? ` / ${track.artist}` : ""}`)
    .join("、");
}

export function composeSkillResult(result: SkillResult) {
  if (!result.ok) {
    return result.error ?? result.message;
  }
  if (result.playlist) {
    return result.message || `已建立「${result.playlist.name}」，共 ${result.playlist.trackCount} 首。`;
  }
  if (result.tracks.length > 0) {
    const summary = `找到 ${result.tracks.length} 首相關歌曲：${summarizeCandidates(result.tracks)}。`;
    return result.message ? `${summary}${result.message}` : summary;
  }
  if (result.message) return result.message;
  return "目前本機音樂庫找不到相關歌曲。";
}

export function composeSearchingMessage(keywords: string[]) {
  return `正在搜尋本機音樂庫：${keywords.slice(0, 6).join("、") || "目前音樂資料"}`;
}
