import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync("src/App.tsx", "utf8");
const audioHookSource = readFileSync("src/hooks/useAudioPlayer.ts", "utf8");
const indexedDbSource = readFileSync("src/storage/indexedDb.ts", "utf8");
const libraryDbSource = readFileSync("src/hooks/useMusicLibraryDb.ts", "utf8");
const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const playlistSource = readFileSync("src/hooks/usePlaylists.ts", "utf8");

[
  "getTrackMetadataById",
  "getTrackMetadataBySourcePath",
  "putTrackMetadata",
  "putManyTrackMetadata",
  "patchTrackMetadata",
  "patchTrackPlayback",
  "patchTrackDuration",
  "deleteTrackMetadata",
  "replaceAllTrackMetadata",
].forEach((name) => {
  assert.match(indexedDbSource, new RegExp(`export async function ${name}\\b`));
});

assert.doesNotMatch(
  libraryDbSource,
  /useEffect\(\(\) => \{\s*if \(tracks\.length === 0\)[\s\S]*saveTracksNow\(tracks\)/,
);
assert.doesNotMatch(libraryDbSource, /saveTrackMetadata\(tracksSnapshot\)/);
assert.match(libraryDbSource, /putTrackMetadata/);
assert.match(libraryDbSource, /patchTrackPlayback/);
assert.match(libraryDbSource, /patchTrackDuration/);
assert.match(libraryDbSource, /deleteTrackMetadata/);

assert.match(localTracksSource, /recordTrackPlayback[\s\S]*lastPlayedAt/);
assert.match(appSource, /libraryDb\.patchTrackPlayback/);
assert.match(appSource, /libraryDb\.patchTrackDuration/);
assert.match(appSource, /libraryDb\.putTrackMetadata\(reloadedTrack\)/);
assert.doesNotMatch(appSource, /libraryDb\.saveTracksNow/);

assert.match(appSource, /hasAppliedStoredMetadataRef/);
assert.match(appSource, /hasAppliedStoredMetadataRef\.current = true/);
assert.doesNotMatch(
  appSource,
  /applyStoredTrackMetadata\(libraryDb\.storedTracks\);[\s\S]{0,260}libraryDb\.storedTracks,[\s\S]{0,120}tracks\.length/,
);

assert.doesNotMatch(audioHookSource, /readSongInfoFromOriginalFile|readAudioMetadata|applySongInfoToOriginalFile/);
assert.doesNotMatch(audioHookSource, /audio\.src !== currentTrackSource/);
assert.doesNotMatch(localTracksSource, /mediaVersion:\s*Date\.now\(\),/);

assert.doesNotMatch(playlistSource, /coverDataUrl/);
assert.match(playlistSource, /trackIds/);
assert.match(playlistSource, /remapTrackIds/);

[
  "check:no-track-save-loop",
  "check:no-full-db-save-on-playback",
  "check:cover-update-five-times",
  "check:playlist-song-info-restart",
  "check:no-audio-load-on-cover-only-update",
].forEach((name) => {
  assert.equal(typeof packageJson.scripts[name], "string", `${name} is missing`);
});

console.log("metadata-save-loop-check PASS");
