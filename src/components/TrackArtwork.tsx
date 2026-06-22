import { Disc3 } from "lucide-react";
import { useBrandAssets } from "../config/brandAssets";
import type { Track } from "../types/track";
import { SafeImage } from "./SafeImage";

type TrackArtworkProps = {
  track: Track | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
};

export function TrackArtwork({ track, size = "md", className = "" }: TrackArtworkProps) {
  const brandAssets = useBrandAssets();
  const source = track?.artworkUrl || track?.coverUrl || brandAssets.coverPlaceholder;

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.14] bg-white/[0.08]",
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      <SafeImage
        src={source}
        alt={track ? `${track.title} 封面` : "預設封面"}
        className="h-full w-full object-cover"
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(99,215,255,0.34),transparent_34%),linear-gradient(135deg,rgba(43,27,95,0.78),rgba(8,11,31,0.92))]">
            <Disc3 className="h-1/2 w-1/2 text-aquarius-blue" />
          </div>
        }
      />
    </div>
  );
}
