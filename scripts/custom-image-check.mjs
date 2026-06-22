import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  detectImageMime,
  isCustomImageSlot,
  loadCustomImages,
  removeCustomImage,
  saveCustomImage,
} from "../dist-electron/customImages.js";

assert.equal(detectImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
assert.equal(detectImageMime(Uint8Array.from([0xff, 0xd8, 0xff])), "image/jpeg");
assert.equal(detectImageMime(new TextEncoder().encode("RIFF0000WEBP")), "image/webp");
assert.equal(detectImageMime(new TextEncoder().encode("GIF89a")), "image/gif");
assert.equal(detectImageMime(new TextEncoder().encode("<svg>")), null);
assert.equal(isCustomImageSlot("decorationBubble"), true);
assert.equal(isCustomImageSlot("characterMain"), false);

const backgroundAura = await readFile("src/components/BackgroundAura.tsx", "utf8");
const appLayout = await readFile("src/components/AppLayout.tsx", "utf8");
const styles = await readFile("src/styles/index.css", "utf8");
assert.match(backgroundAura, /fixed inset-0 z-0/);
assert.doesNotMatch(backgroundAura, /-z-10/);
assert.match(backgroundAura, /fixed inset-0 z-20/);
assert.match(backgroundAura, /decorativeImages\?\.slice\(0, 2\)/);
assert.match(backgroundAura, /theme-background-image.*object-cover/);
assert.doesNotMatch(backgroundAura, /opacity-30 blur-sm/);
assert.match(appLayout, /relative z-10 min-h-screen/);
assert.match(styles, /--color-deep-navy-hsl\) \/ 0\.34/);

const root = await mkdtemp(join(tmpdir(), "aquariusgirl-images-"));
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
try {
  const dataUrl = await saveCustomImage(root, "logo", png);
  assert.match(dataUrl, /^data:image\/png;base64,/);
  assert.deepEqual(await readFile(join(root, "logo.image")), png);
  assert.equal((await loadCustomImages(root)).logo, dataUrl);
  await removeCustomImage(root, "logo");
  assert.equal((await loadCustomImages(root)).logo, undefined);
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log("custom image check passed");
