/**
 * Goals and on-track logic
 */

import { getToday, daysBetween, getStartOfISOWeek } from './timezone';

export interface GoalStatus {
  status: 'ahead' | 'on-track' | 'behind';
  completed: number;
  target: number;
  percentage: number;
  expected: number;
  remaining: number;
}

/**
 * Calculate habit weekly goal status
 */
export function computeHabitGoalStatus(
  completedThisWeek: number,
  targetPerWeek: number,
  weekStartsOn: 0 | 1 = 1
): GoalStatus {
  const today = getToday();
  const weekStart = getStartOfISOWeek(today, weekStartsOn);
  const daysIntoWeek = daysBetween(weekStart, today) + 1; // +1 because we count today
  
  const expected = Math.ceil((daysIntoWeek / 7) * targetPerWeek);
  const remaining = Math.max(0, targetPerWeek - completedThisWeek);
  const percentage = Math.min(100, (completedThisWeek / targetPerWeek) * 100);

  let status: 'ahead' | 'on-track' | 'behind' = 'on-track';
  if (completedThisWeek >= expected + 1) {
    status = 'ahead';
  } else if (completedThisWeek < expected - 1) {
    status = 'behind';
  }

  return {
    status,
    completed: completedThisWeek,
    target: targetPerWeek,
    percentage,
    expected,
    remaining,
  };
}

/**
 * Calculate weekly study goal status
 */
export function computeStudyGoalStatus(
  hoursThisWeek: number,
  weeklyGoal: number
): GoalStatus {
  const percentage = Math.min(100, (hoursThisWeek / weeklyGoal) * 100);
  const remaining = Math.max(0, weeklyGoal - hoursThisWeek);

  let status: 'ahead' | 'on-track' | 'behind' = 'on-track';
  if (hoursThisWeek >= weeklyGoal) {
    status = 'ahead';
  } else if (hoursThisWeek < weeklyGoal * 0.5) {
    status = 'behind';
  }

  return {
    status,
    completed: hoursThisWeek,
    target: weeklyGoal,
    percentage,
    expected: weeklyGoal,
    remaining,
  };
}

/**
 * Calculate competency pace
 */
export function computeCompetencyPace(
  completed: number,
  total: number,
  startDate: string,
  targetEndDate: string
): GoalStatus {
  const today = getToday();
  const totalDays = daysBetween(startDate, targetEndDate);
  const daysElapsed = daysBetween(startDate, today);
  const expected = Math.ceil((daysElapsed / totalDays) * total);
  const remaining = total - completed;

  const percentage = total > 0 ? (completed / total) * 100 : 0;

  let status: 'ahead' | 'on-track' | 'behind' = 'on-track';
  if (completed >= expected + 1) {
    status = 'ahead';
  } else if (completed < expected - 1) {
    status = 'behind';
  }

  return {
    status,
    completed,
    target: total,
    percentage,
    expected,
    remaining,
  };
}
