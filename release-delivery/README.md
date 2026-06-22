# Aquariusgirl Music Room 交付說明

版本：0.1.2  
日期：2026-06-19  
產品名稱：Aquariusgirl Music Room / 水瓶罐子的音樂小水池

## 最新安裝檔在哪裡

只看這個資料夾：

```text
release-delivery/installers/
```

這裡會保留最新版 DMG / EXE。`release/` 是打包暫存輸出，整理腳本會自動清掉，避免同時出現兩個像交付資料夾的位置。

## 這是什麼軟體

Aquariusgirl Music Room 是一款本地音樂播放器。它只播放你電腦中已經存在的音樂檔，不串接 YouTube、不串流、不上傳音樂，也不會自動掃描整台硬碟。

支援格式：mp3、wav、ogg、m4a、flac。

## Windows 如何安裝

1. 取得 `Aquariusgirl Music Room Setup 0.1.2.exe`。
2. 雙擊安裝檔。
3. 依照安裝器指示完成安裝。
4. 從桌面捷徑或開始選單開啟 `Aquariusgirl Music Room`。

如果 Windows Defender 或 SmartScreen 顯示提醒，原因通常是測試版尚未做程式碼簽章。確認來源是你自己的建置檔後，可選擇繼續執行。

## macOS 如何安裝

1. 取得對應架構的 `.dmg`。
2. 雙擊 `.dmg`。
3. 將 `Aquariusgirl Music Room.app` 拖曳到 Applications。
4. 從 Applications 開啟。

如果 macOS 顯示「未認證開發者」，原因是目前測試版尚未做 Apple Developer ID 簽章與 notarization。可在「系統設定 > 隱私權與安全性」允許開啟，或使用右鍵開啟。

## 第一次開啟如何加入音樂

1. 點選「選擇音樂檔」加入多首音樂。
2. 或點選「選擇資料夾」加入整個資料夾中的音樂。
3. 也可以把音樂檔拖曳到播放器。

桌面版會透過系統檔案選擇器讀取音樂。Web preview 版本因瀏覽器安全限制，重新整理後需要重新選擇檔案或資料夾。

## 如何新增播放清單

1. 在右側「歌單」區點「新增播放清單」。
2. 輸入名稱。
3. 按 Enter 或點建立。
4. 空白名稱與重複名稱會顯示錯誤，不會建立。

## 如何更換介面圖片

1. 點右上角齒輪按鈕。
2. 在九張圖片中選擇「新增」或「更換」。
3. 支援 PNG、JPG、WebP、GIF，單張上限 10 MB。
4. 「回復預設」只移除 App 保存的副本，不會刪除原始圖片。

內建圖片位於 `public/assets`；自訂圖片保存於 Electron app userData，不會覆寫安裝檔內的內建素材。

## 如何調整介面色彩

1. 開啟右上角外觀設定。
2. 切換到「色彩」。
3. 分別調整主色、輔色、金色點綴、文字與背景色相。
4. 設定會自動保存；需要回到初始外觀時，點「全部復原」。

## 如何把歌曲加入播放清單

1. 先建立至少一個一般播放清單。
2. 在歌曲列表每首歌右側使用「加入歌單」選單。
3. 選擇目標歌單。
4. 已加入的歌單會顯示為「已在 ...」，避免重複加入。

也可以切到一般播放清單後，用「加入目前歌曲」把正在播放或剛選取的歌曲加入。

## 如何使用 MINI 模式

1. 點選上方「切換 mini 模式」。
2. MINI 模式控制列預設隱藏，滑鼠移入播放器小卡時浮現。
3. MINI 模式可播放、暫停、上一首、下一首。
4. 點「回到完整播放器」返回主播放器。

完整播放器視窗會保留系統原生視窗按鈕：macOS 是紅黃綠，Windows 是原生最小化、最大化、關閉。

## 如何使用 MINI 置頂

1. 進入 MINI 模式。
2. 點釘選按鈕啟用置頂。
3. 切到其他應用程式確認 MINI 視窗仍在最上層。
4. 再點一次取消置頂。

## 如何調整 MINI 透明度

1. 進入 MINI 模式。
2. 點透明度按鈕。
3. 使用 slider 調整透明度，或點「重設 92%」。

透明度只應套用在 MINI 視窗本體，不應讓主播放器或其他 App 受影響。

## 播放清單資料保存在哪裡

播放清單、收藏、音量、循環、隨機等設定會保存於 App 的 localStorage / IndexedDB。音樂檔本體不會被複製進 App，也不會被上傳。

解除安裝 App 不應刪除你的原始音樂檔。

## 常見問題

### 為什麼重新開 App 後還要重新選音樂？

播放器不會永久保存 File 物件或複製你的音樂本體。這是為了符合瀏覽器與桌面 WebView 的安全模型。

### 為什麼沒有簽章？

目前是測試版建置，尚未接 Apple Developer ID、notarization、Windows code signing certificate。正式發行前需要補簽章流程。

### 如何下載 GitHub Actions artifacts？

推送 tag，例如 `v0.1.2` 後，GitHub Actions 會在 Release workflow 中產出 Windows 與 macOS artifacts。到該 workflow run 的 Artifacts 區下載。
