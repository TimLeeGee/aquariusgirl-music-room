import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createSongInfoDraftFromTagLib,
  createTagInputFromSongInfoDraft,
  decodeCoverDataUrl,
  isWritableSongInfoPath,
  readSongInfoFromOriginalFile,
  writeSongInfoToOriginalFile,
} from "../electron/songInfoWriter.ts";

const tagInput = createTagInputFromSongInfoDraft({
  title: "  New title  ",
  artist: " Artist ",
  album: " Album ",
  albumArtist: " Album artist ",
  year: "2026",
  genre: "Pop",
  track: "3/12",
  disc: "1/2",
  comment: " Comment ",
  composer: " Composer ",
});

assert.deepEqual(tagInput, {
  title: "New title",
  artist: "Artist",
  album: "Album",
  albumArtist: "Album artist",
  date: "2026",
  genre: "Pop",
  track: 3,
  totalTracks: 12,
  discNumber: 1,
  totalDiscs: 2,
  comment: "Comment",
  composer: "Composer",
});

const cover = decodeCoverDataUrl("data:image/png;base64,QUJD");
assert.equal(cover?.mimeType, "image/png");
assert.deepEqual(Array.from(cover?.bytes ?? []), [65, 66, 67]);
const cover01Sized = decodeCoverDataUrl(
  `data:image/jpeg;base64,${Buffer.alloc(4_342_414, 1).toString("base64")}`,
);
assert.equal(cover01Sized?.mimeType, "image/jpeg");
assert.equal(cover01Sized?.bytes.byteLength, 4_342_414);
assert.equal(decodeCoverDataUrl("data:image/gif;base64,AAAA"), undefined);
assert.equal(decodeCoverDataUrl("not-a-data-url"), undefined);

const draft = createSongInfoDraftFromTagLib(
  {
    title: ["Read title"],
    artist: ["Read artist"],
    album: ["Read album"],
    albumArtist: ["Read album artist"],
    date: ["2026-07-02"],
    genre: ["Read genre"],
    track: 4,
    totalTracks: 10,
    discNumber: 2,
    totalDiscs: 3,
    comment: ["Read comment"],
    composer: ["Read composer"],
  },
  [
    {
      type: "FrontCover",
      mimeType: "image/jpeg",
      data: new Uint8Array([65, 66, 67]),
    },
  ],
);

assert.deepEqual(draft, {
  title: "Read title",
  artist: "Read artist",
  album: "Read album",
  albumArtist: "Read album artist",
  year: "2026",
  genre: "Read genre",
  track: "4/10",
  disc: "2/3",
  comment: "Read comment",
  composer: "Read composer",
  coverDataUrl: "data:image/jpeg;base64,QUJD",
  coverMimeType: "image/jpeg",
});

assert.equal(isWritableSongInfoPath("/tmp/song.mp3"), true);
assert.equal(isWritableSongInfoPath("/tmp/song.flac"), true);
assert.equal(isWritableSongInfoPath("/tmp/song.m4a"), true);
assert.equal(isWritableSongInfoPath("/tmp/song.wav"), false);

const fixturePath = process.env.SONG_INFO_FIXTURE_PATH;
const cover01 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
const cover02 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mM8/x8AAuMBrpWq5z8AAAAASUVORK5CYII=";
async function readCoverDataUrl(filePath) {
  const mimeType = path.extname(filePath).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
  const bytes = await readFile(filePath);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

if (fixturePath) {
  assert.equal(isWritableSongInfoPath(fixturePath), true);
  const tempDir = await mkdtemp(path.join(tmpdir(), "aquariusgirl-song-info-"));
  const copyPath = path.join(
    tempDir,
    `song-info-fixture${path.extname(fixturePath) || ".mp3"}`,
  );

  try {
    await copyFile(fixturePath, copyPath);

    const written = await writeSongInfoToOriginalFile(copyPath, {
      title: "Original write title",
      artist: "Original write artist",
      album: "Original write album",
      year: "2026",
      track: "7/9",
    });
    assert.deepEqual(written, { ok: true });

    const readBack = await readSongInfoFromOriginalFile(copyPath);
    assert.equal(readBack.ok, true);
    assert.equal(readBack.metadata?.title, "Original write title");
    assert.equal(readBack.metadata?.artist, "Original write artist");
    assert.equal(readBack.metadata?.album, "Original write album");
    assert.equal(readBack.metadata?.track.split("/")[0], "7");

    await writeSongInfoToOriginalFile(copyPath, {
      ...readBack.metadata,
      coverDataUrl: cover02,
      coverMimeType: "image/png",
    });
    const cover02ReadBack = await readSongInfoFromOriginalFile(copyPath);
    assert.equal(cover02ReadBack.metadata?.coverDataUrl, cover02);

    await writeSongInfoToOriginalFile(copyPath, {
      ...cover02ReadBack.metadata,
      coverDataUrl: cover01,
      coverMimeType: "image/png",
    });
    const cover01ReadBack = await readSongInfoFromOriginalFile(copyPath);
    assert.equal(cover01ReadBack.metadata?.coverDataUrl, cover01);

    const fixtureDir = path.dirname(fixturePath);
    const realCover01Path =
      process.env.SONG_INFO_COVER01_PATH ?? path.join(fixtureDir, "Cover 01.jpg");
    const realCover02Path =
      process.env.SONG_INFO_COVER02_PATH ?? path.join(fixtureDir, "Cover 02.jpg");
    const realCover01 = await readCoverDataUrl(realCover01Path).catch(() => "");
    const realCover02 = await readCoverDataUrl(realCover02Path).catch(() => "");

    if (realCover01 && realCover02) {
      await writeSongInfoToOriginalFile(copyPath, {
        ...cover01ReadBack.metadata,
        coverDataUrl: realCover02,
        coverMimeType: "image/jpeg",
      });
      const realCover02ReadBack = await readSongInfoFromOriginalFile(copyPath);
      assert.equal(realCover02ReadBack.metadata?.coverDataUrl, realCover02);

      await writeSongInfoToOriginalFile(copyPath, {
        ...realCover02ReadBack.metadata,
        coverDataUrl: realCover01,
        coverMimeType: "image/jpeg",
      });
      const realCover01ReadBack = await readSongInfoFromOriginalFile(copyPath);
      assert.equal(realCover01ReadBack.metadata?.coverDataUrl, realCover01);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

console.log("song-info-writer-check PASS");
