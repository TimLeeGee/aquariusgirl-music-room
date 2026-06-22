import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const dialog = readFileSync("src/components/ImageSettingsDialog.tsx", "utf8");
const stage = readFileSync("src/components/CharacterStage.tsx", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const styles = readFileSync("src/styles/index.css", "utf8");

for (const key of ["primaryHue", "secondaryHue", "accentHue", "textHue", "backgroundHue", "panelHue", "miniHue"]) {
  assert.match(dialog, new RegExp(`key: "${key}"`));
}

for (const key of ["panelOpacity", "backgroundOpacity", "stageOpacity", "decorationOpacity"]) {
  assert.match(dialog, new RegExp(`key: "${key}"`));
  assert.match(app, new RegExp(key));
}

assert.match(dialog, /type="range"/);
assert.match(dialog, /全部復原/);
assert.match(styles, /\.rainbow-range/);
assert.match(tokens, /--color-aquarius-blue-hsl:/);
assert.match(app, /STORAGE_KEYS\.themeColorSettings/);
assert.match(dialog, /max=\{100\}/);
assert.match(styles, /--theme-panel-opacity/);
assert.match(styles, /--theme-stage-opacity/);
assert.match(styles, /--theme-mini-hue/);
assert.match(dialog, /miniOpacity/);
assert.match(dialog, /onMiniOpacityChange/);
assert.match(dialog, /MINI 視窗/);
assert.match(stage, /theme-stage-overlay/);

console.log("theme color check passed");
