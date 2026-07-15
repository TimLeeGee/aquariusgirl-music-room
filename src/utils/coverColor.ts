import type { Track } from "../types/track";
import type { ThemeColorSettings } from "../types/settings";

const MAX_CACHE_ENTRIES = 64;
const HUE_BUCKET_COUNT = 30;

type CoverTrack = Pick<Track, "id" | "artworkUrl" | "coverUrl" | "coverDataUrl" | "coverHash">;

export class CoverHueLruCache {
  private readonly entries = new Map<string, number>();

  get size() {
    return this.entries.size;
  }

  get(key: string) {
    const value = this.entries.get(key);
    if (value === undefined) return undefined;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: string, hue: number) {
    this.entries.delete(key);
    this.entries.set(key, hue);
    if (this.entries.size > MAX_CACHE_ENTRIES) {
      this.entries.delete(this.entries.keys().next().value as string);
    }
  }
}

export class CoverHueRequestGuard {
  private version = 0;

  next() {
    this.version += 1;
    return this.version;
  }

  isCurrent(version: number) {
    return version === this.version;
  }
}

export const coverHueCache = new CoverHueLruCache();

export function getTrackCoverSource(track: CoverTrack | null | undefined, excludedSource?: string | null) {
  if (!track) return null;
  for (const source of [track.artworkUrl, track.coverUrl, track.coverDataUrl]) {
    if (typeof source === "string" && source.trim() && source !== excludedSource) return source;
  }
  return null;
}

export function resolveEffectiveThemeColorSettings(settings: ThemeColorSettings, autoCoverHue: number | null) {
  if (!settings.autoCoverColorEnabled || autoCoverHue === null) return settings;
  return { ...settings, primaryHue: autoCoverHue, miniHue: autoCoverHue };
}

export function createCoverCacheKey(track: Pick<Track, "id" | "coverHash">, source: string) {
  const coverHash = track.coverHash?.trim();
  if (coverHash) return `hash:${coverHash}`;

  const compactSource = `${source.length}:${source.slice(0, 72)}:${source.slice(-24)}`;
  return `track:${track.id}:${compactSource}`;
}

export function extractDominantCoverHue(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
) {
  if (width <= 0 || height <= 0 || pixels.length < width * height * 4) return null;

  const buckets = Array.from({ length: HUE_BUCKET_COUNT }, () => ({
    weight: 0,
    x: 0,
    y: 0,
  }));

  for (let index = 0; index < width * height * 4; index += 4) {
    const alpha = pixels[index + 3] / 255;
    if (alpha < 0.12) continue;

    const red = pixels[index] / 255;
    const green = pixels[index + 1] / 255;
    const blue = pixels[index + 2] / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    const delta = max - min;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    if (lightness <= 0.12 || lightness >= 0.92 || saturation < 0.22) continue;

    let hue = 0;
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
    if (hue < 0) hue += 360;

    const weight = alpha * saturation * (0.45 + Math.min(lightness, 1 - lightness));
    const bucket = buckets[Math.floor(hue / (360 / HUE_BUCKET_COUNT)) % HUE_BUCKET_COUNT];
    const radians = (hue * Math.PI) / 180;
    bucket.weight += weight;
    bucket.x += Math.cos(radians) * weight;
    bucket.y += Math.sin(radians) * weight;
  }

  const winner = buckets.reduce((best, bucket) => (bucket.weight > best.weight ? bucket : best));
  if (winner.weight === 0) return null;
  return Math.round((Math.atan2(winner.y, winner.x) * 180) / Math.PI + 360) % 360;
}

export async function loadCoverHue(source: string) {
  if (!source || typeof Image === "undefined" || typeof document === "undefined") return null;

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("cover image failed to load"));
      next.src = source;
    });
    const width = Math.min(48, image.naturalWidth || image.width);
    const height = Math.min(48, image.naturalHeight || image.height);
    if (!width || !height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);
    return extractDominantCoverHue(context.getImageData(0, 0, width, height).data, width, height);
  } catch {
    return null;
  }
}
