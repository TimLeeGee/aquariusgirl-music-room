# 版本資訊

產品：Aquariusgirl Music Room / 水瓶罐子的音樂小水池
版本：0.1.18
日期：2026-06-29
平台目標：Windows x64、macOS arm64

## 2026-06-29 0.1.18 最新發行狀態

0.1.18 補強 AI playlist 的 schema、result guard 與 safe reply：工具任務一律 summary-only，不允許模型列出歌曲清單或 track title；播放清單內容仍只由播放器資料庫與 `playlist.trackIds` 決定。三份 prompt 維持開源文字檔，未新增 prompt 檔；模型設定維持集中在 `electron/ai/aiModelConfig.ts`。

`npm run check:prompts`、AI track search/schema check、AI assets、all-target AI assets、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、build、Electron compile、升權 `npm run dist:release` 均通過。DMG verify VALID；唯讀掛載後封裝版本為 0.1.18，執行檔為 arm64，包內只有三份 prompt `.txt`，無 prompt `.bin`，runtime 只保留 `darwin-arm64/llama-server`。EXE 為 Windows NSIS installer；Windows 真機與正式簽章仍需驗收。

SHA-256：

- EXE：`e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`
- arm64 DMG：`0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`

### English Summary

0.1.18 strengthens AI playlist schema validation, result guards, and safe replies. Tool tasks are summary-only, the model may not output track lists or track titles, and playlist contents remain determined only by the local database and `playlist.trackIds`. The project still uses only the three open prompt text files.

Passed: prompt checks, AI track search/schema checks, AI assets, all-target AI assets, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, build, Electron compile, elevated `npm run dist:release`, DMG verify, packaged version/architecture/prompt/runtime checks, and Windows NSIS static check. Real Windows QA and signing remain open.

## 2026-06-28 0.1.17 最新發行狀態

0.1.17 將 AI 助手改成 rule-first 的本機工具架構：小模型只做 intent JSON 與短回覆潤飾，真正的搜尋、隨機歌單、建立歌單、加入歌單與移除安全說明都由播放器程式執行。Prompt 改為 `private/prompts/` 三份開源文字檔：`character_prompt.txt`、`ai_router_prompt.txt`、`ai_reply_prompt.txt`，不再加密、不再產生 prompt bundle。

`npm run check:prompts`、AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、all-target AI assets、build、Electron compile、升權 `npm run dist:release` 均通過。一般沙盒仍會在 macOS `hdiutil create` 失敗，升權重跑後完成。交付位置只有兩個 installer；DMG 唯讀驗證 VALID，封裝版本為 0.1.17，執行檔為 arm64，包內只有三份 prompt `.txt`，無 prompt `.bin`。EXE 為 Windows NSIS installer；Windows 真機與正式簽章仍需驗收。

SHA-256：

- EXE：`b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- arm64 DMG：`c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

### English Summary

0.1.17 changes the AI assistant into a rule-first local tool architecture. The small model only emits intent JSON and polishes short replies; app code performs local search, random playlist creation, playlist creation, playlist insertion, and safe removal guidance. Prompts are now three open text files in `private/prompts/`, with no encrypted prompt bundle.

Passed: `npm run check:prompts`, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, all-target AI assets, build, Electron compile, and elevated `npm run dist:release`. DMG verify is VALID, packaged version is 0.1.17, the app executable is arm64, packaged prompts are `.txt`, and no prompt `.bin` is present. Windows EXE is a NSIS installer but still needs real Windows QA and signing.

SHA-256:

- EXE: `b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- arm64 DMG: `c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

## 2026-06-28 0.1.16 歷史發行狀態

0.1.16 修正 AI 建立播放清單：隨機、關鍵字與睡前等需求都只從目前已載入/已索引的真實本機歌曲 metadata 挑選，找不到歌曲時不建立假歌。AI 面板移入右側歌單卡，以 `歌單 / AI 助手` 分頁切換；未新增 embedding 模型或向量資料庫。

AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、secure prompts、all-target AI assets、build、Electron compile、`dist:mac`、`dist:win` 均通過。兩個 DMG 唯讀掛載 CRC 通過，封裝版本均為 0.1.16，架構分別為 arm64／x86_64，且包含模型與加密 prompt bundle。EXE 為 Windows NSIS installer；Windows 真機與正式簽章仍需驗收。

SHA-256：

- EXE：`38a37f0d4cbab4237439fccb5d24baf1b6319e8dadaee5fa325159f8907f4af7`
- arm64 DMG：`04e348006c00df084a7d08ad3c8ec8b564bc998bb9be6ac6cf21627501b1131c`
- x64 DMG：`a90098927ffcc360f42b4624e7fc26357625710040be857c659acd22dcb223d3`

### English Summary

0.1.16 fixes AI playlist creation so random, keyword, and mood requests only select real local tracks that are currently loaded or indexed. If no match exists, the app reports no match instead of creating fake songs. The AI panel moved into the playlist card as `Playlists / AI Assistant` tabs. No embedding model or vector database was added.

Passed: AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, secure prompts, all-target AI assets, build, Electron compile, `dist:mac`, and `dist:win`. DMG read-only checks confirmed version 0.1.16 and arm64 / x86_64 architectures. Windows EXE is a NSIS installer but still needs real Windows QA and signing.

SHA-256:

- EXE: `38a37f0d4cbab4237439fccb5d24baf1b6319e8dadaee5fa325159f8907f4af7`
- arm64 DMG: `04e348006c00df084a7d08ad3c8ec8b564bc998bb9be6ac6cf21627501b1131c`
- x64 DMG: `a90098927ffcc360f42b4624e7fc26357625710040be857c659acd22dcb223d3`

## 2026-06-28 14:32 最新發行狀態

0.1.15 內建離線 AI 現已把播放清單建議整合進聊天：音樂相關對話先詢問是否整理，取得同意或直接要求建立播放清單後才產生候選歌單；聊天保留極短本機上下文記憶，首次載入本機 AI 模型時會提示請稍等。使用者安裝 EXE / DMG 後不需要 Ollama、不需要 Node.js、不需要另外下載模型。

`npm run encrypt:prompts`、`check:secure-prompts`、all-target `check:ai-assets`、AI track search check、build、Electron compile、`dist:mac`、`dist:win` 均通過。兩個 DMG 唯讀掛載 CRC 通過，封裝版本均為 0.1.15，架構分別為 arm64／x86_64，且各自只保留對應 mac runtime。EXE 為 Windows NSIS installer；Windows 真機與正式簽章仍需驗收。

SHA-256：

- EXE：`e2feba0e6a9fd466f4a339bd0bdb57031ff7a4631f3247ccd91856e2a4e34921`
- arm64 DMG：`717eb5d5edda12552d85407fb3309f9a3842c13e2940e521c0c72af827bb0680`
- x64 DMG：`0416418659b2439f09450180062b7572984c3d8cb672593dbdf975b7bcf090e4`

## 2026-06-22 17:44 最新發行狀態

0.1.15 移除 README、新手引導與未使用資料管線中的歌詞／LRC 殘留，不新增替代功能或套件。舊 IndexedDB 退役資料不主動刪除，只停止使用，避免破壞使用者資料。

全部既有檢查、build、Electron compile、精準殘留掃描、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過；arm64 packaged `file://` 與隔離新手引導驗收通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`df47559e42f427183a37afd6a0a9cf964654496efa21ea6526a5939c84b9ce16`
- arm64 DMG：`bb7f6b6bbaf2d0533b281536ef3aa3da2cdbb287153561a6473bb506e42c1907`
- x64 DMG：`969ba94c1b06b80730684d94b8b7fe100dae1b4c92763ffda49886dc76b38fed`

## 2026-06-21 23:54 歷史發行狀態

0.1.14 將目前播放卡「加入歌單」原生欄位固定為 `w-36 shrink-0`，並以 renderer `PlaylistDuplicateDialog` 取代重複加入時的 `window.confirm()`。保留既有重複確認語意，未新增套件或改歌單資料結構。

全部既有檢查、build、Electron compile、隔離 Electron 連續加入／取消／確認、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。arm64 packaged `file://`、正式 recovery 14／2／4、一般→MINI→一般及隔離 packaged 重複確認均通過；Windows 真機仍需驗收。

SHA-256：

- EXE：`a9c88a5183a01e889aaead12731dbe597a010eaf0b084c9001edff8fddba2dc2`
- arm64 DMG：`562b4d248100dfda1e36432b5cbdc78dfcdadf6c449689ab4f42a1ebf7bf5436`
- x64 DMG：`f94da4f1074d1b7b089993a27e0aae8ada10c401fde012be28ca3d41ef757687`

## 2026-06-21 18:57 歷史發行狀態（recovery 已於 0.1.14 完成）

0.1.13 沿用既有 `getCenteredFullBounds()`，在較小工作區以 90% 寬高置中啟動，大螢幕仍維持 `1280×860` 上限；避免啟動預設鋪滿工作區並降低首屏繪製面積。未新增設定或套件。

既有檢查、build、Electron compile、Electron dev 一般視窗／MINI 往返、`dist:all`、DMG verify、版本／架構、EXE static check及 arm64 packaged 一般視窗／`file://`／preload 均通過。packaged 最終 MINI 手順前需先完成 QA 報告記錄的 IndexedDB recovery；Windows 真機仍需驗收。

SHA-256：

- EXE：`d4514ea3237d8fe259c2aeee659227b069dfb30b5f9c7bd9ce0091a082b7f50d`
- arm64 DMG：`aa633b8d5aa44a2e1b6b584544770a17c95b4717279479d4a9039b47c91f3667`
- x64 DMG：`ec62642007c1c78eac70dd20b05d6bac955a79659e1ba24c82e7e9acbc8572a3`

## 2026-06-21 14:10 最新發行狀態

0.1.12 在進入 MINI 前解除原生 full screen／maximize 狀態並保存 normal bounds，避免 Windows 從最大化視窗切換時欄位跑版；同時把 MINI 頂部安全區納入既有拖曳區，控制項仍不可誤拖。

所有既有 source checks、build、Electron compile、Electron dev 全螢幕切換／拖曳／返回完整播放器與 `dist:all` 均通過；EXE static check 與唯一交付位置通過。兩個 DMG checksum 均為 VALID，封裝版本均為 0.1.12，架構分別為 arm64／x86_64；arm64 packaged `file://`、preload IPC 與 Full→MINI→拖曳→Full 均通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`41686e855bb514328c57d797e74f16eda31b3a3f035c5407e83d92b623478865`
- arm64 DMG：`20040d2dd0104810e6599e0d434a92ec99eaa9a986eb4895266ffe54587d100f`
- x64 DMG：`9af0ff8b1b6933580d62713d85aa96890541f88d52003c5e7096a9ba66cfca4c`

## 2026-06-21 13:33 最新發行狀態

0.1.11 將歌曲列「加入歌單」下拉欄位固定為 `w-32 shrink-0`，不再因歌單名稱或「已在歌單」選項文字而改變每列寬度。

完整既有檢查、Electron dev 長短歌曲／超長歌單 GUI、build、Electron compile、arm64 packaged `file://`、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。Windows 真機仍需依使用者截圖確認。

SHA-256：

- EXE：`556561a2e87d1265b2d0d0cae91d471655356218d6880beec81d6b2e07de86ec`
- arm64 DMG：`c9a41bf19828790f7632439be936cfc2dc1de07bed13890611759106199bf5de`
- x64 DMG：`1c527db042d0c923ca87b526af3e7b0cf3c46286f69e740ad8a759f128064f07`

## 2026-06-21 11:03 最新發行狀態

0.1.10 修正 Windows MINI 欄位間距與堆疊：保留 20px 原生標題列安全區，Windows 固定尺寸為 `260×288`，macOS 維持 `260×268`，進度與音量列使用相同行高。

完整既有檢查、build、Electron compile、Electron dev、arm64 packaged `file://`、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。Windows 真機仍需依使用者截圖手順確認原生按鈕與四列控制間距。

SHA-256：

- EXE：`5200e4f0432b83d31b973f73e0909554a424e05cd5abb4e087033659bf426aa5`
- arm64 DMG：`1fdabd57eff6ce78b3fa2774b8ef15c587ce0fad636aa7267f1bccb603962ac8`
- x64 DMG：`594bb0e13085cb4211ab7e511744fd580bf7cdb745b8348c4cad01fde5dc4068`

## 2026-06-21 10:26 最新發行狀態

0.1.9 修正 Windows MINI 視窗在待機或播放時逐漸變大：bounds 回寫只保存位置，寬高固定為 `260×268`，未改其他 UI 或播放功能。

完整既有檢查、build、Electron compile、Electron dev、arm64 packaged `file://`、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。Windows 真機仍需確認待機與播放狀態皆不再漂移。

SHA-256：

- EXE：`4ce034653261c6fa808c5970112b4d3adead7f3f8ef6a80c88c5494d8c764ba3`
- arm64 DMG：`65af95bf13ecaafd3803b346d9dfcce8bcf517baf787f06e8b0fbbf3b23bd1b2`
- x64 DMG：`7aa2600ba506d8f5451fd70dfe653f05755c9138353545fbc930f1c1311a2c0c`

## 2026-06-20 23:02 最新發行狀態

0.1.8 在外觀設定新增 MINI 背景色相與 MINI 原生視窗透明度欄位；色相同時套用底部 MINI 列及桌面 MINI 視窗，透明度沿用既有單一 `20–100%` 原生視窗狀態。全部復原會回到色相 232／透明度 92%。

相關檢查、build、Electron compile、Electron dev 色相／20%／100%／復原、`dist:all`、DMG verify、arm64 packaged `file://`、封裝版本／架構與 EXE static check 均通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`73b05fb9d97724216ef99ff68a260c5fca9ad51012692252babbf1ecca8f8e56`
- arm64 DMG：`2de7b79107763012be47fdbd3209d50a3f2cd94bdc3a19f0dac89c37e65d6ae3`
- x64 DMG：`34fa962543359f7276138a997d23dfd4ae0910b9d81bd75d8470db6a63415d65`

## 2026-06-20 22:21 最新發行狀態

0.1.7 在色彩設定加入共用面板背景色相，並新增共用面板、主背景、角色舞台遮罩與左右裝飾四項 `0–100%` 透明度。設定會保存、匯出／匯入與全部復原；預設仍維持暗色系。

相關檢查、build、Electron compile、Electron dev 邊界／保存／復原、`dist:all`、DMG verify、arm64 packaged `file://`、封裝版本／架構與 EXE static check 均通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`43a321fd0ddb7018b0392c33b60e6f41dba2a3ae743469ec50c9a061125fbd8f`
- arm64 DMG：`e059e0d15a2a1f913f4594429cd776a03f358a62c7dd36ae1cf6b13b9b09968b`
- x64 DMG：`83b15d81a3c15710642d9763afdd8d28b59d56f5788ea207bc2d3a56da02749e`

## 2026-06-20 17:47 最新發行狀態

0.1.6 將 Header、歌單、工具、備份、播放器等共用面板改為固定深藍黑，角色舞台另加深色遮罩；主背景仍清楚，整體恢復預設暗色系。

色彩／圖片與既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、封裝版本／架構及 EXE static check 均通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`de606ba39ca9ac0b834c99b72207d81f6bf042ec12458ef10e750690091899bc`
- arm64 DMG：`064aa1dbb0ece3842c48b87b09c701aa1d83c7c0146e7f61895ea01fc2a16651`
- x64 DMG：`5e905776a4aa8543b05c2d104355bba27a460c130ef6a304cfac9bda33f3c408`

## 2026-06-20 17:24 最新發行狀態

0.1.5 提高主背景透明度、移除模糊，並將原本全不透明的主題漸層改為半透明；背景人物與城市細節現在清楚可辨識，卡片文字仍保持可讀。

圖片與既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、封裝版本／架構及 EXE static check 均通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`dc6952d33d529a24ecce185b9d1e9edac1b2b11607082481ee1f5193e437a771`
- arm64 DMG：`c756b2db676c768d771759f2061e4fcf50b41b0600fac6d48c65a9d246924bfb`
- x64 DMG：`0f4f9dc0457fc72e22449081bb7ab7337a695856f89f94837afc292d3e09baf6`

## 2026-06-20 17:05 最新發行狀態

0.1.4 修正主背景與兩張裝飾被層級蓋住：主背景回到底層，藍色與黃色裝飾固定顯示於左右下角且不攔截操作。未新增套件或元件。

圖片與既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、封裝版本／架構及 EXE static check 均通過。Windows 真機仍需驗收。

SHA-256：

- EXE：`fb2446c411f45723ef0588190850c1c8e9b3528a2b44ae340b1319b8b1967e83`
- arm64 DMG：`d784e4dad38033a01c197d2cb429d5b0e484f537e354f99b99aa4d89b9dc1072`
- x64 DMG：`c4a00149bd8fbf27a5caacc1d0921727c52f7d50a2f43f7d92e3ce285aefdde5`

## 2026-06-20 16:31 最新發行狀態

0.1.3 精準補上 FLAC 原生 `PICTURE` 內嵌封面解析；不新增套件、不掃描同資料夾 JPG，也不改動 UI、播放與歌單。

FLAC 封面回歸檢查、既有功能檢查、build、Electron compile、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。截圖中的真實 Windows FLAC 尚需在 Windows 0.1.3 EXE 人工匯入確認。

SHA-256：

- EXE：`a15dd39eb4c93332e5fec6e2becdbf6ec9283069b862555c67d34ea9addeaf26`
- arm64 DMG：`3a6a763336edaed44fe6fb7ad15f376e66feac120a9ba0fb2b4f2440a5f8a05e`
- x64 DMG：`feb7163b18028030ad09ea7585947ff3dd2b34c83b9ceaf5e08617c9e9213339`

## 2026-06-19 17:16 最新發行狀態

0.1.2 在原有九張圖片設定上加入「圖片／色彩」分頁，以及主色、輔色、金色點綴、文字、背景五組色相設定。設定會即時保存、納入匯出／匯入，並可一鍵全部復原。

色彩與既有功能檢查、build、Electron compile、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。Windows 真機及 Electron 拉桿保存／復原仍需人工驗收。

SHA-256：

- EXE：`9093c687fa4a22b5999ae5ab67d585d46d374b04f2ae68c3a1390dd4b3379c1a`
- arm64 DMG：`550bcfdf13498794807555acd6c9199354191c91c65e0cde41485a9fd9123ac7`
- x64 DMG：`24d3bb982f38d4cef7b23e5c975bf5dcf83f3be28391611dca91be3ec784e491`

## 2026-06-19 10:44 最新發行狀態

0.1.1 新增九張介面圖片的自訂設定。內建素材仍在 `public/assets`，自訂圖片只保存 App userData 副本，可隨時回復預設；右上控制列新增同尺寸設定按鈕並維持 8px 等距。

圖片邏輯檢查、build、Electron compile、Browser 視覺驗收、`dist:all`、DMG verify 與 EXE static check 均通過；Electron 原生 dialog／重開保存與 Windows 真機仍需人工驗收。

SHA-256：

- EXE：`007258edcaad2fb5bc10627f449fd9b34fa71fe1092b7e56cbc36dbb3185cc84`
- arm64 DMG：`52c2587e25e1c7c73e5bc2dc791231132f2436143344c31f603ee532c7a97341`
- x64 DMG：`57235449c5675f67b176544e87feb77f5a04bf475c10c7dd00156069e89e9a9e`

## 2026-06-18 22:05 最新發行狀態

本版修正智慧型播放清單無法移除歌曲：垃圾桶會把歌曲持久排除於目前智慧清單，不刪除歌曲庫；同時將 MINI 透明度下限改為 20%。邏輯檢查、build、Electron compile、打包、DMG verify 與 EXE static check 均通過；真實音樂庫 GUI 與 Windows 真機仍需人工驗收。

SHA-256：

- EXE：`dfc230f64c0f7628167865121a0026f3b43b368084b3beeafe21aeafc226de8b`
- arm64 DMG：`a2709c940f8ff6b22b20f21486707cba3008ddf7101c5e1fca1170f7490940c6`
- x64 DMG：`ac9df4136730751cfadeba19b0ee3516c52b225e033ea01db38aadbae1f12dc3`

## 2026-06-18 21:52 最新發行狀態

本版新增 MINI 透明度百分比數字輸入與左右 ±5 控制，保留 60–100% 防呆與設定保存，並將 MINI 間距、圓角和控制尺寸統一。MINI 瀏覽器實際尺寸驗收、build、Electron compile、打包、DMG verify 與 EXE static check 均通過；Windows 真機與原生透明度仍需人工點擊驗收。

SHA-256：

- EXE：`00062579245d060464ff632cfe09be5c2bfdbe00ee880ccec1d9b29330cf2e5a`
- arm64 DMG：`5a5af6ed942a17ad4355265293368407a3d20f4c10395d800f31e6e1a3769236`
- x64 DMG：`eec1fd9ff7be1ec43a3ec1f082856c837baeaea5e92de56d0d4328b6cffb451e`

## 2026-06-18 18:28 最新發行狀態

本版移除播放清單刪除流程的原生 `window.confirm()`，改用 renderer 內嵌確認框，避免 Windows Electron 在原生對話框關閉後遺失鍵盤焦點；上一版無效的 focus IPC 已同步移除。

小型檢查、build、Electron compile、完整 Chromium 焦點手順、`dist:all`、DMG verify 與 EXE static check 均通過。Windows EXE 尚需真機重跑原始手順，installer 尚未簽章。

SHA-256：

- EXE：`c68cb42971ad69be009c6e0e0fb76b465cd8c923a896450739e725127ee98eb6`
- arm64 DMG：`2c8003788853e76e9f42daea272c48d0a354454a4d1e6013a04c21fdebac00a7`
- x64 DMG：`d1526a3a54e2e276f88b63cd5cbf6b9125c488262036c80ec0ef7d4dfd4bece5`

## 2026-06-18 17:37 最新發行狀態

本版新增最小焦點修正：原生刪除確認關閉後還原 renderer 與 Electron host window 焦點，智慧型播放清單名稱欄位每次開啟自動聚焦。

build、Electron compile、Chromium 名稱欄位 active／輸入、`dist:all`、DMG verify 與 EXE static check 均通過。Windows EXE 尚需真機重跑原始手順，installer 尚未簽章。

SHA-256：

- EXE：`cc4bb14ae84a27bcb2b7073e5172fdbd6fe6a8b2fa178c5db094ef1eecce80df`
- arm64 DMG：`ac705bc5f1e6e5e32469672091bc4ee1e8b0e0fc19885d5bda11c88ee8fa72dd`
- x64 DMG：`24f75bd1a4dec264c26d9fa161d0dbe63457827047e6c209240d410f26ae5fe0`

## 2026-06-18 16:45 最新發行狀態

已重新輸出包含以下修正的測試 installer：

- 自訂播放清單刪除只影響該播放清單。
- 「全部歌曲」刪除會同步清除所有自訂播放清單裡同一 track id。
- 移除「最近播放」與「最常播放」。

`playlist-logic-check`、build、Electron compile、`dist:all`、兩個 DMG verify 與 EXE static check 均通過。最新版只在 `release-delivery/installers/`，時間為 2026-06-18 16:44:44 CST；Windows 尚未實機驗收，installer 尚未簽章。

SHA-256：

- EXE：`04d8c6745b3d80a41989f467011631f1596eecba6fe70e9024b6ec1df5565e6a`
- arm64 DMG：`3a9d8ddb7cba670359202fdacc84873f4ebd787ecf1c5068b7fe0ef0175ad3e4`
- x64 DMG：`0fc571fb7695d0eb0a7d0038b49b8f4aac58476553a4f0805b6f0b942e407c7a`

## 2026-06-17 19:55 程式狀態（尚未發行 installer）

已完成但尚未打包成新版 DMG / EXE：

- 自訂播放清單刪除歌曲只移出該播放清單，不刪歌曲庫。
- 「全部歌曲」刪除才真正移除歌曲，並同步清掉所有自訂播放清單裡同一 track id。
- 移除「最近播放」與「最常播放」系統清單。
- 舊 active playlist id 若指向已移除系統清單，會回到「全部歌曲」。

已通過：

- `node scripts/playlist-logic-check.mjs`
- `npm run build`
- `npm run electron:compile`

限制：

- 最新 installer 仍是 2026-06-17 19:07:16 CST 版本，不包含本輪 19:55 修正。
- 升級權限打包被系統用量限制擋下；下輪需先清 `release/` 暫存，再重新 `npm run dist:all`。

## 2026-06-17 19:08 最新發行狀態

已完成本輪精準修正並成功重新輸出 installer。

已完成：

- 自動恢復上次音樂清單時，只重建歌曲庫，不再把恢復到的歌曲追加進目前自訂播放清單。
- 播放清單 localStorage write-through 保存：新增、刪除、拖曳排序、改名等操作會在 setter 當下寫入最新值。
- 移除「目前佇列」面板。
- 移除歌曲列 `下一首播放`、`加入播放佇列最後` 兩顆按鈕。
- 移除同步歌詞 UI、LRC 匯入入口、Electron 同名 `.lrc` 自動配對。
- 新增手動拖曳歌曲列決定播放順序。
- 一般播放清單拖曳後保存到 playlist `trackIds`。
- 全部歌曲拖曳後保存到本地 tracks 順序；搜尋、排序結果、智慧/衍生清單不啟用拖曳。

已通過：

- `node scripts/playlist-logic-check.mjs`
- `npm run build`
- `npm run electron:compile`
- `npm run dist:all`
- arm64 / x64 DMG `hdiutil verify`
- EXE static check

限制：

- Windows EXE 尚未在 Windows 真機執行驗收。
- 本輪未啟動 packaged macOS app 做 GUI 重開後播放清單數量不增加驗收。
- 已經膨脹的舊播放清單不會自動去重，避免誤刪使用者刻意重複加入的歌曲。
- macOS / Windows installer 尚未簽章與 notarize。

## 目前產物狀態

唯一最新版位置：

```text
release-delivery/installers/
```

- `Aquariusgirl Music Room Setup 0.1.0.exe`
  - 修改時間：2026-06-17 19:07:16 CST
  - SHA-256：`028ffc2263af742c7c918f9c89ebfc30330d7b9aa1815c67e7d2426c97fcd0a1`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - 修改時間：2026-06-17 19:07:16 CST
  - SHA-256：`ce6a8e88007f789d112f5868de4568d8725b527209e4a985ffc10d26ca9536e3`
- `Aquariusgirl Music Room-0.1.0.dmg`
  - 修改時間：2026-06-17 19:07:16 CST
  - SHA-256：`7a60458cf96faf57b6ea0f626b80806eb3428909d88bfd7dfba6d2e7eb7ec2bd`

`release/` 是 electron-builder 暫存 build output，已在同步 installer 後清掉，避免同時出現兩個類似交付資料夾。
