import assert from "node:assert/strict";
import {
  getTrackPrimaryText,
  getTrackSecondaryText,
} from "../src/utils/trackDisplay.ts";

const file = new File([], "10. This War of Mine Original Soundtrack.mp3", {
  type: "audio/mpeg",
});

const track = {
  id: "track-1",
  file,
  name: "10. This War of Mine Original Soundtrack",
  title: "Grzegorz Mazur",
  artist: "Piotr Musial",
  localUrl: "file:///tmp/10.mp3",
  liked: false,
  addedAt: 1,
};

assert.equal(getTrackPrimaryText(track), "10. This War of Mine Original Soundtrack.mp3");
assert.equal(getTrackSecondaryText(track), "Piotr Musial");
assert.equal(
  getTrackPrimaryText({ ...track, file: undefined, name: "", title: "Fallback title" }),
  "Fallback title",
);
assert.equal(getTrackSecondaryText({ ...track, artist: "" }), "未知歌手");

console.log("track-display-check PASS");
