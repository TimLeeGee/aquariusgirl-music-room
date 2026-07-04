import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const audioHookSource = readFileSync("src/hooks/useAudioPlayer.ts", "utf8");
const fileSystemSource = readFileSync("src/hooks/useFileSystemAccess.ts", "utf8");
const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const libraryDbSource = readFileSync("src/hooks/useMusicLibraryDb.ts", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const songInfoPanelSource = readFileSync("src/components/SongInfoPanel.tsx", "utf8");

assert.match(audioHookSource, /currentTrackSource/);
assert.doesNotMatch(audioHookSource, /\[currentTrack,\s*isPlaying,\s*onError\]/);
assert.match(audioHookSource, /audio\.pause\(\);[\s\S]*\}, \[currentTrackSource, isPlaying, onError\]\);/);
assert.match(audioHookSource, /loadedTrackSourceRef/);
assert.doesNotMatch(audioHookSource, /audio\.src !== currentTrackSource/);
assert.doesNotMatch(audioHookSource, /\[currentTrackDuration,\s*currentTrackSource\]/);
assert.match(audioHookSource, /loadedTrackSourceRef\.current !== currentTrackSource/);

assert.match(fileSystemSource, /saveMusicSourcePaths/);
assert.match(fileSystemSource, /if \(selected\.length === 0\)/);
assert.match(fileSystemSource, /selected\s*\.map\(\(item\) => item\.sourcePath\)/);
assert.match(libraryDbSource, /musicSourcePaths/);
assert.match(appSource, /libraryDb\.musicSourcePaths\.length/);
assert.match(appSource, /remapTrackIds/);
assert.match(localTracksSource, /track\.sourcePath && !track\.metadataOverride && track\.metadataLoaded/);
assert.doesNotMatch(localTracksSource, /artist: stored\.artist,/);
assert.match(localTracksSource, /artist: preserveStoredText\(stored\.artist, track\.artist\)/);
assert.match(localTracksSource, /metadataLoaded: track\.metadataLoaded \|\| hasStoredMetadata\(stored\)/);
assert.doesNotMatch(localTracksSource, /mediaVersion:\s*Date\.now\(\),/);
assert.match(libraryDbSource, /trackSaveQueueRef/);
assert.match(libraryDbSource, /trackSaveQueueRef\.current\s*=\s*trackSaveQueueRef\.current/);
assert.match(libraryDbSource, /putTrackMetadata/);
assert.match(libraryDbSource, /patchTrackPlayback/);
assert.match(libraryDbSource, /patchTrackDuration/);
assert.match(libraryDbSource, /return saveTask/);
assert.match(appSource, /await libraryDb\.putTrackMetadata\(reloadedTrack\)/);
assert.doesNotMatch(appSource, /libraryDb\.saveTracksNow/);
assert.doesNotMatch(appSource, /showInfo\("已套用到原始檔"\);[\s\S]{0,240}libraryDb\.putTrackMetadata/);

assert.match(songInfoPanelSource, /savingRef/);
assert.match(songInfoPanelSource, /resetDraftState/);
assert.match(songInfoPanelSource, /trackDraftSnapshot/);
assert.doesNotMatch(songInfoPanelSource, /\}, \[open, track\?\.id\]\);/);
assert.match(songInfoPanelSource, /disabled=\{!dirty \|\| busy \|\| Boolean\(writeBackDisabledReason\)\}/);
assert.match(songInfoPanelSource, /savingRef\.current = false/);
assert.match(songInfoPanelSource, /resetDraftState\(createSongInfoDraft\(null\)\)/);

console.log("playback-restore-check PASS");
