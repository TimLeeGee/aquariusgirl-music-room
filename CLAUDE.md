# CLAUDE.md

本檔給 Claude（Claude Code / Cowork）讀；`AGENTS.md` 是給 Codex 讀的對應版本。兩份規則與「快速接手」狀態必須一致，任一份更新時另一份要同步改，且都要一起 commit / push 上 GitHub。動工前若專案有 `llm-wiki/`，先讀 `llm-wiki/00-入口索引.md` 再開工。

## 快速接手

- Aquariusgirl Music Room 是 React + TypeScript + Vite + Electron 的本地音樂播放器，目前版本 `0.1.52`。
- 0.1.52 最新功能是「依封面自動換色」：`ThemeColorSettings.autoCoverColorEnabled` 預設 false；`src/utils/coverColor.ts` 只按需分析目前歌曲真實封面（48×48 Canvas、64-entry LRU、request version stale guard），effective hue 只暫時覆蓋 primary／mini，不可呼叫 `setThemeColorSettings` 寫回封面色。無封面／失敗／關閉／無目前歌曲回 saved 手動色；placeholder 明確排除。`@property` 讓 primary／mini hue 450ms 漸變；文字與 opacity 不變。`check:cover-colors`／`check:theme-colors` 已納入 dist；artifact 見 `docs/releases/0.1.52-checksums.md`。packaged macOS 隔離 harness 已驗 Switch 保存、無封面 fallback、紅色 cover effective hue、底部／桌面 Mini 與 opacity；使用者另回報 EXE／DMG 的新增功能簡單測試正常，但未列逐項手順。真實內嵌封面、快速三首 UI 切歌、Windows 完整回歸與真實 10k profiler 待補。0.1.52 source／文件／checksum 已同步 GitHub `main`；installer 仍只留本機，未建立 tag 或 GitHub Release。
- 2026-07-10 文件-only：`docs/skills/` 已移除（兩份技能快照停在 0.1.32、內容過期且與本檔／`llm-wiki/` 重複）。開發規範以本檔＋`llm-wiki/` 為準，GitHub 發布流程以全域 `github-update-flow` 技能＋`llm-wiki/08-GitHub發布守門員.md` 為準；歷史可從 git 取回。
- 2026-07-10 文件制度改革：版本歷史統一進根目錄 `CHANGELOG.md`；`README.md` 瘦身為產品門面；`CONTINUE_WORK.md` 只留根目錄一份（release-delivery 副本已刪）；`release-delivery/` 狀態檔只寫現況；`QA_REPORT.md` 維持 append-only 驗收證據；docs/ 舊 audit 歸檔 `docs/history/`。發布時依「驗收守則」的新文件規則，不要再把同一段貼九份。
- 0.1.51 最新功能是大曲庫歌單批次／手動匯入工作佇列：playlist batch 為 O(P+N)，Electron 最多 4、Web 最多 2 個工作同時進行，metadata UI／DB 最多約 100 批（10,000 deterministic 結果 100 commits）；進度、合作式取消與 clear/unmount discard 均已守住。Mini、一般／Mini／OBS 的 `{audioElement}` 位置、播放與歌曲資訊保存鏈不變。三項新 checks 已納入 dist，artifact 證據見 `docs/releases/0.1.51-checksums.md`；使用者回報 DMG 手動測試目前未發現問題，但未列明逐項手順，Windows 真機與真實 10k profiler 仍待補。0.1.50／0.1.51 source 與文件已同步 GitHub `main`；installer 仍只留本機，未建立 tag 或 GitHub Release。
- 0.1.49 最新 hotfix：`Mini Switch Playback Continuity`。症狀是播放中切 Mini 會停住、再按播放無反應、切回主程式誤報「瀏覽器阻擋播放」。根因：0.1.48 把 `<audio>` 包進新的 `TextOverrideContext.Provider`，不再是 `BrandAssetsContext.Provider` 首子節點，React 依位置 reconcile，切 Mini/OBS 時把 `<audio>` 節點卸載重建。修法：`{audioElement}` 移回三分支一致的首子節點（`src/App.tsx` ~1832 有 ponytail 不變式註解，之後不可再包層）；`useAudioPlayer` 加自癒保險——`playAudioElement` 偵測「有歌但節點沒 src」時重掛並用 `lastPlaybackTimeRef` 恢復位置、`togglePlay` 遇壞狀態第一下改重新播放、`suspendAudioForFileWrite` 期間以 `suspendedForWriteRef` 停用自癒（避免 Windows 寫回中重新鎖檔）、`describePlayError` 只對 `NotAllowedError` 報「阻擋」。同版 AI 聊天視窗 UX（`AIAssistantPanel.tsx` 純排版層）：泡泡列 sticky 置頂、首次互動後收合成 hover 下拉（無 scroll 監聽）、訊息 `mt-auto` 底部錨定、聊天區固定 500px。dev 已知限制：`electron:dev` 的 http origin 載不了 `file://` 音源（自動恢復曲庫在 dev 播不了是環境限制不是 bug），dev 驗證播放請拖曳 blob。零新套件；沙盒 checks 全 PASS；installer SHA-256 見 `docs/releases/0.1.49-checksums.md`；打包版 GUI 實測與 Windows 真機待補；已推送 GitHub `main`。
- 0.1.45–0.1.48 是一批功能開發（非 hotfix）：0.1.45 AI 助手改善 A1–A3（智慧分流／token 預算／卡死重啟）＋歌曲資訊補全 Phase 1＋2（`src/utils/metadataFix.ts` 掃描＋規則推測，只寫文字欄位、不碰封面）；0.1.46 AI 空狀態快捷指令氣泡＋面板文字自訂（`TextOverrideSettings` + 設定「文字」分頁）；0.1.47 搜尋 chip 預填＋空查詢反問、`scanMetadata` 支援資料夾範圍／`manualCandidates`／`nonWritableList`（報告卡選資料夾、逐首手動編輯、非可寫檢視＋`showTrackInFolder`）、角色名稱全域改名（`characterName`/`characterNameEn` + `{name}`/`{nameEn}` 模板 + React-free 單例 `src/config/characterName.ts`）；0.1.48 面板文字升級為開放登錄表（`UI_TEXT_GROUPS`，~20 條 `useText(key)`，設定分組＋可搜尋，`trackDisplay` 那句搬進 `PlayerCore`）。這批零新套件、不動寫回／readback／DB schema。注意：`src/utils/aiTrackSearch.ts` 與 `src/utils/trackDisplay.ts` 會被 node `--experimental-strip-types` check 直接載入，不可加無副檔名的 runtime value import。
- 0.1.44：`Confirm Focus Lock / Toast Position`。Windows EXE 上 `window.confirm()` 關閉後 webContents 鍵盤焦點壞掉（Electron 已知問題，macOS 不重現），導致換封面後 select 點不開、輸入框無法聚焦。修法：`src/components/ConfirmDialog.tsx`（renderer 確認窗，取消鈕 autoFocus、Esc 關閉、z-[85]）取代全專案 4 處 `window.confirm`；`electron/main.ts` 的 `showOpenDialogWithFocusRestore()` 讓原生檔案 dialog 掛 parent 並在關閉後 `webContents.focus()`；`MessageToast` 移到左上 `left-4 top-12` 加 `pointer-events-none`；`scripts/song-info-check.mjs` guard 禁止 `App.tsx` / `SongInfoPanel.tsx` 再出現 `window.confirm(` / `window.alert(`。
- 0.1.43：`Big Cover Readback Crash / Save Feedback`。taglib-wasm 預設 partial read（前 1MB + 尾 128KB）在寫入 4.3MB 封面後截斷 ID3v2，packaged Emscripten TagLib 解析截斷 buffer 直接 WASM `RuntimeError: unreachable`（不是 `InvalidFormatError`，舊 retry 接不到）。修法：`readSongInfoFromOriginalFile(sourcePath, { partialRead })` 對單檔 user-initiated 動作預設完整讀取，partial 路徑任何錯誤 fallback 一次 `partial:false`，`readPicturesSafely` 遇 `WebAssembly.RuntimeError` rethrow 交給 fallback；掃描（`electron/selectedFile.ts`）仍走 `partialRead: true` 維持上萬首效能；`MessageToast` 升 `z-[90]`；保存中顯示「套用中…」。
- 0.1.42：`Playing File Lock Release`。Windows 上 `<audio>` 以 `file:` URL 載入時持有 handle，寫回最後的 rename 被 `EPERM`/`EBUSY` 擋下。修法：`useAudioPlayer.ts` 的 `suspendAudioForFileWrite(trackId)` 只在寫回目標是目前那首時暫停卸下 src 釋放 handle、回傳 restore；`App.tsx` 只在 IPC 寫回期間 suspend、`finally` resume；`electron/songInfoWriter.ts` 的 `renameWithRetry`（`EPERM`/`EBUSY`/`EACCES` 重試 3 次、150ms）。根目錄 `打包發行.command`：雙擊在 Mac 本機跑 `npm run dist:release`，log 在 `qa-temp/dist-release.log`。
- 0.1.35–0.1.41 封面／metadata 修復脈絡（時間倒序）：0.1.41 read metadata partial failure 補 `partial:false` full-load retry，writer 守住單一保存路徑（同一 TagLib handle 設文字與封面、只 `saveToFile(tempPath)` 一次再 rename，不可回到 `copyWithTags` / `edit(tempPath)` 雙路徑）；0.1.40 `selectedCover` 獨立保存 bytes/MIME/hash/preview，文字 dirty 與封面 dirty 分開判斷；0.1.39 封面保存必須 readback 驗 `coverHash`（等於 selected、不同於舊值）才更新播放器並 `await putTrackMetadata(reloadedTrack)`，playlist 保存 `trackIds`、全部歌曲自訂排序只保存 moved track 的 `addedAt`；0.1.38 MIME 只把 `image/jpg`/`image/pjpeg`/`image/x-png` 正規化成 `image/jpeg`/`image/png`，仍拒 GIF/WebP，並守住 7 種排序選項；0.1.37 只對空白或 octet-stream MIME 依副檔名推回；0.1.36 TagLib property map 大寫鍵 alias、移除「儲存到播放器」按鈕（只保留「套用到原始檔」單一路徑）；0.1.35 `extraResources` 外帶 `taglib-web.wasm`，`TagLib.initialize({ forceWasmType: "emscripten" })` 指定 `wasmUrl`。
- 0.1.34 版面基底：`PlaylistPanel` 必須保留 `h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[520px]`；`TrackList` 必須保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`；`AppLayout` 是主視窗 `h-screen overflow-y-auto overflow-x-hidden` scroll container，`body` 只留 `overflow-x: hidden`。0.1.28 `Kill Metadata Save Loop` 仍是資料流基底：播放統計、duration、歌曲資訊／封面保存都走單曲 `put`/`patch`；歌曲清單只 render 可見窗口。
- 目錄：主程式 `src/`，Electron main/preload 在 `electron/`，打包與檢查腳本在 `scripts/`。版本歷史在根目錄 `CHANGELOG.md`；發行與驗收紀錄在 `release-delivery/`；改版前先讀 `release-delivery/QA_REPORT.md` 與 `CHANGELOG.md`。AI prompt 在 `private/prompts/`，GGUF 模型與 llama.cpp runtime 在 `resources/ai/`；大型模型與 installer 不進 Git。

## 專案邊界

- 本地優先音樂播放器，只播放使用者明確選擇的本機音樂。
- 不使用 YouTube、不串流、不串接線上音樂、不下載音樂、不生成圖片。
- 不把音樂檔本體、`File`、`Blob`、`ArrayBuffer` 或 object URL 存進 localStorage / IndexedDB；只存 metadata、播放清單與設定。
- Electron 版可用原生檔案對話框，但不可偷偷掃描整台硬碟。
- AI 只能使用目前已載入／已索引歌曲的安全 metadata；模型不得編造歌曲、路徑或播放清單內容。

## 修改守則

- 動工前先讀 `README.md`、`release-delivery/README.md`、`release-delivery/QA_REPORT.md`、`package.json`、`llm-wiki/`（若存在）與相關 source。
- 手術刀式精準修改必要檔案；不順手重構、不擅改版號、不整理無關格式。
- 優先用既有程式、標準函式庫與平台原生能力；不為小需求新增套件或抽象。
- 有明確上限的簡化用 `ponytail:` 註解標出原因與升級路線。
- 不覆蓋、不回復使用者在工作樹中的既有變更。
- 任何程式、設定、文件、驗收或發佈變更完成後，必須同步維護 `llm-wiki/` 受影響頁面與 `99-更新日誌.md`；Wiki 未更新不得宣稱任務完成或提交發布。

## 驗收守則

- 文件-only 修改：確認檔案存在、索引引用正確、`git diff` 只含預期 Markdown；不要輸出 EXE / DMG。
- 程式修改：至少跑 `npm run build` 與 `npm run electron:compile`，再依改動範圍跑相關 `check:*`。
- 只有 app code、資源、版本或打包設定變更，或使用者明確要求時，才重打 installer。
- installer 一律走 `npm run dist:release`（Mac 本機可雙擊 `打包發行.command`）；sandbox 卡 `hdiutil create` 時取得允許後升權重跑，不可改打包方式。
- macOS 只能驗 DMG 與做 Windows EXE static check，不可宣稱 Windows 真機已驗證。
- 封面／歌曲資訊寫回驗收必須用暫存音樂複本與隔離 profile，不可碰使用者原始 Music 資料夾；受限 harness 與 packaged UI 滑鼠各完成哪些步驟要明確記錄。
- 發佈到 GitHub main 前（2026-07-10 文件制度改革，「一件事一個家」）：版本歷史只寫進根目錄 `CHANGELOG.md`（唯一來源、最新在上）；`README.md` 只更新「目前最新版本」摘要；`CONTINUE_WORK.md`（只有根目錄一份）更新接續狀態；`release-delivery/` 狀態檔（README／VERSION／INSTALLER_STATUS／INSTALL_UNINSTALL／KNOWN_ISSUES）改寫成目前現況、不累積逐版段落；`QA_REPORT.md` append-only 補驗收證據。同一段內容不重複貼進多個檔案；舊紀錄由 CHANGELOG 與 git 歷史承接。完成後 push 並讀回 `origin/main` 確認。語言政策（2026-07-10）：中文為 canonical。`README.md` 英文區維持完整門面並同步最新版摘要；`CHANGELOG.md` 英文只留歸檔說明（0.1.42 起以中文為準）；`release-delivery/` 狀態檔結尾附一句英文指標即可；不可留舊版英文內容冒充最新。
