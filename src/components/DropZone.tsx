type DropZoneProps = {
  active: boolean;
};

export function DropZone({ active }: DropZoneProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-aquarius-navy/[0.72] p-6 backdrop-blur-lg">
      <div className="w-full max-w-xl rounded-lg border border-aquarius-blue/60 bg-white/[0.14] px-6 py-10 text-center shadow-glow">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-aquarius-blue">
          Drop to Add
        </p>
        <p className="mt-3 text-3xl font-black text-white">
          放開小魚乾，加入水瓶罐子的歌單
        </p>
        <p className="mt-3 text-sm leading-6 text-aquarius-mist">
          非音樂檔會被自動略過，支援 mp3、wav、ogg、m4a、flac。
        </p>
      </div>
    </div>
  );
}
