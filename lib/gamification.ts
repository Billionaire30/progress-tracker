import { AppData, Gamification, DailyChallenge } from "./data";

const XP_PER_HOUR = 10;
const XP_PER_TASK = 5;
const XP_PER_COMPETENCY = 15;
const XP_PER_PORTFOLIO = 25;
const XP_PER_MONTH = 50;
const XP_PER_ACHIEVEMENT = 30;

const LEVEL_BASE_XP = 100;
const LEVEL_MULTIPLIER = 1.5;

export function calculateXPToNextLevel(level: number): number {
  return Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 1));
}

export function calculateLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = LEVEL_BASE_XP;
  let remainingXP = totalXP;

  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * LEVEL_MULTIPLIER);
  }

  return level;
}

export function addXP(data: AppData, amount: number): AppData {
  if (!data.gamification) {
    data.gamification = {
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_BASE_XP,
      totalXP: 0,
      badges: [],
      currentStreakBonus: 1,
      dailyChallenges: [],
      weeklyChallengesCompleted: 0,
    };
  }

  const streakBonus = data.gamification.currentStreakBonus || 1;
  const totalXPToAdd = Math.floor(amount * streakBonus);

  data.gamification.totalXP += totalXPToAdd;
  data.gamification.xp += totalXPToAdd;

  // Check for level up
  while (data.gamification.xp >= data.gamification.xpToNextLevel) {
    data.gamification.xp -= data.gamification.xpToNextLevel;
    data.gamification.level++;
    data.gamification.xpToNextLevel = calculateXPToNextLevel(data.gamification.level);
  }

  // Add audit log entry
  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `xp-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "xp_earned",
    entity: "gamification",
    entityId: data.gamification.level.toString(),
    changes: { amount: totalXPToAdd, streakBonus },
  });

  return data;
}

export function awardXPForHours(data: AppData, hours: number): AppData {
  return addXP(data, hours * XP_PER_HOUR);
}

export function awardXPForTask(data: AppData): AppData {
  return addXP(data, XP_PER_TASK);
}

export function awardXPForCompetency(data: AppData): AppData {
  return addXP(data, XP_PER_COMPETENCY);
}

export function awardXPForPortfolio(data: AppData): AppData {
  return addXP(data, XP_PER_PORTFOLIO);
}

export function awardXPForMonth(data: AppData): AppData {
  return addXP(data, XP_PER_MONTH);
}

export function awardXPForAchievement(data: AppData): AppData {
  return addXP(data, XP_PER_ACHIEVEMENT);
}

export function updateStreakBonus(data: AppData): AppData {
  if (!data.gamification) return data;

  const streak = data.currentStreak || 0;
  if (streak >= 30) {
    data.gamification.currentStreakBonus = 2;
  } else if (streak >= 14) {
    data.gamification.currentStreakBonus = 1.5;
  } else if (streak >= 7) {
    data.gamification.currentStreakBonus = 1.25;
  } else {
    data.gamification.currentStreakBonus = 1;
  }

  return data;
}

export function generateDailyChallenges(): DailyChallenge[] {
  const challenges: DailyChallenge[] = [];
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Challenge 1: Log hours
  challenges.push({
    id: `daily-hours-${now.toDateString()}`,
    title: "Daily Study Goal",
    description: "Log at least 3 hours of study today",
    type: "hours",
    target: 3,
    current: 0,
    completed: false,
    expiresAt: endOfDay.toISOString(),
    rewardXP: 20,
  });

  // Challenge 2: Complete tasks
  challenges.push({
    id: `daily-tasks-${now.toDateString()}`,
    title: "Task Master",
    description: "Complete at least 2 tasks today",
    type: "tasks",
    target: 2,
    current: 0,
    completed: false,
    expiresAt: endOfDay.toISOString(),
    rewardXP: 15,
  });

  // Challenge 3: Maintain streak
  challenges.push({
    id: `daily-streak-${now.toDateString()}`,
    title: "Keep the Streak",
    description: "Log hours today to maintain your streak",
    type: "streak",
    target: 1,
    current: 0,
    completed: false,
    expiresAt: endOfDay.toISOString(),
    rewardXP: 10,
  });

  return challenges;
}

export function checkDailyChallenges(data: AppData): AppData {
  if (!data.gamification) {
    data.gamification = {
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_BASE_XP,
      totalXP: 0,
      badges: [],
      currentStreakBonus: 1,
      dailyChallenges: [],
      weeklyChallengesCompleted: 0,
    };
  }

  const today = new Date().toDateString();
  const todaysChallenges = data.gamification.dailyChallenges.filter(
    (c) => new Date(c.expiresAt).toDateString() === today
  );

  if (todaysChallenges.length === 0) {
    // Generate new challenges for today
    data.gamification.dailyChallenges = [
      ...data.gamification.dailyChallenges.filter(
        (c) => new Date(c.expiresAt).toDateString() !== today
      ),
      ...generateDailyChallenges(),
    ];
  }

  // Update challenge progress
  const todayHours = data.weeklyLog
    .filter((log) => new Date(log.date).toDateString() === today)
    .reduce((sum, log) => sum + log.hours, 0);

  const todayTasksCompleted = data.months.reduce((sum, month) => {
    return (
      sum +
      month.tasks.filter(
        (task) =>
          task.done &&
          task.completedAt &&
          new Date(task.completedAt).toDateString() === today
      ).length
    );
  }, 0);

  if (data.gamification) {
    data.gamification.dailyChallenges.forEach((challenge) => {
      if (new Date(challenge.expiresAt).toDateString() !== today) return;

      switch (challenge.type) {
        case "hours":
          challenge.current = todayHours;
          break;
        case "tasks":
          challenge.current = todayTasksCompleted;
          break;
        case "streak":
          challenge.current = todayHours > 0 ? 1 : 0;
          break;
      }

      if (challenge.current >= challenge.target && !challenge.completed) {
        challenge.completed = true;
        data = addXP(data, challenge.rewardXP);
        data.gamification!.weeklyChallengesCompleted++;
      }
    });
  }

  return data;
}

export function addBadge(data: AppData, badgeId: string): AppData {
  if (!data.gamification) return data;

  if (!data.gamification.badges.includes(badgeId)) {
    data.gamification.badges.push(badgeId);

    if (!data.auditLog) data.auditLog = [];
    data.auditLog.push({
      id: `badge-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "badge_earned",
      entity: "gamification",
      entityId: badgeId,
    });
  }

  return data;
}
