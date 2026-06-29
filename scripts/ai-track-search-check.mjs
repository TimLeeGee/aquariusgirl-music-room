import assert from "node:assert/strict";
import {
  buildPlaylistRequestText,
  buildLibrarySummary,
  isDirectPlaylistRequest,
  isMusicRelatedRequest,
  isPlaylistTrackListRequest,
  isPlaylistConsent,
  isRandomPlaylistRequest,
  normalizeMusicSearchIntent,
  pickRandomTracksForAIPlaylist,
  searchLocalMusicLibrary,
  searchTracksForAIIntent,
} from "../src/utils/aiTrackSearch.ts";

const now = Date.now();
const tracks = [
  {
    id: "ado-1",
    name: "Ado - Quiet Night.mp3",
    title: "Quiet Night",
    artist: "Ado",
    album: "Blue",
    genre: "J-Pop",
    duration: 180,
    liked: true,
    addedAt: now,
    localUrl: "blob:local",
    sourcePath: "/Users/example/Music/Ado - Quiet Night.mp3",
    artworkUrl: "blob:cover",
  },
  {
    id: "work-1",
    name: "Focus Loop.mp3",
    title: "Focus Loop",
    artist: "Room",
    album: "Desk",
    genre: "Focus",
    duration: 1200,
    liked: false,
    addedAt: now - 1,
    localUrl: "blob:local",
  },
  {
    id: "sakura-1",
    name: "Sakurazaka46 - Start Over.mp3",
    title: "Start Over",
    artist: "櫻坂46",
    album: "Sakurazaka46",
    genre: "J-Pop",
    duration: 240,
    liked: false,
    addedAt: now - 2,
    localUrl: "blob:local",
    sourcePath: "/Users/example/Music/Sakurazaka46 - Start Over.mp3",
  },
];
const playlists = [{ id: "system-all", name: "全部歌曲", trackIds: ["ado-1"], createdAt: now, updatedAt: now, type: "system" }];
const summaryJson = JSON.stringify(buildLibrarySummary(tracks, playlists));

assert.equal(summaryJson.includes("sourcePath"), false);
assert.equal(summaryJson.includes("localUrl"), false);
assert.equal(summaryJson.includes("artworkUrl"), false);
assert.equal(summaryJson.includes("/Users/example"), false);
assert.equal(summaryJson.includes("Quiet Night"), false);
assert.equal(isDirectPlaylistRequest("建立46播放清單"), true);
assert.equal(isMusicRelatedRequest("想聽睡前安靜的歌"), true);
assert.equal(isPlaylistTrackListRequest("幫我列出剛剛建立的播放清單有哪些歌"), true);
assert.equal(isPlaylistConsent("好，可以幫我整理"), true);
assert.equal(isRandomPlaylistRequest("隨意建立播放清單"), true);
assert.equal(buildPlaylistRequestText("好"), "好");
assert.equal(pickRandomTracksForAIPlaylist(tracks, 2).length, 2);

const randomIntent = normalizeMusicSearchIntent({}, "隨便幫我建立一個播放清單");
assert.equal(randomIntent.intent, "random_playlist");
assert.equal(randomIntent.needMusicLibrarySearch, true);

const explainIntent = normalizeMusicSearchIntent({ intent: "explain" }, "這個按鈕怎麼用");
assert.equal(explainIntent.intent, "explain");

const guardedToolIntent = normalizeMusicSearchIntent({
  intent: "create_playlist",
  need_music_library_search: false,
  reply_level: "playlist_overview",
  allow_track_list_output: true,
  reply: "我幫你加入以下歌曲：A、B",
}, "建立櫻花46播放清單");
assert.equal(guardedToolIntent.needMusicLibrarySearch, true);
assert.equal(guardedToolIntent.skill, "createPlaylistFromSearch");
assert.equal(guardedToolIntent.replyLevel, "summary_only");
assert.equal(guardedToolIntent.allowTrackListOutput, false);
assert.equal(guardedToolIntent.reply, "");

const qwenJsonIntent = normalizeMusicSearchIntent({
  intent: "create_playlist",
  playlist_name: "櫻花46 播放清單",
  search_keywords: ["櫻花46"],
  search_fields: ["title", "artist", "album", "filename", "metadata", "path"],
  need_music_library_search: true,
});
assert.equal(qwenJsonIntent.intent, "create_playlist");
assert.equal(qwenJsonIntent.searchFields.includes("path"), true);
assert.equal(qwenJsonIntent.keywords.includes("櫻坂46"), true);

const adoIntent = normalizeMusicSearchIntent({
  playlistName: "Ado 小歌單",
  artistIncludes: ["Ado"],
  likedOnly: true,
  maxTotalMinutes: 30,
});
assert.deepEqual(searchTracksForAIIntent(tracks, adoIntent).map((item) => item.track.id), ["ado-1"]);

const calmIntent = normalizeMusicSearchIntent({
  keywords: ["安靜"],
  mood: "calm",
  maxTotalMinutes: 5,
});
assert.equal(searchTracksForAIIntent(tracks, calmIntent)[0].track.id, "ado-1");

const sakuraIntent = normalizeMusicSearchIntent({}, "建立櫻花46相關的播放清單");
assert.equal(sakuraIntent.playlistName, "櫻花46 播放清單");
assert.deepEqual(searchTracksForAIIntent(tracks, sakuraIntent).map((item) => item.track.id), ["sakura-1"]);
assert.deepEqual(
  searchLocalMusicLibrary(tracks, {
    keywords: ["example/Music/Sakurazaka46"],
    fields: ["path"],
  }).map((item) => item.track.id),
  ["sakura-1"],
);

const missingIntent = normalizeMusicSearchIntent({}, "建立不存在樂團播放清單");
assert.equal(searchTracksForAIIntent(tracks, missingIntent).length, 0);

console.log("AI track search check passed");
