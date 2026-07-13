# 版本資訊

產品：Aquariusgirl Music Room / 水瓶罐子的音樂小水池
版本：0.1.51
日期：2026-07-14
平台目標：Windows x64、macOS arm64

## 本版內容

大曲庫歌單批次改為 O(P+N)。手動匯入採兩端最小工作佇列：Electron 同時最多 4 個、Web 最多 2 個，metadata UI／DB 寫入最多約 100 批；進度、合作式取消及 clear/unmount discard 均受測試守住。Mini、`audioElement` reconcile 位置、播放與歌曲資訊保存鏈維持不變。

`check:playlist-batch`、`check:import-work-queue`、`check:manual-import-state` 已納入 `dist:release`、`dist:mac`、`dist:win`。installer、checksum 與驗證結果見 `docs/releases/0.1.51-checksums.md`；完整版本歷史只在根目錄 `CHANGELOG.md`。

English pointer: 0.1.51 bounds playlist/import work and metadata commits while preserving audio and save paths; release evidence is in the checksum and QA documents.
