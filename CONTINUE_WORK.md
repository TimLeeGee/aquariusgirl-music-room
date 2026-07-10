# Aquariusgirl Music Room Continue Work

## 2026-07-10 0.1.49 打包完成：Mini 播放中斷 hotfix＋播放自癒保險＋AI 聊天視窗 UX（mac＋Windows）

- 升版面：`package.json`／`package-lock.json`(×2)／`exportSettings.ts appVersion` → 0.1.49。內容＝下段全部（`<audio>` 首子節點 hotfix＋自癒保險＋聊天 UX）。
- 打包：`qa-temp/build-0.1.49.command`（Finder 雙擊、Mac 本機跑 `npm run dist:release`）→ DIST_EXIT=0；`sync-installers` 清掉舊 0.1.48、維持單一交付資料夾。
- installer（SHA-256 見 `docs/releases/0.1.49-checksums.md`）：
  - `Aquariusgirl Music Room Setup 0.1.49.exe`：667,675,017 bytes，SHA-256 `7c3708ddba7abb9e81aa934575bf95af7e290b2293e77b8f89589741993cabf6`
  - `Aquariusgirl Music Room-0.1.49-arm64.dmg`：684,771,178 bytes，SHA-256 `ee8ef2aeaa88a474fd5dad9986051223c4abfae66a3c6d90c7cb4cdf49f3e27a`
- DMG `hdiutil verify` VALID＋掛載讀回 0.1.49／arm64／taglib wasm 存在；EXE PE32 NSIS（證據 `qa-temp/dist-0.1.49-result.txt`）。
- 未驗證（老實講）：打包版 GUI 實測（切 Mini 續播、泡泡收合 hover、訊息貼底、清單捲動）；Windows 真機；簽章／notarization。本次已推送 GitHub `main`。

## 2026-07-10 播放自癒保險＋AI 聊天視窗 UX 改版（已併入 0.1.49 打包）

- 前情：使用者以打包版 0.1.48 重現「切 Mini 播放中斷」——0.1.48 安裝檔不含前一輪 `<audio>` 首子節點 hotfix（該修正仍在 working tree），屬修正未送達。
- A `useAudioPlayer.ts` 自癒保險：`playAudioElement` 偵測「有歌但節點沒 src」自動重掛音源＋恢復播放位置；`togglePlay` 同指紋第一下改重新播放；`suspendAudioForFileWrite` 期間自癒停用（避免寫回中重新鎖檔）；`describePlayError` 分流錯誤訊息（只有 NotAllowedError 才報「阻擋」）。
- B `AIAssistantPanel.tsx` 聊天 UX：泡泡列 sticky 置頂＋首次互動後收合、hover 下拉（純 CSS，不掛 scroll 監聽）；訊息區 `mt-auto` 底部錨定由下往上長；聊天視窗固定加高 500px；圓角間距不變、清單分頁不動。
- 驗證：沙盒 `tsc --noEmit`／`electron:compile`／全部可跑 `check:*` PASS；rg 接點與殘渣掃描乾淨。未驗證：`vite build`（沙盒環境限制）、dev/packaged GUI 實跑、Windows 真機。
- 下一步：Mac 本機 `npm run electron:dev` 實測（切 Mini 續播、泡泡收合、訊息貼底、清單捲動）→ 使用者確認後升版＋重打 DMG/EXE。細節見 `release-delivery/QA_REPORT.md` 最上段。
- dev 模式已知限制（非 bug、勿當回歸追）：dev 渲染來自 `http://127.0.0.1:5173`，Chromium 禁止 http 頁面載入 `file://` 音源 → 自動恢復曲庫／原生選檔的歌在 dev 播不了（duration 全 0:00、跳「音源載入失敗」，此為 describePlayError 正確分流）。dev 驗證播放請用「拖曳」加入（blob 音源可播）；打包版為 file:// 同源，不受影響。

## 2026-07-08 0.1.48 打包完成：面板文字全量登錄表（分組＋可搜尋編輯器）（mac＋Windows）

- 依使用者需求把「面板文字自訂」從 6 個 slot 升級為**開放字串登錄表**（~20 條 UI 顯示字串，`UI_TEXT_GROUPS` 分組）：
  - 資料層：`settings.ts` 的 `defaultTextOverrideSettings` 改 `as const` 開放 map（key→模板含 `{name}`/`{nameEn}`），`TextOverrideKey = keyof typeof`；新增 `UI_TEXT_GROUPS`（分組／標籤／multiline）。`resolveTextOverrideSettings` 自動涵蓋新 key（`resolved` 加型別註記）。
  - 消費端改讀 `useText(key)`：主舞台（`stageNoTrack`/`stageSelectHint`）、播放器（`playerWaiting`/`playerSelectHint`/`playerDropHint`）、Header（`headerTitle`/`headerSubtitle`）、歌單（`trackListEmpty`）、拖曳（`dropZoneHint`）、Mini（`miniIdle`）、視覺化（`visualizerTitle`）、睡前定時（`sleepTimerTitle`）。把 `trackDisplay`「正在等音樂」搬到 `PlayerCore`（`playerWaiting`），解掉 node-check 限制那一處、使其可改可改名。
  - 設定 UI：「文字」分頁最上維持角色名稱（中／英）＋預覽，下面依 `UI_TEXT_GROUPS` 分組列出、加搜尋框、單項／全部復原。
- Provider 邊界：`ObsOverlay`／`MiniPlayerAssistant` 在 `TextOverrideContext.Provider` 之外，維持 `applyName`（跟著改名、非 slot）。少數散落名字（App 歌單命名、toast 標籤、onboarding、播放錯誤訊息）同樣走 `applyName`。OS 視窗／dock 名稱仍為打包時 productName。
- 升版面：`package.json`／`package-lock.json`(×2)／`exportSettings.ts appVersion` → 0.1.48。
- 驗證：沙盒 `tsc --noEmit`、`electron:compile`、全部可跑 `check:*`（含 `ai-track-search`/`track-display`）、`check:ai-assets`(mac+win) PASS；Mac 本機 `npm run dist:release` DIST_EXIT=0。
- installer（SHA-256 見 `docs/releases/0.1.48-checksums.md`）：
  - `Aquariusgirl Music Room Setup 0.1.48.exe`：667,674,676 bytes，SHA-256 `fa3ba844134fe791c0dfcb6452d2d3212530f5573f135b6dea66bf588213e655`
  - `Aquariusgirl Music Room-0.1.48-arm64.dmg`：684,781,240 bytes，SHA-256 `e3aaf089e8fa4d38e3b3a52f617ed38253f6ca661df5e92fb9bd7051d7ec2670`
- DMG `hdiutil verify` VALID＋掛載讀回 0.1.48／arm64／taglib wasm 存在；EXE PE32 NSIS（證據 `qa-temp/dist-0.1.48-result.txt`）。
- 未驗證（老實講）：打包版 GUI 實測（分組搜尋編輯器、各字串即時套用、改名全站換）；Windows 真機；簽章／notarization。尚未推 GitHub（等使用者指示，走 `github-update-flow`）。

## 2026-07-08 0.1.47 打包完成：搜尋泡泡修正 + 檢查歌曲資訊強化 + 角色名稱全域改名（mac＋Windows）

- 依使用者需求一次做五項（純加法、零新套件、不動寫回/readback/DB schema）：
  - P1 搜尋泡泡：「搜尋」chip 改預填輸入框（`幫我找 `）不直接送出；搜尋流程加指令停用詞（搜尋/我的/音樂庫…），剝完為空 → 反問「要找什麼」，不再把整句當關鍵字。
  - P2 資料夾範圍：`scanMetadata` 前用 `filterTracksByFolder`（sourcePath 前綴、含子資料夾）；健檢報告卡加資料夾 `select`（`listTrackFolders`），切換即重掃、不洗對話。
  - P3 逐首手動編輯：`scanMetadata` 新增 `manualCandidates`（可寫回＋缺欄位＋無自動建議）；報告卡「逐首手動編輯」逐筆開 `SongInfoPanel`（`onEditSongInfo`）讓使用者自己輸入保存。
  - P4 非可寫檢視：`scanMetadata` 新增 `nonWritableList`（含 sourcePath）；報告卡可展開清單，每列「顯示位置」走既有 `showTrackInFolder`。
  - P5 角色名稱全域改名：`TextOverrideSettings` 加 `characterName`／`characterNameEn`，預設文字改 `{name}`／`{nameEn}` 模板由 `resolveTextOverrideSettings` 代入；散落 19/21 處中文＋4 處英文改用 `applyName`（React-free 單例 `config/characterName.ts`，App 於 resolve 期同步）；設定「文字」分頁最上加中/英名稱欄位＋即時預覽。
- 已知限制：`aiTrackSearch.ts`／`trackDisplay.ts` 由 node `--experimental-strip-types` check 直接載入，無法加無副檔名 value import，2 處預設名維持字面「水瓶罐子」不隨改名。
- 升版面：`package.json`／`package-lock.json`(×2)／`exportSettings.ts appVersion` → 0.1.47。
- 驗證：沙盒 `tsc --noEmit`、`electron:compile`、全部可跑 `check:*`（含 `check:ai-track-search`／`check:track-display`）、`check:ai-assets`(mac+win) PASS；Mac 本機 `npm run dist:release` DIST_EXIT=0。
- installer（SHA-256 見 `docs/releases/0.1.47-checksums.md`）：
  - `Aquariusgirl Music Room Setup 0.1.47.exe`：667,673,975 bytes，SHA-256 `b93d2f9ed0721bba5984a52ff93c341dcf98d9a0bf6066107fe9dc2bcd635d97`
  - `Aquariusgirl Music Room-0.1.47-arm64.dmg`：684,774,034 bytes，SHA-256 `c1baf08bf05575aed0feb013fe9c36a7ee3717cc3fb7ba8018b36c2bc81d9541`
- DMG `hdiutil verify` VALID＋掛載讀回 0.1.47／arm64／taglib wasm 存在；EXE PE32 NSIS（證據 `qa-temp/dist-0.1.47-result.txt`）。
- 未驗證（老實講）：打包版 GUI 實測（五項新功能實跑）；Windows 真機；簽章／notarization。尚未推 GitHub（等使用者指示，走 `github-update-flow`）。

## 2026-07-07 0.1.46 打包完成：AI 快捷指令氣泡 + 面板文字自訂設定（mac＋Windows）

- 兩個客製化新功能（純加法、零新套件、不動寫回／readback／DB schema）：
  - Feature A 快捷指令氣泡：AI 助手對話空狀態、輸入框上方顯示可點選 chips（檢查歌曲資訊／隨機清單／搜尋音樂庫／聊天），點擊帶預設字串走既有 `handleSend`（新增可選 `overrideText` 參數）；只列真實支援指令，聊天氣泡僅在模型就緒時出現，開始對話即收起。
  - Feature B 面板文字自訂：新 `TextOverrideSettings`（6 白名單 key：`stageTitle`／`stageIdleHint`／`aiPanelTitle`／`aiGreeting`／`aiInputPlaceholder`／`dropZoneTitle`），照 ThemeColorSettings 五件套（型別＋預設／STORAGE_KEYS／`resolveTextOverrideSettings` normalize／export＋import 合併／設定面板）。「外觀設定」新增第 4 分頁「文字」，逐項輸入＋單項/全部復原；元件以 `TextOverrideContext` + `useText(key)` 消費，留空 fallback 預設。
- 升版面：`package.json`／`package-lock.json`(×2)／`src/utils/exportSettings.ts appVersion` → 0.1.46。
- 驗證：沙盒 `tsc --noEmit`（renderer 型別零錯）、`electron:compile`、全部可跑 `check:*`、`check:ai-assets`(mac+win) PASS；rg 確認 6 個 `useText` 消費點、Provider/resolve/export/import 接點齊全、舊硬字串已從元件移除。Mac 本機 `npm run dist:release` DIST_EXIT=0（vite build 於打包時通過）。
- installer（`release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.46-checksums.md`）：
  - `Aquariusgirl Music Room Setup 0.1.46.exe`：667,672,752 bytes，SHA-256 `15ceb1585a34b46d86188762549d893e5aeeff293e23c8210b1e4281113bf13c`
  - `Aquariusgirl Music Room-0.1.46-arm64.dmg`：684,765,780 bytes，SHA-256 `a29f06083d0c039cc03a1de5faafe52c47027b758c94e70ee0261e484756bd8c`
- DMG `hdiutil verify` VALID＋唯讀掛載讀回 0.1.46／arm64／taglib wasm 存在；EXE PE32 NSIS（證據 `qa-temp/dist-0.1.46-result.txt`）。
- 未驗證（老實講）：打包版 GUI 實測（新氣泡點擊、文字設定即時套用與復原、匯出/匯入帶走文案）；Windows 真機；簽章／notarization。尚未推 GitHub（等使用者指示，走 `github-update-flow`）。

## 2026-07-07 0.1.45 打包完成：AI 助手改善＋歌曲資訊補全首次進 mac＋Windows installer

- 承下：本輪 A1–A3＋B1/B2 程式（見 `docs/HANDOFF_AI_METADATA.md`）已升版 0.1.45 並打包 mac＋Windows。升版面：`package.json`／`package-lock.json`(×2)／`src/utils/exportSettings.ts appVersion`；程式註解內「0.1.44」為歷史標註不動。
- 打包：`qa-temp/build-0.1.45.command`（Finder 雙擊、Mac 本機跑 `npm run dist:release`）→ DIST_EXIT=0；`sync-installers` 自動清掉舊 0.1.44、維持單一交付資料夾。
- installer（`release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.45-checksums.md`）：
  - `Aquariusgirl Music Room Setup 0.1.45.exe`：667,671,899 bytes，SHA-256 `78136ae0fa13c5f43784023e0393a5fcb1c3756971e64d4872e6f859b9e17a6e`
  - `Aquariusgirl Music Room-0.1.45-arm64.dmg`：684,777,947 bytes，SHA-256 `bd123116fed76fb8c018a2741f64687d773cf0110b85f2371cb03935781f8cd4`
- 驗證：沙盒全部可跑 `check:*`＋`electron:compile` PASS；Mac 本機 `npm run build` exit 0；DMG `hdiutil verify` VALID＋唯讀掛載讀回 0.1.45／arm64／taglib wasm 存在；EXE PE32 NSIS（證據 `qa-temp/dist-0.1.45-result.txt`）。
- 未驗證（老實講）：打包版 GUI 實測（新 AI metadata 報告卡→建議卡→套用→readback→復原，本輪依使用者選擇只打包、未做 GUI 實跑）；Windows 真機；簽章／notarization。尚未推 GitHub（等使用者指示，走 `github-update-flow`）。

## 2026-07-07 V 驗證補齊：mac 本機 `npm run build` PASS（版本仍 0.1.44，未打包）

- 承下段「AI 助手改善（A1–A3）＋歌曲資訊補全 Phase 1＋2」：唯一沙盒跑不了的 `vite build` 缺口已於 mac 本機補驗，`docs/HANDOFF_AI_METADATA.md` V 項改 ✅（打包版 GUI 除外）。
- 由 `qa-temp/run-build.command`（Finder 雙擊、mac 本機執行）跑 `npm run build`：`tsc --noEmit` 無型別錯誤、`vite build` 1652 模組全轉換、4.26s 完成，`BUILD_EXIT_CODE=0`／`BUILD_RESULT=PASS`（node v24.16.0、npm 11.13.0）。完整輸出見 `qa-temp/build-result.txt`。
- 併同沙盒重跑綠燈：`check:song-info`（含 taglib-wasm packaging＋writer roundtrip＋electron-selected-file）、`check:metadata-save-loop`、`check:ai-track-search`、`check:track-identity`、`check:track-display`、`electron:compile` 全 PASS；rg 接點 `shouldSkipModelRouter`／`isMetadataFixIntent`／`scanMetadata`／`metadata-fix-snapshot`／`prefillDraft` 皆接在對的檔案，`window.confirm(` 於 src 零命中。
- 仍未驗證（老實說明）：packaged GUI 實測（報告卡→建議卡→套用→readback→復原）——新 AI metadata 功能尚未進打包版，本輪依約不打包，須待下次打包後才能實機走一輪；Windows 真機。未升版、未打包 installer、未 push GitHub。

## 2026-07-07 AI 助手改善（A1–A3）＋歌曲資訊補全 Phase 1＋2 程式完成（版本仍 0.1.44，未打包）

- 規格、進度與交接細節見 `docs/HANDOFF_AI_METADATA.md`（本輪工作單一真相來源；接手前先讀）。
- A1 智慧分流：`aiTrackSearch.ts` 新增 `shouldSkipModelRouter()`，`AIAssistantPanel.resolveMusicIntent` 規則信心高（明確 add/remove/random/create/search 且有關鍵字或 mood）直接用規則結果，不呼叫 0.8B LLM router——更快且避免小模型輸出偏移。
- A2 token 預算：`electron/ai/aiService.ts` 新增 `estimateTokens`（CJK 1 字 1 token、其餘 4 字元 1 token）與 `trimMessagesToBudget`；`sanitizeMessages` 尾端以 `aiModelConfig.historyTokenBudget = 2400` 由新到舊裁切，最新一則單獨超標時硬切內容。防禦 4096 ctx 溢出（目前 chat 只送單句，屬防禦性下限）。
- A3 卡死偵測：`completeChat` 拆成 wrapper＋`completeChatOnce`；streaming 加 `firstTokenTimeoutMs = 15_000` 首 token 逾時；連續 2 次真失敗（非使用者取消、非 busy 早退——busy 早退回傳新增 `busy: true` 標記）自動 `shutdown()`，下次呼叫重新拉起 sidecar。
- B1 健檢掃描：新檔 `src/utils/metadataFix.ts`（純函式）：`isMetadataFixIntent()`（含「整理歌單」「資料夾」撞字防護，須在歌單邏輯前判斷）、`scanMetadata()` 統計缺歌手/專輯/年份/曲風/封面與可寫回數（mp3/flac/m4a）。AI 面板聊天輸入「檢查歌曲資訊」等即出報告卡（純讀取、不經 LLM、程式組字回覆）。
- B2 推測引擎＋建議卡：規則推測附信心（high/medium）＋證據——artist 檔名「歌手 - 歌名」或同資料夾多數決（≥3 首、≥0.8）；album 同資料夾多數決；year/genre 同專輯全同（≥2）high、同歌手多數 medium；曲號取檔名開頭數字。逐首建議卡（欄位 checkbox 預設全勾）三按鈕：套用並下一首／我來改（開 SongInfoPanel 帶入 `prefillDraft` 建議值，savedDraft 保持原值讓 dirty 亮起）／跳過；「取消整理」跳完成卡；整理中聊天區 max-h-64 → max-h-96。
- B2 寫入安全：套用走既有 `handleApplySongInfoToOriginal` 全管線（suspend audio／temp+rename 寫入／readback／IndexedDB），只寫文字欄位——`stripCoverFromSongInfoDraft` 剝除 cover 欄位，writer 收不到 cover 就不碰 picture block（0.1.37–0.1.43 封面戰場不受影響）。寫前快照存 renderer session（`metadataFixSessionRef`）供「全部復原」，並經新 IPC `aquariusgirl:save-metadata-fix-snapshot` 落盤 `userData/metadata-fix-snapshots/<sessionId>.json` 當災難備援。
- v1 已知簡化（故意，勿當 bug 修）：寫回失敗（含播放中鎖檔）計入「失敗」繼續下一首，完成卡提示暫停後重跑；復原僅文字欄位、僅本次 session；不做批次「一鍵全套用」；不推測 albumArtist 與封面；網路查詢（MusicBrainz）與聲紋（AcoustID/fpcalc）為 Phase 3/4 未做。
- 已通過（Linux 沙盒）：`tsc --noEmit`、`npm run electron:compile`、`check:metadata-save-loop`、`check:song-info`（含 writer wasm roundtrip）、`check:ai-track-search`、`electron-selected-file-check`；推測引擎以 tsc 編譯至 /tmp 煙霧測試通過（同資料夾補齊 artist/album/year/genre/曲號、檔名解析 artist、意圖撞字案例全對）；rg 接點掃描齊全、`window.confirm(` 零命中、src 無編譯殘渣。
- 尚未驗證：`vite build`（沙盒缺 `@rollup/rollup-linux-arm64-gnu`，mac 本機跑 `npm run build` 即可補驗）；packaged GUI 實測（報告卡→建議卡→套用→復原）；Windows 真機。未升版、未打包 installer、未 push GitHub。

## 2026-07-07 Confirm Focus Lock / Toast Position hotfix 0.1.44 完成

- 已修正 Windows EXE 使用者回報：更換歌曲封面成功後，playlist 排序按鈕點不開、playlist 搜尋歌手輸入框與 AI 助手輸入框點了沒反應（一般按鈕仍可按）；以前也疑似發生過同類現象。
- 根因：套用到原始檔前的 `window.confirm()` 原生同步確認窗。Electron 已知 Windows 問題：`window.confirm` / `window.alert` 關閉後 webContents 鍵盤焦點壞掉——原生 `<select>` 下拉打不開、文字輸入框無法取得焦點，但一般 button click 正常，與使用者症狀完全吻合（排序是原生 select、搜尋與 AI 是 input）。macOS 不受影響，所以 DMG 驗收不重現。
- 修法（零新套件、不動寫回 / readback hash 路徑、不改 DB schema、不清 IndexedDB）：
- 新增 `src/components/ConfirmDialog.tsx`（樣式與焦點行為照抄 PlaylistDeleteDialog：取消鈕 autoFocus、Esc 關閉、backdrop 點擊取消；z-[85] 高於歌曲資訊面板 z-[80]、低於 toast z-[90]），取代全專案 4 處 `window.confirm`：`SongInfoPanel` 套用到原始檔確認與放棄修改確認、`App.tsx` 重新讀取音樂標籤確認與匯入備份合併確認。確認流程行為不變，只換掉原生視窗。
- `electron/main.ts` 新增 `showOpenDialogWithFocusRestore()`：3 個原生檔案選擇 dialog（選音樂檔、選音樂資料夾、選自訂圖片）一律掛 parent window，關閉後補 `webContents.focus()`，堵住同類「無 parent dialog 關閉後焦點壞掉」的 Windows 地雷。
- `src/components/MessageToast.tsx`：提示位置從右上 `right-4 top-4` 移到左上 `left-4 top-12`，切齊桌面版標題列（h-9）下緣，不再蓋住右上角「選擇音樂檔」等按鈕、也不再被螢幕上緣裁切；同時加 `pointer-events-none`，提示顯示期間也永遠不會擋任何點擊（toast 內無互動元素）。
- `src/components/SortControls.tsx`：排序控制加 hover 變色反饋（cursor-pointer + `hover:border-aquarius-blue/50 hover:bg-aquarius-blue/[0.15] hover:text-white`），樣式對齊我的最愛等 IconButton glass hover。
- 保存提示：逐路徑核對 `handleApplySongInfoToOriginal` 與 `SongInfoPanel`——成功顯示「已套用到原始檔」，所有失敗分支（非桌面版、格式不支援、封面資料不完整、寫回失敗、readback 失敗、readback hash 不一致、IndexedDB 保存失敗、exception）都有紅色錯誤提示；0.1.43 已把 toast 升到 z-[90]，本版再把位置移開遮擋區並 pointer-events-none，成功 / 失敗提示一定看得到。
- 防回歸：`scripts/song-info-check.mjs` 新增 guard——`src/App.tsx` 與 `src/components/SongInfoPanel.tsx` 禁止再出現 `window.confirm(` / `window.alert(`。
- 效能：M1 Air 8GB——全部是 UI 層小改，無新增背景工作、無全庫掃描；ConfirmDialog 只在需要確認時 render，上萬首曲庫載入與播放路徑完全不受影響。
- 已通過（Linux 沙盒）：`tsc --noEmit`、`npm run electron:compile`、`check:prompts`、`check:track-display`、`check:track-identity`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:metadata-save-loop`、`check:playback-restore`、`check:taglib-wasm-packaging`、`check:song-info`（含 writer 真實 wasm roundtrip 與新 window.confirm guard）、`electron-selected-file-check`、`ai-track-search-check`；rg 掃描確認 src/ 與 electron/ 無 `window.confirm` / `window.alert` 殘留（僅註解提及）。
- 版本已升 0.1.44（package.json / package-lock.json / exportSettings）。0.1.44 installer：
- `Aquariusgirl Music Room Setup 0.1.44.exe`：667,667,973 bytes，SHA-256 `c0fb27123611c9b1d98902bd13daf9981ee41d65e3fa8b328ae8d2a220a20a27`
- `Aquariusgirl Music Room-0.1.44-arm64.dmg`：684,759,938 bytes，SHA-256 `f086700f1c129883547cfb88fa2a211329c4262c4dbedadae9440d50c1601779`
- DMG `hdiutil verify` VALID；唯讀掛載讀回版本 0.1.44 / Mach-O arm64 / taglib wasm 存在（`qa-temp/version-readback-0.1.44.txt`）；打包時 `dist:release` 內全部 check 與 vite build 再次通過（build exit=0）。
- 本輪 GUI 驗收依使用者要求以後台驗證取代（Windows confirm 焦點行為無法在 macOS / Linux 重現，屬 Electron 已知問題修法，Windows 真機驗收仍待使用者實測回報）；程式與文件已依使用者後續指示推送 GitHub main（installer 不進 git）。詳見 `docs/releases/0.1.44-checksums.md`。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.44 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset、不要 push GitHub。0.1.44 已完成 code 修正（ConfirmDialog 取代 4 處 window.confirm + 原生檔案 dialog parent/focus restore + toast 左上 pointer-events-none + 排序 hover 反饋）、全部 source check、installer 產出（`release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.44-checksums.md`）。驗收重點（Windows 真機優先）：更換封面並「套用到原始檔」成功後，馬上點 playlist 排序下拉（要能打開且 hover 有變色）、搜尋歌手輸入框、AI 助手輸入框（都要能輸入）；套用前會出現新的 renderer 確認窗（非原生視窗）；保存成功 / 失敗提示都出現在左上角、不擋按鈕；匯入備份與重新讀取音樂標籤的確認窗也改為 renderer 版。不可打開或修改使用者原始 Music 資料夾；使用暫存音樂複本與隔離 profile。

## 2026-07-07 Big Cover Readback Crash / Save Feedback hotfix 0.1.43 完成

- 已修正 macOS DMG 使用者回報：MP3（nonoc-Memento）用 320KB `cover 01.jpeg` 換封面成功，改用 4.3MB `Cover 01.jpg` 按「套用到原始檔」後卡住、關掉面板後「重新讀取音樂標籤」一直失敗；Finder 已顯示新封面、播放器仍舊圖。
- 根因與 .jpg / .jpeg 副檔名無關，已在 Linux 沙盒以打包版 wasm 設定（`AQUARIUSGIRL_TAGLIB_WASM_DIR` + `forceWasmType: "emscripten"`）100% 重現：taglib-wasm 預設 partial read 只讀前 1MB + 尾 128KB，寫入 4.3MB 封面後 ID3v2 標籤區約 4.3MB 被截斷，packaged Emscripten TagLib 解析截斷 buffer 直接 WASM `RuntimeError: unreachable`（`isValid()` 仍回 true，崩潰發生在 properties / getPictures / dispose），不是 `InvalidFormatError`，0.1.41 的 full-load retry 條件接不到 → 寫回成功但 readback / reload 永遠失敗，播放器與 IndexedDB 停在舊資料。
- 次因（使用者以為卡住）：`MessageToast` z-[60] 被歌曲資訊面板 overlay z-[80] 蓋住，保存失敗時面板不關、錯誤訊息完全看不到。
- 修法（4 檔案約 40 行、零新套件、不清 IndexedDB、不改 DB schema、不動寫回與 readback hash 路徑）：
- `electron/songInfoWriter.ts`：`readSongInfoFromOriginalFile(sourcePath, { partialRead })` 預設完整讀取（寫前預讀、保存後 readback、「重新讀取音樂標籤」等單檔 user-initiated 動作永不踩截斷崩潰）；partial 路徑遇任何錯誤（含 WASM RuntimeError）都 fallback 一次 `partial:false` 完整讀取；`readPicturesSafely` 遇 `WebAssembly.RuntimeError` rethrow 交給 fallback，不再吞掉變成「無封面」假結果；移除只認 `InvalidFormatError` 的 `shouldRetryFullTagRead`。
- `electron/selectedFile.ts`：資料夾／多檔掃描明確走 `partialRead: true` 快速路徑，上萬首曲庫載入效能不變；大封面檔案自動 fallback 完整讀取一次自癒。
- `src/components/MessageToast.tsx`：z-[60] → z-[90]，成功「已套用到原始檔」與所有失敗訊息永遠顯示在最上層（保存成功/失敗一定看得到提示）。
- `src/components/SongInfoPanel.tsx`：保存中按鈕顯示「套用中…」。
- 效能：M1 Air 8GB — full read 只發生在單檔使用者動作與 partial 失敗的 fallback；掃描維持 partial 快速路徑，上萬首無額外負擔。
- 已通過（Linux 沙盒）：打包版 wasm 設定下重現舊版崩潰、修後 320KB 與 4.3MB 封面寫入＋讀回 hash 全數通過、掃描路徑（`partialRead: true` + `toSelectedFile`）大封面 fallback 正常；`check:song-info`（含 writer 真實 wasm roundtrip）、`check:metadata-save-loop`、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`check:taglib-wasm-packaging`、`check:ai-assets`、`tsc --noEmit`、`npm run electron:compile`。
- 版本已升 0.1.43（package.json / package-lock.json / exportSettings）。installer 由 Claude 透過桌面控制雙擊 `打包發行.command`（`npm run dist:release`）在 Mac 本機產出，build exit=0，全部 check 與 vite build 再次通過。0.1.43 installer：
- `Aquariusgirl Music Room Setup 0.1.43.exe`：667,667,342 bytes，SHA-256 `2be0007e5f8869bc253818ab24cc57705ce90b13306d0161a77cb27e41cebd36`
- `Aquariusgirl Music Room-0.1.43-arm64.dmg`：684,779,166 bytes，SHA-256 `c6da0dba496ee3f9d607e1e3727689ac8bb70e3a15bff2ec3b8de06ee8120cc0`
- DMG `hdiutil verify` VALID；未簽章、依使用者要求不 push GitHub。詳見 `docs/releases/0.1.43-checksums.md`。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.43 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset、不要 push GitHub。0.1.43 已完成 code 修正（單檔讀取預設 full read + partial 崩潰 fallback + toast z-[90] + 套用中按鈕狀態）、全部 source check、installer 產出（`release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.43-checksums.md`）。驗收重點：用 4-5MB 的大 JPG（如使用者的 `Cover 01.jpg`）對 MP3「套用到原始檔」，保存後右上角必須跳出「已套用到原始檔」提示、面板自動關閉、播放器立即顯示新封面；「重新讀取音樂標籤」對同一檔必須成功；失敗情境（唯讀檔等）必須在面板開啟時看得到紅色錯誤提示；資料夾掃描含大封面檔案時封面仍讀得到且速度無感差異。不可打開或修改使用者原始 Music 資料夾；使用暫存音樂複本與隔離 profile。

## 2026-07-06 Playing File Lock Release hotfix 0.1.42 完成

- 已修正 Windows EXE 播放中「套用到原始檔」有時保存失敗：根因是 `<audio>` 以 `file:` URL 載入原始檔時 Windows 持有檔案 handle，`rename(tempPath, sourcePath)` 覆蓋被 `EPERM` / `EBUSY` 擋下；macOS rename 可覆蓋開啟中檔案，所以 DMG 驗收不會重現。
- `src/hooks/useAudioPlayer.ts` 新增 `suspendAudioForFileWrite(trackId)`：僅當寫回目標就是目前載入的歌時，暫停並卸下 audio src 釋放 OS handle，回傳 restore 函式；restore 以一次性 `loadedmetadata` listener 接回同一來源、原播放位置與播放狀態。
- `src/App.tsx` `handleApplySongInfoToOriginal` 只在 IPC 寫回期間 suspend，`finally` 立刻 resume；pre-read / readback / `putTrackMetadata` 不受影響。
- `electron/songInfoWriter.ts` 補 `renameWithRetry`（`EPERM` / `EBUSY` / `EACCES` 重試 3 次、150ms）擋防毒短暫鎖檔；重試後仍鎖住回傳明確錯誤「原始檔正被其他程式使用中，請暫停播放後再試一次。原始檔未修改。」
- 效能：釋放 / 接回 O(1) 只碰目前那一首，不掃曲庫、不重載清單；未新增套件、未改 DB schema、未動 0.1.41 partial-read / full-load retry 與 readback hash 路徑；M1 Air 8GB 與上萬首曲庫無額外負擔。
- 已通過（Linux 沙盒）：`check:metadata-save-loop`（新增鎖釋放與 rename retry guard）、`check:song-info`（含 writer 真實 wasm roundtrip）、`check:playback-restore`、`check:playlist-logic`、`check:playback-order`、`check:track-list-virtualization`、`check:prompts`、`check:track-display`、`check:track-identity`、`tsc --noEmit`、`npm run electron:compile`。
- 版本已升 0.1.42（package.json / package-lock.json / exportSettings）。新增 `打包發行.command`：雙擊即在本機跑 `npm run dist:release` 並輸出 log 到 `qa-temp/dist-release.log`；本輪已由 Claude 透過桌面控制執行完成，build exit=0，DMG `hdiutil verify` VALID。0.1.42 installer：
- `Aquariusgirl Music Room Setup 0.1.42.exe`：667,666,956 bytes，SHA-256 `6d67c44c2c68ecfb838cbeb7d18038cda4fca3d96df1733739d9c58f47e75e7f`
- `Aquariusgirl Music Room-0.1.42-arm64.dmg`：684,778,895 bytes，SHA-256 `28caa3939b0ed79861cc9763f0d302956adbdce42768669f0ac987156a236f91`
- DMG `hdiutil verify` VALID；打包時 `dist:release` 內全部 check 再次通過；未簽章、不 push GitHub。詳見 `docs/releases/0.1.42-checksums.md`。
- 本輪依使用者要求不 push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.42 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset、不要 push GitHub。0.1.42 已完成 code 修正（播放中檔案鎖釋放 `suspendAudioForFileWrite` + writer `renameWithRetry`）、全部 source check、installer 產出（`release-delivery/installers/`，SHA-256 見 `docs/releases/0.1.42-checksums.md`）。驗收重點：播放中對目前播放那首「套用到原始檔」保存文字與封面各至少兩次，保存瞬間音訊短暫中斷後應自動回到原位置繼續播放；Windows 真機 fresh install 播放中保存不再失敗；重開後 metadata / 封面仍在。不可打開或修改使用者原始 Music 資料夾；使用暫存音樂複本與隔離 profile。

## 2026-07-06 Full-Load Cover Write Guard / Packaged Mouse QA hotfix 0.1.41 完成

- 已修正 packaged Emscripten TagLib 對大封面 FLAC partial read 的 reload / readback 失敗：`electron/songInfoWriter.ts` 先走既有 partial read，只有遇到 `InvalidFormatError` 才對同一首 user-initiated 原始檔做 `partial:false` full-load retry。
- 已保留單一路徑原則：同一個 TagLib handle 內設定文字與封面，最後只 `saveToFile(tempPath)` 一次再 rename；不恢復 `copyWithTags` / `edit(tempPath)` 雙保存路徑。
- 已保留 0.1.40 的 selectedCover dirty、防 incomplete cover bytes、original-file readback hash 驗證與 `await putTrackMetadata(reloadedTrack)`。
- 已通過：`npm run check:song-info`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- `scripts/song-info-writer-check.mjs` 已強制 fixture 使用 `node_modules/taglib-wasm/dist` 的 Emscripten wasm，並對 Plazma QA 複本完成 Cover 02 -> Cover 01 -> Cover 02 readback。
- 0.1.41 installer 已同步到 `release-delivery/installers/`，DMG `hdiutil verify` 為 VALID；`docs/releases/0.1.41-checksums.md` 已建立。
- packaged DMG app 已用隔離 userData 與暫存 QA FLAC 完成純滑鼠三輪封面驗收：Cover 01 -> Cover 02、Cover 02 -> Cover 01、Cover 01 -> Cover 02。每輪 preview、dirty/apply、busy lock、自動關閉與 readback hash 都通過；「重新讀取音樂標籤」成功；重開同隔離 profile 後最後 Cover 02 與 metadata 仍存在。
- 0.1.41 最新 installer：EXE 667,666,404 bytes，SHA-256 `35d632c4f6f5646f1c4b8e5900e6e438fcdc99048bff71dde4f9f2c2b5b9b404`；arm64 DMG 684,798,474 bytes，SHA-256 `494531f0796bef677517826c3c38381d9c12bda2a837af9c7954b7a747d93c6c`。
- Windows 真機仍待補；本輪依使用者要求不要同步 / push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.41 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset、不要 push GitHub。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.41.exe`、`Aquariusgirl Music Room-0.1.41-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.41-checksums.md` 為準。已完成 packaged macOS DMG 隔離 profile 滑鼠三輪封面驗收；下一步若要補，重點是 Windows 真機 fresh install、歌曲資訊 / 封面讀回、播放 / 暫停、資料夾恢復、AI、Mini/dialog focus、簽章與 notarization。不可打開或修改使用者原始 Music 資料夾；使用暫存音樂複本與隔離 profile。

## 2026-07-06 Selected Cover Dirty Guard / Reload Metadata Diagnostics hotfix 0.1.40 完成

- 已完成第二次選封面 dirty 防線：`SongInfoPanel` 以獨立 `selectedCover` 保存同一份 bytes / MIME / hash / preview，文字 dirty 與封面 dirty 分開判斷，不再用 draft 內的 cover 欄位決定封面是否變更。
- 已修正同一首歌面板開啟期間的 reset 時機：關閉、重新開啟或切換 track id 才重建 draft/savedDraft/selectedCover；同一首歌 dirty 或 busy 時不會被外部 track snapshot 無條件覆蓋。
- 已保留 apply/readback/IDB 單一路徑：apply 時才組合文字 draft + selected cover；App 端若 cover hash 要更新但 bytes 不見會提示「封面資料不完整，請重新選擇封面。」；成功仍必須 readback hash 通過並 `await putTrackMetadata(reloadedTrack)`。
- 已補重新讀取診斷：`reloadSongInfoFromOriginal` 對 ok=false / 無 metadata / exception 會輸出 `[reload-metadata] failed` 或 `[reload-metadata] exception`。dev runtime 可看到 `[select] draftCoverHash`、coverDirty/textDirty、apply selected hash、readback hash 與 IDB saved hash。
- 已通過：`npm run check:song-info`、`npm run check:playlist-logic`、`npm run check:playback-order`、`npm run check:track-list-virtualization`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.40 installer 已同步到 `release-delivery/installers/`，`docs/releases/0.1.40-checksums.md` 已建立；DMG verify、唯讀掛載讀回版本 / app.asar / taglib wasm 與 Windows NSIS static check 已完成。
- 0.1.40 最新 installer：EXE 667,665,700 bytes，SHA-256 `bf36fd3b7674cf2aa9ee8adc5111e5dc4933237764ce63e3fb1bd671f121edba`；arm64 DMG 684,776,924 bytes，SHA-256 `e3ec2403a0218ebcb5eda4de9768a2045b33d30c64c225c6654261cb33e7df20`。
- Windows 真機與完整 packaged GUI 純滑鼠連續封面驗收仍待補；本輪依使用者要求不要同步 / push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.40 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.40.exe`、`Aquariusgirl Music Room-0.1.40-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.40-checksums.md` 為準。重點補驗：使用暫存音樂複本與隔離 profile，對同一首歌連續更換封面至少兩次並「套用到原始檔」，確認第二次 selectedCover dirty 成立、按鈕可按、readback hash 不假成功、重開後封面仍是最後一次成功寫回；再補 Windows 真機 fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不要新增套件、不要清 IndexedDB、不要重掃曲庫、不要加 `coverRevision`，不要 push GitHub，除非使用者明確要求。

## 2026-07-05 Cover Hash Readback / Playlist Order Persistence hotfix 0.1.39 完成

- 已完成封面保存單一路徑：前端選圖保存同一份 `selectedCoverBytes` / MIME / hash / preview；Electron 寫回原始檔後必須重新讀回 cover bytes 並計算 `coverHash`，readback hash 與 selected hash 不一致或仍等於舊 hash 時不顯示成功。
- 已完成歌曲資訊面板狀態防線：apply 期間鎖住更換封面 / 套用 / 關閉；成功必須等待 `putTrackMetadata(reloadedTrack)`；第二次開啟面板會清掉 draft / selected bytes / hash / preview / saving / dirty / error，再從最新 current track 建 draft。
- 已完成 playlist 自訂排序保存：一般 playlist 繼續用 localStorage write-through 與 IndexedDB `savePlaylists`；全部歌曲自訂排序只更新被移動歌曲的 `addedAt` 排序鍵並 `putTrackMetadata(movedTrack)`，避免每次拖曳重寫上萬首。
- 已通過：`npm run check:song-info`、`npm run check:playlist-logic`、`npm run check:playback-order`、`npm run check:track-list-virtualization`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.39 installer 已同步到 `release-delivery/installers/`，`docs/releases/0.1.39-checksums.md` 已建立；DMG verify、唯讀掛載讀回版本 / app.asar / packaged guard 字串與 Windows NSIS static check 已完成。
- 0.1.39 最新 installer：EXE 667,665,556 bytes，SHA-256 `a6f6cdffe625ab243e250c535c0b9ba1f76bce1aea5edbe55263e04ef448efd2`；arm64 DMG 684,792,267 bytes，SHA-256 `4aec705531cff9b6c207c95f72c9c6370d30b50ff4b2c36908d8b4fdcf0a6d23`。
- Windows 真機與完整 packaged GUI 連續封面滑鼠驗收仍待補；本輪依使用者要求不要同步 / push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.39 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.39.exe`、`Aquariusgirl Music Room-0.1.39-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.39-checksums.md` 為準。重點補驗：Windows 真機 fresh install、同一首歌連續更換封面至少兩次並「套用到原始檔」、readback hash 不假成功、重開後封面仍是最後一次成功寫回、playlist / 全部歌曲自訂排序重開後仍保存、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不要新增套件、不要清 IndexedDB、不要重掃曲庫、不要加 `coverRevision`，不要 push GitHub，除非使用者明確要求。

## 2026-07-05 Cover MIME Alias / Sort Controls Guard hotfix 0.1.38 完成

- 已完成 source 修正：`SortControls` 保留原生 select，補 `aria-label` 與 `min-w-[9.5rem]`，讓 playlist 排序選單在 packaged UI 不會看起來只剩單一排序。
- 已補 source guard：`scripts/track-list-virtualization-check.mjs` 會檢查原本 7 種排序 option 與標籤，防止後續改版把多樣排序方式拿掉。
- 已完成封面 MIME alias 修正：`src/utils/songInfo.ts` 與 `electron/songInfoWriter.ts` 將 `image/jpg` / `image/pjpeg` canonicalize 成 `image/jpeg`，`image/x-png` canonicalize 成 `image/png`；GIF / WebP / 真實不支援 MIME 仍拒絕。
- 已通過：`npm run check:song-info`、真實 Plazma 暫存複本封面 roundtrip、`npm run check:track-list-virtualization`、`npm run check:playback-order`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`、`npm run dist:release`。
- 0.1.38 installer 已同步到 `release-delivery/installers/`，`docs/releases/0.1.38-checksums.md` 已建立；DMG verify、唯讀掛載讀回版本 / app.asar / packaged alias 字串與 Windows NSIS static check 已完成。
- packaged macOS GUI 已用隔離 profile 開啟，排序下拉選單 7 種選項都可讀回；原生封面選檔器可用真實滑鼠打開，但純滑鼠選檔被 macOS 隱私提示擋住，需要使用者明確允許後才能完成。封面寫回核心已用暫存複本 writer/readback 驗證。
- 本輪依使用者要求不要同步 / push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.38 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.38.exe`、`Aquariusgirl Music Room-0.1.38-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.38-checksums.md` 為準。重點補驗：Windows 真機 fresh install、排序下拉選單 7 種選項、封面更換與「套用到原始檔」、播放/暫停、資料夾恢復、AI、Mini/dialog focus；若要在 macOS 完成純滑鼠原生選檔流程，需要使用者手動允許 Codex / System Events 的隱私提示。不要新增套件、不要清 IndexedDB、不要重掃曲庫，不要 push GitHub，除非使用者明確要求。

## 2026-07-05 Cover MIME Fallback / Second Cover Save hotfix 0.1.37 完成

- 已完成 source 修正：`src/utils/songInfo.ts` 新增空白 / `application/octet-stream` MIME fallback，只有副檔名為 `.jpg` / `.jpeg` / `.png` 時才推回 `image/jpeg` / `image/png`；`SongInfoPanel` 會正規化 `FileReader` 產生的 data URL prefix。
- 已完成 Electron writer 防線：`electron/songInfoWriter.ts` 的 `decodeCoverDataUrl()` 允許空白 / octet-stream data URL 使用 `draft.coverMimeType` fallback，但真實不支援 MIME 仍會拒絕；5 MB 封面上限、MP3/FLAC/M4A 原始檔寫回與單曲 IndexedDB 保存路徑不改。
- 已先讓新增檢查紅燈：舊程式無法接受空白 / octet-stream cover MIME；修正後 `scripts/song-info-check.mjs` 與 `scripts/song-info-writer-check.mjs` PASS。
- 已通過：`npm run check:song-info`、真實 Plazma 暫存複本 Cover 02 -> Cover 01 roundtrip、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`。
- 升權 `npm run dist:release` 已通過並同步 0.1.37 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已完成 DMG `hdiutil verify` VALID、唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` / `app.asar` package version 均為 0.1.37、Mach-O arm64、`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在；packaged main / renderer 讀回確認 cover MIME fallback 存在。Windows EXE static check 為 PE32 Nullsoft NSIS installer，未在 Windows 真機執行。
- 已補 `docs/releases/0.1.37-checksums.md`。依使用者要求，本輪不要 push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.37 Windows 真機 / packaged GUI 封面寫回驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.37.exe`、`Aquariusgirl Music Room-0.1.37-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.37-checksums.md` 為準。重點驗證：使用暫存音樂複本與隔離 profile，對同一首米津玄師 / Plazma 連續 Cover 02 -> Cover 01 -> Cover 02 或至少兩次更換封面並「套用到原始檔」，第二次不因空白 / octet-stream MIME 失敗；重開後封面仍是最後一次成功寫回的封面；播放中切歌再切回不卡；Windows fresh install、歌曲資訊 / 封面讀回、播放 / 暫停、資料夾恢復、AI、Mini/dialog focus。若要發布到 GitHub，必須等使用者明確指示後再 commit / push / readback。本輪目前依使用者要求未同步 / push GitHub。

## 2026-07-05 Song Info Single Save Path / TagLib Property Map Restore hotfix 0.1.36 完成

- 已完成 source 修正：`electron/songInfoWriter.ts` 補 TagLib property-map alias，讓 `TITLE` / `ARTIST` / `ALBUMARTIST` / `TRACKNUMBER` / `DISCNUMBER` 等大寫 metadata key 正確映射回歌曲資訊欄位；保留 0.1.35 的 unpacked `taglib-web.wasm` 與 `forceWasmType: "emscripten"`。
- 已依使用者要求移除歌曲資訊面板「儲存到播放器」按鈕與 `App.tsx` player-local save handler，避免播放器 IndexedDB override 與原始檔 tag 雙路徑再次互相打架；目前只保留「套用到原始檔」：寫回原檔、重新讀回該首、再 `putTrackMetadata(reloadedTrack)`。
- 已通過：`npm run check:song-info`、`npm run check:playback-restore`、`npm run check:metadata-save-loop`、`npm run build`、`npm run electron:compile`。
- 升權 `npm run dist:release` 已通過並同步 0.1.36 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已完成 DMG `hdiutil verify` VALID、唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` / `app.asar` package version 均為 0.1.36、Mach-O arm64、`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在；packaged renderer 確認「儲存到播放器」已不存在且「套用到原始檔」仍存在；packaged main 確認 property alias 與 wasm path 存在。Windows EXE static check 為 PE32 Nullsoft NSIS installer，本機 `bsdtar` 無法拆 NSIS，未在 Windows 真機執行。
- 已補 `docs/releases/0.1.36-checksums.md`，並更新 installed `build-music-player` 技能到 0.1.36 歷史脈絡。依使用者要求，本輪不要 push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.36 Windows 真機 / GitHub 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.36.exe`、`Aquariusgirl Music Room-0.1.36-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.36-checksums.md` 為準。重點驗證：Windows fresh install 後加入同一批歌曲，歌曲資訊 / 封面 metadata 可正常讀回，不再因 TagLib 大寫 property key 漏掉歌手 / 專輯歌手 / 曲目；歌曲資訊面板不再有「儲存到播放器」，只保留「套用到原始檔」；播放 / 暫停、資料夾恢復、AI、Mini/dialog focus。若要發布到 GitHub，依使用者明確指示後再 commit / push / readback。本輪目前依使用者要求未同步 / push GitHub。

## 2026-07-05 Packaged EXE Metadata Wasm Restore hotfix 0.1.35 完成

- 已完成 source 修正：`electron/songInfoWriter.ts` 不再使用無法指定 wasm 路徑的 `taglib-wasm/simple`，改為共用 `TagLib.initialize(createTagLibLoadOptions())`，packaged 時優先讀 `resources/taglib-wasm/taglib-web.wasm` 並 `forceWasmType: "emscripten"`。
- 已完成打包設定：`package.json` 升到 0.1.35，`extraResources` 外帶 `node_modules/taglib-wasm/dist/taglib-web.wasm`，新增 `check:taglib-wasm-packaging` 並串入 `check:song-info`、`dist:release`、`dist:mac`、`dist:win`；`package-lock.json` 與 `src/utils/exportSettings.ts` 版本也已同步到 0.1.35。
- 已通過：紅燈先行 `node scripts/taglib-wasm-packaging-check.mjs` 在舊設定失敗；修正後 `npm run check:taglib-wasm-packaging` PASS、`npm run check:song-info` PASS、`npm run build` PASS、`npm run electron:compile` PASS。
- 升權 `npm run dist:release` 已通過並同步 0.1.35 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已完成 DMG `hdiutil verify` VALID、唯讀掛載讀回 `CFBundleShortVersionString` / `CFBundleVersion` / `app.asar` package version 均為 0.1.35、Mach-O arm64、`Contents/Resources/taglib-wasm/taglib-web.wasm` 存在；Windows EXE static check 為 PE32 Nullsoft NSIS installer，本機 `bsdtar` 無法拆 NSIS，未在 Windows 真機執行。
- 已補 `docs/releases/0.1.35-checksums.md`，並更新 installed `build-music-player` 技能到 0.1.35 歷史脈絡。依使用者要求，本輪不要 push GitHub。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.35 Windows 真機 / GitHub 後續驗收。先執行 `git status -sb` 與 `git diff --name-only`，不要 reset。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.35.exe`、`Aquariusgirl Music Room-0.1.35-arm64.dmg`；SHA-256 請以 `docs/releases/0.1.35-checksums.md` 為準。重點驗證：Windows fresh install 後加入同一批歌曲，歌曲資訊 / 封面 metadata 不再退回檔名 / 未知歌手；播放 / 暫停、資料夾恢復、AI、Mini/dialog focus；若要發布到 GitHub，依使用者明確指示後再 commit / push / readback。本輪目前依使用者要求未同步 / push GitHub。

## 2026-07-05 Playlist Panel Scroll Restore hotfix 0.1.34 完成

- 已完成 source 修正：`PlaylistPanel` 從只有 `max-h-[calc(100vh-10rem)] min-h-[520px]` 改為同時具備 `h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[520px]`，讓既有 `TrackList` 內部 `overflow-y-auto` 有穩定父層高度可捲。
- 主視窗卷軸保留：`AppLayout` 仍是 `playlist-scrollbar relative z-10 h-screen overflow-y-auto overflow-x-hidden`；`body` 仍只 `overflow-x: hidden`，沒有把主視窗捲軸鎖死。
- 未新增套件、未重做清單、未改 metadata / cover / IndexedDB / playback / Mini Player；只補 playlist 面板高度邊界。
- 已先讓 `check:track-list-virtualization` 對缺少 playlist 實際高度紅燈，再修到 PASS；已通過 `npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- 已補 `docs/releases/0.1.34-checksums.md`；DMG verify、唯讀掛載讀回版本 / app.asar、packaged renderer scroll class、packaged CSS overflow 與 Windows NSIS static check 已完成。依使用者要求，本輪沒有同步 / push 到 GitHub。Windows 真機與 packaged GUI 大曲庫滑鼠 / 觸控板滾動仍待補驗。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.34 Windows / packaged GUI 大曲庫卷軸驗收。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.34.exe`、`Aquariusgirl Music Room-0.1.34-arm64.dmg`。SHA-256 請以 `docs/releases/0.1.34-checksums.md` 為準。重點驗證：主視窗右側大型卷軸仍在；playlist 歌曲列表在歌曲很多時出現自己的內部小卷軸；滾輪在 playlist 區優先捲歌曲列表；兩個卷軸都只在內容超出時出現；沒有水平卷軸；底部內容與 Mini Player 不被裁切；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。注意：0.1.34 目前本機已完成，但依使用者要求未 push GitHub。

## 2026-07-05 Nested Main and Playlist Scroll hotfix 0.1.33 完成

- 已完成 source 修正：`AppLayout` 外層主內容容器改成 `h-screen overflow-y-auto overflow-x-hidden`，主視窗內容超出 viewport 時恢復右側大型垂直卷軸；`body` 不再全域 `overflow: hidden` 鎖死主視窗，只保留 `overflow-x: hidden`。
- `TrackList` 仍保留播放清單內部小卷軸：`playlist-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-3`；`PlaylistPanel` 繼續使用 0.1.32 / 0.1.28 高度 `max-h-[calc(100vh-10rem)] min-h-[520px]`，不讓歌曲清單無限制撐高整頁。
- 未新增套件、未重做清單、未改 metadata / cover / IndexedDB / playback 資料流；這次只修正主視窗與 playlist 兩層 scroll container 邊界。
- 已通過 `check:track-list-virtualization`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`；`dist:release` 內也通過 prompts、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile。
- 已補 `docs/releases/0.1.33-checksums.md`；DMG verify、唯讀掛載讀回版本 / app.asar、packaged renderer scroll class、packaged CSS overflow 與 Windows NSIS static check 已完成。Windows 真機與 packaged GUI 大曲庫滑鼠 / 觸控板滾動仍待補驗。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.33 Windows / packaged GUI 大曲庫卷軸驗收或 GitHub release readback。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.33.exe`、`Aquariusgirl Music Room-0.1.33-arm64.dmg`。SHA-256 請以 `docs/releases/0.1.33-checksums.md` 為準。重點驗證：一般主內容區滾輪會捲整個主視窗；播放清單區滾輪優先捲歌曲清單；兩個卷軸都只在內容超出時出現；沒有水平卷軸；底部內容與 Mini Player 不被裁切；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-05 Playlist Column Scroll Restore hotfix 0.1.32 完成

- 已完成 source 修正：`AppLayout` 左欄移除 0.1.31 放錯位置的 `playlist-scrollbar overflow-y-auto`，回到不承擔 playlist overflow 的 `flex min-w-0 flex-col gap-5`。
- `PlaylistPanel` 高度恢復 0.1.28 的 `max-h-[calc(100vh-10rem)] min-h-[520px]`；歌曲仍在 `TrackList` 自己的原生 `playlist-scrollbar` scroll container 捲動，保留 visible-window + overscan。
- 未新增套件、未重做清單、未改 metadata / cover / IndexedDB / playback 資料流；這次只修正捲軸位置與 playlist 欄位高度。
- 已先讓 `check:track-list-virtualization` 抓到 0.1.31 左欄捲軸紅燈，再修到 PASS；升權 `npm run dist:release` 已通過並同步 0.1.32 EXE / DMG 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- 已補 `docs/releases/0.1.32-checksums.md`；DMG verify、唯讀掛載讀回版本 / arm64 / app.asar / AI model / prompts / runtime 與 Windows NSIS static check 已完成。Windows 真機與 packaged GUI 大曲庫滑動仍待補驗。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.32 Windows / packaged GUI 驗收或 GitHub release readback。最新版 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.32.exe`、`Aquariusgirl Music Room-0.1.32-arm64.dmg`。SHA-256 請以 `docs/releases/0.1.32-checksums.md` 為準。重點驗證：左側播放器 / 頻譜 / 睡眠定時不出現 playlist 捲軸；playlist 欄位高度回到 0.1.28；右側歌曲列表仍可捲動且只 render 可見窗口；最後歌曲不被 mini player 蓋住；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-05 Bounded Playlist Scroll hotfix 0.1.31 完成待提交

- 已完成 source 修正：`AppLayout` 改成 viewport-bounded `h-screen`，內層 `h-full min-h-0`；左欄必要時自己捲，右欄 `overflow-hidden`；`PlaylistPanel` 移除 `min-h-[520px]`；`body` / `#root` 不再負責播放清單 overflow。
- 歌曲卡片仍共用 `PlaylistPanel -> TrackList -> TrackItem`，固定 80px 高度；全部歌曲、自訂播放清單、搜尋結果與智慧播放清單沒有分裂成不同卡片樣式。
- 技能文件已在專案內拆分：`docs/skills/aquariusgirl-music-room-development.md` 與 `docs/skills/github-update-flow.md`。
- 已通過：`check:track-list-virtualization`、`check:metadata-save-loop`、`check:playback-restore`、`check:playback-order`、`check:no-track-save-loop`、`check:no-full-db-save-on-playback`、`check:no-audio-load-on-cover-only-update`、`check:cover-update-five-times`、`check:playlist-song-info-restart`、`npm run build`、`npm run electron:compile`。
- 升權 `npm run dist:release` 已通過並同步 0.1.31 EXE / DMG 到 `release-delivery/installers/`；暫存 `release/` 已移除。
- 已補 `docs/releases/0.1.31-checksums.md`；DMG verify、唯讀掛載讀回與 Windows NSIS static check 已完成。Windows 真機與 100+ 首 packaged GUI 滑動仍待補驗。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.31 Bounded Playlist Scroll hotfix。工作樹已有 source / docs / installer checksum 修改，先跑 `git status -sb` 與 `git diff --name-only`，不要 reset。全域 installed `build-music-player` 已把 GitHub 發布流程轉交給 `github-update-flow`；接著跑 final verification，最後才 commit / push / GitHub 讀回確認。

## 2026-07-05 Playlist Edge Scrollbar hotfix 0.1.30 完成

- 已修正右側歌曲列表捲軸不夠明確、位置不像使用者截圖紅圈所示外緣捲軸的 UI 回歸。
- 根因：0.1.29 補了右欄 flex 高度，但實際 scrollbar 仍在 `TrackList` 內層，且右側保留卡片 padding，看起來像藏在卡片裡；`TrackList` 也仍用固定 520px 估算可視窗口，沒有跟實際 flex scroll 高度連動。
- 修正：`TrackList` 用原生 `ResizeObserver` 量測自身可視高度，保留 visible-window + overscan；scroll container 加 `playlist-scrollbar`、`overflow-x-hidden`、`scrollbar-gutter: stable` 與底部 144px safe space，避免最後歌曲被 mini player 蓋住。`PlaylistPanel` 的 list wrapper 用 `-mr-3 pr-1` 讓捲軸靠近右側面板外緣；`TrackItem` 固定 80px 高度，搭配 8px row 間距。
- 防回歸：`check:track-list-virtualization` 已補動態 viewport、bottom safe space、外緣捲軸、禁止水平捲軸、卡片高度與 CSS scrollbar-gutter 檢查。
- 驗收：`check:track-list-virtualization`、`npm run build`、`npm run electron:compile`、`check:metadata-save-loop`、`check:playback-restore`、`check:playback-order`、升權 `npm run dist:release` 通過。`dist:release` 內也通過 prompts、track-display、track-identity、playback-order、track-list-virtualization、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS，已同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.30`、CFBundleVersion `0.1.30`、Mach-O arm64、`app.asar` package version `0.1.30`、mac AI model / prompts / `darwin-arm64/llama-server` 存在。EXE static check 為 NSIS installer；未在 Windows 真機執行。
- 最新 installer：`Aquariusgirl Music Room Setup 0.1.30.exe`、`Aquariusgirl Music Room-0.1.30-arm64.dmg`。
- SHA-256：EXE `0a5a3db85a22841b44421fc2d9a312ef298e561006af49c5dca832fd7f8a48ba`；DMG `82fc07094b8efb051dd76fcd310305e1c7281fe22e85e22a48acd6aa46339872`。根 README 不再內嵌長 hash，請看 `docs/releases/0.1.30-checksums.md`。
- 驗收限制：本輪未在 Windows 真機安裝；未做 packaged GUI 真實大曲庫滑動與觸控板實測；macOS / Windows 仍未簽章。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.30 Windows / 大曲庫 GUI 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 請以 `docs/releases/0.1.30-checksums.md` 為準。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點驗證：右側歌曲列表捲軸位於清單最外緣、搜尋 / 排序 header 固定、左側播放器 / 視覺頻譜 / 睡眠定時不跟著捲、最後幾首歌不被 mini player 蓋住、沒有水平捲軸、大清單滑動仍只 render 可見窗口且順暢、Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-05 Playlist Edge Scrollbar Hotfix 0.1.30 Complete

- Made the right song-list scrollbar visible near the playlist panel's outer edge, while search/sort stay fixed above the scrolling cards.
- Kept the fix minimal: native scroll styling, dynamic TrackList viewport measurement, bottom safe space for the mini player, and fixed 80px track cards. No new dependency or list rewrite.
- Latest installers are in `release-delivery/installers/`.
- SHA-256 lives in `docs/releases/0.1.30-checksums.md`.
- Passed source guards, build, package, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Real Windows QA, real large-library GUI scroll QA, signing, and notarization remain open.

## 2026-07-04 Playlist Scroll Bounds hotfix 0.1.29 完成

- 已修正右側播放清單卡片沒有內部捲軸、清單往底部播放器下方延伸的版面回歸。
- 判斷：這個捲軸需要存在；播放清單會有大量歌曲，不能讓整個頁面或底部播放器承擔清單 overflow。
- 根因：0.1.28 已把 `TrackList` 改成可見窗口 render，但右側外層沒有穩定高度邊界。`App.tsx` 右側 wrapper 缺少 `h-full min-h-0`，`PlaylistPanel` 使用 viewport `max-height` 而不是吃右欄剩餘高度，導致 `TrackList` 的 `h-full overflow-y-auto` 沒有可捲動的父層高度。
- 修正：`AppLayout` 右側 section 加 `lg:h-full`；`App.tsx` 右側 wrapper 改為 `flex h-full min-h-0 flex-col gap-4`；`PlaylistPanel` 移除 `max-h-[calc(100vh-10rem)]`，改為 `overflow-hidden lg:min-h-0 lg:flex-1`。沒有新增套件、沒有重做虛擬清單。
- 防回歸：`check:track-list-virtualization` 已擴充檢查右欄 full-height / min-height 邊界、`PlaylistPanel` flex scroll bound、禁止回到舊 viewport max-height，同時保留 TrackList windowing 檢查。
- 驗收：先讓新版 source guard 在舊版紅燈，再修到 PASS；通過 `check:track-list-virtualization`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。`dist:release` 內也通過 prompts、track-display、track-identity、playback-order、playback-restore、metadata-save-loop、all-target AI assets、build、Electron compile。
- 瀏覽器版面驗收：dev browser 以 2048×1152 量測，播放清單卡片 bottom 與睡前定時卡片 bottom 均為 `1542px`；右側 wrapper class 為 `flex h-full min-h-0 flex-col gap-4`。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS，已同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.29`、CFBundleVersion `0.1.29`、Mach-O arm64、`app.asar` package version `0.1.29`、mac AI model / prompts / `darwin-arm64/llama-server` 存在。EXE static check 為 NSIS installer；未在 Windows 真機執行。
- 0.1.29 當版 installer：`Aquariusgirl Music Room Setup 0.1.29.exe`、`Aquariusgirl Music Room-0.1.29-arm64.dmg`。
- SHA-256：EXE `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`；DMG `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`。
- 驗收限制：本輪未在 Windows 真機安裝；dev browser 沒載入真實大曲庫，真實上萬首 GUI 滑動仍需用暫存資料與隔離 profile 補驗；macOS / Windows 仍未簽章。
- 技能更新：已把 0.1.29「右欄高度邊界要與 TrackList windowing 一起驗」經驗補進 installed `build-music-player` 技能。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.29 Windows / 大曲庫 GUI 驗收。0.1.29 當版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`、DMG `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點驗證：右側播放清單卡片底部與左側睡前定時卡片底部切齊；播放清單內部可捲動且底部播放器不被清單覆蓋；大清單滑動仍只 render 可見窗口並保持順暢；Windows fresh install、播放/暫停、資料夾恢復、AI、Mini/dialog focus。不可打開或修改使用者原始 Music 資料夾，使用暫存音樂複本與隔離 profile。

## 2026-07-04 Playlist Scroll Bounds Hotfix 0.1.29 Complete

- Restored the right playlist card's internal scroll and aligned its bottom with the Sleep Timer card bottom.
- Root cause: TrackList already had visible-window rendering, but the right column lacked a stable flex height boundary, so `h-full overflow-y-auto` had no bounded parent.
- Fix: right grid item gets desktop full height, the right wrapper is `flex h-full min-h-0 flex-col`, and `PlaylistPanel` uses `overflow-hidden lg:min-h-0 lg:flex-1` instead of the old viewport max-height.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `b774a90ce60d593cdeab9221509d9920cd76940b25043b1025e6af4be19459a1`; DMG `22752a59b697c9d2d899bb798fe5f175d10bdf1a87d375b9e39b327bca8dd874`.
- Passed source guards, browser layout measurement, build, package, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Real Windows QA, real large-library GUI scroll QA, signing, and notarization remain open.

## 2026-07-04 Kill Metadata Save Loop hotfix 0.1.28 完成

- 已修正嚴重效能與資料同步問題：`tracks` 任意變動不再自動保存整個曲庫；播放統計、duration、歌曲資訊 / 封面更新改成單曲 `put` / `patch`，避免每次播放或換封面都搬運大型 `coverDataUrl`。
- 根因：`useMusicLibraryDb` 的 `[tracks]` effect 會在任何 tracks state change 後 `saveTracksNow(tracks)`；`saveTrackMetadata()` 會 `store.clear()` 再 put all。播放中的 `recordTrackPlayback` / `setTrackDuration` 與單曲 metadata 更新因此會形成全庫重寫與 `storedTracks -> applyStoredTrackMetadata -> tracks` 回授。
- 修正：新增 `putTrackMetadata`、`putManyTrackMetadata`、`patchTrackPlayback`、`patchTrackDuration`、`deleteTrackMetadata`、`replaceAllTrackMetadata`；`saveTrackMetadata()` 僅保留為整庫重建相容入口。`applyStoredTrackMetadata` 同一次 App 執行只做啟動補救一次。
- 歌曲資訊面板補回「儲存到播放器」：只保存全域 tracks 與 IndexedDB 單曲並標記本地 metadata override，不修改原始音樂檔；「套用到原始檔」仍需寫回原檔、重新讀回該首歌並完成單曲 IndexedDB 保存後才顯示成功。
- 播放流程：播放只 patch playCount / lastPlayedAt；loadedmetadata 只 patch duration；封面 / metadata-only 更新不改 `localUrl`、不改 `mediaVersion`、不觸發同來源 `audio.load()`。
- 播放順序修正：播放器核心現在使用目前歌曲清單排序後的 `orderedPlaybackTracks`；手動排序與檔名排序都會照畫面由上到下播放，搜尋只篩選畫面，不縮短播放核心佇列。
- 歌曲清單效能修正：`TrackList` 改成只 render 目前可見窗口與 overscan，不再對上萬首曲庫一次 `tracks.map` 產生上萬個 DOM row。
- 新增檢查：`check:playback-order`、`check:track-list-virtualization`、`check:metadata-save-loop`、`check:no-track-save-loop`、`check:no-full-db-save-on-playback`、`check:cover-update-five-times`、`check:playlist-song-info-restart`、`check:no-audio-load-on-cover-only-update`；`check:playback-restore` 也會確認「儲存到播放器」使用 `replaceTrackSongInfo(..., { metadataOverride: true })` 後 `await putTrackMetadata(savedTrack)`。這些是 source-level regression guard，不是完整 packaged GUI 壓力測試。
- 追加 dev guard：重複 `applyStoredTrackMetadata`、播放中非預期 `readSongInfoFromOriginalFile`、同 track source 變動造成 `audio.load()` 都會 console warn，並由 `check:metadata-save-loop` 防回歸。
- 驗收：上述新檢查、`check:playback-order`、`check:track-list-virtualization`、`check:playback-restore`、`check:song-info`、`check:track-display`、`check:track-identity`、`check:ai-track-search`、`check:flac-metadata`、`check:prompts`、`check:theme-colors`、`check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release` 均通過。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS，已同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG `hdiutil verify` VALID；唯讀掛載讀回版本為 0.1.28、CFBundleVersion 為 0.1.28、執行檔為 Mach-O arm64、`app.asar` package version 為 0.1.28、mac AI model / prompts / runtime 存在。EXE static check 為 NSIS installer；Windows 真機與 packaged GUI 壓力測試仍未完成。
- 最新 installer：`Aquariusgirl Music Room Setup 0.1.28.exe`、`Aquariusgirl Music Room-0.1.28-arm64.dmg`。
- SHA-256：EXE `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`；DMG `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.28 packaged GUI / Windows 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`、DMG `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點驗證：手動排序與檔名排序播放都照目前歌曲清單由上到下；大清單滑動時只需 render 可見窗口且不卡；同一首連續換封面 5 次不卡；播放含大型 coverDataUrl 的歌曲不整庫保存；播放清單歌曲資訊 / 封面本機保存或原始檔寫回後強制重開仍顯示最新資料；封面更新不觸發同來源 `audio.load()`。使用暫存音樂複本與隔離 profile，不可打開或修改使用者原始 Music 資料夾。不要用清 IndexedDB、重掃全曲庫或 debounce 當修法。

## 2026-07-04 Kill Metadata Save Loop Hotfix 0.1.28 Complete

- Fixed the metadata save loop by removing arbitrary `tracks` -> full-library save behavior.
- Playback stats, duration, and song-info / cover edits now use single-track IndexedDB `put` / `patch` calls.
- The song-info panel now includes player-local save, which updates global tracks plus IndexedDB only and does not touch the original file.
- Playback now follows the current list order for manual and filename sorts.
- TrackList now renders only the visible window plus overscan, so large libraries do not create one DOM row per track.
- Latest installers are in `release-delivery/installers/`.
- SHA-256: EXE `bf58e089f85d0653336e017dc5ec2425200639f7b89eb4363a95349875ece141`; DMG `246562abf9eaed00e456ff92f9e8222932ff6a08a393b73daa32dde6639ad8a6`.
- Passed source guards, TrackList windowing check, build, package, DMG verify, read-only DMG version / arm64 / app.asar / AI model / prompts / runtime checks, and Windows NSIS static check. Packaged GUI stress QA, real Windows QA, signing, and notarization remain open.

## 2026-07-04 歌曲資訊面板二次寫回 hotfix 0.1.27 完成

- 已補完歌曲資訊 / 封面寫回 / IndexedDB / 播放卡頓同族殘留：第一次封面寫回成功後，第二次開啟歌曲資訊面板可能沿用舊 draft / saving 狀態，造成「套用到原始檔」按鈕無反應或狀態異常。
- 判斷：不清空整個 IndexedDB、不重掃整個音樂庫、不新增套件。這次是面板狀態機與寫回入口防線問題；0.1.26 的單曲 `saveTracksNow()` 與 audio source guard 仍是正確基底。
- 根因：`SongInfoPanel` 只用 `[open, track?.id]` 初始化 draft，無法覆蓋同一 track 最新 metadata / cover snapshot；第一次成功後也沒有集中清理 draft 與 `savingRef`。按鈕 disabled 條件缺少 dirty / unsupported format 等明確原因。
- 修正：新增 `trackDraftSnapshot`、`resetDraftState()`、`savingRef`；關閉或成功後清掉 draft，`finally` 一律重設 saving；按鈕 disabled 僅涵蓋 no current track / saving / not desktop / no dirty fields / unsupported format；App 端也在 IPC 前拒絕不支援寫回的格式。
- 已在 `check:playback-restore` 加防回歸：要求 `savingRef`、`resetDraftState`、`trackDraftSnapshot`，禁止回到 `[open, track?.id]` 單一依賴，並要求 dirty-aware disabled。
- 驗收：`npm run check:playback-restore`、`npm run check:song-info`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release` 均通過。
- 打包：一般沙盒 `npm run dist:release` 在 `hdiutil create` 失敗；升權重跑同一命令 PASS，已同步兩個 installer 到 `release-delivery/installers/`，暫存 `release/` 已移除。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.27`、CFBundleVersion `0.1.27`、Mach-O arm64、`app.asar` package version `0.1.27`、mac AI runtime 存在；Windows EXE static check 為 NSIS installer。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.27.exe`、`Aquariusgirl Music Room-0.1.27-arm64.dmg`。
- SHA-256：EXE `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`；DMG `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`。
- 驗收限制：本輪未執行 packaged GUI 滑鼠流程，也未在 Windows 真機執行；Windows fresh install、4 GB / 20+ 首資料夾、實機 song-info / cover 寫回、AI、Mini/dialog focus、簽章仍需人工驗收。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.27 Windows / packaged GUI 驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`、DMG `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。重點：使用暫存音樂複本與隔離 profile，驗證歌曲資訊面板第一次寫回後，第二次開同一首或另一首換封面仍可按「套用到原始檔」；重開後封面不回舊圖、播放清單不掉歌；播放中 metadata / cover 更新不觸發同來源 `audio.load()` 卡頓。不要清整個 IndexedDB 當修法。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-04 Song Info Second Writeback Hotfix 0.1.27 Complete

- Fixed the second song-info / cover writeback path by resetting panel draft and saving state from the latest track snapshot.
- Kept the fix local: no full IndexedDB clear, no library rescan, no new dependency.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.27.exe`, `Aquariusgirl Music Room-0.1.27-arm64.dmg`.
- SHA-256: EXE `c39676a14ce17931d20b21e22b2c9fba5239d16e43a6f449fd59b7188d67d937`; DMG `6a4100871195db1e2b0c17c87b2af8fb640a5d865bfccc0765fba2e0216fcf19`.
- Passed source checks, build, package, DMG verify, read-only DMG metadata checks, and Windows NSIS static check. Packaged GUI mouse QA and real Windows QA remain open.

## 2026-07-03 單曲寫回後 DB 立即保存 hotfix 0.1.26 完成

- 已補完 0.1.24 / 0.1.25 同族殘留：播放中把 Plazma 封面從 cover02 改回 cover01，切歌再切回仍可能短暫卡住；重開 App 第一次可能仍看到舊 cover02，第二次才看到 cover01。
- 判斷：不應在每次歌曲資訊更新後清掉整個音樂資料庫再重載。那只是把使用者手動「刪資料庫、重加音樂」縮成粗暴流程，對未來上萬首歌曲不友善。
- 根因：原始檔寫回成功後，播放器雖然重新讀回該曲 metadata 並更新 React state，但成功提示 / 關閉面板早於 IndexedDB track metadata 實際保存完成；若很快重開，資料庫仍可能留著舊 cover02。
- 修正：`replaceTrackSongInfo` 回傳更新後的 `Track` snapshot；`useMusicLibraryDb` 新增 `saveTracksNow()`，沿用既有保存 queue 立即保存指定 tracks snapshot；「套用到原始檔」只有在單曲 metadata 重讀與 IndexedDB 保存都完成後才顯示成功。
- 已在 `check:playback-restore` 加防回歸：要求 `saveTracksNow`、要求回傳 `saveTask`、要求 App 端 `await libraryDb.saveTracksNow`，避免成功提示早於 DB 保存。
- 已通過 `npm run check:playback-restore`、`SONG_INFO_FIXTURE_PATH=/private/tmp/.../Plazma-test/01. Plazma.flac npm run check:song-info`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- DMG `hdiutil verify` VALID；升權唯讀掛載讀回版本 `0.1.26`、CFBundleVersion `0.1.26`、Mach-O arm64、`app.asar` 存在、mac AI model/runtime 存在；Windows EXE static check 為 NSIS installer；`release/` 暫存輸出已移除。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.26.exe`、`Aquariusgirl Music Room-0.1.26-arm64.dmg`。
- SHA-256：EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`；DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。
- GUI 驗收補做：已卸載 / 重新掛載 0.1.26 DMG，使用 `/private/tmp/aquariusgirl-0.1.26-mouse-profile` 隔離 profile，只載入 `/private/tmp/aquariusgirl-0.1.26-mouse/Plazma-test` 暫存複本。Plazma 播放中 Cover 02 -> Cover 01 套用到原始檔成功；原始 FLAC 讀回為 Cover 01（data URL 長度 `5789911`，Cover 02 為 `1347951`）；切到 `02. BOW AND ARROW.flac` 再切回 `01. Plazma.flac` 仍會播放且不卡；重開同 profile 後 `0.1.26 Cover QA` 播放清單仍保留 Plazma。
- 驗收限制：macOS 原生對話框因 `/private/tmp` 隱藏路徑與無輔助使用權限無法完整滑鼠自動選檔，資料夾與封面檔選擇使用限制在暫存路徑的本機 harness；播放、編輯面板、套用確認、切歌、重開與播放清單觀察皆在 packaged app UI 完成。Windows 真機安裝、4 GB 資料夾與簽章仍需人工驗收。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.26 Windows / 大資料夾驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`、DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。macOS packaged 隔離 profile 已驗證 Plazma cover02 -> cover01 寫回、切歌再切回不卡、第一次重開仍保留 Cover 01、播放清單不掉歌；但 native dialog 選檔使用暫存 harness。下一步重點：Windows fresh install、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、AI、Mini/dialog focus、簽章。不要清整個曲庫當修法；0.1.26 正確方向是單曲寫回後 await IndexedDB 保存。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Single-Track Writeback Persistence Hotfix 0.1.26 Complete

- Fixed the remaining cover/writeback persistence race after original-file writeback.
- Root cause: the app could report writeback success before the updated track metadata snapshot had finished saving to IndexedDB.
- Fix: original-file writeback now reloads only the edited track and awaits `libraryDb.saveTracksNow(...)` before showing success.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.26.exe`, `Aquariusgirl Music Room-0.1.26-arm64.dmg`.
- SHA-256: EXE `0486767f4ebf7cf4d0adb233f62bd1d62da0c53709895d00e1a3fc50ce94dc5d`; DMG `16acf709838b2fc1831227693aba133e47d5979ee0dc580865734d3038a2be91`.
- Passed source checks, build, package, DMG verify, read-only DMG metadata checks, packaged macOS isolated cover-writeback / switch-track / restart / playlist QA, and Windows NSIS static check. Native macOS file-dialog selection used a temp-path harness; real Windows QA remains open.

## 2026-07-03 audio source 誤重載 hotfix 0.1.25 完成

- 已補完 0.1.24 同族殘留：播放中更換封面 / 歌曲資訊後，切到其他首再切回同一首仍可能短暫卡住。
- 判斷：這不是全新問題，而是 metadata / cover 寫回後音訊來源刷新干擾的同族殘留；0.1.24 修掉 `mediaVersion` 與 IndexedDB 保存順序，但 `useAudioPlayer` 仍用瀏覽器正規化後的 `audio.src` 回讀值與原始 `currentTrackSource` 比較。
- 根因：source effect 依賴 duration，metadata / duration 更新時可能因 `audio.src !== currentTrackSource` 誤判為新來源並執行 `audio.load()`。
- 修正：新增 `loadedTrackSourceRef` 記住最後指定給 audio element 的 source；source effect 只依賴 `currentTrackSource`，duration 更新不再重載音訊。`stop()` 與清空來源時同步清 ref。
- 已在 `check:playback-restore` 加防回歸：要求 `loadedTrackSourceRef`，禁止 `audio.src !== currentTrackSource`，禁止 source effect 依賴 `[currentTrackDuration, currentTrackSource]`。
- 已補強 `song-info-writer-check`：有 `SONG_INFO_FIXTURE_PATH` 時會讀同資料夾的 `Cover 02.jpg` / `Cover 01.jpg` 做真實 cover02 -> cover01 roundtrip；本輪用 Plazma 暫存複本 PASS，原始音樂未修改。
- 已通過 `npm run check:playback-restore`、`npm run check:track-display`、`npm run check:track-identity`、`SONG_INFO_FIXTURE_PATH=/private/tmp/.../Plazma-test/01. Plazma.flac npm run check:song-info`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- DMG `hdiutil verify` VALID；EXE static check 為 Windows NSIS installer。Codex 沙盒拒絕直接啟動 Electron GUI，且 `hdiutil attach` / `imageinfo` 因裝置權限與用量限制未完成，所以本輪不宣稱滑鼠實機操作或 DMG 唯讀掛載讀回 PASS。
- 0.1.25 installer（歷史）位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.25.exe`、`Aquariusgirl Music Room-0.1.25-arm64.dmg`。
- SHA-256：EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`；DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。
- 技能更新：0.1.25 lesson 原本曾因用量限制未寫入；已於 0.1.26 回合連同 0.1.26 lesson 補進 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。
- 仍需人工驗收：Windows fresh install、播放中改封面後切歌再切回不卡、cover02 -> cover01 重開不回跳、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、歌曲資訊 / 封面寫回、AI、Mini/dialog focus；macOS 仍需實際 GUI 滑鼠流程與 DMG 唯讀掛載讀回。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.25 歷史驗收查核時使用。0.1.25 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`、DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`。0.1.25 lesson 已於 0.1.26 回合補進 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md`。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Audio Source Reload Hotfix 0.1.25 Complete

- Fixed the remaining 0.1.24-family playback stall where metadata / cover updates could still cause a same-source `audio.load()`.
- Root cause: `useAudioPlayer` compared browser-normalized `audio.src` with raw `currentTrackSource`, and source loading depended on duration updates.
- Fix: `loadedTrackSourceRef` tracks the assigned source; source loading depends only on `currentTrackSource`.
- 0.1.25 historical installers: `Aquariusgirl Music Room Setup 0.1.25.exe`, `Aquariusgirl Music Room-0.1.25-arm64.dmg`.
- SHA-256: EXE `591442e89c863405e59666b1aa19372927f909b02f3a55eaa47a1d06f9984442`; DMG `dac596ee8df1b54103984d6b292d6d74f4f9c19ce52350efc90c9a736924e1c4`.
- Passed source, build, package, DMG verify, and Windows NSIS static checks. GUI mouse validation, DMG read-only mount readback, real Windows QA, and signing remain open. The 0.1.25 skill-file lesson was later added during the 0.1.26 round.

## 2026-07-03 封面寫回播放卡頓 hotfix 0.1.24 完成

- 已修正播放中更換封面後，切到其他首再切回會短暫卡住才播放的問題。
- 已修正封面 cover02 改成 cover01 後，第一次重開仍看到 cover02、第二次重開才看到 cover01 的保存順序問題。
- 判斷：這不是全新問題，但也不是 0.1.23 原 bug 復發；同屬 metadata / cover 寫回後狀態打架，這次精確路徑是 `mediaVersion` 造成 audio source 重載，以及 IndexedDB track metadata 非同步保存順序競賽。
- 修正：`replaceTrackSongInfo` 不再為 metadata/cover-only 更新設定 `mediaVersion: Date.now()`；`useMusicLibraryDb` 以 `trackSaveQueueRef` 串接 save / clear，確保舊 cover save 不會晚於新 cover save 落地。
- 已把更詳細復盤寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` 的 0.1.24 條目。
- 已通過 `npm run check:playback-restore`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:song-info`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run check:prompts`、`npm run check:theme-colors`、`npm run check:custom-images`、all-target `check:ai-assets`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`。
- 已完成 0.1.24 DMG `hdiutil verify`、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查，以及 Windows NSIS EXE static check。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.24.exe`、`Aquariusgirl Music Room-0.1.24-arm64.dmg`。
- SHA-256：EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`；DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。
- 仍需 Windows 真機驗收：fresh install、播放中更換封面後切歌再切回不卡、重開封面不回跳、播放/暫停、最後資料夾恢復、4 GB / 20+ 首資料夾、歌曲資訊 / 封面寫回、AI、Mini 與 dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.24 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`、DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放中更換封面後切歌再切回不卡、cover02 -> cover01 重開後不回跳、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、改封面後播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Cover Writeback Playback Hotfix 0.1.24 Complete

- Fixed playback stalling after cover writeback when switching away and back to the edited track.
- Fixed the first-restart-old-cover / second-restart-new-cover persistence race.
- This is the same metadata / cover writeback conflict family as earlier fixes, but not the exact 0.1.23 bug. The precise 0.1.24 path was unnecessary `mediaVersion` audio reload plus unordered IndexedDB track metadata saves.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.24.exe`, `Aquariusgirl Music Room-0.1.24-arm64.dmg`.
- SHA-256: EXE `648e1283bcdb299f284026c1e312692ee98a12f2fd53acd9ba28f8aec3c8447e`; DMG `dd42b468718c12dcb3d585f582c896263ba45fdc111a16d846bb702e91adf603`.
- Passed the full 0.1.24 source, build, package, DMG, and static EXE checks. Real Windows QA remains open.

## 2026-07-03 歌手欄位閃爍 hotfix 0.1.23 完成

- 已修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的畫面閃爍。
- 判斷：這不是全新的問題類型，而是 0.1.19 / 0.1.21 以來 metadata 來源打架的同族問題；本次新的精確路徑是 `storedTracks` 同時是開機舊資料與目前 `tracks` 即時鏡像。
- 根因：Electron auto-restore 為了啟動速度用 `readMetadata:false`，一開始可能只有較弱 metadata；`applyStoredTrackMetadata` 直接 `artist: stored.artist`，且回灌 stored metadata 後沒有標記 `metadataLoaded`，導致後續弱 stored metadata 又把真實歌手蓋回未知歌手。
- 修正：stored 文字欄位只有非空值才覆蓋目前 track 文字；回灌任一 stored metadata 後標記 `metadataLoaded`，後續同 sourcePath 的同步只更新 duration、playCount、lastPlayedAt 等播放統計。
- 已把回歸測試補進 `check:playback-restore`：確認不能再出現 `artist: stored.artist`，必須使用 `preserveStoredText(stored.artist, track.artist)`，且回灌 stored metadata 要有 `metadataLoaded: track.metadataLoaded || hasStoredMetadata(stored)`。
- 已通過 `npm run check:playback-restore`、`npm run check:track-display`、`npm run check:track-identity`、`npm run check:song-info`、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、`npm run check:prompts`、all-target `check:ai-assets`、`npm run check:custom-images`、`npm run check:theme-colors`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查、Windows NSIS static check。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.23.exe`、`Aquariusgirl Music Room-0.1.23-arm64.dmg`。
- SHA-256：EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`；DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。
- 仍需 Windows 真機驗收：fresh install、歌手欄位不再「米津玄師 / 未知歌手」跳動、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾、歌曲資訊與封面寫回、AI、Mini 與 dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.23 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`、DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、歌手欄位不再在真實歌手與未知歌手之間跳動、播放不卡且暫停會停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、歌曲資訊寫回、封面 cover02 -> cover01 可改回且播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 Artist Flicker Hotfix 0.1.23 Complete

- Fixed the artist field flicker where the UI alternated between `米津玄師` and `未知歌手`.
- This is the same metadata-source conflict family as earlier fixes, but the precise 0.1.23 path was new: `storedTracks` acted as both startup snapshot and live `tracks` mirror.
- Root cause: auto-restore uses `readMetadata:false` for startup speed, so early tracks can carry weak metadata. `applyStoredTrackMetadata` directly assigned `artist: stored.artist` and did not mark the track metadata-loaded after applying stored metadata, allowing weak stored metadata to overwrite real artist text later.
- Fix: stored text only overwrites current text when it is non-empty; applying stored metadata marks the track metadata-loaded, so later same-source syncs update playback stats only.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.23.exe`, `Aquariusgirl Music Room-0.1.23-arm64.dmg`.
- SHA-256: EXE `8bd5a6a0114c8b405cea373a0a74fddaebb0df263c837cd6172628fec754e259`; DMG `7d0ecf5d3f842ce2712f3ca5f0f27b17158f5caf33c71b15d7f80b9cebe3f21a`.
- Still open: real Windows install, artist-flicker UI verification, playback/pause, latest-folder restore, large-folder load, song info / cover writeback, AI, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-03 08:59 Cover 01 封面回改 hotfix 0.1.22 完成

- 已查明米津玄師 `Cover 01.jpg` 無法選回封面的根因：圖片本身是正常 JPEG/Exif，1500×1500、4,342,414 bytes，不是特殊壞結構；舊版播放器封面上限為 3 MB，所以 `Cover 02.jpg` 約 1 MB 能成功，`Cover 01.jpg` 會被擋在預覽與保存之前。
- 已將歌曲封面上限調整為 5 MB；這足以支援 `Cover 01.jpg`，同時保留上限以避免過大圖片拖慢 M1 MacBook Air 8GB 或未來大量歌曲環境。
- 已新增明確錯誤提示：若封面超過上限，顯示「封面圖片太大，請選擇 5 MB 以內的 JPG / PNG」；格式錯誤則只提示 JPG / PNG。
- 已補測試：`song-info-check` 覆蓋 4,342,414 bytes 的 `Cover 01.jpg` 類型案例、過大圖片提示與格式錯誤提示；Electron writer 的 data URL 解碼也覆蓋 4,342,414 bytes JPEG。
- 已用真實 `01. Plazma.flac` 暫存複本驗證：寫入 `Cover 02.jpg` 後讀回，再寫回 `Cover 01.jpg` 後讀回，PASS；原始音樂檔未修改。
- 已通過 `npm run check:song-info`、真實 FLAC cover02 -> cover01 roundtrip、`check:track-display`、`check:track-identity`、`check:playback-restore`、`check:ai-track-search`、`check:flac-metadata`、`npm run build`、`check:prompts`、all-target `check:ai-assets`、`check:custom-images`、`check:theme-colors`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 / app.asar / prompt / runtime 檢查、Windows NSIS static check。
- 0.1.22 歷史 installer 位於 `release-delivery/installers/` 當時輸出：`Aquariusgirl Music Room Setup 0.1.22.exe`、`Aquariusgirl Music Room-0.1.22-arm64.dmg`。
- SHA-256：EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`；DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。
- 仍需 Windows 真機驗收：fresh install、選擇大於 3 MB 且小於 5 MB 的 JPG 封面、超過 5 MB 封面錯誤提示、FLAC 封面寫回、播放/暫停、4 GB / 20+ 首資料夾、AI 操作與 Mini/dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.22 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`、DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、米津玄師 `Cover 02.jpg` 可改回 `Cover 01.jpg`、選到大於 3 MB 且小於 5 MB 的 JPG 會預覽並可保存、超過 5 MB 的圖片會明確提示過大、播放/暫停、選擇新資料夾後重開恢復最後來源、約 4 GB / 20+ 首音樂資料夾可載入、AI 建歌單等待狀態、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-03 08:59 Cover 01 Cover Revert Hotfix 0.1.22 Complete

- Root cause: `Cover 01.jpg` is a valid JPEG/Exif image, 1500x1500 and 4,342,414 bytes. It was blocked by the old 3 MB cover limit before preview/writeback, while the smaller `Cover 02.jpg` passed.
- Raised the song-cover limit to 5 MB and added a specific too-large error message.
- Verified a real `01. Plazma.flac` temp copy: write `Cover 02.jpg`, read back, then write `Cover 01.jpg`, read back. Original files were not modified.
- 0.1.22 historical installers: `Aquariusgirl Music Room Setup 0.1.22.exe`, `Aquariusgirl Music Room-0.1.22-arm64.dmg`.
- SHA-256: EXE `c0ae948862958ba50cfd9984d6b2df475a528b306d116a1691683d3fb585c7b3`; DMG `341198490334adfb712cd831aa89f6e0c256d8c74b509138a352c522bca4e3b4`.
- Still open: real Windows install, cover >3 MB and <5 MB UI/writeback, >5 MB error message, FLAC writeback on Windows, playback/pause, large-folder load, AI, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 23:50 顯示/封面/啟動效能 hotfix 0.1.21 完成

- 已修正截圖圈選的歌曲顯示排序：目前播放卡與歌曲列表第一行優先顯示檔名，沒有檔名才顯示歌曲標題；第二行顯示歌手。
- 已修正封面寫回後播放清單遺失歌曲的根因：Electron 本機檔案 track id 不再把 mtime / size 當主要識別，改以穩定 `sourcePath` 為主。原始檔寫回封面造成大小或修改時間改變時，同一首歌不會在下次重開被視為另一首。
- 已加入舊播放清單 id remap：載入曲庫後會用保存的 `sourcePath` 把舊 id 對應到目前 track id，避免 0.1.19 / 0.1.20 期間因檔案改寫產生的舊 id 讓播放清單掉歌。
- 已驗證封面「cover02 改回 cover01」：使用真 MP3 fixture 的暫存複本，先寫入 cover02、讀回確認，再寫回 cover01、讀回確認，原始 fixture 不被修改。
- 已縮短 Electron 啟動恢復來源清單的重 metadata 讀取：`restore-music-paths` 先跳過 taglib metadata / cover 逐首讀取，改用 IndexedDB 內保存的 metadata 快速還原；需要重讀原始檔時再走明確操作。
- 已讓 AI 助手建立播放清單期間顯示等待狀態，並暫時停用輸入與建立按鈕，避免使用者在建立中連續送出無效指令。
- 已新增 `scripts/track-display-check.mjs`、`scripts/track-identity-check.mjs`，並把 `check:track-display` / `check:track-identity` 納入 `dist:release` / `dist:mac` / `dist:win`。
- 已通過 `npm run check:track-display`、`npm run check:track-identity`、`npm run check:playback-restore`、`npm run check:song-info`、真 MP3 cover02 -> cover01 fixture roundtrip、`npm run check:ai-track-search`、`npm run check:flac-metadata`、`npm run build`、`npm run check:prompts`、all-target `check:ai-assets`、`npm run check:custom-images`、`npm run check:theme-colors`、`npm run electron:compile`、升權 `npm run dist:release`。
- 已完成 0.1.21 DMG verify、DMG 唯讀掛載版本 / arm64 架構 / app.asar / prompt / runtime 檢查，以及 Windows NSIS EXE static check。macOS 測試 DMG 已卸載。
- 最新 installer 位於 `release-delivery/installers/`：`Aquariusgirl Music Room Setup 0.1.21.exe`、`Aquariusgirl Music Room-0.1.21-arm64.dmg`。
- SHA-256：EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`；DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。
- 仍需 Windows 真機驗收：fresh install、播放/暫停、99 首與更大曲庫載入、約 4 GB / 20+ 首資料夾、封面 cover02 -> cover01 實機寫回、改封面後重開播放清單不掉歌、AI 建歌單等待狀態、Mini 與 dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.21 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`、DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認 fresh install、播放不卡、播放後按暫停會停止、歌曲第一行優先顯示檔名第二行顯示歌手、選擇新資料夾後重開會恢復最後來源、99 首與更大曲庫載入速度、約 4 GB / 20+ 首資料夾可載入、歌曲資訊寫回、封面 cover02 -> cover01 能改回、改封面後重開播放清單不掉歌、AI 建歌單期間會提示等待且不可連續送出、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 23:50 Display, Cover, and Startup Performance Hotfix 0.1.21 Complete

- Fixed the circled display order: the now-playing card and track rows prefer filename first, fall back to song title, and show artist on the second line.
- Fixed the playlist-loss root cause after cover writeback. Electron local track ids now use stable `sourcePath` first instead of mtime / size, so cover writeback no longer makes the same file look like a different track after restart.
- Added playlist id remapping through stored `sourcePath` so older playlist ids can point to the current track id after library restore.
- Verified the cover02 -> cover01 case with a real MP3 fixture temp copy: write cover02, read it back, then write cover01 and read it back again. The original fixture was not modified.
- Startup restore now skips full taglib metadata / cover reads per file and restores from stored IndexedDB metadata first. Explicit reload remains the path for rereading original tags.
- AI playlist creation now shows a waiting status and disables input / create controls while the playlist is being created.
- Added track-display and track-identity checks and wired them into release scripts.
- Passed the full 0.1.21 check set, elevated `dist:release`, DMG verify, read-only DMG version / arm64 / app.asar / prompt / runtime checks, and Windows NSIS static check.
- Latest installers: `Aquariusgirl Music Room Setup 0.1.21.exe`, `Aquariusgirl Music Room-0.1.21-arm64.dmg`.
- SHA-256: EXE `f27c6d64a6828283b75c471a7d2d08f39409c3fa8f7f9645114e38baceaa97d5`; DMG `350ed86187d78279654138bd8f0e9bc069ae8908cc114eafb606371991b04fe5`.
- Still open: real Windows install, playback/pause, 99+ track and larger library loading, a roughly 4 GB / 20+ song folder, real cover02 -> cover01 writeback, playlist persistence after cover changes, AI busy-state UX, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 19:25 播放/資料夾恢復 hotfix 0.1.20 完成

- 已修正播放音樂很卡、按播放後再按暫停沒有停下，以及畫面播放狀態閃爍。根因是播放 effect 依賴整個 `currentTrack`，duration / playCount / metadata 更新都可能讓 `HTMLAudioElement` 重設 source 並重複 `audio.play()`。
- 已把 audio source 同步收斂到穩定的 `currentTrackSource`；只有 `localUrl` 或 `mediaVersion` 改變才 `audio.load()`。播放/暫停改由獨立 effect 同步 `isPlaying`，暫停分支會明確呼叫 `audio.pause()`。
- 已新增 `scripts/playback-restore-check.mjs` 與 `npm run check:playback-restore`，並納入 `dist:release` / `dist:mac` / `dist:win` 前置檢查。
- Electron 手動選擇音樂資料夾時，會把該次 `sourcePath[]` 寫入既有 IndexedDB settings；下次啟動 auto-restore 會優先使用最後一次手動選擇的來源清單，沒有才退回舊版 tracks metadata。
- Electron 選擇資料夾回傳空陣列時不覆蓋最後來源清單，避免取消選擇或空資料夾清掉上次成功選擇。
- 已通過 `npm run check:playback-restore`、`npm run check:song-info`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、Windows NSIS static check。
- 一般沙盒 `npm run dist:release` 仍在 `hdiutil create` 失敗；升權重跑同一命令通過。DMG 唯讀掛載版本/架構讀回本輪因使用限制未完成，未宣稱 PASS。
- 最新 installer：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.20.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.20-arm64.dmg`。
- SHA-256：EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`；DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。
- 仍需 Windows 真機驗收：fresh install、播放/暫停連點、選擇新資料夾後重開自動恢復、約 4 GB / 20+ 首資料夾、歌曲資訊寫回、AI 操作與 Mini / dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

### 接續提示詞

請接續 Aquariusgirl Music Room 0.1.20 Windows 真機驗收。最新版 installer 位於 `release-delivery/installers/`，SHA-256 應為 EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`、DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`。先讀 `release-delivery/QA_REPORT.md`、`release-delivery/INSTALLER_STATUS.md`、`release-delivery/KNOWN_ISSUES.md`。Windows 先安裝 EXE，確認播放不卡、播放後再按暫停會停止、畫面不閃爍、選擇新音樂資料夾後重開會恢復最後選擇的來源清單、約 4 GB / 20+ 首資料夾可載入、歌曲資訊寫回、AI 聊天、AI 建歌單、Mini 與 dialog focus。不要修改 installers，除非 source、資源、版本或打包設定真的改變。文件更新只追加新版紀錄，不刪舊歷史。

## 2026-07-02 19:25 Playback and Folder Restore Hotfix 0.1.20 Complete

- Fixed playback stutter, pause not stopping reliably, and flashing playback state. Root cause: the playback effect depended on the whole `currentTrack`, so duration / play-count / metadata updates could reset the audio source and call `audio.play()` again.
- Audio source sync now depends on stable `currentTrackSource`; play/pause sync is separate and explicitly pauses when `isPlaying` is false.
- Added `scripts/playback-restore-check.mjs`, `npm run check:playback-restore`, and wired the check into release build scripts.
- Electron folder selection now saves the latest selected `sourcePath[]` into the existing IndexedDB settings store. Auto-restore prefers that latest manual selection before falling back to stored track metadata.
- Empty Electron folder-selection results no longer overwrite the latest source list.
- Passed playback-restore, song-info, FLAC metadata, build, Electron compile, elevated `dist:release`, DMG verify, and Windows NSIS static check. DMG read-only mount version/architecture readback was blocked by usage limits this round and is not marked PASS.
- Latest installers: `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.20.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.20-arm64.dmg`.
- SHA-256: EXE `a22876f29dc2f6128066bbe6292412723942e9f6b88f25c71e49dc396012fdda`; DMG `36c52a05f47405fb7b2073b689527534873372fa7f6cb0cf57a0f67d58ed80f7`.
- Still open: real Windows install, playback/pause click testing, latest-folder restore after restart, large-folder load, song-info writeback, AI operation, Mini/dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 18:55 歌曲資訊寫回 hotfix 0.1.19 完成

- 已接續 0.1.19 初版修完使用者回報的歌曲資訊反覆跳動、保存流程打架，以及 Windows EXE 選擇大型音樂資料夾可能閃退問題。
- 已移除「保存到播放器」路徑，只保留「套用到原始檔」；播放器狀態在寫回成功後重新讀原始檔 metadata，並清除 metadata override。
- 已移除目前播放卡更多選單內重複的「更換專輯封面」按鈕；封面只在「編輯歌曲資訊」面板內更換。
- Electron 選擇檔案 / 資料夾 / 恢復路徑時，不再把音檔本體讀成 `ArrayBuffer` 傳進 renderer；改回傳 `file://`、source path、大小、mtime、relative path 與必要 metadata。這次判斷 EXE 閃退主因更像是總檔案大小經 IPC 傳輸造成記憶體壓力，不是 20 多首這個數量本身。
- 原始檔寫回改用 `taglib-wasm` 的 `TagLib.copyWithTags(source, temp, tags)` 先寫同副檔名暫存檔，封面也在暫存檔完成，最後才 rename 覆蓋原檔；真 MP3 fixture 複本寫回與讀回已驗證通過。
- 已把這次測試失敗經驗寫入 `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` 的 0.1.19 條目，供未來節省 token 與防重犯。
- 已通過 `npm run check:song-info`、`SONG_INFO_FIXTURE_PATH=... npm run check:song-info`、`npm run check:flac-metadata`、`npm run build`、`npm run electron:compile`、升權 `npm run dist:release`、DMG verify、DMG 唯讀掛載版本 / arm64 架構檢查、Windows NSIS static check。
- 0.1.19 hotfix installer（歷史）：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`。
- SHA-256：EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`；DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`。
- 仍需 Windows 真機驗收：安裝 EXE、選擇約 4 GB / 20+ 首資料夾、播放、歌曲資訊寫回、封面寫回、AI 操作與 Mini / dialog focus。macOS notarization、Apple Developer ID 與 Windows code signing 仍未設定。

## 2026-07-02 18:55 Song Info Writeback Hotfix 0.1.19 Complete

- Continued the 0.1.19 release and fixed the reported song-info jumping, save-flow conflict, and likely Windows EXE crash when selecting a large music folder.
- Removed the player-local save path. The only save action is now original-file writeback; after success, the app reloads metadata from the original file and clears metadata override state.
- Removed the duplicate current-track cover-change button from the More menu. Cover changes now live only inside the song info editor.
- Electron file/folder selection and path restore no longer read whole audio files into IPC `ArrayBuffer`s. They return `file://`, source path, size, mtime, relative path, and metadata. The likely crash cause was total byte volume through IPC, not the song count alone.
- Original-file writeback now uses `TagLib.copyWithTags(source, temp, tags)` to create a same-extension temp file, applies cover art there, and renames only after success. A real MP3 fixture copy write/read check passed.
- Added the failed-test lesson to `~/.codex/skills/build-music-player/references/aquariusgirl-lessons.md` under 0.1.19.
- Passed `npm run check:song-info`, `SONG_INFO_FIXTURE_PATH=... npm run check:song-info`, `npm run check:flac-metadata`, `npm run build`, `npm run electron:compile`, elevated `npm run dist:release`, DMG verify, read-only DMG version / arm64 checks, and Windows NSIS static check.
- 0.1.19 hotfix installers (historical): `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`.
- SHA-256: EXE `a66b024b68c84f1a1cb94cdaa22210ad12a84f0f2f4ce5481216785e4869d1dc`; DMG `cbb66a0efe8b59d6efd835f375399ec2731bb4db3ff34e23fda86df17e6ac37c`.
- Still open: real Windows install, selecting a roughly 4 GB / 20+ song folder, playback, original-file song info / cover writeback, AI operation, Mini / dialog focus, Developer ID/notarization, and Windows code signing.

## 2026-07-02 14:00 歌曲資訊與原始檔標籤寫回 0.1.19 完成

- 已從 0.1.18 接續升版至 0.1.19。
- 新增目前播放卡「更多」選單、歌曲資訊面板、單曲封面更換、重新讀取音樂標籤、顯示原始檔位置，以及桌面版 MP3/FLAC/M4A 原始檔 metadata / cover 寫回。
- 原始檔寫回使用 `taglib-wasm`，先產生修改後 bytes，再以 temporary file + rename 寫回；失敗時回報「原始檔未修改」。重新讀取在 Electron 版會由主程序直接讀原始檔標籤，避免 FLAC/M4A 寫回後畫面不同步。
- 已通過 `check:song-info`、prompt / AI assets / all-target AI assets / AI track search / playlist / FLAC / custom images / theme colors / build / Electron compile / 升權 `npm run dist:release` / DMG verify / packaged static checks。
- 0.1.19 初版 installer（歷史）：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`。
- SHA-256：EXE `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`；DMG `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`。
- 仍需 Windows 真機驗收、Apple Developer ID / notarization 與 Windows code signing。
- 發行文件規則：根目錄 MD 與 `release-delivery/` MD 必須追加新版紀錄，不可刪除舊版歷史。

## 2026-07-02 14:00 Song Info and Original Tag Writeback 0.1.19 Complete

- Continued from 0.1.18 and bumped to 0.1.19.
- Added the current-track More menu, song info panel, per-track cover changes, metadata reload, show original file location, and desktop MP3/FLAC/M4A original metadata / cover writeback.
- Original file writeback uses `taglib-wasm`, produces modified bytes first, then writes through a temporary file and rename. Electron reloads metadata from the original file after writeback so FLAC/M4A stay in sync.
- Passed `check:song-info`, prompt, AI assets, all-target AI assets, AI track search, playlist, FLAC, custom images, theme colors, build, Electron compile, elevated `npm run dist:release`, DMG verify, and packaged static checks.
- 0.1.19 initial installers (historical): `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.19.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.19-arm64.dmg`.
- SHA-256: EXE `e6552d58b6c15606bb70e1574e7c66345172c7d8896879e249ae829e30e93bc0`; DMG `4d513162387539f5dcc51eb159ffe77d7ab4cb42ac5c63b02f81e979bbb75cf5`.
- Real Windows QA, Apple Developer ID/notarization, and Windows code signing remain open.
- Release-doc rule: root MD files and `release-delivery/` MD files must append new version records without deleting old history.

## 2026-06-29 15:10 AI schema / Result Guard 0.1.18 完成

- 已從 0.1.17 main 接續升版至 0.1.18。
- 已補強三份 prompt、router JSON schema、工具任務 summary-only、Result Guard、safe reply fallback、本次 candidates trackId 驗證，以及 AI 聊天室禁止模型列歌。
- AI 聊天室不再顯示候選歌曲 title；歌曲清單仍由播放清單 UI 根據 `playlist.trackIds` 顯示。
- 已通過 prompt / AI assets / all-target AI assets / AI track search schema / playlist / Mini / FLAC / custom images / theme colors / build / Electron compile / 升權 `npm run dist:release` / DMG verify / packaged static checks。
- 0.1.18 發行當時的 installer：`release-delivery/installers/Aquariusgirl Music Room Setup 0.1.18.exe`、`release-delivery/installers/Aquariusgirl Music Room-0.1.18-arm64.dmg`；目前資料夾只保留最新版。
- SHA-256：EXE `e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`；DMG `0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`。
- 仍需 Windows 真機驗收、Apple Developer ID / notarization 與 Windows code signing。

## 2026-06-29 15:10 AI schema / Result Guard 0.1.18 Complete

- Continued from 0.1.17 main and bumped to 0.1.18.
- Strengthened the three prompts, router JSON schema, summary-only tool tasks, Result Guard, safe reply fallback, candidate trackId validation, and no-model-song-list chat behavior.
- The AI chat no longer shows candidate track titles; song lists remain rendered by the playlist UI from `playlist.trackIds`.
- Passed prompt, AI assets, all-target AI assets, AI track search schema, playlist, Mini, FLAC, custom images, theme colors, build, Electron compile, elevated `npm run dist:release`, DMG verify, and packaged static checks.
- 0.1.18 installers at release time: `release-delivery/installers/Aquariusgirl Music Room Setup 0.1.18.exe`, `release-delivery/installers/Aquariusgirl Music Room-0.1.18-arm64.dmg`. The folder now keeps only the latest release.
- SHA-256: EXE `e107ca91dcc2eb802be7c9e523b58f842da044f857df6baf4bc2c257663c7f1c`; DMG `0104c49602331bf613cb8bb6dccd451930390c1ac376efcc82444a2935af93d4`.
- Real Windows QA, Apple Developer ID/notarization, and Windows code signing remain open.

## 2026-06-29 10:00 GitHub main 合併 0.1.17 完成

- 已依使用者同意合併 `codex/ai-harness-0.1.17` 到 `main`。
- `package.json` 版本已是 0.1.17；AI harness、open prompts、runtime 檢查腳本、GitHub workflow 與 0.1.17 source 已進入 main。
- 合併衝突只發生在 README 與 release-delivery 文件；已保留 main 較新的中英 README / release-delivery / QA 內容。
- 大模型 `resources/ai/models/qwen3.5-0.8b.gguf` 仍不進 Git；installer 仍不放進 Git。
- 本次合併 source 與打包設定，但未重打 installer；現有 0.1.17 installer 仍沿用 2026-06-28 已驗收檔案。

## 2026-06-29 10:00 GitHub main 0.1.17 Merge Complete

- Merged `codex/ai-harness-0.1.17` into `main` with user approval.
- `package.json` is now 0.1.17. The AI harness, open prompts, runtime check scripts, GitHub workflow, and 0.1.17 source are now on main.
- Merge conflicts only touched README and release-delivery docs; the newer bilingual main docs were kept.
- The large local model `resources/ai/models/qwen3.5-0.8b.gguf` remains out of Git. Installers also remain out of Git.
- This merge updates source and packaging settings but does not rebuild installers. The existing 0.1.17 installers are still the 2026-06-28 validated files.

## 2026-06-29 09:35 GitHub 內容盤點與 main 分支狀態（合併前記錄）

- 已檢查 GitHub `main` 對應的追蹤檔案清單、根 `README.md`、根 `CONTINUE_WORK.md`、`release-delivery/*.md`、`package.json`、`package-lock.json` 與 `.github/workflows/release.yml`。
- 根 `README.md` 與 `release-delivery/README.md` 已有中英交付檔案索引；`release-delivery` 文件已更新 0.1.16 / 0.1.17 AI、QA、installer 與人工缺口。
- 合併前差異：`main` 的程式碼與 `package.json` 停在 0.1.15；0.1.17 AI harness、open prompts、runtime 檢查腳本、GitHub workflow 與 `package.json` 0.1.17 位於已存在分支 `codex/ai-harness-0.1.17`。
- 後續修正：已合併 `codex/ai-harness-0.1.17` 到 `main`，並保留 `main` 較新的 README / release-delivery 文件。
- 安全邊界：`resources/ai/models/*.gguf` 與 `resources/ai/bin/darwin-x64/` 不應進 Git；GitHub 只追蹤必要 runtime、prompt 文字、檢查腳本與 `.gitkeep`。
- 本次只做 GitHub 內容盤點與文件修正，未改播放器 source、資源、版本或打包設定，因此不重打 installer。

## 2026-06-29 09:35 GitHub Content Audit and main Branch Status (Pre-Merge Record)

- Checked the tracked GitHub `main` file list, root `README.md`, root `CONTINUE_WORK.md`, `release-delivery/*.md`, `package.json`, `package-lock.json`, and `.github/workflows/release.yml`.
- Root `README.md` and `release-delivery/README.md` now include the bilingual delivery file index. `release-delivery` docs cover the 0.1.16 / 0.1.17 AI, QA, installer, and manual-gap status.
- Pre-merge finding: `main` source code and `package.json` were still at 0.1.15. The 0.1.17 AI harness, open prompts, runtime checks, GitHub workflow, and `package.json` 0.1.17 were on the existing `codex/ai-harness-0.1.17` branch.
- Resolution: `codex/ai-harness-0.1.17` has been merged into `main` while keeping the newer README / release-delivery docs from `main`.
- Safety boundary: `resources/ai/models/*.gguf` and `resources/ai/bin/darwin-x64/` should stay out of Git. GitHub should only track the needed runtime files, prompt text, check scripts, and `.gitkeep`.
- This pass only audits GitHub content and updates docs. It does not change app source, resources, version, or packaging settings, so installers were not rebuilt.

## 2026-06-22 17:44 歌詞／LRC 殘留清理 0.1.15 發行完成

- 確認同步歌詞 UI、LRC 匯入入口與同名 `.lrc` 自動配對早已移除；本輪只刪除 README、新手引導與未使用的 IndexedDB／匯入匯出歌詞資料管線。
- 未新增套件或替代功能；舊版 IndexedDB 若已有退役資料 store，會保留在本機但不再建立、讀取、寫入或匯出，避免破壞使用者資料。
- `src`、`electron`、`scripts`、`dist`、`dist-electron`、README 精準掃描無 LRC／歌詞／字幕殘留；build、Electron compile 與全部既有檢查通過。
- 0.1.15 EXE／arm64 DMG／x64 DMG 已位於 `release-delivery/installers/`；兩個 DMG verify、封裝版本／架構、EXE NSIS static check 與 arm64 packaged `file://` 新手引導均通過，測試 DMG 已卸載。
- Windows EXE 尚未在 Windows 真機執行；installer 未簽章／notarize。

## 2026-06-21 23:54 加入歌單修正 0.1.14 發行完成

- recovery-candidate-5 已一致恢復正式 IndexedDB／Local Storage；0.1.13 與 0.1.14 packaged 重開後均確認 14 首、re0 2 首、米津玄師 4 首，原始音樂檔未改動。
- 目前播放卡加入歌單欄位固定為 `w-36 shrink-0`；重複加入改用 renderer dialog，保留原有確認語意，未新增套件或改歌單結構。
- 全部檢查、build、Electron compile、隔離 GUI、`dist:all`、DMG verify、版本／架構與 packaged `file://`／一般→MINI→一般均通過。
- 0.1.14 EXE／arm64 DMG／x64 DMG 已在 `release-delivery/installers/`；`release/` 不存在，0.1.13／0.1.14 測試 DMG 均已卸載。
- Windows 真機仍需驗證連續加入／重複確認與既有 MINI 手順；installer 未簽章／notarize。

## 2026-06-21 18:32 最大化切換 MINI／拖曳 0.1.12 發行驗收完成

- 已保存 normal bounds 並在套用固定 MINI bounds 前解除 full screen／maximize；MINI 頂部安全區已加入既有拖曳區，控制項維持 no-drag。
- 完整既有檢查、build、Electron compile、Electron dev 全螢幕切換／拖曳／返回 Full 與 `dist:all` 均通過。
- 三個 0.1.12 installer 已在 `release-delivery/installers/`，EXE static check 與 SHA-256 已完成，`release/` 不存在。
- 兩個 DMG verify 均為 VALID；封裝版本均為 0.1.12，架構分別為 arm64／x86_64，arm64 packaged `file://`、preload IPC 與 Full→MINI→拖曳→Full 均通過，本輪測試映像已卸載。
- Windows 0.1.12 EXE 最大化→MINI、拖曳與版面仍需真機驗收；installer 未簽章／notarize。

## 2026-06-20 23:02 MINI 色彩／透明度 0.1.8 發行狀態

- 已在色彩設定新增「MINI 背景」七彩色相；同時套用完整播放器底部 MINI 列與桌面 MINI 視窗。
- 已在透明度設定新增「MINI 視窗」欄位，直接共用既有原生 opacity 狀態與 `20–100%` 安全範圍；未新增第二份狀態或套件。
- 「全部復原」會同步恢復 MINI 色相 232 與透明度 92%。
- `theme-color-check`、`mini-opacity-check`、圖片／FLAC／播放清單檢查、build、Electron compile、Electron dev 色相／20%／100%／復原驗收與 `dist:all` 均通過。
- arm64 packaged `file://` 驗收通過；MINI 色相與透明度欄位、既有保存值載入及底部 MINI 列配色均正常。
- 兩個 DMG `hdiutil verify` 均為 VALID；封裝版本均為 0.1.8，架構分別為 arm64 / x86_64；EXE static check 通過。
- 0.1.8 三個 installer 只保留在 `release-delivery/installers/`，`release/` 不存在，兩個測試 DMG 均已卸載。
- Windows EXE 尚需真機驗收，installer 未簽章／notarize。

目前 0.1.8 installer：

- EXE：134,366,590 bytes，SHA-256 `73b05fb9d97724216ef99ff68a260c5fca9ad51012692252babbf1ecca8f8e56`
- arm64 DMG：149,349,388 bytes，SHA-256 `2de7b79107763012be47fdbd3209d50a3f2cd94bdc3a19f0dac89c37e65d6ae3`
- x64 DMG：151,303,015 bytes，SHA-256 `34fa962543359f7276138a997d23dfd4ae0910b9d81bd75d8470db6a63415d65`
- 修改時間：2026-06-20 23:02:09 CST。

## 2026-06-20 22:21 面板色彩與透明度 0.1.7 發行狀態

- 色彩設定新增「面板背景」七彩色相拉桿，只改 Header、歌單、工具、備份與同類共用面板底色。
- 外觀設定新增「透明度」分頁；共用面板、主背景、角色舞台遮罩與左右裝飾均可調整 `0–100%`，文字與按鈕不跟著透明。
- 設定沿用既有 localStorage、匯出／匯入與全部復原；未新增套件，預設值維持 0.1.6 暗色外觀。
- 相關檢查、build、Electron compile、Electron dev 邊界／保存／復原驗收、`dist:all` 與 arm64 packaged `file://` 驗收均通過。
- 0.1.7 EXE／arm64 DMG／x64 DMG 位於 `release-delivery/installers/`；DMG checksum、兩個封裝版本／架構與 EXE static check 均通過，測試 DMG 均已卸載。
- Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 17:47 暗色面板 0.1.6 發行狀態

- 已將共用 `.glass-panel` 改為固定深藍黑 `rgba(8, 11, 31, 0.94)`，角色舞台另加深色遮罩；主背景仍清楚，紅點與同類卡片不再被背景染亮。
- `theme-color-check`、`custom-image-check`、FLAC／播放清單／Mini 檢查、build、Electron compile、Electron dev 視覺驗收與 `dist:all` 均通過。
- arm64 packaged `file://` 視覺驗收通過：Header、歌單、工具、備份與同類卡片維持暗色，角色舞台已加深，主背景仍清楚。
- 0.1.6 EXE／arm64 DMG／x64 DMG 位於 `release-delivery/installers/`；兩個 DMG checksum、封裝版本與 x86_64／arm64 架構核對均通過，測試掛載均已卸載。
- Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 17:24 主背景清晰度 0.1.5 發行狀態

- 主背景改為 70% opacity 並移除 blur；覆蓋的主題漸層改為半透明，背景人物與城市細節清楚可辨識。
- 圖片／既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- 0.1.5 DMG／EXE 位於 `release-delivery/installers/`；Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 17:05 主背景與裝飾顯示 0.1.4 發行狀態

- 修正 `BackgroundAura` 負 z-index：主背景現在位於內容底層，兩張裝飾清楚固定於左右下角且不攔截操作。
- 圖片／既有功能檢查、build、Electron compile、Electron dev 與 packaged `file://` 視覺驗收、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- 0.1.4 DMG／EXE 位於 `release-delivery/installers/`；Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-20 16:31 FLAC 內嵌封面 0.1.3 發行狀態

- 現有 metadata 解析器已支援 FLAC 原生 `PICTURE` 內嵌封面；未新增套件，未改 UI／播放／歌單。
- FLAC 封面回歸、既有功能檢查、build、Electron compile、`dist:all`、DMG verify、版本／架構與 EXE static check 均通過。
- 0.1.3 DMG／EXE 位於 `release-delivery/installers/`；截圖中的真實 Windows FLAC 尚需用 0.1.3 EXE 匯入確認，installer 未簽章。

## 2026-06-19 17:16 色彩設定 0.1.2 發行狀態

- 外觀視窗新增「圖片／色彩」分頁，以及主色、輔色、金色點綴、文字、背景五組七彩色相拉桿。
- 色彩設定會保存、納入匯出／匯入，並提供全部復原；九張圖片設定維持不變。
- 色彩／圖片／播放清單／Mini 檢查、build、Electron compile、`dist:all`、DMG verify、封裝版本／架構與 EXE static check 均通過。
- 0.1.2 DMG／EXE 位於 `release-delivery/installers/`；Electron 拉桿保存／復原仍需人工確認，Windows EXE 仍需真機驗收，installer 未簽章。

## 2026-06-19 10:44 圖片設定 0.1.1 發行狀態

- 右上新增等距圖片設定按鈕，可更換九張目前實際顯示的 `public/assets` 圖片。
- 自訂圖片會驗證格式／大小並複製到 app userData；可個別回復預設，不修改原始檔。
- 圖片檔案檢查、build、Electron compile、Browser 視覺驗收、`dist:all`、DMG verify 與 EXE static check 均通過。
- 0.1.1 DMG／EXE 位於 `release-delivery/installers/`；原生選圖與重開保存仍需 macOS 人工點擊，Windows EXE 仍需真機驗收。

## 2026-06-18 22:05 智慧清單排除與 MINI 20% 發行狀態

- 智慧型播放清單的垃圾桶已改為持久排除，不刪歌曲庫；排除資料支援保存與備份匯入。
- MINI 透明度下限已改為 20%。
- 邏輯檢查、build、Electron compile、`dist:all`、DMG verify 與 EXE static check 均通過。
- 最新安裝檔與人工驗收缺口詳見 `release-delivery/CONTINUE_WORK.md`。

## 2026-06-18 21:52 MINI 透明度發行狀態

- MINI 已新增 60–100% 數字輸入與左右 ±5 控制，並統一 8px 間距與圓角階層。
- `mini-opacity-check`、build、Electron compile、`dist:all`、DMG verify、EXE static check 均通過。
- 最新 DMG／EXE 位於 `release-delivery/installers/`；SHA-256 與人工驗收缺口詳見 `release-delivery/CONTINUE_WORK.md`。
- 尚需 macOS 桌面版人工點擊原生透明度與 Windows 真機驗收；installer 未簽章。

## 1. 專案目前狀態

- Electron + Vite + React + TypeScript 桌面音樂播放器。
- 已有主播放器、Mini 播放器、播放列表、智慧型播放清單、ID3 tag、專輯封面、音樂律動條、macOS/Windows 打包流程。
- 目前資料夾不是 Git repository，本輪不初始化 Git，改用本文件追蹤接續狀態。

## 2. 本輪任務目標

- 修正播放列表建立流程看起來無反應的問題。
- 移除 Electron App 中破壞沉浸感的瀏覽器安全限制提示。
- 修正 full / mini 視窗 bounds 分開保存與可見範圍 clamp。
- 修正 Mini 外圍巨大半透明框與透明度 UI。
- 修正 Mini alwaysOnTop 前端狀態與 BrowserWindow 實際狀態同步。
- 在主播放器 Visualizer 加入設定入口與強度設定。
- 以一致圓角、細緻邊框、克制陰影打磨 UI。
- 完成 build、Electron compile、dev 與打包驗證。

## 3. 已完成項目

- 已完整閱讀本輪附件需求。
- 已檢查 Electron main process、preload、platform API、瀏覽器安全提示來源。
- 已建立本接續文件。
- 已新增 `PlaylistNameDialog`，一般播放清單建立不再使用 `window.prompt`。
- 已讓 Electron 桌面 App 隱藏技術性瀏覽器安全限制提示，改成正向產品文案；web preview 仍可顯示限制提示。
- 已新增 custom window controls：最小化、放大/還原、關閉。
- 已將 Electron main process 改成 fullBounds / miniBounds 分開保存，並加入可見範圍 clamp。
- 已新增獨立 IPC：`setMiniAlwaysOnTop`, `getMiniAlwaysOnTop`, `windowControl`；Mini 透明度專用 IPC 已於後續移除。
- 已讓 renderer 以 `STORAGE_KEYS.windowBoundsState` 保存 full / mini bounds。
- 已將 Mini 置頂與透明度改成獨立 handler，避免只更新前端圖示。
- 已在主播放器 Visualizer 卡片加入「音樂譜設定」入口。
- 已在 visualizer settings 加入 `intensity` 強度 slider，並套用到 Web Audio analyser 計算。
- 已新增 design tokens：radius、surface、border、shadow、text、accent。
- 已將歌單改名流程改成 `PlaylistNameDialog`，移除 `window.prompt`。
- 已修正 playlist normalize migration 的 `updatedAt` 無限更新風險。
- 已讓 stored playlist store 濾掉 system playlist，避免舊資料混入造成重複 migration。
- 已用 in-app browser 驗證一般播放清單建立流程、主播放器音樂譜設定入口。
- 已修正 Electron dev 預設自動彈出 detached DevTools，改為 `AQUARIUSGIRL_OPEN_DEVTOOLS=1` 時才開。
- 已修正 Electron preload bridge 在 renderer 中未穩定暴露的問題，桌面版可正確顯示 custom window controls 與桌面文案。
- 已加入 Electron userAgent fallback，避免桌面版短暫誤判為 Web preview。
- 已清理 MiniPlayerAssistant 內已不使用的 `onMiniSettingsChange` 舊 props / callback。
- 已重新啟動 Electron dev 視窗並確認 full mode 畫面可顯示、無 DevTools 擋住、無 Web preview 限制文案。
- 已重新導出 macOS DMG，最新版統一放在 `release-delivery/installers/`。
- 已重新導出 Windows NSIS 安裝檔，最新版統一放在 `release-delivery/installers/`。
- 本輪 PM/QA/發行驗收新增：全螢幕/退出全螢幕 IPC 與 Header 按鈕。
- 本輪 PM/QA/發行驗收新增：歌曲列表可直接將指定歌曲加入指定一般播放清單。
- 本輪 PM/QA/發行驗收新增：播放清單建立與改名會阻擋重複名稱。
- 本輪 PM/QA/發行驗收新增：`npm run electron`, `npm run dist`, `npm run dist:win`, `npm run dist:mac`, `npm run dist:all`。
- 本輪 PM/QA/發行驗收新增：`.github/workflows/release.yml` 與 `release-delivery/` 交付文件。
- 已依使用者要求將 full mode 改回原生視窗框：DMG 保留 macOS 紅黃綠，EXE 保留 Windows 原生視窗控制。
- Mini 模式控制列曾改為 hover 浮現，後續已依使用者要求改回常駐顯示。
- 已重新執行 `npm run dist:all`，最新 DMG/EXE 已於 2026-06-16 09:47-09:49 產出。
- 已實際啟動打包過程中的 macOS packaged app，確認左上角原生紅黃綠控制鈕存在。
- 已依使用者要求移除「目前播放佇列」系統歌單與「播放清單資料夾」建立入口、型別、UI 與舊資料匯入殘留。
- 已再次執行 `npm run dist:all`，最新 DMG/EXE 已於 2026-06-16 10:18-10:19 產出，並同步到 `release-delivery/installers/`。
- 已實際啟動 packaged macOS app，確認歌單區不再顯示「目前播放佇列」與「新增播放清單資料夾」。
- 已新增 `scripts/sync-installers.mjs`，打包後會把最新 DMG/EXE 同步到 `release-delivery/installers/`，再移除暫存 `release/`，避免兩個類似交付資料夾。
- 已依使用者要求完全移除 EmptyState 空狀態大卡，刪除 `src/components/EmptyState.tsx`，並移除 `App.tsx` 的渲染入口。
- 已修正 Mini 260x268 視窗水平/垂直捲軸問題，主控控制框常駐顯示。
- 已將 Mini mode 原生 titlebar 空框隱藏，避免上方多出一整塊空白框。
- 已完整刪除 Mini 底部第 2 個音樂條設定與第 4 個透明度按鈕，包含 Mini 面板與透明度專用 IPC。
- 已將 Mini 底部保留的置頂與回完整播放器兩顆按鈕改為等距排列。
- 已在 full mode 頂部 titlebar 區域補回 `Aquariusgirl Music Room` 名稱；Mini 分支不渲染此 title。
- 已移除 Mini 最外層 border，減少一層外框，保留資訊區與控制區。
- 已用 source/CSS/build 驗證確認 Mini 無捲軸設定殘留、控制框常駐 visible、紅圈兩顆按鈕已刪除，並確認 `src/dist` 無 EmptyState/EMPTY STATE/小魚乾大卡文字。
- 已再次執行 `npm run dist:all`，上一輪 DMG/EXE 已於 2026-06-16 16:32 同步到 `release-delivery/installers/`。
- 已修正目前播放歌曲列的點擊行為：目前歌曲按下會切換播放/暫停，非目前歌曲才選歌播放。
- 已補齊設定保存/匯入匯出：Visualizer 設定、Mini 設定、播放清單與播放偏好可保存，不保存音樂檔本體。
- 同步歌詞 UI、LRC 匯入入口、同名 `.lrc` 自動配對及未使用資料管線已於後續版本完整移除。
- 已修正 Windows Mini 黑畫面風險：Windows Mini 視窗 opacity 強制 1、背景色固定，renderer 會 clamp 舊版 Mini opacity 設定。
- 已再次執行升權版 `npm run dist:all`，最新 DMG/EXE 已於 2026-06-16 20:24:03 同步到 `release-delivery/installers/`。

## 4. 尚未完成項目

- Mini alwaysOnTop 跨 App 置頂仍建議在真實桌面環境人工復測。
- Windows EXE 原生視窗控制需在 Windows 實機人工確認；目前 macOS 環境已完成打包但無法直接執行 EXE。

## 5. 目前已知問題

- full mode 採作業系統原生視窗框；仍建議在實際 Electron 視窗手動確認拖曳、縮小、放大、關閉與 resize 手感。
- GUI 自動點擊工具本輪不穩定，因此 Mini 以 source/CSS/build/Electron 截圖檢查驗收；真實手感可再人工補看一次。
- Electron alwaysOnTop 已接 IPC，但跨 App 置頂仍需要使用者在桌面環境手動確認。

## 6. 修改過的主要檔案

- `CONTINUE_WORK.md`
- `src/components/PlaylistNameDialog.tsx`
- `src/App.tsx`
- `src/components/CharacterStage.tsx`
- `src/components/PlayerCore.tsx`
- `src/types/settings.ts`
- `src/hooks/useLocalStorage.ts`
- `src/utils/platform.ts`
- `electron/main.ts`
- `electron/preload.ts`
- `src/components/Header.tsx`
- `src/components/MiniPlayerAssistant.tsx`
- `src/components/EmptyState.tsx`（已刪除）
- `src/components/AudioVisualizer.tsx`
- `src/components/AudioVisualizerSettingsPanel.tsx`
- `src/hooks/useAudioAnalyser.ts`
- `src/styles/tokens.css`
- `src/styles/index.css`
- `tailwind.config.js`
- `src/components/PlaylistManager.tsx`
- `src/hooks/usePlaylists.ts`
- `src/utils/platform.ts`
- `src/components/TrackItem.tsx`
- `src/components/TrackList.tsx`
- `src/components/PlaylistPanel.tsx`
- `src/hooks/useLocalTracks.ts`
- `src/storage/indexedDb.ts`
- `src/utils/audioFiles.ts`
- `src/utils/fileSystemAccess.ts`
- `src/utils/exportSettings.ts`

## 7. 重要設計決策

- 不重寫播放器架構。
- 保持同一個 renderer/audio element，full / mini 切換不建立第二個 audio element。
- 優先沿用現有 `useLocalStorage` 與 IndexedDB playlist 同步策略。
- 若專案不是 Git repository，不建立 checkpoint commit，只更新本文件。

## 8. 視窗 full / mini bounds 處理方式

- Electron main process 目前保存 `windowBoundsState.fullBounds` 與 `windowBoundsState.miniBounds`。
- renderer 也以 localStorage key `aquariusgirl.musicRoom.windowBoundsState` 保存 full / mini bounds。
- 進入 mini mode 前保存目前 full bounds；回 full mode 前保存目前 mini bounds。
- 使用 `ensureBoundsVisible(bounds, minimum)` 依目前 display workArea clamp，避免切回 full mode 跑出螢幕。

## 9. Mini alwaysOnTop 處理方式

- 進入 mini mode 時由 `setMiniPlayerMode(settings)` 呼叫 `setAlwaysOnTop(Boolean(settings.alwaysOnTop), "floating")`。
- mini 中點釘選會呼叫 `aquariusgirl:set-mini-always-on-top`，main process 實際執行 `BrowserWindow.setAlwaysOnTop(enabled, "floating")`。
- 回 full mode 時會呼叫 `setAlwaysOnTop(false)`，避免主視窗意外置頂。

## 10. Mini opacity 處理方式

- 進入 mini mode 時由 `setMiniPlayerMode(settings)` 呼叫 `setOpacity`。
- Windows 進入 mini mode 時 Electron 視窗 opacity 強制為 1，避免透明視窗在切歌時出現黑畫面。
- Renderer 會將舊版 Mini opacity 設定限制在 0.78-1。
- Mini 已移除透明度調整按鈕與 `aquariusgirl:set-mini-opacity` IPC；使用者不再從 Mini UI 調整透明度。

## 11. playlist / smart playlist 的資料結構

- `NormalPlaylist`: `type: "normal"`, `trackIds`, `parentId`, `createdAt`, `updatedAt`。
- `SmartPlaylist`: `type: "smart"`, `match`, `rules`, `sortBy`, `sortDirection`, `limit`, `parentId`。
- Smart playlist 只儲存 rules，不寫死結果 trackIds。

## 12. visualizer 設定資料結構

- 目前包含 `enabled`, `intensity`, `sensitivity`, `smoothing`, `barCount`, `minBarHeight`, `maxBarHeight`, `bassBoost`, `responsiveness`, `displayMode`。
- full mode 與 mini mode 共用同一份 `aquariusgirl.musicRoom.audioVisualizerSettings`。

## 13. migration 狀態

- 舊預設播放列表名稱「睡前小水波」「罐子閃亮 Cover」「狐狸女孩元氣歌」已在 `usePlaylists` migration 名單中。
- 已退場的舊歌單型別會在 `usePlaylists` normalize / 匯入流程中被濾掉。
- IndexedDB playlist save 已改為同步目前清單，避免舊資料殘留。

## 14. 執行過的驗證指令

- `npm run build`：通過。
- `npm run electron:compile`：通過。
- in-app browser：一般播放清單 dialog 可開、可建立、自動選取；主播放器音樂譜設定可開並顯示強度 slider。
- `npm run electron:dev`：通過，可開啟 Electron GUI；已確認 DevTools 不再自動擋住主視窗，桌面版 custom window controls 出現，Electron 中不再顯示 Web preview 限制提示。
- `npm run electron:build:mac`：升權後通過，最新版交付位置為 `release-delivery/installers/`。
- `npm run electron:build:win`：升權後通過，最新版交付位置為 `release-delivery/installers/`。
- `npm install`：通過。
- `npm run dev -- --host 127.0.0.1`：通過。
- `npm run dist:win`：通過，最新版交付位置為 `release-delivery/installers/`。
- `npm run dist:mac`：通過，最新版交付位置為 `release-delivery/installers/`。
- `npm run dist:all`：通過，重新產出 macOS x64/arm64 DMG 與 Windows x64 EXE。
- 2026-06-16 10:18-10:19 最新 `npm run dist:all`：通過，重新產出 macOS x64/arm64 DMG 與 Windows x64 EXE。
- `node scripts/sync-installers.mjs`：通過，最新三個安裝檔保留在 `release-delivery/installers/`，暫存 `release/` 已移除。
- Full mode title source/build 驗證：通過，頂部 `Aquariusgirl Music Room` 名稱只在 full mode 顯示。
- Mini source/CSS/build 驗證：通過，260x268 無 overflow 設定殘留，控制框常駐 visible，音樂條設定與透明度按鈕、面板及透明度 IPC 已移除，最外層 border 已移除。
- EmptyState 移除驗證：通過，`src/components/EmptyState.tsx` 已刪除，`src/dist` 掃描無 `EmptyState` / `EMPTY STATE` / 舊小魚乾大卡文字。
- 2026-06-16 16:32 最新 `npm run dist:all`：通過，最新三個安裝檔保留在 `release-delivery/installers/`，暫存 `release/` 已移除。
- 目前歌曲列播放/暫停切換 source/build 驗證：通過。
- Visualizer / Mini 設定匯出匯入 source/build 驗證：通過。
- LRC／歌詞／字幕 source/build 殘留掃描：通過，無功能入口或資料管線殘留。
- Windows Mini 防黑畫面 source/build 驗證：通過。
- 2026-06-16 20:24:03 最新升權版 `npm run dist:all`：通過，最新三個安裝檔保留在 `release-delivery/installers/`，暫存 `release/` 已移除。

## 15. 尚未執行或失敗的驗證指令

- Computer Use click / keyboard action：本輪可讀取 Electron 視窗與 accessibility tree，但實際 click / key 送出時回報 session inactive；已停止 AppleScript 嘗試，未留下背景程序。
- lint/test/typecheck：package.json 沒有獨立 script；typecheck 已包含在 `npm run build`。

## 16. 手動驗收清單

- 新增播放清單 dialog 可開、可取消、可 Enter 建立、空名錯誤。
- 新增智慧型播放清單 dialog 可開、可建立、rules 動態篩選。
- Electron App 不顯示瀏覽器安全限制提醒。已用 Electron GUI accessibility tree 確認。
- full mode 可拖曳、縮小、放大、resize，按鈕不被 drag 區吃掉。
- mini 在任何角落切回 full 不跑出螢幕。
- mini 無巨大透明外框。
- mini 最外層 border 已移除，少一層框。
- mini 260x268 無水平/垂直捲軸。
- mini 控制框常駐顯示。
- mini 原生 titlebar 空框不顯示。
- mini 底部第 2 個音樂條設定按鈕已刪除。
- mini 底部第 4 個透明度按鈕已刪除。
- EmptyState 空狀態大卡不再出現。
- mini alwaysOnTop 實際置頂。
- Visualizer 設定入口可調強度等設定。
- 目前歌曲列播放中按下會暫停，再按會播放。
- Electron 與 Web 介面不顯示 LRC／歌詞／字幕入口或說明。
- Windows 實機 Mini 按下一首不再出現黑畫面。

## 17. 下一步建議執行順序

1. 在 Windows 實機打開 EXE，人工確認原生視窗控制、Mini 下一首與安裝流程。
2. 在 macOS 桌面環境人工切到 Mini，確認 alwaysOnTop 跨 App 置頂手感。
3. 正式公開前補 Apple Developer ID 簽章、notarization 與 Windows code signing。

## 18. 下次恢復工作時可以直接貼給 Codex 的接續提示詞

請接續上一輪「水瓶罐子音樂播放器 / Aquariusgirl Music Room」修正工作。

請先閱讀 CONTINUE_WORK.md，並檢查目前專案狀態。不要重新設計整個專案，請依照 CONTINUE_WORK.md 的「尚未完成項目」與「下一步建議執行順序」繼續。

請先回報：

1. 目前已完成哪些項目。
2. 目前還有哪些未完成項目。
3. 你接下來會先修哪一項。
4. 預計會修改哪些檔案。

確認後，請繼續完成剩餘工作，並照原本驗證方法執行。
