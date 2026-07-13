import { type ReactNode, useRef } from "react";
import { FileAudio2 } from "lucide-react";
import { AUDIO_ACCEPT } from "../utils/audioFiles";

type FilePickerButtonProps = {
  onFilesSelected: (files: FileList) => void;
  onNativePick?: () => Promise<boolean>;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function FilePickerButton({
  onFilesSelected,
  onNativePick,
  children = "選擇音樂檔",
  className = "",
  disabled = false,
}: FilePickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className={[
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-aquarius-blue/[0.35]",
          "bg-aquarius-blue/[0.14] px-4 py-2 text-sm font-semibold text-white shadow-glow transition",
          "hover:border-aquarius-blue/80 hover:bg-aquarius-blue/[0.22] active:scale-[0.98]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aquarius-blue",
          className,
        ].join(" ")}
        disabled={disabled}
        onClick={async () => {
          if (disabled) return;
          if (onNativePick && (await onNativePick())) {
            return;
          }
          inputRef.current?.click();
        }}
      >
        <FileAudio2 className="h-4 w-4" />
        <span>{children}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.currentTarget.files?.length) {
            onFilesSelected(event.currentTarget.files);
          }
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}
