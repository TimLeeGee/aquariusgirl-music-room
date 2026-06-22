import { createContext, useContext } from "react";

export type BrandAssets = {
  logo?: string;
  avatar?: string;
  banner?: string;
  characterMain?: string;
  characterIdle?: string;
  characterPlaying?: string;
  background?: string;
  coverPlaceholder?: string;
  decorativeImages?: string[];
};

const assetPath = (path: string) => `./${path.replace(/^\/+/, "")}`;

export const brandAssets: BrandAssets = {
  logo: assetPath("assets/brand/logo.png"),
  avatar: assetPath("assets/brand/avatar.png"),
  banner: assetPath("assets/backgrounds/banner.png"),
  characterMain: assetPath("assets/characters/aquariusgirl-main.png"),
  characterIdle: assetPath("assets/characters/aquariusgirl-idle.png"),
  characterPlaying: assetPath("assets/characters/aquariusgirl-playing.png"),
  background: assetPath("assets/backgrounds/main-bg.png"),
  coverPlaceholder: assetPath("assets/covers/default-cover.png"),
  decorativeImages: [
    assetPath("assets/decorations/star.png"),
    assetPath("assets/decorations/bubble.png"),
  ],
};

export const BrandAssetsContext = createContext(brandAssets);

export function useBrandAssets() {
  return useContext(BrandAssetsContext);
}
