import assert from "node:assert/strict";
import { parseAudioTags } from "../src/utils/id3Tags.ts";

const uint32 = (value) => {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value);
  return bytes;
};
const image = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const mime = Buffer.from("image/png");
const picture = Buffer.concat([
  uint32(3),
  uint32(mime.length),
  mime,
  uint32(0),
  uint32(1),
  uint32(1),
  uint32(32),
  uint32(0),
  uint32(image.length),
  image,
]);
const blockHeader = Buffer.from([
  0x86,
  (picture.length >>> 16) & 0xff,
  (picture.length >>> 8) & 0xff,
  picture.length & 0xff,
]);
const file = new File([Buffer.from("fLaC"), blockHeader, picture], "cover.flac", {
  type: "audio/flac",
});
const tags = await parseAudioTags(file);

assert.equal(tags.coverMimeType, "image/png");
assert.equal(tags.coverBlob?.size, image.length);
assert.deepEqual(Buffer.from(await tags.coverBlob.arrayBuffer()), image);
console.log("FLAC metadata check passed");
