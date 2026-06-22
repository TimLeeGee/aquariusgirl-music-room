export type MiniPlayerSettings = {
  enabled: boolean;
  alwaysOnTop: boolean;
  opacity: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  collapsed: boolean;
};

export type WindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WindowBoundsState = {
  fullBounds?: WindowBounds;
  miniBounds?: WindowBounds;
};

export type AudioVisualizerSettings = {
  enabled: boolean;
  intensity: number;
  sensitivity: number;
  smoothing: number;
  barCount: number;
  minBarHeight: number;
  maxBarHeight: number;
  bassBoost: number;
  responsiveness: number;
  displayMode: "bars" | "wave" | "dots" | "pulse";
};

export type ThemeColorSettings = {
  primaryHue: number;
  secondaryHue: number;
  accentHue: number;
  textHue: number;
  backgroundHue: number;
  panelHue: number;
  miniHue: number;
  panelOpacity: number;
  backgroundOpacity: number;
  stageOpacity: number;
  decorationOpacity: number;
};

export const defaultMiniPlayerSettings: MiniPlayerSettings = {
  enabled: false,
  alwaysOnTop: true,
  opacity: 0.92,
  width: 260,
  height: 268,
  collapsed: true,
};

export const defaultAudioVisualizerSettings: AudioVisualizerSettings = {
  enabled: true,
  intensity: 1.2,
  sensitivity: 1.2,
  smoothing: 0.55,
  barCount: 16,
  minBarHeight: 3,
  maxBarHeight: 28,
  bassBoost: 1.2,
  responsiveness: 0.75,
  displayMode: "bars",
};

export const defaultThemeColorSettings: ThemeColorSettings = {
  primaryHue: 195,
  secondaryHue: 321,
  accentHue: 44,
  textHue: 220,
  backgroundHue: 232,
  panelHue: 232,
  miniHue: 232,
  panelOpacity: 94,
  backgroundOpacity: 70,
  stageOpacity: 88,
  decorationOpacity: 80,
};
