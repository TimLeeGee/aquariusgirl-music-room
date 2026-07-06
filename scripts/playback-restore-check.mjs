import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const audioHookSource = readFileSync("src/hooks/useAudioPlayer.ts", "utf8");
const fileSystemSource = readFileSync("src/hooks/useFileSystemAccess.ts", "utf8");
const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const libraryDbSource = readFileSync("src/hooks/useMusicLibraryDb.ts", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const mainSource = readFileSync("electron/main.ts", "utf8");
const songInfoPanelSource = readFileSync("src/components/SongInfoPanel.tsx", "utf8");
const applySource = appSource.slice(
  appSource.indexOf("const handleApplySongInfoToOriginal"),
  appSource.indexOf("const handleDeletePlaylist"),
);

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
assert.match(appSource, /const selectedCoverHash = draft\.coverBytes \? draft\.coverHash : undefined/);
assert.match(appSource, /let oldOriginalCoverHash = oldCoverHash/);
assert.match(appSource, /readSongInfoFromOriginalFile\(\s*track\.sourcePath,\s*\)/);
assert.match(appSource, /reloadedTrack\.coverHash !== selectedCoverHash/);
assert.match(appSource, /reloadedTrack\.coverHash === oldOriginalCoverHash/);
assert.match(appSource, /showError\("原始檔寫回後讀回不一致。"\)/);
assert.match(appSource, /createTrackWithSongInfo/);
assert.match(appSource, /await libraryDb\.putTrackMetadata\(reloadedTrack\)[\s\S]*replaceTrackSongInfo\(track\.id/);
assert.match(appSource, /console\.error\("\[idb\] save failed"/);
assert.doesNotMatch(applySource, /reloadSongInfoFromOriginal\(track\)/);
assert.doesNotMatch(appSource, /handleSaveSongInfoToPlayer/);
assert.doesNotMatch(appSource, /const savedTrack = replaceTrackSongInfo\(track\.id, validDraft, \{ metadataOverride: true \}\)/);
assert.doesNotMatch(appSource, /await libraryDb\.putTrackMetadata\(savedTrack\)/);
assert.doesNotMatch(appSource, /showInfo\("已儲存到播放器"\)/);
assert.doesNotMatch(appSource, /libraryDb\.saveTracksNow/);
assert.doesNotMatch(appSource, /showInfo\("已套用到原始檔"\);[\s\S]{0,240}libraryDb\.putTrackMetadata/);
assert.match(mainSource, /--user-data-dir/);
assert.match(mainSource, /app\.setPath\("userData", userDataDirArg\)/);

assert.match(songInfoPanelSource, /savingRef/);
assert.match(songInfoPanelSource, /resetDraftState/);
assert.match(songInfoPanelSource, /trackDraftSnapshot/);
assert.match(songInfoPanelSource, /createSongCoverHash/);
assert.match(songInfoPanelSource, /coverBytes/);
assert.match(songInfoPanelSource, /draftCoverHash/);
assert.match(songInfoPanelSource, /disabled=\{busy\}/);
assert.doesNotMatch(songInfoPanelSource, /onSaveToPlayer/);
assert.doesNotMatch(songInfoPanelSource, /handleSaveToPlayer/);
assert.doesNotMatch(songInfoPanelSource, />\s*儲存到播放器\s*</);
assert.doesNotMatch(songInfoPanelSource, /\}, \[open, track\?\.id\]\);/);
assert.match(songInfoPanelSource, /disabled=\{!dirty \|\| busy \|\| Boolean\(writeBackDisabledReason\)\}/);
assert.match(songInfoPanelSource, /savingRef\.current = false/);
assert.match(songInfoPanelSource, /resetDraftState\(createSongInfoDraft\(null\)\)/);

console.log("playback-restore-check PASS");
