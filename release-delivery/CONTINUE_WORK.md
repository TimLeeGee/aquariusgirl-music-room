# 接續工作狀態

最後更新：2026-06-29 CST

## 2026-06-29 GitHub main 合併 0.1.17 完成

- 已合併 `codex/ai-harness-0.1.17` 到 `main`，使 GitHub main source、`package.json`、AI harness、prompt、runtime checks 與 workflow 更新到 0.1.17。
- README 與 release-delivery 文件衝突已保留 main 較新的中英版本。
- 已完成合併後驗收：prompt / AI assets / AI track search / playlist / Mini / FLAC / custom images / theme colors / build / Electron compile 均通過。
- 大模型與 installers 仍不進 Git；若之後 source、資源、版本或打包設定再改，才重新驗收並重打 installer。

## 2026-06-29 GitHub main 0.1.17 Merge Complete

- Merged `codex/ai-harness-0.1.17` into `main`, updating GitHub main source, `package.json`, AI harness, prompts, runtime checks, and workflow to 0.1.17.
- README and release-delivery conflicts were resolved by keeping the newer bilingual main docs.
- Post-merge validation passed for prompts, AI assets, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, build, and Electron compile.
- The large model and installers remain out of Git. Rebuild installers only if source, resources, version, or packaging settings change again.

## 2026-06-29 GitHub main 內容盤點（合併前記錄）

- 根 `CONTINUE_WORK.md` 已補上 2026-06-29 GitHub 內容盤點，標明合併前 `main` 程式碼是 0.1.15，而 0.1.17 程式變更位於 `codex/ai-harness-0.1.17`。
- 後續已合併 `codex/ai-harness-0.1.17` 到 `main`，並保留 `main` 較新的 README / release-delivery 文件。
- 本次只更新文件，不重打 installer；若合併後 source、資源、版本或打包設定與既有 installer 不一致，才重新驗收與打包。

## 2026-06-29 GitHub main Content Audit (Pre-Merge Record)

- Root `CONTINUE_WORK.md` records the pre-merge GitHub content audit: `main` source was still at 0.1.15, while 0.1.17 source changes were on `codex/ai-harness-0.1.17`.
- `codex/ai-harness-0.1.17` has since been merged into `main` while keeping the newer README / release-delivery docs from `main`.
- This pass only updates docs and does not rebuild installers. Rebuild only if the later source/resource/version/packaging merge makes the existing installers stale.

## 0.1.17 AI harness、開源 prompt 與雙平台發行完成

- 版本更新為 0.1.17；小模型只做 intent JSON 與短回覆潤飾，本機搜尋、隨機歌單、建立歌單、加入歌單與移除安全提示由播放器程式執行。
- Prompt 改為三份開源文字檔：`character_prompt.txt`、`ai_router_prompt.txt`、`ai_reply_prompt.txt`；不再使用 secure prompt service、加密 prompt bundle 或 `.bin` prompt。
- 打包目標收斂為 Windows x64 NSIS EXE 與 macOS Apple Silicon DMG；0.1.17 不再產 macOS x64 DMG。
- 已通過 `check:prompts`、AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、all-target AI assets、build、Electron compile。
- 一般沙盒 `npm run dist:release` 在 macOS `hdiutil create` 失敗；升權重跑同一命令後成功，並同步兩個 installer 到 `release-delivery/installers/`。
- DMG verify VALID；唯讀掛載後版本為 0.1.17、Mach-O arm64、只保留 `darwin-arm64/llama-server`、三份 prompt `.txt`，無 prompt `.bin`。
- Windows EXE 只做 NSIS / x64 static check，尚未 Windows 真機安裝。

## 0.1.16 AI 播放清單真實歌曲與歌單區分頁完成

- AI 建歌單只能使用目前已載入 / 已索引的真實本機歌曲，不讓模型幻想歌曲、歌手或路徑。
- 隨機需求從目前 tracks 抽樣；關鍵字需求先查 title、artist、album、genre、filename/name，並支援別名與 mood scoring。
- 找不到歌曲時回覆找不到，不建立空歌單或假歌單。
- AI 助手移入右側歌單卡，以「歌單 / AI 助手」分頁切換；未新增 embedding 或向量資料庫。
- 版本來源同步問題已納入驗收：package、lock、export payload、packaged app、installer SHA 與 release 文件都要一致。

## 最新 installer

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.17.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.17-arm64.dmg
```

修改時間：2026-06-28 23:44:38 CST

## SHA-256

- EXE：`b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- arm64 DMG：`c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

## 仍需人工驗收

- 在 Windows 真機安裝 0.1.17 EXE，確認 fresh install、啟動、選擇本機音樂資料夾、AI 聊天與 AI 建歌單。
- 在 Windows 真機確認歌單 / AI 助手分頁、Mini、dialog focus、播放清單新增 / 加入 / 移除流程。
- 正式公開前補 Apple Developer ID、notarization 與 Windows code signing。
- 若 0.1.17 source / resource / version / packaging 之後再改，必須重跑 `npm run dist:release` 並重算 SHA。

## 下次接續提示詞

請接續 Aquariusgirl Music Room 0.1.17 的 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，包含 `Aquariusgirl Music Room Setup 0.1.17.exe` 與 `Aquariusgirl Music Room-0.1.17-arm64.dmg`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md` 與 `release-delivery/KNOWN_ISSUES.md`；Windows 先安裝 EXE，確認 fresh install、選擇音樂資料夾、AI 聊天、AI 隨機歌單、關鍵字歌單、找不到不補歌、歌單 / AI 助手分頁、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。

---

# Continuation Status

Last updated: 2026-06-29 CST

## 0.1.17 AI Harness, Open Prompts, and Two-Platform Release Complete

- Version 0.1.17 is complete. The small model only routes intent JSON and polishes short replies; app code handles local search, random playlists, playlist creation, playlist insertion, and safe removal guidance.
- Prompts are now three open text files: `character_prompt.txt`, `ai_router_prompt.txt`, and `ai_reply_prompt.txt`. Secure prompt service, encrypted prompt bundles, and prompt `.bin` files were removed.
- Release targets are Windows x64 NSIS EXE and macOS Apple Silicon DMG. 0.1.17 no longer builds a macOS x64 DMG.
- Passed checks: `check:prompts`, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, all-target AI assets, build, and Electron compile.
- Plain sandbox packaging failed at macOS `hdiutil create`; rerunning the same `npm run dist:release` command with elevated permission succeeded.
- DMG verify is VALID. Read-only mount confirmed version 0.1.17, Mach-O arm64, only `darwin-arm64/llama-server`, three prompt `.txt` files, and no prompt `.bin`.
- Windows EXE has only NSIS / x64 static checks; real Windows installation is still open.

## 0.1.16 AI Playlists and Playlist-Card Tabs Complete

- AI playlist creation only uses real loaded or indexed local tracks. The model may not invent songs, artists, or paths.
- Random requests sample from current tracks. Keyword requests search title, artist, album, genre, filename/name, aliases, and mood terms.
- Missing matches report no match instead of creating empty or fake playlists.
- The AI assistant moved into the playlist card as `Playlists / AI Assistant` tabs. No embedding model or vector database was added.
- Version-source synchronization is now part of validation: package, lockfile, export payload, packaged app, installer SHA, and release docs must agree.

## Latest Installers

```text
release-delivery/installers/Aquariusgirl Music Room Setup 0.1.17.exe
release-delivery/installers/Aquariusgirl Music Room-0.1.17-arm64.dmg
```

Modified: 2026-06-28 23:44:38 CST

## SHA-256

- EXE: `b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- arm64 DMG: `c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

## Manual QA Still Needed

- Install the 0.1.17 EXE on a real Windows machine and verify fresh install, launch, local music folder selection, AI chat, and AI playlist creation.
- On Windows, verify playlist / AI Assistant tabs, Mini, dialog focus, playlist creation, playlist insertion, and playlist removal.
- Add Apple Developer ID, notarization, and Windows code signing before public release.
- If 0.1.17 source, resources, version, or packaging settings change again, rerun `npm run dist:release` and recalculate SHA hashes.

## Next Continuation Prompt

Continue Windows real-machine QA for Aquariusgirl Music Room 0.1.17. The latest installers are in `release-delivery/installers/`: `Aquariusgirl Music Room Setup 0.1.17.exe` and `Aquariusgirl Music Room-0.1.17-arm64.dmg`. First read `release-delivery/QA_REPORT.md`, `release-delivery/INSTALLER_STATUS.md`, and `release-delivery/KNOWN_ISSUES.md`. On Windows, install the EXE and verify fresh install, music folder selection, AI chat, AI random playlist, keyword playlist, no fake songs on no match, playlist / AI Assistant tabs, Mini, and dialog focus. Do not modify installers unless source, resources, version, or packaging settings actually change.
