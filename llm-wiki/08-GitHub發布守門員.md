# GitHub 發布守門員

#validation

## 目前狀態

0.1.49 的 source、release 文件與 checksum 已於 2026-07-10 推送 GitHub `main`（`f972261`），並以 `origin/main` 讀回確認版本、根目錄文件、`release-delivery` Markdown、checksum 與核心 source。2026-07-10 文件制度改革已推送 `main`（`1af9e47`，遠端讀回 CHANGELOG.md／docs/skills 404／VERSION.md 現況版確認）：版本歷史統一進根目錄 `CHANGELOG.md`，release-delivery 剩 6 份 Markdown（CONTINUE_WORK 副本已刪）且只寫現況。DMG/EXE 仍只在本機交付資料夾，未 commit；它未簽章、未 notarize，且打包 GUI 與 Windows 真機驗證仍待補。

## 發布流程

| 階段 | 必要動作 | 證據 |
| --- | --- | --- |
| 範圍 | git status、branch、近期 log、diff；列清本次檔案 | 工作樹與 stage 清單 |
| 版本同步 | package.json、package-lock、`CHANGELOG.md`（逐版紀錄唯一去處）、README 最新版摘要、AGENTS、CLAUDE、CONTINUE_WORK（僅根目錄一份）、release-delivery 狀態檔改寫現況、QA_REPORT append 證據、release checksum | 搜尋舊版本字串與 diff |
| 程式驗證 | 跑本次改動所需 build、compile、check | 指令結果 |
| 打包 | 只在 app code、資源、版本或設定變動時跑 npm run dist:release | DMG/EXE 與同步結果 |
| 安裝檔 | SHA-256 重新讀回；DMG hdiutil verify 與掛載讀回 | docs/releases/version-checksums.md |
| 提交發布 | 精準 stage、commit、push；不加入 installer/模型/私密資料 | git diff --check、遠端 readback |
| 遠端確認 | fetch，比對 HEAD 與 origin，讀回 package、README、checksum、核心 source | GitHub 或 origin/main 證據 |

## 不可省略

- [ ] 發布前確認使用者明確授權 commit/push/tag/release。
- [ ] 版本更新時依 2026-07-10 文件制度改革：逐版紀錄只寫 `CHANGELOG.md`（最新在上）；README 只更新最新版摘要；release-delivery 狀態檔（README／VERSION／INSTALLER_STATUS／INSTALL_UNINSTALL／KNOWN_ISSUES）改寫成現況、不累積逐版段落；`QA_REPORT.md` append-only；同一段內容不重複貼進多個檔案。
- [ ] `AGENTS.md` 與 `CLAUDE.md` 為雙生檔：規則與「快速接手」狀態必須一致，任一份更新另一份同步改，兩份一起 commit / push；漏任一份即不得宣稱發布完成。
- [ ] 語言涵蓋：中文 canonical；README 英文區同步最新版摘要、CHANGELOG 英文只留歸檔說明、release-delivery 狀態檔留英文指標；本次更新的門面文件不可留舊版英文冒充最新。
- [ ] 不以 macOS static 檢查宣稱 Windows 真機已驗證。
- [ ] 公開 clone 缺少 GGUF 或 installer 時，指明放回位置與驗證指令。

相關頁面：[[06-驗收標準]]、[[09-歷史決策紀錄]]、[[12-來源文件索引]]

返回 [[00-入口索引]]。

## 來源

- 全域 `github-update-flow` 技能（專案內 `docs/skills/` 副本已於 2026-07-10 移除，規則由本頁與 CLAUDE.md／AGENTS.md 承接）
- `release-delivery/README.md`
- `release-delivery/VERSION.md`
- `release-delivery/INSTALLER_STATUS.md`
- `docs/releases/0.1.49-checksums.md`
