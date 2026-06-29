# 安裝與解除安裝

版本：0.1.18
文件更新：2026-06-29

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

Version: 0.1.18
Document update: 2026-06-29

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
