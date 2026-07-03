import { app, BrowserWindow, dialog, ipcMain, screen, shell, type Rectangle } from "electron";
import { appendFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LocalAIService } from "./ai/aiService.js";
import {
  isCustomImageSlot,
  loadCustomImages,
  maxCustomImageBytes,
  removeCustomImage,
  saveCustomImage,
} from "./customImages.js";
import {
  readSongInfoFromOriginalFile,
  writeSongInfoToOriginalFile,
} from "./songInfoWriter.js";
import { toSelectedFile } from "./selectedFile.js";

const supportedExtensions = new Set([".mp3", ".wav", ".ogg", ".m4a", ".flac"]);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localAIService = new LocalAIService();
let mainWindow: BrowserWindow | null = null;
let isMiniMode = false;
const windowBoundsState: {
  fullBounds?: Rectangle;
  miniBounds?: Rectangle;
} = {};

type MiniPlayerWindowSettings = {
  enabled: boolean;
  alwaysOnTop: boolean;
  opacity: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  fullBounds?: Rectangle;
  miniBounds?: Rectangle;
};

const defaultFullSize = { width: 1280, height: 860 };
// ponytail: Keep native Windows caption controls; add only their 20px layout inset.
const defaultMiniSize = { width: 260, height: process.platform === "win32" ? 288 : 268 };
const titleBarOverlay = {
  color: "#080b1f",
  symbolColor: "#ffffff",
  height: 36,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isUsableBounds(bounds?: Partial<Rectangle> | null): bounds is Rectangle {
  return Boolean(
    bounds &&
      Number.isFinite(bounds.x) &&
      Number.isFinite(bounds.y) &&
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height) &&
      Number(bounds.width) > 0 &&
      Number(bounds.height) > 0,
  );
}

function ensureBoundsVisible(bounds: Rectangle, minimum = { width: 240, height: 220 }) {
  const matchingDisplay = screen.getDisplayMatching(bounds);
  const workArea = matchingDisplay.workArea;
  const width = clamp(
    Math.round(bounds.width),
    minimum.width,
    Math.max(minimum.width, workArea.width),
  );
  const height = clamp(
    Math.round(bounds.height),
    minimum.height,
    Math.max(minimum.height, workArea.height),
  );
  const maxX = workArea.x + workArea.width - width;
  const maxY = workArea.y + workArea.height - height;

  return {
    x: clamp(Math.round(bounds.x), workArea.x, Math.max(workArea.x, maxX)),
    y: clamp(Math.round(bounds.y), workArea.y, Math.max(workArea.y, maxY)),
    width,
    height,
  };
}

function getCenteredFullBounds() {
  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea;
  // ponytail: Keep a visible desktop margin; add saved startup bounds only if users request them.
  const width = Math.min(defaultFullSize.width, Math.round(workArea.width * 0.9));
  const height = Math.min(defaultFullSize.height, Math.round(workArea.height * 0.9));

  return {
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + (workArea.height - height) / 2),
    width,
    height,
  };
}

function getDefaultMiniBounds() {
  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea;
  const margin = 24;

  return {
    x: Math.round(workArea.x + workArea.width - defaultMiniSize.width - margin),
    y: Math.round(workArea.y + workArea.height - defaultMiniSize.height - margin),
    width: defaultMiniSize.width,
    height: defaultMiniSize.height,
  };
}

function boundsFromMiniSettings(settings: MiniPlayerWindowSettings): Rectangle | null {
  const x = settings.x;
  const y = settings.y;
  const width = settings.width || defaultMiniSize.width;
  const height = settings.height || defaultMiniSize.height;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: Math.round(x ?? 0),
    y: Math.round(y ?? 0),
    width: Math.round(width),
    height: Math.round(height),
  };
}

function serializeBounds(bounds?: Rectangle) {
  return bounds
    ? {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }
    : undefined;
}

async function collectAudioFiles(folderPath: string): Promise<string[]> {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        return collectAudioFiles(entryPath);
      }
      return supportedExtensions.has(path.extname(entry.name).toLowerCase())
        ? [entryPath]
        : [];
    }),
  );

  return files.flat();
}

function getCustomImagesRoot() {
  return path.join(app.getPath("userData"), "custom-images");
}

function getAIPlaylistActionLogPath() {
  return app.isPackaged
    ? path.join(app.getPath("userData"), "AI_PLAYLIST_ACTION_LOG.md")
    : path.join(app.getAppPath(), "docs", "AI_PLAYLIST_ACTION_LOG.md");
}

function safeLogEntry(value: unknown) {
  return typeof value === "string" ? value.slice(0, 24_000).trim() : "";
}

function createMainWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  const initialBounds = getCenteredFullBounds();
  const titleBarOptions =
    process.platform === "darwin"
      ? {
          titleBarStyle: "hiddenInset" as const,
          trafficLightPosition: { x: 18, y: 16 },
        }
      : {
          titleBarStyle: "hidden" as const,
          titleBarOverlay,
        };
  const window = new BrowserWindow({
    ...initialBounds,
    minWidth: 960,
    minHeight: 680,
    title: "Aquariusgirl Music Room",
    frame: true,
    transparent: false,
    backgroundColor: "#080b1f",
    ...titleBarOptions,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  mainWindow = window;

  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    void window.loadURL(devServerUrl);
    if (process.env.AQUARIUSGIRL_OPEN_DEVTOOLS === "1") {
      window.webContents.openDevTools({ mode: "detach" });
    }
  } else {
    void window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  localAIService.shutdown();
});

ipcMain.handle("aquariusgirl:select-music-files", async () => {
  const result = await dialog.showOpenDialog({
    title: "選擇音樂檔案",
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Audio Files",
        extensions: ["mp3", "wav", "ogg", "m4a", "flac"],
      },
    ],
  });

  if (result.canceled) {
    return [];
  }

  return Promise.all(result.filePaths.map((filePath) => toSelectedFile(filePath)));
});

ipcMain.handle("aquariusgirl:select-music-folder", async () => {
  const result = await dialog.showOpenDialog({
    title: "選擇音樂資料夾",
    properties: ["openDirectory"],
  });

  if (result.canceled || !result.filePaths[0]) {
    return [];
  }

  const folderPath = result.filePaths[0];
  const audioFiles = await collectAudioFiles(folderPath);
  return Promise.all(audioFiles.map((filePath) => toSelectedFile(filePath, folderPath)));
});

ipcMain.handle("aquariusgirl:restore-music-paths", async (_event, sourcePaths: unknown) => {
  if (!Array.isArray(sourcePaths)) {
    return { files: [], missingPaths: [] };
  }

  const uniquePaths = Array.from(
    new Set(
      sourcePaths
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
        .filter((filePath) => path.isAbsolute(filePath)),
    ),
  );
  const files = [];
  const missingPaths = [];

  for (const filePath of uniquePaths) {
    if (!supportedExtensions.has(path.extname(filePath).toLowerCase())) {
      continue;
    }

    try {
      files.push(await toSelectedFile(filePath, undefined, { readMetadata: false }));
    } catch {
      missingPaths.push(filePath);
    }
  }

  return { files, missingPaths };
});

ipcMain.handle("aquariusgirl:show-track-in-folder", async (_event, sourcePath: unknown) => {
  if (typeof sourcePath !== "string" || !path.isAbsolute(sourcePath)) {
    return { ok: false, error: "這首歌沒有可顯示的位置。" };
  }

  try {
    const fileStat = await stat(sourcePath);

    if (!fileStat.isFile()) {
      return { ok: false, error: "找不到原始音樂檔。" };
    }

    shell.showItemInFolder(sourcePath);
    return { ok: true };
  } catch {
    return { ok: false, error: "找不到原始音樂檔。" };
  }
});

ipcMain.handle("aquariusgirl:read-song-info-from-original-file", async (_event, sourcePath: unknown) => {
  if (typeof sourcePath !== "string" || !path.isAbsolute(sourcePath)) {
    return { ok: false, error: "重新讀取音樂標籤失敗，請確認原始檔仍可讀取。" };
  }

  try {
    return await readSongInfoFromOriginalFile(sourcePath);
  } catch (error) {
    console.error("[song-info] Failed to read original metadata:", error);
    return { ok: false, error: "重新讀取音樂標籤失敗，請確認原始檔仍可讀取。" };
  }
});

ipcMain.handle("aquariusgirl:apply-song-info-to-original-file", async (_event, payload: unknown) => {
  const sourcePath =
    payload && typeof payload === "object"
      ? (payload as { sourcePath?: unknown }).sourcePath
      : undefined;
  const metadata =
    payload && typeof payload === "object"
      ? (payload as { metadata?: unknown }).metadata
      : undefined;

  if (typeof sourcePath !== "string" || !path.isAbsolute(sourcePath)) {
    return { ok: false, error: "寫回原始檔失敗，原始檔未修改" };
  }

  try {
    return await writeSongInfoToOriginalFile(
      sourcePath,
      metadata && typeof metadata === "object" ? metadata : {},
    );
  } catch (error) {
    console.error("[song-info] Failed to write original metadata:", error);
    return { ok: false, error: "寫回原始檔失敗，原始檔未修改" };
  }
});

ipcMain.handle("aquariusgirl:get-platform", () => ({
  platform: process.platform,
  arch: process.arch,
  isElectron: true,
}));

ipcMain.handle("aquariusgirl:get-app-data-path", () => app.getPath("userData"));

ipcMain.handle("aquariusgirl:load-custom-images", async () => {
  return loadCustomImages(getCustomImagesRoot());
});

ipcMain.handle("aquariusgirl:select-custom-image", async (_event, slot: unknown) => {
  if (!isCustomImageSlot(slot)) {
    return { ok: false, error: "圖片欄位無效。" };
  }

  const result = await dialog.showOpenDialog({
    title: "選擇自訂圖片",
    properties: ["openFile"],
    filters: [{ name: "圖片", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }],
  });

  if (result.canceled || !result.filePaths[0]) {
    return { ok: false, canceled: true };
  }

  try {
    const sourcePath = result.filePaths[0];
    const fileStat = await stat(sourcePath);
    if (!fileStat.isFile() || fileStat.size > maxCustomImageBytes) {
      return { ok: false, error: "圖片必須小於 10 MB。" };
    }

    const image = await saveCustomImage(getCustomImagesRoot(), slot, await readFile(sourcePath));
    return { ok: true, image };
  } catch (error) {
    if (error instanceof Error && error.message === "unsupported-image") {
      return { ok: false, error: "只支援 PNG、JPG、WebP 或 GIF 圖片。" };
    }
    return { ok: false, error: "圖片無法儲存，原始檔案沒有被修改。" };
  }
});

ipcMain.handle("aquariusgirl:remove-custom-image", async (_event, slot: unknown) => {
  if (!isCustomImageSlot(slot)) {
    return { ok: false, error: "圖片欄位無效。" };
  }

  try {
    await removeCustomImage(getCustomImagesRoot(), slot);
    return { ok: true };
  } catch {
    return { ok: false, error: "自訂圖片無法移除。" };
  }
});

ipcMain.handle("aquariusgirl:check-for-updates", () => ({
  available: false,
  message: "Auto update is reserved for a future electron-updater integration.",
}));

ipcMain.handle("aquariusgirl:append-ai-playlist-action-log", async (_event, entry: unknown) => {
  const text = safeLogEntry(entry);
  if (!text) {
    return { ok: false, error: "action log is empty" };
  }

  const logPath = getAIPlaylistActionLogPath();
  // ponytail: dev writes to docs for QA; packaged writes userData because app resources are read-only.
  await mkdir(path.dirname(logPath), { recursive: true });
  await appendFile(logPath, `${text}\n`, "utf8");
  return { ok: true, path: logPath };
});

ipcMain.handle(
  "aquariusgirl:set-mini-player-mode",
  (event, settings: MiniPlayerWindowSettings) => {
    const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
    if (!window) {
      return { ok: false };
    }

    if (settings.enabled) {
      if (!isMiniMode) {
        windowBoundsState.fullBounds = ensureBoundsVisible(
          window.isMaximized() || window.isFullScreen()
            ? window.getNormalBounds()
            : window.getBounds(),
          { width: 960, height: 680 },
        );
      } else if (isUsableBounds(settings.fullBounds)) {
        windowBoundsState.fullBounds = ensureBoundsVisible(
          settings.fullBounds,
          { width: 960, height: 680 },
        );
      }

      const requestedMiniBounds = isUsableBounds(settings.miniBounds)
        ? settings.miniBounds
        : boundsFromMiniSettings(settings) ?? windowBoundsState.miniBounds ?? getDefaultMiniBounds();
      const nextMiniBounds = ensureBoundsVisible(
        {
          ...requestedMiniBounds,
          // ponytail: Persist Mini position only; fixed size prevents Windows DPI/title-bar feedback drift.
          width: defaultMiniSize.width,
          height: defaultMiniSize.height,
        },
        { width: 240, height: defaultMiniSize.height },
      );
      windowBoundsState.miniBounds = nextMiniBounds;
      // ponytail: Clear native full-window state before fixed Mini bounds; one BrowserWindow stays enough.
      if (window.isFullScreen()) window.setFullScreen(false);
      if (window.isMaximized()) window.unmaximize();
      window.setMinimumSize(240, defaultMiniSize.height);
      window.setResizable(false);
      window.setAlwaysOnTop(Boolean(settings.alwaysOnTop), "floating");
      window.setBackgroundColor("#080b1f");
      // ponytail: Use native window opacity; avoid a second transparent BrowserWindow and audio engine.
      const miniOpacity = Math.min(1, Math.max(0.2, settings.opacity));
      window.setOpacity(miniOpacity);
      window.setTitle("");
      if (process.platform === "darwin") {
        window.setWindowButtonVisibility(false);
      } else {
        window.setTitleBarOverlay({
          ...titleBarOverlay,
          height: 0,
        });
      }
      window.setBounds(nextMiniBounds, true);
      isMiniMode = true;

      return {
        ok: true,
        bounds: serializeBounds(window.getBounds()),
        fullBounds: serializeBounds(windowBoundsState.fullBounds),
        miniBounds: serializeBounds(windowBoundsState.miniBounds),
      };
    }

    if (isMiniMode) {
      windowBoundsState.miniBounds = ensureBoundsVisible(
        window.getBounds(),
        { width: 240, height: defaultMiniSize.height },
      );
    }

    if (isUsableBounds(settings.fullBounds)) {
      windowBoundsState.fullBounds = ensureBoundsVisible(
        settings.fullBounds,
        { width: 960, height: 680 },
      );
    }

    const nextFullBounds = ensureBoundsVisible(
      windowBoundsState.fullBounds ?? getCenteredFullBounds(),
      { width: 960, height: 680 },
    );
    windowBoundsState.fullBounds = nextFullBounds;
    window.setResizable(true);
    window.setMinimumSize(960, 680);
    window.setAlwaysOnTop(false);
    window.setBackgroundColor("#080b1f");
    window.setOpacity(1);
    window.setTitle("Aquariusgirl Music Room");
    if (process.platform === "darwin") {
      window.setWindowButtonVisibility(true);
    } else {
      window.setTitleBarOverlay(titleBarOverlay);
    }
    window.setBounds(nextFullBounds, true);
    isMiniMode = false;

    return {
      ok: true,
      bounds: serializeBounds(window.getBounds()),
      fullBounds: serializeBounds(windowBoundsState.fullBounds),
      miniBounds: serializeBounds(windowBoundsState.miniBounds),
    };
  },
);

ipcMain.handle("aquariusgirl:set-mini-always-on-top", (event, enabled: boolean) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  if (!window) {
    return { ok: false, alwaysOnTop: false };
  }

  window.setAlwaysOnTop(Boolean(enabled), "floating");
  return { ok: true, alwaysOnTop: window.isAlwaysOnTop() };
});

ipcMain.handle("aquariusgirl:get-mini-always-on-top", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  return { ok: Boolean(window), alwaysOnTop: window?.isAlwaysOnTop() ?? false };
});

ipcMain.handle("aquariusgirl:window-control", (event, action: string) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  if (!window) {
    return { ok: false };
  }

  if (action === "minimize") {
    window.minimize();
    return { ok: true };
  }

  if (action === "toggle-maximize") {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
    return { ok: true };
  }

  if (action === "toggle-fullscreen") {
    window.setFullScreen(!window.isFullScreen());
    return { ok: true };
  }

  if (action === "close") {
    window.close();
    return { ok: true };
  }

  return { ok: false };
});

ipcMain.handle("aquariusgirl:get-window-bounds", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  return window?.getBounds() ?? null;
});

ipcMain.handle("aquariusgirl:ai-status", () => localAIService.getStatus());

ipcMain.handle("aquariusgirl:ai-init", () => localAIService.init());

ipcMain.handle("aquariusgirl:ai-chat", async (event, payload: unknown) => {
  const requestId =
    payload && typeof payload === "object" && typeof (payload as { requestId?: unknown }).requestId === "string"
      ? (payload as { requestId: string }).requestId
      : "";
  const messages =
    payload && typeof payload === "object" ? (payload as { messages?: unknown }).messages : [];

  return localAIService.chat(messages, {
    onToken: (token) => {
      event.sender.send("aquariusgirl:ai-chat-token", { requestId, token });
    },
  });
});

ipcMain.handle("aquariusgirl:ai-cancel", () => localAIService.cancel());

ipcMain.handle("aquariusgirl:ai-search-intent", (_event, payload: unknown) => {
  const userText =
    payload && typeof payload === "object" ? (payload as { userText?: unknown }).userText : "";
  const librarySummary =
    payload && typeof payload === "object" ? (payload as { librarySummary?: unknown }).librarySummary : {};

  return localAIService.parseMusicSearchIntent(userText, librarySummary);
});

ipcMain.handle("aquariusgirl:ai-compose-reply", (_event, payload: unknown) => {
  const toolResult =
    payload && typeof payload === "object" ? (payload as { toolResult?: unknown }).toolResult : {};
  const fallbackText =
    payload && typeof payload === "object" ? (payload as { fallbackText?: unknown }).fallbackText : "";

  return localAIService.composeToolReply(toolResult, fallbackText);
});
