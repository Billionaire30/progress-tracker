/**
 * Streak calculation engine
 * Follows specification: best never decreases, at-risk state, grace days, freezes
 */

import { HabitLog } from '../types/domain';
import { getToday, daysBetween } from './timezone';

export interface StreakOptions {
  graceDays: 0 | 1;
  freezes: number;
}

export interface StreakResult {
  current: number;
  best: number;               // high-water mark — NEVER decreases
  isActiveToday: boolean;
  atRisk: boolean;            // streak live but today not done
  freezesRemaining: number;
  longestGap: number;
}

/**
 * Compute streak for a habit
 */
export function computeStreak(
  logs: HabitLog[],
  habitId: string,
  today: string,
  options: StreakOptions = { graceDays: 0, freezes: 0 }
): StreakResult {
  // Filter logs for this habit
  const habitLogs = logs.filter(log => log.habitId === habitId && log.completed);
  const completedDates = [...new Set(habitLogs.map(log => log.date))].sort().reverse();

  if (completedDates.length === 0) {
    return {
      current: 0,
      best: 0,
      isActiveToday: false,
      atRisk: false,
      freezesRemaining: options.freezes,
      longestGap: 0,
    };
  }

  const isCompletedToday = completedDates.includes(today);
  let currentStreak = 0;
  let graceDaysUsed = 0;
  let bestStreak = 0;
  let longestGap = 0;

  // Calculate current streak
  let streak = 0;
  let missedDays = 0;
  let lastDate: string | null = null;

  for (const date of completedDates) {
    if (!lastDate) {
      streak = 1;
      lastDate = date;
    } else {
      const daysDiff = daysBetween(lastDate, date);
      
      if (daysDiff === 1) {
        // Consecutive day
        streak++;
        lastDate = date;
      } else if (daysDiff > 1) {
        // Gap detected
        if (options.graceDays === 1 && missedDays === 0 && daysDiff === 2) {
          // Grace day used
          streak++;
          missedDays++;
          lastDate = date;
        } else {
          // Streak broken
          streak = 1;
          missedDays = 0;
          lastDate = date;
          
          // Track longest gap
          if (daysDiff > longestGap) {
            longestGap = daysDiff;
          }
        }
      }
    }

    if (streak > bestStreak) {
      bestStreak = streak;
    }
  }

  currentStreak = streak;

  // Check if today is part of streak
  if (isCompletedToday) {
    // Today is completed, streak is live
  } else if (lastDate === today) {
    // Can't happen (we checked isCompletedToday)
  } else if (lastDate) {
    const daysSinceLast = daysBetween(lastDate, today);
    if (daysSinceLast === 1) {
      // Yesterday was completed, today not - streak broken
      currentStreak = 0;
    } else if (daysSinceLast > 1) {
      // Gap longer than 1 day - streak broken
      currentStreak = 0;
    }
    // If daysSinceLast === 0, today not in completedDates yet, streak still live
  }

  // Determine at-risk state
  const atRisk = currentStreak > 0 && !isCompletedToday;

  return {
    current: currentStreak,
    best: bestStreak,
    isActiveToday: isCompletedToday,
    atRisk,
    freezesRemaining: options.freezes,
    longestGap,
  };
}

/**
 * Calculate global total streak days (distinct dates with ≥1 habit completed)
 */
export function computeGlobalStreak(logs: HabitLog[], today: string): number {
  const completedDates = new Set(
    logs.filter(log => log.completed).map(log => log.date)
  );
  
  if (completedDates.size === 0) return 0;

  const sortedDates = Array.from(completedDates).sort();
  let streak = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        maxStreak = Math.max(maxStreak, streak);
        streak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  // Check if today continues the streak
  const lastDate = sortedDates[sortedDates.length - 1];
  if (lastDate) {
    const daysSinceLast = daysBetween(lastDate, today);
    if (daysSinceLast === 1) {
      currentStreak = streak;
    } else if (daysSinceLast === 0) {
      currentStreak = streak;
    } else {
      currentStreak = 0;
    }
  } else {
    currentStreak = 0;
  }

  return Math.max(maxStreak, currentStreak);
}
