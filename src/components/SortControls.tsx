import type { SortMode } from "../types/track";

type SortControlsProps = {
  value: SortMode;
  onChange: (value: SortMode) => void;
};

const options: Array<{ value: SortMode; label: string }> = [
  { value: "addedAt", label: "自訂/加入時間" },
  { value: "title", label: "歌名 A-Z" },
  { value: "artist", label: "歌手 A-Z" },
  { value: "album", label: "專輯 A-Z" },
  { value: "filename", label: "檔名" },
  { value: "durationAsc", label: "時長短到長" },
  { value: "durationDesc", label: "時長長到短" },
];

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/10 px-3 py-2 text-sm text-aquarius-mist">
      <span className="whitespace-nowrap">排序</span>
      <select
        value={value}
        aria-label="播放清單排序方式"
        className="min-w-[9.5rem] bg-transparent text-sm font-semibold text-white outline-none"
        onChange={(event) => onChange(event.currentTarget.value as SortMode)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-aquarius-navy">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
