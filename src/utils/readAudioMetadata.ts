import type { Track } from "../types/track";
import { parseAudioTags } from "./id3Tags";

export type AudioMetadata = Partial<Pick<
  Track,
  | "title"
  | "artist"
  | "album"
  | "albumArtist"
  | "year"
  | "genre"
  | "trackNumber"
  | "discNumber"
  | "comment"
  | "composer"
  | "coverMimeType"
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
      albumArtist: id3Tags.albumArtist,
      year: id3Tags.year,
      genre: id3Tags.genre,
      trackNumber: id3Tags.trackNumber,
      discNumber: id3Tags.discNumber,
      comment: id3Tags.comment,
      composer: id3Tags.composer,
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
