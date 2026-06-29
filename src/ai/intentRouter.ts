import {
  normalizeMusicSearchIntent,
  type MusicSearchIntent,
} from "../utils/aiTrackSearch";

export function routeAiIntent(userText: string, modelIntent?: unknown): MusicSearchIntent {
  const fallbackIntent = normalizeMusicSearchIntent({}, userText);
  if (!modelIntent) return fallbackIntent;

  const parsedIntent = normalizeMusicSearchIntent(modelIntent, userText);
  if (
    fallbackIntent.needMusicLibrarySearch &&
    (!parsedIntent.needMusicLibrarySearch ||
      parsedIntent.intent === "chat" ||
      parsedIntent.intent === "unknown")
  ) {
    return fallbackIntent;
  }

  return {
    ...parsedIntent,
    keywords: parsedIntent.keywords.length > 0
      ? parsedIntent.keywords
      : fallbackIntent.keywords,
    searchFields: parsedIntent.searchFields.length > 0
      ? parsedIntent.searchFields
      : fallbackIntent.searchFields,
  };
}
