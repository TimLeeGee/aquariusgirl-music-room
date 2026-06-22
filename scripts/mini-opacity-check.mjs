import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const miniSource = readFileSync("src/components/MiniPlayerAssistant.tsx", "utf8");
const dialogSource = readFileSync("src/components/ImageSettingsDialog.tsx", "utf8");
const mainSource = readFileSync("electron/main.ts", "utf8");

assert.match(miniSource, /min=\{20\}/);
assert.match(miniSource, /max=\{100\}/);
assert.match(miniSource, /onOpacityChange/);
assert.match(miniSource, /isWindowsDesktop[\s\S]*navigator\.userAgent\.includes\("Windows"\)/);
assert.match(miniSource, /isWindowsDesktop \? "pt-7" : "pt-2"/);
assert.match(miniSource, /className=\{`app-drag-region h-screen w-screen/);
assert.match(miniSource, /mini-assistant-controls app-no-drag/);
assert.match(miniSource, /flex h-5 items-center rounded-full/);
assert.match(mainSource, /Math\.max\(0\.2, settings\.opacity\)/);
assert.match(mainSource, /height: process\.platform === "win32" \? 288 : 268/);
assert.match(
  mainSource,
  /\.\.\.requestedMiniBounds,[\s\S]*width: defaultMiniSize\.width,[\s\S]*height: defaultMiniSize\.height/,
);
assert.match(
  mainSource,
  /window\.isMaximized\(\) \|\| window\.isFullScreen\(\)[\s\S]*window\.getNormalBounds\(\)/,
);
assert.match(
  mainSource,
  /if \(window\.isFullScreen\(\)\) window\.setFullScreen\(false\);[\s\S]*if \(window\.isMaximized\(\)\) window\.unmaximize\(\);[\s\S]*window\.setBounds\(nextMiniBounds, true\)/,
);
assert.match(mainSource, /Math\.round\(workArea\.width \* 0\.9\)/);
assert.match(mainSource, /Math\.round\(workArea\.height \* 0\.9\)/);
assert.match(
  mainSource,
  /const initialBounds = getCenteredFullBounds\(\);[\s\S]*new BrowserWindow\(\{[\s\S]*\.\.\.initialBounds/,
);
assert.match(dialogSource, /aria-label="MINI 視窗透明度"/);
assert.match(dialogSource, /min=\{20\}/);
assert.match(dialogSource, /onMiniOpacityChange/);
assert.doesNotMatch(mainSource, /process\.platform === "win32"\s*\?\s*1/);

console.log("mini opacity check passed");
