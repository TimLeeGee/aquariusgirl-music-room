import { type InputHTMLAttributes, type ReactNode, useRef } from "react";
import { FolderOpen } from "lucide-react";
import { AUDIO_ACCEPT } from "../utils/audioFiles";

type DirectoryInputProps = InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

type FolderPickerButtonProps = {
  onFilesSelected: (files: FileList) => void;
  onNativePick?: () => Promise<boolean>;
  children?: ReactNode;
  className?: string;
};

const directoryProps: DirectoryInputProps = {
  webkitdirectory: "",
  directory: "",
};

export function FolderPickerButton({
  onFilesSelected,
  onNativePick,
  children = "選擇資料夾",
  className = "",
}: FolderPickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className={[
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/[0.15]",
          "bg-white/10 px-4 py-2 text-sm font-semibold text-white transition",
          "hover:border-aquarius-pink/[0.55] hover:bg-aquarius-pink/[0.15] active:scale-[0.98]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aquarius-pink",
          className,
        ].join(" ")}
        onClick={async () => {
          if (onNativePick && (await onNativePick())) {
            return;
          }
          inputRef.current?.click();
        }}
      >
        <FolderOpen className="h-4 w-4" />
        <span>{children}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_ACCEPT}
        multiple
        className="hidden"
        {...directoryProps}
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
