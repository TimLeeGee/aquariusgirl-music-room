import type { Track } from "../types/track";
import { parseAudioTags } from "./id3Tags";

export type AudioMetadata = Partial<Pick<
  Track,
  "title" | "artist" | "album" | "year" | "genre" | "trackNumber" | "coverMimeType"
>> & {
  artworkBlob?: Blob;
  metadataLoaded: boolean;
  metadataError?: string;
};

export async function readAudioMetadata(file: File): Promise<AudioMetadata> {
  try {
    const id3Tags = await parseAudioTags(file);

    return {
      title: id3Tags.title,
      artist: id3Tags.artist,
      album: id3Tags.album,
      year: id3Tags.year,
      genre: id3Tags.genre,
      trackNumber: id3Tags.trackNumber,
      coverMimeType: id3Tags.coverMimeType,
      artworkBlob: id3Tags.coverBlob,
      metadataLoaded: true,
    };
  } catch (error) {
    return {
      metadataLoaded: false,
      metadataError: error instanceof Error ? error.message : "metadata parse failed",
    };
  }
}
