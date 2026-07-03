import type { SongInfoDraft } from "./songInfo";

export type CustomImageSlot =
  | "logo"
  | "avatar"
  | "banner"
  | "background"
  | "characterIdle"
  | "characterPlaying"
  | "coverPlaceholder"
  | "decorationStar"
  | "decorationBubble";

export type CustomImages = Partial<Record<CustomImageSlot, string>>;

type CustomImageResult = {
  ok: boolean;
  canceled?: boolean;
  image?: string;
  error?: string;
};

export type AIStatus = {
  available: boolean;
  isModelLoading: boolean;
  isModelReady: boolean;
  isGenerating: boolean;
  runtime: "llama.cpp sidecar";
  error?: string;
};

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIChatResult =
  | { ok: true; text: string }
  | { ok: false; error: string; canceled?: boolean };

export type AIMusicIntentResult =
  | { ok: true; intent: unknown }
  | { ok: false; error: string };

export type AIReplyResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export type AquariusgirlElectronAPI = {
  selectMusicFiles: () => Promise<ElectronSelectedFile[]>;
  selectMusicFolder: () => Promise<ElectronSelectedFile[]>;
  restoreMusicPaths: (paths: string[], options?: { readMetadata?: boolean }) => Promise<{
    files: ElectronSelectedFile[];
    missingPaths: string[];
  }>;
  showTrackInFolder?: (sourcePath: string) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  readSongInfoFromOriginalFile?: (sourcePath: string) => Promise<{
    ok: boolean;
    metadata?: SongInfoDraft;
    error?: string;
  }>;
  applySongInfoToOriginalFile?: (payload: {
    sourcePath: string;
    metadata: SongInfoDraft;
  }) => Promise<{
    ok: boolean;
    unsupported?: boolean;
    error?: string;
  }>;
  getPlatform: () => Promise<{ platform: string; arch: string; isElectron: boolean }>;
  getAppDataPath: () => Promise<string>;
  loadCustomImages: () => Promise<CustomImages>;
  selectCustomImage: (slot: CustomImageSlot) => Promise<CustomImageResult>;
  removeCustomImage: (slot: CustomImageSlot) => Promise<CustomImageResult>;
  checkForUpdates: () => Promise<{ available: false; message: string }>;
  appendAIPlaylistActionLog?: (entry: string) => Promise<{
    ok: boolean;
    path?: string;
    error?: string;
  }>;
  setMiniPlayerMode: (settings: {
    enabled: boolean;
    alwaysOnTop: boolean;
    opacity: number;
    width: number;
    height: number;
    x?: number;
    y?: number;
    fullBounds?: { x: number; y: number; width: number; height: number };
    miniBounds?: { x: number; y: number; width: number; height: number };
  }) => Promise<{
      ok: boolean;
      bounds?: { x: number; y: number; width: number; height: number };
      fullBounds?: { x: number; y: number; width: number; height: number };
      miniBounds?: { x: number; y: number; width: number; height: number };
  }>;
  setMiniAlwaysOnTop: (enabled: boolean) => Promise<{ ok: boolean; alwaysOnTop: boolean }>;
  getMiniAlwaysOnTop: () => Promise<{ ok: boolean; alwaysOnTop: boolean }>;
  windowControl: (
    action: "minimize" | "toggle-maximize" | "toggle-fullscreen" | "close",
  ) => Promise<{ ok: boolean }>;
  getWindowBounds: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
  ai?: {
    getAIStatus: () => Promise<AIStatus>;
    initAI: () => Promise<AIStatus>;
    sendAIMessage: (
      messages: AIChatMessage[],
      onToken?: (token: string) => void,
    ) => Promise<AIChatResult>;
    cancelAI: () => Promise<{ ok: boolean; canceled: boolean }>;
    parseMusicSearchIntent: (
      userText: string,
      librarySummary: unknown,
    ) => Promise<AIMusicIntentResult>;
    composeAIReply: (
      toolResult: unknown,
      fallbackText: string,
    ) => Promise<AIReplyResult>;
  };
};

export type ElectronSelectedFile = {
  name: string;
  type: string;
  buffer?: ArrayBuffer;
  localUrl?: string;
  size?: number;
  sourcePath?: string;
  lastModified?: number;
  relativePath?: string;
  metadata?: SongInfoDraft;
};

declare global {
  interface Window {
    aquariusgirlAPI?: AquariusgirlElectronAPI;
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

export function isElectronRuntime() {
  return Boolean(
    window.aquariusgirlAPI ||
      window.navigator.userAgent.toLowerCase().includes("electron"),
  );
}

export function supportsFileSystemAccess() {
  return "showDirectoryPicker" in window;
}
