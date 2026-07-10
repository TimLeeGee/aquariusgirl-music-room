# GitHub 發布守門員

#validation

## 目前狀態

0.1.49 的 source、release 文件與 checksum 已於 2026-07-10 推送 GitHub `main`（`f972261`），並以 `origin/main` 讀回確認版本、根目錄三份文件、七份 `release-delivery` Markdown、checksum 與核心 source。DMG/EXE 仍只在本機交付資料夾，未 commit；它未簽章、未 notarize，且打包 GUI 與 Windows 真機驗證仍待補。

## 發布流程

| 階段 | 必要動作 | 證據 |
| --- | --- | --- |
| 範圍 | git status、branch、近期 log、diff；列清本次檔案 | 工作樹與 stage 清單 |
| 版本同步 | package.json、package-lock、README、AGENTS、CLAUDE、CONTINUE_WORK、7 份 release-delivery Markdown、release checksum | 搜尋舊版本字串與 diff |
| 程式驗證 | 跑本次改動所需 build、compile、check | 指令結果 |
| 打包 | 只在 app code、資源、版本或設定變動時跑 npm run dist:release | DMG/EXE 與同步結果 |
| 安裝檔 | SHA-256 重新讀回；DMG hdiutil verify 與掛載讀回 | docs/releases/version-checksums.md |
| 提交發布 | 精準 stage、commit、push；不加入 installer/模型/私密資料 | git diff --check、遠端 readback |
| 遠端確認 | fetch，比對 HEAD 與 origin，讀回 package、README、checksum、核心 source | GitHub 或 origin/main 證據 |

## 不可省略

- [ ] 發布前確認使用者明確授權 commit/push/tag/release。
- [ ] 版本更新時，根目錄與所有 7 份 release-delivery Markdown 全部同步，保留舊歷史。
- [ ] `AGENTS.md` 與 `CLAUDE.md` 為雙生檔：規則與「快速接手」狀態必須一致，任一份更新另一份同步改，兩份一起 commit / push；漏任一份即不得宣稱發布完成。
- [ ] 不以 macOS static 檢查宣稱 Windows 真機已驗證。
- [ ] 公開 clone 缺少 GGUF 或 installer 時，指明放回位置與驗證指令。

相關頁面：[[06-驗收標準]]、[[09-歷史決策紀錄]]、[[12-來源文件索引]]

返回 [[00-入口索引]]。

## 來源

- `docs/skills/github-update-flow.md`
- `release-delivery/README.md`
- `release-delivery/VERSION.md`
- `release-delivery/INSTALLER_STATUS.md`
- `docs/releases/0.1.49-checksums.md`
