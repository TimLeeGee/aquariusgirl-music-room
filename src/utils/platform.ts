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

export type AquariusgirlElectronAPI = {
  selectMusicFiles: () => Promise<ElectronSelectedFile[]>;
  selectMusicFolder: () => Promise<ElectronSelectedFile[]>;
  restoreMusicPaths: (paths: string[]) => Promise<{
    files: ElectronSelectedFile[];
    missingPaths: string[];
  }>;
  getPlatform: () => Promise<{ platform: string; arch: string; isElectron: boolean }>;
  getAppDataPath: () => Promise<string>;
  loadCustomImages: () => Promise<CustomImages>;
  selectCustomImage: (slot: CustomImageSlot) => Promise<CustomImageResult>;
  removeCustomImage: (slot: CustomImageSlot) => Promise<CustomImageResult>;
  checkForUpdates: () => Promise<{ available: false; message: string }>;
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
};

export type ElectronSelectedFile = {
  name: string;
  type: string;
  buffer: ArrayBuffer;
  sourcePath?: string;
  lastModified?: number;
  relativePath?: string;
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
