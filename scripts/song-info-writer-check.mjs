import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createSongInfoDraftFromTagLib,
  createSongInfoWriterCoverHash,
  createTagLibLoadOptions,
  createTagInputFromSongInfoDraft,
  decodeCoverDataUrl,
  isWritableSongInfoPath,
  mapPropertiesToExtendedTag,
  resolvePackagedTagLibWasmUrl,
  readSongInfoFromOriginalFile,
  writeSongInfoToOriginalFile,
} from "../electron/songInfoWriter.ts";

const writerSource = await readFile(new URL("../electron/songInfoWriter.ts", import.meta.url), "utf8");
assert.doesNotMatch(writerSource, /copyWithTags/);
assert.doesNotMatch(writerSource, /taglib\.edit\(tempPath/);
assert.match(writerSource, /taglib\.open\(sourcePath,\s*\{\s*partial:\s*false\s*\}\)/s);
assert.match(writerSource, /audioFile\.saveToFile\(tempPath\)/);

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
assert.equal(createSongInfoWriterCoverHash(new Uint8Array([65, 66, 67])), "b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78");
assert.equal(
  decodeCoverDataUrl("data:image/jpg;base64,QUJD")?.mimeType,
  "image/jpeg",
);
assert.equal(
  decodeCoverDataUrl("data:;base64,QUJD", "image/jpeg")?.mimeType,
  "image/jpeg",
);
assert.equal(
  decodeCoverDataUrl("data:application/octet-stream;base64,QUJD", "image/png")?.mimeType,
  "image/png",
);
const cover01Sized = decodeCoverDataUrl(
  `data:image/jpeg;base64,${Buffer.alloc(4_342_414, 1).toString("base64")}`,
);
assert.equal(cover01Sized?.mimeType, "image/jpeg");
assert.equal(cover01Sized?.bytes.byteLength, 4_342_414);
assert.equal(decodeCoverDataUrl("data:image/gif;base64,AAAA"), undefined);
assert.equal(decodeCoverDataUrl("not-a-data-url"), undefined);

const originalWasmDir = process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR;
process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR = path.join(process.cwd(), "node_modules/taglib-wasm/dist");
const packagedWasmUrl = resolvePackagedTagLibWasmUrl();
const packagedWasmOptions = createTagLibLoadOptions();
assert.match(packagedWasmUrl ?? "", /taglib-web\.wasm$/);
assert.equal(packagedWasmOptions?.forceWasmType, "emscripten");
assert.equal(packagedWasmOptions?.wasmUrl, packagedWasmUrl);
if (originalWasmDir === undefined) {
  delete process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR;
} else {
  process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR = originalWasmDir;
}

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
  coverHash: "b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78",
});

const tagLibPropertyDraft = createSongInfoDraftFromTagLib(
  mapPropertiesToExtendedTag({
    TITLE: ["01. Plazma"],
    ARTIST: ["米津玄師"],
    ALBUM: ["Plazma / BOW AND ARROW"],
    ALBUMARTIST: ["Kenshi Yonezu"],
    DATE: ["2025-06-11"],
    GENRE: ["J-Pop"],
    TRACKNUMBER: ["1"],
    TRACKTOTAL: ["4"],
    DISCNUMBER: ["1"],
    DISCTOTAL: ["2"],
    COMPOSER: ["Kenshi Yonezu"],
    COMMENT: ["property map readback"],
  }),
);

assert.deepEqual(
  {
    title: tagLibPropertyDraft.title,
    artist: tagLibPropertyDraft.artist,
    album: tagLibPropertyDraft.album,
    albumArtist: tagLibPropertyDraft.albumArtist,
    year: tagLibPropertyDraft.year,
    genre: tagLibPropertyDraft.genre,
    track: tagLibPropertyDraft.track,
    disc: tagLibPropertyDraft.disc,
    composer: tagLibPropertyDraft.composer,
    comment: tagLibPropertyDraft.comment,
  },
  {
    title: "01. Plazma",
    artist: "米津玄師",
    album: "Plazma / BOW AND ARROW",
    albumArtist: "Kenshi Yonezu",
    year: "2025",
    genre: "J-Pop",
    track: "1/4",
    disc: "1/2",
    composer: "Kenshi Yonezu",
    comment: "property map readback",
  },
);

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
  const fixtureOriginalWasmDir = process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR;
  process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR = path.join(
    process.cwd(),
    "node_modules/taglib-wasm/dist",
  );
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
    assert.equal(written.ok, true);
    assert.equal(written.receivedCoverHash, undefined);

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
    assert.equal(
      cover02ReadBack.metadata?.coverHash,
      createSongInfoWriterCoverHash(decodeCoverDataUrl(cover02)?.bytes ?? new Uint8Array()),
    );

    await writeSongInfoToOriginalFile(copyPath, {
      ...cover02ReadBack.metadata,
      coverDataUrl: cover01,
      coverMimeType: "image/png",
    });
    const cover01ReadBack = await readSongInfoFromOriginalFile(copyPath);
    assert.equal(cover01ReadBack.metadata?.coverDataUrl, cover01);
    assert.equal(
      cover01ReadBack.metadata?.coverHash,
      createSongInfoWriterCoverHash(decodeCoverDataUrl(cover01)?.bytes ?? new Uint8Array()),
    );

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
      assert.equal(
        realCover02ReadBack.metadata?.coverHash,
        createSongInfoWriterCoverHash(decodeCoverDataUrl(realCover02)?.bytes ?? new Uint8Array()),
      );

      await writeSongInfoToOriginalFile(copyPath, {
        ...realCover02ReadBack.metadata,
        coverDataUrl: realCover01,
        coverMimeType: "image/jpeg",
      });
      const realCover01ReadBack = await readSongInfoFromOriginalFile(copyPath);
      assert.equal(realCover01ReadBack.metadata?.coverDataUrl, realCover01);
      assert.equal(
        realCover01ReadBack.metadata?.coverHash,
        createSongInfoWriterCoverHash(decodeCoverDataUrl(realCover01)?.bytes ?? new Uint8Array()),
      );

      await writeSongInfoToOriginalFile(copyPath, {
        ...realCover01ReadBack.metadata,
        coverDataUrl: realCover02,
        coverMimeType: "image/jpeg",
      });
      const realCover02SecondReadBack = await readSongInfoFromOriginalFile(copyPath);
      assert.equal(realCover02SecondReadBack.ok, true);
      assert.equal(realCover02SecondReadBack.metadata?.title, "Original write title");
      assert.equal(realCover02SecondReadBack.metadata?.artist, "Original write artist");
      assert.equal(realCover02SecondReadBack.metadata?.album, "Original write album");
      assert.equal(realCover02SecondReadBack.metadata?.coverDataUrl, realCover02);
      assert.equal(
        realCover02SecondReadBack.metadata?.coverHash,
        createSongInfoWriterCoverHash(decodeCoverDataUrl(realCover02)?.bytes ?? new Uint8Array()),
      );
    }
  } finally {
    if (fixtureOriginalWasmDir === undefined) {
      delete process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR;
    } else {
      process.env.AQUARIUSGIRL_TAGLIB_WASM_DIR = fixtureOriginalWasmDir;
    }
    await rm(tempDir, { recursive: true, force: true });
  }
}

console.log("song-info-writer-check PASS");
