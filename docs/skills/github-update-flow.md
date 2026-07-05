# GitHub 更新流程技能

## 1. 目的

這份流程只負責 GitHub 上傳、同步、版本發布、release notes、打包檔雜湊與讀回確認，不負責播放器功能設計、UI 修正、metadata / cover 資料流或 Electron 功能實作。

它用來避免只改文件卻漏掉 source code、版本號、打包檔或驗收結果。播放器開發規範請使用 `docs/skills/aquariusgirl-music-room-development.md`。

## 2. 更新前檢查

- 執行 `git status -sb`，工作樹必須乾淨，或清楚列出哪些檔案屬於本次 commit。
- 執行 `git branch -vv`，確認目前 branch 與 upstream。
- 執行 `git log --oneline -n 10`，確認最近提交脈絡。
- 執行 `git diff --name-only`，確認是否已有上一輪殘留變更。
- 確認本次版本號與修改項目。
- 確認沒有未保存檔案。
- 確認是否有未 stage 檔案、已 stage 但尚未提交的檔案、或尚未 push 的 commit。
- 確認 installer、`release/`、`dist/`、`dist-electron/`、`node_modules/`、大型模型與 build cache 不會被 commit。
- 若要發布到 GitHub，先 `git fetch origin main` 並比較 `HEAD...origin/main`。
- 若上一輪因用量限制或權限中斷，接續時必須先重跑 `git status`、`git diff` 與 `git diff --name-only`，再決定本輪 stage 清單。

## 3. 程式碼檢查

若專案有提供才執行：

- `npm install`，只有新增或更新套件時才跑。
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run electron:compile`
- `npm run check:metadata-save-loop`
- `npm run check:no-track-save-loop`
- `npm run check:no-full-db-save-on-playback`
- `npm run check:no-full-db-rewrite-on-playback`
- `npm run check:no-audio-load-on-cover-only-update`
- `npm run check:no-audio-reload-on-metadata-only-update`
- `npm run check:cover-update-five-times`
- `npm run check:playlist-song-info-restart`
- `npm run check:restart-playlist-uses-latest-song-info`
- `npm run check:track-list-virtualization`
- `npm run check:playback-restore`

若其中某個 script 不存在，不要新增空殼指令；記錄「專案未提供」即可。

## 4. 版本號同步

每次版本更新至少檢查：

- `package.json`
- `package-lock.json`
- `README.md`
- `CHANGELOG.md`，若存在
- `docs/releases/*`
- `release-delivery/*.md`
- Electron build 設定與 packaged `app.asar`
- app 內顯示版本號或設定匯出常數，例如 `src/utils/exportSettings.ts`
- Git tag，若本輪要打 tag
- GitHub Release title，若本輪建立 release
- 若版本號更新，`package-lock.json` 必須同步；不可只改 `package.json`。
- 若本輪建立 release，建立 Git tag；若不建立 tag，回報中必須明確說明原因。

## 5. README 整理規則

README 只放：

- 專案簡介
- 主要功能
- 安裝方式
- 最新版本簡短說明
- GitHub Releases 連結
- checksums 文件連結
- 開發與建置基本指令

README 不放：

- 過長 hash
- 過長版本歷史
- 過長技術驗收細節
- 大量 installer 清單

這些內容移到：

- `docs/releases/`
- `docs/checksums/`
- `CHANGELOG.md`
- `release-delivery/`

## 6. 雜湊與安裝檔保存規則

- EXE、DMG、ZIP 的 SHA256 放在 `docs/releases/<version>-checksums.md`。
- README 只連到 checksum 文件。
- 安裝檔本體建議放 GitHub Releases；不要直接 commit 到 repo。
- 每個 release 應附上 checksum。
- 產生雜湊後，重新執行 `shasum -a 256 <installer>` 驗證一次。
- macOS DMG 另外跑 `hdiutil verify`；可掛載時讀回 `CFBundleShortVersionString`、`CFBundleVersion`、架構與 `app.asar` 版本。

## 7. Commit 前清單

- 執行 `git diff` 檢查實際修改。
- 執行 `git diff --check` 檢查 whitespace。
- 執行 `git status -sb` 檢查 staged / unstaged 檔案。
- 確認沒有 commit `node_modules/`。
- 確認沒有 commit 大型 build cache。
- 確認沒有公開密鑰、token、私有路徑或個資。
- 確認 README 與版本號一致。
- 確認程式碼真的有更新；若只有文件變更，要明確說明 source code 已先驗證為最新。
- 不可只改 README 卻忘記 source code；若 README 宣稱新版修正，必須在 source 裡找到對應修改。
- 不可只改本機不 commit；不可 commit 後忘記 push。
- 執行 `git diff --name-only`，確認 UI 修正已包含相關 component / CSS，metadata 或 IndexedDB 修正已包含 hooks / storage / electron source。
- 確認 skill 文件有沒有漏；播放器開發技能與 GitHub 更新流程技能不可混在同一份文件。
- 明確 stage 本次需要的檔案；不要在混合工作樹用 `git add -A`。

## 8. Commit 訊息格式

建議格式：

- `chore: release 0.1.29`
- `fix: stabilize song info metadata refresh`
- `docs: move release checksums out of README`
- `docs: add GitHub update flow skill`
- `fix: release 0.1.30 playlist scrollbar and GitHub sync`

## 9. Push 後檢查

- 執行 `git push origin main` 或推送目前 release branch。
- 推送後執行 `git fetch origin main`。
- 比對 `git rev-parse HEAD origin/main`。
- 用 `git show origin/main:package.json` 確認版本。
- 用 `git show origin/main:README.md` 確認 README。
- 用 `git show origin/main:docs/releases/<version>-checksums.md` 確認 checksum 文件。
- 用 `git show origin/main:<source-file>` 確認核心 source code 真的更新。
- 到 GitHub 網頁確認最新 commit、README、package.json、核心 source、checksum 文件可開啟。
- 若有 GitHub Actions，確認 checks 通過。
- 若有 GitHub Releases，確認安裝檔與 checksum 都已附上。
- push 後必須從 GitHub 讀回確認，不可以只相信本機 `git status`。

## 10. README 與 source code 不一致時

如果 README 寫新版，但 source code 沒更新：

- 不可只說完成。
- 必須補齊 source code。
- 必須同步 `package.json` 與其他版本來源。
- 必須重新執行 build 與相關 check。
- 必須重新 commit / push。
- 必須回報原本漏掉哪些內容、如何補上、哪些驗證已重新通過。

## 11. 修改類型對應 stage 檢查

- UI 修正：stage 前確認相關 component、CSS、source guard 與文件都在 `git diff --name-only` 內。
- metadata / IndexedDB 修正：stage 前確認 hooks、storage、Electron IPC 或 writer source、source guard 與文件都在 `git diff --name-only` 內。
- 版本更新：stage 前確認 `package.json`、`package-lock.json`、README、release docs、app 內版本常數與 checksum 文件一致。
- 本輪新增 source 後不可沿用上一輪驗證結果；必須重新執行 build / check。

## 12. 中斷續接規則

如果 Codex 因使用限制、權限或打包環境中斷，下次接續時必須：

- 先執行 `git status -sb`。
- 再執行 `git diff` 與 `git diff --name-only`。
- 不要 reset，不要丟失上一輪修改。
- 重新讀取最新需求與接續文件。
- 不要直接沿用上一輪 stage 清單。
- 確認是否有新的修正需求，再決定 commit / push / release。
