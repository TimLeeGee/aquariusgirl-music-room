# 安裝與解除安裝

版本：0.1.51
文件更新：2026-07-14

## Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.51.exe`。
2. 選擇安裝位置並完成安裝。
3. 從桌面捷徑或開始選單開啟 App。

目前未做 Windows code signing，SmartScreen 可能提示；Windows 真機仍待驗證。

## Windows 解除安裝

1. 到「設定 > 應用程式」。
2. 找到 `Aquariusgirl Music Room` 並選擇解除安裝。

## macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.51-arm64.dmg`。
2. 將 App 拖曳到 Applications。
3. 從 Applications 開啟。

目前未做 Developer ID 簽章與 notarization，Gatekeeper 可能提示。

## macOS 解除安裝

1. 關閉 App。
2. 從 Applications 移除 `Aquariusgirl Music Room.app`。

解除安裝不會刪除使用者原始音樂檔。若要清除播放清單與設定，需另外移除對應的 Electron userData。

English pointer: use the 0.1.51 installer names above; uninstalling the app does not remove original music files.
