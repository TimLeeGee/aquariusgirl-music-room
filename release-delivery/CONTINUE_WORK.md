# 接續工作狀態

最後更新：2026-07-08 CST

（此為交付區副本；最新完整接續紀錄以根目錄 `CONTINUE_WORK.md` 為準。）

## 2026-07-08 0.1.45–0.1.48 一批完成（AI 助手＋面板文字自訂）

0.1.45 AI 助手改善（A1–A3）＋歌曲資訊補全 Phase 1＋2；0.1.46 AI 快捷指令氣泡＋面板文字自訂；0.1.47 搜尋泡泡修正＋檢查歌曲資訊資料夾範圍/逐首手動編輯/非可寫檢視＋角色名稱全域改名；0.1.48 面板文字全量登錄表（分組＋可搜尋編輯器）。零新套件；沙盒 `tsc`/`electron:compile`/全部 `check:*` PASS；Mac 本機 `npm run dist:release` 打包 mac+win 並驗證（DMG `hdiutil verify` VALID＋掛載讀回、EXE NSIS）；已推 GitHub main（commit `f48f6b5`）。各版 SHA-256 見 `docs/releases/0.1.4x-checksums.md`；詳見根 `CONTINUE_WORK.md` 與 `release-delivery/QA_REPORT.md`。打包版 GUI 實測與 Windows 真機待補。

## 2026-07-07 Confirm Focus Lock / Toast Position hotfix 0.1.44 完成

- 已修正 Windows EXE 更換封面成功後排序 select / 搜尋歌手 / AI 助手輸入框失去焦點的問題（根因：`window.confirm` 原生確認窗，Electron Windows 已知焦點地雷；renderer `ConfirmDialog` 取代全專案 4 處，原生檔案 dialog 掛 parent＋focus restore）；toast 移到左上切齊標題列下緣、`pointer-events-none` 永不擋點擊；排序控制加 hover 變色反饋；保存成功 / 失敗提示逐路徑核對齊全。根因、修法、驗證與 checksums 詳見根目錄 `CONTINUE_WORK.md` 0.1.44 段落與 `release-delivery/QA_REPORT.md`。
- 0.1.44 installer 已同步到 `release-delivery/installers/`：EXE 667,667,973 bytes（SHA-256 `c0fb27123611c9b1d98902bd13daf9981ee41d65e3fa8b328ae8d2a220a20a27`）、arm64 DMG 684,759,938 bytes（SHA-256 `f086700f1c129883547cfb88fa2a211329c4262c4dbedadae9440d50c1601779`）、DMG hdiutil verify VALID；未簽章；程式與文件已推送 GitHub main（installer 不進 git）。
- 待補：Windows 真機驗證（更換封面套用成功後馬上點排序下拉、搜尋歌手、AI 輸入框；套用前應出現新的 renderer 確認窗）。

## 2026-07-07 Big Cover Readback Crash / Save Feedback hotfix 0.1.43 完成

- 已修正 4.3MB 大封面「套用到原始檔」後讀回 WASM 崩潰（寫回成功但播放器讀不回、「重新讀取音樂標籤」一直失敗），與保存提示被面板蓋住的問題；根因、修法、驗證與 checksums 詳見根目錄 `CONTINUE_WORK.md` 0.1.43 段落與 `release-delivery/QA_REPORT.md`。
- 0.1.43 installer 已同步到 `release-delivery/installers/`：EXE 667,667,342 bytes（SHA-256 `2be0007e5f8869bc253818ab24cc57705ce90b13306d0161a77cb27e41cebd36`）、arm64 DMG 684,779,166 bytes（SHA-256 `c6da0dba496ee3f9d607e1e3727689ac8bb70e3a15bff2ec3b8de06ee8120cc0`）、DMG hdiutil verify VALID；未簽章、不 push GitHub。
- 待補：使用者實機以 `Cover 01.jpg` 重試保存與重新讀取（現在成功/失敗右上角都會跳提示）；Windows 真機驗證。

## 2026-07-06 Playing File Lock Release hotfix 0.1.42 完成

- 已修正 Windows EXE 播放中「套用到原始檔」有時保存失敗：根因是 `<audio>` 以 `file:` URL 載入原始檔時 Windows 持有檔案 handle，`rename(tempPath, sourcePath)` 覆蓋被 `EPERM` / `EBUSY` 擋下；macOS rename 可覆蓋開啟中檔案，所以 DMG 驗收不會重現。
- `src/hooks/useAudioPlayer.ts` 新增 `suspendAudioForFileWrite(trackId)`：僅當寫回目標就是目前載入的歌時，暫停並卸下 audio src 釋放 OS handle，回傳 restore 函式；restore 以一次性 `loadedmetadata` listener 接回同一來源、原播放位置與播放狀態。
- `src/App.tsx` `handleApplySongInfoToOriginal` 只在 IPC 寫回期間 suspend，`finally` 立刻 resume；pre-read / readback / `putTrackMetadata` 不受影響。
- `electron/songInfoWriter.ts` 補 `renameWithRetry`（`EPERM` / `EBUSY` / `EACCES` 重試 3 次、150ms）擋防毒短暫鎖檔；重試後仍鎖住回傳明確錯誤「原始檔正被其他程式使用中，請暫停播放後再試一次。原始檔未修改。」
- 效能：釋放 / 接回 O(1) 只碰目前那一首，不掃曲庫、不重載清單；未新增套件、未改 DB schema、未動 0.1.41 partial-read / full-load retry 與 readback hash 路徑；M1 Air 8GB 與上萬首曲庫無額外負擔。
- 已通過（Linux 沙盒）：`check:metadata-save-loop`（新增鎖釋放與 rename retry guard）、`check:song-info`（含 writer 真實 wasm roundtrip）、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`tsc --noEmit`、`npm run electron:compile`。
- 版本已升 0.1.42（package.json / package-lock.json / exportSettings）。新增 `打包發行.command`：雙擊即在本機跑 `npm run dist:release` 並輸出 log 到 `qa-temp/dist-release.log`；本輪已由 Claude 透過桌面控制執行完成，build exit=0，DMG `hdiutil verify` VALID。0.1.42 installer：
- `Aquariusgirl Music Room Setup 0.1.42.exe`：667,666,956 bytes，SHA-256 `6d67c44c2c68ecfb838cbeb7d18038cda4fca3d96df1733739d9c58f47e75e7f`
- `Aquariusgirl Music Room-0.1.42-arm64.dmg`：684,778,895 bytes，SHA-256 `28caa3939b0ed79861cc9763f0d302956adbdce42768669f0ac987156a236f91`
- DMG `hdiutil verify` VALID；打包時 `dist:release` 內全部 check 再次通過；未簽章、不 push GitHub。詳見 `docs/releases/0.1.42-checksums.md`。
- 本輪依使用者要求不 push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.42 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset、不要 push GitHub。0.1.42 已完成 code 修正（播放中檔案鎖釋放 `suspendAudioForFileWrite` + writer `renameWithRetry`）、全部 source check、installer 產出（`release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.42-checksums.md`）。驗收重點：播放中對目前播放那首「套用到原始檔」保存文字與封面各至少兩次，保存瞬間音訊短暫中斷後應自動回到原位置繼續播放；Windows 真機 fresh install 播放中保存不再失敗；重開後 metadata / 封面仍在。不可打開或修改使用者原始 Music 資料夾；使用暫存音樂複本與隔離 profile。

## 2026-07-06 Full-Load Cover Write Guard / Packaged Mouse QA hotfix 0.1.41 完成

- 已完成 source 修正：`electron/songInfoWriter.ts` 對 packaged Emscripten TagLib partial read 失敗補 `partial:false` full-load retry，只在單曲 metadata read 遇到 `InvalidFormatError` 時啟動。
- writer 仍維持同一個 TagLib handle 設文字與封面，最後只 `saveToFile(tempPath)` 一次再 rename；沒有回到 `copyWithTags` / `edit(tempPath)` 雙保存路徑。
- 已完成 source guard：`scripts/song-info-writer-check.mjs` 強制 fixture 使用 `node_modules/taglib-wasm/dist` 的 Emscripten wasm，並在 Plazma QA 複本上驗 Cover 02 -> Cover 01 -> Cover 02 readback。
- 已保留 0.1.40 selectedCover dirty、防 incomplete cover bytes、readback hash 驗證與 `await putTrackMetadata(reloadedTrack)`。
- 已通過：`check:song-info`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.41 installer 已同步到 `release-delivery/installers/`，DMG verify VALID，`docs/releases/0.1.41-checksums.md` 已建立。
- packaged DMG app 已用隔離 userData 與滑鼠完成 Cover 01 -> Cover 02、Cover 02 -> Cover 01、Cover 01 -> Cover 02 三輪驗收；每輪 preview、dirty/apply、busy lock、自動關閉與 readback hash 都通過。「重新讀取音樂標籤」成功，重開後最後 Cover 02 與 metadata 仍存在。
- 本輪依使用者要求不要同步 / push GitHub。Windows 真機、簽章與 notarization 仍待補。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.41 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset、不要 push GitHub。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.41.exe`、`Aquariusgirl Music Room-0.1.41-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.41-checksums.md` 為準。macOS packaged DMG 隔離 profile 已完成三輪封面滑鼠驗收；下一步重點是 Windows 真機 fresh install、歌曲資訊 / 封面讀回、重新讀取音樂標籤、重開保存、播放/暫停、資料夾恢復、AI、Mini/dialog focus、簽章與 notarization。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-06 Selected Cover Dirty Guard / Reload Metadata Diagnostics hotfix 0.1.40 完成

- 已完成第二次選封面 dirty 防線：`SongInfoPanel` 以獨立 `selectedCover` 保存 bytes / MIME / hash / preview，文字 dirty 與封面 dirty 分開判斷。
- 已修正 reset 時機：關閉、重新開啟或切換 track id 才重建 draft/savedDraft/selectedCover；同一首歌 dirty 或 busy 時不被外部 track snapshot 覆蓋。
- 已保留 readback hash 與 IDB await 成功條件；App 端補上 cover hash 變了但 bytes 不在的防呆；成功仍只使用 `reloadedTrack` 並等待 `putTrackMetadata(reloadedTrack)`。
- 已補重新讀取診斷與 dev debug log：可分辨 dirty、IPC、readback、IDB 或 reload metadata 失敗位置。
- 已通過：`check:song-info`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.40 installer 已同步到 `release-delivery/installers/`，`docs/releases/0.1.40-checksums.md` 已建立；DMG verify、唯讀掛載讀回 0.1.40 / app.asar / taglib wasm 與 Windows NSIS static check 已完成。
- 本輪依使用者要求不要同步 / push GitHub。Windows 真機與完整 packaged GUI 連續封面滑鼠驗收仍待補。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.40 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.40.exe`、`Aquariusgirl Music Room-0.1.40-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.40-checksums.md` 為準。重點補驗：Windows 真機 fresh install、同一首歌連續更換封面至少兩次並「套用到原始檔」、dirty 不被 reset 吃掉、readback hash 不假成功、重開後封面仍是最後一次成功寫回、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不要新增套件、不要清 IndexedDB、不要重掃曲庫、不要加 `coverRevision`，不要 push GitHub，除非使用者明確要求。

## 2026-07-05 Cover Hash Readback / Playlist Order Persistence hotfix 0.1.39 完成

- 已完成封面保存單一路徑：前端 selected bytes hash 只代表使用者選圖；Electron original readback `coverHash` 才代表原始檔真的保存；`await putTrackMetadata(reloadedTrack)` 成功後才清 draft / dirty / saving 並顯示成功。
- 已完成 readback guard：`readbackHash === selectedCoverHash` 且 `readbackHash !== oldCoverHash` 才算成功；不再信任 write success、前端 draft 或舊 IndexedDB metadata。
- 已完成 panel reset / apply lock：apply 期間鎖住選圖、套用與關閉；第二次開面板會清 `draftCover` / `draftCoverHash` / `previewUrl` / `selectedFile` / selected bytes / selected MIME / selected hash / `saving` / `dirty` / `error`，再從最新 current track 建 draft。
- 已完成 playlist 自訂排序保存：一般 playlist 繼續保存 `trackIds`；全部歌曲自訂排序只保存被移動歌曲的 `addedAt`，避免大曲庫拖曳時重寫全庫。
- 已通過：`npm run check:song-info`、`npm run check:playlist-logic`、`npm run check:playback-order`、`npm run check:track-list-virtualization`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.39 installer 已同步到 `release-delivery/installers/`，`docs/releases/0.1.39-checksums.md` 已建立；DMG verify、唯讀掛載讀回版本 / app.asar / packaged guard 字串與 Windows NSIS static check 已完成。
- 本輪依使用者要求不要同步 / push GitHub。Windows 真機與完整 packaged GUI 連續封面滑鼠驗收仍待補。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.39 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.39.exe`、`Aquariusgirl Music Room-0.1.39-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.39-checksums.md` 為準。重點補驗：Windows 真機 fresh install、同一首歌連續更換封面至少兩次並「套用到原始檔」、readback hash 不假成功、重開後封面仍是最後一次成功寫回、playlist / 全部歌曲自訂排序重開後仍保存、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不要新增套件、不要清 IndexedDB、不要重掃曲庫、不要加 `coverRevision`，不要 push GitHub，除非使用者明確要求。

## 2026-07-05 Cover MIME Alias / Sort Controls Guard hotfix 0.1.38 完成

- 已完成 source 修正：`SortControls` 保留原生 select，補 `aria-label` 與 `min-w-[9.5rem]`，避免 packaged UI 看起來只剩單一排序；`scripts/track-list-virtualization-check.mjs` 會守住原本 7 種排序 option 與標籤。
- 已完成封面 MIME alias 修正：`src/utils/songInfo.ts` 與 `electron/songInfoWriter.ts` 將 `image/jpg` / `image/pjpeg` canonicalize 成 `image/jpeg`，`image/x-png` canonicalize 成 `image/png`；GIF / WebP / 真實不支援 MIME 仍拒絕。
- 已通過：`npm run check:song-info`、真實 Plazma 暫存複本封面 roundtrip、`npm run check:track-list-virtualization`、`npm run check:playback-order`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.38 installer 已同步到 `release-delivery/installers/`，`docs/releases/0.1.38-checksums.md` 已建立；DMG verify、唯讀掛載讀回版本 / app.asar / packaged alias 字串與 Windows NSIS static check 已完成。
- packaged macOS GUI 已用隔離 profile 開啟，排序下拉選單 7 種選項都可讀回；原生封面選檔器可用真實滑鼠打開，但純滑鼠選檔被 macOS 隱私提示擋住，需要使用者明確允許後才能完成。封面寫回核心已用暫存複本 writer/readback 驗證。
- 本輪依使用者要求不要同步 / push GitHub。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.38 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.38.exe`、`Aquariusgirl Music Room-0.1.38-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.38-checksums.md` 為準。重點補驗：Windows 真機 fresh install、排序下拉選單 7 種選項、封面更換與「套用到原始檔」、播放/暫停、資料夾恢復、AI、Mini/dialog focus；若要在 macOS 完成純滑鼠原生選檔流程，需要使用者手動允許 Codex / System Events 的隱私提示。不要新增套件、不要清 IndexedDB、不要重掃曲庫，不要 push GitHub，除非使用者明確要求。

## 2026-07-05 Cover MIME Fallback / Second Cover Save hotfix 0.1.37 完成

- 已完成 source 修正：`src/utils/songInfo.ts` 新增空白 / `application/octet-stream` MIME fallback，只有副檔名為 `.jpg` / `.jpeg` / `.png` 時才推回 `image/jpeg` / `image/png`；`SongInfoPanel` 會正規化 `FileReader` 產生的 data URL prefix。
- 已完成 Electron writer 防線：`electron/songInfoWriter.ts` 的 `decodeCoverDataUrl()` 允許空白 / octet-stream data URL 使用 `draft.coverMimeType` fallback，但真實不支援 MIME 仍會拒絕；5 MB 封面上限、MP3/FLAC/M4A 原始檔寫回與單曲 IndexedDB 保存路徑不改。
- 已通過：`check:song-info`、真實 Plazma 暫存複本 Cover 02 -> Cover 01 roundtrip、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`。
- 升權 `npm run dist:release` 已通過並同步 0.1.37 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已完成 DMG verify、唯讀掛載讀回 0.1.37 / app.asar / `Contents/Resources/taglib-wasm/taglib-web.wasm` extraResource、packaged renderer / main cover MIME fallback 讀回、Windows NSIS static check；`docs/releases/0.1.37-checksums.md` 已建立。
- 本輪依使用者要求不要同步 / push GitHub。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.37 Windows 真機 / packaged GUI 封面寫回驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.37.exe`、`Aquariusgirl Music Room-0.1.37-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.37-checksums.md` 為準。重點驗證：使用暫存音樂複本與隔離 profile，對同一首米津玄師 / Plazma 連續 Cover 02 -> Cover 01 -> Cover 02 或至少兩次更換封面並「套用到原始檔」，第二次不因空白 / octet-stream MIME 失敗；重開後封面仍是最後一次成功寫回的封面；播放中切歌再切回不卡；Windows fresh install、歌曲資訊 / 封面讀回、播放 / 暫停、資料夾恢復、AI、Mini/dialog focus。若要發布到 GitHub，必須等使用者明確指示後再 commit / push / readback。本輪目前依使用者要求未同步 / push GitHub。

## 2026-07-05 Song Info Single Save Path / TagLib Property Map Restore hotfix 0.1.36 完成

- 已完成 source 修正：`electron/songInfoWriter.ts` 補 TagLib property-map alias，讓 `TITLE` / `ARTIST` / `ALBUMARTIST` / `TRACKNUMBER` / `DISCNUMBER` 等大寫 metadata key 正確映射回歌曲資訊欄位；保留 0.1.35 的 unpacked `taglib-web.wasm` 與 `forceWasmType: "emscripten"`。
- 已移除歌曲資訊面板「儲存到播放器」按鈕與 `App.tsx` player-local save handler，避免播放器 IndexedDB override 與原始檔 tag 雙路徑互相覆蓋；目前只保留「套用到原始檔」：寫回原檔、重新讀回該首、再 `putTrackMetadata(reloadedTrack)`。
- 已通過：`check:song-info`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`。
- 升權 `npm run dist:release` 已通過並同步 0.1.36 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已完成 DMG verify、唯讀掛載讀回 0.1.36 / app.asar / `Contents/Resources/taglib-wasm/taglib-web.wasm` extraResource、packaged renderer 無「儲存到播放器」讀回、packaged main alias / wasm path 讀回、Windows NSIS static check；`docs/releases/0.1.36-checksums.md` 已建立。
- 已更新 installed `build-music-player` 技能到 0.1.36 歷史脈絡。依使用者要求，本輪不要 push GitHub。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.36 Windows 真機 / GitHub 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.36.exe`、`Aquariusgirl Music Room-0.1.36-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.36-checksums.md` 為準。重點驗證：Windows fresh install 後加入同一批歌曲，歌曲資訊 / 封面 metadata 可正常讀回，不再因 TagLib 大寫 property key 漏掉歌手 / 專輯歌手 / 曲目；歌曲資訊面板不再有「儲存到播放器」，只保留「套用到原始檔」；播放 / 暫停、資料夾恢復、AI、Mini/dialog focus。若要發布到 GitHub，依使用者明確指示後再 commit / push / readback。本輪目前依使用者要求未同步 / push GitHub。

## 2026-07-05 Packaged EXE Metadata Wasm Restore hotfix 0.1.35 完成

- 已完成 source 修正：`electron/songInfoWriter.ts` 不再使用 `taglib-wasm/simple`，改為可指定 unpacked wasm 的共用 TagLib 實例；packaged 時優先讀 `resources/taglib-wasm/taglib-web.wasm` 並使用 Emscripten buffer mode。
- 已完成版本 / 打包設定：`package.json`、`package-lock.json`、`src/utils/exportSettings.ts` 升到 0.1.35；`extraResources` 外帶 `node_modules/taglib-wasm/dist/taglib-web.wasm`；新增 `scripts/taglib-wasm-packaging-check.mjs`，並串入 `check:song-info`、`dist:release`、`dist:mac`、`dist:win`。
- 已通過：`npm run check:taglib-wasm-packaging`、`npm run check:song-info`、`npm run build`、`npm run electron:compile`。
- 升權 `npm run dist:release` 已通過並同步 0.1.35 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已完成 DMG verify、唯讀掛載讀回 0.1.35 / app.asar / `Contents/Resources/taglib-wasm/taglib-web.wasm` extraResource、Windows NSIS static check；`docs/releases/0.1.35-checksums.md` 已建立。
- 本輪依使用者要求不要同步 / push GitHub。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.35 Windows 真機 / GitHub 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.35.exe`、`Aquariusgirl Music Room-0.1.35-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.35-checksums.md` 為準。重點驗證：Windows fresh install 後加入同一批歌曲，歌曲資訊 / 封面 metadata 不再退回檔名 / 未知歌手；播放 / 暫停、資料夾恢復、AI、Mini/dialog focus。若要發布到 GitHub，依使用者明確指示後再 commit / push / readback。本輪目前依使用者要求未同步 / push GitHub。

## 2026-07-05 Playlist Panel Scroll Restore hotfix 0.1.34 完成

- 已完成 source 修正：`PlaylistPanel` 補上 `h-[calc(100vh-10rem)]`，現在是 `h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[520px]`，讓既有 `TrackList` 內部 `overflow-y-auto` 有穩定父層高度。
- 主視窗卷軸保留：`AppLayout` 仍是 `playlist-scrollbar relative z-10 h-screen overflow-y-auto overflow-x-hidden`；`body` 仍只 `overflow-x: hidden`。
- `TrackList` 仍是播放清單內部歌曲列表 scroll container，保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3` 與 visible-window + overscan。
- 未新增套件、未重做清單、未改 metadata / cover / IndexedDB / playback / Mini Player。
- 已通過 source guards、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、唯讀掛載讀回、packaged renderer/CSS scroll 檢查與 Windows NSIS static check。
- 0.1.34 installer 已同步到 `release-delivery/installers/`；`docs/releases/0.1.34-checksums.md` 已建立。本輪依使用者要求未同步 / push 到 GitHub。Windows 真機與 packaged GUI 大曲庫滑動仍待補驗。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.34 Windows / packaged GUI 大曲庫卷軸驗收。先執行 `git status -sb`、`git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`，SHA-256 請以 `docs/releases/0.1.34-checksums.md` 為準。重點驗證：主視窗右側大型卷軸仍在；playlist 歌曲列表在歌曲很多時出現自己的內部小卷軸；滾輪在 playlist 區優先捲歌曲列表；兩個卷軸都只在內容超出時出現；沒有水平卷軸；底部內容與 Mini Player 不被裁切；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。注意：0.1.34 目前未 push GitHub。

## 2026-07-05 Nested Main and Playlist Scroll hotfix 0.1.33 完成

- 已完成 source 修正：主視窗外層改為 `playlist-scrollbar relative z-10 h-screen overflow-y-auto overflow-x-hidden`，內容超出 viewport 時恢復右側大型垂直卷軸；`body` 不再全域 `overflow: hidden`，只保留 `overflow-x: hidden`。
- `TrackList` 仍是播放清單內部歌曲列表 scroll container，保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3` 與 visible-window + overscan。
- `PlaylistPanel` 保留 0.1.32 / 0.1.28 高度 `max-h-[calc(100vh-10rem)] min-h-[520px]`，播放清單不會無限制撐高主視窗。
- 未新增套件、未重做清單、未改 metadata / cover / IndexedDB / playback。
- 已通過 source guards、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、唯讀掛載讀回、packaged renderer/CSS scroll 檢查與 Windows NSIS static check。
- 0.1.33 installer 已同步到 `release-delivery/installers/`；`docs/releases/0.1.33-checksums.md` 已建立。Windows 真機與 packaged GUI 大曲庫滑動仍待補驗。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.33 Windows / packaged GUI 大曲庫卷軸驗收或 GitHub release readback。先執行 `git status -sb`、`git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`，SHA-256 請以 `docs/releases/0.1.33-checksums.md` 為準。重點驗證：一般主內容區滾輪會捲整個主視窗；播放清單區滾輪優先捲歌曲清單；兩個卷軸都只在內容超出時出現；沒有水平卷軸；底部內容與 Mini Player 不被裁切；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。

## 2026-07-05 Playlist Column Scroll Restore hotfix 0.1.32 完成

- 已完成 source 修正：左側主欄不再放 `playlist-scrollbar overflow-y-auto`；playlist 欄位高度恢復 0.1.28 的 `max-h-[calc(100vh-10rem)] min-h-[520px]`。
- `TrackList` 仍是唯一歌曲列表 scroll container，保留 visible-window + overscan；沒有新增套件、沒有重做清單、沒有改 metadata / cover / IndexedDB / playback。
- 已通過 source guards、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 0.1.32 installer 已同步到 `release-delivery/installers/`；`docs/releases/0.1.32-checksums.md` 已建立。Windows 真機與 packaged GUI 大曲庫滑動仍待補驗。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.32 Windows / packaged GUI 驗收或 GitHub release readback。先執行 `git status -sb`、`git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`，SHA-256 請以 `docs/releases/0.1.32-checksums.md` 為準。重點驗證：左側主欄不再有 playlist 捲軸、playlist 欄位高度回到 0.1.28、右側歌曲列表仍可捲動且保留 windowing、Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。

## 2026-07-05 Bounded Playlist Scroll hotfix 0.1.31 完成待提交

- 已完成 source 修正：app shell 固定 viewport，body 不負責播放清單 overflow；左欄必要時自己捲，右欄限制 overflow，`TrackList` 是唯一歌曲列表 scroll container。
- `PlaylistPanel` 移除 520px 最小高度；`TrackItem` 仍固定 80px；全部歌曲、自訂播放清單、搜尋結果與智慧播放清單共用同一套歌曲卡片。
- 已完成專案內技能拆分：播放器開發技能 `docs/skills/aquariusgirl-music-room-development.md`；GitHub 同步技能 `docs/skills/github-update-flow.md`。
- 已通過 source guards、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 0.1.31 installer 已同步到 `release-delivery/installers/`；`docs/releases/0.1.31-checksums.md` 已建立。Windows 真機與 100+ 首 packaged GUI 滑動仍待補驗。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.31 同步。先執行 `git status -sb`、`git diff --name-only`，不要 reset。全域 installed `build-music-player` 已把 GitHub 發布流程轉交給 `github-update-flow`；接著跑 final verification，最後才 commit / push / 讀回 GitHub。

## 2026-07-05 Playlist Edge Scrollbar hotfix 0.1.30 完成

- 已修正右側歌曲列表捲軸不夠明確、未貼近面板最外緣的 UI 回歸。
- 根因：0.1.29 補了右欄高度邊界，但 scrollbar 仍在 `TrackList` 內層並吃到右側 padding；`TrackList` 也仍用固定 520px 估算 viewport，沒有跟實際 flex scroll 高度連動。
- 修正：`TrackList` 改用原生 `ResizeObserver` 量測自己的可視高度，保留 visible-window + overscan；scroll container 加 `playlist-scrollbar`、`overflow-x-hidden`、`scrollbar-gutter: stable` 與 144px bottom safe space。`PlaylistPanel` 的 list wrapper 用 `-mr-3 pr-1` 讓捲軸靠近右側面板外緣；`TrackItem` 固定 80px 高度。
- 防回歸：`check:track-list-virtualization` 已補動態 viewport、bottom safe space、外緣捲軸、禁止水平捲軸、卡片高度與 CSS `scrollbar-gutter` 檢查。
- 驗收：`check:track-list-virtualization`、`npm run build`、`npm run electron:compile`、`check:metadata-save-loop`、`check:playback-restore`、`check:playback-order`、升權 `npm run dist:release` 通過。`dist:release` 內也通過 prompts、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.30`、CFBundleVersion `0.1.30`、Mach-O arm64、`app.asar` package version `0.1.30`、mac AI model / prompts / `darwin-arm64/llama-server` 存在。EXE static check 為 NSIS installer。
- 0.1.30 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.30.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.30-arm64.dmg
```

- SHA-256：EXE `0a5a3db85a22841b44421fc2d9a312ef298e561006af49c5dca832fd7f8a48ba`；DMG `82fc07094b8efb051dd76fcd310305e1c7281fe22e85e22a48acd6aa46339872`。根 README 不內嵌長 hash，請看 `docs/releases/0.1.30-checksums.md`。
- 驗收限制：本輪未在 Windows 真機安裝；未做 packaged GUI 真實大曲庫滑動與觸控板實測；macOS / Windows 仍未簽章。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.30 Windows / 大曲庫 GUI 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 請以 `docs/releases/0.1.30-checksums.md` 為準。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點驗證：右側歌曲列表捲軸位於清單最外緣、搜尋 / 排序 header 固定、左側播放器 / 視覺頻譜 / 睡眠定時不跟著捲、最後幾首歌不被 mini player 蓋住、沒有水平捲軸、大清單滑動仍只 render 可見窗口且順暢、Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-05 Playlist Edge Scrollbar Hotfix 0.1.30 Complete

- Moved the right song-list scrollbar close to the playlist panel's outer edge and kept search/sort fixed above the scrolling list.
- Kept the fix minimal: native scroll styling, dynamic TrackList viewport measurement, bottom safe space for the mini player, and fixed 80px cards.
- Latest installers are in `release-delivery/installers/`; SHA-256 lives in `docs/releases/0.1.30-checksums.md`.
- Passed source guards, build, package, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Real Windows QA, real large-library GUI scroll QA, signing, and notarization remain open.

## 2026-07-04 Playlist Scroll Bounds hotfix 0.1.29 完成

- 已修正右側播放清單卡片沒有內部捲軸、清單往底部播放器下方延伸的版面回歸。
- 根因：0.1.28 已有 `TrackList` visible-window render，但右側外層缺少穩定高度邊界；`App.tsx` 右側 wrapper 缺 `h-full min-h-0`，`PlaylistPanel` 舊 viewport max-height 不能跟左側睡前定時卡片切齊。
- 修正：`AppLayout` 右側 section 加 `lg:h-full`；`App.tsx` 右側 wrapper 改為 `flex h-full min-h-0 flex-col gap-4`；`PlaylistPanel` 改為 `overflow-hidden lg:min-h-0 lg:flex-1`，移除舊 viewport max-height。沒有新增套件、沒有重做清單。
- 防回歸：`check:track-list-virtualization` 擴充檢查右欄 full-height / min-height 邊界、`PlaylistPanel` flex scroll bounds、禁止回到舊 viewport max-height，同時保留 TrackList windowing 檢查。
- 驗收：`check:track-list-virtualization` 紅綠通過；`npm run build`、`npm run electron:compile`、升權 `npm run dist:release` 通過。dev browser 2048×1152 量測播放清單卡片 bottom 與睡前定時卡片 bottom 均為 `1542px`。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.29`、CFBundleVersion `0.1.29`、Mach-O arm64、`app.asar` package version `0.1.29`、mac AI model / prompts / `darwin-arm64/llama-server` 存在。EXE static check 為 NSIS installer。
- 0.1.29 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.29.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.29-arm64.dmg
```

- SHA-256：EXE `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`；DMG `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`。
- 驗收限制：本輪未在 Windows 真機安裝；dev browser 沒載入真實大曲庫，真實上萬首 GUI 滑動仍需用暫存資料與隔離 profile 補驗；macOS / Windows 仍未簽章。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.29 Windows / 大曲庫 GUI 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`、DMG `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點驗證：右側播放清單卡片底部與左側睡前定時卡片底部切齊；播放清單內部可捲動且底部播放器不被清單覆蓋；大清單滑動仍只 render 可見窗口並保持順暢；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-04 Playlist Scroll Bounds Hotfix 0.1.29 Complete

- Restored internal scrolling inside the right playlist card and aligned its bottom with the Sleep Timer card bottom.
- Root cause: TrackList had visible-window rendering, but the right column lacked a stable flex height boundary.
- Fix: right grid item gets desktop full height, right wrapper is `flex h-full min-h-0 flex-col`, and `PlaylistPanel` uses `overflow-hidden lg:min-h-0 lg:flex-1`.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`; DMG `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`.
- Passed source guards, browser layout measurement, build, package, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Real Windows QA, real large-library GUI scroll QA, signing, and notarization remain open.

## 2026-07-04 Kill Metadata Save Loop hotfix 0.1.28 完成

- 已停止 `tracks` 任意變動就整庫保存的迴圈。`recordTrackPlayback`、duration、歌曲資訊 / 封面保存不再觸發 `store.clear()` + put all。
- `src/storage/indexedDb.ts` 新增單曲 API：`putTrackMetadata`、`putManyTrackMetadata`、`patchTrackPlayback`、`patchTrackDuration`、`deleteTrackMetadata`、`replaceAllTrackMetadata`。`saveTrackMetadata()` 僅限整庫重建相容入口。
- `src/App.tsx` 啟動回灌 `applyStoredTrackMetadata` 同一次執行只做一次；執行中「儲存到播放器」會更新 tracks state 並 `await putTrackMetadata(savedTrack)`，不修改原始音樂檔；「套用到原始檔」會寫回原檔、重讀單曲，再 `await putTrackMetadata(reloadedTrack)`。
- 播放順序修正：`src/App.tsx` 會先依目前排序產生 `orderedPlaybackTracks` 再交給 `useAudioPlayer`；手動排序與檔名排序都照畫面由上到下播放，搜尋只篩選畫面，不縮短播放核心佇列。
- `TrackList` 改成只 render 可見窗口與 overscan，避免上萬首曲庫一次產生上萬個 DOM row。
- 新增 source-level regression scripts：`check:playback-order`、`check:track-list-virtualization`、`check:metadata-save-loop`、`check:no-track-save-loop`、`check:no-full-db-save-on-playback`、`check:cover-update-five-times`、`check:playlist-song-info-restart`、`check:no-audio-load-on-cover-only-update`；`check:playback-restore` 也防守「儲存到播放器」單曲保存流程。
- 追加 dev guard：重複 `applyStoredTrackMetadata`、播放中非預期 `readSongInfoFromOriginalFile`、同 track source 變動造成 `audio.load()` 都會 console warn，並由 `check:metadata-save-loop` 防回歸。
- 0.1.28 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.28.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.28-arm64.dmg
```

- SHA-256：EXE `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`；DMG `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`。
- 已通過 playback-order、track-list-virtualization、metadata-save-loop checks、playback-restore、song-info、track-display、track-identity、AI track search、FLAC metadata、prompt、AI assets、custom images、theme colors、build、Electron compile、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI model / prompts / runtime 檢查、Windows NSIS static check。
- 驗收限制：本輪未做 packaged GUI 壓力測試與 Windows 真機。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.28 packaged GUI / Windows 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`、DMG `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點驗證：手動排序與檔名排序播放都照目前歌曲清單由上到下；大清單滑動只 render 可見窗口且不卡；連續換同一首封面 5 次不卡；播放大型封面歌曲不全庫保存；播放清單中歌曲資訊 / 封面本機保存或原始檔寫回後強制重開仍顯示最新資料；封面更新不觸發同來源 `audio.load()`。使用暫存音樂複本與隔離 profile，不可打開或修改使用者原始 Music 資料夾。

## 2026-07-04 Kill Metadata Save Loop Hotfix 0.1.28 Complete

- Removed arbitrary `tracks` -> full-library saves and replaced playback / duration / song-info persistence with single-track writes.
- The song-info panel includes player-local save, which writes only global tracks plus IndexedDB and does not touch the original file.
- Playback now follows the current list order for manual and filename sorts.
- TrackList now renders only the visible window plus overscan for large libraries.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`; DMG `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`.
- Passed source guards, TrackList windowing check, build, package, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Packaged GUI stress QA and real Windows QA remain open.

## 2026-07-04 歌曲資訊面板二次寫回 hotfix 0.1.27 完成

- 已修正第一次封面 / 歌曲資訊寫回後，第二次開啟歌曲資訊面板可能因舊 draft / saving 狀態造成「套用到原始檔」無反應或按鈕狀態異常。
- 不採用清空整個 IndexedDB 或重掃整個音樂庫；本輪只收斂歌曲資訊面板狀態機與 App 寫回格式防線。
- `SongInfoPanel` 現在用 `trackDraftSnapshot` 從最新 track snapshot 初始化，關閉或成功後用 `resetDraftState()` 清 draft，`savingRef` 在 `finally` 一律重設；disabled reason 包含 no current track / saving / not desktop / no dirty fields / unsupported format。
- 0.1.27 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.27.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.27-arm64.dmg
```

- SHA-256：EXE `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`；DMG `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`。
- 已通過 playback-restore、song-info、track-display、track-identity、AI track search、FLAC metadata、prompt、AI assets、custom images、theme colors、build、Electron compile、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查、Windows NSIS static check。
- 驗收限制：本輪未做 packaged GUI 滑鼠流程與 Windows 真機；下一輪需用暫存音樂複本與隔離 profile 驗證第二次寫回、重開封面、播放清單、播放中不卡，以及 Windows fresh install / 4 GB 資料夾 / AI / Mini / 簽章。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.27 Windows / packaged GUI 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`、DMG `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。用暫存音樂複本與隔離 profile，驗證歌曲資訊面板第一次寫回後第二次開同一首或另一首換封面仍可按「套用到原始檔」，重開後封面不回舊圖、播放清單不掉歌、播放中 metadata / cover 更新不觸發同來源 `audio.load()` 卡頓。不要清整個 IndexedDB 當修法；文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-04 Song Info Second Writeback Hotfix 0.1.27 Complete

- Fixed the second song-info / cover writeback path by resetting panel draft and saving state from the latest track snapshot.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`; DMG `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`.
- Passed source checks, build, package, DMG verify, read-only DMG checks, and Windows NSIS static check. Packaged GUI mouse QA and real Windows QA remain open.

## 2026-07-03 單曲寫回後 DB 立即保存 hotfix 0.1.26 完成

- 已修正原始檔寫回成功後，播放器資料庫可能仍保留舊封面 / 舊 metadata，導致第一次重開看到舊 cover02、第二次才看到 cover01 的殘留問題。
- 不採用每次歌曲資訊更新就清空整個音樂資料庫；正確修法是只刷新被寫回的那一首，並等待該 track snapshot 寫入 IndexedDB。
- `replaceTrackSongInfo` 現在回傳更新後的 `Track`；`useMusicLibraryDb.saveTracksNow()` 會沿用保存 queue 立即保存指定 snapshot；App 端在顯示「已套用到原始檔」前會 `await libraryDb.saveTracksNow(...)`。
- 0.1.26 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.26.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.26-arm64.dmg
```

- SHA-256：EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`；DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。
- 已通過 playback-restore、真實 Plazma song-info / cover roundtrip、track-display、track-identity、AI track search、FLAC metadata、prompt、AI assets、custom images、theme colors、build、Electron compile、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查、Windows NSIS static check。
- GUI 驗收補做：已卸載 / 重新掛載 0.1.26 DMG，使用 `/private/tmp/aquariusgirl-0.1.26-mouse-profile` 隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本。Plazma 播放中 Cover 02 -> Cover 01 套用到原始檔成功；原始 FLAC 讀回為 Cover 01（data URL 長度 `5789911`，Cover 02 為 `1347951`）；切到 `02. BOW AND ARROW.flac` 再切回 `01. Plazma.flac` 仍會播放且不卡；重開同 profile 後 `0.1.26 Cover QA` 播放清單仍保留 Plazma。
- 驗收限制：macOS 原生對話框因 `/private/tmp` 隱藏路徑與無輔助使用權限無法完整滑鼠自動選檔，資料夾與封面檔選擇使用限制在暫存路徑的本機 harness；播放、編輯面板、套用確認、切歌、重開與播放清單觀察皆在 packaged app UI 完成。Windows 真機驗收、4 GB 資料夾與簽章仍需人工驗收。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.26 Windows / 大資料夾驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`、DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。macOS packaged 隔離 profile 已驗證 Plazma cover02 -> cover01 寫回、切歌再切回不卡、第一次重開仍保留 Cover 01、播放清單不掉歌；但 native dialog 選檔使用暫存 harness。下一步重點：Windows fresh install、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、AI、Mini/dialog focus、簽章。不要清整個曲庫當修法；0.1.26 正確方向是單曲寫回後 await IndexedDB 保存。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Single-Track Writeback Persistence Hotfix 0.1.26 Complete

- Fixed the remaining original-file writeback persistence race by awaiting the edited track snapshot save to IndexedDB before reporting success.
- 0.1.26 installers are in `release-delivery/installers/`.
- SHA-256: EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`; DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`.
- Passed source checks, build, package, DMG verify, read-only DMG checks, packaged macOS isolated cover-writeback / switch-track / restart / playlist QA, and Windows NSIS static check. Native macOS file-dialog selection used a temp-path harness; real Windows QA remains open.

## 2026-07-03 audio source 誤重載 hotfix 0.1.25 完成

- 已補完 0.1.24 同族殘留：播放中更換封面 / 歌曲資訊後，切到其他首再切回同一首仍可能短暫卡住。
- 根因：`useAudioPlayer` 用瀏覽器正規化後的 `audio.src` 回讀值比較原始 `currentTrackSource`，且 source effect 依賴 duration；metadata / duration 更新會誤觸 `audio.load()`。
- 修正：新增 `loadedTrackSourceRef`，只在 `currentTrackSource` 真的改變時重載 audio source；duration 更新不再重載音訊。
- 已補 `check:playback-restore` 防回歸，並用 Plazma 真實暫存複本跑 `Cover 02.jpg` -> `Cover 01.jpg` 寫回讀回。
- 最新 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.25.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.25-arm64.dmg
```

- SHA-256：EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`；DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。
- 已通過 playback-restore、track-display、track-identity、song-info 真實 Plazma cover roundtrip、AI track search、FLAC metadata、prompt、AI assets、custom images、theme colors、build、Electron compile、升權 `npm run dist:release`、DMG verify、Windows NSIS static check。
- Codex 沙盒拒絕直接啟動 Electron GUI，`hdiutil attach` / `imageinfo` 也因裝置權限與用量限制未完成；本輪不宣稱滑鼠實機操作或 DMG 唯讀掛載讀回 PASS。
- 技能更新原本曾被 `~/.codex/skills` 寫入用量限制擋住；已於 0.1.26 回合連同 0.1.26 lesson 補進 `build-music-player`。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.25 歷史驗收查核時使用。0.1.25 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`、DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。0.1.25 lesson 已於 0.1.26 回合補進 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Audio Source Reload Hotfix 0.1.25 Complete

- Fixed the remaining 0.1.24-family playback stall caused by same-source audio reloads.
- Root cause: browser-normalized `audio.src` was compared to raw `currentTrackSource`, and duration updates could rerun source loading.
- Fix: `loadedTrackSourceRef` records the assigned source and source loading depends only on `currentTrackSource`.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`; DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`.
- Passed source checks, build, package, DMG verify, and Windows NSIS static check. GUI mouse validation, DMG mount readback, real Windows QA, and signing remain open. The 0.1.25 skill-file lesson was later added during the 0.1.26 round.

## 2026-07-03 封面寫回播放卡頓 hotfix 0.1.24 完成

- 已修正播放中更換封面後，切到其他首再切回同一首會短暫卡住才播放。
- 已修正 cover02 -> cover01 後第一次重開仍看到舊封面、第二次重開才看到新封面的保存順序問題。
- 這不是全新問題，也不是 0.1.23 原 bug 復發；同屬 metadata / cover 寫回後狀態打架，本次精確路徑是 `mediaVersion` 造成 audio source 重載，以及 IndexedDB track metadata 保存順序競賽。
- 修正：`replaceTrackSongInfo` 不再為 metadata/cover-only 更新設定 `mediaVersion: Date.now()`；`useMusicLibraryDb` 以 `trackSaveQueueRef` 串接 save / clear，確保舊 cover save 不會晚於新 cover save 落地。
- 最新 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.24.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.24-arm64.dmg
```

- SHA-256：EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`；DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。
- 已通過 playback-restore、track-display、track-identity、song-info、AI track search、FLAC metadata、prompt、AI assets、custom images、theme colors、build、Electron compile、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查、Windows NSIS static check。
- Windows 真機尚未驗收：fresh install、播放中改封面後切歌再切回不卡、重開封面不回跳、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、歌曲資訊 / 封面寫回、AI、Mini 與 dialog focus。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.24 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`、DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、改封面後播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Cover Writeback Playback Hotfix 0.1.24 Complete

- Fixed playback stalling after cover writeback when switching away and back to the edited track.
- Fixed the first-restart-old-cover / second-restart-new-cover persistence race.
- Root cause: unnecessary metadata-only `mediaVersion` audio reload plus unordered IndexedDB track metadata saves.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`; DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`.
- Passed the full 0.1.24 source, build, package, DMG, and static EXE checks. Real Windows QA remains open.

## 2026-07-03 歌手欄位閃爍 hotfix 0.1.23 完成

- 已修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的閃爍。
- 這是舊版 metadata 來源打架的同族問題，但本次精確路徑是 `storedTracks` 同時作為開機舊資料與目前 `tracks` 即時鏡像，弱 metadata 可能回頭蓋掉已回灌的真實歌手。
- 修正：stored 文字欄位只有非空值才覆蓋目前 track 文字；套用任一 stored metadata 後標記 `metadataLoaded`，後續同 `sourcePath` 同步只更新 duration、playCount、lastPlayedAt 等播放統計。
- 已在 `check:playback-restore` 補防回歸檢查，確認不再直接 `artist: stored.artist`，而是保留較強的非空文字。
- 最新 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.23.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.23-arm64.dmg
```

- SHA-256：EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`；DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。
- 已通過 playback-restore、track-display、track-identity、song-info、AI track search、FLAC metadata、build、Electron compile、prompt、AI assets、custom images、theme colors、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / prompt / runtime 檢查、Windows NSIS static check。
- Windows 真機尚未驗收：fresh install、歌手欄位不再跳動、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、歌曲資訊 / 封面寫回、AI、Mini 與 dialog focus。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.23 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`、DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、歌手欄位不再在真實歌手與未知歌手之間跳動、播放不卡且暫停會停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、封面 cover02 -> cover01 可改回且播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Artist Flicker Hotfix 0.1.23 Complete

- Fixed artist field flicker between real artist text and `未知歌手`.
- Root cause: `storedTracks` acted as both startup snapshot and live `tracks` mirror, allowing weak metadata to overwrite restored real artist text.
- Fix: stored text only overwrites current text when non-empty; applying stored metadata marks the track metadata-loaded, so later same-source syncs update playback stats only.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`; DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`.
- Passed the full 0.1.23 source, build, package, DMG, and static EXE checks. Real Windows QA remains open.

## 2026-07-03 08:59 Cover 01 封面回改 hotfix 0.1.22 完成

- 已查明 `Cover 01.jpg` 是正常 JPEG/Exif，1500×1500、4,342,414 bytes，不是特殊壞圖。
- 根因是舊封面上限 3 MB；`Cover 02.jpg` 約 1 MB 可通過，`Cover 01.jpg` 被擋在預覽與保存之前。
- 已把 renderer 封面驗證與 Electron writer data URL 解碼上限同步調整為 5 MB。
- 已新增明確提示：超過上限顯示「封面圖片太大，請選擇 5 MB 以內的 JPG / PNG」；格式錯誤只提示 JPG / PNG。
- 已用真實 `01. Plazma.flac` 暫存複本驗證 `Cover 02.jpg` -> `Cover 01.jpg` 寫回 / 讀回，PASS；原始檔未修改。
- 0.1.22 歷史 installer 位於當時輸出：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.22.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.22-arm64.dmg
```

- SHA-256：EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`；DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。
- 已通過 song-info、真實 FLAC cover02 -> cover01 roundtrip、track-display、track-identity、playback-restore、AI track search、FLAC metadata、build、prompt、AI assets、custom images、theme colors、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / prompt / runtime 檢查、Windows NSIS static check。
- Windows 真機尚未驗收：fresh install、`Cover 02.jpg` -> `Cover 01.jpg`、大於 3 MB 且小於 5 MB 的 JPG 封面預覽 / 寫回、超過 5 MB 圖片提示、播放/暫停、4 GB / 20+ 首資料夾、AI、Mini 與 dialog focus。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.22 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`、DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、米津玄師 `Cover 02.jpg` 可改回 `Cover 01.jpg`、大於 3 MB 且小於 5 MB 的 JPG 會預覽並可保存、超過 5 MB 的圖片會明確提示過大、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 08:59 Cover 01 Cover Revert Hotfix 0.1.22 Complete

- Root cause: `Cover 01.jpg` is a valid JPEG/Exif image, 1500x1500 and 4,342,414 bytes; the old 3 MB cover limit blocked it before preview/writeback.
- Renderer validation and Electron writer cover decode now allow up to 5 MB.
- Oversized images now show a specific 5 MB too-large message.
- A real `01. Plazma.flac` temp copy passed `Cover 02.jpg` -> `Cover 01.jpg` write/read validation.
- 0.1.22 historical installers were in `release-delivery/installers/` at release time.
- SHA-256: EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`; DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`.
- Real Windows QA remains open.

## 2026-07-02 23:50 顯示、封面與啟動效能 hotfix 0.1.21 完成

- 已修正歌曲顯示排序：目前播放卡與歌曲列表第一行優先檔名、沒有檔名才用歌曲標題；第二行顯示歌手。
- 已修正封面寫回後播放清單下次重開掉歌：Electron 本機 track id 改以穩定 `sourcePath` 為主，不再把 mtime / size 放進主要 id。
- 已加入播放清單 id remap：載入曲庫後會依保存的 `sourcePath` 將舊 playlist track id 對應到目前 track id。
- 已驗證封面 cover02 -> cover01 能改回：真 MP3 fixture 暫存複本先寫 cover02、讀回，再寫 cover01、讀回，PASS；原始 fixture 未被修改。
- 已縮短啟動恢復：`restore-music-paths` 跳過逐首 taglib metadata / cover 讀取，先用 IndexedDB 保存的 metadata 還原。
- 已讓 AI 助手建立播放清單時顯示等待提示，並暫時停用輸入與建立按鈕。
- 已新增 `check:track-display`、`check:track-identity` 並納入 release 前置檢查。
- 最新 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.21.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.21-arm64.dmg
```

- SHA-256：EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`；DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。
- 已通過 track-display、track-identity、playback-restore、song-info、真 MP3 cover02 -> cover01 fixture roundtrip、AI track search、FLAC metadata、build、prompt、AI assets、custom images、theme colors、Electron compile、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / prompt / runtime 檢查、Windows NSIS static check。
- Windows 真機尚未驗收：fresh install、播放/暫停、99 首以上曲庫、4 GB / 20+ 首資料夾、封面 cover02 -> cover01 實機寫回、改封面後重開播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.21 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`、DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放不卡、播放後按暫停會停止、畫面不閃爍、歌曲第一行優先顯示檔名且第二行顯示歌手、選擇新資料夾後重開會恢復最後來源、99 首與更大曲庫載入速度、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、封面 cover02 -> cover01 能改回、改封面後重開播放清單不掉歌、AI 建歌單期間會提示等待且不可連續送出、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 23:50 Display, Cover, and Startup Performance Hotfix 0.1.21 Complete

- Fixed track display order: filename first, title fallback, artist on the second line.
- Fixed playlist loss after cover writeback by using stable `sourcePath` for Electron local track ids instead of mtime / size.
- Added playlist id remapping through stored `sourcePath`.
- Verified cover02 -> cover01 with a real MP3 fixture temp copy.
- Startup restore now skips per-file taglib metadata / cover reads and restores from IndexedDB metadata first.
- AI playlist creation now shows a waiting status and disables input / create controls while busy.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`; DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`.
- Passed the full 0.1.21 source, build, package, DMG, and static EXE checks. Real Windows QA remains open.

### Prompt for Next Codex Session

Continue real Windows QA for Aquariusgirl Music Room 0.1.21. Latest installers are in `release-delivery/installers/`; expected SHA-256 values are EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5` and DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`. First read `release-delivery/QA_REPORT.md`, `release-delivery/INSTALLER_STATUS.md`, and `release-delivery/KNOWN_ISSUES.md`. On Windows, install the EXE and verify fresh install, playback/pause, no flashing, filename-first display with artist second, latest-folder restore after restart, 99+ track and larger library startup, a roughly 4 GB / 20+ song folder, song-info writeback, cover02 -> cover01 writeback, playlist persistence after cover changes, AI busy-state UX, Mini, and dialog focus. Do not modify installers unless source, resources, version, or packaging settings actually change. Documentation updates must append new records without deleting old history.

## 2026-07-02 19:25 播放與資料夾恢復 hotfix 0.1.20 完成

- 已修正播放音樂很卡、播放後按暫停沒有停下，以及畫面播放狀態閃爍。
- 根因：`useAudioPlayer` 的 source effect 依賴整個 `currentTrack`，duration、playCount 或 metadata 更新會讓 track object 變動，進而重設 `audio.src` / `audio.load()` 並再次 `audio.play()`。
- 修法：新增穩定 `currentTrackSource`，只有 `localUrl` / `mediaVersion` 改變才重設 source；play/pause 改由獨立 effect 同步，暫停時明確呼叫 `audio.pause()`。
- 已修正新資料夾恢復：Electron 手動選資料夾後，將該次 `sourcePath[]` 寫入既有 IndexedDB settings；下次啟動 auto-restore 優先用最後手動選擇，沒有才退回 tracks metadata。
- 空 selection 不覆蓋最後來源，避免取消選擇或空資料夾清掉上次成功選擇。
- 已新增 `scripts/playback-restore-check.mjs`、`npm run check:playback-restore`，並納入 `dist:release` / `dist:mac` / `dist:win`。
- 最新 installer 位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.20.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.20-arm64.dmg
```

- SHA-256：EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`；DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。
- 已通過 `npm run check:playback-restore`、`npm run check:song-info`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、Windows NSIS static check。
- DMG 唯讀掛載版本 / arm64 讀回本輪因使用限制未完成；Windows 真機播放/暫停、最新資料夾恢復、4 GB / 20+ 首資料夾與 AI 操作仍需人工驗收。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.20 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`、DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放不卡、播放後按暫停會停止、畫面不閃爍、選擇新資料夾後重開會恢復最後選擇的來源清單、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、AI 聊天 / AI 建歌單、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 19:25 Playback and Folder Restore Hotfix 0.1.20 Complete

- Fixed playback stutter, unreliable pause, and flashing playback state.
- Root cause: the source effect in `useAudioPlayer` depended on the whole `currentTrack`, so duration, play-count, or metadata updates could reset `audio.src` / `audio.load()` and call `audio.play()` again.
- Fix: stable `currentTrackSource`; source resets only on `localUrl` / `mediaVersion` changes. Play/pause sync is separate and explicitly pauses when `isPlaying` is false.
- Electron folder selection now saves the latest selected `sourcePath[]` into the existing IndexedDB settings store; auto-restore prefers that latest manual selection before falling back to track metadata.
- Empty selection results no longer overwrite the latest source list.
- Added `scripts/playback-restore-check.mjs`, `npm run check:playback-restore`, and release-script wiring.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`; DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`.
- Passed playback-restore, song-info, FLAC metadata, build, Electron compile, elevated `dist:release`, DMG verify, and Windows NSIS static check.
- Still open: DMG read-only mount version / arm64 readback, real Windows playback/pause, latest-folder restore, large-folder load, song-info writeback, AI operation, Mini, and dialog focus.

## 2026-07-02 18:55 歌曲資訊寫回 hotfix 0.1.19 完成

- 已移除「保存到播放器」，只保留「套用到原始檔」，避免播放器 metadata 與原始檔 metadata 互相打架。
- 已移除目前播放卡更多選單內重複的「更換專輯封面」；封面改由「編輯歌曲資訊」面板內更換。
- 已修正歌曲資訊保存後重複讀取 / 跳動：表單只因 track id 改變重置，寫回成功後重新讀原始檔 metadata，並清除 metadata override。
- 已修正大型資料夾載入風險：Electron 不再把音檔本體 `ArrayBuffer` 傳進 renderer；改用 `file://`、source path、真實 size、mtime、relative path 與必要 metadata。
- 原始檔寫回改用 `TagLib.copyWithTags(source, temp, tags)` 同副檔名暫存檔流程；真 MP3 fixture 複本寫回 / 讀回 PASS。
- 已把測試失敗教訓寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。
- 0.1.19 hotfix installer（歷史）位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg
```

- SHA-256：EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`；DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`。
- 已通過 `npm run check:song-info`、真 MP3 fixture `SONG_INFO_FIXTURE_PATH=... npm run check:song-info`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 檢查、Windows NSIS static check。
- 仍需 Windows 真機驗收：fresh install、選擇約 4 GB / 20+ 首資料夾、播放、歌曲資訊寫回、封面寫回、AI 聊天 / AI 建歌單、Mini 與 dialog focus。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.19 hotfix 的 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`、DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、選擇約 4 GB / 20+ 首音樂資料夾不閃退、播放、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、封面寫回、AI 聊天、AI 隨機歌單、關鍵字歌單、找不到不補歌、模型不得列歌、歌單 / AI 助手分頁、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 18:55 Song Info Writeback Hotfix 0.1.19 Complete

- Removed player-local song-info saving and kept original-file writeback as the only save path.
- Removed the duplicate current-track More-menu cover button; cover changes now live in the song info editor.
- Fixed the repeated reload / jumping path by resetting the form only on track id changes, reloading original-file metadata after writeback, and clearing metadata override.
- Electron no longer sends audio `ArrayBuffer`s through IPC during file/folder selection; it returns `file://`, source path, real size, mtime, relative path, and metadata.
- Original-file writeback now uses `TagLib.copyWithTags(source, temp, tags)` with a same-extension temp file. A real MP3 fixture copy write/read check passed.
- Added the failed-test lesson to `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`; DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`.
- Passed song-info checks, real MP3 fixture write/read, FLAC metadata, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 checks, and Windows NSIS static check.
- Still open: real Windows install, selecting a roughly 4 GB / 20+ song folder, playback, original-file song info / cover writeback, AI operation, Mini, and dialog focus.

### Prompt for Next Codex Session

Continue real Windows QA for the Aquariusgirl Music Room 0.1.19 hotfix. Latest installers are in `release-delivery/installers/`; expected SHA-256 values are EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc` and DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`. First read `release-delivery/QA_REPORT.md`, `release-delivery/INSTALLER_STATUS.md`, and `release-delivery/KNOWN_ISSUES.md`. On Windows, install the EXE and verify fresh install, selecting a roughly 4 GB / 20+ song folder without crashing, playback, song info editing, MP3/FLAC/M4A original-file writeback, cover writeback, AI chat, AI random playlist, keyword playlist, no fake songs on no match, no model-generated song lists, playlist / AI Assistant tabs, Mini, and dialog focus. Do not modify installers unless source, resources, version, or packaging settings actually change. Documentation updates must append new records without deleting old history.

## 2026-07-02 歌曲資訊與原始檔標籤寫回 0.1.19 完成

- 已從 0.1.18 接續升版到 0.1.19。
- 已新增目前播放卡「更多」選單、歌曲資訊面板、單曲封面更換、重新讀取音樂標籤、顯示原始檔位置，以及桌面版 MP3/FLAC/M4A 原始檔 metadata / cover 寫回。
- 原始檔寫回使用 `taglib-wasm`，寫回前要求確認；失敗時回報原始檔未修改。Electron 版重新讀取會由主程序直接讀原始檔標籤，避免 FLAC/M4A 顯示不同步。
- 已完成 `check:song-info`、prompt / AI assets / all-target AI assets / AI track search / playlist / FLAC / custom images / theme colors / build / Electron compile / 升權 `npm run dist:release` / DMG verify / packaged static checks。
- 0.1.19 初版 installer（歷史）位於：

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg
```

- SHA-256：EXE `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`；DMG `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`。
- `release/` 暫存輸出已移除，唯一交付位置仍是 `release-delivery/installers/`。
- Windows 真機尚未安裝驗證 fresh install、播放、歌曲資訊編輯、原始檔寫回與 AI 操作；正式簽章 / notarization 仍未設定。
- 後續更新本資料夾與根目錄 MD 時，只能追加新版紀錄，不可刪除舊版歷史。

### 接續給下一輪 Codex

請接續 Aquariusgirl Music Room 0.1.19 初版的歷史 Windows 真機驗收紀錄；實際最新版請以上方 hotfix 段落為準。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md` 與 `release-delivery/KNOWN_ISSUES.md`。

## 2026-07-02 Song Info and Original Tag Writeback 0.1.19 Complete

- Continued from 0.1.18 and bumped the app to 0.1.19.
- Added the current-track More menu, song info panel, per-track cover changes, metadata reload, show original file location, and desktop MP3/FLAC/M4A original metadata / cover writeback.
- Original-file writeback uses `taglib-wasm`, requires confirmation, and reports that the original file was not modified on failure. Electron reloads metadata from the original file to keep FLAC/M4A in sync.
- Completed song-info, prompt, AI assets, all-target AI assets, AI track search, playlist, FLAC, custom images, theme colors, build, Electron compile, elevated `npm run dist:release`, DMG verify, and packaged static checks.
- 0.1.19 initial installers (historical):

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg
```

- SHA-256: EXE `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`; DMG `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`.
- The temporary `release/` output was removed; `release-delivery/installers/` remains the only delivery location.
- Real Windows install, playback, song info editing, original-file writeback, and AI operation are still open. Signing/notarization are still not configured.
- Future updates to this folder and root MD files must append new version records without deleting old history.

### Prompt for Next Codex Session

Continue the historical Windows QA record for the initial Aquariusgirl Music Room 0.1.19 build; use the hotfix section above as the real latest state. First read `release-delivery/QA_REPORT.md`, `release-delivery/INSTALLER_STATUS.md`, and `release-delivery/KNOWN_ISSUES.md`.

## 2026-06-29 AI schema / Result Guard 0.1.18 完成

- 已從 0.1.17 main 接續升版到 0.1.18。
- 已補強三份 prompt、router JSON schema、工具任務 summary-only、Result Guard、safe reply fallback、本次 candidates trackId 驗證與「模型不得列歌」顯示前 sanitize。
- AI 聊天室不再顯示候選歌曲 title；歌曲清單仍由播放清單 UI 根據 `playlist.trackIds` 顯示。
- 模型設定仍集中於 `electron/ai/aiModelConfig.ts`；`check-ai-assets` 已改讀同一份設定。
- 已完成驗收：prompt / AI assets / all-target AI assets / AI track search schema / playlist / Mini / FLAC / custom images / theme colors / build / Electron compile / `dist:release` / DMG verify / packaged version-architecture-prompt-runtime static checks。
- 最新 installer 已同步到 `release-delivery/installers/`，暫存 `release/` 不存在。

## 2026-06-29 AI schema / Result Guard 0.1.18 Complete

- Continued from 0.1.17 main and bumped the app to 0.1.18.
- Strengthened the three prompts, router JSON schema, summary-only tool tasks, Result Guard, safe reply fallback, candidate trackId validation, and display-time sanitization so the model cannot list songs.
- The AI chat no longer shows candidate track titles; song lists remain rendered by the playlist UI from `playlist.trackIds`.
- Model settings remain centralized in `electron/ai/aiModelConfig.ts`; `check-ai-assets` now reads that same config.
- Passed prompt, AI assets, all-target AI assets, AI track search schema, playlist, Mini, FLAC, custom images, theme colors, build, Electron compile, `dist:release`, DMG verify, and packaged static checks.
- Latest installers are synced to `release-delivery/installers/`; temporary `release/` does not exist.

## 2026-06-29 GitHub main 合併 0.1.17 完成

- 已合併 `codex/ai-harness-0.1.17` 到 `main`，使 GitHub main source、`package.json`、AI harness、prompt、runtime checks 與 workflow 更新到 0.1.17。
- README 與 release-delivery 文件衝突已保留 main 較新的中英版本。
- 已完成合併後驗收：prompt / AI assets / AI track search / playlist / Mini / FLAC / custom images / theme colors / build / Electron compile 均通過。
- 大模型與 installers 仍不進 Git；若之後 source、資源、版本或打包設定再改，才重新驗收並重打 installer。

## 2026-06-29 GitHub main 0.1.17 Merge Complete

- Merged `codex/ai-harness-0.1.17` into `main`, updating GitHub main source, `package.json`, AI harness, prompts, runtime checks, and workflow to 0.1.17.
- README and release-delivery conflicts were resolved by keeping the newer bilingual main docs.
- Post-merge validation passed for prompts, AI assets, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, build, and Electron compile.
- The large model and installers remain out of Git. Rebuild installers only if source, resources, version, or packaging settings change again.

## 2026-06-29 GitHub main 內容盤點（合併前記錄）

- 根 `CONTINUE_WORK.md` 已補上 2026-06-29 GitHub 內容盤點，標明合併前 `main` 程式碼是 0.1.15，而 0.1.17 程式變更位於 `codex/ai-harness-0.1.17`。
- 後續已合併 `codex/ai-harness-0.1.17` 到 `main`，並保留 `main` 較新的 README / release-delivery 文件。
- 本次只更新文件，不重打 installer；若合併後 source、資源、版本或打包設定與既有 installer 不一致，才重新驗收與打包。

## 2026-06-29 GitHub main Content Audit (Pre-Merge Record)

- Root `CONTINUE_WORK.md` records the pre-merge GitHub content audit: `main` source was still at 0.1.15, while 0.1.17 source changes were on `codex/ai-harness-0.1.17`.
- `codex/ai-harness-0.1.17` has since been merged into `main` while keeping the newer README / release-delivery docs from `main`.
- This pass only updates docs and does not rebuild installers. Rebuild only if the later source/resource/version/packaging merge makes the existing installers stale.

## 0.1.17 AI harness、開源 prompt 與雙平台發行完成

- 版本更新為 0.1.17；小模型只做 intent JSON 與短回覆潤飾，本機搜尋、隨機歌單、建立歌單、加入歌單與移除安全提示由播放器程式執行。
- Prompt 改為三份開源文字檔：`character_prompt.txt`、`ai_router_prompt.txt`、`ai_reply_prompt.txt`；不再使用 secure prompt service、加密 prompt bundle 或 `.bin` prompt。
- 打包目標收斂為 Windows x64 NSIS EXE 與 macOS Apple Silicon DMG；0.1.17 不再產 macOS x64 DMG。
- 已通過 `check:prompts`、AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、all-target AI assets、build、Electron compile。
- 一般沙盒 `npm run dist:release` 在 macOS `hdiutil create` 失敗；升權重跑同一命令後成功，並同步兩個 installer 到 `release-delivery/installers/`。
- DMG verify VALID；唯讀掛載後版本為 0.1.17、Mach-O arm64、只保留 `darwin-arm64/llama-server`、三份 prompt `.txt`，無 prompt `.bin`。
- Windows EXE 只做 NSIS / x64 static check，尚未 Windows 真機安裝。

## 0.1.16 AI 播放清單真實歌曲與歌單區分頁完成

- AI 建歌單只能使用目前已載入 / 已索引的真實本機歌曲，不讓模型幻想歌曲、歌手或路徑。
- 隨機需求從目前 tracks 抽樣；關鍵字需求先查 title、artist、album、genre、filename/name，並支援別名與 mood scoring。
- 找不到歌曲時回覆找不到，不建立空歌單或假歌單。
- AI 助手移入右側歌單卡，以「歌單 / AI 助手」分頁切換；未新增 embedding 或向量資料庫。
- 版本來源同步問題已納入驗收：package、lock、export payload、packaged app、installer SHA 與 release 文件都要一致。

## 0.1.18 歷史 installer

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.18.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.18-arm64.dmg
```

修改時間：2026-06-29 15:10:08-15:10:09 CST

## SHA-256

- EXE：`e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`
- arm64 DMG：`0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`

## 仍需人工驗收

- 在 Windows 真機安裝 0.1.18 EXE，確認 fresh install、啟動、選擇本機音樂資料夾、AI 聊天與 AI 建歌單。
- 在 Windows 真機確認歌單 / AI 助手分頁、Mini、dialog focus、播放清單新增 / 加入 / 移除流程。
- 正式公開前補 Apple Developer ID、notarization 與 Windows code signing。
- 若 0.1.18 source / resource / version / packaging 之後再改，必須重跑 `npm run dist:release` 並重算 SHA。

## 下次接續提示詞

請接續 Aquariusgirl Music Room 0.1.18 的 Windows 真機驗收。0.1.18 發行當時的 installer 位於 `release-delivery/installers/`，包含 `Aquariusgirl Music Room Setup 0.1.18.exe` 與 `Aquariusgirl Music Room-0.1.18-arm64.dmg`；目前資料夾只保留最新版。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md` 與 `release-delivery/KNOWN_ISSUES.md`；Windows 先安裝 EXE，確認 fresh install、選擇音樂資料夾、AI 聊天、AI 隨機歌單、關鍵字歌單、找不到不補歌、模型不得列歌、歌單 / AI 助手分頁、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。

---

# Continuation Status

Last updated: 2026-06-29 CST

## 0.1.17 AI Harness, Open Prompts, and Two-Platform Release Complete

- Version 0.1.17 is complete. The small model only routes intent JSON and polishes short replies; app code handles local search, random playlists, playlist creation, playlist insertion, and safe removal guidance.
- Prompts are now three open text files: `character_prompt.txt`, `ai_router_prompt.txt`, and `ai_reply_prompt.txt`. Secure prompt service, encrypted prompt bundles, and prompt `.bin` files were removed.
- Release targets are Windows x64 NSIS EXE and macOS Apple Silicon DMG. 0.1.17 no longer builds a macOS x64 DMG.
- Passed checks: `check:prompts`, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, all-target AI assets, build, and Electron compile.
- Plain sandbox packaging failed at macOS `hdiutil create`; rerunning the same `npm run dist:release` command with elevated permission succeeded.
- DMG verify is VALID. Read-only mount confirmed version 0.1.17, Mach-O arm64, only `darwin-arm64/llama-server`, three prompt `.txt` files, and no prompt `.bin`.
- Windows EXE has only NSIS / x64 static checks; real Windows installation is still open.

## 0.1.16 AI Playlists and Playlist-Card Tabs Complete

- AI playlist creation only uses real loaded or indexed local tracks. The model may not invent songs, artists, or paths.
- Random requests sample from current tracks. Keyword requests search title, artist, album, genre, filename/name, aliases, and mood terms.
- Missing matches report no match instead of creating empty or fake playlists.
- The AI assistant moved into the playlist card as `Playlists / AI Assistant` tabs. No embedding model or vector database was added.
- Version-source synchronization is now part of validation: package, lockfile, export payload, packaged app, installer SHA, and release docs must agree.

## 0.1.18 Historical Installers

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.18.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.18-arm64.dmg
```

Modified: 2026-06-29 15:10:08-15:10:09 CST

## SHA-256

- EXE: `e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`
- arm64 DMG: `0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`

## Manual QA Still Needed

- Install the 0.1.18 EXE on a real Windows machine and verify fresh install, launch, local music folder selection, AI chat, and AI playlist creation.
- On Windows, verify playlist / AI Assistant tabs, Mini, dialog focus, playlist creation, playlist insertion, and playlist removal.
- Add Apple Developer ID, notarization, and Windows code signing before public release.
- If 0.1.18 source, resources, version, or packaging settings change again, rerun `npm run dist:release` and recalculate SHA hashes.

## Next Continuation Prompt

Continue Windows real-machine QA for Aquariusgirl Music Room 0.1.18. At the time of the 0.1.18 release, its installers were in `release-delivery/installers/`: `Aquariusgirl Music Room Setup 0.1.18.exe` and `Aquariusgirl Music Room-0.1.18-arm64.dmg`; the folder now keeps only the latest release. First read `release-delivery/QA_REPORT.md`, `release-delivery/INSTALLER_STATUS.md`, and `release-delivery/KNOWN_ISSUES.md`. On Windows, install the EXE and verify fresh install, music folder selection, AI chat, AI random playlist, keyword playlist, no fake songs on no match, no model-generated song lists, playlist / AI Assistant tabs, Mini, and dialog focus. Do not modify installers unless source, resources, version, or packaging settings actually change.
