import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "../types/track";
import {
  createFileSignature,
  createSafeTrackId,
  partitionAudioFiles,
} from "../utils/audioFiles";
import { parseTrackName } from "../utils/parseTrackName";
import { readAudioMetadata } from "../utils/readAudioMetadata";

type UseLocalTracksOptions = {
  likedTrackNames: string[];
  onLikedTrackNamesChange: (names: string[]) => void;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
};

type LocalAudioFile = File & {
  path?: string;
  sourcePath?: string;
};

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
    URL.revokeObjectURL(track.localUrl);

    if (track.coverUrl) {
      URL.revokeObjectURL(track.coverUrl);
    }

    if (track.artworkUrl && track.artworkUrl !== track.coverUrl) {
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

        if (targetTrack.coverUrl && artworkUrl) {
          URL.revokeObjectURL(targetTrack.coverUrl);
        }

        if (targetTrack.artworkUrl && artworkUrl && targetTrack.artworkUrl !== targetTrack.coverUrl) {
          URL.revokeObjectURL(targetTrack.artworkUrl);
        }

        return currentTracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                title: metadata.title?.trim() || track.title,
                artist: metadata.artist?.trim() || track.artist,
                album: metadata.album?.trim() || track.album,
                year: metadata.year?.trim() || track.year,
                genre: metadata.genre?.trim() || track.genre,
                trackNumber: metadata.trackNumber?.trim() || track.trackNumber,
                artworkUrl: artworkUrl || track.artworkUrl,
                coverUrl: artworkUrl || track.coverUrl,
                coverMimeType: metadata.coverMimeType || track.coverMimeType,
                metadataLoaded: metadata.metadataLoaded,
                metadataError: metadata.metadataError,
              }
            : track,
        );
      });
    } catch {
      // Bad or unsupported ID3 data should never block local playback.
    }
  }, []);

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

        return {
          id: createSafeTrackId(file),
          file,
          name: parsed.name,
          title: parsed.title,
          artist: parsed.artist,
          size: file.size,
          type: file.type,
          sourcePath: localFile.sourcePath ?? localFile.path,
          localUrl: URL.createObjectURL(file),
          metadataLoaded: false,
          liked: likedNameSet.has(parsed.name),
          addedAt: now + index,
        };
      });

      setTracks((currentTracks) => [...currentTracks, ...nextTracks]);

      nextTracks.forEach((track) => {
        if (track.file) {
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
  };
}
