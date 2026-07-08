import {
  defaultTextOverrideSettings,
  type TextOverrideKey,
  type TextOverrideSettings,
} from "../types/settings";

// 這個模組保持 React-free：它會被 node --experimental-strip-types 執行的 check 腳本
// 經由 aiTrackSearch / trackDisplay 等間接載入，import 'react' 會讓那些 check 直接掛掉。
const STORAGE_KEY = "aquariusgirl.musicRoom.textOverrideSettings";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// {name}=角色中文名、{nameEn}=英文名。
function substituteName(template: string, name: string, nameEn: string): string {
  return template.split("{name}").join(name).split("{nameEn}").join(nameEn);
}

// ponytail: 空白或非字串一律 fallback 預設；角色名稱先取好，再把其餘 slot 的預設/覆寫模板代入。
export function resolveTextOverrideSettings(value: unknown): TextOverrideSettings {
  const stored = isRecord(value) ? value : {};
  const pick = (key: TextOverrideKey): string => {
    const candidate = stored[key];
    return typeof candidate === "string" && candidate.trim()
      ? candidate
      : defaultTextOverrideSettings[key];
  };
  const name = pick("characterName");
  const nameEn = pick("characterNameEn");
  const resolved: TextOverrideSettings = { ...defaultTextOverrideSettings };
  for (const key of Object.keys(defaultTextOverrideSettings) as TextOverrideKey[]) {
    if (key === "characterName") resolved[key] = name;
    else if (key === "characterNameEn") resolved[key] = nameEn;
    else resolved[key] = substituteName(pick(key), name, nameEn);
  }
  return resolved;
}

// --- 非 React 讀取用單例（trackDisplay / 播放錯誤訊息 / 歌單命名等） ---
// App 在 resolve 時同步（見 App.tsx useMemo）；此處先從 localStorage 讀一次避免冷啟動閃預設。
let activeName: string = defaultTextOverrideSettings.characterName;
let activeNameEn: string = defaultTextOverrideSettings.characterNameEn;

function readStoredNames() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return;
    if (typeof parsed.characterName === "string" && parsed.characterName.trim()) {
      activeName = parsed.characterName;
    }
    if (typeof parsed.characterNameEn === "string" && parsed.characterNameEn.trim()) {
      activeNameEn = parsed.characterNameEn;
    }
  } catch {
    // keep defaults
  }
}
readStoredNames();

export function setActiveCharacterNames(name: string, nameEn: string) {
  activeName = name.trim() ? name : defaultTextOverrideSettings.characterName;
  activeNameEn = nameEn.trim() ? nameEn : defaultTextOverrideSettings.characterNameEn;
}

// 非 React 程式碼用：把 {name}/{nameEn} 代入目前角色名稱。
export function applyName(template: string): string {
  return substituteName(template, activeName, activeNameEn);
}
