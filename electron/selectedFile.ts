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
    ? await readSongInfoFromOriginalFile(filePath)
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
