# AI Harness Audit 0.1.17

日期：2026-06-28

## 目標

0.1.17 的目標是讓 `qwen3.5:0.8b` 這類小模型只負責意圖理解與短回覆潤飾，避免讓模型直接決定本機音樂庫、播放清單或刪除行為。播放器程式負責所有實際操作。

## 既有能力

- 已有 llama.cpp sidecar runtime 與 `qwen3.5-0.8b.gguf` 打包流程。
- 已有 AI 面板、streaming chat、timeout 與取消回覆。
- 已有本機歌曲 metadata 搜尋、別名擴展與 mood scoring。
- 已有一般播放清單、smart playlist、歌單唯一命名與真實 track id 過濾。
- 播放清單移除不等於刪除本機音樂檔。

## 本輪修改

- 新增 `electron/ai/aiModelConfig.ts`，集中 provider、model file、temperature、top_p、repeat_penalty、num_predict 與 timeout。
- 新增 `electron/ai/promptService.ts`，從三份明文 prompt 載入：character、router、reply。
- 移除 secure prompt service、prompt key、encrypt prompt script、secure prompt check script 與 `.bin` prompt bundle。
- 新增 renderer 端 AI harness：
  - `src/ai/intentRouter.ts`
  - `src/ai/skillRegistry.ts`
  - `src/ai/responseComposer.ts`
- 支援 intent：`chat`、`search_music`、`create_playlist`、`random_playlist`、`add_to_playlist`、`remove_from_playlist`、`explain_ui`、`unknown`。
- Router JSON 失敗時走 deterministic fallback，不顯示原始模型輸出。
- 搜尋範圍維持 title、artist、album、filename、metadata、path。
- `ai_reply_prompt.txt` 只根據程式真實結果潤飾短回覆；失敗時保留 deterministic fallback。
- 打包目標收斂為 Windows x64 NSIS EXE 與 macOS arm64 DMG。

## 不做的事

- 不新增 embedding 模型或向量資料庫。
- 不改 IndexedDB schema。
- 不重寫播放器核心、Mini player、OBS 模式或外觀設定。
- 不產 macOS x64、universal 或 Linux installer。

## 驗證摘要

- `npm run check:prompts` PASS。
- `npm run check:ai-track-search` PASS，涵蓋櫻花46別名、隨機播放清單與 `explain` 到 `explain_ui` normalization。
- `node scripts/playlist-logic-check.mjs` PASS，保留播放清單移除不刪本機檔的語意。
- `npm run build` 與 `npm run electron:compile` PASS。
- 升權 `npm run dist:release` PASS，唯一交付位置只包含 0.1.17 arm64 DMG 與 Windows EXE。
