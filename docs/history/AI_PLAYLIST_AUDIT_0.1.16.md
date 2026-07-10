# AI 播放清單能力盤點 0.1.16

日期：2026-06-28

## 1. 歌曲資料來源

- 有 IndexedDB：`src/storage/indexedDb.ts` 使用 `aquariusgirl-music-room`，stores 包含 `tracks`、`playlists`、`settings`、`handles`。
- 有歌曲 metadata 快取：`useMusicLibraryDb()` 會把目前 `Track` 轉成 `StoredTrackMetadata`，排除 `File`、`localUrl`、封面 object URL，只保存 metadata。
- 沒有本機 SQL/向量資料庫。
- 可讀取使用者授權的音樂資料夾：Web 使用 File System Access API；Electron 使用原生選檔/選資料夾，並可用保存的 `sourcePath` 嘗試恢復上次授權過的檔案。
- 可讀欄位：`id`、`name`、`title`、`artist`、`album`、`genre`、`year`、`trackNumber`、`duration`、`sourcePath`、`addedAt`、`liked`、`lastPlayedAt`、`playCount`、`fileName`。
- 不保存音樂檔本體、不保存 `File` 物件、不保存 object URL。

## 2. 播放清單能力

- 能新增一般播放清單：`usePlaylists().createPlaylist()`。
- 能新增智慧型播放清單：`createSmartPlaylist()`。
- 能改名：`renamePlaylist()`。
- 能刪除：`deletePlaylist()`，系統播放清單不可刪。
- 能加入歌曲：`addTrackToPlaylist()`。
- 能從一般播放清單移除單一 occurrence：`removeTrackFromPlaylist()`。
- 智慧型播放清單移除是加入 `excludedTrackIds`，不會改成靜態歌單。
- 從一般播放清單移除只移除 membership，不會刪除本機音樂檔。只有在「全部歌曲」刪除歌曲時才會呼叫 `removeTrack()` 並釋放 object URL。

## 3. AI 功能

- 有本機模型：`resources/ai/models/qwen3.5-0.8b.gguf`。
- 有 llama.cpp sidecar：`electron/ai/aiService.ts` 啟動 `llama-server`。
- 沒有 Ollama 呼叫邏輯。
- 有加密 prompt bundle：`resources/ai/prompts/aquariusgirl_prompt.bundle.bin`，來源在 `private/prompts/*.txt`。
- 有 AI 搜尋意圖解析：`parseMusicSearchIntent()` 讓模型把使用者需求轉成 JSON intent。
- Renderer 端實際挑歌走 `searchTracksForAIIntent()`，候選歌曲只能從目前 `tracks` 陣列取得。
- 0.1.15 已用 `handleCreateAIPlaylist()` 過濾 track id，避免寫入不存在的 songId；0.1.16 需再補「隨意建立」與「找不到不建立」的明確流程。
- AI 不應也不需要查檔案系統；它只能使用使用者已授權並載入/恢復到播放器的歌曲 metadata。

## 4. 向量搜尋能力

- 目前沒有 embedding model。
- 目前沒有向量資料庫。
- 目前沒有語意搜尋索引。
- 目前有 metadata 關鍵字搜尋/scoring：title、artist、album、genre、year、filename/name、liked、duration、addedAt。
- 最小可行方案：本輪先用標準字串正規化、別名擴展與 metadata scoring。這可涵蓋「櫻花46 / 櫻坂46 / Sakurazaka46」與睡前、放鬆、工作等常見需求。
- 暫不新增 embedding 模型。原因：現有歌曲庫規模與需求可先由 metadata 搜尋解決；新增模型會增加安裝檔大小、初始化成本與 QA 面積。
- ponytail: 若 metadata 搜尋實測不足，再加 lazy-loaded 小型文字 embedding，只對 `title/artist/album/genre/filename` 建索引，不處理音訊本體。
