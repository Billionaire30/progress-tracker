import { AppData } from "./data";

export interface PerformanceMetrics {
  dataSize: number;
  lastLoadTime: number;
  lastSaveTime: number;
  errorCount: number;
  syncSuccessRate: number;
}

export function calculateDataSize(data: AppData): number {
  return JSON.stringify(data).length;
}

export function optimizeData(data: AppData): AppData {
  // Remove old audit logs (older than 90 days)
  if (data.auditLog && data.auditLog.length > 1000) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    data.auditLog = data.auditLog.filter((log) => new Date(log.timestamp) >= cutoffDate);
  }

  // Remove completed daily challenges
  if (data.gamification?.dailyChallenges) {
    const today = new Date().toDateString();
    data.gamification.dailyChallenges = data.gamification.dailyChallenges.filter(
      (c) => new Date(c.expiresAt).toDateString() === today
    );
  }

  return data;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

export function optimisticUpdate<T>(
  currentState: T,
  updateFn: (state: T) => T,
  rollbackFn: (state: T) => T
): { optimisticState: T; rollback: () => T } {
  const optimisticState = updateFn(currentState);
  const rollback = () => rollbackFn(optimisticState);

  return { optimisticState, rollback };
}

export function batchUpdates<T>(updates: Array<(state: T) => T>, initialState: T): T {
  return updates.reduce((state, update) => update(state), initialState);
}

export function cacheGet<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`cache:${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const maxAge = 5 * 60 * 1000; // 5 minutes

      if (Date.now() - timestamp < maxAge) {
        return data as T;
      }
    }
  } catch (error) {
    console.error("Cache get error:", error);
  }

  return null;
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`cache:${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export function cacheClear(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("cache:"))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

export function measurePerformance<T>(fn: () => T, label: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${label}: ${(end - start).toFixed(2)}ms`);

  return result;
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  console.log(`${label}: ${(end - start).toFixed(2)}ms`);

  return result;
}
