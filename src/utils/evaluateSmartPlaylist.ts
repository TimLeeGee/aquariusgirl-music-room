import type {
  SmartPlaylist,
  SmartPlaylistField,
  SmartPlaylistSortBy,
  SmartPlaylistRule,
} from "../types/playlist";
import type { Track } from "../types/track";

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function getComparableValue(track: Track, field: SmartPlaylistField) {
  if (field === "dateAdded") return track.addedAt;
  if (field === "lastPlayed") return track.lastPlayedAt ?? 0;
  if (field === "favorite") return track.liked;
  if (field === "playCount") return track.playCount ?? 0;
  if (field === "duration") return track.duration ?? 0;
  if (field === "year") return Number(track.year) || track.year || "";
  return track[field] ?? "";
}

function matchesTextRule(trackValue: unknown, rule: SmartPlaylistRule) {
  const value = normalizeText(trackValue);
  const expected = normalizeText(rule.value);

  if (!expected) {
    return false;
  }

  if (rule.operator === "contains") return value.includes(expected);
  if (rule.operator === "equals") return value === expected;
  if (rule.operator === "startsWith") return value.startsWith(expected);
  if (rule.operator === "endsWith") return value.endsWith(expected);
  return false;
}

function matchesNumericRule(trackValue: unknown, rule: SmartPlaylistRule) {
  const value = Number(trackValue);
  const expected = Number(rule.value);
  const expectedTo = Number(rule.valueTo);

  if (!Number.isFinite(value) || !Number.isFinite(expected)) {
    return false;
  }

  if (rule.operator === "equals") return value === expected;
  if (rule.operator === "greaterThan") return value > expected;
  if (rule.operator === "lessThan") return value < expected;
  if (rule.operator === "between") {
    return Number.isFinite(expectedTo) && value >= expected && value <= expectedTo;
  }
  return matchesTextRule(trackValue, rule);
}

export function evaluateSmartPlaylistRule(track: Track, rule: SmartPlaylistRule) {
  const trackValue = getComparableValue(track, rule.field);

  if (
    rule.field === "duration" ||
    rule.field === "dateAdded" ||
    rule.field === "playCount" ||
    rule.field === "lastPlayed"
  ) {
    return matchesNumericRule(trackValue, rule);
  }

  if (rule.field === "favorite") {
    return Boolean(trackValue) === Boolean(rule.value);
  }

  return matchesTextRule(trackValue, rule);
}

function compareText(a: unknown, b: unknown) {
  return String(a ?? "").localeCompare(String(b ?? ""), "zh-Hant", {
    numeric: true,
    sensitivity: "base",
  });
}

function isSortableTrackField(
  field: SmartPlaylistSortBy,
): field is Exclude<SmartPlaylistSortBy, "random"> {
  return field !== "random";
}

export function evaluateSmartPlaylist(playlist: SmartPlaylist, tracks: Track[]) {
  const validRules = playlist.rules.filter((rule) => String(rule.value ?? "").trim());
  const excludedTrackIds = new Set(playlist.excludedTrackIds ?? []);

  if (validRules.length === 0) {
    return [];
  }

  const filtered = tracks.filter((track) => {
    if (excludedTrackIds.has(track.id)) return false;
    const results = validRules.map((rule) => evaluateSmartPlaylistRule(track, rule));
    return playlist.match === "any"
      ? results.some(Boolean)
      : results.every(Boolean);
  });

  const sortBy = playlist.sortBy;
  const sorted =
    !isSortableTrackField(sortBy)
      ? [...filtered].sort(() => Math.random() - 0.5)
      : [...filtered].sort((a, b) => {
          const direction = playlist.sortDirection === "desc" ? -1 : 1;
          const first = getComparableValue(a, sortBy);
          const second = getComparableValue(b, sortBy);

          if (typeof first === "number" || typeof second === "number") {
            return (Number(first) - Number(second)) * direction;
          }

          return compareText(first, second) * direction;
        });

  return typeof playlist.limit === "number" && playlist.limit > 0
    ? sorted.slice(0, playlist.limit)
    : sorted;
}
