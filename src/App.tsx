import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "./components/AppLayout";
import {
  AIAssistantPanel,
  type AIPlaylistAddResult,
  type AIPlaylistCreateDetails,
  type AIPlaylistCreateResult,
} from "./components/AIAssistantPanel";
import { BackgroundAura } from "./components/BackgroundAura";
import { CharacterStage } from "./components/CharacterStage";
import { DropZone } from "./components/DropZone";
import { Header } from "./components/Header";
import { ImportExportPanel } from "./components/ImportExportPanel";
import { ImageSettingsDialog } from "./components/ImageSettingsDialog";
import { MessageToast } from "./components/MessageToast";
import { MiniPlayer } from "./components/MiniPlayer";
import { MiniPlayerAssistant } from "./components/MiniPlayerAssistant";
import { ObsOverlay } from "./components/ObsOverlay";
import { Onboarding } from "./components/Onboarding";
import { PlayerCore } from "./components/PlayerCore";
import { PlaylistDuplicateDialog } from "./components/PlaylistDuplicateDialog";
import { PlaylistPanel } from "./components/PlaylistPanel";
import { PlaylistDeleteDialog } from "./components/PlaylistDeleteDialog";
import { PlaylistManager } from "./components/PlaylistManager";
import { PlaylistNameDialog } from "./components/PlaylistNameDialog";
import { PlaylistSidebar } from "./components/PlaylistSidebar";
import { SleepTimer } from "./components/SleepTimer";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { SongInfoPanel } from "./components/SongInfoPanel";
import { SmartPlaylistEditorDialog } from "./components/SmartPlaylistEditorDialog";
import {
  BrandAssetsContext,
  brandAssets,
  type BrandAssets,
} from "./config/brandAssets";
import { useAppMode } from "./hooks/useAppMode";
import { useAudioAnalyser } from "./hooks/useAudioAnalyser";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useFileSystemAccess } from "./hooks/useFileSystemAccess";
import { STORAGE_KEYS, useLocalStorage } from "./hooks/useLocalStorage";
import { useLocalTracks } from "./hooks/useLocalTracks";
import { useMusicLibraryDb } from "./hooks/useMusicLibraryDb";
import { useOnboarding } from "./hooks/useOnboarding";
import { usePlaylists } from "./hooks/usePlaylists";
import { useSleepTimer } from "./hooks/useSleepTimer";
import { SYSTEM_PLAYLIST_IDS, type NormalPlaylist, type Playlist } from "./types/playlist";
import type { SortMode, Track } from "./types/track";
import type { RepeatMode } from "./types/track";
import type {
  AudioVisualizerSettings,
  MiniPlayerSettings,
  ThemeColorSettings,
  WindowBounds,
  WindowBoundsState,
} from "./types/settings";
import {
  defaultAudioVisualizerSettings,
  defaultMiniPlayerSettings,
  defaultThemeColorSettings,
} from "./types/settings";
import { createExportPayload, downloadJsonFile, getExportFileName } from "./utils/exportSettings";
import {
  type ImportedSettings,
  type ImportedTrackMetadata,
  parseImportedSettings,
  summarizeImportedSettings,
} from "./utils/importSettings";
import { createPlayerBroadcastChannel, writePlayerStateToStorage } from "./utils/playerBroadcast";
import {
  isElectronRuntime,
  type CustomImages,
  type CustomImageSlot,
} from "./utils/platform";
import { isSupportedOriginalWriteFormat, type SongInfoDraft } from "./utils/songInfo";

function sortTracks(tracks: Track[], sortMode: SortMode) {
  const nextTracks = [...tracks];

  if (sortMode === "title") {
    return nextTracks.sort((a, b) => a.title.localeCompare(b.title, "zh-Hant"));
  }

  if (sortMode === "artist") {
    return nextTracks.sort((a, b) => (a.artist ?? "").localeCompare(b.artist ?? "", "zh-Hant"));
  }

  if (sortMode === "album") {
    return nextTracks.sort((a, b) => (a.album ?? "").localeCompare(b.album ?? "", "zh-Hant"));
  }

  if (sortMode === "durationAsc") {
    return nextTracks.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
  }

  if (sortMode === "durationDesc") {
    return nextTracks.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
  }

  if (sortMode === "filename") {
    return nextTracks.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  }

  return nextTracks.sort((a, b) => a.addedAt - b.addedAt);
}

function isRepeatMode(value: unknown): value is RepeatMode {
  return value === "none" || value === "one" || value === "all";
}

function isSortMode(value: unknown): value is SortMode {
  return (
    value === "addedAt" ||
    value === "title" ||
    value === "filename" ||
    value === "artist" ||
    value === "album" ||
    value === "durationAsc" ||
    value === "durationDesc"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clampMiniOpacity(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0.2, value))
    : defaultMiniPlayerSettings.opacity;
}

function resolveThemeColorSettings(value: unknown): ThemeColorSettings {
  const stored = isRecord(value) ? value : {};
  const clamped = (key: keyof ThemeColorSettings, max: number) => {
    const candidate = stored[key];
    return typeof candidate === "number" && Number.isFinite(candidate)
      ? Math.min(max, Math.max(0, Math.round(candidate)))
      : defaultThemeColorSettings[key];
  };

  return {
    primaryHue: clamped("primaryHue", 360),
    secondaryHue: clamped("secondaryHue", 360),
    accentHue: clamped("accentHue", 360),
    textHue: clamped("textHue", 360),
    backgroundHue: clamped("backgroundHue", 360),
    panelHue: clamped("panelHue", 360),
    miniHue: clamped("miniHue", 360),
    panelOpacity: clamped("panelOpacity", 100),
    backgroundOpacity: clamped("backgroundOpacity", 100),
    stageOpacity: clamped("stageOpacity", 100),
    decorationOpacity: clamped("decorationOpacity", 100),
  };
}

function normalizeMatchName(value: unknown) {
  return typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
}

function createImportedTrackIdMap(
  settings: ImportedSettings,
  currentTracks: Track[],
) {
  const currentByFileName = new Map(
    currentTracks.map((track) => [normalizeMatchName(track.file?.name ?? track.name), track.id]),
  );
  const currentByName = new Map(
    currentTracks.map((track) => [normalizeMatchName(track.name), track.id]),
  );
  const currentByTitle = new Map(
    currentTracks.map((track) => [normalizeMatchName(track.title), track.id]),
  );
  const idMap = new Map<string, string>();

  settings.trackMetadata?.forEach((metadata) => {
    if (!metadata.id) {
      return;
    }

    const nextId =
      currentByFileName.get(normalizeMatchName(metadata.fileName)) ??
      currentByName.get(normalizeMatchName(metadata.name)) ??
      currentByTitle.get(normalizeMatchName(metadata.title));

    if (nextId) {
      idMap.set(metadata.id, nextId);
    }
  });

  return idMap;
}

function remapTrackId(trackId: string, idMap: Map<string, string>, validIds: Set<string>) {
  const mappedTrackId = idMap.get(trackId) ?? trackId;
  return validIds.has(mappedTrackId) ? mappedTrackId : null;
}

function areBoundsEqual(a?: WindowBounds, b?: WindowBounds) {
  return (
    a?.x === b?.x &&
    a?.y === b?.y &&
    a?.width === b?.width &&
    a?.height === b?.height
  );
}

function playlistNameExists(
  playlists: Playlist[],
  name: string,
  excludedPlaylistId?: string,
) {
  const normalizedName = name.trim().toLocaleLowerCase();

  return playlists.some(
    (playlist) =>
      playlist.type !== "system" &&
      playlist.id !== excludedPlaylistId &&
      playlist.name.trim().toLocaleLowerCase() === normalizedName,
  );
}

function createUniquePlaylistName(playlists: Playlist[], name: string) {
  const baseName = name.trim() || "水瓶罐子 AI 歌單";
  if (!playlistNameExists(playlists, baseName)) {
    return baseName;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${baseName} ${index}`;
    if (!playlistNameExists(playlists, candidate)) {
      return candidate;
    }
  }

  return `${baseName} ${Date.now()}`;
}

function createImportablePlaylists(
  settings: ImportedSettings,
  idMap: Map<string, string>,
  validIds: Set<string>,
): Playlist[] {
  return (settings.playlists ?? [])
    .filter((playlist) => {
      const playlistType = (playlist as { type?: string }).type;
      return playlistType !== "system" && playlistType !== "folder";
    })
    .map((playlist) => {
      if (playlist.type === "smart") {
        return {
          ...playlist,
          excludedTrackIds: (playlist.excludedTrackIds ?? [])
            .map((trackId) => remapTrackId(trackId, idMap, validIds))
            .filter((trackId): trackId is string => Boolean(trackId)),
        };
      }

      return {
        ...playlist,
        type: "normal" as const,
        trackIds: ((playlist as { trackIds?: string[] }).trackIds ?? [])
          .map((trackId) => remapTrackId(trackId, idMap, validIds))
          .filter((trackId): trackId is string => Boolean(trackId)),
      };
    });
}

function makeTrackSequence(trackIds: string[], tracks: Track[]) {
  const trackById = new Map(tracks.map((track) => [track.id, track]));

  return trackIds
    .map((trackId) => trackById.get(trackId))
    .filter((track): track is Track => Boolean(track));
}

function resolveBrandAssets(images: CustomImages): BrandAssets {
  return {
    ...brandAssets,
    logo: images.logo ?? brandAssets.logo,
    avatar: images.avatar ?? brandAssets.avatar,
    banner: images.banner ?? brandAssets.banner,
    background: images.background ?? brandAssets.background,
    characterIdle: images.characterIdle ?? brandAssets.characterIdle,
    characterPlaying: images.characterPlaying ?? brandAssets.characterPlaying,
    coverPlaceholder: images.coverPlaceholder ?? brandAssets.coverPlaceholder,
    decorativeImages: [
      images.decorationStar ?? brandAssets.decorativeImages?.[0],
      images.decorationBubble ?? brandAssets.decorativeImages?.[1],
    ].filter((image): image is string => Boolean(image)),
  };
}

const customImageLabels: Record<CustomImageSlot, string> = {
  logo: "品牌標誌",
  avatar: "個人頭像",
  banner: "房間橫幅",
  background: "主背景",
  characterIdle: "待機角色",
  characterPlaying: "播放角色",
  coverPlaceholder: "預設封面",
  decorationStar: "星星裝飾",
  decorationBubble: "泡泡裝飾",
};

type PlaylistNameDialogState =
  | null
  | { kind: "normal" }
  | { kind: "rename"; playlistId: string; defaultName: string };

function logText(value: unknown) {
  return String(value ?? "").replace(/\r?\n/g, " ").trim() || "-";
}

function createAIPlaylistActionLogEntry(args: {
  details: AIPlaylistCreateDetails;
  playlistName: string;
  trackIds: string[];
  tracks: Track[];
}) {
  const trackById = new Map(args.tracks.map((track) => [track.id, track]));
  const rows = args.trackIds.map((trackId, index) => {
    const track = trackById.get(trackId);
    return [
      `${index + 1}.`,
      `songId=${logText(trackId)}`,
      `title=${logText(track?.title)}`,
      `artist=${logText(track?.artist)}`,
      `filePath=${logText(track?.sourcePath ?? track?.name)}`,
    ].join(" ");
  });

  return [
    "",
    `## ${new Date().toISOString()}`,
    `- 使用者原始指令：${logText(args.details.requestText)}`,
    `- AI 判斷的意圖：${logText(args.details.intent)}`,
    `- 使用的搜尋方式：${args.details.searchMethod}`,
    `- 建立的播放清單名稱：${logText(args.playlistName)}`,
    `- 加入歌曲數量：${args.trackIds.length}`,
    "- 是否有找不到歌曲的情況：否",
    "- 歌曲：",
    ...rows.map((row) => `  ${row}`),
  ].join("\n");
}

function getLikedNamesFromImportedTracks(trackMetadata: ImportedTrackMetadata[] = []) {
  return trackMetadata
    .filter((metadata) => metadata.liked)
    .map((metadata) => {
      if (typeof metadata.name === "string" && metadata.name.trim()) {
        return metadata.name.trim();
      }
      if (typeof metadata.fileName === "string" && metadata.fileName.trim()) {
        return metadata.fileName.trim();
      }
      if (typeof metadata.title === "string" && metadata.title.trim()) {
        return metadata.title.trim();
      }
      return "";
    })
    .filter((name) => name.length > 0);
}

export default function App() {
  const appMode = useAppMode();
  const isDesktopApp = isElectronRuntime();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [customImages, setCustomImages] = useState<CustomImages>({});
  const [imageSettingsOpen, setImageSettingsOpen] = useState(false);
  const [customImageBusy, setCustomImageBusy] = useState<CustomImageSlot | null>(null);
  const [likedTrackNames, setLikedTrackNames] = useLocalStorage<string[]>(
    STORAGE_KEYS.likedTrackNames,
    [],
  );
  const [sortMode, setSortMode] = useLocalStorage<SortMode>(
    STORAGE_KEYS.sortMode,
    "addedAt",
  );
  const [rawThemeColorSettings, setThemeColorSettings] =
    useLocalStorage<ThemeColorSettings>(
      STORAGE_KEYS.themeColorSettings,
      defaultThemeColorSettings,
    );
  const [rawVisualizerSettings, setVisualizerSettings] =
    useLocalStorage<AudioVisualizerSettings>(
      STORAGE_KEYS.audioVisualizerSettings,
      defaultAudioVisualizerSettings,
    );
  const [rawMiniSettings, setMiniSettings] = useLocalStorage<MiniPlayerSettings>(
    STORAGE_KEYS.miniPlayerSettings,
    defaultMiniPlayerSettings,
  );
  const [windowBoundsState, setWindowBoundsState] = useLocalStorage<WindowBoundsState>(
    STORAGE_KEYS.windowBoundsState,
    {},
  );
  const resolvedVisualizerSettings = useMemo(
    () => ({ ...defaultAudioVisualizerSettings, ...rawVisualizerSettings }),
    [rawVisualizerSettings],
  );
  const resolvedMiniSettings = useMemo(() => {
    const storedMiniSettings = (isRecord(rawMiniSettings)
      ? rawMiniSettings
      : {}) as Partial<MiniPlayerSettings>;

    return {
      ...defaultMiniPlayerSettings,
      ...storedMiniSettings,
      opacity: clampMiniOpacity(storedMiniSettings.opacity),
    };
  }, [rawMiniSettings]);
  const resolvedBrandAssets = useMemo(
    () => resolveBrandAssets(customImages),
    [customImages],
  );
  const resolvedThemeColorSettings = useMemo(
    () => resolveThemeColorSettings(rawThemeColorSettings),
    [rawThemeColorSettings],
  );
  const [smartDialogOpen, setSmartDialogOpen] = useState(false);
  const [playlistDuplicateRequest, setPlaylistDuplicateRequest] = useState<{
    playlistId: string;
    playlistName: string;
    trackId: string;
    trackTitle: string;
  } | null>(null);
  const [playlistDeleteRequest, setPlaylistDeleteRequest] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [playlistNameDialog, setPlaylistNameDialog] =
    useState<PlaylistNameDialogState>(null);
  const [stopAfterCurrentTrack, setStopAfterCurrentTrack] = useState(false);
  const [sleepStopSignal, setSleepStopSignal] = useState(0);
  const [songInfoTrackId, setSongInfoTrackId] = useState<string | null>(null);

  const showInfo = useCallback((message: string) => {
    setErrorMessage("");
    setInfoMessage(message);
  }, []);

  const showError = useCallback((message: string) => {
    setInfoMessage("");
    setErrorMessage(message);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    // ponytail: 原生 CSS variables 已足夠同步色相與透明度；需要多主題時再抽設定服務。
    root.style.setProperty("--theme-primary-hue", String(resolvedThemeColorSettings.primaryHue));
    root.style.setProperty("--theme-secondary-hue", String(resolvedThemeColorSettings.secondaryHue));
    root.style.setProperty("--theme-accent-hue", String(resolvedThemeColorSettings.accentHue));
    root.style.setProperty("--theme-text-hue", String(resolvedThemeColorSettings.textHue));
    root.style.setProperty("--theme-background-hue", String(resolvedThemeColorSettings.backgroundHue));
    root.style.setProperty("--theme-panel-hue", String(resolvedThemeColorSettings.panelHue));
    root.style.setProperty("--theme-mini-hue", String(resolvedThemeColorSettings.miniHue));
    root.style.setProperty("--theme-panel-opacity", String(resolvedThemeColorSettings.panelOpacity / 100));
    root.style.setProperty("--theme-background-opacity", String(resolvedThemeColorSettings.backgroundOpacity / 100));
    root.style.setProperty("--theme-stage-opacity", String(resolvedThemeColorSettings.stageOpacity / 100));
    root.style.setProperty("--theme-decoration-opacity", String(resolvedThemeColorSettings.decorationOpacity / 100));
  }, [resolvedThemeColorSettings]);

  useEffect(() => {
    const api = window.aquariusgirlAPI;
    if (!api?.loadCustomImages) return undefined;

    let active = true;
    void api.loadCustomImages().then((images) => {
      if (active) setCustomImages(images);
    });

    return () => {
      active = false;
    };
  }, []);

  const putTrackMetadataRef = useRef<((track: Track) => Promise<void>) | null>(null);
  const {
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
  } = useLocalTracks({
    likedTrackNames,
    onLikedTrackNamesChange: setLikedTrackNames,
    onInfo: showInfo,
    onError: showError,
    onTrackMetadataLoaded: (track) => {
      void putTrackMetadataRef.current?.(track);
    },
  });

  const playlistsState = usePlaylists(tracks);
  const libraryDb = useMusicLibraryDb(playlistsState.playlists);
  useEffect(() => {
    putTrackMetadataRef.current = libraryDb.putTrackMetadata;
  }, [libraryDb.putTrackMetadata]);
  const addFilesToActivePlaylist = useCallback(
    (files: FileList | File[]) => {
      const addedTracks = addFiles(files) ?? [];

      if (addedTracks.length > 0) {
        void libraryDb.putManyTrackMetadata(addedTracks);
      }

      if (playlistsState.activePlaylist?.type !== "normal" || addedTracks.length === 0) {
        return addedTracks;
      }

      addedTracks.forEach((track) => {
        playlistsState.addTrackToPlaylist(playlistsState.activePlaylist.id, track.id);
      });
      showInfo(`已加入 ${addedTracks.length} 首到「${playlistsState.activePlaylist.name}」。`);
      return addedTracks;
    },
    [addFiles, libraryDb, playlistsState, showInfo],
  );
  const normalPlaylists = useMemo(
    () =>
      playlistsState.userPlaylists.filter(
        (playlist): playlist is NormalPlaylist => playlist.type === "normal",
      ),
    [playlistsState.userPlaylists],
  );
  const trackPlaylistIdsByTrackId = useMemo(() => {
    const next: Record<string, string[]> = {};

    normalPlaylists.forEach((playlist) => {
      playlist.trackIds.forEach((trackId) => {
        next[trackId] = [...(next[trackId] ?? []), playlist.id];
      });
    });

    return next;
  }, [normalPlaylists]);
  const playbackTracks = useMemo(
    () => makeTrackSequence(playlistsState.activeTrackIds, tracks),
    [playlistsState.activeTrackIds, tracks],
  );
  const songInfoTrack = useMemo(
    () => tracks.find((track) => track.id === songInfoTrackId) ?? null,
    [songInfoTrackId, tracks],
  );
  const handleTrackDuration = useCallback(
    (trackId: string, duration: number) => {
      if (setTrackDuration(trackId, duration)) {
        void libraryDb.patchTrackDuration(trackId, duration);
      }
    },
    [libraryDb, setTrackDuration],
  );

  const player = useAudioPlayer({
    tracks: playbackTracks,
    onInfo: showInfo,
    onError: showError,
    onTrackDuration: handleTrackDuration,
    stopAfterCurrentTrack,
    onStopAfterCurrentTrack: () => {
      setStopAfterCurrentTrack(false);
      setSleepStopSignal((current) => current + 1);
      showInfo("已播完目前歌曲並停止。");
    },
  });

  const sleepTimer = useSleepTimer({
    pause: player.pause,
    setVolume: player.setVolume,
    volume: player.volume,
    onEndOfTrackStart: () => setStopAfterCurrentTrack(true),
    onCancelEndOfTrack: () => setStopAfterCurrentTrack(false),
  });

  useEffect(() => {
    if (sleepStopSignal > 0) {
      sleepTimer.cancel();
      setSleepStopSignal(0);
    }
  }, [sleepStopSignal, sleepTimer.cancel]);

  const visualizer = useAudioAnalyser({
    audioRef: player.audioRef,
    enabled: resolvedVisualizerSettings.enabled,
    isPlaying: player.isPlaying,
    bars: resolvedVisualizerSettings.barCount,
    settings: resolvedVisualizerSettings,
  });

  const fileSystemAccess = useFileSystemAccess({
    onFiles: addFilesToActivePlaylist,
    onInfo: showInfo,
    onError: showError,
  });
  const restoreMusicPaths = fileSystemAccess.restoreMusicPaths;
  const hasAppliedStoredMetadataRef = useRef(false);

  useEffect(() => {
    if (
      hasAppliedStoredMetadataRef.current ||
      tracks.length === 0 ||
      libraryDb.storedTracks.length === 0
    ) {
      return;
    }

    hasAppliedStoredMetadataRef.current = true;
    applyStoredTrackMetadata(libraryDb.storedTracks);
    const currentIdsBySourcePath = new Map(
      tracks
        .filter((track) => track.sourcePath)
        .map((track) => [track.sourcePath as string, track.id]),
    );
    const idMap = new Map<string, string>();
    libraryDb.storedTracks.forEach((storedTrack) => {
      if (!storedTrack.sourcePath) return;
      const nextId = currentIdsBySourcePath.get(storedTrack.sourcePath);
      if (nextId && nextId !== storedTrack.id) idMap.set(storedTrack.id, nextId);
    });
    playlistsState.remapTrackIds(idMap);
  }, [
    applyStoredTrackMetadata,
    libraryDb.storedTracks,
    playlistsState.remapTrackIds,
    tracks.length,
  ]);

  const handleVisualizerSettingsChange = useCallback(
    (settings: AudioVisualizerSettings) => {
      setVisualizerSettings({
        ...defaultAudioVisualizerSettings,
        ...settings,
        intensity: Math.min(3, Math.max(0.5, settings.intensity)),
        sensitivity: Math.min(3, Math.max(0.5, settings.sensitivity)),
        smoothing: Math.min(0.9, Math.max(0, settings.smoothing)),
        bassBoost: Math.min(3, Math.max(0.5, settings.bassBoost)),
        responsiveness: Math.min(1, Math.max(0.1, settings.responsiveness)),
        barCount: Math.min(48, Math.max(8, Math.round(settings.barCount))),
        minBarHeight: Math.min(12, Math.max(2, Math.round(settings.minBarHeight))),
        maxBarHeight: Math.min(64, Math.max(12, Math.round(settings.maxBarHeight))),
      });
    },
    [setVisualizerSettings],
  );

  const handleMiniAlwaysOnTopChange = useCallback(
    (alwaysOnTop: boolean) => {
      setMiniSettings((current) => ({
        ...defaultMiniPlayerSettings,
        ...current,
        alwaysOnTop,
      }));

      void window.aquariusgirlAPI?.setMiniAlwaysOnTop(alwaysOnTop).then((result) => {
        if (!result.ok || result.alwaysOnTop !== alwaysOnTop) {
          setMiniSettings((current) => ({
            ...current,
            alwaysOnTop: result.alwaysOnTop,
          }));
          showError("置頂狀態套用失敗，已恢復實際視窗狀態。");
        }
      }).catch(() => {
        setMiniSettings((current) => ({
          ...current,
          alwaysOnTop: !alwaysOnTop,
        }));
        showError("置頂狀態套用失敗。");
      });
    },
    [setMiniSettings, showError],
  );

  const handleMiniOpacityChange = useCallback(
    (opacity: number) => {
      setMiniSettings((current) => ({
        ...defaultMiniPlayerSettings,
        ...current,
        opacity: clampMiniOpacity(opacity),
      }));
    },
    [setMiniSettings],
  );

  const handleWindowControl = useCallback(
    (action: "minimize" | "toggle-maximize" | "toggle-fullscreen" | "close") => {
      void window.aquariusgirlAPI?.windowControl(action).catch(() => {
        showError("視窗控制失敗。");
      });
    },
    [showError],
  );

  const handleSelectCustomImage = useCallback(
    async (slot: CustomImageSlot) => {
      const api = window.aquariusgirlAPI;
      if (!api?.selectCustomImage) {
        showError("請在桌面版中新增自訂圖片。");
        return;
      }

      setCustomImageBusy(slot);
      try {
        const result = await api.selectCustomImage(slot);
        if (result.canceled) return;
        if (!result.ok || !result.image) {
          showError(result.error ?? "圖片無法新增。");
          return;
        }

        setCustomImages((current) => ({ ...current, [slot]: result.image }));
        showInfo(`已更新${customImageLabels[slot]}。`);
      } catch {
        showError("圖片無法新增，請再試一次。");
      } finally {
        setCustomImageBusy(null);
      }
    },
    [showError, showInfo],
  );

  const handleRemoveCustomImage = useCallback(
    async (slot: CustomImageSlot) => {
      const api = window.aquariusgirlAPI;
      if (!api?.removeCustomImage) {
        showError("請在桌面版中回復預設圖片。");
        return;
      }

      setCustomImageBusy(slot);
      try {
        const result = await api.removeCustomImage(slot);
        if (!result.ok) {
          showError(result.error ?? "圖片無法回復預設。");
          return;
        }

        setCustomImages((current) => {
          const next = { ...current };
          delete next[slot];
          return next;
        });
        showInfo(`${customImageLabels[slot]}已回復預設。`);
      } catch {
        showError("圖片無法回復預設，請再試一次。");
      } finally {
        setCustomImageBusy(null);
      }
    },
    [showError, showInfo],
  );

  const enterMiniMode = useCallback(() => {
    setMiniSettings((current) => ({
      ...defaultMiniPlayerSettings,
      ...current,
      enabled: true,
    }));
  }, [setMiniSettings]);

  const exitMiniMode = useCallback(() => {
    setMiniSettings((current) => ({
      ...defaultMiniPlayerSettings,
      ...current,
      enabled: false,
    }));
  }, [setMiniSettings]);

  const onboarding = useOnboarding();
  const lastRecordedTrackIdRef = useRef<string | null>(null);
  const lastCurrentTrackRef = useRef<Track | null>(null);
  const restoredLibraryRef = useRef(false);

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDropFiles: addFilesToActivePlaylist,
    onInfo: showInfo,
  });

  useEffect(() => {
    if (!isDesktopApp || restoredLibraryRef.current || tracks.length > 0) {
      return;
    }

    const sourcePaths =
      libraryDb.musicSourcePaths.length > 0
        ? libraryDb.musicSourcePaths
        : Array.from(
            new Set(
              libraryDb.storedTracks
                .map((track) => track.sourcePath)
                .filter((sourcePath): sourcePath is string => Boolean(sourcePath)),
            ),
          );

    if (sourcePaths.length === 0) {
      return;
    }

    restoredLibraryRef.current = true;
    // ponytail: Auto-restore rebuilds the library only; manual imports still add to the active playlist.
    void restoreMusicPaths(sourcePaths, addFiles)
      .then(({ restored, missing }) => {
        if (restored > 0 && missing > 0) {
          showInfo(`已自動恢復 ${restored} 首上次選過的音樂，${missing} 首找不到原檔。`);
          return;
        }

        if (restored > 0) {
          showInfo(`已自動恢復 ${restored} 首上次選過的音樂。`);
          return;
        }

        if (missing > 0) {
          showError("上次選過的音樂找不到原檔，可能已移動、改名或刪除。");
        }
      })
      .catch(() => {
        showError("自動恢復上次音樂清單失敗，請重新選擇音樂檔或資料夾。");
      });
  }, [
    addFiles,
    isDesktopApp,
    libraryDb.musicSourcePaths,
    libraryDb.storedTracks,
    restoreMusicPaths,
    showError,
    showInfo,
    tracks.length,
  ]);

  useEffect(() => {
    if (!player.currentTrackId) {
      lastRecordedTrackIdRef.current = null;
      return;
    }

    if (!player.isPlaying || lastRecordedTrackIdRef.current === player.currentTrackId) {
      return;
    }

    const playbackPatch = recordTrackPlayback(player.currentTrackId);
    if (playbackPatch) {
      void libraryDb.patchTrackPlayback(player.currentTrackId, playbackPatch);
    }
    lastRecordedTrackIdRef.current = player.currentTrackId;
  }, [libraryDb, player.currentTrackId, player.isPlaying, recordTrackPlayback]);

  useEffect(() => {
    if (player.currentTrack) {
      lastCurrentTrackRef.current = player.currentTrack;
    }
  }, [player.currentTrack]);

  const filteredTracks = useMemo(() => {
    const keyword = searchKeyword.trim().toLocaleLowerCase();
    const playlistTracks = playbackTracks;
    const visibleTracks = keyword
      ? playlistTracks.filter((track) => {
          const searchable = [track.title, track.artist, track.name]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase();
          return searchable.includes(keyword);
        })
      : playlistTracks;

    if (sortMode === "addedAt" && playlistsState.activePlaylist?.type === "normal") {
      return visibleTracks;
    }

    return sortTracks(visibleTracks, sortMode);
  }, [playbackTracks, playlistsState.activePlaylist, searchKeyword, sortMode]);

  const getPlaylistOccurrenceIndex = useCallback(
    (trackId: string, visibleIndex: number) => {
      const sameTrackVisibleIndex = filteredTracks
        .slice(0, visibleIndex + 1)
        .filter((track) => track.id === trackId).length - 1;
      let seen = -1;

      for (let index = 0; index < playlistsState.activeTrackIds.length; index += 1) {
        if (playlistsState.activeTrackIds[index] !== trackId) {
          continue;
        }

        seen += 1;
        if (seen === sameTrackVisibleIndex) {
          return index;
        }
      }

      return -1;
    },
    [filteredTracks, playlistsState.activeTrackIds],
  );

  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      const wasCurrentTrack = player.currentTrackId === trackId;
      const currentIndex = tracks.findIndex((track) => track.id === trackId);
      const fallbackTrack =
        currentIndex >= 0
          ? tracks[currentIndex + 1] ?? tracks[currentIndex - 1] ?? null
          : null;

      if (wasCurrentTrack) {
        if (fallbackTrack) {
          player.selectTrack(fallbackTrack.id, player.isPlaying);
        } else {
          player.stop();
        }
      }

      playlistsState.removeTrackFromAllPlaylists(trackId);
      removeTrack(trackId);
      if (tracks.length <= 1) {
        libraryDb.clearStoredTracks();
      } else {
        void libraryDb.deleteTrackMetadata(trackId);
      }
    },
    [libraryDb, player, playlistsState, removeTrack, tracks],
  );

  const handleRemoveVisibleTrack = useCallback(
    (trackId: string, visibleIndex: number) => {
      const track = tracks.find((item) => item.id === trackId);

      if (playlistsState.activePlaylist?.type === "normal") {
        const occurrenceIndex = getPlaylistOccurrenceIndex(trackId, visibleIndex);

        if (occurrenceIndex < 0) {
          showError("從播放清單移除失敗，請重新整理後再試。");
          return;
        }

        playlistsState.removeTrackFromPlaylist(
          playlistsState.activePlaylist.id,
          trackId,
          occurrenceIndex,
        );
        showInfo(`已從播放清單移除：${track?.title ?? "歌曲"}`);
        return;
      }

      if (playlistsState.activePlaylist?.type === "smart") {
        playlistsState.excludeTrackFromSmartPlaylist(
          playlistsState.activePlaylist.id,
          trackId,
        );
        showInfo(`已從智慧型播放清單排除：${track?.title ?? "歌曲"}`);
        return;
      }

      if (playlistsState.activePlaylist?.id === SYSTEM_PLAYLIST_IDS.all) {
        handleRemoveTrack(trackId);
        return;
      }

      showInfo("這個清單只顯示歌曲；要移除原始歌曲，請到「全部歌曲」刪除。");
    },
    [getPlaylistOccurrenceIndex, handleRemoveTrack, playlistsState, showError, showInfo, tracks],
  );

  const handleAddTrackToPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      const playlist = normalPlaylists.find((item) => item.id === playlistId);
      const track = tracks.find((item) => item.id === trackId);

      if (!playlist || !track) {
        showError("加入播放清單失敗，請重新選擇歌曲或歌單。");
        return;
      }

      if (playlist.trackIds.includes(trackId)) {
        // ponytail: Keep the existing confirmation semantics in-app; only revisit native dialogs if Windows focus becomes reliable.
        setPlaylistDuplicateRequest({
          playlistId,
          playlistName: playlist.name,
          trackId,
          trackTitle: track.title,
        });
        return;
      }

      playlistsState.addTrackToPlaylist(playlistId, trackId);
      showInfo(`已將「${track.title}」加入「${playlist.name}」。`);
    },
    [normalPlaylists, playlistsState, showError, showInfo, tracks],
  );

  const handleCreateAIPlaylist = useCallback(
    (
      name: string,
      trackIds: string[],
      details: AIPlaylistCreateDetails,
    ): AIPlaylistCreateResult => {
      const validTrackIds = new Set(tracks.map((track) => track.id));
      const candidateTrackIds = new Set(
        details.candidates
          .map((candidate) => candidate.track.id)
          .filter((trackId) => validTrackIds.has(trackId)),
      );
      const uniqueTrackIds = Array.from(new Set(trackIds)).filter((trackId) =>
        validTrackIds.has(trackId) && candidateTrackIds.has(trackId),
      );

      if (uniqueTrackIds.length === 0) {
        return { ok: false, error: "目前載入的歌曲裡找不到符合條件的歌曲。" };
      }

      const playlistName = createUniquePlaylistName(playlistsState.userPlaylists, name);
      const playlist = playlistsState.createPlaylist(playlistName);
      uniqueTrackIds.forEach((trackId) => {
        playlistsState.addTrackToPlaylist(playlist.id, trackId);
      });
      playlistsState.setActivePlaylistId(playlist.id);
      showInfo(`已建立播放清單「${playlistName}」，加入 ${uniqueTrackIds.length} 首。`);
      void window.aquariusgirlAPI?.appendAIPlaylistActionLog?.(
        createAIPlaylistActionLogEntry({
          details,
          playlistName,
          trackIds: uniqueTrackIds,
          tracks,
        }),
      ).catch(() => undefined);
      return { ok: true, name: playlistName, count: uniqueTrackIds.length };
    },
    [playlistsState, showInfo, tracks],
  );

  const handleAddAITracksToPlaylist = useCallback((
    playlistName: string,
    trackIds: string[],
  ): AIPlaylistAddResult => {
    const normalizedName = playlistName.trim().toLocaleLowerCase();
    const playlist =
      normalPlaylists.find((item) => item.name.trim().toLocaleLowerCase() === normalizedName) ??
      normalPlaylists.find((item) => {
        const itemName = item.name.trim().toLocaleLowerCase();
        return Boolean(normalizedName) &&
          (itemName.includes(normalizedName) || normalizedName.includes(itemName));
      });

    if (!playlist) {
      return { ok: false, error: `找不到「${playlistName || "指定"}」歌單，請先建立或改用現有歌單名稱。` };
    }

    const validTrackIds = new Set(tracks.map((track) => track.id));
    const existingTrackIds = new Set(playlist.trackIds);
    const nextTrackIds = Array.from(new Set(trackIds)).filter((trackId) =>
      validTrackIds.has(trackId) && !existingTrackIds.has(trackId),
    );

    if (nextTrackIds.length === 0) {
      return { ok: false, error: `「${playlist.name}」沒有可新增的本機歌曲。` };
    }

    nextTrackIds.forEach((trackId) => {
      playlistsState.addTrackToPlaylist(playlist.id, trackId);
    });
    showInfo(`已加入「${playlist.name}」，共 ${nextTrackIds.length} 首。`);
    return { ok: true, name: playlist.name, count: nextTrackIds.length };
  }, [normalPlaylists, playlistsState, showInfo, tracks]);

  const handleReorderVisibleTracks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (playlistsState.activePlaylist?.type === "normal") {
        playlistsState.moveTrackInPlaylist(playlistsState.activePlaylist.id, fromIndex, toIndex);
        showInfo("播放清單順序已更新。");
        return;
      }

      if (playlistsState.activePlaylist?.id === SYSTEM_PLAYLIST_IDS.all) {
        moveTrack(fromIndex, toIndex);
        showInfo("播放順序已更新。");
      }
    },
    [moveTrack, playlistsState, showInfo],
  );

  const openCurrentSongInfo = useCallback(() => {
    if (!player.currentTrack) {
      showError("目前沒有選取歌曲。");
      return;
    }

    setSongInfoTrackId(player.currentTrack.id);
  }, [player.currentTrack, showError]);

  const reloadSongInfoFromOriginal = useCallback(
    async (track: Track) => {
      if (
        track.sourcePath &&
        isSupportedOriginalWriteFormat(track.sourcePath) &&
        window.aquariusgirlAPI?.readSongInfoFromOriginalFile
      ) {
        if (process.env.NODE_ENV !== "production" && player.isPlaying) {
          console.warn(
            "[Aquariusgirl] readSongInfoFromOriginalFile called while playback is active; verify this is user initiated and not part of playback.",
          );
        }

        const result = await window.aquariusgirlAPI.readSongInfoFromOriginalFile(track.sourcePath);

        if (result.ok && result.metadata) {
          return replaceTrackSongInfo(track.id, result.metadata);
        }

        return null;
      }

      return await reloadTrackMetadata(track.id);
    },
    [player.isPlaying, reloadTrackMetadata, replaceTrackSongInfo],
  );

  const handleReloadCurrentTrackMetadata = useCallback(async () => {
    const track = player.currentTrack;

    if (!track) {
      showError("目前沒有選取歌曲。");
      return;
    }

    if (
      track.metadataOverride &&
      !window.confirm("重新讀取會以原始檔標籤覆蓋播放器內的歌曲資訊，是否繼續？")
    ) {
      return;
    }

    const reloadedTrack = await reloadSongInfoFromOriginal(track);

    if (reloadedTrack) {
      try {
        await libraryDb.putTrackMetadata(reloadedTrack);
      } catch {
        showError("音樂標籤已重新讀取，但播放器資料庫保存失敗。");
        return;
      }
      showInfo("已重新讀取音樂標籤。");
    } else {
      showError("重新讀取音樂標籤失敗，請確認原始檔仍可讀取。");
    }
  }, [libraryDb, player.currentTrack, reloadSongInfoFromOriginal, showError, showInfo]);

  const handleShowCurrentTrackFileLocation = useCallback(async () => {
    const track = player.currentTrack;

    if (!track?.sourcePath) {
      showError("這首歌沒有可顯示的位置。");
      return;
    }

    try {
      const result = await window.aquariusgirlAPI?.showTrackInFolder?.(track.sourcePath);

      if (!result?.ok) {
        showError(result?.error ?? "顯示檔案位置失敗。");
        return;
      }

      showInfo("已開啟檔案位置。");
    } catch {
      showError("顯示檔案位置失敗。");
    }
  }, [player.currentTrack, showError, showInfo]);

  const handleApplySongInfoToOriginal = useCallback(
    async (trackId: string, draft: SongInfoDraft) => {
      const track = tracks.find((item) => item.id === trackId);

      if (!track?.sourcePath) {
        showError("寫回原始檔僅支援桌面版。");
        return false;
      }

      if (!isSupportedOriginalWriteFormat(track.sourcePath)) {
        showError("這個檔案格式不支援寫回原始檔。");
        return false;
      }

      try {
        const result = await window.aquariusgirlAPI?.applySongInfoToOriginalFile?.({
          sourcePath: track.sourcePath,
          metadata: draft,
        });

        if (!result?.ok) {
          showError(result?.error ?? "寫回原始檔失敗，原始檔未修改");
          return false;
        }

        const reloadedTrack = await reloadSongInfoFromOriginal(track);
        if (!reloadedTrack) {
          showError("原始檔已處理，但重新讀取音樂標籤失敗。");
          return false;
        }

        try {
          await libraryDb.putTrackMetadata(reloadedTrack);
        } catch {
          showError("原始檔已更新，但播放器資料庫保存失敗，請重新載入音樂資料夾。");
          return false;
        }

        showInfo("已套用到原始檔");
        return true;
      } catch {
        showError("寫回原始檔失敗，原始檔未修改");
        return false;
      }
    },
    [libraryDb, reloadSongInfoFromOriginal, showError, showInfo, tracks],
  );

  const handleDeletePlaylist = useCallback(
    (playlistId: string) => {
      const playlist = playlistsState.userPlaylists.find((item) => item.id === playlistId);

      if (!playlist) {
        showError("刪除播放清單失敗，找不到歌單。");
        return;
      }

      // ponytail: Keep confirmation in the renderer; native confirm strands focus on Windows Electron.
      setPlaylistDeleteRequest({ id: playlist.id, name: playlist.name });
    },
    [playlistsState.userPlaylists, showError],
  );

  const handleRemoveCurrentTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      const track = tracks.find((item) => item.id === trackId);
      playlistsState.removeTrackFromPlaylist(playlistId, trackId);
      showInfo(`已從播放清單移除：${track?.title ?? "歌曲"}`);
    },
    [playlistsState, showInfo, tracks],
  );

  const handleClearTracks = useCallback(() => {
    player.stop();
    clearTracks();
    libraryDb.clearStoredTracks();
  }, [clearTracks, libraryDb, player]);

  const handleExportSettings = useCallback(() => {
    const payload = createExportPayload({
      tracks,
      playlists: playlistsState.playlists,
      volume: player.volume,
      repeatMode: player.repeatMode,
      shuffle: player.shuffle,
      sortMode,
      audioVisualizerSettings: resolvedVisualizerSettings,
      miniPlayerSettings: resolvedMiniSettings,
      themeColorSettings: resolvedThemeColorSettings,
    });
    downloadJsonFile(getExportFileName(), payload);
    showInfo("已匯出歌單設定，不包含音樂檔本體。");
  }, [
    player.repeatMode,
    player.shuffle,
    player.volume,
    playlistsState.playlists,
    resolvedMiniSettings,
    resolvedThemeColorSettings,
    resolvedVisualizerSettings,
    showInfo,
    sortMode,
    tracks,
  ]);

  const handleImportSettings = useCallback(
    async (file: File) => {
      try {
        const settings = parseImportedSettings(await file.text());
        const summary = summarizeImportedSettings(settings);
        const shouldMerge = window.confirm(
          `讀到備份：${summary.playlists} 個歌單、${summary.tracks} 首 metadata，版本 ${summary.version}。\n\n要合併到目前播放器嗎？不會匯入音樂檔本體，也不會覆蓋現有歌單。`,
        );

        if (!shouldMerge) {
          showInfo("已取消匯入，沒有變更目前歌單。");
          return;
        }

        const trackIdMap = createImportedTrackIdMap(settings, tracks);
        const validTrackIds = new Set(tracks.map((track) => track.id));
        const importablePlaylists = createImportablePlaylists(
          settings,
          trackIdMap,
          validTrackIds,
        );

        if (importablePlaylists.length > 0) {
          playlistsState.mergeImportedPlaylists(importablePlaylists);
        }

        const importedLikedNames = getLikedNamesFromImportedTracks(settings.trackMetadata);
        if (importedLikedNames.length > 0) {
          setLikedTrackNames((current) =>
            Array.from(new Set([...current, ...importedLikedNames])),
          );
        }

        const preferences = settings.preferences ?? {};
        if (typeof preferences.volume === "number") {
          player.setVolume(preferences.volume);
        }
        if (isRepeatMode(preferences.repeatMode)) {
          player.setRepeatMode(preferences.repeatMode);
        }
        if (typeof preferences.shuffle === "boolean") {
          player.setShuffle(preferences.shuffle);
        }
        if (isSortMode(preferences.sortMode)) {
          setSortMode(preferences.sortMode);
        }
        if (isRecord(preferences.audioVisualizerSettings)) {
          handleVisualizerSettingsChange({
            ...resolvedVisualizerSettings,
            ...(preferences.audioVisualizerSettings as Partial<AudioVisualizerSettings>),
          });
        }
        if (isRecord(preferences.miniPlayerSettings)) {
          setMiniSettings((current) => ({
            ...defaultMiniPlayerSettings,
            ...current,
            ...(preferences.miniPlayerSettings as Partial<MiniPlayerSettings>),
            enabled: false,
          }));
        }
        if (isRecord(preferences.themeColorSettings)) {
          setThemeColorSettings(
            resolveThemeColorSettings(preferences.themeColorSettings),
          );
        }

        showInfo(
          `已合併 ${importablePlaylists.length} 個歌單，成功配對 ${trackIdMap.size} 首。若有缺歌，請重新選擇音樂資料夾。`,
        );
      } catch {
        showError("匯入失敗，請確認 JSON 格式、來源與版本正確。");
      }
    },
    [
      handleVisualizerSettingsChange,
      player,
      playlistsState,
      resolvedVisualizerSettings,
      setLikedTrackNames,
      setMiniSettings,
      setThemeColorSettings,
      setSortMode,
      showError,
      showInfo,
      tracks,
    ],
  );

  useEffect(() => {
    if (libraryDb.dbError) {
      showError(`IndexedDB 暫時不可用：${libraryDb.dbError}`);
    }
  }, [libraryDb.dbError, showError]);

  useEffect(() => {
    const state = {
      track: player.currentTrack
        ? {
            title: player.currentTrack.title,
            artist: player.currentTrack.artist,
            album: player.currentTrack.album,
            artworkUrl: player.currentTrack.artworkUrl,
            coverUrl: player.currentTrack.coverUrl,
      }
        : null,
      isPlaying: Boolean(player.isPlaying),
      currentTime: player.currentTime,
      duration: player.duration,
      updatedAt: Date.now(),
    };
    writePlayerStateToStorage(state);
    const channel = createPlayerBroadcastChannel();
    try {
      channel?.postMessage(state);
    } catch {
      // Broadcast failures should not blank the player UI.
    } finally {
      channel?.close();
    }
  }, [player.currentTime, player.currentTrack, player.duration, player.isPlaying]);

  useEffect(() => {
    const previousBodyBackground = document.body.style.background;
    const previousHtmlBackground = document.documentElement.style.background;

    if (resolvedMiniSettings.enabled) {
      document.body.style.background = "transparent";
      document.documentElement.style.background = "transparent";
    }

    return () => {
      document.body.style.background = previousBodyBackground;
      document.documentElement.style.background = previousHtmlBackground;
    };
  }, [resolvedMiniSettings.enabled]);

  useEffect(() => {
    if (!window.aquariusgirlAPI?.setMiniPlayerMode) {
      return;
    }

    void window.aquariusgirlAPI
      .setMiniPlayerMode({
        ...resolvedMiniSettings,
        fullBounds: windowBoundsState.fullBounds,
        miniBounds: windowBoundsState.miniBounds,
      })
      .then((result) => {
        setWindowBoundsState((current) => {
          const next = {
            ...current,
            fullBounds: result.fullBounds ?? current.fullBounds,
            miniBounds: result.miniBounds ?? current.miniBounds,
          };

          return areBoundsEqual(next.fullBounds, current.fullBounds) &&
            areBoundsEqual(next.miniBounds, current.miniBounds)
            ? current
            : next;
        });
      })
      .catch(() => {
        showError("mini 視窗模式切換失敗，但播放器仍可正常使用。");
      });
  }, [resolvedMiniSettings, setWindowBoundsState, showError, windowBoundsState.fullBounds, windowBoundsState.miniBounds]);

  useEffect(() => {
    if (!resolvedMiniSettings.enabled || !window.aquariusgirlAPI?.getWindowBounds) {
      return;
    }

    const timer = window.setInterval(() => {
      void window.aquariusgirlAPI?.getWindowBounds().then((bounds) => {
        if (!bounds) {
          return;
        }

        setWindowBoundsState((current) => {
          if (!resolvedMiniSettings.enabled) {
            return current;
          }

          const next = {
            ...current,
            miniBounds: bounds,
          };

          return areBoundsEqual(next.miniBounds, current.miniBounds) ? current : next;
        });
      });
    }, 2000);

    return () => window.clearInterval(timer);
  }, [resolvedMiniSettings.enabled, setWindowBoundsState]);

  useEffect(() => {
    if (!infoMessage && !errorMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setInfoMessage("");
      setErrorMessage("");
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [errorMessage, infoMessage]);

  // ponytail: Drag reorder only edits saved order; sorted/search/smart views stay read-only.
  const canDragReorderVisibleTracks =
    (playlistsState.activePlaylist?.type === "normal" ||
      playlistsState.activePlaylist?.id === SYSTEM_PLAYLIST_IDS.all) &&
    sortMode === "addedAt" &&
    searchKeyword.trim().length === 0;

  const audioElement = (
    <audio
      ref={player.audioRef}
      preload="metadata"
      {...player.audioElementProps}
    />
  );

  if (appMode === "obs") {
    return (
      <BrandAssetsContext.Provider value={resolvedBrandAssets}>
        {audioElement}
        <ObsOverlay visualizerLevels={visualizer.levels} />
      </BrandAssetsContext.Provider>
    );
  }

  if (resolvedMiniSettings.enabled) {
    return (
      <BrandAssetsContext.Provider value={resolvedBrandAssets}>
        {audioElement}
        <MessageToast
          type={errorMessage ? "error" : "info"}
          message={errorMessage || infoMessage}
        />
        <MiniPlayerAssistant
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          levels={visualizer.levels}
          visualizerSettings={resolvedVisualizerSettings}
          miniSettings={resolvedMiniSettings}
          onTogglePlay={player.togglePlay}
          onPrevious={player.previous}
          onNext={player.next}
          onSeek={player.seek}
          onVolumeChange={player.setVolume}
          onExitMini={exitMiniMode}
          onAlwaysOnTopChange={handleMiniAlwaysOnTopChange}
          onOpacityChange={handleMiniOpacityChange}
        />
      </BrandAssetsContext.Provider>
    );
  }

  return (
    <BrandAssetsContext.Provider value={resolvedBrandAssets}>
      {audioElement}
      <BackgroundAura isPlaying={player.isPlaying} />
      {isDesktopApp && (
        <div className="app-drag-region fixed left-0 right-0 top-0 z-50 flex h-9 items-center border-b border-white/[0.08] bg-aquarius-navy/95 pl-40 pr-6 text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-aquarius-blue/[0.28] bg-aquarius-blue/[0.16] text-[10px] font-black text-aquarius-blue">
              AQ
            </span>
            <span className="truncate text-sm font-black tracking-normal">
              Aquariusgirl Music Room
            </span>
          </div>
        </div>
      )}
      <AppLayout
        dragHandlers={dragHandlers}
        audio={null}
        toast={
          <MessageToast
            type={errorMessage ? "error" : "info"}
            message={errorMessage || infoMessage}
          />
        }
        dropZone={<DropZone active={isDragging} />}
        header={
          <Header
            trackCount={tracks.length}
            onFilesSelected={addFilesToActivePlaylist}
            onFolderSelected={addFilesToActivePlaylist}
            onNativeFilesSelected={fileSystemAccess.selectMusicFiles}
            onNativeFolderSelected={fileSystemAccess.selectMusicFolder}
            onClear={handleClearTracks}
            onEnterMiniMode={enterMiniMode}
            onOpenImageSettings={() => setImageSettingsOpen(true)}
            isDesktopApp={isDesktopApp}
            onMinimizeWindow={() => handleWindowControl("minimize")}
            onToggleMaximizeWindow={() => handleWindowControl("toggle-maximize")}
            onToggleFullscreenWindow={() => handleWindowControl("toggle-fullscreen")}
            onCloseWindow={() => handleWindowControl("close")}
          />
        }
        left={
          <>
            <CharacterStage
              currentTrack={player.currentTrack}
              isPlaying={player.isPlaying}
              trackCount={tracks.length}
              showWebLimitNotice={!isDesktopApp}
            />
            <PlayerCore
              currentTrack={player.currentTrack}
              isPlaying={player.isPlaying}
              currentTime={player.currentTime}
              duration={player.duration}
              volume={player.volume}
              muted={player.muted}
              repeatMode={player.repeatMode}
              shuffle={player.shuffle}
              trackCount={playbackTracks.length}
              sourceLabel={
                playlistsState.activePlaylist?.type === "normal"
                  ? `播放清單：${playlistsState.activePlaylist.name}`
                  : playlistsState.activePlaylist?.name
              }
              sleepTimerActive={sleepTimer.active}
              sleepTimerLabel={sleepTimer.label}
              onTogglePlay={player.togglePlay}
              onPrevious={player.previous}
              onNext={player.next}
              onSeek={player.seek}
              onVolumeChange={player.setVolume}
              onToggleMute={player.toggleMute}
              onToggleShuffle={player.toggleShuffle}
              onCycleRepeatMode={player.cycleRepeatMode}
              onToggleLike={toggleLike}
              playlists={normalPlaylists}
              currentTrackPlaylistIds={
                player.currentTrack ? trackPlaylistIdsByTrackId[player.currentTrack.id] ?? [] : []
              }
              onAddCurrentTrackToPlaylist={handleAddTrackToPlaylist}
              onEditCurrentTrack={openCurrentSongInfo}
              onReloadCurrentTrackMetadata={() => void handleReloadCurrentTrackMetadata()}
              onShowCurrentTrackFileLocation={() => void handleShowCurrentTrackFileLocation()}
              canShowCurrentTrackFileLocation={Boolean(
                isDesktopApp && player.currentTrack?.sourcePath,
              )}
              showWebLimitNotice={!isDesktopApp}
            />
            <AudioVisualizer
              levels={visualizer.levels}
              enabled={resolvedVisualizerSettings.enabled}
              supported={visualizer.supported}
              minBarHeight={resolvedVisualizerSettings.minBarHeight}
              maxBarHeight={Math.max(48, resolvedVisualizerSettings.maxBarHeight * 2)}
              settings={resolvedVisualizerSettings}
              onSettingsChange={handleVisualizerSettingsChange}
              onToggle={() =>
                handleVisualizerSettingsChange({
                  ...resolvedVisualizerSettings,
                  enabled: !resolvedVisualizerSettings.enabled,
                })
              }
            />
            <SleepTimer
              mode={sleepTimer.mode}
              label={sleepTimer.label}
              active={sleepTimer.active}
              onStartMinutes={sleepTimer.startMinutes}
              onStartEndOfTrack={sleepTimer.startEndOfTrack}
              onCancel={sleepTimer.cancel}
            />
          </>
        }
        right={
          <div className="flex flex-col gap-4">
            <PlaylistSidebar
              playlists={playlistsState.playlists}
              activePlaylistId={playlistsState.activePlaylistId}
              playlistTrackIdsById={playlistsState.playlistTrackIdsById}
              onSelect={playlistsState.setActivePlaylistId}
              onCreateNormal={() => setPlaylistNameDialog({ kind: "normal" })}
              onCreateSmart={() => setSmartDialogOpen(true)}
              assistant={
                <AIAssistantPanel
                  embedded
                  tracks={tracks}
                  playlists={normalPlaylists}
                  onCreatePlaylist={handleCreateAIPlaylist}
                  onAddTracksToPlaylist={handleAddAITracksToPlaylist}
                />
              }
            />
            <PlaylistManager
              activePlaylist={playlistsState.activePlaylist}
              currentTrack={player.currentTrack ?? lastCurrentTrackRef.current}
              activeTrackIds={playlistsState.activeTrackIds}
              onRenameRequest={(playlist) =>
                setPlaylistNameDialog({
                  kind: "rename",
                  playlistId: playlist.id,
                  defaultName: playlist.name,
                })
              }
              onDelete={handleDeletePlaylist}
              onAddCurrentTrack={handleAddTrackToPlaylist}
              onRemoveCurrentTrack={handleRemoveCurrentTrackFromPlaylist}
            />
            <ImportExportPanel
              onExport={handleExportSettings}
              onImport={handleImportSettings}
            />
            <PlaylistPanel
              tracks={filteredTracks}
              totalTrackCount={tracks.length}
              currentTrackId={player.currentTrackId}
              isPlaying={player.isPlaying}
              searchKeyword={searchKeyword}
              sortMode={sortMode}
              onSearchChange={setSearchKeyword}
              onSortModeChange={setSortMode}
              onPlayTrack={(trackId) => player.selectTrack(trackId, true)}
              onTogglePlay={player.togglePlay}
              onToggleLike={toggleLike}
              onRemoveTrack={handleRemoveVisibleTrack}
              activePlaylist={playlistsState.activePlaylist}
              canReorder={canDragReorderVisibleTracks}
              onReorder={handleReorderVisibleTracks}
              playlists={normalPlaylists}
              trackPlaylistIdsByTrackId={trackPlaylistIdsByTrackId}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
            />
          </div>
        }
        miniPlayer={
          <MiniPlayer
            currentTrack={player.currentTrack}
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            trackCount={playbackTracks.length}
            sleepTimerActive={sleepTimer.active}
            sleepTimerLabel={sleepTimer.label}
            onTogglePlay={player.togglePlay}
            onPrevious={player.previous}
            onNext={player.next}
            onSeek={player.seek}
          />
        }
      />
      {onboarding.showOnboarding && (
        <Onboarding
          onSkip={onboarding.completeOnboarding}
          onComplete={onboarding.completeOnboarding}
        />
      )}
      {playlistDeleteRequest && (
        <PlaylistDeleteDialog
          playlistName={playlistDeleteRequest.name}
          onCancel={() => setPlaylistDeleteRequest(null)}
          onConfirm={() => {
            playlistsState.deletePlaylist(playlistDeleteRequest.id);
            showInfo(`已刪除播放清單：${playlistDeleteRequest.name}`);
            setPlaylistDeleteRequest(null);
          }}
        />
      )}
      {playlistDuplicateRequest && (
        <PlaylistDuplicateDialog
          playlistName={playlistDuplicateRequest.playlistName}
          trackTitle={playlistDuplicateRequest.trackTitle}
          onCancel={() => {
            setPlaylistDuplicateRequest(null);
            showInfo("已取消加入，播放清單沒有變更。");
          }}
          onConfirm={() => {
            playlistsState.addTrackToPlaylist(
              playlistDuplicateRequest.playlistId,
              playlistDuplicateRequest.trackId,
            );
            showInfo(
              `已將「${playlistDuplicateRequest.trackTitle}」再次加入「${playlistDuplicateRequest.playlistName}」。`,
            );
            setPlaylistDuplicateRequest(null);
          }}
        />
      )}
      <SmartPlaylistEditorDialog
        open={smartDialogOpen}
        onClose={() => setSmartDialogOpen(false)}
        onError={showError}
        onCreate={(playlist) => {
          playlistsState.createSmartPlaylist(playlist);
          showInfo("已建立智慧型播放清單，會依照規則自動更新。");
        }}
      />
      <PlaylistNameDialog
        open={playlistNameDialog?.kind === "normal"}
        title="新增播放清單"
        eyebrow="Playlist"
        defaultName="未命名播放清單"
        onClose={() => setPlaylistNameDialog(null)}
        onError={showError}
        onSubmit={(name) => {
          if (playlistNameExists(playlistsState.userPlaylists, name)) {
            showError(`已經有名為「${name}」的歌單。`);
            return false;
          }

          playlistsState.createPlaylist(name);
          showInfo(`已建立播放清單「${name}」。`);
        }}
      />
      <PlaylistNameDialog
        open={playlistNameDialog?.kind === "rename"}
        title="重新命名歌單"
        eyebrow="Rename"
        defaultName={
          playlistNameDialog?.kind === "rename"
            ? playlistNameDialog.defaultName
            : "未命名播放清單"
        }
        confirmLabel="儲存"
        onClose={() => setPlaylistNameDialog(null)}
        onError={showError}
        onSubmit={(name) => {
          if (playlistNameDialog?.kind !== "rename") {
            return;
          }
          if (
            playlistNameExists(
              playlistsState.userPlaylists,
              name,
              playlistNameDialog.playlistId,
            )
          ) {
            showError(`已經有名為「${name}」的歌單或資料夾。`);
            return false;
          }

          playlistsState.renamePlaylist(playlistNameDialog.playlistId, name);
          showInfo(`已重新命名為「${name}」。`);
        }}
      />
      <ImageSettingsDialog
        open={imageSettingsOpen}
        images={customImages}
        busySlot={customImageBusy}
        colorSettings={resolvedThemeColorSettings}
        miniOpacity={resolvedMiniSettings.opacity}
        onClose={() => setImageSettingsOpen(false)}
        onSelect={handleSelectCustomImage}
        onRemove={handleRemoveCustomImage}
        onColorSettingsChange={setThemeColorSettings}
        onMiniOpacityChange={handleMiniOpacityChange}
        onResetColors={() => {
          setThemeColorSettings(defaultThemeColorSettings);
          handleMiniOpacityChange(defaultMiniPlayerSettings.opacity);
          showInfo("色彩與透明度已全部復原。");
        }}
      />
      <SongInfoPanel
        open={Boolean(songInfoTrack)}
        track={songInfoTrack}
        isDesktopApp={isDesktopApp}
        onClose={() => setSongInfoTrackId(null)}
        onApplyToOriginal={handleApplySongInfoToOriginal}
        onError={showError}
      />
    </BrandAssetsContext.Provider>
  );
}
