type MessageToastProps = {
  message?: string;
  type?: "info" | "error";
};

export function MessageToast({ message, type = "info" }: MessageToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[60] max-w-sm rounded-lg border border-white/[0.15] bg-aquarius-navy/[0.88] px-4 py-3 text-sm leading-6 text-white shadow-glass backdrop-blur-2xl">
      <span
        className={[
          "mb-1 block text-xs font-bold uppercase tracking-[0.18em]",
          type === "error" ? "text-red-200" : "text-aquarius-blue",
        ].join(" ")}
      >
        {type === "error" ? "提醒" : "水瓶罐子"}
      </span>
      {message}
    </div>
  );
}
