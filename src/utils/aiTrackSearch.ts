import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";

export type MusicToolIntent =
  | "chat"
  | "search_music"
  | "create_playlist"
  | "random_playlist"
  | "add_to_playlist"
  | "remove_from_playlist"
  | "explain_ui"
  | "unknown";

export type MusicSearchField =
  | "title"
  | "artist"
  | "album"
  | "filename"
  | "metadata"
  | "path";

export type MusicSearchIntent = {
  intent: MusicToolIntent;
  playlistName: string;
  targetPlaylistName: string;
  keywords: string[];
  searchFields: MusicSearchField[];
  needMusicLibrarySearch: boolean;
  artistIncludes: string[];
  albumIncludes: string[];
  genreIncludes: string[];
  titleIncludes: string[];
  likedOnly: boolean;
  maxTotalMinutes: number | null;
  mood: string | null;
  sortBy: "bestMatch" | "durationAsc" | "durationDesc" | "recentlyAdded";
  explanation: string;
};

export type AITrackCandidate = {
  track: Track;
  score: number;
  reasons: string[];
};

const defaultSearchFields: MusicSearchField[] = [
  "title",
  "artist",
  "album",
  "filename",
  "metadata",
  "path",
];
const calmWords = [
  "睡前",
  "睡",
  "夜",
  "晚安",
  "安眠",
  "放鬆",
  "輕音樂",
  "鋼琴",
  "安靜",
  "夜晚",
  "calm",
  "sleep",
  "relax",
  "chill",
  "quiet",
  "night",
  "lofi",
  "piano",
];
const workWords = ["工作", "專注", "讀書", "focus", "work", "study"];
const addWords = ["加入", "加到", "放進", "放到", "新增到", "add to"];
const removeWords = ["移除", "拿掉", "刪掉", "删除", "remove from"];
const createWords = ["播放清單", "歌單", "playlist", "建立", "做一個", "整理"];
const musicWords = ["歌", "音樂", "artist", "album", "專輯", "歌手", "曲", "睡前", "工作", "放鬆"];
const searchWords = ["找", "搜尋", "查", "有沒有", "看看", "search"];
const consentWords = ["好", "可以", "要", "幫我", "建立", "整理", "同意", "ok", "yes"];
const randomWords = ["隨意", "隨機", "隨便", "random", "shuffle", "資料夾裡", "挑一些", "今天隨便"];
const requestStopWords = [
  "播放清單",
  "歌單",
  "playlist",
  "建立",
  "新增",
  "做一個",
  "整理",
  "相關",
  "相關的",
  "幫我",
  "那給我",
  "給我",
  "請",
  "想聽",
  "看看",
  "有沒有",
  "一些",
  "一點",
  "今天",
  "從資料夾裡",
  "挑",
  "找",
  "用",
  "的",
  "那",
];
const aliasGroups = [
  ["櫻花46", "樱花46", "櫻坂46", "樱坂46", "sakurazaka46", "sakurazaka 46", "櫻坂", "樱坂", "46"],
];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.normalize("NFKC").trim().toLocaleLowerCase() : "";
}

function displayText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArray(value: unknown) {
  return Array.isArray(value)
    ? value.map(normalizeText).filter(Boolean).slice(0, 16)
    : [];
}

function normalizeSort(value: unknown): MusicSearchIntent["sortBy"] {
  if (
    value === "durationAsc" ||
    value === "durationDesc" ||
    value === "recentlyAdded"
  ) {
    return value;
  }
  return "bestMatch";
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function compactText(value: unknown) {
  return normalizeText(value).replace(/[\s._\-・\/\\()[\]{}【】「」『』,，.。!！?？:：;；'"]/g, "");
}

function sourceFileName(track: Track) {
  return (
    track.sourcePath?.split(/[\\/]/).pop() ??
    track.file?.name ??
    track.name ??
    ""
  );
}

function expandAliases(terms: string[]) {
  const normalizedTerms = terms.map(normalizeText).filter(Boolean);
  const expanded = new Set(normalizedTerms);

  for (const group of aliasGroups) {
    const normalizedGroup = group.map(normalizeText);
    if (normalizedGroup.some((alias) =>
      normalizedTerms.some((term) => term.includes(alias) || alias.includes(term)),
    )) {
      normalizedGroup.forEach((alias) => expanded.add(alias));
    }
  }

  return Array.from(expanded);
}

function extractFallbackKeywords(text: string) {
  let normalized = normalizeText(text);
  requestStopWords.forEach((word) => {
    normalized = normalized.split(normalizeText(word)).join(" ");
  });

  const parts = normalized
    .split(/[\s,，.。!！?？:：;；、]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);

  return expandAliases(parts).slice(0, 12);
}

function inferMood(text: string) {
  const normalized = normalizeText(text);
  if (calmWords.some((word) => normalized.includes(normalizeText(word)))) return "calm";
  if (workWords.some((word) => normalized.includes(normalizeText(word)))) return "focus";
  return null;
}

function includesAny(text: string, words: string[]) {
  const normalized = normalizeText(text);
  return words.some((word) => normalized.includes(normalizeText(word)));
}

function inferIntent(text: string): MusicToolIntent {
  if (!text.trim()) return "unknown";
  if (includesAny(text, removeWords)) return "remove_from_playlist";
  if (includesAny(text, addWords)) return "add_to_playlist";
  if (isRandomPlaylistRequest(text)) return "random_playlist";
  if (includesAny(text, createWords)) return "create_playlist";
  if (includesAny(text, searchWords) || includesAny(text, musicWords)) return "search_music";
  return "chat";
}

function normalizeIntent(value: unknown, fallbackText: string): MusicToolIntent {
  const normalized = normalizeText(value);
  if (
    normalized === "chat" ||
    normalized === "search_music" ||
    normalized === "create_playlist" ||
    normalized === "random_playlist" ||
    normalized === "add_to_playlist" ||
    normalized === "remove_from_playlist" ||
    normalized === "explain_ui" ||
    normalized === "unknown"
  ) {
    return normalized;
  }
  if (normalized === "explain") return "explain_ui";
  return inferIntent(fallbackText);
}

function normalizeSearchFields(value: unknown): MusicSearchField[] {
  const rawFields = Array.isArray(value) ? value : [];
  const fields = rawFields.filter((field): field is MusicSearchField =>
    field === "title" ||
    field === "artist" ||
    field === "album" ||
    field === "filename" ||
    field === "metadata" ||
    field === "path",
  );
  return fields.length > 0 ? fields : defaultSearchFields;
}

function inferPlaylistName(fallbackText: string, keywords: string[], mood: string | null) {
  if (mood === "calm") return "睡前播放清單";
  if (mood === "focus") return "專注播放清單";
  const keyword = keywords.find((term) => term.length >= 2 && !/^\d+$/.test(term)) ?? "";
  if (keyword) return `${keyword} 播放清單`;
  const trimmed = displayText(fallbackText);
  return trimmed ? `${trimmed.slice(0, 24)} 播放清單` : "水瓶罐子 AI 歌單";
}

function inferTargetPlaylistName(text: string) {
  const normalized = displayText(text);
  const match = normalized.match(/(?:加入|加到|放進|放到|新增到)\s*(.+?)(?:播放清單|歌單|playlist)/i);
  return match?.[1]?.trim() ?? "";
}

export function isDirectPlaylistRequest(text: string) {
  const intent = inferIntent(text);
  return intent === "create_playlist" || intent === "random_playlist" || intent === "add_to_playlist";
}

export function isMusicRelatedRequest(text: string) {
  const intent = inferIntent(text);
  return intent === "search_music" ||
    intent === "create_playlist" ||
    intent === "random_playlist" ||
    intent === "add_to_playlist" ||
    intent === "remove_from_playlist";
}

export function isPlaylistConsent(text: string) {
  return includesAny(text, consentWords);
}

export function isRandomPlaylistRequest(text: string) {
  return includesAny(text, randomWords) ||
    (includesAny(text, createWords) && extractFallbackKeywords(text).length === 0);
}

export function buildPlaylistRequestText(latestText = "") {
  return latestText.trim().slice(-600);
}

export function normalizeMusicSearchIntent(raw: unknown, fallbackText = ""): MusicSearchIntent {
  const record = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const fallbackKeywords = extractFallbackKeywords(fallbackText);
  const keywords = expandAliases([
    ...normalizeArray(record.keywords),
    ...normalizeArray(record.search_keywords),
    ...fallbackKeywords,
  ]);
  const mood = normalizeText(record.mood) || inferMood(fallbackText);
  const intent = normalizeIntent(record.intent, fallbackText);
  const playlistName =
    displayText(record.playlistName) ||
    displayText(record.playlist_name) ||
    inferPlaylistName(fallbackText, keywords, mood);
  const targetPlaylistName =
    displayText(record.targetPlaylistName) ||
    displayText(record.target_playlist_name) ||
    inferTargetPlaylistName(fallbackText);
  const explicitNeedSearch =
    record.needMusicLibrarySearch ?? record.need_music_library_search;

  return {
    intent,
    playlistName: playlistName.slice(0, 36),
    targetPlaylistName: targetPlaylistName.slice(0, 36),
    keywords,
    searchFields: normalizeSearchFields(record.searchFields ?? record.search_fields),
    needMusicLibrarySearch: typeof explicitNeedSearch === "boolean"
      ? explicitNeedSearch
      : intent === "search_music" ||
        intent === "create_playlist" ||
        intent === "random_playlist" ||
        intent === "add_to_playlist",
    artistIncludes: expandAliases(normalizeArray(record.artistIncludes ?? record.artist_includes)),
    albumIncludes: expandAliases(normalizeArray(record.albumIncludes ?? record.album_includes)),
    genreIncludes: expandAliases(normalizeArray(record.genreIncludes ?? record.genre_includes)),
    titleIncludes: expandAliases(normalizeArray(record.titleIncludes ?? record.title_includes)),
    likedOnly: record.likedOnly === true || record.liked_only === true,
    maxTotalMinutes: positiveNumber(record.maxTotalMinutes ?? record.max_total_minutes),
    mood,
    sortBy: normalizeSort(record.sortBy ?? record.sort_by),
    explanation: normalizeText(record.explanation),
  };
}

export function buildLibrarySummary(tracks: Track[], playlists: Playlist[]) {
  const artists = new Set(tracks.map((track) => normalizeText(track.artist)).filter(Boolean));
  const albums = new Set(tracks.map((track) => normalizeText(track.album)).filter(Boolean));
  const genres = tracks
    .map((track) => normalizeText(track.genre))
    .filter(Boolean)
    .reduce<Record<string, number>>((counts, genre) => {
      counts[genre] = (counts[genre] ?? 0) + 1;
      return counts;
    }, {});

  return {
    trackCount: tracks.length,
    artistCount: artists.size,
    albumCount: albums.size,
    playlistNames: playlists.map((playlist) => playlist.name).slice(0, 20),
    commonGenres: Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([genre]) => genre),
    examples: tracks.slice(0, 16).map((track) => ({
      title: track.title,
      artist: track.artist,
      album: track.album,
      genre: track.genre,
      year: track.year,
      filename: track.name,
      liked: track.liked,
      duration: track.duration,
    })),
  };
}

function fieldTexts(track: Track, field: MusicSearchField) {
  if (field === "title") return [track.title];
  if (field === "artist") return [track.artist];
  if (field === "album") return [track.album];
  if (field === "filename") return [track.name, track.file?.name, sourceFileName(track)];
  if (field === "path") return [track.sourcePath];
  return [
    track.title,
    track.artist,
    track.album,
    track.genre,
    track.year,
    track.trackNumber,
    track.name,
    track.type,
  ];
}

function fieldWeight(field: MusicSearchField) {
  if (field === "title" || field === "artist") return 5;
  if (field === "album") return 4;
  if (field === "metadata") return 3;
  if (field === "filename") return 2;
  return 1;
}

function scoreField(values: unknown[], terms: string[], field: MusicSearchField) {
  const text = values.map(normalizeText).filter(Boolean).join(" ");
  const compact = compactText(text);
  const weight = fieldWeight(field);

  return expandAliases(terms).reduce((score, term) => {
    const normalizedTerm = normalizeText(term);
    const compactTerm = compactText(term);
    return text.includes(normalizedTerm) || compact.includes(compactTerm)
      ? score + weight
      : score;
  }, 0);
}

function moodTerms(mood: string | null) {
  if (!mood) return [];
  if (["calm", "sleep", "relax"].includes(mood)) return calmWords;
  if (["focus", "work", "study"].includes(mood)) return workWords;
  return [mood];
}

export function searchLocalMusicLibrary(
  tracks: Track[],
  input: {
    keywords: string[];
    fields?: MusicSearchField[];
    limit?: number;
  },
): AITrackCandidate[] {
  const terms = expandAliases(input.keywords).filter(Boolean);
  if (terms.length === 0) return [];

  const fields = input.fields?.length ? input.fields : defaultSearchFields;

  return tracks
    .map((track) => {
      const reasons: string[] = [];
      const score = fields.reduce((sum, field) => {
        const fieldScore = scoreField(fieldTexts(track, field), terms, field);
        if (fieldScore > 0) reasons.push(field);
        return sum + fieldScore;
      }, 0);

      return {
        track,
        score: track.liked && score > 0 ? score + 1 : score,
        reasons: Array.from(new Set(reasons)),
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.track.title.localeCompare(b.track.title, "zh-Hant"))
    .slice(0, input.limit ?? 40);
}

export function searchTracksForAIIntent(
  tracks: Track[],
  intent: MusicSearchIntent,
): AITrackCandidate[] {
  const requestedTerms = [
    ...intent.keywords,
    ...intent.artistIncludes,
    ...intent.albumIncludes,
    ...intent.genreIncludes,
    ...intent.titleIncludes,
    ...moodTerms(intent.mood),
  ].filter(Boolean);

  if (requestedTerms.length === 0) {
    return [];
  }

  const candidates = searchLocalMusicLibrary(
    tracks.filter((track) => !intent.likedOnly || track.liked),
    {
      keywords: requestedTerms,
      fields: intent.searchFields,
      limit: tracks.length,
    },
  ).sort((a, b) => {
    if (intent.sortBy === "durationAsc") return (a.track.duration ?? 0) - (b.track.duration ?? 0);
    if (intent.sortBy === "durationDesc") return (b.track.duration ?? 0) - (a.track.duration ?? 0);
    if (intent.sortBy === "recentlyAdded") return b.track.addedAt - a.track.addedAt;
    return b.score - a.score || a.track.title.localeCompare(b.track.title, "zh-Hant");
  });

  if (!intent.maxTotalMinutes) {
    return candidates.slice(0, 40);
  }

  const maxSeconds = intent.maxTotalMinutes * 60;
  let totalSeconds = 0;
  const limited: AITrackCandidate[] = [];
  for (const candidate of candidates) {
    const duration = candidate.track.duration ?? 0;
    if (duration > 0 && totalSeconds + duration > maxSeconds && limited.length > 0) {
      continue;
    }
    totalSeconds += duration;
    limited.push(candidate);
    if (totalSeconds >= maxSeconds) break;
  }

  return limited.slice(0, 40);
}

export function pickRandomTracksForAIPlaylist(tracks: Track[], maxCount = 25): AITrackCandidate[] {
  const shuffled = [...tracks];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(1, maxCount)).map((track) => ({
    track,
    score: 1,
    reasons: ["random"],
  }));
}
