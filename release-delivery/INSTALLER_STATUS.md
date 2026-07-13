# Installer 狀態

版本：0.1.51
日期：2026-07-14

## 已完成

- `npm run dist:release`：exit 0，含三項新 checks、既有 canonical checks、AI assets、build 與 Electron compile。
- `release-delivery/installers/` 已由既有 sync 流程放入最新版 DMG／EXE，installer 不進 Git；release 暫存已清。
- DMG：684,795,800 bytes；SHA-256 `ff4bcc2ff3d04385c8621e31debf2585a59dbd812710ffa3a129aa37400f6f76`；`hdiutil verify` VALID、overall CRC32 `$6DC50645`。
- DMG 唯讀掛載讀回：CFBundleShortVersionString／CFBundleVersion 均為 0.1.51；app main 與 llama-server 為 Mach-O arm64；app.asar 43,047,919 bytes、TagLib wasm 678,470 bytes、AI model 532,517,120 bytes、llama-server 33,472 bytes 存在。
- EXE：667,677,087 bytes；SHA-256 `8be258fc2e87008395956992531be699c177783167673bb487169cc4b4ece2a7`；PE32 GUI Intel 80386、Nullsoft NSIS static PASS。

## 尚未完成

- 打包版 GUI 真實滑鼠匯入、取消、clear 與 Mini。
- Windows 真機、真實 10k 音樂檔 CPU／RSS／Profiler。
- macOS Developer ID／notarization、Windows code signing。

本次 installer 僅在本機交付，未加入 Git、未上傳 GitHub。

English pointer: local packaging and static artifact verification passed; GUI workflows, real Windows QA, real-library profiling, and signing remain open.
