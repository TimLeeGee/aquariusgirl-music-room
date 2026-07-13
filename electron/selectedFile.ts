import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readSongInfoFromOriginalFile } from "./songInfoWriter.js";

export function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".ogg") return "audio/ogg";
  if (ext === ".m4a") return "audio/mp4";
  if (ext === ".flac") return "audio/flac";
  return "audio/*";
}

type ToSelectedFileOptions = {
  readMetadata?: boolean;
};

export async function toSelectedFile(
  filePath: string,
  basePath?: string,
  options: ToSelectedFileOptions = {},
) {
  const { readMetadata = true } = options;
  const fileStat = await stat(filePath);
  const metadata = readMetadata
    ? // ponytail: bulk folder scans keep the partial fast path (1MB header per file) so 10k-song
      // libraries stay fast; big-cover files fall back to one full read inside the reader.
      await readSongInfoFromOriginalFile(filePath, { partialRead: true })
      .then((result) => (result.ok ? result.metadata : undefined))
      .catch(() => undefined)
    : undefined;

  return {
    name: path.basename(filePath),
    type: getMimeType(filePath),
    localUrl: pathToFileURL(filePath).toString(),
    size: fileStat.size,
    sourcePath: filePath,
    lastModified: Math.round(fileStat.mtimeMs),
    relativePath: basePath ? path.relative(basePath, filePath) : undefined,
    metadata,
  };
}

export async function toSelectedFiles(
  filePaths: string[],
  basePath?: string,
  isCanceled: () => boolean = () => false,
) {
  const results: Array<Awaited<ReturnType<typeof toSelectedFile>> | undefined> = new Array(
    filePaths.length,
  );
  let nextIndex = 0;

  const readNext = async () => {
    while (nextIndex < filePaths.length) {
      if (isCanceled()) return;
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await toSelectedFile(filePaths[index], basePath);
      } catch {
        // A single unreadable file must not discard completed neighbouring selections.
      }
    }
  };

  // ponytail: Four metadata readers balance desktop responsiveness with large-folder throughput.
  await Promise.all(Array.from({ length: Math.min(4, filePaths.length) }, () => readNext()));
  return results.filter((result): result is NonNullable<typeof result> => Boolean(result));
}
