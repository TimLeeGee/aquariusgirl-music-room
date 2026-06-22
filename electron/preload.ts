import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("aquariusgirlAPI", {
  selectMusicFiles: () => ipcRenderer.invoke("aquariusgirl:select-music-files"),
  selectMusicFolder: () => ipcRenderer.invoke("aquariusgirl:select-music-folder"),
  restoreMusicPaths: (paths: string[]) =>
    ipcRenderer.invoke("aquariusgirl:restore-music-paths", paths),
  getPlatform: () => ipcRenderer.invoke("aquariusgirl:get-platform"),
  getAppDataPath: () => ipcRenderer.invoke("aquariusgirl:get-app-data-path"),
  loadCustomImages: () => ipcRenderer.invoke("aquariusgirl:load-custom-images"),
  selectCustomImage: (slot: string) =>
    ipcRenderer.invoke("aquariusgirl:select-custom-image", slot),
  removeCustomImage: (slot: string) =>
    ipcRenderer.invoke("aquariusgirl:remove-custom-image", slot),
  checkForUpdates: () => ipcRenderer.invoke("aquariusgirl:check-for-updates"),
  setMiniPlayerMode: (settings: unknown) =>
    ipcRenderer.invoke("aquariusgirl:set-mini-player-mode", settings),
  setMiniAlwaysOnTop: (enabled: boolean) =>
    ipcRenderer.invoke("aquariusgirl:set-mini-always-on-top", enabled),
  getMiniAlwaysOnTop: () => ipcRenderer.invoke("aquariusgirl:get-mini-always-on-top"),
  windowControl: (action: string) => ipcRenderer.invoke("aquariusgirl:window-control", action),
  getWindowBounds: () => ipcRenderer.invoke("aquariusgirl:get-window-bounds"),
});
