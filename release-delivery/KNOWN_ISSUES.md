# 已知問題

版本：0.1.52
文件更新：2026-07-16

## 本版待補驗證

- `check:cover-colors` 可守住量化、placeholder、no-cover、手動色不被 mutate、64-entry LRU 與 A→B→C stale guard；尚未以真實三首歌曲在 packaged UI 快速連續切換。
- packaged macOS 有封面流程使用隔離 IndexedDB harness，未驗真實 MP3／FLAC／M4A 內嵌封面解析後的自動換色。
- 未以真實 10k 音樂檔量測 CPU、RSS 或 Profiler；本功能架構只分析目前歌曲且快取上限 64。
- 使用者回報 Windows EXE 與 macOS DMG 的新增功能簡單 smoke test 正常；未提供 OS 版本與逐項手順，因此 Windows 完整回歸仍待補。

## 既有環境與發行限制

- `electron:dev` 的 http origin 無法載入 `file://` 音源；dev 播放驗證應使用拖曳 blob，打包版不受此同源限制。
- Apple Developer ID／notarization 與 Windows code signing 尚未設定。
- installer 與大型 AI 模型不進 Git；0.1.52 installer 未上傳 GitHub，只有 source、文件與 checksum 同步 `main`。

English pointer: a simple user EXE/DMG feature smoke test passed; real embedded artwork, rapid packaged GUI switching, full Windows regression, real-library profiling, and signing remain open.
