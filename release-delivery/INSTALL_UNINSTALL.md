# 安裝與解除安裝

版本：0.1.29
文件更新：2026-07-04

## 0.1.29 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.29.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.29 修正右側播放清單卡片捲軸與高度邊界，讓播放清單卡片底部與左側睡前定時卡片底部切齊，並保留 0.1.28 的大清單 visible-window render。仍建議首次在 Windows 真機驗證播放清單內部捲動、底部播放器不被清單覆蓋、手動排序 / 檔名排序播放順序、大清單滑動、播放/暫停、資料夾恢復、歌曲資訊與封面寫回。

## 0.1.29 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.29-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

0.1.29 解除安裝方式與下方歷史說明相同；解除安裝 App 不會刪除使用者原始音樂檔。

0.1.29 已完成 DMG verify 與唯讀掛載讀回版本 / arm64 / app.asar / AI model / prompts / runtime 檢查。下一輪 packaged GUI 驗收仍須使用暫存音樂複本與隔離 profile，補驗播放清單捲軸、手動排序 / 檔名排序的實機播放順序與大清單滑動，不可打開或修改使用者原始 Music 資料夾。

歌曲資訊面板提供「儲存到播放器」與「套用到原始檔」。「儲存到播放器」只保存播放器本機 metadata，不修改原始音樂檔；「套用到原始檔」會修改使用者選取的原始 MP3/FLAC/M4A，操作前請確認內容正確，必要時先保留音樂檔備份。

## 0.1.28 歷史安裝說明

0.1.28 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.28.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.28-arm64.dmg`。該版 hotfix 修正 metadata 保存迴圈、全庫重寫問題、播放順序未跟隨目前歌曲清單排序，以及大清單一次 render 全部列的問題。

## 0.1.27 歷史安裝說明

0.1.27 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.27.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.27-arm64.dmg`。該版 hotfix 修正第一次歌曲資訊 / 封面寫回成功後，第二次開面板可能因舊 draft / saving 狀態導致「套用到原始檔」無反應的問題。

## 0.1.27 歷史 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.27.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.27 修正第一次歌曲資訊 / 封面寫回成功後，第二次開面板可能因舊 draft / saving 狀態導致「套用到原始檔」無反應的問題。仍建議首次在 Windows 真機驗證播放中改封面、第二次寫回、第一次重開即保留新封面、播放/暫停、資料夾恢復、歌曲資訊與封面寫回。

## 0.1.27 歷史 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.27-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

0.1.27 解除安裝方式與下方歷史說明相同；解除安裝 App 不會刪除使用者原始音樂檔。

0.1.27 已完成 DMG verify 與唯讀掛載讀回版本 / arm64 / app.asar / AI runtime 檢查；本輪尚未執行 packaged GUI 滑鼠流程。下一輪驗收仍須使用暫存音樂複本與隔離 profile，不可打開或修改使用者原始 Music 資料夾。

歌曲資訊保存只保留「套用到原始檔」。寫回會修改使用者選取的原始 MP3/FLAC/M4A；操作前請確認內容正確，必要時先保留音樂檔備份。

## 0.1.26 歷史安裝說明

0.1.26 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.26.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.26-arm64.dmg`。該版 hotfix 修正原始檔寫回後播放器資料庫可能仍保留舊 cover / metadata 的殘留問題。

## 0.1.25 歷史安裝說明

0.1.25 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.25.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.25-arm64.dmg`。該版 hotfix 修正 0.1.24 同族殘留的 audio source 誤重載，避免 duration 或 metadata 更新讓同一首歌誤觸 `audio.load()`。

## 0.1.24 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.24.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.24 已修正播放中更換封面後切歌再切回會短暫卡住，以及 cover02 -> cover01 重開後可能先舊後新的問題；仍建議首次在 Windows 真機驗證播放中改封面、播放/暫停、資料夾恢復、歌曲資訊與封面寫回。

## 0.1.24 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.24-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

0.1.24 解除安裝方式與下方歷史說明相同；解除安裝 App 不會刪除使用者原始音樂檔。

歌曲資訊保存只保留「套用到原始檔」。寫回會修改使用者選取的原始 MP3/FLAC/M4A；操作前請確認內容正確，必要時先保留音樂檔備份。

## 0.1.23 歷史安裝說明

0.1.23 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.23.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.23-arm64.dmg`。該版 hotfix 修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的閃爍。

## 0.1.22 歷史安裝說明

0.1.22 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.22.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.22-arm64.dmg`。該版 hotfix 修正 `Cover 01.jpg` 因舊 3 MB 上限無法預覽與寫回的問題，並加入超過 5 MB 的明確提示。

## 0.1.21 歷史安裝說明

0.1.21 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.21.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.21-arm64.dmg`。該版 hotfix 修正歌曲顯示排序、封面更換後播放清單掉歌、啟動恢復逐首重讀 metadata 過慢與 AI 建歌單等待狀態。

## 0.1.20 歷史安裝說明

0.1.20 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.20.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.20-arm64.dmg`。該版 hotfix 修正播放卡頓、暫停停不下來、畫面閃爍與最後資料夾恢復。

## 0.1.19 歷史安裝說明

0.1.19 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.19.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.19-arm64.dmg`。該版 hotfix 修正選擇大型音樂資料夾時把整個音檔傳進 IPC 的風險，並收斂歌曲資訊保存流程。

## 0.1.18 歷史安裝說明

## Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.18.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

## Windows 解除安裝

1. 到 Windows「設定 > 應用程式」。
2. 找到 `Aquariusgirl Music Room`。
3. 選擇解除安裝。

解除安裝 App 不會刪除使用者原始音樂檔。若要清除播放清單、主題、AI action log 或其他 App 設定，需另外清除 Electron app userData。

## macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.18-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

## macOS 解除安裝

1. 關閉 App。
2. 從 Applications 移除 `Aquariusgirl Music Room.app`。

移除 App 不會刪除使用者原始音樂檔。若要清除 App 設定，可移除 macOS Application Support 中對應的 App 資料。

---

## Install and Uninstall

Version: 0.1.29
Document update: 2026-07-04

## 0.1.29 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.29.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

0.1.29 fixes the right playlist card scroll bounds and keeps the playlist card bottom aligned with the Sleep Timer card. Real Windows QA should still verify internal playlist scrolling, large-list scroll smoothness, playback/pause, latest-folder restore, song-info writeback, and cover writeback.

## 0.1.29 macOS Install

1. Open `Aquariusgirl Music Room-0.1.29-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

0.1.29 uses the same uninstall steps as the historical notes below. Uninstalling the app does not delete original music files.

0.1.29 passed DMG verify and read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks. Packaged GUI stress QA and large-list scroll QA still need a temp music copy and isolated profile; do not open or modify the user's original Music folder.

The song-info panel has both player-local save and original-file writeback. Player-local save only updates local player metadata; original-file writeback modifies the selected MP3/FLAC/M4A, so keep a backup when needed.

## 0.1.28 Historical Install Notes

0.1.28 used `Aquariusgirl Music Room Setup 0.1.28.exe` and `Aquariusgirl Music Room-0.1.28-arm64.dmg`. It fixed the metadata save loop, playback order, and TrackList visible-window rendering.

## 0.1.27 Historical Install Notes

0.1.27 used `Aquariusgirl Music Room Setup 0.1.27.exe` and `Aquariusgirl Music Room-0.1.27-arm64.dmg`. It fixed the second song-info / cover writeback path after an earlier successful writeback.

## 0.1.27 Historical Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.27.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

0.1.27 fixes the second song-info / cover writeback path after an earlier successful writeback. Real Windows QA should still verify second writeback, first-restart cover persistence, playback/pause, latest-folder restore, song-info writeback, and cover writeback.

## 0.1.27 Historical macOS Install

1. Open `Aquariusgirl Music Room-0.1.27-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

0.1.27 uses the same uninstall steps as the historical notes below. Uninstalling the app does not delete original music files.

0.1.27 passed DMG verify and read-only DMG version / arm64 / app.asar / AI runtime checks. Packaged GUI mouse QA still needs a temp music copy and isolated profile; do not open or modify the user's original Music folder.

Song info saving now only writes back to the original file. Writeback modifies the selected original MP3/FLAC/M4A, so verify the edit first and keep a backup when needed.

## 0.1.26 Historical Install Notes

0.1.26 used `Aquariusgirl Music Room Setup 0.1.26.exe` and `Aquariusgirl Music Room-0.1.26-arm64.dmg`. It fixed the remaining original-file writeback persistence race.

## 0.1.25 Historical Install Notes

0.1.25 used `Aquariusgirl Music Room Setup 0.1.25.exe` and `Aquariusgirl Music Room-0.1.25-arm64.dmg`. It fixed the remaining same-source audio reload after cover/song-info writeback.

## 0.1.24 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.24.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

0.1.24 fixes playback stalling after cover writeback and the first-restart-old-cover / second-restart-new-cover persistence race. Real Windows QA should still verify playback while editing cover art, playback/pause, latest-folder restore, song-info writeback, and cover writeback.

## 0.1.24 macOS Install

1. Open `Aquariusgirl Music Room-0.1.24-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

0.1.24 uses the same uninstall steps as the historical notes below. Uninstalling the app does not delete original music files.

Song info saving now only writes back to the original file. Writeback modifies the selected original MP3/FLAC/M4A, so verify the edit first and keep a backup when needed.

## 0.1.23 Historical Install Notes

0.1.23 used `Aquariusgirl Music Room Setup 0.1.23.exe` and `Aquariusgirl Music Room-0.1.23-arm64.dmg`. It fixed artist field flicker between real artist text and `未知歌手`.

## 0.1.22 Historical Install Notes

0.1.22 used `Aquariusgirl Music Room Setup 0.1.22.exe` and `Aquariusgirl Music Room-0.1.22-arm64.dmg`. It fixed the old 3 MB cover limit that blocked `Cover 01.jpg` before preview/writeback and added a clear >5 MB message.

## 0.1.21 Historical Install Notes

0.1.21 used `Aquariusgirl Music Room Setup 0.1.21.exe` and `Aquariusgirl Music Room-0.1.21-arm64.dmg`. It fixed filename-first display, playlist persistence after cover writeback, startup restore cost, and AI playlist busy feedback.

## 0.1.20 Historical Install Notes

0.1.20 used `Aquariusgirl Music Room Setup 0.1.20.exe` and `Aquariusgirl Music Room-0.1.20-arm64.dmg`. It fixed playback stutter, unreliable pause, flashing playback state, and latest-folder restore.

## 0.1.19 Historical Install Notes

0.1.19 used `Aquariusgirl Music Room Setup 0.1.19.exe` and `Aquariusgirl Music Room-0.1.19-arm64.dmg`. It fixed large-folder whole-audio IPC risk and consolidated song-info saving.

## 0.1.18 Historical Install Notes

## Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.18.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

## Windows Uninstall

1. Open Windows Settings > Apps.
2. Find `Aquariusgirl Music Room`.
3. Choose Uninstall.

Uninstalling the app does not delete original music files. To remove playlists, theme settings, AI action logs, or other app settings, clear the Electron app userData separately.

## macOS Install

1. Open `Aquariusgirl Music Room-0.1.18-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

## macOS Uninstall

1. Quit the app.
2. Remove `Aquariusgirl Music Room.app` from Applications.

Removing the app does not delete original music files. To remove app settings, clear the matching Application Support data.
