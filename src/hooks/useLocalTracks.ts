import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "../types/track";
import { applyName } from "../config/characterName";
import {
  createFileSignature,
  createSafeTrackId,
  isSupportedAudioPath,
  partitionAudioFiles,
} from "../utils/audioFiles";
import { parseTrackName } from "../utils/parseTrackName";
import { createTimedBatcher, runManualImportQueue, type TimedBatcher } from "../utils/manualImportQueue";
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
  onTrackMetadataBatchComplete?: (tracks: Track[]) => void;
};

type LocalAudioFile = File & {
  path?: string;
  sourcePath?: string;
  localUrl?: string;
  sourceSize?: number;
  songInfo?: SongInfoDraft;
};

type AddFilesOptions = {
  isCanceled?: () => boolean;
  onMetadataProgress?: (progress: { completed: number; total: number }) => void;
  onMetadataComplete?: (result: { canceled: boolean }) => void;
};

type PendingMetadataUpdate = {
  trackId: string;
  createNextTrack: (track: Track) => Track;
  discard: () => void;
};

const METADATA_BATCH_DELAY_MS = 100;

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
      stored.coverDataUrl ||
      stored.coverHash,
  );
}

function createMovedTrackAddedAt(tracksWithoutMoved: Track[], toIndex: number) {
  const previousAddedAt = tracksWithoutMoved[toIndex - 1]?.addedAt;
  const nextAddedAt = tracksWithoutMoved[toIndex]?.addedAt;

  if (
    typeof previousAddedAt === "number" &&
    typeof nextAddedAt === "number" &&
    Number.isFinite(previousAddedAt) &&
    Number.isFinite(nextAddedAt) &&
    nextAddedAt > previousAddedAt
  ) {
    return previousAddedAt + (nextAddedAt - previousAddedAt) / 2;
  }

  if (typeof previousAddedAt === "number" && Number.isFinite(previousAddedAt)) {
    return previousAddedAt + 1;
  }

  if (typeof nextAddedAt === "number" && Number.isFinite(nextAddedAt)) {
    return nextAddedAt - 1;
  }

  return Date.now();
}

function orderTracksForReorder(currentTracks: Track[], orderedTrackIds?: string[]) {
  if (!orderedTrackIds || orderedTrackIds.length !== currentTracks.length) {
    return currentTracks;
  }

  const tracksById = new Map(currentTracks.map((track) => [track.id, track]));
  const orderedTracks = orderedTrackIds
    .map((trackId) => tracksById.get(trackId))
    .filter((track): track is Track => Boolean(track));

  return orderedTracks.length === currentTracks.length ? orderedTracks : currentTracks;
}

export function useLocalTracks({
  likedTrackNames,
  onLikedTrackNamesChange,
  onError,
  onInfo,
  onTrackMetadataBatchComplete,
}: UseLocalTracksOptions) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const tracksRef = useRef<Track[]>([]);
  const likedTrackNamesRef = useRef(likedTrackNames);
  const storedMetadataApplyCountRef = useRef(0);
  const metadataBatchersRef = useRef(new Set<TimedBatcher<PendingMetadataUpdate>>());
  const metadataGenerationRef = useRef(0);

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

  const invalidateMetadataJobs = useCallback(() => {
    metadataGenerationRef.current += 1;
    metadataBatchersRef.current.forEach((batcher) => batcher.dispose());
    metadataBatchersRef.current.clear();
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
      invalidateMetadataJobs();
      tracksRef.current.forEach(revokeTrackUrls);
    };
  }, [invalidateMetadataJobs, revokeTrackUrls]);

  const readId3Tags = useCallback(async (track: Track & { file: File }) => {
    try {
      const metadata = await readAudioMetadata(track.file);

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
        return {
          trackId: track.id,
          createNextTrack: (currentTrack: Track) => ({ ...currentTrack, metadataLoaded: true }),
          discard: () => {},
        };
      }

      const artworkUrl = metadata.artworkBlob
        ? URL.createObjectURL(metadata.artworkBlob)
        : undefined;

      if (track.metadataOverride) {
        if (artworkUrl) {
          URL.revokeObjectURL(artworkUrl);
        }
        return null;
      }

      return {
        trackId: track.id,
        createNextTrack: (currentTrack: Track) => ({
          ...currentTrack,
          title: metadata.title?.trim() || currentTrack.title,
          artist: metadata.artist?.trim() || currentTrack.artist,
          album: metadata.album?.trim() || currentTrack.album,
          albumArtist: metadata.albumArtist?.trim() || currentTrack.albumArtist,
          year: metadata.year?.trim() || currentTrack.year,
          genre: metadata.genre?.trim() || currentTrack.genre,
          trackNumber: metadata.trackNumber?.trim() || currentTrack.trackNumber,
          discNumber: metadata.discNumber?.trim() || currentTrack.discNumber,
          comment: metadata.comment?.trim() || currentTrack.comment,
          composer: metadata.composer?.trim() || currentTrack.composer,
          artworkUrl: artworkUrl || currentTrack.artworkUrl,
          coverUrl: artworkUrl || currentTrack.coverUrl,
          coverDataUrl: currentTrack.coverDataUrl,
          coverMimeType: metadata.coverMimeType || currentTrack.coverMimeType,
          coverHash: currentTrack.coverHash,
          metadataLoaded: metadata.metadataLoaded,
          metadataError: metadata.metadataError,
          metadataOverride: false,
        }),
        discard: () => {
          if (artworkUrl) URL.revokeObjectURL(artworkUrl);
        },
      };
    } catch {
      // Bad or unsupported ID3 data should never block local playback.
      return null;
    }
  }, []);

  const replaceTrackSongInfo = useCallback(
    (
      trackId: string,
      draft: SongInfoDraft,
      options: { metadataOverride?: boolean } = {},
    ) => {
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
          coverHash: normalized.coverHash,
          metadataLoaded: true,
          metadataError: undefined,
          metadataOverride: options.metadataOverride ?? false,
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

      const targetTrack = tracksRef.current.find((item) => item.id === trackId);

      if (!targetTrack) {
        if (artworkUrl) URL.revokeObjectURL(artworkUrl);
        return null;
      }

      if (artworkUrl) {
        revokeTrackArtworkUrls(targetTrack);
      }

      const createNextTrack = (track: Track): Track => ({
        ...track,
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
        coverHash: undefined,
        metadataLoaded: metadata.metadataLoaded,
        metadataError: metadata.metadataError,
        metadataOverride: false,
      });
      const nextTrack = createNextTrack(targetTrack);

      tracksRef.current = tracksRef.current.map((item) =>
        item.id === trackId ? nextTrack : item,
      );
      setTracks((currentTracks) =>
        currentTracks.map((item) => (item.id === trackId ? createNextTrack(item) : item)),
      );

      return metadata.metadataLoaded ? nextTrack : null;
    },
    [revokeTrackArtworkUrls],
  );

  const applyStoredTrackMetadata = useCallback(
    (storedTracks: StoredTrackMetadata[]) => {
      if (storedTracks.length === 0) {
        return;
      }

      storedMetadataApplyCountRef.current += 1;
      if (process.env.NODE_ENV !== "production" && storedMetadataApplyCountRef.current > 1) {
        console.warn(
          "[Aquariusgirl] applyStoredTrackMetadata called more than once in one run; check for storedTracks feedback loops.",
        );
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
            coverHash: stored.coverHash ?? track.coverHash,
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
            nextTrack.coverDataUrl !== track.coverDataUrl ||
            nextTrack.coverHash !== track.coverHash
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
    (inputFiles: FileList | File[], options: AddFilesOptions = {}) => {
      const { audioFiles, rejectedFiles } = partitionAudioFiles(inputFiles);

      if (audioFiles.length === 0) {
        if (rejectedFiles.length > 0) {
          onError?.(applyName("這些檔案不是支援的音樂格式，{name}先幫你略過。"));
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

      invalidateMetadataJobs();
      const metadataGeneration = metadataGenerationRef.current;

      const now = Date.now();
      const nextTracks = freshFiles.map<Track>((file, index) => {
        const localFile = file as LocalAudioFile;
        const parsed = parseTrackName(file.name);
        const songInfo = localFile.songInfo ? normalizeSongInfoDraft(localFile.songInfo) : null;
        const sourcePathCandidate = localFile.sourcePath ?? localFile.path;
        const sourcePath =
          sourcePathCandidate && isSupportedAudioPath(sourcePathCandidate)
            ? sourcePathCandidate
            : undefined;

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
          coverHash: songInfo?.coverHash,
          coverMimeType: songInfo?.coverMimeType,
          size: localFile.sourceSize ?? file.size,
          type: file.type,
          sourcePath,
          localUrl: localFile.localUrl ?? URL.createObjectURL(file),
          metadataLoaded: Boolean(songInfo),
          liked: likedNameSet.has(parsed.name),
          addedAt: now + index,
        };
      });

      const tracksWithNewFiles = [...tracksRef.current, ...nextTracks];
      tracksRef.current = tracksWithNewFiles;
      setTracks(tracksWithNewFiles);

      const metadataTracks = nextTracks.filter(
        (track): track is Track & { file: File } =>
          Boolean(track.file) && track.localUrl.startsWith("blob:"),
      );
      // ponytail: cap metadata state commits at 100 batches; only tune for earlier metadata if profiling proves it necessary.
      const metadataBatcher = createTimedBatcher<PendingMetadataUpdate>({
        delayMs: METADATA_BATCH_DELAY_MS,
        minimumBatchSize: Math.ceil(metadataTracks.length / 100),
        keyFor: (update) => update.trackId,
        onFlush: (updates) => {
          if (metadataGeneration !== metadataGenerationRef.current) {
            updates.forEach((update) => update.discard());
            return;
          }

          const updatesByTrackId = new Map(updates.map((update) => [update.trackId, update]));

          const updatedTracks: Track[] = [];
          const nextTracksAfterMetadata = tracksRef.current.map((currentTrack) => {
            const update = updatesByTrackId.get(currentTrack.id);
            if (!update) return currentTrack;
            updatesByTrackId.delete(currentTrack.id);

            if (currentTrack.metadataOverride) {
              update.discard();
              return currentTrack;
            }

            const nextTrack = update.createNextTrack(currentTrack);
            if (nextTrack.coverUrl !== currentTrack.coverUrl || nextTrack.artworkUrl !== currentTrack.artworkUrl) {
              revokeTrackArtworkUrls(currentTrack);
            }
            updatedTracks.push(nextTrack);
            return nextTrack;
          });

          updatesByTrackId.forEach((update) => update.discard());
          if (updatedTracks.length === 0) return;
          tracksRef.current = nextTracksAfterMetadata;
          setTracks(nextTracksAfterMetadata);
          onTrackMetadataBatchComplete?.(updatedTracks);
        },
        onDiscard: (updates) => updates.forEach((update) => update.discard()),
      });
      metadataBatchersRef.current.add(metadataBatcher);
      void runManualImportQueue({
        items: metadataTracks,
        limit: 2,
        worker: (track) => readId3Tags(track),
        isCanceled: () => Boolean(options.isCanceled?.()) || metadataGeneration !== metadataGenerationRef.current,
        shouldDiscardResult: () => metadataGeneration !== metadataGenerationRef.current,
        onResult: (update) => {
          if (update) metadataBatcher.add(update);
        },
        onDiscardResult: (update) => update?.discard(),
        onProgress: (progress) => {
          if (metadataGeneration === metadataGenerationRef.current) {
            options.onMetadataProgress?.(progress);
          }
        },
      }).then(({ canceled }) => {
        if (metadataGeneration !== metadataGenerationRef.current) return;
        metadataBatcher.flush();
        metadataBatchersRef.current.delete(metadataBatcher);
        options.onMetadataComplete?.({ canceled });
      });

      const ignoredMessage =
        rejectedFiles.length > 0 ? `，略過 ${rejectedFiles.length} 個非音樂檔` : "";
      onInfo?.(`已加入 ${nextTracks.length} 首音樂${ignoredMessage}。`);
      return nextTracks;
    },
    [invalidateMetadataJobs, likedNameSet, onError, onInfo, onTrackMetadataBatchComplete, readId3Tags, revokeTrackArtworkUrls],
  );

  const removeTrack = useCallback((trackId: string) => {
    const trackToRemove = tracksRef.current.find((track) => track.id === trackId);
    if (trackToRemove) revokeTrackUrls(trackToRemove);
    const nextTracks = tracksRef.current.filter((track) => track.id !== trackId);
    tracksRef.current = nextTracks;
    setTracks(nextTracks);
  }, [revokeTrackUrls]);

  const clearTracks = useCallback(() => {
    invalidateMetadataJobs();
    tracksRef.current.forEach(revokeTrackUrls);
    tracksRef.current = [];
    setTracks([]);
    onInfo?.("播放清單已清空，本地音樂連結也釋放囉。");
  }, [invalidateMetadataJobs, onInfo, revokeTrackUrls]);

  const moveTrack = useCallback((fromIndex: number, toIndex: number, orderedTrackIds?: string[]) => {
    const currentTracks = orderTracksForReorder(tracksRef.current, orderedTrackIds);
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentTracks.length ||
      toIndex >= currentTracks.length
    ) {
      return null;
    }

    const nextTracks = [...currentTracks];
    const [movedTrack] = nextTracks.splice(fromIndex, 1);
    const nextMovedTrack = {
      ...movedTrack,
      addedAt: createMovedTrackAddedAt(nextTracks, toIndex),
    };
    nextTracks.splice(toIndex, 0, nextMovedTrack);
    tracksRef.current = nextTracks;
    setTracks(nextTracks);
    return nextMovedTrack;
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
      return false;
    }

    const currentTrack = tracksRef.current.find((track) => track.id === trackId);
    if (!currentTrack || currentTrack.duration === nextDuration) {
      return false;
    }

    tracksRef.current = tracksRef.current.map((track) =>
      track.id === trackId ? { ...track, duration: nextDuration } : track,
    );
    setTracks((currentTracks) =>
      currentTracks.map((track) =>
        track.id === trackId && track.duration !== nextDuration
          ? { ...track, duration: nextDuration }
          : track,
      ),
    );

    return true;
  }, []);

  const recordTrackPlayback = useCallback((trackId: string) => {
    const currentTrack = tracksRef.current.find((track) => track.id === trackId);
    if (!currentTrack) {
      return null;
    }

    const patch = {
      lastPlayedAt: Date.now(),
      playCount: (currentTrack.playCount ?? 0) + 1,
    };

    tracksRef.current = tracksRef.current.map((track) =>
      track.id === trackId ? { ...track, ...patch } : track,
    );
    setTracks((currentTracks) =>
      currentTracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              ...patch,
            }
          : track,
      ),
    );

    return patch;
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
