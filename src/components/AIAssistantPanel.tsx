import { ChevronDown, Plus, Send, Sparkles, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalPlaylist } from "../types/playlist";
import type { Track } from "../types/track";
import { routeAiIntent } from "../ai/intentRouter";
import { composeSearchingMessage, composeSkillResult } from "../ai/responseComposer";
import { createSkillPlan, type SkillResult } from "../ai/skillRegistry";
import { useLocalAI } from "../hooks/useLocalAI";
import {
  buildLibrarySummary,
  buildPlaylistRequestText,
  isMusicRelatedRequest,
  isPlaylistConsent,
  isRandomPlaylistRequest,
  pickRandomTracksForAIPlaylist,
  searchTracksForAIIntent,
  type AITrackCandidate,
} from "../utils/aiTrackSearch";

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
};

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
}: AIAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [hasRequestedInit, setHasRequestedInit] = useState(false);
  const [draft, setDraft] = useState("");
  const [pendingPlaylistText, setPendingPlaylistText] = useState("");
  const [playlistBusy, setPlaylistBusy] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [playlistDraft, setPlaylistDraft] = useState<PlaylistDraft | null>(null);
  const [playlistResult, setPlaylistResult] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const ai = useLocalAI();
  const isOpen = embedded || open;

  const publishSkillResult = useCallback(async (result: SkillResult) => {
    const fallback = composeSkillResult(result);
    setPlaylistResult(fallback);
    if (!ai.isModelReady) return;

    const reply = await ai.composeToolReply(result, fallback);
    if (reply.ok && reply.text.trim()) {
      setPlaylistResult(reply.text.trim().slice(0, 500));
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
    if (!ai.isModelReady) return fallbackIntent;

    const result = await ai.parseMusicSearchIntent(
      requestText,
      buildLibrarySummary(tracks, playlists),
    );
    return result.ok ? routeAiIntent(requestText, result.intent) : fallbackIntent;
  };

  const createPlaylistFromDraft = async (nextDraft: PlaylistDraft) => {
    if (nextDraft.candidates.length === 0) return;
    const result = onCreatePlaylist(
      nextDraft.name,
      nextDraft.candidates.map((candidate) => candidate.track.id),
      {
        requestText: nextDraft.requestText,
        searchMethod: nextDraft.searchMethod,
        intent: nextDraft.intent,
        candidates: nextDraft.candidates,
      },
    );
    if (!result.ok) {
      setPlaylistError(result.error);
      return;
    }
    await publishSkillResult({
      ok: true,
      skill: "createPlaylist",
      message: "",
      tracks: nextDraft.candidates,
      playlist: { name: result.name, trackCount: result.count },
      error: null,
    });
    setPlaylistDraft(null);
    setPendingPlaylistText("");
  };

  const runMusicLibrarySearch = async (
    sourceText: string,
    options: { autoCreate: boolean; showDraft?: boolean },
  ) => {
    const requestText = sourceText.trim();
    if (!requestText) return;
    if (tracks.length === 0) {
      setPlaylistError("請先載入音樂，再讓水瓶罐子整理播放清單。");
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
      const random = plan.skill === "randomPlaylist";
      const searchMethod = random ? "隨機" : "關鍵字 / metadata";

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
        setPlaylistError(
          `找不到符合「${requestText}」的本機歌曲。請確認音樂資料夾內是否有相關歌曲，或先重新掃描資料夾。`,
        );
        return;
      }

      const nextDraft: PlaylistDraft = {
        name: random ? "水瓶罐子隨機歌單" : intent.playlistName,
        candidates,
        requestText,
        searchMethod,
        intent: random ? "random_playlist" : `${plan.skill}: ${plan.search_keywords.join(", ")}`,
      };

      if (plan.skill === "removeFromPlaylist") {
        await publishSkillResult({
          ok: true,
          skill: "removeFromPlaylist",
          message: "為避免誤移除，請在目標歌單中逐首移除；這只會移出播放清單，不會刪除本機音樂檔。",
          tracks: candidates,
          playlist: null,
          error: null,
        });
        return;
      }

      if (plan.skill === "addToPlaylist") {
        if (!onAddTracksToPlaylist || !intent.targetPlaylistName) {
          await publishSkillResult({
            ok: true,
            skill: "addToPlaylist",
            message: "請指定要加入的既有歌單名稱。",
            tracks: candidates,
            playlist: null,
            error: null,
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
          skill: "addToPlaylist",
          message: `已加入「${result.name}」，共 ${result.count} 首。`,
          tracks: candidates,
          playlist: { name: result.name, trackCount: result.count },
          error: null,
        });
        return;
      }

      if (options.autoCreate || plan.skill === "createPlaylist" || plan.skill === "randomPlaylist") {
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
      });
    } finally {
      setPlaylistBusy(false);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || playlistBusy) return;
    setDraft("");
    setPlaylistError("");
    setPlaylistResult("");

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
    if (!playlistDraft) return;
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
        className="flex max-h-64 min-h-32 flex-col gap-3 overflow-y-auto rounded-lg border border-white/10 bg-black/15 p-3"
      >
        {ai.messages.length === 0 && (
          <p className="text-sm text-aquarius-mist">水瓶罐子在這裡。</p>
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
                disabled={!playlistDraft.name.trim() || playlistDraft.candidates.length === 0}
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
            <div className="max-h-36 overflow-y-auto pr-1">
              {playlistDraft.candidates.slice(0, 10).map(({ track }) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2"
                >
                  <span className="min-w-0 truncate font-semibold text-white">{track.title}</span>
                  <span className="max-w-[42%] truncate text-xs text-aquarius-mist">
                    {track.artist || track.album || track.genre || "本機歌曲"}
                  </span>
                </div>
              ))}
            </div>
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
                ? "和水瓶罐子聊聊..."
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
            水瓶罐子 AI
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
