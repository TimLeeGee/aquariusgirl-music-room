import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const trackListSource = readFileSync("src/components/TrackList.tsx", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

assert.match(trackListSource, /TRACK_ROW_HEIGHT/);
assert.match(trackListSource, /TRACK_LIST_OVERSCAN/);
assert.match(trackListSource, /visibleTracks/);
assert.match(trackListSource, /scrollTop/);
assert.match(trackListSource, /paddingTop/);
assert.match(trackListSource, /paddingBottom/);
assert.doesNotMatch(trackListSource, /tracks\.map\(\(track, index\) =>/);
assert.equal(typeof packageJson.scripts["check:track-list-virtualization"], "string");
assert.match(packageJson.scripts["dist:release"], /check:track-list-virtualization/);

console.log("track-list-virtualization-check PASS");
