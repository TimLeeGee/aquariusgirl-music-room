# Aquariusgirl Music Room

English version: see [English Version](#english-version).

水瓶罐子的音樂小水池是一款本地音樂播放器。Web 版可用瀏覽器啟動，Electron 版可打包成桌面安裝檔。播放器只讀取使用者明確選擇的本機音樂，不使用 YouTube、不串接線上音樂、不下載音樂、不生成圖片。

## 交付檔案索引

| 英文檔名 | 中文意思 |
| --- | --- |
| `release-delivery` | 發佈交付 / 版本交付 |
| `INSTALL_UNINSTALL.md` | 安裝與解除安裝說明 |
| `INSTALLER_STATUS.md` | 安裝程式狀態 |
| `installers` | 安裝程式資料夾 |
| `KNOWN_ISSUES.md` | 已知問題 |
| `QA_REPORT.md` | 品質測試報告 / QA 報告 |
| `README.md` | 說明文件 / 專案介紹 |
| `VERSION.md` | 版本資訊 |
| `CONTINUE_WORK.md` | 後續工作 / 接續開發事項 |

## 授權

本專案採用 [MIT License](LICENSE)。

## 目前功能

- 本地音樂檔與資料夾載入
- 拖曳音樂檔加入歌單
- HTMLAudioElement 播放、暫停、切歌、音量、靜音、進度拖曳
- ID3v2 metadata 與專輯封面讀取，失敗時 fallback 檔名解析
- 睡前定時停止，支援 15/30/60 分鐘、自訂分鐘、播完本首
- Web Audio API 音樂頻譜，可關閉
- IndexedDB 保存歌曲 metadata 與歌單資料，不保存音樂檔本體
- File System Access API 資料夾授權，瀏覽器不支援時 fallback 到 `webkitdirectory`
- 多播放清單基礎管理
- 內建離線 AI 聊天與本機歌曲 metadata 搜尋歌單
- JSON 匯入 / 匯出歌單設定，不包含音樂檔本體
- OBS Browser Source 模式：`?mode=obs`
- Electron main/preload，安全暴露必要檔案選擇 API
- macOS Apple Silicon `.dmg` 與 Windows `.exe` 打包設定
- 第一次啟動新手引導

## 使用技術

- Vite
- React
- TypeScript
- Tailwind CSS
- HTMLAudioElement
- Web Audio API
- localStorage
- IndexedDB
- Electron
- electron-builder
- llama.cpp sidecar runtime
- 開源 AI prompt pack

## 安裝

```bash
npm install
```

如果 Electron binary 沒有下載完整，可執行：

```bash
npx install-electron --no
```

## Web 版啟動

```bash
npm run dev
```

打開 Vite 顯示的 localhost，例如：

```text
http://127.0.0.1:5173/
```

Web production build：

```bash
npm run build
```

## Electron 開發版

```bash
npm run electron
```

等同於：

```bash
npm run electron:dev
```

這會先編譯 `electron/main.ts` 與 `electron/preload.ts`，再啟動 Vite dev server，最後開啟 Electron 視窗。

## Electron 打包

檢查開源 prompt：

```bash
npm run check:prompts
```

打包前檢查內建 AI 模型與 llama.cpp runtime：

```bash
npm run check:ai-assets
```

正式發行打包，產出 macOS Apple Silicon DMG 與 Windows x64 NSIS EXE：

```bash
npm run dist:release
```

一般 `dist` 也是同一條正式發行流程：

```bash
npm run dist
```

macOS `.dmg`，只產 Apple Silicon arm64：

```bash
npm run dist:mac
```

Windows 10 / Windows 11 `.exe`：

```bash
npm run dist:win
```

依目前環境嘗試產出可支援的所有平台：

```bash
npm run dist:all
```

`dist:all` 會透過 `scripts/dist-all.mjs` 依作業系統選擇可支援的打包目標；在 macOS 上會產出 arm64 DMG 與 Windows x64 EXE。若缺少 Wine 或系統映像工具，錯誤會直接顯示在終端機。

最新可安裝檔只會保留在：

```text
release-delivery/installers/
```

`release/` 是 electron-builder 的暫存輸出，打包腳本會在同步最新版 DMG/EXE 後自動清掉，避免同時出現兩個看起來像交付資料夾的位置。

打包設定在 `package.json` 的 `build` 欄位：

- `appId`: `com.aquariusgirl.musicroom`
- `productName`: `Aquariusgirl Music Room`
- mac target: `dmg`
- mac arch: `arm64`
- win target: `nsis`
- desktop shortcut: enabled
- start menu shortcut: enabled

內建 AI 打包資源會放在：

```text
resources/ai/models/qwen3.5-0.8b.gguf
private/prompts/character_prompt.txt
private/prompts/ai_router_prompt.txt
private/prompts/ai_reply_prompt.txt
resources/ai/bin/<platform-arch>/llama-server
```

安裝後 main process 會從 `process.resourcesPath/ai/` 載入模型與 runtime，並從 `process.resourcesPath/prompts/` 載入三份 prompt。

舊指令仍保留為 alias：

```bash
npm run electron:build
npm run electron:build:mac
npm run electron:build:win
```

## GitHub Actions 打包

已新增：

```text
.github/workflows/release.yml
```

推送 tag，例如：

```bash
git tag v0.1.0
git push origin v0.1.0
```

workflow 會在 GitHub hosted runner 上產出：

- Windows x64 NSIS installer
- macOS arm64 DMG

workflow 可透過 `AI_MODEL_URL` secret 下載 GGUF 模型；模型檔本體不進 Git。

目前未設定 Apple Developer ID、notarization 或 Windows code signing。測試版 artifacts 可安裝測試，但正式公開發行前建議補簽章。

## 內建離線 AI

Aquariusgirl Music Room 的桌面版可隨 EXE / DMG 內建本機 AI。使用者不需要安裝 Ollama、不需要下載模型、不需要 Node.js，也不需要開終端機。

AI 完全在本機執行，不串接雲端 API。聊天與 AI 搜尋只使用目前載入歌曲的安全 metadata 摘要，不會上傳音樂檔、不會上傳使用者路徑，也不會把封面圖片、Blob、File 或 ArrayBuffer 傳給模型。

AI 版本使用 `qwen3.5 0.8B GGUF` 與 llama.cpp sidecar runtime。因為模型與 runtime 會包進安裝檔，EXE / DMG 會比純播放器版本大。模型啟動後會保持常駐，不會因為閒置自動卸載；關閉播放器時才釋放。

## 內建 AI prompt 與工具分工

水瓶罐子 AI 的 prompt 以開源文字檔維護，不加密或混淆。小模型只負責理解意圖與潤飾回覆；搜尋本機音樂、建立歌單、隨機歌單、加入歌單、避免刪除原始音樂檔等行為都由播放器程式執行。

模型 JSON 解析失敗時會走 deterministic fallback，不會把原始模型雜訊直接顯示給使用者。

## 桌面版使用流程

macOS：

1. 下載 `.dmg`
2. 打開 `.dmg`
3. 把 Aquariusgirl Music Room 拖到 Applications
4. 開啟 App
5. 第一次啟動看新手引導
6. 選擇音樂資料夾

Windows：

1. 下載 `.exe`
2. 雙擊安裝
3. 依照安裝精靈下一步
4. 從桌面捷徑或開始選單開啟
5. 第一次啟動看新手引導
6. 選擇音樂資料夾

使用者不需要安裝 Node.js，也不需要開終端機。

## 本地音樂載入

支援三種方式：

1. 選擇多個音樂檔
2. 選擇音樂資料夾
3. 拖曳音樂檔到播放器

支援格式：

- `.mp3`
- `.wav`
- `.ogg`
- `.m4a`
- `.flac`

Web 版不會自動掃描硬碟，只能讀取使用者手動選擇的檔案或資料夾。Electron 版也只會讀取使用者明確選擇的資料夾。

## ID3 Tag 與專輯封面

加入音樂時會嘗試讀取：

- title
- artist
- album
- year
- genre
- track number
- duration
- album artwork

目前主要支援 MP3 ID3v2。讀不到 metadata 時會 fallback 到檔名解析，例如 `Artist - Title.mp3`。讀不到封面時會使用 `brandAssets.coverPlaceholder`，再沒有就使用漸層 placeholder。

專輯封面顯示在：

- PlayerCore
- TrackItem
- MiniPlayer
- CharacterStage 播放中資訊區

Blob URL 會在移除歌曲、清空歌單、離開頁面時釋放。

## 睡前定時停止

支援：

- 15 分鐘後停止
- 30 分鐘後停止
- 60 分鐘後停止
- 自訂分鐘數
- 播完目前歌曲後停止

分鐘模式會在時間到前淡出音量，然後暫停播放。定時可取消。

## 音樂視覺化

使用 Web Audio API 與目前的 `HTMLAudioElement` 建立同一組 analyser，顯示即時 bars。使用者可以在 mini player 的「音樂條設定」調整開關、靈敏度、平滑度、音樂條數量、最小高度、最大高度、低音增益與反應速度。瀏覽器不支援 AudioContext 時，播放器仍可正常播放。

## 多播放清單

內建系統歌單：

- 全部歌曲
- 我喜歡的歌曲

使用者可以建立一般播放清單與智慧型播放清單。一般播放清單保存固定歌曲 id；智慧型播放清單保存 rules，會依目前歌曲 metadata 動態篩選。

一般播放清單的歌曲加入方式：

- 在歌曲列表右側使用「加入歌單」選單，把指定歌曲加入指定播放清單。
- 進入一般播放清單後，可用「加入目前歌曲」把目前歌曲加入該歌單。
- 已經在某歌單中的歌曲會顯示「已在 ...」，避免重複加入。
- 空白名稱與重複名稱會被阻擋並顯示提示。

舊版曾內建的「睡前小水波」、「罐子閃亮 Cover」、「狐狸女孩元氣歌」以及已退場的舊歌單型別會在播放器啟動時清理，不會刪除其他使用者自行建立的一般歌單與智慧型歌單。

## Mini Player

主播放器右上角可切換 mini 模式。Electron 桌面版 full mode 保留作業系統原生視窗框：macOS DMG 會有紅黃綠控制鈕，Windows EXE 會有原生最小化、最大化、關閉按鈕。

Mini 模式使用同一個 `BrowserWindow`，不建立第二個 audio element，因此切換時會保留目前歌曲、進度、播放狀態與音量。mini 控制列預設隱藏，滑鼠移入播放器小卡時才浮現；支援回完整播放器、always on top、透明度與音樂條設定。

## 匯入 / 匯出

匯出格式是 JSON，包含：

- playlists
- track metadata
- liked 狀態
- sortMode
- volume
- repeatMode
- shuffle
- theme settings
- app version
- exportedAt

不會匯出：

- 音樂檔本體
- File 物件
- localUrl
- 使用者系統絕對路徑

匯出檔名格式：

```text
aquariusgirl-music-room-backup-YYYY-MM-DD.json
```

匯入時會先檢查 JSON 來源、版本與主要資料格式，並顯示摘要讓使用者確認。確認後會以合併方式加入使用者歌單與偏好設定，不會直接覆蓋既有資料；若目前已重新選擇音樂檔，播放器會嘗試用檔名配對舊備份中的 track id。

匯入後仍可能需要重新選擇音樂資料夾，才能重新取得實際音樂檔。

## OBS Browser Source 模式

用 query string 啟用：

```text
http://127.0.0.1:5173/?mode=obs
```

OBS 模式會顯示簡化 overlay：

- 目前歌曲
- 歌手
- 進度條
- 時間
- avatar / character
- 簡化頻譜

OBS 可能重新載入頁面；若沒有音樂授權，會顯示待機畫面。播放器已預留 BroadcastChannel / localStorage event 架構給未來跨視窗同步。

## 本地圖片素材

素材設定在：

```text
src/config/brandAssets.ts
```

素材資料夾：

```text
public/assets/brand/
public/assets/backgrounds/
public/assets/characters/
public/assets/covers/
public/assets/decorations/
```

規則：

- 不生成圖片
- 不下載圖片
- 不抓 YouTube 圖片
- 圖片由使用者本地提供
- 圖片路徑空白時不顯示破圖
- 圖片載入失敗時使用 placeholder
- Electron 打包後 public assets 會跟著進入應用程式資源

## App Icon

目前預留：

```text
build/icon.png
build/icon.icns
build/icon.ico
```

之後替換正式 icon 時，覆蓋這三個檔案即可。

## 瀏覽器安全限制

Web 版重新整理後可能需要重新選擇音樂檔或資料夾。原因是瀏覽器不允許網站永久保存完整 `File` 物件或任意讀取硬碟。

支援 File System Access API 的瀏覽器會嘗試保存資料夾 handle 到 IndexedDB；如果權限失效，仍需重新授權。

## macOS 未簽章提醒

開發版若未使用 Apple Developer ID 簽章與 notarization，macOS 可能顯示「無法確認開發者」。

可暫時這樣開啟：

1. 打開「系統設定」
2. 前往「隱私權與安全性」
3. 在安全性區塊允許開啟 Aquariusgirl Music Room
4. 再次開啟 App

正式發行版建議使用程式碼簽章與 notarization。不要把憑證或私鑰寫進專案。

## Windows SmartScreen

未簽章開發版可能出現 SmartScreen 提醒。

可暫時這樣開啟：

1. 點擊「其他資訊」
2. 點擊「仍要執行」

正式發行版建議使用程式碼簽章。

## 自動更新規劃

目前只預留更新檢查 API 與 UI 位置，不硬寫不存在的更新網址。未來可加入 `electron-updater`：

- 檢查更新
- 目前版本
- 更新說明

## 明確不包含

- 不使用 Tauri
- 目前不包含 Live2D
- 不使用 YouTube API
- 不嵌入 YouTube iframe
- 不串接外部音樂服務
- 不下載音樂
- 不生成圖片
- 不加入 AI 產圖

---

## English Version

Aquariusgirl Music Room is a local-first music player. It can run as a Vite web app or be packaged as an Electron desktop app. It only reads music files that the user explicitly selects. It does not use YouTube, online music services, music downloads, or image generation.

## Delivery File Index

| File or folder | Meaning |
| --- | --- |
| `release-delivery` | Release delivery package |
| `INSTALL_UNINSTALL.md` | Install and uninstall guide |
| `INSTALLER_STATUS.md` | Installer status |
| `installers` | Installer folder |
| `KNOWN_ISSUES.md` | Known issues |
| `QA_REPORT.md` | Quality assurance / QA report |
| `README.md` | Documentation / project introduction |
| `VERSION.md` | Version information |
| `CONTINUE_WORK.md` | Follow-up work / continuation notes |

## License

This project is released under the [MIT License](LICENSE).

## Features

- Load local music files and folders.
- Drag music files into the player.
- Play, pause, seek, mute, adjust volume, and switch tracks with `HTMLAudioElement`.
- Read ID3v2 metadata and album artwork, with filename fallback.
- Sleep timer: 15, 30, 60 minutes, custom minutes, or stop after the current track.
- Web Audio API visualizer.
- IndexedDB stores track metadata and playlists, not music files.
- File System Access API folder permission, with `webkitdirectory` fallback.
- Basic multi-playlist management.
- Offline local AI chat and local metadata-based playlist tools.
- JSON import/export for settings and playlists, without music files.
- OBS Browser Source mode: `?mode=obs`.
- Electron main/preload bridge for safe file selection.
- macOS DMG and Windows EXE packaging.
- First-run onboarding.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- HTMLAudioElement
- Web Audio API
- localStorage
- IndexedDB
- Electron
- electron-builder
- llama.cpp sidecar runtime
- Open-source AI prompt pack

## Install

```bash
npm install
```

If the Electron binary is incomplete, run:

```bash
npx install-electron --no
```

## Web Development

```bash
npm run dev
```

Open the Vite localhost URL, usually:

```text
http://127.0.0.1:5173/
```

Production web build:

```bash
npm run build
```

## Electron Development

```bash
npm run electron
```

This compiles `electron/main.ts` and `electron/preload.ts`, starts the Vite dev server, and opens the Electron window.

## Packaging

Check the open prompt files:

```bash
npm run check:prompts
```

Check the bundled AI model and llama.cpp runtimes:

```bash
npm run check:ai-assets
```

Build the release installers:

```bash
npm run dist:release
```

General `dist` runs the same release flow:

```bash
npm run dist
```

Release installers are synced to:

```text
release-delivery/installers/
```

The temporary `release/` folder is removed after syncing installers.

The release target is intentionally limited to:

- macOS Apple Silicon DMG
- Windows x64 NSIS EXE

## GitHub Actions

`.github/workflows/release.yml` can build:

- Windows x64 NSIS installer
- macOS arm64 DMG

The workflow can download the GGUF model through the `AI_MODEL_URL` secret. The model file itself is ignored by Git.

Developer ID notarization and Windows code signing are not configured yet. Test artifacts can be installed for testing, but public releases should be signed.

## Offline AI

The desktop app can bundle local AI inside the EXE / DMG. Users do not need Ollama, a separate model download, Node.js, or a terminal.

The AI runs locally and does not call cloud APIs. Chat and AI search only receive a safe metadata summary of the currently loaded music library. The app does not upload music files, local paths, artwork blobs, `File` objects, or `ArrayBuffer` data to the model.

The AI build uses `qwen3.5 0.8B GGUF` with a llama.cpp sidecar runtime. Because the model and runtime are bundled into the installers, the EXE / DMG is larger than a player-only build. After the model starts, it stays loaded until the app closes.

## AI Prompts and Tool Split

Aquariusgirl AI prompts are maintained as open text files, without encryption or obfuscation. The small model only routes intent and polishes replies. The app code performs local music search, playlist creation, random playlist creation, playlist insertion, and safe playlist removal behavior.

If model JSON parsing fails, the app falls back to deterministic rules instead of showing raw model output.

## Desktop Use

macOS:

1. Download the `.dmg`.
2. Open the `.dmg`.
3. Drag Aquariusgirl Music Room into Applications.
4. Open the app.
5. Follow first-run onboarding.
6. Select a music folder.

Windows:

1. Download the `.exe`.
2. Run the installer.
3. Follow the setup wizard.
4. Open the app from the desktop shortcut or Start menu.
5. Follow first-run onboarding.
6. Select a music folder.

Users do not need Node.js or a terminal.

## Local Music Loading

Supported loading methods:

1. Select music files.
2. Select a music folder.
3. Drag music files into the player.

Supported formats:

- `.mp3`
- `.wav`
- `.ogg`
- `.m4a`
- `.flac`

The web version cannot scan the disk automatically. It only reads files or folders selected by the user. The Electron version also only reads folders explicitly selected by the user.

## ID3 Tags and Album Artwork

The player tries to read title, artist, album, year, genre, track number, duration, and album artwork. If metadata is unavailable, it falls back to filename parsing such as `Artist - Title.mp3`.

Blob URLs are released when tracks are removed, playlists are cleared, or the page unloads.

## Sleep Timer

Supported options:

- Stop after 15 minutes.
- Stop after 30 minutes.
- Stop after 60 minutes.
- Stop after custom minutes.
- Stop after the current track.

Minute-based timers fade out the volume before pausing playback.

## Visualizer

The visualizer uses Web Audio API with the current `HTMLAudioElement`. If `AudioContext` is unavailable, playback still works.

## Playlists

Built-in system playlists:

- All Songs
- Liked Songs

Users can create normal playlists and smart playlists. Normal playlists store track IDs. Smart playlists store rules and filter the current metadata dynamically.

## Mini Player

The Mini player uses the same `BrowserWindow` and does not create a second audio element. Switching modes preserves the current track, playback position, play state, and volume.

## Import and Export

Backups are JSON files that include playlists, track metadata, liked state, sort mode, volume, repeat mode, shuffle, theme settings, app version, and export time.

Backups do not include music files, `File` objects, local object URLs, or absolute system paths.

## OBS Browser Source Mode

Enable it with:

```text
http://127.0.0.1:5173/?mode=obs
```

OBS mode shows a simplified overlay for the current track, artist, progress, time, avatar or character, and visualizer.

## Local Image Assets

Asset paths are configured in:

```text
src/config/brandAssets.ts
```

Rules:

- No image generation.
- No image downloads.
- No YouTube images.
- Images are provided locally by the user.
- Empty image paths do not show broken images.
- Failed image loads use placeholders.

## Security Notes

Unsigned development builds may trigger macOS Gatekeeper or Windows SmartScreen warnings. Public releases should use Apple Developer ID notarization and Windows code signing.

Do not commit certificates, private keys, local music files, generated installers, build output, `node_modules`, or large local AI model files.

## Not Included

- No Tauri.
- No Live2D for now.
- No YouTube API.
- No YouTube iframe.
- No external music service integration.
- No music downloads.
- No image generation.
- No AI image generation.
