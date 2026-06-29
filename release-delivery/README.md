# Aquariusgirl Music Room 交付說明

版本：0.1.18
發行日期：2026-06-29
文件更新：2026-06-29
產品名稱：Aquariusgirl Music Room / 水瓶罐子的音樂小水池

## 最新安裝檔在哪裡

只看這個資料夾：

```text
release-delivery/installers/
```

0.1.18 只保留兩個交付檔：

- `Aquariusgirl Music Room Setup 0.1.18.exe`
- `Aquariusgirl Music Room-0.1.18-arm64.dmg`

`release/` 是 electron-builder 暫存輸出；正式整理後不應存在，避免同時出現兩個像最新版的資料夾。

## 交付檔案索引

| 英文檔名 | 中文意思 |
| --- | --- |
| `release-delivery` | 發佈交付 / 版本交付 |
| `INSTALL_UNINSTALL.md` | 安裝與解除安裝說明 |
| `INSTALLER_STATUS.md` | 安裝程式狀態 |
| `installers` | 安裝程式資料夾 |
| `KNOWN_ISSUES.md` | 已知問題 |
| `QA_REPORT.md` | 品質測試報告 / QA 報告 |
| `README.md` | 說明文件 / 專案介紹 |
| `VERSION.md` | 版本資訊 |
| `CONTINUE_WORK.md` | 後續工作 / 接續開發事項 |

## 這是什麼軟體

Aquariusgirl Music Room 是本地優先音樂播放器。它只播放使用者明確選擇的本機音樂檔，不使用 YouTube、不串流、不下載音樂，也不會自動掃描整台硬碟。

0.1.18 桌面版可內建離線 AI。AI 在本機執行，工具任務只接收最新一句輸入與必要結構化 context；不會上傳音樂檔、路徑、封面圖片、Blob、File 或 ArrayBuffer。

支援格式：mp3、wav、ogg、m4a、flac。

## 0.1.18 重點

- 補強 router JSON schema、Result Guard 與 safe reply fallback。
- 工具任務一律 summary-only，模型不得輸出播放清單歌曲清單或 track title。
- 歌曲列表只能由播放器 UI 根據 `playlist.trackIds` 顯示。
- 三份 prompt 維持開源文字檔，未新增 prompt 檔。

## 0.1.17 重點

- 小模型只負責 intent JSON 與短回覆潤飾。
- 本機搜尋、隨機歌單、建立歌單、加入歌單與移除安全提示由播放器程式執行。
- Prompt 改為三份開源文字檔，不再使用加密 prompt bundle。
- 打包目標收斂為 Windows x64 EXE 與 macOS Apple Silicon DMG。

## 0.1.16 重點

- AI 建歌單只能使用目前已載入 / 已索引的真實歌曲。
- 隨機歌單從真實 tracks 抽樣，找不到歌曲時不建立假歌。
- AI 助手移入右側歌單卡，以「歌單 / AI 助手」分頁切換。
- 先使用 metadata 關鍵字、別名與 mood scoring；未新增 embedding 或向量資料庫。

## Windows 如何安裝

1. 取得 `Aquariusgirl Music Room Setup 0.1.18.exe`。
2. 雙擊安裝檔。
3. 依照安裝器指示完成安裝。
4. 從桌面捷徑或開始選單開啟 `Aquariusgirl Music Room`。

如果 Windows Defender 或 SmartScreen 顯示提醒，原因通常是測試版尚未做程式碼簽章。確認來源是自己的建置檔後，可選擇繼續執行。

## macOS 如何安裝

1. 取得 `Aquariusgirl Music Room-0.1.18-arm64.dmg`。
2. 雙擊 `.dmg`。
3. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
4. 從 Applications 開啟。

如果 macOS 顯示「未認證開發者」，原因是目前測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟，或使用右鍵開啟。

## 資料保存

播放清單、收藏、音量、循環、隨機、主題與 metadata 會保存於 localStorage / IndexedDB。音樂檔本體不會被複製進 App，也不會被上傳。

解除安裝 App 不會刪除使用者原始音樂檔。若要清除 App 設定，需另外清除 Electron app userData。

## 交付驗收狀態

已通過：prompt 檢查、AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、AI assets、build、Electron compile、DMG verify、macOS packaged static checks、Windows EXE static check。

尚未完成：Windows 真機安裝與 AI 操作、Apple Developer ID / notarization、Windows code signing。

---

## English Delivery Notes

Version: 0.1.18
Release date: 2026-06-29
Document update: 2026-06-29
Product: Aquariusgirl Music Room

## Latest Installers

Use only this folder:

```text
release-delivery/installers/
```

0.1.18 ships two installer files:

- `Aquariusgirl Music Room Setup 0.1.18.exe`
- `Aquariusgirl Music Room-0.1.18-arm64.dmg`

The temporary `release/` folder should not remain after packaging.

## Delivery File Index

| File or folder | Meaning |
| --- | --- |
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

The 0.1.18 desktop app can bundle offline AI. Tool tasks use only the latest user input and necessary structured context. It does not upload music files, paths, artwork, Blob, File, or ArrayBuffer data.

Supported formats: mp3, wav, ogg, m4a, flac.

## 0.1.18 Highlights

- Strengthens router JSON schema validation, Result Guard, and safe reply fallback.
- Tool tasks are summary-only; the model may not output playlist song lists or track titles.
- Song lists are rendered only by the player UI from `playlist.trackIds`.
- The project still uses only three open prompt text files.

## 0.1.17 Highlights

- The small model only routes intent JSON and polishes short replies.
- Local search, random playlists, playlist creation, playlist insertion, and safe removal guidance are handled by app code.
- Prompts are now three open text files instead of an encrypted prompt bundle.
- Packaging targets are Windows x64 EXE and macOS Apple Silicon DMG.

## 0.1.16 Highlights

- AI playlist creation can only use real loaded or indexed local tracks.
- Random playlists sample from real tracks; missing matches do not create fake songs.
- The AI assistant moved into the playlist card as a `Playlists / AI Assistant` tab.
- Metadata keyword, alias, and mood scoring are used first; no embedding or vector database was added.

## Windows Install

1. Use `Aquariusgirl Music Room Setup 0.1.18.exe`.
2. Run the installer.
3. Follow the setup wizard.
4. Open `Aquariusgirl Music Room` from the desktop shortcut or Start menu.

SmartScreen warnings are expected for unsigned test builds.

## macOS Install

1. Use `Aquariusgirl Music Room-0.1.18-arm64.dmg`.
2. Open the DMG.
3. Drag the app into Applications.
4. Open the app from Applications.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

## Data Storage

Playlists, liked state, volume, repeat, shuffle, theme settings, and metadata are stored in localStorage / IndexedDB. Music files are not copied into the app and are not uploaded.

Uninstalling the app does not delete the user's original music files.

## Delivery QA Status

Passed: prompt checks, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, AI assets, build, Electron compile, DMG verify, macOS packaged static checks, and Windows EXE static check.

Still open: Windows real-machine install and AI operation, Apple Developer ID / notarization, and Windows code signing.
