#!/bin/bash
# 一鍵推送 main 到 GitHub，並讀回驗證。結果同步寫入 push-result.log（已被 .gitignore 排除）。
cd "$(dirname "$0")" || exit 1
LOG="push-result.log"
{
  echo "=== Push $(date '+%Y-%m-%d %H:%M:%S') ==="
  # 清掉沙盒殘留的 stale lock（0 byte 才清，避免誤刪進行中的鎖）
  if [ -f .git/index.lock ] && [ ! -s .git/index.lock ]; then
    rm -f .git/index.lock && echo "已清除 stale .git/index.lock"
  fi
  echo "--- push ---"
  git push origin main 2>&1
  PUSH_RC=$?
  echo "--- fetch / readback ---"
  git fetch origin 2>&1
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  echo "local  HEAD : $LOCAL"
  echo "origin/main : $REMOTE"
  if [ $PUSH_RC -eq 0 ] && [ "$LOCAL" = "$REMOTE" ]; then
    echo "RESULT: SUCCESS - GitHub main 已與本機一致"
  else
    echo "RESULT: FAILED - 請看上方錯誤訊息"
  fi
} 2>&1 | tee "$LOG"
echo
echo "完成，此視窗可關閉。"
