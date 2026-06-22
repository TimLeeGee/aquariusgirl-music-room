import { STORAGE_KEYS, useLocalStorage } from "./useLocalStorage";

export function useOnboarding() {
  const [completed, setCompleted] = useLocalStorage<boolean>(
    STORAGE_KEYS.onboardingCompleted,
    false,
  );

  return {
    showOnboarding: !completed,
    completeOnboarding: () => setCompleted(true),
    resetOnboarding: () => setCompleted(false),
  };
}
