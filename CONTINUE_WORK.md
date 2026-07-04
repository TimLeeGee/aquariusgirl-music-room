# Aquariusgirl Music Room Continue Work

## 2026-07-03 單曲寫回後 DB 立即保存 hotfix 0.1.26 完成

- 已補完 0.1.24 / 0.1.25 同族殘留：播放中把 Plazma 封面從 cover02 改回 cover01，切歌再切回仍可能短暫卡住；重開 App 第一次可能仍看到舊 cover02，第二次才看到 cover01。
- 判斷：不應在每次歌曲資訊更新後清掉整個音樂資料庫再重載。那只是把使用者手動「刪資料庫、重加音樂」縮成粗暴流程，對未來上萬首歌曲不友善。
- 根因：原始檔寫回成功後，播放器雖然重新讀回該曲 metadata 並更新 React state，但成功提示 / 關閉面板早於 IndexedDB track metadata 實際保存完成；若很快重開，資料庫仍可能留著舊 cover02。
- 修正：`replaceTrackSongInfo` 回傳更新後的 `Track` snapshot；`useMusicLibraryDb` 新增 `saveTracksNow()`，沿用既有保存 queue 立即保存指定 tracks snapshot；「套用到原始檔」只有在單曲 metadata 重讀與 IndexedDB 保存都完成後才顯示成功。
- 已在 `check:playback-restore` 加防回歸：要求 `saveTracksNow`、要求回傳 `saveTask`、要求 App 端 `await libraryDb.saveTracksNow`，避免成功提示早於 DB 保存。
- 已通過 `npm run check:playback-restore`、`SONG_INFO_FIXTURE_PATH=/private/tmp/.../Plazma-test/01. Plazma.flac npm run check:song-info`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.26`、CFBundleVersion `0.1.26`、Mach-O arm64、`app.asar` 存在、mac AI model/runtime 存在；Windows EXE static check 為 NSIS installer；`release/` 暫存輸出已移除。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.26.exe`、`Aquariusgirl Music Room-0.1.26-arm64.dmg`。
- SHA-256：EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`；DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。
- GUI 驗收補做：已卸載 / 重新掛載 0.1.26 DMG，使用 `/private/tmp/aquariusgirl-0.1.26-mouse-profile` 隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本。Plazma 播放中 Cover 02 -> Cover 01 套用到原始檔成功；原始 FLAC 讀回為 Cover 01（data URL 長度 `5789911`，Cover 02 為 `1347951`）；切到 `02. BOW AND ARROW.flac` 再切回 `01. Plazma.flac` 仍會播放且不卡；重開同 profile 後 `0.1.26 Cover QA` 播放清單仍保留 Plazma。
- 驗收限制：macOS 原生對話框因 `/private/tmp` 隱藏路徑與無輔助使用權限無法完整滑鼠自動選檔，資料夾與封面檔選擇使用限制在暫存路徑的本機 harness；播放、編輯面板、套用確認、切歌、重開與播放清單觀察皆在 packaged app UI 完成。Windows 真機安裝、4 GB 資料夾與簽章仍需人工驗收。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.26 Windows / 大資料夾驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`、DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。macOS packaged 隔離 profile 已驗證 Plazma cover02 -> cover01 寫回、切歌再切回不卡、第一次重開仍保留 Cover 01、播放清單不掉歌；但 native dialog 選檔使用暫存 harness。下一步重點：Windows fresh install、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、AI、Mini/dialog focus、簽章。不要清整個曲庫當修法；0.1.26 正確方向是單曲寫回後 await IndexedDB 保存。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Single-Track Writeback Persistence Hotfix 0.1.26 Complete

- Fixed the remaining cover/writeback persistence race after original-file writeback.
- Root cause: the app could report writeback success before the updated track metadata snapshot had finished saving to IndexedDB.
- Fix: original-file writeback now reloads only the edited track and awaits `libraryDb.saveTracksNow(...)` before showing success.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.26.exe`, `Aquariusgirl Music Room-0.1.26-arm64.dmg`.
- SHA-256: EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`; DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`.
- Passed source checks, build, package, DMG verify, read-only DMG metadata checks, packaged macOS isolated cover-writeback / switch-track / restart / playlist QA, and Windows NSIS static check. Native macOS file-dialog selection used a temp-path harness; real Windows QA remains open.

## 2026-07-03 audio source 誤重載 hotfix 0.1.25 完成

- 已補完 0.1.24 同族殘留：播放中更換封面 / 歌曲資訊後，切到其他首再切回同一首仍可能短暫卡住。
- 判斷：這不是全新問題，而是 metadata / cover 寫回後音訊來源刷新干擾的同族殘留；0.1.24 修掉 `mediaVersion` 與 IndexedDB 保存順序，但 `useAudioPlayer` 仍用瀏覽器正規化後的 `audio.src` 回讀值與原始 `currentTrackSource` 比較。
- 根因：source effect 依賴 duration，metadata / duration 更新時可能因 `audio.src !== currentTrackSource` 誤判為新來源並執行 `audio.load()`。
- 修正：新增 `loadedTrackSourceRef` 記住最後指定給 audio element 的 source；source effect 只依賴 `currentTrackSource`，duration 更新不再重載音訊。`stop()` 與清空來源時同步清 ref。
- 已在 `check:playback-restore` 加防回歸：要求 `loadedTrackSourceRef`，禁止 `audio.src !== currentTrackSource`，禁止 source effect 依賴 `[currentTrackDuration, currentTrackSource]`。
- 已補強 `song-info-writer-check`：有 `SONG_INFO_FIXTURE_PATH` 時會讀同資料夾的 `Cover 02.jpg` / `Cover 01.jpg` 做真實 cover02 -> cover01 roundtrip；本輪用 Plazma 暫存複本 PASS，原始音樂未修改。
- 已通過 `npm run check:playback-restore`、`npm run check:track-display`、`npm run check:track-identity`、`SONG_INFO_FIXTURE_PATH=/private/tmp/.../Plazma-test/01. Plazma.flac npm run check:song-info`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- DMG `hdiutil verify` VALID；EXE static check 為 Windows NSIS installer。Codex 沙盒拒絕直接啟動 Electron GUI，且 `hdiutil attach` / `imageinfo` 因裝置權限與用量限制未完成，所以本輪不宣稱滑鼠實機操作或 DMG 唯讀掛載讀回 PASS。
- 0.1.25 installer（歷史）位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.25.exe`、`Aquariusgirl Music Room-0.1.25-arm64.dmg`。
- SHA-256：EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`；DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。
- 技能更新：0.1.25 lesson 原本曾因用量限制未寫入；已於 0.1.26 回合連同 0.1.26 lesson 補進 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。
- 仍需人工驗收：Windows fresh install、播放中改封面後切歌再切回不卡、cover02 -> cover01 重開不回跳、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、歌曲資訊 / 封面寫回、AI、Mini/dialog focus；macOS 仍需實際 GUI 滑鼠流程與 DMG 唯讀掛載讀回。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.25 歷史驗收查核時使用。0.1.25 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`、DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。0.1.25 lesson 已於 0.1.26 回合補進 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Audio Source Reload Hotfix 0.1.25 Complete

- Fixed the remaining 0.1.24-family playback stall where metadata / cover updates could still cause a same-source `audio.load()`.
- Root cause: `useAudioPlayer` compared browser-normalized `audio.src` with raw `currentTrackSource`, and source loading depended on duration updates.
- Fix: `loadedTrackSourceRef` tracks the assigned source; source loading depends only on `currentTrackSource`.
- 0.1.25 historical installers: `Aquariusgirl Music Room Setup 0.1.25.exe`, `Aquariusgirl Music Room-0.1.25-arm64.dmg`.
- SHA-256: EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`; DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`.
- Passed source, build, package, DMG verify, and Windows NSIS static checks. GUI mouse validation, DMG read-only mount readback, real Windows QA, and signing remain open. The 0.1.25 skill-file lesson was later added during the 0.1.26 round.

## 2026-07-03 封面寫回播放卡頓 hotfix 0.1.24 完成

- 已修正播放中更換封面後，切到其他首再切回會短暫卡住才播放的問題。
- 已修正封面 cover02 改成 cover01 後，第一次重開仍看到 cover02、第二次重開才看到 cover01 的保存順序問題。
- 判斷：這不是全新問題，但也不是 0.1.23 原 bug 復發；同屬 metadata / cover 寫回後狀態打架，這次精確路徑是 `mediaVersion` 造成 audio source 重載，以及 IndexedDB track metadata 非同步保存順序競賽。
- 修正：`replaceTrackSongInfo` 不再為 metadata/cover-only 更新設定 `mediaVersion: Date.now()`；`useMusicLibraryDb` 以 `trackSaveQueueRef` 串接 save / clear，確保舊 cover save 不會晚於新 cover save 落地。
- 已把更詳細復盤寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` 的 0.1.24 條目。
- 已通過 `npm run check:playback-restore`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:song-info`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- 已完成 0.1.24 DMG `hdiutil verify`、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查，以及 Windows NSIS EXE static check。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.24.exe`、`Aquariusgirl Music Room-0.1.24-arm64.dmg`。
- SHA-256：EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`；DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。
- 仍需 Windows 真機驗收：fresh install、播放中更換封面後切歌再切回不卡、重開封面不回跳、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、歌曲資訊 / 封面寫回、AI、Mini 與 dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.24 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`、DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、改封面後播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Cover Writeback Playback Hotfix 0.1.24 Complete

- Fixed playback stalling after cover writeback when switching away and back to the edited track.
- Fixed the first-restart-old-cover / second-restart-new-cover persistence race.
- This is the same metadata / cover writeback conflict family as earlier fixes, but not the exact 0.1.23 bug. The precise 0.1.24 path was unnecessary `mediaVersion` audio reload plus unordered IndexedDB track metadata saves.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.24.exe`, `Aquariusgirl Music Room-0.1.24-arm64.dmg`.
- SHA-256: EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`; DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`.
- Passed the full 0.1.24 source, build, package, DMG, and static EXE checks. Real Windows QA remains open.

## 2026-07-03 歌手欄位閃爍 hotfix 0.1.23 完成

- 已修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的畫面閃爍。
- 判斷：這不是全新的問題類型，而是 0.1.19 / 0.1.21 以來 metadata 來源打架的同族問題；本次新的精確路徑是 `storedTracks` 同時是開機舊資料與目前 `tracks` 即時鏡像。
- 根因：Electron auto-restore 為了啟動速度用 `readMetadata:false`，一開始可能只有較弱 metadata；`applyStoredTrackMetadata` 直接 `artist: stored.artist`，且回灌 stored metadata 後沒有標記 `metadataLoaded`，導致後續弱 stored metadata 又把真實歌手蓋回未知歌手。
- 修正：stored 文字欄位只有非空值才覆蓋目前 track 文字；回灌任一 stored metadata 後標記 `metadataLoaded`，後續同 sourcePath 的同步只更新 duration、playCount、lastPlayedAt 等播放統計。
- 已把回歸測試補進 `check:playback-restore`：確認不能再出現 `artist: stored.artist`，必須使用 `preserveStoredText(stored.artist, track.artist)`，且回灌 stored metadata 要有 `metadataLoaded: track.metadataLoaded || hasStoredMetadata(stored)`。
- 已通過 `npm run check:playback-restore`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:song-info`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、`npm run check:prompts`、all-target `check:ai-assets`、`npm run check:custom-images`、`npm run check:theme-colors`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查、Windows NSIS static check。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.23.exe`、`Aquariusgirl Music Room-0.1.23-arm64.dmg`。
- SHA-256：EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`；DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。
- 仍需 Windows 真機驗收：fresh install、歌手欄位不再「米津玄師 / 未知歌手」跳動、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊與封面寫回、AI、Mini 與 dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.23 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`、DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、歌手欄位不再在真實歌手與未知歌手之間跳動、播放不卡且暫停會停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、封面 cover02 -> cover01 可改回且播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Artist Flicker Hotfix 0.1.23 Complete

- Fixed the artist field flicker where the UI alternated between `米津玄師` and `未知歌手`.
- This is the same metadata-source conflict family as earlier fixes, but the precise 0.1.23 path was new: `storedTracks` acted as both startup snapshot and live `tracks` mirror.
- Root cause: auto-restore uses `readMetadata:false` for startup speed, so early tracks can carry weak metadata. `applyStoredTrackMetadata` directly assigned `artist: stored.artist` and did not mark the track metadata-loaded after applying stored metadata, allowing weak stored metadata to overwrite real artist text later.
- Fix: stored text only overwrites current text when it is non-empty; applying stored metadata marks the track metadata-loaded, so later same-source syncs update playback stats only.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.23.exe`, `Aquariusgirl Music Room-0.1.23-arm64.dmg`.
- SHA-256: EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`; DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`.
- Still open: real Windows install, artist-flicker UI verification, playback/pause, latest-folder restore, large-folder load, song info / cover writeback, AI, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-03 08:59 Cover 01 封面回改 hotfix 0.1.22 完成

- 已查明米津玄師 `Cover 01.jpg` 無法選回封面的根因：圖片本身是正常 JPEG/Exif，1500×1500、4,342,414 bytes，不是特殊壞結構；舊版播放器封面上限為 3 MB，所以 `Cover 02.jpg` 約 1 MB 能成功，`Cover 01.jpg` 會被擋在預覽與保存之前。
- 已將歌曲封面上限調整為 5 MB；這足以支援 `Cover 01.jpg`，同時保留上限以避免過大圖片拖慢 M1 MacBook Air 8GB 或未來大量歌曲環境。
- 已新增明確錯誤提示：若封面超過上限，顯示「封面圖片太大，請選擇 5 MB 以內的 JPG / PNG」；格式錯誤則只提示 JPG / PNG。
- 已補測試：`song-info-check` 覆蓋 4,342,414 bytes 的 `Cover 01.jpg` 類型案例、過大圖片提示與格式錯誤提示；Electron writer 的 data URL 解碼也覆蓋 4,342,414 bytes JPEG。
- 已用真實 `01. Plazma.flac` 暫存複本驗證：寫入 `Cover 02.jpg` 後讀回，再寫回 `Cover 01.jpg` 後讀回，PASS；原始音樂檔未修改。
- 已通過 `npm run check:song-info`、真實 FLAC cover02 -> cover01 roundtrip、`check:track-display`、`check:track-identity`、`check:playback-restore`、`check:ai-track-search`、`check:flac-metadata`、`npm run build`、`check:prompts`、all-target `check:ai-assets`、`check:custom-images`、`check:theme-colors`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查、Windows NSIS static check。
- 0.1.22 歷史 installer 位於 `release-delivery/installers/` 當時輸出：`Aquariusgirl Music Room Setup 0.1.22.exe`、`Aquariusgirl Music Room-0.1.22-arm64.dmg`。
- SHA-256：EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`；DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。
- 仍需 Windows 真機驗收：fresh install、選擇大於 3 MB 且小於 5 MB 的 JPG 封面、超過 5 MB 封面錯誤提示、FLAC 封面寫回、播放/暫停、4 GB / 20+ 首資料夾、AI 操作與 Mini/dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.22 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`、DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、米津玄師 `Cover 02.jpg` 可改回 `Cover 01.jpg`、選到大於 3 MB 且小於 5 MB 的 JPG 會預覽並可保存、超過 5 MB 的圖片會明確提示過大、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 08:59 Cover 01 Cover Revert Hotfix 0.1.22 Complete

- Root cause: `Cover 01.jpg` is a valid JPEG/Exif image, 1500x1500 and 4,342,414 bytes. It was blocked by the old 3 MB cover limit before preview/writeback, while the smaller `Cover 02.jpg` passed.
- Raised the song-cover limit to 5 MB and added a specific too-large error message.
- Verified a real `01. Plazma.flac` temp copy: write `Cover 02.jpg`, read back, then write `Cover 01.jpg`, read back. Original files were not modified.
- 0.1.22 historical installers: `Aquariusgirl Music Room Setup 0.1.22.exe`, `Aquariusgirl Music Room-0.1.22-arm64.dmg`.
- SHA-256: EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`; DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`.
- Still open: real Windows install, cover >3 MB and <5 MB UI/writeback, >5 MB error message, FLAC writeback on Windows, playback/pause, large-folder load, AI, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 23:50 顯示/封面/啟動效能 hotfix 0.1.21 完成

- 已修正截圖圈選的歌曲顯示排序：目前播放卡與歌曲列表第一行優先顯示檔名，沒有檔名才顯示歌曲標題；第二行顯示歌手。
- 已修正封面寫回後播放清單遺失歌曲的根因：Electron 本機檔案 track id 不再把 mtime / size 當主要識別，改以穩定 `sourcePath` 為主。原始檔寫回封面造成大小或修改時間改變時，同一首歌不會在下次重開被視為另一首。
- 已加入舊播放清單 id remap：載入曲庫後會用保存的 `sourcePath` 把舊 id 對應到目前 track id，避免 0.1.19 / 0.1.20 期間因檔案改寫產生的舊 id 讓播放清單掉歌。
- 已驗證封面「cover02 改回 cover01」：使用真 MP3 fixture 的暫存複本，先寫入 cover02、讀回確認，再寫回 cover01、讀回確認，原始 fixture 不被修改。
- 已縮短 Electron 啟動恢復來源清單的重 metadata 讀取：`restore-music-paths` 先跳過 taglib metadata / cover 逐首讀取，改用 IndexedDB 內保存的 metadata 快速還原；需要重讀原始檔時再走明確操作。
- 已讓 AI 助手建立播放清單期間顯示等待狀態，並暫時停用輸入與建立按鈕，避免使用者在建立中連續送出無效指令。
- 已新增 `scripts/track-display-check.mjs`、`scripts/track-identity-check.mjs`，並把 `check:track-display` / `check:track-identity` 納入 `dist:release` / `dist:mac` / `dist:win`。
- 已通過 `npm run check:track-display`、`npm run check:track-identity`、`npm run check:playback-restore`、`npm run check:song-info`、真 MP3 cover02 -> cover01 fixture roundtrip、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run build`、`npm run check:prompts`、all-target `check:ai-assets`、`npm run check:custom-images`、`npm run check:theme-colors`、`npm run electron:compile`、升權 `npm run dist:release`。
- 已完成 0.1.21 DMG verify、DMG 唯讀掛載版本 / arm64 架構 / app.asar / prompt / runtime 檢查，以及 Windows NSIS EXE static check。macOS 測試 DMG 已卸載。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.21.exe`、`Aquariusgirl Music Room-0.1.21-arm64.dmg`。
- SHA-256：EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`；DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。
- 仍需 Windows 真機驗收：fresh install、播放/暫停、99 首與更大曲庫載入、約 4 GB / 20+ 首資料夾、封面 cover02 -> cover01 實機寫回、改封面後重開播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.21 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`、DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放不卡、播放後按暫停會停止、歌曲第一行優先顯示檔名第二行顯示歌手、選擇新資料夾後重開會恢復最後來源、99 首與更大曲庫載入速度、約 4 GB / 20+ 首資料夾可載入、歌曲資訊寫回、封面 cover02 -> cover01 能改回、改封面後重開播放清單不掉歌、AI 建歌單期間會提示等待且不可連續送出、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 23:50 Display, Cover, and Startup Performance Hotfix 0.1.21 Complete

- Fixed the circled display order: the now-playing card and track rows prefer filename first, fall back to song title, and show artist on the second line.
- Fixed the playlist-loss root cause after cover writeback. Electron local track ids now use stable `sourcePath` first instead of mtime / size, so cover writeback no longer makes the same file look like a different track after restart.
- Added playlist id remapping through stored `sourcePath` so older playlist ids can point to the current track id after library restore.
- Verified the cover02 -> cover01 case with a real MP3 fixture temp copy: write cover02, read it back, then write cover01 and read it back again. The original fixture was not modified.
- Startup restore now skips full taglib metadata / cover reads per file and restores from stored IndexedDB metadata first. Explicit reload remains the path for rereading original tags.
- AI playlist creation now shows a waiting status and disables input / create controls while the playlist is being created.
- Added track-display and track-identity checks and wired them into release scripts.
- Passed the full 0.1.21 check set, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / prompt / runtime checks, and Windows NSIS static check.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.21.exe`, `Aquariusgirl Music Room-0.1.21-arm64.dmg`.
- SHA-256: EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`; DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`.
- Still open: real Windows install, playback/pause, 99+ track and larger library loading, a roughly 4 GB / 20+ song folder, real cover02 -> cover01 writeback, playlist persistence after cover changes, AI busy-state UX, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 19:25 播放/資料夾恢復 hotfix 0.1.20 完成

- 已修正播放音樂很卡、按播放後再按暫停沒有停下，以及畫面播放狀態閃爍。根因是播放 effect 依賴整個 `currentTrack`，duration / playCount / metadata 更新都可能讓 `HTMLAudioElement` 重設 source 並重複 `audio.play()`。
- 已把 audio source 同步收斂到穩定的 `currentTrackSource`；只有 `localUrl` 或 `mediaVersion` 改變才 `audio.load()`。播放/暫停改由獨立 effect 同步 `isPlaying`，暫停分支會明確呼叫 `audio.pause()`。
- 已新增 `scripts/playback-restore-check.mjs` 與 `npm run check:playback-restore`，並納入 `dist:release` / `dist:mac` / `dist:win` 前置檢查。
- Electron 手動選擇音樂資料夾時，會把該次 `sourcePath[]` 寫入既有 IndexedDB settings；下次啟動 auto-restore 會優先使用最後一次手動選擇的來源清單，沒有才退回舊版 tracks metadata。
- Electron 選擇資料夾回傳空陣列時不覆蓋最後來源清單，避免取消選擇或空資料夾清掉上次成功選擇。
- 已通過 `npm run check:playback-restore`、`npm run check:song-info`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、Windows NSIS static check。
- 一般沙盒 `npm run dist:release` 仍在 `hdiutil create` 失敗；升權重跑同一命令通過。DMG 唯讀掛載版本/架構讀回本輪因使用限制未完成，未宣稱 PASS。
- 最新 installer：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.20.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.20-arm64.dmg`。
- SHA-256：EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`；DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。
- 仍需 Windows 真機驗收：fresh install、播放/暫停連點、選擇新資料夾後重開自動恢復、約 4 GB / 20+ 首資料夾、歌曲資訊寫回、AI 操作與 Mini / dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.20 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`、DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認播放不卡、播放後再按暫停會停止、畫面不閃爍、選擇新音樂資料夾後重開會恢復最後選擇的來源清單、約 4 GB / 20+ 首資料夾可載入、歌曲資訊寫回、AI 聊天、AI 建歌單、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 19:25 Playback and Folder Restore Hotfix 0.1.20 Complete

- Fixed playback stutter, pause not stopping reliably, and flashing playback state. Root cause: the playback effect depended on the whole `currentTrack`, so duration / play-count / metadata updates could reset the audio source and call `audio.play()` again.
- Audio source sync now depends on stable `currentTrackSource`; play/pause sync is separate and explicitly pauses when `isPlaying` is false.
- Added `scripts/playback-restore-check.mjs`, `npm run check:playback-restore`, and wired the check into release build scripts.
- Electron folder selection now saves the latest selected `sourcePath[]` into the existing IndexedDB settings store. Auto-restore prefers that latest manual selection before falling back to stored track metadata.
- Empty Electron folder-selection results no longer overwrite the latest source list.
- Passed playback-restore, song-info, FLAC metadata, build, Electron compile, elevated `dist:release`, DMG verify, and Windows NSIS static check. DMG read-only mount version/architecture readback was blocked by usage limits this round and is not marked PASS.
- Latest installers: `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.20.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.20-arm64.dmg`.
- SHA-256: EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`; DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`.
- Still open: real Windows install, playback/pause click testing, latest-folder restore after restart, large-folder load, song-info writeback, AI operation, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 18:55 歌曲資訊寫回 hotfix 0.1.19 完成

- 已接續 0.1.19 初版修完使用者回報的歌曲資訊反覆跳動、保存流程打架，以及 Windows EXE 選擇大型音樂資料夾可能閃退問題。
- 已移除「保存到播放器」路徑，只保留「套用到原始檔」；播放器狀態在寫回成功後重新讀原始檔 metadata，並清除 metadata override。
- 已移除目前播放卡更多選單內重複的「更換專輯封面」按鈕；封面只在「編輯歌曲資訊」面板內更換。
- Electron 選擇檔案 / 資料夾 / 恢復路徑時，不再把音檔本體讀成 `ArrayBuffer` 傳進 renderer；改回傳 `file://`、source path、大小、mtime、relative path 與必要 metadata。這次判斷 EXE 閃退主因更像是總檔案大小經 IPC 傳輸造成記憶體壓力，不是 20 多首這個數量本身。
- 原始檔寫回改用 `taglib-wasm` 的 `TagLib.copyWithTags(source, temp, tags)` 先寫同副檔名暫存檔，封面也在暫存檔完成，最後才 rename 覆蓋原檔；真 MP3 fixture 複本寫回與讀回已驗證通過。
- 已把這次測試失敗經驗寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` 的 0.1.19 條目，供未來節省 token 與防重犯。
- 已通過 `npm run check:song-info`、`SONG_INFO_FIXTURE_PATH=... npm run check:song-info`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 架構檢查、Windows NSIS static check。
- 0.1.19 hotfix installer（歷史）：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`。
- SHA-256：EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`；DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`。
- 仍需 Windows 真機驗收：安裝 EXE、選擇約 4 GB / 20+ 首資料夾、播放、歌曲資訊寫回、封面寫回、AI 操作與 Mini / dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

## 2026-07-02 18:55 Song Info Writeback Hotfix 0.1.19 Complete

- Continued the 0.1.19 release and fixed the reported song-info jumping, save-flow conflict, and likely Windows EXE crash when selecting a large music folder.
- Removed the player-local save path. The only save action is now original-file writeback; after success, the app reloads metadata from the original file and clears metadata override state.
- Removed the duplicate current-track cover-change button from the More menu. Cover changes now live only inside the song info editor.
- Electron file/folder selection and path restore no longer read whole audio files into IPC `ArrayBuffer`s. They return `file://`, source path, size, mtime, relative path, and metadata. The likely crash cause was total byte volume through IPC, not the song count alone.
- Original-file writeback now uses `TagLib.copyWithTags(source, temp, tags)` to create a same-extension temp file, applies cover art there, and renames only after success. A real MP3 fixture copy write/read check passed.
- Added the failed-test lesson to `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` under 0.1.19.
- Passed `npm run check:song-info`, `SONG_INFO_FIXTURE_PATH=... npm run check:song-info`, `npm run check:flac-metadata`, `npm run build`, `npm run electron:compile`, elevated `npm run dist:release`, DMG verify, read-only DMG version / arm64 checks, and Windows NSIS static check.
- 0.1.19 hotfix installers (historical): `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`.
- SHA-256: EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`; DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`.
- Still open: real Windows install, selecting a roughly 4 GB / 20+ song folder, playback, original-file song info / cover writeback, AI operation, Mini / dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 14:00 歌曲資訊與原始檔標籤寫回 0.1.19 完成

- 已從 0.1.18 接續升版至 0.1.19。
- 新增目前播放卡「更多」選單、歌曲資訊面板、單曲封面更換、重新讀取音樂標籤、顯示原始檔位置，以及桌面版 MP3/FLAC/M4A 原始檔 metadata / cover 寫回。
- 原始檔寫回使用 `taglib-wasm`，先產生修改後 bytes，再以 temporary file + rename 寫回；失敗時回報「原始檔未修改」。重新讀取在 Electron 版會由主程序直接讀原始檔標籤，避免 FLAC/M4A 寫回後畫面不同步。
- 已通過 `check:song-info`、prompt / AI assets / all-target AI assets / AI track search / playlist / FLAC / custom images / theme colors / build / Electron compile / 升權 `npm run dist:release` / DMG verify / packaged static checks。
- 0.1.19 初版 installer（歷史）：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`。
- SHA-256：EXE `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`；DMG `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`。
- 仍需 Windows 真機驗收、Apple Developer ID / notarization 與 Windows code signing。
- 發行文件規則：根目錄 MD 與 `release-delivery/` MD 必須追加新版紀錄，不可刪除舊版歷史。

## 2026-07-02 14:00 Song Info and Original Tag Writeback 0.1.19 Complete

- Continued from 0.1.18 and bumped to 0.1.19.
- Added the current-track More menu, song info panel, per-track cover changes, metadata reload, show original file location, and desktop MP3/FLAC/M4A original metadata / cover writeback.
- Original file writeback uses `taglib-wasm`, produces modified bytes first, then writes through a temporary file and rename. Electron reloads metadata from the original file after writeback so FLAC/M4A stay in sync.
- Passed `check:song-info`, prompt, AI assets, all-target AI assets, AI track search, playlist, FLAC, custom images, theme colors, build, Electron compile, elevated `npm run dist:release`, DMG verify, and packaged static checks.
- 0.1.19 initial installers (historical): `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`.
- SHA-256: EXE `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`; DMG `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`.
- Real Windows QA, Apple Developer ID/notarization, and Windows code signing remain open.
- Release-doc rule: root MD files and `release-delivery/` MD files must append new version records without deleting old history.

## 2026-06-29 15:10 AI schema / Result Guard 0.1.18 完成

- 已從 0.1.17 main 接續升版至 0.1.18。
- 已補強三份 prompt、router JSON schema、工具任務 summary-only、Result Guard、safe reply fallback、本次 candidates trackId 驗證，以及 AI 聊天室禁止模型列歌。
- AI 聊天室不再顯示候選歌曲 title；歌曲清單仍由播放清單 UI 根據 `playlist.trackIds` 顯示。
- 已通過 prompt / AI assets / all-target AI assets / AI track search schema / playlist / Mini / FLAC / custom images / theme colors / build / Electron compile / 升權 `npm run dist:release` / DMG verify / packaged static checks。
- 0.1.18 發行當時的 installer：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.18.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.18-arm64.dmg`；目前資料夾只保留最新版。
- SHA-256：EXE `e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`；DMG `0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`。
- 仍需 Windows 真機驗收、Apple Developer ID / notarization 與 Windows code signing。

## 2026-06-29 15:10 AI schema / Result Guard 0.1.18 Complete

- Continued from 0.1.17 main and bumped to 0.1.18.
- Strengthened the three prompts, router JSON schema, summary-only tool tasks, Result Guard, safe reply fallback, candidate trackId validation, and no-model-song-list chat behavior.
- The AI chat no longer shows candidate track titles; song lists remain rendered by the playlist UI from `playlist.trackIds`.
- Passed prompt, AI assets, all-target AI assets, AI track search schema, playlist, Mini, FLAC, custom images, theme colors, build, Electron compile, elevated `npm run dist:release`, DMG verify, and packaged static checks.
- 0.1.18 installers at release time: `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.18.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.18-arm64.dmg`. The folder now keeps only the latest release.
- SHA-256: EXE `e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`; DMG `0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`.
- Real Windows QA, Apple Developer ID/notarization, and Windows code signing remain open.

## 2026-06-29 10:00 GitHub main 合併 0.1.17 完成

- 已依使用者同意合併 `codex/ai-harness-0.1.17` 到 `main`。
- `package.json` 版本已是 0.1.17；AI harness、open prompts、runtime 檢查腳本、GitHub workflow 與 0.1.17 source 已進入 main。
- 合併衝突只發生在 README 與 release-delivery 文件；已保留 main 較新的中英 README / release-delivery / QA 內容。
- 大模型 `resources/ai/models/qwen3.5-0.8b.gguf` 仍不進 Git；installer 仍不放進 Git。
- 本次合併 source 與打包設定，但未重打 installer；現有 0.1.17 installer 仍沿用 2026-06-28 已驗收檔案。

## 2026-06-29 10:00 GitHub main 0.1.17 Merge Complete

- Merged `codex/ai-harness-0.1.17` into `main` with user approval.
- `package.json` is now 0.1.17. The AI harness, open prompts, runtime check scripts, GitHub workflow, and 0.1.17 source are now on main.
- Merge conflicts only touched README and release-delivery docs; the newer bilingual main docs were kept.
- The large local model `resources/ai/models/qwen3.5-0.8b.gguf` remains out of Git. Installers also remain out of Git.
- This merge updates source and packaging settings but does not rebuild installers. The existing 0.1.17 installers are still the 2026-06-28 validated files.

## 2026-06-29 09:35 GitHub 內容盤點與 main 分支狀態（合併前記錄）

- 已檢查 GitHub `main` 對應的追蹤檔案清單、根 `README.md`、根 `CONTINUE_WORK.md`、`release-delivery/*.md`、`package.json`、`package-lock.json` 與 `.github/workflows/release.yml`。
- 根 `README.md` 與 `release-delivery/README.md` 已有中英交付檔案索引；`release-delivery` 文件已更新 0.1.16 / 0.1.17 AI、QA、installer 與人工缺口。
- 合併前差異：`main` 的程式碼與 `package.json` 停在 0.1.15；0.1.17 AI harness、open prompts、runtime 檢查腳本、GitHub workflow 與 `package.json` 0.1.17 位於已存在分支 `codex/ai-harness-0.1.17`。
- 後續修正：已合併 `codex/ai-harness-0.1.17` 到 `main`，並保留 `main` 較新的 README / release-delivery 文件。
- 安全邊界：`resources/ai/models/*.gguf` 與 `resources/ai/bin/darwin-x64/` 不應進 Git；GitHub 只追蹤必要 runtime、prompt 文字、檢查腳本與 `.gitkeep`。
- 本次只做 GitHub 內容盤點與文件修正，未改播放器 source、資源、版本或打包設定，因此不重打 installer。

## 2026-06-29 09:35 GitHub Content Audit and main Branch Status (Pre-Merge Record)

- Checked the tracked GitHub `main` file list, root `README.md`, root `CONTINUE_WORK.md`, `release-delivery/*.md`, `package.json`, `package-lock.json`, and `.github/workflows/release.yml`.
- Root `README.md` and `release-delivery/README.md` now include the bilingual delivery file index. `release-delivery` docs cover the 0.1.16 / 0.1.17 AI, QA, installer, and manual-gap status.
- Pre-merge finding: `main` source code and `package.json` were still at 0.1.15. The 0.1.17 AI harness, open prompts, runtime checks, GitHub workflow, and `package.json` 0.1.17 were on the existing `codex/ai-harness-0.1.17` branch.
- Resolution: `codex/ai-harness-0.1.17` has been merged into `main` while keeping the newer README / release-delivery docs from `main`.
- Safety boundary: `resources/ai/models/*.gguf` and `resources/ai/bin/darwin-x64/` should stay out of Git. GitHub should only track the needed runtime files, prompt text, check scripts, and `.gitkeep`.
- This pass only audits GitHub content and updates docs. It does not change app source, resources, version, or packaging settings, so installers were not rebuilt.

## 2026-06-22 17:44 歌詞／LRC 殘留清理 0.1.15 發行完成

- 確認同步歌詞 UI、LRC 匯入入口與同名 `.lrc` 自動配對早已移除；本輪只刪除 README、新手引導與未使用的 IndexedDB／匯入匯出歌詞資料管線。
- 未新增套件或替代功能；舊版 IndexedDB 若已有退役資料 store，會保留在本機但不再建立、讀取、寫入或匯出，避免破壞使用者資料。
- `src`、`electron`、`scripts`、`dist`、`dist-electron`、README 精準掃描無 LRC／歌詞／字幕殘留；build、Electron compile 與全部既有檢查通過。
- 0.1.15 EXE／arm64 DMG／x64 DMG 已位於 `release-delivery/installers/`；兩個 DMG verify、封裝版本／架構、EXE NSIS static check 與 arm64 packaged `file://` 新手引導均通過，測試 DMG 已卸載。
- Windows EXE 尚未在 Windows 真機執行；installer 未簽章／notarize。

## 2026-06-21 23:54 加入歌單修正 0.1.14 發行完成

- recovery-candidate-5 已一致恢復正式 IndexedDB／Local Storage；0.1.13 與 0.1.14 packaged 重開後均確認 14 首、re0 2 首、米津玄師 4 首，原始音樂檔未改動。
- 目前播放卡加入歌單欄位固定為 `w-36 shrink-0`；重複加入改用 renderer dialog，保留原有確認語意，未新增套件或改歌單結構。
- 全部檢查、build、Electron compile、隔離 GUI、`dist:all`、DMG verify、版本／架構與 packaged `file://`／一般→MINI→一般均通過。
- 0.1.14 EXE／arm64 DMG／x64 DMG 已在 `release-delivery/installers/`；`release/` 不存在，0.1.13／0.1.14 測試 DMG 均已卸載。
- Windows 真機仍需驗證連續加入／重複確認與既有 MINI 手順；installer 未簽章／notarize。

## 2026-06-21 18:32 最大化切換 MINI／拖曳 0.1.12 發行驗收完成

- 已保存 normal bounds 並在套用固定 MINI bounds 前解除 full screen／maximize；MINI 頂部安全區已加入既有拖曳區，控制項維持 no-drag。
- 完整既有檢查、build、Electron compile、Electron dev 全螢幕切換／拖曳／返回 Full 與 `dist:all` 均通過。
- 三個 0.1.12 installer 已在 `release-delivery/installers/`，EXE static check 與 SHA-256 已完成，`release/` 不存在。
- 兩個 DMG verify 均為 VALID；封裝版本均為 0.1.12，架構分別為 arm64／x86_64，arm64 packaged `file://`、preload IPC 與 Full→MINI→拖曳→Full 均通過，本輪測試映像已卸載。
- Windows 0.1.12 EXE 最大化→MINI、拖曳與版面仍需真機驗收；installer 未簽章／notarize。

## 2026-06-20 23:02 MINI 色彩／透明度 0.1.8 發行狀態

- 已在色彩設定新增「MINI 背景」七彩色相；同時套用完整播放器底部 MINI 列與桌面 MINI 視窗。
- 已在透明度設定新增「MINI 視窗」欄位，直接共用既有原生 opacity 狀態與 `20–100%` 安全範圍；未新增第二份狀態或套件。
- 「全部復原」會同步恢復 MINI 色相 232 與透明度 92%。
- `theme-color-check`、`mini-opacity-check`、圖片／FLAC／播放清單檢查、build、Electron compile、Electron dev 色相／20%／100%／復原驗收與 `dist:all` 均通過。
- arm64 packaged `file://` 驗收通過；MINI 色相與透明度欄位、既有保存值載入及底部 MINI 列配色均正常。
- 兩個 DMG `hdiutil verify` 均為 VALID；封裝版本均為 0.1.8，架構分別為 arm64 / x86_64；EXE static check 通過。
- 0.1.8 三個 installer 只保留在 `release-delivery/installers/`，`release/` 不存在，兩個測試 DMG 均已卸載。
- Windows EXE 尚需真機驗收，installer 未簽章／notarize。

目前 0.1.8 installer：

- EXE：134,366,590 bytes，SHA-256 `73b05fb9d97724216ef99ff68a260c5fca9ad51012692252babbf1ecca8f8e56`
- arm64 DMG：149,349,388 bytes，SHA-256 `2de7b79107763012be47fdbd3209d50a3f2cd94bdc3a19f0dac89c37e65d6ae3`
- x64 DMG：151,303,015 bytes，SHA-256 `34fa962543359f7276138a997d23dfd4ae0910b9d81bd75d8470db6a63415d65`
- 修改時間：2026-06-20 23:02:09 CST。

## 2026-06-20 22:21 面板色彩與透明度 0.1.7 發行狀態

- 色彩設定新增「面板背景」七彩色相拉桿，只改 Header、歌單、工具、備份與同類共用面板底色。
- 外觀設定新增「透明度」分頁；共用面板、主背景、角色舞台遮罩與左右裝飾均可調整 `0–100%`，文字與按鈕不跟著透明。
- 設定沿用既有 localStorage、匯出／匯入與全部復原；未新增套件，預設值維持 0.1.6 暗色外觀。
- 相關檢查、build、Electron compile、Electron dev 邊界／保存／復原驗收、`dist:all` 與 arm64 packaged `file://` 驗收均通過。
- 0.1.7 EXE／arm64 DMG／x64 DMG 位於 `release-delivery/installers/`；DMG checksum、兩個封裝版本／架構與 EXE static check 均通過，測試 DMG 均已卸載。
- Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 17:47 暗色面板 0.1.6 發行狀態

- 已將共用 `.glass-panel` 改為固定深藍黑 `rgba(8, 11, 31, 0.94)`，角色舞台另加深色遮罩；主背景仍清楚，紅點與同類卡片不再被背景染亮。
- `theme-color-check`、`custom-image-check`、FLAC／播放清單／Mini 檢查、build、Electron compile、Electron dev 視覺驗收與 `dist:all` 均通過。
- arm64 packaged `file://` 視覺驗收通過：Header、歌單、工具、備份與同類卡片維持暗色，角色舞台已加深，主背景仍清楚。
- 0.1.6 EXE／arm64 DMG／x64 DMG 位於 `release-delivery/installers/`；兩個 DMG checksum、封裝版本與 x86_64／arm64 架構核對均通過，測試掛載均已卸載。
- Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 17:24 主背景清晰度 0.1.5 發行狀態

- 主背景改為 70% opacity 並移除 blur；覆蓋的主題漸層改為半透明，背景人物與城市細節清楚可辨識。
- 圖片／既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- 0.1.5 DMG／EXE 位於 `release-delivery/installers/`；Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 17:05 主背景與裝飾顯示 0.1.4 發行狀態

- 修正 `BackgroundAura` 負 z-index：主背景現在位於內容底層，兩張裝飾清楚固定於左右下角且不攔截操作。
- 圖片／既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- 0.1.4 DMG／EXE 位於 `release-delivery/installers/`；Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 16:31 FLAC 內嵌封面 0.1.3 發行狀態

- 現有 metadata 解析器已支援 FLAC 原生 `PICTURE` 內嵌封面；未新增套件，未改 UI／播放／歌單。
- FLAC 封面回歸、既有功能檢查、build、Electron compile、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- 0.1.3 DMG／EXE 位於 `release-delivery/installers/`；截圖中的真實 Windows FLAC 尚需用 0.1.3 EXE 匯入確認，installer 未簽章。

## 2026-06-19 17:16 色彩設定 0.1.2 發行狀態

- 外觀視窗新增「圖片／色彩」分頁，以及主色、輔色、金色點綴、文字、背景五組七彩色相拉桿。
- 色彩設定會保存、納入匯出／匯入，並提供全部復原；九張圖片設定維持不變。
- 色彩／圖片／播放清單／Mini 檢查、build、Electron compile、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。
- 0.1.2 DMG／EXE 位於 `release-delivery/installers/`；Electron 拉桿保存／復原仍需人工確認，Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-19 10:44 圖片設定 0.1.1 發行狀態

- 右上新增等距圖片設定按鈕，可更換九張目前實際顯示的 `public/assets` 圖片。
- 自訂圖片會驗證格式／大小並複製到 app userData；可個別回復預設，不修改原始檔。
- 圖片檔案檢查、build、Electron compile、Browser 視覺驗收、`dist:all`、DMG verify 與 EXE static check 均通過。
- 0.1.1 DMG／EXE 位於 `release-delivery/installers/`；原生選圖與重開保存仍需 macOS 人工點擊，Windows EXE 仍需真機驗收。

## 2026-06-18 22:05 智慧清單排除與 MINI 20% 發行狀態

- 智慧型播放清單的垃圾桶已改為持久排除，不刪歌曲庫；排除資料支援保存與備份匯入。
- MINI 透明度下限已改為 20%。
- 邏輯檢查、build、Electron compile、`dist:all`、DMG verify 與 EXE static check 均通過。
- 最新安裝檔與人工驗收缺口詳見 `release-delivery/CONTINUE_WORK.md`。

## 2026-06-18 21:52 MINI 透明度發行狀態

- MINI 已新增 60–100% 數字輸入與左右 ±5 控制，並統一 8px 間距與圓角階層。
- `mini-opacity-check`、build、Electron compile、`dist:all`、DMG verify、EXE static check 均通過。
- 最新 DMG／EXE 位於 `release-delivery/installers/`；SHA-256 與人工驗收缺口詳見 `release-delivery/CONTINUE_WORK.md`。
- 尚需 macOS 桌面版人工點擊原生透明度與 Windows 真機驗收；installer 未簽章。

## 1. 專案目前狀態

- Electron + Vite + React + TypeScript 桌面音樂播放器。
- 已有主播放器、Mini 播放器、播放列表、智慧型播放清單、ID3 tag、專輯封面、音樂律動條、macOS/Windows 打包流程。
- 目前資料夾不是 Git repository，本輪不初始化 Git，改用本文件追蹤接續狀態。

## 2. 本輪任務目標

- 修正播放列表建立流程看起來無反應的問題。
- 移除 Electron App 中破壞沉浸感的瀏覽器安全限制提示。
- 修正 full / mini 視窗 bounds 分開保存與可見範圍 clamp。
- 修正 Mini 外圍巨大半透明框與透明度 UI。
- 修正 Mini alwaysOnTop 前端狀態與 BrowserWindow 實際狀態同步。
- 在主播放器 Visualizer 加入設定入口與強度設定。
- 以一致圓角、細緻邊框、克制陰影打磨 UI。
- 完成 build、Electron compile、dev 與打包驗證。

## 3. 已完成項目

- 已完整閱讀本輪附件需求。
- 已檢查 Electron main process、preload、platform API、瀏覽器安全提示來源。
- 已建立本接續文件。
- 已新增 `PlaylistNameDialog`，一般播放清單建立不再使用 `window.prompt`。
- 已讓 Electron 桌面 App 隱藏技術性瀏覽器安全限制提示，改成正向產品文案；web preview 仍可顯示限制提示。
- 已新增 custom window controls：最小化、放大/還原、關閉。
- 已將 Electron main process 改成 fullBounds / miniBounds 分開保存，並加入可見範圍 clamp。
- 已新增獨立 IPC：`setMiniAlwaysOnTop`, `getMiniAlwaysOnTop`, `windowControl`；Mini 透明度專用 IPC 已於後續移除。
- 已讓 renderer 以 `STORAGE_KEYS.windowBoundsState` 保存 full / mini bounds。
- 已將 Mini 置頂與透明度改成獨立 handler，避免只更新前端圖示。
- 已在主播放器 Visualizer 卡片加入「音樂譜設定」入口。
- 已在 visualizer settings 加入 `intensity` 強度 slider，並套用到 Web Audio analyser 計算。
- 已新增 design tokens：radius、surface、border、shadow、text、accent。
- 已將歌單改名流程改成 `PlaylistNameDialog`，移除 `window.prompt`。
- 已修正 playlist normalize migration 的 `updatedAt` 無限更新風險。
- 已讓 stored playlist store 濾掉 system playlist，避免舊資料混入造成重複 migration。
- 已用 in-app browser 驗證一般播放清單建立流程、主播放器音樂譜設定入口。
- 已修正 Electron dev 預設自動彈出 detached DevTools，改為 `AQUARIUSGIRL_OPEN_DEVTOOLS=1` 時才開。
- 已修正 Electron preload bridge 在 renderer 中未穩定暴露的問題，桌面版可正確顯示 custom window controls 與桌面文案。
- 已加入 Electron userAgent fallback，避免桌面版短暫誤判為 Web preview。
- 已清理 MiniPlayerAssistant 內已不使用的 `onMiniSettingsChange` 舊 props / callback。
- 已重新啟動 Electron dev 視窗並確認 full mode 畫面可顯示、無 DevTools 擋住、無 Web preview 限制文案。
- 已重新導出 macOS DMG，最新版統一放在 `release-delivery/installers/`。
- 已重新導出 Windows NSIS 安裝檔，最新版統一放在 `release-delivery/installers/`。
- 本輪 PM/QA/發行驗收新增：全螢幕/退出全螢幕 IPC 與 Header 按鈕。
- 本輪 PM/QA/發行驗收新增：歌曲列表可直接將指定歌曲加入指定一般播放清單。
- 本輪 PM/QA/發行驗收新增：播放清單建立與改名會阻擋重複名稱。
- 本輪 PM/QA/發行驗收新增：`npm run electron`, `npm run dist`, `npm run dist:win`, `npm run dist:mac`, `npm run dist:all`。
- 本輪 PM/QA/發行驗收新增：`.github/workflows/release.yml` 與 `release-delivery/` 交付文件。
- 已依使用者要求將 full mode 改回原生視窗框：DMG 保留 macOS 紅黃綠，EXE 保留 Windows 原生視窗控制。
- Mini 模式控制列曾改為 hover 浮現，後續已依使用者要求改回常駐顯示。
- 已重新執行 `npm run dist:all`，最新 DMG/EXE 已於 2026-06-16 09:47-09:49 產出。
- 已實際啟動打包過程中的 macOS packaged app，確認左上角原生紅黃綠控制鈕存在。
- 已依使用者要求移除「目前播放佇列」系統歌單與「播放清單資料夾」建立入口、型別、UI 與舊資料匯入殘留。
- 已再次執行 `npm run dist:all`，最新 DMG/EXE 已於 2026-06-16 10:18-10:19 產出，並同步到 `release-delivery/installers/`。
- 已實際啟動 packaged macOS app，確認歌單區不再顯示「目前播放佇列」與「新增播放清單資料夾」。
- 已新增 `scripts/sync-installers.mjs`，打包後會把最新 DMG/EXE 同步到 `release-delivery/installers/`，再移除暫存 `release/`，避免兩個類似交付資料夾。
- 已依使用者要求完全移除 EmptyState 空狀態大卡，刪除 `src/components/EmptyState.tsx`，並移除 `App.tsx` 的渲染入口。
- 已修正 Mini 260x268 視窗水平/垂直捲軸問題，主控控制框常駐顯示。
- 已將 Mini mode 原生 titlebar 空框隱藏，避免上方多出一整塊空白框。
- 已完整刪除 Mini 底部第 2 個音樂條設定與第 4 個透明度按鈕，包含 Mini 面板與透明度專用 IPC。
- 已將 Mini 底部保留的置頂與回完整播放器兩顆按鈕改為等距排列。
- 已在 full mode 頂部 titlebar 區域補回 `Aquariusgirl Music Room` 名稱；Mini 分支不渲染此 title。
- 已移除 Mini 最外層 border，減少一層外框，保留資訊區與控制區。
- 已用 source/CSS/build 驗證確認 Mini 無捲軸設定殘留、控制框常駐 visible、紅圈兩顆按鈕已刪除，並確認 `src/dist` 無 EmptyState/EMPTY STATE/小魚乾大卡文字。
- 已再次執行 `npm run dist:all`，上一輪 DMG/EXE 已於 2026-06-16 16:32 同步到 `release-delivery/installers/`。
- 已修正目前播放歌曲列的點擊行為：目前歌曲按下會切換播放/暫停，非目前歌曲才選歌播放。
- 已補齊設定保存/匯入匯出：Visualizer 設定、Mini 設定、播放清單與播放偏好可保存，不保存音樂檔本體。
- 同步歌詞 UI、LRC 匯入入口、同名 `.lrc` 自動配對及未使用資料管線已於後續版本完整移除。
- 已修正 Windows Mini 黑畫面風險：Windows Mini 視窗 opacity 強制 1、背景色固定，renderer 會 clamp 舊版 Mini opacity 設定。
- 已再次執行升權版 `npm run dist:all`，最新 DMG/EXE 已於 2026-06-16 20:24:03 同步到 `release-delivery/installers/`。

## 4. 尚未完成項目

- Mini alwaysOnTop 跨 App 置頂仍建議在真實桌面環境人工復測。
- Windows EXE 原生視窗控制需在 Windows 實機人工確認；目前 macOS 環境已完成打包但無法直接執行 EXE。

## 5. 目前已知問題

- full mode 採作業系統原生視窗框；仍建議在實際 Electron 視窗手動確認拖曳、縮小、放大、關閉與 resize 手感。
- GUI 自動點擊工具本輪不穩定，因此 Mini 以 source/CSS/build/Electron 截圖檢查驗收；真實手感可再人工補看一次。
- Electron alwaysOnTop 已接 IPC，但跨 App 置頂仍需要使用者在桌面環境手動確認。

## 6. 修改過的主要檔案

- `CONTINUE_WORK.md`
- `src/components/PlaylistNameDialog.tsx`
- `src/App.tsx`
- `src/components/CharacterStage.tsx`
- `src/components/PlayerCore.tsx`
- `src/types/settings.ts`
- `src/hooks/useLocalStorage.ts`
- `src/utils/platform.ts`
- `electron/main.ts`
- `electron/preload.ts`
- `src/components/Header.tsx`
- `src/components/MiniPlayerAssistant.tsx`
- `src/components/EmptyState.tsx`（已刪除）
- `src/components/AudioVisualizer.tsx`
- `src/components/AudioVisualizerSettingsPanel.tsx`
- `src/hooks/useAudioAnalyser.ts`
- `src/styles/tokens.css`
- `src/styles/index.css`
- `tailwind.config.js`
- `src/components/PlaylistManager.tsx`
- `src/hooks/usePlaylists.ts`
- `src/utils/platform.ts`
- `src/components/TrackItem.tsx`
- `src/components/TrackList.tsx`
- `src/components/PlaylistPanel.tsx`
- `src/hooks/useLocalTracks.ts`
- `src/storage/indexedDb.ts`
- `src/utils/audioFiles.ts`
- `src/utils/fileSystemAccess.ts`
- `src/utils/exportSettings.ts`

## 7. 重要設計決策

- 不重寫播放器架構。
- 保持同一個 renderer/audio element，full / mini 切換不建立第二個 audio element。
- 優先沿用現有 `useLocalStorage` 與 IndexedDB playlist 同步策略。
- 若專案不是 Git repository，不建立 checkpoint commit，只更新本文件。

## 8. 視窗 full / mini bounds 處理方式

- Electron main process 目前保存 `windowBoundsState.fullBounds` 與 `windowBoundsState.miniBounds`。
- renderer 也以 localStorage key `aquariusgirl.musicRoom.windowBoundsState` 保存 full / mini bounds。
- 進入 mini mode 前保存目前 full bounds；回 full mode 前保存目前 mini bounds。
- 使用 `ensureBoundsVisible(bounds, minimum)` 依目前 display workArea clamp，避免切回 full mode 跑出螢幕。

## 9. Mini alwaysOnTop 處理方式

- 進入 mini mode 時由 `setMiniPlayerMode(settings)` 呼叫 `setAlwaysOnTop(Boolean(settings.alwaysOnTop), "floating")`。
- mini 中點釘選會呼叫 `aquariusgirl:set-mini-always-on-top`，main process 實際執行 `BrowserWindow.setAlwaysOnTop(enabled, "floating")`。
- 回 full mode 時會呼叫 `setAlwaysOnTop(false)`，避免主視窗意外置頂。

## 10. Mini opacity 處理方式

- 進入 mini mode 時由 `setMiniPlayerMode(settings)` 呼叫 `setOpacity`。
- Windows 進入 mini mode 時 Electron 視窗 opacity 強制為 1，避免透明視窗在切歌時出現黑畫面。
- Renderer 會將舊版 Mini opacity 設定限制在 0.78-1。
- Mini 已移除透明度調整按鈕與 `aquariusgirl:set-mini-opacity` IPC；使用者不再從 Mini UI 調整透明度。

## 11. playlist / smart playlist 的資料結構

- `NormalPlaylist`: `type: "normal"`, `trackIds`, `parentId`, `createdAt`, `updatedAt`。
- `SmartPlaylist`: `type: "smart"`, `match`, `rules`, `sortBy`, `sortDirection`, `limit`, `parentId`。
- Smart playlist 只儲存 rules，不寫死結果 trackIds。

## 12. visualizer 設定資料結構

- 目前包含 `enabled`, `intensity`, `sensitivity`, `smoothing`, `barCount`, `minBarHeight`, `maxBarHeight`, `bassBoost`, `responsiveness`, `displayMode`。
- full mode 與 mini mode 共用同一份 `aquariusgirl.musicRoom.audioVisualizerSettings`。

## 13. migration 狀態

- 舊預設播放列表名稱「睡前小水波」「罐子閃亮 Cover」「狐狸女孩元氣歌」已在 `usePlaylists` migration 名單中。
- 已退場的舊歌單型別會在 `usePlaylists` normalize / 匯入流程中被濾掉。
- IndexedDB playlist save 已改為同步目前清單，避免舊資料殘留。

## 14. 執行過的驗證指令

- `npm run build`：通過。
- `npm run electron:compile`：通過。
- in-app browser：一般播放清單 dialog 可開、可建立、自動選取；主播放器音樂譜設定可開並顯示強度 slider。
- `npm run electron:dev`：通過，可開啟 Electron GUI；已確認 DevTools 不再自動擋住主視窗，桌面版 custom window controls 出現，Electron 中不再顯示 Web preview 限制提示。
- `npm run electron:build:mac`：升權後通過，最新版交付位置為 `release-delivery/installers/`。
- `npm run electron:build:win`：升權後通過，最新版交付位置為 `release-delivery/installers/`。
- `npm install`：通過。
- `npm run dev -- --host 127.0.0.1`：通過。
- `npm run dist:win`：通過，最新版交付位置為 `release-delivery/installers/`。
- `npm run dist:mac`：通過，最新版交付位置為 `release-delivery/installers/`。
- `npm run dist:all`：通過，重新產出 macOS x64/arm64 DMG 與 Windows x64 EXE。
- 2026-06-16 10:18-10:19 最新 `npm run dist:all`：通過，重新產出 macOS x64/arm64 DMG 與 Windows x64 EXE。
- `node scripts/sync-installers.mjs`：通過，最新三個安裝檔保留在 `release-delivery/installers/`，暫存 `release/` 已移除。
- Full mode title source/build 驗證：通過，頂部 `Aquariusgirl Music Room` 名稱只在 full mode 顯示。
- Mini source/CSS/build 驗證：通過，260x268 無 overflow 設定殘留，控制框常駐 visible，音樂條設定與透明度按鈕、面板及透明度 IPC 已移除，最外層 border 已移除。
- EmptyState 移除驗證：通過，`src/components/EmptyState.tsx` 已刪除，`src/dist` 掃描無 `EmptyState` / `EMPTY STATE` / 舊小魚乾大卡文字。
- 2026-06-16 16:32 最新 `npm run dist:all`：通過，最新三個安裝檔保留在 `release-delivery/installers/`，暫存 `release/` 已移除。
- 目前歌曲列播放/暫停切換 source/build 驗證：通過。
- Visualizer / Mini 設定匯出匯入 source/build 驗證：通過。
- LRC／歌詞／字幕 source/build 殘留掃描：通過，無功能入口或資料管線殘留。
- Windows Mini 防黑畫面 source/build 驗證：通過。
- 2026-06-16 20:24:03 最新升權版 `npm run dist:all`：通過，最新三個安裝檔保留在 `release-delivery/installers/`，暫存 `release/` 已移除。

## 15. 尚未執行或失敗的驗證指令

- Computer Use click / keyboard action：本輪可讀取 Electron 視窗與 accessibility tree，但實際 click / key 送出時回報 session inactive；已停止 AppleScript 嘗試，未留下背景程序。
- lint/test/typecheck：package.json 沒有獨立 script；typecheck 已包含在 `npm run build`。

## 16. 手動驗收清單

- 新增播放清單 dialog 可開、可取消、可 Enter 建立、空名錯誤。
- 新增智慧型播放清單 dialog 可開、可建立、rules 動態篩選。
- Electron App 不顯示瀏覽器安全限制提醒。已用 Electron GUI accessibility tree 確認。
- full mode 可拖曳、縮小、放大、resize，按鈕不被 drag 區吃掉。
- mini 在任何角落切回 full 不跑出螢幕。
- mini 無巨大透明外框。
- mini 最外層 border 已移除，少一層框。
- mini 260x268 無水平/垂直捲軸。
- mini 控制框常駐顯示。
- mini 原生 titlebar 空框不顯示。
- mini 底部第 2 個音樂條設定按鈕已刪除。
- mini 底部第 4 個透明度按鈕已刪除。
- EmptyState 空狀態大卡不再出現。
- mini alwaysOnTop 實際置頂。
- Visualizer 設定入口可調強度等設定。
- 目前歌曲列播放中按下會暫停，再按會播放。
- Electron 與 Web 介面不顯示 LRC／歌詞／字幕入口或說明。
- Windows 實機 Mini 按下一首不再出現黑畫面。

## 17. 下一步建議執行順序

1. 在 Windows 實機打開 EXE，人工確認原生視窗控制、Mini 下一首與安裝流程。
2. 在 macOS 桌面環境人工切到 Mini，確認 alwaysOnTop 跨 App 置頂手感。
3. 正式公開前補 Apple Developer ID 簽章、notarization 與 Windows code signing。

## 18. 下次恢復工作時可以直接貼給 Codex 的接續提示詞

請接續上一輪「水瓶罐子音樂播放器 / Aquariusgirl Music Room」修正工作。

請先閱讀 CONTINUE_WORK.md，並檢查目前專案狀態。不要重新設計整個專案，請依照 CONTINUE_WORK.md 的「尚未完成項目」與「下一步建議執行順序」繼續。

請先回報：

1. 目前已完成哪些項目。
2. 目前還有哪些未完成項目。
3. 你接下來會先修哪一項。
4. 預計會修改哪些檔案。

確認後，請繼續完成剩餘工作，並照原本驗證方法執行。
