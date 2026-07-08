import { useText } from "../config/textOverrides";

type DropZoneProps = {
  active: boolean;
};

export function DropZone({ active }: DropZoneProps) {
  const dropZoneTitle = useText("dropZoneTitle");
  const dropZoneHint = useText("dropZoneHint");
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
          {dropZoneTitle}
        </p>
        <p className="mt-3 text-sm leading-6 text-aquarius-mist">
          {dropZoneHint}
        </p>
      </div>
    </div>
  );
}
