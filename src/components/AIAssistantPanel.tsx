import { ChevronDown, Plus, Send, Sparkles, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NormalPlaylist } from "../types/playlist";
import type { Track } from "../types/track";
import { routeAiIntent } from "../ai/intentRouter";
import {
  composeSearchingMessage,
  composeSkillResult,
  safePlaylistNotFoundReply,
  sanitizeSkillReply,
  toSafeSkillReplyInput,
} from "../ai/responseComposer";
import { createSkillPlan, type SkillResult } from "../ai/skillRegistry";
import { useLocalAI } from "../hooks/useLocalAI";
import {
  buildLibrarySummary,
  buildPlaylistRequestText,
  isMusicRelatedRequest,
  isPlaylistTrackListRequest,
  isPlaylistConsent,
  isRandomPlaylistRequest,
  pickRandomTracksForAIPlaylist,
  searchTracksForAIIntent,
  shouldSkipModelRouter,
  type AITrackCandidate,
} from "../utils/aiTrackSearch";
import {
  buildFixDraftPatch,
  composeScanSummaryText,
  filterTracksByFolder,
  isMetadataFixIntent,
  listTrackFolders,
  scanMetadata,
  type MetadataScanReport,
  type TrackFixPlan,
} from "../utils/metadataFix";
import type { SongInfoDraft } from "../utils/songInfo";
import { applyName, useText } from "../config/textOverrides";

export type AIPlaylistCreateDetails = {
  requestText: string;
  searchMethod: "隨機" | "關鍵字 / metadata";
  intent: string;
  candidates: AITrackCandidate[];
};

export type AIPlaylistCreateResult =
  | { ok: true; name: string; count: number }
  | { ok: false; error: string };

export type AIPlaylistAddResult =
  | { ok: true; name: string; count: number }
  | { ok: false; error: string };

type AIAssistantPanelProps = {
  tracks: Track[];
  playlists?: NormalPlaylist[];
  embedded?: boolean;
  onCreatePlaylist: (
    name: string,
    trackIds: string[],
    details: AIPlaylistCreateDetails,
  ) => AIPlaylistCreateResult;
  onAddTracksToPlaylist?: (
    playlistName: string,
    trackIds: string[],
  ) => AIPlaylistAddResult;
  // 0.1.45 B2: 歌曲資訊補全——寫回走 App 的 handleApplySongInfoToOriginal 管線。
  onApplyMetadataFix?: (
    trackId: string,
    patch: Partial<SongInfoDraft>,
  ) => Promise<boolean>;
  onEditSongInfo?: (trackId: string, patch: Partial<SongInfoDraft>) => void;
  onRestoreMetadataFix?: () => Promise<{ restored: number; failed: number } | null>;
};

type FixStats = { applied: number; manual: number; skipped: number; failed: number };

const emptyFixStats: FixStats = { applied: 0, manual: 0, skipped: 0, failed: 0 };

// 0.1.46 Feature A: 空狀態快捷指令氣泡——只列真實支援的指令，點擊帶預設字串送出。
const quickPrompts: Array<{ label: string; prompt: string; requiresModel?: boolean; prefill?: boolean }> = [
  { label: "🩺 檢查歌曲資訊", prompt: "檢查歌曲資訊" },
  { label: "🔀 隨機一份清單", prompt: "幫我隨機建立一份播放清單" },
  // 0.1.47 P1：搜尋需要主題，預填輸入框讓使用者自己打，不直接送出（避免把「搜尋」整句當關鍵字）。
  { label: "🔍 搜尋音樂庫", prompt: "幫我找 ", prefill: true },
  { label: "💬 跟我聊聊", prompt: "你好，可以陪我聊聊嗎？", requiresModel: true },
];

function defaultFixChecks(plan: TrackFixPlan | undefined) {
  return Object.fromEntries((plan?.suggestions ?? []).map((item) => [item.field, true]));
}

type PlaylistDraft = {
  name: string;
  candidates: AITrackCandidate[];
  requestText: string;
  searchMethod: AIPlaylistCreateDetails["searchMethod"];
  intent: string;
};

export function AIAssistantPanel({
  tracks,
  playlists = [],
  embedded = false,
  onCreatePlaylist,
  onAddTracksToPlaylist,
  onApplyMetadataFix,
  onEditSongInfo,
  onRestoreMetadataFix,
}: AIAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [hasRequestedInit, setHasRequestedInit] = useState(false);
  const [draft, setDraft] = useState("");
  const [pendingPlaylistText, setPendingPlaylistText] = useState("");
  const [playlistBusy, setPlaylistBusy] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [playlistDraft, setPlaylistDraft] = useState<PlaylistDraft | null>(null);
  const [playlistResult, setPlaylistResult] = useState("");
  const [fixReport, setFixReport] = useState<MetadataScanReport | null>(null);
  const [fixQueue, setFixQueue] = useState<TrackFixPlan[]>([]);
  const [fixIndex, setFixIndex] = useState(0);
  const [fixChecks, setFixChecks] = useState<Record<string, boolean>>({});
  const [fixStats, setFixStats] = useState<FixStats>(emptyFixStats);
  const [fixBusy, setFixBusy] = useState(false);
  const [fixSummary, setFixSummary] = useState<FixStats | null>(null);
  const [scanFolder, setScanFolder] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [showNonWritable, setShowNonWritable] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const ai = useLocalAI();
  const aiPanelTitle = useText("aiPanelTitle");
  const aiGreeting = useText("aiGreeting");
  const aiInputPlaceholder = useText("aiInputPlaceholder");
  const folderOptions = useMemo(() => listTrackFolders(tracks), [tracks]);
  const isOpen = embedded || open;

  const publishSkillResult = useCallback(async (result: SkillResult) => {
    const fallback = composeSkillResult(result);
    setPlaylistResult(fallback);
    if (!ai.isModelReady) return;

    const reply = await ai.composeToolReply(toSafeSkillReplyInput(result), fallback);
    if (reply.ok && reply.text.trim()) {
      setPlaylistResult(sanitizeSkillReply(reply.text, result, fallback));
    }
  }, [ai]);

  const scrollAiChatToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = chatContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
        return;
      }
      chatEndRef.current?.scrollIntoView({ block: "end" });
    });
  }, []);

  useEffect(() => {
    if (isOpen && !hasRequestedInit && !ai.isModelReady && !ai.isModelLoading) {
      setHasRequestedInit(true);
      void ai.initAI();
    }
  }, [ai, hasRequestedInit, isOpen]);

  useEffect(() => {
    if (isOpen) scrollAiChatToBottom();
  }, [
    ai.isGenerating,
    ai.messages,
    fixBusy,
    fixIndex,
    fixQueue,
    fixReport,
    fixSummary,
    isOpen,
    pendingPlaylistText,
    playlistBusy,
    playlistDraft,
    playlistError,
    playlistResult,
    scrollAiChatToBottom,
  ]);

  const resolveMusicIntent = async (requestText: string) => {
    const fallbackIntent = routeAiIntent(requestText);
    // 0.1.45 A1: 規則信心高就直接用，跳過 LLM router（更快、避免 0.8B 輸出偏移）。
    if (shouldSkipModelRouter(fallbackIntent)) return fallbackIntent;
    if (!ai.isModelReady) return fallbackIntent;

    const result = await ai.parseMusicSearchIntent(
      requestText,
      buildLibrarySummary(tracks, playlists),
    );
    return result.ok ? routeAiIntent(requestText, result.intent) : fallbackIntent;
  };

  const createPlaylistFromDraft = async (nextDraft: PlaylistDraft) => {
    if (nextDraft.candidates.length === 0) return;
    setPlaylistBusy(true);
    setPlaylistError("");
    const validTrackIds = new Set(tracks.map((track) => track.id));
    const candidates = nextDraft.candidates.filter((candidate) =>
      validTrackIds.has(candidate.track.id),
    );

    try {
      if (candidates.length === 0) {
        setPlaylistError("目前載入的歌曲裡找不到符合條件的歌曲。");
        return;
      }

      const result = onCreatePlaylist(
        nextDraft.name,
        candidates.map((candidate) => candidate.track.id),
        {
          requestText: nextDraft.requestText,
          searchMethod: nextDraft.searchMethod,
          intent: nextDraft.intent,
          candidates,
        },
      );
      if (!result.ok) {
        setPlaylistError(result.error);
        return;
      }
      await publishSkillResult({
        ok: true,
        skill: "createPlaylistFromSearch",
        message: "",
        tracks: candidates,
        playlist: { name: result.name, trackCount: result.count },
        error: null,
        reply_level: "summary_only",
        allow_track_list_output: false,
      });
      setPlaylistDraft(null);
      setPendingPlaylistText("");
    } finally {
      setPlaylistBusy(false);
    }
  };

  const runMusicLibrarySearch = async (
    sourceText: string,
    options: { autoCreate: boolean; showDraft?: boolean },
  ) => {
    const requestText = sourceText.trim();
    if (!requestText) return;
    if (tracks.length === 0) {
      setPlaylistError(applyName("請先載入音樂，再讓{name}整理播放清單。"));
      setPlaylistDraft(null);
      setPlaylistResult("");
      return;
    }

    setPlaylistBusy(true);
    setPlaylistError("");
    setPlaylistResult("");
    setPlaylistDraft(null);

    try {
      const intent = isRandomPlaylistRequest(requestText)
        ? routeAiIntent(requestText, { intent: "random_playlist", playlist_name: "隨機播放清單" })
        : await resolveMusicIntent(requestText);
      const plan = createSkillPlan(intent);
      const random = plan.skill === "createRandomPlaylist";
      const searchMethod = random ? "隨機" : "關鍵字 / metadata";

      // 0.1.47 P1：剝除指令詞後沒有實質關鍵字（例如「搜尋我的音樂庫」）→ 先問要找什麼，不硬搜。
      if (!random && plan.search_keywords.length === 0) {
        ai.appendLocalMessages([{
          role: "assistant",
          content: "要找什麼呢？可以說歌手、關鍵字或心情，例如「找周杰倫」「找輕快的歌」。",
        }]);
        return;
      }

      ai.appendLocalMessages([{
        role: "assistant",
        content: random
          ? "正在從本機音樂庫隨機挑歌。"
          : composeSearchingMessage(plan.search_keywords),
      }]);

      const candidates = random
        ? pickRandomTracksForAIPlaylist(tracks)
        : searchTracksForAIIntent(tracks, intent);

      if (candidates.length === 0) {
        setPendingPlaylistText("");
        setPlaylistError(safePlaylistNotFoundReply({ query: requestText }));
        return;
      }

      const nextDraft: PlaylistDraft = {
        name: random ? applyName("{name}隨機歌單") : intent.playlistName,
        candidates,
        requestText,
        searchMethod,
        intent: random ? "random_playlist" : `${plan.skill}: ${plan.search_keywords.join(", ")}`,
      };

      if (plan.skill === "removeTracksFromPlaylist") {
        await publishSkillResult({
          ok: true,
          skill: "removeTracksFromPlaylist",
          message: "為避免誤移除，請在目標歌單中逐首移除；這只會移出播放清單，不會刪除本機音樂檔。",
          tracks: candidates,
          playlist: null,
          error: null,
          reply_level: "summary_only",
          allow_track_list_output: false,
        });
        return;
      }

      if (plan.skill === "addTracksToPlaylist") {
        if (!onAddTracksToPlaylist || !intent.targetPlaylistName) {
          await publishSkillResult({
            ok: true,
            skill: "addTracksToPlaylist",
            message: "請指定要加入的既有歌單名稱。",
            tracks: candidates,
            playlist: null,
            error: null,
            reply_level: "summary_only",
            allow_track_list_output: false,
          });
          return;
        }

        const result = onAddTracksToPlaylist(
          intent.targetPlaylistName,
          candidates.map((candidate) => candidate.track.id),
        );
        if (!result.ok) {
          setPlaylistError(result.error);
          return;
        }
        await publishSkillResult({
          ok: true,
          skill: "addTracksToPlaylist",
          message: `已加入「${result.name}」，共 ${result.count} 首。`,
          tracks: candidates,
          playlist: { name: result.name, trackCount: result.count },
          error: null,
          reply_level: "summary_only",
          allow_track_list_output: false,
        });
        return;
      }

      if (
        options.autoCreate ||
        plan.skill === "createPlaylistFromSearch" ||
        plan.skill === "createRandomPlaylist"
      ) {
        await createPlaylistFromDraft(nextDraft);
        return;
      }

      if (options.showDraft) {
        setPlaylistDraft(nextDraft);
        return;
      }

      setPendingPlaylistText(requestText);
      await publishSkillResult({
        ok: true,
        skill: "searchMusicLibrary",
        message: `要建立「${nextDraft.name}」嗎？`,
        tracks: candidates,
        playlist: null,
        error: null,
        reply_level: "summary_only",
        allow_track_list_output: false,
      });
    } finally {
      setPlaylistBusy(false);
    }
  };

  const applyScanReport = (folder: string) => {
    const report = scanMetadata(filterTracksByFolder(tracks, folder));
    setFixSummary(null);
    setFixQueue([]);
    setFixIndex(0);
    setFixStats(emptyFixStats);
    setShowManual(false);
    setShowNonWritable(false);
    setFixReport(report.total > 0 ? report : null);
    return report;
  };

  const runMetadataScan = (requestText: string) => {
    setScanFolder("");
    const report = applyScanReport("");
    ai.appendLocalMessages([
      { role: "user", content: requestText },
      { role: "assistant", content: composeScanSummaryText(report) },
    ]);
  };

  // 0.1.47 P2：報告卡切換資料夾範圍，只更新報告、不再洗一輪對話訊息。
  const rescanFolder = (folder: string) => {
    setScanFolder(folder);
    applyScanReport(folder);
  };

  const startMetadataFix = () => {
    if (!fixReport || fixReport.plans.length === 0) return;
    setFixQueue(fixReport.plans);
    setFixIndex(0);
    setFixChecks(defaultFixChecks(fixReport.plans[0]));
    setFixStats(emptyFixStats);
    setFixSummary(null);
    setFixReport(null);
  };

  const advanceMetadataFix = (nextStats: FixStats) => {
    setFixStats(nextStats);
    const nextIndex = fixIndex + 1;
    if (nextIndex >= fixQueue.length) {
      setFixSummary(nextStats);
      setFixQueue([]);
      setFixIndex(0);
      return;
    }
    setFixIndex(nextIndex);
    setFixChecks(defaultFixChecks(fixQueue[nextIndex]));
  };

  const applyCurrentFix = async () => {
    const plan = fixQueue[fixIndex];
    if (!plan || fixBusy || !onApplyMetadataFix) return;

    const patch = buildFixDraftPatch(plan.suggestions, fixChecks);
    if (Object.keys(patch).length === 0) {
      advanceMetadataFix({ ...fixStats, skipped: fixStats.skipped + 1 });
      return;
    }

    setFixBusy(true);
    try {
      const ok = await onApplyMetadataFix(plan.trackId, patch);
      advanceMetadataFix(
        ok
          ? { ...fixStats, applied: fixStats.applied + 1 }
          : { ...fixStats, failed: fixStats.failed + 1 },
      );
    } finally {
      setFixBusy(false);
    }
  };

  const editCurrentFix = () => {
    const plan = fixQueue[fixIndex];
    if (!plan || fixBusy || !onEditSongInfo) return;
    onEditSongInfo(plan.trackId, buildFixDraftPatch(plan.suggestions, fixChecks));
    advanceMetadataFix({ ...fixStats, manual: fixStats.manual + 1 });
  };

  const skipCurrentFix = () => {
    if (fixBusy) return;
    advanceMetadataFix({ ...fixStats, skipped: fixStats.skipped + 1 });
  };

  const cancelMetadataFix = () => {
    if (fixBusy) return;
    setFixSummary(fixStats);
    setFixQueue([]);
    setFixIndex(0);
  };

  const restoreMetadataFix = async () => {
    if (!onRestoreMetadataFix || fixBusy) return;
    setFixBusy(true);
    try {
      const result = await onRestoreMetadataFix();
      if (result) {
        ai.appendLocalMessages([
          {
            role: "assistant",
            content: `復原完成：成功還原 ${result.restored} 首${result.failed > 0 ? `、失敗 ${result.failed} 首` : ""}。`,
          },
        ]);
        setFixSummary(null);
      }
    } finally {
      setFixBusy(false);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? draft).trim();
    if (!text || playlistBusy) return;
    setDraft("");
    setPlaylistError("");
    setPlaylistResult("");

    // 0.1.45 B1: 歌曲資訊健檢——關鍵字規則判斷，不經 LLM；需在歌單邏輯之前（「整理」撞字）。
    if (isMetadataFixIntent(text)) {
      runMetadataScan(text);
      return;
    }

    if (isPlaylistTrackListRequest(text)) {
      ai.appendLocalMessages([
        { role: "user", content: text },
        {
          role: "assistant",
          content: "歌曲清單請看播放清單區塊，會依本機 playlist.trackIds 顯示。",
        },
      ]);
      return;
    }

    if (pendingPlaylistText && isPlaylistConsent(text)) {
      ai.appendLocalMessages([{ role: "user", content: text }]);
      await runMusicLibrarySearch(pendingPlaylistText, { autoCreate: true });
      return;
    }

    const requestText = buildPlaylistRequestText(text);
    const fallbackIntent = routeAiIntent(requestText);
    const shouldUseLocalMusic =
      fallbackIntent.needMusicLibrarySearch ||
      isMusicRelatedRequest(requestText);

    if (shouldUseLocalMusic) {
      ai.appendLocalMessages([{ role: "user", content: text }]);
      await runMusicLibrarySearch(requestText, {
        autoCreate: fallbackIntent.intent === "create_playlist" ||
          fallbackIntent.intent === "random_playlist" ||
          isRandomPlaylistRequest(requestText),
      });
      return;
    }

    await ai.sendMessage(text);
  };

  const handleCreatePlaylist = () => {
    if (!playlistDraft || playlistBusy) return;
    void createPlaylistFromDraft(playlistDraft);
  };

  const panelBody = (
    <>
      {!ai.isModelReady && (
        <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-aquarius-mist">
          {ai.isModelLoading
            ? "首次使用正在載入本機 AI 模型，本機音樂庫搜尋仍可使用。"
            : ai.aiError || "AI 尚未啟動；本機音樂庫搜尋仍可使用。"}
        </div>
      )}

      <div
        ref={chatContainerRef}
        className={`flex min-h-32 flex-col gap-3 overflow-y-auto rounded-lg border border-white/10 bg-black/15 p-3 ${
          fixQueue.length > 0 ? "max-h-96" : "max-h-64"
        }`}
      >
        {ai.messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-aquarius-mist">{aiGreeting}</p>
            {!playlistBusy && !playlistDraft && !pendingPlaylistText && fixQueue.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {quickPrompts
                  .filter((item) => !item.requiresModel || ai.isModelReady)
                  .map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.prefill) {
                          setDraft(item.prompt);
                          inputRef.current?.focus();
                        } else {
                          void handleSend(item.prompt);
                        }
                      }}
                      disabled={playlistBusy}
                      className="rounded-full border border-aquarius-blue/30 bg-aquarius-blue/[0.12] px-3 py-1.5 text-xs font-bold text-aquarius-blue transition hover:bg-aquarius-blue/25 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
        {ai.messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
              message.role === "user"
                ? "ml-auto bg-aquarius-blue/25 text-white"
                : "mr-auto bg-white/[0.08] text-aquarius-mist"
            }`}
          >
            {message.content || "…"}
          </div>
        ))}
        {pendingPlaylistText && !playlistDraft && !playlistError && (
          <div className="mr-auto max-w-[88%] rounded-lg border border-aquarius-blue/25 bg-aquarius-blue/10 px-3 py-2 text-sm text-aquarius-mist">
            <p className="font-semibold text-white">要我用找到的本機歌曲建立播放清單嗎？</p>
            <button
              type="button"
              onClick={() => void runMusicLibrarySearch(pendingPlaylistText, {
                autoCreate: false,
                showDraft: true,
              })}
              disabled={playlistBusy || tracks.length === 0}
              className="mt-2 rounded-lg border border-aquarius-blue/30 bg-aquarius-blue/20 px-3 py-2 text-xs font-bold text-aquarius-blue transition hover:bg-aquarius-blue/30 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {playlistBusy ? "整理中" : "整理候選歌曲"}
            </button>
          </div>
        )}
        {playlistDraft && (
          <div className="mr-auto max-w-[92%] rounded-lg border border-aquarius-gold/25 bg-aquarius-gold/10 p-3 text-sm text-aquarius-mist">
            <div className="mb-2 flex items-center justify-between gap-2">
              <input
                value={playlistDraft.name}
                disabled={playlistBusy}
                onChange={(event) =>
                  setPlaylistDraft((current) =>
                    current ? { ...current, name: event.target.value } : current,
                  )
                }
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-bold text-white outline-none transition focus:border-aquarius-blue/70"
                aria-label="AI 播放清單名稱"
              />
              <button
                type="button"
                onClick={handleCreatePlaylist}
                disabled={playlistBusy || !playlistDraft.name.trim() || playlistDraft.candidates.length === 0}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-aquarius-gold/30 bg-aquarius-gold/20 text-aquarius-gold transition hover:bg-aquarius-gold/30 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="建立播放清單"
                title="建立播放清單"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-2 text-xs text-aquarius-mist">
              {playlistDraft.candidates.length} 首候選 · {playlistDraft.searchMethod}
            </p>
          </div>
        )}
        {fixReport && (
          <div className="mr-auto w-[95%] rounded-lg border border-aquarius-blue/25 bg-aquarius-blue/10 p-3 text-sm text-aquarius-mist">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold text-white">曲庫健檢報告</p>
              <button
                type="button"
                onClick={() => setFixReport(null)}
                disabled={fixBusy}
                className="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-[11px] font-bold text-aquarius-mist transition hover:bg-white/[0.12]"
              >
                關閉
              </button>
            </div>
            {folderOptions.length > 0 && (
              <label className="mb-2 flex items-center gap-2 text-xs">
                <span className="shrink-0 text-aquarius-mist/80">範圍</span>
                <select
                  value={scanFolder}
                  disabled={fixBusy}
                  onChange={(event) => rescanFolder(event.currentTarget.value)}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-aquarius-navy/60 px-2 py-1 text-white outline-none"
                  aria-label="檢查範圍資料夾"
                >
                  <option value="">全部（{tracks.length} 首）</option>
                  {folderOptions.map((folder) => (
                    <option key={folder.path} value={folder.path}>
                      {folder.label}（{folder.count}）
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/[0.06] px-2 py-1.5">缺歌手 <span className="font-bold text-white">{fixReport.missingArtist}</span></div>
              <div className="rounded-lg bg-white/[0.06] px-2 py-1.5">缺專輯 <span className="font-bold text-white">{fixReport.missingAlbum}</span></div>
              <div className="rounded-lg bg-white/[0.06] px-2 py-1.5">缺年份 <span className="font-bold text-white">{fixReport.missingYear}</span></div>
              <div className="rounded-lg bg-white/[0.06] px-2 py-1.5">缺曲風 <span className="font-bold text-white">{fixReport.missingGenre}</span></div>
            </div>
            {fixReport.plans.length > 0 ? (
              <>
                <p className="mb-2 text-xs">
                  可自動建議補齊 {fixReport.plans.length} 首。套用前會先備份原始標籤，整理後可一鍵復原（僅文字欄位）。
                </p>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={startMetadataFix}
                    disabled={fixBusy || !onApplyMetadataFix}
                    className="rounded-lg border border-aquarius-blue/30 bg-aquarius-blue/20 px-3 py-2 text-xs font-bold text-aquarius-blue transition hover:bg-aquarius-blue/30 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    開始整理
                  </button>
                </div>
              </>
            ) : (
              <p className="mb-2 text-xs text-aquarius-mist/80">
                {fixReport.incompleteCount > 0
                  ? "這個範圍推測不出建議值，可用下方「逐首手動編輯」自己輸入保存。"
                  : "這個範圍沒有缺基本資料。"}
              </p>
            )}
            {fixReport.manualCandidates.length > 0 && (
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setShowManual((value) => !value)}
                  className="text-xs font-bold text-aquarius-blue underline-offset-2 hover:underline"
                >
                  逐首手動編輯（{fixReport.manualCandidates.length}）{showManual ? " ▲" : " ▼"}
                </button>
                {showManual && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-black/15 p-1.5">
                    {fixReport.manualCandidates.map((entry) => (
                      <div key={entry.trackId} className="flex items-center justify-between gap-2 rounded px-1.5 py-1 hover:bg-white/[0.06]">
                        <span className="min-w-0 truncate text-xs text-aquarius-mist">{entry.fileName}</span>
                        <button
                          type="button"
                          onClick={() => onEditSongInfo?.(entry.trackId, {})}
                          disabled={!onEditSongInfo}
                          className="shrink-0 rounded border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-aquarius-mist transition hover:bg-white/[0.12] disabled:opacity-40"
                        >
                          編輯
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {fixReport.nonWritableList.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowNonWritable((value) => !value)}
                  className="text-xs font-bold text-aquarius-mist/90 underline-offset-2 hover:underline"
                >
                  無法寫回、僅檢視（{fixReport.nonWritableList.length}）{showNonWritable ? " ▲" : " ▼"}
                </button>
                {showNonWritable && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-black/15 p-1.5">
                    {fixReport.nonWritableList.map((entry) => (
                      <div key={entry.trackId} className="flex items-center justify-between gap-2 rounded px-1.5 py-1 hover:bg-white/[0.06]">
                        <span className="min-w-0">
                          <span className="block truncate text-xs text-white">{entry.fileName}</span>
                          <span className="block truncate text-[11px] text-aquarius-mist/70">{entry.sourcePath}</span>
                        </span>
                        {Boolean(window.aquariusgirlAPI?.showTrackInFolder) && entry.sourcePath && (
                          <button
                            type="button"
                            onClick={() => void window.aquariusgirlAPI?.showTrackInFolder?.(entry.sourcePath)}
                            className="shrink-0 rounded border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-aquarius-mist transition hover:bg-white/[0.12]"
                          >
                            顯示位置
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {fixQueue.length > 0 && fixQueue[fixIndex] && (
          <div className="mr-auto w-[95%] rounded-lg border border-aquarius-gold/25 bg-aquarius-gold/10 p-3 text-sm text-aquarius-mist">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs font-bold text-white">{fixQueue[fixIndex].fileName}</p>
              <span className="shrink-0 text-xs">{fixIndex + 1} / {fixQueue.length}</span>
            </div>
            <div className="mb-2 h-1 overflow-hidden rounded bg-white/10">
              <div
                className="h-1 rounded bg-aquarius-gold/70"
                style={{ width: `${Math.round((fixIndex / fixQueue.length) * 100)}%` }}
              />
            </div>
            <div className="mb-2 flex flex-col gap-2">
              {fixQueue[fixIndex].suggestions.map((suggestion) => (
                <label key={suggestion.field} className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(fixChecks[suggestion.field])}
                    disabled={fixBusy}
                    onChange={(event) =>
                      setFixChecks((current) => ({
                        ...current,
                        [suggestion.field]: event.target.checked,
                      }))
                    }
                    className="mt-1 shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="text-white">
                      {suggestion.label}：— → {suggestion.proposed}
                    </span>
                    <span
                      className={`ml-1.5 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                        suggestion.confidence === "high"
                          ? "bg-emerald-300/20 text-emerald-200"
                          : "bg-amber-300/20 text-amber-200"
                      }`}
                    >
                      {suggestion.confidence === "high" ? "高" : "中"}
                    </span>
                    <span className="block truncate text-xs text-aquarius-mist/80">{suggestion.evidence}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void applyCurrentFix()}
                disabled={fixBusy || !onApplyMetadataFix}
                className="rounded-lg border border-aquarius-gold/30 bg-aquarius-gold/20 px-3 py-2 text-xs font-bold text-aquarius-gold transition hover:bg-aquarius-gold/30 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {fixBusy ? "套用中…" : "套用並下一首"}
              </button>
              <button
                type="button"
                onClick={editCurrentFix}
                disabled={fixBusy || !onEditSongInfo}
                className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-aquarius-mist transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-45"
              >
                我來改
              </button>
              <button
                type="button"
                onClick={skipCurrentFix}
                disabled={fixBusy}
                className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-aquarius-mist transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-45"
              >
                跳過
              </button>
              <button
                type="button"
                onClick={cancelMetadataFix}
                disabled={fixBusy}
                className="ml-auto text-xs text-aquarius-mist/70 underline transition hover:text-aquarius-mist"
              >
                取消整理
              </button>
            </div>
          </div>
        )}
        {fixSummary && (
          <div className="mr-auto w-[95%] rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">
            <p className="mb-2 font-semibold">整理完成</p>
            <p className="mb-2 text-xs">
              已套用 {fixSummary.applied} 首、轉手動 {fixSummary.manual} 首、跳過 {fixSummary.skipped} 首、失敗 {fixSummary.failed} 首。
            </p>
            {fixSummary.failed > 0 && (
              <p className="mb-2 text-xs text-emerald-100/80">
                失敗的多半是檔案使用中（例如正在播放），暫停播放後再說一次「檢查歌曲資訊」即可重跑。
              </p>
            )}
            <div className="flex gap-2">
              {fixSummary.applied > 0 && onRestoreMetadataFix && (
                <button
                  type="button"
                  onClick={() => void restoreMetadataFix()}
                  disabled={fixBusy}
                  className="rounded-lg border border-emerald-300/30 bg-emerald-300/15 px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-300/25 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {fixBusy ? "復原中…" : "全部復原（本次整理）"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setFixSummary(null)}
                disabled={fixBusy}
                className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-emerald-100/80 transition hover:bg-white/[0.12]"
              >
                知道了
              </button>
            </div>
          </div>
        )}
        {playlistBusy && (
          <div
            role="status"
            className="mr-auto max-w-[92%] rounded-lg border border-aquarius-blue/25 bg-aquarius-blue/10 px-3 py-2 text-sm leading-6 text-aquarius-mist"
          >
            正在整理並建立播放清單，請稍候，完成前先不要重複送出。
          </div>
        )}
        {playlistResult && (
          <div className="mr-auto max-w-[92%] rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm leading-6 text-emerald-100">
            {playlistResult}
          </div>
        )}
        {(ai.aiError || playlistError) && (
          <div className="mr-auto max-w-[92%] rounded-lg border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm leading-6 text-rose-100">
            {ai.aiError || playlistError}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          className="min-h-10 min-w-0 flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition focus:border-aquarius-blue/70"
          rows={2}
          disabled={ai.isGenerating || playlistBusy}
          placeholder={
            ai.isModelLoading
              ? "可以先搜尋本機音樂庫..."
              : ai.isModelReady
                ? aiInputPlaceholder
                : "可搜尋本機音樂庫；聊天模型暫不可用"
          }
          aria-label="輸入 AI 訊息"
        />
        {ai.isGenerating ? (
          <button
            type="button"
            onClick={() => void ai.cancel()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-300/30 bg-rose-300/15 text-rose-100 transition hover:bg-rose-300/25"
            aria-label="取消 AI 回覆"
            title="取消 AI 回覆"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={playlistBusy || !draft.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-aquarius-blue/30 bg-aquarius-blue/20 text-aquarius-blue transition hover:bg-aquarius-blue/30 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="送出 AI 訊息"
            title="送出 AI 訊息"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col gap-4">{panelBody}</div>;
  }

  return (
    <aside className="glass-panel p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-aquarius-blue" />
          <span className="truncate text-sm font-black uppercase tracking-[0.16em] text-aquarius-blue">
            {aiPanelTitle}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-aquarius-mist transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">{panelBody}</div>
      )}
    </aside>
  );
}
