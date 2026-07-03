import assert from "node:assert/strict";
import {
  createFileSignature,
  createSafeTrackId,
} from "../src/utils/audioFiles.ts";

function sourcePathFile({ size, lastModified }) {
  const file = new File([], "10. This War.mp3", {
    type: "audio/mpeg",
    lastModified,
  });
  Object.defineProperty(file, "sourcePath", {
    value: "/Users/example/Music/10. This War.mp3",
    configurable: true,
  });
  Object.defineProperty(file, "sourceSize", {
    value: size,
    configurable: true,
  });
  return file;
}

const beforeCoverWrite = sourcePathFile({ size: 1024, lastModified: 1000 });
const afterCoverWrite = sourcePathFile({ size: 2048, lastModified: 2000 });

assert.equal(createSafeTrackId(beforeCoverWrite), createSafeTrackId(afterCoverWrite));
assert.equal(createFileSignature(beforeCoverWrite), createFileSignature(afterCoverWrite));

const browserFileA = new File([new Uint8Array(1)], "song.mp3", { lastModified: 1000 });
const browserFileB = new File([new Uint8Array(2)], "song.mp3", { lastModified: 2000 });

assert.notEqual(createSafeTrackId(browserFileA), createSafeTrackId(browserFileB));
assert.notEqual(createFileSignature(browserFileA), createFileSignature(browserFileB));

console.log("track-identity-check PASS");
