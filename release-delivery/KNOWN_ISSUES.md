# 已知問題

版本：0.1.18
文件更新：2026-06-29

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

Version: 0.1.18
Document update: 2026-06-29

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
