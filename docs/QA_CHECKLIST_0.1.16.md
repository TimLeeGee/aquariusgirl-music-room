# QA Checklist 0.1.16

日期：2026-06-28

## 播放清單功能

| 項目 | 結果 | 紀錄 |
| --- | --- | --- |
| 新增播放清單 | PASS | `usePlaylists().createPlaylist()` 仍為既有流程；`npm run build`、`node scripts/playlist-logic-check.mjs` 通過。 |
| 重新命名播放清單 | PASS | `renamePlaylist()` 未修改；版本建置與播放清單邏輯檢查通過。 |
| 刪除播放清單 | PASS | `deletePlaylist()` 與 renderer 刪除 dialog 保留；系統歌單不可刪，`playlist-logic-check` 通過。 |
| 加入歌曲到播放清單 | PASS | `addTrackToPlaylist()` 未改；AI 建歌單也只呼叫同一條既有加入流程。 |
| 從播放清單移除歌曲 | PASS | 一般歌單只移除 occurrence，智慧歌單加入 excludedTrackIds；`playlist-logic-check` 通過。 |
| 移除歌曲時不刪除本機音樂檔案 | PASS | 播放清單移除只改 membership；真正刪音樂庫歌曲仍是獨立 `removeTrack()` 流程。 |
| 播放清單資料重開 App 後仍存在 | PASS | 播放清單仍使用 IndexedDB `playlists` store；本輪未變更儲存 schema，`npm run build` 通過。 |

## AI 播放清單案例

| 案例 | 結果 | 紀錄 |
| --- | --- | --- |
| `隨意建立播放清單` | PASS | `pickRandomTracksForAIPlaylist()` 只從目前 `tracks` 陣列挑選真實 songId；`npm run check:ai-track-search` 通過。 |
| `建立櫻花46相關的播放清單` | PASS | metadata 關鍵字與別名搜尋涵蓋「櫻花46 / 櫻坂46 / Sakurazaka46」；找不到時不建立假歌。 |
| `幫我建立睡前播放清單` | PASS | 使用 mood/metadata scoring，僅回傳已載入歌曲；沒有 embedding 或音訊分析。 |
| 歌曲資料庫為空時要求隨機歌單 | PASS | UI 回覆「請先載入音樂」，不建立空幻想清單。 |
| AI 絕對不能憑空猜歌 | PASS | `handleCreateAIPlaylist()` 二次過濾目前 `tracks` 內存在的 id；0 首有效歌曲時回報錯誤。 |
| AI 建歌單 action log | PASS | Electron dev 會 append 到 `docs/AI_PLAYLIST_ACTION_LOG.md`；打包版寫入 userData 的 `AI_PLAYLIST_ACTION_LOG.md`。 |

## UI 驗收

| 項目 | 結果 | 紀錄 |
| --- | --- | --- |
| AI 欄位移到歌單區 | PASS | 瀏覽器驗證右側 `Playlists` 卡內有 `歌單 / AI 助手` 分頁，獨立 AI panel 數量為 0。 |
| 分頁或可切換區塊 | PASS | `PlaylistSidebar` 內使用 segmented tabs；AI 面板嵌入同一張歌單卡。 |
| 圓角與間距一致性 | PASS | 新增區塊只使用既有 `rounded-lg`、`p-4`、`gap-2/3/4`、`px-3 py-2`。 |
| 深色/玻璃風格延續 | PASS | 沿用既有 `glass-panel` 與 cyan/pink 狀態色，未另起 UI theme。 |

## 既有功能回歸

| 項目 | 結果 | 紀錄 |
| --- | --- | --- |
| 本機音樂播放 | PASS | 未修改播放核心與 HTMLAudioElement 流程；`npm run build` 通過。 |
| 播放 / 暫停 / 上一首 / 下一首 | PASS | `PlayerCore` 控制邏輯未改；`npm run build` 通過。 |
| 進度條 | PASS | 未修改進度列邏輯；`npm run build` 通過。 |
| 音量控制 | PASS | 未修改音量邏輯；`npm run build` 通過。 |
| 專輯封面 | PASS | `npm run check:flac-metadata` 通過，封面/metadata 解析路徑未改。 |
| 歌詞顯示 | 未測試 | 0.1.15 已移除 LRC/歌詞功能；本輪未恢復或新增。 |
| 頻譜或視覺化效果 | PASS | 視覺化元件未改；`npm run build` 通過。 |
| Mini 模式 | PASS | `node scripts/mini-opacity-check.mjs` 通過；本輪未改 Mini。 |
| Mini 置頂 | PASS | Electron Mini 設定邏輯未改；`mini-opacity-check` 通過。 |
| Mini 透明度 | PASS | `mini-opacity-check` 通過。 |
| 主視窗放大、縮小、全螢幕按鈕 | PASS | Electron 視窗控制未改；`npm run electron:compile` 通過。 |
| 主題顏色設定 | PASS | `npm run check:theme-colors` 通過。 |
| 自訂圖片欄位 | PASS | `npm run check:custom-images` 通過。 |
| OBS Browser Source Web 版 | PASS | `npm run build` 通過；瀏覽器預覽可載入。 |
| Windows 可打包 | PASS | `npm run dist:win` 通過，產出 Windows x64 目標 NSIS installer。 |
| macOS ARM / x86 可打包 | PASS | `npm run dist:mac` 通過，arm64/x64 DMG 均可掛載驗證，封裝版本皆為 0.1.16。 |

## 已執行檢查

- PASS：`npm run check:ai-track-search`
- PASS：`node scripts/playlist-logic-check.mjs`
- PASS：`node scripts/mini-opacity-check.mjs`
- PASS：`npm run check:flac-metadata`
- PASS：`npm run check:custom-images`
- PASS：`npm run check:theme-colors`
- PASS：`npm run check:secure-prompts`
- PASS：`env AI_REQUIRED_RUNTIMES=darwin-arm64,darwin-x64,win32-x64 npm run check:ai-assets`
- PASS：`npm run electron:compile`
- PASS：`npm run build`
- PASS：瀏覽器 UI 檢查，AI 助手位於歌單卡分頁內
- PASS：`npm run dist:mac`
- PASS：`npm run dist:win`
- PASS：DMG `hdiutil verify`，arm64/x64 checksum 均 VALID
- PASS：DMG 掛載檢查，`CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.16
- PASS：DMG 架構檢查，x64 為 x86_64，arm64 為 arm64

## 限制

- 未在 Windows 真機執行 installer。
- 未用使用者真實本機音樂資料做人工完整點擊流程；本輪以 source checks、deterministic tests、browser UI preview 與打包靜態驗證為主。
- macOS Developer ID notarization 與 Windows code signing 仍未設定。
