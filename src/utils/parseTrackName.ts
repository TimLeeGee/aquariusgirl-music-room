export function removeAudioExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").trim();
}

export function parseTrackName(fileName: string) {
  const name = removeAudioExtension(fileName);
  const parts = name.split(/\s+-\s+/);

  if (parts.length >= 2) {
    const [artist, ...titleParts] = parts;
    const title = titleParts.join(" - ").trim();

    if (artist.trim() && title) {
      return {
        name,
        artist: artist.trim(),
        title,
      };
    }
  }

  return {
    name,
    title: name || fileName,
  };
}
