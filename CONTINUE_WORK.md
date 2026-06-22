# Aquariusgirl Music Room Continue Work

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
- 已有主播放器、Mini 播放器、播放列表、智慧型播放清單、ID3 tag、專輯封面、歌詞同步、音樂律動條、macOS/Windows 打包流程。
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
- 已補齊設定保存/匯入匯出：Visualizer 設定、Mini 設定、歌詞、播放清單與播放偏好可保存，不保存音樂檔本體。
- 已在 Electron 原生選檔/選資料夾流程自動讀取同資料夾、同檔名 `.lrc` 歌詞，解析成功後寫入 IndexedDB。
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
- 同資料夾同名 `.lrc` 自動配對 source/build 驗證：通過。
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
- Electron 選擇歌曲後，若同資料夾有同名 `.lrc`，會自動載入歌詞。
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
