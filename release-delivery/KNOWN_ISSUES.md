# 已知問題

版本：0.1.49
文件更新：2026-07-10

2026-07-10 文件-only 變更：移除 `docs/skills/`（兩份技能快照停在 0.1.32，內容過期且與 `CLAUDE.md`／`AGENTS.md`、`llm-wiki/` 重複）。開發規範以 `CLAUDE.md`／`AGENTS.md`＋`llm-wiki/` 為準，GitHub 發布流程以全域 `github-update-flow` 技能＋`llm-wiki/08-GitHub發布守門員.md` 為準；文件內歷史敘述保留、歷史可從 git 取回。程式與 installer 不受影響。

## 0.1.49 仍需完成

- 打包版 GUI 實測待補：切 Mini 續播、泡泡列收合與 hover 下拉、訊息底部錨定、播放清單捲動回歸，尚未在打包好的 app 內以真實滑鼠實跑。
- dev 模式已知限制（非 bug）：`electron:dev` 渲染來自 http origin，Chromium 禁止載入 `file://` 音源——自動恢復曲庫／原生選檔的歌在 dev 播不了（duration 0:00、「音源載入失敗」提示為正確分流）；dev 驗證播放請用拖曳加入（blob 音源），打包版 file:// 同源不受影響。
- Windows 真機仍待驗；簽章／notarization、WAV 不支援寫回等既有已知問題不變。

## Release Limits

- Apple Developer ID / notarization is not configured.
- Windows code signing is not configured.
- Large installers are not tracked in Git; they should be delivered through local delivery or release artifacts.

## 歷史紀錄

2026-07-10 文件制度改革：本檔只描述目前版本現況。舊版逐版紀錄已統一移至根目錄 `CHANGELOG.md`（版本歷史唯一來源）；完整驗收證據見 `QA_REPORT.md`（append-only）；更舊細節可從 git 歷史取回。
(Doc reform 2026-07-10: this file describes the current version only. Per-version history lives in root `CHANGELOG.md`; QA evidence in `QA_REPORT.md`; older details are in git history.)
