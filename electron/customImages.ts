export const customImageSlots = [
  "logo",
  "avatar",
  "banner",
  "background",
  "characterIdle",
  "characterPlaying",
  "coverPlaceholder",
  "decorationStar",
  "decorationBubble",
] as const;

export type CustomImageSlot = (typeof customImageSlots)[number];
export const maxCustomImageBytes = 10 * 1024 * 1024;

export function isCustomImageSlot(value: unknown): value is CustomImageSlot {
  return typeof value === "string" && customImageSlots.includes(value as CustomImageSlot);
}

export function detectImageMime(bytes: Uint8Array) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }

  const signature = bytes.length >= 6 ? String.fromCharCode(...bytes.slice(0, 6)) : "";
  return signature === "GIF87a" || signature === "GIF89a" ? "image/gif" : null;
}

function customImagePath(root: string, slot: CustomImageSlot) {
  return path.join(root, `${slot}.image`);
}

function toDataUrl(bytes: Uint8Array, mime: string) {
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
}

export async function loadCustomImages(root: string) {
  const entries = await Promise.all(
    customImageSlots.map(async (slot) => {
      try {
        const bytes = await readFile(customImagePath(root, slot));
        const mime = detectImageMime(bytes);
        return [slot, mime ? toDataUrl(bytes, mime) : undefined] as const;
      } catch {
        return [slot, undefined] as const;
      }
    }),
  );
  return Object.fromEntries(entries.filter((entry) => Boolean(entry[1])));
}

export async function saveCustomImage(root: string, slot: CustomImageSlot, bytes: Uint8Array) {
  if (bytes.byteLength > maxCustomImageBytes) throw new Error("image-too-large");
  const mime = detectImageMime(bytes);
  if (!mime) throw new Error("unsupported-image");
  await mkdir(root, { recursive: true });
  // ponytail: One file per visible slot is enough; add image history only if users request a gallery.
  await writeFile(customImagePath(root, slot), bytes);
  return toDataUrl(bytes, mime);
}

export async function removeCustomImage(root: string, slot: CustomImageSlot) {
  await rm(customImagePath(root, slot), { force: true });
}
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
