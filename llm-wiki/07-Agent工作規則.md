# Agent 工作規則

#project

## 開工流程

1. 從 [[00-入口索引]] 進入，讀 [[01-專案總覽]]、[[02-目前功能清單]]、[[05-禁止事項]]、[[06-驗收標準]]。
2. 依任務追讀規格、問題、決策與來源；先回報理解、範圍和驗收。
3. 避免覆蓋現有工作樹變更，採取最小必要修改。
4. 任何程式、設定、文件、驗收或發佈變更完成後，必須先維護受影響的 Wiki 頁與 [[99-更新日誌]]，再回報、提交或發布；不可例外。

## 程式修改核准閘門

程式碼尚未修改前，必須完成：

- [ ] 相關唯讀專家提出有證據的計畫或根因。
- [ ] test-checker 定義驗收清單與必要證據。
- [ ] 主代理向使用者呈現計畫與驗收。
- [ ] 使用者在本次對話明確說出 可以修改。
- [ ] 只由 code-surgeon 做核准的最小程式碼修改。
- [ ] 實際可行時由 test-checker 獨立回報修改後 pass/fail 證據。

## 角色派工

| 情境 | 必要角色 |
| --- | --- |
| 陌生 repo 或可能大幅變更 | context-mapper |
| 新功能、架構、流程、需求不清 | feature-planner |
| bug、回歸、測試失敗、儲存/載入/快取/時序問題 | bug-hunter |
| UI、CSS、滾動、版面、響應式問題 | ui-reviewer |
| 驗收、測試、check 或 build 解讀 | test-checker |
| 版本、release note、installer、hash、發布 | release-guardian |

## 多 Agent 推送協調

Codex 與 Claude 可能在同一天各自準備推送（2026-07-10 曾發生 0.1.49 撞車）。`git push` 被拒（fetch first）時：

1. 不硬 rebase、不 force push、不盲目 pull merge。
2. 先 `git fetch origin`，比對 `HEAD` 與 `origin/main` 的 commit 與逐檔差異，確認 source 是否相同、哪邊文件較新。
3. 若遠端已涵蓋本地 commit 內容，以 `origin/main` 為基底重放本地獨有的檔案（例如經 gitignore 目錄暫存 payload），再 commit 補推。
4. push 後一律讀回 `origin/main` 驗證。

## 文件與 Wiki 例外

純 Wiki 建立或文件盤點不得改產品程式、設定或資料。它仍需保留來源與 git diff 證據，但不適用程式碼修改的 可以修改 閘門。

相關頁面：[[05-禁止事項]]、[[06-驗收標準]]、[[08-GitHub發布守門員]]、[[12-來源文件索引]]

返回 [[00-入口索引]]。

## 來源

- `AGENTS.md`
