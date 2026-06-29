import type {
  AITrackCandidate,
  MusicSearchField,
  MusicSearchIntent,
  MusicToolIntent,
  ReplyLevel,
} from "../utils/aiTrackSearch";

export type AiSkillId =
  | "normalChat"
  | "searchMusicLibrary"
  | "createPlaylistFromSearch"
  | "createRandomPlaylist"
  | "addTracksToPlaylist"
  | "removeTracksFromPlaylist"
  | "explainUi"
  | "unknown";

export type SkillPlan = {
  intent: MusicToolIntent;
  skill: AiSkillId;
  playlist_name: string;
  target_playlist_name: string;
  search_keywords: string[];
  search_fields: MusicSearchField[];
  need_music_library_search: boolean;
  reply_level: ReplyLevel;
  allow_track_list_output: boolean;
  reply: string;
};

export type SkillResult = {
  ok: boolean;
  skill: AiSkillId;
  message: string;
  tracks: AITrackCandidate[];
  trackCount?: number;
  playlist: { name: string; trackCount: number } | null;
  error: string | null;
  query?: string;
  reply_level?: ReplyLevel;
  allow_track_list_output?: boolean;
};

export type AiSkill = {
  id: AiSkillId;
  description: string;
  intents: MusicToolIntent[];
  needsMusicLibrary: boolean;
};

export const aiSkills: AiSkill[] = [
  {
    id: "normalChat",
    description: "一般聊天，只使用 character prompt。",
    intents: ["chat"],
    needsMusicLibrary: false,
  },
  {
    id: "searchMusicLibrary",
    description: "搜尋目前已載入的本機音樂 metadata。",
    intents: ["search_music"],
    needsMusicLibrary: true,
  },
  {
    id: "createPlaylistFromSearch",
    description: "用本機搜尋結果建立一般播放清單。",
    intents: ["create_playlist"],
    needsMusicLibrary: true,
  },
  {
    id: "createRandomPlaylist",
    description: "從目前 tracks 隨機抽樣建立播放清單。",
    intents: ["random_playlist"],
    needsMusicLibrary: true,
  },
  {
    id: "addTracksToPlaylist",
    description: "把本機搜尋結果加入既有一般播放清單。",
    intents: ["add_to_playlist"],
    needsMusicLibrary: true,
  },
  {
    id: "removeTracksFromPlaylist",
    description: "只從播放清單移除項目，不刪除本機音樂檔。",
    intents: ["remove_from_playlist"],
    needsMusicLibrary: true,
  },
  {
    id: "explainUi",
    description: "解釋播放器 UI 或功能。",
    intents: ["explain"],
    needsMusicLibrary: false,
  },
];

export function getSkillForIntent(intent: MusicToolIntent): AiSkill {
  return aiSkills.find((skill) => skill.intents.includes(intent)) ?? {
    id: "unknown",
    description: "無法判斷的請求。",
    intents: ["unknown"],
    needsMusicLibrary: false,
  };
}

export function createSkillPlan(intent: MusicSearchIntent): SkillPlan {
  const skill = getSkillForIntent(intent.intent);

  return {
    intent: intent.intent,
    skill: skill.id,
    playlist_name: intent.playlistName,
    target_playlist_name: intent.targetPlaylistName,
    search_keywords: intent.keywords,
    search_fields: intent.searchFields,
    need_music_library_search: intent.needMusicLibrarySearch || skill.needsMusicLibrary,
    reply_level: intent.replyLevel,
    allow_track_list_output: intent.allowTrackListOutput,
    reply: intent.reply,
  };
}
