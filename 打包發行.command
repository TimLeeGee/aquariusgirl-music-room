#!/bin/zsh -l
# ponytail: Cowork 沙盒是 Linux 無法產 DMG；這個雙擊檔讓完整打包在 Mac 本機一鍵完成，log 寫進 qa-temp/ 供 agent 讀取。
cd "$(dirname "$0")"
mkdir -p qa-temp
LOG="qa-temp/dist-release.log"

echo "== Aquariusgirl Music Room dist:release start $(date) ==" | tee "$LOG"
npm run dist:release 2>&1 | tee -a "$LOG"
BUILD_EXIT=${pipestatus[1]}

VERSION=$(node -p "require('./package.json').version")
DMG="release-delivery/installers/Aquariusgirl Music Room-${VERSION}-arm64.dmg"
if [ -f "$DMG" ]; then
  hdiutil verify "$DMG" 2>&1 | tail -3 | tee -a "$LOG"
fi

echo "== build exit=${BUILD_EXIT} $(date) ==" | tee -a "$LOG"
