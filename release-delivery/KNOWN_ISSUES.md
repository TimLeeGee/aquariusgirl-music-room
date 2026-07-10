# 已知問題

版本：0.1.49
文件更新：2026-07-10

## 0.1.49 仍需完成

- 打包版 GUI 實測待補：切 Mini 續播、泡泡列收合與 hover 下拉、訊息底部錨定、播放清單捲動回歸，尚未在打包好的 app 內以真實滑鼠實跑。
- dev 模式已知限制（非 bug）：`electron:dev` 渲染來自 http origin，Chromium 禁止載入 `file://` 音源——自動恢復曲庫／原生選檔的歌在 dev 播不了（duration 0:00、「音源載入失敗」提示為正確分流）；dev 驗證播放請用拖曳加入（blob 音源），打包版 file:// 同源不受影響。
- Windows 真機仍待驗；簽章／notarization、WAV 不支援寫回等既有已知問題不變。

## 0.1.48 仍需完成

- 打包版 GUI 實測待補：0.1.45–0.1.48 的新功能（AI 歌曲資訊健檢／補全、快捷指令氣泡、搜尋泡泡預填/反問、資料夾範圍掃描、逐首手動編輯、非可寫檢視＋顯示位置、面板文字登錄表分組搜尋編輯器、角色名稱全站改名）都尚未在打包好的 app 內以真實滑鼠實跑。
- Windows 真機仍待驗；簽章／notarization、WAV 不支援寫回等既有已知問題不變。
- 面板文字自訂的少數散落名字提及（AI 歌單自動命名、toast 標籤、onboarding、播放錯誤訊息、OBS／Mini 助手）走 `applyName`：會跟著角色改名、但不是可搜尋的獨立 slot；`aiTrackSearch.ts`/`trackDisplay.ts` 兩處因 node check 限制預設名維持字面「水瓶罐子」；macOS 視窗／dock 名稱為打包時 productName，runtime 不變。

## 0.1.44 仍需完成

- `window.confirm` 焦點鎖死是 Windows 專屬行為，macOS / Linux 無法重現；0.1.44 的修法（renderer ConfirmDialog + dialog parent/focus restore）需要使用者在 Windows 真機實測：更換封面「套用到原始檔」成功後，排序下拉要能打開、搜尋歌手與 AI 助手輸入框要能輸入。
- 若 Windows 真機在「更換封面選檔」後（尚未按套用前）就出現輸入框無法點擊，剩餘嫌疑是歌曲資訊面板內 `<input type="file">` 的 Chromium 原生選檔窗；升級路徑是把封面選檔改走 Electron IPC dialog（同 0.1.44 的 focus restore 路徑）。本輪未觀察到此情境的回報。
- 提示 toast 移到左上後會短暫（4.2 秒）覆蓋 app 標誌區；toast 已 `pointer-events-none` 不擋點擊，若使用者覺得位置干擾可再調整。
- 尚未在 Windows 真機驗證 0.1.44；簽章 / notarization、WAV 不支援寫回等既有已知問題不變。

## 0.1.43 仍需完成

- 尚未在使用者的 nonoc-Memento 原始檔上做 GUI 實測（本輪為 Linux 沙盒以打包版 wasm 設定重現與修復驗證）；建議使用者以 4.3MB `Cover 01.jpg` 重試「套用到原始檔」與「重新讀取音樂標籤」，現在成功與失敗都會在右上角跳出提示。
- 掃描路徑仍走 partial 快速讀取：觀察到的截斷失敗都是 WASM 崩潰、已由 full-read fallback 接住；理論上若 partial 讀取「不崩潰但回傳不完整圖片」仍可能在掃描時漏封面（單檔操作已改預設完整讀取，不受影響）。
- 封面上限仍為 5 MB（超過會明確提示「封面圖片太大」）；partial 崩潰時 fallback 會把同一檔再完整讀一次，只發生在標籤區超過約 1MB 的檔案。
- 尚未在 Windows 真機驗證 0.1.43；簽章 / notarization、WAV 不支援寫回等既有已知問題不變。

## 0.1.42 仍需完成

- 尚未在 Windows 真機驗證「播放中保存」修正：重點是播放中對目前那首連續套用文字與封面各兩次，保存瞬間音訊短暫中斷後自動回到原位置續播。
- 保存瞬間音訊會短暫中斷（釋放檔案 handle 的必要代價）；若使用者回報中斷過長，升級路徑是只在 Windows 平台 suspend。
- 其餘 0.1.41 已知問題（簽章 / notarization、WAV 不支援寫回等）不變。

## 0.1.41 仍需完成

- 尚未在 Windows 真機安裝 0.1.41 EXE 驗證歌曲資訊 / 封面讀回、連續封面寫回、重新讀取音樂標籤、重開保存、播放/暫停、資料夾恢復、AI、Mini/dialog focus；目前 Windows 只有 NSIS static check。
- 0.1.41 packaged macOS DMG 已用隔離 userData 與暫存 Plazma FLAC 完成三輪滑鼠封面驗收，最終 Cover 02 與 metadata 重開後仍存在；這不代表使用者正式 Music 資料夾或 Windows 真機已驗證。
- 0.1.41 只補 packaged TagLib partial read 失敗時的單曲 full-load retry；沒有新增套件、沒有清 IndexedDB、沒有重掃曲庫、沒有改 DB schema、沒有加 `coverRevision`、沒有補新的 MIME 側門、沒有恢復「儲存到播放器」。
- 原始檔寫回目前仍只支援 MP3、FLAC、M4A；WAV 等格式不提供原始檔 tag 寫回。
- macOS DMG 未做 Developer ID signing / notarization；Windows EXE 未做 code signing。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.40 仍需完成

- 尚未在 Windows 真機安裝 0.1.40 EXE 驗證 selectedCover dirty、防呆、readback hash、播放/暫停、資料夾恢復、AI、Mini/dialog focus；目前已完成 source-level、防回歸檢查、installer 打包、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 尚未做完整 packaged GUI 純滑鼠連續封面驗收；後續需使用暫存音樂複本與隔離 profile，對同一首歌連續更換封面至少兩次並「套用到原始檔」，確認第二次 dirty 成立、按鈕可按、readback hash 不假成功、重開後仍保留最後一次封面。不可打開或修改使用者原始 Music 資料夾。
- 0.1.40 只補 `SongInfoPanel` selectedCover 狀態機、App 端 cover bytes 防呆與 reload metadata 診斷；沒有新增套件、沒有清 IndexedDB、沒有重掃曲庫、沒有改 DB schema、沒有加 `coverRevision`、沒有補新的 MIME 側門、沒有恢復「儲存到播放器」。
- 原始檔寫回目前仍只支援 MP3、FLAC、M4A；WAV 等格式不提供原始檔 tag 寫回。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.39 仍需完成（歷史）

- 尚未在 Windows 真機安裝 0.1.39 EXE 驗證封面 readback hash 流程、playlist / 全部歌曲自訂排序保存、播放/暫停、資料夾恢復、AI、Mini/dialog focus；目前已完成 source-level、防回歸檢查、installer 打包、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 尚未做完整 packaged GUI 純滑鼠連續封面驗收；後續需使用暫存音樂複本與隔離 profile，對同一首歌連續更換封面至少兩次並「套用到原始檔」，確認第二次 readback hash 不假成功、重開後仍保留最後一次封面。不可打開或修改使用者原始 Music 資料夾。
- 0.1.39 只補封面 readback hash 單一路徑與 playlist 排序保存；沒有新增套件、沒有清 IndexedDB、沒有重掃曲庫、沒有改 DB schema、沒有加 `coverRevision`、沒有補新的 MIME 側門。
- 原始檔寫回目前仍只支援 MP3、FLAC、M4A；WAV 等格式不提供原始檔 tag 寫回。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.38 仍需完成

- 尚未在 Windows 真機安裝 0.1.38 EXE 驗證排序選單、封面更換與原始檔寫回；目前已完成 source-level、防回歸檢查、真實 Plazma 暫存複本 writer/readback、installer 打包、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- packaged macOS GUI 已用隔離 profile 開啟並確認排序下拉選單可看到原本 7 種模式；原生封面選檔器可用真實滑鼠打開，但純滑鼠選檔被 macOS 隱私提示擋住，需要使用者明確允許 Codex / System Events 權限後才能完整驗證。封面寫回核心已用暫存音樂複本 writer/readback 驗證。
- 0.1.38 只補排序選單防回歸與封面 MIME 別名；沒有新增套件、沒有重掃曲庫、沒有改 DB schema、沒有壓縮封面。若未來真實上萬首曲庫仍需要效能改善，另開縮圖 / cover store / 背景索引設計，不混進本 hotfix。
- 原始檔寫回目前仍只支援 MP3、FLAC、M4A；WAV 等格式不提供原始檔 tag 寫回。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.37 仍需完成

- 尚未在 Windows 真機安裝 0.1.37 EXE 驗證第二次封面更換與原始檔寫回；目前已完成 source-level、防回歸檢查、真實 Plazma 暫存複本 writer roundtrip、installer 打包、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 尚未做完整 packaged GUI 滑鼠流程：仍需使用暫存音樂複本與隔離 profile 驗證同一首歌連續 Cover 02 -> Cover 01 -> Cover 02 或至少兩次更換封面並「套用到原始檔」，第二次不因空白 / `application/octet-stream` MIME 失敗，重開後仍保留最後一次封面。
- 0.1.37 只補封面 MIME fallback；沒有新增套件、沒有重掃曲庫、沒有改 DB schema、沒有壓縮封面。若未來真實上萬首曲庫仍需要更進一步效能改善，另開縮圖 / cover store / 背景索引設計，不混進本 hotfix。
- 原始檔寫回目前仍只支援 MP3、FLAC、M4A；WAV 等格式不提供原始檔 tag 寫回。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.36 仍需完成

- 尚未在 Windows 真機安裝 0.1.36 EXE 驗證歌曲資訊 metadata / cover 是否完整讀回；目前已完成 source-level、防回歸檢查、installer 打包、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 0.1.36 移除「儲存到播放器」是刻意設計：目前只保留原始檔寫回路徑，避免播放器 IndexedDB override 與原始檔 tag 雙路徑互相覆蓋。若未來真的需要「只保存到播放器」，需另設明確 UI 文案、資料來源標記與驗收，不混進本 hotfix。
- 0.1.36 只補 TagLib property-key alias；若未來真實上萬首 metadata 讀取效能不足，再另開 WASI path-mode / 背景索引設計，不混進這個 hotfix。
- 原始檔寫回目前仍只支援 MP3、FLAC、M4A；WAV 等格式不提供原始檔 tag 寫回。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.35 仍需完成

- 尚未在 Windows 真機安裝 0.1.35 EXE 驗證歌曲資訊 metadata / cover 是否恢復；目前已完成 source-level、防回歸檢查、installer 打包、DMG verify、唯讀掛載讀回與 Windows NSIS static check。
- 0.1.35 使用 Emscripten buffer mode 解決 packaged wasm 路徑問題；若未來真實上萬首 metadata 讀取效能不足，再另開 WASI path-mode / 背景索引設計，不混進這個 hotfix。
- 本輪依使用者要求不同步 / push 到 GitHub。

## 0.1.34 仍需完成

- 尚未用 packaged GUI 載入 100+ 首暫存歌曲驗證：主視窗右側大型卷軸仍在、playlist 歌曲列表在歌曲很多時出現自己的內部小卷軸、滾輪在 playlist 區優先捲歌曲列表、兩個卷軸都只在內容超出時出現、沒有水平卷軸、底部內容不被 Mini Player 裁切。
- 尚未在 Windows 真機安裝 0.1.34 EXE 驗證 fresh install、主視窗卷軸、playlist 內部卷軸、播放/暫停、資料夾恢復、AI、Mini/dialog focus。
- 0.1.34 source-level guard 與 packaged asar/CSS 讀回已確認主視窗與 playlist 是兩個不同 scroll container，且 `PlaylistPanel` 有實際高度；但這不等於完整 packaged GUI 大曲庫壓力測試。
- 0.1.34 未新增 virtualization 套件；若未來真實上萬首 GUI 滑動仍不足，應另開成熟 virtualization / thumbnail cache 設計，不混進這個 hotfix。
- 本輪依使用者要求未同步 / push 到 GitHub；若之後要發布到遠端，需另行 commit / push / 讀回 `origin/main`。

## 0.1.33 仍需完成

- 尚未用 packaged GUI 載入 100+ 首暫存歌曲驗證：一般主內容區滾輪可捲整個主視窗、playlist 區滾輪優先捲歌曲列表、兩個卷軸都只在內容超出時出現、沒有水平卷軸、底部內容不被 Mini Player 裁切。
- 尚未在 Windows 真機安裝 0.1.33 EXE 驗證 fresh install、主視窗卷軸、playlist 內部卷軸、播放/暫停、資料夾恢復、AI、Mini/dialog focus。
- 0.1.33 source-level guard 與 packaged asar/CSS 讀回已確認主視窗與 playlist 是兩個不同 scroll container，且 `body` 不再全域 `overflow:hidden`；但這不等於完整 packaged GUI 大曲庫壓力測試。
- 0.1.33 未新增 virtualization 套件；若未來真實上萬首 GUI 滑動仍不足，應另開成熟 virtualization / thumbnail cache 設計，不混進這個 hotfix。
- 本輪 headless browser runtime 受本機 Playwright 瀏覽器快取缺失與 Chrome CLI exit 134 限制，未宣稱滑鼠 / 觸控板實際 GUI 捲動 PASS。

## 0.1.32 仍需完成（歷史）

- 尚未用 packaged GUI 載入 100+ 首暫存歌曲驗證：左側主欄不出現 playlist 捲軸、右側 playlist 欄位高度回到 0.1.28、滑鼠滾輪 / 觸控板 / 拖曳捲軸都只捲歌曲列表、最後一首不被 mini player 蓋住且無水平捲軸。
- 尚未在 Windows 真機安裝 0.1.32 EXE 驗證 fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。
- 0.1.32 source-level guard 已確認左欄不再承擔 playlist overflow，且 `PlaylistPanel` 回到 0.1.28 高度；但這不等於完整 packaged GUI 大曲庫壓力測試。
- 0.1.32 未新增 virtualization 套件；若未來真實上萬首 GUI 滑動仍不足，應另開成熟 virtualization / thumbnail cache 設計，不混進這個 hotfix。

## 0.1.31 仍需完成（歷史）

- 尚未用 packaged GUI 載入 100+ 首暫存歌曲驗證右側 scroll container 的滑鼠滾輪、觸控板、拖曳捲軸、最後一首不被 mini player 蓋住與無水平捲軸。
- 尚未在 Windows 真機安裝 0.1.31 EXE 驗證 fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。
- 0.1.31 source-level guard 已確認 app body 不再負責播放清單 overflow，但這不等於完整 packaged GUI 大曲庫壓力測試。
- 全域 installed `build-music-player` 已把 GitHub 發布流程轉交給全域 `github-update-flow` 技能；專案內 `docs/skills/` 也已同步拆分。

## 0.1.30 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.30.exe` 驗證 fresh install、啟動、右側歌曲列表捲軸位於清單面板最外緣、搜尋 / 排序 header 固定、左側播放器 / 視覺頻譜 / 睡眠定時不跟著捲、底部 mini player 不遮住最後歌曲、沒有水平捲軸、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- 本輪未用 packaged GUI 載入真實大曲庫做滑鼠 / 觸控板滾動壓力測試；仍需用暫存音樂資料與隔離 profile 補驗，不可打開或修改使用者原始 Music 資料夾。
- 本輪 `check:track-list-virtualization` 是 source-level regression guard，可防止外緣捲軸、動態 viewport、bottom safe space、水平 overflow 與卡片高度回歸，但不是完整 packaged GUI 壓力測試。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期；macOS DMG 未做 Apple Developer ID 簽章與 notarization。
- 0.1.30 修正的是右側歌曲列表外緣捲軸與卡片高度；若未來真實上萬首 GUI 滑動仍不足，再評估成熟 virtualization / cover thumbnail cache，不要混進這個 hotfix。
- 0.1.30 沿用 0.1.28 的 metadata save loop 修正與本機 metadata 保存策略；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。

## 0.1.29 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.29.exe` 驗證 fresh install、啟動、右側播放清單卡片內部捲動、底部播放器不被播放清單覆蓋、手動排序 / 檔名排序播放都照目前歌曲清單由上到下、大清單滑動只 render 可見窗口且不卡、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- 本輪 dev browser 只量測空歌單版面底部對齊；真實大曲庫 GUI 滑動仍需用暫存音樂資料與隔離 profile 補驗，不可打開或修改使用者原始 Music 資料夾。
- 本輪 `check:track-list-virtualization` 是 source-level regression guard，可防止右欄高度邊界與 TrackList windowing 回歸，但不是完整 packaged GUI 壓力測試。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期；macOS DMG 未做 Apple Developer ID 簽章與 notarization。
- 0.1.29 修正的是播放清單卡片 scroll bounds；若未來真實上萬首 GUI 滑動仍不足，再評估成熟 virtualization / dynamic viewport measurement，不要混進這個 hotfix。
- 0.1.29 沿用 0.1.28 的 metadata save loop 修正與本機 metadata 保存策略；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。

## 0.1.28 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.28.exe` 驗證 fresh install、啟動、手動排序 / 檔名排序播放都照目前歌曲清單由上到下、大清單滑動只 render 可見窗口且不卡、播放含大型封面的歌曲不卡、連續更換同一首封面 5 次不卡、播放清單歌曲資訊寫回後強制重開仍顯示最新 metadata / cover、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- 本輪新增的 `check:playback-order`、`check:track-list-virtualization`、`check:cover-update-five-times`、`check:playlist-song-info-restart` 等是 source-level regression guard，不是完整 packaged GUI 壓力測試。
- 本輪新增的 console warn guard 只在開發診斷中標出可疑迴圈或同來源 reload；是否在 packaged GUI 大量操作下完全不卡，仍需用暫存音樂複本與隔離 profile 驗收。
- macOS packaged GUI 滑鼠流程仍需用暫存音樂複本與隔離 profile 補驗，不可打開或修改使用者原始 Music 資料夾。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期；macOS DMG 未做 Apple Developer ID 簽章與 notarization。
- 0.1.28 修正的是 metadata 保存迴圈與全庫重寫；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；「儲存到播放器」可作為播放器本機 metadata 保存路徑，但不會修改原始音樂檔。
- 0.1.28 不拆封面到獨立 object store；這次先停止全庫保存、播放中重寫 coverDataUrl，並讓清單只 render 可見窗口。若未來上萬首壓力測試仍不足，再另開縮圖 / cover store 設計。
- 0.1.28 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.27 仍需人工驗收

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.27.exe` 驗證 fresh install、啟動、第一次歌曲資訊 / 封面寫回後第二次寫回仍可按「套用到原始檔」、重開後封面不回舊圖、播放中改封面後切歌再切回不卡、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- 本輪尚未執行 packaged macOS GUI 滑鼠流程；下一輪需用暫存音樂複本與隔離 profile 驗證第二次寫回、重開封面、播放清單與播放中不卡。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.27 修正的是歌曲資訊面板二次寫回狀態機與格式防線；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.27 不會在每次歌曲資訊更新後清空整個音樂資料庫；若未來要做大規模索引或縮圖快取，需要另開效能設計，不應混進這個 hotfix。
- 0.1.27 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.26 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.26.exe` 驗證 fresh install、啟動、播放中更換封面後切歌再切回不卡、cover02 -> cover01 第一次重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify 與唯讀掛載版本 / arm64 / app.asar / AI runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- packaged macOS 隔離驗收已補做：0.1.26 DMG app 使用隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本；Plazma 播放中 Cover 02 -> Cover 01 套用到原始檔成功，切歌再切回不卡，重開同 profile 後播放清單仍保留 Plazma。
- macOS native dialog 選取 `/private/tmp` 暫存路徑時使用本機 harness，原因是隱藏路徑與無輔助使用權限；這是驗收操作限制，不是 app 功能結論。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.26 修正的是原始檔寫回後的單曲 metadata snapshot 保存競賽；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.26 不會在每次歌曲資訊更新後清空整個音樂資料庫；若未來要做大規模索引或縮圖快取，需要另開效能設計，不應混進這個 hotfix。
- 0.1.26 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.25 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.25.exe` 驗證 fresh install、啟動、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify；本輪 `hdiutil attach` / `imageinfo` 因裝置權限與用量限制未完成，不能宣稱 DMG 唯讀掛載版本 / arm64 / app.asar 讀回 PASS。
- Codex 沙盒拒絕直接啟動 Electron GUI，因此本輪未完成滑鼠實際流程驗收；需要下一輪由已開啟 App 或使用者手動配合驗。
- macOS DMG 未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.25 修正的是同來源 audio reload 殘留；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.25 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。
- 0.1.25 lesson 尚未寫入已安裝 `build-music-player` 技能，原因是 `~/.codex/skills` 寫入被用量限制擋住；下一輪需補記。

## 0.1.24 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.24.exe` 驗證 fresh install、啟動、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、改封面後播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.24 修正的是 metadata/cover-only audio reload 與 IndexedDB 保存順序；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.24 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.23 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.23.exe` 驗證 fresh install、啟動、歌手欄位不再在「米津玄師」與「未知歌手」之間跳動、播放/暫停連點、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊寫回、封面 cover02 -> cover01、改封面後重開播放清單不掉歌、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.23 修正的是 stored metadata 弱資料覆蓋強資料；若使用者在播放器外修改原始檔 tag，仍需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.23 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.22 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.22.exe` 驗證 fresh install、啟動、`Cover 02.jpg` 改回 `Cover 01.jpg`、大於 3 MB 且小於 5 MB 的 JPG 封面預覽 / 寫回、超過 5 MB 的圖片會明確提示過大、播放/暫停連點、約 4 GB / 20+ 首音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 封面上限目前為 5 MB；這是為了支援真實專輯封面並避免過大圖片拖慢 M1 MacBook Air 8GB。若未來確定需要更大封面，再評估壓縮或縮圖流程。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.22 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.21 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.21.exe` 驗證 fresh install、啟動、播放/暫停連點、畫面不閃爍、歌曲第一行檔名第二行歌手、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、99 首以上曲庫啟動體感、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、封面 cover02 -> cover01 實機寫回、改封面後重開播放清單不掉歌、AI 聊天與 AI 建歌單等待狀態。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 啟動 auto-restore 先用 IndexedDB metadata 快速還原，若使用者在播放器外修改原始檔 tag，需要用明確重新讀取 / 重新選擇來源讓 metadata 更新。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.21 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。
- 上萬首曲庫需求目前以避免啟動逐首重讀 metadata 的架構先處理，尚未以真實上萬首資料夾做 GUI 壓力測試。

## 0.1.20 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.20.exe` 驗證 fresh install、啟動、播放/暫停連點、畫面不閃爍、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify；但本輪 DMG 唯讀掛載版本 / arm64 架構讀回因使用限制未完成，且未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不提供「保存到播放器」作為替代保存路徑。
- 0.1.20 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.19 仍需人工驗收（歷史）

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.19.exe` 驗證 fresh install、啟動、選擇約 4 GB / 20+ 首音樂資料夾、播放、歌曲資訊編輯、MP3/FLAC/M4A 原始檔寫回、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、版本、arm64 架構、prompt、runtime 與 packaged `taglib-wasm` static checks；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 原始檔寫回目前只支援 MP3、FLAC、M4A；不再提供「保存到播放器」作為替代保存路徑。
- 大型資料夾閃退已以「不傳整個音檔進 IPC」修正，但仍需在 Windows 真機用使用者同級資料夾驗收。
- 0.1.19 內建模型、llama.cpp runtime 與 `taglib-wasm`，installer 體積比純播放器版本大。

## 0.1.18 仍需人工驗收

- Windows 真機尚未安裝 `Aquariusgirl Music Room Setup 0.1.18.exe` 驗證 fresh install、啟動、選擇音樂資料夾、AI 聊天與 AI 建歌單。
- Windows EXE 目前只有 NSIS / x64 target static check，不能宣稱 Windows 實機 PASS。
- macOS DMG 已完成 verify、版本、arm64 架構、prompt 與 runtime static checks；但未做 Apple Developer ID 簽章與 notarization。
- Windows EXE 未做 code signing，SmartScreen 提醒仍屬預期。
- 0.1.18 內建模型與 llama.cpp runtime，因此 installer 體積明顯大於純播放器版本。

## 0.1.16 已知限制

- AI 播放清單搜尋使用 metadata 關鍵字、別名與 mood scoring；未加入 embedding 或向量資料庫。
- 若使用者曲庫 metadata 不完整，AI 搜尋可能找不到歌；設計上會回覆找不到，不建立假歌。
- Windows 真機的 AI 建歌單、右側歌單 / AI 助手分頁與焦點行為仍需人工驗收。

## 正式發行限制

- 未設定 Apple Developer ID / notarization。
- 未設定 Windows code signing。
- 未建立公開 Release artifact 流程給大型 installer；Git repository 不直接追蹤 DMG / EXE。

---

## Known Issues

Version: 0.1.39
Document update: 2026-07-05

## 0.1.39 Manual QA Still Needed

- Real Windows 0.1.39 EXE QA is still needed to verify cover readback-hash writeback, playlist / all-songs custom-order persistence, playback/pause, folder restore, AI, and Mini/dialog focus. Current evidence includes source-level checks, installer build, DMG verify, read-only DMG readback, packaged guard readback, and Windows NSIS static check.
- Full packaged GUI mouse-only repeated-cover QA is still needed with temporary music copies and an isolated profile: replace the same track cover at least twice, apply to the original file, confirm readback hash prevents false success, and restart to confirm the final cover remains. Do not open or modify the user's original Music folder.
- 0.1.39 only adds the cover readback-hash path and playlist order persistence. It does not add dependencies, clear IndexedDB, rescan the library, change the DB schema, add `coverRevision`, or add new MIME side doors.
- Original-file tag writeback is still limited to MP3, FLAC, and M4A.
- This round was not synced or pushed to GitHub per user request.

## 0.1.38 Manual QA Still Needed

- Real Windows 0.1.38 EXE QA is still needed to verify the seven-option sort dropdown, cover replacement, and original-file writeback. Current evidence includes source-level checks, real Plazma temp-copy writer/readback, installer build, DMG verify, read-only DMG readback, packaged alias readback, and Windows NSIS static check.
- Packaged macOS GUI was opened from the DMG with an isolated profile, and the seven sort options were confirmed. The native cover file picker can be opened by real mouse click, but full mouse-only cover selection needs explicit user approval for the macOS privacy prompt; Codex did not grant that permission on the user's behalf.
- 0.1.38 only adds sort-control guarding and cover MIME aliases. It does not add dependencies, rescan the library, change the DB schema, or compress covers.
- Original-file tag writeback is still limited to MP3, FLAC, and M4A.
- This round was not synced or pushed to GitHub per user request.

## 0.1.37 Manual QA Still Needed

- Real Windows 0.1.37 EXE QA is still needed to verify repeated cover replacement and original-file writeback. Current evidence includes source-level checks, real Plazma temp-copy writer roundtrip, installer build, DMG verify, read-only DMG readback, packaged fallback readback, and Windows NSIS static check.
- Full packaged GUI mouse QA is still needed with temporary music copies and an isolated profile: replace the same track cover at least twice, apply to the original file, confirm the second write does not fail because of empty / `application/octet-stream` MIME, and restart to confirm the final cover remains.
- 0.1.37 only adds cover MIME fallback. It does not add dependencies, rescan the library, change the DB schema, or compress covers.
- Original-file tag writeback is still limited to MP3, FLAC, and M4A.
- This round was not synced or pushed to GitHub per user request.

## 0.1.36 Manual QA Still Needed

- Real Windows 0.1.36 EXE QA is still needed to verify metadata / cover reads are complete. Current evidence includes source-level checks, packaging regression checks, installer build, DMG verify, read-only DMG readback, packaged renderer/main readback, and Windows NSIS static check.
- Removing the player-local "save to player" button is intentional. The current song-info save path writes supported MP3/FLAC/M4A files back to the original file, rereads the track, and saves that refreshed single-track metadata record.
- 0.1.36 only adds TagLib property-key aliases. If real 10k-track metadata performance is not enough, design WASI path mode / background indexing separately later.
- Original-file tag writeback is still limited to MP3, FLAC, and M4A.
- This round was not synced or pushed to GitHub per user request.

## 0.1.35 Manual QA Still Needed

- Real Windows 0.1.35 EXE QA is still needed to verify metadata / cover reads are restored. Current evidence includes source-level checks, packaging regression checks, installer build, DMG verify, read-only DMG readback, and Windows NSIS static check.
- 0.1.35 intentionally uses Emscripten buffer mode for packaged metadata reads. If real 10k-track metadata performance is not enough, design WASI path mode / background indexing separately later.
- This round was not synced or pushed to GitHub per user request.

## 0.1.34 Manual QA Still Needed

- Packaged GUI QA with 100+ temp tracks is still needed to verify the main-window scrollbar remains available, the playlist song list shows its own internal scrollbar when long, mouse wheel events over the playlist prioritize the song list, both scrollbars appear only on overflow, no horizontal scrollbar appears, and bottom content is not clipped by the mini player.
- Real Windows 0.1.34 EXE QA is still needed for fresh install, main-window scrollbar, playlist-internal scrollbar, playback/pause, folder restore, AI, Mini player, and dialog focus.
- The 0.1.34 source-level guard and packaged asar/CSS readback confirm the main window and playlist are separate scroll containers and `PlaylistPanel` has a real height bound, but this is not a full packaged GUI large-library stress test.
- 0.1.34 did not add a virtualization dependency; if real 10k-track GUI scrolling still falls short, use a separate mature virtualization / thumbnail-cache design later.
- This round was not synced or pushed to GitHub per user request; a later release step must commit / push / read back `origin/main` if remote publishing is needed.

## 0.1.33 Manual QA Still Needed (Historical)

- Packaged GUI QA with 100+ temp tracks is still needed to verify main-window scrolling over general content, playlist-internal scrolling over the song list, both scrollbars appearing only on overflow, no horizontal scrollbar, and no bottom-content clipping by the mini player.
- Real Windows 0.1.33 EXE QA is still needed for fresh install, main-window scrollbar, playlist scrollbar, playback/pause, folder restore, AI, Mini player, and dialog focus.
- The 0.1.33 source-level guard and packaged asar/CSS readback confirm the main window and playlist are separate scroll containers and body no longer globally uses `overflow:hidden`, but this is not a full packaged GUI large-library stress test.
- 0.1.33 did not add a virtualization dependency; if real 10k-track GUI scrolling still falls short, use a separate mature virtualization / thumbnail-cache design later.
- Headless browser runtime was limited by the missing Playwright browser cache and Chrome CLI exit 134, so mouse / trackpad GUI scrolling is not marked PASS.

## 0.1.32 Manual QA Still Needed (Historical)

- Packaged GUI QA with 100+ temp tracks is still needed to verify that the left column has no playlist scrollbar, the playlist panel has the restored 0.1.28 height, mouse wheel / trackpad / scrollbar dragging affect only the song list, the final track stays above the mini player, and no horizontal scrollbar appears.
- Real Windows 0.1.32 EXE QA is still needed for fresh install, playback/pause, folder restore, AI, Mini player, and dialog focus.
- The 0.1.32 source-level guard confirms the left column no longer owns playlist overflow and `PlaylistPanel` restores the 0.1.28 height, but it is not a full packaged GUI large-library stress test.
- 0.1.32 did not add a virtualization dependency; if real 10k-track GUI scrolling still falls short, use a separate mature virtualization / thumbnail-cache design later.

## 0.1.31 Manual QA Still Needed (Historical)

- Packaged GUI QA with 100+ temp tracks is still needed for mouse wheel, trackpad, scrollbar dragging, final-track visibility above the mini player, and no horizontal scrollbar.
- Real Windows 0.1.31 EXE QA is still needed for fresh install, playback/pause, folder restore, AI, Mini player, and dialog focus.
- The 0.1.31 source-level guard confirms the app body no longer owns playlist overflow, but it is not a full packaged GUI large-library stress test.
- The installed global `build-music-player` skill now delegates GitHub publishing to the global `github-update-flow` skill; the project-local `docs/skills/` split is also done.

## 0.1.30 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.30.exe` has not been installed on a real Windows machine for fresh install, launch, right-edge playlist scrollbar behavior, fixed search/sort header, no left-column scrolling, no mini-player overlap on the last tracks, no horizontal scrollbar, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- Real packaged GUI large-library mouse / trackpad scroll QA remains open and must use temp music data plus an isolated profile.
- `check:track-list-virtualization` is a source-level regression guard, not a full packaged GUI stress test.

## 0.1.29 Manual QA Still Needed

- `Aquariusgirl Music Room Setup 0.1.29.exe` has not been installed on a real Windows machine for fresh install, launch, internal playlist scrolling, no playlist overlap with the bottom player, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- The dev browser measurement used an empty playlist. Real large-library GUI scrolling still needs a temp music copy and isolated profile.
- The track-list source guard covers the scroll-bound regression, but it is not a full packaged GUI stress test.
- The Windows EXE is unsigned, so SmartScreen warnings are expected. Developer ID signing and notarization are not configured for macOS.
- 0.1.29 fixes playlist scroll bounds. If real 10k-track GUI scrolling still falls short, consider a separate mature virtualization / dynamic viewport design later.

## 0.1.28 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.28.exe` has not been installed on a real Windows machine for fresh install, launch, large-cover playback, five repeated cover updates, playlist song-info restart persistence, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- The new cover-update and playlist-restart checks are source-level regression guards, not full packaged GUI stress tests.
- The new console warning guards are diagnostic only; packaged GUI stress behavior still needs a temp music copy and isolated profile.
- Packaged macOS GUI stress QA still needs a temp music copy and isolated profile.
- The Windows EXE is unsigned, so SmartScreen warnings are expected. Developer ID signing and notarization are not configured for macOS.
- 0.1.28 fixes the metadata save loop and full-library rewrite path. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is available for player metadata, but it does not modify the original audio file.
- 0.1.28 does not split artwork into a separate object store; that should be a separate design only if large-library stress tests still show a need.
- 0.1.28 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.27 Manual QA Still Needed

- `Aquariusgirl Music Room Setup 0.1.27.exe` has not been installed on a real Windows machine for fresh install, launch, second song-info / cover writeback after an earlier successful writeback, first-restart cover persistence, playback after changing cover art while playing, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- Packaged macOS GUI mouse QA was not completed in this round. The next pass must use a temp music copy and isolated profile to verify second writeback, restart cover persistence, playlist retention, and no playback stall while editing metadata / cover.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.27 fixes the song-info panel second-writeback state machine and writeback format guard. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.27 does not clear the whole music database after every song-info edit. Large-scale indexing or thumbnail caching should be designed separately if truly needed.
- 0.1.27 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.26 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.26.exe` has not been installed on a real Windows machine for fresh install, launch, playback after changing cover art while playing, cover02 -> cover01 first-restart persistence, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / AI runtime checks. Developer ID signing and notarization are not configured.
- Packaged macOS isolated QA was completed: the 0.1.26 DMG app used an isolated profile and only loaded the temp copy at `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test`; Plazma Cover 02 -> Cover 01 original-file writeback passed while playing, switching away and back did not stall, and the playlist still kept Plazma after restart.
- Native macOS dialog selection for hidden `/private/tmp` paths used a local harness because accessibility permission was unavailable. This is a QA operation limitation, not an app behavior conclusion.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.26 fixes the edited-track metadata snapshot save race after original-file writeback. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.26 does not clear the whole music database after every song-info edit. Large-scale indexing or thumbnail caching should be designed separately if truly needed.
- 0.1.26 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.25 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.25.exe` has not been installed on a real Windows machine for fresh install, launch, playback after changing cover art while playing, cover02 -> cover01 persistence after restart, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify. `hdiutil attach` / `imageinfo` were blocked by device permission and usage limits, so read-only DMG version / arm64 / app.asar readback is not marked PASS.
- The Codex sandbox rejected direct Electron GUI launch, so mouse-driven GUI validation was not completed this round.
- Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.25 fixes the same-source audio reload residue. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.25 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.
- The installed `build-music-player` skill still needs the 0.1.25 lesson update because `~/.codex/skills` writes were blocked by the usage limit.

## 0.1.24 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.24.exe` has not been installed on a real Windows machine for fresh install, launch, playback after changing cover art while playing, cover02 -> cover01 persistence after restart, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.24 fixes metadata/cover-only audio reload and IndexedDB save ordering. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.24 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.23 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.23.exe` has not been installed on a real Windows machine for fresh install, launch, no artist flicker between real artist text and `未知歌手`, playback/pause click testing, latest-folder restore, a roughly 4 GB / 20+ song folder, song info writeback, cover02 -> cover01 writeback, playlist persistence after cover changes, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.23 fixes weak stored metadata overwriting stronger current metadata. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.23 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.22 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.22.exe` has not been installed on a real Windows machine for fresh install, launch, `Cover 02.jpg` -> `Cover 01.jpg` writeback, >3 MB and <=5 MB JPG preview/writeback, >5 MB too-large messaging, playback/pause click testing, a roughly 4 GB / 20+ song folder, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- The cover limit is currently 5 MB to support real album art while avoiding oversized images on the M1 MacBook Air 8GB. Add compression/thumbnailing only if larger covers become a real need.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.22 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.21 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.21.exe` has not been installed on a real Windows machine for fresh install, launch, play/pause click testing, no flashing playback state, filename-first display with artist on the second line, latest-folder restore after restart, a roughly 4 GB / 20+ song folder, 99+ track startup feel, song info editing, MP3/FLAC/M4A original-file writeback, cover02 -> cover01 writeback, playlist persistence after cover changes, AI chat, and AI playlist busy-state UX.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify and read-only version / arm64 / app.asar / prompt / runtime checks. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- Startup auto-restore uses IndexedDB metadata first. If original tags are changed outside the player, use explicit reload / source reselection to refresh metadata.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.21 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.
- The ten-thousand-track goal was addressed by skipping per-file metadata reads during startup restore, but a real 10k-track GUI stress test has not been completed.

## 0.1.20 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.20.exe` has not been installed on a real Windows machine for fresh install, launch, play/pause click testing, no flashing playback state, latest-folder restore after restart, a roughly 4 GB / 20+ song folder, song info editing, MP3/FLAC/M4A original-file writeback, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify, but DMG read-only mount version / arm64 architecture readback was blocked by usage limits this round. Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is not offered as a fallback save path.
- 0.1.20 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.19 Manual QA Still Needed (Historical)

- `Aquariusgirl Music Room Setup 0.1.19.exe` has not been installed on a real Windows machine for fresh install, launch, selecting a roughly 4 GB / 20+ song folder, playback, song info editing, MP3/FLAC/M4A original-file writeback, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify, version, arm64 architecture, prompt, runtime, and packaged `taglib-wasm` static checks, but Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- Original-file writeback currently supports MP3, FLAC, and M4A only. Player-local metadata saving is no longer offered as a fallback save path.
- The large-folder crash path was addressed by avoiding whole-audio IPC transfer, but it still needs real Windows QA with a user-scale folder.
- 0.1.19 bundles the model, llama.cpp runtime, and `taglib-wasm`, so installers are larger than player-only builds.

## 0.1.18 Manual QA Still Needed

- `Aquariusgirl Music Room Setup 0.1.18.exe` has not been installed on a real Windows machine for fresh install, launch, folder selection, AI chat, and AI playlist creation.
- The Windows EXE has only NSIS / x64 target static checks, so Windows runtime behavior is not marked PASS.
- The macOS DMG passed verify, version, arm64 architecture, prompt, and runtime static checks, but Developer ID signing and notarization are not configured.
- The Windows EXE is unsigned, so SmartScreen warnings are expected.
- 0.1.18 bundles the model and llama.cpp runtime, so installers are much larger than player-only builds.

## 0.1.16 Known Limits

- AI playlist search uses metadata keywords, aliases, and mood scoring. No embedding model or vector database was added.
- If the user's library metadata is incomplete, AI search may find no matches. This is intentional; the app should report no match instead of inventing songs.
- Real Windows QA is still needed for AI playlist creation, the playlist / AI Assistant tabs, and focus behavior.

## Release Limits

- Apple Developer ID / notarization is not configured.
- Windows code signing is not configured.
- Large installers are not tracked in Git; they should be delivered through local delivery or release artifacts.
