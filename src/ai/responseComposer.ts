import type { SkillResult } from "./skillRegistry";

function cleanReplyText(value: unknown) {
  return typeof value === "string"
    ? value.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, " ").trim()
    : "";
}

function getTrackCount(result: SkillResult) {
  return result.playlist?.trackCount ?? result.trackCount ?? result.tracks.length;
}

export function safePlaylistCreatedReply(input: { playlistName: string; trackCount: number }) {
  return `已建立「${input.playlistName}」，共 ${input.trackCount} 首歌。`;
}

export function safePlaylistNotFoundReply(input: { query: string }) {
  return `目前本機音樂庫找不到「${input.query || "這個關鍵字"}」相關歌曲。`;
}

export function safeAiUnavailableReply() {
  return "AI 暫時無法使用，但播放器仍可正常播放音樂。";
}

function looksLikeTrackList(text: string) {
  const listMarkers = text.match(/(?:^|\s)(?:\d+[.)、]|[-*•])\s*\S+/g) ?? [];
  return listMarkers.length >= 2 ||
    /以下(?:歌曲|曲目)|歌曲清單|曲目清單|我幫你(?:加入|建立).*[:：]/.test(text);
}

function mentionsCandidateTrack(text: string, result: SkillResult) {
  const normalizedText = text.toLocaleLowerCase();
  return result.tracks.some(({ track }) => {
    const title = cleanReplyText(track.title).toLocaleLowerCase();
    return title.length >= 2 && normalizedText.includes(title);
  });
}

export function toSafeSkillReplyInput(result: SkillResult) {
  return {
    ok: result.ok,
    skill: result.skill,
    message: result.message,
    playlist: result.playlist,
    trackCount: getTrackCount(result),
    error: result.error,
    query: result.query,
    reply_level: result.reply_level ?? "summary_only",
    allow_track_list_output: false,
  };
}

export function composeSkillResult(result: SkillResult) {
  if (!result.ok) {
    return result.error ?? result.message;
  }
  if (result.playlist) {
    return result.message || safePlaylistCreatedReply({
      playlistName: result.playlist.name,
      trackCount: result.playlist.trackCount,
    });
  }
  if (result.tracks.length > 0) {
    const summary = `找到 ${getTrackCount(result)} 首相關本機歌曲。`;
    return result.message ? `${summary}${result.message}` : summary;
  }
  if (result.message) return result.message;
  return safePlaylistNotFoundReply({ query: result.query ?? "" });
}

export function sanitizeSkillReply(modelText: unknown, result: SkillResult, fallbackText: string) {
  const text = cleanReplyText(modelText).slice(0, 500);
  if (!text || text.startsWith("{")) return fallbackText;

  const allowTrackListOutput = result.allow_track_list_output === true;
  const summaryOnly = (result.reply_level ?? "summary_only") === "summary_only";
  if (!allowTrackListOutput && (looksLikeTrackList(text) || mentionsCandidateTrack(text, result))) {
    return fallbackText;
  }
  if (summaryOnly && looksLikeTrackList(text)) {
    return fallbackText;
  }

  return text;
}

export function composeSearchingMessage(keywords: string[]) {
  return `正在搜尋本機音樂庫：${keywords.slice(0, 6).join("、") || "目前音樂資料"}`;
}
