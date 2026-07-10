import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RepeatMode, Track } from "../types/track";
import { STORAGE_KEYS, useLocalStorage } from "./useLocalStorage";
import { applyName } from "../config/characterName";

type UseAudioPlayerOptions = {
  tracks: Track[];
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
  onTrackDuration?: (trackId: string, duration: number) => void;
  stopAfterCurrentTrack?: boolean;
  onStopAfterCurrentTrack?: () => void;
};

function clampVolume(value: number) {
  if (!Number.isFinite(value)) {
    return 0.72;
  }

  return Math.min(1, Math.max(0, value));
}

function resolveAutoplay(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

// ponytail: play() 失敗要分兩種病：NotAllowedError 才是「被阻擋」；其他（多半是節點沒音源）提示重試，不再誤報瀏覽器阻擋。
function describePlayError(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError"
    ? "系統暫時阻擋播放，請再點一次播放按鈕。"
    : "音源載入失敗，請再點一次播放；還是不行就重新選這首歌。";
}

export function useAudioPlayer({
  tracks,
  onError,
  onInfo,
  onTrackDuration,
  stopAfterCurrentTrack = false,
  onStopAfterCurrentTrack,
}: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadedTrackSourceRef = useRef("");
  const loadedTrackIdRef = useRef<string | null>(null);
  // ponytail: 自癒保險用——ref 記最後播放位置（不觸發 re-render）；寫檔暫停期間禁止自癒重掛，避免重新鎖檔。
  const lastPlaybackTimeRef = useRef(0);
  const suspendedForWriteRef = useRef(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeValue] = useLocalStorage<number>(
    STORAGE_KEYS.volume,
    0.72,
  );
  const [muted, setMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useLocalStorage<RepeatMode>(
    STORAGE_KEYS.repeatMode,
    "none",
  );
  const [shuffle, setShuffle] = useLocalStorage<boolean>(
    STORAGE_KEYS.shuffle,
    false,
  );

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [currentTrackId, tracks],
  );
  const currentTrackSource = useMemo(() => {
    if (!currentTrack) {
      return "";
    }

    return currentTrack.mediaVersion && currentTrack.localUrl.startsWith("file:")
      ? `${currentTrack.localUrl}?v=${currentTrack.mediaVersion}`
      : currentTrack.localUrl;
  }, [currentTrack?.localUrl, currentTrack?.mediaVersion]);

  const getTrackIndex = useCallback(
    (trackId: string | null) =>
      trackId ? tracks.findIndex((track) => track.id === trackId) : -1,
    [tracks],
  );

  const getRandomTrackId = useCallback(
    (excludeTrackId?: string | null) => {
      if (tracks.length === 0) {
        return null;
      }

      const candidates =
        tracks.length > 1
          ? tracks.filter((track) => track.id !== excludeTrackId)
          : tracks;

      return candidates[Math.floor(Math.random() * candidates.length)]?.id ?? null;
    },
    [tracks],
  );

  const playAudioElement = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !currentTrackSource) {
      onError?.(applyName("先放幾首音樂進水池，{name}才有歌可以播。"));
      setIsPlaying(false);
      return false;
    }

    // ponytail: 自癒保險——<audio> 節點若曾被重建（JSX 樹位置回歸）會遺失 src，refs 卻仍以為已載入。
    // 播放前偵測「有歌但節點沒音源」就重掛音源＋恢復位置；寫檔暫停期間不啟動，避免重新鎖住原始檔。
    if (!audio.src && !suspendedForWriteRef.current) {
      const resumeAt = lastPlaybackTimeRef.current;
      audio.src = currentTrackSource;
      loadedTrackSourceRef.current = currentTrackSource;
      loadedTrackIdRef.current = currentTrackId;
      audio.load();
      if (resumeAt > 0) {
        audio.addEventListener(
          "loadedmetadata",
          () => {
            audio.currentTime = resumeAt;
          },
          { once: true },
        );
      }
    }

    try {
      await audio.play();
      setIsPlaying(true);
      return true;
    } catch (error) {
      setIsPlaying(false);
      onError?.(describePlayError(error));
      return false;
    }
  }, [currentTrackId, currentTrackSource, onError]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const suspendAudioForFileWrite = useCallback((trackId: string) => {
    const audio = audioRef.current;

    // ponytail: Windows locks a file while <audio> has it loaded, so rename-over-original fails mid-playback.
    // Detach to release the OS handle and hand the caller a restore function; no-op when the edited track is not the loaded one.
    if (!audio || loadedTrackIdRef.current !== trackId || !loadedTrackSourceRef.current) {
      return () => {};
    }

    const source = loadedTrackSourceRef.current;
    const position = audio.currentTime;
    const wasPlaying = !audio.paused;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    suspendedForWriteRef.current = true;

    return () => {
      suspendedForWriteRef.current = false;
      audio.src = source;
      audio.load();
      audio.addEventListener(
        "loadedmetadata",
        () => {
          audio.currentTime = position;

          if (wasPlaying) {
            void audio.play().catch(() => setIsPlaying(false));
          }
        },
        { once: true },
      );
    };
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    loadedTrackSourceRef.current = "";
    loadedTrackIdRef.current = null;
    lastPlaybackTimeRef.current = 0;
    setCurrentTrackId(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  const selectTrack = useCallback(
    (trackId: string, autoplay: unknown = true) => {
      const shouldAutoplay = resolveAutoplay(autoplay, true);

      if (!tracks.some((track) => track.id === trackId)) {
        return;
      }

      if (trackId === currentTrackId && shouldAutoplay) {
        void playAudioElement();
        return;
      }

      setCurrentTrackId(trackId);
      setCurrentTime(0);
      setDuration(tracks.find((track) => track.id === trackId)?.duration ?? 0);
      setIsPlaying(shouldAutoplay);
    },
    [currentTrackId, playAudioElement, tracks],
  );

  const play = useCallback(() => {
    if (tracks.length === 0) {
      onError?.("播放清單是空的，先加入本地音樂檔吧。");
      return;
    }

    if (!currentTrackId) {
      selectTrack(tracks[0].id, true);
      return;
    }

    void playAudioElement();
  }, [currentTrackId, onError, playAudioElement, selectTrack, tracks]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    // ponytail: 自癒保險——狀態以為在播、節點卻沒音源（節點曾被重建）時，第一下應該是「重新播放」而不是把壞狀態切成暫停。
    if (
      isPlaying &&
      audio &&
      !audio.src &&
      currentTrackSource &&
      !suspendedForWriteRef.current
    ) {
      void playAudioElement();
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [currentTrackSource, isPlaying, pause, play, playAudioElement]);

  const next = useCallback(
    (autoplay: unknown = isPlaying) => {
      const shouldAutoplay = resolveAutoplay(autoplay, isPlaying);

      if (tracks.length === 0) {
        onError?.("播放清單是空的，沒有下一首可以切。");
        return;
      }

      if (shuffle) {
        const nextTrackId = getRandomTrackId(currentTrackId);
        if (nextTrackId) {
          selectTrack(nextTrackId, shouldAutoplay);
        }
        return;
      }

      const currentIndex = getTrackIndex(currentTrackId);
      const nextTrackId =
        currentIndex >= 0 && currentIndex < tracks.length - 1
          ? tracks[currentIndex + 1].id
          : tracks[0].id;

      selectTrack(nextTrackId, shouldAutoplay);
    },
    [
      currentTrackId,
      getRandomTrackId,
      getTrackIndex,
      isPlaying,
      onError,
      selectTrack,
      shuffle,
      tracks,
    ],
  );

  const previous = useCallback(
    (autoplay: unknown = isPlaying) => {
      const shouldAutoplay = resolveAutoplay(autoplay, isPlaying);

      if (tracks.length === 0) {
        onError?.("播放清單是空的，沒有上一首可以切。");
        return;
      }

      const audio = audioRef.current;

      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        setCurrentTime(0);
        return;
      }

      const currentIndex = getTrackIndex(currentTrackId);
      const previousTrackId =
        currentIndex > 0
          ? tracks[currentIndex - 1].id
          : tracks[tracks.length - 1].id;

      selectTrack(previousTrackId, shouldAutoplay);
    },
    [currentTrackId, getTrackIndex, isPlaying, onError, selectTrack, tracks],
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(seconds)) {
      return;
    }

    const safeSeconds = Math.min(Math.max(seconds, 0), audio.duration || seconds);
    audio.currentTime = safeSeconds;
    lastPlaybackTimeRef.current = safeSeconds;
    setCurrentTime(safeSeconds);
  }, []);

  const setVolume = useCallback(
    (nextVolume: number) => {
      const safeVolume = clampVolume(nextVolume);
      setVolumeValue(safeVolume);

      if (safeVolume > 0 && muted) {
        setMuted(false);
      }
    },
    [muted, setVolumeValue],
  );

  const toggleMute = useCallback(() => {
    setMuted((currentMuted) => !currentMuted);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((enabled) => {
      const nextValue = !enabled;
      onInfo?.(nextValue ? "隨機播放開啟。" : "隨機播放關閉。");
      return nextValue;
    });
  }, [onInfo, setShuffle]);

  const setShuffleEnabled = useCallback(
    (enabled: boolean) => {
      setShuffle(enabled);
    },
    [setShuffle],
  );

  const setRepeatModeValue = useCallback(
    (mode: RepeatMode) => {
      setRepeatMode(mode);
    },
    [setRepeatMode],
  );

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((mode) => {
      const nextMode: RepeatMode =
        mode === "none" ? "all" : mode === "all" ? "one" : "none";
      const label =
        nextMode === "one"
          ? "單曲循環"
          : nextMode === "all"
            ? "全部循環"
            : "不循環";
      onInfo?.(`循環模式：${label}。`);
      return nextMode;
    });
  }, [onInfo, setRepeatMode]);

  const handleEnded = useCallback(() => {
    const audio = audioRef.current;

    if (stopAfterCurrentTrack) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audio) {
        audio.currentTime = 0;
      }
      onStopAfterCurrentTrack?.();
      return;
    }

    if (repeatMode === "one" && audio) {
      audio.currentTime = 0;
      void audio.play().catch((error: unknown) => {
        setIsPlaying(false);
        onError?.(describePlayError(error));
      });
      return;
    }

    if (shuffle && tracks.length > 1) {
      const randomTrackId = getRandomTrackId(currentTrackId);
      if (randomTrackId) {
        selectTrack(randomTrackId, true);
      }
      return;
    }

    const currentIndex = getTrackIndex(currentTrackId);
    const hasNextTrack = currentIndex >= 0 && currentIndex < tracks.length - 1;

    if (hasNextTrack) {
      selectTrack(tracks[currentIndex + 1].id, true);
      return;
    }

    if (repeatMode === "all" && tracks.length > 0) {
      selectTrack(tracks[0].id, true);
      return;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    if (audio) {
      audio.currentTime = 0;
    }
  }, [
    currentTrackId,
    getRandomTrackId,
    getTrackIndex,
    onError,
    onStopAfterCurrentTrack,
    repeatMode,
    selectTrack,
    shuffle,
    stopAfterCurrentTrack,
    tracks,
  ]);

  const handleLoadedMetadata = useCallback(
    (event: SyntheticEvent<HTMLAudioElement>) => {
      const nextDuration = event.currentTarget.duration;
      setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);

      if (currentTrackId && Number.isFinite(nextDuration)) {
        onTrackDuration?.(currentTrackId, nextDuration);
      }
    },
    [currentTrackId, onTrackDuration],
  );

  const handleTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLAudioElement>) => {
      const nextTime = event.currentTarget.currentTime || 0;
      lastPlaybackTimeRef.current = nextTime;
      setCurrentTime(nextTime);
    },
    [],
  );

  const handleAudioError = useCallback(() => {
    setIsPlaying(false);
    onError?.(applyName("這首音樂檔無法播放，{name}先暫停一下。"));
  }, [onError]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = clampVolume(volume);
    audio.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!currentTrackSource) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      loadedTrackSourceRef.current = "";
      loadedTrackIdRef.current = null;
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // ponytail: audio.src is browser-normalized; compare only the source we assigned so metadata updates do not reload playback.
    if (loadedTrackSourceRef.current !== currentTrackSource) {
      if (
        process.env.NODE_ENV !== "production" &&
        loadedTrackIdRef.current === currentTrackId &&
        loadedTrackSourceRef.current
      ) {
        console.warn(
          "[Aquariusgirl] audio.load called for the same track after its source changed; verify metadata or cover-only updates did not change localUrl/mediaVersion.",
        );
      }
      audio.src = currentTrackSource;
      loadedTrackSourceRef.current = currentTrackSource;
      loadedTrackIdRef.current = currentTrackId;
      audio.load();
      lastPlaybackTimeRef.current = 0;
      setCurrentTime(0);
    }
  }, [currentTrackId, currentTrackSource]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrackSource) {
      return;
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    void audio.play().catch((error: unknown) => {
      setIsPlaying(false);
      onError?.(describePlayError(error));
    });
  }, [currentTrackSource, isPlaying, onError]);

  useEffect(() => {
    if (tracks.length === 0) {
      stop();
      return;
    }

    if (currentTrackId && !tracks.some((track) => track.id === currentTrackId)) {
      setCurrentTrackId(tracks[0]?.id ?? null);
      setIsPlaying(false);
    }
  }, [currentTrackId, stop, tracks]);

  return {
    audioRef,
    audioElementProps: {
      onEnded: handleEnded,
      onError: handleAudioError,
      onLoadedMetadata: handleLoadedMetadata,
      onTimeUpdate: handleTimeUpdate,
    },
    currentTrackId,
    currentTrack,
    isPlaying,
    volume: clampVolume(volume),
    muted,
    currentTime,
    duration,
    repeatMode,
    shuffle,
    play,
    pause,
    stop,
    suspendAudioForFileWrite,
    togglePlay,
    previous,
    next,
    selectTrack,
    seek,
    setVolume,
    setRepeatMode: setRepeatModeValue,
    setShuffle: setShuffleEnabled,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  };
}
