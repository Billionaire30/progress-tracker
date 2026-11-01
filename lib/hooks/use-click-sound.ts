import { useCallback, useEffect } from "react";

let audioContext: AudioContext | null = null;
let initialized = false;

// Initialize AudioContext on first user interaction
function initAudioContext() {
  if (initialized) return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {
        // Ignore resume errors
      });
    }
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize AudioContext:', error);
  }
}

export function useClickSound() {
  useEffect(() => {
    // Initialize on first user interaction
    const handleUserInteraction = () => {
      initAudioContext();
    };

    document.addEventListener('click', handleUserInteraction, { once: true, passive: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true, passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const playClickSound = useCallback(() => {
    try {
      if (!audioContext) {
        initAudioContext();
      }

      const ctx = audioContext;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          // Ignore resume errors
        });
      }

      if (!ctx) return;

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
