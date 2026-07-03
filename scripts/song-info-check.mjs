import assert from "node:assert/strict";
import {
  MAX_SONG_COVER_BYTES,
  getSongCoverFileValidationError,
  isSupportedOriginalWriteFormat,
  isSupportedSongCoverFile,
  normalizeSongInfoDraft,
  validateSongInfoDraft,
} from "../src/utils/songInfo.ts";

const draft = normalizeSongInfoDraft({
  title: "  New title  ",
  artist: "  New artist  ",
  album: "  New album  ",
  albumArtist: "  New album artist  ",
  year: "2026",
  genre: " Pop ",
  track: " 3/12 ",
  disc: " 1/2 ",
  composer: " Composer ",
  comment: " Comment ",
  coverDataUrl: "data:image/png;base64,AAAA",
  coverMimeType: "image/png",
});

assert.deepEqual(validateSongInfoDraft(draft), []);
assert.equal(draft.title, "New title");
assert.equal(draft.albumArtist, "New album artist");
assert.equal(draft.track, "3/12");
assert.equal(draft.disc, "1/2");

assert.deepEqual(validateSongInfoDraft({ ...draft, title: "" }), ["標題不能空白。"]);
assert.deepEqual(validateSongInfoDraft({ ...draft, year: "20xx" }), ["年份請輸入 4 位數年份。"]);
assert.deepEqual(validateSongInfoDraft({ ...draft, track: "A/12", disc: "1/B" }), [
  "曲目請輸入數字，或使用 1/12 這種格式。",
  "光碟請輸入數字，或使用 1/2 這種格式。",
]);

assert.equal(
  isSupportedSongCoverFile({ name: "cover.jpg", type: "image/jpeg", size: MAX_SONG_COVER_BYTES }),
  true,
);
assert.equal(
  isSupportedSongCoverFile({ name: "Cover 01.jpg", type: "image/jpeg", size: 4_342_414 }),
  true,
);
assert.equal(
  isSupportedSongCoverFile({ name: "cover.gif", type: "image/gif", size: 1024 }),
  false,
);
assert.equal(
  isSupportedSongCoverFile({ name: "cover.png", type: "image/png", size: MAX_SONG_COVER_BYTES + 1 }),
  false,
);
assert.equal(
  getSongCoverFileValidationError({
    name: "huge-cover.jpg",
    type: "image/jpeg",
    size: MAX_SONG_COVER_BYTES + 1,
  }),
  "封面圖片太大，請選擇 5 MB 以內的 JPG / PNG。",
);
assert.equal(
  getSongCoverFileValidationError({ name: "cover.gif", type: "image/gif", size: 1024 }),
  "封面只支援 JPG / PNG。",
);

assert.equal(isSupportedOriginalWriteFormat("song.mp3"), true);
assert.equal(isSupportedOriginalWriteFormat("song.flac"), true);
assert.equal(isSupportedOriginalWriteFormat("song.m4a"), true);
assert.equal(isSupportedOriginalWriteFormat("song.wav"), false);

console.log("song-info-check PASS");
