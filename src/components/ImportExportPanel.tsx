import { Download, Upload } from "lucide-react";
import { useRef } from "react";

type ImportExportPanelProps = {
  onExport: () => void;
  onImport: (file: File) => void;
};

export function ImportExportPanel({ onExport, onImport }: ImportExportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="glass-panel p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
        Backup
      </p>
      <h2 className="mt-1 text-lg font-black text-white">匯入 / 匯出</h2>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-bold text-white"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          匯出
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-bold text-white"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          匯入
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onImport(file);
          event.currentTarget.value = "";
        }}
      />
    </section>
  );
}
