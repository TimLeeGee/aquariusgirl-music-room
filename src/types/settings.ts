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

// 0.1.46–0.1.48: 面板文字自訂。characterName / characterNameEn 是全域角色名稱；其餘 key 是
// 各處 UI 顯示字串，預設值用 {name}/{nameEn} 記號由 resolveTextOverrideSettings 代入——
// 改角色名稱一處，全站散落提及一起換；也可整串覆寫某一句。
// 0.1.48：改成開放登錄表（UI_TEXT_GROUPS 供設定分組／搜尋編輯），涵蓋主舞台／播放器／歌單／AI／…。
export const defaultTextOverrideSettings = {
  characterName: "水瓶罐子",
  characterNameEn: "Aquariusgirl",
  stageTitle: "{name}的夜光音樂房間",
  stageIdleHint: "把音樂小魚乾拖進來，{name}就在這裡陪你聽。",
  stageNoTrack: "還沒有音樂",
  stageSelectHint: "選擇本地音樂，讓音樂小水池亮起來。",
  playerWaiting: "{name}正在等音樂",
  playerSelectHint: "選擇本地音樂檔後開始播放",
  playerDropHint: "把音樂放進小水池，現在就能開始播放。",
  headerTitle: "{nameEn} Music Room",
  headerSubtitle: "{name}的音樂小水池",
  trackListEmpty: "找不到符合條件的歌曲。換個關鍵字，{name}再幫你撈一次。",
  aiPanelTitle: "{name} AI",
  aiGreeting: "{name}在這裡。",
  aiInputPlaceholder: "和{name}聊聊...",
  dropZoneTitle: "放開小魚乾，加入{name}的歌單",
  dropZoneHint: "非音樂檔會被自動略過，支援 mp3、wav、ogg、m4a、flac。",
  miniIdle: "{name}的音樂小水池待機中",
  visualizerTitle: "音樂頻譜",
  sleepTimerTitle: "睡前定時停止",
} as const;

export type TextOverrideKey = keyof typeof defaultTextOverrideSettings;
export type TextOverrideSettings = Record<TextOverrideKey, string>;

export type UiTextField = { key: TextOverrideKey; label: string; multiline?: boolean };
export type UiTextGroup = { group: string; fields: UiTextField[] };

// 設定「文字」分頁的分組與標籤（characterName / characterNameEn 由 UI 特別處理，不列此表）。
export const UI_TEXT_GROUPS: UiTextGroup[] = [
  { group: "主舞台", fields: [
    { key: "stageTitle", label: "主舞台標題" },
    { key: "stageIdleHint", label: "主舞台待機提示", multiline: true },
    { key: "stageNoTrack", label: "無歌曲標題" },
    { key: "stageSelectHint", label: "選擇音樂提示" },
  ] },
  { group: "播放器", fields: [
    { key: "playerWaiting", label: "等待中主文字" },
    { key: "playerSelectHint", label: "選擇音樂檔提示" },
    { key: "playerDropHint", label: "拖入音樂提示" },
  ] },
  { group: "Header／標題", fields: [
    { key: "headerTitle", label: "標題（英文）" },
    { key: "headerSubtitle", label: "副標" },
  ] },
  { group: "歌單", fields: [
    { key: "trackListEmpty", label: "搜尋無結果", multiline: true },
  ] },
  { group: "AI 助手", fields: [
    { key: "aiPanelTitle", label: "AI 面板標題" },
    { key: "aiGreeting", label: "AI 開場問候" },
    { key: "aiInputPlaceholder", label: "AI 輸入框提示" },
  ] },
  { group: "拖曳／Mini", fields: [
    { key: "dropZoneTitle", label: "拖曳提示標題" },
    { key: "dropZoneHint", label: "拖曳支援格式說明", multiline: true },
    { key: "miniIdle", label: "Mini／OBS 待機文字" },
  ] },
  { group: "其他區塊", fields: [
    { key: "visualizerTitle", label: "視覺化標題" },
    { key: "sleepTimerTitle", label: "睡前定時標題" },
  ] },
];
