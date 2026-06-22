import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

type PlaylistNameDialogProps = {
  open: boolean;
  title: string;
  eyebrow: string;
  defaultName: string;
  confirmLabel?: string;
  onClose: () => void;
  onSubmit: (name: string) => boolean | void;
  onError?: (message: string) => void;
};

export function PlaylistNameDialog({
  open,
  title,
  eyebrow,
  defaultName,
  confirmLabel = "建立",
  onClose,
  onSubmit,
  onError,
}: PlaylistNameDialogProps) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(defaultName);
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [defaultName, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeName = name.trim();

    if (!safeName) {
      onError?.("名稱不能空白。");
      return;
    }

    const shouldClose = onSubmit(safeName);
    if (shouldClose === false) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-aquarius-navy/[0.68] p-4 backdrop-blur-lg"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        className="glass-panel app-no-drag w-full max-w-md p-5"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
          </div>
          <IconButton
            icon={<X className="h-4 w-4" />}
            label="關閉"
            size="sm"
            onClick={onClose}
          />
        </div>

        <label className="block">
          <span className="text-sm font-bold text-aquarius-mist">名稱</span>
          <input
            ref={inputRef}
            value={name}
            className="mt-2 w-full rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-white outline-none transition focus:border-aquarius-blue/60"
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm font-bold text-aquarius-mist transition hover:text-white"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-lg border border-aquarius-blue/[0.55] bg-aquarius-blue/[0.18] px-4 py-2 text-sm font-black text-white shadow-glow transition hover:bg-aquarius-blue/[0.28]"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
