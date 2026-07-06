import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function removeOne(trackIds, trackId, occurrenceIndex) {
  return trackIds.filter((item, index) => !(index === occurrenceIndex && item === trackId));
}

function move(trackIds, fromIndex, toIndex) {
  const next = [...trackIds];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function manualImportIntoPlaylist(trackIds, importedTrackIds) {
  return [...trackIds, ...importedTrackIds];
}

function autoRestoreLibraryOnly(trackIds) {
  return [...trackIds];
}

function removeLibraryTrackFromPlaylists(playlists, trackId) {
  return playlists.map((playlist) => ({
    ...playlist,
    trackIds: playlist.trackIds.filter((item) => item !== trackId),
  }));
}

function excludeFromSmartPlaylist(excludedTrackIds, trackId) {
  return Array.from(new Set([...excludedTrackIds, trackId]));
}

const playlist = ["a", "b", "a", "c"];
assert.deepEqual(removeOne(playlist, "a", 2), ["a", "b", "c"]);
assert.deepEqual(playlist, ["a", "b", "a", "c"]);
assert.deepEqual(move(playlist, 3, 1), ["a", "c", "b", "a"]);
assert.deepEqual(move(["song-1", "song-2", "song-3"], 2, 0), [
  "song-3",
  "song-1",
  "song-2",
]);
assert.deepEqual(manualImportIntoPlaylist(["song-1"], ["song-2"]), ["song-1", "song-2"]);
assert.deepEqual(autoRestoreLibraryOnly(["song-1", "song-2"]), ["song-1", "song-2"]);
const libraryTracks = ["song-1", "song-2"];
assert.deepEqual(removeOne(["song-1", "song-2"], "song-1", 0), ["song-2"]);
assert.deepEqual(libraryTracks, ["song-1", "song-2"]);
assert.deepEqual(
  removeLibraryTrackFromPlaylists([
    { id: "playlist-1", trackIds: ["song-1", "song-2", "song-1"] },
    { id: "playlist-2", trackIds: ["song-3", "song-1"] },
  ], "song-1"),
  [
    { id: "playlist-1", trackIds: ["song-2"] },
    { id: "playlist-2", trackIds: ["song-3"] },
  ],
);
assert.deepEqual(excludeFromSmartPlaylist([], "song-1"), ["song-1"]);
assert.deepEqual(excludeFromSmartPlaylist(["song-1"], "song-1"), ["song-1"]);

const appSource = readFileSync("src/App.tsx", "utf8");
const playlistHookSource = readFileSync("src/hooks/usePlaylists.ts", "utf8");
const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const localStorageSource = readFileSync("src/hooks/useLocalStorage.ts", "utf8");
const musicLibraryDbSource = readFileSync("src/hooks/useMusicLibraryDb.ts", "utf8");
const smartPlaylistSource = readFileSync("src/utils/evaluateSmartPlaylist.ts", "utf8");
const deleteHandlerSource = appSource.slice(
  appSource.indexOf("const handleDeletePlaylist"),
  appSource.indexOf("const handleRemoveCurrentTrackFromPlaylist"),
);
const deleteDialogSource = readFileSync("src/components/PlaylistDeleteDialog.tsx", "utf8");
const duplicateDialogSource = readFileSync("src/components/PlaylistDuplicateDialog.tsx", "utf8");
const playerCoreSource = readFileSync("src/components/PlayerCore.tsx", "utf8");
const trackItemSource = readFileSync("src/components/TrackItem.tsx", "utf8");
const addHandlerSource = appSource.slice(
  appSource.indexOf("const handleAddTrackToPlaylist"),
  appSource.indexOf("const handleReorderVisibleTracks"),
);
assert.equal(deleteHandlerSource.includes("window.confirm"), false);
assert.match(deleteDialogSource, /autoFocus/);
assert.equal(addHandlerSource.includes("window.confirm"), false);
assert.match(addHandlerSource, /setPlaylistDuplicateRequest/);
assert.match(duplicateDialogSource, /role="dialog"/);
assert.match(duplicateDialogSource, /autoFocus/);
assert.match(playerCoreSource, /w-36 shrink-0/);
assert.doesNotMatch(playerCoreSource, /max-w-36/);
assert.match(trackItemSource, /hidden w-32 shrink-0/);
assert.doesNotMatch(trackItemSource, /max-w-32/);
assert.match(appSource, /excludeTrackFromSmartPlaylist/);
assert.match(playlistHookSource, /excludedTrackIds: Array\.from\(new Set/);
assert.match(smartPlaylistSource, /excludedTrackIds\.has\(track\.id\)/);
assert.match(localStorageSource, /window\.localStorage\.setItem\(key, JSON\.stringify\(resolvedValue\)\)/);
assert.match(musicLibraryDbSource, /savePlaylists\(playlists\)/);
assert.match(localTracksSource, /return nextMovedTrack/);
assert.match(localTracksSource, /createMovedTrackAddedAt/);
assert.match(localTracksSource, /orderTracksForReorder/);
assert.match(appSource, /const movedTrack = moveTrack\(fromIndex, toIndex, filteredTracks\.map/);
assert.match(appSource, /libraryDb\.putTrackMetadata\(movedTrack\)/);

console.log("playlist logic check passed");
