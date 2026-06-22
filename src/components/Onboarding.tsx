import { useBrandAssets } from "../config/brandAssets";
import { SafeImage } from "./SafeImage";

type OnboardingProps = {
  onSkip: () => void;
  onComplete: () => void;
};

const steps = [
  "歡迎來到 Aquariusgirl Music Room，這是水瓶罐子的音樂小水池。",
  "請選擇你的本地音樂資料夾，音樂只會在你的電腦中播放，不會上傳。",
  "你可以收藏歌曲、建立歌單、匯入歌詞、開啟睡前定時。",
  "如果是桌面版，以後可以直接從桌面捷徑、開始選單或 Applications 開啟。",
];

export function Onboarding({ onSkip, onComplete }: OnboardingProps) {
  const brandAssets = useBrandAssets();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-aquarius-navy/[0.78] p-4 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-2xl p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-aquarius-blue/[0.35] bg-white/[0.08]">
            <SafeImage
              src={brandAssets.avatar || brandAssets.logo}
              alt="Aquariusgirl"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
              Welcome
            </p>
            <h2 className="text-2xl font-black text-white">第一次使用引導</h2>
          </div>
        </div>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-sm leading-7 text-aquarius-mist"
            >
              <span className="mr-2 font-black text-aquarius-blue">第 {index + 1} 步</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm font-bold text-white"
            onClick={onSkip}
          >
            略過
          </button>
          <button
            type="button"
            className="rounded-full border border-aquarius-blue/[0.55] bg-aquarius-blue/[0.18] px-4 py-2 text-sm font-bold text-white"
            onClick={onComplete}
          >
            開始使用
          </button>
        </div>
      </div>
    </div>
  );
}
