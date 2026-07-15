import assert from "node:assert/strict";

const {
  CoverHueLruCache,
  CoverHueRequestGuard,
  createCoverCacheKey,
  extractDominantCoverHue,
  getTrackCoverSource,
  resolveEffectiveThemeColorSettings,
} = await import("../src/utils/coverColor.ts");

const nearHue = (actual, expected, tolerance = 18) => {
  const distance = Math.abs(((actual - expected + 540) % 360) - 180);
  assert.ok(distance <= tolerance, `expected hue near ${expected}, got ${actual}`);
};

const pixels = (...colors) => new Uint8ClampedArray(colors.flat());

nearHue(extractDominantCoverHue(pixels(...Array(16).fill([255, 30, 30, 255])), 4, 4), 0);
nearHue(extractDominantCoverHue(pixels(...Array(16).fill([30, 255, 30, 255])), 4, 4), 120);
nearHue(extractDominantCoverHue(pixels(...Array(16).fill([30, 30, 255, 255])), 4, 4), 240);

const vividMix = extractDominantCoverHue(
  pixels(...[...Array(12).fill([245, 30, 30, 255]), ...Array(4).fill([30, 220, 255, 255])]),
  4,
  4,
);
nearHue(vividMix, 0);
assert.equal(extractDominantCoverHue(pixels(...Array(16).fill([0, 0, 0, 255])), 4, 4), null);
assert.equal(extractDominantCoverHue(pixels(...Array(16).fill([255, 255, 255, 255])), 4, 4), null);
assert.equal(extractDominantCoverHue(pixels(...Array(16).fill([120, 120, 120, 255])), 4, 4), null);
assert.equal(extractDominantCoverHue(pixels(...Array(16).fill([255, 0, 0, 0])), 4, 4), null);

assert.equal(getTrackCoverSource(null), null);
assert.equal(getTrackCoverSource({ id: "placeholder" }), null);
assert.equal(getTrackCoverSource({ id: "cover", artworkUrl: "artwork" }), "artwork");
assert.equal(getTrackCoverSource({ id: "cover", coverUrl: "cover" }), "cover");
assert.equal(getTrackCoverSource({ id: "cover", coverDataUrl: "data:image/png;base64,tiny" }), "data:image/png;base64,tiny");
assert.equal(
  getTrackCoverSource({ id: "placeholder", artworkUrl: "brand-placeholder" }, "brand-placeholder"),
  null,
);
assert.equal(createCoverCacheKey({ id: "cover", coverHash: "hash" }, "data:image/png;base64,large"), "hash:hash");
assert.ok(createCoverCacheKey({ id: "cover" }, "data:image/png;base64," + "x".repeat(5000)).length < 180);

const cache = new CoverHueLruCache();
cache.set("same-cover", 222);
assert.equal(cache.get("same-cover"), 222);
assert.equal(cache.get("same-cover"), 222);
for (let index = 0; index < 65; index += 1) cache.set(`cover-${index}`, index);
assert.equal(cache.size, 64);
assert.equal(cache.get("cover-0"), undefined);
assert.equal(cache.get("cover-64"), 64);

const manualTheme = {
  autoCoverColorEnabled: false,
  primaryHue: 195,
  secondaryHue: 321,
  accentHue: 44,
  textHue: 0,
  backgroundHue: 222,
  panelHue: 214,
  miniHue: 195,
  panelOpacity: 78,
  backgroundOpacity: 92,
  stageOpacity: 55,
  decorationOpacity: 72,
};
assert.deepEqual(resolveEffectiveThemeColorSettings(manualTheme, 42), manualTheme);
const automaticSettings = { ...manualTheme, autoCoverColorEnabled: true };
assert.deepEqual(resolveEffectiveThemeColorSettings(automaticSettings, null), automaticSettings);
const automaticTheme = resolveEffectiveThemeColorSettings(automaticSettings, 42);
assert.deepEqual(automaticTheme, { ...manualTheme, autoCoverColorEnabled: true, primaryHue: 42, miniHue: 42 });
assert.deepEqual(manualTheme, {
  autoCoverColorEnabled: false,
  primaryHue: 195,
  secondaryHue: 321,
  accentHue: 44,
  textHue: 0,
  backgroundHue: 222,
  panelHue: 214,
  miniHue: 195,
  panelOpacity: 78,
  backgroundOpacity: 92,
  stageOpacity: 55,
  decorationOpacity: 72,
});
assert.deepEqual(automaticSettings, { ...manualTheme, autoCoverColorEnabled: true });

const requestGuard = new CoverHueRequestGuard();
const requestA = requestGuard.next();
const requestB = requestGuard.next();
const requestC = requestGuard.next();
const deferred = () => {
  let resolve;
  const promise = new Promise((next) => {
    resolve = next;
  });
  return { promise, resolve };
};
const deferredA = deferred();
const deferredB = deferred();
const deferredC = deferred();
const applied = [];
const applyIfCurrent = async (request, result, label) => {
  await result;
  if (requestGuard.isCurrent(request)) applied.push(label);
};
const applyA = applyIfCurrent(requestA, deferredA.promise, "A");
const applyB = applyIfCurrent(requestB, deferredB.promise, "B");
const applyC = applyIfCurrent(requestC, deferredC.promise, "C");
deferredC.resolve();
await applyC;
deferredB.resolve();
await applyB;
deferredA.resolve();
await applyA;
assert.deepEqual(applied, ["C"], "only the latest inverse-completion request may apply");

console.log("cover-color-check PASS");
