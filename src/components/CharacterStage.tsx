import { Music2, Sparkles, Waves } from "lucide-react";
import type { Track } from "../types/track";
import { useBrandAssets } from "../config/brandAssets";
import { applyName, useText } from "../config/textOverrides";
import { SafeImage } from "./SafeImage";
import { TrackArtwork } from "./TrackArtwork";

type CharacterStageProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  trackCount: number;
  showWebLimitNotice?: boolean;
};

function getCharacterSource(
  isPlaying: boolean,
  brandAssets: ReturnType<typeof useBrandAssets>,
) {
  if (isPlaying) {
    return brandAssets.characterPlaying || brandAssets.characterMain;
  }

  return brandAssets.characterIdle || brandAssets.characterMain;
}

export function CharacterStage({
  currentTrack,
  isPlaying,
  trackCount,
  showWebLimitNotice = false,
}: CharacterStageProps) {
  const brandAssets = useBrandAssets();
  const stageTitle = useText("stageTitle");
  const stageIdleHint = useText("stageIdleHint");
  const stageNoTrack = useText("stageNoTrack");
  const stageSelectHint = useText("stageSelectHint");
  const characterSource = getCharacterSource(isPlaying, brandAssets);
  const animationClass = isPlaying ? "animate-wave-flow" : "animate-slow-wave-flow";

  return (
    <section className="glass-panel relative min-h-[360px] overflow-hidden p-5 sm:min-h-[430px] sm:p-6">
      <SafeImage
        src={brandAssets.banner}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="theme-stage-overlay absolute inset-0" />
      <div className={`stage-water absolute inset-x-0 bottom-0 h-32 ${animationClass}`} />

      <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-aquarius-blue/30 bg-aquarius-blue/[0.12] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
              <Sparkles className="h-3.5 w-3.5" />
              Local Music Only
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
              {stageTitle}
            </h1>
          </div>
          <div className="hidden rounded-lg border border-white/[0.12] bg-white/10 px-4 py-3 text-right text-sm text-aquarius-mist sm:block">
            <span className="block text-2xl font-black text-white">{trackCount}</span>
            首已加入
          </div>
        </div>

        <div className="grid flex-1 items-end gap-5 md:grid-cols-[minmax(0,0.96fr)_minmax(240px,0.72fr)]">
          <div className="relative min-h-56 overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.08] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(99,215,255,0.2),transparent_30%),radial-gradient(circle_at_72%_30%,rgba(255,143,216,0.16),transparent_26%)]" />
            <div className="bubble-field absolute inset-0" />
            <div className="relative flex h-full min-h-48 items-center justify-center">
              <SafeImage
                src={characterSource}
                alt="Aquariusgirl character"
                className={[
                  "aspect-square max-h-80 w-full max-w-80 rounded-lg object-cover drop-shadow-[0_24px_44px_rgba(0,0,0,0.42)]",
                  isPlaying ? "animate-soft-pulse" : "",
                ].join(" ")}
                fallback={
                  <div className="flex h-56 w-56 items-center justify-center rounded-full border border-aquarius-blue/30 bg-[conic-gradient(from_180deg,rgba(99,215,255,0.22),rgba(255,143,216,0.2),rgba(255,216,107,0.18),rgba(99,215,255,0.22))]">
                    <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/[0.18] bg-aquarius-navy/[0.78] text-center shadow-glow">
                      <Waves className="mb-3 h-10 w-10 text-aquarius-blue" />
                      <span className="text-lg font-black text-white">{applyName("{nameEn}")}</span>
                      <span className="text-sm text-aquarius-mist">待機中</span>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.42] p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-aquarius-blue">
              <Music2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Now in the room
              </span>
            </div>
            {currentTrack && (
              <TrackArtwork track={currentTrack} size="lg" className="mb-4" />
            )}
            <p className="animate-track-in text-2xl font-black leading-snug text-white">
              {currentTrack?.title ?? stageNoTrack}
            </p>
            <p className="mt-2 text-sm leading-6 text-aquarius-mist">
              {currentTrack
                ? currentTrack.artist ?? "未知歌手"
                : stageIdleHint}
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-xs leading-5 text-aquarius-mist">
              {showWebLimitNotice
                ? "Web preview 重新整理後，請重新選擇本地音樂檔或資料夾。"
                : stageSelectHint}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
