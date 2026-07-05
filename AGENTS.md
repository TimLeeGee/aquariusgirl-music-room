# AGENTS.md

## 快速接手

- Aquariusgirl Music Room 是 React + TypeScript + Vite + Electron 的本地音樂播放器，目前版本是 `0.1.33`。
- 0.1.33 最新 hotfix 是 `Nested Main and Playlist Scroll`：主視窗卷軸與 playlist 卷軸不是二選一。`AppLayout` 外層主內容容器是 `h-screen overflow-y-auto overflow-x-hidden`，主視窗內容超出時右側大型卷軸會出現；`TrackList` 仍是播放清單內部歌曲列表 scroll container，保留 `playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`。`body` 不能再用全域 `overflow: hidden` 鎖死主視窗，只保留 `overflow-x: hidden`。0.1.32 的 `PlaylistPanel` 高度 `max-h-[calc(100vh-10rem)] min-h-[520px]` 與 0.1.28 的 TrackList visible-window + overscan 仍保留。0.1.28 的 `Kill Metadata Save Loop` 仍是資料流基底：播放統計、duration、歌曲資訊 / 封面保存走單曲 `put` / `patch`；歌曲資訊面板有「儲存到播放器」與「套用到原始檔」兩條路徑；播放佇列會跟目前歌曲清單排序由上到下播放；歌曲清單只 render 可見窗口，避免上萬首一次產生上萬個 DOM row；dev guard 可警示重複 stored metadata 回灌、播放中非預期原檔 metadata 重讀、同 track source 變動造成的 `audio.load()`。
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
