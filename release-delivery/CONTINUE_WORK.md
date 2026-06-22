# 接續工作狀態

最後更新：2026-06-22 CST

## 0.1.15 歌詞／LRC 殘留清理發行完成

- README 與新手引導已移除歌詞／LRC 支援宣稱；未使用的型別、IndexedDB 讀寫與設定匯入匯出欄位已刪除。
- 舊版 IndexedDB 的退役 store 不主動刪除，只停止使用；未新增 migration、套件或替代功能。
- 精準殘留掃描、全部既有 source checks、build、Electron compile、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- arm64 packaged App 以隔離 userData 從 `file://.../app.asar/dist/index.html` 啟動；新手引導與主畫面均無歌詞／LRC 入口或文案。
- 最新三個 installer 只在 `release-delivery/installers/`，`release/` 不存在，測試 DMG 均已卸載。Windows 真機與正式簽章仍未完成。

## 0.1.14 發行驗收完成

- 正式資料已由 recovery-candidate-5 一致恢復 IndexedDB 與 Local Storage；0.1.13／0.1.14 packaged 啟動後均確認 14 首、re0 2 首、米津玄師 4 首及全部歌單，原始音樂檔未改動。
- 目前播放卡「加入歌單」欄位改為固定 `w-36 shrink-0`；重複加入由原生 `window.confirm()` 改為 renderer dialog，未新增套件或改歌單結構。
- 全部既有檢查、build、Electron compile、隔離 Electron 連續加入／重複確認、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- arm64 packaged `file://`、正式 14／2／4、每步重新取得 accessibility tree 的一般→MINI→一般，以及隔離 packaged 重複確認 dialog 均通過。
- 0.1.13 與 0.1.14 的測試 DMG 均已卸載；最新三個 installer 只在 `release-delivery/installers/`，`release/` 不存在。
- Windows EXE 仍需真機重跑連續加入兩個歌單、重複加入 dialog、最大化→MINI、拖曳與版面；installer 未簽章／notarize。

## 0.1.12 發行驗收完成

- 已精準修正最大化／全螢幕切換 MINI：保存 normal bounds，解除 full screen／maximize 後再套固定 MINI bounds。
- MINI 根節點已補既有 `app-drag-region`，Windows 頂部安全區可拖曳；控制區維持 `app-no-drag`。
- 全部既有檢查、build、Electron compile、Electron dev 全螢幕切換／拖曳／返回 Full 與 `npm run dist:all` 均通過。
- 0.1.12 EXE／arm64 DMG／x64 DMG 已位於 `release-delivery/installers/`，SHA-256 已記錄，`release/` 不存在。
- 兩個 DMG `hdiutil verify` 均為 VALID；封裝版本均為 0.1.12，執行檔分別為 arm64／x86_64，本輪測試映像均已卸載。
- arm64 packaged `file://`、品牌素材、原生選檔 preload IPC、Full→MINI→頂部拖曳→Full 均通過。
- Windows EXE 仍需真機重跑最大化→MINI、拖曳與版面手順；installer 未簽章／notarize。

## 0.1.11 發行完成：加入歌單欄位固定寬度

- 已找出根因：歌曲列原生 `select` 使用 `max-w-32`，會依每首歌的選項文字計算不同寬度。
- 已將欄位精準改為 `w-32 shrink-0`，並在 `playlist-logic-check` 新增固定寬度與禁止 `max-w-32` 的回歸斷言；未改歌單行為或其他 UI。
- 完整既有檢查、Electron dev 長短歌曲／超長歌單 GUI、build、Electron compile、arm64 packaged `file://`、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.11 installer 只在 `release-delivery/installers/`；Windows 真機仍需依 13:16 截圖確認多列欄位同寬。

## 0.1.10 發行完成

- Windows MINI 原生標題列新增 20px 安全區，固定尺寸改為 `260×288`；macOS 維持 `260×268`。
- 進度列固定為 20px 行高，與音量列一致；既有 8px gap 不再被 Windows 可用高度壓縮。
- 完整既有檢查、build、Electron compile、Electron dev、arm64 packaged `file://`、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 installer 只在 `release-delivery/installers/`；Windows 真機仍需依 10:49 截圖手順確認無堆疊。

## 0.1.9 發行完成

- Windows MINI 尺寸漂移已修正：每 2 秒 bounds 回寫只保存 `x/y`，寬高固定為 `260×268`，待機與播放都不再累積讀回誤差。
- 完整既有檢查、build、Electron compile、Electron dev、arm64 packaged `file://`、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 installer 只在 `release-delivery/installers/`；Windows 真機仍需確認待機與播放狀態都不會變大。

## 0.1.8 發行完成

- MINI 背景色相與設定頁 MINI 原生透明度欄位已完成；相關檢查、build、Electron compile、Electron dev、`dist:all`、兩個 DMG verify 與 arm64 packaged `file://` 驗收均通過。
- 封裝版本均為 0.1.8，架構分別為 arm64 / x86_64；兩個測試 DMG 均已卸載。
- 最新三個 installer 只在 `release-delivery/installers/`，`release/` 不存在。
- installer 時間：2026-06-20 23:02:09 CST。
- SHA-256：EXE `73b05fb9d97724216ef99ff68a260c5fca9ad51012692252babbf1ecca8f8e56`；arm64 DMG `2de7b79107763012be47fdbd3209d50a3f2cd94bdc3a19f0dac89c37e65d6ae3`；x64 DMG `34fa962543359f7276138a997d23dfd4ae0910b9d81bd75d8470db6a63415d65`。

## 已完成

- 版本升級為 0.1.14；只修改目前播放卡加入歌單欄位寬度、重複加入確認與既有檢查。
- recovery-candidate-5 已一致恢復正式 IndexedDB／Local Storage，packaged 重開後維持 14／2／4。
- 0.1.14 EXE／兩個 DMG 已完成校驗與 packaged 驗收，`release/` 不存在，測試 DMG 均已卸載。

- 版本升級為 0.1.11；只修改歌曲列「加入歌單」欄位寬度與既有檢查。
- Electron dev 以兩首測試 WAV、超長歌單與「已在歌單」長選項確認所有下拉欄位同寬，收藏／刪除按鈕對齊。
- 最新三個 0.1.11 installer 已完成校驗，`release/` 不存在，測試 DMG 均已卸載。

- 版本升級為 0.1.10；只修改 MINI Windows 安全區、固定高度、進度列行高與既有檢查。
- Electron dev 與 packaged `file://` 的 MINI 無堆疊、無捲軸，可正常返回完整播放器。
- 最新三個 0.1.10 installer 已完成校驗，`release/` 不存在，測試 DMG 均已卸載。

- 版本升級為 0.1.9；只修改 Electron MINI bounds 與既有 Mini 檢查。
- Electron dev 與 packaged `file://` 在未播放狀態跨多輪 bounds 回寫仍維持 `260×268`，可正常返回完整播放器。
- 最新三個 0.1.9 installer 已完成校驗，`release/` 不存在，測試 DMG 均已卸載。

- 版本升級為 0.1.8。
- 色彩設定新增 MINI 背景色相；透明度設定新增 MINI 原生視窗 `20–100%` 欄位，沿用既有單一 opacity 狀態。
- Electron dev 實測 MINI 色相、20%／100% 原生視窗透明度與全部復原；arm64 packaged `file://` 驗收通過。
- 自動檢查、build、Electron compile、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.8 installer 只在 `release-delivery/installers/`，`release/` 不存在，測試 DMG 均已卸載。

- 版本升級為 0.1.7。
- 色彩設定新增共用面板背景色相；透明度分頁新增共用面板、主背景、角色舞台遮罩、左右裝飾四項 `0–100%` 控制。
- 設定沿用既有保存、匯出／匯入與全部復原；未新增套件，預設仍是 0.1.6 暗色外觀。
- 自動檢查、build、Electron compile、Electron dev 邊界／保存／復原驗收、`dist:all`、兩個 DMG verify、arm64 packaged `file://` 視覺驗收、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.7 installer 只在 `release-delivery/installers/`，`release/` 已移除，測試 DMG 已卸載。

- 版本升級為 0.1.6。
- 共用 `.glass-panel` 改為固定深藍黑，角色舞台另加深色遮罩；主背景仍清楚，面板不再被背景染亮。
- `theme-color-check`、`custom-image-check`、既有功能檢查、build、Electron compile、Electron dev 與 arm64 packaged `file://` 視覺驗收、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.6 installer 只在 `release-delivery/installers/`，`release/` 已移除，測試 DMG 均已卸載。

- 版本升級為 0.1.5。
- 主背景改為 70% opacity 並移除 blur；全不透明主題漸層改為半透明，背景細節清楚可辨識。
- `check:custom-images`、既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.5 installer 只在 `release-delivery/installers/`，`release/` 已移除。

- 版本升級為 0.1.4。
- 修正主背景與兩張裝飾被負 z-index／內容卡片蓋住；裝飾改為不攔截操作的左右下角前景。
- `check:custom-images`、既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.4 installer 只在 `release-delivery/installers/`，`release/` 已移除。

- 版本升級為 0.1.3。
- 現有 metadata 解析器新增 FLAC 原生 `PICTURE` 內嵌封面支援，未新增套件或改動其他功能。
- `check:flac-metadata`、既有功能檢查、build、Electron compile、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.3 installer 只在 `release-delivery/installers/`，`release/` 已移除。

- 版本升級為 0.1.2。
- 外觀設定新增置中的「圖片／色彩」分頁。
- 色彩設定提供主色、輔色、金色點綴、文字、背景五組原生七彩拉桿；設定會保存、納入匯出／匯入並可全部復原。
- `theme-color-check`、`custom-image-check`、播放清單／Mini 檢查、build、Electron compile、`dist:all`、兩個 DMG verify、封裝版本／架構與 EXE static check 均通過。
- 最新三個 0.1.2 installer 只在 `release-delivery/installers/`，`release/` 已移除。

- 版本升級為 0.1.1。
- 右上新增圖片設定按鈕，與清空／Mini 按鈕維持 44px 尺寸、8px 間距。
- 新增九張圖片設定：logo、avatar、banner、main-bg、idle、playing、default-cover、star、bubble。
- 內建圖片保留於 `public/assets`；自訂圖片驗證後複製到 app userData，可個別回復預設。
- `custom-image-check`、build、Electron compile、既有播放清單／Mini 檢查、Browser 視覺驗收、`dist:all`、DMG verify 與 EXE static check 均通過。
- 最新 installer 只在 `release-delivery/installers/`，`release/` 已移除。

- 智慧型播放清單垃圾桶改為持久排除目前歌曲，不刪歌曲庫、不影響其他歌單。
- 排除項目會保存／匯出，匯入時重新配對 track id。
- MINI 透明度下限由 60% 改為 20%。
- `playlist-logic-check`、`mini-opacity-check`、build、Electron compile、`dist:all`、DMG verify 與 EXE static check 均通過。

- MINI 新增 60–100% 透明度數字輸入與左右 ±5 控制，設定保存並接 Electron 原生視窗透明度。
- MINI 統一 8px 間距與 20/16/12–14px 圓角；260×268 驗收無捲軸。
- 透明度 UI 實測：92 → 87；輸入 20 → clamp 60。
- `mini-opacity-check`、build、Electron compile、`dist:all`、兩個 DMG verify 與 EXE static check 均通過。

- 上一版 `window.focus()` / `BrowserWindow.focus()` 修正經 Windows 實機回報無效。
- 播放清單刪除確認已改成 renderer 內的 `PlaylistDeleteDialog`，不再開啟會帶走 Windows 焦點的 `window.confirm()`。
- 移除上一版無效的 `focus` window-control IPC。
- 智慧型播放清單名稱欄位保留 `autoFocus`。
- 既有檢查新增防回歸：刪除 handler 不得包含 `window.confirm()`。
- `node scripts/playlist-logic-check.mjs`：PASS。
- `npm run build`：PASS。
- `npm run electron:compile`：PASS。
- Chromium 完整焦點手順：PASS；第二次開啟智慧清單後，不點輸入框、不切換視窗即可直接鍵盤輸入。
- `npm run dist:all`：PASS。
- arm64 / x64 DMG `hdiutil verify`：PASS。
- EXE static check：PASS。
- 最新 installer 只在 `release-delivery/installers/`，`release/` 已移除。

## 最新 installer

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.15.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.15-arm64.dmg
release-delivery/installers/Aquariusgirl Music Room-0.1.15.dmg
```

修改時間：2026-06-22 17:39:56–17:39:57 CST

## SHA-256

- EXE：`df47559e42f427183a37afd6a0a9cf964654496efa21ea6526a5939c84b9ce16`
- arm64 DMG：`bb7f6b6bbaf2d0533b281536ef3aa3da2cdbb287153561a6473bb506e42c1907`
- x64 DMG：`969ba94c1b06b80730684d94b8b7fe100dae1b4c92763ffda49886dc76b38fed`

## 仍需人工驗收

- 在 Windows 安裝 0.1.15 EXE，確認新手引導與主畫面沒有歌詞／LRC 文案或入口。
- 在 Windows 安裝 0.1.15 EXE，從目前播放卡將同一首歌依序加入兩個歌單，確認欄位不放大；再選「已在…」，確認 renderer dialog 可取消／仍然加入，整個 App 不鎖死。
- 在 Windows 安裝 0.1.15 EXE，將完整播放器最大化後切換 MINI，確認欄位不跑版，再由頂部拖曳到不同位置並返回完整播放器。
- 在 Windows 安裝 0.1.15 EXE，確認長短歌名與不同歌單狀態下，每列「加入歌單」欄位同寬，收藏／刪除按鈕垂直對齊。
- 在 Windows 安裝 0.1.15 EXE，進入 MINI 後確認視窗維持 `260×288`、原生最小化／關閉按鈕未壓住標題卡，播放／進度／音量／底部控制四列無堆疊且間距一致。
- 在 Windows 安裝 0.1.5 EXE，確認主背景細節清楚且卡片文字可讀。
- 在 Windows 安裝 0.1.5 EXE，確認主背景與左右兩張裝飾圖顯示，且按鈕仍可操作。
- 在 Windows 安裝 0.1.5 EXE，匯入截圖中的真實 FLAC，確認顯示內嵌封面。
- 在 packaged Electron 調整五條色相拉桿，重開 App 確認保存，再執行「全部復原」。
- 在 macOS Electron 桌面版逐張更換九個圖片槽，重開 App 確認保存，再逐張回復預設。
- 用真實音樂庫建立智慧清單，按垃圾桶後確認歌曲立即消失，重開 App 後不回流，歌曲仍存在「全部歌曲」。
- 在 macOS 桌面版確認 MINI 20–100% 原生視窗透明度。
- 在 Windows 真機安裝 0.1.5 EXE，驗證色彩／圖片設定、智慧清單移除、MINI 透明度與既有焦點手順。
- installer 未做 Apple Developer ID、notarization 或 Windows code signing。

## 下次接續提示詞

請接續 Aquariusgirl Music Room 0.1.15 的 Windows 真機驗收。最新版 installer 時間為 2026-06-22 17:39:56–17:39:57 CST，位於 `release-delivery/installers/`。先讀 `QA_REPORT.md` 與 `INSTALLER_STATUS.md`；安裝 0.1.15 EXE 後，先確認新手引導與主畫面沒有歌詞／LRC 文案或入口，再從目前播放卡將同一首歌依序加入兩個歌單，確認欄位不放大；接著重跑最大化→MINI、頂部拖曳與返回完整播放器。若仍異常，附新截圖與 Windows 顯示縮放比例；不要改其他 UI。
