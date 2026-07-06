import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync("src/App.tsx", "utf8");
const audioFilesSource = readFileSync("src/utils/audioFiles.ts", "utf8");
const audioHookSource = readFileSync("src/hooks/useAudioPlayer.ts", "utf8");
const indexedDbSource = readFileSync("src/storage/indexedDb.ts", "utf8");
const libraryDbSource = readFileSync("src/hooks/useMusicLibraryDb.ts", "utf8");
const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const mainSource = readFileSync("electron/main.ts", "utf8");
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
assert.match(indexedDbSource, /FULL_TRACK_SAVE_WINDOW_MS/);
assert.match(indexedDbSource, /warnIfRepeatedFullTrackWrite/);
assert.match(audioFilesSource, /export function isSupportedAudioPath/);
assert.match(indexedDbSource, /isSupportedAudioPath\(metadata\.sourcePath\)/);
assert.match(indexedDbSource, /filter\(\(sourcePath\) => sourcePath && isSupportedAudioPath\(sourcePath\)\)/);
assert.match(indexedDbSource, /isSupportedAudioPath\(item\)/);

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
assert.match(appSource, /reloadedTrack\.coverHash !== selectedCoverHash/);
assert.match(appSource, /isSupportedAudioPath\(sourcePath\)/);
assert.match(mainSource, /--aquariusgirl-user-data-dir/);
assert.match(mainSource, /AQUARIUSGIRL_USER_DATA_DIR/);
assert.match(mainSource, /app\.commandLine\.appendSwitch\("user-data-dir", userDataDirArg\)/);
assert.doesNotMatch(appSource, /libraryDb\.saveTracksNow/);

assert.match(appSource, /hasAppliedStoredMetadataRef/);
assert.match(appSource, /hasAppliedStoredMetadataRef\.current = true/);
assert.match(appSource, /readSongInfoFromOriginalFile called while playback is active/);
assert.doesNotMatch(
  appSource,
  /applyStoredTrackMetadata\(libraryDb\.storedTracks\);[\s\S]{0,260}libraryDb\.storedTracks,[\s\S]{0,120}tracks\.length/,
);

assert.doesNotMatch(audioHookSource, /readSongInfoFromOriginalFile|readAudioMetadata|applySongInfoToOriginalFile/);
assert.doesNotMatch(audioHookSource, /audio\.src !== currentTrackSource/);
assert.match(audioHookSource, /loadedTrackIdRef/);
assert.match(audioHookSource, /audio\.load called for the same track/);
assert.match(localTracksSource, /storedMetadataApplyCountRef/);
assert.match(localTracksSource, /applyStoredTrackMetadata called more than once/);
assert.match(localTracksSource, /sourcePathCandidate/);
assert.match(localTracksSource, /isSupportedAudioPath\(sourcePathCandidate\)/);
assert.match(localTracksSource, /coverHash: normalized\.coverHash/);
assert.match(localTracksSource, /coverHash: stored\.coverHash \?\? track\.coverHash/);
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

// 0.1.42: playing-file lock fix — renderer releases the audio handle around original-file writes; writer retries locked renames.
const songInfoWriterSource = readFileSync("electron/songInfoWriter.ts", "utf8");
assert.match(songInfoWriterSource, /renameWithRetry\(tempPath, sourcePath\)/);
assert.match(songInfoWriterSource, /isFileLockError/);
assert.match(songInfoWriterSource, /EPERM/);
assert.match(audioHookSource, /suspendAudioForFileWrite/);
assert.match(audioHookSource, /removeAttribute\("src"\)/);
assert.match(appSource, /suspendAudioForFileWrite\(track\.id\)/);
assert.match(appSource, /resumeAudio\(\);/);

console.log("metadata-save-loop-check PASS");
