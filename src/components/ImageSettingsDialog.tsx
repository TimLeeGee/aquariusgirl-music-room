import { useEffect, useState, type CSSProperties } from "react";
import { Image as ImageIcon, ImagePlus, Palette, RotateCcw, SlidersHorizontal, Type, X } from "lucide-react";
import { brandAssets } from "../config/brandAssets";
import type { TextOverrideKey, TextOverrideSettings, ThemeColorSettings } from "../types/settings";
import { UI_TEXT_GROUPS, defaultTextOverrideSettings } from "../types/settings";
import type { CustomImages, CustomImageSlot } from "../utils/platform";
import { IconButton } from "./IconButton";
import { SafeImage } from "./SafeImage";

type ImageSettingsDialogProps = {
  open: boolean;
  images: CustomImages;
  busySlot: CustomImageSlot | null;
  colorSettings: ThemeColorSettings;
  miniOpacity: number;
  onClose: () => void;
  onSelect: (slot: CustomImageSlot) => Promise<void>;
  onRemove: (slot: CustomImageSlot) => Promise<void>;
  onColorSettingsChange: (settings: ThemeColorSettings) => void;
  onMiniOpacityChange: (opacity: number) => void;
  onResetColors: () => void;
  textOverrides: TextOverrideSettings;
  onTextOverridePatch: (key: TextOverrideKey, value: string) => void;
  onResetText: () => void;
};

const imageOptions: Array<{
  slot: CustomImageSlot;
  title: string;
  path: string;
  fallback?: string;
}> = [
  { slot: "logo", title: "品牌標誌", path: "brand/logo.png", fallback: brandAssets.logo },
  { slot: "avatar", title: "個人頭像", path: "brand/avatar.png", fallback: brandAssets.avatar },
  { slot: "banner", title: "房間橫幅", path: "backgrounds/banner.png", fallback: brandAssets.banner },
  { slot: "background", title: "主背景", path: "backgrounds/main-bg.png", fallback: brandAssets.background },
  { slot: "characterIdle", title: "待機角色", path: "characters/aquariusgirl-idle.png", fallback: brandAssets.characterIdle },
  { slot: "characterPlaying", title: "播放角色", path: "characters/aquariusgirl-playing.png", fallback: brandAssets.characterPlaying },
  { slot: "coverPlaceholder", title: "預設封面", path: "covers/default-cover.png", fallback: brandAssets.coverPlaceholder },
  { slot: "decorationStar", title: "星星裝飾", path: "decorations/star.png", fallback: brandAssets.decorativeImages?.[0] },
  { slot: "decorationBubble", title: "泡泡裝飾", path: "decorations/bubble.png", fallback: brandAssets.decorativeImages?.[1] },
];

type HueSettingKey = "primaryHue" | "secondaryHue" | "accentHue" | "textHue" | "backgroundHue" | "panelHue" | "miniHue";
type OpacitySettingKey = "panelOpacity" | "backgroundOpacity" | "stageOpacity" | "decorationOpacity";

const colorOptions: Array<{
  key: HueSettingKey;
  title: string;
  description: string;
}> = [
  { key: "primaryHue", title: "主色", description: "按鈕、標籤、焦點與主要光暈" },
  { key: "secondaryHue", title: "輔色", description: "收藏、智慧歌單與次要光暈" },
  { key: "accentHue", title: "金色點綴", description: "星光與小型裝飾" },
  { key: "textHue", title: "文字", description: "標題、內文與次要文字的色調" },
  { key: "backgroundHue", title: "背景", description: "頁面與標題列" },
  { key: "panelHue", title: "面板背景", description: "Header、歌單、工具、備份與共用面板" },
  { key: "miniHue", title: "MINI 背景", description: "底部 MINI 列與桌面 MINI 視窗" },
];

const opacityOptions: Array<{
  key: OpacitySettingKey;
  title: string;
  description: string;
}> = [
  { key: "panelOpacity", title: "共用面板", description: "Header、歌單、工具、備份與播放器面板" },
  { key: "backgroundOpacity", title: "主背景", description: "全畫面主背景圖片" },
  { key: "stageOpacity", title: "角色舞台遮罩", description: "主視覺區域的深色遮罩" },
  { key: "decorationOpacity", title: "左右裝飾", description: "畫面兩側的裝飾圖片" },
];

const textOptions: Array<{
  key: TextOverrideKey;
  title: string;
  description: string;
  multiline?: boolean;
}> = [
  { key: "stageTitle", title: "主舞台標題", description: "角色舞台上方的大標題" },
  { key: "stageIdleHint", title: "主舞台待機提示", description: "沒有播放時角色下方的陪伴文字", multiline: true },
  { key: "aiPanelTitle", title: "AI 面板標題", description: "AI 助手面板頂端名稱" },
  { key: "aiGreeting", title: "AI 開場問候", description: "AI 對話還沒開始時的第一句" },
  { key: "aiInputPlaceholder", title: "AI 輸入框提示", description: "AI 輸入框就緒時的 placeholder" },
  { key: "dropZoneTitle", title: "拖曳提示標題", description: "拖曳音樂到視窗時的大字" },
];

export function ImageSettingsDialog({
  open,
  images,
  busySlot,
  colorSettings,
  miniOpacity,
  onClose,
  onSelect,
  onRemove,
  onColorSettingsChange,
  onMiniOpacityChange,
  onResetColors,
  textOverrides,
  onTextOverridePatch,
  onResetText,
}: ImageSettingsDialogProps) {
  const [activePanel, setActivePanel] = useState<"images" | "colors" | "opacity" | "text">("images");
  const [textSearch, setTextSearch] = useState("");

  useEffect(() => {
    if (open) setActivePanel("images");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const isImages = activePanel === "images";
  const isColors = activePanel === "colors";
  const isOpacity = activePanel === "opacity";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-aquarius-navy/[0.72] p-4 backdrop-blur-xl"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="glass-panel app-no-drag flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appearance-settings-title"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-b border-white/[0.1] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
              Appearance
            </p>
            <h2 id="appearance-settings-title" className="mt-1 text-2xl font-black text-white">
              {isImages ? "圖片設定" : isColors ? "色彩設定" : isOpacity ? "透明度設定" : "文字設定"}
            </h2>
            <p className="mt-1 truncate text-sm text-aquarius-mist">
              {isImages ? "九張圖片，維持原本裁切比例與位置。" : isColors ? "七組色彩即時預覽並自動保存。" : isOpacity ? "五組透明度即時預覽並自動保存。" : "改角色名稱或逐句覆寫，可搜尋，留空用預設。"}
            </p>
          </div>

          <div
            className="app-no-drag inline-grid grid-cols-4 rounded-lg border border-white/[0.12] bg-white/[0.07] p-1"
            role="tablist"
            aria-label="外觀設定分類"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isImages}
              aria-controls="appearance-settings-content"
              className={`inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${isImages ? "bg-aquarius-blue/[0.2] text-white shadow-glow" : "text-aquarius-mist hover:bg-white/[0.08] hover:text-white"}`}
              onClick={() => setActivePanel("images")}
            >
              <ImageIcon className="h-4 w-4" />
              圖片
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isColors}
              aria-controls="appearance-settings-content"
              className={`inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${isColors ? "bg-aquarius-blue/[0.2] text-white shadow-glow" : "text-aquarius-mist hover:bg-white/[0.08] hover:text-white"}`}
              onClick={() => setActivePanel("colors")}
            >
              <Palette className="h-4 w-4" />
              色彩
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activePanel === "opacity"}
              aria-controls="appearance-settings-content"
              className={`inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${activePanel === "opacity" ? "bg-aquarius-blue/[0.2] text-white shadow-glow" : "text-aquarius-mist hover:bg-white/[0.08] hover:text-white"}`}
              onClick={() => setActivePanel("opacity")}
            >
              <SlidersHorizontal className="h-4 w-4" />
              透明度
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activePanel === "text"}
              aria-controls="appearance-settings-content"
              className={`inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${activePanel === "text" ? "bg-aquarius-blue/[0.2] text-white shadow-glow" : "text-aquarius-mist hover:bg-white/[0.08] hover:text-white"}`}
              onClick={() => setActivePanel("text")}
            >
              <Type className="h-4 w-4" />
              文字
            </button>
          </div>

          <div className="justify-self-end">
            <IconButton icon={<X className="h-4 w-4" />} label="關閉外觀設定" size="sm" onClick={onClose} />
          </div>
        </div>

        {isImages ? (
          <>
            <div id="appearance-settings-content" className="grid gap-3 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {imageOptions.map((option) => {
                const customImage = images[option.slot];
                const busy = busySlot === option.slot;

                return (
                  <article key={option.slot} className="rounded-lg border border-white/[0.12] bg-white/[0.07] p-3">
                    <div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.45]">
                      <SafeImage
                        src={customImage ?? option.fallback}
                        alt={`${option.title}預覽`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-3 min-w-0">
                      <p className="font-black text-white">{option.title}</p>
                      <p className="truncate text-xs text-aquarius-mist">public/assets/{option.path}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        aria-label={`${customImage ? "更換" : "新增"}${option.title}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-aquarius-blue/[0.45] bg-aquarius-blue/[0.14] px-3 py-2 text-xs font-black text-white transition hover:bg-aquarius-blue/[0.24] disabled:cursor-wait disabled:opacity-45"
                        disabled={Boolean(busySlot)}
                        onClick={() => void onSelect(option.slot)}
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        {busy ? "處理中" : customImage ? "更換" : "新增"}
                      </button>
                      <button
                        type="button"
                        aria-label={`回復${option.title}預設`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-xs font-bold text-aquarius-mist transition hover:border-red-300/40 hover:bg-red-500/[0.12] hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-35"
                        disabled={!customImage || Boolean(busySlot)}
                        onClick={() => void onRemove(option.slot)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        回復預設
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="border-t border-white/[0.1] px-5 py-3 text-xs leading-5 text-aquarius-mist sm:px-6">
              支援 PNG、JPG、WebP、GIF，單張上限 10 MB。內建圖片保留在 public；自訂圖片只複製到本機 App 資料。
            </p>
          </>
        ) : isColors ? (
          <>
            <div id="appearance-settings-content" className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="mx-auto grid w-full max-w-3xl gap-3">
                {colorOptions.map((option) => {
                  const hue = colorSettings[option.key];
                  return (
                    <label
                      key={option.key}
                      className="grid gap-3 rounded-lg border border-white/[0.12] bg-white/[0.07] p-4 sm:grid-cols-[180px_minmax(0,1fr)_64px] sm:items-center"
                    >
                      <span>
                        <span className="block font-black text-white">{option.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-aquarius-mist">{option.description}</span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={hue}
                        aria-label={`${option.title}色相`}
                        className="rainbow-range w-full"
                        style={{ "--range-hue": hue } as CSSProperties}
                        onChange={(event) =>
                          onColorSettingsChange({
                            ...colorSettings,
                            [option.key]: Number(event.currentTarget.value),
                          })
                        }
                      />
                      <span className="flex items-center justify-end gap-2 text-xs font-bold text-aquarius-mist">
                        <span
                          className="h-7 w-7 rounded-full border-2 border-white/70 shadow-soft"
                          style={{ background: `hsl(${hue} 88% 60%)` }}
                        />
                        {hue}°
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/[0.1] px-5 py-3 sm:px-6">
              <p className="text-xs leading-5 text-aquarius-mist">設定會自動保存；重新開啟播放器會直接套用。</p>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.07] px-3 py-2 text-xs font-black text-white transition hover:border-aquarius-blue/[0.5] hover:bg-aquarius-blue/[0.14]"
                onClick={onResetColors}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                全部復原
              </button>
            </div>
          </>
        ) : isOpacity ? (
          <>
            <div id="appearance-settings-content" className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="mx-auto grid w-full max-w-3xl gap-3">
                {opacityOptions.map((option) => {
                  const opacity = colorSettings[option.key];
                  return (
                    <label
                      key={option.key}
                      className="grid gap-3 rounded-lg border border-white/[0.12] bg-white/[0.07] p-4 sm:grid-cols-[180px_minmax(0,1fr)_64px] sm:items-center"
                    >
                      <span>
                        <span className="block font-black text-white">{option.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-aquarius-mist">{option.description}</span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={opacity}
                        aria-label={`${option.title}透明度`}
                        className="aqua-range w-full"
                        onChange={(event) =>
                          onColorSettingsChange({
                            ...colorSettings,
                            [option.key]: Number(event.currentTarget.value),
                          })
                        }
                      />
                      <span className="text-right text-xs font-bold tabular-nums text-aquarius-mist">
                        {opacity}%
                      </span>
                    </label>
                  );
                })}
                <label className="grid gap-3 rounded-lg border border-white/[0.12] bg-white/[0.07] p-4 sm:grid-cols-[180px_minmax(0,1fr)_64px] sm:items-center">
                  <span>
                    <span className="block font-black text-white">MINI 視窗</span>
                    <span className="mt-1 block text-xs leading-5 text-aquarius-mist">桌面 MINI 原生視窗透明度</span>
                  </span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={1}
                    value={Math.round(miniOpacity * 100)}
                    aria-label="MINI 視窗透明度"
                    className="aqua-range w-full"
                    onChange={(event) => onMiniOpacityChange(Number(event.currentTarget.value) / 100)}
                  />
                  <span className="text-right text-xs font-bold tabular-nums text-aquarius-mist">
                    {Math.round(miniOpacity * 100)}%
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/[0.1] px-5 py-3 sm:px-6">
              <p className="text-xs leading-5 text-aquarius-mist">設定會自動保存；文字維持清楚，不跟著面板透明。</p>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.07] px-3 py-2 text-xs font-black text-white transition hover:border-aquarius-blue/[0.5] hover:bg-aquarius-blue/[0.14]"
                onClick={onResetColors}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                全部復原
              </button>
            </div>
          </>
        ) : (
          <>
            <div id="appearance-settings-content" className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="mx-auto grid w-full max-w-3xl gap-3">
                <div className="rounded-lg border border-aquarius-blue/[0.3] bg-aquarius-blue/[0.08] p-4">
                  <span className="block font-black text-white">角色名稱</span>
                  <span className="mt-1 block text-xs leading-5 text-aquarius-mist">
                    改這裡，全站出現名字的地方一起換（預設文字、提示、歌單命名⋯）。留空用預設。
                  </span>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-aquarius-mist">中文名稱</span>
                      <input
                        value={textOverrides.characterName}
                        aria-label="角色中文名稱"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition focus:border-aquarius-blue/70"
                        onChange={(event) => onTextOverridePatch("characterName", event.currentTarget.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-aquarius-mist">英文名稱</span>
                      <input
                        value={textOverrides.characterNameEn}
                        aria-label="角色英文名稱"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition focus:border-aquarius-blue/70"
                        onChange={(event) => onTextOverridePatch("characterNameEn", event.currentTarget.value)}
                      />
                    </label>
                  </div>
                  <p className="mt-2 truncate text-xs text-aquarius-mist">
                    預覽：{textOverrides.aiGreeting}｜{textOverrides.stageTitle}
                  </p>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-aquarius-mist">搜尋要改的文字</span>
                  <input
                    value={textSearch}
                    onChange={(event) => setTextSearch(event.currentTarget.value)}
                    placeholder="輸入標題或內容關鍵字…"
                    aria-label="搜尋要改的文字"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition focus:border-aquarius-blue/70"
                  />
                </label>
                {UI_TEXT_GROUPS.map((group) => {
                  const query = textSearch.trim().toLowerCase();
                  const fields = group.fields.filter(
                    (field) =>
                      !query ||
                      field.label.toLowerCase().includes(query) ||
                      textOverrides[field.key].toLowerCase().includes(query),
                  );
                  if (fields.length === 0) return null;
                  return (
                    <div key={group.group} className="rounded-lg border border-white/[0.12] bg-white/[0.05] p-3">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-aquarius-blue">{group.group}</p>
                      <div className="grid gap-2">
                        {fields.map((field) => {
                          const value = textOverrides[field.key];
                          const isDefault = value === defaultTextOverrideSettings[field.key];
                          return (
                            <div
                              key={field.key}
                              className="grid gap-2 rounded-lg border border-white/[0.1] bg-white/[0.05] p-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start"
                            >
                              <div className="min-w-0">
                                <span className="block text-sm font-bold text-white">{field.label}</span>
                                <button
                                  type="button"
                                  disabled={isDefault}
                                  onClick={() => onTextOverridePatch(field.key, defaultTextOverrideSettings[field.key])}
                                  className="mt-1 inline-flex items-center gap-1 rounded border border-white/[0.12] bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-aquarius-mist transition hover:border-aquarius-blue/[0.5] hover:bg-aquarius-blue/[0.14] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  復原
                                </button>
                              </div>
                              {field.multiline ? (
                                <textarea
                                  value={value}
                                  rows={2}
                                  aria-label={field.label}
                                  className="min-h-10 w-full resize-none rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition focus:border-aquarius-blue/70"
                                  onChange={(event) => onTextOverridePatch(field.key, event.currentTarget.value)}
                                />
                              ) : (
                                <input
                                  value={value}
                                  aria-label={field.label}
                                  className="w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white outline-none transition focus:border-aquarius-blue/70"
                                  onChange={(event) => onTextOverridePatch(field.key, event.currentTarget.value)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/[0.1] px-5 py-3 sm:px-6">
              <p className="text-xs leading-5 text-aquarius-mist">留空會自動使用預設文字；設定即時保存並套用。</p>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.07] px-3 py-2 text-xs font-black text-white transition hover:border-aquarius-blue/[0.5] hover:bg-aquarius-blue/[0.14]"
                onClick={onResetText}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                全部復原
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
