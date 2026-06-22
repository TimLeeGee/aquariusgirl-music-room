import { isSupportedAudioFile } from "./audioFiles";

async function collectFilesFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  prefix = "",
): Promise<File[]> {
  const files: File[] = [];

  for await (const [name, handle] of directoryHandle.entries()) {
    if (handle.kind === "file") {
      const file = await handle.getFile();
      if (isSupportedAudioFile(file)) {
        Object.defineProperty(file, "webkitRelativePath", {
          value: `${prefix}${name}`,
          configurable: true,
        });
        files.push(file);
      }
    } else if (handle.kind === "directory") {
      files.push(...(await collectFilesFromDirectory(handle, `${prefix}${name}/`)));
    }
  }

  return files;
}

export async function pickDirectoryWithFileSystemAccess() {
  if (!window.showDirectoryPicker) {
    return null;
  }

  const handle = await window.showDirectoryPicker();
  const files = await collectFilesFromDirectory(handle);
  return { handle, files };
}

export function filesFromElectronSelection(selection: Array<{
  name: string;
  type: string;
  buffer: ArrayBuffer;
  sourcePath?: string;
  lastModified?: number;
  relativePath?: string;
}>) {
  return selection.map((item) => {
    const options: FilePropertyBag = { type: item.type };

    if (typeof item.lastModified === "number") {
      options.lastModified = item.lastModified;
    }

    const file = new File([item.buffer], item.name, options);
    if (item.sourcePath) {
      Object.defineProperty(file, "sourcePath", {
        value: item.sourcePath,
        configurable: true,
      });
    }
    if (item.relativePath) {
      Object.defineProperty(file, "webkitRelativePath", {
        value: item.relativePath,
        configurable: true,
      });
    }
    return file;
  });
}
