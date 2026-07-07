# QA 驗收報告

產品：Aquariusgirl Music Room / 水瓶罐子的音樂小水池
版本：0.1.44
日期：2026-07-07
驗收角色：PM / QA / Electron 發行工程師

## 2026-07-07 Confirm Focus Lock / Toast Position hotfix 0.1.44

- 範圍：Windows EXE 使用者實測回報 — 更換歌曲封面成功後，playlist 排序按鈕點不開、playlist 搜尋歌手輸入框與 AI 助手輸入框點了沒反應（一般按鈕仍可按，以前疑似發生過）。另要求：右上角提示移到不被遮擋的位置（建議左上切齊主視窗上緣）、排序按鈕 hover 要像我的最愛按鈕有變色反饋、保存成功 / 失敗都必須跳提示。
- 根因（依 Electron 已知問題與症狀比對判定；Windows 專屬、macOS / Linux 無法重現）：套用到原始檔前的 `window.confirm()` 原生同步確認窗。Electron 在 Windows 上 `window.confirm` / `window.alert` 關閉後 webContents 鍵盤焦點壞掉——原生 `<select>` 下拉打不開、文字輸入框無法取得焦點、一般 button click 正常。與回報症狀完全吻合：排序是原生 select（0.1.38 起）、搜尋歌手與 AI 助手是 text input、可以按套用按鈕走完保存流程。專案技能筆記亦有既往紀錄「Windows 確認流程要用 renderer modal，不用 window.confirm 後搶焦點」。
- 修法（零新套件、不清 IndexedDB、不改 DB schema、不動寫回與 readback hash 路徑）：新增 `src/components/ConfirmDialog.tsx`（renderer 確認窗；取消鈕 autoFocus、Esc 關閉、backdrop 點擊取消、z-[85] 介於面板 z-[80] 與 toast z-[90] 之間），取代全專案 4 處 `window.confirm`：SongInfoPanel「套用到原始檔」與「放棄修改」、App「重新讀取音樂標籤」與「匯入備份合併」（匯入取消時維持原「已取消匯入」提示）。`electron/main.ts` 新增 `showOpenDialogWithFocusRestore()`：選音樂檔 / 選音樂資料夾 / 選自訂圖片 3 個原生 dialog 掛 parent window、關閉後補 `webContents.focus()`。`MessageToast` 移到左上 `left-4 top-12`（切齊桌面版標題列 h-9 下緣）加 `pointer-events-none`。`SortControls` 加 cursor-pointer 與 `hover:border-aquarius-blue/50 hover:bg-aquarius-blue/[0.15] hover:text-white`（對齊 IconButton glass hover）。
- PASS（Linux 沙盒）：`tsc --noEmit`、`npm run electron:compile`、`check:prompts`、`check:track-display`、`check:track-identity`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:metadata-save-loop`、`check:playback-restore`、`check:taglib-wasm-packaging`、`check:song-info`（含 writer 真實 wasm roundtrip）、`electron-selected-file-check`、`ai-track-search-check`。
- PASS：rg 掃描 `src/` 與 `electron/` 無 `window.confirm(` / `window.alert(` 殘留（僅註解提及）；`ConfirmDialog` 4 個呼叫點與 `showOpenDialogWithFocusRestore` 3 個 dialog 全部接上。
- PASS：保存提示逐路徑核對——成功「已套用到原始檔」；失敗分支（非桌面版、格式不支援、封面資料不完整、寫回失敗、readback 失敗、readback hash 不一致、IndexedDB 保存失敗、exception、panel catch）全部有紅色錯誤提示。
- PASS：防回歸 guard——`scripts/song-info-check.mjs` 禁止 `src/App.tsx` / `src/components/SongInfoPanel.tsx` 出現 `window.confirm(` / `window.alert(`。
- installer 已產出（`打包發行.command` / `npm run dist:release`）：
- `Aquariusgirl Music Room Setup 0.1.44.exe`：667,667,973 bytes，SHA-256 `c0fb27123611c9b1d98902bd13daf9981ee41d65e3fa8b328ae8d2a220a20a27`
- `Aquariusgirl Music Room-0.1.44-arm64.dmg`：684,759,938 bytes，SHA-256 `f086700f1c129883547cfb88fa2a211329c4262c4dbedadae9440d50c1601779`
- PASS：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.44、執行檔 Mach-O 64-bit arm64、`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在（證據：`qa-temp/version-readback-0.1.44.txt`）；EXE static check 為 PE32 Nullsoft NSIS installer；打包時 `dist:release` 內全部 check 與 vite build 再次通過（build exit=0）。
- NOT VERIFIED：Windows 真機（confirm 焦點行為只在 Windows 發生，修法屬 Electron 已知問題標準解法，需使用者實測回報）；packaged GUI 滑鼠驗收（本輪依使用者要求以後台驗證取代）；簽章 / notarization。
- 殘餘風險（已記錄於 KNOWN_ISSUES）：若 Windows 真機在封面「選檔後、按套用前」就鎖死，剩餘嫌疑為 `<input type="file">` 的 Chromium 原生選檔窗，升級路徑是封面選檔改走 Electron IPC dialog（可直接沿用本版 focus restore）。

## 2026-07-07 Big Cover Readback Crash / Save Feedback hotfix 0.1.43

- 範圍：macOS DMG 使用者實測回報 — MP3 用 320KB `cover 01.jpeg` 換封面成功；改用 4.3MB `Cover 01.jpg` 保存後卡住、「重新讀取音樂標籤」一直失敗；Finder 顯示新封面、播放器仍舊圖。另要求保存成功/失敗都必須跳出提示。
- 根因 1（PASS，Linux 沙盒以打包版 wasm 設定 100% 重現）：taglib-wasm 預設 partial read（前 1MB + 尾 128KB）在寫入 4.3MB 封面後截斷約 4.3MB 的 ID3v2 標籤區，packaged Emscripten TagLib 解析截斷 buffer 時 WASM `RuntimeError: unreachable`（`isValid()` 仍回 true、崩潰在 properties / getPictures / dispose），非 `InvalidFormatError`，0.1.41 的 retry 接不到；寫回成功但 readback / reload 永遠失敗。與 .jpg / .jpeg 副檔名無關。
- 根因 2（PASS）：`MessageToast` z-[60] 低於歌曲資訊面板 overlay z-[80]，保存失敗時面板不關、錯誤提示被蓋住，使用者感覺「卡住、無提示」。
- 修法：`readSongInfoFromOriginalFile(sourcePath, { partialRead })` 預設完整讀取（單檔 user-initiated：寫前預讀 / readback / 重新讀取）；partial 路徑任何錯誤（含 WASM RuntimeError）fallback 一次 `partial:false`；`readPicturesSafely` 遇 `WebAssembly.RuntimeError` rethrow 交給 fallback；`electron/selectedFile.ts` 掃描明確走 `partialRead: true`（上萬首效能不變）；`MessageToast` 升 z-[90]；`SongInfoPanel` 保存中顯示「套用中…」。4 檔案約 40 行、零新套件、不清 IndexedDB、不改 DB schema、不動寫回與 readback hash 路徑。
- PASS（Linux 沙盒，打包版 wasm 設定 `forceWasmType: "emscripten"` + buffer 模式）：修正前重現 BIG(4.3MB) 讀回 `RuntimeError: unreachable`；修正後 SMALL(320KB) 與 BIG(4.3MB) 寫入＋讀回 coverHash 全數一致；崩潰後同一 TagLib 實例仍可用（無需重啟）。
- PASS：掃描路徑 `readSongInfoFromOriginalFile({ partialRead: true })` 與 `toSelectedFile` 對大封面檔 fallback 完整讀取後 metadata 與封面正確。
- PASS：`check:song-info`（含 writer 真實 wasm roundtrip）、`check:metadata-save-loop`、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`check:taglib-wasm-packaging`、`check:ai-assets`、`tsc --noEmit`、`npm run electron:compile`；Mac 本機 `dist:release` 內全部 check 與 vite build 再次通過。
- installer 已產出（`打包發行.command` / `npm run dist:release` exit=0，DMG hdiutil verify VALID）：
- `Aquariusgirl Music Room Setup 0.1.43.exe`：667,667,342 bytes，SHA-256 `2be0007e5f8869bc253818ab24cc57705ce90b13306d0161a77cb27e41cebd36`
- `Aquariusgirl Music Room-0.1.43-arm64.dmg`：684,779,166 bytes，SHA-256 `c6da0dba496ee3f9d607e1e3727689ac8bb70e3a15bff2ec3b8de06ee8120cc0`
- NOT VERIFIED：packaged GUI 對使用者實際 nonoc-Memento 檔案的滑鼠實測（本輪修復驗證在 Linux 沙盒以同等 wasm 設定完成）；Windows 真機；簽章 / notarization。
- 殘餘風險（已知並記錄於 KNOWN_ISSUES）：掃描 partial 路徑理論上存在「不崩潰但漏圖」情境（實測觀察皆為崩潰、已被 fallback 接住）；單檔操作已改預設完整讀取，不受影響。

## 2026-07-06 Playing File Lock Release hotfix 0.1.42

- 範圍：Windows EXE 播放中「套用到原始檔」有時保存失敗。
- 根因：`<audio>` 以 `file:` URL 載入原始檔時 Windows 持有檔案 handle，寫回最後的 `rename(tempPath, sourcePath)` 被 `EPERM` / `EBUSY` 擋下；macOS rename 可覆蓋開啟中檔案，DMG 驗收不重現。
- 修法：renderer `suspendAudioForFileWrite` 寫回期間釋放 handle、完成後接回原位置與播放狀態；writer `renameWithRetry` 3 次重試 + 明確鎖檔錯誤訊息。未新增套件、未改 DB schema。
- 已通過（Linux 沙盒）：`check:metadata-save-loop`（新增 guard）、`check:song-info`、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`tsc --noEmit`、`npm run electron:compile`。
- installer 已產出（`打包發行.command` / `npm run dist:release` exit=0，DMG hdiutil verify VALID）：
- `Aquariusgirl Music Room Setup 0.1.42.exe`：667,666,956 bytes，SHA-256 `6d67c44c2c68ecfb838cbeb7d18038cda4fca3d96df1733739d9c58f47e75e7f`
- `Aquariusgirl Music Room-0.1.42-arm64.dmg`：684,778,895 bytes，SHA-256 `28caa3939b0ed79861cc9763f0d302956adbdce42768669f0ac987156a236f91`
- DMG `hdiutil verify` VALID；打包時 `dist:release` 內全部 check 再次通過；未簽章、不 push GitHub。詳見 `docs/releases/0.1.42-checksums.md`。
- 待補：packaged GUI 播放中保存驗收、Windows 真機驗證。

## 2026-07-06 Full-Load Cover Write Guard / Packaged Mouse QA hotfix 0.1.41

- 範圍：修正 0.1.40 後仍會發生的第二次封面保存失敗：第一次更換封面成功，第二次按「套用到原始檔」後面板不關、重新讀取 metadata 失敗，重開後該首歌可能失去封面與資料。
- 判斷：封面寫回需要存在，但不需要清 IndexedDB、重掃曲庫、加 `coverRevision`、補新的 MIME 側門、重寫 metadata 架構、恢復「儲存到播放器」或讓前端 draft 當保存成功依據。
- 根因：packaged Emscripten TagLib 對大封面 FLAC 的預設 partial header read 可能只讀到約 1MB 前段；二次寫回後 metadata / cover readback 可能因讀不到完整 Vorbis / FLAC 標籤區而丟 `InvalidFormatError`，造成 reload / readback 失敗。
- 修正：`electron/songInfoWriter.ts` 的 metadata 讀取先走既有 partial read；只有遇到 `InvalidFormatError` 時，才對同一首 user-initiated 原始檔做 `partial:false` full-load retry。原始檔寫回仍維持同一個 TagLib handle 設定文字與封面，最後只 `saveToFile(tempPath)` 一次再 rename。
- 防回歸：`scripts/song-info-writer-check.mjs` 禁止回到 `copyWithTags` / `edit(tempPath)` 雙保存路徑，並強制 fixture 使用 `node_modules/taglib-wasm/dist` 的 Emscripten wasm。Plazma QA 複本已完成 Cover 02 -> Cover 01 -> Cover 02 readback。
- 效能與資料保護：full-load retry 只在使用者明確操作的單曲、且 partial read 已失敗時發生；沒有背景全庫掃描，沒有新增套件，沒有保存音樂檔本體、`File`、`Blob` 或 `ArrayBuffer` 到 IndexedDB。
- 已通過：`npm run check:song-info` PASS；`npm run check:playback-restore` PASS；`npm run check:metadata-save-loop` PASS；`npm run build` PASS；`npm run electron:compile` PASS；`npm run dist:release` PASS。
- 打包：0.1.41 EXE / DMG 已同步到 `release-delivery/installers/`；SHA-256 記錄在 `docs/releases/0.1.41-checksums.md`。
- 0.1.41 最新 installer：EXE 667,666,404 bytes，SHA-256 `35d632c4f6f5646f1c4b8e5900e6e438fcdc99048bff71dde4f9f2c2b5b9b404`；arm64 DMG 684,798,474 bytes，SHA-256 `494531f0796bef677517826c3c38381d9c12bda2a837af9c7954b7a747d93c6c`。
- DMG / EXE：DMG `hdiutil verify` VALID。EXE static check 仍只代表 Windows NSIS installer 靜態驗證；未在 Windows 真機執行。
- Packaged GUI：從 `/tmp/aquariusgirl-0141-dmg` 啟動 packaged DMG app，使用隔離 userData `qa-temp/0.1.41-gui-user-data-fullreadback-final` 與 QA 檔 `qa-temp/0.1.41-gui/Plazma-test/01. Plazma.flac`。已用滑鼠完成三輪：Cover 01 -> Cover 02、Cover 02 -> Cover 01、Cover 01 -> Cover 02。每輪確認 preview 更新、dirty/apply 成立、apply 期間更換封面 / 套用 / 關閉被鎖住或阻擋、面板自動關閉、readback hash 正確。
- GUI readback hash：Cover 01 hash `fe5a6dec4cc20f0718b518209c97dcef819bf7c8b97c814e604cc8fa2949bff8`；Cover 02 hash `5edf5823e603b7fe7f0ddcd30fe2f2614d44dd1005e58f0bc76866c540b1054f`。最終原始檔與 IndexedDB 均為 Cover 02 hash。
- Reload / restart：GUI 中「重新讀取音樂標籤」顯示成功，沒有再出現失敗訊息；關閉並重開 packaged app 後，同隔離 profile 自動恢復 1 首歌曲，最後 Cover 02 與 metadata 仍存在。
- 限制：未在 Windows 真機執行；未做簽章與 notarization。本輪依使用者要求沒有同步 / push GitHub。

### English QA Summary

- Scope: fixes packaged repeated-cover writeback failures caused by TagLib partial metadata reads on large-cover FLAC files.
- Fix: retry a full single-file metadata read only after partial read throws `InvalidFormatError`, while keeping one TagLib write handle and one final `saveToFile(tempPath)` path.
- Passed: song-info, playback-restore, metadata-save-loop, build, Electron compile, `dist:release`, DMG verify, Emscripten fixture Cover 02 -> Cover 01 -> Cover 02 readback, packaged DMG mouse QA for three cover changes, reload metadata success, and restart persistence.
- Remaining limit: real Windows runtime QA was not performed on this macOS machine.

## 2026-07-06 Selected Cover Dirty Guard / Reload Metadata Diagnostics hotfix 0.1.40

- 範圍：修正第二次選不同封面後 preview 變了，但 dirty 回到 false，右下角顯示「沒有任何欄位變更」且「套用到原始檔」無法真正執行的問題；同時補重新讀取 metadata 失敗的 console 診斷。
- 判斷：封面更換與原始檔寫回需要存在，但不需要清 IndexedDB、重掃曲庫、加 `coverRevision`、補 MIME 側門、重寫 metadata 架構、恢復「儲存到播放器」或信任前端 draft 作為成功依據。
- 根因：`SongInfoPanel` 仍把選圖狀態塞進 draft，dirty 也用整個 draft 的 cover 欄位比對；面板 open=true 且同一首歌時，外部 `trackDraftSnapshot` 變動會 reset draft/savedDraft，可能吃掉第二次選封面的 dirty 狀態。
- 修正：新增獨立 `selectedCover` state，保存 bytes / MIME / hash / preview；`textDirty` 只比較文字欄位，`coverDirty` 只看 `selectedCover.hash !== track.coverHash`。reset 只在關閉、重新開啟或 track id 改變時發生，同一首歌 dirty/busy 時不吃外部 snapshot 覆蓋。apply 時再把 normalized text draft 與 selected cover 合併成送出的 draft。
- App 防線：若 draft 表示要更新 cover hash 但沒有 cover bytes，直接顯示「封面資料不完整，請重新選擇封面。」並 return false。成功仍要求 writeback 後 reload 原始檔，`reloadedTrack.coverHash === selectedCoverHash` 且不同於舊 hash，再 `await libraryDb.putTrackMetadata(reloadedTrack)`；成功後只使用 `reloadedTrack`。
- 診斷：`reloadSongInfoFromOriginal` 對 ok=false / 無 metadata 會 `console.error("[reload-metadata] failed", ...)`，exception 會 `console.error("[reload-metadata] exception", ...)`。dev runtime 有 `[select] draftCoverHash`、coverDirty/textDirty、apply selected hash、readback hash 與 IDB saved hash。
- 效能與資料保護：沒有新增套件；沒有保存音樂檔本體、`File`、`Blob` 或 `ArrayBuffer` 到 IndexedDB；沒有重掃整個音樂庫；沒有全庫保存；只保存單曲 metadata。
- 已通過：`npm run check:song-info` PASS；`npm run check:playlist-logic` PASS；`npm run check:playback-order` PASS；`npm run check:track-list-virtualization` PASS；`npm run check:playback-restore` PASS；`npm run check:metadata-save-loop` PASS；`npm run build` PASS；`npm run electron:compile` PASS；`npm run dist:release` PASS。
- 打包：0.1.40 EXE / DMG 已同步到 `release-delivery/installers/`，暫存 `release/` 已移除；SHA-256 記錄在 `docs/releases/0.1.40-checksums.md`。
- 0.1.40 最新 installer：EXE 667,665,700 bytes，SHA-256 `bf36fd3b7674cf2aa9ee8adc5111e5dc4933237764ce63e3fb1bd671f121edba`；arm64 DMG 684,776,924 bytes，SHA-256 `e3ec2403a0218ebcb5eda4de9768a2045b33d30c64c225c6654261cb33e7df20`。
- DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.40，`app.asar` package version 為 0.1.40，執行檔為 Mach-O arm64，`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在。production bundle 確認 incomplete-cover guard 與 reload failure log 存在；dev debug log 在 production bundle 中被移除，符合不產生 production 噪音。EXE static check PASS，辨識為 PE32 Nullsoft NSIS installer；未在 Windows 真機執行。
- 限制：本輪未在 Windows 真機執行，未完成 packaged GUI 純滑鼠連續兩次封面更換驗收；後續需用暫存音樂複本與隔離 profile 驗證，不可打開或修改使用者原始 Music 資料夾。本輪依使用者要求沒有同步 / push GitHub。

### English QA Summary

- Scope: fixes the second selected cover not making the panel dirty, while preserving original-file readback hash verification and awaited single-track IndexedDB save.
- Fix: `SongInfoPanel` keeps selected cover bytes / MIME / hash / preview outside the text draft, separates text dirty from cover dirty, and only resets draft state on close, reopen, or track id changes. App rejects cover hash changes without cover bytes and logs reload failures.
- Passed: song-info, playlist-logic, playback-order, track-list-virtualization, playback-restore, metadata-save-loop, build, Electron compile, `dist:release`, DMG verify, read-only DMG version / app.asar readback, and Windows NSIS static check.
- Remaining limit: real Windows runtime QA and full packaged GUI mouse-only repeated-cover QA were not performed on this macOS machine.

## 2026-07-05 Cover Hash Readback / Playlist Order Persistence hotfix 0.1.39

- 範圍：修正「第一次封面可更換、第二次封面無法真正保存到歌曲資料」與「playlist / 全部歌曲自訂排序後不會保存」。
- 判斷：封面更換與自訂排序都需要存在，但不需要清 IndexedDB、重掃曲庫、加 `coverRevision`、新增套件、補更多 MIME 側門或重做播放清單。
- 根因：封面舊流程仍可能信任前端 draft / write success / 舊 IndexedDB metadata，造成 UI 假成功；第二次開面板也可能沿用舊 draft 狀態。全部歌曲自訂排序只改 React state / `addedAt`，未把被移動歌曲的排序鍵寫回 IndexedDB，重開後會回到舊順序。
- 修正：`SongInfoPanel` 選圖後保存同一份 selected bytes / MIME / hash / preview，apply 期間鎖 UI；Electron 寫回後立刻 readback 並從原始檔 cover bytes 重新計算 `coverHash`；App 端要求 `readbackHash === selectedCoverHash` 且 `readbackHash !== oldCoverHash`，再更新 tracks 並 `await putTrackMetadata(reloadedTrack)`。第二次開面板會清 draft / selected bytes / hash / preview / saving / dirty / error。全部歌曲自訂排序只保存 moved track 的 `addedAt`，一般 playlist 仍保存 trackIds。
- 效能與資料保護：沒有新增套件；沒有保存音樂檔本體、`File`、`Blob` 或 object URL 到 IndexedDB；沒有重掃整個音樂庫；沒有讓封面或排序操作觸發全庫保存。全部歌曲拖曳排序只保存一首 track metadata，避免上萬首曲庫每次拖曳大批量寫入。
- 已通過：`npm run check:song-info` PASS；`npm run check:playlist-logic` PASS；`npm run check:playback-order` PASS；`npm run check:track-list-virtualization` PASS；`npm run check:playback-restore` PASS；`npm run check:metadata-save-loop` PASS；`npm run build` PASS；`npm run electron:compile` PASS；`npm run dist:release` PASS。
- 打包：0.1.39 EXE / DMG 已同步到 `release-delivery/installers/`，暫存 `release/` 已移除；SHA-256 記錄在 `docs/releases/0.1.39-checksums.md`。
- 0.1.39 最新 installer：EXE 667,665,556 bytes，SHA-256 `a6f6cdffe625ab243e250c535c0b9ba1f76bce1aea5edbe55263e04ef448efd2`；arm64 DMG 684,792,267 bytes，SHA-256 `4aec705531cff9b6c207c95f72c9c6370d30b50ff4b2c36908d8b4fdcf0a6d23`。
- DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.39，`app.asar` package version 為 0.1.39，執行檔為 Mach-O arm64，`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在。packaged renderer 讀回確認 cover readback mismatch、draft cover hash log、playlist order save failure guard 存在；packaged main 讀回確認 IPC received-cover-hash debug guard 存在。EXE static check PASS，辨識為 PE32 Nullsoft NSIS installer；未在 Windows 真機執行。
- 限制：本輪未在 Windows 真機執行，未完成 packaged GUI 純滑鼠連續兩次封面更換驗收；後續需用暫存音樂複本與隔離 profile 驗證，不可打開或修改使用者原始 Music 資料夾。

### English QA Summary

- Scope: fixes cover writeback false success and custom-order persistence.
- Fix: cover success now requires original-file readback hash equality and a completed single-track IndexedDB save; all-songs custom order saves only the moved track's order key, while normal playlists keep saved trackIds.
- Passed: song-info, playlist-logic, playback-order, track-list-virtualization, playback-restore, metadata-save-loop, build, Electron compile, `dist:release`, DMG verify, read-only DMG version / app.asar readback, packaged guard readback, and Windows NSIS static check.
- Remaining limit: real Windows runtime QA and full packaged GUI mouse-only repeated-cover QA were not performed on this macOS machine.

## 2026-07-05 Cover MIME Alias / Sort Controls Guard hotfix 0.1.38

- 範圍：修正 0.1.37 後使用者在 DMG / EXE 實測回報 playlist 排序方式看起來被拿掉，以及封面一次也無法保存的回歸。
- 判斷：排序方式需要存在，但不需要新增排序模式或重做播放清單；封面保存需要修，但不需要清 IndexedDB、重掃曲庫、重做歌曲資訊面板、新增套件、壓縮封面或改 DB schema。
- 根因：排序 7 種模式仍在 source，缺口是 UI / packaged 防回歸沒有守住排序 select 的可見性與 option 數量。封面路徑在 0.1.37 已支援空白 / octet-stream MIME，但仍拒絕常見 OS MIME 別名如 `image/jpg` / `image/pjpeg` / `image/x-png`，可能讓 packaged app 遇到別名時被 renderer 或 writer 擋下。
- 修正：`SortControls` 補 `aria-label` 與穩定 `min-w-[9.5rem]`，並在 `scripts/track-list-virtualization-check.mjs` 檢查 7 個排序 option 與標籤。`src/utils/songInfo.ts` 與 `electron/songInfoWriter.ts` 將 `image/jpg` / `image/pjpeg` canonicalize 成 `image/jpeg`，`image/x-png` canonicalize 成 `image/png`；真實不支援 MIME 仍拒絕。
- 效能與資料保護：沒有新增套件；沒有保存音樂檔本體、`File`、`Blob` 或 `ArrayBuffer` 到 IndexedDB；沒有重掃整個音樂庫；沒有讓封面操作觸發全庫保存；沒有動 TrackList windowing。
- 已通過：`npm run check:song-info` PASS；真實 Plazma 暫存複本封面 roundtrip PASS；`npm run check:track-list-virtualization` PASS；`npm run check:playback-order` PASS；`npm run check:playback-restore` PASS；`npm run check:metadata-save-loop` PASS；`npm run build` PASS；`npm run electron:compile` PASS；`npm run dist:release` PASS。
- 打包：0.1.38 EXE / DMG 已同步到 `release-delivery/installers/`，暫存 `release/` 已移除；SHA-256 記錄在 `docs/releases/0.1.38-checksums.md`。
- 0.1.38 最新 installer：EXE 667,664,556 bytes，SHA-256 `fd07376a35cbeccdec55d98751a2273fe67834904c16f24d9d112f71825d5da8`；arm64 DMG 684,757,578 bytes，SHA-256 `66a547f31c535ad9643ba2d7c2ea7bebedc62130b114ba543ca50aa8fccf7a7a`。
- DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.38，`app.asar` package version 為 0.1.38，執行檔為 Mach-O arm64，`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在。packaged renderer 讀回確認排序 label 與 cover MIME alias 存在；packaged main 讀回確認 cover MIME alias 存在。EXE static check PASS，辨識為 PE32 Nullsoft NSIS installer；未在 Windows 真機執行。
- packaged GUI：macOS DMG app 已用隔離 `HOME` / 暫存 Plazma 複本開啟，排序下拉選單讀回 7 種選項。原生封面選檔器可用真實滑鼠 click 打開，但純滑鼠選檔被 macOS 隱私提示擋住，需使用者明確允許 Codex / System Events 權限後才能完整完成；本輪未代按允許。封面原始檔寫回核心已用暫存複本 writer/readback 驗證。

### English QA Summary

- Scope: restores the visible sort-mode control and broadens cover MIME handling for common JPEG / PNG aliases.
- Fix: keep the native sort select with all seven existing options, add a source guard for those options, and canonicalize `image/jpg` / `image/pjpeg` / `image/x-png` to the existing supported MIME values.
- Passed: song-info, real Plazma temp-copy cover roundtrip, track-list-virtualization, playback-order, playback-restore, metadata-save-loop, build, Electron compile, `dist:release`, DMG verify, read-only DMG version / app.asar readback, packaged alias readback, and Windows NSIS static check.
- Remaining limit: real Windows runtime QA was not performed. Full mouse-only macOS cover selection requires explicit user approval for the macOS privacy prompt; the app was opened from the DMG and the native picker was reached, but Codex did not grant that permission on the user's behalf.

## 2026-07-05 Cover MIME Fallback / Second Cover Save hotfix 0.1.37

- 範圍：修正同一首米津玄師歌曲第一次更換封面可成功、第二次可能失敗的封面保存問題。
- 判斷：封面更換功能需要存在，但不需要清 IndexedDB、重掃曲庫、重做歌曲資訊面板、新增套件、壓縮封面或改 DB schema。第二次失敗是輸入 MIME 正規化缺口，應在封面選檔與寫入端做最小 fallback。
- 根因：macOS / Electron 的第二次檔案選擇可能讓 `.jpg` / `.png` 帶空白或 `application/octet-stream` MIME，`FileReader` 也可能產生 `data:;base64,...` 或 `data:application/octet-stream;base64,...`。舊 `getSongCoverFileValidationError()` 要求 `file.type` 必須直接是 `image/jpeg` / `image/png`，Electron writer 的 `decodeCoverDataUrl()` 也只接受 `data:image/jpeg;base64,...` / `data:image/png;base64,...`，因此第二次選到的封面可能被 renderer 擋掉或被 writer 拒絕。
- 修正：`src/utils/songInfo.ts` 新增 `getSongCoverMimeType()` 與 `normalizeSongCoverDataUrl()`；只有副檔名為 `.jpg` / `.jpeg` / `.png` 且 MIME 是空白 / `application/octet-stream` 時才推回 `image/jpeg` / `image/png`，真實不支援 MIME 仍拒絕。`SongInfoPanel` 使用推回 MIME 保存 `coverMimeType` 並正規化 data URL prefix。`electron/songInfoWriter.ts` 的 `decodeCoverDataUrl()` 允許空白 / octet-stream data URL 使用 `draft.coverMimeType` fallback；真實不支援 MIME 仍拒絕。
- 效能與資料保護：5 MB 封面上限不變；沒有保存音樂檔本體、`File`、`Blob` 或 `ArrayBuffer` 到 IndexedDB；沒有重掃整個音樂庫；沒有讓上萬首曲庫因封面操作觸發全庫保存；沒有動 TrackList windowing。
- 失敗先行：`scripts/song-info-check.mjs` 新增空白 / octet-stream MIME 的 JPG 驗證與 data URL prefix 正規化檢查，舊程式紅燈；`scripts/song-info-writer-check.mjs` 新增空白 / octet-stream data URL + fallback MIME 檢查，舊程式紅燈。修正後兩者 PASS。
- 檢查：`npm run check:song-info` PASS；真實 Plazma 暫存複本 `Cover 02.jpg` -> `Cover 01.jpg` roundtrip PASS；`npm run check:playback-restore` PASS；`npm run check:metadata-save-loop` PASS；`npm run build` PASS；`npm run electron:compile` PASS；升權 `npm run dist:release` PASS，流程內同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.37 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.37-checksums.md`。

0.1.37 最新 installer：

- EXE：667,664,607 bytes，SHA-256 `5c51648e3fb68c14187f373967cd6893b0429df37f6a105667b0326641515602`
- arm64 DMG：684,802,297 bytes，SHA-256 `a742bfb5a333bf4a5651e5c62eaabe337d951bff9ab028eac198935685be7539`

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.37，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.37，`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在且位於 app.asar 外。packaged renderer / main 讀回確認 cover MIME fallback 存在。EXE static check PASS，辨識為 PE32 Nullsoft NSIS installer；未在 Windows 真機執行。

限制：未在 Windows 真機驗證第二次封面更換與原始檔寫回；本輪沒有完整 packaged GUI 滑鼠流程驗證，真實 UI 連續更換封面仍需用暫存音樂複本與隔離 profile 補驗；未做簽章與 notarization。本輪依使用者要求沒有同步 / push GitHub。

### English QA Summary

- Scope: fixes a second cover replacement failure caused by empty or `application/octet-stream` MIME values from file selection / data URLs.
- Fix: infer JPEG / PNG only from safe extensions when MIME is empty or octet-stream, normalize renderer data URLs, and let the Electron writer use `draft.coverMimeType` only for empty / octet-stream data URLs.
- Passed: song-info, real Plazma temp-copy Cover 02 -> Cover 01 roundtrip, playback-restore, metadata-save-loop, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / app.asar / unpacked `taglib-web.wasm` readback, packaged fallback readback, and Windows NSIS static check.
- Remaining limit: real Windows runtime QA and full packaged GUI repeated-cover mouse QA were not performed on this macOS machine.

## 2026-07-05 Song Info Single Save Path / TagLib Property Map Restore hotfix 0.1.36

- 範圍：修正 0.1.35 後歌曲資訊欄位可能讀不完整，並移除使用者不想要的「儲存到播放器」按鈕。
- 判斷：歌曲資訊保存需要存在，但不需要兩條 metadata 保存路徑；保留原始檔寫回這條明確路徑即可。TagLib property mapping 需要修正，不需要新增套件、背景索引或整庫重掃。
- 根因：0.1.35 改用 `audioFile.properties()` 後只處理 lowercase 欄位，但 TagLib property map 可回傳 `TITLE` / `ARTIST` / `ALBUMARTIST` / `TRACKNUMBER` / `DISCNUMBER` 等大寫鍵，造成歌手、專輯歌手、曲目等讀回時漏掉。另 0.1.28 重新提供的 player-local「儲存到播放器」會讓 IndexedDB override 與原始檔 tag 形成雙路徑，容易造成使用者理解與資料來源混亂。
- 修正：`electron/songInfoWriter.ts` 補 property-key alias map；保留 0.1.35 unpacked `taglib-web.wasm` 與 `forceWasmType: "emscripten"`。`SongInfoPanel` 移除 `onSaveToPlayer` prop、`handleSaveToPlayer` 與「儲存到播放器」按鈕；`App.tsx` 移除 `handleSaveSongInfoToPlayer`。現在只剩「套用到原始檔」，成功代表原檔寫回、重新讀回、全域 track 更新與單曲 IndexedDB 保存完成。
- 失敗先行：`scripts/song-info-writer-check.mjs` 新增 uppercase TagLib property map case；舊程式因 `mapPropertiesToExtendedTag` 未匯出且沒有 alias 紅燈。`scripts/playback-restore-check.mjs` 改成禁止 player-local save path，舊程式因仍有 `handleSaveSongInfoToPlayer` 紅燈。
- 檢查：`npm run check:song-info` PASS；`npm run check:playback-restore` PASS；`npm run check:metadata-save-loop` PASS；`npm run build` PASS；`npm run electron:compile` PASS；升權 `npm run dist:release` PASS，流程內通過 prompt、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、taglib-wasm-packaging、all-target AI assets、build、Electron compile、macOS arm64 DMG 與 Windows x64 NSIS 打包；同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.36 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.36-checksums.md`。

0.1.36 最新 installer：

- EXE：667,664,404 bytes，SHA-256 `417bcc3717b961516dc8eba0e3511f667aeb681fa8d8595e303cc12d6514142e`
- arm64 DMG：684,786,586 bytes，SHA-256 `0709142e5fdbdb3230433488d0f661dcf3b39b09c1044a56f14b6e24d172e73e`

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.36，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.36，`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在且位於 app.asar 外。packaged renderer 讀回確認「儲存到播放器」與「已儲存到播放器」不存在、「套用到原始檔」存在；packaged main 讀回確認 property alias 與 unpacked wasm path 存在。EXE static check PASS，辨識為 PE32 Nullsoft NSIS installer；本機 `bsdtar` 無法拆 NSIS，未在 Windows 真機執行。

限制：未在 Windows 真機驗證 metadata 讀取與原始檔寫回；未做簽章與 notarization。本輪依使用者要求沒有同步 / push GitHub。

### English QA Summary

- Scope: restores song-info metadata readback for TagLib uppercase property keys and removes the player-local "save to player" button.
- Fix: normalize property keys in the Electron song-info writer, keep the unpacked wasm path, and leave one save path: apply to original file, reread, save refreshed single-track metadata.
- Passed: song-info, playback-restore, metadata-save-loop, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / app.asar / unpacked `taglib-web.wasm` readback, packaged renderer no-local-save readback, packaged main alias / wasm readback, and Windows NSIS static check.
- Remaining limit: real Windows metadata runtime QA was not performed on this macOS machine.

## 2026-07-05 Packaged EXE Metadata Wasm Restore hotfix 0.1.35

- 範圍：修正 macOS DMG 能正常讀歌曲資訊，但 Windows EXE 版可能讀不到 metadata、顯示檔名 / 未知歌手的 packaged 回歸。
- 判斷：歌曲資訊讀取需要存在，且應在 EXE / DMG 同一路徑穩定；不需要新增套件、不需要重掃曲庫、不需要修改 renderer 或播放清單。
- 根因：`taglib-wasm/simple` 不能指定 packaged `.wasm` 路徑，預設會從套件位置載入 wasm；Windows app.asar packaged 路徑較不穩，讀取失敗後 `toSelectedFile()` 會吞掉錯誤並回傳空 metadata。
- 修正：`electron/songInfoWriter.ts` 改為共用可設定路徑的 `TagLib.initialize()` 實例，packaged 時讀 `resources/taglib-wasm/taglib-web.wasm`，並 `forceWasmType: "emscripten"`；`package.json` `extraResources` 外帶 `node_modules/taglib-wasm/dist/taglib-web.wasm`；新增 `check:taglib-wasm-packaging` 並串入 `check:song-info`、`dist:release`、`dist:mac`、`dist:win`。
- 失敗先行：`node scripts/taglib-wasm-packaging-check.mjs` 在舊打包設定紅燈，修正後 PASS。
- 檢查：`npm run check:taglib-wasm-packaging` PASS；`npm run check:song-info` PASS；`npm run build` PASS；`npm run electron:compile` PASS；升權 `npm run dist:release` PASS，流程內通過 prompt、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、taglib-wasm-packaging、all-target AI assets、build、Electron compile、macOS arm64 DMG 與 Windows x64 NSIS 打包；同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.35 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.35-checksums.md`。

0.1.35 最新 installer：

- EXE：667,664,174 bytes，SHA-256 `39547c366f8c1e92e725d0a2d21ca8e842e41258ba38ad0f858196916842c35a`
- arm64 DMG：684,823,587 bytes，SHA-256 `ffd83022e96735655c71fddb82eca0fa452f7dbaa617d0eb6065d84e0c93c4b7`

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.35，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.35，`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在且位於 app.asar 外。EXE static check PASS，辨識為 PE32 Nullsoft NSIS installer；本機 `bsdtar` 無法拆 NSIS，未在 Windows 真機執行。

限制：未在 Windows 真機驗證 metadata 讀取。本輪依使用者要求沒有同步 / push GitHub。

### English QA Summary

- Scope: fixes packaged Windows EXE metadata reads while preserving the working macOS DMG path.
- Fix: copy `taglib-web.wasm` outside app.asar and initialize TagLib with an explicit unpacked wasm URL in Emscripten buffer mode.
- Passed: taglib wasm packaging guard, song-info, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / app.asar / unpacked `taglib-web.wasm` readback, and Windows NSIS static check.
- Remaining limit: real Windows metadata runtime QA was not performed on this macOS machine.

## 2026-07-05 Playlist Panel Scroll Restore hotfix 0.1.34

- 範圍：修正 0.1.33 後主視窗大型卷軸已回來，但 playlist 歌曲列表內部小卷軸消失，歌曲一多就看不到下方歌曲的 UI 回歸。
- 判斷：playlist 小卷軸需要存在；主視窗大型卷軸與 playlist 內部卷軸不是二選一。大量歌曲仍沿用 TrackList visible-window render，不新增套件、不重做清單。
- 根因：`TrackList` 本身仍保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`，但 `PlaylistPanel` 只有 `max-h-[calc(100vh-10rem)] min-h-[520px]`，缺少實際高度，導致歌曲多時面板被內容撐開，內部 `overflow-y-auto` 沒有穩定父層高度可接手。
- 修正：`src/components/PlaylistPanel.tsx` 的 panel class 補上 `h-[calc(100vh-10rem)]`，成為 `h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[520px]`。`AppLayout` 主視窗 `h-screen overflow-y-auto overflow-x-hidden`、`TrackList` 內部 scroll container、`body overflow-x: hidden`、Mini Player 與 metadata / cover / IndexedDB / playback 資料流都不改。
- 失敗先行：`check:track-list-virtualization` 先要求 `PlaylistPanel` 必須有實際高度；舊 source 紅燈，修正後 PASS。
- 檢查：`npm run check:track-list-virtualization` PASS；`npm run build` PASS；`npm run electron:compile` PASS；升權 `npm run dist:release` PASS，流程內通過 prompt、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile、macOS arm64 DMG 與 Windows x64 NSIS 打包；同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.34 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.34-checksums.md`。

0.1.34 最新 installer：

- EXE：667,497,871 bytes，SHA-256 `cbf66e9d77fd97b7f4e65c059da476e7d3f17390aaa53f046904b046a03c84ed`
- arm64 DMG：684,440,370 bytes，SHA-256 `ef131d2f09a94c1f123bce82f3a8c2b7545949c8e742f9996ccdb8eb57cf5274`

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.34，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.34；packaged renderer bundle 讀回 `PlaylistPanel` stable height class、主視窗 scroll class 與 TrackList scroll class；packaged CSS 讀回 body 不含 `overflow:hidden`、含 `overflow-x:hidden` 與 `scrollbar-gutter:stable`。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

限制：尚未完成 packaged GUI 100+ 首暫存歌曲滑鼠 / 觸控板 / 拖曳捲軸實測；尚未完成 Windows 真機、簽章與 notarization。本輪依使用者要求沒有同步 / push 到 GitHub。

### English QA Summary

- Scope: restores the missing playlist-internal scrollbar after 0.1.33 restored the main-window scrollbar.
- Fix: `PlaylistPanel` now has a real `h-[calc(100vh-10rem)]` height while preserving the main AppLayout scroller and the existing TrackList `overflow-y-auto` scroller.
- Passed checks: playlist height source guard, build, Electron compile, elevated `npm run dist:release`, DMG verify, read-only DMG version / app.asar / packaged renderer scroll class / packaged CSS overflow checks, and Windows NSIS static check.
- Limits: real packaged GUI large-library scroll QA, real Windows QA, signing, notarization, and GitHub sync remain open.

## 2026-07-05 Nested Main and Playlist Scroll hotfix 0.1.33

- 範圍：修正主視窗右側大型垂直卷軸消失，只剩 playlist 內部可能捲動的 UI 回歸。這次需求明確要求主視窗卷軸與播放清單卷軸不是二選一，而是兩個巢狀 scroll container。
- 判斷：兩個卷軸都需要存在，但都不應強制永遠顯示。主視窗負責整個 App 主內容，playlist 只負責歌曲列表；大型曲庫仍沿用 TrackList visible-window render，不新增套件、不重做清單。
- 根因：0.1.31 / 0.1.32 修 playlist 欄位時，外層 shell 仍有 `h-screen overflow-hidden` 與 `body { overflow: hidden; }`，右側 wrapper 也有 `h-full ... overflow-hidden`，導致主視窗整體內容超出 viewport 時不能由主容器捲動，下方面板看起來被裁切。
- 修正：`src/components/AppLayout.tsx` 外層改為 `className="playlist-scrollbar relative z-10 h-screen overflow-y-auto overflow-x-hidden ..."`，內層改為 `min-h-full`，右欄 section 不再用 `overflow-hidden` 鎖住整個右側內容；`src/App.tsx` 右側 wrapper 移除 `h-full` / `overflow-hidden`；`src/styles/index.css` 將 body 改為只 `overflow-x: hidden`。`src/components/TrackList.tsx` 仍保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`，`PlaylistPanel` 仍保留 `max-h-[calc(100vh-10rem)] min-h-[520px]`。
- 失敗先行：`check:track-list-virtualization` 先新增主視窗與 playlist 兩層 scroll guard，確認 AppLayout 必須有主容器 `overflow-y-auto overflow-x-hidden`、body 不得再有 `overflow: hidden`、TrackList 必須保留內部 `overflow-y-auto overflow-x-hidden`；舊 source 紅燈，修正後 PASS。
- 檢查：`npm run check:track-list-virtualization` PASS；`npm run build` PASS；`npm run electron:compile` PASS；升權 `npm run dist:release` PASS，流程內通過 prompt、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile、macOS arm64 DMG 與 Windows x64 NSIS 打包；同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.33 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.33-checksums.md`。

0.1.33 最新 installer：

- EXE：667,497,980 bytes，SHA-256 `b0316a37c191930859f5a1017ed919188f3de4941c45cd90acdfd5e1991673e9`
- arm64 DMG：684,496,549 bytes，SHA-256 `6caefd200e956fba8a5a255d4bb6942918f8d8609dd5c821d349a362f8882667`

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` 為 0.1.33，執行檔存在且可執行，`app.asar` package version 為 0.1.33；packaged renderer bundle 讀回主容器 scroll class 與 TrackList scroll class；packaged CSS 讀回 body 不含 `overflow:hidden`、含 `overflow-x:hidden` 與 `scrollbar-gutter:stable`。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

限制：本輪 headless browser runtime 受本機 Playwright 瀏覽器快取缺失與 Chrome CLI exit 134 限制，未宣稱實際滑鼠 / 觸控板 GUI 滾動 PASS。尚未完成 packaged GUI 100+ 首暫存歌曲驗證、Windows 真機、簽章與 notarization。

### English QA Summary

- Scope: restores the missing main-window right scrollbar while preserving the internal playlist scrollbar.
- Fix: AppLayout is the main `overflow-y-auto overflow-x-hidden` scroll container; TrackList remains the playlist `overflow-y-auto overflow-x-hidden` scroll container; body no longer globally locks scrolling with `overflow:hidden`.
- Passed checks: nested scroll source guard, build, Electron compile, elevated `npm run dist:release`, DMG verify, read-only DMG version / app.asar / packaged renderer scroll class / packaged CSS overflow checks, and Windows NSIS static check.
- Limits: real packaged GUI large-library scroll QA, real Windows QA, signing, and notarization remain open.

## 2026-07-05 Playlist Column Scroll Restore hotfix 0.1.32

- 範圍：修正 0.1.31 把捲軸放到左側主欄的 UI 回歸；使用者要求捲軸回到 playlist 欄位，且 playlist 欄位高度回到 0.1.28。
- 判斷：playlist 捲軸需要存在，但不應由左側播放器 / 頻譜 / 睡眠定時主欄承擔。大量歌曲仍應使用 `TrackList` 的 bounded native scroll + visible-window render，不新增套件、不重做 virtualization。
- 根因：0.1.31 為了讓 app shell bounded，把 `playlist-scrollbar overflow-y-auto` 加到左欄，並移除 `PlaylistPanel` 的 `min-h-[520px]`。這讓左側主欄出現不該存在的捲軸，且 playlist 欄位高度不再是 0.1.28 的視覺高度。
- 修正：`src/components/AppLayout.tsx` 左欄回到 `className="flex min-w-0 flex-col gap-5"`；`src/components/PlaylistPanel.tsx` 回到 `max-h-[calc(100vh-10rem)] min-h-[520px]` 並保留 `overflow-hidden`；`TrackList` 原生 `playlist-scrollbar`、visible-window + overscan、80px 卡片高度與 bottom safe space 不改。
- 失敗先行：`check:track-list-virtualization` 先新增對左欄不得有 `playlist-scrollbar overflow-y-auto`、`PlaylistPanel` 必須恢復 0.1.28 高度的檢查；0.1.31 source 紅燈，修正後 PASS。
- 檢查：升權 `npm run dist:release` PASS，流程內通過 prompt、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile、macOS arm64 DMG 與 Windows x64 NSIS 打包；同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.32 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.32-checksums.md`。

0.1.32 最新 installer：

- EXE：667,497,961 bytes，SHA-256 `abfdc05af6254a6701f30010a965ecbfe126e3940efac8cffc0626f750deb771`
- arm64 DMG：684,464,416 bytes，SHA-256 `964aa1b9af7bbd8a1f470b0b80c1531fffc7eebe2d8c719635c154ec4fc8fb8f`

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.32，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.32，mac AI model `qwen3.5-0.8b.gguf`、三份 prompts 與 runtime `darwin-arm64/llama-server` 存在，掛載點已卸載。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

限制：尚未完成 packaged GUI 100+ 首歌曲滑鼠 / 觸控板 / 拖曳捲軸實測；尚未完成 Windows 真機、簽章與 notarization。

### English QA Summary

- Scope: moves the misplaced 0.1.31 left-column scrollbar back to the playlist column and restores the playlist panel to the 0.1.28 height.
- Fix: the left column no longer has `playlist-scrollbar overflow-y-auto`; `PlaylistPanel` restores `max-h-[calc(100vh-10rem)] min-h-[520px]`; `TrackList` remains the native windowed song-list scroller.
- Passed checks: track-list-virtualization, playback-order, playback-restore, metadata-save-loop, prompt / track guards, all-target AI assets, build, Electron compile, elevated `npm run dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check.
- Limits: packaged GUI 100+ temp-track scroll QA, real Windows QA, signing, and notarization remain open.

## 2026-07-05 Bounded Playlist Scroll hotfix 0.1.31

- 範圍：修正 0.1.30 後仍可能被誤解成「拉長歌曲卡片」的版面路徑；要求 app body 不捲、左欄不跟著右側清單捲、右側歌曲列表自己的 scroll container 顯示垂直捲軸。
- 判斷：捲軸必須在右側歌曲列表內存在；大量歌曲要靠 bounded native scroll + 既有 TrackList windowing，不靠拉高卡片、不新增套件。
- 根因：0.1.30 已補 TrackList 外緣捲軸，但 `AppLayout` 仍使用 `min-h-screen` 與內層 `min-h-[calc(100vh-8rem)]`，`PlaylistPanel` 仍有 `min-h-[520px]`。在內容高度超過 viewport 時，整個 app 仍可能被撐高，造成 body 參與捲動。
- 修正：`AppLayout` 改為 `h-screen`、內層 `h-full min-h-0`、`main min-h-0 flex-1`；左欄加自己的 `playlist-scrollbar overflow-y-auto`；右欄加 `overflow-hidden`；`App.tsx` 右側 wrapper 加 `overflow-hidden`；`PlaylistPanel` 改為 `min-h-0`，移除 520px 最小高度；`html` / `body` / `#root` 固定高度並讓 body `overflow: hidden`。`TrackList` 與 `TrackItem` 不改資料流，歌曲卡片仍固定 80px。
- 共用卡片：全部歌曲、自訂播放清單、搜尋結果與智慧播放清單仍共用 `PlaylistPanel -> TrackList -> TrackItem`，沒有建立第二套卡片。
- 技能拆分：新增 `docs/skills/aquariusgirl-music-room-development.md`；`docs/skills/github-update-flow.md` 專責 GitHub 上傳 / 同步 / release / checksum / 讀回確認。
- 失敗先行：`check:track-list-virtualization` 先新增對 `min-h-screen`、App body bounded layout、右欄 overflow 與 `PlaylistPanel` 520px min-height 的檢查；舊 source 紅燈，修正後 PASS。
- 檢查：`npm run check:track-list-virtualization` PASS；`npm run check:metadata-save-loop` PASS；`npm run check:playback-restore` PASS；`npm run check:playback-order` PASS；`npm run check:no-track-save-loop` PASS；`npm run check:no-full-db-save-on-playback` PASS；`npm run check:no-audio-load-on-cover-only-update` PASS；`npm run check:cover-update-five-times` PASS；`npm run check:playlist-song-info-restart` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：升權 `npm run dist:release` PASS，流程內通過 prompt、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile、macOS arm64 DMG 與 Windows x64 NSIS 打包；同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。

0.1.31 installer 已產生；SHA-256 記錄在 `docs/releases/0.1.31-checksums.md`。

DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.31，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.31，mac AI model `qwen3.5-0.8b.gguf`、三份 prompts 與 runtime `darwin-arm64/llama-server` 存在，掛載點已卸載。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

限制：尚未完成 packaged GUI 100+ 首歌曲滑鼠 / 觸控板 / 拖曳捲軸實測；尚未完成 Windows 真機、簽章與 notarization。

### English QA Summary

- Scope: bounds the whole app shell so the body does not scroll and only the TrackList scroll container handles large song lists.
- Fix: AppLayout is viewport-bounded, the left column scrolls independently when needed, the right column is overflow-hidden, PlaylistPanel no longer has a 520px minimum height, and track cards remain fixed at 80px.
- Passed checks: track-list-virtualization, metadata-save-loop, playback-restore, playback-order, metadata aliases, build, Electron compile, elevated `npm run dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check.
- Limits: packaged GUI 100+ temp-track scroll QA, real Windows QA, signing, and notarization remain open.

## 2026-07-05 Playlist Edge Scrollbar hotfix 0.1.30（歷史）

- 範圍：修正使用者截圖回報的右側歌曲列表捲軸不夠明確、未貼近播放清單面板最外緣，以及最後歌曲可能被底部 mini player 覆蓋的版面問題。
- 判斷：這個捲軸需要存在；播放清單會有大量歌曲，應使用右側清單自己的 bounded native scroll container，不讓 body、左側播放器、視覺頻譜或睡眠定時跟著捲。
- 根因：0.1.29 已補右欄 flex 高度，但實際 scrollbar 仍在 `TrackList` 內層並吃掉面板右側 padding，視覺上不像使用者截圖紅圈的外緣捲軸；`TrackList` 仍用固定 520px 估算可視窗口，未跟實際 flex scroll 高度連動；清單底部沒有明確 mini player safe space。
- 修正：`src/components/TrackList.tsx` 用原生 `ResizeObserver` 量測自身 viewport，依實際高度計算 visible window，保留 overscan；scroll container 加 `playlist-scrollbar`、`overflow-x-hidden`、`scrollbar-gutter: stable` 與 144px bottom safe space。`src/components/PlaylistPanel.tsx` 的 list wrapper 加 `-mr-3 pr-1`，讓捲軸靠近右側面板外緣；`src/components/TrackItem.tsx` 固定卡片高度為 80px；`src/styles/index.css` 新增柔和半透明細捲軸樣式。
- 效能：沿用 0.1.28 的 TrackList visible-window render，不新增套件、不一次 render 上萬個 DOM row，不在捲動時讀 metadata、寫 IndexedDB 或觸發 `audio.load()`。
- 防回歸：`scripts/track-list-virtualization-check.mjs` 已補檢查 `ResizeObserver`、dynamic `viewportHeight`、`TRACK_LIST_BOTTOM_SAFE_SPACE`、`playlist-scrollbar`、`overflow-x-hidden`、`-mr-3 pr-1`、`h-20` 卡片高度與 CSS `scrollbar-gutter: stable`。
- 檢查：`npm run check:track-list-virtualization` PASS；`npm run build` PASS；`npm run electron:compile` PASS；`npm run check:metadata-save-loop` PASS；`npm run check:playback-restore` PASS；`npm run check:playback-order` PASS；升權 `npm run dist:release` PASS。`dist:release` 內通過 `check:prompts`、`check:track-display`、`check:track-identity`、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:metadata-save-loop`、all-target `check:ai-assets`、build、Electron compile。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一 `npm run dist:release` PASS，同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG / EXE：DMG `hdiutil verify` VALID；升權唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.30，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.30，mac AI model `qwen3.5-0.8b.gguf`、三份 prompts 與 runtime `darwin-arm64/llama-server` 存在，掛載點已卸載。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

0.1.30 最新 installer：

- EXE：667,497,902 bytes，SHA-256 `0a5a3db85a22841b44421fc2d9a312ef298e561006af49c5dca832fd7f8a48ba`
- arm64 DMG：684,484,571 bytes，SHA-256 `82fc07094b8efb051dd76fcd310305e1c7281fe22e85e22a48acd6aa46339872`

限制：本輪未在 Windows 真機安裝；尚未以 packaged GUI 載入真實大曲庫做滑鼠 / 觸控板滾動壓力測試；macOS / Windows 仍未簽章與 notarization；GitHub Releases 是否附上 0.1.30 installer 仍需發布頁面人工確認。

### English QA Summary

- Scope: makes the right song-list scrollbar visible near the playlist panel's outer edge, keeps search/sort fixed above the list, and adds bottom safe space so the mini player does not cover the last tracks.
- Root cause: 0.1.29 fixed the parent flex height, but the real scrollbar still lived inside TrackList's inner padded area; TrackList also used a fixed 520px viewport estimate instead of the real flex height.
- Fix: TrackList now measures its own viewport with native `ResizeObserver`, keeps windowed rendering, hides horizontal overflow, uses a stable slim scrollbar, and adds bottom safe space. Track cards are fixed at 80px.
- Passed checks: track-list-virtualization / edge-scrollbar guard, build, Electron compile, metadata-save-loop, playback-restore, playback-order, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check.
- Limits: real Windows install, real large-library packaged GUI scroll QA, signing, notarization, and GitHub Release artifact attachment remain open.

## 2026-07-04 Playlist Scroll Bounds hotfix 0.1.29

- 範圍：修正使用者截圖回報的右側播放清單卡片沒有內部捲軸、清單往底部播放器下方延伸，以及播放清單卡片底部沒有與左側「睡前定時停止」卡片底部切齊。
- 判斷：播放清單捲軸需要存在；未來上萬首歌曲時，清單必須在自己的 bounded container 內捲動，不可讓整頁或底部播放器被清單撐開。
- 根因：0.1.28 已把 `TrackList` 改成 visible window + overscan，但父層高度邊界沒有補齊。`App.tsx` 右側 wrapper 仍只是 `flex flex-col gap-4`，`PlaylistPanel` 使用 `max-h-[calc(100vh-10rem)] min-h-[520px]`，沒有吃右欄剩餘高度；因此 `TrackList` 的 `h-full overflow-y-auto` 沒有穩定父層高度，清單會在卡片外繼續往下延伸。
- 修正：`src/components/AppLayout.tsx` 右側 section 加 `lg:h-full`；`src/App.tsx` 右側 wrapper 改為 `flex h-full min-h-0 flex-col gap-4`；`src/components/PlaylistPanel.tsx` 移除舊 viewport max-height，改為 `overflow-hidden lg:min-h-0 lg:flex-1`。保留 0.1.28 的 TrackList windowing，不新增套件、不重做清單。
- 失敗先行：先擴充 `scripts/track-list-virtualization-check.mjs`，要求右側 full-height / min-height 邊界、`PlaylistPanel` flex scroll bounds、`overflow-hidden`，並禁止舊 `max-h-[calc(100vh-10rem)]`。舊程式因缺少 `className="flex h-full min-h-0 flex-col gap-4"` 紅燈；修正後 PASS。
- 瀏覽器驗收：啟動 Vite dev server，使用 in-app browser 2048×1152 viewport 讀 DOM。量測結果：`PlaylistPanel.bottom = 1542`、`SleepTimer.bottom = 1542`，右側 wrapper class 為 `flex h-full min-h-0 flex-col gap-4`。空歌單狀態沒有 TrackList scroller 是正常的；有歌曲時 source guard 確認 `TrackList` 仍是 `overflow-y-auto` visible-window list。
- 檢查：`npm run check:track-list-virtualization` PASS；`npm run build` PASS；`npm run electron:compile` PASS；升權 `npm run dist:release` PASS。`dist:release` 內通過 `check:prompts`、`check:track-display`、`check:track-identity`、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:metadata-save-loop`、all-target `check:ai-assets`、build、Electron compile。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一 `npm run dist:release` PASS，同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG / EXE：DMG `hdiutil verify` VALID；升權唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.29，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.29，mac AI model `qwen3.5-0.8b.gguf`、三份 prompts 與 runtime `darwin-arm64/llama-server` 存在，掛載點已卸載。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

0.1.29 最新 installer：

- EXE：667,497,625 bytes，SHA-256 `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`
- arm64 DMG：684,461,729 bytes，SHA-256 `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`

限制：本輪未在 Windows 真機安裝；dev browser 沒載入真實大曲庫，真實上萬首 GUI 滑動仍需用暫存資料與隔離 profile 補驗；packaged macOS GUI 滑鼠流程、Windows fresh install、4 GB / 20+ 首資料夾、AI/Mini/dialog focus、簽章與 notarization 仍未完成。

### English QA Summary

- Scope: restores internal scrolling in the right playlist card and aligns its bottom with the left Sleep Timer card.
- Root cause: TrackList had visible-window rendering, but the parent right column lacked a stable flex height boundary, so the list's `h-full overflow-y-auto` had no bounded parent.
- Fix: desktop right grid item now keeps full height, the right wrapper is `flex h-full min-h-0 flex-col`, and `PlaylistPanel` uses `overflow-hidden lg:min-h-0 lg:flex-1` instead of the old viewport max-height.
- Passed checks: red/green track-list-virtualization / scroll-bound guard, browser layout measurement, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check.
- Limits: real Windows install, real large-library GUI scroll QA, packaged GUI stress QA, signing, and notarization remain open.

## 2026-07-04 Kill Metadata Save Loop hotfix 0.1.28

- 範圍：修正嚴重效能與資料同步問題，並補上使用者回報的播放順序錯誤與大清單 render 缺口。使用者更新封面幾次後越來越卡、播放曾修改 metadata / cover 的歌曲會卡很久、播放清單與播放器資料庫重開後不穩定刷新，疑似全庫保存與 storedTracks 回灌迴圈；另外歌曲播放未照目前歌曲清單上到下播放，手動排序與檔名排序都可能被未排序的 active track id 序列覆蓋；上萬首歌曲不可一次 render 上萬個 DOM row。
- 根因：`useMusicLibraryDb` 仍有 `tracks` 任意變動就 `saveTracksNow(tracks)` 的 effect；`saveTrackMetadata()` 會 `store.clear()` 後 put all。播放統計 `recordTrackPlayback`、duration、單曲 metadata / cover 更新都會造成 tracks 改變，進而重寫整個 tracks store，包含大型 `coverDataUrl`。`storedTracks` 更新後又會觸發 `applyStoredTrackMetadata` 回套到 tracks，形成回授風險。
- 修正：移除 tracks autosave effect；新增 `putTrackMetadata`、`putManyTrackMetadata`、`patchTrackPlayback`、`patchTrackDuration`、`deleteTrackMetadata`、`replaceAllTrackMetadata`。`saveTrackMetadata()` 只保留為整庫重建相容入口並加註解。播放統計與 duration 只 patch 小欄位，不寫 coverDataUrl；「儲存到播放器」只更新全域 tracks 與 IndexedDB 單曲並標記本地 metadata override；原始檔寫回後只 `await putTrackMetadata(reloadedTrack)`；`applyStoredTrackMetadata` 同一次 App 執行只做啟動補救一次。播放核心改用排序後的 `orderedPlaybackTracks`，手動排序與檔名排序都照畫面上到下播放，搜尋只篩選畫面，不縮短播放佇列。`TrackList` 改為可見窗口 render，只掛載可見列與 overscan。
- 播放防線：播放流程不呼叫 `readSongInfoFromOriginalFile` / `readAudioMetadata` / `applySongInfoToOriginalFile`，封面 / metadata-only 更新不改 `localUrl` 或 `mediaVersion`，沿用 `loadedTrackSourceRef` 只在 source 真變時 `audio.load()`。
- 測試：先新增 `scripts/metadata-save-loop-check.mjs`，舊程式因缺少單曲 API 與仍有全庫保存入口紅燈；修正後 PASS。新增 `scripts/playback-order-check.mjs`，舊程式因 `useAudioPlayer` 仍吃未排序 `playbackTracks` 紅燈；修正後 PASS。新增 `scripts/track-list-virtualization-check.mjs`，舊程式因 `TrackList` 仍直接 `tracks.map` 全量 render 紅燈；改成可見窗口後 PASS。新增 npm 指令：`check:playback-order`、`check:track-list-virtualization`、`check:metadata-save-loop`、`check:no-track-save-loop`、`check:no-full-db-save-on-playback`、`check:cover-update-five-times`、`check:playlist-song-info-restart`、`check:no-audio-load-on-cover-only-update`。`check:playback-restore` 已追加「儲存到播放器」紅綠檢查，要求 `replaceTrackSongInfo(..., { metadataOverride: true })` 後 `await putTrackMetadata(savedTrack)`。這些是 source-level regression guard，不是 packaged GUI 壓力測試。2026-07-04 追加 dev guard：重複 `applyStoredTrackMetadata`、播放中非預期 `readSongInfoFromOriginalFile`、同 track source 變動造成 `audio.load()` 都會 console warn，並納入 `check:metadata-save-loop`。
- 檢查：`npm run check:playback-order` PASS；`npm run check:track-list-virtualization` PASS；`npm run check:no-track-save-loop` PASS；`npm run check:no-full-db-save-on-playback` PASS；`npm run check:cover-update-five-times` PASS；`npm run check:playlist-song-info-restart` PASS；`npm run check:no-audio-load-on-cover-only-update` PASS；`npm run check:playback-restore` PASS；`npm run check:song-info` PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run check:prompts` PASS；`npm run check:theme-colors` PASS；`npm run check:custom-images` PASS；all-target `check:ai-assets` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一 `npm run dist:release` PASS，同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG / EXE：DMG `hdiutil verify` VALID；唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.28，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.28，mac AI model `qwen3.5-0.8b.gguf`、prompts 與 runtime `darwin-arm64/llama-server` 存在，掛載點已卸載。EXE static check PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行。

0.1.28 最新 installer：

- EXE：667,497,666 bytes，SHA-256 `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`
- arm64 DMG：684,468,066 bytes，SHA-256 `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`

限制：source-level checks 已覆蓋保存迴圈、播放順序與 TrackList windowing 防線，但尚未完成 packaged GUI 連續換封面 5 次、手動/檔名排序實機播放順序、大清單滑動、播放清單寫回後強制重開、播放大型封面歌曲不卡、Windows 真機安裝、大資料夾、AI 操作、Mini/dialog focus、簽章與 notarization。

### English QA Summary

- Scope: fixes the metadata save loop, full-library IndexedDB rewrites, playback-order mismatch with the visible list, and the large-list full render gap.
- Root cause: arbitrary `tracks` changes triggered `saveTracksNow(tracks)`, and `saveTrackMetadata()` cleared and rewrote the entire tracks store, including large cover payloads.
- Fix: removed the arbitrary autosave effect, added explicit single-track put/patch/delete APIs, passed the sorted track list into playback, and made TrackList render only the visible window plus overscan. Playback and duration updates no longer write cover data or replace all metadata.
- Passed checks: playback-order, track-list windowing, metadata-save-loop source guards, playback-restore, song-info, track-display, track-identity, AI track search, FLAC metadata, prompt checks, theme colors, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check.
- Limits: packaged GUI stress QA, large-list scroll QA, real Windows install, large-folder QA, signing, and notarization remain open.

## 2026-07-04 歌曲資訊面板二次寫回 hotfix 0.1.27

- 範圍：修正歌曲資訊 / 封面寫回 / IndexedDB / 播放卡頓同族殘留。第一次更換封面並套用到原始檔成功後，下一次開同一首或另一首歌曲資訊面板，按「套用到原始檔」可能無反應或按鈕狀態異常。
- 判斷：不採用清空整個 IndexedDB 或重新載入全部歌曲。0.1.26 已建立單曲重讀與 `saveTracksNow()` 保存順序，本輪問題集中在面板 draft / saving 狀態與按鈕 disabled reason。
- 根因：`SongInfoPanel` 只用 `[open, track?.id]` 初始化 draft，無法反映同一 track 最新 cover / metadata snapshot；第一次成功後缺少集中清理 draft 與 `savingRef` 的流程。disabled 條件也沒有完整包含 no dirty fields、unsupported format 等原因。
- 修正：`SongInfoPanel` 新增 `trackDraftSnapshot`、`resetDraftState()`、`savingRef`；每次開啟用最新 track snapshot 初始化，關閉或成功後清 draft，`finally` 一律把 `savingRef.current = false` 並清 `busy`；writeback disabled 條件收斂為 no current track / saving / not desktop / no dirty fields / unsupported format。`App.tsx` 也在 IPC 前拒絕不支援格式。
- 失敗先行：先讓 `scripts/playback-restore-check.mjs` 要求 `savingRef`、`resetDraftState`、`trackDraftSnapshot`、dirty-aware disabled，且禁止回到 `}, [open, track?.id]);`；舊程式紅燈，修正後 PASS。
- 檢查：`npm run check:playback-restore` PASS；`npm run check:song-info` PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run check:prompts` PASS；`npm run check:theme-colors` PASS；`npm run check:custom-images` PASS；all-target `check:ai-assets` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一 `npm run dist:release` PASS，同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；升權唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.27，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.27，mac AI runtime `darwin-arm64/llama-server` 存在，掛載點已卸載。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、播放中改封面、播放/暫停、4 GB 資料夾、寫回與 AI 操作實機通過。
- GUI 驗收限制：本輪未執行 packaged GUI 滑鼠流程；下一輪需用暫存音樂複本與隔離 profile 驗證第一次寫回後第二次寫回、重開封面、播放清單與播放中不卡。

0.1.27 最新 installer：

- EXE：667,496,788 bytes，SHA-256 `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`
- arm64 DMG：684,462,624 bytes，SHA-256 `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`

限制：Windows 真機安裝、Windows 播放中更換封面後切歌再切回不卡、Windows cover02 -> cover01 第一次重開後不回跳、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、AI 操作與 Mini/dialog focus 尚未驗收；macOS GUI 滑鼠流程未在本輪驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes the second song-info / cover writeback path after an earlier successful original-file writeback.
- Root cause: the song-info panel initialized only by `[open, track?.id]` and could keep stale draft / saving state; disabled reasons were incomplete.
- Fix: initialize from the latest `trackDraftSnapshot`, clear draft state on close/success, reset `savingRef` in `finally`, and reject unsupported writeback formats before IPC.
- Passed checks: playback-restore, song-info, track-display, track-identity, AI track search, FLAC metadata, prompt checks, theme colors, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI runtime checks, and Windows NSIS static check.
- Limits: packaged GUI mouse QA, real Windows install, large-folder QA, AI/Mini UX, signing, and notarization remain open.

## 2026-07-03 單曲寫回後 DB 立即保存 hotfix 0.1.26

- 範圍：補完 0.1.24 / 0.1.25 同族殘留，修正原始檔封面寫回後 UI 已更新但 IndexedDB 仍可能保存舊 cover，導致第一次重開還原舊 cover02、第二次才看到 cover01。
- 判斷：不採用每次歌曲資訊更新就清空整個音樂資料庫再重載。這對 99 首可能看似有效，但對未來上萬首曲庫會造成不必要 I/O 與等待。
- 根因：`reloadSongInfoFromOriginal` 寫回後只更新 React state；`useMusicLibraryDb` 透過 effect 非同步保存 tracks。成功提示 / 面板關閉可能早於 IndexedDB transaction 完成，快速重開時會讀到舊 snapshot。
- 修正：`replaceTrackSongInfo` 回傳更新後的 `Track`；`useMusicLibraryDb` 新增 `saveTracksNow(tracksSnapshot)`，沿用既有 save queue 並回傳 promise；`handleApplySongInfoToOriginal` 只在重新讀回原始檔 metadata 且 `await libraryDb.saveTracksNow(...)` 完成後回報成功。
- 失敗先行：先讓 `scripts/playback-restore-check.mjs` 要求 `saveTracksNow`、`return saveTask`、App 端 `await libraryDb.saveTracksNow`，舊程式紅燈；修正後 PASS。
- 檢查：`npm run check:playback-restore` PASS；`SONG_INFO_FIXTURE_PATH=/private/tmp/.../Plazma-test/01. Plazma.flac npm run check:song-info` PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run check:prompts` PASS；`npm run check:theme-colors` PASS；`npm run check:custom-images` PASS；all-target `check:ai-assets` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：升權 `npm run dist:release` PASS，同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；升權唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.26，執行檔為 Mach-O arm64，`app.asar` 存在，mac AI model/runtime 存在，掛載點已卸載。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、播放中改封面、播放/暫停、4 GB 資料夾、寫回與 AI 操作實機通過。
- GUI 驗收：已卸載舊掛載並重新掛載 0.1.26 DMG，使用 `/private/tmp/aquariusgirl-0.1.26-mouse-profile` 隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本，不打開使用者原始 Music 資料夾。Plazma 播放中先設為 Cover 02，再改回 Cover 01 並套用到原始檔；UI 顯示成功，原始 FLAC 讀回為 Cover 01（Cover 01 data URL 長度 `5789911`，Cover 02 為 `1347951`）。
- GUI 切歌 / 重開驗收：套用後切到 `02. BOW AND ARROW.flac`，再切回 `01. Plazma.flac` 會立即播放且進度前進；重開同隔離 profile 後，曲庫恢復 4 首，`0.1.26 Cover QA` 播放清單仍保留 Plazma，外部 taglib 讀回暫存原始 FLAC 仍是 Cover 01、不是 Cover 02。
- GUI 驗收限制：macOS 原生檔案對話框因 `/private/tmp` 隱藏路徑與無輔助使用權限無法完整滑鼠自動選檔，資料夾與封面檔選擇使用限制在暫存路徑的本機 harness；播放、編輯面板、套用確認、切歌、重開與播放清單觀察皆在 packaged app UI 完成。
- 技能更新：已整理並嘗試補入 `build-music-player` 經驗；若環境再次擋寫入，下一輪要優先補記 0.1.26。

0.1.26 最新 installer：

- EXE：667,496,468 bytes，SHA-256 `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`
- arm64 DMG：684,434,117 bytes，SHA-256 `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`

限制：Windows 真機安裝、Windows 播放中更換封面後切歌再切回不卡、Windows cover02 -> cover01 第一次重開後不回跳、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、AI 操作與 Mini/dialog focus 尚未驗收；macOS native dialog 選取 `/private/tmp` 暫存路徑使用 harness；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes the remaining original-file writeback persistence race after cover/song-info edits.
- Root cause: the app could show success before the updated track snapshot had finished saving to IndexedDB.
- Fix: reload only the edited track and await `libraryDb.saveTracksNow(...)` before reporting success.
- Passed checks: playback-restore, real Plazma song-info / cover roundtrip, track-display, track-identity, AI track search, FLAC metadata, prompt checks, theme colors, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG checks, packaged macOS isolated cover-writeback / switch-track / restart / playlist QA, and Windows NSIS static check.
- Limits: native macOS file-dialog selection used a constrained temp-path harness; real Windows install, large-folder QA, AI/Mini UX, signing, and notarization remain open.

## 2026-07-03 audio source 誤重載 hotfix 0.1.25

- 範圍：補完 0.1.24 同族殘留，修正播放中更換封面 / 歌曲資訊後，切歌再切回同一首仍可能因同來源重載而短暫卡住。
- 判斷：不是全新問題，而是 metadata / cover 寫回後音訊來源刷新干擾的同族殘留。0.1.24 修掉 `mediaVersion` 與 IndexedDB save queue，但另一條 source reload 路徑仍在。
- 根因：`useAudioPlayer` 以 `audio.src !== currentTrackSource` 判斷是否重載；`audio.src` 是瀏覽器正規化後的 URL，不能直接拿來跟原始 `currentTrackSource` 比。來源 effect 同時依賴 duration，metadata / duration 更新可能誤觸 `audio.load()`。
- 修正：新增 `loadedTrackSourceRef` 記住最後指定給 audio element 的 source；source effect 只依賴 `currentTrackSource`，只有來源真的改變才 `audio.load()`；`stop()` / 清空來源時清 ref。
- 失敗先行：先讓 `scripts/playback-restore-check.mjs` 要求 `loadedTrackSourceRef`、禁止 `audio.src !== currentTrackSource`、禁止 `[currentTrackDuration, currentTrackSource]`，舊程式紅燈；修正後 PASS。
- 封面驗證：`song-info-writer-check` 已補真實封面 roundtrip。使用 `/private/tmp/.../Plazma-test/01. Plazma.flac` 暫存複本，寫 `Cover 02.jpg` 後讀回，再寫 4.3 MB `Cover 01.jpg` 後讀回，PASS；原始音樂檔未修改。
- 檢查：`npm run check:playback-restore` PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`SONG_INFO_FIXTURE_PATH=/private/tmp/.../Plazma-test/01. Plazma.flac npm run check:song-info` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run check:prompts` PASS；`npm run check:theme-colors` PASS；`npm run check:custom-images` PASS；all-target `check:ai-assets` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；使用者同意打包後，升權重跑同一 `npm run dist:release` PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID。`hdiutil attach` / `hdiutil imageinfo` 因裝置權限與用量限制未完成，所以本輪不標記 DMG 唯讀掛載版本 / arm64 / app.asar 讀回 PASS。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、播放中改封面、播放/暫停、4 GB 資料夾、寫回與 AI 操作實機通過。
- GUI 驗收限制：Codex 沙盒拒絕直接啟動 Electron GUI；本輪未由 Codex 完成滑鼠實際流程，需下一輪由已開啟 App 或使用者手動配合驗收。
- 技能更新限制：已整理 0.1.25 lesson，但寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` 被用量限制擋住，提示 18:48 後再試。

0.1.25 installer（歷史）：

- EXE：667,496,304 bytes，SHA-256 `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`
- arm64 DMG：684,416,581 bytes，SHA-256 `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`

限制：Windows 真機安裝、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、歌曲資訊 / 封面寫回、AI 操作與 Mini/dialog focus 尚未驗收；macOS GUI 滑鼠驗收與 DMG 唯讀掛載讀回尚未完成；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes the remaining 0.1.24-family same-source audio reload after cover/song-info writeback.
- Root cause: `useAudioPlayer` compared browser-normalized `audio.src` with raw `currentTrackSource`, and source loading depended on duration updates.
- Fix: `loadedTrackSourceRef` stores the assigned source; source loading depends only on `currentTrackSource`.
- Red/green validation: `check:playback-restore` was first extended to fail on the old direct `audio.src` comparison and duration-dependent source effect, then passed after the fix.
- Passed checks: playback-restore, track-display, track-identity, real Plazma song-info / cover roundtrip, AI track search, FLAC metadata, prompt checks, theme colors, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, and Windows NSIS static check.
- Limits: GUI mouse validation, DMG read-only mount readback, real Windows install, writeback UX, AI operation, signing, notarization, and installed skill update remain open.

## 2026-07-03 封面寫回播放卡頓 hotfix 0.1.24

- 範圍：修正播放中更換封面後，切歌再切回同一首會短暫卡住才播放；修正 cover02 -> cover01 後第一次重開舊封面、第二次重開才新封面的保存順序問題。
- 判斷：不是全新問題，也不是 0.1.23 原 bug 復發；同屬 metadata / cover 寫回後狀態打架。本次精確路徑是 `mediaVersion` 造成 `file://` audio source 變動並觸發 `audio.load()`，以及 IndexedDB track metadata 非同步保存順序競賽。
- 根因：`replaceTrackSongInfo` 對封面 / metadata-only 更新設定 `mediaVersion: Date.now()`；`useAudioPlayer` 會把它接到 audio source，造成單純改封面也重載音訊。另一路是 tracks 變動時多筆 `saveTrackMetadata` transaction 可能交錯完成，讓舊 cover02 save 晚於新 cover01 save。
- 修正：移除 metadata/cover-only 的 `mediaVersion` bump；`useMusicLibraryDb` 新增 `trackSaveQueueRef`，串接 track metadata save / clear，固定保存順序。
- 失敗先行：先在 `scripts/playback-restore-check.mjs` 加入斷言，確認舊程式因 `mediaVersion: Date.now()` 失敗；修正後同檢查 PASS，並要求 `trackSaveQueueRef` 保存順序防線存在。
- 檢查：`npm run check:playback-restore` PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:song-info` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run check:prompts` PASS；`npm run check:theme-colors` PASS；`npm run check:custom-images` PASS；all-target `check:ai-assets` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗，`npm run dist:win` 在 Wine `wineserver: bind` 失敗；使用者明確同意打包後，升權重跑同一 `npm run dist:release` PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.24，執行檔為 Mach-O arm64，`app.asar` package version 為 0.1.24，未找到 0.1.23，prompt 只有三份 `.txt` 且無 `.bin`，AI runtime 只保留 `darwin-arm64`。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、播放中改封面、播放/暫停、4 GB 資料夾、寫回與 AI 操作實機通過。

0.1.24 installer（歷史）：

- EXE：667,496,263 bytes，SHA-256 `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`
- arm64 DMG：684,416,368 bytes，SHA-256 `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`

限制：Windows 真機安裝、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、歌曲資訊 / 封面寫回、AI 操作與 Mini/dialog focus 尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes playback stalling after cover writeback when switching away and back, plus the first-restart-old-cover / second-restart-new-cover persistence race.
- Root cause: `replaceTrackSongInfo` bumped `mediaVersion` for metadata/cover-only edits, causing the `file://` audio source to change and reload. IndexedDB track metadata saves could also complete out of order.
- Fix: metadata/cover-only updates no longer bump `mediaVersion`; track metadata save / clear operations now run through one queue.
- Red/green validation: `check:playback-restore` was first extended to fail on the old `mediaVersion: Date.now()` path, then passed after the fix.
- Passed checks: playback-restore, track-display, track-identity, song-info, AI track search, FLAC metadata, prompt checks, theme colors, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG checks, and Windows NSIS static check.
- Limits: real Windows install, playback-while-editing UI verification, latest-cover persistence, playback/pause, latest-folder restore, large-folder load, writeback, AI operation, signing, and notarization remain open.

## 2026-07-03 歌手欄位閃爍 hotfix 0.1.23（歷史）

- 範圍：修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的閃爍，並避免同類 metadata 回授再次讓弱資料覆蓋強資料。
- 判斷：這不是全新的問題類型，而是舊版 metadata 來源打架的同族問題；本次精確路徑是 `storedTracks` 同時作為開機舊資料與目前 `tracks` 的即時鏡像。
- 根因：Electron auto-restore 為了啟動速度使用 `readMetadata:false`，早期 track 可能只有弱 metadata。`applyStoredTrackMetadata` 直接 `artist: stored.artist`，且回灌 stored metadata 後沒有標記 `metadataLoaded`，所以後續弱 stored metadata 可能蓋回真實歌手。
- 修正：stored 文字欄位只在非空時覆蓋目前 track 文字；套用任一 stored metadata 後標記 `metadataLoaded`，後續同 `sourcePath` 同步只更新 duration、playCount、lastPlayedAt 等播放統計。
- 失敗先行：先在 `scripts/playback-restore-check.mjs` 加入斷言，確認舊程式因 `artist: stored.artist` 失敗；修正後同檢查 PASS。
- 檢查：`npm run check:playback-restore` PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:song-info` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run build` PASS；`npm run electron:compile` PASS；`npm run check:prompts` PASS；all-target `check:ai-assets` PASS；`npm run check:custom-images` PASS；`npm run check:theme-colors` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.23，執行檔為 Mach-O arm64，`app.asar` 存在且含 0.1.23，未找到 0.1.22，prompt 只有三份 `.txt`，AI runtime 只保留 `darwin-arm64`。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、歌手欄位 UI、播放/暫停、4 GB 資料夾、寫回與 AI 操作實機通過。

0.1.23 最新 installer：

- EXE：667,496,298 bytes，SHA-256 `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`
- arm64 DMG：684,416,209 bytes，SHA-256 `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`

限制：Windows 真機安裝、歌手欄位不閃爍 UI 驗收、播放/暫停連點、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、歌曲資訊 / 封面寫回、AI 操作與 Mini/dialog focus 尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes the artist field flicker between real artist text and `未知歌手`.
- Root cause: `storedTracks` acted as both startup snapshot and live `tracks` mirror. Auto-restore can create weak metadata first, and direct stored artist assignment could overwrite restored real artist text.
- Fix: stored text overwrites current text only when non-empty; applying stored metadata marks the track metadata-loaded so later same-source syncs update playback stats only.
- Red/green validation: `check:playback-restore` was first extended to fail on the old `artist: stored.artist` merge, then passed after the fix.
- Passed checks: playback-restore, track-display, track-identity, song-info, AI track search, FLAC metadata, build, Electron compile, prompt checks, all-target AI assets, custom images, theme colors, elevated `dist:release`, DMG verify, read-only DMG checks, and Windows NSIS static check.
- Limits: real Windows install, artist-flicker UI verification, playback/pause, latest-folder restore, large-folder load, writeback, AI operation, signing, and notarization remain open.

## 2026-07-03 Cover 01 封面回改 hotfix 0.1.22（歷史）

- 範圍：修正米津玄師 `Cover 01.jpg` 從 `Cover 02.jpg` 改回時，預覽圖與「套用到原始檔」都沒有變成 cover01；若圖片過大，必須明確提示使用者。
- 根因：`Cover 01.jpg` 是正常 JPEG/Exif，1500×1500、4,342,414 bytes；不是特殊壞結構。舊版 `MAX_SONG_COVER_BYTES` 是 3 MB，`Cover 02.jpg` 約 1 MB 可通過，`Cover 01.jpg` 被 `isSupportedSongCoverFile` 擋在預覽與保存前。
- 修正：封面上限調整為 5 MB；Electron writer 的 data URL 解碼上限同步為 5 MB。仍保留上限，避免過大圖片拖慢 M1 MacBook Air 8GB 與大量曲庫情境。
- 錯誤提示：新增 `getSongCoverFileValidationError`，空檔、過大、格式錯誤分開提示。超過上限時顯示「封面圖片太大，請選擇 5 MB 以內的 JPG / PNG」。
- 測試：`song-info-check` 覆蓋 4,342,414 bytes JPEG 可選、超過 5 MB 會有過大提示、GIF 會有格式提示；`song-info-writer-check` 覆蓋 4,342,414 bytes JPEG data URL 解碼。
- 真檔驗證：使用真實 `01. Plazma.flac` 暫存複本，先寫入 `Cover 02.jpg` 並讀回，再寫入 `Cover 01.jpg` 並讀回，PASS；原始音樂檔與封面檔未修改。
- 檢查：`npm run check:song-info` PASS；真實 FLAC cover02 -> cover01 roundtrip PASS；`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:playback-restore` PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run build` PASS；`npm run check:prompts` PASS；all-target `check:ai-assets` PASS；`npm run check:custom-images` PASS；`npm run check:theme-colors` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.22，執行檔為 Mach-O arm64，`app.asar` 存在且含 0.1.22，未找到 0.1.21，prompt 只有三份 `.txt`，AI runtime 只保留 `darwin-arm64`。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、封面寫回、播放/暫停、4 GB 資料夾與 AI 操作實機通過。

0.1.22 hotfix installer（歷史）：

- EXE：667,496,050 bytes，SHA-256 `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`
- arm64 DMG：684,416,428 bytes，SHA-256 `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`

限制：Windows 真機安裝、封面 >3 MB 且 <=5 MB 的 UI 預覽 / 寫回、>5 MB 圖片錯誤提示、FLAC 封面寫回、播放/暫停連點、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、AI 操作與 Mini/dialog focus 尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes `Cover 01.jpg` not replacing `Cover 02.jpg` in preview or original-file writeback, and adds a clear oversized-image message.
- Root cause: `Cover 01.jpg` is a valid JPEG/Exif image, 1500x1500 and 4,342,414 bytes. The old 3 MB cover limit blocked it before preview/writeback.
- Fix: renderer validation and Electron writer cover decode limits are now 5 MB. Oversized images show a clear 5 MB error.
- Real-file validation: a temp copy of `01. Plazma.flac` passed `Cover 02.jpg` write/read followed by `Cover 01.jpg` write/read. Original files were not modified.
- Passed checks: song-info, real FLAC cover roundtrip, track-display, track-identity, playback-restore, AI track search, FLAC metadata, build, prompt checks, all-target AI assets, custom images, theme colors, elevated `dist:release`, DMG verify, read-only DMG checks, and Windows NSIS static check.
- Limits: real Windows install, cover UI/writeback, >5 MB error UX, playback/pause, latest-folder restore, large-folder load, AI operation, signing, and notarization remain open.

## 2026-07-02 顯示、封面、啟動效能 hotfix 0.1.21（歷史）

- 範圍：修正歌曲顯示排序、封面更換後播放清單重開掉歌、封面 cover02 改回 cover01、啟動載入音樂資料庫過慢，以及 AI 建立播放清單時沒有等待提示。
- 顯示：新增 `trackDisplay` helper，現在目前播放卡、歌曲列表與 Mini 會優先顯示 `file.name`，沒有檔名才 fallback 到歌曲 title / name；第二行顯示 artist。
- 播放清單掉歌根因：0.1.19 / 0.1.20 的 Electron 本機 track id 使用 `sourcePath + sourceSize + lastModified`。原始檔寫回封面會改變 size 或 mtime，導致同一首歌重開後變成新 id，舊播放清單 id 找不到。
- 修正：Electron 本機 track id 與 file signature 改以穩定 `sourcePath` 為主；載入曲庫後用保存的 `sourcePath` 將舊播放清單 id remap 到目前 id。
- 封面回改驗證：`SONG_INFO_FIXTURE_PATH=/Users/aquariusgril/Music/.../Rekindled.mp3 node --experimental-strip-types scripts/song-info-writer-check.mjs` 使用真 MP3 暫存複本，先寫 cover02 並讀回，再寫 cover01 並讀回，PASS；原始 fixture 未被修改。
- 啟動效能根因：auto-restore 走 `restore-music-paths -> toSelectedFile -> readSongInfoFromOriginalFile`，每次開啟都逐首讀 taglib metadata / cover。99 首已感覺慢，若上萬首會放大。
- 修正：restore path 預設 `readMetadata: false`，renderer 先用 IndexedDB 保存 metadata / cover 快速還原；使用者要重新讀原始檔時再走明確重讀流程。
- AI UX：AI 助手建立播放清單期間顯示 `role="status"` 等待訊息，並暫時停用輸入與建立按鈕，避免使用者連續送出無效指令。
- 檢查：`npm run check:track-display` PASS；`npm run check:track-identity` PASS；`npm run check:playback-restore` PASS；`npm run check:song-info` PASS；真 MP3 cover02 -> cover01 fixture roundtrip PASS；`npm run check:ai-track-search` PASS；`npm run check:flac-metadata` PASS；`npm run build` PASS；`npm run check:prompts` PASS；all-target `check:ai-assets` PASS；`npm run check:custom-images` PASS；`npm run check:theme-colors` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.21，執行檔為 Mach-O arm64，`app.asar` 存在且含 0.1.21，未找到 0.1.20，prompt 只有三份 `.txt`，AI runtime 只保留 `darwin-arm64`。
- EXE static check：PASS，辨識為 Windows NSIS installer；未在 Windows 真機執行，不能宣稱 Windows fresh install、播放/暫停、4 GB 資料夾、封面回寫與 AI 操作實機通過。

0.1.21 最新 installer：

- EXE：667,496,033 bytes，SHA-256 `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`
- arm64 DMG：684,415,979 bytes，SHA-256 `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`

限制：Windows 真機安裝、播放/暫停連點、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、99 首以上曲庫啟動體感、歌曲資訊寫回、封面 cover02 -> cover01 實機寫回、改封面後播放清單重開不掉歌、AI 建歌單等待狀態與 Mini/dialog focus 尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes track display order, playlist loss after cover writeback, cover02 -> cover01 replacement, slow startup restore, and missing AI playlist busy feedback.
- Root cause: Electron local track ids included `sourceSize` and `lastModified`; cover writeback changes those values, so the same file could become a different track id after restart.
- Fix: local ids now use stable `sourcePath` first, and stored playlist ids are remapped through `sourcePath` during library restore.
- Cover validation: a real MP3 fixture temp copy passed cover02 write/read followed by cover01 write/read. The original fixture was not modified.
- Startup fix: auto-restore skips full taglib metadata / cover reads per file and restores from IndexedDB metadata first.
- Passed checks: track-display, track-identity, playback-restore, song-info, real MP3 cover roundtrip, AI track search, FLAC metadata, build, prompt checks, all-target AI assets, custom images, theme colors, Electron compile, elevated `dist:release`, DMG verify, read-only DMG checks, and Windows NSIS static check.
- Limits: real Windows install, playback/pause click testing, latest-folder restore, large-folder load, real cover writeback, playlist persistence after cover changes, AI busy-state UX, signing, and notarization remain open.

## 2026-07-02 播放與資料夾恢復 hotfix 0.1.20（歷史）

- 範圍：修正播放音樂卡頓、按播放後再按暫停沒有停下、畫面播放狀態閃爍，以及新選擇音樂資料夾後下次啟動未優先恢復新資料夾。
- 根因：`useAudioPlayer` 的 audio source effect 依賴整個 `currentTrack`。播放期間 duration、playCount 或 metadata 寫入都會產生新的 track object，導致 effect 重跑、重設 `audio.src` / `audio.load()`，並在 `isPlaying` 還是 true 時再次呼叫 `audio.play()`。
- 修正：新增穩定的 `currentTrackSource`，只在 `localUrl` 或 `mediaVersion` 改變時重設 source；播放/暫停改由獨立 effect 同步，`isPlaying = false` 時明確呼叫 `audio.pause()`。
- 資料夾恢復：Electron 手動選資料夾時，將該次 selection 的 `sourcePath[]` 寫入既有 IndexedDB settings；啟動 auto-restore 優先使用最後一次手動選擇的來源清單，沒有才退回舊版 tracks metadata。空 selection 不覆蓋最後成功來源。
- 檢查：`npm run check:playback-restore` PASS；`npm run check:song-info` PASS；`npm run check:flac-metadata` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID。DMG 唯讀掛載版本 / 架構讀回本輪因使用限制未完成，不能宣稱 PASS。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 Windows x64 target。未在 Windows 真機執行，不能宣稱 Windows fresh install、播放/暫停、資料夾恢復與 AI 操作實機通過。

0.1.20 最新 installer：

- EXE：667,495,541 bytes，SHA-256 `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`
- arm64 DMG：684,478,119 bytes，SHA-256 `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`

限制：Windows 真機安裝、播放/暫停連點、選擇新資料夾後重開恢復、約 4 GB / 20+ 首資料夾載入、歌曲資訊寫回、AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes playback stutter, unreliable pause, flashing playback state, and latest-folder restore after selecting a new music folder.
- Root cause: the playback source effect depended on the whole `currentTrack`, so duration / play-count / metadata updates could reset `audio.src`, call `audio.load()`, and trigger `audio.play()` again while `isPlaying` was still true.
- Fix: audio source sync now depends on stable `currentTrackSource`; play/pause sync is separate and explicitly pauses when `isPlaying` is false.
- Restore: Electron folder selection saves the latest selected `sourcePath[]` in the existing IndexedDB settings store. Auto-restore prefers that latest manual selection before falling back to stored track metadata.
- Passed checks: playback-restore, song-info, FLAC metadata, build, Electron compile, elevated `npm run dist:release`, DMG verify, and Windows NSIS static check.
- Limits: real Windows install, playback/pause click testing, latest-folder restore after restart, large-folder load, song-info writeback, AI operation, DMG read-only mount version/architecture readback, signing, and notarization remain open.

## 2026-07-02 歌曲資訊寫回 hotfix 0.1.19

- 範圍：修正 0.1.19 初版後回報的歌曲資訊反覆跳動、保存流程打架、重複封面入口，以及 Windows EXE 選擇大型音樂資料夾可能閃退。
- UI：已移除「保存到播放器」與目前播放卡更多選單內的「更換專輯封面」。目前只保留歌曲資訊面板內的封面更換與「套用到原始檔」。
- 狀態同步：`SongInfoPanel` 只在 open / track id 改變時重置 draft；寫回成功後重新讀取原始檔 metadata，`replaceTrackSongInfo` 清除 metadata override，並用 `mediaVersion` 讓 `file://` audio source 重新載入。
- Electron 大檔載入：`select-music-files`、`select-music-folder`、`restore-music-paths` 回傳 `file://` / source path / size / mtime / relative path / metadata，不再回傳整個音檔 `ArrayBuffer`。EXE 選擇約 4 GB 資料夾閃退的可能根因是總檔案 bytes 經 IPC 傳輸造成記憶體壓力，不是 20 多首這個數量本身。
- Writeback：原始檔寫回改用 `TagLib.copyWithTags(source, temp, tags)` 產生同副檔名暫存檔，封面也在暫存檔處理，最後 rename 覆蓋；避免先前 `applyTags()` 回傳 buffer 再自行覆蓋時，真 MP3 複本出現 `RangeError: position -128`。
- 測試踩坑紀錄：已寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。未來不要用 `afconvert` 產生的極短 m4a 代表真實寫回；要用 `SONG_INFO_FIXTURE_PATH` 指向真音檔，並只改 temp copy。
- 檢查：`npm run check:song-info` PASS；`SONG_INFO_FIXTURE_PATH=/Users/aquariusgril/Music/.../Rekindled.mp3 npm run check:song-info` PASS；`npm run check:flac-metadata` PASS；`npm run build` PASS；`npm run electron:compile` PASS。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS。同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.19，執行檔為 Mach-O arm64，`Contents/Resources` 含 `app.asar`、AI 與 prompts。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 Windows x64 target。未在 Windows 真機執行，不能宣稱 Windows fresh install、4 GB 資料夾選擇、播放、寫回與 AI 操作實機通過。

0.1.19 hotfix installer（歷史）：

- EXE：667,495,272 bytes，SHA-256 `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`
- arm64 DMG：684,463,396 bytes，SHA-256 `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`

限制：Windows 真機安裝、約 4 GB / 20+ 首資料夾選擇、播放、歌曲資訊寫回、封面寫回與 AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。

### English QA Summary

- Scope: fixes song-info jumping, save-flow conflicts, duplicate cover-entry UI, and the likely large-folder selection crash path from the initial 0.1.19 build.
- UI: player-local save and the duplicate More-menu cover button were removed. Original-file writeback is now the only save path.
- Electron selection: file/folder selection no longer sends whole audio `ArrayBuffer`s through IPC; it returns `file://`, source path, size, mtime, relative path, and metadata.
- Writeback: original-file writes use `TagLib.copyWithTags(source, temp, tags)`, then optional cover writing on the temp file, then rename. A real MP3 fixture copy write/read check passed.
- Passed checks: song-info, real MP3 fixture write/read, FLAC metadata, build, Electron compile, elevated `npm run dist:release`, DMG verify, read-only DMG version / arm64 checks, and Windows NSIS static check.
- Limits: real Windows install, large-folder selection, playback, original-file writeback, AI operation, signing, and notarization remain open.

## 2026-07-02 歌曲資訊與原始檔標籤寫回發行 0.1.19

- 範圍：延續 0.1.18，新增目前播放卡「更多」選單、歌曲資訊面板、單曲封面更換、重新讀取音樂標籤、顯示原始檔位置，以及桌面版 MP3/FLAC/M4A 原始檔 metadata / cover 寫回。
- 安全邊界：仍只處理使用者明確加入播放器的本機音樂；不掃描硬碟、不上傳音樂檔、不保存音樂檔本體、`File`、`Blob`、`ArrayBuffer` 或 object URL。原始檔寫回前要求確認。
- Writeback：`taglib-wasm` 在 Electron main process 執行；先產生修改後 bytes，再用 temporary file + rename 寫回。失敗時回傳「寫回原始檔失敗，原始檔未修改」。
- Reload：寫回成功後，Electron 版由主程序重新讀取原始檔標籤，避免 FLAC/M4A 使用舊 renderer parser 而顯示不同步。
- 檢查：`npm run check:song-info`、`npm run check:prompts`、`npm run check:ai-track-search`、`npm run check:ai-assets`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、playlist logic、FLAC metadata、custom images、theme colors 均 PASS。
- 打包：一般沙盒 `npm run dist:release` 在 macOS `hdiutil create` 失敗；升權重跑 `npm run dist:release` PASS。只同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.19，執行檔為 Mach-O arm64。包內 `Contents/Resources/prompts/` 只有三份 `.txt` prompt，未偵測到 prompt `.bin`；AI runtime 在 DMG 只保留 `darwin-arm64` 目錄；packaged `app.asar` 含 `taglib-wasm` 與 `dist-electron/songInfoWriter.js`。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 Windows x64 target。未在 Windows 真機執行，無法宣稱 Windows fresh install、播放、寫回與 AI 操作實機通過。

0.1.19 初版 installer（歷史）：

- EXE：667,494,676 bytes，SHA-256 `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`
- arm64 DMG：684,445,307 bytes，SHA-256 `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`

限制：Windows 真機安裝、播放、寫回原始檔與 AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。未用使用者真實本機音樂資料重跑完整人工點擊流程。

### English QA Summary

- Scope: 0.1.19 adds the current-track More menu, song info panel, per-track cover changes, metadata reload, show original file location, and desktop MP3/FLAC/M4A original metadata / cover writeback.
- Safety: the app still only touches local music explicitly added by the user. It does not scan disks, upload music files, or persist music file bodies, `File`, `Blob`, `ArrayBuffer`, or object URLs. Original-file writeback requires confirmation.
- Writeback: `taglib-wasm` runs in Electron main, produces modified bytes first, then writes through a temporary file and rename. Failures report that the original file was not modified.
- Passed checks: song-info, prompts, AI track search/schema, AI assets, all-target AI assets, build, Electron compile, playlist logic, FLAC metadata, custom images, theme colors, elevated `npm run dist:release`, DMG verify, packaged version/architecture checks, and Windows NSIS static check.
- Limits: real Windows install, playback, original-file writeback, and AI operation remain unverified. Developer ID/notarization and Windows code signing are still not configured.

## 2026-06-29 AI playlist schema / result guard 發行 0.1.18

- 範圍：延續 0.1.17 main，補強三份 prompt、router schema 正規化、summary-only result guard、safe reply fallback、本次候選 trackId 驗證，以及 AI 聊天室禁止模型列歌曲清單。
- Prompt：仍只保留 `private/prompts/character_prompt.txt`、`private/prompts/ai_router_prompt.txt`、`private/prompts/ai_reply_prompt.txt` 三份開源文字檔，未新增 prompt 檔。
- Harness：工具 intent 會強制 `reply_level = summary_only`、`allow_track_list_output = false`、`reply = ""`；模型回覆若疑似歌曲清單或提到候選 track title，顯示前改用程式 safe reply。
- UI：AI 聊天室不再顯示候選歌曲 title；「列出剛剛建立的播放清單有哪些歌」會提示查看播放清單區塊，歌曲列表仍由 UI 依 `playlist.trackIds` 渲染。
- 檢查：`npm run check:prompts`、`npm run check:ai-track-search`、`npm run check:ai-assets`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors 均 PASS。
- 打包：升權 `npm run dist:release` PASS；只同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.18，執行檔為 Mach-O arm64。包內 `Contents/Resources/prompts/` 只有三份 `.txt` prompt，未偵測到 prompt `.bin`；AI runtime 只保留 `ai/bin/darwin-arm64/llama-server`；packaged `app.asar` 找到 0.1.18 且未找到 0.1.17。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 Windows x64 target。未在 Windows 真機執行，無法宣稱 Windows fresh install 與 AI 操作實機通過。

最新 installer：

- EXE：667,082,736 bytes，SHA-256 `e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`
- arm64 DMG：683,806,607 bytes，SHA-256 `0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`

限制：Windows 真機安裝與 AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。未用使用者真實本機音樂資料重跑完整人工點擊流程。

### English QA Summary

- Scope: 0.1.18 continues from 0.1.17 main and strengthens the three prompts, router schema normalization, summary-only result guard, safe reply fallback, candidate trackId validation, and the no-model-track-list chat rule.
- Prompts: still exactly three open prompt files: `character_prompt.txt`, `ai_router_prompt.txt`, and `ai_reply_prompt.txt`.
- Harness: tool intents force `reply_level = summary_only`, `allow_track_list_output = false`, and empty `reply`. Model replies that look like track lists or mention candidate track titles are replaced with safe app-generated replies before display.
- UI: the AI chat no longer renders candidate track titles. Track lists remain rendered by the playlist UI from `playlist.trackIds`.
- Passed checks: prompt check, AI track search/schema check, AI assets, all-target AI assets, build, Electron compile, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, elevated `npm run dist:release`, DMG verify, packaged version/architecture/prompt/runtime checks, and Windows NSIS static check.
- Limits: real Windows install and AI operation remain unverified. Developer ID/notarization and Windows code signing are still not configured.

## 2026-06-29 GitHub main 合併 0.1.17

- 範圍：依使用者同意合併 `codex/ai-harness-0.1.17` 到 `main`，讓 GitHub main source 與 0.1.17 文件 / installer 狀態一致。
- 衝突處理：README、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/QA_REPORT.md`、`release-delivery/VERSION.md` 保留 main 較新的中英文件；0.1.17 source、AI harness、prompt、runtime checks 與 workflow 採分支內容。
- 驗證：`package.json` 讀回版本為 0.1.17；`git diff --check`、衝突標記掃描、`check:prompts`、`check:ai-assets`、`check:ai-track-search`、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、`npm run build`、`npm run electron:compile` 均通過。`resources/ai/models/qwen3.5-0.8b.gguf` 未納入 Git；installer 未納入 Git。
- 限制：本次是 source / GitHub 內容合併，未重打 installer；現有 0.1.17 EXE / DMG 仍沿用 2026-06-28 已驗收檔案。

### English QA Summary

- Scope: merged `codex/ai-harness-0.1.17` into `main` with user approval so GitHub main source matches the 0.1.17 docs and installer status.
- Conflict handling: kept the newer bilingual main versions of README, `release-delivery/INSTALLER_STATUS.md`, `release-delivery/QA_REPORT.md`, and `release-delivery/VERSION.md`; took the 0.1.17 source, AI harness, prompts, runtime checks, and workflow from the branch.
- Verification: `package.json` reads as version 0.1.17. `git diff --check`, conflict-marker scan, `check:prompts`, `check:ai-assets`, `check:ai-track-search`, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, `npm run build`, and `npm run electron:compile` all passed. `resources/ai/models/qwen3.5-0.8b.gguf` and installers are not tracked by Git.
- Limit: this is a source / GitHub content merge, not an installer rebuild. The existing 0.1.17 EXE / DMG remain the 2026-06-28 validated files.

## 2026-06-29 GitHub 內容盤點（合併前記錄）

- 範圍：檢查 GitHub `main` 應公開的主要內容，包括根 `README.md`、根 `CONTINUE_WORK.md`、`release-delivery/*.md`、`package.json`、`package-lock.json`、`.github/workflows/release.yml` 與本地分支狀態。
- 結果：根 `README.md` 與 `release-delivery/README.md` 已有中英交付檔案索引；`release-delivery` 文件已更新 0.1.16 / 0.1.17 AI、QA、installer 與人工驗收缺口。
- 合併前發現：GitHub `main` 的程式碼與 `package.json` 停在 0.1.15；完整 0.1.17 程式變更位於已推送分支 `codex/ai-harness-0.1.17`。
- 後續修正：已明確合併 `codex/ai-harness-0.1.17` 到 `main`，並保留 `main` 較新的 README / release-delivery 文件。
- 安全：本地大模型 `resources/ai/models/qwen3.5-0.8b.gguf` 不應進 Git；`.gitignore` 需保留 `resources/ai/models/*.gguf` 與 `resources/ai/bin/darwin-x64/`。本次未重打 installer。

### English QA Summary

- Scope: checked the main GitHub-facing content: root `README.md`, root `CONTINUE_WORK.md`, `release-delivery/*.md`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, and local branch status.
- Result: root `README.md` and `release-delivery/README.md` include the bilingual delivery file index. `release-delivery` docs cover the 0.1.16 / 0.1.17 AI, QA, installer, and manual-QA gaps.
- Pre-merge finding: GitHub `main` source code and `package.json` were still at 0.1.15. The complete 0.1.17 source changes were on the pushed `codex/ai-harness-0.1.17` branch.
- Resolution: `codex/ai-harness-0.1.17` has been merged into `main` while keeping the newer README / release-delivery docs from `main`.
- Safety: the local large model `resources/ai/models/qwen3.5-0.8b.gguf` should not enter Git. Keep `resources/ai/models/*.gguf` and `resources/ai/bin/darwin-x64/` ignored. Installers were not rebuilt in this docs-only pass.

## 2026-06-28 AI harness、開源 prompt 與雙平台發行 0.1.17

- 範圍：版本更新至 0.1.17；新增薄層 AI harness、intent router、skill registry 與 deterministic response composer。小模型只判斷 intent 與潤飾工具結果；本機歌曲搜尋、隨機歌單、建立歌單、加入歌單與移除安全提示仍由播放器程式執行。
- Prompt：`private/prompts/character_prompt.txt`、`private/prompts/ai_router_prompt.txt`、`private/prompts/ai_reply_prompt.txt` 為開源明文 prompt；移除 secure prompt service、prompt key、encrypt/check secure prompt 腳本與 `.bin` bundle。`npm run check:prompts` PASS，並會擋掉舊的 prompt `.bin`。
- 打包目標：只產 `Aquariusgirl Music Room-0.1.17-arm64.dmg` 與 `Aquariusgirl Music Room Setup 0.1.17.exe`；不再產 macOS x64 DMG、universal 或 Linux installer。`release-delivery/installers/` 只有兩個檔案，`release/` 不存在。
- 檢查：`npm run check:prompts`、`npm run check:ai-track-search`、`node scripts/playlist-logic-check.mjs`、`node scripts/mini-opacity-check.mjs`、`npm run check:flac-metadata`、`npm run check:custom-images`、`npm run check:theme-colors`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile` 均 PASS。
- 打包：一般沙盒 `npm run dist:release` 在 macOS `hdiutil create` 失敗；升級權限重跑 `npm run dist:release` PASS，產出兩個 installer 並同步至唯一交付位置。
- DMG 驗證：`hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.17，執行檔為 Mach-O arm64。包內 `Contents/Resources/prompts/` 只有三份 `.txt` prompt，未偵測到 prompt `.bin`；AI runtime 只保留 `ai/bin/darwin-arm64/llama-server`，模型為 `qwen3.5-0.8b.gguf`。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 Windows x64 target。未在 Windows 真機執行，無法宣稱 Windows fresh install 與離線 AI 實機通過。

最新 installer：

- EXE：667,081,163 bytes，SHA-256 `b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- arm64 DMG：683,782,606 bytes，SHA-256 `c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

限制：Windows 真機安裝與 AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。未用使用者真實本機音樂資料重跑完整人工點擊流程。

### English QA Summary

- Scope: 0.1.17 adds a thin AI harness, intent router, skill registry, and deterministic response composer. The small model only routes intent and polishes real tool results; app code still performs local music search, random playlists, playlist creation, playlist insertion, and safe removal guidance.
- Prompts: `character_prompt.txt`, `ai_router_prompt.txt`, and `ai_reply_prompt.txt` are open text prompts. Secure prompt service, prompt key, encrypted prompt scripts, and `.bin` prompt bundles were removed. `npm run check:prompts` passed and rejects old prompt `.bin` files.
- Packaging target: only `Aquariusgirl Music Room-0.1.17-arm64.dmg` and `Aquariusgirl Music Room Setup 0.1.17.exe`. No macOS x64, universal, or Linux installer is produced.
- Passed checks: `npm run check:prompts`, `npm run check:ai-track-search`, `node scripts/playlist-logic-check.mjs`, `node scripts/mini-opacity-check.mjs`, `npm run check:flac-metadata`, `npm run check:custom-images`, `npm run check:theme-colors`, all-target `check:ai-assets`, `npm run build`, and `npm run electron:compile`.
- Packaging: plain sandbox `npm run dist:release` failed at macOS `hdiutil create`; rerunning the same command with elevated permission passed and synced the two installers.
- DMG: `hdiutil verify` VALID. Read-only mount confirmed app version 0.1.17, Mach-O arm64, only prompt `.txt` files, no prompt `.bin`, `darwin-arm64/llama-server`, and `qwen3.5-0.8b.gguf`.
- EXE: static check passed as Windows NSIS x64 target. Real Windows install and AI operation remain unverified.

## 2026-06-28 AI 播放清單真實歌曲與歌單區分頁 0.1.16

- 範圍：版本更新至 0.1.16；AI 建立播放清單只允許使用目前已載入/已索引的真實 `tracks`，隨機歌單從真實歌曲抽樣，關鍵字歌單走 metadata/別名/mood scoring，找不到時回覆找不到並不建立假歌。移除模型聊天上下文記憶，只送本次提示。
- UI：AI 助手從獨立右側面板移入 `PlaylistSidebar`，以 `歌單 / AI 助手` segmented tabs 切換。左側播放器、Mini、Visualizer、SleepTimer、外觀設定未改。
- Audit 文件：`docs/AI_PLAYLIST_AUDIT_0.1.16.md`、`docs/UI_REVIEW_0.1.16.md`、`docs/QA_CHECKLIST_0.1.16.md` 已建立；AI 建歌單 action log 開發版 append 到 `docs/AI_PLAYLIST_ACTION_LOG.md`，打包版寫入 userData。
- 最小搜尋方案：未新增 embedding/向量模型；現況沒有 vector DB。依 Ponytail 原則先用標準字串正規化、別名擴展與 metadata scoring，避免新增大型依賴與啟動成本。
- 檢查：`npm run check:ai-track-search`、`node scripts/playlist-logic-check.mjs`、`node scripts/mini-opacity-check.mjs`、`npm run check:flac-metadata`、`npm run check:custom-images`、`npm run check:theme-colors`、`npm run check:secure-prompts`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile` 均 PASS。
- UI 驗證：瀏覽器預覽確認右側 `Playlists` 卡有 `歌單 / AI 助手` 分頁，獨立 AI panel 數量為 0；切到 AI 助手後可看到內嵌 AI 內容。
- 打包：`npm run dist:mac`、`npm run dist:win` 均 PASS；唯一交付位置有三個 0.1.16 installer，`release/` 不存在。
- DMG 驗證：兩個 DMG `hdiutil verify` 均 VALID；唯讀掛載後 `CFBundleShortVersionString`／`CFBundleVersion` 均為 0.1.16，執行檔分別為 x86_64／arm64。兩者均包含模型與加密 prompt bundle。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 Windows x64 target。未在 Windows 真機執行，無法宣稱 Windows fresh install 與 AI 建歌單真機通過。

最新 installer：

- EXE：667,076,153 bytes，SHA-256 `38a37f0d4cbab4237439fccb5d24baf1b6319e8dadaee5fa325159f8907f4af7`
- arm64 DMG：683,788,448 bytes，SHA-256 `04e348006c00df084a7d08ad3c8ec8b564bc998bb9be6ac6cf21627501b1131c`
- x64 DMG：686,083,848 bytes，SHA-256 `a90098927ffcc360f42b4624e7fc26357625710040be857c659acd22dcb223d3`

限制：Windows 真機安裝與 AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。未用使用者真實本機音樂資料重跑完整人工點擊流程。

### English QA Summary

- Scope: 0.1.16 fixes AI playlist creation so generated playlists only use real currently loaded or indexed `tracks`. Random playlists sample real songs. Keyword playlists use metadata, aliases, and mood scoring. Missing matches report no match and do not create fake songs.
- UI: the AI assistant moved from a separate right-side panel into `PlaylistSidebar` as `Playlists / AI Assistant` segmented tabs. Player, Mini, Visualizer, SleepTimer, and appearance settings were not changed.
- Audit docs: `docs/AI_PLAYLIST_AUDIT_0.1.16.md`, `docs/UI_REVIEW_0.1.16.md`, and `docs/QA_CHECKLIST_0.1.16.md` were created. Dev action logs append to `docs/AI_PLAYLIST_ACTION_LOG.md`; packaged action logs write to userData.
- Search approach: no embedding or vector model was added. The release uses normalization, aliases, and metadata scoring first.
- Passed checks: `npm run check:ai-track-search`, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, secure prompts, all-target AI assets, build, Electron compile, `dist:mac`, and `dist:win`.
- DMG: both DMGs verified VALID and read-only mount confirmed version 0.1.16 with x86_64 / arm64 architectures. EXE static check passed as Windows NSIS x64 target. Real Windows install and AI playlist runtime remain unverified.

## 2026-06-28 14:32 聊天整合 AI 播放清單 0.1.15

- 範圍：把 AI 建立播放清單整合進聊天；音樂相關對話先詢問是否整理，取得同意或直接要求建立播放清單後才產生候選歌單。新增極短本機上下文記憶與首次載入模型提示；未新增套件或第二套歌單流程。
- Prompt 保護：`npm run encrypt:prompts` PASS；短 prompt 包明文 193 bytes，產物為 `resources/ai/prompts/aquariusgirl_prompt.bundle.bin`，227 bytes，SHA-256 `4b31df90da9ba6af851a851cdba9d32bbed6529ff8a3330fc124296af34f278d`。`private/prompts/*.txt` 已被 `.gitignore` 排除；`check:secure-prompts` 在 build 後 PASS。
- AI assets：`resources/ai/models/qwen3.5-0.8b.gguf` 為 Qwen3.5 0.8B Q4_K_M GGUF，532,517,120 bytes，SHA-256 `bd258782e35f7f458f8aced1adc053e6e92e89bc735ba3be89d38a06121dc517`；all-target `check:ai-assets` PASS，涵蓋 darwin-arm64、darwin-x64、win32-x64。
- 安全邊界：新增 IPC 只使用 `aquariusgirl:` 前綴；沒有 `getSystemPrompt`、`dumpPrompt`、`readPrompt`、`exportPrompt`。Renderer 沒有 Node `fs/path` import；AI 歌曲搜尋摘要不包含 `sourcePath`、`localUrl`、`File`、`Blob`、`ArrayBuffer` 或封面 URL。
- `npm run check:ai-track-search`：PASS，驗證 AI 搜尋摘要不含本機路徑，本機 deterministic scoring 可依 artist、likedOnly、mood 與時間上限找歌，也涵蓋「建立播放清單」、音樂相關提問、同意語句與聊天上下文摘要。
- `npm run build`、`npm run electron:compile`：PASS。
- `npm run dist:mac`、`npm run dist:win`：PASS；唯一交付位置有三個 0.1.15 installer，`release/` 不存在。
- DMG 驗證：兩個 DMG 唯讀掛載 CRC 通過；`CFBundleShortVersionString`／`CFBundleVersion` 均為 0.1.15，執行檔分別為 x86_64／arm64。x64 DMG 只保留 `ai/bin/darwin-x64/llama-server`；arm64 DMG 只保留 `ai/bin/darwin-arm64/llama-server`；兩者均只在 prompt 目錄看到 `.bin`。
- EXE static check：PASS，辨識為 Windows NSIS installer；builder log 顯示 win-unpacked 使用 `resources/ai/bin/win32-x64`。本機 `bsdtar` 無法列出 NSIS 內容；未在 Windows 真機執行，無法宣稱 Windows fresh install、離線聊天與 AI 建歌單已真機通過。

最新 installer：

- EXE：667,074,540 bytes，SHA-256 `e2feba0e6a9fd466f4a339bd0bdb57031ff7a4631f3247ccd91856e2a4e34921`
- arm64 DMG：683,827,707 bytes，SHA-256 `717eb5d5edda12552d85407fb3309f9a3842c13e2940e521c0c72af827bb0680`
- x64 DMG：686,010,422 bytes，SHA-256 `0416418659b2439f09450180062b7572984c3d8cb672593dbdf975b7bcf090e4`

限制：Windows 真機安裝與 AI 操作尚未驗收；macOS DMG 未做 Apple Developer ID 簽章或 notarization；Windows EXE 未做 code signing。完整播放器互動回歸本輪未重跑 GUI，只完成 build、source checks、packaged static 與 DMG mount。

## 2026-06-22 17:44 歌詞／LRC 殘留清理 0.1.15

- 範圍：同步歌詞 UI、LRC 匯入與自動配對先前已移除；本輪只刪 README、新手引導及未使用的歌詞型別、IndexedDB 讀寫、設定匯入匯出欄位，未改播放、歌單、Mini 或外觀邏輯。
- 資料保護：不升 IndexedDB 版本、不刪既有退役 store；舊資料保留在使用者本機但不再建立、讀取、寫入或匯出。
- `rg` 掃描 `src`、`electron`、`scripts`、`dist`、`dist-electron`、README：PASS，無 LRC／歌詞／字幕功能殘留。
- `playlist-logic-check`、Mini opacity、FLAC metadata、custom image、theme color、`npm run build`、`npm run electron:compile`：PASS。
- `npm run dist:all`：PASS；三個 0.1.15 installer 已同步到唯一交付位置，`release/` 不存在。
- 兩個 DMG `hdiutil verify`：VALID；`CFBundleShortVersionString`／`CFBundleVersion` 均為 0.1.15，執行檔分別為 arm64／x86_64。
- arm64 packaged `file://`：PASS；URL 指向 DMG App 的 `app.asar/dist/index.html`，JS／CSS 使用相對路徑；隔離 userData 新手引導第 3 步只顯示收藏、歌單與睡前定時，主畫面無 LRC／歌詞入口。
- EXE static check：PASS，辨識為 Windows x64 目標 NSIS installer；未在 Windows 真機執行。

最新 installer：

- EXE：134,367,515 bytes，SHA-256 `df47559e42f427183a37afd6a0a9cf964654496efa21ea6526a5939c84b9ce16`
- arm64 DMG：149,348,842 bytes，SHA-256 `bb7f6b6bbaf2d0533b281536ef3aa3da2cdbb287153561a6473bb506e42c1907`
- x64 DMG：151,297,405 bytes，SHA-256 `969ba94c1b06b80730684d94b8b7fe100dae1b4c92763ffda49886dc76b38fed`

限制：Windows EXE 尚未真機執行；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-21 23:54 目前播放卡加入歌單修正 0.1.14

- 根因一：目前播放卡原生 `select` 使用 `max-w-36`；加入歌曲後 option 變成「已在…」，原生欄位會依文字重新計算寬度。修正為 `w-36 shrink-0`，未改播放器 Grid、歌單資料結構或其他 UI。
- 根因二：重複加入仍使用 `window.confirm()`；Windows 原生 modal 可能造成焦點／視窗阻塞。保留原有「仍然加入第二筆」語意，僅改成 renderer 內 `PlaylistDuplicateDialog`，取消預設取得焦點，未新增套件。
- Recovery：candidate 5 再次只讀驗證為 14 首、re0 2 首、米津玄師 4 首及智慧／系統歌單完整。首次只回寫 IndexedDB 後，0.1.13 會由殘留 Local Storage 的 3／5 狀態覆寫；已保留該狀態備份，再將 candidate 5 的 IndexedDB 與 Local Storage 一致恢復。0.1.13 與 0.1.14 packaged 啟動後均再次確認正式資料維持 14／2／4，原始音樂檔未改動。
- `playlist-logic-check`、custom image、FLAC metadata、Mini opacity、theme color、`npm run build`、`npm run electron:compile`：PASS。
- 隔離 Electron `file://` GUI：PASS；同一首歌依序加入 re0 與米津玄師後欄位不放大；重複加入 renderer dialog 可取消、可再次確認，播放與其他控制未鎖死。
- `npm run dist:all`：PASS；唯一交付位置有三個 0.1.14 installer，`release/` 不存在。EXE static check 為 Windows NSIS installer；未在 Windows 真機執行。
- 兩個 DMG `hdiutil verify`：VALID；封裝版本均為 0.1.14，執行檔分別為 arm64／x86_64，兩個測試映像已卸載。
- arm64 packaged `file://`：PASS；URL 指向 DMG App 的 `app.asar/dist/index.html`，14 首、re0 2 首、米津玄師 4 首可恢復。每次重新取得 accessibility tree 後完成一般視窗→MINI→一般視窗；隔離 packaged App 亦確認「已在 re0」會開 renderer dialog，取消後播放與歌單正常。

最新 installer：

- EXE：134,367,343 bytes，SHA-256 `a9c88a5183a01e889aaead12731dbe597a010eaf0b084c9001edff8fddba2dc2`
- arm64 DMG：149,348,201 bytes，SHA-256 `562b4d248100dfda1e36432b5cbdc78dfcdadf6c449689ab4f42a1ebf7bf5436`
- x64 DMG：151,296,466 bytes，SHA-256 `f94da4f1074d1b7b089993a27e0aae8ada10c401fde012be28ca3d41ef757687`

限制：Windows EXE 尚需真機確認目前播放卡連續加入兩個歌單、重複加入 dialog 不鎖死，以及既有最大化→MINI／拖曳／版面手順；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-21 19:11 一般視窗啟動 0.1.13（事故記錄；recovery 已於 0.1.14 完成）

- 根因：Electron 啟動固定要求 `1280×860`；工作區較小時會被 macOS 夾成近乎全畫面，也增加首屏繪製面積。
- 修正：沿用既有 `getCenteredFullBounds()`，寬高在較小工作區使用 90%，啟動直接套用同一組置中 bounds；大螢幕仍以 `1280×860` 為上限。未新增設定、套件或狀態保存。
- Mini／播放／外觀與其他 UI 未修改；`mini-opacity-check` 已新增啟動 bounds 回歸斷言。
- 全部既有檢查、`npm run build`、`npm run electron:compile`、Electron dev 一般視窗啟動與 MINI 往返：PASS。
- `npm run dist:all`：PASS；0.1.13 三個 installer 已同步到唯一交付位置，`release/` 不存在。兩個 DMG checksum：VALID；封裝版本均為 0.1.13，架構分別為 arm64／x86_64；EXE static check 為 NSIS installer。
- arm64 packaged `file://` 一般視窗啟動、品牌素材與 preload 原生選檔 dialog：PASS。
- packaged MINI 最終手順當時未完成。原生 dialog 返回後 GUI 驗收工具沿用失效元素編號，誤觸「清空播放清單」。音樂原始檔未刪除；當時正式 `file__0` IndexedDB metadata 為空，已由上方 0.1.14 recovery 完成恢復。
- Recovery：完整 userData 備份位於 `/private/tmp/Aquariusgirl Music Room-backup-20260621-1901`；已驗證 recovery candidate 5 可讀回 14 首歌曲與全部歌單，位於 `/private/tmp/Aquariusgirl Music Room-recovery-candidate-5`。正式寫回命令在執行前被 Codex 用量限制拒絕，未發生部分搬移；23:27 CST 後接續。

目前 installer：

- EXE：134,367,219 bytes，SHA-256 `d4514ea3237d8fe259c2aeee659227b069dfb30b5f9c7bd9ce0091a082b7f50d`
- arm64 DMG：149,348,001 bytes，SHA-256 `aa633b8d5aa44a2e1b6b584544770a17c95b4717279479d4a9039b47c91f3667`
- x64 DMG：151,317,700 bytes，SHA-256 `ec62642007c1c78eac70dd20b05d6bac955a79659e1ba24c82e7e9acbc8572a3`

後續：正式 recovery、packaged MINI 往返、DMG 卸載與文件更新已由 0.1.14 完成；Windows 真機與正式簽章仍未完成。

## 2026-06-21 14:10 Windows 最大化切換 MINI／拖曳修正 0.1.12

- 根因：最大化或全螢幕狀態未解除就直接套用固定 MINI bounds，Windows 可能保留原生全視窗狀態；Windows 標題列安全區又位於既有拖曳卡片外，頂部不能拖曳。
- 修正：進入 MINI 前保存 normal bounds，依序解除 full screen／maximize，再套固定 MINI bounds；只替 MINI 根節點補上既有 `app-drag-region`，控制區維持 `app-no-drag`。未新增套件或視窗。
- `mini-opacity-check` 新增狀態切換順序、頂部拖曳區與控制區 no-drag 斷言；播放清單、圖片、FLAC、色彩、Mini 檢查、`npm run build`、`npm run electron:compile`：PASS。
- Electron dev GUI：PASS；macOS 原生全螢幕切入 MINI 後固定版面正常，頂部可執行拖曳，並可返回完整播放器。Windows `isMaximized()` 專屬分支仍需 Windows 真機驗收。
- `npm run dist:all`：PASS；三個 0.1.12 installer 已同步到唯一交付位置 `release-delivery/installers/`，`release/` 不存在；EXE static check 為 NSIS installer。
- 兩個 DMG `hdiutil verify`：VALID；唯讀掛載後的 `CFBundleShortVersionString`／`CFBundleVersion` 均為 0.1.12，執行檔分別為 arm64／x86_64，本輪兩個測試映像均已卸載。
- arm64 packaged `file://`：PASS；從 DMG 內 App 啟動，URL 指向 `app.asar/dist/index.html`，JS／CSS／品牌素材正常；原生選檔 dialog 可開啟並取消，preload IPC smoke test 通過。
- packaged GUI：PASS；macOS 原生全螢幕可切入固定 MINI，MINI 版面完整、頂部拖曳可操作，並可返回完整播放器。

目前 installer：

- EXE：134,367,104 bytes，SHA-256 `41686e855bb514328c57d797e74f16eda31b3a3f035c5407e83d92b623478865`
- arm64 DMG：149,345,033 bytes，SHA-256 `20040d2dd0104810e6599e0d434a92ec99eaa9a986eb4895266ffe54587d100f`
- x64 DMG：151,330,399 bytes，SHA-256 `9af0ff8b1b6933580d62713d85aa96890541f88d52003c5e7096a9ba66cfca4c`

限制：Windows EXE 尚未在 Windows 真機重跑最大化→MINI、拖曳與版面手順；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-21 13:33 加入歌單欄位固定寬度 0.1.11

- 根因：歌曲列原生 `select` 使用 `max-w-32`，瀏覽器會依每首歌的選項文字（包含「已在某歌單」）計算不同的自身寬度。
- 修正：只將欄位改為 `w-32 shrink-0`；未改 Grid、歌名、播放清單行為或其他 UI，未新增套件。
- `playlist-logic-check` 新增固定寬度與禁止 `max-w-32` 回歸斷言；播放清單、圖片、FLAC、色彩、Mini 檢查、`npm run build`、`npm run electron:compile`：PASS。
- Electron dev GUI：PASS；匯入長短檔名兩首測試 WAV，建立超長歌單名稱並讓其中一首出現「已在歌單」長選項後，兩列「加入歌單」欄位仍同寬，收藏／刪除按鈕保持對齊。
- arm64 packaged `file://`：PASS；App、相對資源與 preload 正常載入。`npm run dist:all`：PASS。
- 兩個 DMG `hdiutil verify`：VALID；封裝版本均為 0.1.11，架構分別為 arm64 / x86_64，測試掛載均已卸載。
- EXE static check：PASS，為 Windows NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 不存在。

最新 installer：

- EXE：134,367,033 bytes，SHA-256 `556561a2e87d1265b2d0d0cae91d471655356218d6880beec81d6b2e07de86ec`
- arm64 DMG：149,347,642 bytes，SHA-256 `c9a41bf19828790f7632439be936cfc2dc1de07bed13890611759106199bf5de`
- x64 DMG：151,295,621 bytes，SHA-256 `1c527db042d0c923ca87b526af3e7b0cf3c46286f69e740ad8a759f128064f07`

限制：Windows EXE 尚未在 Windows 真機確認截圖中的多列欄位同寬；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-21 11:03 Windows MINI 間距／堆疊修正 0.1.10

- 根因：Windows 原生標題列占用約 20px，但 MINI 外框仍沿用 macOS 的 `260×268`，可用內容高度被壓縮，造成欄位間距視覺不一致並與原生視窗按鈕堆疊。
- 修正：Windows MINI 固定為 `260×288`，renderer 保留 20px 原生標題列安全區；macOS 維持 `260×268`。進度列固定為與音量列相同的 20px 行高。
- 只修改 Electron MINI 尺寸、`MiniPlayerAssistant` 三個 class／判斷與既有 Mini 檢查；未改播放、透明度、歌單或新增套件。
- `mini-opacity-check` 新增 Windows 高度、安全區與進度列行高斷言；播放清單、圖片、FLAC、色彩、Mini 檢查、`npm run build`、`npm run electron:compile`：PASS。
- Electron dev 與 arm64 packaged `file://`：PASS；MINI 無堆疊、無捲軸、控制可操作並可返回完整播放器。
- `npm run dist:all`：PASS；兩個 DMG `hdiutil verify`：VALID；封裝版本均為 0.1.10，架構分別為 arm64 / x86_64，測試掛載均已卸載。
- EXE static check：PASS，為 Windows NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 不存在。

最新 installer：

- EXE：134,367,001 bytes，SHA-256 `5200e4f0432b83d31b973f73e0909554a424e05cd5abb4e087033659bf426aa5`
- arm64 DMG：149,347,464 bytes，SHA-256 `1fdabd57eff6ce78b3fa2774b8ef15c587ce0fad636aa7267f1bccb603962ac8`
- x64 DMG：151,296,013 bytes，SHA-256 `594bb0e13085cb4211ab7e511744fd580bf7cdb745b8348c4cad01fde5dc4068`

限制：Windows EXE 尚需在 Windows 真機確認原生視窗按鈕不再壓住標題卡、四列控制間距一致；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-21 10:26 Windows MINI 尺寸漂移修正 0.1.9

- 根因：MINI 模式每 2 秒讀回實際視窗 bounds，再把讀回的寬高當成下一輪尺寸；Windows DPI／標題列若產生差值，播放或未播放都會持續累積放大。
- 修正：只保存 MINI 的 `x/y` 位置；每次套用 bounds 都把寬高固定為既有 `260×268`。只修改 Electron 視窗 bounds 路徑，未改播放器、UI、透明度或新增套件。
- `mini-opacity-check` 新增固定寬高回歸斷言；播放清單、圖片、FLAC、色彩、Mini 檢查、`npm run build`、`npm run electron:compile`：PASS。
- Electron dev 與 arm64 packaged `file://`：PASS；未播放狀態跨多輪 2 秒 bounds 回寫後仍維持 `260×268`，可正常返回完整播放器。
- `npm run dist:all`：PASS；兩個 DMG `hdiutil verify`：VALID；封裝版本均為 0.1.9，架構分別為 arm64 / x86_64，測試掛載均已卸載。
- EXE static check：PASS，為 Windows NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 不存在。

最新 installer：

- EXE：134,366,877 bytes，SHA-256 `4ce034653261c6fa808c5970112b4d3adead7f3f8ef6a80c88c5494d8c764ba3`
- arm64 DMG：149,346,887 bytes，SHA-256 `65af95bf13ecaafd3803b346d9dfcce8bcf517baf787f06e8b0fbbf3b23bd1b2`
- x64 DMG：151,296,096 bytes，SHA-256 `7aa2600ba506d8f5451fd70dfe653f05755c9138353545fbc930f1c1311a2c0c`

限制：Windows EXE 尚未在 Windows 真機確認待機與播放狀態皆不再變大；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-20 23:02 MINI 色彩／透明度 0.1.8

- 色彩設定新增「MINI 背景」原生七彩 range；同一 hue token 套用完整播放器底部 MINI 列與桌面 MINI 視窗。
- 透明度設定新增「MINI 視窗」欄位，直接共用既有 `MiniPlayerSettings.opacity`、renderer normalize 與原生 `BrowserWindow.setOpacity()`；範圍維持 `20–100%`，沒有第二份 opacity。
- 「全部復原」同步恢復 MINI 色相 232 與原生視窗透明度 92%；設定沿用既有 localStorage 與匯出／匯入，未新增套件或 IPC。
- `check:theme-colors`、`mini-opacity-check`、`check:custom-images`、FLAC／播放清單檢查：PASS。
- `npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- Electron dev：PASS；MINI 色相切為紅色後，底部 MINI 列與桌面 MINI 視窗同步；原生視窗透明度實測 20%／100%，全部復原回到色相 232／92%。
- arm64 packaged `file://`：PASS；設定頁顯示 MINI 色相與原生透明度欄位，既有保存值可正確讀回，底部 MINI 列配色正常。
- 兩個 DMG `hdiutil verify`：VALID；封裝版本均為 0.1.8，架構分別為 arm64 / x86_64，測試掛載均已卸載。
- EXE static check：PASS，為 Windows x64 目標 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 不存在。

最新 installer：

- EXE：134,366,590 bytes，SHA-256 `73b05fb9d97724216ef99ff68a260c5fca9ad51012692252babbf1ecca8f8e56`
- arm64 DMG：149,349,388 bytes，SHA-256 `2de7b79107763012be47fdbd3209d50a3f2cd94bdc3a19f0dac89c37e65d6ae3`
- x64 DMG：151,303,015 bytes，SHA-256 `34fa962543359f7276138a997d23dfd4ae0910b9d81bd75d8470db6a63415d65`

限制：Windows EXE 尚未在 Windows 真機執行；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-20 22:21 面板色彩與透明度 0.1.7

- 色彩頁新增「面板背景」原生七彩 range；僅控制共用 `.glass-panel` 底色。
- 新增「透明度」分頁：共用面板、主背景、角色舞台遮罩、左右裝飾皆可調 `0–100%`；文字與按鈕不套整體 opacity。
- 設定沿用 `ThemeColorSettings`、localStorage、匯出／匯入與全部復原；舊設定缺少新欄位時自動使用暗色預設，未新增套件。
- `check:theme-colors`、`check:custom-images`、FLAC／播放清單／Mini 檢查：PASS。既有圖片檢查的舊 `opacity-70` 契約已同步為新 class 後通過。
- `npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- Electron dev：PASS；四項透明度均實測 `0%`／`100%`，共用面板關閉重開後保存，全部復原回到 `94/70/88/80`；面板色相切換與復原亦通過。
- arm64 packaged `file://`：PASS；三分頁、四項透明度、共用面板 `0%` 與全部復原均正常，文字仍可辨識。
- 兩個 DMG `hdiutil verify`：VALID；封裝版本均為 0.1.7，架構分別為 arm64 / x86_64，測試掛載均已卸載。
- EXE static check：PASS，為 Windows x64 目標 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。

最新 installer：

- EXE：134,366,360 bytes，SHA-256 `43a321fd0ddb7018b0392c33b60e6f41dba2a3ae743469ec50c9a061125fbd8f`
- arm64 DMG：149,346,075 bytes，SHA-256 `e059e0d15a2a1f913f4594429cd776a03f358a62c7dd36ae1cf6b13b9b09968b`
- x64 DMG：151,297,714 bytes，SHA-256 `83b15d81a3c15710642d9763afdd8d28b59d56f5788ea207bc2d3a56da02749e`

限制：Windows EXE 尚未在 Windows 真機執行；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-20 17:47 暗色面板 0.1.6

- 根因：共用 `.glass-panel` 使用低透明度白色玻璃底，主背景變清楚後，亮色會穿透並染亮 Header、歌單、工具、備份與同類卡片；角色舞台另有自己的亮色橫幅。
- 修正：`.glass-panel` 改為固定深藍黑 `rgba(8, 11, 31, 0.94)`；角色舞台遮罩改為 62% → 88% 深色漸層。
- 未逐一修改卡片、未新增元件／設定／套件；主背景、兩張裝飾與圖片保存流程均未改動。
- `npm run check:theme-colors`、`npm run check:custom-images`、FLAC／播放清單／Mini 檢查：PASS。
- `npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- Electron dev 與 arm64 packaged `file://` 視覺驗收：PASS；共用面板維持暗色，角色舞台已加深，主背景仍清楚，文字與按鈕可辨識。
- 兩個 DMG `hdiutil verify`：VALID；封裝內版本均為 0.1.6，架構分別為 x86_64 / arm64，測試掛載均已卸載。
- EXE static check：PASS，為 Windows x64 目標 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。

最新 installer：

- EXE：134,365,961 bytes，SHA-256 `de606ba39ca9ac0b834c99b72207d81f6bf042ec12458ef10e750690091899bc`
- arm64 DMG：149,349,557 bytes，SHA-256 `064aa1dbb0ece3842c48b87b09c701aa1d83c7c0146e7f61895ea01fc2a16651`
- x64 DMG：151,295,049 bytes，SHA-256 `5e905776a4aa8543b05c2d104355bba27a460c130ef6a304cfac9bda33f3c408`

限制：Windows EXE 尚未在 Windows 真機執行；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-20 17:24 主背景清晰度 0.1.5

- 根因：主背景圖片僅 30% opacity 並套用 blur，後方又被全不透明色彩漸層覆蓋，畫面實際主要只剩漸層。
- 修正：主背景改為 70% opacity 並移除 blur；色彩漸層改為半透明，保留主題色與文字可讀性。
- 未改動卡片、兩張裝飾、圖片設定／保存或其他 UI；未新增套件。
- `npm run check:custom-images`、FLAC／色彩／播放清單／Mini 檢查：PASS。
- `npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- Electron dev 與 arm64 packaged `file://` 視覺驗收：PASS；背景人物、城市燈光與星空細節清楚可辨識，卡片文字仍可閱讀。
- 兩個 DMG `hdiutil verify`：VALID；封裝內版本均為 0.1.5，架構分別為 x86_64 / arm64。
- EXE static check：PASS，為 Windows x64 目標 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。

最新 installer：

- EXE：134,365,911 bytes，SHA-256 `dc6952d33d529a24ecce185b9d1e9edac1b2b11607082481ee1f5193e437a771`
- arm64 DMG：149,349,388 bytes，SHA-256 `c756b2db676c768d771759f2061e4fcf50b41b0600fac6d48c65a9d246924bfb`
- x64 DMG：151,294,991 bytes，SHA-256 `0f4f9dc0457fc72e22449081bb7ab7337a695856f89f94837afc292d3e09baf6`

限制：Windows EXE 尚未在 Windows 真機執行；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-20 17:05 主背景與裝飾顯示 0.1.4

- 根因：`BackgroundAura` 使用負 z-index，被 `html/body` 的實心背景蓋住；兩張裝飾即使載入，也位於內容卡片後方且尺寸／透明度過低。
- 修正：主背景層改為 `z-0`、內容層為 `z-10`；兩張裝飾沿用同一元件，以不攔截操作的 `z-20` 前景層固定於左右下角。
- 未新增套件、元件或設定；圖片驗證、保存、回復預設與其他八個槽位均未改動。
- `npm run check:custom-images`、FLAC／色彩／播放清單／Mini 檢查：PASS。
- `npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- Electron dev 視覺驗收：PASS；主背景、藍色裝飾、黃色裝飾均清楚可見且不阻擋操作。
- arm64 packaged App `file://` 視覺驗收：PASS；三張圖均載入並顯示。
- 兩個 DMG `hdiutil verify`：VALID；封裝內版本均為 0.1.4，架構分別為 x86_64 / arm64。
- EXE static check：PASS，為 Windows x64 目標 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。

最新 installer：

- EXE：134,365,977 bytes，SHA-256 `fb2446c411f45723ef0588190850c1c8e9b3528a2b44ae340b1319b8b1967e83`
- arm64 DMG：149,333,767 bytes，SHA-256 `d784e4dad38033a01c197d2cb429d5b0e484f537e354f99b99aa4d89b9dc1072`
- x64 DMG：151,295,051 bytes，SHA-256 `c4a00149bd8fbf27a5caacc1d0921727c52f7d50a2f43f7d92e3ce285aefdde5`

限制：Windows EXE 尚未在 Windows 真機執行；installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-20 16:31 FLAC 內嵌封面 0.1.3

- 現有 metadata 解析器新增 FLAC 原生 `PICTURE` 區塊支援；優先使用 front cover（type 3），沒有時使用第一張有效圖片。
- 僅接受 `image/*` 且長度／邊界有效的圖片資料；未新增套件、未改 UI、播放或歌單，也未掃描同資料夾的 JPG。
- `npm run check:flac-metadata`：PASS；合成 FLAC `PICTURE` 區塊的 MIME、大小與圖片 bytes 均正確。
- `npm run build`、`npm run electron:compile`、既有播放清單／Mini／色彩／圖片檢查：PASS。
- 升權 `npm run dist:all`：PASS；兩個 DMG `hdiutil verify`：VALID。
- 封裝內版本均為 0.1.3，執行檔架構分別為 x86_64 / arm64；EXE static check 為 Windows NSIS installer。
- installer 位置：PASS，只保留 `release-delivery/installers/` 三個 0.1.3 檔案；暫存 `release/` 已移除。

最新 installer：

- EXE：134,366,102 bytes，SHA-256 `a15dd39eb4c93332e5fec6e2becdbf6ec9283069b862555c67d34ea9addeaf26`
- arm64 DMG：149,349,694 bytes，SHA-256 `3a6a763336edaed44fe6fb7ad15f376e66feac120a9ba0fb2b4f2440a5f8a05e`
- x64 DMG：151,296,482 bytes，SHA-256 `feb7163b18028030ad09ea7585947ff3dd2b34c83b9ceaf5e08617c9e9213339`

限制：尚未取得截圖中的 Windows 真實 FLAC 檔，因此仍需在 Windows 0.1.3 EXE 匯入該資料夾，確認播放器顯示內嵌封面。installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 2026-06-19 17:16 色彩設定 0.1.2

- 外觀視窗新增置中的「圖片／色彩」分頁；圖片設定仍維持原有九槽。
- 色彩設定提供主色、輔色、金色點綴、文字與背景五組原生七彩色相拉桿，沿用既有 CSS token 即時套用。
- 色彩設定透過既有 `useLocalStorage` write-through 保存，並納入設定匯出／匯入；「全部復原」會回到 0.1.2 預設值。
- `npm run check:theme-colors`、`npm run check:custom-images`、`node scripts/playlist-logic-check.mjs`、`node scripts/mini-opacity-check.mjs`：PASS。
- `npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- 色彩面板五欄、置中分頁、間距與無水平溢出視覺檢查：PASS；瀏覽器環境後續拒絕 localhost 互動，因此拉桿保存／復原仍列為 Electron 人工驗收。
- x64 / arm64 DMG `hdiutil verify`：PASS；封裝內版本均為 0.1.2，執行檔架構分別為 x86_64 / arm64。
- EXE static check：PASS，為 Windows NSIS installer；electron-builder 建置目標為 Windows x64。
- installer 位置：PASS，只保留 `release-delivery/installers/` 三個 0.1.2 檔案；暫存 `release/` 已移除。

最新 installer：

- EXE：134,365,719 bytes，SHA-256 `9093c687fa4a22b5999ae5ab67d585d46d374b04f2ae68c3a1390dd4b3379c1a`
- arm64 DMG：149,345,520 bytes，SHA-256 `550bcfdf13498794807555acd6c9199354191c91c65e0cde41485a9fd9123ac7`
- x64 DMG：151,323,525 bytes，SHA-256 `24d3bb982f38d4cef7b23e5c975bf5dcf83f3be28391611dca91be3ec784e491`

限制：Windows EXE 尚未在 Windows 真機安裝／執行；Electron 桌面版仍需人工確認五條拉桿、重開保存、全部復原與九張圖片流程。macOS 未做 Developer ID 簽章或 notarization；Windows 未做 code signing。

## 2026-06-19 10:44 圖片設定 0.1.1

- 右上新增 44×44 圖片設定按鈕，與清空／Mini 按鈕維持 8px 間距；原控制列整組向左移 52px。
- 設定彈窗提供九個實際顯示槽位：logo、avatar、banner、main-bg、idle、playing、default-cover、star、bubble。
- 內建圖片繼續由 `public/assets` 載入；自訂圖片經 Electron 原生選檔後驗證格式與 10 MB 上限，再複製到 app userData。回復預設只移除 App 副本，不碰原始檔。
- `npm run check:custom-images`：PASS；涵蓋 PNG/JPG/WebP/GIF 簽名、SVG 拒絕、實際檔案寫入／重載／移除。
- `npm run build`、`npm run electron:compile`、`playlist-logic-check`、`mini-opacity-check`：PASS。
- in-app Browser：九張卡片、dialog 開關、44px 控制、8px 間距、頁面無橫向溢出、console error 皆 PASS。
- 升權 `npm run dist:all`：PASS；一般沙盒曾分別在 `hdiutil` 與 Wine 被阻擋，授權沙盒外建置後完成。
- arm64 / x64 DMG verify：PASS；EXE static check：PASS；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。

最新 installer：

- EXE：134,364,296 bytes，SHA-256 `007258edcaad2fb5bc10627f449fd9b34fa71fe1092b7e56cbc36dbb3185cc84`
- arm64 DMG：149,344,229 bytes，SHA-256 `52c2587e25e1c7c73e5bc2dc791231132f2436143344c31f603ee532c7a97341`
- x64 DMG：151,289,292 bytes，SHA-256 `57235449c5675f67b176544e87feb77f5a04bf475c10c7dd00156069e89e9a9e`

限制：Electron 原生選圖 dialog、重開 App 後圖片保存與九槽逐張人工觀察尚需 macOS 點擊驗收；Windows EXE 尚未真機執行。installer 未簽章、未 notarize。

## 2026-06-18 22:05 智慧清單移除與 MINI 20% 下限

- 智慧型播放清單的垃圾桶現在只把歌曲加入該清單的 `excludedTrackIds`，不刪歌曲庫，也不影響其他歌單。
- 智慧規則重新計算時先套用排除，再排序與限制數量；排除資料會保存、匯出，匯入時重新配對 track id。
- MINI 透明度下限由 60% 改為 20%，前端輸入、防呆與 Electron 原生視窗一致。
- `playlist-logic-check`、`mini-opacity-check`、build、Electron compile、`dist:all`：PASS。
- arm64 / x64 DMG verify：PASS；EXE static check：PASS；installer 只在 `release-delivery/installers/`。

限制：智慧清單流程完成邏輯／source／build 驗證，尚未用使用者的真實音樂庫自動點擊重跑；Windows EXE 尚未真機執行。installer 未簽章、未 notarize。

最新 installer：

- EXE：134,362,372 bytes，SHA-256 `dfc230f64c0f7628167865121a0026f3b43b368084b3beeafe21aeafc226de8b`
- arm64 DMG：149,348,227 bytes，SHA-256 `a2709c940f8ff6b22b20f21486707cba3008ddf7101c5e1fca1170f7490940c6`
- x64 DMG：151,315,142 bytes，SHA-256 `ac9df4136730751cfadeba19b0ee3516c52b225e033ea01db38aadbae1f12dc3`

## 2026-06-18 21:52 MINI 透明度與版面一致性

- 新增 60–100% 數字輸入與左右 ±5 按鈕，設定會保存並套用 Electron 原生視窗透明度。
- MINI 使用一致的 8px 間距；外框 20px、內框 16px、控制 12–14px 圓角。
- 260×268 實際瀏覽器驗收：無水平／垂直捲軸；92 → 減號為 87，輸入 20 會 clamp 為 60。
- `node scripts/mini-opacity-check.mjs`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:all`：PASS。
- arm64 / x64 DMG `hdiutil verify`：PASS；EXE static check：PASS；installer 僅位於 `release-delivery/installers/`。

限制：Electron 桌面版可啟動且可讀到 MINI 入口，但本機輔助控制未能自動點入 MINI；原生視窗透明度與 Windows EXE 仍需人工／Windows 真機點擊驗收。installer 未簽章、未 notarize。

最新 installer：

- EXE：134,362,063 bytes，SHA-256 `00062579245d060464ff632cfe09be5c2bfdbe00ee880ccec1d9b29330cf2e5a`
- arm64 DMG：149,348,911 bytes，SHA-256 `5a5af6ed942a17ad4355265293368407a3d20f4c10395d800f31e6e1a3769236`
- x64 DMG：151,311,870 bytes，SHA-256 `eec1fd9ff7be1ec43a3ec1f082856c837baeaea5e92de56d0d4328b6cffb451e`

## 2026-06-18 18:28 Windows 歌單刪除後焦點回歸修正

上一版在原生 `window.confirm()` 關閉後呼叫 `window.focus()` / `BrowserWindow.focus()`，Windows 實機回報仍無效。本版不再嘗試搶回系統焦點，改為讓刪除確認全程留在 renderer：

- 新增 `PlaylistDeleteDialog` 內嵌確認框，保留取消、確認、Escape 與背景點擊關閉。
- `handleDeletePlaylist` 不再呼叫 `window.confirm()`。
- 移除上一版新增但無效的 `focus` window-control IPC。
- 智慧型播放清單名稱欄位仍使用原生 `autoFocus`。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS；會阻止刪除流程重新引入 `window.confirm()`。
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- Chromium 完整手順：建立智慧清單 → 輸入 → 內嵌確認刪除 → 再新增智慧清單 → 不點輸入框、不切換視窗直接鍵盤輸入：PASS；active element 為 `INPUT`，文字成功寫入。
- `npm run dist:all`：PASS
- arm64 / x64 DMG `hdiutil verify`：PASS
- EXE static check：PASS，辨識為 Windows NSIS installer。
- installer 位置：PASS，只有 `release-delivery/installers/`；`release/` 已移除。

最新 installer：

- EXE：134,361,675 bytes，SHA-256 `c68cb42971ad69be009c6e0e0fb76b465cd8c923a896450739e725127ee98eb6`
- arm64 DMG：149,349,648 bytes，SHA-256 `2c8003788853e76e9f42daea272c48d0a354454a4d1e6013a04c21fdebac00a7`
- x64 DMG：151,307,893 bytes，SHA-256 `d1526a3a54e2e276f88b63cd5cbf6b9125c488262036c80ec0ef7d4dfd4bece5`

限制：Windows EXE 尚需在 Windows 真機重跑原始手順；installer 尚未簽章。

## 2026-06-18 17:37 Windows 刪除歌單後輸入焦點修正

已針對「建立歌單／智慧歌單 → 刪除 → 再開啟智慧歌單時不能直接輸入」做精準修正：

- 刪除確認關閉後，立即以 `window.focus()` 還原 renderer 焦點。
- Electron 版沿用現有 `windowControl` IPC 新增 `focus`，同步呼叫 `BrowserWindow.focus()`。
- 智慧型播放清單名稱欄位使用原生 `autoFocus`，每次重新開啟都直接取得焦點。

已通過：

- `npm run build`：PASS
- `npm run electron:compile`：PASS
- Chromium UI：智慧型播放清單名稱欄位開啟後為 active，直接輸入成功。
- `npm run dist:all`：PASS
- arm64 / x64 DMG `hdiutil verify`：PASS
- EXE static check：PASS，辨識為 Windows NSIS installer。
- installer 位置：PASS，只有 `release-delivery/installers/`；`release/` 已移除。

最新 installer：

- EXE：134,361,611 bytes，SHA-256 `cc4bb14ae84a27bcb2b7073e5172fdbd6fe6a8b2fa178c5db094ef1eecce80df`
- arm64 DMG：149,349,096 bytes，SHA-256 `ac705bc5f1e6e5e32469672091bc4ee1e8b0e0fc19885d5bda11c88ee8fa72dd`
- x64 DMG：151,310,940 bytes，SHA-256 `24f75bd1a4dec264c26d9fa161d0dbe63457827047e6c209240d410f26ae5fe0`

限制：macOS GUI 自動點擊工具無法穩定完成原生 confirm 後續操作；Windows EXE 尚需在 Windows 真機重跑使用者手順，不能宣稱 Windows 實機已通過。installer 尚未簽章。

## 2026-06-18 16:45 播放清單修正發行驗收

本輪已將 2026-06-17 19:55 完成的播放清單修正重新打包成 DMG / EXE。

已包含：

- 自訂播放清單刪除歌曲只移出該播放清單，不刪歌曲庫。
- 只有「全部歌曲」刪除才真正移除歌曲，並同步清除所有自訂播放清單裡同一 track id。
- 移除「最近播放」與「最常播放」系統清單。
- 舊 active playlist id 指向已移除清單時，會回到「全部歌曲」。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dist:all`：PASS；一般沙盒的 `hdiutil create` 失敗，升級權限重跑成功。
- arm64 / x64 DMG `hdiutil verify`：PASS，checksum 均為 VALID。
- EXE static check：PASS，辨識為 Windows NSIS installer。
- installer 位置：PASS，只有 `release-delivery/installers/`；暫存 `release/` 已移除。

最新 installer：

- `Aquariusgirl Music Room Setup 0.1.0.exe`：134,361,405 bytes，SHA-256 `04d8c6745b3d80a41989f467011631f1596eecba6fe70e9024b6ec1df5565e6a`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`：149,348,647 bytes，SHA-256 `3a9d8ddb7cba670359202fdacc84873f4ebd787ecf1c5068b7fe0ef0175ad3e4`
- `Aquariusgirl Music Room-0.1.0.dmg`：151,308,105 bytes，SHA-256 `0fc571fb7695d0eb0a7d0038b49b8f4aac58476553a4f0805b6f0b942e407c7a`

限制：Windows EXE 尚未在 Windows 實機執行；macOS / Windows installer 尚未簽章或 notarize。

## 2026-06-17 19:55 播放清單刪除語意與系統清單精簡狀態（尚未打包）

本輪已完成程式修正與可在一般沙盒內完成的驗證，但尚未重新輸出包含本輪修正的新 DMG / EXE。升級權限執行 `npm run dist:all` 時被系統用量限制擋下；目前 `release-delivery/installers/` 仍是 2026-06-17 19:07:16 CST 的上一輪 installer，不包含本輪 19:55 修正。

已修正：

- 選取自訂播放清單後，歌曲列表標題維持使用 active playlist 名稱。
- 自訂播放清單刪除歌曲時，只從該播放清單移除單筆 occurrence，不刪歌曲庫、不刪原始路徑、不影響「全部歌曲」。
- 只有在「全部歌曲」刪除歌曲時，才真正移除歌曲庫項目，並同步清除所有自訂播放清單裡同一個 track id。
- 智慧型播放清單會在歌曲庫移除後自然重新計算，不額外保存要清理的 track id。
- 移除「最近播放」與「最常播放」系統清單。
- 舊 active playlist id 若指向已移除的系統清單，會回到「全部歌曲」。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `rg` 掃描：`recent`、`frequent`、`最近播放`、`最常播放`、`system-recent`、`system-frequent` 在 `src` / `scripts` / `electron` 中無殘留。
- `rg` 掃描：`removeTrackFromAllPlaylists`、`請到全部歌曲移除`、`restoreMusicPaths(sourcePaths, addFiles)` 接線存在。

未完成：

- `npm run dist:all` 一般沙盒在 macOS `hdiutil create` 失敗；升級權限重跑被用量限制擋下。
- `release/` 目前是失敗打包留下的暫存 app bundle，不是可交付 installer；下輪接續前應先清理。
- 最新 DMG / EXE 尚未包含本輪修正。

## 2026-06-17 19:08 自動恢復不再灌入自訂播放清單發行驗收狀態

本輪修正「每次重開軟體，自訂的未命名播放清單歌曲數一直增加」問題。原因是 Electron 啟動後的自動恢復歌曲庫，原本共用手動匯入的 `addFilesToActivePlaylist` 路徑；如果上次停在自訂播放清單，自動恢復的歌曲會被再次追加到該播放清單。現在自動恢復只呼叫 `addFiles` 重建歌曲庫，不再修改目前播放清單；手動選檔、選資料夾與拖曳仍維持會加入目前自訂播放清單。

已修正：

- `restoreMusicPaths` 支援指定恢復檔案後的處理函式。
- App 啟動自動恢復時改用 `restoreMusicPaths(sourcePaths, addFiles)`。
- 保留手動匯入路徑：手動選檔 / 選資料夾 / 拖曳仍使用 `addFilesToActivePlaylist`。
- 新增最小 assert 檢查：手動匯入可追加，自動恢復不得改播放清單。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dist:all`：PASS。一般沙盒仍在 macOS `hdiutil create` 失敗；升級權限重跑後通過。
- `rg` 掃描：自動恢復路徑已改為 `restoreMusicPaths(sourcePaths, addFiles)`；手動匯入路徑仍保留 `addFilesToActivePlaylist`。
- arm64 / x64 DMG `hdiutil verify`：PASS。
- EXE static check：PASS，辨識為 Windows NSIS installer。
- 暫存 `release/`：PASS，已移除；最新 installer 只在 `release-delivery/installers/`。

最新 installer：

- `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-17 19:07:16 CST
  - 大小：134,361,413 bytes
  - SHA-256：`028ffc2263af742c7c918f9c89ebfc30330d7b9aa1815c67e7d2426c97fcd0a1`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-17 19:07:16 CST
  - 大小：149,349,145 bytes
  - SHA-256：`ce6a8e88007f789d112f5868de4568d8725b527209e4a985ffc10d26ca9536e3`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-17 19:07:16 CST
  - 大小：151,308,026 bytes
  - SHA-256：`7a60458cf96faf57b6ea0f626b80806eb3428909d88bfd7dfba6d2e7eb7ec2bd`

仍需人工 / 真機驗收：

- Windows EXE 尚未在 Windows 實機執行；Windows 上播放清單保存、重開恢復與 Mini 行為需真機確認。
- 本輪未啟動 packaged macOS app 做 GUI「重開後播放清單數量不增加」驗收；目前完成的是 source/build/package/static 驗證。
- 已經膨脹的舊播放清單不會自動去重，因為一般播放清單允許使用者故意重複加入同一首歌；需要使用者自行移除不想要的重複列。
- installer 未簽章、未 notarize。

## 2026-06-17 15:26 播放清單即時保存發行驗收狀態

本輪以最小改動修正播放清單保存時機：`useLocalStorage` setter 現在會在狀態更新時計算最新值並同步 write-through 到 `localStorage`，原本的 effect 寫入仍保留作為備援。這讓播放清單新增、刪除、拖曳排序、改名、匯入等所有走同一個 localStorage setter 的操作，都能在使用者操作當下保存最新狀態，降低 Electron 關閉太快造成最後一次操作未落盤的風險。

已修正：

- 播放清單新增歌曲後立即保存最新 playlist 資料。
- 播放清單刪除歌曲後立即保存最新 playlist 資料。
- 播放清單拖曳排序、改名、刪除歌單等同一批 localStorage 設定也同步受益。
- 保留原有 localStorage effect 寫入，不新增資料庫、不新增套件、不改播放清單 UI。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dist:all`：PASS。一般沙盒仍在 macOS `hdiutil create` 失敗；升級權限重跑後通過。
- `rg` 掃描：`QueuePanel`、`LyricsPanel`、`LrcImportButton`、`parseLrc`、`下一首播放`、`加入播放佇列`、`目前佇列`、`同步歌詞`、`匯入 LRC`、`.lrc` 在 `src` / `electron` / `scripts` / `dist` 中無殘留。
- arm64 / x64 DMG `hdiutil verify`：PASS。
- EXE static check：PASS，辨識為 Windows NSIS installer。
- 暫存 `release/`：PASS，已移除；最新 installer 只在 `release-delivery/installers/`。

最新 installer：

- `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-17 15:25:50 CST
  - 大小：134,361,303 bytes
  - SHA-256：`59271c2940b0723ae65315481a000466c13130790d3fde91367474e62604e82a`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-17 15:25:50 CST
  - 大小：149,369,583 bytes
  - SHA-256：`2707b0fd631f51b366a1b1451c4d5a22f863e4eb4b1088341f1d5b9d5bf4d968`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-17 15:25:50 CST
  - 大小：151,308,442 bytes
  - SHA-256：`0400f2cb00429ac84424021594a0be0bf5719d55e4c8c9a5db832ed91020e184`

仍需人工 / 真機驗收：

- Windows EXE 尚未在 Windows 實機執行；Windows 上播放清單保存與 Mini 行為需真機確認。
- 本輪未啟動 packaged macOS app 做 GUI 新增/刪除/重開保存驗收；目前完成的是 source/build/package/static 驗證。
- installer 未簽章、未 notarize。

## 2026-06-17 15:01 Queue / 同步歌詞移除與拖曳排序發行驗收狀態

本輪已完成精準刪除與最小新增，最新 DMG / EXE 已同步到 `release-delivery/installers/`，暫存 `release/` 已移除。

已修正：

- 移除「目前佇列」視窗 / 面板。
- 移除歌曲列紅圈兩顆 Queue 功能：`下一首播放`、`加入播放佇列最後`。
- 移除同步歌詞 UI、LRC 匯入入口、Electron 同名 `.lrc` 自動配對。
- 新增手動拖曳歌曲列決定播放順序：
  - 一般播放清單：保存到 playlist `trackIds`。
  - 全部歌曲：重排本地 tracks，並更新 `addedAt` 讓目前自訂順序成為播放順序。
  - 搜尋、排序結果、智慧/衍生清單不啟用拖曳，避免拖曳結果被排序規則覆蓋。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dist:all`：PASS。一般沙盒仍在 macOS `hdiutil create` 失敗；升級權限重跑後通過。
- `rg` 掃描：`QueuePanel`、`LyricsPanel`、`LrcImportButton`、`parseLrc`、`下一首播放`、`加入播放佇列`、`目前佇列`、`同步歌詞`、`匯入 LRC`、`.lrc` 在 `src` / `electron` / `dist` 中無殘留。
- arm64 / x64 DMG `hdiutil verify`：PASS。
- EXE static check：PASS，辨識為 Windows NSIS installer。

最新 installer：

- `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-17 15:00:14 CST
  - 大小：134,361,358 bytes
  - SHA-256：`029dbb18a7396b33376ae0c7f7302d460b36c26ba3336ff1c1d4ccffa1440315`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-17 15:00:15 CST
  - 大小：149,349,771 bytes
  - SHA-256：`645aebc2d3ff54e9a289a511f9ed461d8ae166af2232ece79409ea6bfc2521a9`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-17 15:00:15 CST
  - 大小：151,310,725 bytes
  - SHA-256：`364ad0ac312a70eedd822d080cc2c38bd1e2487de85252109b0a4201bb194bb4`

仍需人工 / 真機驗收：

- Windows EXE 尚未在 Windows 實機執行；Windows 上拖曳排序與 Mini 行為需真機確認。
- 本輪未啟動 packaged macOS app 做 GUI 拖曳驗收；目前完成的是 source/build/package/static 驗證。
- installer 未簽章、未 notarize。

## 2026-06-17 14:05 播放清單修正發行驗收狀態（歷史）

本輪播放清單程式修正已重新打包完成，最新 DMG / EXE 已同步到 `release-delivery/installers/`，並移除暫存 `release/`。

已通過：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dist:all`：PASS。一般沙盒仍在 macOS `hdiutil create` 失敗；升級權限重跑後通過。
- `scripts/sync-installers.mjs`：PASS，已同步 3 個 installer 到 `release-delivery/installers/`。
- 暫存 `release/`：PASS，已移除。
- DMG checksum：PASS，arm64 與 x64 DMG 均通過 `hdiutil verify`。
- EXE static 檢查：PASS，辨識為 Windows NSIS installer。
- `rg` 掃描：播放清單單筆移除、拖曳排序、QueuePanel、下一首播放、加入播放佇列最後、佇列另存播放清單等 handler / UI 入口均存在。
- `rg` 掃描：舊的「加入時 Set 去重」與「依 trackId 移除全部」核心模式已移除。

最新 installer：

- `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-17 14:03:59 CST
  - 大小：134,362,517 bytes
  - SHA-256：`3a6d1a71eb9647aab6acb2ed15f8663c134bc93210785a9011be4463ee20877d`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-17 14:03:59 CST
  - 大小：149,347,541 bytes
  - SHA-256：`b95900835bb5050d94a2ba685d306def6ce7bdc17d1d468f5e87fa8b07a23432`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-17 14:04:00 CST
  - 大小：151,310,028 bytes
  - SHA-256：`738b3ee48baac1cd932cdc21e70c6599f47c4616e4d4ca4f7eedc8a3a297bf28`

仍需人工 / 真機驗收：

- Windows EXE 尚未在 Windows 實機執行；Windows 上的播放清單與 Mini 下一首需真機確認。
- 本輪未啟動 packaged macOS app 做 GUI 點擊播放測試；目前完成的是 build、packaging、DMG checksum、EXE static 驗證。
- installer 未簽章、未 notarize，正式公開發行前仍需 Apple Developer ID / Windows code signing。
- 多選批次操作、單一播放清單 JSON/M3U 匯入匯出預覽、缺檔重新指定/資料夾搜尋修復、移除復原按鈕仍未完整實作。

## 2026-06-17 10:49 播放清單功能修正狀態（歷史：尚未打包）

本輪已完成播放清單程式修正與可在本機沙盒內完成的驗證，但尚未重新輸出包含本輪修正的新 installer。

已修正：

- 播放清單加入歌曲不再用 `Set` 去重，允許同一首歌在同一播放清單中出現多筆。
- 「只從此播放清單移除」改為依點選列的 occurrence index 移除單筆，不刪歌曲庫、不刪本機音樂檔、不影響其他播放清單。
- 一般播放清單在「自訂/加入時間」排序下保留 playlist 儲存順序，不再被歌曲加入時間打散。
- 播放清單支援拖曳排序，更新後保存 `trackIds` 順序與 `updatedAt`。
- 歌曲列新增「下一首播放」與「加入播放佇列最後」實際功能。
- 新增「目前佇列」面板，可查看佇列、清除佇列、將佇列另存為播放清單；Queue 不會覆蓋 Playlist。
- 選檔 / 選資料夾 / 拖曳檔案時，如果目前位於一般播放清單，新增歌曲會同時加入目前播放清單。
- 目前播放歌曲可從 PlayerCore 直接加入指定播放清單；重複加入會詢問是否仍加入。
- 刪除播放清單前會確認，且文案明確說明不會刪除原始音樂檔案。
- 排序選項補上歌手、專輯、時長短到長、時長長到短。
- 新增 `scripts/playlist-logic-check.mjs`，用最小 assert 驗證重複歌曲單筆移除與排序移動行為。

已驗證：

- `node scripts/playlist-logic-check.mjs`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `rg` 掃描：舊的「加入時 Set 去重」與「依 trackId 移除全部」核心模式已移除。
- `rg` 掃描：播放清單單筆移除、拖曳排序、QueuePanel、下一首播放、加入播放佇列最後、佇列另存播放清單等 handler / UI 入口均存在。
- `rg` 掃描：沒有 `onClick={() => {}}` 這類明顯假按鈕殘留。

本輪打包結果：

- 一般沙盒執行 `npm run dist:all`：PARTIAL。build 與 Electron compile 在流程中通過，但 macOS `hdiutil create` 產生 DMG 時失敗。
- 升級權限重跑 `npm run dist:all`：BLOCKED。系統用量限制拒絕執行，提示 2026-06-17 13:37 後再試。
- 刪除失敗暫存 `release/`：BLOCKED。因同一個用量限制拒絕執行 `rm -rf release`。

尚未完成：

- `npm run dist:all` 尚未重新產出包含本輪播放清單修正的新 DMG / EXE。
- `release-delivery/installers/` 目前仍是 2026-06-17 08:49:09 CST 的 installer，不包含本輪 10:49 播放清單修正。
- `release/` 目前是本輪 `hdiutil` 失敗留下的暫存資料夾，內含未封裝完成的 mac app bundle；它不是最新版 installer，不可交付。
- Windows EXE 未做 Windows 實機播放清單驗收。
- 需求中的多選批次操作、單一播放清單 JSON/M3U 匯入匯出預覽、缺檔重新指定/資料夾搜尋修復、移除復原按鈕仍未完整實作；目前以既有完整備份匯出/匯入與核心播放清單功能為主。

下次限制解除後接續：

1. 先移除失敗暫存 `release/`。
2. 重新執行 `node scripts/playlist-logic-check.mjs`、`npm run build`、`npm run electron:compile`。
3. 用升級權限執行 `npm run dist:all`。
4. 確認 `release-delivery/installers/` 的 DMG / EXE 修改時間晚於 2026-06-17 10:49，且 `release/` 已移除。
5. 重新計算 SHA-256，更新本報告與 installer/version/continue 文件。

## 2026-06-17 08:49 發行驗收狀態（歷史）

本輪接續 2026-06-16 21:56 已完成的程式修正，重新完成 build、Electron compile 與 installer 打包。

最新驗收結果：

- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dist:all`：PASS。一般沙盒仍在 `hdiutil create` 失敗；升級權限重跑後通過。
- `scripts/sync-installers.mjs`：PASS，已同步 3 個 installer 到 `release-delivery/installers/`。
- 暫存 `release/`：PASS，已移除，避免出現兩個類似交付位置。
- DMG checksum：PASS，arm64 與 x64 DMG 均通過 `hdiutil verify`。
- arm64 DMG mount/static 檢查：PASS，DMG 可掛載，內含 `Aquariusgirl Music Room.app`，`CFBundleName` / `CFBundleExecutable` 均為 `Aquariusgirl Music Room`，`app.asar` 存在。
- EXE static 檢查：PASS，辨識為 Windows NSIS installer。
- source 掃描：PASS，Mini 下一首事件直傳無殘留；`restoreMusicPaths` / `lastModified` / broadcast boolean 防護 / full titlebar 黑底均存在。
- 舊 UI 殘渣掃描：PASS，08:49 installer 對應狀態下未找到已移除的系統歌單 / 播放清單資料夾 / EmptyState 殘留。本輪 10:49 已新增真正 Queue 功能，因此 `目前播放佇列` 類文字可作為 Queue 確認與 toast 出現，不再代表舊系統歌單殘渣。

最新 installer：

- `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-17 08:49:09 CST
  - 大小：134,360,333 bytes
  - SHA-256：`9e9de760086652e21768788c5b44d5122d2944cdb547fde1b57a83097a53d40b`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-17 08:49:09 CST
  - 大小：149,307,281 bytes
  - SHA-256：`9e3307340b9fa4dbf1f938499702ffcb6783ac748b2339547f819e7783431dac`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-17 08:49:09 CST
  - 大小：151,310,418 bytes
  - SHA-256：`41725b1c1041e2afddf1cb02e2d726a094d791564d80cb0d76fd4e54cc6578d0`

仍需人工 / 真機驗收：

- Windows EXE 沒有在 Windows 實機執行，Mini 下一首不黑畫面需 Windows 真機確認。
- packaged macOS app 本輪完成 DMG verify 與 mount/static 檢查，未做 GUI 點擊播放、Mini 下一首與重開恢復歌曲路徑實測。
- installer 未簽章、未 notarize，正式公開發行前仍需 Apple Developer ID / Windows code signing。

## 2026-06-16 21:56 上一輪未打包狀態（歷史）

本輪針對使用者回報的三項問題做精準修正：

- Mini 下一首按鈕黑畫面：已修正 `MiniPlayerAssistant` 直傳 click event 的問題，並在 `useAudioPlayer` 對 autoplay 參數做 boolean 防呆；播放狀態廣播也已加 try/catch，避免跨視窗廣播失敗造成 UI blank。
- DMG/桌面版重新開啟需要重新匯入：已新增 Electron `restoreMusicPaths` IPC，IndexedDB 只保存 track metadata / sourcePath，重新啟動後會重新讀取使用者先前選過的本地音樂路徑與同名 `.lrc`，不保存音樂檔本體，也不掃描整台硬碟。
- 主控欄位下方黑背景：full mode titlebar renderer 已補上深色黑底、細 border 與陰影。

本輪已驗證：

- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `rg` 掃描 Mini `onClick={onPrevious/onNext}` 直傳殘留：PASS，無殘留
- `rg` 掃描 `restoreMusicPaths` / `restore-music-paths` / `lastModified` 接線：PASS
- `rg` 掃描廣播保護：PASS，`postMessage(state)` 已包在 try/catch，`isPlaying` 已轉 boolean

當時尚未完成：

- `npm run dist:all`：PARTIAL。build / electron compile 已再次通過，但 macOS `hdiutil create` 在沙盒環境產生 DMG 時失敗。嘗試升級權限重跑時被系統用量限制擋下，因此當時尚未重新輸出包含 21:56 修正的新 DMG / EXE。
- `release-delivery/installers/` 目前仍是上一輪 2026-06-16 20:24:03 的 installer，不包含本輪 21:56 後的 Mini 黑畫面、自動恢復歌曲來源、titlebar 黑底修正。
- Windows 實機 Mini 下一首黑畫面需在新 EXE 產出後再實測。

## 專案關鍵檔案盤點

| 類別 | 關鍵檔案 |
| --- | --- |
| 前端框架 | `vite.config.ts`, `src/main.tsx`, `src/App.tsx` |
| Electron 主程序 | `electron/main.ts` |
| preload / IPC | `electron/preload.ts`, `src/utils/platform.ts` |
| 播放器主畫面 | `src/App.tsx`, `src/components/PlayerCore.tsx`, `src/components/CharacterStage.tsx` |
| MINI 播放器 | `src/components/MiniPlayer.tsx`, `src/components/MiniPlayerAssistant.tsx` |
| 播放清單 | `src/hooks/usePlaylists.ts`, `src/components/PlaylistSidebar.tsx`, `src/components/PlaylistManager.tsx`, `src/components/PlaylistPanel.tsx` |
| 歌曲列表 | `src/components/TrackList.tsx`, `src/components/TrackItem.tsx` |
| 音樂檔讀取 | `src/hooks/useLocalTracks.ts`, `src/hooks/useFileSystemAccess.ts`, `src/utils/audioFiles.ts`, `src/utils/readAudioMetadata.ts` |
| 播放狀態 | `src/hooks/useAudioPlayer.ts` |
| 視窗控制 | `src/components/Header.tsx`, `electron/main.ts` |
| 打包設定 | `package.json`, `.github/workflows/release.yml` |

## 驗收表

| 驗收項目 | 測試步驟 | 預期結果 | 實際結果 | 結果 | 修正狀態 | 備註 |
| --- | --- | --- | --- | --- | --- | --- |
| A. 視窗最小化按鈕 | 啟動 packaged macOS app，檢查 accessibility tree | 按鈕可見且為原生視窗控制 | packaged macOS app 讀到 `縮到最小按鈕`；Windows 設定 `frame: true` 會使用原生按鈕 | PASS | 已修正 | Windows 需實機點擊 |
| A. 視窗最大化 / 還原 | 啟動 packaged macOS app，檢查 accessibility tree | 按鈕可見且為原生視窗控制 | packaged macOS app 讀到 `全螢幕按鈕` 與縮放 secondary action；Windows 設定 `frame: true` 會使用原生按鈕 | PASS | 已修正 | Windows 需實機點擊 |
| A. 全螢幕 / 退出全螢幕 | 啟動 packaged macOS app，檢查 accessibility tree | 原生全螢幕入口存在 | packaged macOS app 讀到 `全螢幕按鈕` | PASS | 已修正 | Windows full screen 可由系統/快捷鍵與 app IPC 支援 |
| A. 關閉視窗 | 啟動 packaged macOS app，檢查 accessibility tree | 按鈕可見且為原生視窗控制 | packaged macOS app 讀到 `關閉按鈕`；Windows 設定 `frame: true` 會使用原生按鈕 | PASS | 已修正 | Windows 需實機點擊 |
| A. no-drag | 檢查 Header class | 按鈕區不被拖曳區吃掉 | 視窗控制容器使用 `app-no-drag` | PASS | 已完成 | 透過程式檢查 |
| A. full mode title 名稱 | 檢查 renderer full mode 分支 | 主控台頂部保留 app 名稱；Mini 不顯示 | `App.tsx` full mode 會渲染頂部 `Aquariusgirl Music Room` titlebar label；Mini 在提前 return 分支，不渲染此 title | PASS | 已修正 | source/build 驗證 |
| B. 新增播放清單 | 檢查 dialog 與 state 流程 | 點擊後可輸入、Enter 建立、取消關閉 | Dialog 存在，表單 submit 支援 Enter，取消按鈕存在 | PASS | 已完成 | 已由 build 驗證 |
| B. 空白名稱 | 送出空白名稱 | 不建立並提示錯誤 | `PlaylistNameDialog` 阻擋空白名稱 | PASS | 已完成 | 顯示 `名稱不能空白。` |
| B. 重複名稱 | 建立同名歌單 | 合理阻擋 | `playlistNameExists` 會在建立/改名時阻擋重複 | PASS | 已修正 | UI 顯示錯誤 |
| B. 重啟保存 | 檢查 localStorage hook | 播放清單重啟仍存在 | `usePlaylists` 使用 `useLocalStorage(STORAGE_KEYS.playlists)` | PASS | 已完成 | 未做 GUI 重啟點擊驗收 |
| B. 移除目前播放佇列 | 檢查系統歌單與 UI 字串 | 不再顯示「目前播放佇列」 | 已移除 `system-queue` 與「目前播放佇列」系統歌單；packaged macOS app 實測不顯示 | PASS | 已修正 | build / packaged app 驗證 |
| B. 移除播放清單資料夾 | 檢查建立入口、型別與舊資料流程 | 不再顯示資料夾建立按鈕；舊資料不回流 | 已移除資料夾建立 UI 與 `PlaylistFolder` 型別；packaged macOS app 實測不顯示建立入口 | PASS | 已修正 | 舊型別在 normalize/import 時被濾掉 |
| C. 歌曲列表加入指定播放清單 | 檢查歌曲列 UI | 每首歌可加入指定一般播放清單 | 本輪新增 TrackItem「加入歌單」select | PASS | 已修正 | 已由 build 驗證 |
| C. 重複加入同一首歌 | 加入已存在歌曲 | 合理阻擋或提示 | 已加入的 option disabled；handler 仍會防重複並提示 | PASS | 已修正 | 不會重複寫入 |
| C. 切換播放清單刷新 | 檢查 active playlist state | 切換後列表依 playlist trackIds 更新 | `activePlaylistTrackIds` 與 `playbackTracks` 由 state memo 推導 | PASS | 已完成 | 程式驗收 |
| C. 移除歌曲不刪原檔 | 檢查 removeTrack | 只移除本地 object URL，不刪檔案 | `removeTrack` 只 revoke object URL 與更新 state | PASS | 已完成 | 不呼叫 fs delete |
| D. 播放 / 暫停 / 上下首 | 檢查 useAudioPlayer | 可操作 HTMLAudioElement | `useAudioPlayer` 管理 audio ref 與控制 | PASS | 已完成 | 本輪未 GUI 播放實測 |
| D. 歌曲列播放 / 暫停切換 | 檢查 TrackItem / TrackList / PlaylistPanel props | 目前播放歌曲列按下可暫停，再按可播放 | 目前歌曲列 click 會呼叫 `onTogglePlay`；非目前歌曲仍呼叫 `onPlay(track.id)` | PASS | 已修正 | source/build 驗證 |
| D. 進度條拖曳 | 檢查 ProgressBar / PlayerCore | 拖曳可 seek | `onSeek` 已接 `player.seek` | PASS | 已完成 | 本輪未 GUI 拖曳實測 |
| D. 音量 / 靜音 | 檢查 PlayerCore / useAudioPlayer | slider 與 mute 生效 | `volume` / `muted` 狀態已接 audio element | PASS | 已完成 | build 通過 |
| D. 循環 / 隨機 | 檢查 useAudioPlayer | repeat/shuffle 控制播放結束邏輯 | repeatMode 與 shuffle 已在 hook 中管理 | PASS | 已完成 | 程式驗收 |
| D. 搜尋 / 排序 | 檢查 App filteredTracks | 搜尋與排序即時更新 | `useMemo` 篩選與排序 | PASS | 已完成 | 程式驗收 |
| D. 新增檔案 / 資料夾 | 檢查 file inputs 與 Electron dialog | 可選檔、選資料夾 | Web input 與 Electron dialog 都有路徑 | PASS | 已完成 | 本輪未 GUI 檔案選擇 |
| D. 刪除歌曲 / 清空列表 | 檢查 handlers | revoke object URL 並更新 UI | `removeTrack` / `clearTracks` 已 revoke URL | PASS | 已完成 | 程式驗收 |
| E. MINI 開啟 / 返回 | 檢查 App 與 Electron IPC | 可切換 mini/full bounds | `setMiniPlayerMode` 分 full/mini bounds；mini 控制區常駐顯示 | PARTIAL | 已完成程式路徑 | 切換按鈕仍需人工點擊復測 |
| E. MINI 無捲軸 | 檢查 Mini root/CSS 與 production build | 不出現 vertical / horizontal scrollbar | Mini root/card 設為固定視窗尺寸與 `overflow-hidden`，CSS 無 mini 捲軸路徑殘留，production build 通過 | PASS | 已修正 | source/CSS/build 驗證 |
| E. MINI 外框層數 | 檢查 Mini root class | 減少一層外框 | `mini-assistant-card` 已移除最外層 border，保留資訊區與控制區邊框 | PASS | 已修正 | 依使用者要求少一層框 |
| E. MINI 主控常駐 | 檢查 CSS 與 source | 綠框控制區不要隱藏 | `.mini-assistant-controls` 固定 visible / opacity 1 / pointer-events auto，且無 hover hidden 路徑 | PASS | 已修正 | 控制框常駐 |
| E. MINI 播放控制 | 檢查 MiniPlayerAssistant props | mini 可播放、暫停、上一首、下一首 | 控制已接 player handlers | PASS | 已完成 | 未能 GUI 點擊 |
| E. MINI 音樂條設定按鈕移除 | 檢查 Mini 第 2 顆紅圈按鈕與面板殘留 | Mini 不再顯示音樂條設定按鈕或設定面板 | `MiniPlayerAssistant` 已移除 `Settings2`、設定 state 與 inline panel；主播放器 Visualizer 設定仍保留 | PASS | 已修正 | 依使用者要求刪除 |
| E. MINI 透明度按鈕移除 | 檢查 Mini 第 4 顆紅圈按鈕、面板與 IPC 殘留 | Mini 不再顯示透明度按鈕，也不保留專用調整 IPC | `MiniPlayerAssistant` 已移除 `SlidersHorizontal` 與透明度面板；`setMiniOpacity` preload / IPC / type 已移除 | PASS | 已修正 | 依使用者要求刪除 |
| E. MINI 置頂 | 檢查 IPC | 實際 setAlwaysOnTop | `setMiniAlwaysOnTop` 與 mini mode 均呼叫 `setAlwaysOnTop(..., "floating")` | PARTIAL | 已完成程式路徑 | 需跨 App 手動驗收 |
| E. MINI 標題列文字 | 檢查 Electron main process | Mini 不持續顯示 `Aquariusgirl Music Room` title | Mini mode 呼叫 `window.setTitle("")`，回 full mode 呼叫 `window.setTitle("Aquariusgirl Music Room")` | PASS | 已修正 | 原生框行為仍受 OS 控制 |
| E. Windows MINI 黑畫面防護 | 檢查 Electron main / Mini 設定解析 | Windows 點下一首不因透明度/背景造成黑畫面 | Windows Mini 視窗 opacity 強制為 1、背景色固定；renderer 會 clamp 舊版 Mini opacity 到 0.78-1 | PASS | 已修正 | Windows 實機仍建議手動點擊下一首 |
| F. 移除網頁瀏覽提醒 | rg 搜尋 UI 文案與桌面判斷 | Electron 不顯示 Web preview 提醒 | Electron 用 `isDesktopApp` 隱藏，Web preview 文案仍保留給瀏覽器 | PASS | 已完成 | 先前 Electron GUI tree 已確認 |
| F. EmptyState 整體移除 | 檢查 `src` 與 production `dist` | 不再顯示 `EMPTY STATE` 或空狀態大卡 | `src/components/EmptyState.tsx` 已刪除，`App.tsx` 不再引用；`src/dist` 掃描無 EmptyState/EMPTY STATE/小魚乾大卡文字 | PASS | 已修正 | Header/CharacterStage 仍保留選檔入口 |
| G. 音樂譜入口 | 檢查 AudioVisualizer | 有入口且可設定 | `AudioVisualizer` 有設定按鈕與 settings panel | PASS | 已完成 | build 通過 |
| G. 歌詞區域 | 檢查 LyricsPanel | 無資料顯示空狀態，有資料可顯示 | LyricsPanel 有空狀態與匯入 LRC 入口 | PASS | 已完成 | 程式驗收 |
| G. 同名 LRC 自動配對 | 檢查 Electron native selection 與 App auto import | 選好歌曲後自動讀取同資料夾同檔名歌詞 | `electron/main.ts` 讀取同名 `.lrc`，renderer 解析後寫入 IndexedDB lyrics | PASS | 已修正 | Web drag/drop 受瀏覽器安全限制，不能自動讀 sibling file |
| G. 設定保存 / 匯入匯出 | 檢查 localStorage / IndexedDB / export payload | 重新開啟或匯入備份後保留使用者設定 | 歌單、歌詞、音量、循環、隨機、排序、Visualizer、Mini 設定都納入保存/匯出匯入；不保存音樂檔本體 | PASS | 已修正 | 重新整理仍需重新選音樂檔，這是安全限制 |
| H. 整體流暢度 | 檢查昂貴運算與 memo | 不在 render 中重複昂貴讀取 metadata | metadata 由 addFiles 後 async 讀取；列表篩選使用 memo | PASS | 已完成 | 大量歌曲未壓測 |
| 打包 script | 執行 `npm run build`, `electron:compile` | build 不報錯 | 兩者通過 | PASS | 已完成 | 實測 |
| `npm install` | 執行 `npm install` | 可安裝依賴 | `up to date in 1s` | PASS | 已完成 | 實測 |
| `npm run dev` | 執行 Vite dev | localhost 啟動 | `http://127.0.0.1:5173/` 啟動成功 | PASS | 已完成 | 已關閉 |
| `npm run electron` | 執行 Electron GUI | Electron 視窗啟動 | 已啟動 Electron GUI，accessibility tree 確認桌面版主畫面、全螢幕按鈕、mini 入口可見；Computer Use click 仍無法送出 | PARTIAL | 已補讀取驗收 | 點擊需人工復測 |
| `npm run dist:win` | 執行 Windows 打包 | 產出 EXE installer | 通過，最新版會同步到 `release-delivery/installers/` | PASS | 已完成 | 未簽章 |
| `npm run dist:mac` | 執行 macOS arm64+x64 打包 | 產出 DMG | 通過，最新版會同步到 `release-delivery/installers/` | PASS | 已完成 | 未簽章 / 未 notarize |
| `npm run dist:all` | 執行全平台打包 | 依目前 OS 產出可支援平台 | 14:05 升級權限重跑通過，重新產出 macOS x64/arm64 DMG 與 Windows x64 EXE | PASS | 已完成 | 一般沙盒仍會卡 `hdiutil create` |
| installer 位置整理 | 執行 `scripts/sync-installers.mjs` | 只保留一個最新版交付位置 | `release-delivery/installers/` 保留三個 14:04 最新 installer；暫存 `release/` 已移除 | PASS | 已完成 | 避免兩個類似資料夾 |
| GitHub Actions 發行 | 檢查 workflow | tag push 自動產出 artifacts | 已新增 `.github/workflows/release.yml` | PASS | 已完成 | 未在 GitHub runner 實跑 |
| macOS universal | 檢查需求 | 可行則產出 universal | 目前未設定 universal target | NOT SUPPORTED | 未支援 | 可後續加入 |
| 程式碼簽章 / notarization | 檢查 package | 正式發行簽章 | 目前 `identity: null` 且無 Windows cert | NOT SUPPORTED | 未支援 | 正式發行需補 |

## 上一輪歷史實測指令摘要

以下為 2026-06-16 20:24:03 installer 的歷史驗收；本輪 21:56 最新狀態請以上方「本輪最新狀態」為準。

- `npm install`：PASS
- `npm run build`：PASS
- `npm run electron:compile`：PASS
- `npm run dev -- --host 127.0.0.1`：PASS
- packaged macOS app：PASS，可啟動，已確認原生紅黃綠視窗控制存在
- packaged macOS app 歌單區：PASS，不再顯示「目前播放佇列」與播放清單資料夾建立入口
- Full mode title source/build 驗證：PASS，頂部 `Aquariusgirl Music Room` 名稱只在 full mode 顯示
- Mini source/CSS 驗證：PASS，260x268 設定無水平/垂直捲軸路徑，主控控制框常駐 visible，最外層 border 已移除
- Mini 第 2/第 4 顆紅圈按鈕：PASS，音樂條設定與透明度按鈕、面板及透明度 IPC 已移除
- EmptyState 整體移除驗證：PASS，`src/dist` 已無 EmptyState/EMPTY STATE/小魚乾大卡文字
- 歌曲列播放/暫停切換：PASS，source/build 驗證目前歌曲列接 `onTogglePlay`
- 設定保存/匯入匯出：PASS，Visualizer 與 Mini 設定已納入備份 payload 與匯入流程
- 同名 LRC 自動配對：PASS，Electron native 選檔/資料夾流程會帶入同資料夾同名 `.lrc`
- Windows Mini 黑畫面防護：PASS，Electron win32 視窗 opacity 強制 1，renderer clamp 舊 Mini opacity
- `npm run electron`：PARTIAL，Electron GUI 可啟動且可讀取 UI；Computer Use click 無法送出
- `npm run dist:win`：PASS
- `npm run dist:mac`：PASS
- `npm run dist:all`：PASS；一般沙盒中曾因 `hdiutil` 權限失敗，升權重跑後通過
- `node scripts/sync-installers.mjs`：PASS，最新 DMG/EXE 已整理到 `release-delivery/installers/`
- installer 最終同步時間：2026-06-16 20:24:03

## 最新結論

本輪已移除 Queue 面板、紅圈 Queue 按鈕、同步歌詞 / LRC 入口，並新增手動拖曳排序；`playlist-logic-check`、`npm run build`、`npm run electron:compile`、升級權限 `npm run dist:all` 通過。最新 DMG / EXE 已位於 `release-delivery/installers/`，修改時間為 2026-06-17 15:00:14-15:00:15 CST；暫存 `release/` 已移除。可交付程度為 PARTIAL：installer 可交付測試，但 Windows EXE 尚未在 Windows 真機執行，macOS packaged app 本輪未做 GUI 拖曳驗收，正式公開發行仍需簽章與 notarization。

## 上一輪歷史結論

功能程式碼層已修正主要缺口，且當時的 Windows / macOS 測試 installer 已重新產出並整理到 `release-delivery/installers/`。packaged macOS app 已實際啟動並確認原生視窗控制存在，也確認「目前播放佇列」與播放清單資料夾入口已退場。Full mode 已補回頂部 app 名稱；Mini 已修正為無捲軸、控制框常駐顯示、最外層 border 移除、紅圈兩顆音樂條設定與透明度按鈕完整刪除，並整理成兩顆底部按鈕的等距版面；EmptyState 已從 UI 與 source 移除。本輪另修正目前歌曲列播放/暫停切換、設定保存/匯入匯出補齊、同名 LRC 自動配對，以及 Windows Mini 防黑畫面處理。可交付程度為 PARTIAL：installer 可交付測試，但 MINI alwaysOnTop 跨 App 與 Windows 實機點擊仍需人工復測；正式公開發行仍需簽章與 notarization。
