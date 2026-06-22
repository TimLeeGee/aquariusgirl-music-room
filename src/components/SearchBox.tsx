import { Search } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aquarius-mist" />
      <input
        type="search"
        value={value}
        placeholder="搜尋歌曲、歌手或檔名"
        className="h-11 w-full rounded-full border border-white/[0.12] bg-white/10 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-aquarius-mist/70 focus:border-aquarius-blue/60 focus:bg-white/[0.14]"
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}
