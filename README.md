# Aquariusgirl Music Room

English version: see [English Version](#english-version).

水瓶罐子的音樂小水池是一款本地音樂播放器。Web 版可用瀏覽器啟動，Electron 版可打包成桌面安裝檔。播放器只讀取使用者明確選擇的本機音樂，不使用 YouTube、不串接線上音樂、不下載音樂、不生成圖片。

## 目前最新版本

0.1.49 修正版「Mini Switch Playback Continuity / Mini 切換播放中斷修正＋播放自癒保險＋AI 聊天視窗 UX」接續 0.1.48：使用者回報主畫面播放中切到 Mini 播放器播放停住、再按播放無反應、切回主程式跳「瀏覽器阻擋播放」。根因是 0.1.48 面板文字功能把 `<audio>` 元素包進新的 `TextOverrideContext.Provider`，使其不再是 `BrandAssetsContext.Provider` 首子節點；React 依位置 reconcile，切 Mini/OBS 時判定位置不同而卸載重建 `<audio>` DOM 節點——播放中斷、已載入音源失效，後續 `play()` 對空節點失敗誤報「瀏覽器阻擋」。修法：`{audioElement}` 移回三分支（一般／Mini／OBS）一致的首子節點位置，切模式沿用同一 DOM 節點無縫續播；並在 `useAudioPlayer` 加自癒保險——播放前偵測「有歌但節點沒音源」自動重掛＋恢復播放位置、`togglePlay` 壞狀態第一下改重新播放、寫檔暫停期間自癒停用（不影響 0.1.42 Windows 鎖檔修法）、`describePlayError` 錯誤分流（只有 `NotAllowedError` 才報「阻擋」，其他報「音源載入失敗」）。同版 AI 聊天視窗 UX：快捷泡泡列 sticky 置頂於聊天視窗內頂端、第一次點泡泡或送出訊息後收合成細把手、hover 下拉（純 CSS group-hover、不掛 scroll 監聽）；訊息區底部錨定、訊息少時貼底新訊息由下往上長像真實聊天；聊天捲動區 256px 加高至固定 500px，圓角與卡片間距維持原樣、播放清單分頁不動。另記錄 dev 模式已知限制：`electron:dev` 渲染來自 http origin，Chromium 禁止載入 `file://` 音源，dev 驗證播放需用拖曳（blob）、打包版不受影響。零新套件；沙盒 `tsc --noEmit`／`electron:compile`／全部 `check:*` 通過；Mac 本機 `npm run dist:release` 打包 mac DMG＋Windows EXE（DMG `hdiutil verify` VALID＋掛載讀回 0.1.49/arm64/taglib wasm、EXE NSIS static check），SHA-256 見 `docs/releases/0.1.49-checksums.md`。打包版 GUI 實測與 Windows 真機待補；本次已推送 GitHub `main`。

0.1.48（含 0.1.45–0.1.47）：這一批把 AI 助手與面板文字自訂做起來——0.1.45 AI 助手效率／穩定改善（智慧分流、token 預算、卡死自動重啟）＋在 AI 聊天面板做歌曲資訊健檢與逐首補全（只寫文字、不碰封面、可復原）；0.1.46 AI 空狀態快捷指令氣泡＋面板文字自訂（設定「文字」分頁）；0.1.47 搜尋泡泡改預填／空查詢反問、檢查歌曲資訊可選資料夾範圍／推測不出可逐首手動編輯／非 mp3-flac-m4a 可檢視並「顯示位置」、角色名稱（中／英）一改全站換；0.1.48 面板文字自訂升級為開放登錄表（~20 條 UI 字串可逐句覆寫、分組＋可搜尋）。全部零新套件、不動寫回／readback／DB schema；沙盒 `tsc --noEmit`／`electron:compile`／全部 `check:*` 通過，Mac 本機 `npm run dist:release` 打包 mac DMG＋Windows EXE（DMG `hdiutil verify` VALID＋掛載讀回版本/arm64/taglib wasm、EXE NSIS static check），程式與文件已推送 GitHub main（commit `f48f6b5`，installer 不進 git）。各版 SHA-256 見 `docs/releases/0.1.4x-checksums.md`。打包版 GUI 實測與 Windows 真機仍待補。

0.1.44 修正版「Confirm Focus Lock / Toast Position / 確認窗焦點鎖死與提示位置」接續 0.1.43：使用者以 Windows EXE 實測回報，更換歌曲封面成功後，playlist 排序按鈕點不開、playlist 搜尋歌手輸入框與 AI 助手輸入框點了沒反應（一般按鈕仍可按，以前也疑似發生過）。根因是套用流程中的 `window.confirm()` 原生同步確認窗：Electron 已知 Windows 問題——`window.confirm` / `window.alert` 關閉後 webContents 鍵盤焦點壞掉，原生 `<select>`（排序正是原生 select）打不開、文字輸入框（搜尋、AI）無法取得焦點，但一般 button 正常；macOS 不受影響所以 DMG 驗收不重現。本版最小修法零新套件、不動寫回與 readback hash 路徑：新增 `src/components/ConfirmDialog.tsx`（renderer 確認窗，樣式與焦點行為照抄 PlaylistDeleteDialog，取消鈕 autoFocus、支援 Esc）取代全專案 4 處 `window.confirm`（套用到原始檔、放棄修改、重新讀取音樂標籤、匯入備份合併）；`electron/main.ts` 的 3 個原生檔案選擇 dialog 一律掛 parent window、關閉後補 `webContents.focus()` 堵同類地雷；`scripts/song-info-check.mjs` 加 guard 禁止 renderer 再出現 `window.confirm` / `window.alert`。同版一併修正：`MessageToast` 提示從右上移到左上 `left-4 top-12`（切齊桌面版標題列下緣，不再蓋住右上角「選擇音樂檔」等按鈕、不再被裁切）並加 `pointer-events-none` 讓提示永不擋點擊；排序控制加 hover 變色反饋（對齊我的最愛按鈕的 glass hover 樣式）；逐路徑核對保存成功 / 失敗提示——成功「已套用到原始檔」與所有失敗分支都有 toast，位置移開後一定看得到。已通過（Linux 沙盒）`tsc --noEmit`、`npm run electron:compile` 與全部 `check:*`（含 writer 真實 wasm roundtrip 與新 confirm guard）；上萬首曲庫與 M1 Air 8GB 效能不受影響（全為 UI 層小改）。0.1.44 installer 已同步到 `release-delivery/installers/`，SHA-256 請看 `docs/releases/0.1.44-checksums.md`；程式與文件已依使用者指示推送 GitHub main（installer 不進 git），Windows 真機驗收待使用者實測回報。

0.1.43 修正版「Big Cover Readback Crash / Save Feedback / 大封面讀回崩潰與保存提示」接續 0.1.42：使用者以 macOS DMG 實測回報，nonoc-Memento MP3 用 320KB `cover 01.jpeg` 更換封面可保存成功，但改用 4.3MB `Cover 01.jpg` 按「套用到原始檔」後卡住；關掉面板後按「重新讀取音樂標籤」一直失敗；Finder 已顯示新封面、播放器內卻仍是舊封面。根因與副檔名無關，是封面「大小」：已在 Linux 沙盒以打包版 wasm 設定 100% 重現 — taglib-wasm 預設 partial read 只讀前 1MB + 尾 128KB，寫入 4.3MB 封面後 MP3 的 ID3v2 標籤區約 4.3MB 被攔腰截斷，packaged Emscripten TagLib 解析截斷 buffer 時直接 WASM `RuntimeError: unreachable`（`isValid()` 仍回 true，崩潰發生在 properties / getPictures / dispose），不是 `InvalidFormatError`，所以 0.1.41 的 full-load retry 條件接不到：寫回其實成功、readback / reload 永遠失敗，播放器與 IndexedDB 停在舊資料。第二個問題是提示被蓋住：`MessageToast` 是 `z-[60]`，歌曲資訊面板 overlay 是 `z-[80]`，保存失敗時面板不關、錯誤訊息完全看不到，使用者只能感覺「卡住」。

本版最小修法 4 檔案約 40 行、零新套件、不清 IndexedDB、不改 DB schema、不動寫回與 readback hash 路徑：`electron/songInfoWriter.ts` 的 `readSongInfoFromOriginalFile` 新增 `partialRead` 選項且預設完整讀取（寫前預讀、保存後 readback、「重新讀取音樂標籤」等單檔 user-initiated 動作永不踩截斷崩潰）；partial 路徑改為遇到任何錯誤（含 WASM RuntimeError）都 fallback 一次 `partial:false` 完整讀取；`readPicturesSafely` 遇 `WebAssembly.RuntimeError` 改 rethrow 交給 fallback，不再吞掉變成「無封面」假結果。`electron/selectedFile.ts` 的資料夾／多檔掃描明確走 `partialRead: true` 快速路徑，上萬首曲庫載入效能不變，大封面檔案自動多讀一次完整檔自癒。`MessageToast` 升到 `z-[90]` 讓成功「已套用到原始檔」與各種失敗訊息永遠顯示在最上層；`SongInfoPanel` 保存中按鈕顯示「套用中…」。已通過（Linux 沙盒）：打包版 wasm 設定下 320KB 與 4.3MB 封面寫入＋讀回 hash 驗證、掃描路徑 fallback 驗證、`check:song-info`（含 writer 真實 wasm roundtrip）、`check:metadata-save-loop`、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`check:taglib-wasm-packaging`、`tsc --noEmit`、`npm run electron:compile`；Mac 本機 `打包發行.command`（`npm run dist:release`）內建全部 check 與 vite build 再次通過。0.1.43 installer 已同步到 `release-delivery/installers/`，SHA-256 請看 `docs/releases/0.1.43-checksums.md`；本輪依使用者要求不 push GitHub。

0.1.42 修正版「Playing File Lock Release / 播放中檔案鎖釋放與寫回重試」接續 0.1.41：使用者以 Windows EXE 實測回報，播放中使用「套用到原始檔」有時無法保存。根因：Windows 上 `<audio>` 以 `file:` URL 載入原始檔時會持有檔案 handle，寫回流程最後的 `rename(tempPath, sourcePath)` 覆蓋被 `EPERM` / `EBUSY` 擋下；macOS 的 rename 可覆蓋開啟中的檔案，所以 DMG 驗收一直不會重現。這次不清 IndexedDB、不重掃曲庫、不改 DB schema、不動 0.1.41 的 partial-read / full-load retry、readback hash 與單曲 IndexedDB 保存路徑。

本版最小修法分兩層：renderer 的 `useAudioPlayer` 新增 `suspendAudioForFileWrite(trackId)`，只在要寫回的那首就是目前載入的歌時，暫時卸下 audio src 釋放 OS handle，寫完由一次性 `loadedmetadata` listener 接回同一來源、原播放位置與播放狀態（`App.tsx` 只在 IPC 寫回期間 suspend，`finally` 立刻 resume）；Electron writer 的 rename 補 `renameWithRetry`（`EPERM` / `EBUSY` / `EACCES` 重試 3 次、150ms 間隔）擋 Windows 防毒短暫鎖檔，仍失敗時回傳明確錯誤「原始檔正被其他程式使用中，請暫停播放後再試一次。原始檔未修改。」釋放 / 接回只作用目前載入那一首，O(1)、不掃曲庫，上萬首曲庫與 M1 Air 8GB 無額外負擔。已通過 `check:metadata-save-loop`（新增鎖釋放與 rename retry guard）、`check:song-info`（含 writer 真實 wasm roundtrip）、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`tsc --noEmit`、`npm run electron:compile`。0.1.42 installer 已由新增的 `打包發行.command`（本機 `npm run dist:release`）產出並同步到 `release-delivery/installers/`（EXE 667,666,956 bytes、DMG 684,778,895 bytes，DMG hdiutil verify VALID），SHA-256 請看 `docs/releases/0.1.42-checksums.md`；本輪依使用者要求不 push GitHub。

0.1.41 修正版「Full-Load Cover Write Guard / Packaged Mouse QA / 完整載入封面寫回防線與打包版滑鼠驗收」接續 0.1.40：使用者回報第一次更換封面成功，但第二次保存後面板不關、重新讀取 metadata 失敗，重開後該首歌可能失去封面與資料。這次仍不清 IndexedDB、不重掃曲庫、不加 `coverRevision`、不補 MIME 側門、不重寫 metadata 架構、不恢復「儲存到播放器」。根因收斂到 packaged Emscripten TagLib 對大封面 FLAC 的 partial header 讀取：預設 partial read 在二次寫回後可能讀不到完整 Vorbis / FLAC 標籤區，造成 reload / readback 失敗。

本版只在 Electron song-info writer 補最小安全防線：先走既有 partial read，只有遇到 `InvalidFormatError` 才對同一首 user-initiated 原始檔做 `partial:false` full-load retry；原始檔寫回仍用同一個 TagLib handle 設定文字與封面，最後只 `saveToFile(tempPath)` 一次再 rename。`scripts/song-info-writer-check.mjs` 強制 fixture 使用 `node_modules/taglib-wasm/dist` 的 Emscripten wasm，守住不可回到 `copyWithTags` / `edit(tempPath)` 雙保存路徑，並對 Plazma QA 複本做 Cover 02 -> Cover 01 -> Cover 02 readback。已通過 packaged DMG 隔離 profile 真實滑鼠三輪驗收：Cover 01 -> Cover 02、Cover 02 -> Cover 01、Cover 01 -> Cover 02，每輪 preview、dirty/apply、busy lock、自動關閉與 readback hash 都確認；「重新讀取音樂標籤」成功，重開同隔離 profile 後最後 Cover 02 與 metadata 仍存在。SHA-256 請看 `docs/releases/0.1.41-checksums.md`。Windows 真機仍待補；本輪依使用者要求不 push GitHub。

0.1.40 修正版「Selected Cover Dirty Guard / Reload Metadata Diagnostics / 選取封面 dirty 防線與重新讀取診斷」接續 0.1.39：本版只針對 `App.tsx` 與 `SongInfoPanel.tsx` 修第二次選封面後 dirty 被重設的狀態機問題。封面選圖改用獨立 `selectedCover` 保存同一份 bytes / MIME / hash / preview，文字 dirty 與封面 dirty 分開判斷；同一首歌面板開啟期間不再因外部 track snapshot 變動無條件 reset draft，避免 preview 已變但右下角回到「沒有任何欄位變更」。apply 時才把文字 draft 與 selected cover 組成真正送出的 draft，若 cover hash 顯示要更新但 bytes 不在，會要求重新選封面。

App 端仍保留 0.1.39 的成功條件：寫回原始檔後重新讀回，`reloadedTrack.coverHash === selectedCover.hash` 且不同於舊 hash，接著必須 `await putTrackMetadata(reloadedTrack)` 成功後才顯示「已套用到原始檔」並關閉面板。`reloadSongInfoFromOriginal` 失敗現在會輸出 `[reload-metadata] failed` / `[reload-metadata] exception`，dev runtime 也可看到 selected hash、cover/text dirty、readback hash 與 IDB 保存 hash。沒有新增套件、沒有清 IndexedDB、沒有重掃曲庫、沒有加 `coverRevision`、沒有補 MIME 側門、沒有恢復「儲存到播放器」。已通過 `check:song-info`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`、DMG verify、唯讀掛載讀回版本 / app.asar 與 Windows NSIS static check；SHA-256 請看 `docs/releases/0.1.40-checksums.md`。Windows 真機與完整 packaged GUI 純滑鼠連續封面驗收仍待補；本輪依使用者要求不 push GitHub。

0.1.39 修正版「Cover Hash Readback / Playlist Order Persistence / 封面 hash 讀回與播放清單排序保存」接續 0.1.38：這次不再補 MIME 側門、不清 IndexedDB、不重掃曲庫、不加 `coverRevision`。封面更換改成單一可驗證保存線：前端選圖只保存同一份 `selectedCoverBytes` / MIME / hash 與 preview；按「套用到原始檔」後傳同一份 bytes 到 Electron，Electron 寫入後立刻重新讀回原始檔封面 bytes 並重新計算 `coverHash`，只有 readback hash 等於 selected hash 且不同於舊 hash，才更新目前歌曲與歌曲清單，再 `await putTrackMetadata(reloadedTrack)`。成功前 UI 會鎖住選圖 / 套用 / 關閉，失敗時不關面板、不清 dirty、不顯示假成功。

同版也修正「自訂歌曲排序後不會保存」：一般 playlist 的 `trackIds` 維持既有 localStorage write-through 與 IndexedDB `savePlaylists`；全部歌曲的自訂排序現在只更新被拖曳那首的 `addedAt` 排序鍵，並立刻 `putTrackMetadata(movedTrack)`，避免每次拖曳都重寫上萬首。沒有新增套件、沒有保存音樂檔本體、沒有改 DB schema。已通過 `check:song-info`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`、DMG verify、唯讀掛載讀回版本 / app.asar / packaged guard 字串與 Windows NSIS static check；SHA-256 請看 `docs/releases/0.1.39-checksums.md`。Windows 真機與完整 packaged GUI 連續封面滑鼠驗收仍待補；本輪依使用者要求不 push GitHub。

0.1.38 修正版「Cover MIME Alias / Sort Controls Guard / 封面 MIME 別名與排序選單防回歸」接續 0.1.37：使用者在 DMG 與 EXE 實測回報 playlist 原本的多樣排序方式看起來被拿掉，且封面一次也無法保存。這次不是要新增排序功能、重做播放清單、清 IndexedDB 或重寫歌曲資訊保存；排序原本 7 種模式仍在 source 裡，本版只讓 native select 有穩定可見寬度與 aria label，並把 7 個排序選項寫入 source guard，避免打包後或後續改版讓排序選單消失。

封面路徑則延續 0.1.37 的 MIME fallback，但補上常見 packaged OS MIME 別名：`image/jpg` / `image/pjpeg` canonicalize 成 `image/jpeg`，`image/x-png` canonicalize 成 `image/png`。renderer validation、data URL 正規化與 Electron writer 解碼走同一組安全別名；真實不支援的 GIF / WebP / 其他 MIME 仍拒絕。沒有新增套件、沒有重掃曲庫、沒有改 DB schema、沒有壓縮封面；5 MB 上限、單曲原始檔寫回、單曲 IndexedDB 保存與 TrackList windowing 都保留。已通過 `check:song-info`、真實 Plazma 暫存複本封面 roundtrip、`check:track-list-virtualization`、`check:playback-order`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`、DMG verify、唯讀掛載讀回版本 / app.asar / packaged alias 字串與 Windows NSIS static check；SHA-256 請看 `docs/releases/0.1.38-checksums.md`。packaged macOS GUI 已用隔離 profile 開啟，確認排序下拉選單 7 種選項都在；原生封面選檔器可用真實滑鼠打開，但純滑鼠選檔被 macOS 隱私提示擋住，需要使用者明確允許後才能完成。本輪依使用者要求不 push GitHub。

0.1.37 修正版「Cover MIME Fallback / Second Cover Save / 封面 MIME fallback 與第二次封面保存」接續 0.1.36：同一首米津玄師歌曲第一次更換封面可成功，但第二次可能失敗。這次不是要清 IndexedDB、重掃曲庫或重做歌曲資訊面板；根因是 macOS / Electron 的檔案選擇流程可能讓第二次選到的 `.jpg` / `.png` 帶著空白或 `application/octet-stream` MIME，`FileReader` 也可能產生 `data:;base64,...` 或 `data:application/octet-stream;base64,...`，舊驗證與 Electron writer 只接受明確 `image/jpeg` / `image/png`，因此第二次封面可能被擋掉或寫入端拒絕。

本版最小修法是不新增套件、不改資料庫 schema、不壓縮封面、不重掃歌曲：renderer 只在副檔名已是 `.jpg` / `.jpeg` / `.png` 且 MIME 為空白或 octet-stream 時推回正確 image MIME，並把 data URL prefix 正規化；Electron writer 的封面解碼也只對空白 / octet-stream 接受 `draft.coverMimeType` fallback，真實不支援 MIME 仍會拒絕。5 MB 封面上限、單曲原始檔寫回、單曲 IndexedDB 保存與 TrackList windowing 都保留。已通過 `check:song-info`、真實 Plazma 暫存複本 Cover 02 -> Cover 01 roundtrip、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、唯讀掛載讀回版本 / app.asar / packaged fallback 字串與 Windows NSIS static check；SHA-256 請看 `docs/releases/0.1.37-checksums.md`。本輪依使用者要求不 push GitHub。

0.1.36 修正版「Song Info Single Save Path / TagLib Property Map Restore / 歌曲資訊單一路徑與 TagLib 欄位映射復原」接續 0.1.35：0.1.35 修復 packaged EXE wasm 路徑後，歌曲資訊讀取改用 `audioFile.properties()`，但初版只處理 lowercase 欄位，遇到 TagLib property map 常見的 `TITLE` / `ARTIST` / `ALBUMARTIST` / `TRACKNUMBER` 等大寫鍵時，歌手、專輯歌手、曲目等欄位可能讀不到。這會讓畫面看起來像「儲存歌曲資料」又壞掉，其實是讀回 mapping 不完整。

本版最小修法是不新增套件、不重掃曲庫、不改播放清單與播放資料流：`electron/songInfoWriter.ts` 補上小型 TagLib property alias map，保留 0.1.35 的 unpacked `taglib-web.wasm` 與 `forceWasmType: "emscripten"`。同時依使用者要求移除歌曲資訊面板的「儲存到播放器」按鈕與 App 端 player-local save handler，避免播放器 IndexedDB metadata 與原始檔 tag 形成雙路徑。現在歌曲資訊只保留「套用到原始檔」：寫回原始 MP3/FLAC/M4A、重新讀回該首、再保存單曲 metadata 到 IndexedDB。已通過 `check:song-info`、`check:playback-restore`、`check:metadata-save-loop`、`npm run build`、`npm run electron:compile` 與 0.1.36 installer 驗收；SHA-256 請看 `docs/releases/0.1.36-checksums.md`。本輪依使用者要求不 push GitHub。

0.1.35 修正版「Packaged EXE Metadata Wasm Restore / 打包版 EXE 歌曲資訊 wasm 復原」接續 0.1.34：macOS DMG 版可正常讀到歌曲資訊，但 Windows EXE 版歌曲資訊可能退回檔名 / 未知歌手。根因判斷是 `taglib-wasm/simple` 在打包後使用套件預設 `.wasm` 位置，Windows packaged app 讀取 app.asar 內 wasm 的路徑較不穩，且原本 `toSelectedFile()` 會吞掉 metadata 讀取錯誤後回傳空 metadata。

本版最小修法是不新增套件、不改 renderer、不重掃曲庫：`electron/songInfoWriter.ts` 改為共用可設定路徑的 `TagLib.initialize()` 實例，packaged 時優先使用 `resources/taglib-wasm/taglib-web.wasm`，並強制 Emscripten buffer mode；`package.json` 以 `extraResources` 外帶 `taglib-web.wasm`；新增 `check:taglib-wasm-packaging` 並串入 `check:song-info`、`dist:release`、`dist:mac`、`dist:win`。已通過 `check:taglib-wasm-packaging`、`check:song-info`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、唯讀掛載讀回版本 / app.asar / `taglib-wasm/taglib-web.wasm` extraResource 與 Windows NSIS static check。0.1.35 EXE / DMG 已同步到 `release-delivery/installers/`；SHA-256 請看 `docs/releases/0.1.35-checksums.md`。本輪依使用者要求不 push GitHub。

0.1.34 修正版「Playlist Panel Scroll Restore / 播放清單面板捲軸復原」接續 0.1.33：主視窗右側大型卷軸已恢復後，這次只補回 playlist 內部歌曲列表自己的垂直卷軸。`TrackList` 原本已保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`，但 `PlaylistPanel` 只有 `max-h-[calc(100vh-10rem)]`，沒有實際高度，歌曲多時會把面板撐開，內部 `overflow-y-auto` 沒有穩定父層高度可接手。

本版最小修法是在 `PlaylistPanel` 補上 `h-[calc(100vh-10rem)]`，同時保留 `max-h-[calc(100vh-10rem)] min-h-[520px]`、主視窗 `AppLayout` 的 `h-screen overflow-y-auto overflow-x-hidden`、`TrackList` visible-window + overscan、`scrollbar-gutter: stable` 與 `body overflow-x: hidden`。沒有新增套件、沒有重做清單、沒有改 metadata / cover / IndexedDB / playback / Mini Player。`check:track-list-virtualization` 已先紅燈抓到缺少 playlist 實際高度，再修到 PASS；`npm run dist:release` 已輸出 0.1.34 Windows x64 NSIS EXE 與 macOS arm64 DMG，並通過 DMG verify、唯讀掛載讀回版本 / app.asar / packaged renderer scroll class / packaged CSS overflow 檢查與 Windows NSIS static check；未在 Windows 真機執行，未完成 packaged GUI 大曲庫滑鼠 / 觸控板實測。

0.1.33 修正版「Nested Main and Playlist Scroll / 巢狀主視窗與播放清單卷軸」接續 0.1.32：這次不是在主視窗卷軸與 playlist 卷軸之間二選一，而是恢復正確的巢狀 scroll container。`AppLayout` 外層主內容容器改為 `h-screen overflow-y-auto overflow-x-hidden`，主視窗內容超出 viewport 時會出現右側大型垂直卷軸；`TrackList` 仍保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`，歌曲很多時由播放清單內部小卷軸優先捲動。`body` 不再用全域 `overflow: hidden` 鎖死主視窗，只保留 `overflow-x: hidden` 避免橫向卷軸。

本版仍不新增套件、不重做 virtualization、不修改 metadata / cover / IndexedDB / playback 資料流。0.1.28 的 TrackList visible-window + overscan、0.1.32 的 `PlaylistPanel` `max-h-[calc(100vh-10rem)] min-h-[520px]` 都保留。`check:track-list-virtualization` 已擴充為主視窗 + playlist 兩層 scroll guard；`npm run dist:release` 已輸出 0.1.33 Windows x64 NSIS EXE 與 macOS arm64 DMG，並通過 DMG verify、唯讀掛載讀回版本 / app.asar / packaged renderer scroll class / packaged CSS overflow 檢查與 Windows NSIS static check；未在 Windows 真機執行，未完成 packaged GUI 大曲庫滑鼠 / 觸控板實測。

0.1.32 修正版「Playlist Column Scroll Restore / 播放清單欄位捲軸復原」接續 0.1.31：這次復原使用者指出放錯位置的左側主欄捲軸，`AppLayout` 左欄回到不承擔 playlist scroll 的 `flex min-w-0 flex-col gap-5`；真正垂直捲動仍在右側 playlist 欄位的 `TrackList` 原生 `playlist-scrollbar` 裡。`PlaylistPanel` 高度也回到 0.1.28 的 `max-h-[calc(100vh-10rem)] min-h-[520px]`，搜尋 / 排序 header 留在 playlist 面板上方，歌曲卡片列表自己捲動。

本版不新增套件、不重做 virtualization、不修改 metadata / cover / IndexedDB / playback 資料流。`check:track-list-virtualization` 先紅燈抓到 0.1.31 的左欄 `playlist-scrollbar overflow-y-auto`，再修到 PASS；`npm run dist:release` 已輸出 0.1.32 Windows x64 NSIS EXE 與 macOS arm64 DMG，並通過 DMG verify、唯讀掛載讀回版本 / arm64 / app.asar / AI model / prompts / runtime 檢查與 Windows NSIS static check；未在 Windows 真機執行。

0.1.31 修正版「Bounded Playlist Scroll / 播放清單限定捲動」接續 0.1.30：這次明確把整個 app shell 收斂成固定 viewport，不再讓 `body` 承擔播放清單 overflow。左側播放器、頻譜與睡眠定時在必要時只於左欄自己捲；右側 playlist column 使用 `overflow-hidden`，真正大量歌曲只在 `TrackList` 的 `playlist-scrollbar` scroll container 裡捲動。

本版仍共用同一套 `PlaylistPanel -> TrackList -> TrackItem` 歌曲卡片路徑，全部歌曲、自訂播放清單、搜尋結果與智慧播放清單都使用同一張 80px 固定高度卡片，不靠拉高卡片填滿空間。`PlaylistPanel` 移除會撐高頁面的 `min-h-[520px]`，`AppLayout` 改用 `h-screen`、`h-full min-h-0` 與欄位 overflow 邊界；`src/styles/index.css` 也把 `html` / `body` / `#root` 固定在 viewport，避免整個 app body 出現捲軸。`check:track-list-virtualization` 已先紅燈抓到舊 `min-h-screen`，再修到 PASS，同時繼續守住 dynamic viewport、外緣捲軸、bottom safe space、禁止水平捲軸與卡片高度。metadata / cover / IndexedDB 與播放資料流未改動。

本輪也把技能文件架構拆開：播放器開發規範放在 `docs/skills/aquariusgirl-music-room-development.md`；GitHub 上傳 / 同步 / 版本發布 / checksum / 讀回確認放在 `docs/skills/github-update-flow.md`。0.1.31 已通過 source guards、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI model / prompts / runtime 檢查與 Windows NSIS static check；未在 Windows 真機執行。

0.1.30 修正版「Playlist Edge Scrollbar / 播放清單外緣捲軸」把右側歌曲列表的捲軸調整到播放清單面板最右側外緣附近，讓搜尋 / 排序列固定在上方，真正捲動的是下方歌曲卡片列表。這次仍沿用瀏覽器原生 scroll container 與 0.1.28 的 TrackList windowing，不新增套件、不重做清單資料流。

本版最小修法是讓 `TrackList` 量測自己的可視高度，依實際 viewport 計算 visible window；scroll area 加上 `overflow-x-hidden`、`scrollbar-gutter: stable` 與 Apple 風格細捲軸，並用底部安全 padding 避開 mini player。歌曲卡片固定為 80px 高度，搭配 8px 間距，封面、歌名、歌手、時長與操作按鈕維持垂直置中。`check:track-list-virtualization` 已補上捲軸外緣、bottom safe space、動態 viewport 與卡片高度防回歸。0.1.28 的單曲 IndexedDB `put` / `patch`、metadata / cover 不觸發同來源 `audio.load()`、播放清單只保存 trackIds 等資料流防線未改動。

0.1.29 修正版「Playlist Scroll Bounds / 播放清單捲軸邊界」把右側播放清單卡片改回有內部捲軸，並讓播放清單卡片底部與左側「睡前定時停止」卡片底部切齊。這次不是新功能，而是 0.1.28 做 TrackList windowing 後，右欄外層高度邊界沒有跟著補齊：右側 wrapper 不是 `h-full min-h-0`，播放清單卡片又使用 viewport `max-height`，導致 `TrackList` 的 `h-full overflow-y-auto` 沒有穩定父層高度，清單會往底部播放器下方延伸，看起來像捲軸被拿掉。

本版只用既有 CSS flex / overflow 修正，不新增套件、不重做虛擬清單：`AppLayout` 右側 grid item 在桌面版保留 full height，`App.tsx` 右側 wrapper 改為 `flex h-full min-h-0 flex-col`，`PlaylistPanel` 改成桌面版 `lg:flex-1 lg:min-h-0` 並 `overflow-hidden`，移除舊的 viewport `max-height`。`TrackList` 仍沿用 0.1.28 的可見窗口與 overscan，保留上萬首曲庫時避免一次掛載所有 DOM row 的效能防線。

`check:track-list-virtualization` 已擴充為紅綠防回歸：先確認舊版缺少右欄高度邊界會失敗，再修到 PASS；同時仍檢查 TrackList windowing 未退回 `tracks.map` 全量 render。本輪通過 `check:prompts`、`check:track-display`、`check:track-identity`、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:metadata-save-loop`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI model / prompts / runtime 檢查與 Windows NSIS static check。dev browser 以 2048×1152 量測確認播放清單卡片與睡前定時卡片底部同為 `1542px`。Windows 真機與真實大曲庫 GUI 滑動仍待補驗。

0.1.28 修正版「Kill Metadata Save Loop / 停止歌曲資料保存迴圈」補完嚴重效能與資料同步問題：`tracks` 任意變動不再自動全庫保存，播放統計、duration、歌曲資訊 / 封面保存都改成單曲 `put` / `patch`，避免每次播放或改封面都清空 IndexedDB tracks store 並重寫所有大型 `coverDataUrl`。本版也修正播放順序：播放核心會照目前歌曲清單排序由上到下播放，手動排序與檔名排序都會一致；歌曲清單改為只 render 可見窗口，不再讓上萬首曲庫一次產生上萬個 DOM row。

本版將 `saveTrackMetadata()` 限縮為僅限整庫重建的歷史相容入口，新增 `putTrackMetadata`、`putManyTrackMetadata`、`patchTrackPlayback`、`patchTrackDuration`、`deleteTrackMetadata` 與 `replaceAllTrackMetadata`。`applyStoredTrackMetadata` 在同一次 App 執行中只做啟動補救一次；執行中由事件直接更新全域 tracks 與 IndexedDB 單曲，不再用 `storedTracks` 回灌形成循環。歌曲資訊面板現在提供「儲存到播放器」與「套用到原始檔」：前者只更新全域 tracks 與 IndexedDB 單曲、標記本地 metadata override，不修改原始音樂檔；後者仍會寫回原始檔並重新讀回該首歌。播放流程仍只在音訊來源真的改變時 `audio.load()`，封面 / metadata-only 更新不改 `localUrl` 或 `mediaVersion`；播放佇列則使用目前清單排序，不再吃未排序的原始 active track id 序列。

新增 source-level 回歸指令：`check:playback-order`、`check:track-list-virtualization`、`check:metadata-save-loop`、`check:no-track-save-loop`、`check:no-full-db-save-on-playback`、`check:cover-update-five-times`、`check:playlist-song-info-restart`、`check:no-audio-load-on-cover-only-update`。本輪也補上 dev guard：重複 `applyStoredTrackMetadata`、播放中非預期 `readSongInfoFromOriginalFile`、同 track source 變動造成 `audio.load()` 都會 console warn。0.1.28 已通過這些檢查、既有 playback-restore、song-info、track-display、track-identity、AI track search、FLAC metadata、prompt、theme、custom images、all-target AI assets、build、Electron compile、升權 `dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI model / prompts / runtime 檢查與 Windows NSIS static check。Windows 真機與 packaged GUI 壓力測試仍待補。

0.1.27 修正版補完歌曲資訊 / 封面寫回 / IndexedDB / 播放卡頓同族問題：第一次更換封面並「套用到原始檔」後，下一次再開歌曲資訊面板可能沿用舊 draft / saving 狀態，導致第二次按鈕無反應或狀態異常；也可能讓使用者誤以為封面已保存，但重開後仍看到舊封面。

本版不清空整個 IndexedDB，也不重掃整個音樂庫。最小修法是收斂歌曲資訊面板的狀態機：每次開啟都從目前最新 track snapshot 建立 `trackDraftSnapshot`，關閉或成功後清掉 draft，`savingRef` 在 `finally` 一律重設；「套用到原始檔」的 disabled 條件只包含目前歌曲、儲存中、桌面版、本機路徑、支援格式與是否 dirty。App 端也補上格式防線，避免 UI 與實際 IPC 寫回能力不同步。

`check:playback-restore` 已加入 0.1.27 防回歸，要求歌曲資訊面板不能再只用 `[open, track?.id]` 初始化，必須有 `savingRef`、`resetDraftState`、`trackDraftSnapshot` 與 dirty-aware disabled。0.1.27 已通過 song-info、playback-restore、track-display、track-identity、AI track search、FLAC metadata、prompt、theme、custom images、all-target AI assets、build、Electron compile、升權 `dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查，以及 Windows NSIS static check。

0.1.26 修正版補完 0.1.24 / 0.1.25 同族殘留：播放中把米津玄師 Plazma 封面從 cover02 改回 cover01，切到其他歌再切回時仍可能短暫卡住；重新開啟 App 時也可能第一次看到舊 cover02、第二次才看到新 cover01。

這次不採用「每次歌曲資訊更新就清掉整個音樂資料庫再重載」；那會在 99 首還可忍、上萬首會變成災難。最小修法是只刷新並等待保存「剛寫回的那一首」：原始檔寫回後，播放器會重新讀回該曲 metadata，取得新的 track snapshot，並 `await` IndexedDB 立即保存完成後才顯示成功。這等於把使用者手動清庫重加會成功的原因，縮小成單曲級精準刷新，不動整個曲庫與播放清單。

2026-07-03 已補完 packaged macOS 隔離驗收：先卸載並重新掛載 0.1.26 DMG，使用 `/private/tmp/aquariusgirl-0.1.26-mouse-profile` 隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本，不打開使用者原始 Music 資料夾。Plazma 播放中先設為 Cover 02，再改回 Cover 01 並「套用到原始檔」；UI 顯示成功，原始 FLAC 讀回為 Cover 01（Cover 01 data URL 長度 `5789911`，Cover 02 為 `1347951`），切到 `02. BOW AND ARROW.flac` 再切回 `01. Plazma.flac` 會繼續播放且不卡，重開同隔離 profile 後 `0.1.26 Cover QA` 播放清單仍保留 Plazma。macOS 原生對話框因 `/private/tmp` 隱藏路徑與無輔助使用權限無法完整滑鼠自動選檔，資料夾與封面檔選擇使用限制在暫存路徑的本機 harness；播放、編輯面板、套用確認、切歌、重開與播放清單觀察皆在 packaged app UI 驗收。

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

## 下載與檔案驗證

安裝檔請至 GitHub Releases 下載；本機交付資料夾仍保留在：

```text
release-delivery/installers/
```

0.1.41 installer 已完成，交付檔位於：

- `Aquariusgirl Music Room Setup 0.1.41.exe`
- `Aquariusgirl Music Room-0.1.41-arm64.dmg`

0.1.41 SHA-256 已寫入 `docs/releases/0.1.41-checksums.md`。完整版本歷史與詳細驗收紀錄請看 [release-delivery/VERSION.md](release-delivery/VERSION.md)。

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
- 歌曲資訊編輯、單曲封面更換，以及桌面版 MP3/FLAC/M4A 原始檔標籤寫回
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

0.1.41 "Full-Load Cover Write Guard / Packaged Mouse QA" follows 0.1.40. It fixes the remaining repeated-cover failure where the first cover write succeeds, but the second write leaves the panel open, reload metadata fails, and a restart can leave the track without its artwork or metadata. This release still does not clear IndexedDB, rescan the library, add `coverRevision`, add a MIME side door, rewrite the metadata architecture, or restore the player-local "save to player" path.

The minimal fix is in the Electron song-info writer: metadata reads keep the existing partial-read path first, and only retry `partial:false` full-load for that one user-initiated source file after TagLib throws `InvalidFormatError`. Original-file writeback still uses one TagLib handle, sets text and cover together, calls `saveToFile(tempPath)` once, and renames only after that succeeds. The Emscripten fixture check now blocks `copyWithTags` / `edit(tempPath)` regressions and passes Plazma Cover 02 -> Cover 01 -> Cover 02 readback. Packaged DMG mouse QA passed three isolated-profile cover changes: Cover 01 -> Cover 02, Cover 02 -> Cover 01, and Cover 01 -> Cover 02, including preview, dirty/apply, busy lock, auto-close, readback hash, reload metadata success, and restart persistence. Checksums are in `docs/releases/0.1.41-checksums.md`. Real Windows runtime QA remains open. Per user request, this turn does not push to GitHub.

0.1.40 "Selected Cover Dirty Guard / Reload Metadata Diagnostics" follows 0.1.39. This hotfix touches only `App.tsx` and `SongInfoPanel.tsx` for the repeated-cover state bug. Cover selection now keeps an independent `selectedCover` with the exact bytes, MIME, hash, and preview URL, while text dirty and cover dirty are checked separately. An open panel no longer resets the same track's draft just because an external track snapshot changes, so a second selected cover cannot show a new preview while the footer falls back to "no changed fields."

The original 0.1.39 success contract remains: after Electron writes the original file, the app reloads the track, requires the readback cover hash to equal the selected hash and differ from the old hash, then waits for `putTrackMetadata(reloadedTrack)` before showing success and closing the panel. Reload failures now log `[reload-metadata] failed` / `[reload-metadata] exception`; dev runtime logs expose selected hash, cover/text dirty state, readback hash, and IDB saved hash. No dependency, IndexedDB clear, library rescan, `coverRevision`, MIME side door, or player-local "save to player" path was added. `check:song-info`, `check:playlist-logic`, `check:playback-order`, `check:track-list-virtualization`, `check:playback-restore`, `check:metadata-save-loop`, `npm run build`, `npm run electron:compile`, `npm run dist:release`, DMG verify, read-only DMG version / app.asar readback, and Windows NSIS static check passed. Checksums are in `docs/releases/0.1.40-checksums.md`. Real Windows runtime QA and full packaged GUI mouse-only repeated-cover QA remain open. Per user request, this turn does not push to GitHub.

0.1.39 "Cover Hash Readback / Playlist Order Persistence" follows 0.1.38. Cover replacement now has one verifiable success path: the renderer keeps selected cover bytes, MIME, hash, and preview only as draft state; Electron writes those exact bytes, immediately reads the original file back, recalculates `coverHash` from the readback cover bytes, and only treats the operation as successful when the readback hash equals the selected hash and differs from the old hash. The player updates current tracks and awaits `putTrackMetadata(reloadedTrack)` before clearing draft state or reporting success.

This release also persists custom song order. Normal playlists keep their track-id order through the existing localStorage write-through and IndexedDB playlist save. The all-songs custom order now updates only the moved track's `addedAt` order key and saves that one track to IndexedDB, avoiding a full-library rewrite for large libraries. No dependency, database schema change, full-library rescan, `coverRevision`, or IndexedDB clear was added. `check:song-info`, `check:playlist-logic`, `check:playback-order`, `check:track-list-virtualization`, `check:playback-restore`, `check:metadata-save-loop`, `npm run build`, `npm run electron:compile`, `npm run dist:release`, DMG verify, read-only DMG version / app.asar readback, packaged guard readback, and Windows NSIS static check passed. Checksums are in `docs/releases/0.1.39-checksums.md`. Real Windows runtime QA and full packaged GUI mouse-only repeated-cover QA remain open. Per user request, this turn does not push to GitHub.

0.1.37 "Cover MIME Fallback / Second Cover Save" follows 0.1.36. Replacing a Kenshi Yonezu cover could succeed the first time but fail the second time. The root cause was not an IndexedDB or full-library refresh problem: macOS / Electron file picking can provide an empty or `application/octet-stream` MIME for a `.jpg` / `.png`, and `FileReader` can produce `data:;base64,...` or `data:application/octet-stream;base64,...`. The old renderer validation and Electron writer accepted only explicit `image/jpeg` / `image/png`, so the second selected cover could be rejected.

The minimal fix adds no dependency, schema change, cover compression, or library rescan. The renderer infers image MIME only when the extension is `.jpg`, `.jpeg`, or `.png` and the selected MIME is empty or octet-stream, then normalizes the data URL prefix. The Electron writer accepts the draft MIME fallback only for empty / octet-stream data URLs, while still rejecting genuinely unsupported MIME types. The 5 MB cover limit, original-file writeback path, single-track IndexedDB save, and TrackList windowing remain unchanged. `check:song-info`, the real Plazma temp-copy Cover 02 -> Cover 01 roundtrip, `check:playback-restore`, `check:metadata-save-loop`, `npm run build`, `npm run electron:compile`, elevated `npm run dist:release`, DMG verify, read-only DMG version / app.asar / packaged fallback readback, and Windows NSIS static check passed. Checksums are in `docs/releases/0.1.37-checksums.md`. Per user request, this turn does not push to GitHub.

0.1.36 "Song Info Single Save Path / TagLib Property Map Restore" follows 0.1.35. After the packaged EXE wasm fix, song-info reads used `audioFile.properties()`, but the first mapping handled only lowercase keys. TagLib property maps can return uppercase keys such as `TITLE`, `ARTIST`, `ALBUMARTIST`, and `TRACKNUMBER`, so artist, album artist, track, and related fields could be lost on readback.

The minimal fix adds a small property-key alias map in `electron/songInfoWriter.ts` while keeping the 0.1.35 unpacked `taglib-web.wasm` path and `forceWasmType: "emscripten"`. Per user request, the song-info panel no longer has the player-local "save to player" button or App handler. This avoids splitting metadata between IndexedDB-only overrides and original-file tags. Song info now keeps one save path: apply to the original MP3/FLAC/M4A, reread that track, then save the single refreshed metadata record to IndexedDB. `check:song-info`, `check:playback-restore`, `check:metadata-save-loop`, `npm run build`, `npm run electron:compile`, and 0.1.36 installer verification passed. Checksums are in `docs/releases/0.1.36-checksums.md`. Per user request, this turn does not push to GitHub.

0.1.35 "Packaged EXE Metadata Wasm Restore" follows 0.1.34. The macOS DMG can read song metadata, while the Windows EXE may fall back to filenames / unknown artist. The likely root cause is that `taglib-wasm/simple` loads the default `.wasm` location inside the packaged app, which is fragile for Windows app.asar paths; `toSelectedFile()` then swallowed the metadata-read failure and returned empty metadata.

The minimal fix adds no dependency and does not touch the renderer or library scan flow. `electron/songInfoWriter.ts` now uses one configurable `TagLib.initialize()` instance, packaged builds prefer `resources/taglib-wasm/taglib-web.wasm`, and the loader is forced to Emscripten buffer mode. `package.json` copies `taglib-web.wasm` through `extraResources`; `check:taglib-wasm-packaging` now runs in `check:song-info`, `dist:release`, `dist:mac`, and `dist:win`. `check:taglib-wasm-packaging`, `check:song-info`, `npm run build`, `npm run electron:compile`, elevated `npm run dist:release`, DMG verify, read-only DMG version / app.asar / `taglib-wasm/taglib-web.wasm` extraResource readback, and Windows NSIS static check passed. Per user request, this turn does not push to GitHub.

0.1.34 "Playlist Panel Scroll Restore" restores the playlist-internal scrollbar after 0.1.33 brought back the main-window scrollbar. `TrackList` already kept `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`, but `PlaylistPanel` only had `max-h-[calc(100vh-10rem)]` without a real height, so long song lists could stretch the panel and prevent the internal `overflow-y-auto` container from taking over.

The minimal fix adds `h-[calc(100vh-10rem)]` to `PlaylistPanel` while preserving `max-h-[calc(100vh-10rem)] min-h-[520px]`, the main AppLayout `h-screen overflow-y-auto overflow-x-hidden` scroll container, TrackList visible-window rendering, `scrollbar-gutter: stable`, and `body overflow-x: hidden`. No dependency, list rewrite, metadata flow, cover flow, IndexedDB flow, playback flow, or Mini Player behavior changed. `check:track-list-virtualization` first failed on the missing playlist height bound, then passed after the fix. `npm run dist:release` produced the 0.1.34 Windows x64 NSIS EXE and macOS arm64 DMG, with DMG verify, read-only DMG version / app.asar / packaged renderer scroll class / packaged CSS overflow checks, and Windows NSIS static check passing. It was not run on a real Windows machine or full packaged GUI large-library scroll test.

0.1.33 "Nested Main and Playlist Scroll" restores the correct nested scrollbar design. The main app content and the playlist are not mutually exclusive scrollers: `AppLayout` is now the main `h-screen overflow-y-auto overflow-x-hidden` scroll container, so the right-side main-window scrollbar appears when the whole app content exceeds the viewport; `TrackList` remains the playlist-internal `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3` container for long song lists. `body` no longer globally locks scrolling with `overflow: hidden`; it keeps only `overflow-x: hidden` to prevent horizontal scrolling.

This release adds no dependency, does not rewrite virtualization, and does not touch metadata, cover, IndexedDB, or playback data flow. It preserves the 0.1.32 / 0.1.28 `PlaylistPanel` height bounds and the 0.1.28 TrackList visible-window rendering. `check:track-list-virtualization` now guards both scroll containers. `npm run dist:release` produced the 0.1.33 Windows x64 NSIS EXE and macOS arm64 DMG, with DMG verify, read-only DMG version / app.asar / packaged renderer scroll class / packaged CSS overflow checks, and Windows NSIS static check passing. It was not run on a real Windows machine or full packaged GUI large-library scroll test.

0.1.32 "Playlist Column Scroll Restore" corrects the 0.1.31 scrollbar placement. The left main column no longer owns a `playlist-scrollbar` or playlist overflow; it is back to `flex min-w-0 flex-col gap-5`. The right playlist column keeps the real native scroll inside `TrackList`, and `PlaylistPanel` restores the 0.1.28 height bounds: `max-h-[calc(100vh-10rem)] min-h-[520px]`.

This release adds no dependency, does not rewrite virtualization, and does not touch metadata, cover, IndexedDB, or playback data flow. `check:track-list-virtualization` first failed on the 0.1.31 left-column `playlist-scrollbar overflow-y-auto` path, then passed after the fix. `npm run dist:release` produced the 0.1.32 Windows x64 NSIS EXE and macOS arm64 DMG, with DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check passing. It was not run on a real Windows machine.

0.1.31 "Bounded Playlist Scroll" continues the 0.1.30 scrollbar fix by bounding the whole app shell to the viewport. The app body no longer owns playlist overflow. The left player column can scroll independently when needed, while the right playlist column is overflow-hidden and only the `TrackList` `playlist-scrollbar` container scrolls through large song lists.

All songs, normal playlists, search results, and smart playlists still share the same `PlaylistPanel -> TrackList -> TrackItem` path. Track cards keep a fixed 80px height; the fix does not stretch cards to fill space. `PlaylistPanel` no longer has the old `min-h-[520px]`, `AppLayout` now uses `h-screen`, `h-full min-h-0`, and column overflow boundaries, and `html` / `body` / `#root` are fixed to the viewport. The regression guard first failed on the old `min-h-screen` body-scroll path, then passed after the fix. Metadata, cover, IndexedDB, and playback data flow were not changed.

The project skills are now split: player development rules live in `docs/skills/aquariusgirl-music-room-development.md`, while GitHub publishing, sync, checksum, and readback rules live in `docs/skills/github-update-flow.md`. 0.1.31 passed the source guards, `npm run build`, `npm run electron:compile`, elevated `npm run dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. It was not run on a real Windows machine.

0.1.30 "Playlist Edge Scrollbar" moves the right song-list scrollbar close to the outer edge of the playlist panel. The search and sort controls stay fixed at the top, while only the song-card list scrolls. This still uses the browser's native scroll container and the existing 0.1.28 TrackList windowing; no dependency or list rewrite was added.

The minimal fix lets `TrackList` measure its own viewport height, compute the visible window from the real scroll area, and keep `overflow-x-hidden`, `scrollbar-gutter: stable`, and a slim Apple-style scrollbar. The list also keeps bottom safe padding so the bottom mini player does not cover the last tracks. Track cards now have a fixed 80px height plus 8px spacing, keeping artwork, title, artist, duration, and actions vertically centered. `check:track-list-virtualization` now guards the edge scrollbar, bottom safe space, dynamic viewport measurement, and card height. The 0.1.28 single-track IndexedDB `put` / `patch`, metadata / cover no-audio-reload, and playlist trackId-only data flow were not changed.

0.1.29 "Playlist Scroll Bounds" restores the right playlist card's internal scroll and aligns the playlist card bottom with the left Sleep Timer card bottom. This is not a new feature; 0.1.28 already added TrackList windowing, but the right column did not give the list a stable flex height boundary. The right wrapper lacked `h-full min-h-0`, and the playlist card used a viewport `max-height`, so `TrackList`'s `h-full overflow-y-auto` had no reliable parent height and the list could extend under the bottom player.

This release uses only existing CSS flex / overflow and the existing TrackList windowing. `AppLayout` gives the desktop right grid item full height, `App.tsx` makes the right wrapper `flex h-full min-h-0 flex-col`, and `PlaylistPanel` uses `lg:flex-1 lg:min-h-0` with `overflow-hidden` instead of the old viewport `max-height`. No package, new virtualizer, or list rewrite was added.

`check:track-list-virtualization` now guards both the visible-window list and the parent scroll bounds. It first failed on the old missing right-column height boundary, then passed after the fix. 0.1.29 passed prompt checks, track-display, track-identity, playback-order, track-list windowing / scroll-bound guard, playback-restore, metadata-save-loop guard, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. A dev browser measurement at 2048x1152 confirmed the playlist card and Sleep Timer card both ended at `1542px`. Real Windows and real large-library GUI scroll QA remain open.

0.1.28 "Kill Metadata Save Loop" fixes the remaining severe performance and sync path: arbitrary `tracks` changes no longer trigger full-library IndexedDB saves. Playback stats, duration updates, and song-info / cover saves now use single-track `put` / `patch` operations instead of clearing and rewriting the whole tracks store with large `coverDataUrl` payloads. Playback follows the visible list order, and the track list renders only a visible window instead of creating one DOM row per library item.

This release limits `saveTrackMetadata()` to whole-library rebuild compatibility and adds explicit single-track APIs: `putTrackMetadata`, `putManyTrackMetadata`, `patchTrackPlayback`, `patchTrackDuration`, `deleteTrackMetadata`, and `replaceAllTrackMetadata`. The song-info panel now offers both player-local save and original-file writeback: player-local save updates global tracks plus IndexedDB only and marks metadata override, while original-file writeback reloads and saves only the edited track. `applyStoredTrackMetadata` is now a one-time startup recovery path, not a live mirror from `storedTracks` back into `tracks`.

0.1.28 passed source-level metadata-save-loop, playback-order, and track-list windowing guards, playback-restore, song-info, track-display, track-identity, AI track search, FLAC metadata, prompt, theme, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Real Windows and packaged GUI stress QA remain open.

0.1.27 completes the song-info / cover writeback / IndexedDB / playback-stall family. After the first successful cover writeback, reopening the song-info panel could keep stale draft or saving state, so the second writeback button could appear disabled or do nothing. That could make the UI look saved while a restart still restored the previous artwork.

This release does not clear IndexedDB or rescan the whole music library. The fix keeps the state local and explicit: each panel open initializes from the latest `trackDraftSnapshot`, close/success clears the draft, `savingRef` is reset in `finally`, and the original-file writeback button is disabled only for no current track, saving, desktop unavailable, missing local path, unsupported format, or no dirty fields. App-level writeback now also rejects unsupported formats before IPC.

`check:playback-restore` now guards the 0.1.27 path: the panel must not rely only on `[open, track?.id]`, and it must keep `savingRef`, `resetDraftState`, `trackDraftSnapshot`, and dirty-aware disabled logic. 0.1.27 passed song-info, playback-restore, track-display, track-identity, AI track search, FLAC metadata, prompt, theme, custom images, all-target AI assets, build, Electron compile, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / AI runtime checks, and Windows NSIS static check.

0.1.26 completes the remaining 0.1.24 / 0.1.25-family persistence issue. While Plazma is playing, changing its cover from cover02 back to cover01, switching to another track, and switching back could still briefly stall; after restart, the first launch could also show the old cover02 before the next launch showed cover01.

This release does not clear and reload the whole music database after every song-info edit. That would work around the symptom for small libraries, but it would be the wrong design for 10k tracks. Instead, original-file writeback reloads only the edited track, gets the updated track snapshot, and waits for IndexedDB to save that exact snapshot before reporting success.

Packaged macOS isolated QA was completed on 2026-07-03. The 0.1.26 DMG was remounted, the app used `/private/tmp/aquariusgirl-0.1.26-mouse-profile`, and only the temp copy at `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` was loaded. While Plazma was playing, Cover 02 was changed back to Cover 01 and applied to the original temp FLAC; readback confirmed Cover 01 (`5789911` data URL chars versus Cover 02 `1347951`), switching to `02. BOW AND ARROW.flac` and back kept playback moving, and after restart the `0.1.26 Cover QA` playlist still kept Plazma. Native macOS file dialogs could not be fully mouse-driven to hidden `/private/tmp` paths without accessibility permission, so folder and cover-file selection used a local temp-path harness; playback, edit-panel apply/confirm, switching, restart, and playlist observation were verified in the packaged app UI.

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

## Download And Checksums

Download installers from GitHub Releases. Local delivery artifacts are kept in:

```text
release-delivery/installers/
```

0.1.41 installers are produced and kept in:

- `Aquariusgirl Music Room Setup 0.1.41.exe`
- `Aquariusgirl Music Room-0.1.41-arm64.dmg`

0.1.41 SHA-256 values are recorded in [docs/releases/0.1.41-checksums.md](docs/releases/0.1.41-checksums.md). Full version history and detailed QA notes live in [release-delivery/VERSION.md](release-delivery/VERSION.md).

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
