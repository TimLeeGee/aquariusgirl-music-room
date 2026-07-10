# AI 播放清單建立紀錄

開發版會把 AI 建立播放清單事件 append 到此檔。打包版 App 會寫入使用者資料夾的 `AI_PLAYLIST_ACTION_LOG.md`，避免寫入唯讀 app resources。

欄位包含：日期時間、使用者原始指令、AI 判斷意圖、搜尋方式、播放清單名稱、歌曲數量、每首歌曲的 songId/title/artist/filePath 或可識別欄位、是否有找不到歌曲。
