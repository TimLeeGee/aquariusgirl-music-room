export const SYSTEM_PLAYLIST_IDS = {
  all: "system-all",
  liked: "system-liked",
} as const;

export type PlaylistKind = "system" | "normal" | "smart";

export type SmartPlaylistMatch = "all" | "any";

export type SmartPlaylistField =
  | "title"
  | "artist"
  | "album"
  | "genre"
  | "year"
  | "duration"
  | "dateAdded"
  | "playCount"
  | "lastPlayed"
  | "favorite";

export type SmartPlaylistOperator =
  | "contains"
  | "equals"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "between"
  | "before"
  | "after"
  | "withinDays"
  | "olderThanDays";

export type SmartPlaylistSortBy =
  | "title"
  | "artist"
  | "album"
  | "genre"
  | "year"
  | "duration"
  | "dateAdded"
  | "playCount"
  | "lastPlayed"
  | "random";

export type SmartPlaylistRule = {
  id: string;
  field: SmartPlaylistField;
  operator: SmartPlaylistOperator;
  value: string | number | boolean;
  valueTo?: number;
};

export type BasePlaylist = {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  createdAt: number;
  updatedAt: number;
  type: PlaylistKind;
};

export type SystemPlaylist = BasePlaylist & {
  type: "system";
  trackIds: string[];
  liked?: boolean;
};

export type NormalPlaylist = BasePlaylist & {
  type: "normal";
  trackIds: string[];
};

export type SmartPlaylist = BasePlaylist & {
  type: "smart";
  match: SmartPlaylistMatch;
  rules: SmartPlaylistRule[];
  excludedTrackIds?: string[];
  sortBy: SmartPlaylistSortBy;
  sortDirection: "asc" | "desc";
  limit: number | null;
};

export type Playlist =
  | SystemPlaylist
  | NormalPlaylist
  | SmartPlaylist;

export type StoredPlaylist = NormalPlaylist | SmartPlaylist;

export function isTrackListPlaylist(
  playlist?: Playlist | null,
): playlist is SystemPlaylist | NormalPlaylist {
  return playlist?.type === "system" || playlist?.type === "normal";
}

export function isEditablePlaylist(
  playlist?: Playlist | null,
): playlist is StoredPlaylist {
  return Boolean(playlist && playlist.type !== "system");
}
