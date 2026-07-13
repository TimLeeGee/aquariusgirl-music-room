# 已知問題

版本：0.1.51
文件更新：2026-07-14

## 本版待補驗證

- `check:playlist-batch`、`check:import-work-queue`、`check:manual-import-state` 與 deterministic 10k 結果可守住併發、順序、失敗／取消、clear→idle 與 100 commits；尚未以真實 10k 音樂檔量測 CPU、RSS 或 Profiler。
- 打包版 GUI 尚未以真實滑鼠驗證匯入、取消、clear 與 Mini 回歸。
- Windows EXE 僅在 M1 Mac 做 PE32／NSIS 靜態檢查，未做 Windows 真機驗收。

## 既有環境與發行限制

- `electron:dev` 的 http origin 無法載入 `file://` 音源；dev 播放驗證應使用拖曳 blob，打包版不受此同源限制。
- Apple Developer ID／notarization 與 Windows code signing 尚未設定。
- installer 與大型 AI 模型不進 Git；本次 installer 也未上傳 GitHub。

English pointer: packaged GUI import workflows, real Windows QA, real-library profiling, and signing remain open; the dev `file://` limitation is environment-specific.
