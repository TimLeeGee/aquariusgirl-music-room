export type LyricLine = {
  time: number;
  text: string;
};

export type TrackLyrics = {
  trackId: string;
  fileName?: string;
  lines: LyricLine[];
  raw: string;
  importedAt: number;
};
