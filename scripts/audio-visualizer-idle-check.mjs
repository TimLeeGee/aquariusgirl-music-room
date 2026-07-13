import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const analyserSource = readFileSync("src/hooks/useAudioAnalyser.ts", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const appSource = readFileSync("src/App.tsx", "utf8");

const tickStart = analyserSource.indexOf("const tick = () => {");
const pausedBranchStart = analyserSource.indexOf("} else {", tickStart);
const pausedBranchEnd = analyserSource.indexOf(
  "frameRef.current = requestAnimationFrame(tick);",
  pausedBranchStart,
);

assert.ok(tickStart >= 0, "audio analyser tick must exist");
assert.ok(pausedBranchStart >= 0, "audio analyser pause branch must exist");
assert.ok(pausedBranchEnd > pausedBranchStart, "audio analyser tick must schedule a frame");

const pausedBranch = analyserSource.slice(pausedBranchStart, pausedBranchEnd);

assert.match(
  pausedBranch,
  /const decayedLevels = previousLevelsRef\.current\.map\(\(value\) =>\s*Math\.max\(IDLE_LEVEL, value \* 0\.72\),\s*\);/,
  "paused visualizer must keep its existing finite decay",
);

const settledBeforeDecay = pausedBranch.indexOf(
  "if (previousLevelsRef.current.every((value) => value === IDLE_LEVEL))",
);
const decayedLevels = pausedBranch.indexOf("const decayedLevels =");
const publishDecay = pausedBranch.indexOf("previousLevelsRef.current = decayedLevels;");
const publishState = pausedBranch.indexOf("setLevels(previousLevelsRef.current);");
const settledAfterDecay = pausedBranch.indexOf(
  "if (decayedLevels.every((value) => value === IDLE_LEVEL))",
);

assert.ok(
  settledBeforeDecay >= 0 && settledBeforeDecay < decayedLevels,
  "already-settled paused levels must stop before allocating decayedLevels",
);
assert.ok(
  decayedLevels < publishDecay && publishDecay < publishState && publishState < settledAfterDecay,
  "the final idle state must publish before the analyser stops scheduling frames",
);
assert.match(
  pausedBranch.slice(settledBeforeDecay, decayedLevels),
  /frameRef\.current = null;\s*return;/,
  "already-settled paused levels must clear the frame and return without setState",
);
assert.match(
  pausedBranch.slice(settledAfterDecay),
  /if \(decayedLevels\.every\(\(value\) => value === IDLE_LEVEL\)\) \{\s*frameRef\.current = null;\s*return;\s*\}/,
  "the tick that publishes the final idle state must stop without scheduling another frame",
);
assert.match(
  analyserSource,
  /return \(\) => \{\s*if \(frameRef\.current !== null\) \{\s*cancelAnimationFrame\(frameRef\.current\);\s*\}\s*frameRef\.current = null;\s*\};/,
  "cleanup must clear a cancelled animation frame id",
);

assert.equal(
  packageJson.scripts["check:audio-visualizer-idle"],
  "node scripts/audio-visualizer-idle-check.mjs",
  "package script must expose the visualizer idle guard",
);
for (const scriptName of ["dist:release", "dist:mac", "dist:win"]) {
  assert.match(
    packageJson.scripts[scriptName],
    /npm run check:audio-visualizer-idle/,
    `${scriptName} must run the visualizer idle guard`,
  );
}

assert.equal(
  (appSource.match(/useAudioAnalyser\(/g) ?? []).length,
  1,
  "App must keep one audio analyser hook call",
);
assert.equal(
  (
    appSource.match(
      /<BrandAssetsContext\.Provider value=\{resolvedBrandAssets\}>\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)?\{audioElement\}/g,
    ) ?? []
  ).length,
  3,
  "audioElement must remain the first BrandAssets child in normal, Mini, and OBS modes",
);

console.log("audio-visualizer-idle-check PASS");
