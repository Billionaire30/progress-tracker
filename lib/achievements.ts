export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const ACHIEVEMENTS: Omit<Achievement, "unlocked">[] = [
  {
    id: "first-task",
    title: "First Steps",
    description: "Add your first task",
    icon: "🎯"
  },
  {
    id: "first-hour",
    title: "Time Well Spent",
    description: "Log your first hour of study",
    icon: "⏱️"
  },
  {
    id: "week-1",
    title: "Week One",
    description: "Complete your first week",
    icon: "📅"
  },
  {
    id: "month-1",
    title: "Month One",
    description: "Complete your first month",
    icon: "🏆"
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥"
  },
  {
    id: "streak-30",
    title: "Monthly Motivation",
    description: "Maintain a 30-day streak",
    icon: "💪"
  },
  {
    id: "10-hours",
    title: "Double Digits",
    description: "Log 10 total hours",
    icon: "📊"
  },
  {
    id: "50-hours",
    title: "Half Century",
    description: "Log 50 total hours",
    icon: "🎓"
  },
  {
    id: "100-hours",
    title: "Century Mark",
    description: "Log 100 total hours",
    icon: "🌟"
  },
  {
    id: "all-competencies",
    title: "Master Engineer",
    description: "Complete all 17 competencies",
    icon: "👑"
  },
  {
    id: "all-portfolio",
    title: "Portfolio Complete",
    description: "Complete all 5 portfolio items",
    icon: "📁"
  },
  {
    id: "halfway",
    title: "Halfway There",
    description: "Complete 6 months",
    icon: "🎖️"
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Complete all 12 months",
    icon: "🏅"
  }
];

export function checkAchievements(data: any, unlockedAchievements: string[]): string[] {
  const newUnlocks: string[] = [];

  const totalHours = data.weeklyLog.reduce((sum: number, entry: any) => sum + entry.hours, 0);
  const monthsComplete = data.months.filter((m: any) => m.status === "complete").length;
  const competenciesComplete = data.competencyChecklist.filter((c: any) => c.done).length;
  const portfolioComplete = data.portfolio.filter((p: any) => p.status === "complete").length;

  if (totalHours >= 1 && !unlockedAchievements.includes("first-hour")) {
    newUnlocks.push("first-hour");
  }
  if (totalHours >= 10 && !unlockedAchievements.includes("10-hours")) {
    newUnlocks.push("10-hours");
  }
  if (totalHours >= 50 && !unlockedAchievements.includes("50-hours")) {
    newUnlocks.push("50-hours");
  }
  if (totalHours >= 100 && !unlockedAchievements.includes("100-hours")) {
    newUnlocks.push("100-hours");
  }
  if (monthsComplete >= 1 && !unlockedAchievements.includes("month-1")) {
    newUnlocks.push("month-1");
  }
  if (monthsComplete >= 6 && !unlockedAchievements.includes("halfway")) {
    newUnlocks.push("halfway");
  }
  if (monthsComplete >= 12 && !unlockedAchievements.includes("completionist")) {
    newUnlocks.push("completionist");
  }
  if (competenciesComplete >= 17 && !unlockedAchievements.includes("all-competencies")) {
    newUnlocks.push("all-competencies");
  }
  if (portfolioComplete >= 5 && !unlockedAchievements.includes("all-portfolio")) {
    newUnlocks.push("all-portfolio");
  }
  if (data.currentStreak >= 7 && !unlockedAchievements.includes("streak-7")) {
    newUnlocks.push("streak-7");
  }
  if (data.currentStreak >= 30 && !unlockedAchievements.includes("streak-30")) {
    newUnlocks.push("streak-30");
  }

  return newUnlocks;
}
