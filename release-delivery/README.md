# Aquariusgirl Music Room 交付說明

版本：0.1.49
發行日期：2026-07-10
文件更新：2026-07-10
產品名稱：Aquariusgirl Music Room / 水瓶罐子的音樂小水池

2026-07-10 文件-only 變更：移除 `docs/skills/`（兩份技能快照停在 0.1.32，內容過期且與 `CLAUDE.md`／`AGENTS.md`、`llm-wiki/` 重複）。開發規範以 `CLAUDE.md`／`AGENTS.md`＋`llm-wiki/` 為準，GitHub 發布流程以全域 `github-update-flow` 技能＋`llm-wiki/08-GitHub發布守門員.md` 為準；文件內歷史敘述保留、歷史可從 git 取回。程式與 installer 不受影響。

## 0.1.49 狀態

0.1.49（Mini 切換播放中斷修正＋播放自癒保險＋AI 聊天視窗 UX）installer 已產出並同步到本資料夾 `installers/`（installers/ 只保留這一組最新版）：

- `Aquariusgirl Music Room Setup 0.1.49.exe`：667,675,017 bytes，SHA-256 `7c3708ddba7abb9e81aa934575bf95af7e290b2293e77b8f89589741993cabf6`
- `Aquariusgirl Music Room-0.1.49-arm64.dmg`：684,771,178 bytes，SHA-256 `ee8ef2aeaa88a474fd5dad9986051223c4abfae66a3c6d90c7cb4cdf49f3e27a`
- DMG `hdiutil verify` VALID；掛載讀回 0.1.49／arm64／taglib wasm 存在；EXE PE32 NSIS；打包時 `dist:release` 全部 check 再次通過（DIST_EXIT=0）；未簽章。詳見 `docs/releases/0.1.49-checksums.md`。
- 修正內容：主畫面播放中切 Mini 播放器不再中斷（0.1.48 回歸——`<audio>` 節點被重建；已移回固定位置並加自癒保險：音源遺失自動重掛＋恢復播放位置）；「瀏覽器阻擋播放」誤導訊息改為區分真實原因。AI 助手聊天視窗改版：快捷泡泡固定在聊天視窗頂端、開始對話後自動收合（滑鼠移過去展開）、訊息像真實聊天由下往上出現、聊天視窗加高至 500px。
- 待補：打包版 GUI 實測（切 Mini 續播、泡泡收合、訊息貼底、清單捲動）、Windows 真機；本次已推送 GitHub `main`。

## 最新安裝檔在哪裡

只看這個資料夾：

```text
release-delivery/installers/
```

0.1.49 installer 已同步到這裡：

- `Aquariusgirl Music Room Setup 0.1.49.exe`
- `Aquariusgirl Music Room-0.1.49-arm64.dmg`

0.1.49 SHA-256 已寫入 `docs/releases/0.1.49-checksums.md`。

`release/` 是 electron-builder 暫存輸出；正式整理後不應存在，避免同時出現兩個像最新版的資料夾。

## 交付檔案索引

| 英文檔名 | 中文意思 |
| --- | --- |
| `AGENTS.md` | AI agent 指令 |
| `release-delivery` | 發佈交付 / 版本交付 |
| `INSTALL_UNINSTALL.md` | 安裝與解除安裝說明 |
| `INSTALLER_STATUS.md` | 安裝程式狀態 |
| `installers` | 安裝程式資料夾 |
| `KNOWN_ISSUES.md` | 已知問題 |
| `QA_REPORT.md` | 品質測試報告 / QA 報告 |
| `README.md` | 說明文件 / 專案介紹 |
| `VERSION.md` | 版本資訊 |
| 根目錄 `CHANGELOG.md` | 版本歷史（唯一來源） |

## 這是什麼軟體

Aquariusgirl Music Room 是本地優先音樂播放器。它只播放使用者明確選擇的本機音樂檔，不使用 YouTube、不串流、不下載音樂，也不會自動掃描整台硬碟。

桌面版可內建離線 AI。AI 在本機執行，工具任務只接收最新一句輸入與必要結構化 context；不會上傳音樂檔、路徑、封面圖片、Blob、File 或 ArrayBuffer。

支援格式：mp3、wav、ogg、m4a、flac。

舊版逐版重點已移至根目錄 `CHANGELOG.md`。

## GitHub clone 後缺的大型檔案

公開 repo 不包含大型本機檔案：`resources/ai/models/qwen3.5-0.8b.gguf`、`release-delivery/installers/*.dmg`、`release-delivery/installers/*.exe`。

接手者需要自行放入 GGUF 模型到 `resources/ai/models/qwen3.5-0.8b.gguf`，再執行 `npm run check:ai-assets`。若要重新產出安裝檔，執行 `npm run dist:release`；若使用 GitHub Actions，設定 repository secret `AI_MODEL_URL` 指向可下載的 GGUF 檔。不要把模型、installer、憑證或私鑰 commit 進 Git。

## Windows 如何安裝

1. 取得 `Aquariusgirl Music Room Setup 0.1.49.exe`。
2. 雙擊安裝檔。
3. 依照安裝器指示完成安裝。
4. 從桌面捷徑或開始選單開啟 `Aquariusgirl Music Room`。

如果 Windows Defender 或 SmartScreen 顯示提醒，原因通常是測試版尚未做程式碼簽章。確認來源是自己的建置檔後，可選擇繼續執行。

## macOS 如何安裝

1. 取得 `Aquariusgirl Music Room-0.1.49-arm64.dmg`。
2. 雙擊 `.dmg`。
3. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
4. 從 Applications 開啟。

如果 macOS 顯示「未認證開發者」，原因是目前測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟，或使用右鍵開啟。

## 資料保存

播放清單、收藏、音量、循環、隨機、主題與 metadata 會保存於 localStorage / IndexedDB。音樂檔本體不會被複製進 App，也不會被上傳。

解除安裝 App 不會刪除使用者原始音樂檔。若要清除 App 設定，需另外清除 Electron app userData。

## 交付驗收狀態

0.1.49 已通過：沙盒 `tsc --noEmit`、`electron:compile`、全部 `check:*`；Mac 本機 `npm run dist:release`（DMG `hdiutil verify` VALID＋掛載讀回 0.1.49/arm64/taglib wasm、EXE NSIS static check）。打包版 GUI 實測、Windows 真機、簽章與 notarization 待補。各版驗收全文見 `QA_REPORT.md`。

## English Delivery Notes

Version: 0.1.49
Release date: 2026-07-06
Document update: 2026-07-06
Product: Aquariusgirl Music Room

## Latest Installers

Use only this folder:

```text
release-delivery/installers/
```

0.1.49 installers are produced:

- `Aquariusgirl Music Room Setup 0.1.49.exe`
- `Aquariusgirl Music Room-0.1.49-arm64.dmg`

0.1.49 SHA-256 values are recorded in `docs/releases/0.1.49-checksums.md`.

The temporary `release/` folder should not remain after packaging.

## Delivery File Index

| File or folder | Meaning |
| --- | --- |
| `AGENTS.md` | AI agent instructions |
| `release-delivery` | Release delivery package |
| `INSTALL_UNINSTALL.md` | Install and uninstall guide |
| `INSTALLER_STATUS.md` | Installer status |
| `installers` | Installer folder |
| `KNOWN_ISSUES.md` | Known issues |
| `QA_REPORT.md` | Quality assurance / QA report |
| `README.md` | Documentation / project introduction |
| `VERSION.md` | Version information |
| `CONTINUE_WORK.md` | Follow-up work / continuation notes |

## Product Summary

Aquariusgirl Music Room is a local-first music player. It only plays local music files explicitly selected by the user. It does not use YouTube, streaming services, music downloads, or automatic disk scanning.

The desktop app can bundle offline AI. Tool tasks use only the latest user input and necessary structured context. It does not upload music files, paths, artwork, Blob, File, or ArrayBuffer data.

Supported formats: mp3, wav, ogg, m4a, flac.

Per-version highlights moved to root `CHANGELOG.md`.

## Missing Large Files After Clone

The public repository does not include large local files: `resources/ai/models/qwen3.5-0.8b.gguf`, `release-delivery/installers/*.dmg`, or `release-delivery/installers/*.exe`.

To complete a checkout, place the GGUF model at `resources/ai/models/qwen3.5-0.8b.gguf`, then run `npm run check:ai-assets`. To rebuild installers, run `npm run dist:release`; for GitHub Actions, set the repository secret `AI_MODEL_URL` to a downloadable GGUF file. Do not commit models, installers, certificates, or private keys.

## Windows Install

1. Use `Aquariusgirl Music Room Setup 0.1.49.exe`.
2. Run the installer.
3. Follow the setup wizard.
4. Open `Aquariusgirl Music Room` from the desktop shortcut or Start menu.

SmartScreen warnings are expected for unsigned test builds.

## macOS Install

1. Use `Aquariusgirl Music Room-0.1.49-arm64.dmg`.
2. Open the DMG.
3. Drag the app into Applications.
4. Open the app from Applications.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

## Data Storage

Playlists, liked state, volume, repeat, shuffle, theme settings, and metadata are stored in localStorage / IndexedDB. Music files are not copied into the app and are not uploaded.

Uninstalling the app does not delete the user's original music files.

## Delivery QA Status

0.1.49 passed sandbox `tsc --noEmit`, `electron:compile`, all `check:*`, and local `npm run dist:release` (DMG verify VALID + mounted readback, EXE NSIS static check). Packaged GUI runtime QA, real Windows QA, signing, and notarization remain open. Full per-version evidence: `QA_REPORT.md`.

## 歷史紀錄

2026-07-10 文件制度改革：本檔只描述目前版本現況。舊版逐版紀錄已統一移至根目錄 `CHANGELOG.md`（版本歷史唯一來源）；完整驗收證據見 `QA_REPORT.md`（append-only）；更舊細節可從 git 歷史取回。
(Doc reform 2026-07-10: this file describes the current version only. Per-version history lives in root `CHANGELOG.md`; QA evidence in `QA_REPORT.md`; older details are in git history.)
