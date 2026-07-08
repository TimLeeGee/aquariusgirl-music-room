# 交接表：AI 助手改善＋歌曲資訊補全（Phase 1＋2）

> 目的：讓任何模型（含低階模型）能無縫接手。每完成一項就更新「進度總表」與該項的「狀態」。
> 建立：2026-07-07（Claude Fable 5 起工）。基準版本 0.1.44。

## 進度總表

| # | 工作項 | 狀態 | 備註 |
|---|--------|------|------|
| A1 | 智慧分流：規則信心高就跳過 LLM router | ✅ 完成 | aiTrackSearch.ts `shouldSkipModelRouter`＋AIAssistantPanel `resolveMusicIntent` |
| A2 | 對話歷史 token 預算裁切 | ✅ 完成 | aiService.ts `estimateTokens`/`trimMessagesToBudget`；config `historyTokenBudget: 2400` |
| A3 | 首 token 逾時＋連續失敗自動重啟 sidecar | ✅ 完成 | `completeChat` 包裝 `completeChatOnce`；busy 早退不計失敗；`firstTokenTimeoutMs: 15000`。electron:compile PASS |
| B1 | Phase 1：缺失掃描＋健檢報告卡（純讀取） | ✅ 完成 | `metadataFix.ts` scanMetadata＋面板報告卡；煙霧測試 PASS |
| B2 | Phase 2：本地推測引擎＋逐首建議卡＋快照復原 | ✅ 完成 | 建議卡佇列＋prefill＋session 快照＋復原＋落盤 IPC 全接通 |
| V | 驗證：build＋electron:compile＋rg 掃描＋文件更新 | ✅ 完成（打包版 GUI 除外） | tsc/electron:compile/check:* PASS；mac 本機 `npm run build` PASS（vite 1652 模組、4.26s、exit 0，見 `qa-temp/build-result.txt`）；rg 接點齊全、`window.confirm(` 於 src 零命中。packaged GUI 實測待下次打包後補（本輪依約不打包） |

狀態標記：⬜ 未開始 / 🔶 進行中 / ✅ 完成 / ⛔ 卡住（附原因）

## 使用者需求（已確認，勿再追問）

1. AI 助手效率與穩定改善：只做 A1、A2、A3 三項（閒置釋放記憶體不做）。
2. 歌曲資訊補全：UI 全部放在 AI 聊天面板。流程＝聊天輸入觸發掃描 → 健檢報告卡 → 按「開始整理」→ 逐首建議卡（現值 vs 建議值＋信心＋證據、欄位 checkbox 預設全勾）→ 三按鈕「套用並下一首／我來改／跳過」→ 完成摘要卡＋一鍵復原。
3. 第一版**不做**「高信心一鍵全部套用」批次功能。
4. 網路查詢（MusicBrainz 等）與聲紋辨識是 Phase 3／4，本輪**不做**。
5. 寫入前必須快照原始標籤，可復原。
6. 整理模式時聊天區高度 `max-h-64` 暫時放大為 `max-h-96`，證據一行小字。

## 不可妥協事項（改壞會出大事）

- **不動** `electron/songInfoWriter.ts` 的寫入／讀取邏輯（0.1.35–0.1.44 七輪 hotfix 的戰場）。
- 寫回一律走 `App.tsx` 的 `handleApplySongInfoToOriginal(trackId, draft)`（含 suspend audio、寫入、readback、IndexedDB、toast，回傳 boolean）。不建第二條寫入路徑。
- AI 補全**只寫文字欄位**，不寫封面（把 cover 欄位從 draft 剝除，writer 收不到 cover 就不動 picture block）。復原同理只還原文字欄位。
- 0.8B 模型不得憑空推測歌手／專輯（會幻覺）；推測全部走規則引擎，附證據與信心。
- renderer 禁用 `window.confirm` / `window.alert`（0.1.44 教訓）。
- 不新增 npm 套件。手術刀修改，不順手重構。
- AGENTS.md 修改守則與驗收守則全部適用。

## 檔案地圖（本工作會碰的檔案）

| 檔案 | 動作 | 內容 |
|------|------|------|
| `electron/ai/aiModelConfig.ts` | 改 | A2 加 `historyTokenBudget`；A3 加 `firstTokenTimeoutMs` |
| `electron/ai/aiService.ts` | 改 | A2 token 估算與裁切；A3 首 token 逾時＋連續失敗重啟 |
| `src/utils/aiTrackSearch.ts` | 改 | A1 `shouldSkipModelRouter()` |
| `src/utils/metadataFix.ts` | 新增 | B1 掃描 `scanMetadata()`＋B2 推測引擎（純函式，好測試） |
| `src/components/AIAssistantPanel.tsx` | 改 | A1 分流；B1 報告卡；B2 建議卡佇列＋完成卡；新 props |
| `src/App.tsx` | 改 | B2 wiring：`onApplyMetadataFix`／`onEditSongInfo`（prefill）／`onRestoreMetadataFix`＋快照 session |
| `src/components/SongInfoPanel.tsx` | 改 | B2 選配 `prefillDraft` prop（「我來改」預填） |
| `electron/preload.ts`、`electron/main.ts`、`src/types/browser.d.ts` | 改 | B2 快照落盤 IPC `aquariusgirl:save-metadata-fix-snapshot`（仿 append-ai-playlist-action-log，寫 userData） |
| `docs/HANDOFF_AI_METADATA.md` | 更新 | 本表 |
| `CONTINUE_WORK.md` | 更新 | 收尾時最新段落加最上方，舊內容不刪 |

## 各項規格

### A1 智慧分流
- `aiTrackSearch.ts` 匯出 `shouldSkipModelRouter(intent: MusicSearchIntent): boolean`：
  - `random_playlist` → true（面板本來就先攔，這裡雙保險）。
  - `add_to_playlist`／`remove_from_playlist` → `keywords.length > 0 || targetPlaylistName` 即 true。
  - `create_playlist`／`search_music` → `keywords.length > 0 || mood` 即 true。
  - 其他 → false。
- `AIAssistantPanel.resolveMusicIntent`：算出 `fallbackIntent` 後若 `shouldSkipModelRouter(fallbackIntent)` 直接回傳，不呼叫 `ai.parseMusicSearchIntent`。
- 驗收：規則能判的指令不再出現最多 20 秒的 router 等待；`npm run build` 過。

### A2 token 預算
- 背景：`sanitizeMessages` 允許 20 則 × 4000 字元，context 只有 4096 tokens。目前 chat 只送單句（useLocalAI ponytail），本項是防禦性下限。
- `aiService.ts` 加 `estimateTokens(text)`：CJK 字符算 1 token、其餘每 4 字元算 1。
- `trimMessagesToBudget(messages, budget)`：由新到舊累加（每則另加 8 overhead），超出預算停止；若最新一則單獨超標，`content.slice(0, budget)` 硬切。
- `sanitizeMessages` 尾端套用，budget 用 `aiModelConfig.historyTokenBudget = 2400`（4096 − 系統提示保留 ~1300 − 輸出 300）。
- 驗收：`electron:compile` 過；塞 20 則長訊息時實際送出的 messages 總估算 ≤ 預算。

### A3 卡死偵測
- `aiModelConfig.ts` 加頂層 `firstTokenTimeoutMs: 15_000`。
- `completeChat`：streaming 時另設首 token 計時器，逾時同樣 `controller.abort()` 並回逾時訊息；收到第一個 token 就清除。
- 連續失敗重啟：`LocalAIService` 加 `consecutiveFailures` 計數。成功 → 歸零；失敗且**非**使用者取消、**非** busy 擋下 → +1；達 2 → 歸零並 `this.shutdown()`（下次呼叫會重新 init 拉起 sidecar）。
- 早退 guard（「正在回覆中」「尚未啟動」）不得計入失敗：這類回傳加 `busy: true` 欄位以供判別。
- 驗收：`electron:compile` 過；模擬（將 firstTokenTimeoutMs 暫調 1ms）可看到逾時訊息。

### B1 缺失掃描＋健檢報告
- `metadataFix.ts`：
  - `isMetadataFixIntent(text)`：文字含（檢查/補/整理/健檢/掃描 之一）且含（資訊/標籤/metadata/tag/資料 之一）→ true。在 `handleSend` 內於歌單邏輯**之前**判斷（「整理」與歌單關鍵字撞字，順序重要）。
  - `scanMetadata(tracks): MetadataScanReport`：缺值定義＝欄位空或全空白。統計 `missingArtist/Album/Year/Genre/Cover`、`writable`（`sourcePath` 存在且副檔名 mp3/flac/m4a）、`nonWritable`。封面有無看 `coverDataUrl || coverUrl || artworkUrl`。
- 面板：命中意圖 → 追加使用者訊息＋本地組字的助手訊息（不經 LLM，工具結果一律程式組字）＋報告卡（四格統計＋不可寫回註記＋「開始整理」「先不用」）。曲庫為空或無缺失時只回文字訊息。
- 驗收：build 過；報告數字與手工抽查一致；未按「開始整理」前**零寫入**。

### B2 推測引擎＋建議卡＋快照復原
- 推測（`metadataFix.ts`，只對 writable 且有缺的歌產 `TrackFixPlan { trackId, fileName, suggestions[] }`；`suggestions: { field, label, proposed, confidence: "high"|"medium", evidence }`）：
  - artist：`parseTrackName(檔名).artist` → high，證據「檔名含『X -』」；否則同資料夾（`sourcePath` 去掉最後一段為 key）有 artist 的歌 ≥3 首且同值比例 ≥0.8 → 全同 high、否則 medium。
  - album：同資料夾多數決，同上門檻。
  - year：同專輯（含「推測出的專輯」）有年份的歌 ≥2 首且全同 → high；否則同歌手 ≥3 首、比例 ≥0.9 → medium。格式必須 `/^\d{4}$/`。
  - genre：同專輯 ≥2 全同 → high；同歌手 ≥3、≥0.8 → medium。
  - track（曲號）：檔名開頭 `/^(\d{1,3})[\s._\-、.]+/` → medium。
  - 比較一律 NFKC＋trim＋toLowerCase；顯示值用最常見原始寫法。**不推測 albumArtist、封面**（記入未來工作）。
- 佇列 UI（AIAssistantPanel）：一次一張卡（沿用 playlistDraft 卡片視覺），標頭「檔名＋n / N＋進度條」，每列 checkbox（預設勾）＋欄位＋`現值 →建議值`＋信心 badge＋證據一行小字。按鈕：套用並下一首／我來改／跳過；卡底小字「取消整理」直接跳完成卡。整理中聊天區 `max-h-96`。
- App wiring：
  - `onApplyMetadataFix(trackId, patch)`：`before = createSongInfoDraft(track)`（剝除 cover 欄位）→ 快照 push 進 `metadataFixSessionRef`＋IPC 落盤 → `draft = normalizeSongInfoDraft({ ...before, ...patch, cover* : undefined })` → `handleApplySongInfoToOriginal`。回傳 boolean。
  - `onEditSongInfo(trackId, patch)`：`setSongInfoPrefill({trackId, patch})` ＋ `setSongInfoTrackId(trackId)`。SongInfoPanel 新選配 prop `prefillDraft`：track id 切換 reset 時若有 prefill 就 `setDraft({...snapshot, ...prefill})`（savedDraft 維持原值 → dirty 自動亮）。面板 onClose 清 prefill。
  - `onRestoreMetadataFix()`：倒序回放 session 快照，逐筆 `handleApplySongInfoToOriginal(trackId, before)`，回傳 {restored, failed}，清空 session。
  - 快照 IPC：`aquariusgirl:save-metadata-fix-snapshot`，main 寫 `userData/metadata-fix-snapshots/<sessionId>.json`（整包覆寫，JSON 上限 2MB 防呆）。復原用記憶體 session；落盤檔僅災難回復（手動）用途。
- 已知 v1 簡化（故意的，別「修」它們）：
  - 寫回失敗（含播放中鎖檔）→ 計入「失敗」繼續下一首；完成卡提示「暫停播放後再跑一次掃描」。不做自動排隊尾。
  - 復原只還原文字欄位；不動封面。
  - 快照復原僅限本次 session（重開 app 後 UI 不提供復原）。
- 驗收：build＋electron:compile 過；用測試資料夾複本驗證「掃描→套用→readback→復原」循環；**絕不**對使用者真實音樂資料夾做寫入驗收（AGENTS 守則）。

### V 驗證與收尾
1. `npm run build`、`npm run electron:compile`、相關 `check:*`（至少 `check:metadata-save-loop`、`song-info-check`）。
2. `rg` 掃描：`shouldSkipModelRouter|isMetadataFixIntent|scanMetadata|metadata-fix-snapshot|prefillDraft` 各接點齊全；`rg "window.confirm\(" src/` 必須零命中。
3. 更新本表狀態＋`CONTINUE_WORK.md`（最新段落加最上方）。不重打 installer（除非使用者要求）。
4. 完成回報：改了什麼／驗證過什麼／未驗證什麼／後續事項。

## 交接注意

- 本輪**只改程式與文件**，不打包、不 push GitHub（使用者要求時才做，走 `github-update-flow` 技能）。
- 若接手時發現部分項目已 ✅，從第一個 ⬜/🔶 繼續；先跑一次 `npm run build` 確認基底是綠的。
- 測試音樂檔一律用複本放 `qa-temp/`，不碰使用者音樂庫。
