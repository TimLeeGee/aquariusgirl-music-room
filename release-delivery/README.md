# Aquariusgirl Music Room 交付說明

版本：0.1.26
發行日期：2026-07-03
文件更新：2026-07-03
產品名稱：Aquariusgirl Music Room / 水瓶罐子的音樂小水池

## 最新安裝檔在哪裡

只看這個資料夾：

```text
release-delivery/installers/
```

0.1.26 只保留兩個交付檔：

- `Aquariusgirl Music Room Setup 0.1.26.exe`
- `Aquariusgirl Music Room-0.1.26-arm64.dmg`

`release/` 是 electron-builder 暫存輸出；正式整理後不應存在，避免同時出現兩個像最新版的資料夾。

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

## 這是什麼軟體

Aquariusgirl Music Room 是本地優先音樂播放器。它只播放使用者明確選擇的本機音樂檔，不使用 YouTube、不串流、不下載音樂，也不會自動掃描整台硬碟。

0.1.26 桌面版可內建離線 AI。AI 在本機執行，工具任務只接收最新一句輸入與必要結構化 context；不會上傳音樂檔、路徑、封面圖片、Blob、File 或 ArrayBuffer。

支援格式：mp3、wav、ogg、m4a、flac。

0.1.26 補完 0.1.24 / 0.1.25 同族殘留：原始檔寫回成功後，播放器 UI 可能已顯示新封面，但 IndexedDB 尚未完成保存；若很快重開 App，第一次仍可能從 DB 還原舊 cover02，第二次才看到 cover01。本版不清整個音樂資料庫，而是只刷新並等待保存被寫回的那一首。

0.1.25 歷史 hotfix 補完 0.1.24 同族殘留：播放中更換封面 / 歌曲資訊後，切歌再切回同一首仍可能短暫卡住。精確殘留路徑是 `useAudioPlayer` 直接比較瀏覽器正規化後的 `audio.src` 與原始 `currentTrackSource`，且來源 effect 依賴 duration；metadata / duration 更新會誤觸同來源 `audio.load()`。

0.1.24 歷史 hotfix 修正播放中更換封面後，切歌再切回同一首會短暫卡住，以及第一次重開仍看到舊 cover02、第二次重開才看到新 cover01 的問題。這屬於舊版 metadata / cover 寫回後狀態打架的同族問題，但該版精確路徑是 `mediaVersion` 讓 audio source 重載，以及 IndexedDB track metadata 保存順序競賽。

0.1.23 歷史 hotfix 修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的閃爍。該版精確路徑是 `storedTracks` 同時作為開機舊資料與目前 `tracks` 即時鏡像，弱 metadata 可能蓋回已回灌的真實歌手。

0.1.22 歷史 hotfix 修正米津玄師 `Cover 01.jpg` 選回封面失敗。該檔是正常 JPEG/Exif，失敗原因是舊 3 MB 封面上限；本版提高為 5 MB，並對超過上限的圖片顯示明確提示。歌曲資訊保存仍只保留「套用到原始檔」，避免播放器 metadata 與原始檔標籤互相覆寫。

## GitHub clone 後缺的大型檔案

公開 repo 不包含大型本機檔案：`resources/ai/models/qwen3.5-0.8b.gguf`、`release-delivery/installers/*.dmg`、`release-delivery/installers/*.exe`。

接手者需要自行放入 GGUF 模型到 `resources/ai/models/qwen3.5-0.8b.gguf`，再執行 `npm run check:ai-assets`。若要重新產出安裝檔，執行 `npm run dist:release`；若使用 GitHub Actions，設定 repository secret `AI_MODEL_URL` 指向可下載的 GGUF 檔。不要把模型、installer、憑證或私鑰 commit 進 Git。

## 0.1.26 重點

- 原始檔寫回後不清整個曲庫，也不重建所有 tracks；只重讀被寫回的那一首。
- `replaceTrackSongInfo` 回傳更新後的 `Track` snapshot，讓呼叫端能保存精準的新資料。
- `useMusicLibraryDb.saveTracksNow()` 沿用既有 queue 立即保存指定 tracks snapshot。
- 「已套用到原始檔」只會在原始檔 metadata 重讀與 IndexedDB 保存都完成後顯示。
- `check:playback-restore` 新增防回歸，要求 App 端 `await libraryDb.saveTracksNow(...)`。
- 最新 SHA-256：EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`；DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。
- 限制：Codex 沙盒拒絕直接啟動 Electron GUI，本輪不宣稱滑鼠實機流程 PASS；Windows 真機仍待驗收。

## 0.1.25 重點（歷史）

- 修正 0.1.24 未完全根除的同來源 audio reload：`audio.src` 是瀏覽器正規化 URL，不能拿來直接比較原始 `currentTrackSource`。
- `useAudioPlayer` 新增 `loadedTrackSourceRef`，只在 `currentTrackSource` 真的改變時 `audio.load()`；duration / metadata 更新不再重載音訊。
- `check:playback-restore` 新增防回歸，要求 `loadedTrackSourceRef`，禁止 `audio.src !== currentTrackSource` 與 duration-dependent source effect。
- `song-info-writer-check` 有真實 fixture 時會讀 `Cover 02.jpg` 與 `Cover 01.jpg`，用暫存音檔跑 cover02 -> cover01 roundtrip。本輪 Plazma 真實暫存複本 PASS。
- 0.1.25 hotfix SHA-256：EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`；DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。
- 限制：Codex 沙盒本輪無法直接啟動 Electron GUI 做滑鼠驗收，且 `hdiutil attach` / `imageinfo` 因裝置權限與用量限制未完成；QA 不宣稱這兩項 PASS。

## 0.1.24 重點（歷史）

- 修正播放中更換封面後，切歌再切回同一首會短暫卡住才播放。
- 修正 cover02 改成 cover01 後，第一次重開仍看到舊封面、第二次重開才更新的保存順序問題。
- 根因不是需要禁止播放中編輯，而是 metadata/cover-only 更新不該改變 `mediaVersion`，否則 `file://` audio source 會變動並觸發 `audio.load()`。
- IndexedDB track metadata save / clear 現在走同一條 queue，避免舊 cover save 晚於新 cover save 落地。
- 已在 `check:playback-restore` 加入防回歸檢查，確認 `replaceTrackSongInfo` 不再出現 `mediaVersion: Date.now()`，且 `useMusicLibraryDb` 有 `trackSaveQueueRef` 保存順序。
- 最新 SHA-256：EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`；DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。

## 0.1.23 重點（歷史）

- 修正歌手欄位在真實歌手與 `未知歌手` 之間反覆切換造成的畫面閃爍。
- 根因不是新功能需求，而是 metadata 回灌與 IndexedDB live mirror 打架：auto-restore 先產生弱 metadata，`storedTracks` 又可能把弱狀態回套到 UI。
- stored 文字欄位現在只有非空值才覆蓋目前 track 文字，避免空白 stored artist 蓋掉真實歌手。
- 回灌 stored metadata 後會標記 `metadataLoaded`，後續同 sourcePath 同步只更新 duration、playCount、lastPlayedAt 等播放統計。
- 已在 `check:playback-restore` 加入防回歸檢查，確認不再直接 `artist: stored.artist`，而是保留較強的非空文字。
- 0.1.23 hotfix SHA-256：EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`；DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。

## 0.1.22 重點（歷史）

- `Cover 01.jpg` 是正常 JPEG/Exif，1500×1500、4,342,414 bytes；不是圖片結構壞掉。
- 原因是舊封面上限只有 3 MB；`Cover 02.jpg` 約 1 MB 能成功，`Cover 01.jpg` 超過上限所以預覽與保存都被擋。
- 封面上限調整為 5 MB，保留大小限制以照顧 M1 MacBook Air 8GB 與大量曲庫情境。
- 超過上限時會明確提示「封面圖片太大，請選擇 5 MB 以內的 JPG / PNG」。
- 真實 `01. Plazma.flac` 暫存複本已驗證 `Cover 02.jpg` -> `Cover 01.jpg` 寫回與讀回。
- 0.1.22 hotfix SHA-256：EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`；DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。

## 0.1.21 重點（歷史）

- 目前播放卡與歌曲列表第一行優先顯示檔名，沒有檔名才顯示歌曲標題；第二行顯示歌手。
- Electron 本機 track id 改以穩定 `sourcePath` 為主，避免封面寫回造成 size / mtime 改變後，下次重開播放清單找不到同一首歌。
- 載入曲庫後會依 `sourcePath` 將舊播放清單 track id 對應到目前 id，保留既有播放清單。
- 真 MP3 fixture 暫存複本已驗證 cover02 -> cover01 封面回寫與讀回。
- 啟動 auto-restore 不再逐首讀完整 taglib metadata / cover，先用 IndexedDB metadata 快速還原。
- AI 助手建立播放清單時會顯示等待狀態，並暫時停用輸入與建立按鈕。
- 0.1.21 hotfix SHA-256：EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`；DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。

## 0.1.20 重點（歷史）

- 播放 source 只在 `localUrl` / `mediaVersion` 改變時重設，metadata / duration / playCount 更新不再觸發重複 `audio.play()`。
- 播放與暫停由獨立 effect 同步；`isPlaying = false` 時會明確呼叫 `audio.pause()`。
- Electron 手動選資料夾後保存該次 `sourcePath[]` 到既有 IndexedDB settings；auto-restore 優先使用最後一次手動選擇。
- 新增 `npm run check:playback-restore`，並放入 `dist:release` / `dist:mac` / `dist:win`。
- 0.1.20 hotfix SHA-256：EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`；DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。

## 0.1.19 重點（歷史）

- 新增目前播放卡「更多」選單與歌曲資訊面板。
- 可編輯標題、歌手、專輯、專輯歌手、年份、類型、曲目、光碟、備註、作曲與單曲封面。
- 桌面版支援 MP3、FLAC、M4A 原始檔標籤與封面寫回；不再提供播放器內另存 metadata 的入口。
- 寫回後由 Electron 主程序重新讀取原始檔 metadata，避免 FLAC/M4A 顯示不同步。
- Electron 選擇大型資料夾時不再把整個音檔傳進 IPC，改用 `file://`、source path、大小與必要 metadata，降低 Windows EXE 選擇數 GB 音樂資料夾時閃退風險。
- 0.1.19 hotfix SHA-256：EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`；DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`。

## 0.1.18 重點

- 補強 router JSON schema、Result Guard 與 safe reply fallback。
- 工具任務一律 summary-only，模型不得輸出播放清單歌曲清單或 track title。
- 歌曲列表只能由播放器 UI 根據 `playlist.trackIds` 顯示。
- 三份 prompt 維持開源文字檔，未新增 prompt 檔。

## 0.1.17 重點

- 小模型只負責 intent JSON 與短回覆潤飾。
- 本機搜尋、隨機歌單、建立歌單、加入歌單與移除安全提示由播放器程式執行。
- Prompt 改為三份開源文字檔，不再使用加密 prompt bundle。
- 打包目標收斂為 Windows x64 EXE 與 macOS Apple Silicon DMG。

## 0.1.16 重點

- AI 建歌單只能使用目前已載入 / 已索引的真實歌曲。
- 隨機歌單從真實 tracks 抽樣，找不到歌曲時不建立假歌。
- AI 助手移入右側歌單卡，以「歌單 / AI 助手」分頁切換。
- 先使用 metadata 關鍵字、別名與 mood scoring；未新增 embedding 或向量資料庫。

## Windows 如何安裝

1. 取得 `Aquariusgirl Music Room Setup 0.1.26.exe`。
2. 雙擊安裝檔。
3. 依照安裝器指示完成安裝。
4. 從桌面捷徑或開始選單開啟 `Aquariusgirl Music Room`。

如果 Windows Defender 或 SmartScreen 顯示提醒，原因通常是測試版尚未做程式碼簽章。確認來源是自己的建置檔後，可選擇繼續執行。

## macOS 如何安裝

1. 取得 `Aquariusgirl Music Room-0.1.26-arm64.dmg`。
2. 雙擊 `.dmg`。
3. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
4. 從 Applications 開啟。

如果 macOS 顯示「未認證開發者」，原因是目前測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟，或使用右鍵開啟。

## 資料保存

播放清單、收藏、音量、循環、隨機、主題與 metadata 會保存於 localStorage / IndexedDB。音樂檔本體不會被複製進 App，也不會被上傳。

解除安裝 App 不會刪除使用者原始音樂檔。若要清除 App 設定，需另外清除 Electron app userData。

## 交付驗收狀態

已通過：playback-restore 0.1.26 回歸檢查、track-display、track-identity、真實 Plazma song-info / cover roundtrip、prompt 檢查、AI track search、FLAC metadata、custom images、theme colors、AI assets、build、Electron compile、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查、Windows EXE static check。

尚未完成：Codex 滑鼠 GUI 驗收、Windows 真機安裝、播放中更換封面後切歌再切回不卡、cover02 -> cover01 第一次重開不回跳、選擇約 4 GB / 20+ 首音樂資料夾、播放/暫停人工點擊、重開後恢復最後資料夾、歌曲資訊編輯、改封面後重開播放清單不掉歌、AI 建歌單等待狀態實機操作、Apple Developer ID / notarization、Windows code signing。

---

## English Delivery Notes

Version: 0.1.26
Release date: 2026-07-03
Document update: 2026-07-03
Product: Aquariusgirl Music Room

## Latest Installers

Use only this folder:

```text
release-delivery/installers/
```

0.1.26 ships two installer files:

- `Aquariusgirl Music Room Setup 0.1.26.exe`
- `Aquariusgirl Music Room-0.1.26-arm64.dmg`

The temporary `release/` folder should not remain after packaging.

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

## Product Summary

Aquariusgirl Music Room is a local-first music player. It only plays local music files explicitly selected by the user. It does not use YouTube, streaming services, music downloads, or automatic disk scanning.

The 0.1.26 desktop app can bundle offline AI. Tool tasks use only the latest user input and necessary structured context. It does not upload music files, paths, artwork, Blob, File, or ArrayBuffer data.

Supported formats: mp3, wav, ogg, m4a, flac.

0.1.26 fixes the remaining original-file writeback persistence race. After cover writeback, the UI could show the new cover before IndexedDB had saved the updated track snapshot; restarting quickly could restore old cover02 first. The fix reloads only the edited track and waits for the saved snapshot before reporting success.

0.1.25 historical hotfix completed the same-source audio reload path after cover/song-info writeback. The precise path was comparing browser-normalized `audio.src` with raw `currentTrackSource`, plus duration-dependent source loading.

0.1.24 historical hotfix fixed playback stalling after cover writeback when switching away and back, plus the first-restart-old-cover / second-restart-new-cover behavior. This belongs to the older metadata / cover writeback conflict family, but the precise path was `mediaVersion` forcing audio source reload and unordered IndexedDB track metadata saves.

0.1.23 historical hotfix fixes the artist field flicker where the UI could alternate between `米津玄師` and `未知歌手`. The precise 0.1.23 path was `storedTracks` acting as both startup snapshot and live `tracks` mirror, allowing weak metadata to overwrite restored real artist text.

0.1.22 historical hotfix fixes the Kenshi Yonezu `Cover 01.jpg` revert case. The file is a valid JPEG/Exif image; the root cause was the old 3 MB cover limit. The limit is now 5 MB, and oversized images show a clear too-large message. Song info saving still keeps original-file writeback as the only save path.

## Missing Large Files After Clone

The public repository does not include large local files: `resources/ai/models/qwen3.5-0.8b.gguf`, `release-delivery/installers/*.dmg`, or `release-delivery/installers/*.exe`.

To complete a checkout, place the GGUF model at `resources/ai/models/qwen3.5-0.8b.gguf`, then run `npm run check:ai-assets`. To rebuild installers, run `npm run dist:release`; for GitHub Actions, set the repository secret `AI_MODEL_URL` to a downloadable GGUF file. Do not commit models, installers, certificates, or private keys.

## 0.1.26 Highlights

- Reloads only the edited track after original-file writeback; it does not clear or rebuild the whole music database.
- `replaceTrackSongInfo` returns the updated `Track` snapshot.
- `useMusicLibraryDb.saveTracksNow()` saves a specified tracks snapshot through the existing save queue.
- The success message appears only after original metadata reload and IndexedDB save both complete.
- `check:playback-restore` now guards that App awaits `libraryDb.saveTracksNow(...)`.
- Latest SHA-256: EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`; DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`.
- Limit: Codex could not launch the Electron GUI in this sandbox, so mouse-based QA is not marked passed.

## 0.1.25 Highlights (Historical)

- Fixed the remaining same-source audio reload after cover/song-info writeback.
- `loadedTrackSourceRef` records the assigned source so duration / metadata updates do not call `audio.load()` for the same track.
- `check:playback-restore` guards against direct `audio.src !== currentTrackSource` comparisons and duration-dependent source loading.
- Real Plazma fixture validation covers `Cover 02.jpg` -> `Cover 01.jpg` roundtrip on a temp copy.
- 0.1.25 hotfix SHA-256: EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`; DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`.

## 0.1.24 Highlights (Historical)

- Fixed playback stalling after cover writeback when switching away and back to the edited track.
- Fixed the first-restart-old-cover / second-restart-new-cover persistence race.
- Root cause: metadata/cover-only updates changed `mediaVersion`, causing the `file://` audio source to change and reload.
- IndexedDB track metadata save / clear operations now run through one queue so older cover saves cannot land after newer cover saves.
- `check:playback-restore` now guards against reintroducing `mediaVersion: Date.now()` in `replaceTrackSongInfo` and requires the track save queue.
- 0.1.24 hotfix SHA-256: EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`; DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`.

## 0.1.23 Highlights (Historical)

- Fixes artist field flicker between real artist text and `未知歌手`.
- Root cause: metadata restore and the IndexedDB live mirror fought each other. Auto-restore could create weak metadata first, then `storedTracks` could apply that weak state back to the UI.
- Stored text fields now overwrite current track text only when the stored value is non-empty.
- Applying stored metadata marks the track metadata-loaded, so later same-source syncs update playback stats only.
- `check:playback-restore` now guards against direct `artist: stored.artist` regression and requires preserving the stronger non-empty text.
- 0.1.23 hotfix SHA-256: EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`; DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`.

## 0.1.22 Highlights (Historical)

- `Cover 01.jpg` is a valid JPEG/Exif image, 1500x1500 and 4,342,414 bytes.
- The old 3 MB cover limit blocked it before preview/writeback; `Cover 02.jpg` passed because it was about 1 MB.
- The cover limit is now 5 MB, keeping a guardrail for M1 MacBook Air 8GB and large-library use.
- Oversized images now show a clear 5 MB too-large message.
- A real `01. Plazma.flac` temp copy passed `Cover 02.jpg` -> `Cover 01.jpg` write/read validation.
- 0.1.22 hotfix SHA-256: EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`; DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`.

## 0.1.21 Highlights (Historical)

- Track rows and the now-playing card prefer filename first, fall back to title, and show artist on the second line.
- Electron local track ids use stable `sourcePath` first, so cover writeback no longer makes the same file look like a different track after restart.
- Stored playlist ids are remapped through `sourcePath` when the library is restored.
- A real MP3 fixture temp copy passed cover02 -> cover01 write/read validation.
- Startup auto-restore skips full taglib metadata / cover reads per file and restores from IndexedDB metadata first.
- AI playlist creation shows a waiting status and temporarily disables input / create controls.
- 0.1.21 hotfix SHA-256: EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`; DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`.

## 0.1.20 Highlights (Historical)

- Audio source sync now depends only on `localUrl` / `mediaVersion`; metadata, duration, and play-count updates do not restart playback.
- Play and pause are synchronized separately, and pause explicitly calls `audio.pause()`.
- Electron folder selection saves the latest selected `sourcePath[]` for auto-restore on the next launch.
- Adds `npm run check:playback-restore` to release build scripts.
- 0.1.20 hotfix SHA-256: EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`; DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`.

## 0.1.19 Highlights (Historical)

- Adds the current-track More menu and song info panel.
- Edits title, artist, album, album artist, year, genre, track/disc numbers, comment, composer, and per-track cover art.
- Supports desktop MP3/FLAC/M4A original-file tag and cover writeback, with no separate player-local metadata save path.
- Reloads metadata from the original file in Electron after writeback so FLAC/M4A stay in sync.
- Avoids sending whole audio files through Electron IPC during large folder selection; the app now uses `file://`, source path, size, and metadata.
- 0.1.19 hotfix SHA-256: EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`; DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`.

## 0.1.18 Highlights

- Strengthens router JSON schema validation, Result Guard, and safe reply fallback.
- Tool tasks are summary-only; the model may not output playlist song lists or track titles.
- Song lists are rendered only by the player UI from `playlist.trackIds`.
- The project still uses only three open prompt text files.

## 0.1.17 Highlights

- The small model only routes intent JSON and polishes short replies.
- Local search, random playlists, playlist creation, playlist insertion, and safe removal guidance are handled by app code.
- Prompts are now three open text files instead of an encrypted prompt bundle.
- Packaging targets are Windows x64 EXE and macOS Apple Silicon DMG.

## 0.1.16 Highlights

- AI playlist creation can only use real loaded or indexed local tracks.
- Random playlists sample from real tracks; missing matches do not create fake songs.
- The AI assistant moved into the playlist card as a `Playlists / AI Assistant` tab.
- Metadata keyword, alias, and mood scoring are used first; no embedding or vector database was added.

## Windows Install

1. Use `Aquariusgirl Music Room Setup 0.1.26.exe`.
2. Run the installer.
3. Follow the setup wizard.
4. Open `Aquariusgirl Music Room` from the desktop shortcut or Start menu.

SmartScreen warnings are expected for unsigned test builds.

## macOS Install

1. Use `Aquariusgirl Music Room-0.1.26-arm64.dmg`.
2. Open the DMG.
3. Drag the app into Applications.
4. Open the app from Applications.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

## Data Storage

Playlists, liked state, volume, repeat, shuffle, theme settings, and metadata are stored in localStorage / IndexedDB. Music files are not copied into the app and are not uploaded.

Uninstalling the app does not delete the user's original music files.

## Delivery QA Status

Passed: 0.1.26 playback-restore regression checks, track-display, track-identity, real Plazma song-info / cover roundtrip, prompt checks, AI track search, FLAC metadata, custom images, theme colors, AI assets, build, Electron compile, elevated `dist:release`, DMG verify, DMG read-only version / arm64 / app.asar / AI runtime checks, and Windows EXE static check.

Still open: Codex mouse GUI validation, Windows real-machine install, playback after cover writeback, first-restart cover persistence, playback/pause click testing, latest-folder restore after restart, large-folder load, song info editing, playlist persistence after cover changes, AI busy-state UX, Developer ID/notarization, and Windows code signing.
