# Installer 狀態

版本：0.1.52
日期：2026-07-16

## 已完成

- `npm run dist:release`：exit 0，含 `check:cover-colors`、`check:theme-colors`、既有 canonical checks、AI assets、build 與 Electron compile。
- `release-delivery/installers/` 已由既有 sync 流程放入最新版 DMG／EXE，installer 不進 Git；release 暫存已清。
- DMG：684,805,233 bytes；SHA-256 `97c92ee773a3eb27dfaeb5b49f518c9436ee8c9b2e052d9ecc048d953ca5fb4d`；`hdiutil verify` VALID、overall CRC32 `$3F6DEC31`。
- DMG 唯讀掛載讀回：CFBundleShortVersionString／CFBundleVersion 均為 0.1.52；app main 為 Mach-O arm64；TagLib wasm、AI model 與 darwin-arm64 llama-server 存在。
- EXE：667,678,858 bytes；SHA-256 `3e4a6d5d3ee7a1b4e6e25bb770518f5e34be9d8ba525230d74c1cc01f1aa3b54`；PE32 GUI Intel 80386、Nullsoft NSIS static PASS。
- packaged macOS 隔離 harness：Switch 預設／重啟保存、無封面 fallback、紅色封面 primary／底部 Mini／桌面 Mini 同步、關閉恢復手動色與 Mini opacity 92 均 PASS。
- 使用者回報 EXE／DMG 的新增功能簡單 smoke test 正常；未提供 OS 版本與逐項手順。

## 尚未完成

- 真實檔案內嵌封面、三首快速連續 packaged UI 切歌。
- Windows 完整回歸、真實 10k 音樂檔 CPU／RSS／Profiler。
- macOS Developer ID／notarization、Windows code signing。

installer 僅在本機交付，未加入 Git、未上傳 GitHub；source、文件與 checksum 已同步 GitHub `main`。

English pointer: packaging, artifact verification, the isolated macOS harness, and a user-reported simple EXE/DMG feature smoke test passed; embedded artwork, rapid switching, full Windows regression, real-library profiling, and signing remain open.
