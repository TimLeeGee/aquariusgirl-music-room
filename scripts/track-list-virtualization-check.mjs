import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const trackListSource = readFileSync("src/components/TrackList.tsx", "utf8");
const playlistPanelSource = readFileSync("src/components/PlaylistPanel.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const appLayoutSource = readFileSync("src/components/AppLayout.tsx", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

assert.match(trackListSource, /TRACK_ROW_HEIGHT/);
assert.match(trackListSource, /TRACK_LIST_OVERSCAN/);
assert.match(trackListSource, /TRACK_LIST_BOTTOM_SAFE_SPACE/);
assert.match(trackListSource, /visibleTracks/);
assert.match(trackListSource, /scrollTop/);
assert.match(trackListSource, /ResizeObserver/);
assert.match(trackListSource, /viewportHeight/);
assert.match(trackListSource, /paddingTop/);
assert.match(trackListSource, /paddingBottom/);
assert.doesNotMatch(trackListSource, /tracks\.map\(\(track, index\) =>/);
assert.doesNotMatch(appLayoutSource, /min-h-screen/);
assert.match(appLayoutSource, /className="relative z-10 h-screen overflow-hidden/);
assert.match(appLayoutSource, /className="mx-auto flex h-full min-h-0/);
assert.match(appLayoutSource, /className="grid min-h-0 flex-1/);
assert.match(appLayoutSource, /className="flex min-w-0 flex-col gap-5"/);
assert.doesNotMatch(appLayoutSource, /className="playlist-scrollbar flex min-h-0 min-w-0 flex-col gap-5 overflow-y-auto/);
assert.match(appLayoutSource, /className="min-h-0 min-w-0 overflow-hidden lg:h-full"/);
assert.match(appSource, /className="flex h-full min-h-0 flex-col gap-4 overflow-hidden"/);
assert.doesNotMatch(playlistPanelSource, /lg:min-h-0/);
assert.doesNotMatch(playlistPanelSource, /lg:flex-1/);
assert.match(
  playlistPanelSource,
  /className="glass-panel flex max-h-\[calc\(100vh-10rem\)\] min-h-\[520px\] flex-col overflow-hidden p-4 sm:p-5 lg:sticky lg:top-5"/,
);
assert.match(playlistPanelSource, /-mr-3 pr-1/);
assert.match(trackListSource, /playlist-scrollbar/);
assert.match(trackListSource, /overflow-x-hidden/);
assert.match(trackListSource, /pr-3/);
assert.match(readFileSync("src/components/TrackItem.tsx", "utf8"), /h-20/);
assert.match(readFileSync("src/styles/index.css", "utf8"), /scrollbar-gutter:\s*stable/);
assert.equal(typeof packageJson.scripts["check:track-list-virtualization"], "string");
assert.match(packageJson.scripts["dist:release"], /check:track-list-virtualization/);

console.log("track-list-virtualization-check PASS");
