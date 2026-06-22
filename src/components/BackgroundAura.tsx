import { useBrandAssets } from "../config/brandAssets";
import { SafeImage } from "./SafeImage";

type BackgroundAuraProps = {
  isPlaying: boolean;
};

const decorativePositions = [
  "bottom-36 left-2 animate-float-up",
  "bottom-36 right-2 animate-soft-pulse",
];

export function BackgroundAura({ isPlaying }: BackgroundAuraProps) {
  const brandAssets = useBrandAssets();
  const animationClass = isPlaying ? "animate-aqua-drift" : "animate-slow-aqua-drift";

  // ponytail: 共用一個背景層已能顯示三個素材；需要獨立版位時才拆成多個元件。
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-aquarius-navy">
        <SafeImage
          src={brandAssets.background}
          alt=""
          className="theme-background-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="background-aura-gradient absolute inset-0" />
        <div className={`background-aura-glow absolute inset-x-0 bottom-[-18%] h-1/2 ${animationClass} blur-3xl`} />
        <div className="star-field absolute inset-0 opacity-80" />
        <div className="wave-field absolute bottom-0 left-0 right-0 h-64 opacity-70" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden="true">
        {brandAssets.decorativeImages?.slice(0, 2).map((src, index) => (
          <SafeImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            className={[
              "theme-decoration-image absolute h-20 w-20 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.34)] sm:h-24 sm:w-24",
              decorativePositions[index],
            ].join(" ")}
          />
        ))}
      </div>
    </>
  );
}
