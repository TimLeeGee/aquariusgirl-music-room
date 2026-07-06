export const SUPPORTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".flac",
] as const;

export const AUDIO_ACCEPT = "audio/*";

export function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function isSupportedAudioFile(file: File) {
  const extension = getFileExtension(file.name);
  return SUPPORTED_AUDIO_EXTENSIONS.includes(
    extension as (typeof SUPPORTED_AUDIO_EXTENSIONS)[number],
  );
}

export function isSupportedAudioPath(filePath: string) {
  const extension = getFileExtension(filePath);
  return SUPPORTED_AUDIO_EXTENSIONS.includes(
    extension as (typeof SUPPORTED_AUDIO_EXTENSIONS)[number],
  );
}

export function partitionAudioFiles(files: FileList | File[]) {
  const allFiles = Array.from(files);
  const audioFiles = allFiles.filter(isSupportedAudioFile);
  const rejectedFiles = allFiles.filter((file) => !isSupportedAudioFile(file));

  return {
    audioFiles,
    rejectedFiles,
  };
}

export function filterAudioFiles(files: FileList | File[]) {
  return partitionAudioFiles(files).audioFiles;
}

function hashString(input: string) {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

function getFileIdentity(file: File) {
  const metadata = file as File & {
    sourcePath?: string;
    sourceSize?: number;
    webkitRelativePath?: string;
  };

  if (metadata.sourcePath) {
    return `source:${metadata.sourcePath}`;
  }

  return [
    metadata.webkitRelativePath || file.name,
    metadata.sourceSize ?? file.size,
    file.lastModified,
  ].join("::");
}

export function createSafeTrackId(file: File) {
  const safeName = file.name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return `${safeName || "track"}-${hashString(getFileIdentity(file))}`;
}

export function createFileSignature(file: File) {
  const metadata = file as File & {
    sourcePath?: string;
    sourceSize?: number;
    webkitRelativePath?: string;
  };
  if (metadata.sourcePath) return `source:${metadata.sourcePath}`;
  return `${metadata.webkitRelativePath ?? file.name}::${metadata.sourceSize ?? file.size}::${file.lastModified}`;
}
