export type AppMode = "normal" | "obs";

export function useAppMode(): AppMode {
  if (typeof window === "undefined") {
    return "normal";
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "obs" ? "obs" : "normal";
}
