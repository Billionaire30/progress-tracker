import { useCallback } from "react";

let audioContext: AudioContext | null = null;

export function useClickSound() {
  const playClickSound = useCallback(() => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContext;
      // Resume context if suspended (browser requires user gesture)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          // Ignore resume errors
        });
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (error) {
      // Silently fail - sound is optional
    }
  }, []);

  return { playClickSound };
}
