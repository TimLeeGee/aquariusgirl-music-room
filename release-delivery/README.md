# Aquariusgirl Music Room 本機交付

版本：0.1.51
日期：2026-07-14
平台：macOS arm64、Windows x64

## 目前狀態

0.1.51 已完成本機打包與文件交付，source 與文件已同步 GitHub `main`。播放清單批次處理為 O(P+N)；手動匯入採 Electron 最多 4 個、Web 最多 2 個同時工作，metadata UI／DB 最多約 100 批，並具備進度、合作式取消與 clear/unmount discard。Mini、audioElement 位置、播放及歌曲資訊保存鏈不變。

最新版 installer 僅在 `release-delivery/installers/`：

- `Aquariusgirl Music Room Setup 0.1.51.exe`：667,677,087 bytes；SHA-256 `8be258fc2e87008395956992531be699c177783167673bb487169cc4b4ece2a7`
- `Aquariusgirl Music Room-0.1.51-arm64.dmg`：684,795,800 bytes；SHA-256 `ff4bcc2ff3d04385c8621e31debf2585a59dbd812710ffa3a129aa37400f6f76`

`npm run dist:release` exit 0；DMG verify VALID、唯讀掛載讀回 0.1.51／arm64／TagLib wasm／AI 模型與 runtime；EXE 為 PE32 GUI、Nullsoft NSIS static PASS。完整 checksum 與限制見 `docs/releases/0.1.51-checksums.md`，逐版歷史見根目錄 `CHANGELOG.md`，驗收證據見 `QA_REPORT.md`。

## 交付限制

- 使用者回報 DMG 手動測試目前未發現問題；未列明逐項手順，因此匯入、取消、clear 或 Mini 仍無逐項證據。
- 未做 Windows 真機驗收。
- 未以真實 10k 音樂檔量測 CPU、RSS 或 Profiler；只有 deterministic 10k queue／commit check。
- macOS Developer ID／notarization 與 Windows code signing 尚未設定。
- installer 只留本機、不進 Git；未建立 tag、PR、GitHub Release 或上傳 installer。

English pointer: version 0.1.51 source and docs are on GitHub main; installers remain local. The user reported no issue in a general DMG manual test, while scenario-level GUI evidence, real Windows QA, real-library profiling, signing, and notarization remain open.
