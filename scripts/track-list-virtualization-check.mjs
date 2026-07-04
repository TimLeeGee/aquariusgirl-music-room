import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const trackListSource = readFileSync("src/components/TrackList.tsx", "utf8");
const playlistPanelSource = readFileSync("src/components/PlaylistPanel.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const appLayoutSource = readFileSync("src/components/AppLayout.tsx", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

assert.match(trackListSource, /TRACK_ROW_HEIGHT/);
assert.match(trackListSource, /TRACK_LIST_OVERSCAN/);
assert.match(trackListSource, /visibleTracks/);
assert.match(trackListSource, /scrollTop/);
assert.match(trackListSource, /paddingTop/);
assert.match(trackListSource, /paddingBottom/);
assert.doesNotMatch(trackListSource, /tracks\.map\(\(track, index\) =>/);
assert.match(appLayoutSource, /className="min-h-0 min-w-0 lg:h-full"/);
assert.match(appSource, /className="flex h-full min-h-0 flex-col gap-4"/);
assert.match(playlistPanelSource, /lg:min-h-0/);
assert.match(playlistPanelSource, /lg:flex-1/);
assert.match(playlistPanelSource, /overflow-hidden/);
assert.doesNotMatch(playlistPanelSource, /max-h-\[calc\(100vh-10rem\)\]/);
assert.equal(typeof packageJson.scripts["check:track-list-virtualization"], "string");
assert.match(packageJson.scripts["dist:release"], /check:track-list-virtualization/);

console.log("track-list-virtualization-check PASS");
