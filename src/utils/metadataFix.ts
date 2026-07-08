import type { Track } from "../types/track";
import { parseTrackName, removeAudioExtension } from "./parseTrackName";
import { isSupportedOriginalWriteFormat, type SongInfoDraft } from "./songInfo";

// 0.1.45 B1/B2：歌曲資訊補全的純函式層——掃描缺失＋規則推測（信心＋證據）。
// 禁止讓 0.8B 模型憑空推測歌手／專輯（會幻覺）；所有建議都必須有曲庫內的證據。

export type FixableField = "artist" | "album" | "year" | "genre" | "track";

export type MetadataSuggestion = {
  field: FixableField;
  label: string;
  proposed: string;
  confidence: "high" | "medium";
  evidence: string;
};

export type TrackFixPlan = {
  trackId: string;
  fileName: string;
  suggestions: MetadataSuggestion[];
};

export type ManualFixEntry = { trackId: string; fileName: string };
export type NonWritableEntry = { trackId: string; fileName: string; sourcePath: string };
export type TrackFolderOption = { path: string; label: string; count: number };

export type MetadataScanReport = {
  total: number;
  writable: number;
  nonWritable: number;
  missingArtist: number;
  missingAlbum: number;
  missingYear: number;
  missingGenre: number;
  missingCover: number;
  incompleteCount: number;
  plans: TrackFixPlan[];
  // 0.1.47 P3/P4：可寫回但推測不出建議的（供逐首手動編輯）、與非可寫格式清單（供檢視位置）。
  manualCandidates: ManualFixEntry[];
  nonWritableList: NonWritableEntry[];
};

export const fixableFieldLabels: Record<FixableField, string> = {
  artist: "歌手",
  album: "專輯",
  year: "年份",
  genre: "曲風",
  track: "曲號",
};

const metadataFixActionWords = ["檢查", "補", "整理", "健檢", "掃描", "修"];
const metadataFixTopicWords = ["資訊", "標籤", "metadata", "tag", "資料"];

export function isMetadataFixIntent(text: string) {
  const normalized = text.normalize("NFKC").toLocaleLowerCase();
  // 「整理歌單」「資料夾裡挑歌」屬於歌單流程，不可誤觸發掃描。
  if (/播放清單|歌單|playlist/.test(normalized)) return false;
  const topicSource = normalized.split("資料夾").join(" ");
  return (
    metadataFixActionWords.some((word) => normalized.includes(word)) &&
    metadataFixTopicWords.some((word) => topicSource.includes(word))
  );
}

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeKey(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}

export function trackFixFileName(track: Track) {
  return (
    track.sourcePath?.split(/[\\/]/).pop() ??
    track.file?.name ??
    track.name ??
    ""
  );
}

function folderKeyOf(track: Track) {
  const sourcePath = track.sourcePath ?? "";
  const match = /^(.*)[\\/][^\\/]+$/.exec(sourcePath);
  return match ? match[1] : "";
}

// 0.1.47 P2：從已載入 tracks 的 sourcePath 蒐集資料夾（各自子資料夾各列一項）。
export function listTrackFolders(tracks: Track[]): TrackFolderOption[] {
  const counts = new Map<string, number>();
  for (const track of tracks) {
    const folder = folderKeyOf(track);
    if (folder) counts.set(folder, (counts.get(folder) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([path, count]) => ({ path, label: path.split(/[\\/]/).pop() || path, count }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

// 前綴比對，天然含子資料夾。
export function filterTracksByFolder(tracks: Track[], folderPrefix: string): Track[] {
  const prefix = folderPrefix.replace(/[\\/]+$/, "");
  if (!prefix) return tracks;
  return tracks.filter((track) => {
    const sp = track.sourcePath ?? "";
    return sp === prefix || sp.startsWith(`${prefix}/`) || sp.startsWith(`${prefix}\\`);
  });
}

function isMissing(value: unknown) {
  return !cleanValue(value);
}

function hasCover(track: Track) {
  return Boolean(track.coverDataUrl || track.coverUrl || track.artworkUrl);
}

export function isWritableFixTarget(track: Track) {
  return Boolean(track.sourcePath && isSupportedOriginalWriteFormat(track.sourcePath));
}

type MajorityResult = { value: string; count: number; total: number; ratio: number } | null;

function majorityValue(values: Array<string | undefined>): MajorityResult {
  const counts = new Map<string, { count: number; displays: Map<string, number> }>();
  let total = 0;

  for (const raw of values) {
    const display = cleanValue(raw);
    if (!display) continue;
    total += 1;
    const key = normalizeKey(display);
    const entry = counts.get(key) ?? { count: 0, displays: new Map<string, number>() };
    entry.count += 1;
    entry.displays.set(display, (entry.displays.get(display) ?? 0) + 1);
    counts.set(key, entry);
  }

  let best: { count: number; displays: Map<string, number> } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  if (!best || total === 0) return null;

  let displayValue = "";
  let displayCount = 0;
  for (const [display, count] of best.displays) {
    if (count > displayCount) {
      displayValue = display;
      displayCount = count;
    }
  }

  return { value: displayValue, count: best.count, total, ratio: best.count / total };
}

function suggestArtist(track: Track, folderTracks: Track[]): MetadataSuggestion | null {
  const parsed = parseTrackName(trackFixFileName(track));
  if (parsed.artist) {
    return {
      field: "artist",
      label: fixableFieldLabels.artist,
      proposed: parsed.artist,
      confidence: "high",
      evidence: `檔名含「${parsed.artist} -」`,
    };
  }

  const majority = majorityValue(
    folderTracks.filter((item) => item.id !== track.id).map((item) => item.artist),
  );
  if (majority && majority.total >= 3 && majority.ratio >= 0.8) {
    return {
      field: "artist",
      label: fixableFieldLabels.artist,
      proposed: majority.value,
      confidence: majority.ratio === 1 ? "high" : "medium",
      evidence: `同資料夾 ${majority.total} 首中 ${majority.count} 首的歌手是「${majority.value}」`,
    };
  }

  return null;
}

function suggestAlbum(track: Track, folderTracks: Track[]): MetadataSuggestion | null {
  const majority = majorityValue(
    folderTracks.filter((item) => item.id !== track.id).map((item) => item.album),
  );
  if (majority && majority.total >= 3 && majority.ratio >= 0.8) {
    return {
      field: "album",
      label: fixableFieldLabels.album,
      proposed: majority.value,
      confidence: majority.ratio === 1 ? "high" : "medium",
      evidence: `同資料夾 ${majority.total} 首中 ${majority.count} 首的專輯是「${majority.value}」`,
    };
  }

  return null;
}

function suggestByGroups(
  field: "year" | "genre",
  albumLabel: string,
  albumInferred: boolean,
  albumTracks: Track[],
  artistTracks: Track[],
  pick: (item: Track) => string | undefined,
  validate: (value: string) => boolean,
): MetadataSuggestion | null {
  const albumPrefix = albumInferred ? "依推測專輯，" : "";
  const albumMajority = majorityValue(
    albumTracks.map(pick).map((value) => {
      const cleaned = cleanValue(value);
      return validate(cleaned) ? cleaned : "";
    }),
  );
  if (albumMajority && albumMajority.total >= 2 && albumMajority.ratio === 1) {
    return {
      field,
      label: fixableFieldLabels[field],
      proposed: albumMajority.value,
      confidence: "high",
      evidence: `${albumPrefix}《${albumLabel}》${albumMajority.total} 首的${fixableFieldLabels[field]}都是「${albumMajority.value}」`,
    };
  }

  const artistMajority = majorityValue(
    artistTracks.map(pick).map((value) => {
      const cleaned = cleanValue(value);
      return validate(cleaned) ? cleaned : "";
    }),
  );
  const artistThreshold = field === "year" ? 0.9 : 0.8;
  if (artistMajority && artistMajority.total >= 3 && artistMajority.ratio >= artistThreshold) {
    return {
      field,
      label: fixableFieldLabels[field],
      proposed: artistMajority.value,
      confidence: "medium",
      evidence: `同歌手 ${artistMajority.total} 首中 ${artistMajority.count} 首的${fixableFieldLabels[field]}是「${artistMajority.value}」`,
    };
  }

  return null;
}

function suggestTrackNumber(track: Track): MetadataSuggestion | null {
  const base = removeAudioExtension(trackFixFileName(track));
  const match = /^(\d{1,3})[\s._\-、,，.]+\S/.exec(base);
  if (!match) return null;

  const proposed = String(Number(match[1]));
  if (!/^\d{1,3}$/.test(proposed) || Number(proposed) === 0) return null;

  return {
    field: "track",
    label: fixableFieldLabels.track,
    proposed,
    confidence: "medium",
    evidence: `檔名開頭是「${match[1]}」`,
  };
}

export function scanMetadata(tracks: Track[]): MetadataScanReport {
  const folderGroups = new Map<string, Track[]>();
  const albumGroups = new Map<string, Track[]>();
  const artistGroups = new Map<string, Track[]>();

  for (const track of tracks) {
    const folderKey = folderKeyOf(track);
    if (folderKey) {
      const group = folderGroups.get(folderKey) ?? [];
      group.push(track);
      folderGroups.set(folderKey, group);
    }

    const albumKey = normalizeKey(cleanValue(track.album));
    if (albumKey) {
      const group = albumGroups.get(albumKey) ?? [];
      group.push(track);
      albumGroups.set(albumKey, group);
    }

    const artistKey = normalizeKey(cleanValue(track.artist));
    if (artistKey) {
      const group = artistGroups.get(artistKey) ?? [];
      group.push(track);
      artistGroups.set(artistKey, group);
    }
  }

  const report: MetadataScanReport = {
    total: tracks.length,
    writable: 0,
    nonWritable: 0,
    missingArtist: 0,
    missingAlbum: 0,
    missingYear: 0,
    missingGenre: 0,
    missingCover: 0,
    incompleteCount: 0,
    plans: [],
    manualCandidates: [],
    nonWritableList: [],
  };

  for (const track of tracks) {
    const writable = isWritableFixTarget(track);
    if (writable) {
      report.writable += 1;
    } else {
      report.nonWritable += 1;
      report.nonWritableList.push({
        trackId: track.id,
        fileName: trackFixFileName(track),
        sourcePath: track.sourcePath ?? "",
      });
    }

    const missingArtist = isMissing(track.artist);
    const missingAlbum = isMissing(track.album);
    const missingYear = isMissing(track.year);
    const missingGenre = isMissing(track.genre);
    if (missingArtist) report.missingArtist += 1;
    if (missingAlbum) report.missingAlbum += 1;
    if (missingYear) report.missingYear += 1;
    if (missingGenre) report.missingGenre += 1;
    if (!hasCover(track)) report.missingCover += 1;
    const incomplete = missingArtist || missingAlbum || missingYear || missingGenre;
    if (incomplete) {
      report.incompleteCount += 1;
    }

    if (!writable) continue;

    const folderTracks = folderGroups.get(folderKeyOf(track)) ?? [];
    const suggestions: MetadataSuggestion[] = [];

    const artistSuggestion = missingArtist ? suggestArtist(track, folderTracks) : null;
    if (artistSuggestion) suggestions.push(artistSuggestion);

    const albumSuggestion = missingAlbum ? suggestAlbum(track, folderTracks) : null;
    if (albumSuggestion) suggestions.push(albumSuggestion);

    const albumLabel = cleanValue(track.album) || albumSuggestion?.proposed || "";
    const albumInferred = !cleanValue(track.album) && Boolean(albumSuggestion);
    const albumTracks = albumLabel
      ? (albumGroups.get(normalizeKey(albumLabel)) ?? []).filter((item) => item.id !== track.id)
      : [];
    const artistLabel = cleanValue(track.artist) || artistSuggestion?.proposed || "";
    const artistTracks = artistLabel
      ? (artistGroups.get(normalizeKey(artistLabel)) ?? []).filter((item) => item.id !== track.id)
      : [];

    if (missingYear) {
      const yearSuggestion = suggestByGroups(
        "year",
        albumLabel,
        albumInferred,
        albumTracks,
        artistTracks,
        (item) => item.year,
        (value) => /^\d{4}$/.test(value),
      );
      if (yearSuggestion) suggestions.push(yearSuggestion);
    }

    if (missingGenre) {
      const genreSuggestion = suggestByGroups(
        "genre",
        albumLabel,
        albumInferred,
        albumTracks,
        artistTracks,
        (item) => item.genre,
        (value) => Boolean(value),
      );
      if (genreSuggestion) suggestions.push(genreSuggestion);
    }

    if (isMissing(track.trackNumber)) {
      const trackSuggestion = suggestTrackNumber(track);
      if (trackSuggestion) suggestions.push(trackSuggestion);
    }

    if (suggestions.length > 0) {
      report.plans.push({
        trackId: track.id,
        fileName: trackFixFileName(track),
        suggestions,
      });
    } else if (incomplete) {
      report.manualCandidates.push({
        trackId: track.id,
        fileName: trackFixFileName(track),
      });
    }
  }

  return report;
}

export function buildFixDraftPatch(
  suggestions: MetadataSuggestion[],
  checkedFields: Record<string, boolean>,
): Partial<SongInfoDraft> {
  const patch: Partial<SongInfoDraft> = {};
  for (const suggestion of suggestions) {
    if (checkedFields[suggestion.field]) {
      patch[suggestion.field] = suggestion.proposed;
    }
  }
  return patch;
}

export function composeScanSummaryText(report: MetadataScanReport) {
  if (report.total === 0) {
    return "目前還沒載入音樂，先載入資料夾再讓罐子檢查喔。";
  }
  if (report.incompleteCount === 0) {
    return `檢查了 ${report.total} 首，基本資料（歌手／專輯／年份／曲風）都齊全，太棒了！`;
  }

  const nonWritableNote =
    report.nonWritable > 0
      ? `另外 ${report.nonWritable} 首不是 mp3/flac/m4a，只能檢視無法寫回。`
      : "";
  const planNote =
    report.plans.length > 0
      ? `其中 ${report.plans.length} 首可以用曲庫線索自動建議補齊，按「開始整理」逐首確認。`
      : "不過目前曲庫裡的線索不夠，還推測不出建議值；之後可以考慮網路查詢功能。";

  return `檢查了 ${report.total} 首，${report.incompleteCount} 首缺基本資料。${planNote}${nonWritableNote}`;
}
