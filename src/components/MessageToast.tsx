import { applyName } from "../config/characterName";

type MessageToastProps = {
  message?: string;
  type?: "info" | "error";
};

export function MessageToast({ message, type = "info" }: MessageToastProps) {
  if (!message) {
    return null;
  }

  // ponytail: z-[90] keeps save success/failure toasts above the SongInfoPanel / dialog overlays (z-[80]).
  // 0.1.44: 左上 top-12 切齊桌面版標題列(h-9)下緣，不再蓋住右上角「選擇音樂檔」等按鈕；
  // pointer-events-none 讓提示顯示期間也永遠不擋任何點擊（toast 內沒有互動元素）。
  return (
    <div className="pointer-events-none fixed left-4 top-12 z-[90] max-w-sm rounded-lg border border-white/[0.15] bg-aquarius-navy/[0.88] px-4 py-3 text-sm leading-6 text-white shadow-glass backdrop-blur-2xl">
      <span
        className={[
          "mb-1 block text-xs font-bold uppercase tracking-[0.18em]",
          type === "error" ? "text-red-200" : "text-aquarius-blue",
        ].join(" ")}
      >
        {type === "error" ? "提醒" : applyName("{name}")}
      </span>
      {message}
    </div>
  );
}
