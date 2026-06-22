# 已知問題

## 0.1.2 色彩設定驗收缺口

- 五組色彩 token、保存接線、匯出／匯入、全部復原與視覺版面已完成程式／建置檢查；仍需在 packaged Electron 手動操作五條拉桿、重開 App 確認保存，再執行全部復原。
- Windows 0.1.2 EXE 已完成 x64 打包與靜態驗證，但尚未在 Windows 真機安裝／執行。
- macOS installer 未做 Developer ID 簽章或 notarization；Windows installer 未做 code signing。

## 0.1.1 圖片設定驗收缺口

- 九槽檔案保存邏輯與 Web 視覺介面已自動驗收；Electron 原生選圖、重開 App 保存與逐張回復預設仍需 macOS 人工點擊。
- Windows 0.1.1 EXE 已完成靜態驗證，但尚未在 Windows 真機安裝／執行。

## 本輪環境限制

- Computer Use 可以讀取 packaged macOS app 視窗，但 click action 仍回報 session inactive，因此 MINI 模式與 alwaysOnTop 需要人工點擊復測。
- Windows EXE 已成功打包，但目前在 macOS 環境無法實際安裝/啟動 Windows installer；Windows 原生視窗按鈕需在 Windows 實機確認。

## 正式發行限制

- 目前測試版未做 Apple Developer ID 簽章與 notarization。
- 目前測試版未做 Windows code signing。
- macOS / Windows 可能顯示安全性提示，正式公開發行前需補簽章。

## 功能驗收限制

- MINI alwaysOnTop 的程式路徑已接 Electron `setAlwaysOnTop`，但本輪無法用 GUI 工具實際點擊後跨 App 驗收，所以報告中標為 PARTIAL。
- DMG packaged app 已確認原生紅黃綠視窗按鈕存在；Windows EXE 因 `frame: true` 會使用原生視窗框，但仍需 Windows 實機點擊確認。
