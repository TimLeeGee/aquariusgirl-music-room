import { type DragEvent, useCallback, useRef, useState } from "react";

type UseDragAndDropOptions = {
  onDropFiles: (files: FileList | File[]) => void;
  onInfo?: (message: string) => void;
  disabled?: boolean;
};

function hasFiles(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export function useDragAndDrop({ onDropFiles, onInfo, disabled = false }: UseDragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    if (!hasFiles(event)) {
      return;
    }

    event.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  }, [disabled]);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!hasFiles(event)) {
      return;
    }

    event.preventDefault();
    if (disabled) {
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.dataTransfer.dropEffect = "copy";
  }, [disabled]);

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    if (!hasFiles(event)) {
      return;
    }

    event.preventDefault();
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) {
      setIsDragging(false);
    }
  }, [disabled]);

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!hasFiles(event)) {
        return;
      }

      event.preventDefault();
      if (disabled) {
        event.dataTransfer.dropEffect = "none";
        return;
      }
      dragDepth.current = 0;
      setIsDragging(false);

      const files = Array.from(event.dataTransfer.files);

      if (files.length === 0) {
        onInfo?.("這個瀏覽器沒有提供可讀取的拖曳檔案，請改用選擇檔案或資料夾。");
        return;
      }

      onDropFiles(files);
    },
    [disabled, onDropFiles, onInfo],
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    },
  };
}
