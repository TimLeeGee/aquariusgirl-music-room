import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const dialog = readFileSync("src/components/ImageSettingsDialog.tsx", "utf8");
const stage = readFileSync("src/components/CharacterStage.tsx", "utf8");
const header = readFileSync("src/components/Header.tsx", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const styles = readFileSync("src/styles/index.css", "utf8");
const settings = readFileSync("src/types/settings.ts", "utf8");
const exportSettings = readFileSync("src/utils/exportSettings.ts", "utf8");

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
assert.match(dialog, />依封面自動換色</);
assert.match(dialog, /播放歌曲時，自動擷取封面主色，同步播放器主色與 MINI 背景。沒有封面時使用下方手動設定的顏色。/);
assert.match(dialog, /type="checkbox"/);
assert.match(dialog, /autoCoverColorEnabled/);
assert.match(header, /label="外觀設定"/);
assert.match(tokens, /@property --theme-primary-hue/);
assert.match(tokens, /@property --theme-mini-hue/);
assert.match(tokens, /transition: --theme-primary-hue 450ms ease, --theme-mini-hue 450ms ease/);
assert.match(tokens, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(app, /const effectiveThemeColorSettings = useMemo/);
assert.match(app, /coverHueRequestGuardRef/);
assert.match(app, /\[currentCover, resolvedThemeColorSettings\.autoCoverColorEnabled\]/);
assert.match(settings, /autoCoverColorEnabled:\s*false/);
assert.match(app, /autoCoverColorEnabled:\s*stored\.autoCoverColorEnabled === true/);
assert.match(exportSettings, /appVersion:\s*"0\.1\.52"/);
assert.match(exportSettings, /themeColorSettings:\s*input\.themeColorSettings/);
assert.match(app, /getTrackCoverSource\(track, resolvedBrandAssets\.coverPlaceholder\)/);
assert.doesNotMatch(app, /setThemeColorSettings\(\{[\s\S]{0,500}autoCoverHue/);
assert.doesNotMatch(app, /currentTime[\s\S]{0,500}loadCoverHue/);

console.log("theme color check passed");
