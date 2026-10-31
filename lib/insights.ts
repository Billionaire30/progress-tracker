import { AppData } from "./data";

export interface ProductivityInsight {
  type: "achievement" | "recommendation" | "warning" | "milestone";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function generateInsights(data: AppData): ProductivityInsight[] {
  const insights: ProductivityInsight[] = [];

  // Calculate metrics in single passes
  let monthsComplete = 0;
  let monthsInProgress = 0;
  let overdueMonths = 0;
  let upcomingDeadlines = 0;
  const today = new Date();

  data.months.forEach((m) => {
    if (m.status === "complete") {
      monthsComplete++;
    } else if (m.status === "in-progress") {
      monthsInProgress++;
    }

    if (m.deadline && m.status !== "complete") {
      const deadline = new Date(m.deadline);
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) {
        overdueMonths++;
      } else if (daysUntil >= 0 && daysUntil <= 7) {
        upcomingDeadlines++;
      }
    }
  });

  const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
  const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;

  const totalHoursLogged = data.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
  const avgHoursPerWeek = data.weeklyLog.length > 0 ? totalHoursLogged / data.weeklyLog.length : 0;
  const weeklyGoal = data.weeklyGoal || 20;

  // Milestone insights
  if (monthsComplete === 12) {
    insights.push({
      type: "milestone",
      title: "🎉 Congratulations!",
      description: "You've completed all 12 months of the programme!",
      priority: "high",
    });
  } else if (monthsComplete >= 6) {
    insights.push({
      type: "milestone",
      title: "Halfway There!",
      description: `You've completed ${monthsComplete} of 12 months. Keep up the great work!`,
      priority: "high",
    });
  }

  if (portfolioComplete === 5) {
    insights.push({
      type: "milestone",
      title: "Portfolio Complete!",
      description: "All 5 portfolio projects are complete. Excellent work!",
      priority: "high",
    });
  }

  if (data.currentStreak >= 30) {
    insights.push({
      type: "achievement",
      title: "30-Day Streak!",
      description: "You've logged hours for 30 consecutive days. Incredible dedication!",
      priority: "high",
    });
  }

  // Productivity recommendations
  if (avgHoursPerWeek < weeklyGoal * 0.5 && data.weeklyLog.length > 2) {
    insights.push({
      type: "recommendation",
      title: "Increase Study Time",
      description: `Your average of ${avgHoursPerWeek.toFixed(1)}h/week is below your ${weeklyGoal}h goal. Try to increase your study hours.`,
      priority: "high",
    });
  }

  if (monthsInProgress > 2) {
    insights.push({
      type: "recommendation",
      title: "Focus on Completion",
      description: `You have ${monthsInProgress} months in progress. Consider completing one before starting another.`,
      priority: "medium",
    });
  }

  // Deadline warnings
  if (overdueMonths > 0) {
    insights.push({
      type: "warning",
      title: "Overdue Deadlines",
      description: `${overdueMonths} month(s) have passed their deadline. Consider updating your schedule.`,
      priority: "high",
    });
  }

  if (upcomingDeadlines > 0) {
    insights.push({
      type: "warning",
      title: "Upcoming Deadlines",
      description: `${upcomingDeadlines} month(s) have deadlines within the next 7 days.`,
      priority: "medium",
    });
  }

  // Competency insights
  if (competenciesComplete >= 15) {
    insights.push({
      type: "achievement",
      title: "Competency Master",
      description: "You've mastered 15+ competencies. You're building strong foundations!",
      priority: "medium",
    });
  }

  // Streak insights
  if (data.currentStreak === 0 && data.weeklyLog.length > 0) {
    insights.push({
      type: "recommendation",
      title: "Start a New Streak",
      description: "Log some hours today to start a new consistency streak!",
      priority: "low",
    });
  }

  return insights;
}
