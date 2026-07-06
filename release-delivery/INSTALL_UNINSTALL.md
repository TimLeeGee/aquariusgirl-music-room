# 安裝與解除安裝

版本：0.1.42
文件更新：2026-07-06

## 0.1.42 安裝狀態

0.1.42（播放中保存失敗修正）installer 已產出並同步到 `release-delivery/installers/`；安裝步驟與 0.1.41 相同，檔名改為 0.1.42。SHA-256 請看 `docs/releases/0.1.42-checksums.md`。

## 0.1.41 安裝狀態

0.1.41 修正 packaged 大封面 FLAC 第二次封面寫回後 reload / readback 失敗的問題，並完成 packaged DMG 隔離 profile 滑鼠三輪封面驗收。installer 已產出並同步到 `release-delivery/installers/`，SHA-256 請看 `docs/releases/0.1.41-checksums.md`。

## 0.1.41 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.41.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.41 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證；首次安裝後請特別確認歌曲資訊 / 封面讀回、同一首歌連續更換封面並「套用到原始檔」、重新讀取音樂標籤、重開後封面與 metadata 保留、播放/暫停、資料夾恢復、AI、Mini/dialog focus。

## 0.1.41 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.41-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。0.1.41 已完成 DMG verify，且 packaged DMG app 已用隔離 userData 與暫存 QA FLAC 完成滑鼠三輪封面驗收；不要用正式 Music 資料夾做測試。

## 0.1.40 安裝狀態

0.1.40 修正第二次選封面後 dirty 可能未成立的狀態機問題，並補 reload metadata 失敗診斷。installer 已產出並同步到 `release-delivery/installers/`，SHA-256 請看 `docs/releases/0.1.40-checksums.md`。

## 0.1.40 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.40.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.40 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證；首次安裝後請特別確認同一首歌連續更換封面並「套用到原始檔」時，第二次 dirty 成立、按鈕可按、readback hash 不假成功，重開後仍保存最後一次封面。

## 0.1.40 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.40-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。0.1.40 已完成 DMG verify 與唯讀掛載讀回；完整 packaged GUI 純滑鼠連續封面驗收仍需使用暫存音樂複本與隔離 profile 補驗。

## 0.1.39 安裝狀態（歷史）

0.1.39 修正封面 readback hash 保存流程與 playlist / 全部歌曲自訂排序保存。installer 已產出並同步到 `release-delivery/installers/`，SHA-256 請看 `docs/releases/0.1.39-checksums.md`。

## 0.1.39 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.39.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.39 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證；首次安裝後請特別確認同一首歌連續更換封面並「套用到原始檔」不會假成功，playlist / 全部歌曲自訂排序重開後仍保存。

## 0.1.39 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.39-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。0.1.39 已完成 DMG verify 與唯讀掛載讀回；完整 packaged GUI 純滑鼠連續封面驗收仍需使用暫存音樂複本與隔離 profile 補驗。

## 0.1.38 安裝狀態

0.1.38 修正 playlist 排序選單防回歸與封面 MIME 別名處理。installer 已產出並同步到 `release-delivery/installers/`，SHA-256 請看 `docs/releases/0.1.38-checksums.md`。

## 0.1.38 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.38.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.38 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證；首次安裝後請特別確認 playlist 排序下拉選單仍有 7 種排序方式，並確認封面更換與「套用到原始檔」可成功。

## 0.1.38 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.38-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。0.1.38 已完成 DMG verify 與唯讀掛載讀回；packaged GUI 已確認排序下拉選單 7 種選項，原生封面選檔器可用真實滑鼠打開，但純滑鼠選檔需要使用者允許 macOS 隱私提示。

## 0.1.37 安裝狀態

0.1.37 修正同一首歌曲第二次更換封面可能因空白 / `application/octet-stream` MIME 失敗的問題。installer 已產出並同步到 `release-delivery/installers/`。SHA-256 請看 `docs/releases/0.1.37-checksums.md`。

## 0.1.37 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.37.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.37 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證第二次封面更換與原始檔寫回；首次安裝後請特別確認同一首歌連續更換封面並「套用到原始檔」時，第二次不因空白 / octet-stream MIME 失敗。

## 0.1.37 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.37-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。DMG verify 與唯讀掛載讀回版本 / app.asar / unpacked `taglib-web.wasm` 已通過。

## 0.1.36 安裝狀態（歷史）

0.1.36 修正歌曲資訊 metadata 欄位讀回可能漏掉大寫 TagLib property key 的問題，並移除「儲存到播放器」按鈕。installer 已產出並同步到 `release-delivery/installers/`。SHA-256 請看 `docs/releases/0.1.36-checksums.md`。

## 0.1.36 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.36.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.36 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證 metadata 讀取；首次安裝後請特別確認歌曲資訊 / 封面不再漏掉歌手、專輯歌手、曲目或光碟欄位。歌曲資訊面板不再有「儲存到播放器」，只保留「套用到原始檔」。

## 0.1.36 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.36-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。DMG verify 與唯讀掛載讀回版本 / app.asar / unpacked `taglib-web.wasm` 已通過。

## 0.1.35 安裝狀態

0.1.35 修正 Windows packaged EXE 歌曲資訊讀取可能失敗的 wasm 路徑問題，installer 已產出並同步到 `release-delivery/installers/`。SHA-256 請看 `docs/releases/0.1.35-checksums.md`。

## 0.1.35 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.35.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.35 已完成 Windows NSIS static check，但尚未在 Windows 真機驗證 metadata 讀取；首次安裝後請特別確認歌曲資訊 / 封面不再退回檔名 / 未知歌手。

## 0.1.35 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.35-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

macOS 可能顯示未認證開發者提醒，因為測試版尚未做 Developer ID signing / notarization。DMG verify 與唯讀掛載讀回版本 / app.asar / unpacked `taglib-web.wasm` 已通過。

## 0.1.34 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.34.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.34 修正 playlist 內部小卷軸消失的回歸：主視窗大型卷軸仍保留，playlist 歌曲列表在歌曲很多時應出現自己的內部垂直卷軸。仍建議首次在 Windows 真機驗證主視窗卷軸、playlist 內部卷軸、沒有水平卷軸、底部內容與 Mini Player 不被裁切、手動排序 / 檔名排序播放順序、大清單滑動、播放/暫停、資料夾恢復、歌曲資訊與封面寫回。

## 0.1.34 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.34-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

0.1.34 已完成 DMG verify 與唯讀掛載讀回版本 / app.asar / packaged renderer scroll class / packaged CSS overflow 檢查。解除安裝 App 不會刪除使用者原始音樂檔。

## 0.1.33 歷史安裝說明

0.1.33 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.33.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.33-arm64.dmg`。該版 hotfix 修正主視窗大型卷軸消失的回歸；0.1.34 已補回 playlist 內部小卷軸的穩定高度邊界。

## 0.1.32 歷史安裝說明

0.1.32 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.32.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.32-arm64.dmg`。該版 hotfix 修正 0.1.31 把捲軸放到左側主欄的回歸，並讓 playlist 欄位高度回到 0.1.28；0.1.33 已補回主視窗自己的大型卷軸。

## 0.1.31 歷史安裝說明

0.1.31 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.31.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.31-arm64.dmg`。該版 hotfix 修正 app body / 右側播放清單 overflow 邊界，但 0.1.32 已復原左側主欄不應承擔 playlist 捲軸的回歸。

## 0.1.30 歷史安裝說明

0.1.30 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.30.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.30-arm64.dmg`。該版 hotfix 修正右側歌曲列表外緣捲軸與卡片高度。

歌曲資訊面板提供「儲存到播放器」與「套用到原始檔」。「儲存到播放器」只保存播放器本機 metadata，不修改原始音樂檔；「套用到原始檔」會修改使用者選取的原始 MP3/FLAC/M4A，操作前請確認內容正確，必要時先保留音樂檔備份。

## 0.1.29 歷史安裝說明

0.1.29 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.29.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.29-arm64.dmg`。該版 hotfix 修正右側播放清單卡片捲軸與高度邊界，讓播放清單卡片底部與左側睡前定時卡片底部切齊。

## 0.1.28 歷史安裝說明

0.1.28 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.28.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.28-arm64.dmg`。該版 hotfix 修正 metadata 保存迴圈、全庫重寫問題、播放順序未跟隨目前歌曲清單排序，以及大清單一次 render 全部列的問題。

## 0.1.27 歷史安裝說明

0.1.27 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.27.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.27-arm64.dmg`。該版 hotfix 修正第一次歌曲資訊 / 封面寫回成功後，第二次開面板可能因舊 draft / saving 狀態導致「套用到原始檔」無反應的問題。

## 0.1.27 歷史 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.27.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.27 修正第一次歌曲資訊 / 封面寫回成功後，第二次開面板可能因舊 draft / saving 狀態導致「套用到原始檔」無反應的問題。仍建議首次在 Windows 真機驗證播放中改封面、第二次寫回、第一次重開即保留新封面、播放/暫停、資料夾恢復、歌曲資訊與封面寫回。

## 0.1.27 歷史 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.27-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

0.1.27 解除安裝方式與下方歷史說明相同；解除安裝 App 不會刪除使用者原始音樂檔。

0.1.27 已完成 DMG verify 與唯讀掛載讀回版本 / arm64 / app.asar / AI runtime 檢查；本輪尚未執行 packaged GUI 滑鼠流程。下一輪驗收仍須使用暫存音樂複本與隔離 profile，不可打開或修改使用者原始 Music 資料夾。

歌曲資訊保存只保留「套用到原始檔」。寫回會修改使用者選取的原始 MP3/FLAC/M4A；操作前請確認內容正確，必要時先保留音樂檔備份。

## 0.1.26 歷史安裝說明

0.1.26 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.26.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.26-arm64.dmg`。該版 hotfix 修正原始檔寫回後播放器資料庫可能仍保留舊 cover / metadata 的殘留問題。

## 0.1.25 歷史安裝說明

0.1.25 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.25.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.25-arm64.dmg`。該版 hotfix 修正 0.1.24 同族殘留的 audio source 誤重載，避免 duration 或 metadata 更新讓同一首歌誤觸 `audio.load()`。

## 0.1.24 Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.24.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

0.1.24 已修正播放中更換封面後切歌再切回會短暫卡住，以及 cover02 -> cover01 重開後可能先舊後新的問題；仍建議首次在 Windows 真機驗證播放中改封面、播放/暫停、資料夾恢復、歌曲資訊與封面寫回。

## 0.1.24 macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.24-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

0.1.24 解除安裝方式與下方歷史說明相同；解除安裝 App 不會刪除使用者原始音樂檔。

歌曲資訊保存只保留「套用到原始檔」。寫回會修改使用者選取的原始 MP3/FLAC/M4A；操作前請確認內容正確，必要時先保留音樂檔備份。

## 0.1.23 歷史安裝說明

0.1.23 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.23.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.23-arm64.dmg`。該版 hotfix 修正歌手欄位在「米津玄師」與「未知歌手」之間反覆切換造成的閃爍。

## 0.1.22 歷史安裝說明

0.1.22 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.22.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.22-arm64.dmg`。該版 hotfix 修正 `Cover 01.jpg` 因舊 3 MB 上限無法預覽與寫回的問題，並加入超過 5 MB 的明確提示。

## 0.1.21 歷史安裝說明

0.1.21 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.21.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.21-arm64.dmg`。該版 hotfix 修正歌曲顯示排序、封面更換後播放清單掉歌、啟動恢復逐首重讀 metadata 過慢與 AI 建歌單等待狀態。

## 0.1.20 歷史安裝說明

0.1.20 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.20.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.20-arm64.dmg`。該版 hotfix 修正播放卡頓、暫停停不下來、畫面閃爍與最後資料夾恢復。

## 0.1.19 歷史安裝說明

0.1.19 Windows installer 為 `Aquariusgirl Music Room Setup 0.1.19.exe`，macOS installer 為 `Aquariusgirl Music Room-0.1.19-arm64.dmg`。該版 hotfix 修正選擇大型音樂資料夾時把整個音檔傳進 IPC 的風險，並收斂歌曲資訊保存流程。

## 0.1.18 歷史安裝說明

## Windows 安裝

1. 執行 `Aquariusgirl Music Room Setup 0.1.18.exe`。
2. 選擇安裝位置。
3. 安裝完成後，從桌面捷徑或開始選單開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

SmartScreen 提醒通常是因為測試版尚未做 Windows code signing。確認檔案來源可信後，可選擇繼續執行。

## Windows 解除安裝

1. 到 Windows「設定 > 應用程式」。
2. 找到 `Aquariusgirl Music Room`。
3. 選擇解除安裝。

解除安裝 App 不會刪除使用者原始音樂檔。若要清除播放清單、主題、AI action log 或其他 App 設定，需另外清除 Electron app userData。

## macOS 安裝

1. 開啟 `Aquariusgirl Music Room-0.1.18-arm64.dmg`。
2. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
3. 從 Applications 開啟。
4. 第一次啟動後，選擇本機音樂檔或資料夾。

Gatekeeper 提醒通常是因為測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟。

## macOS 解除安裝

1. 關閉 App。
2. 從 Applications 移除 `Aquariusgirl Music Room.app`。

移除 App 不會刪除使用者原始音樂檔。若要清除 App 設定，可移除 macOS Application Support 中對應的 App 資料。

---

## Install and Uninstall

Version: 0.1.41
Document update: 2026-07-06

## 0.1.41 Install Status

0.1.41 fixes packaged repeated-cover writeback failures caused by TagLib partial metadata reads on large-cover FLAC files. Installers are produced and synced to `release-delivery/installers/`. SHA-256 values are in `docs/releases/0.1.41-checksums.md`.

## 0.1.41 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.41.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. On first launch, select local music files or a local music folder.

SmartScreen warnings are expected for unsigned test builds. If the file source is trusted, choose to continue.

0.1.41 passed Windows NSIS static checks, but real Windows runtime QA was not performed on this macOS machine. On first Windows install, verify song-info / cover readback, repeated cover writeback, reload metadata, restart persistence, playback/pause, folder restore, AI, and Mini/dialog focus.

## 0.1.41 macOS Install

1. Open `Aquariusgirl Music Room-0.1.41-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open it from Applications.
4. On first launch, select local music files or a local music folder.

macOS may show an unidentified-developer warning because this test build is not Developer ID signed or notarized. 0.1.41 passed DMG verify and packaged DMG isolated-profile mouse QA for three repeated cover changes. Use temporary music copies for validation, not the user's real Music folder.

## 0.1.40 Install Status

0.1.40 fixes the repeated-cover dirty-state path and adds reload-metadata diagnostics. Installers are produced and synced to `release-delivery/installers/`. SHA-256 values are in `docs/releases/0.1.40-checksums.md`.

## 0.1.40 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.40.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. On first launch, select local music files or a local music folder.

SmartScreen warnings are expected for unsigned test builds. If the file source is trusted, choose to continue.

0.1.40 passed Windows NSIS static checks, but real Windows runtime QA was not performed on this macOS machine. On first Windows install, verify the second cover replacement becomes dirty, the apply button is enabled, readback hash does not report false success, and the last successful cover remains after restart.

## 0.1.40 macOS Install

1. Open `Aquariusgirl Music Room-0.1.40-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open it from Applications.
4. On first launch, select local music files or a local music folder.

macOS may show an unidentified-developer warning because this test build is not Developer ID signed or notarized. 0.1.40 passed DMG verify and read-only DMG readback. Full packaged GUI mouse-only repeated-cover QA still needs temporary music copies and an isolated profile.

## 0.1.39 Install Status

0.1.39 fixes cover readback-hash persistence and playlist / all-songs custom-order persistence. Installers are produced and synced to `release-delivery/installers/`. SHA-256 values are in `docs/releases/0.1.39-checksums.md`.

## 0.1.39 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.39.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. On first launch, select local music files or a local music folder.

SmartScreen warnings are expected for unsigned test builds. If the file source is trusted, choose to continue.

0.1.39 passed Windows NSIS static checks, but real Windows runtime QA was not performed on this macOS machine. On first Windows install, verify repeated cover replacement does not report false success and custom playlist / all-songs order persists after restart.

## 0.1.39 macOS Install

1. Open `Aquariusgirl Music Room-0.1.39-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open it from Applications.
4. On first launch, select local music files or a local music folder.

macOS may show an unidentified-developer warning because this test build is not Developer ID signed or notarized. 0.1.39 passed DMG verify and read-only DMG readback. Full packaged GUI mouse-only repeated-cover QA still needs temporary music copies and an isolated profile.

## 0.1.38 Install Status

0.1.38 keeps the playlist sort control visible with all seven options and accepts common JPEG / PNG MIME aliases. Installers are produced and synced to `release-delivery/installers/`. SHA-256 values are in `docs/releases/0.1.38-checksums.md`.

## 0.1.38 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.38.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a local music folder.

SmartScreen warnings are expected for unsigned test builds.

0.1.38 passed Windows NSIS static checks, but real Windows runtime QA was not performed on this macOS machine. On first Windows install, verify the playlist sort dropdown still has seven options, then replace a cover and apply it to the original file.

## 0.1.38 macOS Install

1. Open `Aquariusgirl Music Room-0.1.38-arm64.dmg`.
2. Drag the app into Applications.
3. Open the app from Applications.
4. Select local music files or a local music folder.

macOS may warn about an unidentified developer because this test build is not Developer ID signed or notarized. DMG verify and read-only DMG version / app.asar / packaged alias checks passed. Full mouse-only cover selection needs explicit user approval for the macOS privacy prompt.

## 0.1.36 Install Status (Historical)

0.1.36 restores TagLib property-map metadata readback and removes the player-local "save to player" button. Installers are produced and synced to `release-delivery/installers/`. SHA-256 values are in `docs/releases/0.1.36-checksums.md`.

## 0.1.36 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.36.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a local music folder.

SmartScreen warnings are expected for unsigned test builds.

0.1.36 passed Windows NSIS static checks, but real Windows metadata runtime QA was not performed on this macOS machine. On first Windows install, verify song metadata / artwork fields no longer miss artist, album artist, track, or disc values. The song-info panel should no longer show "save to player"; it should keep only the original-file apply path.

## 0.1.36 macOS Install

1. Open `Aquariusgirl Music Room-0.1.36-arm64.dmg`.
2. Drag the app into Applications.
3. Open the app from Applications.
4. Select local music files or a local music folder.

macOS may warn about an unidentified developer because this test build is not Developer ID signed or notarized. DMG verify and read-only DMG version / app.asar / unpacked `taglib-web.wasm` checks passed.

## 0.1.35 Install Status

0.1.35 fixes the packaged Windows metadata-read wasm path. Installers are produced and synced to `release-delivery/installers/`. SHA-256 values are in `docs/releases/0.1.35-checksums.md`.

## 0.1.35 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.35.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a local music folder.

SmartScreen warnings are expected for unsigned test builds.

0.1.35 passed Windows NSIS static checks, but real Windows metadata runtime QA was not performed on this macOS machine. On first Windows install, verify song metadata / artwork no longer falls back to filenames / unknown artist.

## 0.1.35 macOS Install

1. Open `Aquariusgirl Music Room-0.1.35-arm64.dmg`.
2. Drag the app into Applications.
3. Open the app from Applications.
4. Select local music files or a local music folder.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured. DMG verify and read-only DMG version / app.asar / unpacked `taglib-web.wasm` readback passed.

## 0.1.34 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.34.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

0.1.34 restores the playlist-internal scrollbar while keeping the main-window scrollbar. Real Windows QA should still verify main-window scrolling, playlist-internal scrolling, no horizontal scrollbar, no mini-player overlap, large-list scroll smoothness, playback/pause, latest-folder restore, song-info writeback, and cover writeback.

## 0.1.34 macOS Install

1. Open `Aquariusgirl Music Room-0.1.34-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

0.1.34 passed DMG verify and read-only DMG version / app.asar / packaged renderer scroll class / packaged CSS overflow checks. Uninstalling the app does not delete original music files.

## 0.1.33 Historical Install Notes

0.1.33 used `Aquariusgirl Music Room Setup 0.1.33.exe` and `Aquariusgirl Music Room-0.1.33-arm64.dmg`. It restored the main-window scrollbar, and 0.1.34 restores the playlist-internal height bound.

## 0.1.32 Historical Install Notes

0.1.32 used `Aquariusgirl Music Room Setup 0.1.32.exe` and `Aquariusgirl Music Room-0.1.32-arm64.dmg`. It fixed the 0.1.31 regression that placed playlist scrolling on the left main column, and 0.1.33 restores the main-window scrollbar.

## 0.1.31 Historical Install Notes

0.1.31 used `Aquariusgirl Music Room Setup 0.1.31.exe` and `Aquariusgirl Music Room-0.1.31-arm64.dmg`. It fixed app body / right playlist overflow bounds, but 0.1.32 restores the rule that the left main column should not own playlist scrolling.

## 0.1.30 Historical Install Notes

0.1.30 used `Aquariusgirl Music Room Setup 0.1.30.exe` and `Aquariusgirl Music Room-0.1.30-arm64.dmg`. It fixed the right song-list edge scrollbar, card height, and bottom safe space for the mini player.

The song-info panel has both player-local save and original-file writeback. Player-local save only updates local player metadata; original-file writeback modifies the selected MP3/FLAC/M4A, so keep a backup when needed.

## 0.1.29 Historical Install Notes

0.1.29 used `Aquariusgirl Music Room Setup 0.1.29.exe` and `Aquariusgirl Music Room-0.1.29-arm64.dmg`. It fixed the right playlist card scroll bounds and aligned the playlist card bottom with the Sleep Timer card.

## 0.1.28 Historical Install Notes

0.1.28 used `Aquariusgirl Music Room Setup 0.1.28.exe` and `Aquariusgirl Music Room-0.1.28-arm64.dmg`. It fixed the metadata save loop, playback order, and TrackList visible-window rendering.

## 0.1.27 Historical Install Notes

0.1.27 used `Aquariusgirl Music Room Setup 0.1.27.exe` and `Aquariusgirl Music Room-0.1.27-arm64.dmg`. It fixed the second song-info / cover writeback path after an earlier successful writeback.

## 0.1.27 Historical Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.27.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

0.1.27 fixes the second song-info / cover writeback path after an earlier successful writeback. Real Windows QA should still verify second writeback, first-restart cover persistence, playback/pause, latest-folder restore, song-info writeback, and cover writeback.

## 0.1.27 Historical macOS Install

1. Open `Aquariusgirl Music Room-0.1.27-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

0.1.27 uses the same uninstall steps as the historical notes below. Uninstalling the app does not delete original music files.

0.1.27 passed DMG verify and read-only DMG version / arm64 / app.asar / AI runtime checks. Packaged GUI mouse QA still needs a temp music copy and isolated profile; do not open or modify the user's original Music folder.

Song info saving now only writes back to the original file. Writeback modifies the selected original MP3/FLAC/M4A, so verify the edit first and keep a backup when needed.

## 0.1.26 Historical Install Notes

0.1.26 used `Aquariusgirl Music Room Setup 0.1.26.exe` and `Aquariusgirl Music Room-0.1.26-arm64.dmg`. It fixed the remaining original-file writeback persistence race.

## 0.1.25 Historical Install Notes

0.1.25 used `Aquariusgirl Music Room Setup 0.1.25.exe` and `Aquariusgirl Music Room-0.1.25-arm64.dmg`. It fixed the remaining same-source audio reload after cover/song-info writeback.

## 0.1.24 Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.24.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

0.1.24 fixes playback stalling after cover writeback and the first-restart-old-cover / second-restart-new-cover persistence race. Real Windows QA should still verify playback while editing cover art, playback/pause, latest-folder restore, song-info writeback, and cover writeback.

## 0.1.24 macOS Install

1. Open `Aquariusgirl Music Room-0.1.24-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

0.1.24 uses the same uninstall steps as the historical notes below. Uninstalling the app does not delete original music files.

Song info saving now only writes back to the original file. Writeback modifies the selected original MP3/FLAC/M4A, so verify the edit first and keep a backup when needed.

## 0.1.23 Historical Install Notes

0.1.23 used `Aquariusgirl Music Room Setup 0.1.23.exe` and `Aquariusgirl Music Room-0.1.23-arm64.dmg`. It fixed artist field flicker between real artist text and `未知歌手`.

## 0.1.22 Historical Install Notes

0.1.22 used `Aquariusgirl Music Room Setup 0.1.22.exe` and `Aquariusgirl Music Room-0.1.22-arm64.dmg`. It fixed the old 3 MB cover limit that blocked `Cover 01.jpg` before preview/writeback and added a clear >5 MB message.

## 0.1.21 Historical Install Notes

0.1.21 used `Aquariusgirl Music Room Setup 0.1.21.exe` and `Aquariusgirl Music Room-0.1.21-arm64.dmg`. It fixed filename-first display, playlist persistence after cover writeback, startup restore cost, and AI playlist busy feedback.

## 0.1.20 Historical Install Notes

0.1.20 used `Aquariusgirl Music Room Setup 0.1.20.exe` and `Aquariusgirl Music Room-0.1.20-arm64.dmg`. It fixed playback stutter, unreliable pause, flashing playback state, and latest-folder restore.

## 0.1.19 Historical Install Notes

0.1.19 used `Aquariusgirl Music Room Setup 0.1.19.exe` and `Aquariusgirl Music Room-0.1.19-arm64.dmg`. It fixed large-folder whole-audio IPC risk and consolidated song-info saving.

## 0.1.18 Historical Install Notes

## Windows Install

1. Run `Aquariusgirl Music Room Setup 0.1.18.exe`.
2. Choose an install location.
3. Open the app from the desktop shortcut or Start menu.
4. Select local music files or a music folder on first launch.

SmartScreen warnings are expected for unsigned test builds.

## Windows Uninstall

1. Open Windows Settings > Apps.
2. Find `Aquariusgirl Music Room`.
3. Choose Uninstall.

Uninstalling the app does not delete original music files. To remove playlists, theme settings, AI action logs, or other app settings, clear the Electron app userData separately.

## macOS Install

1. Open `Aquariusgirl Music Room-0.1.18-arm64.dmg`.
2. Drag `Aquariusgirl Music Room.app` into Applications.
3. Open the app from Applications.
4. Select local music files or a music folder on first launch.

Gatekeeper warnings are expected until Developer ID signing and notarization are configured.

## macOS Uninstall

1. Quit the app.
2. Remove `Aquariusgirl Music Room.app` from Applications.

Removing the app does not delete original music files. To remove app settings, clear the matching Application Support data.
