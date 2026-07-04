# 已知問題

版本：0.1.28
文件更新：2026-07-04

## 0.1.28 仍需人工驗收

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.28.exe` 驗證 fresh install、啟動、播放含大型封面的歌曲不卡、連續更換同一首封面 5 次不卡、播放清單歌曲資訊寫回後強制重開仍顯示最新 metadata / cover、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- 本輪新增的 `check:cover-update-five-times`、`check:playlist-song-info-restart` 等是 source-level regression guard，不是完整 packaged GUI 壓力測試。
- macOS packaged GUI 滑鼠流程仍需用暫存音樂複本與隔離 profile 補驗，不可打開或修改使用者原始 Music 資料夾。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期；macOS DMG 未做 Apple Developer ID 簽章與 notarization。
- 0.1.28 修正的是 metadata 保存迴圈與全庫重寫；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.28 不拆封面到獨立 object store；這次先停止全庫保存與播放中重寫 coverDataUrl。若未來上萬首壓力測試仍不足，再另開縮圖 / cover store 設計。
- 0.1.28 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.27 仍需人工驗收

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.27.exe` 驗證 fresh install、啟動、第一次歌曲資訊 / 封面寫回後第二次寫回仍可按「套用到原始檔」、重開後封面不回舊圖、播放中改封面後切歌再切回不卡、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- 本輪尚未執行 packaged macOS GUI 滑鼠流程；下一輪需用暫存音樂複本與隔離 profile 驗證第二次寫回、重開封面、播放清單與播放中不卡。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.27 修正的是歌曲資訊面板二次寫回狀態機與格式防線；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.27 不會在每次歌曲資訊更新後清空整個音樂資料庫；若未來要做大規模索引或縮圖快取，需要另開效能設計，不應混進這個 hotfix。
- 0.1.27 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.26 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.26.exe` 驗證 fresh install、啟動、播放中更換封面後切歌再切回不卡、cover02 -> cover01 第一次重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- packaged macOS 隔離驗收已補做：0.1.26 DMG app 使用隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本；Plazma 播放中 Cover 02 -> Cover 01 套用到原始檔成功，切歌再切回不卡，重開同 profile 後播放清單仍保留 Plazma。
- macOS native dialog 選取 `/private/tmp` 暫存路徑時使用本機 harness，原因是隱藏路徑與無輔助使用權限；這是驗收操作限制，不是 app 功能結論。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.26 修正的是原始檔寫回後的單曲 metadata snapshot 保存競賽；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.26 不會在每次歌曲資訊更新後清空整個音樂資料庫；若未來要做大規模索引或縮圖快取，需要另開效能設計，不應混進這個 hotfix。
- 0.1.26 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.25 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.25.exe` 驗證 fresh install、啟動、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify；本輪 `hdiutil attach` / `imageinfo` 因裝置權限與用量限制未完成，不能宣稱 DMG 唯讀掛載版本 / arm64 / app.asar 讀回 PASS。
- Codex 沙盒拒絕直接啟動 Electron GUI，因此本輪未完成滑鼠實際流程驗收；需要下一輪由已開啟 App 或使用者手動配合驗。
- macOS DMG 未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.25 修正的是同來源 audio reload 殘留；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.25 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。
- 0.1.25 lesson 尚未寫入已安裝 `build-music-player` 技能，原因是 `~/.codex/skills` 寫入被用量限制擋住；下一輪需補記。

## 0.1.24 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.24.exe` 驗證 fresh install、啟動、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.24 修正的是 metadata/cover-only audio reload 與 IndexedDB 保存順序；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.24 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.23 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.23.exe` 驗證 fresh install、啟動、歌手欄位不再在「米津玄師」與「未知歌手」之間跳動、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、封面 cover02 -> cover01、改封面後重開播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.23 修正的是 stored metadata 弱資料覆蓋強資料；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.23 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.22 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.22.exe` 驗證 fresh install、啟動、`Cover 02.jpg` 改回 `Cover 01.jpg`、大於 3 MB 且小於 5 MB 的 JPG 封面預覽 / 寫回、超過 5 MB 的圖片會明確提示過大、播放/暫停連點、約 4 GB / 20+ 首音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 封面上限目前為 5 MB；這是為了支援真實專輯封面並避免過大圖片拖慢 M1 MacBook Air 8GB。若未來確定需要更大封面，再評估壓縮或縮圖流程。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.22 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.21 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.21.exe` 驗證 fresh install、啟動、播放/暫停連點、畫面不閃爍、歌曲第一行檔名第二行歌手、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、99 首以上曲庫啟動體感、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、封面 cover02 -> cover01 實機寫回、改封面後重開播放清單不掉歌、AI 聊天與 AI 建歌單等待狀態。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 啟動 auto-restore 先用 IndexedDB metadata 快速還原，若使用者在播放器外修改原始檔 tag，需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.21 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。
- 上萬首曲庫需求目前以避免啟動逐首重讀 metadata 的架構先處理，尚未以真實上萬首資料夾做 GUI 壓力測試。

## 0.1.20 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.20.exe` 驗證 fresh install、啟動、播放/暫停連點、畫面不閃爍、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify；但本輪 DMG 唯讀掛載版本 / arm64 架構讀回因使用限制未完成，且未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.20 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.19 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.19.exe` 驗證 fresh install、啟動、選擇約 4 GB / 20+ 首音樂資料夾、播放、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、版本、arm64 架構、prompt、runtime 與 packaged `taglib-wasm` static checks；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不再提供「保存到播放器」作為替代保存路徑。
- 大型資料夾閃退已以「不傳整個音檔進 IPC」修正，但仍需在 Windows 真機用使用者同級資料夾驗收。
- 0.1.19 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.18 仍需人工驗收

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.18.exe` 驗證 fresh install、啟動、選擇音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、版本、arm64 架構、prompt 與 runtime static checks；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.18 內建模型與 llama.cpp runtime，因此 installer 體積明顯大於純播放器版本。

## 0.1.16 已知限制

- AI 播放清單搜尋使用 metadata 關鍵字、別名與 mood scoring；未加入 embedding 或向量資料庫。
- 若使用者曲庫 metadata 不完整，AI 搜尋可能找不到歌；設計上會回覆找不到，不建立假歌。
- Windows 真機的 AI 建歌單、右側歌單 / AI 助手分頁與焦點行為仍需人工驗收。

## 正式發行限制

- 未設定 Apple Developer ID / notarization。
- 未設定 Windows code signing。
- 未建立公開 Release artifact 流程給大型 installer；Git repository 不直接追蹤 DMG / EXE。

---

## Known Issues

Version: 0.1.28
Document update: 2026-07-04

## 0.1.28 Manual QA Still Needed

- `Aquariusgirl Music Room Setup 0.1.28.exe` has not been installed on a real Windows machine for fresh install, launch, large-cover playback, five repeated cover updates, playlist song-info restart persistence, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- The new cover-update and playlist-restart checks are source-level regression guards, not full packaged GUI stress tests.
- Packaged macOS GUI stress QA still needs a temp music copy and isolated profile.
- The Windows EXE is unsigned, so SmartScreen warnings are expected. Developer ID signing and notarization are not configured for macOS.
- 0.1.28 fixes the metadata save loop and full-library rewrite path. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.28 does not split artwork into a separate object store; that should be a separate design only if large-library stress tests still show a need.
- 0.1.28 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.27 Manual QA Still Needed

- `Aquariusgirl Music Room Setup 0.1.27.exe` has not been installed on a real Windows machine for fresh install, launch, second song-info / cover writeback after an earlier successful writeback, first-restart cover persistence, playback after changing cover art while playing, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- Packaged macOS GUI mouse QA was not completed in this round. The next pass must use a temp music copy and isolated profile to verify second writeback, restart cover persistence, playlist retention, and no playback stall while editing metadata / cover.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.27 fixes the song-info panel second-writeback state machine and writeback format guard. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.27 does not clear the whole music database after every song-info edit. Large-scale indexing or thumbnail caching should be designed separately if truly needed.
- 0.1.27 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.26 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.26.exe` has not been installed on a real Windows machine for fresh install, launch, playback after changing cover art while playing, cover02 -> cover01 first-restart persistence, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- Packaged macOS isolated QA was completed: the 0.1.26 DMG app used an isolated profile and only loaded the temp copy at `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test`; Plazma Cover 02 -> Cover 01 original-file writeback passed while playing, switching away and back did not stall, and the playlist still kept Plazma after restart.
- Native macOS dialog selection for hidden `/private/tmp` paths used a local harness because accessibility permission was unavailable. This is a QA operation limitation, not an app behavior conclusion.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.26 fixes the edited-track metadata snapshot save race after original-file writeback. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.26 does not clear the whole music database after every song-info edit. Large-scale indexing or thumbnail caching should be designed separately if truly needed.
- 0.1.26 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.25 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.25.exe` has not been installed on a real Windows machine for fresh install, launch, playback after changing cover art while playing, cover02 -> cover01 persistence after restart, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify. `hdiutil attach` / `imageinfo` were blocked by device permission and usage limits, so read-only DMG version / arm64 / app.asar readback is not marked PASS.
- The Codex sandbox rejected direct Electron GUI launch, so mouse-driven GUI validation was not completed this round.
- Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.25 fixes the same-source audio reload residue. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.25 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.
- The installed `build-music-player` skill still needs the 0.1.25 lesson update because `~/.codex/skills` writes were blocked by the usage limit.

## 0.1.24 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.24.exe` has not been installed on a real Windows machine for fresh install, launch, playback after changing cover art while playing, cover02 -> cover01 persistence after restart, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.24 fixes metadata/cover-only audio reload and IndexedDB save ordering. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.24 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.23 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.23.exe` has not been installed on a real Windows machine for fresh install, launch, no artist flicker between real artist text and `未知歌手`, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, cover02 -> cover01 writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.23 fixes weak stored metadata overwriting stronger current metadata. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.23 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.22 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.22.exe` has not been installed on a real Windows machine for fresh install, launch, `Cover 02.jpg` -> `Cover 01.jpg` writeback, >3 MB and <=5 MB JPG preview/writeback, >5 MB too-large messaging, playback/pause click testing, a roughly 4 GB / 20+ song folder, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- The cover limit is currently 5 MB to support real album art while avoiding oversized images on the M1 MacBook Air 8GB. Add compression/thumbnailing only if larger covers become a real need.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.22 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.21 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.21.exe` has not been installed on a real Windows machine for fresh install, launch, play/pause click testing, no flashing playback state, filename-first display with artist on the second line, latest-folder restore after restart, a roughly 4 GB / 20+ song folder, 99+ track startup feel, song info editing, MP3/FLAC/M4A original-file writeback, cover02 -> cover01 writeback, playlist persistence after cover changes, AI chat, and AI playlist busy-state UX.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- Startup auto-restore uses IndexedDB metadata first. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.21 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.
- The ten-thousand-track goal was addressed by skipping per-file metadata reads during startup restore, but a real 10k-track GUI stress test has not been completed.

## 0.1.20 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.20.exe` has not been installed on a real Windows machine for fresh install, launch, play/pause click testing, no flashing playback state, latest-folder restore after restart, a roughly 4 GB / 20+ song folder, song info editing, MP3/FLAC/M4A original-file writeback, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify, but DMG read-only mount version / arm64 architecture readback was blocked by usage limits this round. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.20 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.19 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.19.exe` has not been installed on a real Windows machine for fresh install, launch, selecting a roughly 4 GB / 20+ song folder, playback, song info editing, MP3/FLAC/M4A original-file writeback, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify, version, arm64 architecture, prompt, runtime, and packaged `taglib-wasm` static checks, but Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is no longer offered as a fallback save path.
- The large-folder crash path was addressed by avoiding whole-audio IPC transfer, but it still needs real Windows QA with a user-scale folder.
- 0.1.19 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.18 Manual QA Still Needed

- `Aquariusgirl Music Room Setup 0.1.18.exe` has not been installed on a real Windows machine for fresh install, launch, folder selection, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify, version, arm64 architecture, prompt, and runtime static checks, but Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.18 bundles the model and llama.cpp runtime, so installers are much larger than player-only builds.

## 0.1.16 Known Limits

- AI playlist search uses metadata keywords, aliases, and mood scoring. No embedding model or vector database was added.
- If the user's library metadata is incomplete, AI search may find no matches. This is intentional; the app should report no match instead of inventing songs.
- Real Windows QA is still needed for AI playlist creation, the playlist / AI Assistant tabs, and focus behavior.

## Release Limits

- Apple Developer ID / notarization is not configured.
- Windows code signing is not configured.
- Large installers are not tracked in Git; they should be delivered through local delivery or release artifacts.
