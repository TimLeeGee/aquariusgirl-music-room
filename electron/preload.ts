import { contextBridge, ipcRenderer } from "electron";

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

contextBridge.exposeInMainWorld("aquariusgirlAPI", {
  selectMusicFiles: () => ipcRenderer.invoke("aquariusgirl:select-music-files"),
  selectMusicFolder: () => ipcRenderer.invoke("aquariusgirl:select-music-folder"),
  restoreMusicPaths: (paths: string[], options?: unknown) =>
    ipcRenderer.invoke("aquariusgirl:restore-music-paths", paths, options),
  showTrackInFolder: (sourcePath: string) =>
    ipcRenderer.invoke("aquariusgirl:show-track-in-folder", sourcePath),
  readSongInfoFromOriginalFile: (sourcePath: string) =>
    ipcRenderer.invoke("aquariusgirl:read-song-info-from-original-file", sourcePath),
  applySongInfoToOriginalFile: (payload: unknown) =>
    ipcRenderer.invoke("aquariusgirl:apply-song-info-to-original-file", payload),
  getPlatform: () => ipcRenderer.invoke("aquariusgirl:get-platform"),
  getAppDataPath: () => ipcRenderer.invoke("aquariusgirl:get-app-data-path"),
  loadCustomImages: () => ipcRenderer.invoke("aquariusgirl:load-custom-images"),
  selectCustomImage: (slot: string) =>
    ipcRenderer.invoke("aquariusgirl:select-custom-image", slot),
  removeCustomImage: (slot: string) =>
    ipcRenderer.invoke("aquariusgirl:remove-custom-image", slot),
  checkForUpdates: () => ipcRenderer.invoke("aquariusgirl:check-for-updates"),
  appendAIPlaylistActionLog: (entry: string) =>
    ipcRenderer.invoke("aquariusgirl:append-ai-playlist-action-log", entry),
  saveMetadataFixSnapshot: (payload: { sessionId: string; entries: unknown[] }) =>
    ipcRenderer.invoke("aquariusgirl:save-metadata-fix-snapshot", payload),
  setMiniPlayerMode: (settings: unknown) =>
    ipcRenderer.invoke("aquariusgirl:set-mini-player-mode", settings),
  setMiniAlwaysOnTop: (enabled: boolean) =>
    ipcRenderer.invoke("aquariusgirl:set-mini-always-on-top", enabled),
  getMiniAlwaysOnTop: () => ipcRenderer.invoke("aquariusgirl:get-mini-always-on-top"),
  windowControl: (action: string) => ipcRenderer.invoke("aquariusgirl:window-control", action),
  getWindowBounds: () => ipcRenderer.invoke("aquariusgirl:get-window-bounds"),
  ai: {
    getAIStatus: () => ipcRenderer.invoke("aquariusgirl:ai-status"),
    initAI: () => ipcRenderer.invoke("aquariusgirl:ai-init"),
    sendAIMessage: (messages: unknown, onToken?: (token: string) => void) => {
      const requestId = createRequestId();
      const listener = (_event: Electron.IpcRendererEvent, payload: unknown) => {
        if (
          typeof onToken === "function" &&
          payload &&
          typeof payload === "object" &&
          (payload as { requestId?: unknown }).requestId === requestId &&
          typeof (payload as { token?: unknown }).token === "string"
        ) {
          onToken((payload as { token: string }).token);
        }
      };

      ipcRenderer.on("aquariusgirl:ai-chat-token", listener);
      return ipcRenderer
        .invoke("aquariusgirl:ai-chat", { requestId, messages })
        .finally(() => {
          ipcRenderer.removeListener("aquariusgirl:ai-chat-token", listener);
        });
    },
    cancelAI: () => ipcRenderer.invoke("aquariusgirl:ai-cancel"),
    parseMusicSearchIntent: (userText: string, librarySummary: unknown) =>
      ipcRenderer.invoke("aquariusgirl:ai-search-intent", { userText, librarySummary }),
    composeAIReply: (toolResult: unknown, fallbackText: string) =>
      ipcRenderer.invoke("aquariusgirl:ai-compose-reply", { toolResult, fallbackText }),
  },
});
