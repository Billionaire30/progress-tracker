import confetti from "canvas-confetti";

export function triggerConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    });
  }, 250);
}

export function triggerMiniConfetti(x?: number, y?: number) {
  const origin = x !== undefined && y !== undefined
    ? { x: x / window.innerWidth, y: y / window.innerHeight }
    : { y: 0.6 };

  confetti({
    particleCount: 100,
    spread: 70,
    origin,
    colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
    zIndex: 9999,
  });
}
