# Aquariusgirl Music Room

English version: see [English Version](#english-version).

水瓶罐子的音樂小水池是一款本地音樂播放器。Web 版可用瀏覽器啟動，Electron 版可打包成桌面安裝檔。播放器只讀取使用者明確選擇的本機音樂，不使用 YouTube、不串接線上音樂、不下載音樂、不生成圖片。

## 目前最新版本

0.1.26 修正版補完 0.1.24 / 0.1.25 同族殘留：播放中把米津玄師 Plazma 封面從 cover02 改回 cover01，切到其他歌再切回時仍可能短暫卡住；重新開啟 App 時也可能第一次看到舊 cover02、第二次才看到新 cover01。

這次不採用「每次歌曲資訊更新就清掉整個音樂資料庫再重載」；那會在 99 首還可忍、上萬首會變成災難。最小修法是只刷新並等待保存「剛寫回的那一首」：原始檔寫回後，播放器會重新讀回該曲 metadata，取得新的 track snapshot，並 `await` IndexedDB 立即保存完成後才顯示成功。這等於把使用者手動清庫重加會成功的原因，縮小成單曲級精準刷新，不動整個曲庫與播放清單。

0.1.25 修正版補完 0.1.24 同族殘留：播放中更換封面或歌曲資訊後，切歌再切回同一首仍可能短暫卡住。這次不是新的功能需求，而是 `useAudioPlayer` 仍用瀏覽器正規化後的 `audio.src` 回讀值，和原始 `currentTrackSource` 比較；再加上來源 effect 依賴 duration，metadata / duration 更新可能誤判成新來源並觸發 `audio.load()`。

本版改用 `loadedTrackSourceRef` 記住播放器最後指定給 audio element 的來源字串，source effect 只在 `currentTrackSource` 真的改變時重載音訊，duration 更新不再重載播放來源。`check:playback-restore` 已新增防回歸檢查，禁止 `audio.src !== currentTrackSource` 與 duration 依賴重回程式。封面寫回檢查也用真實 Plazma 暫存複本讀取 `Cover 02.jpg` 再寫回 `Cover 01.jpg`，確認 4.3 MB JPEG 可完整 roundtrip。

0.1.24 修正版修正播放中更換封面後，切歌再切回同一首會短暫卡住，以及重開第一次看到舊 cover02、第二次才看到新 cover01 的問題。這不是全新類型，而是舊版 metadata / cover 寫回後狀態打架的同族問題；本次精確根因是封面/歌曲資訊更新時不必要改變 `mediaVersion`，使 `file://` audio source 被加上新 cache buster 並觸發 `audio.load()`，加上 IndexedDB track metadata 非同步保存可能讓舊 cover 寫入晚於新 cover。

本版移除 metadata/cover-only 更新時的 `mediaVersion` bump，避免單純改封面重載音訊；同時讓 IndexedDB track metadata 保存與清除走同一條 queue，固定保存順序，避免舊 cover02 save 晚於 cover01 save 落地。播放中不需要禁止編輯歌曲資訊，因為根因已在共享資料流修正。

0.1.23 歷史 hotfix 修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的閃爍。這不是全新的問題類型，而是舊版 metadata 來源打架的同族問題；該版精確根因是 auto-restore 後，IndexedDB 的 `storedTracks` 同時扮演「開機舊資料」與「目前 tracks 即時鏡像」，較弱的 stored metadata 可能回頭覆蓋已回灌的真實歌手。

該版修正 stored metadata 合併規則：空白或缺失的 stored 文字欄位不再覆蓋目前 track 已有的歌手/標題等文字；一旦 stored metadata 成功回灌到自動恢復的本機檔案，該 track 會標記為已取得 metadata，後續只同步 duration、playCount、lastPlayedAt 這類播放統計，避免「未知歌手」再蓋回「米津玄師」。這是最小修法，沒有新增套件或背景索引。

0.1.22 歷史 hotfix 修正米津玄師 `Cover 01.jpg` 無法選回封面的問題。實測該檔是正常 JPEG/Exif 圖片，1500×1500、4,342,414 bytes，不是特殊壞結構；失敗根因是播放器原本封面上限只有 3 MB，而 `Cover 02.jpg` 約 1 MB 所以能成功，`Cover 01.jpg` 超過上限所以被擋在預覽與保存之前。

本版將歌曲封面上限調整為 5 MB，讓這類真實專輯封面可直接預覽與寫回，同時仍阻擋過大的意外圖片以保護 M1 MacBook Air 8GB 等低記憶體環境。若使用者選到超過上限的圖片，介面會明確提示「封面圖片太大，請選擇 5 MB 以內的 JPG / PNG」，不再讓使用者誤以為圖片壞掉。

0.1.21 修正版修正歌曲顯示排序、封面更換後播放清單遺失、封面 cover02 改回 cover01 的回寫驗證、啟動載入資料庫過慢，以及 AI 助手建立播放清單時缺少等待提示的問題。歌曲清單與目前播放卡現在優先顯示檔名，沒有檔名才顯示歌曲標題；第二行維持歌手，讓同專輯多曲目比較容易辨識。

本版將 Electron 本機檔案識別改為以穩定 `sourcePath` 為主，不再把 mtime / size 放進主要 track id，避免原始檔寫回封面後檔案大小或修改時間改變，導致下次重開播放清單找不到同一首歌。舊播放清單 track id 會在載入時依 `sourcePath` 重新對應到目前 track id。

啟動恢復音樂資料夾時不再逐首重新讀完整 taglib metadata / cover，而是先用保存於播放器的 metadata 快速還原，使用者需要重讀原始檔時再走明確操作。AI 助手建立播放清單期間會顯示等待訊息並暫時停用輸入與建立按鈕，避免使用者連續送出無效指令。

0.1.20 修正版修正播放卡頓、按播放後再按暫停仍停不下來，以及畫面播放狀態閃爍的問題。播放器現在只在 `localUrl` / `mediaVersion` 改變時重設 `HTMLAudioElement` source，播放與暫停則由獨立 effect 同步，避免 duration、播放次數或 metadata 更新時反覆觸發 `audio.play()`。

Electron 桌面版手動選擇音樂資料夾時，會把該次回傳的 `sourcePath[]` 寫入既有 IndexedDB settings；下次啟動 auto-restore 會優先使用最後一次手動選擇的來源清單，沒有這份資料時才退回舊版 tracks metadata。

歌曲資訊面板可編輯標題、歌手、專輯、專輯歌手、年份、曲目、光碟、類型、作曲與備註，並可更換單曲封面。桌面版支援將 MP3、FLAC、M4A 的標籤與封面寫回原始檔；寫回前會要求使用者確認，且只處理使用者已加入播放器的本機檔案。

最新安裝檔位於：

```text
release-delivery/installers/
```

- `Aquariusgirl Music Room Setup 0.1.26.exe`
- `Aquariusgirl Music Room-0.1.26-arm64.dmg`

SHA-256：

- EXE：`0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`
- arm64 DMG：`16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`

0.1.25 歷史 hotfix：修正同來源 audio reload 殘留，避免 duration / metadata 更新誤觸 `audio.load()`。0.1.25 hotfix SHA-256：EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`；arm64 DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。

0.1.24 歷史 hotfix：修正播放中更換封面後切歌再切回卡住，以及 cover02 -> cover01 第一次重開舊封面、第二次才新封面的保存順序問題。0.1.24 hotfix SHA-256：EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`；arm64 DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。

0.1.23 歷史 hotfix：修正歌手欄位在真實歌手與 `未知歌手` 之間反覆切換。0.1.23 hotfix SHA-256：EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`；arm64 DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。

0.1.22 歷史 hotfix：修正 `Cover 01.jpg` 因舊 3 MB 封面上限無法預覽與寫回，將封面上限調整為 5 MB 並新增過大提示。0.1.22 hotfix SHA-256：EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`；arm64 DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。

0.1.21 歷史 hotfix：修正歌曲顯示排序、封面更換後播放清單遺失、封面 cover02 改回 cover01 的回寫驗證、啟動載入資料庫過慢，以及 AI 助手建立播放清單時缺少等待提示。0.1.21 hotfix SHA-256：EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`；arm64 DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。

0.1.20 歷史 hotfix：修正播放卡頓、按播放後再按暫停仍停不下來，以及畫面播放狀態閃爍。播放器只在 `localUrl` / `mediaVersion` 改變時重設 `HTMLAudioElement` source，播放與暫停由獨立 effect 同步；Electron 手動選擇資料夾後會保存最後一次 `sourcePath[]` 供下次啟動恢復。0.1.20 hotfix SHA-256：EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`；arm64 DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。

0.1.19 歷史 hotfix：收斂歌曲資訊保存流程，移除「保存到播放器」，只保留「套用到原始檔」作為唯一保存入口，避免播放器內 metadata 與原始檔標籤互相覆寫。Electron 選擇大型音樂資料夾時不再把整個音檔 `ArrayBuffer` 傳進 renderer，改用 `file://`、source path、大小與必要 metadata，降低 Windows EXE 選擇數 GB 資料夾時閃退風險。0.1.19 hotfix SHA-256：EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`；arm64 DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`。

## 交付檔案索引

| 英文檔名 | 中文意思 |
| --- | --- |
| `AGENTS.md` | AI agent 指令 |
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
- 歌曲資訊編輯、單曲封面更換，以及桌面版 MP3/FLAC/M4A 原始檔標籤寫回；不再提供播放器內 metadata 另存入口
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
- taglib-wasm
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

## GitHub clone 後補齊大型檔案

為了避免把大型二進位檔放進 Git，公開 repo 不包含：

- `resources/ai/models/qwen3.5-0.8b.gguf`
- `release-delivery/installers/*.dmg`
- `release-delivery/installers/*.exe`

自行補齊方式：

1. 將 GGUF 模型放到 `resources/ai/models/qwen3.5-0.8b.gguf`。若要改用不同檔名，先同步更新 `electron/ai/aiModelConfig.ts` 的 `modelFileName`。
2. 執行 `npm run check:ai-assets`；如果缺模型或 runtime，錯誤訊息會指出要補的路徑。
3. 需要本機產出安裝檔時，執行 `npm run dist:release`，DMG / EXE 會同步到 `release-delivery/installers/`。
4. 使用 GitHub Actions 時，設定 repository secret `AI_MODEL_URL` 指向可下載的 GGUF 檔；不要把模型、installer、憑證或私鑰 commit 進 Git。

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

## Current Version

0.1.26 completes the remaining 0.1.24 / 0.1.25-family persistence issue. While Plazma is playing, changing its cover from cover02 back to cover01, switching to another track, and switching back could still briefly stall; after restart, the first launch could also show the old cover02 before the next launch showed cover01.

This release does not clear and reload the whole music database after every song-info edit. That would work around the symptom for small libraries, but it would be the wrong design for 10k tracks. Instead, original-file writeback reloads only the edited track, gets the updated track snapshot, and waits for IndexedDB to save that exact snapshot before reporting success.

0.1.25 completes the remaining 0.1.24-family playback stall. After changing cover art or song info while playing, switching away and back could still briefly stall because `useAudioPlayer` compared the browser-normalized `audio.src` value with the raw `currentTrackSource`, and the source effect also depended on duration updates. Metadata / duration updates could therefore look like a new source and call `audio.load()`.

The player now stores the last source assigned to the audio element in `loadedTrackSourceRef`; the source effect reloads only when `currentTrackSource` actually changes, and duration updates no longer reload playback. `check:playback-restore` now blocks direct `audio.src !== currentTrackSource` comparisons and duration-dependent source effects. The song-info writer check also validates a real Plazma temp copy with `Cover 02.jpg` followed by the 4.3 MB `Cover 01.jpg`.

0.1.24 fixes the playback stall after changing cover art while a track is playing, then switching away and back, plus the first-restart-old-cover / second-restart-new-cover behavior. This is the same metadata / cover writeback conflict family as earlier fixes, but the precise path was new: cover metadata updates changed `mediaVersion`, which changed the `file://` audio source and forced `audio.load()`, while unordered IndexedDB saves could let an older cover02 save land after a newer cover01 save.

Metadata/cover-only updates no longer bump `mediaVersion`, so editing cover art does not reload audio. IndexedDB track metadata save and clear operations now run through one queue, preserving write order. Editing song info does not need to be blocked during playback because the shared state path is fixed.

0.1.23 historical hotfix fixes the artist field flicker where the UI could alternate between `米津玄師` and `未知歌手`. This is not a brand-new class of bug; it belongs to the older metadata-source conflict family. The precise 0.1.23 root cause was that IndexedDB `storedTracks` acted as both the startup snapshot and the live mirror of current `tracks`, so weak restored metadata could overwrite real artist metadata after auto-restore.

Stored metadata merging now keeps existing non-empty track text when stored text is empty or missing. When stored metadata is applied to an auto-restored local file, the track is marked metadata-loaded, so later syncs only update playback stats such as duration, play count, and last played time. No new dependency, worker, or background indexer was added.

0.1.22 historical hotfix fixes the Kenshi Yonezu `Cover 01.jpg` case where the user selected cover01 but the preview and original-file writeback stayed on cover02. The file is a valid JPEG/Exif image, 1500x1500 and 4,342,414 bytes; it was not structurally broken. The root cause was the old 3 MB cover limit: `Cover 02.jpg` was about 1 MB and passed, while `Cover 01.jpg` was blocked before preview/writeback.

The cover limit is now 5 MB. This accepts real album art like `Cover 01.jpg` while still blocking oversized accidental images for smooth use on the M1 MacBook Air 8GB. If a selected cover is still too large, the UI now says the image is too large and shows the 5 MB limit.

0.1.21 fixes the track display order, playlist loss after cover writeback, cover replacement roundtrip from cover02 back to cover01, slow startup restore, and missing waiting feedback while the AI assistant creates a playlist. Track rows and the now-playing card prefer the filename first, fall back to the song title when needed, and keep the artist on the second line.

Electron local track identity now uses stable `sourcePath` first instead of mtime / size in the primary id, so cover writeback no longer makes the same file look like a different track after restart. Existing playlist ids are remapped through `sourcePath` when the library is restored.

Startup restore skips full taglib metadata / cover reads per file and uses stored player metadata first. AI playlist creation now shows a waiting status and temporarily disables input / create controls to prevent repeated invalid commands.

0.1.20 fixes playback stutter, pause not stopping reliably, and flashing playback state. The audio element source now changes only when `localUrl` / `mediaVersion` changes, while play and pause are synchronized separately. Electron folder selection also stores the latest selected `sourcePath[]` for the next auto-restore.

0.1.19 historical hotfix added the single original-file song-info save path and large-folder IPC fix. The desktop app can write MP3, FLAC, and M4A tags and cover art back to the original file after confirmation.

Latest installers:

```text
release-delivery/installers/
```

- `Aquariusgirl Music Room Setup 0.1.26.exe`
- `Aquariusgirl Music Room-0.1.26-arm64.dmg`

SHA-256:

- EXE: `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`
- arm64 DMG: `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`

0.1.25 historical hotfix SHA-256: EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`; arm64 DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`.

0.1.24 historical hotfix SHA-256: EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`; arm64 DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`.

0.1.23 historical hotfix SHA-256: EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`; arm64 DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`.

0.1.22 historical hotfix SHA-256: EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`; arm64 DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`.

## Delivery File Index

| File or folder | Meaning |
| --- | --- |
| `AGENTS.md` | AI agent instructions |
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
- Edit song info, change per-track cover art, and write desktop MP3/FLAC/M4A tags back to original files.
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
- taglib-wasm
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

## Missing Large Files After Clone

To keep large binaries out of Git, the public repository does not include:

- `resources/ai/models/qwen3.5-0.8b.gguf`
- `release-delivery/installers/*.dmg`
- `release-delivery/installers/*.exe`

To complete a local checkout:

1. Put the GGUF model at `resources/ai/models/qwen3.5-0.8b.gguf`. If you use another filename, update `modelFileName` in `electron/ai/aiModelConfig.ts` first.
2. Run `npm run check:ai-assets`; missing model or runtime errors include the path to restore.
3. Run `npm run dist:release` when you need fresh installers. The DMG / EXE files are synced to `release-delivery/installers/`.
4. For GitHub Actions, set the repository secret `AI_MODEL_URL` to a downloadable GGUF file. Do not commit models, installers, certificates, or private keys.

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
