import { createContext, useContext } from "react";
import {
  defaultTextOverrideSettings,
  type TextOverrideKey,
  type TextOverrideSettings,
} from "../types/settings";

// React-free 的名字邏輯集中在 characterName.ts（給 node check 腳本用）；這裡只加 React context。
export {
  resolveTextOverrideSettings,
  setActiveCharacterNames,
  applyName,
} from "./characterName";

export const TextOverrideContext = createContext<TextOverrideSettings>(
  defaultTextOverrideSettings,
);

// 有自訂用自訂、否則 fallback 預設（已代入角色名稱）。
export function useText(key: TextOverrideKey): string {
  return useContext(TextOverrideContext)[key] ?? defaultTextOverrideSettings[key];
}
