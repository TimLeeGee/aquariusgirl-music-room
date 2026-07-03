import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "../types/track";
import {
  createFileSignature,
  createSafeTrackId,
  partitionAudioFiles,
} from "../utils/audioFiles";
import { parseTrackName } from "../utils/parseTrackName";
import { readAudioMetadata } from "../utils/readAudioMetadata";
import {
  normalizeSongInfoDraft,
  type SongInfoDraft,
} from "../utils/songInfo";
import type { StoredTrackMetadata } from "../storage/indexedDb";

type UseLocalTracksOptions = {
  likedTrackNames: string[];
  onLikedTrackNamesChange: (names: string[]) => void;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
};

type LocalAudioFile = File & {
  path?: string;
  sourcePath?: string;
  localUrl?: string;
  sourceSize?: number;
  songInfo?: SongInfoDraft;
};

function preserveStoredText(storedValue?: string, currentValue?: string) {
  return storedValue?.trim() || currentValue;
}

function hasStoredMetadata(stored: StoredTrackMetadata) {
  return Boolean(
    stored.metadataLoaded ||
      stored.title?.trim() ||
      stored.artist?.trim() ||
      stored.album?.trim() ||
      stored.albumArtist?.trim() ||
      stored.year?.trim() ||
      stored.genre?.trim() ||
      stored.trackNumber?.trim() ||
      stored.discNumber?.trim() ||
      stored.comment?.trim() ||
      stored.composer?.trim() ||
      stored.coverDataUrl,
  );
}

export function useLocalTracks({
  likedTrackNames,
  onLikedTrackNamesChange,
  onError,
  onInfo,
}: UseLocalTracksOptions) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const tracksRef = useRef<Track[]>([]);
  const likedTrackNamesRef = useRef(likedTrackNames);

  const likedNameSet = useMemo(
    () => new Set(likedTrackNames),
    [likedTrackNames],
  );

  const revokeTrackUrls = useCallback((track: Track) => {
    if (track.localUrl.startsWith("blob:")) {
      URL.revokeObjectURL(track.localUrl);
    }

    if (track.coverUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(track.coverUrl);
    }

    if (track.artworkUrl?.startsWith("blob:") && track.artworkUrl !== track.coverUrl) {
      URL.revokeObjectURL(track.artworkUrl);
    }
  }, []);

  const revokeTrackArtworkUrls = useCallback((track: Track) => {
    if (track.coverUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(track.coverUrl);
    }

    if (track.artworkUrl?.startsWith("blob:") && track.artworkUrl !== track.coverUrl) {
      URL.revokeObjectURL(track.artworkUrl);
    }
  }, []);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    likedTrackNamesRef.current = likedTrackNames;
    setTracks((currentTracks) =>
      currentTracks.map((track) => ({
        ...track,
        liked: likedTrackNames.includes(track.name),
      })),
    );
  }, [likedTrackNames]);

  useEffect(() => {
    return () => {
      tracksRef.current.forEach(revokeTrackUrls);
    };
  }, [revokeTrackUrls]);

  const applyId3Tags = useCallback(async (trackId: string, file: File) => {
    try {
      const metadata = await readAudioMetadata(file);

      if (
        !metadata.title &&
        !metadata.artist &&
        !metadata.album &&
        !metadata.albumArtist &&
        !metadata.year &&
        !metadata.genre &&
        !metadata.trackNumber &&
        !metadata.discNumber &&
        !metadata.comment &&
        !metadata.composer &&
        !metadata.artworkBlob &&
        metadata.metadataLoaded
      ) {
        setTracks((currentTracks) =>
          currentTracks.map((track) =>
            track.id === trackId ? { ...track, metadataLoaded: true } : track,
          ),
        );
        return;
      }

      const artworkUrl = metadata.artworkBlob
        ? URL.createObjectURL(metadata.artworkBlob)
        : undefined;

      setTracks((currentTracks) => {
        const targetTrack = currentTracks.find((track) => track.id === trackId);

        if (!targetTrack) {
          if (artworkUrl) {
            URL.revokeObjectURL(artworkUrl);
          }

          return currentTracks;
        }

        if (targetTrack.metadataOverride) {
          if (artworkUrl) {
            URL.revokeObjectURL(artworkUrl);
          }
          return currentTracks;
        }

        if (artworkUrl) {
          revokeTrackArtworkUrls(targetTrack);
        }

        return currentTracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                title: metadata.title?.trim() || track.title,
                artist: metadata.artist?.trim() || track.artist,
                album: metadata.album?.trim() || track.album,
                albumArtist: metadata.albumArtist?.trim() || track.albumArtist,
                year: metadata.year?.trim() || track.year,
                genre: metadata.genre?.trim() || track.genre,
                trackNumber: metadata.trackNumber?.trim() || track.trackNumber,
                discNumber: metadata.discNumber?.trim() || track.discNumber,
                comment: metadata.comment?.trim() || track.comment,
                composer: metadata.composer?.trim() || track.composer,
                artworkUrl: artworkUrl || track.artworkUrl,
                coverUrl: artworkUrl || track.coverUrl,
                coverDataUrl: track.coverDataUrl,
                coverMimeType: metadata.coverMimeType || track.coverMimeType,
                metadataLoaded: metadata.metadataLoaded,
                metadataError: metadata.metadataError,
                metadataOverride: false,
              }
            : track,
        );
      });
    } catch {
      // Bad or unsupported ID3 data should never block local playback.
    }
  }, [revokeTrackArtworkUrls]);

  const replaceTrackSongInfo = useCallback(
    (trackId: string, draft: SongInfoDraft) => {
      const normalized = normalizeSongInfoDraft(draft);
      const createNextTrack = (track: Track): Track => {
        const parsed = parseTrackName(track.file?.name ?? track.name);

        return {
          ...track,
          title: normalized.title || parsed.title,
          artist: normalized.artist || parsed.artist,
          album: normalized.album || undefined,
          albumArtist: normalized.albumArtist || undefined,
          year: normalized.year || undefined,
          genre: normalized.genre || undefined,
          trackNumber: normalized.track || undefined,
          discNumber: normalized.disc || undefined,
          comment: normalized.comment || undefined,
          composer: normalized.composer || undefined,
          artworkUrl: normalized.coverDataUrl,
          coverUrl: normalized.coverDataUrl,
          coverDataUrl: normalized.coverDataUrl,
          coverMimeType: normalized.coverMimeType,
          metadataLoaded: true,
          metadataError: undefined,
          metadataOverride: false,
        };
      };
      const currentTrack = tracksRef.current.find((track) => track.id === trackId);

      if (!currentTrack) {
        return null;
      }

      if (normalized.coverDataUrl !== currentTrack.coverDataUrl) {
        revokeTrackArtworkUrls(currentTrack);
      }

      const nextTrack = createNextTrack(currentTrack);
      tracksRef.current = tracksRef.current.map((track) =>
        track.id === trackId ? nextTrack : track,
      );

      setTracks((currentTracks) =>
        currentTracks.map((track) => (track.id === trackId ? createNextTrack(track) : track)),
      );

      return nextTrack;
    },
    [revokeTrackArtworkUrls],
  );

  const reloadTrackMetadata = useCallback(
    async (trackId: string) => {
      const track = tracksRef.current.find((item) => item.id === trackId);

      if (!track?.file) {
        return false;
      }

      const metadata = await readAudioMetadata(track.file);
      const artworkUrl = metadata.artworkBlob
        ? URL.createObjectURL(metadata.artworkBlob)
        : undefined;
      const parsed = parseTrackName(track.file.name);

      setTracks((currentTracks) => {
        const targetTrack = currentTracks.find((item) => item.id === trackId);

        if (!targetTrack) {
          if (artworkUrl) URL.revokeObjectURL(artworkUrl);
          return currentTracks;
        }

        if (artworkUrl) {
          revokeTrackArtworkUrls(targetTrack);
        }

        return currentTracks.map((item) =>
          item.id === trackId
            ? {
                ...item,
                title: metadata.title?.trim() || parsed.title,
                artist: metadata.artist?.trim() || parsed.artist,
                album: metadata.album?.trim() || undefined,
                albumArtist: metadata.albumArtist?.trim() || undefined,
                year: metadata.year?.trim() || undefined,
                genre: metadata.genre?.trim() || undefined,
                trackNumber: metadata.trackNumber?.trim() || undefined,
                discNumber: metadata.discNumber?.trim() || undefined,
                comment: metadata.comment?.trim() || undefined,
                composer: metadata.composer?.trim() || undefined,
                artworkUrl,
                coverUrl: artworkUrl,
                coverDataUrl: undefined,
                coverMimeType: metadata.coverMimeType,
                metadataLoaded: metadata.metadataLoaded,
                metadataError: metadata.metadataError,
                metadataOverride: false,
              }
            : item,
        );
      });

      return metadata.metadataLoaded;
    },
    [revokeTrackArtworkUrls],
  );

  const applyStoredTrackMetadata = useCallback(
    (storedTracks: StoredTrackMetadata[]) => {
      if (storedTracks.length === 0) {
        return;
      }

      setTracks((currentTracks) => {
        let changed = false;
        const storedById = new Map(storedTracks.map((track) => [track.id, track]));
        const storedBySourcePath = new Map(
          storedTracks
            .filter((track) => track.sourcePath)
            .map((track) => [track.sourcePath as string, track]),
        );
        const storedByFileName = new Map(
          storedTracks
            .filter((track) => track.fileName)
            .map((track) => [track.fileName, track]),
        );

        const nextTracks = currentTracks.map((track) => {
          const stored =
            storedById.get(track.id) ??
            (track.sourcePath ? storedBySourcePath.get(track.sourcePath) : undefined) ??
            storedByFileName.get(track.file?.name ?? track.name);

          if (!stored) {
            return track;
          }

          if (track.sourcePath && !track.metadataOverride && track.metadataLoaded) {
            const nextTrack: Track = {
              ...track,
              duration: stored.duration ?? track.duration,
              lastPlayedAt: stored.lastPlayedAt,
              playCount: stored.playCount,
            };

            if (
              nextTrack.duration !== track.duration ||
              nextTrack.lastPlayedAt !== track.lastPlayedAt ||
              nextTrack.playCount !== track.playCount
            ) {
              changed = true;
              return nextTrack;
            }

            return track;
          }

          const nextTrack: Track = {
            ...track,
            title: preserveStoredText(stored.title, track.title) ?? track.title,
            artist: preserveStoredText(stored.artist, track.artist),
            album: preserveStoredText(stored.album, track.album),
            albumArtist: preserveStoredText(stored.albumArtist, track.albumArtist),
            year: preserveStoredText(stored.year, track.year),
            genre: preserveStoredText(stored.genre, track.genre),
            trackNumber: preserveStoredText(stored.trackNumber, track.trackNumber),
            discNumber: preserveStoredText(stored.discNumber, track.discNumber),
            comment: preserveStoredText(stored.comment, track.comment),
            composer: preserveStoredText(stored.composer, track.composer),
            duration: stored.duration ?? track.duration,
            lastPlayedAt: stored.lastPlayedAt,
            playCount: stored.playCount,
            coverDataUrl: stored.coverDataUrl,
            coverUrl: stored.coverDataUrl ?? track.coverUrl,
            artworkUrl: stored.coverDataUrl ?? track.artworkUrl,
            coverMimeType: stored.coverMimeType ?? track.coverMimeType,
            metadataLoaded: track.metadataLoaded || hasStoredMetadata(stored),
            metadataOverride: stored.metadataOverride,
          };

          if (
            nextTrack.title !== track.title ||
            nextTrack.artist !== track.artist ||
            nextTrack.album !== track.album ||
            nextTrack.albumArtist !== track.albumArtist ||
            nextTrack.year !== track.year ||
            nextTrack.genre !== track.genre ||
            nextTrack.trackNumber !== track.trackNumber ||
            nextTrack.discNumber !== track.discNumber ||
            nextTrack.comment !== track.comment ||
            nextTrack.composer !== track.composer ||
            nextTrack.coverDataUrl !== track.coverDataUrl
          ) {
            if (stored.coverDataUrl && stored.coverDataUrl !== track.coverDataUrl) {
              revokeTrackArtworkUrls(track);
            }
            changed = true;
            return nextTrack;
          }

          return track;
        });

        return changed ? nextTracks : currentTracks;
      });
    },
    [revokeTrackArtworkUrls],
  );

  const addFiles = useCallback(
    (inputFiles: FileList | File[]) => {
      const { audioFiles, rejectedFiles } = partitionAudioFiles(inputFiles);

      if (audioFiles.length === 0) {
        if (rejectedFiles.length > 0) {
          onError?.("這些檔案不是支援的音樂格式，水瓶罐子先幫你略過。");
        } else {
          onError?.("沒有讀到可加入的音樂檔。");
        }
        return [];
      }

      const existingSignatures = new Set(
        tracksRef.current
          .map((track) => track.file)
          .filter((file): file is File => Boolean(file))
          .map(createFileSignature),
      );

      const freshFiles = audioFiles.filter(
        (file) => !existingSignatures.has(createFileSignature(file)),
      );

      if (freshFiles.length === 0) {
        onInfo?.("這些音樂已經在歌單裡囉。");
        return [];
      }

      const now = Date.now();
      const nextTracks = freshFiles.map<Track>((file, index) => {
        const localFile = file as LocalAudioFile;
        const parsed = parseTrackName(file.name);
        const songInfo = localFile.songInfo ? normalizeSongInfoDraft(localFile.songInfo) : null;

        return {
          id: createSafeTrackId(file),
          file,
          name: parsed.name,
          title: songInfo?.title || parsed.title,
          artist: songInfo?.artist || parsed.artist,
          album: songInfo?.album || undefined,
          albumArtist: songInfo?.albumArtist || undefined,
          year: songInfo?.year || undefined,
          genre: songInfo?.genre || undefined,
          trackNumber: songInfo?.track || undefined,
          discNumber: songInfo?.disc || undefined,
          comment: songInfo?.comment || undefined,
          composer: songInfo?.composer || undefined,
          coverDataUrl: songInfo?.coverDataUrl,
          coverUrl: songInfo?.coverDataUrl,
          artworkUrl: songInfo?.coverDataUrl,
          coverMimeType: songInfo?.coverMimeType,
          size: localFile.sourceSize ?? file.size,
          type: file.type,
          sourcePath: localFile.sourcePath ?? localFile.path,
          localUrl: localFile.localUrl ?? URL.createObjectURL(file),
          metadataLoaded: Boolean(songInfo),
          liked: likedNameSet.has(parsed.name),
          addedAt: now + index,
        };
      });

      setTracks((currentTracks) => [...currentTracks, ...nextTracks]);

      nextTracks.forEach((track) => {
        if (track.file && track.localUrl.startsWith("blob:")) {
          void applyId3Tags(track.id, track.file);
        }
      });

      const ignoredMessage =
        rejectedFiles.length > 0 ? `，略過 ${rejectedFiles.length} 個非音樂檔` : "";
      onInfo?.(`已加入 ${nextTracks.length} 首音樂${ignoredMessage}。`);
      return nextTracks;
    },
    [applyId3Tags, likedNameSet, onError, onInfo],
  );

  const removeTrack = useCallback((trackId: string) => {
    setTracks((currentTracks) => {
      const trackToRemove = currentTracks.find((track) => track.id === trackId);

      if (trackToRemove) {
        revokeTrackUrls(trackToRemove);
      }

      return currentTracks.filter((track) => track.id !== trackId);
    });
  }, [revokeTrackUrls]);

  const clearTracks = useCallback(() => {
    setTracks((currentTracks) => {
      currentTracks.forEach(revokeTrackUrls);
      return [];
    });
    onInfo?.("播放清單已清空，本地音樂連結也釋放囉。");
  }, [onInfo, revokeTrackUrls]);

  const moveTrack = useCallback((fromIndex: number, toIndex: number) => {
    setTracks((currentTracks) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentTracks.length ||
        toIndex >= currentTracks.length
      ) {
        return currentTracks;
      }

      const nextTracks = [...currentTracks];
      const [movedTrack] = nextTracks.splice(fromIndex, 1);
      nextTracks.splice(toIndex, 0, movedTrack);
      return nextTracks.map((track, index) => ({ ...track, addedAt: Date.now() + index }));
    });
  }, []);

  const toggleLike = useCallback(
    (trackId: string) => {
      const track = tracksRef.current.find((item) => item.id === trackId);

      if (!track) {
        return;
      }

      const nextLikedNames = new Set(likedTrackNamesRef.current);

      if (track.liked) {
        nextLikedNames.delete(track.name);
      } else {
        nextLikedNames.add(track.name);
      }

      onLikedTrackNamesChange(Array.from(nextLikedNames));
    },
    [onLikedTrackNamesChange],
  );

  const setTrackDuration = useCallback((trackId: string, nextDuration: number) => {
    if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
      return;
    }

    setTracks((currentTracks) =>
      currentTracks.map((track) =>
        track.id === trackId && track.duration !== nextDuration
          ? { ...track, duration: nextDuration }
          : track,
      ),
    );
  }, []);

  const recordTrackPlayback = useCallback((trackId: string) => {
    setTracks((currentTracks) =>
      currentTracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              lastPlayedAt: Date.now(),
              playCount: (track.playCount ?? 0) + 1,
            }
          : track,
      ),
    );
  }, []);

  return {
    tracks,
    addFiles,
    removeTrack,
    clearTracks,
    moveTrack,
    toggleLike,
    setTrackDuration,
    recordTrackPlayback,
    replaceTrackSongInfo,
    reloadTrackMetadata,
    applyStoredTrackMetadata,
  };
}
