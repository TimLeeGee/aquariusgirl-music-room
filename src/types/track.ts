export type Track = {
  id: string;
  file?: File;
  name: string;
  title: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  trackNumber?: string;
  duration?: number;
  size?: number;
  type?: string;
  sourcePath?: string;
  localUrl: string;
  artworkUrl?: string;
  coverUrl?: string;
  coverMimeType?: string;
  metadataLoaded?: boolean;
  metadataError?: string;
  playlistId?: string;
  lastPlayedAt?: number;
  playCount?: number;
  liked: boolean;
  addedAt: number;
};

export type RepeatMode = "none" | "one" | "all";

export type SortMode =
  | "addedAt"
  | "title"
  | "filename"
  | "artist"
  | "album"
  | "durationAsc"
  | "durationDesc";
