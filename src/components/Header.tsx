import { Fullscreen, Maximize2, Minus, Minimize2, Settings, Trash2, X } from "lucide-react";
import { useBrandAssets } from "../config/brandAssets";
import { useText } from "../config/textOverrides";
import { FilePickerButton } from "./FilePickerButton";
import { FolderPickerButton } from "./FolderPickerButton";
import { IconButton } from "./IconButton";
import { SafeImage } from "./SafeImage";

type HeaderProps = {
  trackCount: number;
  onFilesSelected: (files: FileList) => void;
  onFolderSelected: (files: FileList) => void;
  onNativeFilesSelected?: () => Promise<boolean>;
  onNativeFolderSelected?: () => Promise<boolean>;
  onClear: () => void;
  onEnterMiniMode: () => void;
  onOpenImageSettings: () => void;
  isDesktopApp?: boolean;
  showCustomWindowControls?: boolean;
  onMinimizeWindow?: () => void;
  onToggleMaximizeWindow?: () => void;
  onToggleFullscreenWindow?: () => void;
  onCloseWindow?: () => void;
};

export function Header({
  trackCount,
  onFilesSelected,
  onFolderSelected,
  onNativeFilesSelected,
  onNativeFolderSelected,
  onClear,
  onEnterMiniMode,
  onOpenImageSettings,
  isDesktopApp = false,
  showCustomWindowControls = false,
  onMinimizeWindow,
  onToggleMaximizeWindow,
  onToggleFullscreenWindow,
  onCloseWindow,
}: HeaderProps) {
  const brandAssets = useBrandAssets();
  const headerTitle = useText("headerTitle");
  const headerSubtitle = useText("headerSubtitle");

  return (
    <header
      className={[
        "glass-panel app-drag-region flex flex-col gap-4 px-4 py-4 sm:px-5",
        isDesktopApp ? "pt-8" : "",
      ].join(" ")}
    >
      {isDesktopApp && showCustomWindowControls && (
        <div className="app-no-drag -mb-2 flex justify-end gap-1">
          <IconButton
            icon={<Minus className="h-4 w-4" />}
            label="最小化視窗"
            size="sm"
            variant="ghost"
            onClick={onMinimizeWindow}
          />
          <IconButton
            icon={<Maximize2 className="h-4 w-4" />}
            label="最大化或還原視窗"
            size="sm"
            variant="ghost"
            onClick={onToggleMaximizeWindow}
          />
          <IconButton
            icon={<Fullscreen className="h-4 w-4" />}
            label="全螢幕或退出全螢幕"
            size="sm"
            variant="ghost"
            onClick={onToggleFullscreenWindow}
          />
          <IconButton
            icon={<X className="h-4 w-4" />}
            label="關閉視窗"
            size="sm"
            variant="danger"
            onClick={onCloseWindow}
          />
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-aquarius-blue/[0.35] bg-aquarius-blue/[0.15] shadow-glow">
          <SafeImage
            src={brandAssets.logo || brandAssets.avatar}
            alt="Aquariusgirl"
            className="h-full w-full object-cover"
            fallback={
              <span className="text-lg font-black text-aquarius-blue">AQ</span>
            }
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-black tracking-normal text-white sm:text-xl">
            {headerTitle}
          </p>
          <p className="truncate text-sm font-medium text-aquarius-mist">
            {headerSubtitle}
          </p>
        </div>
      </div>

      <div className="app-no-drag flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-aquarius-mist">
          {trackCount} 首本地音樂
        </span>
        <FilePickerButton
          onFilesSelected={onFilesSelected}
          onNativePick={onNativeFilesSelected}
        />
        <FolderPickerButton
          onFilesSelected={onFolderSelected}
          onNativePick={onNativeFolderSelected}
        />
        <IconButton
          icon={<Trash2 className="h-4 w-4" />}
          label="清空播放清單"
          variant="danger"
          disabled={trackCount === 0}
          onClick={onClear}
        />
        <IconButton
          icon={<Minimize2 className="h-4 w-4" />}
          label="切換 mini 模式"
          onClick={onEnterMiniMode}
        />
        <IconButton
          icon={<Settings className="h-4 w-4" />}
          label="圖片設定"
          onClick={onOpenImageSettings}
        />
      </div>
      </div>
    </header>
  );
}
