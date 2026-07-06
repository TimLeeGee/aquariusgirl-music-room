# AGENTS.md

## 快速接手

- Aquariusgirl Music Room 是 React + TypeScript + Vite + Electron 的本地音樂播放器，目前版本是 `0.1.42`。
- 0.1.42 最新 hotfix 是 `Playing File Lock Release`：使用者以 Windows EXE 實測回報，播放中使用「套用到原始檔」有時無法保存。根因是 Windows 上 `<audio>` 以 `file:` URL 載入原始檔時持有檔案 handle，寫回最後的 `rename(tempPath, sourcePath)` 覆蓋被 `EPERM` / `EBUSY` 擋下；macOS rename 可覆蓋開啟中檔案，所以 DMG 驗收不會重現。修法兩層：`src/hooks/useAudioPlayer.ts` 新增 `suspendAudioForFileWrite(trackId)`，只在寫回目標就是目前載入那首歌時暫停並卸下 audio src 釋放 OS handle，回傳 restore 函式，restore 以一次性 `loadedmetadata` listener 接回同一來源、原播放位置與播放狀態；`App.tsx` `handleApplySongInfoToOriginal` 只在 IPC 寫回期間 suspend、`finally` 立刻 resume；`electron/songInfoWriter.ts` 補 `renameWithRetry`（`EPERM` / `EBUSY` / `EACCES` 重試 3 次、150ms）擋防毒短暫鎖檔，重試後仍鎖住回傳明確錯誤「原始檔正被其他程式使用中，請暫停播放後再試一次。原始檔未修改。」釋放 / 接回 O(1) 只碰目前那一首，不掃曲庫；未新增套件、未改 DB schema、未動 0.1.41 partial-read / full-load retry、readback hash 與單曲 IndexedDB 路徑。`check:metadata-save-loop` 已加鎖釋放與 rename retry guard。專案根目錄新增 `打包發行.command`：雙擊即在 Mac 本機跑 `npm run dist:release`，log 寫到 `qa-temp/dist-release.log` 供 agent 監控；0.1.42 EXE / DMG 已產出並同步 `release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.42-checksums.md`。packaged GUI 播放中保存驗收與 Windows 真機仍待補；本輪未 push GitHub。
- 0.1.41 hotfix 是 `Full-Load Cover Write Guard / Packaged Mouse QA`：使用者回報 0.1.40 後第一次改封面成功，第二次改封面後保存不關面板、重新讀取 metadata 失敗，重開後該首歌失去封面與資料。本版不清 IndexedDB、不重掃曲庫、不加 `coverRevision`、不補 MIME 側門、不重寫 metadata 架構、不恢復「儲存到播放器」。Electron writer 仍維持 user-initiated 單曲寫回、同一個 TagLib handle 內設定文字與封面、最後只 `saveToFile(tempPath)` 一次再 rename；另補 read metadata partial failure -> `partial:false` full-load retry，避免 packaged Emscripten TagLib 對大封面 FLAC 預設約 1MB partial header 讀取失敗後讓 reload/readback 失敗。`scripts/song-info-writer-check.mjs` 守住 writer 不可回到 `copyWithTags` / `edit(tempPath)` 雙保存路徑，強制 fixture 走 `node_modules/taglib-wasm/dist` 的 Emscripten wasm，並用 Plazma 暫存複本做 Cover 02 -> Cover 01 -> Cover 02 readback。packaged DMG app 已用隔離 userData 與滑鼠完成 Cover 01 -> Cover 02、Cover 02 -> Cover 01、Cover 01 -> Cover 02 三輪驗收，包含 preview、dirty/apply、busy lock、自動關閉、readback hash、「重新讀取音樂標籤」與重開保存確認。0.1.41 仍保留 0.1.40 的 selectedCover dirty、防 incomplete cover bytes、readback hash 驗證與 `await putTrackMetadata(reloadedTrack)`；Windows 真機仍未驗。
- 0.1.40 hotfix 是 `Selected Cover Dirty Guard / Reload Metadata Diagnostics`：0.1.39 後第二次選不同封面可能 preview 變了，但 dirty 回到 false，右下角顯示「沒有任何欄位變更」且「套用到原始檔」無法真正執行。本版只修 `App.tsx` 與 `SongInfoPanel.tsx`，不清 IndexedDB、不重掃曲庫、不加 `coverRevision`、不補 MIME 側門、不重寫 metadata 架構、不恢復「儲存到播放器」。`SongInfoPanel` 以獨立 `selectedCover` 保存同一份 bytes / MIME / hash / preview，文字 dirty 與封面 dirty 分開判斷；open=true 同一首歌時不再因 track snapshot 變動無條件 reset。App 端保留 readback hash 驗證與 `await putTrackMetadata(reloadedTrack)`，若 cover hash 要更新但 bytes 缺失會提示重新選封面；`reloadSongInfoFromOriginal` 失敗會輸出 console.error 診斷。0.1.40 installer 已完成 DMG verify、唯讀掛載讀回與 Windows NSIS static check；Windows 真機與 packaged GUI 連續封面滑鼠驗收仍待補。
- 0.1.39 hotfix 是 `Cover Hash Readback / Playlist Order Persistence`：封面保存不再信任前端 draft 或 write success，必須讓 Electron 寫回後重新讀回原始檔 cover bytes 並驗證 readback `coverHash` 等於 selected hash 且不同於舊 hash，才更新播放器並 `await putTrackMetadata(reloadedTrack)`。同版修正 playlist / 全部歌曲自訂排序保存：一般 playlist 保存 `trackIds`，全部歌曲自訂排序只保存 moved track 的 `addedAt`，避免上萬首曲庫拖曳時重寫全庫。
- 0.1.38 hotfix 是 `Cover MIME Alias / Sort Controls Guard`：0.1.37 後使用者在 DMG / EXE 實測回報 playlist 排序方式看起來被拿掉，且封面一次也無法保存。本版不新增排序模式、不重做儲存流程，只守回原本 7 種排序選項與可見寬度，並在 `check:track-list-virtualization` 防止排序 option 消失；封面路徑只把常見 `image/jpg` / `image/pjpeg` / `image/x-png` 正規化成既有 `image/jpeg` / `image/png`，讓 renderer 與 Electron writer 對 packaged OS MIME 別名一致，仍拒絕 GIF / WebP / 真實不支援 MIME。沒有新增套件、沒有重掃曲庫、沒有改 DB schema、沒有壓縮封面；5 MB 上限、單曲原始檔寫回與單曲 IndexedDB 保存都保留。0.1.38 installer 已產出並完成 DMG verify、唯讀掛載讀回與 Windows NSIS static check；packaged macOS GUI 已確認排序 7 選項，純滑鼠封面選檔因 macOS 隱私提示需使用者明確允許後才能補驗。
- 0.1.37 hotfix 是 `Cover MIME Fallback / Second Cover Save`：同一首米津玄師歌曲第一次更換封面可成功、第二次可能失敗。根因是 macOS / Electron 可能讓 `.jpg` / `.png` 第二次選檔帶空白或 `application/octet-stream` MIME，`FileReader` 也可能產生 `data:;base64,...` 或 `data:application/octet-stream;base64,...`，舊 renderer validation 與 Electron writer 只接受明確 `image/jpeg` / `image/png`。本版在 `src/utils/songInfo.ts` / `SongInfoPanel` 只對空白或 octet-stream MIME 依副檔名推回 `image/jpeg` / `image/png` 並正規化 data URL；`electron/songInfoWriter.ts` 也只對空白 / octet-stream data URL 接受 `draft.coverMimeType` fallback，真實不支援 MIME 仍拒絕。沒有新增套件、沒有重掃曲庫、沒有改 DB schema、沒有壓縮封面；5 MB 上限、單曲原始檔寫回與單曲 IndexedDB 保存都保留。
- 0.1.36 hotfix 是 `Song Info Single Save Path / TagLib Property Map Restore`：0.1.35 修 packaged wasm 後，歌曲資訊讀取改走 `audioFile.properties()`，但初版只處理 lowercase 欄位，遇到 TagLib property map 的 `TITLE` / `ARTIST` / `ALBUMARTIST` / `TRACKNUMBER` 等大寫鍵時會讓歌手、專輯歌手、曲目等欄位漏掉。本版在 `electron/songInfoWriter.ts` 補最小 alias map，保留 unpacked `taglib-web.wasm` 與 `forceWasmType: "emscripten"`。同時依使用者要求移除歌曲資訊面板「儲存到播放器」按鈕與 App 端 player-local save handler，避免 0.1.28 重新出現的播放器 DB metadata 與原始檔 tag 雙路徑再次打架；目前只保留「套用到原始檔」：寫回原檔、重新讀回該首、再 `putTrackMetadata(reloadedTrack)`。
- 0.1.35 hotfix 是 `Packaged EXE Metadata Wasm Restore`：Windows EXE 版歌曲資訊讀取疑似因 `taglib-wasm` 預設從 app.asar 內找 `.wasm` 而失敗，macOS DMG 正常。修法是在 `package.json` `extraResources` 外帶 `node_modules/taglib-wasm/dist/taglib-web.wasm` 到 `resources/taglib-wasm/taglib-web.wasm`，`electron/songInfoWriter.ts` 改用可指定 `wasmUrl` 的共用 `TagLib.initialize({ forceWasmType: "emscripten" })` 實例，不再使用不能指定 wasm 路徑的 `taglib-wasm/simple`。`check:taglib-wasm-packaging` 已加入 `dist:release` / `dist:mac` / `dist:win`；Windows 只做 NSIS static check，未做真機驗證。
- 0.1.34 hotfix 是 `Playlist Panel Scroll Restore`：0.1.33 已恢復主視窗大型卷軸後，playlist 內部小卷軸又因 `PlaylistPanel` 只有 `max-h` 沒有實際高度而失效；目前 `PlaylistPanel` 必須保留 `h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[520px]`，`TrackList` 必須保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`。`AppLayout` 仍是主視窗 `h-screen overflow-y-auto overflow-x-hidden` scroll container，`body` 只保留 `overflow-x: hidden`，不要為了修 playlist 再把主視窗卷軸關掉。0.1.28 的 `Kill Metadata Save Loop` 仍是資料流基底：播放統計、duration、歌曲資訊 / 封面保存走單曲 `put` / `patch`；播放佇列會跟目前歌曲清單排序由上到下播放；歌曲清單只 render 可見窗口，避免上萬首一次產生上萬個 DOM row；dev guard 可警示重複 stored metadata 回灌、播放中非預期原檔 metadata 重讀、同 track source 變動造成的 `audio.load()`。
- 主程式在 `src/`，Electron main/preload 在 `electron/`，打包與檢查腳本在 `scripts/`。
- 發行與驗收紀錄在 `release-delivery/`；改版前先讀 `release-delivery/QA_REPORT.md` 與 `release-delivery/README.md`。
- AI prompt 在 `private/prompts/`，GGUF 模型與 llama.cpp runtime 放在 `resources/ai/`；大型模型與 installer 不進 Git。

## 專案邊界

- 這是本地優先音樂播放器，只播放使用者明確選擇的本機音樂。
- 不使用 YouTube、不串流、不串接線上音樂、不下載音樂、不生成圖片。
- 不保存音樂檔本體、`File`、`Blob`、`ArrayBuffer` 或 object URL 到 localStorage / IndexedDB；只保存 metadata、播放清單與設定。
- Electron 版可以用原生檔案對話框，但不可偷偷掃描整台硬碟。
- AI 只能使用目前已載入 / 已索引歌曲的安全 metadata；模型不得編造歌曲、路徑或播放清單內容。

## 修改守則

- 先讀 `README.md`、`release-delivery/README.md`、`release-delivery/QA_REPORT.md`、`package.json` 與相關 source，再修改。
- 手術刀精準修改必要檔案；不要順手重構、改版號或整理無關格式。
- 優先使用既有程式、標準函式庫與平台原生能力；不要為小需求新增套件或抽象。
- 若做有明確上限的簡化，用 `ponytail:` 註解標出原因與未來升級路線。
- 不要覆蓋或回復使用者在工作樹中的既有變更。

## 驗收守則

- 文件-only 修改：檢查檔案存在、索引引用正確、`git diff` 只含預期 Markdown；不要輸出 EXE / DMG。
- 程式修改：至少跑 `npm run build` 與 `npm run electron:compile`，再依改動範圍跑相關 `check:*`。
- 只有 app code、資源、版本或打包設定變更，或使用者明確要求時，才重打 installer。
- 打包 installer 使用同一條 `npm run dist:release`；若一般 sandbox 卡在 `hdiutil create`，取得允許後升權重跑，不要改打包方式。
- macOS 可驗 DMG；在 macOS 上只能做 Windows EXE static check，不可宣稱 Windows 真機已驗證。
- 封面 / 歌曲資訊寫回驗收必須使用暫存音樂複本與隔離 profile，不可打開或修改使用者原始 Music 資料夾；若 macOS 原生檔案對話框無法自動操作，需明確記錄哪些步驟使用受限 harness、哪些步驟由 packaged UI 滑鼠完成。
- 發佈到 GitHub main 前，根目錄 `README.md` / `CONTINUE_WORK.md` / `AGENTS.md` 與 `release-delivery/*.md` 都要補最新紀錄，保留舊歷史，再 push 並讀回 `origin/main` 確認。
