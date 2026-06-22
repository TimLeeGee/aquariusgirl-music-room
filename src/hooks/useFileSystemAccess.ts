import { useCallback, useState } from "react";
import { filesFromElectronSelection, pickDirectoryWithFileSystemAccess } from "../utils/fileSystemAccess";
import { isElectronRuntime, supportsFileSystemAccess } from "../utils/platform";
import { saveDirectoryHandle } from "../storage/indexedDb";

type UseFileSystemAccessOptions = {
  onFiles: (files: File[]) => void;
  onInfo?: (message: string) => void;
  onError?: (message: string) => void;
};

export function useFileSystemAccess({ onFiles, onInfo, onError }: UseFileSystemAccessOptions) {
  const [authorizationStatus, setAuthorizationStatus] = useState<
    "temporary" | "persistent" | "electron"
  >("temporary");

  const selectMusicFolder = useCallback(async () => {
    try {
      if (isElectronRuntime() && window.aquariusgirlAPI) {
        const selected = await window.aquariusgirlAPI.selectMusicFolder();
        const files = filesFromElectronSelection(selected);
        onFiles(files);
        setAuthorizationStatus("electron");
        onInfo?.(`已從桌面版資料夾加入 ${files.length} 首音樂。`);
        return true;
      }

      if (supportsFileSystemAccess()) {
        const result = await pickDirectoryWithFileSystemAccess();
        if (!result) return false;
        await saveDirectoryHandle(result.handle).catch(() => undefined);
        onFiles(result.files);
        setAuthorizationStatus("persistent");
        onInfo?.(`已授權資料夾並加入 ${result.files.length} 首音樂。`);
        return true;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return true;
      }
      onError?.("讀取資料夾失敗，請改用一般資料夾選擇。");
      return false;
    }

    setAuthorizationStatus("temporary");
    return false;
  }, [onError, onFiles, onInfo]);

  const selectMusicFiles = useCallback(async () => {
    if (!isElectronRuntime() || !window.aquariusgirlAPI) {
      return false;
    }

    const selected = await window.aquariusgirlAPI.selectMusicFiles();
    const files = filesFromElectronSelection(selected);
    onFiles(files);
    onInfo?.(`已從桌面版選擇 ${files.length} 首音樂。`);
    return true;
  }, [onFiles, onInfo]);

  const restoreMusicPaths = useCallback(
    async (sourcePaths: string[], onRestoredFiles = onFiles) => {
      if (!isElectronRuntime() || !window.aquariusgirlAPI?.restoreMusicPaths) {
        return { restored: 0, missing: sourcePaths.length };
      }

      const restored = await window.aquariusgirlAPI.restoreMusicPaths(sourcePaths);
      const files = filesFromElectronSelection(restored.files);

      if (files.length > 0) {
        onRestoredFiles(files);
        setAuthorizationStatus("electron");
      }

      return {
        restored: files.length,
        missing: restored.missingPaths.length,
      };
    },
    [onFiles],
  );

  return {
    authorizationStatus,
    selectMusicFolder,
    selectMusicFiles,
    restoreMusicPaths,
  };
}
