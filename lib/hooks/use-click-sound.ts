import { useCallback } from "react";

// Temporarily disabled to prevent blocking UI interactions
export function useClickSound() {
  const playClickSound = useCallback(() => {
    // Disabled - AudioContext was causing UI blocking issues
  }, []);

  return { playClickSound };
}
