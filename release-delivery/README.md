# Aquariusgirl Music Room 本機交付

版本：0.1.52
日期：2026-07-16
平台：macOS arm64、Windows x64

## 目前狀態

0.1.52 已完成本機打包，source、文件與 checksum 已同步 GitHub `main`。外觀設定新增預設關閉、可保存的「依封面自動換色」：只按需分析目前歌曲真實封面，effective hue 暫時同步主色與底部／桌面 Mini；手動色、文字色與透明度不被覆寫。無封面、失敗、關閉或無目前歌曲時回手動色；64-entry LRU、stale guard 與 450ms transition 守住切歌與效能。

最新版 installer 僅在 `release-delivery/installers/`：

- `Aquariusgirl Music Room Setup 0.1.52.exe`：667,678,858 bytes；SHA-256 `3e4a6d5d3ee7a1b4e6e25bb770518f5e34be9d8ba525230d74c1cc01f1aa3b54`
- `Aquariusgirl Music Room-0.1.52-arm64.dmg`：684,805,233 bytes；SHA-256 `97c92ee773a3eb27dfaeb5b49f518c9436ee8c9b2e052d9ecc048d953ca5fb4d`

`npm run dist:release` exit 0；DMG verify VALID、唯讀掛載讀回 0.1.52／arm64／TagLib wasm／AI 模型與 runtime；EXE 為 PE32 GUI、Nullsoft NSIS static PASS。packaged macOS 隔離 harness 已驗 Switch 保存、無封面 fallback、紅色封面同步兩種 Mini、關閉恢復手動色與透明度保留。完整 checksum 與限制見 `docs/releases/0.1.52-checksums.md`，逐版歷史見根目錄 `CHANGELOG.md`，驗收證據見 `QA_REPORT.md`。

## 交付限制

- 使用者回報 EXE／DMG 的新增功能簡單測試正常，但未列 OS 版本與逐項手順。
- 真實檔案內嵌封面與三首快速連續 packaged UI 切歌尚未驗證；本次有封面流程使用隔離 IndexedDB harness。
- Windows 完整回歸仍未驗證；使用者 EXE smoke test 不涵蓋既有播放、寫回、Mini 或大曲庫流程。
- 未以真實 10k 音樂檔量測 CPU、RSS 或 Profiler；只有 deterministic 10k queue／commit check。
- macOS Developer ID／notarization 與 Windows code signing 尚未設定。
- installer 只留本機、不進 Git；未建立 tag、PR、GitHub Release 或上傳 installer。

English pointer: version 0.1.52 source, docs, and checksums are on GitHub main; the user reported a simple EXE/DMG feature smoke test passed, while real embedded artwork, rapid three-track switching, full Windows regression, real-library profiling, signing, and notarization remain open.
