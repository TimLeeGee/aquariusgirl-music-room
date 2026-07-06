export type Track = {
  id: string;
  file?: File;
  name: string;
  title: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  year?: string;
  genre?: string;
  trackNumber?: string;
  discNumber?: string;
  comment?: string;
  composer?: string;
  duration?: number;
  size?: number;
  type?: string;
  sourcePath?: string;
  localUrl: string;
  mediaVersion?: number;
  artworkUrl?: string;
  coverUrl?: string;
  coverDataUrl?: string;
  coverMimeType?: string;
  coverHash?: string;
  metadataLoaded?: boolean;
  metadataError?: string;
  metadataOverride?: boolean;
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
