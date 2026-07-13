import assert from "node:assert/strict";
import { appendTrackIds, createNormalPlaylist } from "../src/utils/playlistBatch.ts";

assert.deepEqual(appendTrackIds(["before"], ["first", "first", "last"]), [
  "before",
  "first",
  "first",
  "last",
]);
assert.equal(appendTrackIds(["before"], []).length, 1);

const playlist = createNormalPlaylist("批次清單", ["first", "first", "last"], 123);
assert.deepEqual(playlist.trackIds, ["first", "first", "last"]);
assert.equal(playlist.createdAt, 123);
assert.equal(playlist.updatedAt, 123);

console.log("playlist-batch-check PASS");
