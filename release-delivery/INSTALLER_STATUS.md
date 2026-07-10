# Installer 狀態

## 2026-07-10 文件-only：docs/skills 移除

2026-07-10 文件-only 變更：移除 `docs/skills/`（兩份技能快照停在 0.1.32，內容過期且與 `CLAUDE.md`／`AGENTS.md`、`llm-wiki/` 重複）。開發規範以 `CLAUDE.md`／`AGENTS.md`＋`llm-wiki/` 為準，GitHub 發布流程以全域 `github-update-flow` 技能＋`llm-wiki/08-GitHub發布守門員.md` 為準；文件內歷史敘述保留、歷史可從 git 取回。程式與 installer 不受影響。

## 2026-07-10 0.1.49 狀態（Mini 切換播放中斷修正＋播放自癒保險＋AI 聊天視窗 UX）

0.1.49 修正 0.1.48 回歸（`<audio>` 首子節點位置被 `TextOverrideContext.Provider` 改變、切 Mini/OBS 播放中斷）＋播放自癒保險（自動重掛遺失音源＋恢復位置、錯誤訊息分流）＋ AI 聊天視窗 UX（泡泡列置頂收合 hover 下拉、訊息底部錨定、聊天區 500px）。零新套件。升版面：`package.json`／`package-lock.json`(×2)／`exportSettings.ts appVersion` → 0.1.49。

已通過（Linux 沙盒）：`tsc --noEmit`、`electron:compile`、全部可跑 `check:*`。已通過（Mac 本機）：`npm run dist:release` DIST_EXIT=0。

0.1.49 installer 已於 2026-07-10 由 `qa-temp/build-0.1.49.command` 在 Mac 本機產出並同步到 `release-delivery/installers/`（舊 0.1.48 已被 sync 自動清除）：

- `Aquariusgirl Music Room Setup 0.1.49.exe`：667,675,017 bytes，SHA-256 `7c3708ddba7abb9e81aa934575bf95af7e290b2293e77b8f89589741993cabf6`
- `Aquariusgirl Music Room-0.1.49-arm64.dmg`：684,771,178 bytes，SHA-256 `ee8ef2aeaa88a474fd5dad9986051223c4abfae66a3c6d90c7cb4cdf49f3e27a`
- DMG `hdiutil verify` VALID；掛載讀回 0.1.49／arm64／taglib wasm 存在；EXE PE32 NSIS；未簽章。詳見 `docs/releases/0.1.49-checksums.md`。
- 打包版 GUI 實測（切 Mini 續播、泡泡收合、訊息貼底、清單捲動）與 Windows 真機尚未驗；本次已推送 GitHub `main`。

## 正式發行提醒

目前 installer 是測試版，未做 Apple Developer ID 簽章、notarization、Windows code signing。正式公開前需要補簽章流程。Windows EXE 仍需 Windows 真機驗收。

## 歷史紀錄

2026-07-10 文件制度改革：本檔只描述目前版本現況。舊版逐版紀錄已統一移至根目錄 `CHANGELOG.md`（版本歷史唯一來源）；完整驗收證據見 `QA_REPORT.md`（append-only）；更舊細節可從 git 歷史取回。
(Doc reform 2026-07-10: this file describes the current version only. Per-version history lives in root `CHANGELOG.md`; QA evidence in `QA_REPORT.md`; older details are in git history.)
