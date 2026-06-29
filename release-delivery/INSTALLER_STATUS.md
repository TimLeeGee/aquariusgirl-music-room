# Installer 狀態

## 2026-06-28 0.1.17 最新狀態（AI harness、開源 prompt、雙平台發行）

本輪把版本更新為 0.1.17，AI 助手改成小模型 router + 本機工具執行：模型只輸出 intent JSON 或根據真實工具結果潤飾短回覆；搜尋本機音樂、隨機挑歌、建立歌單、加入歌單與移除安全提示都由程式負責。Prompt 改為 `private/prompts/` 三份開源 `.txt`，不再使用加密 bundle。

- `Aquariusgirl Music Room Setup 0.1.17.exe`：667,081,163 bytes，SHA-256 `b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- `Aquariusgirl Music Room-0.1.17-arm64.dmg`：683,782,606 bytes，SHA-256 `c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

模型：`resources/ai/models/qwen3.5-0.8b.gguf`，532,517,120 bytes，SHA-256 `bd258782e35f7f458f8aced1adc053e6e92e89bc735ba3be89d38a06121dc517`。Prompt：`character_prompt.txt`、`ai_router_prompt.txt`、`ai_reply_prompt.txt` 以明文打包到 `Contents/Resources/prompts/`，未偵測到 prompt `.bin`。

驗收：`check:prompts`、AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release` 均通過。一般沙盒的 `hdiutil create` 仍失敗，升權重跑成功。DMG `hdiutil verify` VALID；唯讀掛載後 `CFBundleShortVersionString` / `CFBundleVersion` 均為 0.1.17，執行檔為 arm64，runtime 只保留 `darwin-arm64/llama-server`。EXE static check 為 Windows NSIS installer；未在 Windows 真機執行，macOS notarization、Apple Developer ID 與 Windows code signing 尚未設定。

### English Status

0.1.17 updates the AI assistant to a small-model router plus local tool execution. The model only emits intent JSON or polishes replies from real tool results; app code handles local search, random selection, playlist creation, playlist insertion, and safe removal guidance. Prompts are now three open `.txt` files in `private/prompts/`; encrypted prompt bundles are no longer used.

- `Aquariusgirl Music Room Setup 0.1.17.exe`: 667,081,163 bytes, SHA-256 `b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`
- `Aquariusgirl Music Room-0.1.17-arm64.dmg`: 683,782,606 bytes, SHA-256 `c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`

Passed: prompt checks, AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, all-target AI assets, build, Electron compile, elevated `npm run dist:release`, and DMG verify. The Windows EXE is a NSIS installer static check only; real Windows QA and signing remain open.

## 2026-06-28 0.1.16 歷史狀態（AI 播放清單真實歌曲與歌單區分頁）

本輪把版本更新為 0.1.16，AI 建立播放清單改為只能從目前已載入/已索引的本機歌曲 metadata 挑選，不再讓模型憑空猜歌。右側歌單卡改為 `歌單 / AI 助手` 分頁，AI 欄位成為歌單區的輔助入口；不新增 embedding 模型，先用 metadata 關鍵字、別名與 mood scoring 做最小可行搜尋。

- `Aquariusgirl Music Room Setup 0.1.16.exe`：667,076,153 bytes，SHA-256 `38a37f0d4cbab4237439fccb5d24baf1b6319e8dadaee5fa325159f8907f4af7`
- `Aquariusgirl Music Room-0.1.16-arm64.dmg`：683,788,448 bytes，SHA-256 `04e348006c00df084a7d08ad3c8ec8b564bc998bb9be6ac6cf21627501b1131c`
- `Aquariusgirl Music Room-0.1.16.dmg`：686,083,848 bytes，SHA-256 `a90098927ffcc360f42b4624e7fc26357625710040be857c659acd22dcb223d3`

模型：`resources/ai/models/qwen3.5-0.8b.gguf`，532,517,120 bytes，SHA-256 `bd258782e35f7f458f8aced1adc053e6e92e89bc735ba3be89d38a06121dc517`。Prompt bundle：`resources/ai/prompts/aquariusgirl_prompt.bundle.bin`，227 bytes，SHA-256 `4b31df90da9ba6af851a851cdba9d32bbed6529ff8a3330fc124296af34f278d`。

驗收：AI track search、playlist logic、Mini opacity、FLAC metadata、custom images、theme colors、secure prompts、all-target AI assets、`npm run build`、`npm run electron:compile`、`dist:mac`、`dist:win` 均通過。兩個 DMG 唯讀掛載 CRC 通過，封裝版本均為 0.1.16，架構分別為 arm64／x86_64；各 DMG 均包含模型與加密 prompt bundle。EXE 為 Windows NSIS installer；未在 Windows 真機執行，macOS notarization、Apple Developer ID 與 Windows code signing 尚未設定。

### English Status

0.1.16 updates AI playlist creation so playlists only use real loaded or indexed local track metadata. The model cannot invent songs. The playlist card now contains `Playlists / AI Assistant` tabs, and search uses metadata keywords, aliases, and mood scoring before any future embedding escalation.

- `Aquariusgirl Music Room Setup 0.1.16.exe`: 667,076,153 bytes, SHA-256 `38a37f0d4cbab4237439fccb5d24baf1b6319e8dadaee5fa325159f8907f4af7`
- `Aquariusgirl Music Room-0.1.16-arm64.dmg`: 683,788,448 bytes, SHA-256 `04e348006c00df084a7d08ad3c8ec8b564bc998bb9be6ac6cf21627501b1131c`
- `Aquariusgirl Music Room-0.1.16.dmg`: 686,083,848 bytes, SHA-256 `a90098927ffcc360f42b4624e7fc26357625710040be857c659acd22dcb223d3`

Passed: AI track search, playlist logic, Mini opacity, FLAC metadata, custom images, theme colors, secure prompts, all-target AI assets, build, Electron compile, `dist:mac`, and `dist:win`. Real Windows QA and signing remain open.

## 2026-06-28 14:32 最新狀態（0.1.15 + 聊天整合 AI 播放清單）

本輪把 AI 建立播放清單整合進聊天流程：使用者聊到音樂時先詢問是否整理，取得同意或直接要求建立播放清單後才產生候選歌單；聊天保留極短本機上下文記憶，首次開啟 AI 面板載入模型時會提示「請稍等」。`private/prompts/` 已支援短 prompt 包，加密時只打包現有 `.txt` prompt。模型與 runtime 已包進安裝檔；prompt 明文未包進 resources，renderer 不提供讀取 system prompt 的 API。

- `Aquariusgirl Music Room Setup 0.1.15.exe`：667,074,540 bytes，SHA-256 `e2feba0e6a9fd466f4a339bd0bdb57031ff7a4631f3247ccd91856e2a4e34921`
- `Aquariusgirl Music Room-0.1.15-arm64.dmg`：683,827,707 bytes，SHA-256 `717eb5d5edda12552d85407fb3309f9a3842c13e2940e521c0c72af827bb0680`
- `Aquariusgirl Music Room-0.1.15.dmg`：686,010,422 bytes，SHA-256 `0416418659b2439f09450180062b7572984c3d8cb672593dbdf975b7bcf090e4`

模型：`resources/ai/models/qwen3.5-0.8b.gguf`，532,517,120 bytes，SHA-256 `bd258782e35f7f458f8aced1adc053e6e92e89bc735ba3be89d38a06121dc517`。Prompt bundle：`resources/ai/prompts/aquariusgirl_prompt.bundle.bin`，227 bytes，SHA-256 `4b31df90da9ba6af851a851cdba9d32bbed6529ff8a3330fc124296af34f278d`。

驗收：`encrypt:prompts`、`check:secure-prompts`、all-target `check:ai-assets`、AI track search check、`npm run build`、`npm run electron:compile`、`dist:mac`、`dist:win` 均通過。兩個 DMG 唯讀掛載 CRC 通過，封裝版本均為 0.1.15，架構分別為 arm64／x86_64；各 DMG 只保留對應 mac runtime，並包含模型與加密 prompt bundle。EXE 為 Windows NSIS installer；未在 Windows 真機執行，macOS notarization、Apple Developer ID 與 Windows code signing 尚未設定。

## 2026-06-22 17:44 最新狀態（0.1.15）

README、新手引導與未使用的歌詞資料管線已完成殘留清理；未新增套件或替代功能，舊 IndexedDB 退役資料保留在本機但不再使用。

- `Aquariusgirl Music Room Setup 0.1.15.exe`：134,367,515 bytes，SHA-256 `df47559e42f427183a37afd6a0a9cf964654496efa21ea6526a5939c84b9ce16`
- `Aquariusgirl Music Room-0.1.15-arm64.dmg`：149,348,842 bytes，SHA-256 `bb7f6b6bbaf2d0533b281536ef3aa3da2cdbb287153561a6473bb506e42c1907`
- `Aquariusgirl Music Room-0.1.15.dmg`：151,297,405 bytes，SHA-256 `969ba94c1b06b80730684d94b8b7fe100dae1b4c92763ffda49886dc76b38fed`

修改時間：2026-06-22 17:39:56–17:39:57 CST。兩個 DMG checksum 均為 VALID，封裝版本均為 0.1.15，架構分別為 arm64／x86_64；EXE 為 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 不存在；arm64 packaged `file://` 與隔離新手引導驗收通過，測試 DMG 已卸載。Windows 真機與正式簽章仍未完成。

## 2026-06-21 23:54 歷史狀態（0.1.14）

目前播放卡「加入歌單」欄位已固定為 `w-36 shrink-0`；重複加入由 Windows 可能鎖焦點的 `window.confirm()` 改為 renderer dialog。未新增套件或改歌單結構。

- `Aquariusgirl Music Room Setup 0.1.14.exe`：134,367,343 bytes，SHA-256 `a9c88a5183a01e889aaead12731dbe597a010eaf0b084c9001edff8fddba2dc2`
- `Aquariusgirl Music Room-0.1.14-arm64.dmg`：149,348,201 bytes，SHA-256 `562b4d248100dfda1e36432b5cbdc78dfcdadf6c449689ab4f42a1ebf7bf5436`
- `Aquariusgirl Music Room-0.1.14.dmg`：151,296,466 bytes，SHA-256 `f94da4f1074d1b7b089993a27e0aae8ada10c401fde012be28ca3d41ef757687`

修改時間：2026-06-21 23:48:53–23:48:54 CST。兩個 DMG checksum 均為 VALID，封裝版本均為 0.1.14，架構分別為 arm64／x86_64；EXE 為 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 不存在；arm64 packaged `file://`、正式 14／2／4 recovery、一般→MINI→一般與隔離 packaged 重複加入 renderer dialog 均通過，測試 DMG 已卸載。Windows 真機與正式簽章仍未完成。

## 2026-06-21 18:57 歷史狀態（0.1.13；recovery 已於 0.1.14 完成）

最新版以既有置中 bounds 在較小工作區保留 10% 邊界，不再預設鋪滿工作區；未新增套件或設定。

- `Aquariusgirl Music Room Setup 0.1.13.exe`：134,367,219 bytes，SHA-256 `d4514ea3237d8fe259c2aeee659227b069dfb30b5f9c7bd9ce0091a082b7f50d`
- `Aquariusgirl Music Room-0.1.13-arm64.dmg`：149,348,001 bytes，SHA-256 `aa633b8d5aa44a2e1b6b584544770a17c95b4717279479d4a9039b47c91f3667`
- `Aquariusgirl Music Room-0.1.13.dmg`：151,317,700 bytes，SHA-256 `ec62642007c1c78eac70dd20b05d6bac955a79659e1ba24c82e7e9acbc8572a3`

修改時間：2026-06-21 18:57:41 CST。兩個 DMG checksum 均為 VALID，封裝版本均為 0.1.13，架構分別為 arm64／x86_64；EXE 為 NSIS installer。當時 packaged 一般視窗／`file://`／preload 已通過；userData recovery 與 packaged MINI 往返後由 0.1.14 完成。Windows 真機與正式簽章仍未完成。

## 2026-06-21 18:32 最新狀態（0.1.12）

最新版修正 Windows 從最大化／全螢幕切換 MINI 的原生視窗狀態，並讓 MINI 頂部安全區可拖曳；未新增套件或第二個視窗。

- `Aquariusgirl Music Room Setup 0.1.12.exe`：134,367,104 bytes，SHA-256 `41686e855bb514328c57d797e74f16eda31b3a3f035c5407e83d92b623478865`
- `Aquariusgirl Music Room-0.1.12-arm64.dmg`：149,345,033 bytes，SHA-256 `20040d2dd0104810e6599e0d434a92ec99eaa9a986eb4895266ffe54587d100f`
- `Aquariusgirl Music Room-0.1.12.dmg`：151,330,399 bytes，SHA-256 `9af0ff8b1b6933580d62713d85aa96890541f88d52003c5e7096a9ba66cfca4c`

修改時間：2026-06-21 14:10:00–14:10:01 CST。`dist:all` 已成功，EXE static check 為 Windows x64 目標 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 不存在。兩個 DMG checksum 均為 VALID，封裝版本均為 0.1.12，架構分別為 arm64／x86_64；arm64 packaged `file://`、preload IPC、Full→MINI→拖曳→Full 均通過，本輪測試映像已卸載。Windows 真機與正式簽章仍未完成。

## 2026-06-21 13:33 最新狀態（0.1.11）

最新版將歌曲列「加入歌單」原生下拉欄位固定為 `w-32 shrink-0`，避免不同歌單選項文字造成每列寬度不一致。

- `Aquariusgirl Music Room Setup 0.1.11.exe`：134,367,033 bytes，SHA-256 `556561a2e87d1265b2d0d0cae91d471655356218d6880beec81d6b2e07de86ec`
- `Aquariusgirl Music Room-0.1.11-arm64.dmg`：149,347,642 bytes，SHA-256 `c9a41bf19828790f7632439be936cfc2dc1de07bed13890611759106199bf5de`
- `Aquariusgirl Music Room-0.1.11.dmg`：151,295,621 bytes，SHA-256 `1c527db042d0c923ca87b526af3e7b0cf3c46286f69e740ad8a759f128064f07`

修改時間：2026-06-21 13:33:24–13:33:25 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.11，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 不存在，測試掛載均已卸載。Windows 真機欄位驗收與正式簽章仍未完成。

## 2026-06-21 11:03 最新狀態（0.1.10）

最新版為 Windows MINI 增加 20px 原生標題列安全區，Windows 固定尺寸改為 `260×288`，macOS 維持 `260×268`，並統一進度／音量列行高以消除堆疊與間距不一致。

- `Aquariusgirl Music Room Setup 0.1.10.exe`：134,367,001 bytes，SHA-256 `5200e4f0432b83d31b973f73e0909554a424e05cd5abb4e087033659bf426aa5`
- `Aquariusgirl Music Room-0.1.10-arm64.dmg`：149,347,464 bytes，SHA-256 `1fdabd57eff6ce78b3fa2774b8ef15c587ce0fad636aa7267f1bccb603962ac8`
- `Aquariusgirl Music Room-0.1.10.dmg`：151,296,013 bytes，SHA-256 `594bb0e13085cb4211ab7e511744fd580bf7cdb745b8348c4cad01fde5dc4068`

修改時間：2026-06-21 11:03:05 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.10，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 不存在，測試掛載均已卸載。Windows 真機版面驗收與正式簽章仍未完成。

## 2026-06-21 10:26 最新狀態（0.1.9）

最新版固定 Electron MINI 視窗為 `260×268`，只保存位置，避免 Windows 每 2 秒 bounds 回寫在待機或播放時累積放大。

- `Aquariusgirl Music Room Setup 0.1.9.exe`：134,366,877 bytes，SHA-256 `4ce034653261c6fa808c5970112b4d3adead7f3f8ef6a80c88c5494d8c764ba3`
- `Aquariusgirl Music Room-0.1.9-arm64.dmg`：149,346,887 bytes，SHA-256 `65af95bf13ecaafd3803b346d9dfcce8bcf517baf787f06e8b0fbbf3b23bd1b2`
- `Aquariusgirl Music Room-0.1.9.dmg`：151,296,096 bytes，SHA-256 `7aa2600ba506d8f5451fd70dfe653f05755c9138353545fbc930f1c1311a2c0c`

修改時間：2026-06-21 10:26:50–10:26:51 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.9，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 不存在，測試掛載均已卸載。Windows 真機尺寸驗收與正式簽章仍未完成。

## 2026-06-20 23:02 最新狀態（0.1.8）

最新版新增 MINI 背景色相與設定頁 MINI 原生視窗透明度欄位，並完成 Electron dev 與 arm64 packaged `file://` 色相、透明度、保存值與復原驗收。

- `Aquariusgirl Music Room Setup 0.1.8.exe`：134,366,590 bytes，SHA-256 `73b05fb9d97724216ef99ff68a260c5fca9ad51012692252babbf1ecca8f8e56`
- `Aquariusgirl Music Room-0.1.8-arm64.dmg`：149,349,388 bytes，SHA-256 `2de7b79107763012be47fdbd3209d50a3f2cd94bdc3a19f0dac89c37e65d6ae3`
- `Aquariusgirl Music Room-0.1.8.dmg`：151,303,015 bytes，SHA-256 `34fa962543359f7276138a997d23dfd4ae0910b9d81bd75d8470db6a63415d65`

修改時間：2026-06-20 23:02:09 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.8，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 不存在，測試掛載均已卸載。Windows 真機與正式簽章仍未完成。

## 2026-06-20 22:21 最新狀態（0.1.7）

最新版新增共用面板背景色相與四項 `0–100%` 透明度，並完成 Electron dev 與 arm64 packaged `file://` 邊界、保存、復原及視覺驗收。

- `Aquariusgirl Music Room Setup 0.1.7.exe`：134,366,360 bytes，SHA-256 `43a321fd0ddb7018b0392c33b60e6f41dba2a3ae743469ec50c9a061125fbd8f`
- `Aquariusgirl Music Room-0.1.7-arm64.dmg`：149,346,075 bytes，SHA-256 `e059e0d15a2a1f913f4594429cd776a03f358a62c7dd36ae1cf6b13b9b09968b`
- `Aquariusgirl Music Room-0.1.7.dmg`：151,297,714 bytes，SHA-256 `83b15d81a3c15710642d9763afdd8d28b59d56f5788ea207bc2d3a56da02749e`

修改時間：2026-06-20 22:21:14 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.7，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 已移除，測試掛載均已卸載。Windows 真機與正式簽章仍未完成。

## 2026-06-20 17:47 最新狀態（0.1.6）

最新版將共用面板與角色舞台恢復為暗色預設，並完成 Electron dev 與 packaged `file://` 視覺驗收。

- `Aquariusgirl Music Room Setup 0.1.6.exe`：134,365,961 bytes，SHA-256 `de606ba39ca9ac0b834c99b72207d81f6bf042ec12458ef10e750690091899bc`
- `Aquariusgirl Music Room-0.1.6-arm64.dmg`：149,349,557 bytes，SHA-256 `064aa1dbb0ece3842c48b87b09c701aa1d83c7c0146e7f61895ea01fc2a16651`
- `Aquariusgirl Music Room-0.1.6.dmg`：151,295,049 bytes，SHA-256 `5e905776a4aa8543b05c2d104355bba27a460c130ef6a304cfac9bda33f3c408`

修改時間：2026-06-20 17:47:25 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.6，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 已移除，測試掛載均已卸載。Windows 真機與正式簽章仍未完成。

## 2026-06-20 17:24 最新狀態（0.1.5）

最新版提高主背景清晰度，並完成 Electron dev 與 packaged `file://` 視覺驗收。

- `Aquariusgirl Music Room Setup 0.1.5.exe`：134,365,911 bytes，SHA-256 `dc6952d33d529a24ecce185b9d1e9edac1b2b11607082481ee1f5193e437a771`
- `Aquariusgirl Music Room-0.1.5-arm64.dmg`：149,349,388 bytes，SHA-256 `c756b2db676c768d771759f2061e4fcf50b41b0600fac6d48c65a9d246924bfb`
- `Aquariusgirl Music Room-0.1.5.dmg`：151,294,991 bytes，SHA-256 `0f4f9dc0457fc72e22449081bb7ab7337a695856f89f94837afc292d3e09baf6`

修改時間：2026-06-20 17:24:26 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.5，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。Windows 真機與正式簽章仍未完成。

## 2026-06-20 17:05 最新狀態（0.1.4）

最新版修正主背景與兩張裝飾圖被層級蓋住，並完成 packaged `file://` 視覺驗收。

- `Aquariusgirl Music Room Setup 0.1.4.exe`：134,365,977 bytes，SHA-256 `fb2446c411f45723ef0588190850c1c8e9b3528a2b44ae340b1319b8b1967e83`
- `Aquariusgirl Music Room-0.1.4-arm64.dmg`：149,333,767 bytes，SHA-256 `d784e4dad38033a01c197d2cb429d5b0e484f537e354f99b99aa4d89b9dc1072`
- `Aquariusgirl Music Room-0.1.4.dmg`：151,295,051 bytes，SHA-256 `c4a00149bd8fbf27a5caacc1d0921727c52f7d50a2f43f7d92e3ce285aefdde5`

修改時間：2026-06-20 17:05:25 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.4，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。Windows 真機與正式簽章仍未完成。

## 2026-06-20 16:31 最新狀態（0.1.3）

最新版新增 FLAC 原生 `PICTURE` 內嵌封面解析。

- `Aquariusgirl Music Room Setup 0.1.3.exe`：134,366,102 bytes，SHA-256 `a15dd39eb4c93332e5fec6e2becdbf6ec9283069b862555c67d34ea9addeaf26`
- `Aquariusgirl Music Room-0.1.3-arm64.dmg`：149,349,694 bytes，SHA-256 `3a6a763336edaed44fe6fb7ad15f376e66feac120a9ba0fb2b4f2440a5f8a05e`
- `Aquariusgirl Music Room-0.1.3.dmg`：151,296,482 bytes，SHA-256 `feb7163b18028030ad09ea7585947ff3dd2b34c83b9ceaf5e08617c9e9213339`

修改時間：2026-06-20 16:31:08 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.3，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標的 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。截圖中的真實 FLAC 與 Windows EXE 尚需真機驗收，installer 未簽章。

## 2026-06-19 17:16 最新狀態（0.1.2）

最新版新增五組可保存、可復原的色彩設定，並保留 0.1.1 九張圖片設定。

- `Aquariusgirl Music Room Setup 0.1.2.exe`：134,365,719 bytes，SHA-256 `9093c687fa4a22b5999ae5ab67d585d46d374b04f2ae68c3a1390dd4b3379c1a`
- `Aquariusgirl Music Room-0.1.2-arm64.dmg`：149,345,520 bytes，SHA-256 `550bcfdf13498794807555acd6c9199354191c91c65e0cde41485a9fd9123ac7`
- `Aquariusgirl Music Room-0.1.2.dmg`：151,323,525 bytes，SHA-256 `24d3bb982f38d4cef7b23e5c975bf5dcf83f3be28391611dca91be3ec784e491`

修改時間：2026-06-19 17:15:54–17:15:55 CST。兩個 DMG checksum 均為 VALID；封裝內 App 版本均為 0.1.2，架構分別為 arm64 / x86_64；EXE 為 Windows x64 目標的 NSIS installer。唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。Windows／Electron 人工驗收與正式簽章仍未完成。

## 2026-06-19 10:44 最新狀態（0.1.1）

最新版新增九張內建圖片的自訂／回復預設設定，以及右上等距設定按鈕。

- `Aquariusgirl Music Room Setup 0.1.1.exe`：134,364,296 bytes，SHA-256 `007258edcaad2fb5bc10627f449fd9b34fa71fe1092b7e56cbc36dbb3185cc84`
- `Aquariusgirl Music Room-0.1.1-arm64.dmg`：149,344,229 bytes，SHA-256 `52c2587e25e1c7c73e5bc2dc791231132f2436143344c31f603ee532c7a97341`
- `Aquariusgirl Music Room-0.1.1.dmg`：151,289,292 bytes，SHA-256 `57235449c5675f67b176544e87feb77f5a04bf475c10c7dd00156069e89e9a9e`

修改時間：2026-06-19 10:43:47 CST。兩個 DMG checksum 均為 VALID，EXE 為 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。Windows 真機、Electron 原生選圖人工點擊與簽章仍未完成。

## 2026-06-18 22:05 最新狀態

最新版包含智慧型播放清單歌曲排除修正，以及 MINI 透明度 20% 下限。

- `Aquariusgirl Music Room Setup 0.1.0.exe`：134,362,372 bytes，SHA-256 `dfc230f64c0f7628167865121a0026f3b43b368084b3beeafe21aeafc226de8b`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`：149,348,227 bytes，SHA-256 `a2709c940f8ff6b22b20f21486707cba3008ddf7101c5e1fca1170f7490940c6`
- `Aquariusgirl Music Room-0.1.0.dmg`：151,315,142 bytes，SHA-256 `ac9df4136730751cfadeba19b0ee3516c52b225e033ea01db38aadbae1f12dc3`

修改時間：2026-06-18 22:05:39–22:05:40 CST。兩個 DMG checksum 均為 VALID，EXE 為 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。Windows 真機與簽章仍未完成。

## 2026-06-18 21:52 最新狀態

最新版包含 MINI 透明度數字輸入、左右調整按鈕與一致化間距／圓角。

- `Aquariusgirl Music Room Setup 0.1.0.exe`：134,362,063 bytes，SHA-256 `00062579245d060464ff632cfe09be5c2bfdbe00ee880ccec1d9b29330cf2e5a`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`：149,348,911 bytes，SHA-256 `5a5af6ed942a17ad4355265293368407a3d20f4c10395d800f31e6e1a3769236`
- `Aquariusgirl Music Room-0.1.0.dmg`：151,311,870 bytes，SHA-256 `eec1fd9ff7be1ec43a3ec1f082856c837baeaea5e92de56d0d4328b6cffb451e`

修改時間：2026-06-18 21:52:41–21:52:42 CST。兩個 DMG checksum 均為 VALID，EXE 為 NSIS installer；唯一交付位置為 `release-delivery/installers/`，`release/` 已移除。Windows 真機與簽章仍未完成。

## 2026-06-18 18:28 最新狀態

最新測試 installer 已移除會在 Windows 造成焦點遺失的播放清單原生確認框，改用 renderer 內嵌確認框。

- `Aquariusgirl Music Room Setup 0.1.0.exe`
  - 修改時間：2026-06-18 18:28:12 CST
  - 大小：134,361,675 bytes
  - SHA-256：`c68cb42971ad69be009c6e0e0fb76b465cd8c923a896450739e725127ee98eb6`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - 修改時間：2026-06-18 18:28:12 CST
  - 大小：149,349,648 bytes
  - SHA-256：`2c8003788853e76e9f42daea272c48d0a354454a4d1e6013a04c21fdebac00a7`
- `Aquariusgirl Music Room-0.1.0.dmg`
  - 修改時間：2026-06-18 18:28:12 CST
  - 大小：151,307,893 bytes
  - SHA-256：`d1526a3a54e2e276f88b63cd5cbf6b9125c488262036c80ec0ef7d4dfd4bece5`

唯一交付位置為 `release-delivery/installers/`；兩個 DMG checksum 均為 VALID，EXE 為 NSIS installer，`release/` 已移除。完整 Chromium 焦點手順通過；Windows 真機仍需人工驗收，installer 未簽章。

## 2026-06-18 17:37 最新狀態

最新測試 installer 已包含 Windows 刪除播放清單後的焦點恢復，以及智慧型播放清單名稱欄位自動聚焦。

- `Aquariusgirl Music Room Setup 0.1.0.exe`
  - 修改時間：2026-06-18 17:37:07 CST
  - 大小：134,361,611 bytes
  - SHA-256：`cc4bb14ae84a27bcb2b7073e5172fdbd6fe6a8b2fa178c5db094ef1eecce80df`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - 修改時間：2026-06-18 17:37:07 CST
  - 大小：149,349,096 bytes
  - SHA-256：`ac705bc5f1e6e5e32469672091bc4ee1e8b0e0fc19885d5bda11c88ee8fa72dd`
- `Aquariusgirl Music Room-0.1.0.dmg`
  - 修改時間：2026-06-18 17:37:07 CST
  - 大小：151,310,940 bytes
  - SHA-256：`24f75bd1a4dec264c26d9fa161d0dbe63457827047e6c209240d410f26ae5fe0`

唯一交付位置為 `release-delivery/installers/`；兩個 DMG checksum 均為 VALID，EXE 為 NSIS installer，`release/` 已移除。Windows 真機焦點手順仍需人工驗收，installer 未簽章。

## 2026-06-18 16:45 最新狀態

最新 Windows / macOS 測試 installer 已重新產出，包含播放清單刪除語意修正，以及「最近播放／最常播放」移除。

唯一最新版位置：

```text
release-delivery/installers/
```

- `Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-18 16:44:44 CST
  - 大小：134,361,405 bytes
  - SHA-256：`04d8c6745b3d80a41989f467011631f1596eecba6fe70e9024b6ec1df5565e6a`
- `Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-18 16:44:44 CST
  - 大小：149,348,647 bytes
  - SHA-256：`3a9d8ddb7cba670359202fdacc84873f4ebd787ecf1c5068b7fe0ef0175ad3e4`
- `Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-18 16:44:44 CST
  - 大小：151,308,105 bytes
  - SHA-256：`0fc571fb7695d0eb0a7d0038b49b8f4aac58476553a4f0805b6f0b942e407c7a`

校驗：兩個 DMG checksum 均為 VALID；EXE 為 NSIS installer；`release/` 已移除。Windows EXE 尚未在 Windows 實機執行，所有 installer 均未簽章。

## 2026-06-17 19:55 程式已修正，installer 尚未更新

本輪已修正播放清單刪除語意與系統清單：

- 自訂播放清單刪除歌曲只移出該播放清單，不刪歌曲庫。
- 只有「全部歌曲」刪除才真正移除歌曲，並同步清掉所有自訂播放清單裡同一 track id。
- 移除「最近播放」與「最常播放」系統清單。

已通過：

- `node scripts/playlist-logic-check.mjs`
- `npm run build`
- `npm run electron:compile`
- `rg` 檢查最近/最常播放無程式殘留

尚未完成：

- `npm run dist:all` 一般沙盒仍在 macOS `hdiutil create` 失敗。
- 升級權限重跑 `npm run dist:all` 被系統用量限制擋下。
- `release-delivery/installers/` 目前仍是 2026-06-17 19:07:16 CST 的上一輪 installer，不包含本輪 19:55 修正。
- 失敗打包留下 `release/` 暫存 app bundle，下輪接續應先清理。

## 2026-06-17 19:08 最新狀態

本輪已重新產出 Windows / macOS 測試 installer。

已包含：

- 自動恢復上次音樂清單時，只重建歌曲庫，不再把恢復到的歌曲追加進目前自訂播放清單。
- 播放清單 localStorage write-through 保存：新增、刪除、拖曳排序、改名等操作會在 setter 當下寫入最新值。
- 移除「目前佇列」面板。
- 移除歌曲列 `下一首播放`、`加入播放佇列最後` 兩顆按鈕。
- 移除同步歌詞 UI、LRC 匯入入口、Electron 同名 `.lrc` 自動配對。
- 新增手動拖曳排序：一般播放清單保存到 playlist；全部歌曲保存到本地 tracks 順序。

已通過：

- `node scripts/playlist-logic-check.mjs`
- `npm run build`
- `npm run electron:compile`
- `npm run dist:all`
- arm64 / x64 DMG `hdiutil verify`
- EXE static check

一般沙盒執行 `npm run dist:all` 仍會在 macOS `hdiutil create` 產生 DMG 時失敗；升級權限重跑後已成功。

## 唯一最新版位置

```text
release-delivery/installers/
```

- `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.0.exe`
  - Windows x64 NSIS installer
  - 修改時間：2026-06-17 19:07:16 CST
  - 大小：134,361,413 bytes
  - SHA-256：`028ffc2263af742c7c918f9c89ebfc30330d7b9aa1815c67e7d2426c97fcd0a1`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0-arm64.dmg`
  - macOS Apple Silicon arm64 DMG
  - 修改時間：2026-06-17 19:07:16 CST
  - 大小：149,349,145 bytes
  - SHA-256：`ce6a8e88007f789d112f5868de4568d8725b527209e4a985ffc10d26ca9536e3`
- `release-delivery/installers/Aquariusgirl Music Room-0.1.0.dmg`
  - macOS Intel x64 DMG
  - 修改時間：2026-06-17 19:07:16 CST
  - 大小：151,308,026 bytes
  - SHA-256：`7a60458cf96faf57b6ea0f626b80806eb3428909d88bfd7dfba6d2e7eb7ec2bd`

## 校驗摘要

- `release-delivery/installers/` 中只保留三個最新 installer。
- `release/` 暫存輸出已移除。
- arm64 / x64 DMG checksum 均為 VALID。
- EXE 被辨識為 Windows NSIS installer。
- macOS / Windows installer 均未簽章；Windows EXE 未在 Windows 實機執行。
- 本輪未啟動 packaged macOS app 做 GUI 重開後播放清單數量不增加驗收。

## 正式發行提醒

目前 installer 是測試版，未做 Apple Developer ID 簽章、notarization、Windows code signing。正式公開前需要補簽章流程。Windows EXE 仍需 Windows 真機驗收。
