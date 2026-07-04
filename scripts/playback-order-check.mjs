import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync("src/App.tsx", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

assert.match(appSource, /const orderedPlaybackTracks = useMemo/);
assert.match(appSource, /tracks: orderedPlaybackTracks/);
assert.match(appSource, /const playlistTracks = orderedPlaybackTracks/);
assert.match(appSource, /sortTracks\(playbackTracks, sortMode\)/);
assert.doesNotMatch(appSource, /tracks: playbackTracks,\n\s*onInfo: showInfo/);
assert.equal(typeof packageJson.scripts["check:playback-order"], "string");
assert.match(packageJson.scripts["dist:release"], /check:playback-order/);

console.log("playback-order-check PASS");
