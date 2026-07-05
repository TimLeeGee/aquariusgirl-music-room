# Aquariusgirl Music Room 開發技能

## 目的

這份技能只負責 Aquariusgirl Music Room 的播放器功能、UI、播放清單、metadata、cover、IndexedDB、Electron、OBS Browser Source、效能與驗收。專案交付相關操作不在本文件範圍內。

## 產品邊界

- 只播放使用者明確選擇的本機音樂檔。
- 不使用線上音樂來源、不串流、不下載音樂。
- 不把音樂檔本體、`File`、`Blob`、`ArrayBuffer` 或 object URL 保存到 localStorage / IndexedDB。
- Electron 可使用原生檔案對話框，但不可掃描整台硬碟。
- AI 只能使用目前已載入 / 已索引歌曲的安全 metadata，不得編造歌曲、歌手、路徑或播放清單。

## UI 與播放清單

- 全部歌曲、自訂播放清單、搜尋結果、智慧播放清單與播放佇列共用同一套歌曲列元件與樣式。
- 歌曲卡片固定合理高度，維持封面、文字、時長與操作按鈕垂直置中；不要用拉高卡片假裝支援大量歌曲。
- 右側歌曲列表使用 bounded scroll container：父層 `flex`、`min-height: 0`、`overflow: hidden`，列表本身 `overflow-y: auto`、`overflow-x: hidden`。
- 搜尋列與排序列固定在列表上方；大量歌曲只捲動歌曲列表，不讓整個 app body 或左側播放器跟著捲。
- 底部 mini player 顯示時，列表要留 safe space，最後一首歌不可被遮住。

## Metadata、Cover 與 IndexedDB

- 播放清單只保存 trackIds，不保存歌曲 snapshot。
- 修改 title / artist / album / albumArtist / year / genre / track / disc / comment / composer / cover 時，只刷新該首歌。
- 播放統計與 duration 只 patch 小欄位，不可重寫整個 tracks store。
- metadata / cover-only 更新不可改 `localUrl` 或 `mediaVersion`，不可觸發同來源 `audio.load()`。
- 原始檔寫回成功訊息只能在原始檔寫入、重新讀取、全域 tracks 更新與單曲 IndexedDB 保存都完成後顯示。

## Electron 與 OBS

- Electron main / preload 只暴露必要檔案選擇、視窗控制、歌曲資訊讀寫與 AI runtime API。
- 寫回原始檔前要確認桌面版、sourcePath、格式支援與使用者確認。
- OBS Browser Source 模式只顯示安全播放狀態，不觸發檔案選取或寫回流程。

## 效能

- 大曲庫優先保留原生 scroll + 既有 visible-window list；不要為小修正新增 virtualization 套件。
- M1 MacBook Air 8GB 是最低開發體感基準：避免全庫重掃、全庫 IndexedDB rewrite、上萬個 DOM row 一次 render。
- 只有真實大曲庫 QA 證明需要時，才考慮 worker、索引資料庫或更重的 virtualizer。

## 驗收

程式修改至少執行：

- `npm run check:track-list-virtualization`
- `npm run check:metadata-save-loop`
- `npm run check:playback-restore`
- `npm run build`
- `npm run electron:compile`

依改動範圍再補：

- `npm run check:playback-order`
- `npm run check:song-info`
- `npm run check:track-display`
- `npm run check:track-identity`
- `npm run check:ai-track-search`
- `npm run check:flac-metadata`
- `npm run check:prompts`
- `npm run check:theme-colors`
- `npm run check:custom-images`
- `npm run check:ai-assets`

若驗收只能做到 source-level 或 static check，回報必須明確標出尚未完成的 packaged GUI、Windows 真機、大曲庫滑動、簽章或 notarization 缺口。
