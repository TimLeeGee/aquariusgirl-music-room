# 版本資訊

產品：Aquariusgirl Music Room / 水瓶罐子的音樂小水池
版本：0.1.52
日期：2026-07-16
平台目標：Windows x64、macOS arm64

## 本版內容

外觀設定「色彩」新增預設關閉、可保存的「依封面自動換色」。只在目前歌曲有真實封面時，以 transient effective hue 同步 primary／mini；不覆寫使用者手動色，不改文字與透明度。48×48 Canvas 色相量化、64-entry LRU、stale request guard 與 450ms transition 保持切歌平順且不掃描曲庫。

`check:cover-colors` 與強化後的 `check:theme-colors` 已納入 `dist:release`、`dist:mac`、`dist:win`。installer、checksum 與驗證結果見 `docs/releases/0.1.52-checksums.md`；完整版本歷史只在根目錄 `CHANGELOG.md`。

使用者回報 EXE／DMG 的新增功能簡單測試正常，但未提供逐項手順；source、文件與 checksum 已同步 GitHub `main`，installer 仍只留本機。

English pointer: 0.1.52 adds transient, persisted-opt-in cover colors without overwriting saved manual theme values; release evidence is in the checksum and QA documents.
