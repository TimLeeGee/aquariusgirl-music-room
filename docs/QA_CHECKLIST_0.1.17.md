# QA Checklist 0.1.17

日期：2026-06-28

| 項目 | 結果 | 證據 |
| --- | --- | --- |
| 開源 prompt 檢查 | PASS | `npm run check:prompts` |
| AI 搜尋與 router fallback | PASS | `npm run check:ai-track-search` |
| 播放清單移除安全語意 | PASS | `node scripts/playlist-logic-check.mjs` |
| Mini opacity 回歸 | PASS | `node scripts/mini-opacity-check.mjs` |
| FLAC metadata 回歸 | PASS | `npm run check:flac-metadata` |
| Custom images 回歸 | PASS | `npm run check:custom-images` |
| Theme colors 回歸 | PASS | `npm run check:theme-colors` |
| AI assets 目標 runtime | PASS | `AI_REQUIRED_RUNTIMES=darwin-arm64,win32-x64 npm run check:ai-assets` |
| Frontend build | PASS | `npm run build` |
| Electron compile | PASS | `npm run electron:compile` |
| Installer build | PASS | 升權 `npm run dist:release` |
| 交付位置 | PASS | `release-delivery/installers/` 只有 2 個 0.1.17 installer |
| DMG verify | PASS | `hdiutil verify` VALID |
| DMG version | PASS | `CFBundleShortVersionString` / `CFBundleVersion` 皆為 0.1.17 |
| DMG arch | PASS | Mach-O 64-bit executable arm64 |
| DMG prompt package | PASS | `Contents/Resources/prompts/*.txt`，無 prompt `.bin` |
| DMG runtime prune | PASS | 只保留 `ai/bin/darwin-arm64/llama-server` |
| EXE static check | PASS | PE32 GUI Windows NSIS installer |

## Installer

- `Aquariusgirl Music Room-0.1.17-arm64.dmg`
  - Size: 683,782,606 bytes
  - SHA-256: `c6fd6831e480c9ff2c40c1849357e7cb0e0f2134ded80722afe4a993f872b7b4`
- `Aquariusgirl Music Room Setup 0.1.17.exe`
  - Size: 667,081,163 bytes
  - SHA-256: `b20c7522f79de137b0534c23f66632cdb21cdeb2623714c37c9576a1b1c142de`

## Known Limits

- Windows 真機安裝與 AI 操作尚未驗收。
- macOS DMG 尚未 Apple Developer ID 簽章或 notarize。
- Windows EXE 尚未 code signing。
- 本輪未用使用者真實音樂庫做完整人工點擊驗收。
